/**
 * Contract state machine:
 *   ringing -> briefed (countdown) -> arriving -> meeting -> moving -> success | failed
 * The target spawns two blocks out and drives in, parks for the meeting, then
 * runs for its destination. Getting close or attacking alerts it; escorts
 * switch to hunting the player.
 */
import type { KillMethod, Tuning } from '../config/tuning';
import { dist } from '../core/math';
import { placeByName } from '../world/CityGenerator';
import type { Car } from './Car';
import { huntPlayer } from './EscortAI';
import type { Intent } from './Intent';
import { routeWaypoints } from './Navigation';
import { loopScale, METHOD_NAMES, payout, type Payout, formatCash } from './Scoring';
import type { Sim } from './Sim';
import { driveRoute, routeTo } from './TargetAI';

export type ContractState = 'idle' | 'ringing' | 'briefed' | 'arriving' | 'meeting' | 'moving' | 'success' | 'failed';
export type ContractDef = Tuning['contracts']['list'][number];

export class Contracts {
  state: ContractState = 'idle';
  timer: number;
  countdown = 0;
  meetT = 0;
  target: Car | null = null;
  escorts: Car[] = [];
  alerted = false;
  civilians = 0;
  lastResult: Payout | null = null;
  failReason = '';
  meetNode = -1;
  prevNode = -1;
  destNode = -1;
  spawnNode = -1;
  parkX = 0;
  parkY = 0;
  private driveEstimate = 0;
  private ringT = 0;
  private approach: number[] = [];

  constructor(
    private readonly sim: Sim,
    public index: number,
    public loop: number,
    public enabled: boolean,
  ) {
    this.timer = sim.t.contracts.firstRingDelay;
  }

  get def(): ContractDef {
    return this.sim.t.contracts.list[this.index % this.sim.t.contracts.list.length];
  }

  get scale(): number {
    return loopScale(this.sim.t, this.loop);
  }

  get fee(): number {
    return Math.round(this.def.fee * this.scale);
  }

  get active(): boolean {
    return this.state === 'briefed' || this.state === 'arriving' || this.state === 'meeting' || this.state === 'moving';
  }

  /** World position of the current objective, for arrows and the minimap. */
  objective(): { x: number; y: number; kind: 'pickup' | 'target' | 'destination' } | null {
    const g = this.sim.city.graph;
    if (this.state === 'briefed') return { x: this.parkX, y: this.parkY, kind: 'pickup' };
    if (this.target && (this.state === 'arriving' || this.state === 'meeting' || this.state === 'moving')) return { x: this.target.x, y: this.target.y, kind: 'target' };
    void g;
    return null;
  }

  destination(): { x: number; y: number } | null {
    if (!this.active || this.destNode < 0) return null;
    const n = this.sim.city.graph.nodes[this.destNode];
    return { x: n.x, y: n.y };
  }

  answer(): void {
    if (this.state !== 'ringing') return;
    const sim = this.sim;
    const t = sim.t.contracts;
    const g = sim.city.graph;
    const d = this.def;
    this.meetNode = placeByName(sim.city, d.from).node;
    this.destNode = placeByName(sim.city, d.to).node;
    // spawn two blocks out, preferring the side away from the player
    const hops = g.hops(this.meetNode);
    let best = -1;
    let bestScore = -Infinity;
    for (let i = 0; i < g.nodes.length; i++) {
      if (hops[i] !== t.spawnBlocksOut || i === this.destNode) continue;
      const n = g.nodes[i];
      const score = dist(n.x, n.y, sim.player.x, sim.player.y) + sim.rng.float() * 200;
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    }
    this.spawnNode = best >= 0 ? best : g.neighbours(this.meetNode)[0];
    this.approach = g.path(this.spawnNode, this.meetNode);
    this.prevNode = this.approach[this.approach.length - 2];
    const e = g.edgeBetween(this.prevNode, this.meetNode)!;
    const park = g.lanePoint(e, this.prevNode, e.length - g.half - 70, sim.t.traffic.parkOffset);
    this.parkX = park.x;
    this.parkY = park.y;
    let len = 0;
    for (let i = 0; i + 1 < this.approach.length; i++) len += g.edgeBetween(this.approach[i], this.approach[i + 1])!.length;
    this.driveEstimate = len / t.arriveSpeed + 4;
    this.countdown = d.eta;
    this.alerted = false;
    this.civilians = 0;
    this.state = 'briefed';
    sim.emit({ type: 'phoneAnswer' });
    sim.emit({ type: 'contractBrief', index: this.index });
  }

