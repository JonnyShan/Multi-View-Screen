// Web Audio synth: V4 race engine, quickshifter, decel pops, wind, tyres, kerbs, crowd, UI.
export class Audio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.8;
  }

  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain();
    this.master.gain.value = this.enabled ? this.volume : 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.2;
    this.master.connect(comp).connect(ctx.destination);
    this.noise = this.#noiseBuffer(2);
    this.#engine();
    this.#beds();
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.setTargetAtTime(on ? this.volume : 0, this.ctx.currentTime, 0.05);
  }

  #noiseBuffer(sec) {
    const b = this.ctx.createBuffer(1, this.ctx.sampleRate * sec, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = w * 0.6 + last * 3; }
    return b;
  }

  #loopNoise() {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noise; s.loop = true; s.start();
    return s;
  }

  #engine() {
    const c = this.ctx;
    const out = this.engineOut = c.createGain();
    out.gain.value = 0;
    // Waveshaper for grit
    const shaper = c.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 2.6); }
    shaper.curve = curve;
    const lp = this.engineLP = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.Q.value = 1.2; lp.frequency.value = 1200;
    const body = c.createBiquadFilter();
    body.type = 'peaking'; body.frequency.value = 520; body.Q.value = 1.1; body.gain.value = 6;
    const pre = c.createGain(); pre.gain.value = 0.5;
    this.oscs = [];
    const mk = (type, mult, gain, detune = 0) => {
      const o = c.createOscillator(); o.type = type; o.detune.value = detune;
      const g = c.createGain(); g.gain.value = gain;
      o.connect(g).connect(pre); o.start();
      this.oscs.push({ o, mult });
    };
    mk('sawtooth', 1, 0.5);
    mk('sawtooth', 1, 0.3, 9);
    mk('square', 0.5, 0.35);
    mk('sawtooth', 2, 0.16, -6);
    mk('triangle', 0.25, 0.4);
    // Irregular V4 "big bang" firing: amplitude modulation at half the firing freq.
    const am = c.createGain(); am.gain.value = 0.7;
    const lfo = c.createOscillator(); lfo.type = 'sine';
    const lfoG = c.createGain(); lfoG.gain.value = 0.3;
    lfo.connect(lfoG).connect(am.gain); lfo.start();
    this.lfo = lfo;
    pre.connect(shaper).connect(lp).connect(body).connect(am).connect(out).connect(this.master);
    // intake roar noise layer
    const n = this.#loopNoise();
    const nb = c.createBiquadFilter(); nb.type = 'bandpass'; nb.frequency.value = 900; nb.Q.value = 0.8;
    const ng = this.roarGain = c.createGain(); ng.gain.value = 0;
    n.connect(nb).connect(ng).connect(out);
    this.roarBP = nb;
  }

  #beds() {
    const c = this.ctx;
    const bed = (type, f, q) => {
      const n = this.#loopNoise();
      const flt = c.createBiquadFilter(); flt.type = type; flt.frequency.value = f; flt.Q.value = q;
      const g = c.createGain(); g.gain.value = 0;
      n.connect(flt).connect(g).connect(this.master);
      return { g, flt };
    };
    this.wind = bed('lowpass', 500, 0.5);
    this.tyre = bed('bandpass', 1100, 4);
    this.grass = bed('lowpass', 260, 0.7);
    this.crowd = bed('bandpass', 700, 0.5);
    this.ambience = bed('highpass', 3500, 0.5);
    // kerb rumble: low square pulses
    const ko = c.createOscillator(); ko.type = 'square'; ko.frequency.value = 30;
    const kf = c.createBiquadFilter(); kf.type = 'lowpass'; kf.frequency.value = 220;
    const kg = c.createGain(); kg.gain.value = 0;
    ko.connect(kf).connect(kg).connect(this.master); ko.start();
    this.kerb = { o: ko, g: kg };
  }

  // Called every frame while riding (or with idle params on menus).
  update(st, { ambient = 0, crowd = 0, active = true } = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const rpm = st ? st.rpm : 0;
    const on = active && st;
    const fire = rpm / 60 * 2; // firing frequency for a 4-cyl four-stroke
    for (const { o, mult } of this.oscs) o.frequency.setTargetAtTime(Math.max(20, fire * mult * 0.5), t, 0.012);
    this.lfo.frequency.setTargetAtTime(fire * 0.25, t, 0.02);
    const thr = on ? st.throttle : 0;
    const rn = Math.min(1, rpm / 17500);
    this.engineLP.frequency.setTargetAtTime(500 + rn * 2600 + thr * 2400, t, 0.03);
    const cut = this.cutUntil && t < this.cutUntil ? 0.15 : 1;
    this.engineOut.gain.setTargetAtTime(on ? (0.18 + rn * 0.22 + thr * 0.12) * cut : 0, t, 0.02);
    this.roarGain.gain.setTargetAtTime(on ? thr * rn * 0.25 : 0, t, 0.05);
    this.roarBP.frequency.setTargetAtTime(600 + rn * 2200, t, 0.05);
    const v = on ? st.v : 0;
    this.wind.g.gain.setTargetAtTime(Math.min(0.5, (v / 90) ** 2 * 0.45), t, 0.1);
    this.wind.flt.frequency.setTargetAtTime(300 + v * 18, t, 0.1);
    const squeal = on && st.tyre > 0.9 && v > 15 ? (st.tyre - 0.9) * 2.5 : 0;
    const brakeSq = on && st.brake > 0.6 && v > 20 ? 0.08 : 0;
    this.tyre.g.gain.setTargetAtTime(Math.min(0.22, squeal + brakeSq), t, 0.05);
    const off = on && (st.surface === 'grass' || st.surface === 'gravel');
    this.grass.g.gain.setTargetAtTime(off ? Math.min(0.5, v / 40) : 0, t, 0.05);
    this.kerb.g.gain.setTargetAtTime(on && st.kerb && v > 5 ? 0.25 : 0, t, 0.02);
    this.kerb.o.frequency.setTargetAtTime(Math.max(8, v / 1.2), t, 0.02);
    if (!this.cheerUntil || t > this.cheerUntil) this.crowd.g.gain.setTargetAtTime(crowd * 0.12, t, 0.3);
    this.ambience.g.gain.setTargetAtTime(ambient * 0.012, t, 0.5);
    // exhaust crackle on decel
    if (on && thr < 0.2 && rpm > 7000 && Math.random() < 0.28) this.pop(0.5 + Math.random() * 0.5);
  }

  upshift() {
    if (!this.ctx) return;
    this.cutUntil = this.ctx.currentTime + 0.045;
    this.pop(0.6);
  }

  pop(power = 1) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource(); s.buffer = this.noise;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 180 + Math.random() * 500; f.Q.value = 1.5;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35 * power, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05 + Math.random() * 0.04);
    s.connect(f).connect(g).connect(this.master);
    s.start(t, Math.random()); s.stop(t + 0.12);
    this.lastPop = t;
  }

  thud(power = 1) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.25);
    const g = c.createGain();
    g.gain.setValueAtTime(0.6 * power, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.32);
    this.pop(power);
  }

  beep(freq = 660, dur = 0.16, vol = 0.25) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  }

  click() { this.beep(1400, 0.05, 0.08); }

  cheer(sec = 3) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const g = this.crowd.g.gain;
    this.cheerUntil = t + sec;
    g.cancelScheduledValues(t);
    g.setTargetAtTime(0.35, t, 0.2);
    g.setTargetAtTime(0.05, t + sec * 0.7, 0.6);
  }
}
