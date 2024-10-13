import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'seedit.android',
  appName: 'seedit',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    Device: {
      lazyLoad: true,
    },
  },
};

export default config;
