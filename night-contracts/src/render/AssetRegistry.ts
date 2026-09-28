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
import { gameAssetFiles } from 'virtual:game-assets';
import { UNITS_PER_METRE, type CarModel } from '../config/tuning';

export interface CarAssetPart {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

export interface CarAsset {
  parts: CarAssetPart[];
}

const BASE = `${import.meta.env.BASE_URL}game-assets/`;

export class AssetRegistry {
  private readonly cars = new Map<CarModel, CarAsset>();
  private readonly scenes = new Map<string, THREE.Group>();
  readonly loaded: string[] = [];
  readonly missing: string[] = [];

  has(path: string): boolean {
    return gameAssetFiles.includes(path);
  }

  async load(): Promise<void> {
    const loader = new GLTFLoader();
    const wanted: string[] = [
      'models/bike/bike.glb',
      'models/rider/rider.glb',
      ...(['sedan', 'suv', 'limo', 'police', 'civ-hatch', 'civ-ute', 'civ-van'] as const).map((n) => `models/cars/${n}.glb`),
    ];
    await Promise.all(
      wanted.map(async (path) => {
        if (!this.has(path)) {
          this.missing.push(path);
          return;
        }
        try {
          const gltf = await loader.loadAsync(BASE + path);
          const root = gltf.scene;
          root.scale.setScalar(UNITS_PER_METRE);
          root.updateMatrixWorld(true);
          this.scenes.set(path, root);
          const carName = path.match(/cars\/(?:civ-)?(\w+)\.glb$/)?.[1] as CarModel | undefined;
          if (carName) this.cars.set(carName, this.flattenCar(root));
          this.loaded.push(path);
        } catch (err) {
          console.warn(`Asset failed to load, using placeholder: ${path}`, err);
          this.missing.push(path);
        }
      }),
    );
    if (this.missing.length) console.info(`Using code-built placeholders for ${this.missing.length} models (no GLB found).`);
  }

  /** Bake a car scene into one geometry per material for instancing. */
  private flattenCar(root: THREE.Object3D): CarAsset {
    const byMat = new Map<THREE.Material, THREE.BufferGeometry[]>();
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const g = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
      let list = byMat.get(mat);
      if (!list) byMat.set(mat, (list = []));
      list.push(g);
    });
    const parts: CarAssetPart[] = [];
    for (const [material, geos] of byMat) {
      for (const geometry of geos) parts.push({ geometry, material });
    }
    return { parts };
  }

  car(model: CarModel): CarAsset | null {
    return this.cars.get(model) ?? null;
  }

  scene(path: string): THREE.Group | null {
    const s = this.scenes.get(path);
    return s ? (s.clone(true) as THREE.Group) : null;
  }
}
