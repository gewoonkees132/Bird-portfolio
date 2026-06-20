package com.keesleemeijer.photos.ui.plane

import com.keesleemeijer.photos.domain.Photo

const val DEFAULT_TARGET_ROW_HEIGHT = 320f
const val DEFAULT_GAP = 8f

data class PlacedPhoto(val photo: Photo, val left: Float, val top: Float, val width: Float, val height: Float) {
    val right: Float get() = left + width
    val bottom: Float get() = top + height
}

data class PlaneLayout(val placements: List<PlacedPhoto>, val contentWidth: Float, val contentHeight: Float)

/** Justified-rows packing (guideline §5). PURE: no Android, no time. */
fun packPlane(
    photos: List<Photo>,
    containerWidth: Float,
    targetRowHeight: Float = DEFAULT_TARGET_ROW_HEIGHT,
    gap: Float = DEFAULT_GAP,
): PlaneLayout {
    require(containerWidth > 0f); require(targetRowHeight > 0f); require(gap >= 0f)
    if (photos.isEmpty()) return PlaneLayout(emptyList(), 0f, 0f)
    val placements = ArrayList<PlacedPhoto>(photos.size)
    var maxRowRight = 0f; var y = 0f; var rowStart = 0; var rowNaturalWidth = 0f
    fun aspectWidthAt(h: Float, p: Photo) = p.aspect.ratio * h
    fun commitRow(endExclusive: Int, justify: Boolean) {
        val count = endExclusive - rowStart; if (count <= 0) return
        val totalGap = gap * (count - 1)
        val rowHeight = if (justify && rowNaturalWidth > 0f) {
            val available = (containerWidth - totalGap).coerceAtLeast(1f)
            targetRowHeight * (available / rowNaturalWidth)
        } else targetRowHeight
        var x = 0f
        for (i in rowStart until endExclusive) {
            val w = aspectWidthAt(rowHeight, photos[i])
            placements += PlacedPhoto(photos[i], x, y, w, rowHeight); x += w + gap
        }
        val rowRight = (x - gap).coerceAtLeast(0f); if (rowRight > maxRowRight) maxRowRight = rowRight
        y += rowHeight + gap; rowStart = endExclusive; rowNaturalWidth = 0f
    }
    for (i in photos.indices) {
        rowNaturalWidth += aspectWidthAt(targetRowHeight, photos[i])
        val totalGap = gap * (i - rowStart)
        if (rowNaturalWidth + totalGap >= containerWidth) commitRow(i + 1, justify = true)
    }
    commitRow(photos.size, justify = false) // trailing partial row at target height (never stretched)
    return PlaneLayout(placements, maxRowRight, (y - gap).coerceAtLeast(0f))
}
