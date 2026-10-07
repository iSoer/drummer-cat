/** Минимальные типы Telegram WebApp API, которые использует игра. */
interface TgInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface TgWebApp {
  initData: string;
  initDataUnsafe: { user?: { first_name?: string } };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string | undefined>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  safeAreaInset?: TgInsets;
  contentSafeAreaInset?: TgInsets;
  isVersionAtLeast(v: string): boolean;
  ready(): void;
  expand(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  disableVerticalSwipes?(): void;
  lockOrientation?(): void;
  requestFullscreen?(): void;
  onEvent(event: string, cb: () => void): void;
  offEvent(event: string, cb: () => void): void;
  HapticFeedback?: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  CloudStorage?: {
    getItem(key: string, cb: (err: Error | null, value?: string) => void): void;
    setItem(key: string, value: string, cb?: (err: Error | null, stored?: boolean) => void): void;
  };
  BackButton?: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TgWebApp };
  }
}

export type ImpactStyle = 'light' | 'medium' | 'heavy';

const HEADER_COLOR = '#1F1A17';
/** Включать ли полноэкранный режим (Bot API 8.0+). Решение по ощущениям на M3. */
const USE_FULLSCREEN = false;

function tg(): TgWebApp | undefined {
  return window.Telegram?.WebApp;
}

/** Запущены ли мы внутри Telegram. */
export function isTma(): boolean {
  const w = tg();
  return Boolean(w && w.initData && w.initData.length > 0);
}

export function userFirstName(): string | undefined {
  return tg()?.initDataUnsafe?.user?.first_name;
}

function applyInsets(w: TgWebApp): void {
  const root = document.documentElement.style;
  const sa = w.safeAreaInset ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const ca = w.contentSafeAreaInset ?? { top: 0, bottom: 0, left: 0, right: 0 };
  root.setProperty('--sa-top', `${sa.top + ca.top}px`);
  root.setProperty('--sa-bottom', `${sa.bottom + ca.bottom}px`);
  root.setProperty('--sa-left', `${sa.left + ca.left}px`);
  root.setProperty('--sa-right', `${sa.right + ca.right}px`);
}

function applyViewport(w: TgWebApp): void {
  const h = w.viewportStableHeight || w.viewportHeight;
  if (h > 0) document.documentElement.style.setProperty('--app-height', `${h}px`);
}

function applyTheme(w: TgWebApp): void {
  const t = w.themeParams;
  const root = document.documentElement.style;
  if (t.bg_color) root.setProperty('--ui-bg', t.bg_color);
  if (t.text_color) root.setProperty('--ui-text', t.text_color);
  if (t.hint_color) root.setProperty('--ui-muted', t.hint_color);
  if (t.button_color) root.setProperty('--ui-accent', t.button_color);
  if (t.button_text_color) root.setProperty('--ui-accent-text', t.button_text_color);
  if (t.secondary_bg_color) root.setProperty('--ui-bg-2', t.secondary_bg_color);
}

/** Инициализация Mini App. В браузере — no-op. */
export function initTelegram(): void {
  const w = tg();
  if (!w || !isTma()) return;
  document.documentElement.classList.add('is-tma');
  w.ready();
  w.expand();
  try {
    w.setHeaderColor(HEADER_COLOR);
    w.setBackgroundColor(HEADER_COLOR);
  } catch {
    /* старые клиенты */
  }
  if (w.isVersionAtLeast('7.7')) w.disableVerticalSwipes?.();
  if (w.isVersionAtLeast('8.0')) {
    w.lockOrientation?.();
    if (USE_FULLSCREEN) w.requestFullscreen?.();
  }
  applyInsets(w);
  applyViewport(w);
  applyTheme(w);
  w.onEvent('safeAreaChanged', () => applyInsets(w));
  w.onEvent('contentSafeAreaChanged', () => applyInsets(w));
  w.onEvent('viewportChanged', () => applyViewport(w));
  w.onEvent('themeChanged', () => applyTheme(w));
}

export function tgHaptic(style: ImpactStyle): boolean {
  if (!isTma()) return false;
  const h = tg()?.HapticFeedback;
  if (!h) return false;
  try {
    h.impactOccurred(style);
    return true;
  } catch {
    return false;
  }
}

export function tgSelectionChanged(): void {
  if (!isTma()) return;
  try {
    tg()?.HapticFeedback?.selectionChanged();
  } catch {
    /* ignore */
  }
}

export function cloudGet(key: string, timeoutMs = 1500): Promise<string | null> {
  const cs = tg()?.CloudStorage;
  if (!cs || !isTma()) return Promise.resolve(null);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    try {
      cs.getItem(key, (err, value) => {
        clearTimeout(timer);
        resolve(err || !value ? null : value);
      });
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

export function cloudSet(key: string, value: string): void {
  const cs = tg()?.CloudStorage;
  if (!cs || !isTma()) return;
  try {
    cs.setItem(key, value);
  } catch {
    /* ignore */
  }
}

let backHandler: (() => void) | null = null;

export function showBack(onClick: () => void): void {
  if (!isTma()) return;
  const b = tg()?.BackButton;
  if (!b) return;
  if (backHandler) b.offClick(backHandler);
  backHandler = onClick;
  b.onClick(onClick);
  b.show();
}

export function hideBack(): void {
  if (!isTma()) return;
  const b = tg()?.BackButton;
  if (!b) return;
  if (backHandler) b.offClick(backHandler);
  backHandler = null;
  b.hide();
}
