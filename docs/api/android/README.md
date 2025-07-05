# EyewearML Android SDK

The EyewearML Android SDK provides a simple way to integrate eyewear recommendation and virtual try-on technologies into your Android applications. This SDK handles all the complexities of image processing, API communication, and data management.

## Features

- **Product Catalog**: Browse and search eyewear products
- **Frame Recommendations**: Get personalized frame recommendations based on face analysis
- **Style Recommendations**: Receive style suggestions based on preferences
- **Face Analysis**: Analyze facial features to determine face shape and measurements
- **Virtual Try-On**: Visualize how frames look on a user's face

## Requirements

- Android API level 21+ (Android 5.0 Lollipop or higher)
- Kotlin 1.5.0+
- OkHttp 4.9.0+
- Gson 2.8.6+
- Kotlin Coroutines 1.5.0+

## Installation

### Gradle

Add the SDK to your project by including it in your `build.gradle` file:

```gradle
dependencies {
    implementation 'com.eyewearml:eyewearml-sdk:1.0.0'
}
```

For Kotlin DSL (`build.gradle.kts`):

```kotlin
dependencies {
    implementation("com.eyewearml:eyewearml-sdk:1.0.0")
}
```

### Maven

If you're using Maven:

```xml
<dependency>
  <groupId>com.eyewearml</groupId>
  <artifactId>eyewearml-sdk</artifactId>
  <version>1.0.0</version>
  <type>aar</type>
</dependency>
```

### Manual Installation

