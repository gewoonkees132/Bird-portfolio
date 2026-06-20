package com.keesleemeijer.photos.ui.mosaic

import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.calculateZoom
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.staggeredgrid.LazyVerticalStaggeredGrid
import androidx.compose.foundation.lazy.staggeredgrid.StaggeredGridCells
import androidx.compose.foundation.lazy.staggeredgrid.StaggeredGridItemSpan
import androidx.compose.foundation.lazy.staggeredgrid.items
import androidx.compose.foundation.lazy.staggeredgrid.rememberLazyStaggeredGridState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.domain.Aspect
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.ui.components.PhotoTile
import com.keesleemeijer.photos.ui.components.columnCount

/**
 * The mosaic spine (spec §6.1). Column count IS the tier. A pinch tracks live as one graphicsLayer
 * scale on the container (one composited layer); on gesture END the cumulative scale goes UP to the
 * ViewModel via [onPinchSettle] — the pure nextTier decides the snap there (no business logic here).
 *
 * NOTE: gesture handling uses awaitEachGesture directly (NOT detectTransformGestures) so the
 * settle on gesture-end actually runs — detectTransformGestures never returns, which would make
 * the settle dead code. Zoom-only events are observed without consuming, so vertical scroll still works.
 */
@Composable
fun MosaicScreen(
    photos: List<Photo>,
    tier: DensityTier,
    onPinchSettle: (Float) -> Unit,
    onPhotoTap: (Photo) -> Unit,
    modifier: Modifier = Modifier,
    sharedScope: SharedTransitionScope? = null,
    avScope: AnimatedVisibilityScope? = null,
) {
    val gridState = rememberLazyStaggeredGridState()
    var liveScale by remember { mutableFloatStateOf(1f) }

    val fadeSnap = remember { tween<Float>(280, easing = CubicBezierEasing(0.2f, 0f, 0f, 1f)) }
    val placementSnap = remember { tween<IntOffset>(280, easing = CubicBezierEasing(0.2f, 0f, 0f, 1f)) }

    LazyVerticalStaggeredGrid(
        columns = StaggeredGridCells.Fixed(tier.columns),
        state = gridState,
        modifier = modifier
            .fillMaxSize()
            .testTag("mosaic_grid")
            .semantics { columnCount = tier.columns }
            .graphicsLayer { scaleX = liveScale; scaleY = liveScale }
            .pointerInput(tier) {
                awaitEachGesture {
                    var cumulative = 1f
                    awaitFirstDown(requireUnconsumed = false)
                    do {
                        val event = awaitPointerEvent()
                        val zoom = event.calculateZoom()
                        if (zoom != 1f) {
                            cumulative *= zoom
                            liveScale = cumulative.coerceIn(0.6f, 1.6f) // rubber-band the live feel only
                        }
                    } while (event.changes.any { it.pressed })
                    liveScale = 1f                  // release the live transform; columns carry the change
                    onPinchSettle(cumulative)        // VM runs nextTier
                }
            },
        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 12.dp),
        verticalItemSpacing = 8.dp,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        items(
            items = photos,
            key = { it.id },
            span = { photo ->
                if (photo.aspect == Aspect.Panorama) StaggeredGridItemSpan.FullLine
                else StaggeredGridItemSpan.SingleLane
            },
        ) { photo ->
            PhotoTile(
                photo = photo,
                tier = tier,
                onTap = { onPhotoTap(photo) },
                sharedScope = sharedScope,
                avScope = avScope,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(photo.aspect.ratio)
                    .testTag("tile_${photo.id}")
                    .animateItem(fadeInSpec = fadeSnap, placementSpec = placementSnap, fadeOutSpec = fadeSnap),
            )
        }
    }
}
