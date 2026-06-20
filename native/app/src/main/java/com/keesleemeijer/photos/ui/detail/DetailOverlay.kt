package com.keesleemeijer.photos.ui.detail

import androidx.activity.compose.BackHandler
import androidx.activity.compose.PredictiveBackHandler
import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.paneTitle
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.domain.Photo
import kotlin.coroutines.cancellation.CancellationException
import kotlin.math.abs

@Composable
fun SharedTransitionScope.DetailOverlay(
    photos: List<Photo>,
    startIndex: Int,
    animatedVisibilityScope: AnimatedVisibilityScope,
    onPageChanged: (Int) -> Unit,
    close: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val density = LocalDensity.current
    val dismissThresholdPx = with(density) { 116.dp.toPx() } // ~110–120dp commit point
    val closeFocus = remember { FocusRequester() }
    val pagerState = rememberPagerState(initialPage = startIndex) { photos.size }
    val currentPhoto = photos[pagerState.currentPage]

    var dragOffsetY by remember { mutableFloatStateOf(0f) }
    val progress = (abs(dragOffsetY) / dismissThresholdPx).coerceIn(0f, 1f)
    val contentAlpha = 1f - 0.45f * progress
    val backdropAlpha = 1f - 0.65f * progress

    LaunchedEffect(pagerState) { snapshotFlow { pagerState.currentPage }.collect(onPageChanged) }
    LaunchedEffect(Unit) { closeFocus.requestFocus() } // a11y: focus to ✕ on open (guideline §10)

    // Never-stuck: hardware Back + predictive Back.
    BackHandler(enabled = true) { close() }
    PredictiveBackHandler(enabled = true) { backProgress ->
        try {
            backProgress.collect { e -> dragOffsetY = dismissThresholdPx * e.progress }
            close()
        } catch (e: CancellationException) {
            dragOffsetY = 0f; throw e
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .testTag("detail")
            .onPreviewKeyEvent { ev ->
                if (ev.type == KeyEventType.KeyUp && ev.key == Key.Escape) { close(); true } else false
            }
            .semantics { paneTitle = currentPhoto.name; liveRegion = LiveRegionMode.Assertive },
        contentAlignment = Alignment.Center,
    ) {
        DetailBackdrop(alpha = backdropAlpha, onTap = close, modifier = Modifier.fillMaxSize())

        HorizontalPager(
            state = pagerState,
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer { translationY = dragOffsetY; this.alpha = contentAlpha }
                .pointerInput(pagerState.currentPage) {
                    detectVerticalDragGestures(
                        onDragEnd = { if (abs(dragOffsetY) >= dismissThresholdPx) close() else dragOffsetY = 0f },
                        onDragCancel = { dragOffsetY = 0f },
                        onVerticalDrag = { change, delta ->
                            dragOffsetY = (dragOffsetY + delta).coerceAtLeast(0f) // only down-drag dismisses
                            change.consume()
                        },
                    )
                },
        ) { page ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .pointerInput(Unit) {
                        detectTapGestures { close() } // tap on the dimmed area around the card → never-stuck #3
                    },
                contentAlignment = Alignment.Center,
            ) {
                DetailPhotoCard(
                    photo = photos[page],
                    sharedTransitionScope = this@DetailOverlay,
                    animatedVisibilityScope = animatedVisibilityScope,
                    isActivePage = page == pagerState.currentPage,
                )
            }
        }

        CloseButton(
            onClick = close,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(16.dp)
                .focusRequester(closeFocus)
                .graphicsLayer { this.alpha = contentAlpha },
        )
    }
}
