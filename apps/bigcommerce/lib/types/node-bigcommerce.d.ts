declare module 'node-bigcommerce' {
    interface BigCommerceConfig {
        clientId: string;
        accessToken: string;
        storeHash: string;
        responseType?: 'json';
        apiVersion?: 'v2' | 'v3';
        logLevel?: 'info' | 'error' | 'debug';
        timeout?: number;
        maxRetries?: number;
        retryDelay?: number;
    }

    interface BigCommerceResponse<T = any> {
        data: T;
        meta: {
            pagination?: {
                total: number;
                count: number;
                per_page: number;
                current_page: number;
                total_pages: number;
                links: {
                    previous?: string;
                    current: string;
                    next?: string;
                };
            };
        };
    }

    class BigCommerce {
        constructor(config: BigCommerceConfig);

        config: BigCommerceConfig;

        get<T = any>(path: string, query?: Record<string, any>): Promise<T>;
        post<T = any>(path: string, data?: any): Promise<T>;
        put<T = any>(path: string, data?: any): Promise<T>;
        delete<T = any>(path: string): Promise<T>;
        create<T = any>(path: string, data?: any): Promise<T>;
        update<T = any>(path: string, data?: any): Promise<T>;

        // Catalog endpoints
        getProducts(query?: Record<string, any>): Promise<BigCommerceResponse>;
        getProduct(id: number): Promise<any>;
        createProduct(data: any): Promise<any>;
        updateProduct(id: number, data: any): Promise<any>;
        deleteProduct(id: number): Promise<any>;

        // Brand endpoints
        getBrands(query?: Record<string, any>): Promise<BigCommerceResponse>;
        getBrand(id: number): Promise<any>;
        createBrand(data: any): Promise<any>;
        updateBrand(id: number, data: any): Promise<any>;
        deleteBrand(id: number): Promise<any>;

        // Category endpoints
        getCategories(query?: Record<string, any>): Promise<BigCommerceResponse>;
        getCategory(id: number): Promise<any>;
        createCategory(data: any): Promise<any>;
        updateCategory(id: number, data: any): Promise<any>;
        deleteCategory(id: number): Promise<any>;

        // Custom field endpoints
        getCustomFields(resourceType: string, resourceId: number): Promise<any[]>;
        createCustomField(resourceType: string, resourceId: number, data: any): Promise<any>;
        updateCustomField(resourceType: string, resourceId: number, customFieldId: number, data: any): Promise<any>;
        deleteCustomField(resourceType: string, resourceId: number, customFieldId: number): Promise<any>;

        // Script endpoints
        getScripts(): Promise<any[]>;
        createScript(data: any): Promise<any>;
        updateScript(id: number, data: any): Promise<any>;
        deleteScript(id: number): Promise<any>;

        // Store endpoints
        getStore(): Promise<any>;
        updateStore(data: any): Promise<any>;

        // Settings endpoints
        getSettings(): Promise<any[]>;
        updateSettings(data: any[]): Promise<any>;
    }

    export = BigCommerce;
}
