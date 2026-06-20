package com.keesleemeijer.photos.macrobenchmark

import androidx.benchmark.macro.BaselineProfileMode
import androidx.benchmark.macro.CompilationMode
import androidx.benchmark.macro.FrameTimingMetric
import androidx.benchmark.macro.StartupMode
import androidx.benchmark.macro.junit4.MacrobenchmarkRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.uiautomator.By
import androidx.test.uiautomator.Direction
import androidx.test.uiautomator.Until
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * The pitch metric. FrameTimingMetric reports frameDurationCpuMs P50/P90/P95/P99 — anything under
 * the frame budget (16.6ms@60Hz) is a frame we did not drop. Scripts a fling-scroll + a pinch across
 * the density tiers: exactly the gestures we claim are silky.
 */
@RunWith(AndroidJUnit4::class)
class FrameTimingBenchmark {
    @get:Rule val benchmarkRule = MacrobenchmarkRule()

    @Test fun mosaicScrollAndPinch() = benchmarkRule.measureRepeated(
        packageName = TARGET_PACKAGE,
        metrics = listOf(FrameTimingMetric()),
        iterations = 10,
        startupMode = StartupMode.WARM,
        compilationMode = CompilationMode.Partial(baselineProfileMode = BaselineProfileMode.Require),
        setupBlock = { pressHome(); startActivityAndWait() },
    ) {
        val grid = device.wait(Until.findObject(By.res("mosaic_grid")), 5_000)
            ?: error("mosaic_grid not found — is Modifier.testTag(\"mosaic_grid\") + testTagsAsResourceId set?")
        grid.setGestureMargin(device.displayWidth / 5)
        repeat(3) { grid.fling(Direction.DOWN); device.waitForIdle() }
        grid.fling(Direction.UP); device.waitForIdle()
        grid.pinchClose(0.6f); device.waitForIdle()  // toward Feature
        grid.pinchOpen(0.6f); device.waitForIdle()   // toward Overview
    }
}
