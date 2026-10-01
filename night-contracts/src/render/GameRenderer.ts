/**
 * Owns the WebGL renderer, scene and every view. Reads the sim each frame and
 * never writes to it.
 */
import * as THREE from 'three';
import type { Tuning } from '../config/tuning';
import type { SimEvent } from '../sim/events';
import type { Sim } from '../sim/Sim';
import { lightingAt, type Lighting } from '../world/DayNight';
import type { AssetRegistry } from './AssetRegistry';
import { BikeView } from './BikeView';
import { BuildingsView } from './BuildingsView';
import { CameraRig } from './CameraRig';
import { CarView } from './CarView';
import { CityView } from './CityView';
import { FXView } from './FXView';
import { LampsView } from './LampsView';
import { NeonView } from './NeonView';
import { PedView } from './PedView';
import { PostFX } from './PostFX';
import { InstanceCuller } from './InstanceCuller';
import { PropsView } from './PropsView';
import type { QualitySettings } from './Quality';
import { RainView } from './RainView';
import { GlbRiderView } from './GlbRiderView';
import { RiderView } from './RiderView';
import { globalUniforms } from './Shared';
import { SkyView, WaterView } from './SkyView';

export class GameRenderer {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly rig: CameraRig;
  readonly post: PostFX;
  lighting: Lighting;
  private readonly sky: SkyView;
  private readonly water: WaterView;
  private readonly lamps: LampsView;
  private readonly neon: NeonView;
  private readonly bike: BikeView;
  private readonly rider: RiderView | GlbRiderView;
  private readonly cars: CarView;
  private readonly peds: PedView;
  private readonly fx: FXView;
  private readonly rain: RainView;
  private readonly fog: THREE.FogExp2;
  private envNight: THREE.Texture | null = null;
  private envDay: THREE.Texture | null = null;
  /** Textured (GLB) materials on the player's bike and rider: they get a stronger share of the environment. */
  private readonly heroMaterials: THREE.MeshStandardMaterial[] = [];
  /** 0 by day, 1 at night: a cool rim and a little fill on those materials so they keep their shape in the dark. */
  private readonly heroNight = { value: 0 };
  private lampTimer = 0;
  private cullTimer = 0;
  private readonly cullers: InstanceCuller[] = [];
  private flash = 0;
  private time = 0;
  /** Adaptive resolution: drops the pixel ratio when frames run long. */
  adaptive = true;
  private frameAcc = 0;
  private frameN = 0;
  private fastT = 0;
  /** Seconds to ignore at start while shaders compile and textures upload. */
  private warmup = 4;
  private sinceUp = 99;
  private pixelRatio: number;
  /** Highest pixel ratio that has held the frame rate. */
  private ceiling: number;
  /** Debug: fixed camera (position, target) in sim space; null uses the rig. */
  debugCamera: { x: number; y: number; z: number; tx: number; ty: number; tz: number } | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    readonly sim: Sim,
    readonly t: Tuning,
    readonly q: QualitySettings,
    assets: AssetRegistry,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
    this.renderer.setPixelRatio(q.pixelRatio);
    this.pixelRatio = q.pixelRatio;
    this.ceiling = q.pixelRatio;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = q.shadows;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.info.autoReset = false;

    this.lighting = lightingAt(sim.clock);
    this.fog = new THREE.FogExp2(0x101a28, 0.0004);
    this.scene.fog = this.fog;
    this.rig = new CameraRig(t);
    this.rig.camera.far = q.drawDistance;

