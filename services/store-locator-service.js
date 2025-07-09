/**
 * Store Locator Service
 * Manages store location finding, inventory checking, and BOPIS reservations
 * Integrates with consultation recommendations and existing services
 */

import { getLoggingService } from '../core/logging-service.js';

export default class StoreLocatorService {
    constructor(config = {}) {
        this.config = {
            maxDistance: config.maxDistance || 50, // miles
            maxResults: config.maxResults || 10,
            inventoryCheckTimeout: config.inventoryCheckTimeout || 5000,
            reservationTimeout: config.reservationTimeout || 24, // hours
            ...config
        };
        
        this.logger = getLoggingService().child('StoreLocatorService');
        this.stores = new Map();
        this.inventory = new Map();
        this.reservations = new Map();
        
        // Initialize with mock store data
        this.initializeMockData();
    }

    /**
     * Initialize mock store data for demonstration
     */
    initializeMockData() {
        const mockStores = [
            {
                id: 'store-001',
                name: 'VisionCraft Downtown',
                address: '123 Main Street, Downtown, NY 10001',
                coordinates: { lat: 40.7589, lng: -73.9851 },
                phone: '(555) 123-4567',
                email: 'downtown@visioncraft.com',
                hours: {
                    monday: '9:00 AM - 8:00 PM',
                    tuesday: '9:00 AM - 8:00 PM',
                    wednesday: '9:00 AM - 8:00 PM',
                    thursday: '9:00 AM - 8:00 PM',
                    friday: '9:00 AM - 9:00 PM',
                    saturday: '9:00 AM - 9:00 PM',
                    sunday: '11:00 AM - 6:00 PM'
                },
                services: ['eye_exams', 'frame_fitting', 'repairs', 'bopis'],
                specialties: ['designer_frames', 'progressive_lenses']
            },
            {
                id: 'store-002',
                name: 'VisionCraft Mall Center',
                address: '456 Shopping Mall Dr, Midtown, NY 10019',
                coordinates: { lat: 40.7614, lng: -73.9776 },
                phone: '(555) 234-5678',
                email: 'mall@visioncraft.com',
                hours: {
                    monday: '10:00 AM - 9:00 PM',
                    tuesday: '10:00 AM - 9:00 PM',
                    wednesday: '10:00 AM - 9:00 PM',
                    thursday: '10:00 AM - 9:00 PM',
                    friday: '10:00 AM - 10:00 PM',
                    saturday: '10:00 AM - 10:00 PM',
                    sunday: '12:00 PM - 6:00 PM'
                },
                services: ['frame_fitting', 'adjustments', 'bopis'],
                specialties: ['sports_eyewear', 'children_frames']
            },
            {
                id: 'store-003',
                name: 'VisionCraft Uptown',
                address: '789 Broadway Ave, Uptown, NY 10025',
                coordinates: { lat: 40.7831, lng: -73.9712 },
                phone: '(555) 345-6789',
                email: 'uptown@visioncraft.com',
                hours: {
                    monday: '9:00 AM - 7:00 PM',
                    tuesday: '9:00 AM - 7:00 PM',
                    wednesday: '9:00 AM - 7:00 PM',
                    thursday: '9:00 AM - 7:00 PM',
                    friday: '9:00 AM - 8:00 PM',
                    saturday: '9:00 AM - 8:00 PM',
                    sunday: '11:00 AM - 5:00 PM'
                },
                services: ['eye_exams', 'contact_lenses', 'frame_fitting', 'bopis'],
                specialties: ['luxury_frames', 'custom_lenses']
            }
        ];

        // Initialize stores
        mockStores.forEach(store => {
            this.stores.set(store.id, store);
        });

        // Initialize mock inventory
        this.initializeMockInventory();
        
        this.logger.info(`Initialized ${mockStores.length} mock stores`);
    }

