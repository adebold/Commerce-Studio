/**
 * VisionCraft Eyewear Store - Main JavaScript
 * 
 * This file handles the main functionality for the VisionCraft Eyewear retail store,
 * including product loading, search, filtering, and customer interactions.
 */

// Global variables
let allProducts = [];
let displayedProducts = [];
let currentPage = 1;
const productsPerPage = 9;
let isLoading = false;

// DOM elements
const productsGrid = document.getElementById('productsGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const searchInput = document.getElementById('searchInput');

// Initialize the store when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeStore();
    setupEventListeners();
});

/**
 * Initialize the store
 */
async function initializeStore() {
    try {
        showLoading(true);
        await loadProducts();
        displayProducts();
        showLoading(false);
    } catch (error) {
        console.error('Error initializing store:', error);
        showError('Failed to load products. Please refresh the page.');
        showLoading(false);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProducts);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Load products from API
 */
async function loadProducts() {
    try {
        console.log('Loading products from API...');
        const products = await getProducts();
        console.log('Loaded products:', products);
        
        if (Array.isArray(products) && products.length > 0) {
            allProducts = products;
            displayedProducts = [...allProducts];
        } else {
            console.warn('No products received from API, using fallback data');
            allProducts = getFallbackProducts();
            displayedProducts = [...allProducts];
        }
    } catch (error) {
        console.error('Error loading products:', error);
        allProducts = getFallbackProducts();
        displayedProducts = [...allProducts];
    }
}

/**
 * Display products in the grid
 */
function displayProducts() {
    if (!productsGrid) return;

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = displayedProducts.slice(0, endIndex);

    if (currentPage === 1) {
        productsGrid.innerHTML = '';
    }

    productsToShow.slice(startIndex).forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });

    // Show/hide load more button
    if (loadMoreBtn) {
        loadMoreBtn.style.display = endIndex < displayedProducts.length ? 'inline-block' : 'none';
    }
}

