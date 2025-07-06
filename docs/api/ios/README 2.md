# EyewearML iOS SDK

The EyewearML iOS SDK provides a simple way to integrate eyewear recommendation and virtual try-on technologies into your iOS applications. This SDK handles all the complexities of image processing, API communication, and data management.

## Features

- **Product Catalog**: Browse and search eyewear products
- **Frame Recommendations**: Get personalized frame recommendations based on face analysis
- **Style Recommendations**: Receive style suggestions based on preferences
- **Face Analysis**: Analyze facial features to determine face shape and measurements
- **Virtual Try-On**: Visualize how frames look on a user's face

## Requirements

- iOS 13.0+
- Swift 5.0+
- Xcode 12.0+

## Installation

### Swift Package Manager

The preferred way to install the EyewearML SDK is via Swift Package Manager.

1. In Xcode, select "File" > "Swift Packages" > "Add Package Dependency"
2. Enter the repository URL: `https://github.com/eyewear-ml/eyewearml-ios-sdk.git`
3. Select the version: `~> 1.0.0`
4. Click "Next" and then "Finish"

### CocoaPods

You can also install the SDK using CocoaPods:

```ruby
pod 'EyewearMLSDK', '~> 1.0.0'
```

Run `pod install` after adding the dependency.

### Manual Installation

If you prefer to install the SDK manually:

