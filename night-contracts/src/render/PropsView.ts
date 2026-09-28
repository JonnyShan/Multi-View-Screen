/**
 * Instanced street furniture and palms. One draw call per prop kind.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { City, Prop, PropKind } from '../world/CityGenerator';
import type { AssetPart, AssetRegistry } from './AssetRegistry';
import { globalUniforms, srgb, yawToThree } from './Shared';

function merged(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const clean = parts.map((p) => {
    const g = p.index ? p.toNonIndexed() : p;
    for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal') g.deleteAttribute(name);
    return g;
  });
  const m = mergeGeometries(clean, false)!;
  m.computeBoundingSphere();
  return m;
}

function boxAt(w: number, h: number, d: number, x: number, y: number, z: number): THREE.BufferGeometry {
  return new THREE.BoxGeometry(w, h, d).translate(x, y, z);
}

/** Unit-ish geometries with the long axis along +Z, base at y = 0. */
function geometryFor(kind: PropKind): THREE.BufferGeometry {
  switch (kind) {
    case 'bollard':
      return new THREE.CylinderGeometry(1, 1.1, 1, 8).translate(0, 0.5, 0);
    case 'bench':
      return merged([boxAt(4, 0.8, 12, 0, 3, 0), boxAt(0.8, 3.5, 12, -1.8, 5, 0), boxAt(3.4, 3, 0.8, 0, 1.5, -5), boxAt(3.4, 3, 0.8, 0, 1.5, 5)]);
    case 'bin':
      return new THREE.CylinderGeometry(1, 0.9, 1, 8).translate(0, 0.5, 0);
    case 'busstop':
      return merged([boxAt(9, 0.8, 26, 0, 19.5, 0), boxAt(0.6, 16, 24, -4, 10, 0), boxAt(0.8, 19, 0.8, 4, 9.5, 12), boxAt(0.8, 19, 0.8, 4, 9.5, -12), boxAt(3, 1, 18, -2.4, 4, 0)]);
    case 'barrier': {
      // jersey barrier profile extruded along z
      const s = new THREE.Shape();
      s.moveTo(-2.5, 0);
      s.lineTo(2.5, 0);
      s.lineTo(2.0, 1.6);
      s.lineTo(1.1, 7);
      s.lineTo(-1.1, 7);
      s.lineTo(-2.0, 1.6);
      s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: 15.6, bevelEnabled: false });
      g.translate(0, 0, -7.8);
      return merged([g]);
    }
    case 'fence': {
      const parts = [boxAt(0.5, 0.5, 16, 0, 8.5, 0), boxAt(0.5, 0.5, 16, 0, 1, 0)];
      for (let z = -7.5; z < 8; z += 2) parts.push(boxAt(0.35, 9, 0.35, 0, 4.5, z));
      for (let z = -7.5; z < 8; z += 2) parts.push(new THREE.ConeGeometry(0.4, 1.2, 4).translate(0, 9.6, z));
      return merged(parts);
    }
    case 'planter':
      return boxAt(1, 1, 1, 0, 0.5, 0);
    case 'fountain': {
      const ring = new THREE.CylinderGeometry(26, 27, 5, 20, 1, true).translate(0, 2.5, 0);
      const inner = new THREE.CylinderGeometry(23, 23, 3, 20).translate(0, 1.5, 0);
      const column = new THREE.CylinderGeometry(3, 4, 16, 10).translate(0, 8, 0);
      const bowl = new THREE.CylinderGeometry(9, 4, 3, 14).translate(0, 16, 0);
      return merged([ring, inner, column, bowl]);
    }
    case 'tree': {
      const trunk = new THREE.CylinderGeometry(0.06, 0.09, 0.45, 6).translate(0, 0.22, 0);
      const crown = new THREE.IcosahedronGeometry(0.5, 1).translate(0, 0.7, 0);
      return merged([trunk, crown]);
    }
    case 'kiosk':
      return merged([boxAt(1, 0.8, 1, 0, 0.4, 0), boxAt(1.25, 0.08, 1.25, 0, 0.9, 0)]);
    case 'boxcar':
      return merged([boxAt(1, 0.8, 1, 0, 0.5, 0), boxAt(0.9, 0.12, 0.98, 0, 0.96, 0), boxAt(0.7, 0.1, 0.9, 0, 0.05, 0)]);
    case 'container': {
      const parts = [boxAt(1, 1, 1, 0, 0.5, 0)];
      for (let z = -0.45; z <= 0.46; z += 0.1) parts.push(boxAt(1.02, 0.96, 0.02, 0, 0.5, z));
      return merged(parts);
    }
    case 'rail': {
      const parts = [boxAt(0.8, 1, 1, -3.5, 0.5, 0), boxAt(0.8, 1, 1, 3.5, 0.5, 0)];
      return merged(parts);
    }
  }
}

