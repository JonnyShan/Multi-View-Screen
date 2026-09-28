/**
 * Placeholder sounds generated with the Web Audio API (OfflineAudioContext)
 * and encoded to WAV blobs for Howler. Nothing is downloaded.
 */

export type SoundName =
  | 'engine'
  | 'gun'
  | 'enemyGun'
  | 'slash'
  | 'screech'
  | 'impact'
  | 'crash'
  | 'explosion'
  | 'rain'
  | 'phone'
  | 'siren'
  | 'thunder'
  | 'cash'
  | 'pop'
  | 'cut'
  | 'music'
  | 'click';

type Build = (ctx: OfflineAudioContext) => void;

function noiseBuffer(ctx: BaseAudioContext, seconds: number, brown = false): AudioBuffer {
  const b = ctx.createBuffer(1, Math.ceil(seconds * ctx.sampleRate), ctx.sampleRate);
  const d = b.getChannelData(0);
  let last = 0;
  let seed = 12345;
  const rnd = (): number => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < d.length; i++) {
    const w = rnd() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    } else d[i] = w;
  }
  return b;
}

function noise(ctx: OfflineAudioContext, seconds: number, brown = false): AudioBufferSourceNode {
  const s = ctx.createBufferSource();
  s.buffer = noiseBuffer(ctx, seconds, brown);
  return s;
}

function env(ctx: OfflineAudioContext, node: AudioNode, a: number, peak: number, d: number, start = 0): GainNode {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + a);
  g.gain.exponentialRampToValueAtTime(0.0001, start + a + d);
  node.connect(g);
  return g;
}

function filter(ctx: OfflineAudioContext, type: BiquadFilterType, f: number, q = 1): BiquadFilterNode {
  const b = ctx.createBiquadFilter();
  b.type = type;
  b.frequency.value = f;
  b.Q.value = q;
  return b;
}

