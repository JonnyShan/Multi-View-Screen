// Arcade bike dynamics in track (Frenet) coordinates + an autopilot rider.
import { TUNE } from './config.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export function newState(s0 = 0) {
  return {
    s: s0, x: 0, vx: 0, v: 0, lean: 0, psi: 0,
    gear: 0, rpm: TUNE.idle, throttle: 0, brake: 0, pitch: 0, tuck: 0, discHeat: 0, shiftT: 9,
    a: 0, tyre: 0, surface: 'road', kerb: false,
    maxLean: 0, topSpeed: 0, offTime: 0,
    events: [],
  };
}

const F = {}, SF = {};

export function step(st, input, track, dt, opts = {}) {
  const T = TUNE;
  const assist = input.raw ? 0 : (opts.assist ?? T.assist);
  const locked = opts.locked; // held on the grid
  st.events.length = 0;
  const f = track.frame(st.s, F);
  const sf = track.surface(st.s, st.x, SF);
  const v = st.v;
  const vs = Math.max(v, 0.5);

  // --- Lean: the rider's input sets it; let go and the bike stands up.
  // Assist only helps while you steer into a corner: the lean eases toward the one that carves this corner
  // with the bike pointed along the track, creeping to the inside the harder you push.
  const kEff = f.k / Math.max(0.2, 1 - f.k * st.x);
  const gripLean = Math.atan(Math.tan(T.maxLean) * sf.grip);
  const hiSpeed = smoothstep(3, 16, v);
  const manual = input.steer * T.maxLean;
  const push = Math.abs(input.steer);
  const turn = input.raw ? 1 : T.turn;
  const aim = Math.atan((vs * vs * kEff - 1.8 * vs * (Math.sin(st.psi) - 0.035 * input.steer)) / (T.g * turn));
  const into = input.steer * kEff > 0 ? 1 : 0;
  const help = clamp(assist / 0.8, 0, 1) * into * smoothstep(0.0015, 0.006, Math.abs(kEff)) * Math.min(1, push / 0.35);
  let target = (manual + (aim - manual) * help) * hiSpeed;
  target = clamp(target, -gripLean, gripLean);
  const rate = T.leanRateLow + (T.leanRateHigh - T.leanRateLow) * clamp(v / 90, 0, 1);
  const dl = clamp((target - st.lean) * Math.min(1, dt * 9), -rate * dt, rate * dt);
  st.lean += dl;

  // --- Heading relative to the track. Lean turns the bike (yaw rate g·tanθ / v; at walking pace the bars do
  // it); the track bends under it at k·v. Upright, the bike keeps its heading: straight on, wide of a corner.
  const yaw = turn * (hiSpeed * T.g * Math.tan(st.lean) / vs + (1 - hiSpeed) * input.steer * Math.min(v * 0.25, 0.8));
  st.psi += (yaw - kEff * v * Math.cos(st.psi)) * dt;
  // assist on straights: hands off, the bike lines up with the road (corners still run wide)
  if (push < 0.05) st.psi *= 1 - Math.min(1, dt * 1.4 * clamp(assist / 0.8, 0, 1) * (1 - smoothstep(0.0008, 0.002, Math.abs(kEff))));
  st.psi = clamp(st.psi, -1.1, 1.1);
  if (locked) st.psi = 0;
  st.vx = v * Math.sin(st.psi);
  st.x += st.vx * dt;
  const tyre = Math.abs(Math.tan(st.lean)) / Math.tan(T.maxLean);
  st.tyre = tyre;

  // --- Longitudinal
  const braking = input.brake > 0.05;
  st.brake += ((braking ? input.brake : 0) - st.brake) * Math.min(1, dt * 10);
  st.throttle += ((locked || braking ? 0 : (input.throttle ?? 1)) - st.throttle) * Math.min(1, dt * 8); // player holds gas; autopilot runs flat out
  const circle = Math.sqrt(Math.max(0, 1 - tyre * tyre * 0.92));
  const traction = T.tractionAccel * sf.grip * circle;
  const engine = Math.min(traction, T.powerPerMass / Math.max(v, 1));
  let a = st.throttle * engine - T.drag * v * v - (v > 0.5 ? T.rolling : 0) - T.g * f.slope;
  if (sf.drag > 0) a -= sf.drag * (0.35 + v / 40) * smoothstep(0, 5, v);
  // engine braking when the player rolls off the gas (autopilot input has no throttle, so its pace is unchanged)
  if (input.throttle != null && !braking && v > 1) a -= (1 - st.throttle) * (0.6 + v * 0.025);
  a -= st.brake * T.brakeDecel * Math.min(1, sf.grip * 1.1) * Math.max(0.2, Math.sqrt(Math.max(0, 1 - tyre * tyre * 0.85)));
  if (locked) a = 0;
  st.a = a;
  st.v = Math.max(0, v + a * dt);
  if (locked) st.v = 0;

  // --- Progress
  const ds = st.v * Math.cos(st.psi) / Math.max(0.2, 1 - f.k * st.x) * dt;
  st.s += ds;

  // --- Walls
  const limR = sf.wallR - 0.9, limL = -(sf.wallL - 0.9);
  if (st.x > limR || st.x < limL) {
    const into = st.x > limR ? st.vx : -st.vx;
    st.x = clamp(st.x, limL, limR);
    if (into > 0) {
      st.psi = -st.psi * 0.35;
      st.vx = st.v * Math.sin(st.psi);
      const hit = clamp(into / 12, 0.08, 0.6);
      st.v *= 1 - hit;
      st.events.push({ type: 'wall', power: hit });
    }
  }

  // --- Surface bookkeeping
  const prevSurf = st.surface;
  st.surface = sf.type;
  st.kerb = sf.type === 'kerb';
  if (sf.type === 'grass' || sf.type === 'gravel') st.offTime += dt;
  if (prevSurf !== st.surface && (sf.type === 'grass' || sf.type === 'gravel')) st.events.push({ type: 'offtrack' });

  // --- Gearbox
  const kmh = st.v * 3.6;
  const G = T.gears;
  if (st.gear < G.length - 1 && kmh > G[st.gear] * 0.965) { st.gear++; st.shiftT = 0; st.events.push({ type: 'upshift' }); }
  else if (st.gear > 0 && kmh < G[st.gear - 1] * 0.7) { st.gear--; st.events.push({ type: 'downshift' }); }
  let rpm = T.idle + (T.redline - T.idle) * clamp(kmh / G[st.gear], 0, 1.02);
  if (st.gear === 0 && kmh < 40 && st.throttle > 0.5) rpm = Math.max(rpm, 9500 + kmh * 100); // clutch slip on launch
  if (locked) rpm = T.idle + 1500 + Math.sin(performance.now() / 90) * 400 + (input.rev ? 7000 : 0);
  st.rpm += (rpm - st.rpm) * Math.min(1, dt * 14);

  // --- Body language
  const leanAbs = Math.abs(st.lean);
  const wheelie = st.throttle > 0.5 && st.gear <= 1 && leanAbs < 0.2 ? -clamp((a - 6.5) / 5, 0, 1) * 0.2 : 0;
  const stoppie = st.brake > 0.5 && leanAbs < 0.3 && v > 25 ? clamp(st.brake * (v / 70), 0, 1) * 0.05 : 0;
  // upshift under power: drive re-engages after the quickshifter cut, the front lifts a touch and the rider sits up
  st.shiftT += dt;
  const kick = st.shiftT < 0.5 && st.throttle > 0.6 && leanAbs < 0.35 ? Math.sin(Math.PI * st.shiftT / 0.5) * (st.gear <= 3 ? 1 : 0.6) : 0;
  st.pitch += ((wheelie || stoppie || 0) - 0.07 * kick - st.pitch) * Math.min(1, dt * 6);
  const tuckT = Math.max(0, (st.v > 38 && !braking && leanAbs < 0.4 ? 1 : 0) - 0.45 * kick);
  st.tuck += (tuckT - st.tuck) * Math.min(1, dt * 4);
  st.discHeat = st.discHeat * Math.exp(-dt * 0.7) + st.brake * v * dt * 0.012;
  st.discHeat = Math.min(st.discHeat, 1);

  st.maxLean = Math.max(st.maxLean, leanAbs);
  st.topSpeed = Math.max(st.topSpeed, kmh);
  return st;
}

