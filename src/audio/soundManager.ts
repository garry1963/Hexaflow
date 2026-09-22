/**
 * Hexaflow Procedural Audio Engine
 * Uses Web Audio API to produce original, zero-latency, high-fidelity casual game sounds.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = false;
  private musicInterval: number | null = null;
  private musicGain: GainNode | null = null;
  private isUnlocked: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isUnlocked = true;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  public playButton() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playSelect() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.09); // E5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playPlace() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playInvalid() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.setValueAtTime(110, now + 0.07);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  /**
   * Crisp, percussive chip clack sound played as each tile in a waterfall cascade lands onto the stack
   */
  public playCascadeDrop(stepIndex: number = 0, totalAdded: number = 5) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Ascending melodic pitch as stack grows taller
    const baseFreq = 460 + Math.min(stepIndex * 50, 480);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.055);

    gain.gain.setValueAtTime(0.13, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Airy melodic swoosh for tiles streaming across between neighbor sockets
   */
  public playTileWhoosh() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.14);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playMerge(countRatio: number = 0.5) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const baseFreq = 400 + Math.min(countRatio * 450, 600);

    // Two harmonic oscillators for rich glossy chime
    [1, 1.5].forEach((multiplier, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq * multiplier, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * multiplier * 1.3, now + 0.15);

      gain.gain.setValueAtTime(0.18 / (i + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    });
  }

  public playCombo(comboCount: number) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const startIndex = Math.min(comboCount, 3);

    for (let i = 0; i < 3; i++) {
      const noteFreq = pentatonic[(startIndex + i) % pentatonic.length];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, noteTime);

      gain.gain.setValueAtTime(0.15, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.18);
    }
  }

  public playCompleteStack() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Major chord burst: C5, E5, G5, C6
    const chord = [523.25, 659.25, 783.99, 1046.5];

    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = idx * 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + delay + 0.35);

      gain.gain.setValueAtTime(0.16, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.45);
    });
  }

  public playLevelComplete() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Fanfare: G4 -> C5 -> E5 -> G5 -> C6
    const notes = [392.0, 523.25, 659.25, 783.99, 1046.5];
    const delays = [0, 0.1, 0.2, 0.3, 0.45];
    const durations = [0.15, 0.15, 0.15, 0.2, 0.7];

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + delays[idx];
      const dur = durations[idx];

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.22, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + dur);
    });
  }

  public playBooster() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  private startMusic() {
    this.stopMusic();
    this.initContext();
    if (!this.ctx) return;

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    this.musicGain.connect(this.ctx.destination);

    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C major pentatonic
    let step = 0;

    const playNote = () => {
      if (!this.ctx || !this.musicEnabled || !this.musicGain) return;
      const freq = scale[step % scale.length];
      step = (step + Math.floor(Math.random() * 3) + 1) % scale.length;

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      noteGain.gain.setValueAtTime(0.5, now);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(noteGain);
      noteGain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 1.2);
    };

    playNote();
    this.musicInterval = window.setInterval(playNote, 1400);
  }

  private stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.disconnect();
      this.musicGain = null;
    }
  }
}

export const soundManager = new SoundManager();
