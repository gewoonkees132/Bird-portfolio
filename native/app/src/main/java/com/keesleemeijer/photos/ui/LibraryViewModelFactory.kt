package com.keesleemeijer.photos.ui

import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.keesleemeijer.photos.PhotosApp

/** Builds LibraryViewModel from the Application's AppContainer. Use: viewModel(factory = LibraryViewModelFactory). */
val LibraryViewModelFactory: ViewModelProvider.Factory = viewModelFactory {
    initializer {
        val app = this[APPLICATION_KEY] as PhotosApp
        LibraryViewModel(source = app.container.photoSource)
    }
}
