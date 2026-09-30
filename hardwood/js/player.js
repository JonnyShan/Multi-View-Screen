// Procedural athlete: articulated rig built from smooth primitives, team kit
// with printed name/number, procedural gait + actions and 2-bone arm IK.
// Local frame: character faces +z, left side is +x.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfCache = new Map();
export function loadModel(url) {
  if (!gltfCache.has(url)) gltfCache.set(url, fetchModel(url));
  return gltfCache.get(url);
}

// Models ship as glTF JSON with the geometry buffer inlined as base64. Strict
// hosts (CSP connect-src 'self') refuse to fetch data: URIs, so decode the
// buffer here and hand GLTFLoader an in-memory GLB instead.
async function fetchModel(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`model ${url}: HTTP ${res.status}`);
  const json = await res.json();
  const buf = json.buffers && json.buffers[0];
  const base = url.slice(0, url.lastIndexOf('/') + 1);
  const loader = new GLTFLoader();
  if (!buf || !buf.uri || !buf.uri.startsWith('data:')) return loader.parseAsync(JSON.stringify(json), base);
  const b64 = buf.uri.slice(buf.uri.indexOf(',') + 1);
  const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  delete buf.uri;
  buf.byteLength = bin.length;
  const enc = new TextEncoder().encode(JSON.stringify(json));
  const jsonLen = (enc.length + 3) & ~3, binLen = (bin.length + 3) & ~3;
  const glb = new Uint8Array(12 + 8 + jsonLen + 8 + binLen);
  const dv = new DataView(glb.buffer);
  dv.setUint32(0, 0x46546c67, true); dv.setUint32(4, 2, true); dv.setUint32(8, glb.length, true);
  dv.setUint32(12, jsonLen, true); dv.setUint32(16, 0x4e4f534a, true);
  glb.set(enc, 20);
  glb.fill(0x20, 20 + enc.length, 20 + jsonLen);
  dv.setUint32(20 + jsonLen, binLen, true); dv.setUint32(24 + jsonLen, 0x004e4942, true);
  glb.set(bin, 28 + jsonLen);
  return loader.parseAsync(glb.buffer, base);
}

const _m = new THREE.Matrix4();
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _v4 = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _xb = new THREE.Vector3(), _yb = new THREE.Vector3(), _zb = new THREE.Vector3();

const smooth = (a, b, k) => a + (b - a) * k;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const ss = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

