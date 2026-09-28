/** localStorage persistence with a versioned schema. Never throws. */

export type QualityPref = 'auto' | 'low' | 'medium' | 'high' | 'ultra';
export type WeatherPref = 'auto' | 'clear' | 'rain';

export interface ButtonLayout {
  [id: string]: { x: number; y: number };
}

export interface Settings {
  quality: QualityPref;
  pauseClock: boolean;
  weather: WeatherPref;
  master: number;
  music: number;
  sfx: number;
  haptics: boolean;
  showDebug: boolean;
  invertLook: boolean;
  /** Screen space ambient occlusion on High (always on for Ultra). */
  ao: boolean;
  layout: ButtonLayout;
}

export interface SaveData {
  version: 1;
  cash: number;
  contractIndex: number;
  loop: number;
  gameHour: number;
  stats: { contracts: number; kills: Record<string, number>; deaths: number };
  settings: Settings;
}

export const defaultSettings = (): Settings => ({
  quality: 'auto',
  pauseClock: false,
  weather: 'auto',
  master: 0.8,
  music: 0.5,
  sfx: 0.9,
  haptics: true,
  showDebug: false,
  invertLook: false,
  ao: false,
  layout: {},
});

export const defaultSave = (): SaveData => ({
  version: 1,
  cash: 2500,
  contractIndex: 0,
  loop: 0,
  gameHour: -1,
  stats: { contracts: 0, kills: {}, deaths: 0 },
  settings: defaultSettings(),
});

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class SaveService {
  private static readonly KEY = 'night-contracts.save.v1';

  constructor(private readonly store: KeyValueStore | null = SaveService.defaultStore()) {}

  private static defaultStore(): KeyValueStore | null {
    try {
      return typeof localStorage !== 'undefined' ? localStorage : null;
    } catch {
      return null;
    }
  }

  load(): SaveData {
    const fresh = defaultSave();
    try {
      const raw = this.store?.getItem(SaveService.KEY);
      if (!raw) return fresh;
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      if (parsed.version !== 1) return fresh;
      return {
        ...fresh,
        ...parsed,
        stats: { ...fresh.stats, ...(parsed.stats ?? {}) },
        settings: { ...fresh.settings, ...(parsed.settings ?? {}) },
      } as SaveData;
    } catch {
      return fresh;
    }
  }

  save(data: SaveData): boolean {
    try {
      this.store?.setItem(SaveService.KEY, JSON.stringify(data));
      return !!this.store;
    } catch {
      return false;
    }
  }

  reset(): void {
    try {
      this.store?.removeItem(SaveService.KEY);
    } catch {
      /* storage unavailable */
    }
  }
}
