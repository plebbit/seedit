package seedit.android;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Log;
import android.database.Cursor;
import android.provider.OpenableColumns;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.PluginCall;
import androidx.activity.result.ActivityResult;

import java.io.File;
import java.io.IOException;
import java.io.FileOutputStream;
import java.util.concurrent.TimeUnit;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

@CapacitorPlugin(name = "FileUploader")
public class FileUploaderPlugin extends Plugin {
    private static final String TAG = "FileUploaderPlugin";

    @PluginMethod
    public void pickAndUploadMedia(PluginCall call) {
        Log.d(TAG, "pickAndUploadMedia called");
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("*/*");
        String[] mimeTypes = {"image/jpeg", "image/png", "video/mp4", "video/webm"};
        intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);
        startActivityForResult(call, intent, "pickFileResult");
    }

    @ActivityCallback
    private void pickFileResult(PluginCall call, ActivityResult result) {
        Log.d(TAG, "pickFileResult callback received");
        if (call == null) {
            return;
        }

        if (result.getResultCode() == Activity.RESULT_OK) {
            Intent data = result.getData();
            if (data != null) {
                Uri uri = data.getData();
                uploadToCatbox(uri, call);
            } else {
                call.reject("No data received");
            }
        } else {
            call.reject("File selection cancelled");
        }
    }

    private void uploadToCatbox(Uri fileUri, PluginCall call) {
        new Thread(() -> {
            try {
                Log.d(TAG, "Starting file conversion from URI");
                File file = FileUtils.getFileFromUri(getContext(), fileUri);
                Log.d(TAG, "File name: " + file.getName());
                
                JSObject statusUpdate = new JSObject();
                statusUpdate.put("status", "Uploading to catbox.moe...");
                notifyListeners("uploadStatus", statusUpdate);
                
                OkHttpClient client = new OkHttpClient.Builder()
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .writeTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .build();

                RequestBody requestBody = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM)
                    .addFormDataPart("reqtype", "fileupload")
                    .addFormDataPart("fileToUpload", file.getName(),
                        RequestBody.create(MediaType.parse("application/octet-stream"), file))
                    .build();

                Request request = new Request.Builder()
                    .url("https://catbox.moe/user/api.php")
                    .post(requestBody)
                    .build();

                try (Response response = client.newCall(request).execute()) {
                    if (!response.isSuccessful()) throw new IOException("Unexpected response " + response);
                    
                    String url = response.body().string();
                    Log.d(TAG, "Upload successful. URL: " + url);
                    
                    JSObject ret = new JSObject();
                    ret.put("url", url);
                    ret.put("fileName", file.getName());
                    ret.put("status", "Upload complete!");
                    call.resolve(ret);
                }
            } catch (Exception e) {
                Log.e(TAG, "Upload failed", e);
                call.reject("Upload failed: " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void uploadMedia(PluginCall call) {
        if (!call.getData().has("fileData") || !call.getData().has("fileName")) {
            call.reject("Missing required parameters fileData or fileName");
            return;
        }

        String fileData = call.getString("fileData");
        String fileName = call.getString("fileName");

        // Execute in background thread to avoid blocking UI
        new Thread(() -> {
            try {
                // Convert base64 to file
                byte[] decodedBytes = android.util.Base64.decode(fileData, android.util.Base64.DEFAULT);
                File tempFile = new File(getContext().getCacheDir(), fileName);
                try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                    fos.write(decodedBytes);
                }
                
                // Create multipart upload form
                OkHttpClient client = new OkHttpClient.Builder()
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .writeTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .build();

                RequestBody requestBody = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM)
                    .addFormDataPart("reqtype", "fileupload")
                    .addFormDataPart("fileToUpload", fileName,
                        RequestBody.create(MediaType.parse("application/octet-stream"), tempFile))
                    .build();

                Request request = new Request.Builder()
                    .url("https://catbox.moe/user/api.php")
                    .post(requestBody)
                    .build();

                try (Response response = client.newCall(request).execute()) {
                    if (!response.isSuccessful()) throw new IOException("Unexpected response " + response);
                    
                    String url = response.body().string();
                    
                    // Return the result to JavaScript
                    JSObject ret = new JSObject();
                    ret.put("url", url);
                    ret.put("fileName", fileName);
                    getActivity().runOnUiThread(() -> {
                        call.resolve(ret);
                    });
                    
                    // Clean up temp file
                    tempFile.delete();
                }
            } catch (Exception e) {
                getActivity().runOnUiThread(() -> {
                    call.reject("Upload failed: " + e.getMessage(), e);
                });
            }
        }).start();
    }

    @PluginMethod
    public void pickMedia(PluginCall call) {
        Log.d(TAG, "pickMedia called");
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("*/*");
        String[] mimeTypes = {"image/jpeg", "image/png", "video/mp4", "video/webm"};
        intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);
        startActivityForResult(call, intent, "pickMediaResult");
    }

    @ActivityCallback
    private void pickMediaResult(PluginCall call, ActivityResult result) {
        Log.d(TAG, "pickMediaResult callback received");
        if (call == null) {
            return;
        }

        if (result.getResultCode() == Activity.RESULT_OK) {
            Intent data = result.getData();
            if (data != null) {
                Uri uri = data.getData();
                try {
                    // Get file name
                    String fileName = getFileNameFromUri(uri);
                    
                    // Get mime type
                    String mimeType = getContext().getContentResolver().getType(uri);
                    if (mimeType == null) {
                        mimeType = "application/octet-stream";
                    }
                    
                    // Read file into a byte array
                    InputStream inputStream = getContext().getContentResolver().openInputStream(uri);
                    ByteArrayOutputStream byteBuffer = new ByteArrayOutputStream();
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = inputStream.read(buffer)) != -1) {
                        byteBuffer.write(buffer, 0, len);
                    }
                    byte[] fileBytes = byteBuffer.toByteArray();
                    inputStream.close();
                    
                    // Convert to base64
                    String base64Data = android.util.Base64.encodeToString(fileBytes, android.util.Base64.DEFAULT);
                    
                    // Return data to JavaScript
                    JSObject ret = new JSObject();
                    ret.put("data", base64Data);
                    ret.put("fileName", fileName);
                    ret.put("mimeType", mimeType);
                    call.resolve(ret);
                } catch (Exception e) {
                    call.reject("Failed to read file: " + e.getMessage(), e);
                }
            } else {
                call.reject("No data received");
            }
        } else {
            call.reject("File selection cancelled");
        }
    }

    // Helper method to get file name from URI
    private String getFileNameFromUri(Uri uri) {
        String result = null;
        if (uri.getScheme().equals("content")) {
            Cursor cursor = getContext().getContentResolver().query(uri, null, null, null, null);
            try {
                if (cursor != null && cursor.moveToFirst()) {
                    int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                    if (nameIndex >= 0) {
                        result = cursor.getString(nameIndex);
                    }
                }
            } finally {
                if (cursor != null) {
                    cursor.close();
                }
            }
        }
        if (result == null) {
            result = uri.getPath();
            int cut = result.lastIndexOf('/');
            if (cut != -1) {
                result = result.substring(cut + 1);
            }
        }
        return result;
    }
}