  update(intent: Intent, dt: number): void {
    if (!this.enabled) return;
    const sim = this.sim;
    const t = sim.t.contracts;
    switch (this.state) {
      case 'idle':
        this.timer -= dt;
        if (this.timer <= 0) {
          this.state = 'ringing';
          this.ringT = 0;
        }
        break;
      case 'ringing':
        this.ringT -= dt;
        if (this.ringT <= 0) {
          sim.emit({ type: 'phoneRing' });
          this.ringT = t.ringAutoRepeat;
        }
        if (intent.answer) this.answer();
        break;
      case 'briefed':
        this.countdown -= dt;
        if (this.countdown <= this.driveEstimate) this.spawnTarget();
        break;
      case 'arriving':
      case 'meeting':
      case 'moving':
        this.countdown = Math.max(0, this.countdown - dt);
        this.drive(dt);
        break;
      case 'success':
      case 'failed':
        this.timer -= dt;
        if (this.timer <= 0) {
          this.state = 'ringing';
          this.ringT = 0;
        }
        break;
    }
  }

  private spawnTarget(): void {
    const sim = this.sim;
    const g = sim.city.graph;
    const d = this.def;
    const t = sim.t;
    const e = g.edgeBetween(this.approach[0], this.approach[1])!;
    const gap = t.escort.followGap;
    const s0 = Math.min(e.length - g.half - 20, g.half + 30 + d.escorts * gap);
    const p = g.lanePoint(e, this.approach[0], s0);
    const hp = Math.round(d.hp * this.scale);
    const car = sim.spawnCar('target', d.model, d.color, p.x, p.y, p.a, hp);
    car.mode = 'route';
    this.target = car;
    this.setApproachRoute(car, 0);
    this.escorts = [];
    for (let k = 0; k < d.escorts; k++) {
      const q = g.lanePoint(e, this.approach[0], Math.max(g.half + 5, s0 - (k + 1) * gap));
      const esc = sim.spawnCar('escort', 'suv', 0x16171a, q.x, q.y, q.a, Math.round(t.car.specs.suv.hp * this.scale));
      esc.mode = 'route';
      esc.shoots = d.escortShoot;
      esc.rams = d.escortRam && k === 0;
      esc.followId = car.id;
      this.setApproachRoute(esc, (k + 1) * gap);
      this.escorts.push(esc);
    }
    this.state = 'arriving';
    sim.emit({ type: 'targetSpawned' });
  }

  private setApproachRoute(car: Car, trimBack: number): void {
    const sim = this.sim;
    const g = sim.city.graph;
    const t = sim.t;
    const wps = routeWaypoints(g, this.approach, t.contracts.arriveSpeed, t.traffic.turnSpeed);
    // the last leg ends at the kerb park point
    wps.pop();
    const e = g.edgeBetween(this.prevNode, this.meetNode)!;
    const end = g.lanePoint(e, this.prevNode, e.length - g.half - 70 - trimBack, t.traffic.parkOffset);
    wps.push({ x: end.x, y: end.y, speed: 30, node: -1, gate: -1, turn: 0 });
    car.waypoints = wps;
    car.wpIndex = 0;
  }

  private drive(dt: number): void {
    const sim = this.sim;
    const t = sim.t;
    const car = this.target;
    if (!car) return;
    const pl = sim.player;
    // alert when the player gets close
    if (!this.alerted && pl.mode !== 'dead' && dist(car.x, car.y, pl.x, pl.y) < t.contracts.alertRadius) this.alert();

    if (this.state === 'arriving') {
      const done = driveRoute(sim, car, dt, { speedMul: 1, urgent: false, stopAtEnd: true });
      if (done || (car.wpIndex >= car.waypoints.length - 1 && Math.abs(car.speed) < 3 && dist(car.x, car.y, this.parkX, this.parkY) < 40)) {
        this.state = 'meeting';
        this.meetT = t.contracts.meetingTime;
        car.mode = 'idle';
        sim.emit({ type: 'toast', text: 'TARGET PARKED', tone: 'bone', sub: `Meeting at ${this.def.from}` });
      }
    } else if (this.state === 'meeting') {
      car.targetSpeed = 0;
      car.steer = 0;
      this.meetT -= dt;
      if (this.meetT <= 0) this.startMoving();
    } else if (this.state === 'moving') {
      const done = driveRoute(sim, car, dt, { speedMul: this.alerted ? t.contracts.fleeSpeedMul : 1, urgent: this.alerted, stopAtEnd: false });
      const dn = sim.city.graph.nodes[this.destNode];
      if ((done || dist(car.x, car.y, dn.x, dn.y) < t.contracts.reachRadius) && !car.dead) this.fail('Target escaped');
      else if (done) routeTo(sim, car, this.destNode, t.traffic.cruiseSpeed);
    }

    for (const esc of this.escorts) {
      if (esc.dead) continue;
      if (esc.mode === 'hunt') {
        huntPlayer(sim, esc, dt, { rams: esc.rams, shoots: esc.shoots, spread: t.escort.spread, speedMul: 1 });
      } else if (this.state === 'meeting') {
        driveRoute(sim, esc, dt, { speedMul: 1, urgent: false, stopAtEnd: true });
      } else if (this.state === 'moving' && esc.mode === 'follow') {
        driveRoute(sim, esc, dt, { speedMul: 1.05, urgent: false, stopAtEnd: false });
      } else {
        driveRoute(sim, esc, dt, { speedMul: 1, urgent: false, stopAtEnd: true });
      }
    }
  }

