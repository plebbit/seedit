package seedit.android;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.capacitorjs.plugins.localnotifications.LocalNotificationsPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Register custom and community plugins after initialization
        registerPlugin(FileUploaderPlugin.class);
        registerPlugin(LocalNotificationsPlugin.class);
    }
}
