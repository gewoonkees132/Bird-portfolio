package com.keesleemeijer.photos.ui

import androidx.compose.runtime.Immutable
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.domain.ViewMode

/** Single source of truth (SEAM #3). MosaicScreen/PlaneScreen read [mode]; DetailOverlay reads [focused]+[detailOpen]. */
@Immutable
data class LibraryUiState(
    val photos: List<Photo> = emptyList(),
    val mode: ViewMode = ViewMode.Mosaic,
    val tier: DensityTier = DensityTier.Overview,
    val focused: Photo? = null,
    val detailOpen: Boolean = false,
    val isLoading: Boolean = true,
) {
    /** Index of [focused] in [photos]; -1 when none. Drives Detail paging. */
    val focusedIndex: Int get() = focused?.let { f -> photos.indexOfFirst { it.id == f.id } } ?: -1
}
