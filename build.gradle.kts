plugins {
    id("com.android.application")
}

android {
    namespace = "com.takaguchhi.money"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.takaguchhi.money"
        minSdk = 23
        targetSdk = 34
        versionCode = 2
        versionName = "1.1"
    }

    signingConfigs {
        getByName("debug") {
            storeFile = file("takaguchhi.keystore")
            storePassword = "takaguchhi123"
            keyAlias = "takaguchhi"
            keyPassword = "takaguchhi123"
        }
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("com.google.android.gms:play-services-auth:21.2.0")
}
