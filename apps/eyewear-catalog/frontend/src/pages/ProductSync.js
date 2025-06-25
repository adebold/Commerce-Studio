import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceItem,
  Thumbnail,
  TextStyle,
  Button,
  ButtonGroup,
  Filters,
  Pagination,
  Badge,
  EmptyState,
  Banner,
  Modal,
  Select,
  Stack,
  SkeletonBodyText,
  SkeletonDisplayText,
  Checkbox,
  TextField
} from '@shopify/polaris';
import { useApi } from '../providers/ApiProvider';
import StatusIndicator from '../components/StatusIndicator';
import SyncProgressBar from '../components/SyncProgressBar';

function ProductSync() {
  const { apiClient } = useApi();
  
  // State for products
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    totalItems: 0,
    hasPrevious: false,
    hasNext: false
  });
  
  // State for filters
  const [queryValue, setQueryValue] = useState('');
  const [brandFilter, setBrandFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [brands, setBrands] = useState([]);
  
  // State for modals
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncOptions, setSyncOptions] = useState({
    brandId: '',
    includeImages: true,
    createVariants: true,
    productStatus: 'active'
  });
  
  // Fetch brands
  const fetchBrands = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/catalog/brands');
      setBrands(response.data.brands || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  }, [apiClient]);
  
  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = {
        page: pagination.page,
        limit: 10
      };
      
      if (queryValue) {
        params.query = queryValue;
      }
      
      if (brandFilter) {
        params.brandId = brandFilter;
      }
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      // Fetch products
      const response = await apiClient.get('/api/catalog/products', { params });
      
      setProducts(response.data.products || []);
      
      // Update pagination
      setPagination({
        page: response.data.pagination?.page || 1,
        totalPages: response.data.pagination?.pages || 1,
        totalItems: response.data.pagination?.total || 0,
        hasPrevious: (response.data.pagination?.page || 1) > 1,
        hasNext: (response.data.pagination?.page || 1) < (response.data.pagination?.pages || 1)
      });
      
      setLoading(false);
    } catch (err) {
      setError('Error loading products. Please try again.');
      setLoading(false);
      console.error('Products fetch error:', err);
    }
  }, [apiClient, pagination.page, queryValue, brandFilter, statusFilter]);
  
  // Fetch sync status
  const fetchSyncStatus = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/sync/status');
      setSyncStatus(response.data);
    } catch (err) {
      console.error('Sync status fetch error:', err);
    }
  }, [apiClient]);
  
  // Handle sync start
  const handleStartSync = useCallback(async (options = {}) => {
    try {
      setError(null);
      
      await apiClient.post('/api/sync/start', options);
      
      setSyncModalOpen(false);
      setSuccess('Sync started successfully');
      
      // Fetch updated sync status
      fetchSyncStatus();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError('Error starting sync. Please try again.');
      console.error('Start sync error:', err);
    }
  }, [apiClient, fetchSyncStatus]);
  
  // Handle sync cancel
  const handleCancelSync = useCallback(async () => {
    try {
      setError(null);
      
      await apiClient.post('/api/sync/cancel');
      
      // Fetch updated sync status
      fetchSyncStatus();
    } catch (err) {
      setError('Error cancelling sync. Please try again.');
      console.error('Cancel sync error:', err);
    }
  }, [apiClient, fetchSyncStatus]);
  
  // Handle single product sync
  const handleSyncProduct = useCallback(async (productId) => {
    try {
      setError(null);
      
      await apiClient.post('/api/sync/product', { productId });
      
      setSuccess('Product synced successfully');
      
      // Fetch updated products
      fetchProducts();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError('Error syncing product. Please try again.');
      console.error('Product sync error:', err);
    }
  }, [apiClient, fetchProducts]);
  
  // Handle bulk product sync
  const handleSyncSelectedProducts = useCallback(async () => {
    try {
      setError(null);
      
      await apiClient.post('/api/sync/products', { productIds: selectedItems });
      
      setSuccess(`${selectedItems.length} products synced successfully`);
      setSelectedItems([]);
      
      // Fetch updated products
      fetchProducts();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError('Error syncing products. Please try again.');
      console.error('Products sync error:', err);
    }
  }, [apiClient, fetchProducts, selectedItems]);
  
  // Check if sync is in progress
  const isSyncing = useMemo(() => {
    return syncStatus && ['initializing', 'in_progress'].includes(syncStatus.status);
  }, [syncStatus]);
  
  // Handle pagination
  const handlePaginationChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);
  
  // Handle filter change
  const handleQueryValueChange = useCallback((value) => {
    setQueryValue(value);
  }, []);
  
  const handleQueryValueRemove = useCallback(() => {
    setQueryValue('');
  }, []);
  
  const handleBrandFilterChange = useCallback((value) => {
    setBrandFilter(value);
  }, []);
  
  const handleBrandFilterRemove = useCallback(() => {
    setBrandFilter(null);
  }, []);
  
  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(value);
  }, []);
  
  const handleStatusFilterRemove = useCallback(() => {
    setStatusFilter(null);
  }, []);
  
  const handleFiltersClear = useCallback(() => {
    handleQueryValueRemove();
    handleBrandFilterRemove();
    handleStatusFilterRemove();
  }, [handleQueryValueRemove, handleBrandFilterRemove, handleStatusFilterRemove]);
  
  // Format filters for UI
  const filters = useMemo(() => {
    const brandOptions = brands.map(brand => ({
      label: brand.name,
      value: brand.id
    }));
    
    brandOptions.unshift({ label: 'All Brands', value: null });
    
    const statusOptions = [
      { label: 'All', value: null },
      { label: 'Imported', value: 'imported' },
      { label: 'Not Imported', value: 'not_imported' },
      { label: 'Error', value: 'error' }
    ];
    
    return [
      {
        key: 'brand',
        label: 'Brand',
        filter: (
          <Select
            label="Brand"
            labelHidden
            options={brandOptions}
            value={brandFilter}
            onChange={handleBrandFilterChange}
          />
        ),
        shortcut: true
      },
      {
        key: 'status',
        label: 'Status',
        filter: (
          <Select
            label="Status"
            labelHidden
            options={statusOptions}
            value={statusFilter}
            onChange={handleStatusFilterChange}
          />
        ),
        shortcut: true
      }
    ];
  }, [brands, brandFilter, statusFilter, handleBrandFilterChange, handleStatusFilterChange]);
  
  // Filter actions
  const appliedFilters = useMemo(() => {
    const appliedFilters = [];
    
    if (brandFilter) {
      const selectedBrand = brands.find(brand => brand.id === brandFilter);
      
      appliedFilters.push({
        key: 'brand',
        label: `Brand: ${selectedBrand ? selectedBrand.name : brandFilter}`,
        onRemove: handleBrandFilterRemove
      });
    }
    
    if (statusFilter) {
      const statusMap = {
        imported: 'Imported',
        not_imported: 'Not Imported',
        error: 'Error'
      };
      
      appliedFilters.push({
        key: 'status',
        label: `Status: ${statusMap[statusFilter] || statusFilter}`,
        onRemove: handleStatusFilterRemove
      });
    }
    
    return appliedFilters;
  }, [brandFilter, statusFilter, brands, handleBrandFilterRemove, handleStatusFilterRemove]);
  
  // Initialize page
  useEffect(() => {
    fetchBrands();
    fetchSyncStatus();
  }, [fetchBrands, fetchSyncStatus]);
  
  // Fetch products when filters or pagination change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, pagination.page, queryValue, brandFilter, statusFilter]);
  
  // Set up polling for sync status
  useEffect(() => {
    let interval;
    
    if (isSyncing) {
      interval = setInterval(fetchSyncStatus, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSyncing, fetchSyncStatus]);
  
  // Product status options
  const productStatusOptions = useMemo(() => [
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' }
  ], []);
  
  // Brand options for sync modal
  const brandOptions = useMemo(() => {
    const options = brands.map(brand => ({
      label: brand.name,
      value: brand.id
    }));
    
    options.unshift({ label: 'All Brands', value: '' });
    
    return options;
  }, [brands]);
  
  // Render loading state
  if (loading && products.length === 0) {
    return (
      <Page title="Products & Sync">
        <Card sectioned>
          <SkeletonDisplayText size="small" />
          <SkeletonBodyText lines={3} />
        </Card>
      </Page>
    );
  }
  
  return (
    <Page
      title="Products & Sync"
      primaryAction={{
        content: 'Start Sync',
        onAction: () => setSyncModalOpen(true),
        disabled: isSyncing
      }}
      secondaryActions={[
        {
          content: 'Sync Selected',
          onAction: handleSyncSelectedProducts,
          disabled: selectedItems.length === 0 || isSyncing
        }
      ]}
    >
      {error && (
        <Layout.Section>
          <Banner status="critical" title="Error">
            <p>{error}</p>
          </Banner>
        </Layout.Section>
      )}
      
      {success && (
        <Layout.Section>
          <Banner status="success" title="Success">
            <p>{success}</p>
          </Banner>
        </Layout.Section>
      )}
      
      {isSyncing && (
        <Layout.Section>
          <Card sectioned title="Sync Status">
            <SyncProgressBar syncStatus={syncStatus} />
            <div style={{ marginTop: '1rem' }}>
              <Button onClick={handleCancelSync} destructive>
                Cancel Sync
              </Button>
            </div>
          </Card>
        </Layout.Section>
      )}
      
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList
              resourceName={{ singular: 'product', plural: 'products' }}
              items={products}
              renderItem={renderItem}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              selectable
              loading={loading}
              filterControl={
                <Filters
                  queryValue={queryValue}
                  filters={filters}
                  onQueryChange={handleQueryValueChange}
                  onQueryClear={handleQueryValueRemove}
                  onClearAll={handleFiltersClear}
                  appliedFilters={appliedFilters}
                />
              }
              emptyState={
                <EmptyState
                  heading="No products found"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Try changing the filters or search term</p>
                </EmptyState>
              }
            />
            
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <Pagination
                hasPrevious={pagination.hasPrevious}
                onPrevious={() => handlePaginationChange(pagination.page - 1)}
                hasNext={pagination.hasNext}
                onNext={() => handlePaginationChange(pagination.page + 1)}
              />
              <div style={{ marginTop: '8px' }}>
                <TextStyle variation="subdued">
                  Showing {products.length} of {pagination.totalItems} products
                </TextStyle>
              </div>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
      
      {/* Sync Modal */}
      <Modal
        open={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        title="Start Product Sync"
        primaryAction={{
          content: 'Start Sync',
          onAction: () => handleStartSync(syncOptions)
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setSyncModalOpen(false)
          }
        ]}
      >
        <Modal.Section>
          <Stack vertical spacing="loose">
            <Select
              label="Brand"
              options={brandOptions}
              value={syncOptions.brandId}
              onChange={(value) => setSyncOptions({ ...syncOptions, brandId: value })}
              helpText="Select a specific brand or sync all brands"
            />
            
            <Select
              label="Product Status"
              options={productStatusOptions}
              value={syncOptions.productStatus}
              onChange={(value) => setSyncOptions({ ...syncOptions, productStatus: value })}
              helpText="Status of products when imported"
            />
            
            <Checkbox
              label="Include product images"
              checked={syncOptions.includeImages}
              onChange={(value) => setSyncOptions({ ...syncOptions, includeImages: value })}
            />
            
            <Checkbox
              label="Create product variants"
              checked={syncOptions.createVariants}
              onChange={(value) => setSyncOptions({ ...syncOptions, createVariants: value })}
              helpText="Create variants for different colors, sizes, etc."
            />
          </Stack>
        </Modal.Section>
      </Modal>
    </Page>
  );
  
  // Render product list item
  function renderItem(item) {
    const { id, title, thumbnail, sku, brand, variants, syncStatus } = item;
    
    // Media for the item
    const media = (
      <Thumbnail
        source={thumbnail || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
        alt={title}
      />
    );
    
    // Determine shortcut actions
    const shortcutActions = [
      {
        content: 'Sync Now',
        onAction: () => handleSyncProduct(id),
        disabled: isSyncing
      }
    ];
    
    // Render the resource item
    return (
      <ResourceItem
        id={id}
        media={media}
        shortcutActions={shortcutActions}
        accessibilityLabel={`View details for ${title}`}
      >
        <Stack>
          <Stack.Item fill>
            <h3>
              <TextStyle variation="strong">{title}</TextStyle>
            </h3>
            <div>SKU: {sku}</div>
            <div>Brand: {brand}</div>
            <div>Variants: {variants ? variants.length : 0}</div>
          </Stack.Item>
          
          <Stack.Item>
            {syncStatus ? (
              <StatusIndicator status={syncStatus} />
            ) : (
              <Badge>Not Imported</Badge>
            )}
          </Stack.Item>
        </Stack>
      </ResourceItem>
    );
  }
}

export default ProductSync;