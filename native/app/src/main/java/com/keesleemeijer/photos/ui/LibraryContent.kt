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
import com.keesleemeijer.photos.ui.components.DensityPill
import com.keesleemeijer.photos.ui.mosaic.MosaicScreen

@Composable
fun LibraryContent(
    state: LibraryUiState,
    onTileTap: (Photo) -> Unit,
    onPinchSettle: (Float) -> Unit,
    onSelectTier: (DensityTier) -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier.fillMaxSize()) {
        MosaicScreen(
            photos = state.photos,
            tier = state.tier,
            onPinchSettle = onPinchSettle,
            onPhotoTap = onTileTap,
        )
        DensityPill(
            tier = state.tier,
            onSelect = onSelectTier,
            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 28.dp),
        )
    }
}
