package com.keesleemeijer.photos.ui.plane

import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import coil3.request.ImageRequest
import coil3.request.crossfade
import kotlin.math.roundToInt

@Composable
fun PlaneTile(placed: PlacedPhoto, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val density = LocalDensity.current
    val xDp = with(density) { placed.left.toDp() }
    val yDp = with(density) { placed.top.toDp() }
    AsyncImage(
        model = ImageRequest.Builder(context)
            .data("file:///android_asset/${placed.photo.assetPath}")
            .size(placed.width.roundToInt().coerceAtLeast(1), placed.height.roundToInt().coerceAtLeast(1))
            .crossfade(true)
            .build(),
        contentDescription = placed.photo.name,
        contentScale = ContentScale.Crop,
        modifier = modifier
            .offset(x = xDp, y = yDp)
            .size(with(density) { placed.width.toDp() }, with(density) { placed.height.toDp() })
            .clip(RoundedCornerShape(18.dp)),
    )
}
