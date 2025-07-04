/**
 * Dashboard JavaScript - Store Connection Management
 * VARAi Commerce Studio Customer Portal
 */

// Platform-specific demo store URLs
const DEMO_STORE_URLS = {
    shopify: {
        url: 'https://varai-commerce-studio-dev.myshopify.com/admin/apps/varai-commerce-studio',
        label: 'View Shopify App',
        icon: '🛒',
        description: 'Access your Shopify app installation'
    },
    magento: {
        url: 'https://demo-magento.varai.com/admin/varai/dashboard',
        label: 'View Magento Store',
        icon: '🏪',
        description: 'Access your Magento admin panel'
    },
    woocommerce: {
        url: 'https://demo-wordpress.varai.com/wp-admin/admin.php?page=varai-settings',
        label: 'View WordPress Admin',
        icon: '🛍️',
        description: 'Access your WordPress/WooCommerce admin'
    },
    default: {
        url: 'https://visioncraft-store-353252826752.us-central1.run.app',
        label: 'View Demo Store',
        icon: '👁️',
        description: 'Experience our AI-powered demo store'
    }
};

// Initialize platform-specific demo buttons on page load
document.addEventListener('DOMContentLoaded', function() {
    initializePlatformDemoButtons();
});

function initializePlatformDemoButtons() {
    const demoUser = localStorage.getItem('demo-user');
    const platformButtonsContainer = document.getElementById('platform-demo-buttons');
    
    if (!platformButtonsContainer) return;
    
    let platform = 'default';
    let userInfo = null;
    
    if (demoUser) {
        try {
            userInfo = JSON.parse(demoUser);
            platform = userInfo.platform || 'default';
        } catch (error) {
            console.warn('Error parsing demo user data:', error);
        }
    }
    
    const storeConfig = DEMO_STORE_URLS[platform] || DEMO_STORE_URLS.default;
    
    // Create platform-specific demo button
    platformButtonsContainer.innerHTML = `
        <a href="${storeConfig.url}"
           class="varai-btn varai-btn-primary"
           target="_blank"
           title="${storeConfig.description}">
            ${storeConfig.icon} ${storeConfig.label}
        </a>
    `;
    
    // Add platform indicator if user is logged in with a specific platform
    if (userInfo && userInfo.platform) {
        const platformIndicator = document.createElement('div');
        platformIndicator.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: var(--varai-success);
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
        `;
        platformIndicator.textContent = platform.charAt(0).toUpperCase();
        platformIndicator.title = `Connected to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`;
        
        const buttonParent = platformButtonsContainer.querySelector('a');
        if (buttonParent) {
            buttonParent.style.position = 'relative';
            buttonParent.appendChild(platformIndicator);
        }
    }
}

// Store connection management functions
function connectShopify() {
    // Show connection modal or redirect to Shopify OAuth
    showConnectionModal('Shopify', {
        title: 'Connect Your Shopify Store',
        description: 'Connect your Shopify store to enable AI-powered recommendations, inventory synchronization, and advanced analytics.',
        fields: [
            { name: 'store_url', label: 'Store URL', placeholder: 'your-store.myshopify.com', required: true },
            { name: 'api_key', label: 'API Key', placeholder: 'Enter your Shopify API key', required: true },
            { name: 'api_secret', label: 'API Secret', placeholder: 'Enter your API secret', required: true, type: 'password' }
        ],
        features: [
            'AI-powered product recommendations',
            'Real-time inventory synchronization',
            'Advanced customer analytics',
            'Automated marketing campaigns',
            'Multi-channel order management'
        ],
        onConnect: handleShopifyConnection
    });
}

function connectMagento() {
    // Show connection modal for Magento
    showConnectionModal('Magento', {
        title: 'Connect Your Magento Store',
        description: 'Integrate your Magento store with enterprise-grade AI features and multi-store management capabilities.',
        fields: [
            { name: 'store_url', label: 'Store URL', placeholder: 'https://your-store.com', required: true },
            { name: 'admin_token', label: 'Admin Token', placeholder: 'Enter your admin token', required: true, type: 'password' },
            { name: 'store_code', label: 'Store Code', placeholder: 'default', required: false }
        ],
        features: [
            'Enterprise-grade AI recommendations',
            'Multi-store management',
            'Advanced inventory control',
            'Customer behavior analytics',
            'Automated pricing optimization'
        ],
        onConnect: handleMagentoConnection
    });
}

function connectWooCommerce() {
    // Show connection modal for WooCommerce
    showConnectionModal('WooCommerce', {
        title: 'Connect Your WooCommerce Store',
        description: 'Integrate your WordPress/WooCommerce store with AI-powered features and seamless plugin integration.',
        fields: [
            { name: 'site_url', label: 'WordPress Site URL', placeholder: 'https://your-site.com', required: true },
            { name: 'consumer_key', label: 'Consumer Key', placeholder: 'Enter your WooCommerce consumer key', required: true },
            { name: 'consumer_secret', label: 'Consumer Secret', placeholder: 'Enter your consumer secret', required: true, type: 'password' },
            { name: 'plugin_active', label: 'VARAi Plugin Active', type: 'checkbox', description: 'Confirm the VARAi plugin is installed and activated' }
        ],
        features: [
            'WordPress plugin integration',
            'Shortcode system for easy embedding',
            'SEO optimization tools',
            'WP Admin dashboard integration',
            'Product recommendation widgets'
        ],
        onConnect: handleWooCommerceConnection
    });
}

function showConnectionModal(platform, config) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'varai-modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'varai-modal';
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    `;

    // Build modal HTML
    modal.innerHTML = `
        <div class="varai-modal-header varai-mb-6">
            <div class="varai-flex varai-items-center varai-justify-between">
                <h2 class="varai-text-2xl varai-font-bold">${config.title}</h2>
                <button class="varai-btn-close" onclick="closeConnectionModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <p class="varai-text-muted varai-mt-2">${config.description}</p>
        </div>

        <form id="connection-form" class="varai-mb-6">
            ${config.fields.map(field => `
                <div class="varai-form-group varai-mb-4">
                    <label class="varai-form-label varai-mb-2 varai-d-block">${field.label}${field.required ? ' *' : ''}</label>
                    <input 
                        type="${field.type || 'text'}" 
                        name="${field.name}" 
                        placeholder="${field.placeholder}" 
                        class="varai-form-control varai-w-100" 
                        ${field.required ? 'required' : ''}
                        style="padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;"
                    />
                </div>
            `).join('')}
        </form>

        <div class="varai-mb-6">
            <h3 class="varai-text-lg varai-font-bold varai-mb-3">Features You'll Get:</h3>
            <ul class="varai-list-unstyled">
                ${config.features.map(feature => `
                    <li class="varai-flex varai-items-center varai-mb-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 0.5rem; color: var(--varai-success);">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                        </svg>
                        ${feature}
                    </li>
                `).join('')}
            </ul>
        </div>

        <div class="varai-flex varai-justify-end" style="gap: 1rem;">
            <button type="button" class="varai-btn varai-btn-outline" onclick="closeConnectionModal()">Cancel</button>
            <button type="button" class="varai-btn varai-btn-primary" onclick="submitConnection('${platform}')">Connect Store</button>
        </div>
    `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    // Store the connection handler
    window.currentConnectionHandler = config.onConnect;
}

function closeConnectionModal() {
    const modal = document.querySelector('.varai-modal-overlay');
    if (modal) {
        modal.remove();
    }
    window.currentConnectionHandler = null;
}

function submitConnection(platform) {
    const form = document.getElementById('connection-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            field.style.borderColor = '#ddd';
        }
    });

    if (!isValid) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('.varai-btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Connecting...';
    submitBtn.disabled = true;

    // Call the connection handler
    if (window.currentConnectionHandler) {
        window.currentConnectionHandler(data)
            .then(() => {
                closeConnectionModal();
                showNotification(`${platform} store connected successfully!`, 'success');
                // Refresh the page to show updated connection status
                setTimeout(() => window.location.reload(), 1500);
            })
            .catch(error => {
                console.error('Connection error:', error);
                showNotification(`Failed to connect ${platform} store. Please check your credentials.`, 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
    }
}

async function handleShopifyConnection(data) {
    // Simulate API call to connect Shopify store
    const response = await fetch('/api/store-integrations/shopify/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            store_url: data.store_url,
            api_key: data.api_key,
            api_secret: data.api_secret
        })
    });

    if (!response.ok) {
        throw new Error('Failed to connect Shopify store');
    }

    return response.json();
}

