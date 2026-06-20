package com.keesleemeijer.photos.ui.theme

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.Easing
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.FiniteAnimationSpec
import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Immutable
data class AppTokens(
    val colors: AppColors,
    val radii: AppRadii,
    val elevation: AppElevation,
    val motion: AppMotion,
    val spacing: AppSpacing,
)

@Immutable
data class AppColors(
    val canvas: Color = Canvas,
    val panel: Color = Panel,
    val hairline: Color = Hairline,
    val accent: Color = Blue,
    val accentLift: Color = BlueLift,
    val onAccent: Color = OnBlue,
    val ink: Color = InkOnDark,
    val inkMuted: Color = InkMuted,
    val inkFaint: Color = InkFaint,
    val field: Color = Field,
)

@Immutable
data class AppRadii(val tile: Dp = 22.dp, val card: Dp = 24.dp, val pill: Dp = 999.dp)

@Immutable
data class ShadowSpec(
    val offsetX: Dp, val offsetY: Dp, val blur: Dp, val color: Color,
    val ring: Color = Color.Unspecified,
)

@Immutable
data class AppElevation(
    val tile: ShadowSpec = ShadowSpec(0.dp, 6.dp, 18.dp, Color.Black.copy(alpha = 0.42f)),
    val card: ShadowSpec = ShadowSpec(0.dp, 14.dp, 34.dp, Color.Black.copy(alpha = 0.50f), ring = Color.White.copy(alpha = 0.05f)),
    val detail: ShadowSpec = ShadowSpec(0.dp, 22.dp, 54.dp, Color.Black.copy(alpha = 0.60f)),
)

@Immutable
data class AppMotion(
    val softEase: Easing = CubicBezierEasing(0.2f, 0f, 0f, 1f),
    val densitySnapMillis: Int = 280,
    val detailMillis: Int = 300,
    val scrollRevealMillis: Int = 240,
    val microMillis: Int = 150,
) {
    fun <T> densitySnap(): FiniteAnimationSpec<T> = tween(densitySnapMillis, easing = softEase)
    fun <T> detail(): FiniteAnimationSpec<T> = tween(detailMillis, easing = softEase)
    fun <T> scrollReveal(): FiniteAnimationSpec<T> = tween(scrollRevealMillis, easing = LinearOutSlowInEasing)
    fun <T> micro(): FiniteAnimationSpec<T> = tween(microMillis, easing = FastOutSlowInEasing)
}

@Immutable
data class AppSpacing(
    val xs: Dp = 4.dp, val s: Dp = 8.dp, val m: Dp = 12.dp, val l: Dp = 16.dp,
    val xl: Dp = 24.dp, val xxl: Dp = 32.dp, val xxxl: Dp = 48.dp, val huge: Dp = 64.dp,
    val edgeGutter: Dp = 14.dp, val tileGap: Dp = 8.dp, val detailPadding: Dp = 19.dp,
)

val LocalAppTokens = staticCompositionLocalOf {
    AppTokens(AppColors(), AppRadii(), AppElevation(), AppMotion(), AppSpacing())
}