const SPECS: Record<SoundName, { seconds: number; build: Build; stereo?: boolean }> = {
  engine: {
    seconds: 1,
    build: (ctx) => {
      // a loopable four-cylinder buzz: harmonics of 50 Hz with firing pulses
      const out = ctx.createGain();
      out.gain.value = 0.32;
      out.connect(ctx.destination);
      const lp = filter(ctx, 'lowpass', 1400, 0.7);
      lp.connect(out);
      for (const [f, g, type] of [
        [50, 0.5, 'sawtooth'],
        [100, 0.35, 'square'],
        [150, 0.18, 'sawtooth'],
        [200, 0.12, 'triangle'],
      ] as [number, number, OscillatorType][]) {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = f;
        const gg = ctx.createGain();
        gg.gain.value = g;
        o.connect(gg).connect(lp);
        o.start(0);
      }
      const n = noise(ctx, 1);
      const bp = filter(ctx, 'bandpass', 900, 0.8);
      const ng = ctx.createGain();
      ng.gain.value = 0.12;
      n.connect(bp).connect(ng).connect(lp);
      // amplitude pulses at the firing rate
      const am = ctx.createOscillator();
      am.frequency.value = 25;
      const amg = ctx.createGain();
      amg.gain.value = 0.25;
      am.connect(amg).connect(out.gain);
      am.start(0);
      n.start(0);
    },
  },
  gun: {
    seconds: 0.18,
    build: (ctx) => {
      const n = noise(ctx, 0.18);
      const hp = filter(ctx, 'highpass', 600);
      n.connect(hp);
      env(ctx, hp, 0.002, 0.9, 0.09).connect(ctx.destination);
      const o = ctx.createOscillator();
      o.frequency.setValueAtTime(160, 0);
      o.frequency.exponentialRampToValueAtTime(50, 0.08);
      env(ctx, o, 0.002, 0.8, 0.08).connect(ctx.destination);
      n.start(0);
      o.start(0);
    },
  },
  enemyGun: {
    seconds: 0.2,
    build: (ctx) => {
      const n = noise(ctx, 0.2);
      const bp = filter(ctx, 'bandpass', 1800, 0.8);
      n.connect(bp);
      env(ctx, bp, 0.002, 0.7, 0.12).connect(ctx.destination);
      n.start(0);
    },
  },
  slash: {
    seconds: 0.4,
    build: (ctx) => {
      const n = noise(ctx, 0.4);
      const bp = filter(ctx, 'bandpass', 800, 2.5);
      bp.frequency.setValueAtTime(600, 0);
      bp.frequency.exponentialRampToValueAtTime(4200, 0.18);
      n.connect(bp);
      env(ctx, bp, 0.03, 0.8, 0.22).connect(ctx.destination);
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = 2400;
      env(ctx, o, 0.005, 0.12, 0.3, 0.05).connect(ctx.destination);
      n.start(0);
      o.start(0);
    },
  },
  screech: {
    seconds: 1.5,
    build: (ctx) => {
      const n = noise(ctx, 1.5);
      const bp = filter(ctx, 'bandpass', 2600, 6);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 7;
      const lg = ctx.createGain();
      lg.gain.value = 500;
      lfo.connect(lg).connect(bp.frequency);
      const g = ctx.createGain();
      g.gain.value = 0.9;
      n.connect(bp).connect(g).connect(ctx.destination);
      n.start(0);
      lfo.start(0);
    },
  },
  impact: {
    seconds: 0.5,
    build: (ctx) => {
      const n = noise(ctx, 0.5, true);
      const lp = filter(ctx, 'lowpass', 500);
      n.connect(lp);
      env(ctx, lp, 0.003, 1, 0.35).connect(ctx.destination);
      const o = ctx.createOscillator();
      o.frequency.setValueAtTime(90, 0);
      o.frequency.exponentialRampToValueAtTime(35, 0.25);
      env(ctx, o, 0.003, 0.9, 0.25).connect(ctx.destination);
      n.start(0);
      o.start(0);
    },
  },
  crash: {
    seconds: 1.2,
    build: (ctx) => {
      const n = noise(ctx, 1.2, true);
      const lp = filter(ctx, 'lowpass', 700);
      n.connect(lp);
      env(ctx, lp, 0.003, 1, 0.8).connect(ctx.destination);
      const glass = noise(ctx, 1.2);
      const hp = filter(ctx, 'highpass', 5000);
      glass.connect(hp);
      env(ctx, hp, 0.01, 0.4, 0.6, 0.05).connect(ctx.destination);
      n.start(0);
      glass.start(0);
    },
  },
  explosion: {
    seconds: 2.4,
    build: (ctx) => {
      const n = noise(ctx, 2.4, true);
      const lp = filter(ctx, 'lowpass', 1200);
      lp.frequency.setValueAtTime(2400, 0);
      lp.frequency.exponentialRampToValueAtTime(120, 2.0);
      n.connect(lp);
      env(ctx, lp, 0.005, 1.4, 2.1).connect(ctx.destination);
      const o = ctx.createOscillator();
      o.frequency.setValueAtTime(70, 0);
      o.frequency.exponentialRampToValueAtTime(25, 0.8);
      env(ctx, o, 0.005, 1, 0.9).connect(ctx.destination);
      n.start(0);
      o.start(0);
    },
  },
  rain: {
    seconds: 3,
    build: (ctx) => {
      const n = noise(ctx, 3);
      const lp = filter(ctx, 'lowpass', 5000);
      const hp = filter(ctx, 'highpass', 400);
      const g = ctx.createGain();
      g.gain.value = 0.35;
      n.connect(hp).connect(lp).connect(g).connect(ctx.destination);
      const b = noise(ctx, 3, true);
      const bg = ctx.createGain();
      bg.gain.value = 0.4;
      b.connect(bg).connect(ctx.destination);
      n.start(0);
      b.start(0);
    },
  },
  phone: {
    seconds: 1.6,
    build: (ctx) => {
      // two short warbling trills
      for (const start of [0, 0.5]) {
        for (let k = 0; k < 8; k++) {
          const o = ctx.createOscillator();
          o.type = 'square';
          o.frequency.value = k % 2 ? 1300 : 1050;
          const f = filter(ctx, 'lowpass', 3000);
          o.connect(f);
          const g = env(ctx, f, 0.004, 0.18, 0.035, start + k * 0.045);
          g.connect(ctx.destination);
          o.start(start + k * 0.045);
          o.stop(start + k * 0.045 + 0.05);
        }
      }
    },
  },
  siren: {
    seconds: 2,
    build: (ctx) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(650, 0);
      o.frequency.linearRampToValueAtTime(1350, 1.0);
      o.frequency.linearRampToValueAtTime(650, 2.0);
      const f = filter(ctx, 'lowpass', 2200);
      const g = ctx.createGain();
      g.gain.value = 0.22;
      o.connect(f).connect(g).connect(ctx.destination);
      o.start(0);
    },
  },
  thunder: {
    seconds: 4,
    build: (ctx) => {
      const n = noise(ctx, 4, true);
      const lp = filter(ctx, 'lowpass', 400);
      n.connect(lp);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, 0);
      g.gain.exponentialRampToValueAtTime(1.8, 0.08);
      g.gain.exponentialRampToValueAtTime(0.6, 0.6);
      g.gain.exponentialRampToValueAtTime(1.0, 1.1);
      g.gain.exponentialRampToValueAtTime(0.0001, 3.9);
      lp.connect(g).connect(ctx.destination);
      n.start(0);
    },
  },
  cash: {
    seconds: 0.9,
    build: (ctx) => {
      [880, 1175, 1568].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = f;
        env(ctx, o, 0.005, 0.3, 0.45, i * 0.09).connect(ctx.destination);
        o.start(i * 0.09);
      });
    },
  },
  pop: {
    seconds: 0.4,
    build: (ctx) => {
      const n = noise(ctx, 0.4);
      env(ctx, n, 0.001, 1, 0.1).connect(ctx.destination);
      const hiss = noise(ctx, 0.4);
      const hp = filter(ctx, 'highpass', 3000);
      hiss.connect(hp);
      env(ctx, hp, 0.02, 0.3, 0.3, 0.05).connect(ctx.destination);
      n.start(0);
      hiss.start(0);
    },
  },
  cut: {
    seconds: 0.6,
    build: (ctx) => {
      const n = noise(ctx, 0.6);
      const bp = filter(ctx, 'bandpass', 3500, 8);
      n.connect(bp);
      env(ctx, bp, 0.004, 1.2, 0.45).connect(ctx.destination);
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(900, 0);
      o.frequency.exponentialRampToValueAtTime(300, 0.4);
      env(ctx, o, 0.004, 0.2, 0.4).connect(ctx.destination);
      n.start(0);
      o.start(0);
    },
  },
  click: {
    seconds: 0.08,
    build: (ctx) => {
      const o = ctx.createOscillator();
      o.frequency.value = 1800;
      env(ctx, o, 0.001, 0.2, 0.05).connect(ctx.destination);
      o.start(0);
    },
  },
  music: {
    seconds: 16,
    stereo: true,
    build: (ctx) => {
      // a dark, slow synth loop: pulsing bass and a minor pad, 90 bpm
      const beat = 60 / 90;
      const out = ctx.createGain();
      out.gain.value = 0.5;
      out.connect(ctx.destination);
      const roots = [55, 55 * 1.189, 55 * 0.891, 55 * 1.059];
      for (let bar = 0; bar < 4; bar++) {
        const r = roots[bar];
        for (let k = 0; k < 8; k++) {
          const t0 = bar * 4 * beat + k * beat * 0.5;
          const o = ctx.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = r;
          const f = filter(ctx, 'lowpass', 380, 4);
          o.connect(f);
          env(ctx, f, 0.01, 0.35, beat * 0.4, t0).connect(out);
          o.start(t0);
          o.stop(t0 + beat * 0.5);
        }
        for (const mul of [2, 2.378, 3, 4.757]) {
          const o = ctx.createOscillator();
          o.type = 'triangle';
          o.frequency.value = r * mul;
          const g = ctx.createGain();
          const t0 = bar * 4 * beat;
          g.gain.setValueAtTime(0.0001, t0);
          g.gain.linearRampToValueAtTime(0.05, t0 + 0.8);
          g.gain.linearRampToValueAtTime(0.0001, t0 + 4 * beat);
          o.connect(g).connect(out);
          o.start(t0);
          o.stop(t0 + 4 * beat);
        }
        // soft kick on 1 and 3
        for (const k of [0, 2]) {
          const t0 = bar * 4 * beat + k * beat;
          const o = ctx.createOscillator();
          o.frequency.setValueAtTime(120, t0);
          o.frequency.exponentialRampToValueAtTime(40, t0 + 0.15);
          env(ctx, o, 0.003, 0.5, 0.2, t0).connect(out);
          o.start(t0);
          o.stop(t0 + 0.3);
        }
      }
    },
  },
};

