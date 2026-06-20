package com.keesleemeijer.photos.ui

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
import com.keesleemeijer.photos.ui.detail.DetailHost
import com.keesleemeijer.photos.ui.mosaic.MosaicScreen
import com.keesleemeijer.photos.ui.plane.PlaneScreen

@Composable
fun LibraryContent(
    state: LibraryUiState,
    onTileTap: (Photo) -> Unit,
    onPinchSettle: (Float) -> Unit,
    onSelectTier: (DensityTier) -> Unit,
    onModeToggle: () -> Unit,
    onDetailPage: (Int) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier.fillMaxSize()) {
        DetailHost(
            mode = state.mode,
            photos = state.photos,
            detailIndex = if (state.detailOpen) state.focusedIndex.takeIf { it >= 0 } else null,
            onDetailPageChanged = onDetailPage,
            close = onClose,
            mosaic = { sts, av ->
                MosaicScreen(state.photos, state.tier, onPinchSettle, onTileTap, sharedScope = sts, avScope = av)
            },
            plane = { _, _ -> PlaneScreen(state.photos, onOpenDetail = onTileTap) },
        )
        if (!state.detailOpen) {
            if (state.mode == ViewMode.Mosaic) {
                DensityPill(state.tier, onSelectTier, Modifier.align(Alignment.BottomCenter).padding(bottom = 28.dp))
            }
            ModeToggle(state.mode, onModeToggle, Modifier.align(Alignment.BottomStart).padding(16.dp))
        }
    }
}
