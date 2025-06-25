/**
 * Advanced Store Locator System
 * SPARC Implementation - Store Locator Agent Deliverable
 * GPS-based store finding with advanced filtering and mapping
 */

class StoreLocator {
    constructor() {
        this.userLocation = null;
        this.stores = [];
        this.selectedStore = null;
        this.map = null;
        this.markers = [];
        this.searchRadius = 25; // miles
        this.filters = {
            services: [],
            bopisEnabled: null,
            openNow: false
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeGeolocation();
        this.loadStoredPreferences();
    }

    bindEvents() {
        // Search form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'store-search-form') {
                e.preventDefault();
                this.handleSearch();
            }
        });

        // Location-based search
        document.addEventListener('click', (e) => {
            if (e.target.id === 'find-nearby-stores') {
                this.findNearbyStores();
            }
        });

        // Filter changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('store-filter')) {
                this.updateFilters();
                this.applyFilters();
            }
        });

        // Store selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-store-btn')) {
                const storeId = e.target.dataset.storeId;
                this.selectStore(storeId);
            }
        });

        // Map marker clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('store-marker')) {
                const storeId = e.target.dataset.storeId;
                this.showStoreDetails(storeId);
            }
        });

        // Get directions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('get-directions-btn')) {
                const storeId = e.target.dataset.storeId;
                this.getDirections(storeId);
            }
        });
    }

    async initializeGeolocation() {
        try {
            if (navigator.geolocation) {
                const position = await this.getCurrentPosition();
                this.userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                
                this.updateLocationDisplay();
                this.findNearbyStores();
            } else {
                this.showLocationError('Geolocation is not supported by this browser.');
                this.loadDefaultStores();
            }
        } catch (error) {
            console.warn('Geolocation error:', error);
            this.showLocationError('Unable to get your location. Showing all stores.');
            this.loadDefaultStores();
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    loadStoredPreferences() {
        const stored = localStorage.getItem('store_locator_preferences');
        if (stored) {
            const preferences = JSON.parse(stored);
            this.searchRadius = preferences.searchRadius || 25;
            this.filters = { ...this.filters, ...preferences.filters };
            this.updateFilterUI();
        }
    }

    savePreferences() {
        localStorage.setItem('store_locator_preferences', JSON.stringify({
            searchRadius: this.searchRadius,
            filters: this.filters
        }));
    }

    async handleSearch() {
        const searchInput = document.getElementById('store-search-input');
        const query = searchInput?.value?.trim();

        if (!query) {
            this.showError('Please enter a search term.');
            return;
        }

        try {
            this.showLoading('Searching stores...');
            
            const response = await fetch(`/api/v1/stores/search?q=${encodeURIComponent(query)}&limit=20${this.buildFilterParams()}`);
            
            if (!response.ok) {
                throw new Error('Search failed');
            }

            const stores = await response.json();
            this.displayStores(stores);
            this.hideLoading();

        } catch (error) {
            this.hideLoading();
            console.error('Search error:', error);
            this.showError('Failed to search stores. Please try again.');
        }
    }

    async findNearbyStores() {
        if (!this.userLocation) {
            this.showError('Location not available. Please enable location services or search manually.');
            return;
        }

        try {
            this.showLoading('Finding nearby stores...');

            const params = new URLSearchParams({
                lat: this.userLocation.latitude.toString(),
                lng: this.userLocation.longitude.toString(),
                radius: this.searchRadius.toString(),
                limit: '20'
            });

            // Add filters
            const filterParams = this.buildFilterParams();
            if (filterParams) {
                params.append('filters', filterParams);
            }

            const response = await fetch(`/api/v1/stores/nearby?${params}`);
            
            if (!response.ok) {
                throw new Error('Failed to find nearby stores');
            }

            const stores = await response.json();
            this.stores = stores;
            this.displayStores(stores);
            this.initializeMap(stores);
            this.hideLoading();

        } catch (error) {
            this.hideLoading();
            console.error('Nearby search error:', error);
            this.showError('Failed to find nearby stores. Please try again.');
        }
    }

    buildFilterParams() {
        const params = new URLSearchParams();
        
        if (this.filters.services.length > 0) {
            this.filters.services.forEach(service => {
                params.append('services', service);
            });
        }
        
        if (this.filters.bopisEnabled !== null) {
            params.append('bopis_enabled', this.filters.bopisEnabled.toString());
        }
        
        if (this.filters.openNow) {
            params.append('open_now', 'true');
        }

        return params.toString();
    }

    updateFilters() {
        // Service filters
        const serviceCheckboxes = document.querySelectorAll('input[name="services"]:checked');
        this.filters.services = Array.from(serviceCheckboxes).map(cb => cb.value);

        // BOPIS filter
        const bopisFilter = document.querySelector('input[name="bopis_enabled"]:checked');
        this.filters.bopisEnabled = bopisFilter ? bopisFilter.value === 'true' : null;

        // Open now filter
        const openNowFilter = document.getElementById('open-now-filter');
        this.filters.openNow = openNowFilter ? openNowFilter.checked : false;

        this.savePreferences();
    }

    applyFilters() {
        if (this.stores.length > 0) {
            const filteredStores = this.filterStores(this.stores);
            this.displayStores(filteredStores);
            this.updateMapMarkers(filteredStores);
        }
    }

    filterStores(stores) {
        return stores.filter(store => {
            // Service filter
            if (this.filters.services.length > 0) {
                const hasRequiredServices = this.filters.services.every(service => 
                    store.services_offered && store.services_offered.includes(service)
                );
                if (!hasRequiredServices) return false;
            }

            // BOPIS filter
            if (this.filters.bopisEnabled !== null) {
                if (store.bopis_enabled !== this.filters.bopisEnabled) return false;
            }

            // Open now filter (simplified - would need more complex logic for real implementation)
            if (this.filters.openNow) {
                // This would require checking current time against store hours
                // For now, just return true
            }

            return true;
        });
    }

    displayStores(stores) {
        const container = document.getElementById('store-results');
        if (!container) return;

        if (stores.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h4>No stores found</h4>
                    <p>Try adjusting your search criteria or expanding your search radius.</p>
                    <button class="btn btn-primary" onclick="storeLocator.expandSearch()">
                        Expand Search Area
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="results-header">
                <h4>Found ${stores.length} store${stores.length !== 1 ? 's' : ''}</h4>
                ${this.userLocation ? '<p>Sorted by distance from your location</p>' : ''}
            </div>
            <div class="store-list">
                ${stores.map(store => this.renderStoreCard(store)).join('')}
            </div>
        `;
    }

    renderStoreCard(store) {
        const distance = store.distance ? `${store.distance} miles away` : '';
        const services = store.services_offered ? 
            store.services_offered.map(service => 
                `<span class="service-tag">${service.replace('_', ' ')}</span>`
            ).join('') : '';

        const hours = this.getTodayHours(store.operating_hours);
        const isOpen = this.isStoreOpen(store);

        return `
            <div class="store-card" data-store-id="${store.id}">
                <div class="store-header">
                    <h5 class="store-name">${store.name}</h5>
                    <div class="store-status">
                        <span class="status-indicator ${isOpen ? 'open' : 'closed'}">
                            ${isOpen ? 'Open' : 'Closed'}
                        </span>
                        ${store.bopis_enabled ? '<span class="bopis-badge">BOPIS Available</span>' : ''}
                    </div>
                </div>
                
                <div class="store-info">
                    <div class="store-address">
                        <i class="icon-location"></i>
                        <div>
                            ${store.address_line1}<br>
                            ${store.city}, ${store.state} ${store.postal_code}
                            ${distance ? `<br><small class="distance">${distance}</small>` : ''}
                        </div>
                    </div>
                    
                    ${store.phone ? `
                        <div class="store-contact">
                            <i class="icon-phone"></i>
                            <a href="tel:${store.phone}">${store.phone}</a>
                        </div>
                    ` : ''}
                    
                    <div class="store-hours">
                        <i class="icon-clock"></i>
                        <span>Today: ${hours}</span>
                    </div>
                    
                    ${services ? `
                        <div class="store-services">
                            <i class="icon-services"></i>
                            <div class="services-list">${services}</div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="store-actions">
                    <button class="btn btn-outline-primary get-directions-btn" data-store-id="${store.id}">
                        <i class="icon-directions"></i> Directions
                    </button>
                    <button class="btn btn-outline-secondary" onclick="storeLocator.showStoreDetails('${store.id}')">
                        <i class="icon-info"></i> Details
                    </button>
                    ${store.bopis_enabled ? `
                        <button class="btn btn-primary select-store-btn" data-store-id="${store.id}">
                            <i class="icon-pickup"></i> Select for Pickup
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getTodayHours(operatingHours) {
        if (!operatingHours) return 'Hours not available';
        
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        return operatingHours[today] || 'Closed';
    }

    isStoreOpen(store) {
        // Simplified open/closed logic
        // In a real implementation, this would check current time against store hours
        const hours = this.getTodayHours(store.operating_hours);
        return hours && hours.toLowerCase() !== 'closed';
    }

    async initializeMap(stores) {
        const mapContainer = document.getElementById('store-map');
        if (!mapContainer) return;

        try {
            // Initialize map (using a generic map library interface)
            if (typeof window.initMap === 'function') {
                this.map = await window.initMap(mapContainer, {
                    center: this.userLocation || { latitude: 40.7128, longitude: -74.0060 },
                    zoom: 12
                });

                this.addMapMarkers(stores);
            } else {
                // Fallback to static map or hide map container
                mapContainer.innerHTML = `
                    <div class="map-placeholder">
                        <p>Interactive map not available</p>
                        <p>Use the store list above to find locations</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Map initialization error:', error);
            mapContainer.innerHTML = `
                <div class="map-error">
                    <p>Unable to load map</p>
                </div>
            `;
        }
    }

    addMapMarkers(stores) {
        if (!this.map) return;

        // Clear existing markers
        this.clearMapMarkers();

        // Add user location marker
        if (this.userLocation) {
            this.addMarker({
                position: this.userLocation,
                title: 'Your Location',
                icon: 'user-location',
                type: 'user'
            });
        }

        // Add store markers
        stores.forEach(store => {
            if (store.latitude && store.longitude) {
                this.addMarker({
                    position: { latitude: store.latitude, longitude: store.longitude },
                    title: store.name,
                    store: store,
                    icon: store.bopis_enabled ? 'store-bopis' : 'store',
                    type: 'store'
                });
            }
        });
    }

    addMarker(markerData) {
        if (!this.map) return;

        // This would use the actual map library's marker creation method
        const marker = {
            id: `marker-${Date.now()}-${Math.random()}`,
            position: markerData.position,
            title: markerData.title,
            data: markerData
        };

        this.markers.push(marker);

        // Add click handler for store markers
        if (markerData.type === 'store') {
            marker.onClick = () => {
                this.showStoreDetails(markerData.store.id);
            };
        }
    }

    clearMapMarkers() {
        this.markers.forEach(marker => {
            // Remove marker from map
            if (marker.remove) {
                marker.remove();
            }
        });
        this.markers = [];
    }

    updateMapMarkers(stores) {
        if (this.map) {
            this.addMapMarkers(stores);
        }
    }

    async showStoreDetails(storeId) {
        try {
            const response = await fetch(`/api/v1/stores/${storeId}`);
            if (!response.ok) {
                throw new Error('Failed to load store details');
            }

            const store = await response.json();
            this.displayStoreDetailsModal(store);

        } catch (error) {
            console.error('Error loading store details:', error);
            this.showError('Failed to load store details.');
        }
    }

    displayStoreDetailsModal(store) {
        const modal = document.createElement('div');
        modal.className = 'store-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${store.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="store-details-content">
                        <div class="detail-section">
                            <h4>Address</h4>
                            <p>
                                ${store.address_line1}<br>
                                ${store.address_line2 ? store.address_line2 + '<br>' : ''}
                                ${store.city}, ${store.state} ${store.postal_code}
                            </p>
                        </div>
                        
                        ${store.phone ? `
                            <div class="detail-section">
                                <h4>Phone</h4>
                                <p><a href="tel:${store.phone}">${store.phone}</a></p>
                            </div>
                        ` : ''}
                        
                        ${store.operating_hours ? `
                            <div class="detail-section">
                                <h4>Hours</h4>
                                <div class="hours-list">
                                    ${this.renderOperatingHours(store.operating_hours)}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${store.services_offered ? `
                            <div class="detail-section">
                                <h4>Services</h4>
                                <div class="services-grid">
                                    ${store.services_offered.map(service => 
                                        `<span class="service-item">${service.replace('_', ' ')}</span>`
                                    ).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${store.store_manager ? `
                            <div class="detail-section">
                                <h4>Store Manager</h4>
                                <p>${store.store_manager}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-outline-primary get-directions-btn" data-store-id="${store.id}">
                        Get Directions
                    </button>
                    ${store.bopis_enabled ? `
                        <button class="btn btn-primary select-store-btn" data-store-id="${store.id}">
                            Select for Pickup
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    renderOperatingHours(hours) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        return days.map((day, index) => {
            const dayHours = hours[day] || 'Closed';
            const isToday = new Date().getDay() === (index + 1) % 7;
            
            return `
                <div class="hours-row ${isToday ? 'today' : ''}">
                    <span class="day">${dayNames[index]}</span>
                    <span class="hours">${dayHours}</span>
                </div>
            `;
        }).join('');
    }

    async selectStore(storeId) {
        try {
            const store = this.stores.find(s => s.id === storeId);
            if (!store) {
                throw new Error('Store not found');
            }

            this.selectedStore = store;
            
            // Notify other components (like BOPIS)
            if (window.cartBOPIS) {
                await window.cartBOPIS.setSelectedStore(store);
            }

            // Update UI
            this.updateSelectedStoreDisplay();
            this.showSuccess(`Selected ${store.name} for pickup`);

            // Close any open modals
            const modals = document.querySelectorAll('.store-details-modal');
            modals.forEach(modal => modal.remove());

        } catch (error) {
            console.error('Error selecting store:', error);
            this.showError('Failed to select store. Please try again.');
        }
    }

    updateSelectedStoreDisplay() {
        const displays = document.querySelectorAll('.selected-store-display');
        displays.forEach(display => {
            if (this.selectedStore) {
                display.innerHTML = `
                    <div class="selected-store-info">
                        <h5>Selected Store</h5>
                        <p><strong>${this.selectedStore.name}</strong></p>
                        <p>${this.selectedStore.address_line1}, ${this.selectedStore.city}</p>
                        <button class="btn btn-link btn-sm" onclick="storeLocator.clearSelection()">
                            Change Store
                        </button>
                    </div>
                `;
            } else {
                display.innerHTML = '';
            }
        });
    }

    clearSelection() {
        this.selectedStore = null;
        this.updateSelectedStoreDisplay();
        
        if (window.cartBOPIS) {
            window.cartBOPIS.setSelectedStore(null);
        }
    }

    getDirections(storeId) {
        const store = this.stores.find(s => s.id === storeId);
        if (!store || !store.latitude || !store.longitude) {
            this.showError('Store location not available for directions.');
            return;
        }

        const destination = `${store.latitude},${store.longitude}`;
        const origin = this.userLocation ? 
            `${this.userLocation.latitude},${this.userLocation.longitude}` : 
            '';

        // Open directions in default map app
        const directionsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
        window.open(directionsUrl, '_blank');
    }

    expandSearch() {
        this.searchRadius = Math.min(this.searchRadius * 2, 100);
        this.savePreferences();
        this.findNearbyStores();
    }

    updateLocationDisplay() {
        const displays = document.querySelectorAll('.user-location-display');
        displays.forEach(display => {
            if (this.userLocation) {
                display.innerHTML = `
                    <div class="location-info">
                        <i class="icon-location"></i>
                        <span>Using your current location</span>
                        <button class="btn btn-link btn-sm" onclick="storeLocator.updateLocation()">
                            Update Location
                        </button>
                    </div>
                `;
            }
        });
    }

    async updateLocation() {
        try {
            this.showLoading('Updating location...');
            await this.initializeGeolocation();
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to update location.');
        }
    }

    updateFilterUI() {
        // Update service checkboxes
        this.filters.services.forEach(service => {
            const checkbox = document.querySelector(`input[name="services"][value="${service}"]`);
            if (checkbox) checkbox.checked = true;
        });

        // Update BOPIS filter
        if (this.filters.bopisEnabled !== null) {
            const radio = document.querySelector(`input[name="bopis_enabled"][value="${this.filters.bopisEnabled}"]`);
            if (radio) radio.checked = true;
        }

        // Update open now filter
        const openNowFilter = document.getElementById('open-now-filter');
        if (openNowFilter) openNowFilter.checked = this.filters.openNow;
    }

    async loadDefaultStores() {
        try {
            this.showLoading('Loading stores...');
            
            const response = await fetch('/api/v1/stores?active=true&limit=20');
            if (!response.ok) {
                throw new Error('Failed to load stores');
            }

            const stores = await response.json();
            this.stores = stores;
            this.displayStores(stores);
            this.hideLoading();

        } catch (error) {
            this.hideLoading();
            console.error('Error loading default stores:', error);
            this.showError('Failed to load stores.');
        }
    }

    // Utility methods
    showLoading(message) {
        const loader = document.getElementById('store-locator-loader') || this.createLoader();
        loader.querySelector('.loading-message').textContent = message;
        loader.style.display = 'flex';
    }

    hideLoading() {
        const loader = document.getElementById('store-locator-loader');
        if (loader) loader.style.display = 'none';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showLocationError(message) {
        const locationError = document.getElementById('location-error');
        if (locationError) {
            locationError.textContent = message;
            locationError.style.display = 'block';
        } else {
            this.showError(message);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `store-locator-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    createLoader() {
        const loader = document.createElement('div');
        loader.id = 'store-locator-loader';
        loader.className = 'store-locator-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner"></div>
                <div class="loading-message">Loading...</div>
            </div>
        `;
        document.body.appendChild(loader);
        return loader;
    }
}

// Initialize store locator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.storeLocator = new StoreLocator();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StoreLocator;
}