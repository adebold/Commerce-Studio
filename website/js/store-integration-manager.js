/**
 * Store Integration Manager
 * 
 * Implements US-005: Store Integration Management with comprehensive
 * e-commerce platform integration capabilities including intelligent
 * connection management, real-time sync, and agentic optimization.
 */

class StoreIntegrationManager {
    constructor() {
        this.integrations = new Map();
        this.connectionStates = new Map();
        this.syncStatus = new Map();
        this.eventListeners = {};
        this.apiEndpoint = '/api/stores';
        this.retryAttempts = 3;
        this.syncInterval = null;
        this.isInitialized = false;
        
        // Supported platforms with their configurations
        this.platforms = {
            shopify: {
                name: 'Shopify',
                icon: 'SH',
                color: '#96bf48',
                authType: 'oauth',
                requiredFields: ['store_url', 'access_token'],
                optionalFields: ['webhook_secret'],
                syncCapabilities: ['products', 'orders', 'customers', 'inventory'],
                description: 'Sync products, orders, and customer data with your Shopify store.'
            },
            magento: {
                name: 'Magento',
                icon: 'MG',
                color: '#ee672f',
                authType: 'api_key',
                requiredFields: ['store_url', 'api_key', 'api_secret'],
                optionalFields: ['admin_token'],
                syncCapabilities: ['products', 'orders', 'customers', 'categories'],
                description: 'Connect your Magento store for seamless product management.'
            },
            woocommerce: {
                name: 'WooCommerce',
                icon: 'WC',
                color: '#96588a',
                authType: 'api_key',
                requiredFields: ['store_url', 'consumer_key', 'consumer_secret'],
                optionalFields: ['webhook_secret'],
                syncCapabilities: ['products', 'orders', 'customers', 'coupons'],
                description: 'Integrate with WooCommerce for WordPress-based stores.'
            },
            bigcommerce: {
                name: 'BigCommerce',
                icon: 'BC',
                color: '#121118',
                authType: 'api_key',
                requiredFields: ['store_hash', 'access_token'],
                optionalFields: ['client_id'],
                syncCapabilities: ['products', 'orders', 'customers', 'webhooks'],
                description: 'Connect your BigCommerce store for comprehensive integration.'
            }
        };
        
        this.init();
    }
    
    /**
     * Initialize the Store Integration Manager
     */
    async init() {
        try {
            console.log('🔌 Initializing Store Integration Manager...');
            
            // Load existing integrations
            await this.loadIntegrations();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI components
            this.initializeUI();
            
            // Start sync monitoring
            this.startSyncMonitoring();
            
            this.isInitialized = true;
            this.emit('initialized', { success: true });
            
            console.log('✅ Store Integration Manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Store Integration Manager:', error);
            this.emit('error', { type: 'initialization', error });
        }
    }
    
    /**
     * Load existing integrations from the backend
     */
    async loadIntegrations() {
        try {
            const response = await fetch(`${this.apiEndpoint}/list`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                data.integrations?.forEach(integration => {
                    this.integrations.set(integration.platform, integration);
                    this.connectionStates.set(integration.platform, integration.status);
                });
                
                this.updateIntegrationCards();
                this.emit('integrations_loaded', { count: this.integrations.size });
            }
        } catch (error) {
            console.error('Failed to load integrations:', error);
            // Initialize with default states if loading fails
            Object.keys(this.platforms).forEach(platform => {
                this.connectionStates.set(platform, 'disconnected');
            });
        }
    }
    
