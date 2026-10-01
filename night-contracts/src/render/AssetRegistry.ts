/**
 * Loads handed-off GLB models when they exist and falls back to the code-built
 * placeholders otherwise. Only files listed by `virtual:game-assets` are
 * requested, so missing art never produces network errors.
 *
 * Conventions (see brief): Y up, metres, forward +Z, pivot at ground centre.
 * Models are rescaled to game units (8 units = 1 metre) on load.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { gameAssetFiles } from 'virtual:game-assets';
import { UNITS_PER_METRE, type CarModel } from '../config/tuning';
import { assetUrl, dataUriBytes, hasAsset } from '../core/assetUrl';

export interface AssetPart {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

export type CarAssetPart = AssetPart;

export interface CarAsset {
  /** Body parts (the near version when the file has a far one). */
  parts: AssetPart[];
  /** Far body (`body_lod1`), if any. */
  far: AssetPart[] | null;
  /**
   * The file's own wheel (`wheel`, axle at the origin, outer face towards +x)
   * and where the four axles are (`wheel_fl`, `wheel_fr`, `wheel_rl`, `wheel_rr`).
   */
  wheel: { near: AssetPart; far: AssetPart | null; axles: THREE.Vector3[] } | null;
  /** Left head and tail lamp positions (`light_head_l`, `light_tail_l`), mirrored for the right. */
  lights: { head: THREE.Vector3; tail: THREE.Vector3 } | null;
}

const CAR_FILES: Record<CarModel, string> = {
  sedan: 'models/cars/sedan.glb',
  suv: 'models/cars/suv.glb',
  limo: 'models/cars/limo.glb',
  police: 'models/cars/police.glb',
  hatch: 'models/cars/civ-hatch.glb',
  ute: 'models/cars/civ-ute.glb',
  van: 'models/cars/civ-van.glb',
};

/** Bake every mesh of a scene (or those `include` picks) into model space, one geometry per material. */
export function flattenParts(root: THREE.Object3D, include: (mesh: THREE.Mesh) => boolean = () => true): AssetPart[] {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const byMat = new Map<THREE.Material, THREE.BufferGeometry[]>();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || (mesh as THREE.SkinnedMesh).isSkinnedMesh || !include(mesh)) return;
    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    // keep the root scale (metres to units) but drop its placement
    const m = new THREE.Matrix4().multiplyMatrices(inv, mesh.matrixWorld).premultiply(new THREE.Matrix4().makeScale(root.scale.x, root.scale.y, root.scale.z));
    const g = mesh.geometry.clone().applyMatrix4(m);
    let list = byMat.get(mat);
    if (!list) byMat.set(mat, (list = []));
    list.push(g);
  });
  const parts: AssetPart[] = [];
  for (const [material, geos] of byMat) for (const geometry of geos) parts.push({ geometry, material });
  return parts;
}

/** Find a node by any of several names (case insensitive). */
export function findNode(root: THREE.Object3D, ...names: string[]): THREE.Object3D | null {
  const want = names.map((n) => n.toLowerCase());
  let found: THREE.Object3D | null = null;
  root.traverse((o) => {
    if (!found && want.includes(o.name.toLowerCase())) found = o;
  });
  return found;
}

export class AssetRegistry {
  private readonly scenes = new Map<string, THREE.Group>();
  private readonly clips = new Map<string, THREE.AnimationClip[]>();
  private readonly partsCache = new Map<string, AssetPart[]>();
  readonly loaded: string[] = [];
  readonly missing: string[] = [];

  has(path: string): boolean {
    return hasAsset(path);
  }

  async load(): Promise<void> {
    // generated models ship meshopt compressed (tools/art)
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const expected = ['models/bike/bike.glb', 'models/rider/rider.glb', ...Object.values(CAR_FILES)];
    for (const p of expected) if (!this.has(p)) this.missing.push(p);
    const files = gameAssetFiles.filter((f) => f.startsWith('models/') && f.endsWith('.glb'));
    await Promise.all(
      files.map(async (path) => {
        try {
          const url = assetUrl(path);
          // inlined in the single-page build: parse the bytes, no request
          const gltf = url.startsWith('data:') ? await loader.parseAsync(dataUriBytes(url), '') : await loader.loadAsync(url);
          const root = gltf.scene;
          root.scale.setScalar(UNITS_PER_METRE);
          root.updateMatrixWorld(true);
          this.scenes.set(path, root);
          this.clips.set(path, gltf.animations);
          this.loaded.push(path);
        } catch (err) {
          console.warn(`Asset failed to load, using placeholder: ${path}`, err);
          this.missing.push(path);
        }
      }),
    );
    if (this.loaded.length) console.info(`Loaded ${this.loaded.length} GLB models: ${this.loaded.join(', ')}`);
    if (this.missing.length) console.info(`Using code-built placeholders for ${this.missing.length} models (no GLB found).`);
  }

  /** A fresh copy of a loaded scene (skeleton aware), or null. */
  scene(path: string): THREE.Group | null {
    const s = this.scenes.get(path);
    return s ? (cloneSkinned(s) as THREE.Group) : null;
  }

  /** Static parts for instancing, or null when the file is missing. */
  parts(path: string): AssetPart[] | null {
    if (this.partsCache.has(path)) return this.partsCache.get(path)!;
    const s = this.scenes.get(path);
    if (!s) return null;
    const p = flattenParts(s);
    this.partsCache.set(path, p);
    return p;
  }

  /** Animation clips from a file plus any GLBs under a folder prefix. */
  animations(path: string, folder?: string): THREE.AnimationClip[] {
    const out = [...(this.clips.get(path) ?? [])];
    if (folder) for (const [p, c] of this.clips) if (p.startsWith(folder)) out.push(...c);
    return out;
  }

  car(model: CarModel): CarAsset | null {
    const path = CAR_FILES[model];
    const scene = this.scenes.get(path);
    if (!scene) return null;
    const named = (name: string) => (m: THREE.Mesh): boolean => m.name.toLowerCase() === name || m.parent?.name.toLowerCase() === name;
    // a plain file: every mesh is body
    if (!findNode(scene, 'body')) return { parts: this.parts(path)!, far: null, wheel: null, lights: null };
    const one = (name: string): AssetPart | null => flattenParts(scene, named(name))[0] ?? null;
    const far = flattenParts(scene, named('body_lod1'));
    const at = (name: string): THREE.Vector3 | null => {
      const n = findNode(scene, name);
      return n ? scene.worldToLocal(n.getWorldPosition(new THREE.Vector3())).multiply(scene.scale) : null;
    };
    const axles = ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr'].map(at);
    const near = one('wheel');
    const head = at('light_head_l');
    const tail = at('light_tail_l');
    return {
      parts: flattenParts(scene, named('body')),
      far: far.length ? far : null,
      wheel: near && axles.every(Boolean) ? { near, far: one('wheel_lod1'), axles: axles as THREE.Vector3[] } : null,
      lights: head && tail ? { head, tail } : null,
    };
  }

  /** For tests: register a scene as if it had been loaded. */
  inject(path: string, scene: THREE.Group, clips: THREE.AnimationClip[] = []): void {
    scene.scale.setScalar(UNITS_PER_METRE);
    scene.updateMatrixWorld(true);
    this.scenes.set(path, scene);
    this.clips.set(path, clips);
    this.partsCache.delete(path);
    this.loaded.push(path);
  }
}
