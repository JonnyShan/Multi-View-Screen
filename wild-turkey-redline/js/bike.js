// Procedural prototype-class race bike + rider. Local space: +z forward, +y up, +x = rider's left.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { BRAND } from './config.js';
import * as TX from './textures.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// Side-profile shape (x = forward, y = up) extruded across the bike, then width-tapered by fn(z, y).
function sculpt(shape, depth, bevel, taper, segs = 6) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.85, bevelSegments: segs, curveSegments: 14,
  });
  g.rotateY(-Math.PI / 2);
  g.translate(depth / 2, 0, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    p.setX(i, x * taper(z, y));
  }
  g.computeVertexNormals();
  g.computeBoundingBox();
  const pts = shape.getPoints(24);
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
  for (const v of pts) { minx = Math.min(minx, v.x); maxx = Math.max(maxx, v.x); miny = Math.min(miny, v.y); maxy = Math.max(maxy, v.y); }
  g.userData.bounds = { minx, maxx, miny, maxy };
  return g;
}

// Paint material whose map is sampled from a per-side texture so decals read correctly on both flanks.
function liveryMaterial(texR, texL, b) {
  const fit = (t) => {
    const c = t.clone(); c.needsUpdate = true;
    c.wrapS = c.wrapT = THREE.ClampToEdgeWrapping;
    const w = b.maxx - b.minx, h = b.maxy - b.miny;
    c.repeat.set(1 / w, 1 / h); c.offset.set(-b.minx / w, -b.miny / h);
    return c;
  };
  const mat = new THREE.MeshPhysicalMaterial({ map: fit(texR), roughness: 0.28, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 });
  const mapL = fit(texL);
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.mapL = { value: mapL };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vObjNX;')
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nvObjNX = objectNormal.x;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vObjNX;\nuniform sampler2D mapL;')
      .replace('#include <map_fragment>', `#ifdef USE_MAP
        vec4 sampledDiffuseColor = vObjNX > 0.0 ? texture2D(mapL, vec2(1.0 - vMapUv.x, vMapUv.y)) : texture2D(map, vMapUv);
        diffuseColor *= sampledDiffuseColor;
      #endif`);
  };
  mat.customProgramCacheKey = () => 'livery';
  return mat;
}

export function makeMaterials() {
  return {
    livR: TX.liveryTexture(false, 'fairing'),
    livL: TX.liveryTexture(true, 'fairing'),
    tailR: TX.liveryTexture(false, 'tail'),
    tailL: TX.liveryTexture(true, 'tail'),
    paint: new THREE.MeshPhysicalMaterial({ color: BRAND.red, roughness: 0.28, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05 }),
    paintInk: new THREE.MeshPhysicalMaterial({ color: '#1f1917', roughness: 0.3, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 }),
    carbon: new THREE.MeshStandardMaterial({ color: '#161616', roughness: 0.3, metalness: 0.4 }),
    gold: new THREE.MeshStandardMaterial({ color: '#d4a748', roughness: 0.2, metalness: 1 }),
    alu: new THREE.MeshStandardMaterial({ color: '#8d9196', roughness: 0.28, metalness: 1 }),
    rubber: new THREE.MeshStandardMaterial({ color: '#161514', roughness: 0.82 }),
    disc: new THREE.MeshStandardMaterial({ color: '#2b2b2b', roughness: 0.45, metalness: 0.8, emissive: new THREE.Color('#ff5a14'), emissiveIntensity: 0 }),
    ti: new THREE.MeshStandardMaterial({ color: '#9a9ca6', roughness: 0.18, metalness: 1 }),
    tiHot: new THREE.MeshStandardMaterial({ color: '#6a5f86', roughness: 0.2, metalness: 1 }),
    screen: new THREE.MeshPhysicalMaterial({ color: '#2a2a33', roughness: 0.02, metalness: 0.1, transparent: true, opacity: 0.5, clearcoat: 1 }),
    tail: new THREE.MeshStandardMaterial({ color: '#300', emissive: '#ff2010', emissiveIntensity: 3 }),
    leather: new THREE.MeshStandardMaterial({ color: '#9a2129', roughness: 0.5, metalness: 0.05 }),
    leatherCream: new THREE.MeshStandardMaterial({ color: '#cbbd9e', roughness: 0.55 }),
    leatherInk: new THREE.MeshStandardMaterial({ color: '#1d1917', roughness: 0.48 }),
    slider: new THREE.MeshStandardMaterial({ color: '#d9a95b', roughness: 0.35, metalness: 0.7 }),
    helmet: new THREE.MeshPhysicalMaterial({ map: TX.helmetTexture(), roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.04 }),
    visor: new THREE.MeshPhysicalMaterial({ color: '#4a2f10', roughness: 0.03, metalness: 0.95, clearcoat: 1 }),
  };
}

