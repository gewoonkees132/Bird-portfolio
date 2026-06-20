package com.keesleemeijer.photos.domain

import java.time.LocalDate

data class Photo(
    val id: String,            // "P5"
    val assetPath: String,     // "photos/P5-Green_Bee-eater.webp"
    val name: String,          // "Green Bee-eater"
    val latin: String?,        // quiet secondary line; null for generic photos
    val aspect: Aspect,        // drives staggered-grid height + panorama spans
    val takenAt: LocalDate?,   // future date-sectioning (EXIF in the product)
    val vitals: Map<String, String>?, // range·size·diet — null-safe
    val fact: String?,         // the Detail lede
)

enum class Aspect(val ratio: Float) { Landscape(1.5f), Portrait(0.667f), Panorama(2.333f) }

enum class ViewMode { Mosaic, Plane }

interface PhotoSource { suspend fun photos(): List<Photo> }