// ---------------------------------------------------------------------------
// Autopilot: braking-point speed profile + racing line + PD steering.
export class Autopilot {
  constructor(track, { pace = 0.95 } = {}) {
    this.track = track;
    const N = track.N, ds = track.ds;
    const vmax = new Float64Array(N);
    const aLatMax = TUNE.g * Math.tan(TUNE.maxLean * pace);
    for (let i = 0; i < N; i++) {
      // look at the sharpest curvature nearby (entry/apex)
      let k = 0;
      for (let j = -3; j <= 3; j++) k = Math.max(k, Math.abs(track.K[(i + j + N) % N]));
      vmax[i] = Math.min(100, Math.sqrt(aLatMax / Math.max(k, 1e-5)) * (1 + 0.1 * (1 - pace)));
    }
    const aBrake = TUNE.brakeDecel * 0.72 * pace;
    for (let pass = 0; pass < 2; pass++) {
      for (let i = N - 1; i >= 0; i--) {
        const nx = vmax[(i + 1) % N];
        vmax[i] = Math.min(vmax[i], Math.sqrt(nx * nx + 2 * aBrake * ds));
      }
    }
    this.vmax = vmax;
    // Racing line: inside at apex, outside on entry/exit.
    const line = new Float64Array(N);
    const K = track.K;
    for (let i = 0; i < N; i++) {
      const kin = Math.tanh(K[i] * 110);
      const kAhead = Math.tanh(K[(i + 22) % N] * 110);
      const kBehind = Math.tanh(K[(i - 22 + N) % N] * 110);
      line[i] = 8.5 * kin - 6.5 * (kAhead + kBehind) * (1 - Math.abs(kin)) * 0.5;
    }
    const sm = new Float64Array(N);
    for (let i = 0; i < N; i++) { let a = 0; for (let j = -10; j <= 10; j++) a += line[(i + j + N) % N]; sm[i] = Math.max(-5.6, Math.min(5.6, a / 21)); }
    this.line = sm;
  }

