import { registerPlugin } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

export interface FileUploaderPlugin {
  pickAndUploadMedia(): Promise<{ url: string; fileName: string }>;
  uploadMedia(fileData: { fileData?: string; fileName: string } | File): Promise<{ url: string; fileName: string }>;
  pickMedia(): Promise<{ data: string; fileName: string; mimeType: string }>;
}

const FileUploader = Capacitor.isNativePlatform()
  ? registerPlugin<FileUploaderPlugin>('FileUploader')
  : {
      pickAndUploadMedia: async () => {
        // For Electron, we'll use IPC
        if (window.electron) {
          return window.electron.invoke('plugin:file-uploader:pickAndUploadMedia');
        }
        throw new Error('FileUploader is not supported on this platform');
      },
      uploadMedia: async (fileData: { fileData?: string; fileName: string } | File) => {
        if (window.electron) {
          return window.electron.invoke('plugin:file-uploader:uploadMedia', fileData);
        }
        throw new Error('FileUploader is not supported on this platform');
      },
      pickMedia: async () => {
        console.log('Calling pickMedia');
        if (window.electron) {
          console.log('window.electron exists, invoking IPC');
          try {
            const result = await window.electron.invoke('plugin:file-uploader:pickMedia');
            console.log('IPC result:', result);
            return result;
          } catch (error) {
            console.error('IPC error:', error);
            throw error;
          }
        }
        throw new Error('FileUploader is not supported on this platform');
      },
    };

export default FileUploader;

// Add TypeScript type declaration for Electron
declare global {
  interface Window {
    electron?: {
      invoke(channel: string, ...args: any[]): Promise<any>;
    };
  }
}
