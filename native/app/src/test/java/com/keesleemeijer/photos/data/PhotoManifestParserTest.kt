package com.keesleemeijer.photos.data

import com.keesleemeijer.photos.domain.Aspect
import kotlinx.serialization.SerializationException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class PhotoManifestParserTest {

    @Test fun parses_a_full_record() {
        val json = """
            {"photos":[{"id":"P5","assetPath":"photos/P5-Green_Bee-eater.webp","name":"Green Bee-eater",
            "latin":"Merops orientalis","aspect":"landscape","takenAt":"2024-05-10",
            "vitals":{"range":"S & SE Asia","size":"29-30 cm"},"fact":"Hawks bees in mid-air."}]}
        """.trimIndent()
        val photos = PhotoManifestParser.parse(json)
        assertEquals(1, photos.size)
        val p = photos.first()
        assertEquals("P5", p.id)
        assertEquals(Aspect.Landscape, p.aspect)
        assertEquals("Merops orientalis", p.latin)
        assertEquals("S & SE Asia", p.vitals?.get("range"))
        assertEquals(2024, p.takenAt?.year)
    }

    @Test fun omitted_optionals_decode_to_null() {
        val json = """{"photos":[{"id":"P1","assetPath":"photos/P1.webp","name":"Robin","aspect":"portrait"}]}"""
        val p = PhotoManifestParser.parse(json).first()
        assertNull(p.latin); assertNull(p.takenAt); assertNull(p.vitals); assertNull(p.fact)
        assertEquals(Aspect.Portrait, p.aspect)
    }

    @Test(expected = SerializationException::class)
    fun missing_required_field_throws() {
        // no assetPath -> MissingFieldException (a SerializationException).
        PhotoManifestParser.parse("""{"photos":[{"id":"P1","name":"Robin","aspect":"portrait"}]}""")
    }
}