1. Download the latest release from our [GitHub repository](https://github.com/eyewear-ml/eyewearml-android-sdk/releases)
2. Copy the `eyewearml-sdk.aar` file to your project's `libs` directory
3. Add the following to your module's `build.gradle` file:

```gradle
dependencies {
    implementation files('libs/eyewearml-sdk.aar')
    
    // Required dependencies
    implementation 'com.squareup.okhttp3:okhttp:4.9.0'
    implementation 'com.google.code.gson:gson:2.8.6'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.5.0'
}
```

## Getting Started

### Configuration

Initialize the SDK in your application class:

```kotlin
import com.eyewearml.sdk.EyewearMLSDK

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Configure the SDK
        val configuration = EyewearMLSDK.Configuration(
            apiBaseUrl = "https://api.eyewear-ml.com/v1",
            apiKey = "${APIKEY_2533}",
            debug = true // Set to false in production
        )
        
        EyewearMLSDK.instance.configure(configuration)
    }
}
```

Don't forget to register your application class in the `AndroidManifest.xml`:

```xml
<application
    android:name=".MyApplication"
    ...>
    ...
</application>
```

### Browse Products

Retrieve a list of products from the catalog:

```kotlin
import com.eyewearml.sdk.EyewearMLSDK
import kotlinx.coroutines.launch
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ProductsActivity : AppCompatActivity() {
    
    private val coroutineScope = CoroutineScope(Dispatchers.Main)
    
    private fun loadProducts() {
        coroutineScope.launch {
            try {
                // Make API call on IO dispatcher
                val productsResponse = withContext(Dispatchers.IO) {
                    EyewearMLSDK.instance.catalog.getProducts(page = 1, limit = 20)
                }
                
                // Handle products on Main dispatcher
                val products = productsResponse.items
                Log.d("Products", "Loaded ${products.size} products")
                
                // Update UI
                productsAdapter.submitList(products)
                
            } catch (e: Exception) {
                when (e) {
                    is EyewearMLException -> handleSdkError(e)
                    else -> Log.e("Products", "Error: ${e.message}", e)
                }
            }
        }
    }
    
    private fun handleSdkError(error: EyewearMLException) {
        val message = when (error.code) {
            EyewearMLErrorCode.NETWORK_ERROR -> "Network error: ${error.message}"
            EyewearMLErrorCode.API_ERROR -> "API error (${error.statusCode}): ${error.message}"
            EyewearMLErrorCode.AUTHENTICATION_ERROR -> "Authentication failed. Check your API key."
            else -> "Error: ${error.message}"
        }
        
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
}
```

### Get Product Details

Retrieve details for a specific product:

```kotlin
private fun loadProductDetails(productId: String) {
    coroutineScope.launch {
        try {
            // Make API call on IO dispatcher
            val product = withContext(Dispatchers.IO) {
                EyewearMLSDK.instance.catalog.getProduct(productId)
            }
            
            // Update UI on Main dispatcher
            productNameTextView.text = product.name
            productDescriptionTextView.text = product.description
            productPriceTextView.text = "$${product.price}"
            
            // Load the first image if available
            product.images.firstOrNull()?.let { imageUrl ->
                Glide.with(this@ProductDetailActivity)
                    .load(imageUrl)
                    .into(productImageView)
            }
            
        } catch (e: Exception) {
            when (e) {
                is EyewearMLException -> handleSdkError(e)
                else -> Log.e("ProductDetail", "Error: ${e.message}", e)
            }
        }
    }
}
```

### Face Analysis

Analyze a face image to determine face shape and measurements:

```kotlin
private fun analyzeFace(imageBytes: ByteArray) {
    coroutineScope.launch {
        try {
            // Show loading indicator
            progressBar.visibility = View.VISIBLE
            
            // Make API call on IO dispatcher
            val analysis = withContext(Dispatchers.IO) {
                EyewearMLSDK.instance.faceAnalysis.analyzeFace(imageBytes)
            }
            
            // Update UI on Main dispatcher
            faceShapeTextView.text = "Face shape: ${analysis.faceShape}"
            symmetryScoreTextView.text = "Symmetry: ${(analysis.symmetryScore * 100).toInt()}%"
            
            // Store analysis for later use
            viewModel.setFaceAnalysis(analysis)
            
        } catch (e: Exception) {
            when (e) {
                is EyewearMLException -> handleSdkError(e)
                else -> Log.e("FaceAnalysis", "Error: ${e.message}", e)
            }
        } finally {
            // Hide loading indicator
            progressBar.visibility = View.GONE
        }
    }
}
```

### Frame Recommendations

Get frame recommendations based on a face image:

```kotlin
private fun getFrameRecommendations(imageBytes: ByteArray) {
    coroutineScope.launch {
        try {
            // Show loading indicator
            progressBar.visibility = View.VISIBLE
            
            // Make API call on IO dispatcher
            val recommendationsResponse = withContext(Dispatchers.IO) {
                EyewearMLSDK.instance.frames.getRecommendedFrames(imageBytes, limit = 5)
            }
            
            // Update UI on Main dispatcher
            val recommendations = recommendationsResponse.recommendations
            Log.d("Recommendations", "Received ${recommendations.size} frame recommendations")
            
            // Update RecyclerView with recommendations
            recommendationsAdapter.submitList(recommendations)
            
        } catch (e: Exception) {
            when (e) {
                is EyewearMLException -> handleSdkError(e)
                else -> Log.e("Recommendations", "Error: ${e.message}", e)
            }
        } finally {
            // Hide loading indicator
            progressBar.visibility = View.GONE
        }
    }
}
```

### Style Recommendations

Get style recommendations based on preferences:

```kotlin
private fun getStyleRecommendations() {
    // Create style filters
    val filters = StyleFilters(
        faceShape = "oval",
        preferredColors = listOf("Black", "Gold"),
        preferredMaterials = listOf("Metal", "Acetate"),
        preferredStyles = listOf("Vintage", "Classic"),
        excludedStyles = listOf("Sporty")
    )
    
    coroutineScope.launch {
        try {
            // Show loading indicator
            progressBar.visibility = View.VISIBLE
            
            // Make API call on IO dispatcher
            val recommendationsResponse = withContext(Dispatchers.IO) {
                EyewearMLSDK.instance.styles.getStyleRecommendations(filters, limit = 5)
            }
            
            // Update UI on Main dispatcher
            val recommendations = recommendationsResponse.recommendations
            Log.d("Styles", "Received ${recommendations.size} style recommendations")
            
            // Update RecyclerView with recommendations
            stylesAdapter.submitList(recommendations)
            
        } catch (e: Exception) {
            when (e) {
                is EyewearMLException -> handleSdkError(e)
                else -> Log.e("Styles", "Error: ${e.message}", e)
            }
        } finally {
            // Hide loading indicator
            progressBar.visibility = View.GONE
        }
    }
}
```

### Virtual Try-On

Generate a virtual try-on image by overlaying a frame on a face image:

```kotlin
private fun generateVirtualTryOn(imageBytes: ByteArray, frameId: String) {
    coroutineScope.launch {
        try {
            // Show loading indicator
            progressBar.visibility = View.VISIBLE
            
            // Make API call on IO dispatcher
            val tryOnResponse = withContext(Dispatchers.IO) {
                EyewearMLSDK.instance.virtualTryOn.generateTryOn(imageBytes, frameId)
            }
            
            // Update UI on Main dispatcher
            Log.d("TryOn", "Successfully generated try-on image")
            
            // Decode base64 image data
            val imageBytes = android.util.Base64.decode(
                tryOnResponse.imageData, 
                android.util.Base64.DEFAULT
            )
            
            // Display the image
            val bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
            tryOnImageView.setImageBitmap(bitmap)
            
        } catch (e: Exception) {
            when (e) {
                is EyewearMLException -> handleSdkError(e)
                else -> Log.e("TryOn", "Error: ${e.message}", e)
            }
        } finally {
            // Hide loading indicator
            progressBar.visibility = View.GONE
        }
    }
}
```

## Error Handling

The SDK provides a comprehensive error handling system with specific error codes:

```kotlin
enum class EyewearMLErrorCode {
    NOT_CONFIGURED,
    NETWORK_ERROR,
    INVALID_RESPONSE,
    API_ERROR,
    AUTHENTICATION_ERROR,
    VALIDATION_ERROR
}

class EyewearMLException(
    val code: EyewearMLErrorCode,
    message: String,
    val statusCode: Int? = null,
    cause: Throwable? = null
) : Exception(message, cause)
```

You can handle errors based on their error code:

```kotlin
try {
    // SDK call
} catch (e: EyewearMLException) {
    when (e.code) {
        EyewearMLErrorCode.NOT_CONFIGURED -> 
            Log.e("SDK", "SDK not configured. Call configure() first.")
            
        EyewearMLErrorCode.NETWORK_ERROR -> 
            Log.e("SDK", "Network error: ${e.message}")
            
        EyewearMLErrorCode.AUTHENTICATION_ERROR -> 
            Log.e("SDK", "Authentication failed. Check your API key.")
            
        EyewearMLErrorCode.API_ERROR -> 
            Log.e("SDK", "API error (${e.statusCode}): ${e.message}")
            
        EyewearMLErrorCode.INVALID_RESPONSE -> 
            Log.e("SDK", "Invalid response from server")
            
        EyewearMLErrorCode.VALIDATION_ERROR -> 
            Log.e("SDK", "Validation error: ${e.message}")
    }
}
```

## Advanced Usage

### Custom Networking Configuration

You can customize the networking configuration when initializing the SDK:

```kotlin
val configuration = EyewearMLSDK.Configuration(
    apiBaseUrl = "https://api.eyewear-ml.com/v1",
    apiKey = "${APIKEY_2533}",
    timeoutSeconds = 60, // 60 seconds
    debug = true
)

EyewearMLSDK.instance.configure(configuration)
```

### Working with Images

The SDK accepts images as byte arrays. You can convert various image sources to byte arrays:

```kotlin
// From Uri (e.g., from camera or gallery)
private fun getImageBytesFromUri(uri: Uri): ByteArray {
    contentResolver.openInputStream(uri)?.use { inputStream ->
        return inputStream.readBytes()
    }
    throw IOException("Could not open input stream for URI: $uri")
}

// From Bitmap
private fun getImageBytesFromBitmap(bitmap: Bitmap): ByteArray {
    val outputStream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.JPEG, 80, outputStream)
    return outputStream.toByteArray()
}
```

## Proguard/R8 Configuration

If you're using Proguard or R8, add the following rules to your `proguard-rules.pro` file:

```
# EyewearML SDK
-keep class com.eyewearml.sdk.** { *; }

# Gson
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn sun.misc.**
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase
```

## Thread Safety

All SDK methods are designed to be called from any thread, but they internally perform network operations and should not be called from the main thread. The coroutine examples above show the recommended way to use the SDK, performing network operations on the IO dispatcher and updating the UI on the Main dispatcher.

## Sample App

We provide a sample app demonstrating how to integrate and use the EyewearML SDK in a real-world Android application. Check out our [GitHub repository](https://github.com/eyewear-ml/eyewearml-android-sample) for the complete source code.

## Support

If you encounter any issues or have questions about the SDK, please contact our developer support team at developer-support@eyewear-ml.com or visit our [developer portal](https://developers.eyewear-ml.com/).

## License

The EyewearML Android SDK is available under a commercial license. See the LICENSE file for more details.
