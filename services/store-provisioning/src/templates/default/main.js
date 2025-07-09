document.addEventListener('DOMContentLoaded', () => {
    const config = window.COMMERCE_STUDIO_CONFIG;

    if (!config) {
        console.error('Commerce Studio configuration not found.');
        return;
    }

    console.log('Initializing Commerce Studio for tenant:', config.tenantId);

    // Load product catalog
    loadProductCatalog(config.apiKey, config.tenantId);

    // Initialize features based on tenant configuration
    if (config.features.consultation) {
        initializeConsultationWidget(config);
    }

    if (config.features.vto) {
        initializeVtoWidget(config);
    }
});

async function loadProductCatalog(apiKey, tenantId) {
    const catalogContainer = document.getElementById('product-catalog');
    if (!catalogContainer) return;

    try {
        // This is a placeholder for fetching products from a future Product Catalog API
        // For now, we'll use mock data.
        const products = await getMockProducts();
        
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <strong>$${product.price.toFixed(2)}</strong>
            `;
            catalogContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Failed to load product catalog:', error);
        catalogContainer.innerHTML = '<p>Could not load products at this time.</p>';
    }
}

function initializeConsultationWidget(config) {
    const widget = document.getElementById('consultation-widget');
    if (widget) {
        console.log('Initializing Consultation Widget...');
        widget.style.display = 'block';
        widget.innerHTML = '<h3>AI Consultation</h3><p>Ask me anything about our products!</p>';
        // In a real implementation, this would load the actual consultation chat script
    }
}

function initializeVtoWidget(config) {
    const widget = document.getElementById('vto-widget');
    if (widget) {
        console.log('Initializing Virtual Try-On Widget...');
        // This would be a separate widget, so we'll just show a placeholder
        const vtoButton = document.createElement('button');
        vtoButton.innerText = 'Virtual Try-On';
        vtoButton.onclick = () => {
            widget.style.display = widget.style.display === 'none' ? 'block' : 'none';
            widget.innerHTML = '<h3>Virtual Try-On</h3><p>See how our products look on you!</p>';
        };
        document.body.appendChild(vtoButton);
    }
}

async function getMockProducts() {
    return [
        { id: 1, name: 'Classic Aviators', description: 'Timeless style and protection.', price: 150.00 },
        { id: 2, name: 'Modern Wayfarers', description: 'A new take on a classic design.', price: 120.00 },
        { id: 3, name: 'Sport Sunglasses', description: 'Lightweight and durable for any activity.', price: 180.00 },
        { id: 4, name: 'Round Vintage', description: 'Retro look with a modern feel.', price: 135.00 }
    ];
}