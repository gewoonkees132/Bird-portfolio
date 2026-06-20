package com.keesleemeijer.photos.ui.plane

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.ui.theme.AppTheme
import java.util.Locale

internal fun zoomLabel(zoom: Float, minZoom: Float): String =
    if (zoom <= minZoom + 0.02f) "fit" else String.format(Locale.US, "%.1f×", zoom)

/** Frosted glass pill: − [label] [slider] + . Glyphs are mono Text (Material Icons removed in M3 1.4). */
@Composable
fun ZoomControlPill(
    zoom: Float, minZoom: Float, maxZoom: Float, onZoomChange: (Float) -> Unit, modifier: Modifier = Modifier,
) {
    val tokens = AppTheme.tokens
    Row(
        modifier = modifier.clip(RoundedCornerShape(percent = 50)).background(tokens.colors.panel).padding(horizontal = 14.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Text("−", color = tokens.colors.ink, modifier = Modifier.clickable { onZoomChange((zoom - 0.5f).coerceAtLeast(minZoom)) })
        Text(zoomLabel(zoom, minZoom), color = tokens.colors.inkMuted, style = MaterialTheme.typography.labelMedium)
        Slider(
            value = zoom.coerceIn(minZoom, maxZoom),
            onValueChange = onZoomChange,
            valueRange = minZoom..maxZoom,
            colors = SliderDefaults.colors(thumbColor = tokens.colors.accentLift, activeTrackColor = tokens.colors.accentLift, inactiveTrackColor = tokens.colors.hairline),
            modifier = Modifier.width(140.dp),
        )
        Text("+", color = tokens.colors.ink, modifier = Modifier.clickable { onZoomChange((zoom + 0.5f).coerceAtMost(maxZoom)) })
    }
}
