import { beforeAll, describe, expect, it } from 'vitest';
import { cloneTuning, type Tuning } from '../../src/config/tuning';
import type { Car } from '../../src/sim/Car';
import { emptyIntent, type Intent } from '../../src/sim/Intent';
import { initPhysics } from '../../src/sim/Physics';
import { Sim } from '../../src/sim/Sim';
import { generateCity } from '../../src/world/CityGenerator';

const base = cloneTuning();
const city = generateCity(base);

beforeAll(async () => {
  await initPhysics();
});

function bare(t: Tuning = base): Sim {
  return new Sim(t, { city, bare: true });
}

function run(sim: Sim, ticks: number, intent: Intent = emptyIntent(), each?: (k: number) => void): void {
  for (let k = 0; k < ticks; k++) {
    sim.step(intent);
    each?.(k);
  }
}

function drive(car: Car, speed: number): void {
  car.targetSpeed = speed;
  car.body.setLinvel({ x: Math.cos(car.a) * speed, y: Math.sin(car.a) * speed, z: 0 }, true);
  car.readBody();
  car.mode = 'idle';
}

function setBike(sim: Sim, x: number, y: number, a: number, speed: number): void {
  sim.bike.place(x, y, sim.city.heightAt(x, y), a);
  sim.bike.speed = speed;
  sim.bikeBody.setTranslation({ x, y, z: 0 }, true);
  sim.player.x = x;
  sim.player.y = y;
}

describe('Machine gun', () => {
  it('damages the car ahead with aim assist, empties the magazine and reloads', () => {
    const sim = bare();
    const car = sim.spawnCar('target', 'sedan', 0x111111, 538, 470, Math.PI / 2, 120);
    const i = emptyIntent();
    i.fire = true;
    let shots = 0;
    let reloads = 0;
    run(sim, 60 * 5, i, () => {
      shots += sim.events.filter((e) => e.type === 'shot').length;
      reloads += sim.events.filter((e) => e.type === 'reload').length;
    });
    expect(car.hp).toBeLessThan(120);
    expect(shots).toBeGreaterThan(base.gun.magazine);
    expect(reloads).toBeGreaterThanOrEqual(1);
  });

  it('can blow tyres when rounds hit the wheels', () => {
    const t = cloneTuning();
    t.gun.tyreBlowChance = 1;
    t.gun.spread = 0;
    const sim = bare(t);
    // side on to the player, so rounds aimed at the front wheel hit it
    const car = sim.spawnCar('civilian', 'sedan', 0xffffff, 538, 470, 0, 999);
    car.mode = 'idle';
    const wheel = sim.combat.wheelLocal(car, 1);
    const i = emptyIntent();
    i.fire = true;
    i.hasAim = true;
    i.aimX = car.x + wheel.x;
    i.aimY = car.y + wheel.y;
    run(sim, 30, i);
    expect(car.blownCount).toBeGreaterThan(0);
  });
});

describe('Katana', () => {
  it('cuts a wheel on a moving car, it spins, hits a wall and dies as a crash kill', () => {
    const sim = bare();
    // find a building face along a north-south road and aim a car at it
    const b = sim.city.buildings.find((bd) => bd.minX > 600 && bd.minY > 100 && bd.maxY - bd.minY > 150 && bd.height > 60)!;
    const roadX = Math.floor(b.minX / sim.city.pitch) * sim.city.pitch;
    const y = (b.minY + b.maxY) / 2;
    const car = sim.spawnCar('target', 'sedan', 0x111111, roadX - 20, y, 0, 100);
    drive(car, 150);
    car.targetSpeed = 150;
    setBike(sim, roadX - 20, y + 16, 0, 150);
    let cut = false;
    let slowmo = false;
    const i = emptyIntent();
    i.throttle = 0.3;
    i.slash = true;
    run(sim, 1, i);
    i.slash = false;
    cut = car.spinT > 0 && car.blownCount > 0;
    slowmo = sim.events.some((e) => e.type === 'wheelCut' && e.spin);
    expect(cut).toBe(true);
    expect(slowmo).toBe(true);
    run(sim, 60 * 3, emptyIntent());
    expect(car.dead).toBe(true);
    expect(car.lastMethod).toBe('crash');
  });

  it('makes a parked car limp away', () => {
    const sim = bare();
    const car = sim.spawnCar('civilian', 'hatch', 0xffffff, 538, 350, Math.PI / 2);
    car.mode = 'parked';
    setBike(sim, 520, 350, Math.PI / 2, 0);
    const i = emptyIntent();
    i.slash = true;
    run(sim, 1, i);
    expect(car.limp).toBe(true);
    expect(car.mode).toBe('exit');
  });
});

