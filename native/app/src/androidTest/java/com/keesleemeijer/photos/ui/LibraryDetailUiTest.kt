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
 * RESULT: 5/6 pass. tapBackdrop_dismissesDetail FAILS and exposes a real never-stuck gap — the full-screen
 * HorizontalPager occludes DetailBackdrop, so tapping the dimmed area never reaches its clickable { close() }.
 * See that test for the evidence. The remaining four exits (tap-to-open, ✕, swipe-down, Back) all work.
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
        // — so the tap cannot land on the card (the center-tap targeting trap the spec warns about). The
        // never-stuck contract (#3) is that tapping the dimmed backdrop dismisses Detail.
        //
        // NOTE / FINDING: this exit DOES NOT currently fire. The full-screen HorizontalPager (with its
        // detectVerticalDragGestures + horizontal scroll) is layered ON TOP of DetailBackdrop and wins the
        // pointer/gesture arena for every tap, so the backdrop's clickable { close() } never receives it.
        // Verified empirically: taps at the very top edge, just below it, mid-upper backdrop, and the very
        // bottom (all clear of the card at y≈665–1322) ALL leave Detail open. ✕, swipe-down, and Back work.
        // Per spec this test must keep asserting that the BACKDROP closes Detail; it correctly fails,
        // exposing the gap. (The other never-stuck exits are proven by the sibling tests.)
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

    /** Distinct left-edge x of every visible tile_* node = number of columns in the staggered grid. */
    private fun visibleColumnCount(): Int =
        device.findObjects(By.res(java.util.regex.Pattern.compile("tile_P\\d+")))
            .map { it.visibleBounds.left }
            .distinct()
            .size

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
