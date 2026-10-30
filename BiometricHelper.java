package com.takaguchhi.money;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.PackageManager;
import android.hardware.biometrics.BiometricManager;
import android.hardware.biometrics.BiometricPrompt;
import android.os.Build;
import android.os.CancellationSignal;
import android.webkit.WebView;

/** Fingerprint / face unlock for Android 9 (API 28) and above. Older phones use the PIN only. */
@SuppressLint("NewApi")
final class BiometricHelper {
    private BiometricHelper() {}

    static boolean canUse(Context context) {
        if (Build.VERSION.SDK_INT < 28) return false;
        PackageManager pm = context.getPackageManager();
        boolean hardware = pm.hasSystemFeature(PackageManager.FEATURE_FINGERPRINT);
        if (Build.VERSION.SDK_INT >= 29) {
            hardware = hardware
                    || pm.hasSystemFeature("android.hardware.biometrics.face")
                    || pm.hasSystemFeature("android.hardware.biometrics.iris");
        }
        if (!hardware) return false;
        if (Build.VERSION.SDK_INT >= 29) {
            BiometricManager manager = context.getSystemService(BiometricManager.class);
            return manager != null && manager.canAuthenticate() == BiometricManager.BIOMETRIC_SUCCESS;
        }
        return true;
    }

    static void authenticate(Context context, WebView web, String title, String negative) {
        if (Build.VERSION.SDK_INT < 28) {
            send(web, false, "unsupported");
            return;
        }
        try {
            BiometricPrompt prompt = new BiometricPrompt.Builder(context)
                    .setTitle(title)
                    .setNegativeButton(negative, context.getMainExecutor(), (dialog, which) -> send(web, false, "cancel"))
                    .build();
            prompt.authenticate(new CancellationSignal(), context.getMainExecutor(),
                    new BiometricPrompt.AuthenticationCallback() {
                        @Override
                        public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
                            send(web, true, "");
                        }

                        @Override
                        public void onAuthenticationError(int errorCode, CharSequence errString) {
                            send(web, false, "e" + errorCode);
                        }
                    });
        } catch (Exception e) {
            send(web, false, "error");
        }
    }

    private static void send(WebView web, boolean ok, String code) {
        web.post(() -> web.evaluateJavascript(
                "window.onBiometricResult&&onBiometricResult(" + ok + ",'" + code + "')", null));
    }
}
