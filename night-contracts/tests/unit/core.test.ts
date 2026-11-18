import { describe, expect, it } from 'vitest';
import { RNG, hash01 } from '../../src/core/RNG';
import { Loop } from '../../src/core/Loop';
import { SaveService, type KeyValueStore } from '../../src/core/SaveService';
import { angleDiff, obbContains, rayObb, wrapAngle } from '../../src/core/math';

describe('RNG', () => {
  it('is deterministic for a seed', () => {
    const a = new RNG(42);
    const b = new RNG(42);
    for (let i = 0; i < 100; i++) expect(a.float()).toBe(b.float());
  });
  it('differs between seeds and stays in range', () => {
    const a = new RNG(1);
    const b = new RNG(2);
    let same = 0;
    for (let i = 0; i < 100; i++) {
      const x = a.float();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      if (x === b.float()) same++;
    }
    expect(same).toBeLessThan(3);
  });
  it('int is inclusive', () => {
    const r = new RNG(9);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(r.int(0, 3));
    expect([...seen].sort()).toEqual([0, 1, 2, 3]);
  });
  it('hash01 is stable', () => {
    expect(hash01(1, 2, 3)).toBe(hash01(1, 2, 3));
    expect(hash01(1, 2, 3)).not.toBe(hash01(3, 2, 1));
  });
});

describe('Loop', () => {
  it('runs fixed steps and interpolates', () => {
    let steps = 0;
    let alpha = -1;
    const loop = new Loop(60, 10, { step: () => steps++, render: (a) => (alpha = a) });
    loop.tick(0.1);
    expect(steps).toBe(6);
    expect(alpha).toBeGreaterThanOrEqual(0);
    expect(alpha).toBeLessThan(1);
  });
  it('time scale slows the sim', () => {
    let steps = 0;
    const loop = new Loop(60, 10, { step: () => steps++, render: () => {} });
    loop.timeScale = 0.3;
    for (let i = 0; i < 10; i++) loop.tick(0.1);
    expect(steps).toBe(18);
  });
});

describe('SaveService', () => {
  const mem = (): KeyValueStore => {
    const m = new Map<string, string>();
    return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
  };
  it('round trips and fills defaults', () => {
    const s = new SaveService(mem());
    const d = s.load();
    d.cash = 777;
    d.settings.haptics = false;
    expect(s.save(d)).toBe(true);
    const back = s.load();
    expect(back.cash).toBe(777);
    expect(back.settings.haptics).toBe(false);
    expect(back.settings.quality).toBe('auto');
  });
  it('survives broken storage', () => {
    const broken: KeyValueStore = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
      removeItem: () => {
        throw new Error('denied');
      },
    };
    const s = new SaveService(broken);
    expect(s.load().cash).toBe(2500);
    expect(s.save(s.load())).toBe(false);
    expect(() => s.reset()).not.toThrow();
  });
});

describe('math', () => {
  it('wraps angles', () => {
    expect(wrapAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
    expect(angleDiff(Math.PI - 0.1, -Math.PI + 0.1)).toBeCloseTo(0.2);
  });
  it('tests oriented boxes', () => {
    const b = { x: 10, y: 0, a: Math.PI / 2, hl: 20, hw: 5 };
    expect(obbContains(b, 10, 15)).toBe(true);
    expect(obbContains(b, 20, 0)).toBe(false);
    expect(rayObb(0, 0, 1, 0, b, 100)).toBeCloseTo(5);
  });
});