function toWav(buf: AudioBuffer): Blob {
  const ch = buf.numberOfChannels;
  const len = buf.length;
  const rate = buf.sampleRate;
  const bytes = 44 + len * ch * 2;
  const view = new DataView(new ArrayBuffer(bytes));
  const w = (o: number, s: string): void => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  w(0, 'RIFF');
  view.setUint32(4, bytes - 8, true);
  w(8, 'WAVE');
  w(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, ch, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * ch * 2, true);
  view.setUint16(32, ch * 2, true);
  view.setUint16(34, 16, true);
  w(36, 'data');
  view.setUint32(40, len * ch * 2, true);
  const chans = Array.from({ length: ch }, (_, i) => buf.getChannelData(i));
  let o = 44;
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < ch; c++) {
      const v = Math.max(-1, Math.min(1, chans[c][i]));
      view.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true);
      o += 2;
    }
  }
  return new Blob([view], { type: 'audio/wav' });
}

export async function renderSound(name: SoundName, sampleRate = 22050): Promise<string> {
  const spec = SPECS[name];
  const ctx = new OfflineAudioContext(spec.stereo ? 2 : 1, Math.ceil(spec.seconds * sampleRate), sampleRate);
  spec.build(ctx);
  const buf = await ctx.startRendering();
  return URL.createObjectURL(toWav(buf));
}

export const SOUND_NAMES = Object.keys(SPECS) as SoundName[];
