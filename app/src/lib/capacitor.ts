import { Capacitor } from '@capacitor/core';

/** Web (PWA) vs native Android ayrımı. */
export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Native shell'de status bar / splash uyumu.
 * Dinamik import kullanılır ki web bundle'a Capacitor native kodu girmesin.
 */
export async function initNativeShell(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    await StatusBar.setBackgroundColor({ color: '#0b1722' }).catch(() => {});
    await SplashScreen.hide().catch(() => {});
  } catch {
    // Web'de veya eklenti yoksa sessiz geç
  }
}

/**
 * Native push kaydı (FCM). google-services.json eklendikten sonra çağrılır.
 * Şu an web bildirim hattı (Convex notifications + Notification API) korunur;
 * native token Convex users tablosuna yazılınca FCM'e geçilir.
 */
export async function registerNativePush(): Promise<string | null> {
  if (!isNativeAndroid()) return null;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== 'granted') return null;
    await PushNotifications.register();
    return await new Promise<string | null>((resolve) => {
      PushNotifications.addListener('registration', (t) => resolve(t.value));
      PushNotifications.addListener('registrationError', () => resolve(null));
      setTimeout(() => resolve(null), 8000);
    });
  } catch {
    return null;
  }
}

/**
 * Android geri tuşu: router'a bırak, kökte ise uygulamayı arka plana at.
 * Dashboard.tsx içinde window history ile birlikte kullanılması önerilir.
 */
export async function setupAndroidBackButton(onExit?: () => void): Promise<() => void> {
  if (!isNativeAndroid()) return () => {};
  const { App } = await import('@capacitor/app');
  const sub = await App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      onExit?.();
    }
  });
  return () => sub.remove();
}