    const city = sim.city;
    this.sky = new SkyView(this.scene, q.shadows, q.shadowSize);
    this.water = new WaterView(city.shoreY, city.bounds.minX, city.bounds.maxX);
    this.scene.add(this.water.mesh);
    this.scene.add(new CityView(city, t).group);
    const buildings = new BuildingsView(city, t, q.shadows);
    this.scene.add(buildings.group);
    const props = new PropsView(city, q.shadows, assets);
    this.scene.add(props.group);
    this.lamps = new LampsView(city, t, q.lampLights, q.lightCones, buildings.beacons, assets.parts('models/props/lamp.glb'));
    this.cullers.push(...props.cullers, this.lamps.culler);
    this.scene.add(this.lamps.group);
    this.neon = new NeonView(city);
    this.scene.add(this.neon.group);
    this.bike = new BikeView(q.physicalPaint, assets.scene('models/bike/bike.glb'));
    this.scene.add(this.bike.model.root);
    const riderGlb = assets.scene('models/rider/rider.glb');
    this.rider = riderGlb ? new GlbRiderView(this.bike.model, riderGlb, assets.animations('models/rider/rider.glb', 'models/rider/animations/')) : new RiderView(this.bike.model);
    this.scene.add(this.rider.root);
    for (const root of [this.bike.model.root, this.rider.root]) {
      root.traverse((o) => {
        const m = (o as THREE.Mesh).material;
        for (const mat of Array.isArray(m) ? m : m ? [m] : []) {
          if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial && (mat as THREE.MeshStandardMaterial).map && !this.heroMaterials.includes(mat as THREE.MeshStandardMaterial)) {
            this.heroMaterials.push(mat as THREE.MeshStandardMaterial);
            this.addHeroLight(mat as THREE.MeshStandardMaterial);
          }
        }
      });
    }
    this.cars = new CarView(t, assets, q.shadows);
    this.scene.add(this.cars.group);
    this.peds = new PedView(Math.max(8, Math.round(t.peds.count * q.pedScale) + 4));
    this.scene.add(this.peds.group);
    this.fx = new FXView(this.rig.camera);
    this.scene.add(this.fx.group);
    this.rain = new RainView(q.rainDrops);
    this.scene.add(this.rain.group);

    this.post = new PostFX(this.renderer, this.scene, this.rig.camera, q);
    this.buildEnvironments();
  }

  private addHeroLight(mat: THREE.MeshStandardMaterial): void {
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uHeroNight = this.heroNight;
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uHeroNight;').replace(
        '#include <opaque_fragment>',
        `float heroRim = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 3.0);
        outgoingLight += uHeroNight * (vec3(0.3, 0.42, 0.6) * heroRim * 0.35 + diffuseColor.rgb * 0.5);
        #include <opaque_fragment>`,
      );
    };
    mat.customProgramCacheKey = () => 'hero';
  }

  /** Small pre-filtered environments for glossy paint, glass and wet roads. */
  private buildEnvironments(): void {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const make = (zenith: number, horizon: number, glow: number, lights: boolean): THREE.Texture => {
      const s = new THREE.Scene();
      const geo = new THREE.SphereGeometry(100, 32, 16);
      const mat = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          z: { value: new THREE.Color().setHex(zenith, THREE.SRGBColorSpace) },
          h: { value: new THREE.Color().setHex(horizon, THREE.SRGBColorSpace) },
          g: { value: new THREE.Color().setHex(glow, THREE.SRGBColorSpace) },
        },
        vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'uniform vec3 z; uniform vec3 h; uniform vec3 g; varying vec3 vD; void main(){ float t = max(vD.y, 0.0); vec3 c = mix(h, z, pow(t, 0.5)); c += g * exp(-abs(vD.y) * 8.0) * 0.8; if (vD.y < 0.0) c = h * 0.35; gl_FragColor = vec4(c, 1.0); }',
      });
      s.add(new THREE.Mesh(geo, mat));
      if (lights) {
        // warm city lights around the horizon so glossy surfaces pick up sparkle
        const lm = new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 3.6, 1.6) });
        for (let i = 0; i < 40; i++) {
          const a = (i / 40) * Math.PI * 2;
          const m = new THREE.Mesh(new THREE.SphereGeometry(1.4 + (i % 3), 6, 4), lm);
          m.position.set(Math.cos(a) * 90, 4 + (i % 5) * 3, Math.sin(a) * 90);
          s.add(m);
        }
      }
      const rt = pmrem.fromScene(s, 0.02);
      return rt.texture;
    };
    this.envNight = make(0x0a1426, 0x22324a, 0x6a4630, true);
    this.envDay = make(0x4a86d0, 0xd0dce6, 0xf0dcc0, false);
    pmrem.dispose();
  }

  onEvent(e: SimEvent): void {
    this.fx.onEvent(e, this.sim);
    switch (e.type) {
      case 'crash':
        this.rig.shake(0.8);
        break;
      case 'impact':
        this.rig.shake(Math.min(0.5, e.strength / 400));
        break;
      case 'explosion': {
        const d = Math.hypot(e.x - this.sim.player.x, e.y - this.sim.player.y);
        this.rig.shake(Math.max(0, 0.9 - d / 700));
        break;
      }
      case 'playerHurt':
        this.rig.shake(0.15);
        break;
      case 'lightning':
        this.flash = 1;
        break;
      case 'roofStrike':
      case 'wheelCut':
        this.rig.shake(0.35);
        break;
      default:
        break;
    }
  }

  resize(w: number, h: number): void {
    this.renderer.setSize(w, h, false);
    this.rig.camera.aspect = w / h;
    this.rig.camera.updateProjectionMatrix();
    this.post.setSize(w, h);
  }

  /**
   * Keep frame time near the target by scaling resolution: phones hold 60 fps
   * when they can, and never sink far below 30 when they cannot. A hitch drops
   * the resolution for a while; once frames run at the display rate again it
   * climbs back, but never past a step that has already failed to hold.
   */
  private adapt(realDt: number): void {
    if (!this.adaptive || realDt <= 0 || realDt > 0.25) return;
    if (this.warmup > 0) {
      this.warmup -= realDt;
      return;
    }
    this.frameAcc += realDt;
    this.frameN++;
    this.sinceUp += realDt;
    if (this.frameAcc < 1.5) return;
    const avg = this.frameAcc / this.frameN;
    this.frameAcc = 0;
    this.frameN = 0;
    const min = Math.max(0.6, this.q.pixelRatio * 0.5);
    if (avg > 1 / 45 && this.pixelRatio > min) {
      if (this.sinceUp < 12) this.ceiling = Math.max(min, this.pixelRatio - 0.1);
      this.pixelRatio = Math.max(min, this.pixelRatio - 0.15);
      this.applyPixelRatio();
      this.fastT = 0;
    } else if (avg < 1 / 55) {
      this.fastT += 1.5;
      if (this.fastT >= 6 && this.pixelRatio < this.ceiling) {
        this.pixelRatio = Math.min(this.ceiling, this.pixelRatio + 0.1);
        this.applyPixelRatio();
        this.fastT = 0;
        this.sinceUp = 0;
      }
    } else this.fastT = 0;
  }

  private applyPixelRatio(): void {
    this.renderer.setPixelRatio(this.pixelRatio);
    const s = this.renderer.getSize(new THREE.Vector2());
    this.resize(s.x, s.y);
  }

  get currentPixelRatio(): number {
    return this.pixelRatio;
  }

  render(alpha: number, dt: number, realDt = dt): void {
    this.adapt(realDt);
    const sim = this.sim;
    this.time += dt;
    const overcast = sim.raining ? 0.8 : 0;
    const l = (this.lighting = lightingAt(sim.clock, overcast));
    globalUniforms.uTime.value = this.time;
    globalUniforms.uNight.value = l.night;
    globalUniforms.uWet.value = sim.wet;
    globalUniforms.uRain.value = sim.raining ? 1 : 0;

    this.bike.update(sim, alpha, dt, l.night);
    this.rider.update(sim, alpha, dt);
    this.rig.update(sim, alpha, dt);
    const cam = this.rig.camera;
    if (this.debugCamera) {
      const d = this.debugCamera;
      cam.position.set(d.x, d.z, d.y);
      cam.lookAt(d.tx, d.tz, d.ty);
      cam.updateMatrixWorld();
    }
    globalUniforms.uCamPos.value.copy(cam.position);
    this.cars.update(sim, alpha, dt, l.night, cam.position);
    this.peds.update(sim, alpha, cam, Math.min(this.q.cullRange, 1000));
    this.fx.update(sim, dt, this.renderer.domElement.height / Math.tan((cam.fov * Math.PI) / 360) / 2);
    // a lighter shower than the full drop count
    this.rain.update(cam, dt, sim.raining ? 0.75 : 0, sim.wet);

    this.flash = Math.max(0, this.flash - dt * 3.5);
    this.sky.update(l, this.rig.focusPoint, cam.position, this.flash * 0.6);
    this.water.update(l);
    this.fog.color.setHex(l.fog, THREE.SRGBColorSpace);
    this.fog.density = l.fogDensity * (1 + sim.wet * 0.4);
    this.renderer.toneMappingExposure = l.exposure;
    const env = l.night > 0.5 ? this.envNight : this.envDay;
    this.scene.environment = env;
    this.scene.environmentIntensity = l.night > 0.5 ? 0.9 : 0.8;
    // black leather and black paint would vanish into the night otherwise
    for (const m of this.heroMaterials) {
      m.envMap = env;
      m.envMapIntensity = l.night > 0.5 ? 2.2 : 0.9;
    }
    this.heroNight.value = l.night;

    this.lampTimer -= dt;
    if (this.lampTimer <= 0) {
      this.lamps.update(this.rig.focusPoint, l.night, sim.wet, sim.raining ? 1 : 0);
      this.lampTimer = 0.1;
    }
    this.neon.update(dt, l.night, this.time);
    this.cullTimer -= dt;
    if (this.cullTimer <= 0) {
      for (const c of this.cullers) c.update(cam, this.q.cullRange);
      this.cullTimer = 0.12;
    }
    this.post.update(l.grade, l.night, this.flash * 0.25);

    this.renderer.info.reset();
    this.post.render(this.scene, cam);
  }
}
