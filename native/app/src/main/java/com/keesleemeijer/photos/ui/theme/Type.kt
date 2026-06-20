package com.keesleemeijer.photos.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp

// Prototype falls back to system fonts; structured so a bundled face (res/font) drops in unchanged.
val Grotesque: FontFamily = FontFamily.SansSerif
val InstrumentMono: FontFamily = FontFamily.Monospace

private val TrackTight = (-0.02).em
private val TrackSnug = (-0.01).em
private val TrackLabel = 0.13.em

val AppTypography: Typography = Typography(
    displayLarge = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.Bold, fontSize = 40.sp, lineHeight = 44.sp, letterSpacing = TrackTight),
    headlineLarge = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.Bold, fontSize = 28.sp, lineHeight = 32.sp, letterSpacing = TrackTight),
    headlineMedium = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.Bold, fontSize = 23.sp, lineHeight = 28.sp, letterSpacing = TrackTight),
    titleLarge = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.Bold, fontSize = 20.sp, lineHeight = 24.sp, letterSpacing = TrackSnug),
    titleMedium = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.SemiBold, fontSize = 18.sp, lineHeight = 22.sp, letterSpacing = TrackSnug),
    labelLarge = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.Bold, fontSize = 12.sp, lineHeight = 14.sp, letterSpacing = TrackSnug),
    bodyLarge = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.Light, fontStyle = FontStyle.Italic, fontSize = 15.sp, lineHeight = 20.sp, letterSpacing = 0.em),
    bodyMedium = TextStyle(fontFamily = Grotesque, fontWeight = FontWeight.Normal, fontSize = 14.sp, lineHeight = 22.sp, letterSpacing = 0.em),
    labelMedium = TextStyle(fontFamily = InstrumentMono, fontWeight = FontWeight.Medium, fontSize = 11.sp, lineHeight = 14.sp, letterSpacing = TrackLabel),
    labelSmall = TextStyle(fontFamily = InstrumentMono, fontWeight = FontWeight.Medium, fontSize = 10.sp, lineHeight = 12.sp, letterSpacing = TrackLabel),
)
