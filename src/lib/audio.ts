// Teenage Engineering style procedural synthesizer clicks
// TODO: refactor this sound shit later if audio context glitches on mobile safari
class MechanicalAudio {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      console.log("[Audio] initialized web audio context", this.ctx.state);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // crisp tactile click for buttons
  playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.015);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.015);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.015);
    } catch (e) {
      console.error("audio click failed, safari probably being annoying", e);
    }
  }

  // heavy sub-bass thud for battle impact
  playImpact() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(130, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch (e) {
      console.log("impact audio error", e);
    }
  }

  // pentatonic victory chime
  playCapture() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + idx * 0.055;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
      });
    } catch (e) {
      console.log("capture audio error", e);
    }
  }

  // error buzz when rate limited
  playBuzz() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.log("buzz error", e);
    }
  }

  // Faction Fanfare Synth - teenage engineering op-1 inspired frequency modulation
  playFactionFanfare(dormId: string) {
    try {
      this.init();
      if (!this.ctx) return;
      console.log(`[Audio] Playing faction sonics for ${dormId}`);

      const chords: Record<string, number[]> = {
        bonchek: [587.33, 739.99, 880.00, 1174.66], // D major crystal
        brooks: [440.00, 554.37, 659.25, 880.00],   // A major brass
        ware: [329.63, 392.00, 493.88, 659.25],    // E minor nocturnal
        weis: [523.25, 659.25, 783.99, 987.77],    // C major 7th crisp
        new_college: [261.63, 329.63, 392.00, 523.25], // C major sub-mass
      };

      const notes = chords[dormId] || [440, 554, 659, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + idx * 0.06;
        osc.type = dormId === 'ware' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
      });
    } catch (e) {
      console.log("fanfare error", e);
    }
  }

  // Two-tone alert siren for custodial urgent flags
  playSiren() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {
      console.log("siren error", e);
    }
  }
}

export const sound = new MechanicalAudio();
