import { describe, expect, it } from 'vitest';
import { cloneTuning } from '../../src/config/tuning';
import { generateCity } from '../../src/world/CityGenerator';

describe('CityGenerator', () => {
  const t = cloneTuning();
  it('is identical for the same seed', () => {
    const a = generateCity(t, 123);
    const b = generateCity(t, 123);
    expect(JSON.stringify(a.buildings)).toBe(JSON.stringify(b.buildings));
    expect(JSON.stringify(a.palms)).toBe(JSON.stringify(b.palms));
    expect(JSON.stringify(a.colliders)).toBe(JSON.stringify(b.colliders));
  });
  it('differs for a different seed', () => {
    const a = generateCity(t, 1);
    const b = generateCity(t, 2);
    expect(JSON.stringify(a.buildings)).not.toBe(JSON.stringify(b.buildings));
  });
  it('has the named places and an 8x8 grid', () => {
    const c = generateCity(t);
    expect(c.blocks.filter((b) => b.bj >= 0)).toHaveLength(64);
    for (const name of ['Safehouse', 'Casino Strip', 'Harbour Docks', 'Old Temple', 'Neon Market', 'Rail Yard', 'Skyline Tower']) {
      expect(c.places.some((p) => p.name === name)).toBe(true);
    }
  });
  it('keeps every lane point on the road clear of colliders', () => {
    const c = generateCity(t);
    const g = c.graph;
    for (const e of g.edges) {
      for (const from of [e.a, e.b]) {
        for (let s = 0; s <= e.length; s += 16) {
          const p = g.lanePoint(e, from, s);
          expect(c.index.pointBlocked(p.x, p.y, 8)).toBe(-1);
        }
      }
    }
  });
  it('raises the boulevard and ramps', () => {
    const c = generateCity(t);
    expect(c.heightAt(1000, c.boulevardY)).toBe(t.world.boulevardElevation);
    expect(c.heightAt(1000, 1000)).toBe(0);
    const mid = c.heightAt(0, (c.boulevardY - 0) / 2);
    expect(mid).toBeGreaterThan(5);
    expect(mid).toBeLessThan(t.world.boulevardElevation);
  });
  it('puts building colliders on every building and none on roads', () => {
    const c = generateCity(t);
    expect(c.colliders.filter((k) => k.kind === 'building')).toHaveLength(c.buildings.length);
    // intersections are clear
    for (const n of c.graph.nodes) expect(c.index.pointBlocked(n.x, n.y, 30)).toBe(-1);
  });
});
