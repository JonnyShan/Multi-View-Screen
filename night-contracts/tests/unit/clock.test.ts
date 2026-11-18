import { beforeAll, describe, expect, it } from 'vitest';
import { cloneTuning } from '../../src/config/tuning';
import { emptyIntent } from '../../src/sim/Intent';
import { initPhysics } from '../../src/sim/Physics';
import { Sim } from '../../src/sim/Sim';
import { generateCity } from '../../src/world/CityGenerator';

const t = cloneTuning();
const city = generateCity(t);

beforeAll(async () => {
  await initPhysics();
});

/** Game hours that pass in `seconds` of play from `hour`. */
function hoursFrom(hour: number, seconds: number): number {
  const sim = new Sim(t, { city, bare: true, startHour: hour });
  for (let k = 0; k < seconds / sim.dt; k++) sim.step(emptyIntent());
  return sim.clock - hour;
}

describe('Clock', () => {
  it('runs full daylight faster, so most play is at night', () => {
    expect(hoursFrom(23, 10)).toBeCloseTo(10 / 60, 3);
    expect(hoursFrom(12, 10)).toBeCloseTo((10 / 60) * t.time.dayRate, 3);
  });
});