  private startMoving(): void {
    const sim = this.sim;
    const car = this.target;
    if (!car) return;
    this.state = 'moving';
    car.mode = this.alerted ? 'flee' : 'route';
    routeTo(sim, car, this.destNode, this.alerted ? sim.t.traffic.cruiseSpeed * 1.5 : sim.t.traffic.cruiseSpeed);
    for (const esc of this.escorts) {
      if (esc.dead || esc.mode === 'hunt') continue;
      esc.mode = 'follow';
      routeTo(sim, esc, this.destNode, sim.t.traffic.cruiseSpeed);
    }
    if (!this.alerted) sim.emit({ type: 'toast', text: 'TARGET MOVING', tone: 'bone', sub: `Heading to ${this.def.to}` });
  }

  alert(): void {
    if (this.alerted || !this.target) return;
    const sim = this.sim;
    this.alerted = true;
    sim.emit({ type: 'targetAlerted' });
    sim.emit({ type: 'toast', text: 'SPOTTED', tone: 'red', sub: 'Target is running' });
    for (const esc of this.escorts) if (!esc.dead) esc.mode = 'hunt';
    if (this.state === 'arriving' || this.state === 'meeting') this.startMoving();
    else {
      this.target.mode = 'flee';
      routeTo(sim, this.target, this.destNode, sim.t.traffic.cruiseSpeed * 1.5);
    }
  }

  onGunfire(x: number, y: number): void {
    if (!this.target || this.alerted) return;
    if (dist(x, y, this.target.x, this.target.y) < this.sim.t.contracts.gunfireAlertRadius) this.alert();
  }

  onCarAttacked(car: Car): void {
    if (!this.target || this.alerted) return;
    if (car === this.target || this.escorts.includes(car)) this.alert();
  }

  onCarKilled(car: Car, byPlayer: boolean): void {
    const sim = this.sim;
    if (car.kind === 'civilian' && byPlayer && this.active) this.civilians++;
    if (car !== this.target || !this.active) return;
    const method: KillMethod = car.lastMethod ?? 'crash';
    const h = sim.t.heat;
    sim.heat.add(method === 'gun' ? h.killLoud : method === 'crash' ? h.killCrash : h.killQuiet, car.x, car.y);
    const p = payout(sim.t, this.fee, method, this.civilians);
    this.lastResult = p;
    sim.player.cash += p.total;
    this.state = 'success';
    this.timer = sim.t.contracts.nextDelay;
    sim.emit({ type: 'targetDown', method, payout: p.total });
    const sub = `${METHOD_NAMES[method]} x${p.multiplier.toFixed(1)}  +${formatCash(p.total)}${p.penalty ? `  (civilians -${formatCash(p.penalty)})` : ''}`;
    sim.emit({ type: 'toast', text: 'TARGET DOWN', tone: 'green', sub });
    this.releaseEscorts();
    this.target = null;
    this.index++;
    if (this.index % sim.t.contracts.list.length === 0) this.loop++;
  }

  onPlayerDied(): void {
    if (this.active) this.fail('You died');
  }

  fail(reason: string): void {
    const sim = this.sim;
    this.failReason = reason;
    this.state = 'failed';
    this.timer = sim.t.contracts.retryDelay;
    sim.emit({ type: 'contractFailed', reason });
    sim.emit({ type: 'toast', text: 'CONTRACT FAILED', tone: 'red', sub: reason });
    if (this.target && !this.target.dead) {
      this.target.kind = 'civilian';
      this.target.mode = 'exit';
      this.target.panicT = 0;
    }
    this.target = null;
    this.releaseEscorts();
  }

  private releaseEscorts(): void {
    for (const esc of this.escorts) {
      if (esc.dead) continue;
      esc.kind = 'civilian';
      esc.mode = 'exit';
      esc.shoots = false;
    }
    this.escorts = [];
  }
}
