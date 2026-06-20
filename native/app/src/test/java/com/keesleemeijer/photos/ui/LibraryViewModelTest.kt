package com.keesleemeijer.photos.ui

import com.keesleemeijer.photos.domain.Aspect
import com.keesleemeijer.photos.domain.DensityTier
import com.keesleemeijer.photos.domain.Photo
import com.keesleemeijer.photos.domain.PhotoSource
import com.keesleemeijer.photos.domain.ViewMode
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

private class FakePhotoSource(private val data: List<Photo>) : PhotoSource {
    override suspend fun photos(): List<Photo> = data
}

private fun photo(id: String) = Photo(id, "photos/$id.webp", "Photo $id", null, Aspect.Landscape, null, null, null)

@OptIn(ExperimentalCoroutinesApi::class)
class LibraryViewModelTest {
    private val dispatcher = StandardTestDispatcher()
    private val sample = listOf(photo("P1"), photo("P2"), photo("P3"))

    @Before fun setUp() = Dispatchers.setMain(dispatcher)
    @After fun tearDown() = Dispatchers.resetMain()
    private fun newVm() = LibraryViewModel(FakePhotoSource(sample))

    @Test fun photos_load_into_state() = runTest {
        val vm = newVm()
        assertTrue(vm.uiState.value.isLoading)
        advanceUntilIdle()
        assertEquals(sample, vm.uiState.value.photos)
        assertFalse(vm.uiState.value.isLoading)
    }

    @Test fun onTileTap_focuses_and_opens_detail() = runTest {
        val vm = newVm(); advanceUntilIdle()
        vm.onTileTap(sample[1])
        assertSame(sample[1], vm.uiState.value.focused)
        assertTrue(vm.uiState.value.detailOpen)
    }

    @Test fun onModeToggle_flips_mode_but_keeps_focused() = runTest {
        val vm = newVm(); advanceUntilIdle()
        vm.onTileTap(sample[0])
        assertEquals(ViewMode.Mosaic, vm.uiState.value.mode)
        vm.onModeToggle()
        assertEquals(ViewMode.Plane, vm.uiState.value.mode)
        assertSame(sample[0], vm.uiState.value.focused) // focus survives the switch (spec §6.4)
    }

    @Test fun close_clears_detailOpen_but_keeps_focus() = runTest {
        val vm = newVm(); advanceUntilIdle()
        vm.onTileTap(sample[0]); assertTrue(vm.uiState.value.detailOpen)
        vm.close(); assertFalse(vm.uiState.value.detailOpen)
        assertSame(sample[0], vm.uiState.value.focused)
    }

    @Test fun onPinchSettle_steps_tier_via_nextTier() = runTest {
        val vm = newVm(); advanceUntilIdle()
        assertEquals(DensityTier.Overview, vm.uiState.value.tier)
        vm.onPinchSettle(2.0f); assertEquals(DensityTier.Browse, vm.uiState.value.tier)
        vm.onPinchSettle(2.0f); assertEquals(DensityTier.Feature, vm.uiState.value.tier)
        vm.onPinchSettle(2.0f); assertEquals(DensityTier.Feature, vm.uiState.value.tier) // rubber-band
        vm.onPinchSettle(0.5f); assertEquals(DensityTier.Browse, vm.uiState.value.tier)
    }

    @Test fun selectTier_sets_tier_directly() = runTest {
        val vm = newVm(); advanceUntilIdle()
        vm.selectTier(DensityTier.Feature)
        assertEquals(DensityTier.Feature, vm.uiState.value.tier)
    }

    @Test fun onDetailPage_moves_focus_to_index() = runTest {
        val vm = newVm(); advanceUntilIdle()
        vm.onTileTap(sample[0])
        vm.onDetailPage(2)
        assertSame(sample[2], vm.uiState.value.focused)
    }
}