describe('Explosions', () => {
  it('explode at zero HP and chain into a damaged neighbour', () => {
    const sim = bare();
    const a = sim.spawnCar('civilian', 'sedan', 0xffffff, 700, 26, 0, 100);
    const b = sim.spawnCar('civilian', 'sedan', 0xffffff, 745, 26, 0, 20);
    a.mode = b.mode = 'idle';
    sim.damageCar(a, 200, 'player', 'gun');
    let explosions = 0;
    run(sim, 90, emptyIntent(), () => (explosions += sim.events.filter((e) => e.type === 'explosion').length));
    expect(a.dead).toBe(true);
    expect(b.dead).toBe(true);
    expect(explosions).toBe(2);
  });
});

describe('Car versus player danger', () => {
  const ram = (speed: number): Sim => {
    const sim = bare();
    setBike(sim, 538, 322, Math.PI / 2, 0);
    const car = sim.spawnCar('escort', 'sedan', 0x111111, 538, 322 - 60, Math.PI / 2, 999);
    drive(car, speed);
    car.targetSpeed = speed;
    run(sim, 90, emptyIntent());
    return sim;
  };
  it('a light touch only pushes', () => {
    const sim = ram(40);
    expect(sim.player.health).toBe(base.player.maxHealth);
    expect(sim.player.mode).toBe('riding');
  });
  it('a medium hit knocks you off and hurts', () => {
    const sim = ram(140);
    expect(sim.player.mode === 'air' || sim.player.mode === 'down' || sim.player.mode === 'foot').toBe(true);
    expect(sim.player.health).toBeLessThan(base.player.maxHealth);
    expect(sim.player.health).toBeGreaterThan(0);
  });
  it('a heavy hit kills outright', () => {
    const sim = ram(300);
    expect(sim.player.mode).toBe('dead');
  });
});

describe('On foot', () => {
  it('steps off slowly, walks, and remounts in range', () => {
    const sim = bare();
    const i = emptyIntent();
    i.interact = true;
    run(sim, 1, i);
    expect(sim.player.mode).toBe('foot');
    expect(sim.bike.parked).toBe(true);
    const walk = emptyIntent();
    walk.moveX = 1;
    run(sim, 20, walk);
    expect(Math.hypot(sim.player.vx, sim.player.vy)).toBeGreaterThan(20);
    run(sim, 30, emptyIntent());
    const again = emptyIntent();
    again.interact = true;
    run(sim, 1, again);
    expect(sim.player.mode).toBe('riding');
  });
});

describe('Leap and roof strike', () => {
  const setup = (): { sim: Sim; car: Car } => {
    const sim = bare();
    const car = sim.spawnCar('target', 'sedan', 0x111111, 538, 560, Math.PI / 2, 999);
    drive(car, 120);
    setBike(sim, 538, 470, Math.PI / 2, 260);
    const i = emptyIntent();
    i.jump = true;
    i.throttle = 1;
    run(sim, 1, i);
    return { sim, car };
  };
  it('lands on the roof and a strike kills the car instantly', () => {
    const { sim, car } = setup();
    expect(sim.player.mode).toBe('air');
    let landed = false;
    run(sim, 90, emptyIntent(), () => {
      if (sim.player.mode === 'roof') landed = true;
    });
    expect(landed).toBe(true);
    expect(sim.player.mode).toBe('roof');
    const s = emptyIntent();
    s.slash = true;
    run(sim, 1, s);
    expect(car.dead).toBe(true);
    expect(car.lastMethod).toBe('roof');
  });
  it('throws you off with damage if you are too slow', () => {
    const { sim } = setup();
    run(sim, 90, emptyIntent());
    expect(sim.player.mode).toBe('roof');
    run(sim, 60 * 3, emptyIntent());
    expect(sim.player.mode).not.toBe('roof');
    expect(sim.player.health).toBeLessThan(base.player.maxHealth);
  });
});

describe('Death and respawn', () => {
  it('respawns at the safehouse with full health and a medical bill', () => {
    const sim = new Sim(base, { city, bare: true, cash: 5000 });
    setBike(sim, 1500, 26, 0, 0);
    run(sim, 2);
    sim.hurtPlayer(500);
    expect(sim.player.mode).toBe('dead');
    run(sim, Math.ceil(base.player.deathTime * 60) + 2);
    expect(sim.player.mode).toBe('riding');
    expect(sim.player.health).toBe(base.player.maxHealth);
    expect(sim.player.cash).toBe(5000 - base.player.respawnCashPenalty);
    const sp = sim.spawnPoint();
    expect(Math.hypot(sim.bike.x - sp.x, sim.bike.y - sp.y)).toBeLessThan(5);
  });
});
