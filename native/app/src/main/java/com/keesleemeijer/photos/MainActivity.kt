package com.keesleemeijer.photos

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTagsAsResourceId
import com.keesleemeijer.photos.ui.LibraryRoot
import com.keesleemeijer.photos.ui.theme.AppTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { Root() }
    }
}

@OptIn(ExperimentalComposeUiApi::class)
@Composable
private fun Root() {
    AppTheme {
        Surface(
            modifier = Modifier.fillMaxSize().semantics { testTagsAsResourceId = true }, // UiAutomator By.res (Task 10)
            color = AppTheme.tokens.colors.canvas,
        ) {
            LibraryRoot()
        }
    }
}
