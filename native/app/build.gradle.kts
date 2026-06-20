plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.androidx.baselineprofile)
}

android {
    namespace = "com.keesleemeijer.photos"
    compileSdk = libs.versions.compileSdk.get().toInt()

    defaultConfig {
        applicationId = "com.keesleemeijer.photos"
        minSdk = libs.versions.minSdk.get().toInt()
        targetSdk = libs.versions.targetSdk.get().toInt()
        versionCode = 1
        versionName = "0.1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables { useSupportLibrary = true }
    }

    buildTypes {
        debug { applicationIdSuffix = ".debug"; isMinifyEnabled = false }
        release {
            isMinifyEnabled = true       // R8
            isShrinkResources = true     // requires isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfig = signingConfigs.getByName("debug") // prototype builds without a keystore
        }
        create("benchmark") {
            initWith(buildTypes.getByName("release"))
            signingConfig = signingConfigs.getByName("debug")
            matchingFallbacks += listOf("release")
            isDebuggable = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlin { compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) } }

    buildFeatures { compose = true; buildConfig = true }

    packaging {
        resources {
            excludes += setOf(
                "/META-INF/{AL2.0,LGPL2.1}", "/META-INF/DEPENDENCIES", "/META-INF/LICENSE*",
                "/META-INF/NOTICE*", "/META-INF/*.kotlin_module", "DebugProbesKt.bin",
            )
        }
    }
}

// benchmark 1.5.0-alpha's baselineProfile extension is project-scoped (not per-buildType).
// Default off; turn on automatic generation only for the shipping `release` variant so
// `assembleRelease` regenerates the profile, while `benchmark` is measured via CompilationMode in tests.
baselineProfile {
    automaticGenerationDuringBuild = false
    variants {
        maybeCreate("release").automaticGenerationDuringBuild = true
    }
}

dependencies {
    val composeBom = platform(libs.compose.bom)
    implementation(composeBom)
    androidTestImplementation(composeBom)

    implementation(libs.compose.ui)
    implementation(libs.compose.ui.graphics)
    implementation(libs.compose.ui.tooling.preview)
    implementation(libs.compose.foundation)
    implementation(libs.compose.material3)
    implementation(libs.compose.animation)

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)

    implementation(libs.coil.compose)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.coroutines.android)

    implementation(libs.androidx.metrics.performance)   // JankStats (wired in Task 10)
    implementation(libs.androidx.profileinstaller)      // baseline profile installer (Task 10)

    baselineProfile(project(":macrobenchmark"))

    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)

    androidTestImplementation(libs.androidx.test.ext.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.compose.ui.test.junit4)
    // UiAutomator queries the real view/a11y tree, independent of Compose's idling resource. Required
    // because the Detail screen's SharedTransition keeps Compose perpetually "busy" (pending lookahead
    // measure/layout), so every Compose-test finder/assert blocks on idle while Detail is open. The app
    // exposes testTags as resource-ids (MainActivity: testTagsAsResourceId = true) for By.res().
    androidTestImplementation(libs.androidx.uiautomator)
    debugImplementation(libs.compose.ui.tooling)
    debugImplementation(libs.compose.ui.test.manifest)
}
