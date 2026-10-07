import { tgHaptic, type ImpactStyle } from './telegram';

const VIBRATE_MS: Record<ImpactStyle, number> = { light: 8, medium: 14, heavy: 24 };

/** Хаптика: Telegram HapticFeedback или navigator.vibrate (Android). */
export class Haptics {
  enabled = true;

  impact(style: ImpactStyle): void {
    if (!this.enabled) return;
    if (tgHaptic(style)) return;
    try {
      navigator.vibrate?.(VIBRATE_MS[style]);
    } catch {
      /* ignore */
    }
  }
}
