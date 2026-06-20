package com.keesleemeijer.photos.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.domain.PhotoSource
import com.keesleemeijer.photos.domain.ViewMode
import com.keesleemeijer.photos.domain.nextTier
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Owns LibraryUiState. The only place business logic lives; renderers are pure functions of [uiState]. */
class LibraryViewModel(private val source: PhotoSource) : ViewModel() {

    private val _uiState = MutableStateFlow(LibraryUiState())
    val uiState: StateFlow<LibraryUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            val loaded = source.photos()
            _uiState.update { it.copy(photos = loaded, isLoading = false) }
        }
    }

    /** Pinch released: delegate to the pure [nextTier]; no-op when unchanged. */
    fun onPinchSettle(cumulativeScale: Float) = _uiState.update { s ->
        val next = nextTier(s.tier, cumulativeScale)
        if (next == s.tier) s else s.copy(tier = next)
    }

    /** Density-pill tap — the second route to the same tier state (guideline §9.3). */
    fun selectTier(tier: DensityTier) = _uiState.update { it.copy(tier = tier) }

    fun onTileTap(photo: Photo) = _uiState.update { it.copy(focused = photo, detailOpen = true) }

    /** Flip Mosaic<->Plane. Focus is DELIBERATELY preserved (spec §6.4). */
    fun onModeToggle() = _uiState.update {
        it.copy(mode = if (it.mode == ViewMode.Mosaic) ViewMode.Plane else ViewMode.Mosaic)
    }

    /** The ONE close routine every never-stuck exit funnels into. Keeps focus for the morph-out. */
    fun close() = _uiState.update { it.copy(detailOpen = false) }

    /** Detail pager reports an absolute index -> move focus there. */
    fun onDetailPage(index: Int) = _uiState.update { s ->
        if (index in s.photos.indices) s.copy(focused = s.photos[index]) else s
    }
}
