import { DEFAULT_SAVE, normalizeSave, type SaveV1 } from '../core/store';
import { cloudGet, cloudSet, isTma } from './telegram';

const LS_KEY = 'drummercat.save';
const CLOUD_KEY = 'save';
const DEBOUNCE_MS = 500;

function readLocal(): SaveV1 | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? normalizeSave(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function writeLocal(save: SaveV1): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(save));
  } catch {
    /* приватный режим и т.п. */
  }
}

/** Выбрать более «богатую» запись: по knocked, при равенстве — по updatedAt. */
export function pickNewer(a: SaveV1 | null, b: SaveV1 | null): SaveV1 {
  if (!a) return b ?? { ...DEFAULT_SAVE };
  if (!b) return a;
  if (a.knocked !== b.knocked) return a.knocked > b.knocked ? a : b;
  return a.updatedAt >= b.updatedAt ? a : b;
}

/** Загрузить прогресс из localStorage и (в Telegram) из CloudStorage. */
export async function loadSave(): Promise<SaveV1> {
  const local = readLocal();
  let cloud: SaveV1 | null = null;
  if (isTma()) {
    const raw = await cloudGet(CLOUD_KEY);
    if (raw) {
      try {
        cloud = normalizeSave(JSON.parse(raw));
      } catch {
        cloud = null;
      }
    }
  }
  const best = pickNewer(local, cloud);
  writeLocal(best);
  if (isTma()) cloudSet(CLOUD_KEY, JSON.stringify(best));
  return best;
}

let pending: SaveV1 | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

export function flushSave(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!pending) return;
  const s = pending;
  pending = null;
  writeLocal(s);
  if (isTma()) cloudSet(CLOUD_KEY, JSON.stringify(s));
}

/** Отложенная запись: не чаще раза в DEBOUNCE_MS. */
export function scheduleSave(save: SaveV1): void {
  pending = { ...save, updatedAt: Date.now() };
  if (timer) return;
  timer = setTimeout(flushSave, DEBOUNCE_MS);
}

export function installFlushOnHide(): void {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flushSave();
  });
  window.addEventListener('pagehide', flushSave);
}

export function clearSave(): void {
  pending = null;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  writeLocal({ ...DEFAULT_SAVE });
  if (isTma()) cloudSet(CLOUD_KEY, JSON.stringify({ ...DEFAULT_SAVE }));
}
