import type { SfxKind } from '../content/types';

/** Синтезированные звуки через Web Audio. Контекст создаётся на первом тапе. */
export class Sfx {
  enabled = true;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;

  /** Создать/возобновить контекст. Вызывать из обработчика пользовательского ввода. */
  unlock(): void {
    if (!this.enabled) return;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  suspend(): void {
    if (this.ctx && this.ctx.state === 'running') void this.ctx.suspend();
  }

  /** Удар лапы. */
  thwack(): void {
    if (!this.ready()) return;
    this.noiseBurst(0.045, 'lowpass', 500, 0.9);
  }

  /** Удар без сноса. */
  bonk(): void {
    if (!this.ready()) return;
    this.tone('sine', 160, 90, 0.12, 0.5);
  }

  play(kind: SfxKind): void {
    if (!this.ready()) return;
    const p = this.pitch();
    switch (kind) {
      case 'glass':
        this.tone('sine', 2200 * p, 2100 * p, 0.35, 0.25);
        this.tone('sine', 3400 * p, 3300 * p, 0.3, 0.15);
        this.tone('sine', 4700 * p, 4600 * p, 0.25, 0.1);
        break;
      case 'ceramic':
        this.noiseBurst(0.12, 'bandpass', 2500 * p, 0.6);
        this.tone('triangle', 900 * p, 400 * p, 0.08, 0.3);
        this.tone('triangle', 1400 * p, 700 * p, 0.06, 0.2, 0.03);
        break;
      case 'thud':
        this.tone('sine', 120 * p, 50 * p, 0.18, 0.7);
        this.noiseBurst(0.06, 'lowpass', 300, 0.5);
        break;
      case 'metal':
        this.tone('square', 800 * p, 780 * p, 0.4, 0.12);
        this.tone('triangle', 1270 * p, 1250 * p, 0.35, 0.12);
        this.tone('sawtooth', 2100 * p, 2050 * p, 0.3, 0.06);
        break;
      case 'splash':
        this.noiseBurst(0.25, 'lowpass', 1800 * p, 0.5, 400);
        this.tone('sine', 300 * p, 120 * p, 0.2, 0.25);
        break;
      case 'crash':
        this.tone('sine', 110 * p, 40 * p, 0.3, 0.8);
        this.noiseBurst(0.3, 'bandpass', 1800 * p, 0.6);
        this.tone('sine', 2600 * p, 2400 * p, 0.3, 0.15, 0.04);
        this.tone('square', 700 * p, 650 * p, 0.3, 0.1, 0.02);
        break;
    }
  }

  private ready(): boolean {
    return this.enabled && !!this.ctx && !!this.master && this.ctx.state === 'running';
  }

  private pitch(): number {
    return 0.9 + Math.random() * 0.2;
  }

  private tone(type: OscillatorType, from: number, to: number, dur: number, vol: number, delay = 0): void {
    const ctx = this.ctx!;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g).connect(this.master!);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private noiseBurst(dur: number, type: BiquadFilterType, freq: number, vol: number, freqTo?: number): void {
    const ctx = this.ctx!;
    const t0 = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise!;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t0);
    if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t0 + dur);
    f.Q.value = type === 'bandpass' ? 1.2 : 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(f).connect(g).connect(this.master!);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + 0.02);
  }
}
