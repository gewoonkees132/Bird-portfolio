package com.keesleemeijer.photos.macrobenchmark

import androidx.benchmark.macro.junit4.BaselineProfileRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.uiautomator.By
import androidx.test.uiautomator.Direction
import androidx.test.uiautomator.Until
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Walks the critical user journey so R8 pre-compiles those classes: launch → scroll → pinch tiers →
 * open Detail.
 */
@RunWith(AndroidJUnit4::class)
class BaselineProfileGenerator {
    @get:Rule val baselineProfileRule = BaselineProfileRule()

    @Test fun generate() = baselineProfileRule.collect(
        packageName = TARGET_PACKAGE,
        includeInStartupProfile = true,
    ) {
        pressHome()
        startActivityAndWait()
        val grid = device.wait(Until.findObject(By.res("mosaic_grid")), 5_000) ?: return@collect
        grid.setGestureMargin(device.displayWidth / 5)
        repeat(3) { grid.fling(Direction.DOWN); device.waitForIdle() }
        grid.pinchOpen(0.6f); device.waitForIdle()
        grid.pinchClose(0.6f); device.waitForIdle()
        // Open Detail (the Theatre) so the shared-element transition is profiled.
        device.findObject(By.res("mosaic_grid"))?.children?.firstOrNull()?.click()
        device.wait(Until.hasObject(By.res("detail")), 3_000)
        device.waitForIdle()
    }
}
