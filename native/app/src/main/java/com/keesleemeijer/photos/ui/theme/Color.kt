package com.keesleemeijer.photos.ui.theme

import androidx.compose.ui.graphics.Color

// brand (fixed, guideline §3)
val Blue = Color(0xFF1635EE)        // cobalt — the only chromatic UI color
val BlueLift = Color(0xFF4D63FF)    // cobalt lifted for legibility + glow on dark
val Field = Color(0xFFF2EEE5)
val Charcoal = Color(0xFF1A1A1A)
// dark surfaces (guideline §4.1)
val Canvas = Color(0xFF161616)
val Panel = Color.White.copy(alpha = 0.055f)
val Hairline = Color.White.copy(alpha = 0.12f)
// ink on dark
val InkOnDark = Color.White
val InkMuted = Color.White.copy(alpha = 0.60f)
val InkFaint = Color.White.copy(alpha = 0.40f)
val OnBlue = Color.White
