import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

export const isAndroid = Capacitor.getPlatform() === 'android';

export async function getDeviceInfo() {
  return await Device.getInfo();
}
