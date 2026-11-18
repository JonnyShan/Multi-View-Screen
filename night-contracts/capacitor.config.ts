import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nightcontracts.game',
  appName: 'Night Contracts',
  webDir: 'dist',
  backgroundColor: '#0e0f11',
  ios: { contentInset: 'never', backgroundColor: '#0e0f11' },
  android: { backgroundColor: '#0e0f11' },
};

export default config;
