import './styles/base.css';
import './styles/hud.css';
import './styles/sheet.css';

import kitchenSvg from './content/svg/kitchen.svg?raw';
import deskSvg from './content/svg/desk.svg?raw';
import livingSvg from './content/svg/living.svg?raw';
import backgroundsSvg from './content/svg/backgrounds.svg?raw';
import pawsSvg from './content/svg/paws.svg?raw';

import { CATS, getCat } from './content/cats';
import { SETS, getSet } from './content/sets';
import type { CatId, SetId } from './content/types';
import { Engine } from './core/engine';
import { createStore } from './core/store';
import { TpsMeter, type TpsSnapshot } from './core/tps';
import { AnimGroup } from './render/anim';
import { Fx } from './render/fx';
import { Hud } from './render/hud';
import { ObjectView } from './render/objectView';
import { PawView } from './render/paw';
import { PortraitView, renderFace } from './render/portrait';
import { buildScene, setBackground, setVignette, stepBob } from './render/scene';
import { Sfx } from './platform/audio';
import { Haptics } from './platform/haptics';
import { clearSave, installFlushOnHide, loadSave, scheduleSave } from './platform/storage';
import { initTelegram, tgSelectionChanged, userFirstName } from './platform/telegram';
import { buildSettingsPanel } from './ui/settings';
import { Sheet } from './ui/sheet';
import { buildSkinsPanel } from './ui/skins';

/** Минимальный интервал между тапами одного указателя (антидребезг). */
const POINTER_DEBOUNCE_MS = 40;
/** Глобальный потолок темпа. */
const MAX_TPS = 25;

function $<T extends HTMLElement>(sel: string): T {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Не найден элемент ${sel}`);
  return el as T;
}

async function boot(): Promise<void> {
  $('#sprites').innerHTML = kitchenSvg + deskSvg + livingSvg + backgroundsSvg + pawsSvg;
  initTelegram();
  installFlushOnHide();

  const save = await loadSave();
  const store = createStore(save);
  store.subscribe((s) => scheduleSave(s));

  let cat = getCat(save.cat);
  let set = getSet(save.set);

  const engine = new Engine(set, { knocked: save.knocked, hits: save.hits });
  const meter = new TpsMeter();
  const anims = new AnimGroup();

  const stage = $('#stage');
  const parts = buildScene(stage);
  setBackground(parts, set.backgroundSymbol);
  const paw = new PawView(parts.paw, parts.pawUse, anims);
  paw.setSkin(cat.pawSymbol);
  const objView = new ObjectView(parts.objects, anims);
  objView.show(engine.current.obj, engine.current.hp, engine.current.maxHp);
  const fx = new Fx(parts.fx, anims);
  const portrait = new PortraitView($('#portrait'), cat);
  const hud = new Hud();
  hud.setCounter(save.knocked);
  const sfx = new Sfx();
  sfx.enabled = save.sound;
  const haptics = new Haptics();
  haptics.enabled = save.haptics;
  const sheet = new Sheet($('#sheet-root'));

  let level = -1;
  const syncLevel = (snap: TpsSnapshot): void => {
    hud.setFuryTarget(snap.fury);
    if (snap.level === level) return;
    level = snap.level;
    portrait.setLevel(level);
    hud.setLevel(level);
    setVignette(parts, level);
    paw.setIdle(level === 0);
    document.body.dataset.level = String(level);
  };
  syncLevel(meter.update(performance.now()));

  let sessionHits = 0;
  let lastTapAt = -Infinity;

  const onTap = (now: number): void => {
    if (now - lastTapAt < 1000 / MAX_TPS) return;
    lastTapAt = now;
    sfx.unlock();
    const snap = meter.tap(now);
    syncLevel(snap);
    const mul = meter.speedMul;

    anims.finishAll();
    paw.setIdle(false);
    if (sessionHits === 0) parts.hint.style.display = 'none';
    sessionHits++;

    const events = engine.hit();
    const prev = store.get();
    store.set({
      knocked: engine.counters.knocked,
      hits: engine.counters.hits,
      bestTps: Math.max(prev.bestTps, Math.round(snap.tps * 10) / 10),
    });
    sfx.thwack();

    paw.swing(mul, () => {
      for (const ev of events) {
        switch (ev.type) {
          case 'wobble':
            objView.setHp(ev.hp, ev.maxHp);
            objView.wobble(mul);
            sfx.bonk();
            haptics.impact('medium');
            break;
          case 'knock': {
            const dur = objView.knock(mul);
            if (ev.obj.breakable) fx.shardsBurst(ev.obj, mul);
            fx.hitText(ev.obj.hitText, mul);
            hud.setCounter(ev.knocked, true);
            sfx.play(ev.obj.sfx);
            haptics.impact(ev.obj.size === 'L' ? 'heavy' : 'light');
            void dur;
            break;
          }
          case 'step': {
            const delay = 320 * mul * 0.55;
            stepBob(parts, anims, mul, delay);
            objView.appear(ev.obj, ev.hp, ev.maxHp, mul, delay);
            break;
          }
        }
      }
    });
  };

  const pointerLast = new Map<number, number>();
  stage.addEventListener('pointerdown', (e) => {
    if (sheet.isOpen) return;
    const now = performance.now();
    const last = pointerLast.get(e.pointerId) ?? -Infinity;
    if (now - last < POINTER_DEBOUNCE_MS) return;
    pointerLast.set(e.pointerId, now);
    if (pointerLast.size > 16) {
      for (const [id, t] of pointerLast) if (now - t > 1000) pointerLast.delete(id);
    }
    onTap(now);
  });
  stage.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('keydown', (e) => {
    if (e.repeat || sheet.isOpen) return;
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      onTap(performance.now());
    }
  });

  setInterval(() => syncLevel(meter.update(performance.now())), 250);
  const raf = (): void => {
    if (!document.hidden) hud.tick();
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) sfx.suspend();
  });

  const applyCat = (id: CatId): void => {
    cat = getCat(id);
    paw.setSkin(cat.pawSymbol);
    portrait.setCat(cat);
    store.set({ cat: id });
    tgSelectionChanged();
  };
  const applySet = (id: SetId): void => {
    if (id === set.id) return;
    set = getSet(id);
    anims.finishAll();
    setBackground(parts, set.backgroundSymbol);
    const cur = engine.setObjectSet(set);
    objView.show(cur.obj, cur.hp, cur.maxHp);
    store.set({ set: id });
    tgSelectionChanged();
  };

  $('#btn-skins').addEventListener('click', () => {
    sheet.open('Скины', buildSkinsPanel(cat.id, set.id, { onCat: applyCat, onSet: applySet }));
  });
  $('#btn-settings').addEventListener('click', () => {
    const s = store.get();
    sheet.open(
      'Настройки',
      buildSettingsPanel(
        { sound: s.sound, haptics: s.haptics, bestTps: s.bestTps, hits: s.hits, userName: userFirstName() },
        {
          onSound(v) {
            sfx.enabled = v;
            if (v) sfx.unlock();
            store.set({ sound: v });
          },
          onHaptics(v) {
            haptics.enabled = v;
            store.set({ haptics: v });
          },
          onReset() {
            engine.counters.knocked = 0;
            engine.counters.hits = 0;
            store.set({ knocked: 0, hits: 0, bestTps: 0 });
            clearSave();
            hud.setCounter(0);
          },
        },
      ),
    );
  });
}

if (import.meta.env.DEV) {
  (window as unknown as { __dc: unknown }).__dc = { renderFace, CATS, SETS };
}

void boot();