const materialColour: Partial<Record<PropKind, number>> = {
  bollard: 0x2a2b30,
  bench: 0x5a3c28,
  bin: 0x2b3a34,
  busstop: 0x2d3136,
  barrier: 0xbdb6a8,
  fence: 0x111214,
  fountain: 0xd8d0c0,
  rail: 0x6a6660,
};

/** Props that a handed-off GLB can replace (assets/models/props/<name>.glb). */
const GLB_PROPS: Partial<Record<PropKind, string>> = {
  bench: 'models/props/bench.glb',
  busstop: 'models/props/busstop.glb',
  barrier: 'models/props/barrier.glb',
  fence: 'models/props/fence.glb',
};

/** One instanced mesh per GLB part, all sharing the same instance matrices. */
export function instancedParts(parts: AssetPart[], matrices: THREE.Matrix4[], castShadow: boolean, name: string): THREE.InstancedMesh[] {
  return parts.map((part, i) => {
    const im = new THREE.InstancedMesh(part.geometry, part.material, matrices.length);
    matrices.forEach((m, k) => im.setMatrixAt(k, m));
    im.castShadow = castShadow;
    im.receiveShadow = true;
    im.computeBoundingSphere();
    im.name = `${name}-${i}`;
    return im;
  });
}

export class PropsView {
  readonly group = new THREE.Group();

  constructor(city: City, castShadow: boolean, assets?: AssetRegistry) {
    this.group.name = 'props';
    const byKind = new Map<PropKind, Prop[]>();
    for (const p of city.props) {
      let arr = byKind.get(p.kind);
      if (!arr) byKind.set(p.kind, (arr = []));
      arr.push(p);
    }
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const v = new THREE.Vector3();
    const yAxis = new THREE.Vector3(0, 1, 0);
    for (const [kind, list] of byKind) {
      const glb = GLB_PROPS[kind] ? assets?.parts(GLB_PROPS[kind]!) : null;
      if (glb) {
        const mats = list.map((p) => new THREE.Matrix4().compose(new THREE.Vector3(p.x, p.z, p.y), new THREE.Quaternion().setFromAxisAngle(yAxis, yawToThree(p.a)), new THREE.Vector3(1, 1, 1)));
        for (const im of instancedParts(glb, mats, castShadow, `props-${kind}`)) this.group.add(im);
        continue;
      }
      const geo = geometryFor(kind);
      const perInstanceColour = !materialColour[kind];
      const mat = new THREE.MeshStandardMaterial({
        color: perInstanceColour ? 0xffffff : srgb(materialColour[kind]!),
        roughness: kind === 'fence' || kind === 'rail' ? 0.45 : 0.8,
        metalness: kind === 'fence' || kind === 'rail' ? 0.6 : 0,
      });
      const mesh = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach((p, i) => {
        v.set(p.x, p.z, p.y);
        q.setFromAxisAngle(yAxis, yawToThree(p.a));
        switch (kind) {
          case 'bollard':
          case 'bin':
            s.set(p.l, p.h, p.w);
            break;
          case 'tree':
            s.set(p.l * 2, p.h, p.w * 2);
            break;
          case 'kiosk':
          case 'boxcar':
          case 'container':
          case 'planter':
            s.set(p.w, p.h, p.l);
            break;
          case 'rail':
            s.set(1, 1, p.l);
            break;
          default:
            s.set(1, 1, 1);
        }
        m.compose(v, q, s);
        mesh.setMatrixAt(i, m);
        if (perInstanceColour) mesh.setColorAt(i, srgb(p.color));
      });
      mesh.castShadow = castShadow && kind !== 'rail';
      mesh.receiveShadow = true;
      mesh.name = `props-${kind}`;
      mesh.computeBoundingSphere();
      this.group.add(mesh);
    }
    this.buildRailSleepers(city);
    this.group.add(new PalmsView(city, castShadow, assets?.parts('models/props/palm.glb') ?? null).group);
  }

  private buildRailSleepers(city: City): void {
    const rails = city.props.filter((p) => p.kind === 'rail');
    if (!rails.length) return;
    const geo = new THREE.BoxGeometry(12, 0.8, 2.4);
    const count = rails.reduce((n, r) => n + Math.floor(r.l / 7), 0);
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: srgb(0x3a2e24), roughness: 1 }), count);
    const m = new THREE.Matrix4();
    let i = 0;
    for (const r of rails) {
      const n = Math.floor(r.l / 7);
      for (let k = 0; k < n; k++) {
        const y = r.y - r.l / 2 + k * 7 + 3.5;
        m.makeTranslation(r.x, 0.4, y);
        mesh.setMatrixAt(i++, m);
      }
    }
    mesh.name = 'rail-sleepers';
    this.group.add(mesh);
  }
}

/** Instanced palms: tapered trunks and drooping fronds that sway in the wind. */
export class PalmsView {
  readonly group = new THREE.Group();

