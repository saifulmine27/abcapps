# TakaGuchhi Android

Android WebView package for the TakaGuchhi money tracker. The launcher name is **TakaGuchhi**. The web app is bundled in `app/src/main/assets`, so records and graphs work without hosting the front-end. Records are stored locally on the Android device.

The source is set up for a GitHub Actions debug APK build. Upload `TakaGuchhi-Android.zip` and `.github/workflows/build-android.yml` to a GitHub repository; the workflow builds `app-debug.apk` and publishes it as `takaguchhi-debug-apk`.

Google cloud sync is not active until the Firebase web configuration and Firestore rules from the web project are configured. Google sign-in inside Android WebView also needs Android-specific OAuth handling before it can be used as a production account flow.
