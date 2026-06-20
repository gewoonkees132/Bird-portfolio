package com.keesleemeijer.photos.data

import android.content.Context
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.domain.PhotoSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** SEAM #1 — the prototype's only PhotoSource. Reads assets/photos.json, delegates to the pure parser. */
class BundledAssetSource(private val context: Context) : PhotoSource {
    override suspend fun photos(): List<Photo> = withContext(Dispatchers.IO) {
        val manifestJson = context.assets.open("photos.json").use { it.readBytes().decodeToString() }
        PhotoManifestParser.parse(manifestJson)
    }
}