1. Download the latest release from our [GitHub repository](https://github.com/eyewear-ml/eyewearml-ios-sdk/releases)
2. Drag `EyewearMLSDK.xcframework` into your project
3. In your target settings, go to "General" > "Frameworks, Libraries, and Embedded Content"
4. Set EyewearMLSDK to "Embed & Sign"

## Getting Started

### Configuration

Initialize the SDK in your app's initialization code, typically in the `AppDelegate`:

```swift
import EyewearMLSDK

func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Configure the SDK
    let configuration = EyewearMLSDK.Configuration(
        apiBaseURL: "https://api.eyewear-ml.com/v1",
        apiKey: "${APIKEY_2535}",
        debug: true // Set to false in production
    )
    
    EyewearMLSDK.shared.configure(with: configuration)
    
    return true
}
```

### Browse Products

Retrieve a list of products from the catalog:

```swift
import EyewearMLSDK

func loadProducts() {
    EyewearMLSDK.shared.catalog.getProducts(page: 1, limit: 20) { result in
        switch result {
        case .success(let response):
            // Handle products
            let products = response.items
            print("Loaded \(products.count) products")
            
            // Update UI
            DispatchQueue.main.async {
                self.productsTableView.reloadData()
            }
            
        case .failure(let error):
            // Handle error
            print("Failed to load products: \(error.localizedDescription)")
        }
    }
}
```

### Get Product Details

Retrieve details for a specific product:

```swift
func loadProductDetails(productId: String) {
    EyewearMLSDK.shared.catalog.getProduct(productId: productId) { result in
        switch result {
        case .success(let product):
            // Handle product details
            print("Loaded product: \(product.name)")
            
            // Update UI
            DispatchQueue.main.async {
                self.productNameLabel.text = product.name
                self.productDescriptionLabel.text = product.description
                self.productPriceLabel.text = "$\(product.price)"
                
                if let imageUrl = URL(string: product.images.first ?? "") {
                    self.loadImage(from: imageUrl)
                }
            }
            
        case .failure(let error):
            // Handle error
            print("Failed to load product details: \(error.localizedDescription)")
        }
    }
}
```

### Face Analysis

Analyze a face image to determine face shape and measurements:

```swift
func analyzeFace(image: UIImage) {
    guard let imageData = image.jpegData(compressionQuality: 0.8) else {
        print("Failed to convert image to data")
        return
    }
    
    EyewearMLSDK.shared.faceAnalysis.analyzeFace(faceImage: imageData) { result in
        switch result {
        case .success(let analysis):
            // Handle face analysis results
            print("Face shape: \(analysis.faceShape)")
            print("Pupillary distance: \(analysis.measurements.pupillaryDistance)mm")
            
            // Store analysis for later use
            self.lastFaceAnalysis = analysis
            
            // Update UI
            DispatchQueue.main.async {
                self.faceShapeLabel.text = analysis.faceShape
                self.symmetryScoreLabel.text = "Symmetry: \(Int(analysis.symmetryScore * 100))%"
            }
            
        case .failure(let error):
            // Handle error
            print("Face analysis failed: \(error.localizedDescription)")
        }
    }
}
```

### Frame Recommendations

Get frame recommendations based on a face image:

```swift
func getFrameRecommendations(image: UIImage) {
    guard let imageData = image.jpegData(compressionQuality: 0.8) else {
        print("Failed to convert image to data")
        return
    }
    
    EyewearMLSDK.shared.frames.getRecommendedFrames(faceImage: imageData, limit: 5) { result in
        switch result {
        case .success(let response):
            // Handle frame recommendations
            let recommendations = response.recommendations
            print("Received \(recommendations.count) frame recommendations")
            
            // Update UI
            DispatchQueue.main.async {
                self.recommendationsTableView.reloadData()
            }
            
        case .failure(let error):
            // Handle error
            print("Failed to get frame recommendations: \(error.localizedDescription)")
        }
    }
}
```

### Style Recommendations

Get style recommendations based on preferences:

```swift
func getStyleRecommendations() {
    // Create style filters
    let filters = StyleFilters(
        faceShape: "oval",
        preferredColors: ["Black", "Gold"],
        preferredMaterials: ["Metal", "Acetate"],
        preferredStyles: ["Vintage", "Classic"],
        excludedStyles: ["Sporty"]
    )
    
    EyewearMLSDK.shared.styles.getStyleRecommendations(filters: filters, limit: 5) { result in
        switch result {
        case .success(let response):
            // Handle style recommendations
            let recommendations = response.recommendations
            print("Received \(recommendations.count) style recommendations")
            
            // Update UI
            DispatchQueue.main.async {
                self.stylesCollectionView.reloadData()
            }
            
        case .failure(let error):
            // Handle error
            print("Failed to get style recommendations: \(error.localizedDescription)")
        }
    }
}
```

### Virtual Try-On

Generate a virtual try-on image by overlaying a frame on a face image:

```swift
func generateVirtualTryOn(image: UIImage, frameId: String) {
    guard let imageData = image.jpegData(compressionQuality: 0.8) else {
        print("Failed to convert image to data")
        return
    }
    
    EyewearMLSDK.shared.virtualTryOn.generateTryOn(faceImage: imageData, frameId: frameId) { result in
        switch result {
        case .success(let response):
            // Handle try-on result
            print("Generated try-on image")
            
            // Display the try-on image
            if let data = Data(base64Encoded: response.imageData) {
                DispatchQueue.main.async {
                    self.tryOnImageView.image = UIImage(data: data)
                }
            }
            
        case .failure(let error):
            // Handle error
            print("Virtual try-on failed: \(error.localizedDescription)")
        }
    }
}
```

## Error Handling

The SDK provides a comprehensive error handling system. All API methods return a `Result` type with either a success value or an `EyewearMLError`:

```swift
enum EyewearMLError: Error {
    case notConfigured
    case networkError(Error)
    case invalidResponse
    case apiError(statusCode: Int, message: String)
    case authenticationError
    case validationError(String)
}
```

You can handle errors specifically:

```swift
EyewearMLSDK.shared.catalog.getProducts { result in
    switch result {
    case .success(let response):
        // Handle success
        
    case .failure(let error):
        switch error {
        case .notConfigured:
            print("SDK not configured. Call configure() first.")
            
        case .networkError(let underlyingError):
            print("Network error: \(underlyingError.localizedDescription)")
            
        case .authenticationError:
            print("Authentication failed. Check your API key.")
            
        case .apiError(let statusCode, let message):
            print("API error (\(statusCode)): \(message)")
            
        case .invalidResponse:
            print("Invalid response from server")
            
        case .validationError(let message):
            print("Validation error: \(message)")
        }
    }
}
```

## Advanced Usage

### Custom Networking Configuration

You can customize the networking configuration by extending the `Configuration` class:

```swift
let customConfig = EyewearMLSDK.Configuration(
    apiBaseURL: "https://api.eyewear-ml.com/v1",
    apiKey: "${APIKEY_2535}",
    timeoutInterval: 60.0, // 60 seconds
    debug: true
)

EyewearMLSDK.shared.configure(with: customConfig)
```

### Caching

The SDK automatically caches network responses to improve performance and reduce API calls. Cache invalidation is handled automatically.

## Thread Safety

All SDK methods are thread-safe and can be called from any thread. Completion handlers are called on the same thread that initiated the request, so you may need to dispatch UI updates to the main thread:

```swift
EyewearMLSDK.shared.catalog.getProducts { result in
    // This may be called on a background thread
    switch result {
    case .success(let response):
        DispatchQueue.main.async {
            // Update UI safely on the main thread
            self.productsTableView.reloadData()
        }
        
    case .failure(let error):
        DispatchQueue.main.async {
            // Show error alert on the main thread
            self.showErrorAlert(message: error.localizedDescription)
        }
    }
}
```

## Sample App

We provide a sample app demonstrating how to integrate and use the EyewearML SDK in a real-world iOS application. Check out our [GitHub repository](https://github.com/eyewear-ml/eyewearml-ios-sample) for the complete source code.

## Support

If you encounter any issues or have questions about the SDK, please contact our developer support team at developer-support@eyewear-ml.com or visit our [developer portal](https://developers.eyewear-ml.com/).

## License

The EyewearML iOS SDK is available under a commercial license. See the LICENSE file for more details.
