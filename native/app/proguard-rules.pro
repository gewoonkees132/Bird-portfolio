# kotlinx-serialization: keep generated serializers for @Serializable classes.
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class **$$serializer { *; }
-keepclasseswithmembers class com.keesleemeijer.photos.** {
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class com.keesleemeijer.photos.**$$serializer { *; }
# Coil 3 uses ServiceLoader-registered fetchers/decoders.
-keep class coil3.** { *; }
