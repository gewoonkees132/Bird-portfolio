package com.keesleemeijer.photos.data

import android.content.Context
import coil3.ImageLoader
import coil3.disk.DiskCache
import coil3.disk.directory
import coil3.memory.MemoryCache
import coil3.request.crossfade
import com.keesleemeijer.photos.domain.PhotoSource

/** Light manual DI (Hilt deferred, spec §4). Built once in PhotosApp. */
class AppContainer(context: Context) {
    private val appContext = context.applicationContext

    /** Swap to MediaStoreSource / ImmichSource later with zero UI change. */
    val photoSource: PhotoSource = BundledAssetSource(appContext)

    val imageLoader: ImageLoader = ImageLoader.Builder(appContext)
        .crossfade(true)
        .memoryCache { MemoryCache.Builder().maxSizePercent(appContext, 0.25).build() }
        .diskCache {
            DiskCache.Builder()
                .directory(appContext.cacheDir.resolve("image_cache"))
                .maxSizePercent(0.02)
                .build()
        }
        .build()
}
