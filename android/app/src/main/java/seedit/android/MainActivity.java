package seedit.android;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(FileUploaderPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
