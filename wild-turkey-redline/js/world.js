// Scenery: sky, sun, terrain, Kentucky River palisades, trees, rickhouses, grandstands, gantry.
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { QUALITY, BRAND } from './config.js';
import * as TX from './textures.js';
import { SECTIONS } from './track.js';

// ---------- noise ----------
function hash2(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, oct = 4) {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; }
  return s;
}
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// River runs north-south east of the circuit.
const riverX = (z) => 800 + 55 * Math.sin(z / 260) + 25 * Math.sin(z / 97);
const RIVER_Y = -40;

export function terrainHeight(x, z) {
  let h = (fbm(x / 520, z / 520) - 0.5) * 46 + (fbm(x / 140 + 11, z / 140 - 7, 3) - 0.5) * 7;
  const r = Math.hypot(x + 30, z - 300);
  h += smooth(700, 1500, r) * 55 * fbm(x / 300 + 3, z / 300 + 9, 3);
  // Kentucky River gorge with limestone palisades
  const dx = Math.abs(x - riverX(z));
  const gorge = 1 - smooth(95, 150, dx);
  h = h * (1 - gorge) + (RIVER_Y - 6) * gorge;
  return h;
}

// Sun-aware fog: warm amber haze toward the sun, cool lilac away from it, thinner looking up.
// The sun is fixed, so its direction is baked into the shader chunk as a constant.
export function installSunFog(sunDir, sunColor) {
  const c = sunColor;
  const v3 = (v) => `vec3(${v.x.toFixed(4)}, ${v.y.toFixed(4)}, ${v.z.toFixed(4)})`;
  THREE.ShaderChunk.fog_pars_vertex = `#ifdef USE_FOG\n varying float vFogDepth;\n varying vec3 vFogDir;\n#endif`;
  THREE.ShaderChunk.fog_vertex = `#ifdef USE_FOG\n vFogDepth = - mvPosition.z;\n vFogDir = (vec4(mvPosition.xyz, 0.0) * viewMatrix).xyz;\n#endif`;
  THREE.ShaderChunk.fog_pars_fragment = `#ifdef USE_FOG
    uniform vec3 fogColor;
    varying float vFogDepth;
    varying vec3 vFogDir;
    #ifdef FOG_EXP2
      uniform float fogDensity;
    #else
      uniform float fogNear;
      uniform float fogFar;
    #endif
  #endif`;
  THREE.ShaderChunk.fog_fragment = `#ifdef USE_FOG
    vec3 fdir = normalize(vFogDir);
    float sunAmt = pow(max(dot(fdir, ${v3(sunDir)}), 0.0), 8.0) * 0.85;
    vec3 fcol = mix(fogColor, vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)}), sunAmt);
    #ifdef FOG_EXP2
      float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
    #else
      float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
    #endif
    fogFactor *= clamp(1.0 - fdir.y * 3.0, 0.2, 1.0);
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fcol, fogFactor );
  #endif`;
}

export class World {
  constructor(scene, renderer, track) {
    this.scene = scene;
    this.renderer = renderer;
    this.track = track;
    this.animated = [];
    this.sunDir = new THREE.Vector3();
    this.#sky();
    this.#lights();
    this.#terrain();
    this.#river();
    this.#structures();
    this.#trees();
  }

  #sky() {
    const sky = new Sky();
    sky.scale.setScalar(20000);
    const u = sky.material.uniforms;
    u.turbidity.value = 9;
    u.rayleigh.value = 2.8;
    u.mieCoefficient.value = 0.007;
    u.mieDirectionalG.value = 0.88;
    // Low golden-hour sun: ahead-right of the main straight, so the grid shot is backlit.
    const elev = THREE.MathUtils.degToRad(5), az = THREE.MathUtils.degToRad(40);
    this.sunDir.set(Math.cos(elev) * Math.sin(az), Math.sin(elev), Math.cos(elev) * Math.cos(az)).normalize();
    u.sunPosition.value.copy(this.sunDir);
    this.sky = sky;
    this.scene.add(sky);

