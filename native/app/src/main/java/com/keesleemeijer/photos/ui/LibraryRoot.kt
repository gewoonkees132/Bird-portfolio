package com.keesleemeijer.photos.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun LibraryRoot(viewModel: LibraryViewModel = viewModel(factory = LibraryViewModelFactory)) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LibraryContent(
        state = state,
        onTileTap = viewModel::onTileTap,
        onPinchSettle = viewModel::onPinchSettle,
        onSelectTier = viewModel::selectTier,
        onModeToggle = viewModel::onModeToggle,
        onDetailPage = viewModel::onDetailPage,
        onClose = viewModel::close,
    )
}