export class BikeModel {
  constructor(mats = makeMaterials()) {
    this.m = mats;
    this.root = new THREE.Group();       // at ground contact, yaw/pitch
    this.leanG = new THREE.Group();      // roll about the contact line
    this.pitchG = new THREE.Group();     // wheelie / stoppie
    this.root.add(this.leanG);
    this.leanG.add(this.pitchG);
    this.body = new THREE.Group();
    this.pitchG.add(this.body);
    this.static = [];
    this.#buildBike();
    this.#mergeStatic();
    this.#buildRider();
    this.root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.wheelSpin = 0;
  }

  #add(mesh) { this.body.add(mesh); this.static.push(mesh); return mesh; }

  #buildBike() {
    const m = this.m;
    // --- Main fairing
    const fs = new THREE.Shape();
    fs.moveTo(1.1, 0.66);
    fs.quadraticCurveTo(1.07, 0.86, 0.86, 0.95);
    fs.lineTo(0.62, 1.0);
    fs.quadraticCurveTo(0.5, 1.02, 0.44, 0.96);
    fs.quadraticCurveTo(0.34, 0.72, 0.1, 0.56);
    fs.quadraticCurveTo(-0.14, 0.44, -0.22, 0.3);
    fs.quadraticCurveTo(-0.26, 0.17, -0.12, 0.14);
    fs.lineTo(0.3, 0.13);
    fs.quadraticCurveTo(0.42, 0.16, 0.42, 0.36);
    fs.quadraticCurveTo(0.46, 0.64, 0.72, 0.665);
    fs.quadraticCurveTo(0.96, 0.67, 1.1, 0.66);
    const fairTaper = (z, y) => lerp(0.4, 1, ss(1.16, 0.6, z)) * lerp(0.72, 1, ss(0.08, 0.42, y)) * lerp(1, 0.8, ss(0.88, 1.04, y)) * lerp(0.82, 1, ss(-0.28, 0.1, z));
    const fg = sculpt(fs, 0.36, 0.075, fairTaper);
    this.fairing = new THREE.Mesh(fg, [liveryMaterial(m.livR, m.livL, { minx: -0.27, maxx: 1.1, miny: 0.13, maxy: 1.02 }), m.paint]);
    this.body.add(this.fairing);
    // --- Tank
    const ts = new THREE.Shape();
    ts.moveTo(0.46, 0.96);
    ts.quadraticCurveTo(0.36, 1.13, 0.12, 1.12);
    ts.quadraticCurveTo(-0.04, 1.11, -0.06, 0.98);
    ts.lineTo(-0.06, 0.84); ts.lineTo(0.42, 0.82);
    this.#add(new THREE.Mesh(sculpt(ts, 0.3, 0.06, (z, y) => lerp(1, 0.7, ss(1.0, 1.14, y))), m.paintInk));
    // --- Tail unit
    const tl = new THREE.Shape();
    tl.moveTo(0.0, 0.88);
    tl.lineTo(-0.36, 0.91);
    tl.quadraticCurveTo(-0.44, 0.93, -0.5, 1.0);
    tl.lineTo(-0.96, 1.07);
    tl.quadraticCurveTo(-1.02, 1.06, -0.99, 1.0);
    tl.quadraticCurveTo(-0.8, 0.86, -0.5, 0.78);
    tl.quadraticCurveTo(-0.2, 0.72, 0.0, 0.76);
    const tg = sculpt(tl, 0.24, 0.05, (z, y) => lerp(1, 0.42, ss(-0.4, -1.02, z)) * lerp(1, 0.85, ss(0.95, 1.08, y)));
    this.tailMesh = new THREE.Mesh(tg, [liveryMaterial(m.tailR, m.tailL, { minx: -1.02, maxx: 0.0, miny: 0.72, maxy: 1.07 }), m.paint]);
    this.body.add(this.tailMesh);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.035, 0.34), m.carbon);
    seat.position.set(0, 0.91, -0.2); seat.rotation.x = 0.06; this.#add(seat);
    // --- Bubble screen
    const scr = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), m.screen);
    scr.scale.set(0.16, 0.12, 0.3); scr.position.set(0, 0.965, 0.66); scr.rotation.x = 0.26;
    this.body.add(scr);
    // --- Tail light
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 0.02), m.tail);
    lamp.position.set(0, 0.99, -0.995); lamp.rotation.x = -0.4; this.#add(lamp);
    // --- Aero wings
    for (const sx of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, 0.14), m.paint);
      w.position.set(sx * 0.17, 0.72, 0.96); w.rotation.z = sx * -0.3; w.rotation.x = -0.12; this.#add(w);
      const e = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.045, 0.14), m.paint);
      e.position.set(sx * 0.2, 0.73, 0.96); this.#add(e);
    }
    // --- Wheels
    this.frontWheel = this.#wheel(true); this.frontWheel.position.set(0, 0.3, 0.7);
    this.rearWheel = this.#wheel(false); this.rearWheel.position.set(0, 0.3, -0.72);
    this.body.add(this.frontWheel, this.rearWheel);
    // --- Front mudguard
    const fender = new THREE.Mesh(new THREE.TorusGeometry(0.325, 0.03, 6, 20, 1.2), m.paint);
    fender.geometry.rotateZ(0.95);
    fender.rotation.y = Math.PI / 2; fender.position.set(0, 0.3, 0.7); fender.scale.set(1, 1, 1.6);
    this.#add(fender);
    // --- Forks (rake ~24 deg), calipers
    const rake = 0.42;
    for (const sx of [-1, 1]) {
      for (const [mat, r, len, off] of [[m.carbon, 0.03, 0.3, 0.15], [m.gold, 0.026, 0.36, 0.46]]) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), mat);
        p.rotation.x = -rake;
        p.position.set(sx * 0.1, 0.3 + Math.cos(rake) * off, 0.7 - Math.sin(rake) * off);
        this.#add(p);
      }
      const cal = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.13, 0.06), m.gold);
      cal.position.set(sx * 0.09, 0.43, 0.6); cal.rotation.x = 0.5; this.#add(cal);
    }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.52, 8), m.alu);
    bar.rotation.z = Math.PI / 2; bar.position.set(0, 0.95, 0.47); this.#add(bar);
    // --- Swingarm (tapered)
    for (const sx of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.64), m.carbon);
      const pa = arm.geometry.attributes.position;
      for (let i = 0; i < pa.count; i++) if (pa.getZ(i) < 0) pa.setY(i, pa.getY(i) * 0.6);
      arm.geometry.computeVertexNormals();
      arm.position.set(sx * 0.1, 0.35, -0.42); arm.rotation.x = 0.16; this.#add(arm);
    }
    // --- Engine glimpse, exhaust
    const eng = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.42), m.carbon);
    eng.position.set(0, 0.33, 0.06); this.#add(eng);
    const exA = V(-0.1, 0.6, -0.42), exB = V(-0.1, 0.78, -0.8);
    const dir = exB.clone().sub(exA);
    const dn = dir.clone().normalize();
    const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.046, dir.length(), 18), m.ti);
    ex.position.copy(exA).lerp(exB, 0.5); ex.quaternion.setFromUnitVectors(UP, dn); this.#add(ex);
    const hot = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.052, 0.12, 18), m.tiHot);
    hot.position.copy(exA).addScaledVector(dn, 0.03); hot.quaternion.copy(ex.quaternion); this.#add(hot);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 18), new THREE.MeshStandardMaterial({ color: '#0c0c0c', roughness: 0.9 }));
    cap.position.copy(exB).addScaledVector(dn, 0.004); cap.quaternion.copy(ex.quaternion); this.#add(cap);
    this.exhaustTip = exB.clone().addScaledVector(dn, 0.06);
  }

  // Merge static parts by material: fewer draw calls for the player bike and the ghost.
  #mergeStatic() {
    const byMat = new Map();
    for (const mesh of this.static) {
      mesh.updateMatrix();
      const g = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      g.applyMatrix4(mesh.matrix);
      for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
      g.clearGroups();
      if (!byMat.has(mesh.material)) byMat.set(mesh.material, []);
      byMat.get(mesh.material).push(g);
      this.body.remove(mesh);
    }
    for (const [mat, list] of byMat) this.body.add(new THREE.Mesh(mergeGeometries(list, false), mat));
    this.static = [];
  }

  #wheel(front) {
    const m = this.m;
    const g = new THREE.Group();
    const spin = new THREE.Group();
    g.add(spin);
    const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.236, 0.064, 14, 40), m.rubber);
    tyre.rotation.y = Math.PI / 2; tyre.scale.set(1, 1, front ? 1.0 : 1.3);
    spin.add(tyre);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.013, 8, 36), m.gold);
    rim.rotation.y = Math.PI / 2; spin.add(rim);
    for (let k = 0; k < 5; k++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.2, 0.02), m.carbon);
      sp.geometry.translate(0, 0.1, 0);
      sp.rotation.x = k * Math.PI * 2 / 5;
      spin.add(sp);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 12), m.alu);
    hub.rotation.z = Math.PI / 2; spin.add(hub);
    for (const x of front ? [-0.078, 0.078] : [0.075]) {
      const r = front ? 0.165 : 0.11;
      const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.008, 32), m.disc);
      d.rotation.z = Math.PI / 2; d.position.x = x; spin.add(d);
    }
    g.userData.spin = spin;
    return g;
  }

  #buildRider() {
    const m = this.m;
    this.rider = new THREE.Group();
    this.body.add(this.rider);
    const limb = (r, len, mat) => {
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, len - 2 * r), 6, 14), mat);
      mesh.userData.len = len;
      this.rider.add(mesh);
      return mesh;
    };
    const ball = (r, mat) => { const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), mat); this.rider.add(mesh); return mesh; };
    const L = this.limbs = {};
    L.torso = limb(0.15, 0.64, m.leather);
    L.hump = ball(0.13, m.leather);
    L.pelvis = ball(0.16, m.leatherInk);
    for (const s of ['l', 'r']) {
      L['upper_' + s] = limb(0.058, 0.3, m.leatherInk);
      L['fore_' + s] = limb(0.052, 0.3, m.leather);
      L['hand_' + s] = ball(0.05, m.leatherInk);
      L['thigh_' + s] = limb(0.088, 0.44, m.leather);
      L['shin_' + s] = limb(0.066, 0.42, m.leatherInk);
      L['slider_' + s] = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.13), m.slider);
      this.rider.add(L['slider_' + s]);
      L['boot_' + s] = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.1, 0.26), m.leatherInk);
      this.rider.add(L['boot_' + s]);
    }
    L.neck = limb(0.058, 0.16, m.leatherInk);
    // race number on the back hump
    const num = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.055), new THREE.MeshStandardMaterial({ map: TX.decalTexture('number'), transparent: true, roughness: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
    num.position.set(0, 0.02, -0.132); num.rotation.y = Math.PI;
    L.hump.add(num);
    this.helmet = new THREE.Group();
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.148, 32, 20), m.helmet);
    shell.rotation.y = -Math.PI / 2;
    shell.scale.set(1, 0.95, 1.12);
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.151, 28, 10, Math.PI / 2 - 0.95, 1.9, 1.15, 0.55), m.visor);
    visor.scale.set(1, 0.95, 1.12);
    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.08), m.paintInk);
    spoiler.position.set(0, 0.075, -0.16); spoiler.rotation.x = 0.45;
    this.helmet.add(shell, visor, spoiler);
    this.rider.add(this.helmet);
    this._d = V(0, 0, 0);
    this.pose(0, 0, 1);
  }

  #place(mesh, a, b) {
    const d = this._d.subVectors(b, a);
    const len = d.length();
    mesh.position.addVectors(a, b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, d.divideScalar(len));
    mesh.scale.set(1, len / mesh.userData.len, 1);
  }

  // hang: -1..1 (+ = hanging off to the right), tuck: 0..1, brake: 0..1 (sit up)
  pose(hang, lean, tuck, brake = 0) {
    const L = this.limbs;
    const h = hang, ah = Math.abs(h);
    const up = Math.max(0, Math.min(1, 1 - tuck + brake * 0.6));
    const shiftX = -h * 0.2; // right = -x
    const hipC = V(shiftX, 0.99 - ah * 0.04, -0.3);
    const chest = V(shiftX * 1.4, 1.12 + up * 0.15 - ah * 0.03, 0.12 - up * 0.1);
    const head = V(shiftX * 1.9 - h * 0.05, 1.19 + up * 0.21 - ah * 0.03, 0.33 - up * 0.1);
    const shL = V(chest.x + 0.18, chest.y + 0.02 - h * 0.05, chest.z + 0.04);
    const shR = V(chest.x - 0.18, chest.y + 0.02 + h * 0.05, chest.z + 0.04);
    const grip = { l: V(0.25, 0.95, 0.47), r: V(-0.25, 0.95, 0.47) };
    const el = {
      l: V(0.32 + Math.max(0, h) * 0.05, 1.01 + up * 0.05, 0.22),
      r: V(-0.32 - Math.max(0, -h) * 0.05, 1.01 + up * 0.05, 0.22),
    };
    const hip = { l: V(hipC.x + 0.11, hipC.y, hipC.z), r: V(hipC.x - 0.11, hipC.y, hipC.z) };
    const peg = { l: V(0.17, 0.5, -0.4), r: V(-0.17, 0.5, -0.4) };
    const outL = Math.max(0, -h), outR = Math.max(0, h);
    const knee = {
      l: V(0.22 + outL * 0.3, 0.78 - outL * 0.17, 0.02 + outL * 0.06),
      r: V(-0.22 - outR * 0.3, 0.78 - outR * 0.17, 0.02 + outR * 0.06),
    };
    const sh = { l: shL, r: shR };
    for (const s of ['l', 'r']) {
      this.#place(L['upper_' + s], sh[s], el[s]);
      this.#place(L['fore_' + s], el[s], grip[s]);
      L['hand_' + s].position.copy(grip[s]);
      this.#place(L['thigh_' + s], hip[s], knee[s]);
      this.#place(L['shin_' + s], knee[s], peg[s]);
      L['slider_' + s].position.copy(knee[s]).add(V(s === 'l' ? 0.08 : -0.08, -0.02, 0.03));
      L['boot_' + s].position.copy(peg[s]).add(V(0, -0.02, 0.03));
    }
    this.#place(L.torso, hipC, chest);
    L.torso.scale.x = 1.22; L.torso.scale.z = 0.86;
    L.hump.position.copy(chest).lerp(hipC, 0.4);
    L.hump.quaternion.copy(L.torso.quaternion);
    L.hump.translateZ(-0.1);
    L.hump.scale.set(0.95, 1.5, 0.75);
    L.pelvis.position.copy(hipC); L.pelvis.scale.set(1.12, 0.78, 1.1);
    const neckTop = head.clone().add(V(0, -0.08, -0.06));
    this.#place(L.neck, chest.clone().add(V(0, 0.06, 0.02)), neckTop);
    this.helmet.position.copy(head);
    this.helmet.rotation.set(-0.15 + up * 0.25, h * 0.35, -lean * 0.45);
    this.kneeL = L.slider_l.position; this.kneeR = L.slider_r.position;
  }

  // Called per frame with the physics state.
  update(dt, st) {
    this.wheelSpin += (st.v / 0.3) * dt;
    this.frontWheel.userData.spin.rotation.x = this.wheelSpin;
    this.rearWheel.userData.spin.rotation.x = this.wheelSpin;
    this.leanG.rotation.z = st.lean;
    const p = st.pitch || 0;
    if (p < 0) { this.pitchG.position.set(0, 0, -0.72); this.body.position.set(0, 0, 0.72); }
    else { this.pitchG.position.set(0, 0, 0.7); this.body.position.set(0, 0, -0.7); }
    this.pitchG.rotation.x = p;
    const hang = Math.max(-1, Math.min(1, st.lean / 0.9));
    this.pose(hang, st.lean, st.tuck, st.brake);
    this.m.disc.emissiveIntensity = Math.min(3, st.discHeat * 3);
    this.root.updateMatrixWorld(true);
  }

  kneeWorld(right, out) {
    out.copy(right ? this.kneeR : this.kneeL);
    return this.rider.localToWorld(out);
  }
}

// Ghost: same model, one additive fresnel material.
export function makeGhost() {
  const ghostMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(BRAND.gold) }, uAlpha: { value: 0.55 } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uAlpha; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0); gl_FragColor = vec4(uColor * (0.12 + f*1.5) * uAlpha, 1.0); }`,
  });
  const b = new BikeModel();
  b.root.traverse(o => { if (o.isMesh) { o.material = ghostMat; o.castShadow = false; o.receiveShadow = false; } });
  b.ghostMat = ghostMat;
  return b;
}
