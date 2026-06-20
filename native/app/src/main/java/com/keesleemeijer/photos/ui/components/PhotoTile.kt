package com.keesleemeijer.photos.ui.components

import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import coil3.request.ImageRequest
import coil3.request.crossfade
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.domain.Photo

private val TILE_RADIUS = 22.dp

private val DensityTier.decodeEdgePx: Int
    get() = when (this) {
        DensityTier.Overview -> 400   // ~110px cell
        DensityTier.Browse -> 800     // ~172px cell
        DensityTier.Feature -> 1600   // full-width pre-detail
    }

/** ONE canonical shared-element key — PhotoTile and DetailPhotoCard MUST call this identically. */
fun sharedKey(photoId: String): String = "photo-$photoId"

@Composable
fun PhotoTile(
    photo: Photo,
    tier: DensityTier,
    onTap: () -> Unit,
    modifier: Modifier = Modifier,
    sharedScope: SharedTransitionScope? = null, // non-null in Task 8 to enable the tile->fullscreen morph
    avScope: AnimatedVisibilityScope? = null,
) {
    val context = LocalContext.current

    val sharedModifier =
        if (sharedScope != null && avScope != null) {
            with(sharedScope) {
                Modifier.sharedElement(
                    sharedContentState = rememberSharedContentState(key = sharedKey(photo.id)),
                    animatedVisibilityScope = avScope,
                )
            }
        } else Modifier

    Box(
        modifier = modifier
            .then(sharedModifier)
            .clip(RoundedCornerShape(TILE_RADIUS))
            .clickable(onClick = onTap),
    ) {
        AsyncImage(
            model = ImageRequest.Builder(context)
                .data("file:///android_asset/${photo.assetPath}")
                .size(tier.decodeEdgePx)
                .crossfade(true)
                .build(),
            contentDescription = photo.name,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
        )
        // Scrim so white caption text clears 4.5:1 (guideline §10).
        Box(Modifier.fillMaxSize().background(
            Brush.verticalGradient(0.55f to Color.Transparent, 1f to Color.Black.copy(alpha = 0.62f)),
        ))
        Column(
            modifier = Modifier.align(Alignment.BottomStart).fillMaxWidth().padding(horizontal = 10.dp, vertical = 8.dp),
        ) {
            if (tier == DensityTier.Feature && photo.latin != null) {
                Text(photo.latin, color = Color.White.copy(alpha = 0.60f), fontStyle = FontStyle.Italic,
                    fontWeight = FontWeight.Light, fontSize = 15.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            if (tier != DensityTier.Overview) {
                Text(photo.name, color = Color.White, fontWeight = FontWeight.Bold,
                    fontSize = if (tier == DensityTier.Feature) 24.sp else 18.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Text(photo.id, color = Color.White.copy(alpha = 0.80f), fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Medium, fontSize = 11.sp, letterSpacing = 1.7.sp)
        }
    }
}
