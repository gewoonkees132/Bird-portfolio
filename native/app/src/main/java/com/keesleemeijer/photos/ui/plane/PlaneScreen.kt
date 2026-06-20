package com.keesleemeijer.photos.ui.plane

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.ui.theme.AppTheme

private const val MAX_ZOOM = 6f

@Composable
fun PlaneScreen(photos: List<Photo>, onOpenDetail: (Photo) -> Unit, modifier: Modifier = Modifier) {
    val density = LocalDensity.current
    var viewport by remember { mutableStateOf(IntSize.Zero) }

    val layout = remember(photos, viewport.width) {
        if (viewport.width == 0) null
        else packPlane(photos, containerWidth = viewport.width.toFloat(), targetRowHeight = viewport.width / 3.2f)
    }
    val fitScale = remember(layout, viewport) {
        val l = layout ?: return@remember 1f
        if (l.contentWidth <= 0f || l.contentHeight <= 0f) 1f
        else minOf(viewport.width / l.contentWidth, viewport.height / l.contentHeight)
    }

    var zoom by remember { mutableFloatStateOf(1f) } // 1f == fit; effective scale = fitScale * zoom
    var panX by remember { mutableFloatStateOf(0f) }
    var panY by remember { mutableFloatStateOf(0f) }

    fun clamp() = layout?.let { l ->
        panX = constrainPan(panX, l.contentWidth * fitScale * zoom, viewport.width.toFloat())
        panY = constrainPan(panY, l.contentHeight * fitScale * zoom, viewport.height.toFloat())
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .testTag("plane")
            .background(AppTheme.tokens.colors.canvas)
            .onSizeChanged { viewport = it }
            .pointerInput(layout, fitScale) {
                detectTransformGestures(panZoomLock = true) { centroid, pan, gestureZoom, _ ->
                    val old = zoom
                    val next = rubberBandZoom(old * gestureZoom, minZoom = 1f, maxZoom = MAX_ZOOM)
                    val f = next / old
                    panX = (panX - centroid.x) * f + centroid.x + pan.x // anchor centroid while scaling
                    panY = (panY - centroid.y) * f + centroid.y + pan.y
                    zoom = next
                    clamp()
                }
            }
            .pointerInput(layout, fitScale) {
                detectTapGestures { tap ->
                    val l = layout ?: return@detectTapGestures
                    val s = fitScale * zoom
                    val px = (tap.x - panX) / s; val py = (tap.y - panY) / s
                    l.placements.firstOrNull { px in it.left..it.right && py in it.top..it.bottom }
                        ?.let { onOpenDetail(it.photo) }
                }
            },
    ) {
        layout?.let { l ->
            Box(
                Modifier
                    .size(with(density) { l.contentWidth.toDp() }, with(density) { l.contentHeight.toDp() })
                    .graphicsLayer { // ONE block, ONE composited layer (spec §6.2 / §7.3)
                        scaleX = fitScale * zoom; scaleY = fitScale * zoom
                        translationX = panX; translationY = panY
                        transformOrigin = TransformOrigin(0f, 0f)
                    },
            ) {
                for (placed in l.placements) PlaneTile(placed = placed)
            }
        }
        ZoomControlPill(
            zoom = zoom, minZoom = 1f, maxZoom = MAX_ZOOM,
            onZoomChange = { target ->
                val old = zoom; val next = target.coerceIn(1f, MAX_ZOOM)
                val cx = viewport.width / 2f; val cy = viewport.height / 2f
                val f = next / old
                panX = (panX - cx) * f + cx; panY = (panY - cy) * f + cy
                zoom = next; clamp()
            },
            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 28.dp),
        )
    }
}

/** guideline §6: rubber-band past extremes; never a hard wall. */
internal fun rubberBandZoom(proposed: Float, minZoom: Float, maxZoom: Float): Float {
    val resistance = 0.30f
    return when {
        proposed < minZoom -> minZoom - (minZoom - proposed) * resistance
        proposed > maxZoom -> maxZoom + (proposed - maxZoom) * resistance
        else -> proposed
    }
}

internal fun constrainPan(pan: Float, contentSize: Float, viewportSize: Float): Float =
    if (contentSize <= viewportSize) (viewportSize - contentSize) / 2f   // centre small content
    else pan.coerceIn(viewportSize - contentSize, 0f)                    // no empty edges revealed

// ─────────────────────────────────────────────────────────────────────────────────────────
// DEFERRED (spec §10.6): dwell-snap-to-center + ambient dimming of unfocused tiles.
// Intentionally NOT implemented. Free pan/zoom + tap-to-Detail is the agreed funding-demo scope.
//   stub: dwellSnapToCenter(focused, plane) — animate pan so the dwelt tile centres.
//   stub: ambientDim(focused, placements)   — alpha-fade tiles by distance from focus.
// ─────────────────────────────────────────────────────────────────────────────────────────
