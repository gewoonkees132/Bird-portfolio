package com.keesleemeijer.photos.ui.plane

import com.keesleemeijer.photos.domain.Aspect
import com.keesleemeijer.photos.domain.Photo
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

private fun library(n: Int = 80): List<Photo> = (1..n).map { i ->
    val aspect = when (i % 5) { 0 -> Aspect.Panorama; 1, 2 -> Aspect.Portrait; else -> Aspect.Landscape }
    Photo("P$i", "photos/P$i.webp", "Photo $i", null, aspect, null, null, null)
}

class PackPlaneTest {
    @Test fun `no two placements overlap`() {
        val ps = packPlane(library(), containerWidth = 1080f).placements
        val eps = 0.5f
        for (i in ps.indices) for (j in i + 1 until ps.size) {
            val a = ps[i]; val b = ps[j]
            val separated = a.right <= b.left + eps || b.right <= a.left + eps ||
                a.bottom <= b.top + eps || b.bottom <= a.top + eps
            assertTrue("${a.photo.id} and ${b.photo.id} overlap", separated)
        }
    }

    @Test fun `every placement stays within bounds`() {
        val layout = packPlane(library(), containerWidth = 1080f)
        assertEquals(80, layout.placements.size)
        for (p in layout.placements) {
            assertTrue(p.left >= -0.5f); assertTrue(p.top >= -0.5f)
            assertTrue(p.right <= layout.contentWidth + 0.5f)
            assertTrue(p.bottom <= layout.contentHeight + 0.5f)
            assertTrue(p.width > 0f && p.height > 0f)
        }
    }

    @Test fun `justified rows fill the container width`() {
        val w = 1000f
        val rows = packPlane(library(120), containerWidth = w, gap = 8f)
            .placements.groupBy { it.top }.values.sortedBy { it.first().top }
        assertTrue(rows.size >= 3)
        for (row in rows.dropLast(1)) assertEquals(w, row.maxOf { it.right }, 2f)
    }
}
