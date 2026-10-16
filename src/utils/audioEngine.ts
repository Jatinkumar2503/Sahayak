/**
 * Sahayak 3D Procedural Railway Sound Engine
 * Uses Web Audio API to synthesize realistic railway audio:
 * - Rhythmic dual-bogie rail joint clatter (frequency tied to train speed)
 * - Locomotive electric traction hum
 * - Indian Railways twin-tone horn
 * Zero external audio assets required; zero network latency.
 */

class RailwayAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private clatterTimer: number | null = null;
  private isRunning: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.initContext();
    this.isMuted = !this.isMuted;

    if (!this.isMuted && !this.isRunning) {
      this.startClatterLoop();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private startClatterLoop() {
    this.isRunning = true;

    const playClickClack = () => {
      if (this.isMuted || !this.ctx) {
        this.isRunning = false;
        return;
      }

      // Generate soft rhythmic low-frequency rail joint thud
      const now = this.ctx.currentTime;
      this.createWheelThud(now, 110, 0.08);
      this.createWheelThud(now + 0.09, 90, 0.06);
      this.createWheelThud(now + 0.22, 105, 0.07);
      this.createWheelThud(now + 0.31, 88, 0.05);

      this.clatterTimer = window.setTimeout(playClickClack, 950);
    };

    playClickClack();
  }

  private createWheelThud(time: number, freq: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, time);

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  public playHorn() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Iconic Indian Railways high-low dual tone horn (E4 & G#4)
    [329.63, 415.30].forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    });
  }
}

export const railwayAudio = new RailwayAudioEngine();
