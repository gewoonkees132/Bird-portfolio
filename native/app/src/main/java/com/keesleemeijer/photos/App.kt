package com.keesleemeijer.photos

import android.app.Application
import coil3.ImageLoader
import coil3.PlatformContext
import coil3.SingletonImageLoader
import com.keesleemeijer.photos.data.AppContainer

/** Owns AppContainer for the process and feeds Coil's singleton from it. Registered in the manifest. */
class PhotosApp : Application(), SingletonImageLoader.Factory {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }

    override fun newImageLoader(context: PlatformContext): ImageLoader = container.imageLoader
}
