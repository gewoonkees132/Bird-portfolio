package com.keesleemeijer.photos.ui.components

import androidx.compose.ui.semantics.SemanticsPropertyKey
import androidx.compose.ui.semantics.SemanticsPropertyReceiver

/** Test-only semantics so UI tests read the grid's live column count without touching layout internals. */
val ColumnCountKey = SemanticsPropertyKey<Int>("ColumnCount")
var SemanticsPropertyReceiver.columnCount: Int by ColumnCountKey
