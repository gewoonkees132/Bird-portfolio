package com.keesleemeijer.photos.ui.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.remember

private val DarkColors: ColorScheme = darkColorScheme(
    primary = BlueLift, onPrimary = OnBlue, primaryContainer = BlueLift, onPrimaryContainer = OnBlue,
    secondary = InkMuted, onSecondary = Charcoal, tertiary = BlueLift, onTertiary = OnBlue,
    background = Canvas, onBackground = InkOnDark, surface = Canvas, onSurface = InkOnDark,
    surfaceVariant = Panel, onSurfaceVariant = InkMuted,
    surfaceContainerLowest = Canvas, surfaceContainerLow = Canvas, surfaceContainer = Panel,
    surfaceContainerHigh = Panel, surfaceContainerHighest = Panel,
    outline = Hairline, outlineVariant = Hairline, scrim = Charcoal,
    inverseSurface = Field, inverseOnSurface = Charcoal,
)

private val DarkTokens: AppTokens = AppTokens(AppColors(), AppRadii(), AppElevation(), AppMotion(), AppSpacing())

@Composable
fun AppTheme(darkTheme: Boolean = true, content: @Composable () -> Unit) {
    val tokens = remember(darkTheme) { DarkTokens } // light deferred (spec §10)
    CompositionLocalProvider(LocalAppTokens provides tokens) {
        MaterialTheme(colorScheme = DarkColors, typography = AppTypography, shapes = AppShapes, content = content)
    }
}

object AppTheme {
    val tokens: AppTokens
        @Composable @ReadOnlyComposable get() = LocalAppTokens.current
}
