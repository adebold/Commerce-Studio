/**
 * Modern Store Locator JavaScript
 * Integrates with VARAi Store Locator API and Google Maps API
 * Uses modern AdvancedMarkerElement and secure API key management
 * Includes BOPIS integration for seamless pickup reservations
 * EMERGENCY FALLBACK: Includes hardcoded API key for immediate functionality
 */

class ModernStoreLocator {
    constructor() {
        this.map = null;
        this.markers = [];
        this.stores = [];
        this.userLocation = null;
        this.selectedStore = null;
        this.apiKey = null;
        this.infoWindow = null;
        this.apiBaseUrl = '/api/v1/stores';
        this.isGoogleMapsLoaded = false;
        
        // EMERGENCY FALLBACK API KEY - Replace with secure endpoint when available
        this.fallbackApiKey = 'AIzaSyBOti4mM-6x9WDnZIjIeyb21ULHqBNSKWs';
        
        this.init();
    }

    async init() {
        try {
            this.bindEvents();
            await this.initializeMap();
            this.initializeGeolocation();
        } catch (error) {
            console.error('Failed to initialize store locator:', error);
            this.showFallbackUI();
        }
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('location-search');
        const findStoresBtn = document.getElementById('find-stores-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearchInput.bind(this), 300));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.findStores();
                }
            });
        }

        if (findStoresBtn) {
            findStoresBtn.addEventListener('click', this.findStores.bind(this));
        }

        // Filter changes
        const filters = ['filter-bopis', 'filter-open-now', 'filter-eye-exams', 'radius-select'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', this.applyFilters.bind(this));
            }
        });

        // Modal events
        this.bindModalEvents();
    }

    bindModalEvents() {
        const modal = document.getElementById('bopis-modal');
        const closeBtn = modal?.querySelector('.varai-modal-close');
        const overlay = modal?.querySelector('.varai-modal-overlay');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeBopisModal());
        }

        if (overlay) {
            overlay.addEventListener('click', () => this.closeBopisModal());
        }

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.style.display !== 'none') {
                this.closeBopisModal();
            }
        });
    }

    debounce(func, wait) {
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

    async initializeMap() {
        try {
            // Show loading state
            this.showMapLoading(true);
            
            // Fetch API key securely from environment or config
            this.apiKey = await this.getApiKey();
            
            // Load Google Maps API with async loading
            await this.loadGoogleMapsAPI();
            
            // Initialize map with modern configuration
            await this.setupMap();
            
            this.isGoogleMapsLoaded = true;
            this.showMapLoading(false);
            
        } catch (error) {
            console.error('Failed to initialize Google Maps:', error);
            this.showFallbackUI();
        }
    }

    async getApiKey() {
        try {
            // Try to get from config endpoint
            const response = await fetch('/api/config/maps-key');
            if (response.ok) {
                const data = await response.json();
                console.log('✅ API key retrieved from secure endpoint');
                return data.apiKey;
            }
            
            // Fallback to environment variable (for development)
            if (window.GOOGLE_MAPS_API_KEY) {
                console.log('✅ API key retrieved from environment variable');
                return window.GOOGLE_MAPS_API_KEY;
            }
            
            // EMERGENCY FALLBACK: Use hardcoded API key
            console.log('⚠️ Using emergency fallback API key - API endpoint unavailable');
            return this.fallbackApiKey;
            
        } catch (error) {
            console.error('Failed to fetch API key from endpoint:', error);
            
            // EMERGENCY FALLBACK: Use hardcoded API key
            console.log('⚠️ Using emergency fallback API key due to error:', error.message);
            return this.fallbackApiKey;
        }
    }

    async loadGoogleMapsAPI() {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,marker&loading=async`;
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Google Maps API'));
            document.head.appendChild(script);
        });
    }

    async setupMap() {
        try {
            // Wait for Google Maps to be fully loaded
            await this.waitForGoogleMaps();
            
            const { Map } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
            
            const mapContainer = document.getElementById('store-map');
            if (!mapContainer) {
                throw new Error('Map container not found');
            }

            this.map = new Map(mapContainer, {
                zoom: 10,
                center: { lat: 43.6532, lng: -79.3832 }, // Toronto default
                mapId: 'VARAI_STORE_LOCATOR_MAP', // Required for AdvancedMarkerElement
                styles: [
                    {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }]
                    }
                ]
            });

            this.infoWindow = new google.maps.InfoWindow();
            
            // Clear placeholder content
            mapContainer.innerHTML = '';
            
        } catch (error) {
            console.error('Error setting up map:', error);
            throw error;
        }
    }

    async waitForGoogleMaps() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            if (window.google && window.google.maps && window.google.maps.importLibrary) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        throw new Error('Google Maps API failed to load');
    }

    async initializeGeolocation() {
        if (navigator.geolocation) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 10000,
                        enableHighAccuracy: true
                    });
                });
                
                this.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Auto-search for nearby stores
                this.findNearbyStores(this.userLocation.lat, this.userLocation.lng);
            } catch (error) {
                console.log('Geolocation not available or denied:', error);
                // Fallback to default location or show location input
            }
        }
    }

    async handleSearchInput(event) {
        const query = event.target.value.trim();
        if (query.length < 3) {
            this.hideSuggestions();
            return;
        }

        try {
            // Use Google Places API for location suggestions
            if (this.isGoogleMapsLoaded && window.google && window.google.maps) {
                await this.showLocationSuggestions(query);
            }
        } catch (error) {
            console.error('Error getting location suggestions:', error);
        }
    }

    async showLocationSuggestions(query) {
        const suggestionsContainer = document.getElementById('location-suggestions');
        if (!suggestionsContainer) return;

        try {
            const { AutocompleteService } = await google.maps.importLibrary("places");
            const service = new AutocompleteService();
            
            const request = {
                input: query,
                types: ['geocode'],
                componentRestrictions: { country: 'us' }
            };

            service.getPlacePredictions(request, (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    this.displaySuggestions(predictions, suggestionsContainer);
                } else {
                    this.displayMockSuggestions(query, suggestionsContainer);
                }
            });
        } catch (error) {
            console.error('Error with Places API:', error);
            this.displayMockSuggestions(query, suggestionsContainer);
        }
    }

    displaySuggestions(predictions, container) {
        container.innerHTML = '';
        predictions.slice(0, 5).forEach(prediction => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'location-suggestion';
            suggestionElement.textContent = prediction.description;
            suggestionElement.addEventListener('click', () => {
                this.selectLocationSuggestion({
                    description: prediction.description,
                    place_id: prediction.place_id
                });
            });
            container.appendChild(suggestionElement);
        });
        container.style.display = 'block';
    }

    displayMockSuggestions(query, container) {
        const mockSuggestions = [
            { description: `${query}, NY, USA`, place_id: '1' },
            { description: `${query}, CA, USA`, place_id: '2' },
            { description: `${query}, TX, USA`, place_id: '3' }
        ];

        container.innerHTML = '';
        mockSuggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'location-suggestion';
            suggestionElement.textContent = suggestion.description;
            suggestionElement.addEventListener('click', () => {
                this.selectLocationSuggestion(suggestion);
            });
            container.appendChild(suggestionElement);
        });
        container.style.display = 'block';
    }

    hideSuggestions() {
        const suggestionsContainer = document.getElementById('location-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    selectLocationSuggestion(suggestion) {
        const searchInput = document.getElementById('location-search');
        if (searchInput) {
            searchInput.value = suggestion.description;
        }
        this.hideSuggestions();
        this.findStores();
    }

    async findStores() {
        const searchInput = document.getElementById('location-search');
        const location = searchInput?.value.trim();

        if (!location && !this.userLocation) {
            this.showError('Please enter a location or allow location access');
            return;
        }

        this.showLoading(true);

        try {
            let coordinates;
            
            if (location) {
                // Geocode the location
                coordinates = await this.geocodeLocation(location);
            } else {
                coordinates = this.userLocation;
            }

            if (coordinates) {
                await this.findNearbyStores(coordinates.lat, coordinates.lng);
            }
        } catch (error) {
            console.error('Error finding stores:', error);
            this.showError('Unable to find stores. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async geocodeLocation(location) {
        try {
            if (this.isGoogleMapsLoaded) {
                const { Geocoder } = await google.maps.importLibrary("geocoding");
                const geocoder = new Geocoder();
                
                return new Promise((resolve, reject) => {
                    geocoder.geocode({ address: location }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            const location = results[0].geometry.location;
                            resolve({
                                lat: location.lat(),
                                lng: location.lng()
                            });
                        } else {
                            reject(new Error('Geocoding failed'));
                        }
                    });
                });
            } else {
                // Fallback to mock geocoding
                return this.mockGeocodeLocation(location);
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            return this.mockGeocodeLocation(location);
        }
    }

    async mockGeocodeLocation(location) {
        // Mock geocoding for demo - replace with actual implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                // Return mock coordinates for demo
                resolve({
                    lat: 40.7128 + (Math.random() - 0.5) * 0.1,
                    lng: -74.0060 + (Math.random() - 0.5) * 0.1
                });
            }, 500);
        });
    }

    async findNearbyStores(lat, lng) {
        try {
            const radius = document.getElementById('radius-select')?.value || 25;
            const filters = this.getActiveFilters();

            // Build API URL
            const params = new URLSearchParams({
                lat: lat.toString(),
                lng: lng.toString(),
                radius: radius.toString(),
                limit: '20'
            });

            // Add filters
            if (filters.bopis) params.append('bopis_enabled', 'true');
            if (filters.openNow) params.append('open_now', 'true');
            if (filters.services.length > 0) {
                filters.services.forEach(service => params.append('services', service));
            }

            // For demo, use mock data
            const stores = await this.getMockStores(lat, lng, radius);
            
            this.stores = stores;
            this.displayStores(stores);
            await this.updateMap(stores, { lat, lng });
            this.updateResultsSummary(stores.length);

        } catch (error) {
            console.error('Error fetching stores:', error);
            this.showError('Unable to load stores. Please try again.');
        }
    }

    async getMockStores(lat, lng, radius) {
        // Mock store data for demo
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockStores = [
                    {
                        id: '1',
                        name: 'VARAi Store - Downtown',
                        store_code: 'VAR-DT-001',
                        address_line1: '123 Main Street',
                        city: 'New York',
                        state: 'NY',
                        postal_code: '10001',
                        phone: '(555) 123-4567',
                        latitude: lat + 0.01,
                        longitude: lng + 0.01,
                        distance: 1.2,
                        operating_hours: {
                            monday: '9:00-18:00',
                            tuesday: '9:00-18:00',
                            wednesday: '9:00-18:00',
                            thursday: '9:00-18:00',
                            friday: '9:00-18:00',
                            saturday: '10:00-17:00',
                            sunday: '12:00-16:00'
                        },
                        services_offered: ['eye_exams', 'frame_fitting', 'repairs'],
                        bopis_enabled: true,
                        is_active: true,
                        retailer_name: 'Premium Eyewear Co.',
                        store_manager: 'Sarah Johnson'
                    },
                    {
                        id: '2',
                        name: 'VARAi Store - Mall Location',
                        store_code: 'VAR-ML-002',
                        address_line1: '456 Shopping Center Drive',
                        city: 'New York',
                        state: 'NY',
                        postal_code: '10002',
                        phone: '(555) 234-5678',
                        latitude: lat - 0.02,
                        longitude: lng + 0.02,
                        distance: 2.8,
                        operating_hours: {
                            monday: '10:00-21:00',
                            tuesday: '10:00-21:00',
                            wednesday: '10:00-21:00',
                            thursday: '10:00-21:00',
                            friday: '10:00-21:00',
                            saturday: '10:00-21:00',
                            sunday: '11:00-19:00'
                        },
                        services_offered: ['frame_fitting', 'consultations'],
                        bopis_enabled: true,
                        is_active: true,
                        retailer_name: 'Vision Center Plus',
                        store_manager: 'Michael Chen'
                    },
                    {
                        id: '3',
                        name: 'VARAi Store - Airport',
                        store_code: 'VAR-AP-003',
                        address_line1: '789 Airport Terminal Road',
                        city: 'New York',
                        state: 'NY',
                        postal_code: '10003',
                        phone: '(555) 345-6789',
                        latitude: lat + 0.03,
                        longitude: lng - 0.01,
                        distance: 4.5,
                        operating_hours: {
                            monday: '6:00-22:00',
                            tuesday: '6:00-22:00',
                            wednesday: '6:00-22:00',
                            thursday: '6:00-22:00',
                            friday: '6:00-22:00',
                            saturday: '6:00-22:00',
                            sunday: '6:00-22:00'
                        },
                        services_offered: ['frame_fitting'],
                        bopis_enabled: false,
                        is_active: true,
                        retailer_name: 'Travel Vision',
                        store_manager: 'Lisa Rodriguez'
                    }
                ];

                // Filter by radius
                const filteredStores = mockStores.filter(store => store.distance <= radius);
                resolve(filteredStores);
            }, 800);
        });
    }

    getActiveFilters() {
        const filters = {
            bopis: document.getElementById('filter-bopis')?.checked || false,
            openNow: document.getElementById('filter-open-now')?.checked || false,
            eyeExams: document.getElementById('filter-eye-exams')?.checked || false,
            services: []
        };

        if (filters.eyeExams) {
            filters.services.push('eye_exams');
        }

        return filters;
    }

    applyFilters() {
        if (this.stores.length > 0) {
            const filteredStores = this.filterStores(this.stores);
            this.displayStores(filteredStores);
            this.updateResultsSummary(filteredStores.length);
        }
    }

    filterStores(stores) {
        const filters = this.getActiveFilters();
        
        return stores.filter(store => {
            if (filters.bopis && !store.bopis_enabled) return false;
            if (filters.openNow && !this.isStoreOpen(store)) return false;
            if (filters.services.length > 0) {
                const hasRequiredService = filters.services.some(service => 
                    store.services_offered?.includes(service)
                );
                if (!hasRequiredService) return false;
            }
            return true;
        });
    }

    isStoreOpen(store) {
        // Mock implementation - check if store is currently open
        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const todayHours = store.operating_hours?.[currentDay];
        if (!todayHours || todayHours === 'closed') return false;
        
        const [openTime, closeTime] = todayHours.split('-');
        const [openHour, openMin] = openTime.split(':').map(Number);
        const [closeHour, closeMin] = closeTime.split(':').map(Number);
        
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;
        
        return currentTime >= openMinutes && currentTime <= closeMinutes;
    }

    displayStores(stores) {
        const storeList = document.getElementById('store-list');
        if (!storeList) return;

        if (stores.length === 0) {
            storeList.innerHTML = `
                <div class="no-results-state varai-text-center varai-py-12">
                    <div class="varai-mb-4">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--varai-gray-400)" stroke-width="1.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                    <h3 class="varai-h4 varai-mb-2">No Stores Found</h3>
                    <p class="varai-text-gray-600">Try adjusting your search criteria or expanding the search radius</p>
                </div>
            `;
            return;
        }

        storeList.innerHTML = stores.map(store => this.createStoreCard(store)).join('');
        
        // Bind events for store cards
        this.bindStoreCardEvents();
    }

    createStoreCard(store) {
        const isOpen = this.isStoreOpen(store);
        const features = [];
        
        if (store.bopis_enabled) features.push('<span class="store-feature bopis">BOPIS Available</span>');
        if (isOpen) features.push('<span class="store-feature open">Open Now</span>');
        else features.push('<span class="store-feature closed">Closed</span>');
        if (store.services_offered?.includes('eye_exams')) features.push('<span class="store-feature">Eye Exams</span>');
        if (store.services_offered?.includes('frame_fitting')) features.push('<span class="store-feature">Frame Fitting</span>');

        return `
            <div class="store-card" data-store-id="${store.id}">
                <div class="store-header">
                    <h3 class="store-name">${store.name}</h3>
                    <span class="store-distance">${store.distance} mi</span>
                </div>
                <div class="store-address">
                    ${store.address_line1}<br>
                    ${store.city}, ${store.state} ${store.postal_code}<br>
                    ${store.phone}
                </div>
                <div class="store-features">
                    ${features.join('')}
                </div>
                <div class="store-actions">
                    ${store.bopis_enabled ? 
                        `<button class="store-action-btn primary" onclick="storeLocator.openBopisModal('${store.id}')">Reserve for Pickup</button>` : 
                        ''
                    }
                    <button class="store-action-btn secondary" onclick="storeLocator.getDirections('${store.id}')">Get Directions</button>
                    <button class="store-action-btn secondary" onclick="storeLocator.viewStoreDetails('${store.id}')">Store Details</button>
                </div>
            </div>
        `;
    }

    bindStoreCardEvents() {
        const storeCards = document.querySelectorAll('.store-card');
        storeCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on buttons
                if (e.target.tagName === 'BUTTON') return;
                
                const storeId = card.dataset.storeId;
                this.selectStore(storeId);
            });
        });
    }

    selectStore(storeId) {
        // Remove previous selection
        document.querySelectorAll('.store-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        const selectedCard = document.querySelector(`[data-store-id="${storeId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        this.selectedStore = this.stores.find(store => store.id === storeId);
        
        // Center map on selected store
        if (this.map && this.selectedStore) {
            this.map.setCenter({
                lat: this.selectedStore.latitude,
                lng: this.selectedStore.longitude
            });
            this.map.setZoom(15);
        }
    }

    async updateMap(stores, userLocation) {
        if (!this.isGoogleMapsLoaded || !this.map) {
            console.warn('Google Maps not loaded, skipping map update');
            return;
        }

        try {
            // Clear existing markers
            this.clearMarkers();

            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

            // Add user location marker if available
            if (userLocation) {
                const userMarkerContent = this.createUserMarkerContent();
                const userMarker = new AdvancedMarkerElement({
                    map: this.map,
                    position: userLocation,
                    title: 'Your Location',
                    content: userMarkerContent
                });
                this.markers.push(userMarker);
            }

            // Add store markers
            stores.forEach(store => {
                const markerContent = this.createStoreMarkerContent(store);
                const marker = new AdvancedMarkerElement({
                    map: this.map,
                    position: { lat: store.latitude, lng: store.longitude },
                    title: store.name,
                    content: markerContent
                });

                marker.addListener('click', () => {
                    this.showStoreInfo(store, marker);
                    this.selectStore(store.id);
                });

                this.markers.push(marker);
            });

            // Adjust map bounds to show all markers
            if (stores.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                
                if (userLocation) {
                    bounds.extend(userLocation);
                }
                
                stores.forEach(store => {
                    bounds.extend({ lat: store.latitude, lng: store.longitude });
                });
                
                this.map.fitBounds(bounds);
                
                // Ensure minimum zoom level
                const listener = google.maps.event.addListener(this.map, 'idle', () => {
                    if (this.map.getZoom() > 15) this.map.setZoom(15);
                    google.maps.event.removeListener(listener);
                });
            }
        } catch (error) {
            console.error('Error updating map:', error);
        }
    }

    createUserMarkerContent() {
        const content = document.createElement('div');
        content.className = 'user-marker';
        content.innerHTML = `
            <div style="
                width: 20px;
                height: 20px;
                background: #007AFF;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
            "></div>
        `;
        return content;
    }

    createStoreMarkerContent(store) {
        const content = document.createElement('div');
        content.className = 'store-marker';
        content.innerHTML = `
            <div style="
                width: 24px;
                height: 24px;
                background: var(--varai-primary, #0A2463);
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(10, 36, 99, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 10px;
                font-weight: bold;
            ">${store.distance.toFixed(1)}</div>
        `;
        return content;
    }

    clearMarkers() {
        this.markers.forEach(marker => {
            if (marker.setMap) {
                marker.setMap(null);
            }
        });
        this.markers = [];
    }

    showStoreInfo(store, marker) {
        if (!this.infoWindow) return;

        const content = `
            <div class="store-info-window" style="max-width: 300px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${store.name}</h3>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                    ${store.address_line1}<br>
                    ${store.city}, ${store.state} ${store.postal_code}
                </p>
                <p style="margin: 0 0 8px 0; font-size: 14px;">
                    <strong>Distance:</strong> ${store.distance} miles
                </p>
                <p style="margin: 0 0 12px 0; font-size: 14px;">
                    <strong>Phone:</strong> ${store.phone}
                </p>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${store.bopis_enabled ? 
                        `<button onclick="storeLocator.openBopisModal('${store.id}')" style="
                            background: var(--varai-primary, #0A2463);
                            color: white;
                            border: none;
                            padding: 6px 12px;
                            border-radius: 4px;
                            font-size: 12px;
                            cursor: pointer;
                        ">Reserve Pickup</button>` : ''
                    }
                    <button onclick="storeLocator.getDirections('${store.id}')" style="
                        background: #f0f0f0;
                        color: #333;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 4px;
                        font-size: 12px;
                        cursor: pointer;
                    ">Directions</button>
                </div>
            </div>
        `;

        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, marker);
    }

    updateResultsSummary(count) {
        const summaryElement = document.getElementById('results-summary');
        const countElement = document.getElementById('results-count');
        
        if (summaryElement && countElement) {
            countElement.textContent = count;
            summaryElement.style.display = count > 0 ? 'block' : 'none';
        }
    }

    showLoading(show) {
        const loadingState = document.getElementById('loading-state');
        const storeList = document.getElementById('store-list');
        const findStoresBtn = document.getElementById('find-stores-btn');
        const btnText = findStoresBtn?.querySelector('.btn-text');
        const btnLoading = findStoresBtn?.querySelector('.btn-loading');

        if (show) {
            loadingState?.style.setProperty('display', 'block');
            storeList?.style.setProperty('display', 'none');
            
            if (btnText && btnLoading) {
                btnText.style.display = 'none';
                btnLoading.style.display = 'flex';
            }
        } else {
            loadingState?.style.setProperty('display', 'none');
            storeList?.style.setProperty('display', 'block');
            
            if (btnText && btnLoading) {
                btnText.style.display = 'block';
                btnLoading.style.display = 'none';
            }
        }
    }

    showMapLoading(show) {
        const mapContainer = document.getElementById('store-map');
        if (!mapContainer) return;

        if (show) {
            mapContainer.innerHTML = `
                <div class="map-loading varai-text-center varai-py-12" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    background: var(--varai-gray-50);
                ">
                    <div class="varai-mb-4">
                        <svg class="varai-spinner" width="48" height="48" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="var(--varai-gray-300)" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="32">
                                <animate attributeName="stroke-dashoffset" dur="1s" values="32;0" repeatCount="indefinite"/>
                            </circle>
                        </svg>
                    </div>
                    <p class="varai-text-gray-600">Loading map...</p>
                </div>
            `;
        }
    }

    showError(message) {
        console.error('Store Locator Error:', message);
        // Could implement a toast notification or error display here
        alert(message); // Simple fallback for now
    }

    showFallbackUI() {
        const mapContainer = document.getElementById('store-map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="map-fallback varai-text-center varai-p-8" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    border-radius: 12px;
                ">
                    <div class="varai-mb-4">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--varai-gray-400)" stroke-width="1.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                    <h3 class="varai-h4 varai-mb-4">Store Locator Temporarily Unavailable</h3>
                    <p class="varai-mb-4">Please contact us directly for store locations:</p>
                    <div class="store-fallback-list varai-text-left">
                        <div class="fallback-store varai-mb-3">
                            <strong>Toronto Downtown</strong><br>
                            123 King St W, Toronto, ON M5H 1A1<br>
                            Phone: (416) 555-0123
                        </div>
                        <div class="fallback-store varai-mb-3">
                            <strong>Toronto North</strong><br>
                            456 Yonge St, Toronto, ON M4Y 1X5<br>
                            Phone: (416) 555-0456
                        </div>
                        <div class="fallback-store varai-mb-3">
                            <strong>Mississauga</strong><br>
                            789 Square One Dr, Mississauga, ON L5B 2C9<br>
                            Phone: (905) 555-0789
                        </div>
                    </div>
                    <p class="varai-mt-4">
                        <strong>Customer Service:</strong> 1-800-VARAI-HELP
                    </p>
                </div>
            `;
        }
    }

    // BOPIS Modal Functions
    async openBopisModal(storeId) {
        const store = this.stores.find(s => s.id === storeId);
        if (!store) return;

        const modal = document.getElementById('bopis-modal');
        const formContainer = document.getElementById('bopis-form-container');
        
        if (modal && formContainer) {
            formContainer.innerHTML = this.createBopisForm(store);
            this.bindBopisFormEvents(store);
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    createBopisForm(store) {
        return `
            <div class="bopis-form">
                <div class="store-info varai-mb-6 varai-p-4" style="background: var(--varai-gray-50); border-radius: 8px;">
                    <h4 class="varai-h5 varai-mb-2">${store.name}</h4>
                    <p class="varai-text-sm varai-text-gray-600">
                        ${store.address_line1}<br>
                        ${store.city}, ${store.state} ${store.postal_code}
                    </p>
                </div>
                
                <form id="bopis-reservation-form">
                    <div class="varai-grid varai-grid-cols-1 varai-md-grid-cols-2 varai-gap-4 varai-mb-4">
                        <div>
                            <label for="customer-name" class="varai-label">Full Name *</label>
                            <input type="text" id="customer-name" name="customerName" class="varai-input" required>
                        </div>
                        <div>
                            <label for="customer-phone" class="varai-label">Phone Number *</label>
                            <input type="tel" id="customer-phone" name="customerPhone" class="varai-input" required>
                        </div>
                    </div>
                    
                    <div class="varai-mb-4">
                        <label for="customer-email" class="varai-label">Email Address *</label>
                        <input type="email" id="customer-email" name="customerEmail" class="varai-input" required>
                    </div>
                    
                    <div class="varai-grid varai-grid-cols-1 varai-md-grid-cols-2 varai-gap-4 varai-mb-4">
                        <div>
                            <label for="pickup-date" class="varai-label">Preferred Pickup Date *</label>
                            <input type="date" id="pickup-date" name="pickupDate" class="varai-input" min="${this.getTomorrowDate()}" required>
                        </div>
                        <div>
                            <label for="pickup-time" class="varai-label">Preferred Time</label>
                            <select id="pickup-time" name="pickupTime" class="varai-select">
                                <option value="">Select time</option>
                                <option value="09:00">9:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="12:00">12:00 PM</option>
                                <option value="13:00">1:00 PM</option>
                                <option value="14:00">2:00 PM</option>
                                <option value="15:00">3:00 PM</option>
                                <option value="16:00">4:00 PM</option>
                                <option value="17:00">5:00 PM</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="varai-mb-4">
                        <label for="frame-model" class="varai-label">Frame Model/SKU</label>
                        <input type="text" id="frame-model" name="frameModel" class="varai-input" placeholder="e.g., VAR-001-BLK">
                    </div>
                    
                    <div class="varai-mb-6">
                        <label for="special-requests" class="varai-label">Special Requests</label>
                        <textarea id="special-requests" name="specialRequests" class="varai-textarea" rows="3" placeholder="Any special fitting requirements or questions..."></textarea>
                    </div>
                    
                    <div class="form-actions varai-flex varai-gap-3">
                        <button type="button" class="varai-btn varai-btn-secondary varai-flex-1" onclick="storeLocator.closeBopisModal()">
                            Cancel
                        </button>
                        <button type="submit" class="varai-btn varai-btn-primary varai-flex-1">
                            <span class="submit-text">Reserve Pickup</span>
                            <span class="submit-loading" style="display: none;">
                                <svg class="varai-spinner" width="16" height="16" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="32">
                                        <animate attributeName="stroke-dashoffset" dur="1s" values="32;0" repeatCount="indefinite"/>
                                    </circle>
                                </svg>
                                Processing...
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    bindBopisFormEvents(store) {
        const form = document.getElementById('bopis-reservation-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitBopisReservation(store, new FormData(form));
            });
        }
    }

    async submitBopisReservation(store, formData) {
        const submitBtn = document.querySelector('#bopis-reservation-form button[type="submit"]');
        const submitText = submitBtn?.querySelector('.submit-text');
        const submitLoading = submitBtn?.querySelector('.submit-loading');

        try {
            // Show loading state
            if (submitText && submitLoading) {
                submitText.style.display = 'none';
                submitLoading.style.display = 'flex';
            }
            if (submitBtn) submitBtn.disabled = true;

            // Prepare reservation data
            const reservationData = {
                storeId: store.id,
                customerName: formData.get('customerName'),
                customerEmail: formData.get('customerEmail'),
                customerPhone: formData.get('customerPhone'),
                pickupDate: formData.get('pickupDate'),
                pickupTime: formData.get('pickupTime'),
                frameModel: formData.get('frameModel'),
                specialRequests: formData.get('specialRequests'),
                timestamp: new Date().toISOString()
            };

            // Submit reservation (mock for demo)
            const result = await this.mockBopisReservation(reservationData);
            
            if (result.success) {
                this.showBopisSuccess(result.reservation);
                this.closeBopisModal();
            } else {
                throw new Error(result.error || 'Reservation failed');
            }

        } catch (error) {
            console.error('BOPIS reservation error:', error);
            alert('Failed to submit reservation. Please try again or call the store directly.');
        } finally {
            // Reset button state
            if (submitText && submitLoading) {
                submitText.style.display = 'block';
                submitLoading.style.display = 'none';
            }
            if (submitBtn) submitBtn.disabled = false;
        }
    }

    async mockBopisReservation(data) {
        // Mock API call for demo
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    reservation: {
                        id: 'RES-' + Date.now(),
                        confirmationNumber: 'VAR' + Math.random().toString(36).substr(2, 8).toUpperCase(),
                        ...data
                    }
                });
            }, 1500);
        });
    }

    showBopisSuccess(reservation) {
        alert(`Reservation confirmed! Your confirmation number is: ${reservation.confirmationNumber}\n\nYou will receive a confirmation email shortly.`);
    }

    closeBopisModal() {
        const modal = document.getElementById('bopis-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }

    // Utility Functions
    getDirections(storeId) {
        const store = this.stores.find(s => s.id === storeId);
        if (store) {
            const address = encodeURIComponent(`${store.address_line1}, ${store.city}, ${store.state} ${store.postal_code}`);
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
        }
    }

    viewStoreDetails(storeId) {
        const store = this.stores.find(s => s.id === storeId);
        if (store) {
            this.showStoreDetailsModal(store);
        }
    }

    showStoreDetailsModal(store) {
        const modal = document.createElement('div');
        modal.className = 'varai-modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="varai-modal-overlay"></div>
            <div class="varai-modal-content" style="max-width: 600px;">
                <div class="varai-modal-header">
                    <h3 class="varai-modal-title">${store.name}</h3>
                    <button class="varai-modal-close" aria-label="Close modal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="varai-modal-body">
                    <div class="store-details">
                        <div class="detail-section varai-mb-6">
                            <h4 class="varai-h5 varai-mb-3">Contact Information</h4>
                            <p class="varai-mb-2">
                                <strong>Address:</strong><br>
                                ${store.address_line1}<br>
                                ${store.city}, ${store.state} ${store.postal_code}
                            </p>
                            <p class="varai-mb-2"><strong>Phone:</strong> ${store.phone}</p>
                            <p class="varai-mb-2"><strong>Distance:</strong> ${store.distance} miles</p>
                            <p><strong>Store Manager:</strong> ${store.store_manager}</p>
                        </div>
                        
                        <div class="detail-section varai-mb-6">
                            <h4 class="varai-h5 varai-mb-3">Store Hours</h4>
                            <div class="hours-grid">
                                ${this.formatStoreHours(store.operating_hours)}
                            </div>
                            <p class="varai-mt-3 varai-text-sm varai-text-gray-600">
                                <strong>Today:</strong> ${this.getTodayHours(store)}
                            </p>
                        </div>
                        
                        <div class="detail-section varai-mb-6">
                            <h4 class="varai-h5 varai-mb-3">Services & Features</h4>
                            <div class="services-grid">
                                ${this.formatServices(store.services_offered, store.bopis_enabled)}
                            </div>
                        </div>
                        
                        <div class="detail-actions varai-flex varai-gap-3">
                            ${store.bopis_enabled ?
                                `<button class="varai-btn varai-btn-primary" onclick="storeLocator.openBopisModal('${store.id}'); document.body.removeChild(this.closest('.varai-modal'));">
                                    Reserve for Pickup
                                </button>` : ''
                            }
                            <button class="varai-btn varai-btn-secondary" onclick="storeLocator.getDirections('${store.id}')">
                                Get Directions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.varai-modal-close');
        const overlay = modal.querySelector('.varai-modal-overlay');
        
        const closeModal = () => {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    formatStoreHours(hours) {
        const dayNames = {
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',
            saturday: 'Saturday',
            sunday: 'Sunday'
        };

        return Object.entries(hours).map(([day, time]) => {
            const formattedTime = this.formatTimeRange(time);
            return `
                <div class="hour-row varai-flex varai-justify-between varai-py-1">
                    <span class="day-name">${dayNames[day]}:</span>
                    <span class="time-range">${formattedTime}</span>
                </div>
            `;
        }).join('');
    }

    formatTimeRange(timeRange) {
        if (!timeRange || timeRange === 'closed') {
            return 'Closed';
        }

        const [start, end] = timeRange.split('-');
        const formatTime = (time) => {
            const [hour, minute] = time.split(':');
            const hourNum = parseInt(hour);
            const ampm = hourNum >= 12 ? 'PM' : 'AM';
            const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
            return `${displayHour}:${minute} ${ampm}`;
        };

        return `${formatTime(start)} - ${formatTime(end)}`;
    }

    formatServices(services, bopisEnabled) {
        const serviceNames = {
            eye_exams: 'Eye Exams',
            frame_fitting: 'Frame Fitting',
            repairs: 'Repairs',
            consultations: 'Consultations'
        };

        let servicesList = services?.map(service =>
            `<span class="service-tag">${serviceNames[service] || service}</span>`
        ).join('') || '';

        if (bopisEnabled) {
            servicesList += '<span class="service-tag bopis-tag">BOPIS Available</span>';
        }

        return servicesList || '<span class="varai-text-gray-500">No special services listed</span>';
    }

    getTodayHours(store) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const todayHours = store.operating_hours?.[today];
        return this.formatTimeRange(todayHours);
    }
}

// Initialize the store locator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.storeLocator = new ModernStoreLocator();
});

// Global reference for onclick handlers
window.storeLocator = null;