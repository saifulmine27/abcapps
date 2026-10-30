package com.takaguchhi.money;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;

public final class MainActivity extends Activity {
    private static final int RC_GOOGLE = 9001;
    private WebView webView;

    private final class LockBridge {
        @JavascriptInterface
        public boolean canBiometric() {
            return BiometricHelper.canUse(MainActivity.this);
        }

        @JavascriptInterface
        public void authenticate(String title, String negative) {
            runOnUiThread(() -> BiometricHelper.authenticate(MainActivity.this, webView, title, negative));
        }
    }

    private final class AuthBridge {
        @JavascriptInterface
        public void googleSignIn() {
            runOnUiThread(() -> {
                GoogleSignInOptions options = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                        .requestIdToken(getString(R.string.web_client_id))
                        .requestEmail()
                        .build();
                GoogleSignInClient client = GoogleSignIn.getClient(MainActivity.this, options);
                client.signOut().addOnCompleteListener(task ->
                        startActivityForResult(client.getSignInIntent(), RC_GOOGLE));
            });
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(8, 124, 96));
        getWindow().setNavigationBarColor(Color.rgb(242, 246, 244));
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);

        WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(242, 246, 244));
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setSupportZoom(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                android.webkit.WebResourceResponse local = assetLoader.shouldInterceptRequest(request.getUrl());
                return local != null ? local : super.shouldInterceptRequest(view, request);
            }
        });
        webView.addJavascriptInterface(new AuthBridge(), "AndroidAuth");
        webView.addJavascriptInterface(new LockBridge(), "AndroidLock");
        setContentView(webView);
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != RC_GOOGLE || webView == null) return;
        try {
            GoogleSignInAccount account = GoogleSignIn.getSignedInAccountFromIntent(data).getResult(ApiException.class);
            String token = account.getIdToken() == null ? "" : account.getIdToken();
            webView.evaluateJavascript("window.onNativeGoogleToken&&onNativeGoogleToken('" + token + "')", null);
        } catch (ApiException e) {
            webView.evaluateJavascript("window.onNativeGoogleError&&onNativeGoogleError('" + e.getStatusCode() + "')", null);
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
