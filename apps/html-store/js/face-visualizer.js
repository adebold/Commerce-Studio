/**
 * Face Shape Visualizer
 * 
 * This script handles the virtual try-on functionality,
 * allowing users to see how glasses look on different face shapes.
 */

// Face shape image URLs
const faceShapeImages = {
    oval: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Oval-1.png',
    round: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Round-1.png',
    square: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Square-1.png',
    heart: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Heart-1.png',
    diamond: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Diamond-1.png',
    oblong: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Oblong-1.png'
};

// Current product being tried on
let currentProduct = null;

// Current face shape
let currentFaceShape = 'oval';

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Try-on button in product modal
    const tryOnButton = document.getElementById('tryOnButton');
    if (tryOnButton) {
        tryOnButton.addEventListener('click', function() {
            // Get the current product from the modal
            const productName = document.getElementById('modalProductName').textContent;
            const productImage = document.getElementById('modalProductImage').src;
            
            // Find the product in the products array
            currentProduct = products.find(p => p.name === productName);
            
            // Initialize the try-on modal
            initTryOnModal(currentProduct, productImage);
            
            // Close the product modal
            const productModal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
            productModal.hide();
            
            // Show the try-on modal
            const tryOnModal = new bootstrap.Modal(document.getElementById('tryOnModal'));
            tryOnModal.show();
        });
    }
    
    // Visualizer link in navbar
    const visualizerLink = document.getElementById('visualizerLink');
    if (visualizerLink) {
        visualizerLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // If no product is selected, use the first product
            if (!currentProduct && products.length > 0) {
                currentProduct = products[0];
            }
            
            // Initialize the try-on modal
            initTryOnModal(currentProduct, currentProduct ? currentProduct.image : '');
            
            // Show the try-on modal
            const tryOnModal = new bootstrap.Modal(document.getElementById('tryOnModal'));
            tryOnModal.show();
        });
    }
    
    // Face shape select in try-on modal
    const faceShapeSelect = document.getElementById('tryOnFaceSelect');
    if (faceShapeSelect) {
        faceShapeSelect.addEventListener('change', function() {
            currentFaceShape = this.value;
            updateTryOnVisualization();
        });
    }
    
    // Previous button in try-on modal
    const prevButton = document.getElementById('tryOnPrevious');
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            navigateProducts(-1);
        });
    }
    
    // Next button in try-on modal
    const nextButton = document.getElementById('tryOnNext');
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            navigateProducts(1);
        });
    }
});

/**
 * Initialize the try-on modal with a product
 * @param {Object} product - The product to try on
 * @param {string} productImage - The product image URL
 */
function initTryOnModal(product, productImage) {
    if (!product) {
        console.warn('No product provided for try-on');
        return;
    }
    
    // Set the modal title
    document.querySelector('#tryOnModal .modal-title').textContent = `Try On: ${product.name}`;
    
    // Set the face shape based on best compatibility
    if (product.ai_enhanced && product.ai_enhanced.face_shape_compatibility_scores) {
        const bestFaceShape = Object.entries(product.ai_enhanced.face_shape_compatibility_scores)
            .sort((a, b) => b[1] - a[1])[0];
        
        currentFaceShape = bestFaceShape[0];
        
        // Update the face shape select
        const faceShapeSelect = document.getElementById('tryOnFaceSelect');
        if (faceShapeSelect) {
            faceShapeSelect.value = currentFaceShape;
        }
    }
    
    // Update the visualization
    updateTryOnVisualization(productImage);
}

/**
 * Update the try-on visualization
 * @param {string} productImage - The product image URL (optional)
 */
function updateTryOnVisualization(productImage) {
    // Set the face image
    const faceImage = document.getElementById('tryOnFace');
    if (faceImage) {
        faceImage.src = faceShapeImages[currentFaceShape] || faceShapeImages.oval;
        faceImage.alt = `${currentFaceShape} face shape`;
    }
    
    // Set the glasses image
    const glassesImage = document.getElementById('tryOnGlasses');
    if (glassesImage) {
        if (productImage) {
            glassesImage.src = productImage;
        } else if (currentProduct) {
            glassesImage.src = currentProduct.image;
        }
        glassesImage.alt = currentProduct ? currentProduct.name : 'Glasses';
    }
    
    // Update compatibility information
    if (currentProduct && currentProduct.ai_enhanced && currentProduct.ai_enhanced.face_shape_compatibility_scores) {
        const compatScore = currentProduct.ai_enhanced.face_shape_compatibility_scores[currentFaceShape] || 0;
        const compatPercent = Math.round(compatScore * 100);
        
        // Add compatibility information to the modal
        const modalBody = document.querySelector('#tryOnModal .modal-body');
        let compatInfo = modalBody.querySelector('.compat-info');
        
        if (!compatInfo) {
            compatInfo = document.createElement('div');
            compatInfo.className = 'compat-info mt-3 text-center';
            modalBody.appendChild(compatInfo);
        }
        
        compatInfo.innerHTML = `
            <p class="mb-1">Compatibility with ${currentFaceShape} face shape:</p>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar ${compatPercent >= 70 ? 'bg-success' : compatPercent >= 40 ? 'bg-warning' : 'bg-danger'}" 
                     role="progressbar" 
                     style="width: ${compatPercent}%;" 
                     aria-valuenow="${compatPercent}" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                </div>
            </div>
            <p class="mt-1 ${compatPercent >= 70 ? 'text-success' : compatPercent >= 40 ? 'text-warning' : 'text-danger'}">
                ${compatPercent}% match
            </p>
        `;
    }
}

/**
 * Navigate to the previous or next product
 * @param {number} direction - The direction to navigate (-1 for previous, 1 for next)
 */
function navigateProducts(direction) {
    if (!currentProduct || !products || products.length === 0) {
        return;
    }
    
    // Find the current product index
    const currentIndex = products.findIndex(p => p.id === currentProduct.id);
    if (currentIndex === -1) {
        return;
    }
    
    // Calculate the new index
    let newIndex = currentIndex + direction;
    
    // Wrap around if needed
    if (newIndex < 0) {
        newIndex = products.length - 1;
    } else if (newIndex >= products.length) {
        newIndex = 0;
    }
    
    // Set the new current product
    currentProduct = products[newIndex];
    
    // Update the try-on modal
    initTryOnModal(currentProduct, currentProduct.image);
}