async function handleMagentoConnection(data) {
    // Simulate API call to connect Magento store
    const response = await fetch('/api/store-integrations/magento/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            store_url: data.store_url,
            admin_token: data.admin_token,
            store_code: data.store_code || 'default'
        })
    });

    if (!response.ok) {
        throw new Error('Failed to connect Magento store');
    }

    return response.json();
}

async function handleWooCommerceConnection(data) {
    // Simulate API call to connect WooCommerce store
    const response = await fetch('/api/store-integrations/woocommerce/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            site_url: data.site_url,
            consumer_key: data.consumer_key,
            consumer_secret: data.consumer_secret,
            plugin_active: data.plugin_active === 'on'
        })
    });

    if (!response.ok) {
        throw new Error('Failed to connect WooCommerce store');
    }

    return response.json();
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `varai-notification varai-notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Initialize dashboard functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add any initialization code here
    console.log('Dashboard initialized');
    
    // Check for platform parameter in URL (from demo login)
    const urlParams = new URLSearchParams(window.location.search);
    const platform = urlParams.get('platform');
    
    if (platform === 'shopify') {
        // Highlight Shopify connection option
        setTimeout(() => {
            const shopifyCard = document.querySelector('[onclick="connectShopify()"]').closest('.varai-card');
            if (shopifyCard) {
                shopifyCard.style.boxShadow = '0 0 20px rgba(149, 191, 71, 0.3)';
                shopifyCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 1000);
    } else if (platform === 'magento') {
        // Highlight Magento connection option
        setTimeout(() => {
            const magentoCard = document.querySelector('[onclick="connectMagento()"]').closest('.varai-card');
            if (magentoCard) {
                magentoCard.style.boxShadow = '0 0 20px rgba(238, 103, 47, 0.3)';
                magentoCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 1000);
    }
});

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('varai-modal-overlay')) {
        closeConnectionModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeConnectionModal();
    }
});