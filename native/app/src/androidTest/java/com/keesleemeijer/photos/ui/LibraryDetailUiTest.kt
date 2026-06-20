package com.keesleemeijer.photos.ui

import android.content.Context
import android.content.Intent
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.By
import androidx.test.uiautomator.BySelector
import androidx.test.uiautomator.Direction
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.Until
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Proves (spec §9 / guideline §8): Detail opens on tap; EVERY never-stuck exit dismisses Detail; the
 * density pill switches columns.
 *
 * WHY PURE UiAutomator (no ComposeTestRule):
 * The Detail card uses a SharedTransitionLayout sharedElement, whose continuous lookahead measure/layout
 * keeps Compose's test idling resource permanently "busy" — so every Compose-test call (finders,
 * fetchSemanticsNodes, performClick, assert*, waitForIdle, waitUntil) blocks FOREVER once Detail is open
 * (confirmed via ComposeNotIdleException: "busy due to pending measure/layout"). Worse, createAndroidComposeRule
 * also hijacks Dispatchers.Main and the frame clock, so it neither runs the ViewModel's async photo-load
 * coroutine nor recomposes in response to UiAutomator taps unless the clock is pumped — which can't happen
 * while Detail is open. UiAutomator sidesteps all of this: it launches the REAL app (real dispatcher + real
 * clock) and drives/inspects the on-device view tree directly, independent of Compose's idling resource.
 * The app exposes testTags as resource-ids (MainActivity: testTagsAsResourceId = true), so By.res("<tag>")
 * matches tiles/detail and By.desc("Close") matches the ✕. The in-process Compose-test harness is unusable
 * for the Detail screen, hence UiAutomator. Assertions remain exactly as strong as the spec: Detail must
 * appear on tap and must be GONE after each never-stuck exit; the pill must change the columns.
 *
 * RESULT: all 6 tests pass. The never-stuck doctrine is fully guarded on-device: Detail opens on tap and is
 * dismissed by EVERY exit — ✕, backdrop tap, swipe-down, and Back — and the density pill switches columns.
 * (The backdrop exit was a real never-stuck gap — the full-screen pager used to occlude the backdrop — and was
 * fixed in commit ee56182; see tapBackdrop_dismissesDetail for the now-guarded contract.)
 */
@RunWith(AndroidJUnit4::class)
class LibraryDetailUiTest {