    /**
     * Setup event listeners for integration management
     */
    setupEventListeners() {
        // Listen for integration button clicks
        document.addEventListener('click', (event) => {
            const target = event.target;
            
            if (target.classList.contains('integration-connect-btn')) {
                const platform = target.dataset.platform;
                this.showConnectionModal(platform);
            } else if (target.classList.contains('integration-configure-btn')) {
                const platform = target.dataset.platform;
                this.showConfigurationModal(platform);
            } else if (target.classList.contains('integration-disconnect-btn')) {
                const platform = target.dataset.platform;
                this.showDisconnectionModal(platform);
            } else if (target.classList.contains('integration-sync-btn')) {
                const platform = target.dataset.platform;
                this.triggerSync(platform);
            }
        });
        
        // Listen for form submissions
        document.addEventListener('submit', (event) => {
            if (event.target.classList.contains('integration-connection-form')) {
                event.preventDefault();
                this.handleConnectionForm(event.target);
            }
        });
    }
    
    /**
     * Initialize UI components
     */
    initializeUI() {
        this.updateIntegrationCards();
        this.createSyncStatusIndicator();
        this.createIntegrationModals();
    }
    
    /**
     * Update integration cards with current status
     */
    updateIntegrationCards() {
        Object.keys(this.platforms).forEach(platform => {
            const card = document.querySelector(`[data-platform="${platform}"]`)?.closest('.integration-card');
            if (card) {
                this.updateIntegrationCard(platform, card);
            }
        });
    }
    
    /**
     * Update individual integration card
     */
    updateIntegrationCard(platform, card) {
        const platformConfig = this.platforms[platform];
        const status = this.connectionStates.get(platform) || 'disconnected';
        const integration = this.integrations.get(platform);
        
        // Update status badge
        const statusBadge = card.querySelector('.integration-status-badge');
        if (statusBadge) {
            statusBadge.className = `integration-status-badge ${status}`;
            statusBadge.textContent = this.getStatusText(status);
        }
        
        // Update actions
        const actionsContainer = card.querySelector('.integration-card-actions');
        if (actionsContainer) {
            actionsContainer.innerHTML = this.generateActionButtons(platform, status);
        }
        
        // Update sync status if connected
        if (status === 'connected' && integration) {
            this.updateSyncStatus(platform, card);
        }
    }
    
    /**
     * Generate action buttons based on integration status
     */
    generateActionButtons(platform, status) {
        const buttons = [];
        
        switch (status) {
            case 'connected':
                buttons.push(`<button class="btn-secondary btn-small integration-configure-btn" data-platform="${platform}">Configure</button>`);
                buttons.push(`<button class="btn-primary btn-small integration-sync-btn" data-platform="${platform}">Sync Now</button>`);
                buttons.push(`<button class="btn-danger btn-small integration-disconnect-btn" data-platform="${platform}">Disconnect</button>`);
                break;
            case 'connecting':
                buttons.push(`<button class="btn-secondary btn-small" disabled>Connecting...</button>`);
                break;
            case 'error':
                buttons.push(`<button class="btn-primary btn-small integration-connect-btn" data-platform="${platform}">Reconnect</button>`);
                buttons.push(`<button class="btn-secondary btn-small integration-configure-btn" data-platform="${platform}">Configure</button>`);
                break;
            default: // disconnected
                buttons.push(`<button class="btn-primary btn-small integration-connect-btn" data-platform="${platform}">Connect</button>`);
        }
        
        return buttons.join('');
    }
    
    /**
     * Get human-readable status text
     */
    getStatusText(status) {
        const statusMap = {
            connected: 'Connected',
            connecting: 'Connecting...',
            disconnected: 'Disconnected',
            error: 'Error',
            syncing: 'Syncing...'
        };
        return statusMap[status] || 'Unknown';
    }
    
    /**
     * Show connection modal for a platform
     */
    showConnectionModal(platform) {
        const platformConfig = this.platforms[platform];
        if (!platformConfig) return;
        
        const modal = this.createConnectionModal(platform, platformConfig);
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => modal.classList.add('show'), 10);
        
