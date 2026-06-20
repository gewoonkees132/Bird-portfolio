package com.keesleemeijer.photos.ui.detail

import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.BoundsTransform
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import coil3.request.ImageRequest
import coil3.request.crossfade
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.ui.components.sharedKey

private val SoftEasing = CubicBezierEasing(0.2f, 0f, 0f, 1f)
private val DetailBoundsTransform = BoundsTransform { _, _ -> tween(durationMillis = 300, easing = SoftEasing) }

/** Shares a content-state key with the tapped PhotoTile so Compose morphs position+size (soft 300ms). */
@Composable
fun DetailPhotoCard(
    photo: Photo,
    sharedTransitionScope: SharedTransitionScope,
    animatedVisibilityScope: AnimatedVisibilityScope,
    isActivePage: Boolean,
    modifier: Modifier = Modifier,
) = with(sharedTransitionScope) {
    var factExpanded by remember { mutableStateOf(false) }
    Column(
        modifier
            .fillMaxWidth()
            .padding(horizontal = 18.dp)
            .pointerInput(Unit) { detectTapGestures { /* consume taps on the card; do NOT close */ } },
        verticalArrangement = Arrangement.Center,
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(photo.aspect.ratio)
                .shadow(elevation = 22.dp, shape = RoundedCornerShape(0.dp), ambientColor = Color.Black, spotColor = Color.Black)
                .then(
                    if (isActivePage) Modifier.sharedElement(
                        sharedContentState = rememberSharedContentState(key = sharedKey(photo.id)),
                        animatedVisibilityScope = animatedVisibilityScope,
                        boundsTransform = DetailBoundsTransform,
                    ) else Modifier
                )
                .clip(RoundedCornerShape(0.dp)),
        ) {
            AsyncImage(
                model = ImageRequest.Builder(LocalContext.current)
                    .data("file:///android_asset/${photo.assetPath}")
                    .crossfade(true)
                    .build(),
                contentDescription = photo.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxWidth(),
            )
        }
        Spacer(Modifier.height(16.dp))
        MetaRow(photo)
        photo.fact?.let { fact ->
            Spacer(Modifier.height(12.dp))
            FunFactLede(fact = fact, expanded = factExpanded, onToggle = { factExpanded = !factExpanded })
        }
    }
}
