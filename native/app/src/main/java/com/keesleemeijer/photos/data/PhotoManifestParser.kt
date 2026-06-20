package com.keesleemeijer.photos.data

import com.keesleemeijer.photos.domain.Aspect
import com.keesleemeijer.photos.domain.Photo
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.time.LocalDate

@Serializable private data class PhotoManifestDto(val photos: List<PhotoDto>)

@Serializable private data class PhotoDto(
    val id: String,
    val assetPath: String,
    val name: String,
    val latin: String? = null,
    val aspect: AspectDto,
    val takenAt: String? = null,
    val vitals: Map<String, String>? = null,
    val fact: String? = null,
)

@Serializable private enum class AspectDto {
    @SerialName("landscape") Landscape,
    @SerialName("portrait") Portrait,
    @SerialName("panorama") Panorama,
}

/** Manifest JSON -> domain. PURE: same string in, same list out — unit-tested first (spec §9). */
object PhotoManifestParser {
    private val json = Json {
        ignoreUnknownKeys = true   // manifest format can grow
        explicitNulls = false      // omitted optional == null
    }

    fun parse(manifestJson: String): List<Photo> =
        json.decodeFromString(PhotoManifestDto.serializer(), manifestJson).photos.map(::toDomain)

    private fun toDomain(d: PhotoDto): Photo = Photo(
        id = d.id,
        assetPath = d.assetPath,
        name = d.name,
        latin = d.latin,
        aspect = when (d.aspect) {
            AspectDto.Landscape -> Aspect.Landscape
            AspectDto.Portrait -> Aspect.Portrait
            AspectDto.Panorama -> Aspect.Panorama
        },
        takenAt = d.takenAt?.let(LocalDate::parse),
        vitals = d.vitals,
        fact = d.fact,
    )
}
