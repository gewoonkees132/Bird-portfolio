package com.keesleemeijer.photos.ui

import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.SemanticsNodeInteraction
import androidx.compose.ui.test.assert
import com.keesleemeijer.photos.ui.components.ColumnCountKey // defined in main (ui/components/GridSemantics.kt)

fun SemanticsNodeInteraction.assertColumnCountEquals(expected: Int): SemanticsNodeInteraction =
    assert(SemanticsMatcher.expectValue(ColumnCountKey, expected))
