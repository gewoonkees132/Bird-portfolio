package com.keesleemeijer.photos

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTagsAsResourceId
import androidx.metrics.performance.JankStats
import androidx.metrics.performance.PerformanceMetricsState
import com.keesleemeijer.photos.ui.LibraryRoot
import com.keesleemeijer.photos.ui.theme.AppTheme

class MainActivity : ComponentActivity() {

    private lateinit var jankStats: JankStats
    private lateinit var metricsStateHolder: PerformanceMetricsState.Holder

    private val jankListener = JankStats.OnFrameListener { frameData ->
        if (frameData.isJank) {
            Log.w("JankStats", "JANK ${"%.1f".format(frameData.frameDurationUiNanos / 1_000_000.0)}ms states=${frameData.states}")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { Root() }

        metricsStateHolder = PerformanceMetricsState.getHolderForHierarchy(window.decorView)
        jankStats = JankStats.createAndTrack(window, jankListener)
        jankStats.isTrackingEnabled = BuildConfig.DEBUG  // development microscope; authoritative numbers come from :macrobenchmark
        metricsStateHolder.state?.putState("Activity", javaClass.simpleName)
    }

    override fun onResume() { super.onResume(); jankStats.isTrackingEnabled = BuildConfig.DEBUG }
    override fun onPause() { super.onPause(); jankStats.isTrackingEnabled = false }
}

@OptIn(ExperimentalComposeUiApi::class)
@Composable
private fun Root() {
    AppTheme {
        Surface(
            modifier = Modifier.fillMaxSize().semantics { testTagsAsResourceId = true },
            color = AppTheme.tokens.colors.canvas,
        ) { LibraryRoot() }
    }
}