    private val device: UiDevice = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())
    private val timeout = 8_000L
    private val pkg = "com.keesleemeijer.photos.debug"   // debug applicationIdSuffix

    private fun tag(t: String): BySelector = By.res(t)    // testTagsAsResourceId => bare resource-id

    @Before fun launchApp() {
        device.pressHome()
        val ctx = ApplicationProvider.getApplicationContext<Context>()
        val intent = ctx.packageManager.getLaunchIntentForPackage(pkg)!!
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK)
        ctx.startActivity(intent)
        // Wait for the grid to load its 16 photos (async coroutine in the ViewModel).
        assertTrue("App grid (tile_P1) never appeared", device.wait(Until.hasObject(tag("tile_P1")), timeout))
    }

    private fun openDetail() {
        device.findObject(tag("tile_P1")).click()
        assertTrue("Detail did not open on tile tap", device.wait(Until.hasObject(tag("detail")), timeout))
    }

    private fun assertDetailGone(after: String) =
        assertTrue("Detail still present after $after", device.wait(Until.gone(tag("detail")), timeout))

    @Test fun tapTile_opensDetail() {
        openDetail()
        assertNotNull("✕ (cd=Close) missing in Detail", device.findObject(By.desc("Close")))
    }

    @Test fun closeButton_dismissesDetail() {
        openDetail()
        device.findObject(By.desc("Close")).click()          // ✕ → close()
        assertDetailGone("✕")
    }

    @Test fun tapBackdrop_dismissesDetail() {
        openDetail()
        // Tap a point that is GENUINELY backdrop — high above the centered photo card and clear of the ✕
        // — so the tap lands on the dimmed margin, not the card (the center-tap targeting trap the spec
        // warns about). That is why the y coordinate is near the top (~10% down), clear of the card and ✕.
        //
        // FIXED CONTRACT (#3): tapping the dimmed backdrop margin dismisses Detail. Each pager page's
        // wrapping Box carries detectTapGestures { close() }, so a tap outside the centered card closes
        // Detail. The earlier backdrop bug — where the full-screen pager ate outside-card taps so the
        // backdrop's close() never fired — was fixed in DetailOverlay/DetailPhotoCard (commit ee56182).
        val d = device.findObject(tag("detail")).visibleBounds
        device.click(d.left + d.width() / 2, d.top + (d.height() * 0.10f).toInt())
        assertDetailGone("backdrop tap")
    }

    @Test fun swipeDown_dismissesDetail() {
        openDetail()
        // Real downward fling on the Detail pane, past the ~116dp dismiss threshold → close().
        device.findObject(tag("detail")).swipe(Direction.DOWN, 0.9f, 4000)
        assertDetailGone("swipe-down")
    }

    @Test fun back_dismissesDetail() {
        openDetail()
        device.pressBack()                                   // hardware Back → close()
        assertDetailGone("Back")
    }

    @Test fun densityPill_switchesColumnCount() {
        // No Compose semantics here (pure UiAutomator), so verify the column count geometrically:
        // count the distinct left-x positions of the visible tiles. Overview = 3 columns, Browse = 2.
        assertEquals("Overview default should be 3 columns", 3, visibleColumnCount())
        device.findObject(By.text("Some")).click()           // → Browse
        assertTrue("Grid did not settle after pill tap", device.wait(Until.hasObject(tag("tile_P1")), timeout))
        // Allow the staggered re-layout to settle, then re-measure.
        device.waitForIdle(timeout)
        assertEquals("Browse should be 2 columns", 2, retryColumnCount(2))
    }

    /**
     * Columns = number of lanes = the count of distinct left-edges of SINGLE-LANE tiles. Full-line
     * (panorama) tiles span ~the whole grid width and are EXCLUDED: a panorama's left edge coincides
     * with column-0's left-x today, but that is fixture-dependent coincidence — filtering them out by
     * WIDTH keeps the count correct if the fixture's panorama placement ever changes. A single-lane tile
     * is at most ~1/2 of the grid width, so the < 0.7 × gridWidth cutoff cleanly separates the two.
     */
    private fun visibleColumnCount(): Int {
        // Grid/content width from the mosaic_grid node (fall back to the device display width).
        val gridWidth = boundsOrNull(device.findObject(tag("mosaic_grid")))?.width()
            ?: device.displayWidth
        val laneCutoff = gridWidth * 0.7
        // Snapshot each tile's bounds defensively: the staggered re-layout animates, so a node can go
        // stale between collection and the bounds read — skip stale handles rather than abort the count.
        return device.findObjects(By.res(java.util.regex.Pattern.compile("tile_P\\d+")))
            .mapNotNull { boundsOrNull(it) }
            .filter { it.width() < laneCutoff }   // drop full-line panoramas; keep single-lane tiles only
            .map { it.left }
            .distinct()
            .size
    }

    /** Read a node's visible bounds, tolerating a node that went stale mid-relayout (returns null then). */
    private fun boundsOrNull(obj: androidx.test.uiautomator.UiObject2?): android.graphics.Rect? =
        try {
            obj?.visibleBounds
        } catch (e: androidx.test.uiautomator.StaleObjectException) {
            null
        }

    /** The column relayout animates; poll briefly until the geometric count matches [expected] (or give up). */
    private fun retryColumnCount(expected: Int): Int {
        val end = System.currentTimeMillis() + timeout
        var last = visibleColumnCount()
        while (System.currentTimeMillis() < end && last != expected) {
            device.waitForIdle(500)
            last = visibleColumnCount()
        }
        return last
    }
}
