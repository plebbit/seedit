import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'seedit.android',
  appName: 'seedit',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    "CapacitorHttp": {
      "enabled": true
    },
  },
};

export default config;