import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.makinenabzi.app',
  appName: 'Makine Nabzı',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Üretimde gömülü dist kullanılır. Canlı önizleme için:
    // npx cap run android --livereload --external
  },
  android: {
    // Splash ve status bar marka rengine uyumlu
    backgroundColor: '#0b1722',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#0b1722',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0b1722',
    },
  },
};

export default config;
