package com.keesleemeijer.photos.ui.detail

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.ui.theme.AppTheme

/** Dimmed backdrop — tap outside the card closes (never-stuck #3). */
@Composable
fun DetailBackdrop(alpha: Float, onTap: () -> Unit, modifier: Modifier = Modifier) {
    Box(
        modifier
            .fillMaxSize()
            .testTag("backdrop")
            .background(Color.Black.copy(alpha = 0.72f * alpha))
            .clickable(indication = null, interactionSource = remember { MutableInteractionSource() }, onClick = onTap),
    )
}

/** Persistent ✕, 48dp, never auto-hidden (never-stuck #2). */
@Composable
fun CloseButton(onClick: () -> Unit, modifier: Modifier = Modifier) {
    Box(
        modifier
            .size(48.dp)
            .clip(CircleShape)
            .background(Color.White.copy(alpha = 0.12f))
            .clickable(onClick = onClick)
            .semantics { contentDescription = "Close" },
        contentAlignment = Alignment.Center,
    ) { Text("✕", color = Color.White, fontSize = 20.sp) }
}

/** cobalt glow tick · name (700) · latin (300 italic) · mono code · mono vitals (guideline §9.5). */
@Composable
fun MetaRow(photo: Photo, modifier: Modifier = Modifier) {
    val tokens = AppTheme.tokens
    Column(modifier) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(8.dp).clip(CircleShape).background(tokens.colors.accentLift))
            Spacer(Modifier.width(8.dp))
            Text(photo.name, style = MaterialTheme.typography.headlineMedium, color = tokens.colors.ink)
        }
        photo.latin?.let { Text(it, style = MaterialTheme.typography.bodyLarge, color = tokens.colors.inkMuted) }
        Spacer(Modifier.height(6.dp))
        Row {
            Text(photo.id, style = MaterialTheme.typography.labelMedium, color = tokens.colors.inkFaint)
            photo.vitals?.takeIf { it.isNotEmpty() }?.let {
                Spacer(Modifier.width(10.dp))
                Text(it.values.joinToString("  ·  "), style = MaterialTheme.typography.labelMedium, color = tokens.colors.inkMuted)
            }
        }
    }
}

/** Fun-fact lede behind "Read more" (spec §10.3). */
@Composable
fun FunFactLede(fact: String, expanded: Boolean, onToggle: () -> Unit, modifier: Modifier = Modifier) {
    val tokens = AppTheme.tokens
    Column(modifier.clickable(onClick = onToggle)) {
        Text(fact, style = MaterialTheme.typography.bodyMedium, color = tokens.colors.inkMuted,
            maxLines = if (expanded) Int.MAX_VALUE else 2, overflow = TextOverflow.Ellipsis)
        Text(if (expanded) "Read less" else "Read more", style = MaterialTheme.typography.labelMedium, color = tokens.colors.accentLift)
    }
}
