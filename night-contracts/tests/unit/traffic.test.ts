import { beforeAll, describe, expect, it } from 'vitest';
import { cloneTuning } from '../../src/config/tuning';
import { dist } from '../../src/core/math';
import { emptyIntent } from '../../src/sim/Intent';
import { laneWaypoints } from '../../src/sim/Navigation';
import { initPhysics } from '../../src/sim/Physics';
import { Sim } from '../../src/sim/Sim';
import { generateCity } from '../../src/world/CityGenerator';

const t = cloneTuning();
const city = generateCity(t);

beforeAll(async () => {
  await initPhysics();
});

describe('Lane paths', () => {
  it('keeps to the left of the centreline and curves through turns', () => {
    const g = city.graph;
    const a = g.gridId(2, 2);
    const b = g.gridId(3, 2);
    const c = g.gridId(3, 3);
    const wps = laneWaypoints(g, a, b, c, 100, 50);
    // travelling east (+x): the visual left is -y in sim space
    const straight = wps.filter((w) => w.node < 0 && w.gate < 0);
    for (const w of straight) expect(w.y).toBeCloseTo(g.nodes[a].y - t.world.laneOffset, 3);
    const curve = wps.filter((w) => w.node === b);
    expect(curve.length).toBeGreaterThan(1);
    for (const w of curve) expect(w.speed).toBeLessThan(100);
  });
});

describe('Traffic', () => {
  it('drives a single car along its lane', () => {
    const tt = cloneTuning();
    tt.traffic.count = 1;
    tt.traffic.maxParked = 0;
    const sim = new Sim(tt, { city, pedScale: 0 });
    const car = sim.cars.find((c) => c.kind === 'civilian' && c.mode === 'traffic')!;
    const start = { x: car.x, y: car.y };
    const i = emptyIntent();
    let maxOff = 0;
    for (let k = 0; k < 60 * 20; k++) {
      sim.step(i);
      if (car.inIntersection < 0 && k > 60) {
        const e = sim.city.graph.nearestEdge(car.x, car.y);
        maxOff = Math.max(maxOff, Math.abs(e.dist - t.world.laneOffset));
      }
    }
    expect(dist(car.x, car.y, start.x, start.y)).toBeGreaterThan(300);
    expect(maxOff).toBeLessThan(20);
  });

  it('runs 10 minutes with no permanent jams and nothing inside buildings', () => {
    const sim = new Sim(t, { city, seed: t.world.seed });
    const i = emptyIntent();
    const insideBuilding = (x: number, y: number): boolean =>
      sim.city.colliders.some((c) => (c.kind === 'building' || c.kind === 'wall') && x > c.minX + 2 && x < c.maxX - 2 && y > c.minY + 2 && y < c.maxY - 2);
    const stoppedFor = new Map<number, number>();
    let inside = 0;
    let worstStop = 0;
    let longStops = 0;
    let speedSum = 0;
    let speedN = 0;
    const dt = sim.dt;
    for (let k = 0; k < 600 * t.sim.hz; k++) {
      sim.step(i);
      for (const car of sim.cars) {
        if (car.kind !== 'civilian' || car.mode !== 'traffic' || car.dead) continue;
        const s = (stoppedFor.get(car.id) ?? 0) + dt;
        const stopped = Math.abs(car.speed) < 3 ? s : 0;
        stoppedFor.set(car.id, stopped);
        worstStop = Math.max(worstStop, stopped);
        if (stopped > 30 && stopped <= 30 + dt) longStops++;
        if (k % 60 === 0) {
          if (insideBuilding(car.x, car.y)) inside++;
          speedSum += Math.abs(car.speed);
          speedN++;
        }
      }
    }
    const avg = speedSum / Math.max(1, speedN);
    console.log(`traffic: avg speed ${avg.toFixed(1)} u/s, longest stop ${worstStop.toFixed(1)} s, stops over 30 s ${longStops}, inside samples ${inside}`);
    expect(inside).toBe(0);
    // nobody sits still for more than 30 seconds (the ghost fallback kicks in after 10 s of trying)
    expect(longStops).toBe(0);
    expect(avg).toBeGreaterThan(40);
  });
});
