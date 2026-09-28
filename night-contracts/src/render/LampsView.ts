/**
 * Street lamps: instanced poles and heads, fake light pools on the ground,
 * glow sprites, rain light cones, wet road reflection streaks, antenna
 * beacons, and a small pool of real point lights moved to the nearest lamps.
 */
import * as THREE from 'three';
import type { Tuning } from '../config/tuning';
import type { City } from '../world/CityGenerator';
import type { AssetPart } from './AssetRegistry';
import { instancedParts } from './PropsView';
import { globalUniforms, srgb, yawToThree } from './Shared';

export const SODIUM = 0xffa347;

let radialTex: THREE.Texture | null = null;
export function radialTexture(): THREE.Texture {
  if (radialTex) return radialTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.14)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  radialTex = new THREE.CanvasTexture(c);
  radialTex.colorSpace = THREE.SRGBColorSpace;
  return radialTex;
}

/** Camera-facing billboard material for instanced quads (additive). */
export function billboardMaterial(color: THREE.Color, opacityUniform: { value: number }, blink = false): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uMap: { value: radialTexture() }, uColor: { value: color }, uOpacity: opacityUniform, uTime: globalUniforms.uTime },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      varying float vBlink;
      #include <common>
      #include <fog_pars_vertex>
      void main() {
        vUv = uv;
        vec4 center = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float size = length(instanceMatrix[0].xyz);
        float closeK = clamp(-center.z / 120.0, 0.45, 1.0);
        vec4 mvPosition = center + vec4(position.xy * size * closeK, 0.0, 0.0);
        vBlink = ${blink ? 'step(0.5, fract(uTime * 0.7 + instanceMatrix[3].x * 0.001))' : '1.0'};
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      varying float vBlink;
      #include <common>
      #include <fog_pars_fragment>
      void main() {
        float a = texture2D(uMap, vUv).r;
        gl_FragColor = vec4(uColor * a * uOpacity * vBlink, 1.0);
        #include <fog_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: true,
  });
}

export class LampsView {
  readonly group = new THREE.Group();
  readonly lights: THREE.PointLight[] = [];
  private readonly lampPos: THREE.Vector3[] = [];
  private readonly glowOpacity = { value: 1 };
  private readonly poolOpacity = { value: 1 };
  private readonly coneOpacity = { value: 0 };
  private readonly streakOpacity = { value: 0 };
  private readonly beaconOpacity = { value: 1 };
  private readonly headMat: THREE.MeshBasicMaterial;
  private readonly cones: THREE.InstancedMesh | null = null;
  private readonly order: number[] = [];