function jerseyTexture(team, player, away) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  const base = away ? '#f3f4f6' : team.jersey;
  const letters = away ? team.primary : team.letters;
  const trim = away ? team.secondary : team.letters;
  g.fillStyle = base;
  g.fillRect(0, 0, 1024, 512);
  // subtle mesh-fabric noise
  const img = g.getImageData(0, 0, 1024, 512);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 10;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  // hem + collar trim
  g.fillStyle = trim;
  g.fillRect(0, 0, 1024, 16);
  g.fillRect(0, 500, 1024, 12);
  const font = (px, w = 800) => `${w} ${px}px "Saira Extra Condensed", "Arial Narrow", sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const stroke = away ? team.secondary : (team.secondary === team.letters ? '#ffffff' : team.secondary);
  // front: wordmark + number (u = 0.25)
  g.font = font(64);
  g.lineWidth = 6; g.strokeStyle = stroke;
  g.fillStyle = letters;
  g.save(); g.translate(256, 150); g.scale(1, 1.15);
  g.strokeText(team.name.toUpperCase(), 0, 0); g.fillText(team.name.toUpperCase(), 0, 0); g.restore();
  g.font = font(150, 800);
  g.lineWidth = 8;
  g.strokeText(String(player.num), 256, 270); g.fillText(String(player.num), 256, 270);
  // back: name + big number (u = 0.75)
  g.font = font(54);
  g.lineWidth = 5;
  g.strokeText(player.last.toUpperCase(), 768, 110); g.fillText(player.last.toUpperCase(), 768, 110);
  g.font = font(210, 800);
  g.lineWidth = 9;
  g.strokeText(String(player.num), 768, 265); g.fillText(String(player.num), 768, 265);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function shortsTexture(team, away) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = away ? '#f3f4f6' : team.jersey;
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = away ? team.primary : team.letters;
  // side stripes at u = 0.25 / 0.75
  g.fillRect(64 - 7, 0, 14, 128);
  g.fillRect(192 - 7, 0, 14, 128);
  g.fillRect(0, 120, 256, 8);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class Player {
  constructor(team, { away = false } = {}) {
    this.team = team;
    this.info = team.player;
    this.away = away;
    const s = this.s = this.info.height / 2.0;
    this.L = {
      thigh: 0.485 * s, shin: 0.485 * s, footH: 0.075 * s,
      upper: 0.355 * s, fore: 0.32 * s, hand: 0.1 * s,
      hipW: 0.1 * s, spine: 0.33 * s, shY: 0.265 * s, shX: 0.205 * s, neck: 0.29 * s,
    };
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.jumpY = 0;
    this.phase = 0;
    this.slidePhase = 0;
    this.stance = 'offense';           // 'offense' | 'defense'
    this.action = null;                // { type, t, ... }
    this.dribble = { phase: 0, hand: -1, crossing: false, from: -1, active: false, bounced: false };
    this.ikTarget = [null, null];      // [left, right] world targets
    this.ikW = [0, 0];
    this.lookAt = new THREE.Vector3(0, 1.5, 0);
    this.j = {                          // smoothed joint angles
      spineX: 0.05, spineY: 0, spineZ: 0,
      hipLX: 0, hipLZ: 0.05, kneeL: 0.2, hipRX: 0, hipRZ: -0.05, kneeR: 0.2, ankleL: 0, ankleR: 0,
      shLX: 0, shLZ: 0.12, elbowL: -0.3, shRX: 0, shRZ: -0.12, elbowR: -0.3,
      neckX: 0, neckY: 0,
    };
    this.build();
  }

  build() {
    const s = this.s, L = this.L, team = this.team, info = this.info;
    const skin = new THREE.MeshPhysicalMaterial({ color: info.skin, roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.45, sheen: 0.15, sheenColor: new THREE.Color('#ffd9c0'), envMapIntensity: 0.35 });
    const jerseyMat = new THREE.MeshPhysicalMaterial({ map: jerseyTexture(team, info, this.away), roughness: 0.8, sheen: 0.3, sheenRoughness: 0.5, sheenColor: new THREE.Color('#ffffff'), side: THREE.DoubleSide, envMapIntensity: 0.35 });
    const shortsMat = new THREE.MeshPhysicalMaterial({ map: shortsTexture(team, this.away), roughness: 0.75, sheen: 0.3, sheenColor: new THREE.Color('#ffffff'), side: THREE.DoubleSide, envMapIntensity: 0.35 });
    const hairMat = new THREE.MeshStandardMaterial({ color: info.hair.color, roughness: 0.85 });
    const sockMat = new THREE.MeshStandardMaterial({ color: '#f2f2f2', roughness: 0.9 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: this.away ? '#f4f4f4' : '#141414', roughness: 0.5 });
    const soleMat = new THREE.MeshStandardMaterial({ color: this.away ? '#d9d9d9' : '#f2f2f2', roughness: 0.6 });
    const bandMat = new THREE.MeshStandardMaterial({ color: this.away ? team.primary : team.letters, roughness: 0.8 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: '#0b0908', roughness: 0.2 });
    this.mats = { skin, jerseyMat, shortsMat };

    const add = (parent, geo, mat, x = 0, y = 0, z = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    };

    const root = this.root = new THREE.Group();
    const pelvis = this.pelvis = new THREE.Group();
    root.add(pelvis);

    // shorts (hip section)
    const hipShorts = add(pelvis, new THREE.CylinderGeometry(0.175 * s, 0.2 * s, 0.24 * s, 24, 1, true), shortsMat, 0, -0.07 * s, 0);
    hipShorts.scale.set(1.12, 1, 0.82);
    add(pelvis, new THREE.CircleGeometry(0.175 * s, 20).rotateX(-Math.PI / 2), shortsMat, 0, 0.05 * s, 0).scale.set(1.12, 1, 0.82);

    // legs
    this.hip = [];
    this.knee = [];
    this.ankle = [];
    for (const side of [1, -1]) {
      const hip = new THREE.Group();
      hip.position.set(side * L.hipW, -0.03 * s, 0);
      pelvis.add(hip);
      add(hip, new THREE.CapsuleGeometry(0.07 * s, L.thigh - 0.12 * s, 6, 14), skin, 0, -L.thigh / 2, 0);
      const legShort = add(hip, new THREE.CylinderGeometry(0.108 * s, 0.1 * s, 0.34 * s, 18, 1, true), shortsMat, side * 0.005, -0.15 * s, 0);
      legShort.rotation.z = side * 0.04;
      const knee = new THREE.Group();
      knee.position.y = -L.thigh;
      hip.add(knee);
      add(knee, new THREE.CapsuleGeometry(0.052 * s, L.shin - 0.1 * s, 6, 12), skin, 0, -L.shin / 2, -0.005);
      add(knee, new THREE.CylinderGeometry(0.05 * s, 0.047 * s, 0.17 * s, 12), sockMat, 0, -L.shin + 0.1 * s, 0);
      const ankle = new THREE.Group();
      ankle.position.y = -L.shin;
      knee.add(ankle);
      add(ankle, new RoundedBoxGeometry(0.115 * s, 0.1 * s, 0.3 * s, 3, 0.04 * s), shoeMat, 0, -0.03 * s, 0.055 * s);
      add(ankle, new RoundedBoxGeometry(0.12 * s, 0.03 * s, 0.31 * s, 2, 0.012 * s), soleMat, 0, -0.075 * s, 0.055 * s);
      this.hip.push(hip);
      this.knee.push(knee);
      this.ankle.push(ankle);
    }

    // torso
    const spine = this.spine = new THREE.Group();
    pelvis.add(spine);
    const prof = [];
    const n = 18;
    const y0 = -0.06 * s, y1 = 0.63 * s;
    const rOf = (u) => {
      // waist -> chest -> shoulders -> collar
      const w = 0.158 + 0.012 * Math.sin(u * Math.PI * 0.5);
      const chest = 0.045 * Math.exp(-Math.pow((u - 0.68) / 0.16, 2));
      const top = u > 0.86 ? -0.1 * Math.pow((u - 0.86) / 0.14, 1.6) : 0;
      return (w + chest + top) * s;
    };
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      prof.push(new THREE.Vector2(Math.max(0.02 * s, rOf(u)), y0 + (y1 - y0) * u));
    }
    const torso = add(spine, new THREE.LatheGeometry(prof, 40, -Math.PI / 2, Math.PI * 2), jerseyMat, 0, 0, 0);
    torso.scale.set(1.3, 1, 0.74);
    // skin under the neckline / armholes
    add(spine, new THREE.SphereGeometry(0.12 * s, 16, 12), skin, 0, 0.56 * s, 0.005).scale.set(1.35, 0.5, 0.8);

    const chest = this.chest = new THREE.Group();
    chest.position.y = L.spine;
    spine.add(chest);

    // arms
    this.shoulder = [];
    this.elbow = [];
    this.handG = [];
    for (const side of [1, -1]) {
      const sh = new THREE.Group();
      sh.position.set(side * L.shX, L.shY, -0.005 * s);
      chest.add(sh);
      add(sh, new THREE.SphereGeometry(0.068 * s, 16, 12), skin, 0, -0.01 * s, 0).scale.set(1, 1.05, 1.05);
      add(sh, new THREE.CapsuleGeometry(0.053 * s, L.upper - 0.1 * s, 6, 12), skin, 0, -L.upper / 2, 0);
      const el = new THREE.Group();
      el.position.y = -L.upper;
      sh.add(el);
      add(el, new THREE.CapsuleGeometry(0.043 * s, L.fore - 0.08 * s, 6, 12), skin, 0, -L.fore / 2, 0);
      if (side === -1) add(el, new THREE.CylinderGeometry(0.047 * s, 0.047 * s, 0.07 * s, 12), bandMat, 0, -L.fore + 0.06 * s, 0);
      const hand = new THREE.Group();
      hand.position.y = -L.fore;
      el.add(hand);
      add(hand, new RoundedBoxGeometry(0.08 * s, 0.12 * s, 0.035 * s, 2, 0.015 * s), skin, 0, -0.055 * s, 0.005);
      add(hand, new THREE.CapsuleGeometry(0.014 * s, 0.05 * s, 4, 6), skin, side * 0.045 * s, -0.04 * s, 0.015 * s).rotation.z = side * 0.6;
      this.shoulder.push(sh);
      this.elbow.push(el);
      this.handG.push(hand);
    }

    // neck + head
    const neck = this.neck = new THREE.Group();
    neck.position.y = L.neck;
    chest.add(neck);
    add(neck, new THREE.CylinderGeometry(0.056 * s, 0.062 * s, 0.14 * s, 14), skin, 0, 0.04 * s, 0.005);
    const head = this.head = new THREE.Group();
    head.position.y = 0.12 * s;
    neck.add(head);
    const hr = 0.108 * s;
    add(head, new THREE.SphereGeometry(hr, 28, 22), skin, 0, 0.075 * s, 0.01 * s).scale.set(0.86, 1.1, 1.0);
    add(head, new THREE.SphereGeometry(hr * 0.62, 16, 12), skin, 0, 0.0, 0.035 * s).scale.set(1.1, 0.9, 1.05); // jaw
    add(head, new THREE.ConeGeometry(0.018 * s, 0.05 * s, 8), skin, 0, 0.065 * s, 0.112 * s).rotation.x = Math.PI / 2 + 0.3; // nose
    for (const side of [1, -1]) {
      add(head, new THREE.SphereGeometry(0.012 * s, 8, 6), eyeMat, side * 0.034 * s, 0.095 * s, 0.098 * s);
      add(head, new THREE.SphereGeometry(0.024 * s, 8, 6), skin, side * 0.092 * s, 0.07 * s, 0.0).scale.set(0.45, 1, 0.8); // ears
    }
    this.buildHair(head, hr, hairMat, add);
    if (info.beard) {
      const bm = new THREE.MeshStandardMaterial({ color: info.beard, roughness: 0.95 });
      add(head, new THREE.SphereGeometry(hr * 1.02, 22, 14, Math.PI * 0.12, Math.PI * 0.76, Math.PI * 0.55, Math.PI * 0.32), bm, 0, 0.07 * s, 0.012 * s).scale.set(0.9, 1.08, 1.02);
    }
    if (info.headband) {
      const hb = new THREE.MeshStandardMaterial({ color: info.headband, roughness: 0.8 });
      add(head, new THREE.TorusGeometry(hr * 0.93, 0.013 * s, 8, 28), hb, 0, 0.125 * s, 0.01 * s).rotation.x = Math.PI / 2 + 0.12;
    }

    // soft contact shadow
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false, opacity: 0.55, toneMapped: false }));
    blob.rotation.x = -Math.PI / 2;
    blob.renderOrder = 1;
    this.blob = blob;

    this.group = new THREE.Group();
    this.group.add(root, blob);
  }

  buildHair(head, hr, mat, add) {
    const s = this.s, style = this.info.hair.style;
    const cap = (scale, thetaLen, y = 0.075 * s) => {
      const m = add(head, new THREE.SphereGeometry(hr * scale, 26, 16, 0, Math.PI * 2, 0, thetaLen), mat, 0, y, 0.004 * s);
      m.scale.set(0.87, 1.1, 1.0);
      m.rotation.x = -0.28;
      return m;
    };
    if (style === 'buzz' || style === 'fade') {
      cap(1.018, Math.PI * (style === 'fade' ? 0.46 : 0.5));
    } else if (style === 'curly') {
      const m = add(head, new THREE.IcosahedronGeometry(hr * 1.13, 2), mat, 0, 0.1 * s, -0.01 * s);
      m.scale.set(0.92, 0.82, 1.0);
      const p = m.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        _v1.fromBufferAttribute(p, i);
        const k = 1 + 0.07 * Math.sin(_v1.x * 90) * Math.cos(_v1.y * 80 + _v1.z * 70);
        p.setXYZ(i, _v1.x * k, _v1.y * k, _v1.z * k);
      }
      m.geometry.computeVertexNormals();
      // clip the lower half so the face stays visible
      m.geometry = m.geometry.toNonIndexed();
      const pos = m.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) if (pos.getY(i) < -0.01 * s && pos.getZ(i) > 0) pos.setY(i, -0.01 * s);
    } else if (style === 'twists') {
      cap(1.03, Math.PI * 0.52);
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2 + (i % 2) * 0.12;
        const ring = i % 3;
        const th = 0.25 + ring * 0.28;
        const dir = new THREE.Vector3(Math.sin(th) * Math.cos(a) * 0.87, Math.cos(th) * 1.1, Math.sin(th) * Math.sin(a));
        if (dir.z > 0.55 && dir.y < 0.9) continue;
        const tw = add(head, new THREE.CapsuleGeometry(0.014 * s, 0.07 * s, 3, 6), mat, dir.x * hr, 0.075 * s + dir.y * hr, dir.z * hr);
        tw.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      }
    } else if (style === 'bun') {
      cap(1.02, Math.PI * 0.5);
      add(head, new THREE.SphereGeometry(0.045 * s, 14, 10), mat, 0, 0.17 * s, -0.07 * s);
    } else if (style === 'braids') {
      cap(1.025, Math.PI * 0.52);
      for (let i = 0; i < 14; i++) {
        const a = Math.PI * 0.15 + (i / 13) * Math.PI * 0.7;
        const x = Math.cos(a) * hr * 0.85, z = -Math.sin(a) * hr * 0.9;
        const b = add(head, new THREE.CapsuleGeometry(0.011 * s, 0.2 * s, 3, 6), mat, x, -0.04 * s, z - 0.01 * s);
        b.rotation.x = -0.15; b.rotation.z = x * 2.2;
      }
    } else if (style === 'undercut') {
      cap(1.012, Math.PI * 0.5);
      const top = add(head, new THREE.SphereGeometry(hr * 0.98, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.3), mat, 0, 0.11 * s, 0.01 * s);
      top.scale.set(0.8, 1.2, 1.0);
      top.rotation.x = -0.15;
    }
  }

  // ---- dribble helper: where the ball is this frame (world) ----
  dribbleBallPos(out, ballR) {
    const s = this.s, d = this.dribble;
    const spd = Math.hypot(this.vel.x, this.vel.z);
    const p = d.phase;
    const handSide = d.crossing ? (p < 0.45 ? d.from : -d.from) : d.hand;
    const floorSide = d.crossing ? 0 : d.hand;
    const hx = handSide * 0.3 * s, hy = 0.9 * s, hz = 0.28 * s + spd * 0.02;
    const fx = floorSide * 0.33 * s, fz = 0.42 * s + spd * 0.09;
    let x, y, z;
    if (p < 0.45) {
      const q = Math.pow(p / 0.45, 1.5);
      x = smooth(hx, fx, q); y = smooth(hy, ballR, q); z = smooth(hz, fz, q);
    } else {
      const q = (p - 0.45) / 0.55;
      const e = 1 - (1 - q) * (1 - q);
      x = smooth(fx, hx, e); y = smooth(ballR, hy, e); z = smooth(fz, hz, e);
    }
    out.set(x, y, z).applyAxisAngle(_v4.set(0, 1, 0), this.yaw).add(this.pos);
    return out;
  }

  localToWorld(out, x, y, z) {
    return out.set(x, y, z).applyAxisAngle(_v4.set(0, 1, 0), this.yaw).add(this.pos);
  }

  handWorld(side, out) {
    // side: 0 = left, 1 = right
    this.handG[side].updateWorldMatrix(true, false);
    return out.set(0, -0.06 * this.s, 0.01).applyMatrix4(this.handG[side].matrixWorld);
  }

  headWorld(out) {
    this.head.updateWorldMatrix(true, false);
    return out.set(0, 0.08 * this.s, 0).applyMatrix4(this.head.matrixWorld);
  }

  // ---- 2-bone IK for an arm; side 0 = left, 1 = right ----
  solveArm(i, target, pole, w) {
    const sh = this.shoulder[i], el = this.elbow[i];
    const L1 = this.L.upper, L2 = this.L.fore + this.L.hand * 0.55;
    this.chest.updateWorldMatrix(true, false);
    _m.copy(this.chest.matrixWorld).invert();
    const t = _v1.copy(target).applyMatrix4(_m);
    const pl = _v2.copy(pole).applyMatrix4(_m);
    const S = sh.position;
    const d = t.sub(S);
    let dist = d.length();
    dist = clamp(dist, Math.abs(L1 - L2) + 1e-3, (L1 + L2) * 0.999);
    const dir = d.normalize();
    const cosA = clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1);
    const a = Math.acos(cosA);
    const perp = pl.sub(S);
    perp.addScaledVector(dir, -perp.dot(dir));
    if (perp.lengthSq() < 1e-8) perp.set(0, 0, -1);
    perp.normalize();
    const u = _v3.copy(dir).multiplyScalar(Math.cos(a)).addScaledVector(perp, Math.sin(a)).normalize();
    // forearm direction
    const elbowP = _v4.copy(S).addScaledVector(u, L1);
    const tgt = _xb.copy(dir).multiplyScalar(dist).add(S);
    const f = tgt.sub(elbowP).normalize();
    const bend = Math.acos(clamp(u.dot(f), -1, 1));
    _yb.copy(u).negate();
    _zb.copy(f).addScaledVector(u, -f.dot(u));
    if (_zb.lengthSq() < 1e-8) _zb.copy(perp);
    _zb.normalize();
    _xb.crossVectors(_yb, _zb);
    _m.makeBasis(_xb, _yb, _zb);
    _q.setFromRotationMatrix(_m);
    sh.quaternion.slerp(_q, w);
    el.rotation.x = smooth(el.rotation.x, -bend, w);
  }

  setAction(type, extra = {}) {
    this.action = { type, t: 0, ...extra };
    return this.action;
  }

  // ---- per-frame animation ----
  animate(dt) {
    const s = this.s, L = this.L, j = this.j;
    const k = 1 - Math.exp(-dt * 16);
    const spd = Math.hypot(this.vel.x, this.vel.z);
    const fwdX = Math.sin(this.yaw), fwdZ = Math.cos(this.yaw);
    const fwd = this.vel.x * fwdX + this.vel.z * fwdZ;
    const lat = this.vel.x * fwdZ - this.vel.z * fwdX;   // + = toward character's left (+x)
    const defense = this.stance === 'defense';
    const act = this.action;

    // --- base locomotion targets ---
    const T = {
      spineX: defense ? 0.32 : 0.06 + Math.min(0.25, spd * 0.035), spineY: 0, spineZ: 0,
      hipLX: 0, hipLZ: 0.06, kneeL: 0.18, hipRX: 0, hipRZ: -0.06, kneeR: 0.18, ankleL: 0, ankleR: 0,
      shLX: 0.05, shLZ: 0.14, elbowL: -0.35, shRX: 0.05, shRZ: -0.14, elbowR: -0.35,
      neckX: 0, neckY: 0,
    };
    const runW = spd < 0.05 ? 0 : Math.abs(fwd) / (Math.abs(fwd) + Math.abs(lat) * (defense ? 1.6 : 0.5) + 1e-3);
    const slideW = 1 - runW;
    // running gait
    this.phase += dt * Math.sign(fwd || 1) * spd * 2.5;
    const A = Math.min(0.95, 0.22 + 0.13 * spd) * runW * Math.min(1, spd * 1.2);
    const sp = Math.sin(this.phase), cp = Math.cos(this.phase);
    T.hipLX += -A * sp;
    T.hipRX += A * sp;
    T.kneeL += A * 1.5 * Math.pow(Math.max(0, cp), 1.4) + 0.15 * A;
    T.kneeR += A * 1.5 * Math.pow(Math.max(0, -cp), 1.4) + 0.15 * A;
    T.shLX += A * 0.9 * sp;
    T.shRX += -A * 0.9 * sp;
    T.elbowL += -A * 1.1;
    T.elbowR += -A * 1.1;
    let bob = A * 0.05 * Math.abs(sp);
    // breathing and a little weight shift when standing
    const tt = performance.now() * 0.001 + this.info.num;
    const still = 1 - Math.min(1, spd);
    T.spineX += 0.02 * Math.sin(tt * 1.7) * still;
    T.hipLZ += 0.03 * Math.sin(tt * 0.6) * still;
    T.hipRZ += 0.03 * Math.sin(tt * 0.6) * still;
    // lateral slide gait
    if (slideW > 0.01 && spd > 0.05) {
      this.slidePhase += dt * spd * 4.2;
      const o = Math.sin(this.slidePhase) * 0.22 * slideW * Math.min(1, spd);
      T.hipLZ += 0.2 * slideW + o;
      T.hipRZ += -0.2 * slideW + o;
      T.kneeL += 0.3 * slideW; T.kneeR += 0.3 * slideW;
      T.spineZ = -Math.sign(lat) * 0.05 * slideW;
    }
    if (defense) {
      T.hipLX += -0.55; T.hipRX += -0.55;
      T.kneeL += 0.95; T.kneeR += 0.95;
      T.ankleL = -0.3; T.ankleR = -0.3;
      T.hipLZ += 0.16; T.hipRZ -= 0.16;
      const wig = Math.sin(performance.now() * 0.009) * 0.08;
      T.shLX = -0.55 + wig; T.shLZ = 1.0; T.elbowL = -0.7;
      T.shRX = -0.55 - wig; T.shRZ = -1.0; T.elbowR = -0.7;
    } else if (this.dribble.active) {
      T.hipLX -= 0.18; T.hipRX -= 0.18; T.kneeL += 0.35; T.kneeR += 0.35;
      T.spineX += 0.12;
      // off-hand arm bar
      const off = this.dribble.hand === -1 ? 'L' : 'R';
      T['sh' + off + 'X'] = -0.55;
      T['sh' + off + 'Z'] = (off === 'L' ? 1 : -1) * 0.35;
      T['elbow' + off] = -1.2;
    }

    // --- actions ---
    this.ikTarget[0] = this.ikTarget[1] = null;
    this.jumpY = 0;
    if (act) {
      act.t += dt;
      const t = act.t;
      if (act.type === 'shoot') {
        // gather (dip) -> rise -> release at apex -> land
        const dip = ss(t / 0.16) * (1 - ss((t - 0.16) / 0.12));
        const air = act.jump * Math.max(0, Math.sin(clamp((t - 0.2) / act.air, 0, 1) * Math.PI));
        this.jumpY = air;
        T.kneeL = T.kneeR = 0.25 + dip * 0.9 + (air > 0 ? 0.15 : 0);
        T.hipLX = T.hipRX = -0.15 - dip * 0.5;
        T.ankleL = T.ankleR = -dip * 0.3 + (air > 0.02 ? 0.5 : 0);
        T.spineX = 0.08 + dip * 0.2 - (air > 0 ? 0.08 : 0);
        T.spineZ = 0;
        T.hipLZ = 0.06; T.hipRZ = -0.06;
      } else if (act.type === 'layup' || act.type === 'dunk') {
        const air = act.jump * Math.max(0, Math.sin(clamp((t - act.gather) / act.air, 0, 1) * Math.PI));
        this.jumpY = act.hang ? act.hangY : air;
        const up = t > act.gather;
        T.hipLX = up ? -1.25 : -0.3; T.kneeL = up ? 1.6 : 0.6;   // knee drive
        T.hipRX = up ? 0.25 : -0.2; T.kneeR = up ? 0.35 : 0.5;
        T.ankleR = up ? 0.6 : 0;
        T.spineX = up ? 0.02 : 0.25;
        if (act.hang) { T.hipLX = -0.3; T.kneeL = 0.5; T.hipRX = -0.2; T.kneeR = 0.4; T.spineX = -0.05; }
      } else if (act.type === 'contest') {
        const air = act.jump * Math.max(0, Math.sin(clamp((t - 0.1) / act.air, 0, 1) * Math.PI));
        this.jumpY = air;
        const dip = ss(t / 0.1) * (1 - ss((t - 0.1) / 0.1));
        T.kneeL = T.kneeR = 0.3 + dip * 0.7;
        T.hipLX = T.hipRX = -0.2 - dip * 0.3;
        T.ankleL = T.ankleR = air > 0.02 ? 0.55 : 0;
        T.spineX = 0.0;
        T.hipLZ = 0.08; T.hipRZ = -0.08;
      } else if (act.type === 'steal') {
        const r = ss(t / 0.12) * (1 - ss((t - 0.28) / 0.15));
        T.spineX += 0.35 * r;
        T.hipLX = -0.9 * r - 0.3; T.kneeL = 1.1 * r + 0.4;
      } else if (act.type === 'stumble') {
        const w = Math.sin(t * 22) * (1 - t / 0.6);
        T.spineZ = 0.25 * w; T.spineX = 0.35;
        T.shLZ = 1.4; T.shRZ = -1.4; T.shLX = -0.6 + w; T.shRX = -0.6 - w;
        T.hipLZ = 0.3; T.hipRZ = -0.1 + w * 0.2;
      } else if (act.type === 'celebrate') {
        const pump = Math.abs(Math.sin(t * 9));
        T.shRX = -2.3 - pump * 0.4; T.shRZ = -0.3; T.elbowR = -1.4 + pump * 0.5;
        T.shLX = -0.2; T.shLZ = 0.5; T.elbowL = -1.2;
        T.spineX = -0.1; T.neckX = -0.3;
      } else if (act.type === 'check') {
        T.shLX = T.shRX = -0.9; T.elbowL = T.elbowR = -1.3; T.shLZ = 0.35; T.shRZ = -0.35;
      }
      if (act.dur && t > act.dur) this.action = null;
    }

    // head looks toward lookAt
    const dx = this.lookAt.x - this.pos.x, dz = this.lookAt.z - this.pos.z;
    let rel = Math.atan2(dx, dz) - this.yaw;
    rel = Math.atan2(Math.sin(rel), Math.cos(rel));
    T.neckY = clamp(rel, -0.9, 0.9) * 0.8;
    T.spineY = clamp(rel, -0.9, 0.9) * 0.25;

    for (const key in T) j[key] = smooth(j[key], T[key], k);

    // --- apply ---
    const [hipL, hipR] = this.hip, [kneeL, kneeR] = this.knee, [ankL, ankR] = this.ankle;
    hipL.rotation.set(j.hipLX, 0, j.hipLZ);
    hipR.rotation.set(j.hipRX, 0, j.hipRZ);
    kneeL.rotation.x = j.kneeL;
    kneeR.rotation.x = j.kneeR;
    ankL.rotation.x = j.ankleL - (j.hipLX + j.kneeL) * 0.6;
    ankR.rotation.x = j.ankleR - (j.hipRX + j.kneeR) * 0.6;
    this.spine.rotation.set(j.spineX, j.spineY, j.spineZ);
    this.neck.rotation.set(j.neckX - j.spineX * 0.6, j.neckY, 0);
    this.shoulder[0].rotation.set(j.shLX, 0, j.shLZ);
    this.shoulder[1].rotation.set(j.shRX, 0, j.shRZ);
    this.elbow[0].rotation.set(j.elbowL, 0, 0);
    this.elbow[1].rotation.set(j.elbowR, 0, 0);

    // keep the lower foot planted
    const ext = (hx, hz, kn) => (L.thigh * Math.cos(hx) + L.shin * Math.cos(hx + kn)) * Math.cos(hz);
    const eL = ext(j.hipLX, j.hipLZ, j.kneeL), eR = ext(j.hipRX, j.hipRZ, j.kneeR);
    const pelvisY = Math.max(eL, eR) + L.footH + 0.03 * this.s;
    this.pelvis.position.y = pelvisY + bob;
    this.root.position.set(this.pos.x, this.jumpY, this.pos.z);
    this.root.rotation.y = this.yaw;

    // blob shadow
    const bs = 1.05 * s * (1 - Math.min(0.5, this.jumpY * 0.5));
    this.blob.position.set(this.pos.x, 0.004, this.pos.z);
    this.blob.scale.set(bs, bs, 1);
    this.blob.material.opacity = 0.55 * (1 - Math.min(0.7, this.jumpY));
  }

  // IK pass (call after animate, once targets are known)
  applyIK(dt) {
    const k = 1 - Math.exp(-dt * 20);
    for (let i = 0; i < 2; i++) {
      const tgt = this.ikTarget[i];
      this.ikW[i] = smooth(this.ikW[i], tgt ? 1 : 0, k);
      if (tgt && this.ikW[i] > 0.01) {
        const side = i === 0 ? 1 : -1;
        const pole = this.localToWorld(_v4.clone(), side * 0.9 * this.s, 1.0 * this.s + this.jumpY, -0.7 * this.s);
        this.solveArm(i, tgt, pole, this.ikW[i]);
      }
    }
    if (this.skin) this.driveSkin();
  }

  // ---------- photoreal skinned body (Higgsfield image-to-3D) ----------
  // The procedural rig keeps running invisibly; its joint directions drive the
  // skinned model's bones every frame.
  async attachSkin(url) {
    const gltf = await loadModel(url);
    const { clone } = await import('three/addons/utils/SkeletonUtils.js');
    const scene = clone(gltf.scene);
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.updateMatrixWorld(true);
    const bones = {};
    let mesh = null;
    scene.traverse((o) => {
      if (o.isBone) bones[o.name] = o;
      if (o.isSkinnedMesh) mesh = o;
    });
    const need = ['Hips', 'Spine02', 'Spine01', 'Spine', 'neck', 'Head', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightArm', 'RightForeArm', 'RightHand',
      'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase', 'RightUpLeg', 'RightLeg', 'RightFoot', 'RightToeBase'];
    for (const n of need) if (!bones[n]) throw new Error('model is missing bone ' + n);
    // facing: rotate so the character looks down +z like the procedural rig
    const hf = bones.headfront, hd = bones.Head;
    if (hf && hf.getWorldPosition(new THREE.Vector3()).z < hd.getWorldPosition(new THREE.Vector3()).z) {
      scene.rotation.y = Math.PI;
      scene.updateMatrixWorld(true);
    }
    const P = (n) => bones[n].getWorldPosition(new THREE.Vector3());
    const rest = {};
    for (const n of need) rest[n] = { q: bones[n].getWorldQuaternion(new THREE.Quaternion()), p: P(n) };
    const dir = (a, b) => rest[b].p.clone().sub(rest[a].p).normalize();
    const restDir = {
      LeftArm: dir('LeftArm', 'LeftForeArm'), LeftForeArm: dir('LeftForeArm', 'LeftHand'),
      RightArm: dir('RightArm', 'RightForeArm'), RightForeArm: dir('RightForeArm', 'RightHand'),
      LeftUpLeg: dir('LeftUpLeg', 'LeftLeg'), LeftLeg: dir('LeftLeg', 'LeftFoot'), LeftFoot: dir('LeftFoot', 'LeftToeBase'),
      RightUpLeg: dir('RightUpLeg', 'RightLeg'), RightLeg: dir('RightLeg', 'RightFoot'), RightFoot: dir('RightFoot', 'RightToeBase'),
    };
    // fit the invisible driver rig to the model's proportions
    const L = this.L, s = this.s;
    const hipMid = rest.LeftUpLeg.p.clone().add(rest.RightUpLeg.p).multiplyScalar(0.5);
    L.thigh = rest.LeftUpLeg.p.distanceTo(rest.LeftLeg.p);
    L.shin = rest.LeftLeg.p.distanceTo(rest.LeftFoot.p);
    L.footH = Math.max(0.04, rest.LeftFoot.p.y - 0.03 * s);
    L.upper = rest.LeftArm.p.distanceTo(rest.LeftForeArm.p);
    L.fore = rest.LeftForeArm.p.distanceTo(rest.LeftHand.p);
    L.hand = 0.17 * s;
    L.hipW = Math.abs(rest.LeftUpLeg.p.x - rest.RightUpLeg.p.x) / 2;
    const pelvisY0 = hipMid.y + 0.03 * s;          // procedural pelvis origin at rest
    L.spine = Math.max(0.2, rest.Spine.p.y - pelvisY0);
    for (let k = 0; k < 2; k++) {
      const side = k === 0 ? 1 : -1;
      this.hip[k].position.set(side * L.hipW, hipMid.y - pelvisY0, hipMid.z);
      this.knee[k].position.y = -L.thigh;
      this.ankle[k].position.y = -L.shin;
      const sh = rest[k === 0 ? 'LeftArm' : 'RightArm'].p;
      this.shoulder[k].position.set(sh.x, sh.y - pelvisY0 - L.spine, sh.z);
      this.elbow[k].position.y = -L.upper;
      this.handG[k].position.y = -L.fore;
    }
    this.chest.position.y = L.spine;
    this.neck.position.set(0, rest.neck.p.y - pelvisY0 - L.spine, rest.neck.p.z);
    this.head.position.set(0, rest.Head.p.y - rest.neck.p.y, rest.Head.p.z - rest.neck.p.z);
    // hide the procedural body, keep its skeleton
    this.root.traverse((o) => { if (o.isMesh) o.visible = false; });
    // look
    const map = mesh.material.map;
    mesh.material = new THREE.MeshStandardMaterial({ map, roughness: 0.7, metalness: 0, envMapIntensity: 0.3 });
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    this.group.add(scene);
    this.skin = { scene, bones, rest, restDir, hipOffset: rest.Hips.p.clone().sub(hipMid), mesh, len: { upper: L.upper, fore: L.fore } };
  }

  driveSkin() {
    const { bones, rest, restDir, hipOffset } = this.skin;
    this.root.updateMatrixWorld(true);
    const Rq = _q.setFromAxisAngle(_v4.set(0, 1, 0), this.yaw).clone();
    const W = (o, out) => o.getWorldPosition(out);
    const setWorldQ = (bone, q) => {
      const pq = bone.parent.getWorldQuaternion(new THREE.Quaternion());
      bone.quaternion.copy(pq.invert().multiply(q));
      bone.updateMatrixWorld(true);
    };
    const tmpQ = new THREE.Quaternion();
    // hips
    const hipMid = W(this.hip[0], new THREE.Vector3()).add(W(this.hip[1], new THREE.Vector3())).multiplyScalar(0.5);
    const hipsPos = hipMid.add(hipOffset.clone().applyQuaternion(Rq));
    const hb = bones.Hips;
    hb.parent.updateMatrixWorld(true);
    hb.position.copy(hb.parent.worldToLocal(hipsPos));
    setWorldQ(hb, Rq.clone().multiply(rest.Hips.q));
    // spine chain (lower -> upper)
    const dSpine = this.spine.quaternion;
    const ident = new THREE.Quaternion();
    for (const [n, f] of [['Spine02', 0.34], ['Spine01', 0.67], ['Spine', 1]]) {
      tmpQ.copy(ident).slerp(dSpine, f);
      setWorldQ(bones[n], Rq.clone().multiply(tmpQ).multiply(rest[n].q));
    }
    // neck + head
    const dHead = dSpine.clone().multiply(this.neck.quaternion).multiply(this.head.quaternion);
    setWorldQ(bones.neck, Rq.clone().multiply(dSpine.clone().slerp(dHead, 0.5)).multiply(rest.neck.q));
    setWorldQ(bones.Head, Rq.clone().multiply(dHead).multiply(rest.Head.q));
    // limbs by segment direction
    const limb = (name, from, to) => {
      const a = W(from, new THREE.Vector3()), b = W(to, new THREE.Vector3());
      const d = b.sub(a).normalize();
      const r0 = restDir[name].clone().applyQuaternion(Rq);
      const rot = new THREE.Quaternion().setFromUnitVectors(r0, d);
      setWorldQ(bones[name], rot.multiply(Rq.clone().multiply(rest[name].q)));
    };
    // arms: FK directions from the driver rig, re-solved on the model's own
    // shoulders when a hand target is active so the hands land on the ball
    for (const [k, up, fo] of [[0, 'LeftArm', 'LeftForeArm'], [1, 'RightArm', 'RightForeArm']]) {
      const S = W(bones[up], new THREE.Vector3());
      let dU = W(this.elbow[k], new THREE.Vector3()).sub(W(this.shoulder[k], new THREE.Vector3())).normalize();
      let dF = W(this.handG[k], new THREE.Vector3()).sub(W(this.elbow[k], new THREE.Vector3())).normalize();
      const tgt = this.ikTarget[k], w = this.ikW[k];
      if (tgt && w > 0.01) {
        const L1 = this.skin.len.upper, L2 = this.skin.len.fore + this.L.hand * 0.55;
        const d = tgt.clone().sub(S);
        const dist = clamp(d.length(), Math.abs(L1 - L2) + 1e-3, (L1 + L2) * 0.999);
        const dir = d.normalize();
        const a = Math.acos(clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1));
        const side = k === 0 ? 1 : -1;
        const pole = this.localToWorld(new THREE.Vector3(), side * 0.9 * this.s, 1.0 * this.s + this.jumpY, -0.7 * this.s).sub(S);
        pole.addScaledVector(dir, -pole.dot(dir));
        if (pole.lengthSq() < 1e-8) pole.set(0, -1, 0);
        pole.normalize();
        const u = dir.clone().multiplyScalar(Math.cos(a)).addScaledVector(pole, Math.sin(a)).normalize();
        const E = S.clone().addScaledVector(u, L1);
        const f = S.clone().addScaledVector(dir, dist).sub(E).normalize();
        dU = dU.lerp(u, w).normalize();
        dF = dF.lerp(f, w).normalize();
      }
      for (const [name, dd] of [[up, dU], [fo, dF]]) {
        const r0 = restDir[name].clone().applyQuaternion(Rq);
        const rot = new THREE.Quaternion().setFromUnitVectors(r0, dd);
        setWorldQ(bones[name], rot.multiply(Rq.clone().multiply(rest[name].q)));
      }
    }
    limb('LeftUpLeg', this.hip[0], this.knee[0]);
    limb('LeftLeg', this.knee[0], this.ankle[0]);
    limb('RightUpLeg', this.hip[1], this.knee[1]);
    limb('RightLeg', this.knee[1], this.ankle[1]);
    for (const [name, k] of [['LeftFoot', 0], ['RightFoot', 1]]) {
      const aq = this.ankle[k].getWorldQuaternion(new THREE.Quaternion());
      const d = restDir[name].clone().applyQuaternion(aq);
      const r0 = restDir[name].clone().applyQuaternion(Rq);
      const rot = new THREE.Quaternion().setFromUnitVectors(r0, d);
      setWorldQ(bones[name], rot.multiply(Rq.clone().multiply(rest[name].q)));
    }
  }
}

let _blobTex = null;
function blobTexture() {
  if (_blobTex) return _blobTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grd.addColorStop(0, 'rgba(0,0,0,0.85)');
  grd.addColorStop(0.5, 'rgba(0,0,0,0.4)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  _blobTex = new THREE.CanvasTexture(c);
  return _blobTex;
}
