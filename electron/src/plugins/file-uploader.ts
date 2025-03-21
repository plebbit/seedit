import { dialog, ipcMain } from 'electron';
import { createReadStream } from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export function setupFileUploaderPlugin(mainWindow: Electron.BrowserWindow) {
  // Handle the file upload request from the renderer
  ipcMain.handle('plugin:file-uploader:pickAndUploadMedia', async () => {
    try {
      // Open file dialog
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'Images & Videos', extensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm'] }],
      });

      if (result.canceled || result.filePaths.length === 0) {
        throw new Error('File selection cancelled');
      }

      const filePath = result.filePaths[0];
      const fileName = path.basename(filePath);

      // Create form data for upload
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('fileToUpload', createReadStream(filePath));

      // Upload to catbox.moe
      const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const url = await response.text();
      return { url, fileName };
    } catch (error) {
      console.error('FileUploader error:', error);
      throw error;
    }
  });

  // Add the uploadMedia handler
  ipcMain.handle('plugin:file-uploader:uploadMedia', async (_, fileData) => {
    try {
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');

      if (fileData.fileData && fileData.fileName) {
        // If we have base64 data from pickMedia
        const tempFilePath = path.join(app.getPath('temp'), fileData.fileName);

        // Write the base64 data to a temp file
        fs.writeFileSync(tempFilePath, Buffer.from(fileData.fileData, 'base64'));

        // Append the file to the form
        formData.append('fileToUpload', createReadStream(tempFilePath));

        // Upload to catbox.moe
        const response = await fetch('https://catbox.moe/user/api.php', {
          method: 'POST',
          body: formData,
        });

        // Clean up temp file
        fs.unlinkSync(tempFilePath);

        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }

        const url = await response.text();
        return { url, fileName: fileData.fileName };
      } else {
        throw new Error('Invalid file data');
      }
    } catch (error) {
      console.error('FileUploader uploadMedia error:', error);
      throw error;
    }
  });

  // Add the pickMedia handler to Electron
  ipcMain.handle('plugin:file-uploader:pickMedia', async () => {
    try {
      // Open file dialog
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'Images & Videos', extensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm'] }],
      });

      if (result.canceled || result.filePaths.length === 0) {
        throw new Error('File selection cancelled');
      }

      const filePath = result.filePaths[0];
      const fileName = path.basename(filePath);

      // Read the file as base64
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');

      // Determine mime type from extension
      const ext = path.extname(fileName).toLowerCase();
      let mimeType = 'application/octet-stream';
      if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.gif') mimeType = 'image/gif';
      else if (ext === '.mp4') mimeType = 'video/mp4';
      else if (ext === '.webm') mimeType = 'video/webm';

      return {
        data: base64Data,
        fileName,
        mimeType,
      };
    } catch (error) {
      console.error('FileUploader pickMedia error:', error);
      throw error;
    }
  });
}