    // Environment lighting from the same sky.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const envScene = new THREE.Scene();
    const envSky = new Sky();
    envSky.scale.setScalar(1000);
    for (const k of Object.keys(u)) envSky.material.uniforms[k].value = u[k].value;
    envScene.add(envSky);
    // warm ground bounce so reflections aren't black below the horizon
    const ground = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x3a3020, side: THREE.BackSide }));
    envScene.add(ground);
    this.envMap = pmrem.fromScene(envScene, 0.02).texture;
    this.scene.environment = this.envMap;
    pmrem.dispose();

    this.scene.fog = new THREE.FogExp2(0xa895a6, 0.00042);
    installSunFog(this.sunDir, new THREE.Color(0xf59a52));
    this.#clouds();
  }

  // Stylised sunset cloud deck: fbm on a plane projected onto a dome, lit from the sun.
  #clouds() {
    const s = this.sunDir;
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.BackSide, fog: false,
      uniforms: { uTime: { value: 0 }, uSun: { value: s.clone() } },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`,
      fragmentShader: `
        uniform float uTime; uniform vec3 uSun; varying vec3 vDir;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a*n(p); p = p*2.03 + 7.1; a *= 0.5; } return s; }
        void main(){
          vec3 d = normalize(vDir);
          if (d.y < 0.005) discard;
          vec2 uv = d.xz / (d.y + 0.08) * 0.9 + vec2(uTime*0.004, uTime*0.002);
          float c = fbm(uv*1.3);
          c = smoothstep(0.52, 0.8, c) * smoothstep(0.0, 0.12, d.y) * (1.0 - smoothstep(0.45, 0.9, d.y));
          float thick = fbm(uv*1.3 + 0.6);
          float sunF = pow(max(dot(d, uSun), 0.0), 3.0);
          vec3 base = mix(vec3(0.28,0.22,0.34), vec3(0.62,0.38,0.40), 0.4);
          vec3 lit = mix(vec3(1.9,1.0,0.55), vec3(3.2,1.7,0.8), sunF);
          vec3 col = mix(base, lit, clamp((1.0 - thick)*1.4 + sunF*0.6, 0.0, 1.0));
          gl_FragColor = vec4(col, c * 0.9);
        }`,
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(8000, 48, 24), mat);
    dome.renderOrder = -1;
    dome.frustumCulled = false;
    this.cloudMat = mat;
    this.scene.add(dome);
  }

  #lights() {
    const sun = new THREE.DirectionalLight(0xffa35c, 4.0);
    sun.castShadow = true;
    sun.shadow.mapSize.set(QUALITY.shadowMap, QUALITY.shadowMap);
    const c = sun.shadow.camera;
    c.left = -40; c.right = 40; c.top = 40; c.bottom = -40; c.near = 1; c.far = 400;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.04;
    this.scene.add(sun, sun.target);
    this.sun = sun;
    const hemi = new THREE.HemisphereLight(0x9aa2d0, 0x6a4a30, 0.55);
    this.scene.add(hemi);
    // cool sky fill from the opposite side so shaded flanks keep their shape
    const fill = new THREE.DirectionalLight(0x8a9ad0, 0.7);
    fill.position.set(-this.sunDir.x, 0.6, -this.sunDir.z);
    this.scene.add(fill);
  }

  // Keep the shadow frustum centred on the player.
  followShadow(pos) {
    this.sun.position.copy(pos).addScaledVector(this.sunDir, 200);
    this.sun.target.position.copy(pos);
  }

  #terrain() {
    const size = 3600, seg = QUALITY.terrainSeg;
    const cx = -30, cz = 300;
    const geo = new THREE.PlaneGeometry(size, size, seg, seg);
    geo.rotateX(-Math.PI / 2);
    geo.translate(cx, 0, cz);
    const pos = geo.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const near = {};
    const track = this.track;
    const hArr = new Float32Array(pos.count);
    const dArr = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      let h = terrainHeight(x, z);
      track.nearest(x, z, 3, near);
      const d = near.d;
      if (d < 150) {
        const w = smooth(30, 130, d);
        h = (near.y - 0.45) * (1 - w) + Math.max(h, near.y - 30) * w;
      }
      hArr[i] = h; dArr[i] = d;
      pos.setY(i, h);
    }
    geo.computeVertexNormals();
    const nrm = geo.attributes.normal;
    const cGrass = new THREE.Color('#5b7433'), cDry = new THREE.Color('#a48a47'), cDeep = new THREE.Color('#3f5a2a');
    const cRock = new THREE.Color('#b7a78a'), cRockDark = new THREE.Color('#7d705c'), cMud = new THREE.Color('#6b5a3c');
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const ny = nrm.getY(i);
      const n = fbm(x / 90, z / 90, 3);
      tmp.copy(cGrass).lerp(cDry, smooth(0.45, 0.75, n)).lerp(cDeep, smooth(0.5, 0.2, n) * 0.6);
      if (dArr[i] < 34) tmp.lerp(new THREE.Color('#62823a'), 0.6);
      const rock = smooth(0.86, 0.7, ny);
      if (rock > 0) tmp.lerp(hash2(Math.floor(x / 6), Math.floor(hArr[i] / 3)) > 0.5 ? cRock : cRockDark, rock);
      if (hArr[i] < RIVER_Y + 3) tmp.lerp(cMud, 0.8);
      col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const detail = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const g = c.getContext('2d'); g.fillStyle = '#d8d8d8'; g.fillRect(0, 0, 256, 256);
      const r = TX.rng(4);
      for (let i = 0; i < 9000; i++) { const v = 150 + r() * 105 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 3); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(size / 9, size / 9);
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
    })();
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, map: detail, roughness: 0.97, metalness: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.terrain = mesh;
    this.heightAt = (x, z) => {
      // bilinear lookup on the generated grid
      const fx = (x - (cx - size / 2)) / size * seg, fz = (z - (cz - size / 2)) / size * seg;
      const ix = Math.max(0, Math.min(seg - 1, Math.floor(fx))), iz = Math.max(0, Math.min(seg - 1, Math.floor(fz)));
      const tx = fx - ix, tz = fz - iz, W = seg + 1;
      const a = hArr[iz * W + ix], b = hArr[iz * W + ix + 1], c = hArr[(iz + 1) * W + ix], d = hArr[(iz + 1) * W + ix + 1];
      return a + (b - a) * tx + (c - a) * tz + (a - b - c + d) * tx * tz;
    };
    this.trackDist = dArr;
  }

  #river() {
    const geo = new THREE.PlaneGeometry(420, 3600, 1, 1);
    geo.rotateX(-Math.PI / 2);
    const water = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: 0x2c4a50, roughness: 0.08, metalness: 0.9, envMapIntensity: 1.3,
    }));
    water.position.set(800, RIVER_Y + 1.5, 300);
    this.scene.add(water);

    // Young's High Bridge–style steel viaduct across the gorge (landmark on the skyline).
    const bridge = new THREE.Group();
    const steel = new THREE.MeshStandardMaterial({ color: 0x3b3430, metalness: 0.6, roughness: 0.55 });
    const z = 1080, y = 18, x0 = 600, x1 = 1010;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 2.2, 7), steel);
    deck.position.set((x0 + x1) / 2, y, z);
    bridge.add(deck);
    const spans = 6;
    for (let k = 0; k <= spans; k++) {
      const x = x0 + (x1 - x0) * k / spans;
      const ground = terrainHeight(x, z);
      const h = y - ground;
      if (h > 4) {
        const pier = new THREE.Mesh(new THREE.BoxGeometry(5, h, 9), steel);
        pier.geometry.translate(0, h / 2, 0);
        pier.position.set(x, ground, z);
        bridge.add(pier);
      }
      if (k < spans) {
        const len = (x1 - x0) / spans;
        for (const side of [-3.4, 3.4]) {
          const top = new THREE.Mesh(new THREE.BoxGeometry(len, 0.6, 0.6), steel);
          top.position.set(x + len / 2, y + 9, z + side);
          bridge.add(top);
          for (let q = 0; q < 4; q++) {
            const diag = new THREE.Mesh(new THREE.BoxGeometry(0.4, 12.5, 0.4), steel);
            diag.position.set(x + len * (q + 0.5) / 4, y + 4.5, z + side);
            diag.rotation.z = q % 2 ? 0.75 : -0.75;
            bridge.add(diag);
          }
        }
      }
    }
    this.scene.add(bridge);
  }

  #trees() {
    const r = TX.rng(42);
    const count = QUALITY.trees;
    const canopyGeo = new THREE.IcosahedronGeometry(1, 1);
    // lumpy canopy
    const p = canopyGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(p, i);
      const k = 1 + (hash2(Math.round(v.x * 50), Math.round(v.y * 50 + v.z * 30)) - 0.5) * 0.35;
      p.setXYZ(i, v.x * k, v.y * k * 0.9, v.z * k);
    }
    canopyGeo.computeVertexNormals();
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.2, 1, 5);
    trunkGeo.translate(0, 0.5, 0);
    const pineGeo = new THREE.ConeGeometry(1, 1, 7);
    pineGeo.translate(0, 0.5, 0);

    const leafMat = new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3b2a1e, roughness: 1 });
    const pineMat = new THREE.MeshStandardMaterial({ color: 0x2c3f25, roughness: 0.95, flatShading: true });
    const canopy = new THREE.InstancedMesh(canopyGeo, leafMat, count * 2);
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
    const pines = new THREE.InstancedMesh(pineGeo, pineMat, Math.floor(count * 0.35));
    const autumn = ['#b5471f', '#d08a2c', '#8e2a1c', '#c9a13a', '#9a5a22', '#6f7a2e', '#4f6a2c', '#d9b24a', '#a33a1a']
      .map(c => new THREE.Color(c));
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), t = new THREE.Vector3();
    let nc = 0, nt = 0, np = 0;
    const near = {};
    const avoid = this.#avoidZones();
    let attempts = 0;
    while ((nt < count || np < pines.count) && attempts < count * 30) {
      attempts++;
      const x = -1500 + r() * 2900, z = -900 + r() * 2400;
      const dens = fbm(x / 260 + 5, z / 260 + 1, 3);
      if (dens < 0.46 && r() > 0.12) continue;
      this.track.nearest(x, z, 2, near);
      if (near.d < 36) continue;
      if (avoid(x, z)) continue;
      const y = this.heightAt(x, z);
      if (y < RIVER_Y + 4) continue;
      const pine = r() < 0.22;
      const sc = 5 + r() * 7;
      if (pine && np < pines.count) {
        t.set(x, y - 0.3, z); s.set(sc * 0.42, sc * 2.1, sc * 0.42);
        q.setFromEuler(new THREE.Euler(0, r() * 6, 0));
        pines.setMatrixAt(np++, m.compose(t, q, s));
      } else if (!pine && nt < count) {
        t.set(x, y - 0.2, z); s.set(1.3, sc * 0.55, 1.3);
        q.setFromEuler(new THREE.Euler(0, r() * 6, 0));
        trunks.setMatrixAt(nt++, m.compose(t, q, s));
        const col = autumn[(r() * autumn.length) | 0].clone().offsetHSL(0, 0, (r() - 0.5) * 0.08);
        for (let k = 0; k < 2 && nc < canopy.count; k++) {
          const cs = sc * (0.5 - k * 0.12) * (0.8 + r() * 0.4);
          t.set(x + (r() - 0.5) * sc * 0.4, y + sc * (0.62 + k * 0.28), z + (r() - 0.5) * sc * 0.4);
          s.set(cs, cs * 0.85, cs);
          q.setFromEuler(new THREE.Euler(r(), r() * 6, r()));
          canopy.setMatrixAt(nc, m.compose(t, q, s));
          canopy.setColorAt(nc++, col);
        }
      }
    }
    canopy.count = nc; trunks.count = nt; pines.count = np;
    canopy.instanceColor.needsUpdate = true;
    for (const im of [canopy, trunks, pines]) { im.receiveShadow = true; im.frustumCulled = false; this.scene.add(im); }
    this.canopy = canopy;
  }

  #avoidZones() {
    const boxes = this.placedBoxes = this.placedBoxes || [];
    return (x, z) => boxes.some(b => Math.abs(x - b.x) < b.hx && Math.abs(z - b.z) < b.hz);
  }

  // Place an object aligned to the track at (s, lateral), facing the track.
  #place(obj, s, lat, yOff = 0, faceTrack = true) {
    const f = this.track.frame(s);
    const x = f.x + f.rx * lat, z = f.z + f.rz * lat;
    const y = (Math.abs(lat) < 30 ? f.y : this.heightAt(x, z)) + yOff;
    obj.position.set(x, y, z);
    // local +z faces the track centreline
    const yaw = Math.atan2(f.tx, f.tz);
    obj.rotation.y = faceTrack ? yaw + (lat > 0 ? Math.PI / 2 : -Math.PI / 2) : yaw;
    this.scene.add(obj);
    return obj;
  }

  #structures() {
    const T = this.track;
    this.placedBoxes = this.placedBoxes || [];
    const reserve = (s, lat, hx, hz) => {
      const p = T.toWorld(s, lat);
      this.placedBoxes.push({ x: p.x, z: p.z, hx, hz });
    };

    // --- Start / finish gantry with lights
    const gantry = new THREE.Group();
    const dark = new THREE.MeshStandardMaterial({ color: 0x1b1512, roughness: 0.5, metalness: 0.4 });
    const gTex = TX.gantryTexture();
    const bannerMat = new THREE.MeshStandardMaterial({ map: gTex, roughness: 0.6, emissive: 0xffffff, emissiveMap: gTex, emissiveIntensity: 0.25 });
    for (const x of [-10.5, 10.5]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(1.2, 9, 1.2), dark);
      leg.position.set(x, 4.5, 0); leg.castShadow = true; gantry.add(leg);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(22.2, 2.6, 1.3), [dark, dark, dark, dark, bannerMat, bannerMat]);
    beam.position.set(0, 8.2, 0); beam.castShadow = true; gantry.add(beam);
    // lights: 5 pods facing the grid (-z in gantry space)
    this.startLights = [];
    for (let n = 0; n < 5; n++) {
      const pod = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.4), dark);
      pod.position.set(-3.2 + n * 1.6, 6.2, -0.4);
      gantry.add(pod);
      const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.36, 20), new THREE.MeshStandardMaterial({ color: 0x220505, emissive: 0xff1a10, emissiveIntensity: 0 }));
      lamp.position.set(-3.2 + n * 1.6, 6.2, -0.62);
      lamp.rotation.y = Math.PI;
      gantry.add(lamp);
      this.startLights.push(lamp.material);
    }
    const f0 = T.frame(0);
    gantry.position.set(f0.x, f0.y, f0.z);
    gantry.rotation.y = Math.atan2(f0.tx, f0.tz);
    this.scene.add(gantry);

    // --- Pit building (infield, right of main straight)
    const pit = new THREE.Group();
    const cream = new THREE.MeshStandardMaterial({ color: 0xe9e0cc, roughness: 0.7 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x1c2228, roughness: 0.05, metalness: 0.9, envMapIntensity: 1.2 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(200, 8, 16), cream);
    body.position.y = 4; body.castShadow = true; body.receiveShadow = true; pit.add(body);
    const band = new THREE.Mesh(new THREE.BoxGeometry(198, 3.2, 0.3), glass);
    band.position.set(0, 6.2, 8.05); pit.add(band);
    for (let k = 0; k < 16; k++) {
      const door = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.8), new THREE.MeshStandardMaterial({ color: k % 2 ? 0x2a2320 : 0x3a302b, roughness: 0.6 }));
      door.position.set(-90 + k * 12, 1.9, 8.02); pit.add(door);
    }
    const redLine = new THREE.Mesh(new THREE.BoxGeometry(200, 0.35, 0.2), new THREE.MeshStandardMaterial({ color: 0xc22a2e, emissive: 0x8b1e24, emissiveIntensity: 0.6 }));
    redLine.position.set(0, 8.1, 8.1); pit.add(redLine);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(60, 9.4), new THREE.MeshBasicMaterial({ map: TX.rickhouseSignTexture(), transparent: true, depthWrite: false }));
    sign.position.set(0, 13.2, 7.2); pit.add(sign);
    const signBack = new THREE.Mesh(new THREE.BoxGeometry(64, 7, 0.6), dark);
    signBack.position.set(0, 13, 6.8); pit.add(signBack);
    this.#place(pit, 30, 44, 0);
    reserve(30, 44, 110, 20);

    // --- Grandstands
    const standMatCrowd = this.#crowdMaterial();
    const makeStand = (len, rows) => {
      const grp = new THREE.Group();
      const prof = new THREE.Shape();
      prof.moveTo(0, 0);
      for (let r2 = 0; r2 < rows; r2++) { prof.lineTo(r2 * 1.0, r2 * 0.62 + 0.8); prof.lineTo((r2 + 1) * 1.0, r2 * 0.62 + 0.8); }
      prof.lineTo(rows * 1.0, 0); prof.lineTo(0, 0);
      const g = new THREE.ExtrudeGeometry(prof, { depth: len, bevelEnabled: false });
      g.translate(0, 0, -len / 2);
      g.rotateY(Math.PI / 2); // profile depth along -z (away from track), length along x
      const concrete = new THREE.MeshStandardMaterial({ color: 0x8e8578, roughness: 0.9 });
      const seats = new THREE.Mesh(g, concrete);
      seats.castShadow = true; seats.receiveShadow = true;
      grp.add(seats);
      // roof
      const roof = new THREE.Mesh(new THREE.BoxGeometry(len, 0.4, rows + 3), new THREE.MeshStandardMaterial({ color: 0x5e1419, roughness: 0.6 }));
      roof.position.set(0, rows * 0.62 + 7.5, -rows / 2 - 0.5);
      roof.rotation.x = -0.08;
      roof.castShadow = true;
      grp.add(roof);
      for (let x = -len / 2 + 2; x <= len / 2 - 2; x += 12) {
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.4, rows * 0.62 + 7.5, 0.4), dark);
        col.position.set(x, (rows * 0.62 + 7.5) / 2, -rows - 0.6);
        grp.add(col);
      }
      const fascia = new THREE.Mesh(new THREE.PlaneGeometry(len, 1.6), new THREE.MeshStandardMaterial({ map: TX.airfenceTexture(), roughness: 0.6 }));
      fascia.material.map = fascia.material.map.clone(); fascia.material.map.repeat.set(len / 14, 1); fascia.material.map.needsUpdate = true;
      fascia.position.set(0, rows * 0.62 + 7.2, 1.0);
      grp.add(fascia);
      // crowd
      const perRow = Math.floor(len / 0.62);
      const n = Math.min(rows * perRow, Math.floor(QUALITY.crowd / 3));
      const person = new THREE.BoxGeometry(0.46, 0.8, 0.34);
      person.translate(0, 0.4, 0);
      const crowd = new THREE.InstancedMesh(person, standMatCrowd, n);
      const pal = [BRAND.red, BRAND.red, BRAND.burgundy, BRAND.cream, '#1b1512', '#2e3b55', '#d9d4c8', '#7a3b1e', '#c49a3a', '#355c3a'].map(c => new THREE.Color(c));
      const rr = TX.rng(len * 7 + rows);
      const mm = new THREE.Matrix4();
      let k = 0;
      for (let r2 = 0; r2 < rows && k < n; r2++) for (let c2 = 0; c2 < perRow && k < n; c2++) {
        if (rr() < 0.12) continue;
        mm.makeTranslation(-len / 2 + 0.4 + c2 * 0.62 + (rr() - 0.5) * 0.15, r2 * 0.62 + 0.8, -(r2 + 0.5) * 1.0);
        crowd.setMatrixAt(k, mm);
        crowd.setColorAt(k++, pal[(rr() * pal.length) | 0]);
      }
      crowd.count = k;
      grp.add(crowd);
      return grp;
    };
    // main grandstand opposite the pits
    const main = makeStand(210, 16);
    this.#place(main, 10, -33, 0);
    reserve(10, -40, 115, 20);
    // hairpin grandstand
    const c0 = T.corners[0];
    if (c0) {
      const st = makeStand(90, 12);
      const lat = c0.dir === 'R' ? -33 : 33;
      this.#place(st, c0.apex - 20, lat, 0);
      reserve(c0.apex - 20, lat * 1.2, 60, 60);
    }
    // final-corner stand
    const cl = T.corners[T.corners.length - 1];
    if (cl) {
      const st = makeStand(110, 10);
      this.#place(st, (cl.s0 + cl.s1) / 2, cl.dir === 'R' ? -34 : 34, 0);
    }

    // --- Rickhouses along Rickhouse Row (outside of the long southern sweeper)
    const rickTex = TX.rickhouseTexture();
    const signTex = TX.rickhouseSignTexture();
    const row = SECTIONS.find(x => x.name === 'Rickhouse Row');
    for (let k = 0; k < 4; k++) {
      const s = row.s0 + 60 + k * 88;
      const turn = T.turnSide[Math.floor(T.wrapS(s) / T.ds)];
      const lat = -turn * 64; // outside of the lap
      const rh = this.#rickhouse(rickTex, signTex, k);
      this.#place(rh, s, lat, -0.3);
      reserve(s, lat, 50, 50);
    }

    // --- Barns with quilt squares out in the fields
    const barnSpots = [[-700, -300], [260, 860], [-380, 760], [-900, 420]];
    barnSpots.forEach(([x, z], k) => {
      const barn = this.#barn(k);
      barn.position.set(x, this.heightAt(x, z) - 0.2, z);
      barn.rotation.y = k * 1.3;
      this.scene.add(barn);
      this.placedBoxes.push({ x, z, hx: 28, hz: 28 });
    });

    // --- Billboards and braking-marker boards
    const bbTex = [0, 1, 2, 3].map(v => TX.billboardTexture(v));
    let v = 0;
    for (const c of T.corners) {
      const sB = c.s0 - 70;
      const turn = T.turnSide[Math.floor(T.wrapS(c.apex) / T.ds)];
      const lat = -turn * (T.wallL[0] + 6);
      this.#billboard(bbTex[v++ % 4], sB, lat);
      if (c.radius < 70) {
        [150, 100, 50].forEach((d) => this.#marker(String(d), c.s0 - d + 10, -turn * 10.2));
      }
    }
    // a few along the straights
    for (let s = 120; s < T.length; s += 420) this.#billboard(bbTex[v++ % 4], s, -(26 + 7) * T.turnSide[Math.floor(T.wrapS(s) / T.ds)]);

    // --- White Kentucky horse fence along the Palisades run
    this.#horseFence();
  }

  #crowdMaterial() {
    const mat = new THREE.MeshLambertMaterial();
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = { value: 0 };
      this.crowdUniform = sh.uniforms.uTime;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          float id = float(gl_InstanceID);
          float ph = fract(sin(id * 12.9898) * 43758.5453);
          transformed.y += max(0.0, sin(uTime * (3.0 + ph * 4.0) + ph * 30.0)) * 0.12 * step(0.55, ph);`);
    };
    return mat;
  }

  #rickhouse(tex, signTex, k) {
    const g = new THREE.Group();
    const W = 70, D = 26, H = 26;
    const box = new THREE.BoxGeometry(W, H, D);
    // scale UVs per face so windows keep their size
    const uv = box.attributes.uv;
    const faceDims = [[D, H], [D, H], [W, D], [W, D], [W, H], [W, H]];
    for (let f = 0; f < 6; f++) for (let j = 0; j < 4; j++) {
      const i = f * 4 + j;
      uv.setXY(i, uv.getX(i) * faceDims[f][0] / 26, uv.getY(i) * faceDims[f][1] / 26);
    }
    box.translate(0, H / 2, 0);
    const t = tex.clone(); t.needsUpdate = true;
    const wall = new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, metalness: 0.2 });
    const body = new THREE.Mesh(box, wall);
    body.castShadow = true; body.receiveShadow = true;
    g.add(body);
    // gable roof
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-D / 2 - 0.8, 0); roofShape.lineTo(0, 5.5); roofShape.lineTo(D / 2 + 0.8, 0); roofShape.lineTo(-D / 2 - 0.8, 0);
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: W + 1.6, bevelEnabled: false });
    roofGeo.translate(0, 0, -(W + 1.6) / 2);
    roofGeo.rotateY(Math.PI / 2);
    const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: 0x3a3532, roughness: 0.55, metalness: 0.5 }));
    roof.position.y = H;
    roof.castShadow = true;
    g.add(roof);
    // big painted lettering on the track side (+z)
    if (k % 2 === 0) {
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(56, 8.8), new THREE.MeshStandardMaterial({ map: signTex, transparent: true, roughness: 0.8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
      sign.position.set(0, H - 6, D / 2 + 0.05);
      g.add(sign);
    } else {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(W, 0.8), new THREE.MeshStandardMaterial({ color: 0xc22a2e, roughness: 0.6 }));
      stripe.position.set(0, H - 3, D / 2 + 0.05);
      g.add(stripe);
    }
    return g;
  }

  #barn(k) {
    const g = new THREE.Group();
    const col = k % 2 ? 0x1b1716 : 0x6a1d1a;
    const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.85 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(24, 9, 14), mat);
    body.position.y = 4.5; body.castShadow = true; g.add(body);
    const sh = new THREE.Shape();
    sh.moveTo(-8, 0); sh.lineTo(-5, 4); sh.lineTo(0, 6); sh.lineTo(5, 4); sh.lineTo(8, 0); sh.lineTo(-8, 0);
    const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 25, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0x4b4845, metalness: 0.5, roughness: 0.5 }));
    roof.geometry.translate(0, 0, -12.5); roof.geometry.rotateY(Math.PI / 2);
    roof.position.y = 9; g.add(roof);
    // barn quilt square
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const q = c.getContext('2d');
    q.fillStyle = '#efe6d2'; q.fillRect(0, 0, 128, 128);
    q.fillStyle = '#8b1e24';
    q.beginPath(); q.moveTo(64, 8); q.lineTo(120, 64); q.lineTo(64, 120); q.lineTo(8, 64); q.fill();
    q.fillStyle = '#d9a95b'; q.fillRect(44, 44, 40, 40);
    q.fillStyle = '#1b1512'; q.fillRect(56, 56, 16, 16);
    const qt = new THREE.CanvasTexture(c); qt.colorSpace = THREE.SRGBColorSpace;
    const quilt = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshStandardMaterial({ map: qt, roughness: 0.8 }));
    quilt.position.set(0, 11, 7.05); g.add(quilt);
    return g;
  }

  #billboard(tex, s, lat) {
    const g = new THREE.Group();
    const board = new THREE.Mesh(new THREE.BoxGeometry(12, 3.75, 0.25), [
      this._frame || (this._frame = new THREE.MeshStandardMaterial({ color: 0x1b1512, roughness: 0.6 })), this._frame, this._frame, this._frame,
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.12 }), this._frame,
    ]);
    board.position.y = 4.4; board.castShadow = true;
    g.add(board);
    for (const x of [-4.5, 4.5]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3, 0.3), this._frame);
      leg.position.set(x, 1.5, -0.2); g.add(leg);
    }
    this.#place(g, s, lat, 0);
    // angle slightly toward oncoming riders
    g.rotation.y += (lat > 0 ? 1 : -1) * 0.35;
  }

  #marker(label, s, lat) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 160;
    const q = c.getContext('2d');
    q.fillStyle = '#efe6d2'; q.fillRect(0, 0, 128, 160);
    q.fillStyle = '#8b1e24'; q.fillRect(0, 0, 128, 18); q.fillRect(0, 142, 128, 18);
    q.font = '800 italic 76px "Barlow Condensed", sans-serif'; q.fillStyle = '#1b1512'; q.textAlign = 'center'; q.textBaseline = 'middle';
    q.fillText(label, 64, 82);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const board = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.1), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, side: THREE.DoubleSide }));
    board.position.y = 0.75;
    const g = new THREE.Group(); g.add(board);
    this.#place(g, s, lat, 0, false);
    g.rotation.y += Math.PI; // face oncoming riders
  }

  #horseFence() {
    const T = this.track;
    const white = new THREE.MeshStandardMaterial({ color: 0xf2eee6, roughness: 0.8 });
    const planks = [];
    const posts = [];
    const runs = [[T.length * 0.36, T.length * 0.52, -1], [T.length * 0.8, T.length * 0.92, -1], [T.length * 0.05, T.length * 0.2, -1]];
    for (const [s0, s1, sideSign] of runs) {
      for (const h of [0.5, 0.95, 1.4]) {
        const pts = [];
        for (let s = s0; s <= s1; s += 6) {
          const turn = T.turnSide[Math.floor(T.wrapS(s) / T.ds)];
          const lat = -turn * 44 * sideSign * -1;
          const p = T.toWorld(s, lat);
          p.y = this.heightAt(p.x, p.z) + h;
          pts.push(p);
          if (h === 0.5) posts.push(p.clone().setY(p.y - 0.5));
        }
        for (let n = 0; n < pts.length - 1; n++) planks.push([pts[n], pts[n + 1]]);
      }
    }
    const plank = new THREE.BoxGeometry(1, 0.16, 0.05);
    const im = new THREE.InstancedMesh(plank, white, planks.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), mid = new THREE.Vector3();
    planks.forEach(([a, b], n) => {
      mid.addVectors(a, b).multiplyScalar(0.5);
      const d = b.clone().sub(a);
      q.setFromUnitVectors(new THREE.Vector3(1, 0, 0), d.clone().normalize());
      sc.set(d.length(), 1, 1);
      im.setMatrixAt(n, m.compose(mid, q, sc));
    });
    this.scene.add(im);
    const postGeo = new THREE.BoxGeometry(0.14, 1.6, 0.14); postGeo.translate(0, 0.8, 0);
    const pm = new THREE.InstancedMesh(postGeo, white, posts.length);
    posts.forEach((p, n) => pm.setMatrixAt(n, m.makeTranslation(p.x, p.y, p.z)));
    this.scene.add(pm);
  }

  setStartLights(n) {
    this.startLights.forEach((mat, i) => { mat.emissiveIntensity = i < n ? 6 : 0; });
  }

  update(t) {
    if (this.crowdUniform) this.crowdUniform.value = t;
    if (this.cloudMat) this.cloudMat.uniforms.uTime.value = t;
  }
}
