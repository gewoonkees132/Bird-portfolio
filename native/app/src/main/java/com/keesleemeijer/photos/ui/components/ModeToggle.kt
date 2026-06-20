package com.keesleemeijer.photos.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.domain.ViewMode
import com.keesleemeijer.photos.ui.theme.AppTheme

/** Quiet pill flipping Mosaic<->Plane; reads the label of the mode you'd switch TO. */
@Composable
fun ModeToggle(mode: ViewMode, onToggle: () -> Unit, modifier: Modifier = Modifier) {
    val tokens = AppTheme.tokens
    Text(
        text = if (mode == ViewMode.Mosaic) "PLANE" else "MOSAIC",
        color = tokens.colors.inkMuted,
        style = MaterialTheme.typography.labelMedium,
        modifier = modifier
            .clip(RoundedCornerShape(percent = 50))
            .background(tokens.colors.panel)
            .clickable(onClick = onToggle)
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .testTag("mode_toggle"),
    )
}
