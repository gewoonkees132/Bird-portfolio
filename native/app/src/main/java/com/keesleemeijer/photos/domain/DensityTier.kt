package com.keesleemeijer.photos.domain

/** Three snapped density tiers (spec §5 / guideline §6). Ordinal order is DENSEST first. */
enum class DensityTier(val columns: Int) {
    Overview(3), // see ALL  — code chip only
    Browse(2),   // see SOME — name + code
    Feature(1),  // see ONE  — name + latin + code
}

private const val DENSER_THRESHOLD = 0.8f
private const val SPARSER_THRESHOLD = 1.25f

/**
 * Pure tier math (spec §7.1/§9). Maps a settled cumulative pinch scale to the tier to snap to:
 * <0.8 ⇒ one tier denser (toward Overview); >1.25 ⇒ one tier sparser (toward Feature);
 * in between ⇒ unchanged. Rubber-bands at the extremes (clamp, no hard wall). Side-effect-free.
 */
fun nextTier(current: DensityTier, cumulativeScale: Float): DensityTier {
    val entries = DensityTier.entries
    val index = current.ordinal
    return when {
        cumulativeScale < DENSER_THRESHOLD -> entries[(index - 1).coerceAtLeast(0)]
        cumulativeScale > SPARSER_THRESHOLD -> entries[(index + 1).coerceAtMost(entries.lastIndex)]
        else -> current
    }
}
