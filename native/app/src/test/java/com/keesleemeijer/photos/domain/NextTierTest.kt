package com.keesleemeijer.photos.domain

import org.junit.Assert.assertEquals
import org.junit.Test

/** Exhaustive table for the pure tier function (spec §9). Thresholds: 0.8 (denser) / 1.25 (sparser). */
class NextTierTest {
    @Test fun pinchIn_fromFeature_goesToBrowse() = assertEquals(DensityTier.Browse, nextTier(DensityTier.Feature, 0.7f))
    @Test fun pinchIn_fromBrowse_goesToOverview() = assertEquals(DensityTier.Overview, nextTier(DensityTier.Browse, 0.5f))
    @Test fun pinchIn_fromOverview_clampsAtOverview() = assertEquals(DensityTier.Overview, nextTier(DensityTier.Overview, 0.3f))
    @Test fun pinchOut_fromOverview_goesToBrowse() = assertEquals(DensityTier.Browse, nextTier(DensityTier.Overview, 1.3f))
    @Test fun pinchOut_fromBrowse_goesToFeature() = assertEquals(DensityTier.Feature, nextTier(DensityTier.Browse, 2.0f))
    @Test fun pinchOut_fromFeature_clampsAtFeature() = assertEquals(DensityTier.Feature, nextTier(DensityTier.Feature, 3.0f))
    @Test fun deadZone_overview() = assertEquals(DensityTier.Overview, nextTier(DensityTier.Overview, 1.0f))
    @Test fun deadZone_browse() = assertEquals(DensityTier.Browse, nextTier(DensityTier.Browse, 1.1f))
    @Test fun deadZone_feature() = assertEquals(DensityTier.Feature, nextTier(DensityTier.Feature, 0.9f))
    @Test fun lowerThresholdExact_isDeadZone() = assertEquals(DensityTier.Browse, nextTier(DensityTier.Browse, 0.8f))
    @Test fun upperThresholdExact_isDeadZone() = assertEquals(DensityTier.Browse, nextTier(DensityTier.Browse, 1.25f))
}
