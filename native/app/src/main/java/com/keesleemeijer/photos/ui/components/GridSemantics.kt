package com.keesleemeijer.photos.ui.components

import androidx.compose.ui.semantics.SemanticsPropertyKey
import androidx.compose.ui.semantics.SemanticsPropertyReceiver

/**
 * Exposes the grid's live column count as a queryable accessibility semantic. Retained as a legitimate
 * a11y/queryable property — NOT used by the current UiAutomator suite, which measures column count
 * geometrically (distinct left-edges of single-lane tiles) rather than reading this semantic.
 */
val ColumnCountKey = SemanticsPropertyKey<Int>("ColumnCount")
var SemanticsPropertyReceiver.columnCount: Int by ColumnCountKey
