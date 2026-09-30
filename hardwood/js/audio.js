// Synthesised arena audio: crowd bed, cheers, ball, rim, net, sneakers, buzzer.
export class Sound {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.excite = 0;
  }

  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain();
    this.master.gain.value = this.enabled ? 0.9 : 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    this.master.connect(comp).connect(ctx.destination);
    // noise buffers
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.16;
      }
    }
    this.pink = buf;
    const wb = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const wd = wb.getChannelData(0);
    for (let i = 0; i < wd.length; i++) wd[i] = Math.random() * 2 - 1;
    this.white = wb;
    // crowd bed
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 0.6;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
    this.bed = ctx.createGain(); this.bed.gain.value = 0.18;
    this.bedLp = lp;
    src.connect(bp).connect(lp).connect(this.bed).connect(this.master);
    src.start();
    // murmur modulation
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.23;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.04;
    lfo.connect(lfoG).connect(this.bed.gain); lfo.start();
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.setTargetAtTime(on ? 0.9 : 0, this.ctx.currentTime, 0.05);
  }

  duck(on) {
    if (!this.master) return;
    this.master.gain.setTargetAtTime(on || !this.enabled ? (this.enabled ? 0.15 : 0) : 0.9, this.ctx.currentTime, 0.1);
  }

  get ok() { return this.ctx && this.enabled; }

  _noise(dur, { type = 'bandpass', f = 1000, q = 1, gain = 0.5, attack = 0.005, pan = 0, f2 = null, buf = null, when = 0 } = {}) {
    const ctx = this.ctx, t = ctx.currentTime + when;
    const s = ctx.createBufferSource();
    s.buffer = buf || this.white;
    s.loop = true;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (p) { p.pan.value = pan; s.connect(fl).connect(g).connect(p).connect(this.master); } else s.connect(fl).connect(g).connect(this.master);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.05);
  }

  _tone(freq, dur, { type = 'sine', gain = 0.3, f2 = null, pan = 0, attack = 0.003, when = 0 } = {}) {
    const ctx = this.ctx, t = ctx.currentTime + when;
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (p) { p.pan.value = pan; o.connect(g).connect(p).connect(this.master); } else o.connect(g).connect(this.master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  dribble(v = 1, pan = 0) {
    if (!this.ok) return;
    const g = Math.min(0.9, 0.35 + v * 0.1);
    this._tone(115, 0.13, { f2: 55, gain: g, pan });
    this._noise(0.06, { type: 'lowpass', f: 1400, gain: g * 0.5, pan });
    this._noise(0.25, { type: 'bandpass', f: 380, q: 3, gain: g * 0.12, pan, attack: 0.01 }); // gym reverb tail
  }

  rim(v = 1, pan = 0) {
    if (!this.ok) return;
    const g = Math.min(0.6, 0.12 + v * 0.07);
    for (const [f, d] of [[512, 0.5], [1187, 0.35], [2010, 0.22], [3120, 0.12]]) this._tone(f, d, { gain: g * (f < 600 ? 1 : 0.5), pan, type: 'triangle' });
    this._noise(0.05, { type: 'highpass', f: 2500, gain: g * 0.6, pan });
  }

  board(v = 1, pan = 0) {
    if (!this.ok) return;
    const g = Math.min(0.7, 0.2 + v * 0.07);
    this._tone(150, 0.16, { f2: 90, gain: g, pan });
    this._noise(0.12, { type: 'bandpass', f: 900, q: 1.2, gain: g * 0.5, pan });
    this._tone(620, 0.25, { gain: g * 0.12, pan, type: 'triangle' });
  }

  swish(clean = true) {
    if (!this.ok) return;
    this._noise(clean ? 0.42 : 0.3, { type: 'bandpass', f: 3200, f2: 5200, q: 0.8, gain: clean ? 0.5 : 0.3, attack: 0.03 });
    this._noise(0.3, { type: 'highpass', f: 6000, gain: 0.12, attack: 0.02, when: 0.05 });
  }

  squeak(pan = 0) {
    if (!this.ok) return;
    const f = 2200 + Math.random() * 900;
    this._tone(f, 0.11, { f2: f * 1.25, gain: 0.07, pan, type: 'sine', attack: 0.01 });
    this._tone(f * 2.01, 0.09, { f2: f * 2.4, gain: 0.025, pan, attack: 0.01 });
  }

  step(pan = 0) {
    if (!this.ok) return;
    this._noise(0.05, { type: 'lowpass', f: 500, gain: 0.08, pan });
  }

  cheer(amount = 1) {
    if (!this.ok) return;
    const dur = 1.6 + amount * 1.6;
    this._noise(dur, { type: 'bandpass', f: 900, f2: 1300, q: 0.5, gain: 0.25 + amount * 0.3, attack: 0.18, buf: this.pink });
    this._noise(dur * 0.8, { type: 'bandpass', f: 2600, q: 1.5, gain: 0.05 + amount * 0.08, attack: 0.25, buf: this.pink }); // whistles/screams
    this.excite = Math.min(1.5, this.excite + amount);
  }

  ooh() {
    if (!this.ok) return;
    this._noise(1.2, { type: 'bandpass', f: 480, f2: 360, q: 4, gain: 0.35, attack: 0.15, buf: this.pink });
    this._noise(1.1, { type: 'bandpass', f: 900, f2: 700, q: 5, gain: 0.18, attack: 0.15, buf: this.pink });
  }

  buzzer() {
    if (!this.ok) return;
    this._tone(233, 1.1, { type: 'sawtooth', gain: 0.22, attack: 0.01 });
    this._tone(466, 1.1, { type: 'square', gain: 0.08, attack: 0.01 });
  }

  whoosh() {
    if (!this.ok) return;
    this._noise(0.25, { type: 'bandpass', f: 600, f2: 1800, q: 1, gain: 0.1, attack: 0.05 });
  }

  update(dt) {
    if (!this.ctx) return;
    this.excite = Math.max(0, this.excite - dt * 0.4);
    const t = this.ctx.currentTime;
    this.bed.gain.setTargetAtTime(0.16 + this.excite * 0.12, t, 0.3);
    this.bedLp.frequency.setTargetAtTime(1600 + this.excite * 1400, t, 0.3);
  }
}
