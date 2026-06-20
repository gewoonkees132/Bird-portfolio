package com.keesleemeijer.photos.ui

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.domain.ViewMode
import com.keesleemeijer.photos.ui.components.DensityPill
import com.keesleemeijer.photos.ui.components.ModeToggle
import com.keesleemeijer.photos.ui.mosaic.MosaicScreen
import com.keesleemeijer.photos.ui.plane.PlaneScreen

/** Task 7 version: Mosaic↔Plane crossfade + toggle. Wrapped by DetailHost in Task 8. */
@Composable
fun LibraryContent(
    state: LibraryUiState,
    onTileTap: (Photo) -> Unit,
    onPinchSettle: (Float) -> Unit,
    onSelectTier: (DensityTier) -> Unit,
    onModeToggle: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier.fillMaxSize()) {
        AnimatedContent(
            targetState = state.mode,
            transitionSpec = { fadeIn(tween(280)) togetherWith fadeOut(tween(280)) },
            label = "mode",
        ) { mode ->
            when (mode) {
                ViewMode.Mosaic -> MosaicScreen(state.photos, state.tier, onPinchSettle, onTileTap)
                ViewMode.Plane -> PlaneScreen(state.photos, onOpenDetail = onTileTap)
            }
        }
        if (state.mode == ViewMode.Mosaic) {
            DensityPill(state.tier, onSelectTier, Modifier.align(Alignment.BottomCenter).padding(bottom = 28.dp))
        }
        ModeToggle(state.mode, onModeToggle, Modifier.align(Alignment.BottomStart).padding(16.dp))
    }
}