  constructor(city: City, castShadow: boolean, glb: AssetPart[] | null = null) {
    const palms = city.palms;
    if (glb) {
      // handed-off palm model, scaled to each palm's height
      const box = new THREE.Box3();
      for (const part of glb) {
        part.geometry.computeBoundingBox();
        box.union(part.geometry.boundingBox!);
      }
      const modelH = Math.max(1, box.max.y - box.min.y);
      const mats = palms.map((pl) => {
        const axis = new THREE.Vector3(Math.cos(pl.leanDir), 0, Math.sin(pl.leanDir));
        const k = pl.h / modelH;
        return new THREE.Matrix4().compose(new THREE.Vector3(pl.x, pl.z, pl.y), new THREE.Quaternion().setFromAxisAngle(axis, pl.lean), new THREE.Vector3(k, k, k));
      });
      for (const im of instancedParts(glb, mats, castShadow, 'palms')) this.group.add(im);
      return;
    }
    // trunk: unit height, ringed segments
    const trunk = new THREE.CylinderGeometry(1.1, 1.9, 1, 7, 8, false).translate(0, 0.5, 0);
    const pos = trunk.getAttribute('position');
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      // subtle rings: bulge every segment
      const ring = 1 + 0.08 * Math.cos(y * Math.PI * 16);
      pos.setX(i, pos.getX(i) * ring);
      pos.setZ(i, pos.getZ(i) * ring);
    }
    trunk.computeVertexNormals();
    const trunkMat = new THREE.MeshStandardMaterial({ color: srgb(0x6e5c48), roughness: 0.95 });
    const trunks = new THREE.InstancedMesh(trunk, trunkMat, palms.length);

    const frond = PalmsView.frondGeometry();
    const frondMat = new THREE.MeshStandardMaterial({ color: srgb(0x2f5a2c), roughness: 0.85, side: THREE.DoubleSide });
    frondMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = globalUniforms.uTime;
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;').replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
float nc_phase = instanceMatrix[3].x * 0.011 + instanceMatrix[3].z * 0.017;
float nc_r = length(position.xz);
float nc_w = sin(uTime * 1.6 + nc_phase + nc_r * 0.08) * 0.04 * nc_r;
transformed.y += nc_w;
transformed.x += cos(uTime * 1.1 + nc_phase) * 0.018 * nc_r;
`,
      );
    };
    frondMat.customProgramCacheKey = () => 'nc-frond';
    const fronds = new THREE.InstancedMesh(frond, frondMat, palms.length);

    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const tilt = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const top = new THREE.Vector3();
    const axis = new THREE.Vector3();
    const yAxis = new THREE.Vector3(0, 1, 0);
    palms.forEach((pl, i) => {
      axis.set(Math.cos(pl.leanDir), 0, Math.sin(pl.leanDir));
      tilt.setFromAxisAngle(axis, pl.lean);
      p.set(pl.x, pl.z, pl.y);
      s.set(1, pl.h, 1);
      m.compose(p, tilt, s);
      trunks.setMatrixAt(i, m);
      top.set(0, pl.h, 0).applyQuaternion(tilt).add(p);
      q.setFromAxisAngle(yAxis, (pl.seed % 628) / 100);
      const k = 0.85 + (pl.h / 100) * 0.25;
      s.set(k, k, k);
      m.compose(top, q, s);
      fronds.setMatrixAt(i, m);
    });
    trunks.castShadow = castShadow;
    fronds.castShadow = castShadow;
    trunks.receiveShadow = true;
    trunks.computeBoundingSphere();
    fronds.computeBoundingSphere();
    trunks.name = 'palm-trunks';
    fronds.name = 'palm-fronds';
    this.group.add(trunks, fronds);
  }

  static frondGeometry(): THREE.BufferGeometry {
    const leaves = 10;
    const segs = 5;
    const positions: number[] = [];
    const idx: number[] = [];
    for (let l = 0; l < leaves; l++) {
      const a = (l / leaves) * Math.PI * 2 + (l % 2) * 0.2;
      const len = 30 + (l % 3) * 4;
      const lift = l % 2 === 0 ? 0.35 : 0.1;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const base = positions.length / 3;
      for (let sgi = 0; sgi <= segs; sgi++) {
        const t = sgi / segs;
        const r = t * len;
        // arch up then droop
        const y = Math.sin(t * Math.PI * 0.9) * len * lift - t * t * len * 0.55;
        const w = Math.sin(t * Math.PI) * 4.2 + 0.4;
        // perpendicular in xz
        const px = -sa * w;
        const pz = ca * w;
        const cx = ca * r;
        const cz = sa * r;
        positions.push(cx + px, y - w * 0.25, cz + pz, cx - px, y - w * 0.25, cz - pz, cx, y + 0.3, cz);
      }
      for (let sgi = 0; sgi < segs; sgi++) {
        const i0 = base + sgi * 3;
        const i1 = i0 + 3;
        // left half and right half of the leaf (folded along the spine)
        idx.push(i0, i1, i0 + 2, i1, i1 + 2, i0 + 2);
        idx.push(i0 + 1, i0 + 2, i1 + 1, i1 + 1, i0 + 2, i1 + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
}
