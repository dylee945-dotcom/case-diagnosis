import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kr.newlawyer.casediagnosis',
  appName: '사건 자가진단기',
  webDir: 'dist',
  android: {
    backgroundColor: '#0a1628',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a1628',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
