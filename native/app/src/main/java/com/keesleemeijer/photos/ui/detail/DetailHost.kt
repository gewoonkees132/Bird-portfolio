package com.keesleemeijer.photos.ui.detail

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.SharedTransitionLayout
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.domain.ViewMode

/**
 * Top-level composition root that makes the Detail morph work from either mode (spec §6.4):
 *   SharedTransitionLayout
 *     ├─ AnimatedContent(mode)         — Mosaic ↔ Plane crossfade (both expose the shared keys)
 *     └─ AnimatedContent(detailIndex)  — DetailOverlay above; supplies the AnimatedVisibilityScope.
 */
@Composable
fun DetailHost(
    mode: ViewMode,
    photos: List<Photo>,
    detailIndex: Int?, // null == closed
    onDetailPageChanged: (Int) -> Unit,
    close: () -> Unit,
    mosaic: @Composable (SharedTransitionScope, AnimatedVisibilityScope) -> Unit,
    plane: @Composable (SharedTransitionScope, AnimatedVisibilityScope) -> Unit,
    modifier: Modifier = Modifier,
) {
    SharedTransitionLayout(modifier = modifier.fillMaxSize()) {
        val sts = this
        Box(Modifier.fillMaxSize()) {
            AnimatedContent(
                targetState = mode,
                transitionSpec = { fadeIn(tween(280)) togetherWith fadeOut(tween(280)) },
                label = "mode",
            ) { targetMode ->
                when (targetMode) {
                    ViewMode.Mosaic -> mosaic(sts, this@AnimatedContent)
                    ViewMode.Plane -> plane(sts, this@AnimatedContent)
                }
            }
            // NOTE: keyed on detailIndex (not just open/closed), so this re-keys on every page turn.
            // That is safe ONLY because rememberPagerState reads initialPage once (first composition)
            // and ignores it afterward — the overlay keeps its place. Do NOT change this key to one
            // that re-mounts the overlay (it would reset the pager + re-steal focus on each page).
            AnimatedContent(
                targetState = detailIndex,
                transitionSpec = { fadeIn(tween(300)) togetherWith fadeOut(tween(300)) },
                label = "detail",
            ) { index ->
                if (index != null && index in photos.indices) {
                    with(sts) {
                        DetailOverlay(
                            photos = photos,
                            startIndex = index,
                            animatedVisibilityScope = this@AnimatedContent,
                            onPageChanged = onDetailPageChanged,
                            close = close,
                        )
                    }
                }
            }
        }
    }
}
