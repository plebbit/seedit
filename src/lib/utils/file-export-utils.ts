import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export interface ExportFileOptions {
  content: string;
  fileName: string;
  mimeType?: string;
}

/**
 * Cross-platform file export utility that works on both web and mobile platforms
 */
export const exportFile = async ({ content, fileName, mimeType = 'application/json' }: ExportFileOptions): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Mobile platform: Use Capacitor Filesystem and Share APIs
      await exportFileOnMobile({ content, fileName, mimeType });
    } else {
      // Web platform: Use browser download APIs
      await exportFileOnWeb({ content, fileName, mimeType });
    }
  } catch (error) {
    console.error('File export failed:', error);
    throw error;
  }
};

/**
 * Export file on mobile platforms using Capacitor APIs
 */
const exportFileOnMobile = async ({ content, fileName, mimeType }: ExportFileOptions): Promise<void> => {
  try {
    // First, try to write to a temporary location that doesn't require permissions
    let result;
    try {
      // Try External directory first (usually doesn't require permissions)
      result = await Filesystem.writeFile({
        path: fileName,
        data: content,
        directory: Directory.External,
        encoding: Encoding.UTF8,
      });

      console.log('File written to External directory:', result.uri);

      // Use the Share API to let the user save the file where they want
      // This gives them full control over the save location
      await Share.share({
        title: 'Save Account Backup',
        text: `Save your account backup file: ${fileName}`,
        url: result.uri,
        dialogTitle: 'Choose where to save your account backup',
      });
    } catch (externalError) {
      console.log('External directory failed, trying app-specific directory:', externalError);

      // Fallback: Write to app's private data directory and share from there
      result = await Filesystem.writeFile({
        path: fileName,
        data: content,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });

      console.log('File written to Data directory:', result.uri);

      // Share from the private directory
      await Share.share({
        title: 'Save Account Backup',
        text: `Save your account backup file: ${fileName}`,
        url: result.uri,
        dialogTitle: 'Choose where to save your account backup',
      });
    }
  } catch (error) {
    console.error('Mobile file export failed:', error);
    throw new Error(`Failed to export file on mobile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Export file on web platforms using browser download APIs
 */
const exportFileOnWeb = async ({ content, fileName, mimeType }: ExportFileOptions): Promise<void> => {
  try {
    // Create a Blob from the content
    const blob = new Blob([content], { type: mimeType });

    // Create a URL for the Blob
    const fileUrl = URL.createObjectURL(blob);

    // Create a temporary download link
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;

    // Append the link, trigger the download, then remove the link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the Blob URL
    URL.revokeObjectURL(fileUrl);
  } catch (error) {
    console.error('Web file export failed:', error);
    throw new Error(`Failed to export file on web: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Check if the current platform supports file exports
 */
export const isFileExportSupported = (): boolean => {
  if (Capacitor.isNativePlatform()) {
    // On mobile, check if Filesystem and Share plugins are available
    return true; // We know they're installed
  } else {
    // On web, check if browser APIs are available
    return typeof Blob !== 'undefined' && typeof URL !== 'undefined' && typeof document !== 'undefined';
  }
};