/**
 * Create a product card element
 */
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 mb-4';

    const faceShapeScores = product.ai_enhanced?.face_shape_compatibility_scores || {};
    const topFaceShapes = Object.entries(faceShapeScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([shape, score]) => `${capitalizeFirst(shape)}: ${Math.round(score * 100)}%`)
        .join(', ');

    col.innerHTML = `
        <div class="card product-card h-100">
            <img src="${product.image}" class="product-image" alt="${product.name}" loading="lazy">
            <div class="product-info">
                <div class="ai-badge">
                    <i class="bi bi-cpu-fill me-1"></i>AI Enhanced
                </div>
                <div class="product-brand">${product.brand}</div>
                <h5 class="product-name">${product.name}</h5>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <p class="product-description">${product.description}</p>
                
                ${topFaceShapes ? `
                <div class="face-shape-compatibility">
                    <small class="text-muted">
                        <i class="bi bi-person-check-fill me-1"></i>Best for: ${topFaceShapes}
                    </small>
                </div>
                ` : ''}
                
                <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-outline-custom" onclick="viewProductDetails('${product.id}')">
                        <i class="bi bi-eye-fill me-1"></i>Quick View
                    </button>
                    <button class="btn btn-primary-custom flex-fill" onclick="addToCart('${product.id}')">
                        <i class="bi bi-cart-plus-fill me-1"></i>Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;

    return col;
}

/**
 * Handle search functionality
 */
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        displayedProducts = [...allProducts];
    } else {
        displayedProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            (product.ai_enhanced?.style_keywords || []).some(keyword => 
                keyword.toLowerCase().includes(searchTerm)
            )
        );
    }
    
    currentPage = 1;
    displayProducts();
}

/**
 * Load more products
 */
function loadMoreProducts() {
    if (isLoading) return;
    
    currentPage++;
    displayProducts();
}

/**
 * View product details (modal or new page)
 */
function viewProductDetails(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    // Create and show product details modal
    showProductModal(product);
}

/**
 * Show product details in a modal
 */
function showProductModal(product) {
    const faceShapeScores = product.ai_enhanced?.face_shape_compatibility_scores || {};
    const specifications = product.specifications || {};
    
    const modalHtml = `
        <div class="modal fade" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="productModalLabel">${product.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <img src="${product.image}" class="img-fluid rounded" alt="${product.name}">
                            </div>
                            <div class="col-md-6">
                                <div class="ai-badge mb-3">
                                    <i class="bi bi-cpu-fill me-1"></i>AI Enhanced
                                </div>
                                <h6 class="text-muted">${product.brand}</h6>
                                <h4 class="mb-3">$${product.price.toFixed(2)}</h4>
                                <p>${product.description}</p>
                                
                                <h6 class="mt-4">Specifications</h6>
                                <ul class="list-unstyled">
                                    <li><strong>Frame Type:</strong> ${specifications.frame_type || 'N/A'}</li>
                                    <li><strong>Shape:</strong> ${specifications.frame_shape || 'N/A'}</li>
                                    <li><strong>Material:</strong> ${specifications.frame_material || 'N/A'}</li>
                                    <li><strong>Color:</strong> ${specifications.frame_color || 'N/A'}</li>
                                </ul>
                                
                                <h6 class="mt-4">Face Shape Compatibility</h6>
                                <div class="face-shape-scores">
                                    ${Object.entries(faceShapeScores).map(([shape, score]) => `
                                        <div class="compatibility-score">
                                            <span>${capitalizeFirst(shape)}</span>
                                            <div class="score-bar">
                                                <div class="score-fill" style="width: ${score * 100}%"></div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-custom" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary-custom" onclick="addToCart('${product.id}')">
                            <i class="bi bi-cart-plus-fill me-1"></i>Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('productModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();

    // Clean up modal after it's hidden
    document.getElementById('productModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

/**
 * Add product to cart (placeholder functionality)
 */
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    // For now, just show a success message
    showNotification(`Added "${product.name}" to cart!`, 'success');
    
    // In a real implementation, you would:
    // 1. Add to cart state/localStorage
    // 2. Update cart UI
    // 3. Send to backend if user is logged in
}

/**
 * Show loading state
 */
function showLoading(show) {
    if (loadingSpinner) {
        loadingSpinner.classList.toggle('show', show);
    }
    isLoading = show;
}

/**
 * Show error message
 */
function showError(message) {
    showNotification(message, 'error');
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Debounce function for search
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Fallback products for when API is not available
 */
function getFallbackProducts() {
    return [
        {
            id: 'fallback-1',
            name: 'Classic Rectangle Frame',
            brand: 'VisionCraft',
            price: 149.99,
            image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
            description: 'Classic rectangular frames with a timeless design and durable construction.',
            specifications: {
                frame_type: 'full-rim',
                frame_shape: 'rectangular',
                frame_material: 'acetate',
                frame_color: 'black'
            },
            ai_enhanced: {
                face_shape_compatibility_scores: {
                    oval: 0.9,
                    round: 0.8,
                    square: 0.7,
                    heart: 0.8,
                    diamond: 0.7,
                    oblong: 0.9
                },
                style_keywords: ['classic', 'professional', 'timeless'],
                feature_summary: 'Perfect for professional settings with classic appeal'
            }
        },
        {
            id: 'fallback-2',
            name: 'Modern Round Frame',
            brand: 'VisionCraft',
            price: 129.99,
            image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
            description: 'Modern round frames with a sleek design and lightweight construction.',
            specifications: {
                frame_type: 'full-rim',
                frame_shape: 'round',
                frame_material: 'titanium',
                frame_color: 'silver'
            },
            ai_enhanced: {
                face_shape_compatibility_scores: {
                    oval: 0.8,
                    round: 0.6,
                    square: 0.9,
                    heart: 0.8,
                    diamond: 0.9,
                    oblong: 0.7
                },
                style_keywords: ['modern', 'trendy', 'lightweight'],
                feature_summary: 'Contemporary design perfect for everyday wear'
            }
        },
        {
            id: 'fallback-3',
            name: 'Premium Cat-Eye Frame',
            brand: 'VisionCraft',
            price: 199.99,
            image: 'https://images.unsplash.com/photo-1513146581-976d6fdb6879?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
            description: 'Premium cat-eye frames with luxurious details and sophisticated styling.',
            specifications: {
                frame_type: 'full-rim',
                frame_shape: 'cat-eye',
                frame_material: 'acetate',
                frame_color: 'tortoiseshell'
            },
            ai_enhanced: {
                face_shape_compatibility_scores: {
                    oval: 0.9,
                    round: 0.9,
                    square: 0.8,
                    heart: 0.7,
                    diamond: 0.8,
                    oblong: 0.8
                },
                style_keywords: ['premium', 'elegant', 'sophisticated'],
                feature_summary: 'Elegant cat-eye design with premium materials'
            }
        }
    ];
}

// Export functions for global access
window.viewProductDetails = viewProductDetails;
window.addToCart = addToCart;
