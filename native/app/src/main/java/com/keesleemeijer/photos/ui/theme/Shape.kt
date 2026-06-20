package com.keesleemeijer.photos.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

val AppShapes: Shapes = Shapes(
    extraSmall = RoundedCornerShape(12.dp),
    small = RoundedCornerShape(22.dp),   // r-tile
    medium = RoundedCornerShape(24.dp),  // r-card
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(percent = 50), // r-pill
)