  sample(arr, s) {
    const t = this.track; const f = t.wrapS(s) / t.ds; const i = Math.floor(f) % t.N; const u = f - Math.floor(f);
    return arr[i] + (arr[(i + 1) % t.N] - arr[i]) * u;
  }

  // Steers by lean alone (raw: no assist): corner lean + PD on the racing line.
  input(st) {
    const look = st.s + Math.max(8, st.v * 0.35);
    const xt = this.sample(this.line, look);
    const vt = this.sample(this.vmax, st.s + st.v * 0.25);
    const f = this.track.frame(st.s, {});
    const vs = Math.max(st.v, 0.5);
    const kEff = f.k / Math.max(0.2, 1 - f.k * st.x);
    const aDes = vs * vs * kEff + (xt - st.x) * 1.5 - st.vx * 2.8;
    const steer = clamp(Math.atan(aDes / TUNE.g) / TUNE.maxLean, -1, 1);
    const brake = st.v > vt + 0.8 ? clamp((st.v - vt) / 4, 0.4, 1) : 0;
    return { steer, brake, raw: true };
  }
}

// Fast offline lap simulation (used for the pace-setter ghost + medal times).
export function simulateLap(track, startS, sampleHz = 20) {
  const ap = new Autopilot(track);
  const st = newState(startS);
  const dt = 1 / 120;
  const frames = [];
  let t = 0, next = 0;
  const end = track.length;
  while (st.s < end && t < 400) {
    const inp = ap.input(st);
    step(st, inp, track, dt);
    t += dt;
    if (t >= next) { frames.push([st.s, st.x, st.lean, st.v]); next += 1 / sampleHz; }
  }
  return { time: t, frames, hz: sampleHz, stats: { top: st.topSpeed, lean: st.maxLean } };
}