  constructor(
    city: City,
    t: Tuning,
    lightCount: number,
    lightCones: boolean,
    beacons: THREE.Vector3[],
    glb: AssetPart[] | null = null,
  ) {
    this.group.name = 'lamps';
    const lamps = city.lamps;
    const H = t.world.lampHeight;
    const arm = 14;
    // pole + arm, long axis +Z for the arm
    const pole = new THREE.CylinderGeometry(0.7, 1.1, H, 6).translate(0, H / 2, 0);
    const armGeo = new THREE.BoxGeometry(1, 1, arm).translate(0, H - 1, arm / 2);
    const base = new THREE.CylinderGeometry(1.8, 2.2, 3, 8).translate(0, 1.5, 0);
    const poleGeo = mergeSimple([pole, armGeo, base]);
    const poleMesh = new THREE.InstancedMesh(poleGeo, new THREE.MeshStandardMaterial({ color: srgb(0x2c2e33), roughness: 0.5, metalness: 0.6 }), lamps.length);
    const headGeo = new THREE.BoxGeometry(4, 1.2, 7).translate(0, H - 2, arm - 1);
    this.headMat = new THREE.MeshBasicMaterial({ color: srgb(SODIUM).multiplyScalar(3) });
    const headMesh = new THREE.InstancedMesh(headGeo, this.headMat, lamps.length);

    const quad = new THREE.PlaneGeometry(1, 1);
    const glow = new THREE.InstancedMesh(quad, billboardMaterial(srgb(SODIUM).multiplyScalar(0.7), this.glowOpacity), lamps.length);
    const poolGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    const poolMat = new THREE.MeshBasicMaterial({
      map: radialTexture(),
      color: srgb(SODIUM).multiplyScalar(0.3),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });
    const pools = new THREE.InstancedMesh(poolGeo, poolMat, lamps.length);
    poolMat.onBeforeCompile = (s) => {
      s.uniforms.uOpacity = this.poolOpacity;
      s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uOpacity;').replace('#include <opaque_fragment>', 'outgoingLight *= uOpacity;\n#include <opaque_fragment>');
    };

    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const yAxis = new THREE.Vector3(0, 1, 0);
    lamps.forEach((l, i) => {
      q.setFromAxisAngle(yAxis, yawToThree(l.a));
      p.set(l.x, l.z, l.y);
      m.compose(p, q, s.set(1, 1, 1));
      poleMesh.setMatrixAt(i, m);
      headMesh.setMatrixAt(i, m);
      const hx = l.x + Math.cos(l.a) * (arm - 1);
      const hy = l.y + Math.sin(l.a) * (arm - 1);
      this.lampPos.push(new THREE.Vector3(hx, l.z + H - 3, hy));
      m.compose(p.set(hx, l.z + H - 3, hy), q.identity(), s.set(9, 9, 9));
      glow.setMatrixAt(i, m);
      const ground = city.heightAt(hx, hy) + (city.heightAt(hx, hy) > 0.5 ? 0.3 : 1.4);
      m.compose(p.set(hx, ground, hy), q.identity(), s.set(150, 1, 150));
      pools.setMatrixAt(i, m);
    });
    for (const mesh of [poleMesh, headMesh, glow, pools]) mesh.computeBoundingSphere();
    poleMesh.castShadow = true;
    poleMesh.name = 'lamp-poles';
    headMesh.name = 'lamp-heads';
    glow.name = 'lamp-glow';
    pools.name = 'lamp-pools';
    glow.frustumCulled = false;
    if (glb) {
      // handed-off lamp model replaces the code-built pole; keep the glowing head
      const mats: THREE.Matrix4[] = [];
      for (let i = 0; i < lamps.length; i++) {
        const mm = new THREE.Matrix4();
        poleMesh.getMatrixAt(i, mm);
        mats.push(mm);
      }
      for (const im of instancedParts(glb, mats, true, 'lamp-glb')) this.group.add(im);
      this.group.add(headMesh, pools, glow);
    } else this.group.add(poleMesh, headMesh, pools, glow);

    if (lightCones) {
      const coneGeo = new THREE.CylinderGeometry(2, 40, H - 4, 16, 1, true).translate(0, -(H - 4) / 2, 0);
      const coneMat = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: srgb(SODIUM) }, uOpacity: this.coneOpacity },
        vertexShader: /* glsl */ `
          varying float vY;
          varying vec3 vN;
          varying vec3 vV;
          varying float vDist;
          void main() {
            vY = -position.y / ${(H - 4).toFixed(1)};
            vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
            vDist = -mv.z;
            vN = normalize(normalMatrix * mat3(instanceMatrix) * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uOpacity;
          varying float vY;
          varying vec3 vN;
          varying vec3 vV;
          varying float vDist;
          void main() {
            float edge = pow(abs(dot(vN, vV)), 1.5);
            float fade = (1.0 - vY) * (1.0 - vY);
            // fade out when the camera is right inside a cone
            float near = smoothstep(40.0, 140.0, vDist);
            gl_FragColor = vec4(uColor * edge * fade * uOpacity * near * 0.12, 1.0);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const cones = new THREE.InstancedMesh(coneGeo, coneMat, lamps.length);
      this.lampPos.forEach((lp, i) => {
        m.compose(lp, q.identity(), s.set(1, 1, 1));
        cones.setMatrixAt(i, m);
      });
      cones.computeBoundingSphere();
      cones.name = 'lamp-cones';
      this.cones = cones;
      this.group.add(cones);
    }

    // wet road reflection streaks, oriented towards the camera in the shader
    const streakGeo = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);
    const streakMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: srgb(SODIUM) }, uOpacity: this.streakOpacity, uCam: globalUniforms.uCamPos, uMap: { value: radialTexture() } },
      vertexShader: /* glsl */ `
        uniform vec3 uCam;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 base = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
          vec2 toCam = uCam.xz - base.xz;
          float d = length(toCam);
          vec2 dir = toCam / max(d, 1.0);
          vec2 side = vec2(-dir.y, dir.x);
          float len = clamp(d * 0.35, 30.0, 150.0);
          vec3 wp = base + vec3(side.x * position.x * 10.0, 0.0, side.y * position.x * 10.0) + vec3(dir.x, 0.0, dir.y) * position.y * len;
          gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform sampler2D uMap;
        varying vec2 vUv;
        void main() {
          float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
          float along = sin(vUv.y * 3.14159);
          float a = across * across * along;
          gl_FragColor = vec4(uColor * a * uOpacity * 0.5, 1.0);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      polygonOffset: true,
      polygonOffsetFactor: -5,
      polygonOffsetUnits: -5,
    });
    const streaks = new THREE.InstancedMesh(streakGeo, streakMat, lamps.length);
    this.lampPos.forEach((lp, i) => {
      const gz = city.heightAt(lp.x, lp.z);
      m.compose(p.set(lp.x, gz + 0.4, lp.z), q.identity(), s.set(1, 1, 1));
      streaks.setMatrixAt(i, m);
    });
    streaks.frustumCulled = false;
    streaks.name = 'lamp-streaks';
    this.group.add(streaks);

    // blinking red beacons on masts and cranes
    if (beacons.length) {
      const bm = new THREE.InstancedMesh(quad, billboardMaterial(srgb(0xff2a1a).multiplyScalar(2), this.beaconOpacity, true), beacons.length);
      beacons.forEach((b, i) => {
        m.compose(b, q.identity(), s.set(14, 14, 14));
        bm.setMatrixAt(i, m);
      });
      bm.frustumCulled = false;
      bm.name = 'beacons';
      this.group.add(bm);
    }

    for (let i = 0; i < lightCount; i++) {
      const l = new THREE.PointLight(srgb(SODIUM), 0, 260, 1.6);
      l.castShadow = false;
      this.lights.push(l);
      this.group.add(l);
    }
    for (let i = 0; i < this.lampPos.length; i++) this.order.push(i);
  }

  /** Move the real lights to the lamps nearest the focus point. */
  update(focus: THREE.Vector3, night: number, wet: number, rain: number): void {
    const on = THREE.MathUtils.smoothstep(night, 0.25, 0.7);
    this.glowOpacity.value = on;
    this.poolOpacity.value = on * (0.9 + wet * 0.3);
    this.coneOpacity.value = on * (0.3 + rain * 0.5);
    this.streakOpacity.value = on * wet;
    this.beaconOpacity.value = 0.4 + on * 0.6;
    this.headMat.color.setHex(SODIUM, THREE.SRGBColorSpace).multiplyScalar(0.6 + on * 2.6);
    if (this.cones) this.cones.visible = on > 0.02;
    if (!this.lights.length) return;
    const fx = focus.x;
    const fz = focus.z;
    const lp = this.lampPos;
    // partial selection: we only need the nearest N
    this.order.sort((a, b) => (lp[a].x - fx) ** 2 + (lp[a].z - fz) ** 2 - ((lp[b].x - fx) ** 2 + (lp[b].z - fz) ** 2));
    for (let i = 0; i < this.lights.length; i++) {
      const l = this.lights[i];
      const pos = lp[this.order[i]];
      l.position.copy(pos);
      l.intensity = on * 520;
    }
  }
}

function mergeSimple(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const pos: number[] = [];
  const nor: number[] = [];
  for (const g0 of parts) {
    const g = g0.index ? g0.toNonIndexed() : g0;
    const p = g.getAttribute('position');
    const n = g.getAttribute('normal');
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      nor.push(n.getX(i), n.getY(i), n.getZ(i));
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return out;
}
