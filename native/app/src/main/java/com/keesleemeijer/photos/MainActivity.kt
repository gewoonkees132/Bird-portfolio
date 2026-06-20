package com.keesleemeijer.photos

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.keesleemeijer.photos.ui.theme.AppTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { Root() }
    }
}

// Replaced in Task 2 (AppTheme) and Task 6 (LibraryRoot). For now: a dark canvas.
@Composable
private fun Root() {
    AppTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = AppTheme.tokens.colors.canvas) {}
    }
}