        this.emit('modal_opened', { type: 'connection', platform });
    }
    
    /**
     * Create connection modal
     */
    createConnectionModal(platform, config) {
        const modal = document.createElement('div');
        modal.className = 'integration-modal-overlay';
        modal.innerHTML = `
            <div class="integration-modal">
                <div class="integration-modal-header">
                    <h3>Connect ${config.name}</h3>
                    <button class="integration-modal-close" onclick="this.closest('.integration-modal-overlay').remove()">&times;</button>
                </div>
                <div class="integration-modal-body">
                    <p class="integration-modal-description">${config.description}</p>
                    
                    <form class="integration-connection-form" data-platform="${platform}">
                        ${this.generateConnectionFields(platform, config)}
                        
                        <div class="integration-modal-actions">
                            <button type="button" class="btn-secondary" onclick="this.closest('.integration-modal-overlay').remove()">Cancel</button>
                            <button type="submit" class="btn-primary">Connect ${config.name}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    /**
     * Generate connection form fields based on platform requirements
     */
    generateConnectionFields(platform, config) {
        const fields = [];
        
        // Store name field (always included)
        fields.push(`
            <div class="integration-form-group">
                <label class="integration-form-label" for="${platform}-store-name">Store Name</label>
                <input type="text" id="${platform}-store-name" name="store_name" class="integration-form-input" 
                       placeholder="Enter a display name for this store" required>
            </div>
        `);
        
        // Platform-specific required fields
        config.requiredFields.forEach(field => {
            const fieldConfig = this.getFieldConfig(field);
            fields.push(`
                <div class="integration-form-group">
                    <label class="integration-form-label" for="${platform}-${field}">${fieldConfig.label}</label>
                    <input type="${fieldConfig.type}" id="${platform}-${field}" name="${field}" 
                           class="integration-form-input" placeholder="${fieldConfig.placeholder}" required>
                    ${fieldConfig.help ? `<small class="integration-form-help">${fieldConfig.help}</small>` : ''}
                </div>
            `);
        });
        
        // Optional fields (collapsible)
        if (config.optionalFields.length > 0) {
            fields.push(`
                <div class="integration-advanced-section">
                    <button type="button" class="integration-advanced-toggle" onclick="this.nextElementSibling.classList.toggle('show')">
                        Advanced Settings <span class="toggle-icon">▼</span>
                    </button>
                    <div class="integration-advanced-fields">
                        ${config.optionalFields.map(field => {
                            const fieldConfig = this.getFieldConfig(field);
                            return `
                                <div class="integration-form-group">
                                    <label class="integration-form-label" for="${platform}-${field}">${fieldConfig.label}</label>
                                    <input type="${fieldConfig.type}" id="${platform}-${field}" name="${field}" 
                                           class="integration-form-input" placeholder="${fieldConfig.placeholder}">
                                    ${fieldConfig.help ? `<small class="integration-form-help">${fieldConfig.help}</small>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `);
        }
        
        return fields.join('');
    }
    
    /**
     * Get field configuration for form generation
     */
    getFieldConfig(fieldName) {
        const configs = {
            store_url: {
                label: 'Store URL',
                type: 'url',
                placeholder: 'https://your-store.myshopify.com',
                help: 'The full URL of your store'
            },
            access_token: {
                label: 'Access Token',
                type: 'password',
                placeholder: 'Enter your access token',
                help: 'Private app access token from your store admin'
            },
            api_key: {
                label: 'API Key',
                type: 'password',
                placeholder: 'Enter your API key',
                help: 'API key from your store admin panel'
            },
            api_secret: {
                label: 'API Secret',
                type: 'password',
                placeholder: 'Enter your API secret',
                help: 'API secret key for authentication'
            },
            consumer_key: {
                label: 'Consumer Key',
                type: 'text',
                placeholder: 'ck_xxxxxxxxxxxxxxxx',
                help: 'WooCommerce REST API consumer key'
            },
            consumer_secret: {
                label: 'Consumer Secret',
                type: 'password',
                placeholder: 'cs_xxxxxxxxxxxxxxxx',
                help: 'WooCommerce REST API consumer secret'
            },
            store_hash: {
                label: 'Store Hash',
                type: 'text',
                placeholder: 'abc123def',
                help: 'Your BigCommerce store hash'
            },
            webhook_secret: {
                label: 'Webhook Secret',
                type: 'password',
                placeholder: 'Enter webhook secret (optional)',
                help: 'Secret for webhook verification'
            },
            admin_token: {
                label: 'Admin Token',
                type: 'password',
                placeholder: 'Enter admin token (optional)',
                help: 'Admin access token for advanced features'
            },
            client_id: {
                label: 'Client ID',
                type: 'text',
                placeholder: 'Enter client ID (optional)',
                help: 'OAuth client ID for enhanced integration'
            }
        };
        
        return configs[fieldName] || {
            label: fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            type: 'text',
            placeholder: `Enter ${fieldName}`,
            help: ''
        };
    }
    
    /**
     * Handle connection form submission
     */
    async handleConnectionForm(form) {
        const platform = form.dataset.platform;
        const formData = new FormData(form);
        const connectionData = Object.fromEntries(formData.entries());
        
        try {
            // Update UI to show connecting state
            this.connectionStates.set(platform, 'connecting');
            this.updateIntegrationCards();
            
            // Close modal
            form.closest('.integration-modal-overlay').remove();
            
            // Attempt connection
            await this.connectPlatform(platform, connectionData);
            
        } catch (error) {
            console.error(`Failed to connect ${platform}:`, error);
            this.connectionStates.set(platform, 'error');
            this.updateIntegrationCards();
            this.showNotification(`Failed to connect ${this.platforms[platform].name}: ${error.message}`, 'error');
        }
    }
    
    /**
     * Connect to a platform
     */
    async connectPlatform(platform, connectionData) {
        const response = await fetch(`${this.apiEndpoint}/connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify({
                platform,
                ...connectionData
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Store integration data
            this.integrations.set(platform, result);
            this.connectionStates.set(platform, 'connected');
            
            // Update UI
            this.updateIntegrationCards();
            
            // Start initial sync
            await this.triggerSync(platform);
            
            this.showNotification(`Successfully connected ${this.platforms[platform].name}!`, 'success');
            this.emit('platform_connected', { platform, result });
            
        } else {
            throw new Error(result.message || 'Connection failed');
        }
    }
    
    /**
     * Trigger sync for a platform
     */
    async triggerSync(platform) {
        try {
            this.syncStatus.set(platform, 'syncing');
            this.updateSyncIndicators();
            
            const response = await fetch(`${this.apiEndpoint}/${platform}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.syncStatus.set(platform, 'completed');
                this.showNotification(`${this.platforms[platform].name} sync completed successfully!`, 'success');
                this.emit('sync_completed', { platform, result });
            } else {
                throw new Error(result.message || 'Sync failed');
            }
            
        } catch (error) {
            console.error(`Sync failed for ${platform}:`, error);
            this.syncStatus.set(platform, 'error');
            this.showNotification(`Sync failed for ${this.platforms[platform].name}: ${error.message}`, 'error');
        } finally {
            this.updateSyncIndicators();
        }
    }
    
    /**
     * Show configuration modal
     */
    showConfigurationModal(platform) {
        const integration = this.integrations.get(platform);
        if (!integration) return;
        
        const modal = this.createConfigurationModal(platform, integration);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }
    
    /**
     * Create configuration modal
     */
    createConfigurationModal(platform, integration) {
        const platformConfig = this.platforms[platform];
        
        const modal = document.createElement('div');
        modal.className = 'integration-modal-overlay';
        modal.innerHTML = `
            <div class="integration-modal">
                <div class="integration-modal-header">
                    <h3>Configure ${platformConfig.name}</h3>
                    <button class="integration-modal-close" onclick="this.closest('.integration-modal-overlay').remove()">&times;</button>
                </div>
                <div class="integration-modal-body">
                    <div class="integration-config-tabs">
                        <button class="integration-tab-btn active" onclick="this.parentElement.parentElement.querySelector('.integration-sync-settings').style.display='block'; this.parentElement.parentElement.querySelector('.integration-webhook-settings').style.display='none'; this.parentElement.querySelectorAll('.integration-tab-btn').forEach(b => b.classList.remove('active')); this.classList.add('active')">Sync Settings</button>
                        <button class="integration-tab-btn" onclick="this.parentElement.parentElement.querySelector('.integration-sync-settings').style.display='none'; this.parentElement.parentElement.querySelector('.integration-webhook-settings').style.display='block'; this.parentElement.querySelectorAll('.integration-tab-btn').forEach(b => b.classList.remove('active')); this.classList.add('active')">Webhooks</button>
                    </div>
                    
                    <div class="integration-sync-settings">
                        <h4>Synchronization Settings</h4>
                        ${this.generateSyncSettings(platform, platformConfig)}
                    </div>
                    
                    <div class="integration-webhook-settings" style="display: none;">
                        <h4>Webhook Configuration</h4>
                        ${this.generateWebhookSettings(platform, integration)}
                    </div>
                    
                    <div class="integration-modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.integration-modal-overlay').remove()">Cancel</button>
                        <button type="button" class="btn-primary" onclick="storeIntegrationManager.saveConfiguration('${platform}', this.closest('.integration-modal'))">Save Configuration</button>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    /**
     * Generate sync settings UI
     */
    generateSyncSettings(platform, config) {
        return `
            <div class="integration-sync-options">
                <div class="integration-toggle">
                    <div class="integration-toggle-info">
                        <div class="integration-toggle-title">Auto Sync</div>
                        <div class="integration-toggle-description">Automatically sync data every 15 minutes</div>
                    </div>
                    <div class="integration-switch active" data-setting="auto_sync"></div>
                </div>
                
                <div class="integration-toggle">
                    <div class="integration-toggle-info">
                        <div class="integration-toggle-title">Real-time Updates</div>
                        <div class="integration-toggle-description">Push updates in real-time via webhooks</div>
                    </div>
                    <div class="integration-switch" data-setting="realtime_updates"></div>
                </div>
                
                <div class="integration-sync-capabilities">
                    <h5>Sync Capabilities</h5>
                    ${config.syncCapabilities.map(capability => `
                        <div class="integration-toggle">
                            <div class="integration-toggle-info">
                                <div class="integration-toggle-title">${capability.charAt(0).toUpperCase() + capability.slice(1)}</div>
                                <div class="integration-toggle-description">Sync ${capability} data</div>
                            </div>
                            <div class="integration-switch active" data-setting="sync_${capability}"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    /**
     * Generate webhook settings UI
     */
    generateWebhookSettings(platform, integration) {
        return `
            <div class="integration-webhook-info">
                <p>Configure webhooks to receive real-time updates from ${this.platforms[platform].name}.</p>
                
                <div class="integration-form-group">
                    <label class="integration-form-label">Webhook URL</label>
                    <input type="url" class="integration-form-input" value="${window.location.origin}/api/webhooks/${platform}" readonly>
                    <small class="integration-form-help">Use this URL in your ${this.platforms[platform].name} webhook settings</small>
                </div>
                
                <div class="integration-webhook-events">
                    <h5>Webhook Events</h5>
                    <div class="integration-toggle">
                        <div class="integration-toggle-info">
                            <div class="integration-toggle-title">Order Created</div>
                            <div class="integration-toggle-description">Receive notifications when new orders are created</div>
                        </div>
                        <div class="integration-switch active" data-webhook="order_created"></div>
                    </div>
                    
                    <div class="integration-toggle">
                        <div class="integration-toggle-info">
                            <div class="integration-toggle-title">Product Updated</div>
                            <div class="integration-toggle-description">Receive notifications when products are updated</div>
                        </div>
                        <div class="integration-switch active" data-webhook="product_updated"></div>
                    </div>
                    
                    <div class="integration-toggle">
                        <div class="integration-toggle-info">
                            <div class="integration-toggle-title">Inventory Changed</div>
                            <div class="integration-toggle-description">Receive notifications when inventory levels change</div>
                        </div>
                        <div class="integration-switch" data-webhook="inventory_changed"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Save configuration settings
     */
    async saveConfiguration(platform, modal) {
        try {
            const settings = this.extractConfigurationSettings(modal);
            
            const response = await fetch(`${this.apiEndpoint}/${platform}/configure`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(settings)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showNotification(`${this.platforms[platform].name} configuration saved successfully!`, 'success');
                modal.remove();
                this.emit('configuration_saved', { platform, settings });
            } else {
                throw new Error(result.message || 'Configuration save failed');
            }
            
        } catch (error) {
            console.error(`Failed to save configuration for ${platform}:`, error);
            this.showNotification(`Failed to save configuration: ${error.message}`, 'error');
        }
    }
    
    /**
     * Extract configuration settings from modal
     */
    extractConfigurationSettings(modal) {
        const settings = {};
        
        // Extract toggle settings
        modal.querySelectorAll('.integration-switch').forEach(toggle => {
            const setting = toggle.dataset.setting || toggle.dataset.webhook;
            if (setting) {
                settings[setting] = toggle.classList.contains('active');
            }
        });
        
        return settings;
    }
    
    /**
     * Show disconnection confirmation modal
     */
    showDisconnectionModal(platform) {
        const platformConfig = this.platforms[platform];
        
        const modal = document.createElement('div');
        modal.className = 'integration-modal-overlay';
        modal.innerHTML = `
            <div class="integration-modal integration-modal-small">
                <div class="integration-modal-header">
                    <h3>Disconnect ${platformConfig.name}</h3>
                    <button class="integration-modal-close" onclick="this.closest('.integration-modal-overlay').remove()">&times;</button>
                </div>
                <div class="integration-modal-body">
                    <p>Are you sure you want to disconnect ${platformConfig.name}?</p>
                    <p class="integration-warning">This will stop all data synchronization and remove the integration.</p>
                    
                    <div class="integration-modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.integration-modal-overlay').remove()">Cancel</button>
                        <button type="button" class="btn-danger" onclick="storeIntegrationManager.disconnectPlatform('${platform}'); this.closest('.integration-modal-overlay').remove()">Disconnect</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }
    
    /**
     * Disconnect from a platform
     */
    async disconnectPlatform(platform) {
        try {
            const response = await fetch(`${this.apiEndpoint}/${platform}/disconnect`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Remove integration data
                this.integrations.delete(platform);
                this.connectionStates.set(platform, 'disconnected');
                this.syncStatus.delete(platform);
                
                // Update UI
                this.updateIntegrationCards();
                
                this.showNotification(`${this.platforms[platform].name} disconnected successfully!`, 'success');
                this.emit('platform_disconnected', { platform });
                
            } else {
                throw new Error(result.message || 'Disconnection failed');
            }
            
        } catch (error) {
            console.error(`Failed to disconnect ${platform}:`, error);
            this.showNotification(`Failed to disconnect ${this.platforms[platform].name}: ${error.message}`, 'error');
        }
    }
    
    /**
     * Create sync status indicator
     */
    createSyncStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'integration-sync-indicator';
        indicator.className = 'integration-sync-indicator';
        indicator.innerHTML = `
            <div class="sync-indicator-content">
                <div class="sync-indicator-icon">⟳</div>
                <div class="sync-indicator-text">All integrations synced</div>
            </div>
        `;
        
        // Add to integrations section
        const integrationsSection = document.getElementById('integrations-section');
        if (integrationsSection) {
            integrationsSection.appendChild(indicator);
        }
    }
    
    /**
     * Update sync indicators
     */
    updateSyncIndicators() {
        const indicator = document.getElementById('integration-sync-indicator');
        if (!indicator) return;
        
        const syncingPlatforms = Array.from(this.syncStatus.entries())
            .filter(([platform, status]) => status === 'syncing')
            .map(([platform]) => platform);
        
        if (syncingPlatforms.length > 0) {
            indicator.className = 'integration-sync-indicator syncing';
            indicator.querySelector('.sync-indicator-text').textContent = 
                `Syncing ${syncingPlatforms.map(p => this.platforms[p].name).join(', ')}...`;
        } else {
            indicator.className = 'integration-sync-indicator';
            indicator.querySelector('.sync-indicator-text').textContent = 'All integrations synced';
        }
    }
    
    /**
     * Start sync monitoring
     */
    startSyncMonitoring() {
        // Monitor sync status every 30 seconds
        this.syncInterval = setInterval(() => {
            this.checkSyncStatus();
        }, 30000);
    }
    
    /**
     * Check sync status for all connected platforms
     */
    async checkSyncStatus() {
        const connectedPlatforms = Array.from(this.connectionStates.entries())
            .filter(([platform, status]) => status === 'connected')
            .map(([platform]) => platform);
        
        for (const platform of connectedPlatforms) {
            try {
                const response = await fetch(`${this.apiEndpoint}/${platform}/status`, {
                    headers: {
                        'Authorization': `Bearer ${this.getAuthToken()}`
                    }
                });
                
                if (response.ok) {
                    const status = await response.json();
                    this.updatePlatformStatus(platform, status);
                }
            } catch (error) {
                console.error(`Failed to check status for ${platform}:`, error);
            }
        }
    }
    
    /**
     * Update platform status
     */
    updatePlatformStatus(platform, status) {
        if (status.sync_status) {
            this.syncStatus.set(platform, status.sync_status);
        }
        
        if (status.connection_status) {
            this.connectionStates.set(platform, status.connection_status);
        }
        
        this.updateIntegrationCards();
        this.updateSyncIndicators();
    }
    
    /**
     * Update sync status for a specific platform card
     */
    updateSyncStatus(platform, card) {
        const syncStatus = this.syncStatus.get(platform);
        if (!syncStatus) return;
        
        let syncIndicator = card.querySelector('.integration-sync-status');
        if (!syncIndicator) {
            syncIndicator = document.createElement('div');
            syncIndicator.className = 'integration-sync-status';
            card.querySelector('.integration-card-header').appendChild(syncIndicator);
        }
        
        const statusText = {
            syncing: 'Syncing...',
            completed: 'Last sync: Just now',
            error: 'Sync failed',
            idle: 'Ready to sync'
        };
        
        syncIndicator.textContent = statusText[syncStatus] || '';
        syncIndicator.className = `integration-sync-status ${syncStatus}`;
    }
    
    /**
     * Create integration modals container
     */
    createIntegrationModals() {
        // Add modal styles if not already present
        if (!document.getElementById('integration-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'integration-modal-styles';
            styles.textContent = this.getModalStyles();
            document.head.appendChild(styles);
        }
    }
    
    /**
     * Get modal styles
     */
    getModalStyles() {
        return `
            .integration-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .integration-modal-overlay.show {
                opacity: 1;
            }
            
            .integration-modal {
                background: var(--varai-background);
                border-radius: 12px;
                box-shadow: var(--varai-shadow-lg);
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                transform: translateY(-20px);
                transition: transform 0.3s ease;
            }
            
            .integration-modal-overlay.show .integration-modal {
                transform: translateY(0);
            }
            
            .integration-modal-small {
                max-width: 400px;
            }
            
            .integration-modal-header {
                padding: 1.5rem;
                border-bottom: 1px solid var(--varai-border);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .integration-modal-header h3 {
                margin: 0;
                color: var(--varai-foreground);
            }
            
            .integration-modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--varai-gray-600);
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: var(--varai-transition);
            }
            
            .integration-modal-close:hover {
                background: var(--varai-gray-100);
            }
            
            .integration-modal-body {
                padding: 1.5rem;
            }
            
            .integration-modal-description {
                color: var(--varai-gray-600);
                margin-bottom: 1.5rem;
            }
            
            .integration-form-group {
                margin-bottom: 1rem;
            }
            
            .integration-form-label {
                display: block;
                font-weight: 500;
                color: var(--varai-foreground);
                margin-bottom: 0.5rem;
            }
            
            .integration-form-input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid var(--varai-border);
                border-radius: 8px;
                font-size: 1rem;
                transition: var(--varai-transition);
                background: var(--varai-background);
                color: var(--varai-foreground);
            }
            
            .integration-form-input:focus {
                outline: none;
                border-color: var(--varai-accent);
                box-shadow: 0 0 0 3px rgba(30, 150, 252, 0.1);
            }
            
            .integration-form-help {
                display: block;
                font-size: 0.8rem;
                color: var(--varai-gray-600);
                margin-top: 0.25rem;
            }
            
            .integration-advanced-section {
                margin-top: 1.5rem;
                border-top: 1px solid var(--varai-border);
                padding-top: 1.5rem;
            }
            
            .integration-advanced-toggle {
                background: none;
                border: none;
                color: var(--varai-accent);
                cursor: pointer;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .integration-advanced-fields {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
            }
            
            .integration-advanced-fields.show {
                max-height: 500px;
                margin-top: 1rem;
            }
            
            .integration-modal-actions {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid var(--varai-border);
            }
            
            .integration-warning {
                color: var(--varai-error);
                font-size: 0.9rem;
                margin-bottom: 1rem;
            }
            
            .integration-config-tabs {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
                border-bottom: 1px solid var(--varai-border);
            }
            
            .integration-tab-btn {
                background: none;
                border: none;
                padding: 0.75rem 1rem;
                cursor: pointer;
                color: var(--varai-gray-600);
                border-bottom: 2px solid transparent;
                transition: var(--varai-transition);
            }
            
            .integration-tab-btn.active {
                color: var(--varai-accent);
                border-bottom-color: var(--varai-accent);
            }
            
            .integration-sync-indicator {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                background: var(--varai-background);
                border: 1px solid var(--varai-border);
                border-radius: 8px;
                padding: 1rem;
                box-shadow: var(--varai-shadow-md);
                z-index: 100;
                transition: var(--varai-transition);
            }
            
            .integration-sync-indicator.syncing {
                border-color: var(--varai-accent);
            }
            
            .sync-indicator-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .sync-indicator-icon {
                font-size: 1.2rem;
                animation: spin 2s linear infinite;
            }
            
            .integration-sync-indicator.syncing .sync-indicator-icon {
                color: var(--varai-accent);
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification if it doesn't exist
        let notification = document.getElementById('integration-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'integration-notification';
            notification.className = 'integration-notification';
            document.body.appendChild(notification);
        }
        
        notification.className = `integration-notification ${type} show`;
        notification.textContent = message;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }
    
    /**
     * Get authentication token
     */
    getAuthToken() {
        // In a real implementation, this would get the token from localStorage or a secure store
        return localStorage.getItem('auth_token') || 'demo_token';
    }
    
    /**
     * Event system for integration management
     */
    on(eventName, callback) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(callback);
    }
    
    emit(eventName, data) {
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventName}:`, error);
                }
            });
        }
    }
    
    /**
     * Cleanup resources
     */
    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        // Remove event listeners
        this.eventListeners = {};
        
        // Remove UI elements
        const indicator = document.getElementById('integration-sync-indicator');
        if (indicator) {
            indicator.remove();
        }
        
        const notification = document.getElementById('integration-notification');
        if (notification) {
            notification.remove();
        }
        
        console.log('Store Integration Manager destroyed');
    }
}

// Initialize the Store Integration Manager when DOM is loaded
let storeIntegrationManager;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('integrations-section')) {
        storeIntegrationManager = new StoreIntegrationManager();
        
        // Make it globally available for modal interactions
        window.storeIntegrationManager = storeIntegrationManager;
        
        console.log('🔌 Store Integration Manager loaded and ready');
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoreIntegrationManager;
}