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
  it('hangs neon blades over the shopfronts without moving anything else', () => {
    const c = generateCity(t);
    const bare = cloneTuning();
    bare.world.blades.share = 0;
    const d = generateCity(bare);
    for (const k of ['buildings', 'palms', 'colliders', 'lamps', 'props', 'parking'] as const) expect(JSON.stringify(d[k])).toBe(JSON.stringify(c[k]));
    const flat = c.neon.filter((n) => !n.blade);
    expect(JSON.stringify(d.neon.filter((n) => !n.blade))).toBe(JSON.stringify(flat));
    const blades = c.neon.filter((n) => n.blade);
    expect(blades.length).toBeGreaterThan(70);
    expect(blades.length).toBeLessThan(140);
    const bl = t.world.blades;
    for (const n of blades) {
      expect(n.z - n.h / 2).toBeGreaterThanOrEqual(bl.base);
      // clear of lamp posts and palm trunks
      for (const l of c.lamps) expect(Math.hypot(l.x - n.x, l.y - n.y)).toBeGreaterThan(bl.lampGap - 2);
      for (const p of c.palms) expect(Math.hypot(p.x - n.x, p.y - n.y)).toBeGreaterThan(bl.palmGap - 2);
    }
  });
  it('puts building colliders on every building and none on roads', () => {
    const c = generateCity(t);
    expect(c.colliders.filter((k) => k.kind === 'building')).toHaveLength(c.buildings.length);
    // intersections are clear
    for (const n of c.graph.nodes) expect(c.index.pointBlocked(n.x, n.y, 30)).toBe(-1);
  });
});
