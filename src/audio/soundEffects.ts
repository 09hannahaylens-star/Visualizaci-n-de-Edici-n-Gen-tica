/**
 * Sintetizador procedural de audio científico mediante Web Audio API
 * No requiere archivos externos, ligero, respeta la privacidad y arranca silenciado por defecto.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private droneGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private isDronePlaying: boolean = false;

  constructor() {
    // Inicialización bajo demanda tras interacción del usuario
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.initCtx();
      this.startAmbientDrone();
    } else {
      this.stopAmbientDrone();
    }
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted) {
      this.stopAmbientDrone();
    } else {
      this.initCtx();
      this.startAmbientDrone();
    }
  }

  /**
   * Zumbido ambiental continuo muy suave y sutil de laboratorio científico
   */
  public startAmbientDrone() {
    if (this.isMuted || this.isDronePlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      // Ganancia principal muy atenuada
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.001, t);
      this.droneGain.gain.exponentialRampToValueAtTime(0.025, t + 3);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, t);

      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(55, t); // La fundamental (55 Hz)

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(110.5, t); // Armónico sutil con ligero batimiento

      this.droneOsc1.connect(filter);
      this.droneOsc2.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);

      this.droneOsc1.start();
      this.droneOsc2.start();
      this.isDronePlaying = true;
    } catch {
      // Ignorar si el navegador bloquea audio antes de gesto
    }
  }

  public stopAmbientDrone() {
    if (!this.isDronePlaying || !this.droneGain || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      this.droneGain.gain.linearRampToValueAtTime(0.0001, t + 0.8);
      setTimeout(() => {
        try {
          this.droneOsc1?.stop();
          this.droneOsc2?.stop();
          this.droneOsc1?.disconnect();
          this.droneOsc2?.disconnect();
          this.isDronePlaying = false;
        } catch {}
      }, 850);
    } catch {
      this.isDronePlaying = false;
    }
  }

  /**
   * Sonido de clic háptico digital al interactuar con botones
   */
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.045);
    } catch {}
  }

  /**
   * Resonancia armónica de escaneo y reconocimiento de secuencia
   */
  public playScan() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.07);

        gain.gain.setValueAtTime(0, t + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.03, t + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + i * 0.07);
        osc.stop(t + i * 0.07 + 0.5);
      });
    } catch {}
  }

  /**
   * Efecto cinematográfico de corte molecular (cleavage) de Cas9
   * Transitorio acústico resonante con pulso sub-grave y micro-destello
   */
  public playCleavage() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Sub-grave de impacto de ruptura
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140, t);
      subOsc.frequency.exponentialRampToValueAtTime(38, t + 0.6);

      subGain.gain.setValueAtTime(0.12, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(t);
      subOsc.stop(t + 0.7);

      // 2. Destello metálico/cristalino de ruptura de enlace fosfodiéster
      const pingOsc = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      pingOsc.type = 'triangle';
      pingOsc.frequency.setValueAtTime(2400, t);
      pingOsc.frequency.exponentialRampToValueAtTime(800, t + 0.35);

      pingGain.gain.setValueAtTime(0.07, t);
      pingGain.gain.exponentialRampToValueAtTime(0.0005, t + 0.4);

      pingOsc.connect(pingGain);
      pingGain.connect(this.ctx.destination);
      pingOsc.start(t);
      pingOsc.stop(t + 0.45);
    } catch {}
  }

  /**
   * Resonancia de reparación molecular y ligado de extremos
   */
  public playRepair() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, t); // E4
      osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.4); // E5

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.05, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.65);
    } catch {}
  }
}

export const sound = new SoundController();