    /**
     * Initialize mock inventory data
     */
    initializeMockInventory() {
        const frameIds = ['rec-001', 'rec-002', 'rec-003'];
        const storeIds = Array.from(this.stores.keys());

        storeIds.forEach(storeId => {
            frameIds.forEach(frameId => {
                const inventoryKey = `${storeId}_${frameId}`;
                this.inventory.set(inventoryKey, {
                    storeId,
                    frameId,
                    inStock: Math.random() > 0.3, // 70% chance in stock
                    quantity: Math.floor(Math.random() * 10) + 1,
                    lastUpdated: new Date(),
                    sizes: ['Small', 'Medium', 'Large'].filter(() => Math.random() > 0.3),
                    colors: ['Black', 'Brown', 'Silver', 'Blue'].filter(() => Math.random() > 0.5)
                });
            });
        });

        this.logger.debug('Initialized mock inventory data');
    }

    /**
     * Find nearby stores based on coordinates
     */
    async findNearbyStores(latitude, longitude, maxDistance = null) {
        try {
            const searchDistance = maxDistance || this.config.maxDistance;
            const userLocation = { lat: latitude, lng: longitude };
            
            this.logger.info(`Finding stores within ${searchDistance} miles of ${latitude}, ${longitude}`);

            const storesWithDistance = Array.from(this.stores.values())
                .map(store => {
                    const distance = this.calculateDistance(userLocation, store.coordinates);
                    return {
                        ...store,
                        distance: Math.round(distance * 10) / 10 // Round to 1 decimal
                    };
                })
                .filter(store => store.distance <= searchDistance)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, this.config.maxResults);

            this.logger.info(`Found ${storesWithDistance.length} nearby stores`);
            
            return {
                success: true,
                stores: storesWithDistance,
                searchParams: {
                    latitude,
                    longitude,
                    maxDistance: searchDistance
                }
            };

        } catch (error) {
            this.logger.error('Error finding nearby stores:', error);
            return {
                success: false,
                error: 'Failed to find nearby stores',
                stores: []
            };
        }
    }

    /**
     * Check inventory for specific frame at specific store
     */
    async checkInventory(storeId, frameId) {
        try {
            const inventoryKey = `${storeId}_${frameId}`;
            const inventoryData = this.inventory.get(inventoryKey);
            
            if (!inventoryData) {
                return {
                    success: false,
                    inStock: false,
                    message: 'Product not found in store inventory'
                };
            }

            this.logger.debug(`Checking inventory for ${frameId} at ${storeId}`);

            return {
                success: true,
                storeId,
                frameId,
                inStock: inventoryData.inStock,
                quantity: inventoryData.quantity,
                sizes: inventoryData.sizes,
                colors: inventoryData.colors,
                lastUpdated: inventoryData.lastUpdated
            };

        } catch (error) {
            this.logger.error('Error checking inventory:', error);
            return {
                success: false,
                error: 'Failed to check inventory'
            };
        }
    }

    /**
     * Check inventory across multiple stores for recommended frames
     */
    async checkInventoryForRecommendations(storeIds, frameIds) {
        try {
            this.logger.info(`Checking inventory for ${frameIds.length} frames across ${storeIds.length} stores`);

            const inventoryResults = [];

            for (const storeId of storeIds) {
                const store = this.stores.get(storeId);
                if (!store) continue;

                const storeInventory = {
                    storeId,
                    storeName: store.name,
                    frames: []
                };

                for (const frameId of frameIds) {
                    const inventory = await this.checkInventory(storeId, frameId);
                    if (inventory.success) {
                        storeInventory.frames.push({
                            frameId,
                            inStock: inventory.inStock,
                            quantity: inventory.quantity,
                            sizes: inventory.sizes,
                            colors: inventory.colors
                        });
                    }
                }

                inventoryResults.push(storeInventory);
            }

            return {
                success: true,
                inventoryResults
            };

        } catch (error) {
            this.logger.error('Error checking inventory for recommendations:', error);
            return {
                success: false,
                error: 'Failed to check inventory for recommendations'
            };
        }
    }

    /**
     * Create BOPIS reservation
     */
    async createReservation(reservationData) {
        try {
            const {
                storeId,
                frameId,
                customerInfo,
                size,
                color,
                sessionId
            } = reservationData;

            // Validate store and inventory
            const store = this.stores.get(storeId);
            if (!store) {
                return {
                    success: false,
                    error: 'Store not found'
                };
            }

            const inventory = await this.checkInventory(storeId, frameId);
            if (!inventory.success || !inventory.inStock) {
                return {
                    success: false,
                    error: 'Frame not available at selected store'
                };
            }

            // Create reservation
            const reservationId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const expirationTime = new Date(Date.now() + (this.config.reservationTimeout * 60 * 60 * 1000));

            const reservation = {
                id: reservationId,
                storeId,
                frameId,
                customerInfo: {
                    name: customerInfo.name,
                    email: customerInfo.email,
                    phone: customerInfo.phone
                },
                specifications: {
                    size: size || 'Medium',
                    color: color || 'Black'
                },
                sessionId,
                createdAt: new Date(),
                expiresAt: expirationTime,
                status: 'active',
                store: {
                    name: store.name,
                    address: store.address,
                    phone: store.phone
                }
            };

            this.reservations.set(reservationId, reservation);

            this.logger.info(`Created BOPIS reservation ${reservationId} for ${frameId} at ${storeId}`);

            return {
                success: true,
                reservation: {
                    id: reservationId,
                    frameId,
                    store: store.name,
                    storeAddress: store.address,
                    storePhone: store.phone,
                    customerName: customerInfo.name,
                    expiresAt: expirationTime,
                    confirmationCode: reservationId.substr(-6).toUpperCase()
                }
            };

        } catch (error) {
            this.logger.error('Error creating reservation:', error);
            return {
                success: false,
                error: 'Failed to create reservation'
            };
        }
    }

    /**
     * Get reservation details
     */
    async getReservation(reservationId) {
        try {
            const reservation = this.reservations.get(reservationId);
            
            if (!reservation) {
                return {
                    success: false,
                    error: 'Reservation not found'
                };
            }

            // Check if expired
            if (new Date() > reservation.expiresAt) {
                reservation.status = 'expired';
                this.reservations.set(reservationId, reservation);
            }

            return {
                success: true,
                reservation
            };

        } catch (error) {
            this.logger.error('Error getting reservation:', error);
            return {
                success: false,
                error: 'Failed to retrieve reservation'
            };
        }
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    calculateDistance(coord1, coord2) {
        const R = 3959; // Earth's radius in miles
        const dLat = this.toRadians(coord2.lat - coord1.lat);
        const dLon = this.toRadians(coord2.lng - coord1.lng);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Convert degrees to radians
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Get store details by ID
     */
    getStore(storeId) {
        const store = this.stores.get(storeId);
        return store ? { success: true, store } : { success: false, error: 'Store not found' };
    }

    /**
     * Get all stores
     */
    getAllStores() {
        return {
            success: true,
            stores: Array.from(this.stores.values())
        };
    }

    /**
     * Search stores by name or address
     */
    searchStores(query) {
        const searchQuery = query.toLowerCase();
        const matchingStores = Array.from(this.stores.values())
            .filter(store => 
                store.name.toLowerCase().includes(searchQuery) ||
                store.address.toLowerCase().includes(searchQuery)
            );

        return {
            success: true,
            stores: matchingStores,
            query
        };
    }

    /**
     * Clean up expired reservations
     */
    cleanupExpiredReservations() {
        const now = new Date();
        let expiredCount = 0;

        for (const [id, reservation] of this.reservations.entries()) {
            if (now > reservation.expiresAt && reservation.status === 'active') {
                reservation.status = 'expired';
                this.reservations.set(id, reservation);
                expiredCount++;
            }
        }

        if (expiredCount > 0) {
            this.logger.info(`Marked ${expiredCount} reservations as expired`);
        }

        return expiredCount;
    }
}