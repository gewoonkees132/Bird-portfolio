package com.keesleemeijer.photos.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.ui.theme.AppTheme

/** Floating segmented control: All·Some·One. Active segment filled cobalt (guideline §9.3). */
@Composable
fun DensityPill(tier: DensityTier, onSelect: (DensityTier) -> Unit, modifier: Modifier = Modifier) {
    val tokens = AppTheme.tokens
    val items = listOf("All" to DensityTier.Overview, "Some" to DensityTier.Browse, "One" to DensityTier.Feature)
    Row(
        modifier = modifier.clip(RoundedCornerShape(percent = 50)).background(tokens.colors.panel).padding(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        items.forEach { (label, t) ->
            val active = t == tier
            Text(
                text = label,
                color = if (active) tokens.colors.onAccent else tokens.colors.inkMuted,
                style = MaterialTheme.typography.labelMedium,
                modifier = Modifier
                    .clip(RoundedCornerShape(percent = 50))
                    .background(if (active) tokens.colors.accentLift else Color.Transparent)
                    .clickable { onSelect(t) }
                    .padding(horizontal = 16.dp, vertical = 8.dp),
            )
        }
    }
}
