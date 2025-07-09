import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Typography, Button, Input, Card } from '../../../design-system';
import { FormSection, SettingsCard, ApiKeyManager, ToggleSwitch } from '../../../components/settings';
import { settingsService, IntegrationSettings, Webhook } from '../../../services/settings';

const WebhooksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
`;

const WebhookCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.spacing[16]};
`;

const WebhookHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[12]};
`;

const WebhookUrl = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.spacing[12]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[12]};
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  font-family: monospace;
  overflow-x: auto;
`;

const EventTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[12]};
`;

const EventTag = styled.span`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[4]} ${theme.spacing.spacing[8]}`};
  background-color: ${({ theme }) => theme.colors.primary[100]};
  color: ${({ theme }) => theme.colors.primary[700]};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const PlatformCard = styled(Card)<{ connected: boolean }>`
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  border-left: 4px solid ${({ theme, connected }) => 
    connected ? theme.colors.semantic.success.main : theme.colors.neutral[300]};
`;

const PlatformHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[12]};
`;

const PlatformLogo = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  border-radius: 4px;
  margin-right: ${({ theme }) => theme.spacing.spacing[12]};
`;

const PlatformInfo = styled.div`
  flex: 1;
`;

const PlatformGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const NewWebhookForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const EventCheckboxes = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.spacing[12]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EventCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  padding: ${({ theme }) => theme.spacing.spacing[8]};
  border-radius: 4px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
  }
  
  input {
    margin: 0;
  }
`;

/**
 * IntegrationSettingsPage Component
 * 
 * Page for managing API keys, webhooks, data sync, and platform integrations.
 */
const IntegrationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<IntegrationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewWebhook, setShowNewWebhook] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: [] as string[],
    active: true,
  });
  
  const availableEvents = [
    { value: 'order.created', label: 'Order Created' },
    { value: 'order.updated', label: 'Order Updated' },
    { value: 'order.fulfilled', label: 'Order Fulfilled' },
    { value: 'product.created', label: 'Product Created' },
    { value: 'product.updated', label: 'Product Updated' },
    { value: 'product.deleted', label: 'Product Deleted' },
    { value: 'customer.created', label: 'Customer Created' },
    { value: 'customer.updated', label: 'Customer Updated' },
  ];
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const integrationSettings = await settingsService.getSettingsSection('integration');
        setSettings(integrationSettings);
        setLoading(false);
      } catch (error) {
        console.error('Error loading integration settings:', error);
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const handleGenerateApiKey = async (name: string, permissions: string[]) => {
    try {
      await settingsService.generateApiKey(name, permissions);
      
      // Refresh settings
      const integrationSettings = await settingsService.getSettingsSection('integration');
      setSettings(integrationSettings);
    } catch (error) {
      console.error('Error generating API key:', error);
      throw error;
    }
  };
  
  const handleDeleteApiKey = async (id: string) => {
    try {
      await settingsService.deleteApiKey(id);
      
      // Refresh settings
      const integrationSettings = await settingsService.getSettingsSection('integration');
      setSettings(integrationSettings);
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  };
  
  const handleEventToggle = (event: string) => {
    setNewWebhook(prev => {
      const events = prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event];
      
      return { ...prev, events };
    });
  };
  
  const handleAddWebhook = async () => {
    if (!settings || !newWebhook.url || newWebhook.events.length === 0) return;
    
    setSaving(true);
    try {
      // In a real app, this would call an API endpoint
      const newWebhookObj: Webhook = {
        id: `wh-${Date.now()}`,
        url: newWebhook.url,
        events: newWebhook.events,
        active: newWebhook.active,
        createdAt: new Date().toISOString(),
      };
      
      const updatedWebhooks = [...settings.webhooks, newWebhookObj];
      
      await settingsService.updateSettings('integration', {
        webhooks: updatedWebhooks,
      });
      
      // Refresh settings
      const integrationSettings = await settingsService.getSettingsSection('integration');
      setSettings(integrationSettings);
      
      // Reset form
      setNewWebhook({
        url: '',
        events: [],
        active: true,
      });
      setShowNewWebhook(false);
      
      alert('Webhook added successfully!');
    } catch (error) {
      console.error('Error adding webhook:', error);
      alert('Failed to add webhook. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteWebhook = async (id: string) => {
    if (!settings) return;
    
    if (!window.confirm('Are you sure you want to delete this webhook?')) return;
    
    try {
      const updatedWebhooks = settings.webhooks.filter(webhook => webhook.id !== id);
      
      await settingsService.updateSettings('integration', {
        webhooks: updatedWebhooks,
      });
      
      // Refresh settings
      const integrationSettings = await settingsService.getSettingsSection('integration');
      setSettings(integrationSettings);
      
      alert('Webhook deleted successfully!');
    } catch (error) {
      console.error('Error deleting webhook:', error);
      alert('Failed to delete webhook. Please try again.');
    }
  };
  
  const handleToggleWebhook = async (id: string, active: boolean) => {
    if (!settings) return;
    
    try {
      const updatedWebhooks = settings.webhooks.map(webhook => 
        webhook.id === id ? { ...webhook, active } : webhook
      );
      
      await settingsService.updateSettings('integration', {
        webhooks: updatedWebhooks,
      });
      
      // Refresh settings
      const integrationSettings = await settingsService.getSettingsSection('integration');
      setSettings(integrationSettings);
    } catch (error) {
      console.error('Error updating webhook:', error);
      alert('Failed to update webhook. Please try again.');
    }
  };
  
  const handleUpdateDataSync = async (field: string, value: string | boolean) => {
    if (!settings) return;
    
    try {
      const updatedDataSync = {
        ...settings.dataSync,
        [field]: value,
      };
      
      await settingsService.updateSettings('integration', {
        dataSync: updatedDataSync,
      });
      
      // Refresh settings
      const integrationSettings = await settingsService.getSettingsSection('integration');
      setSettings(integrationSettings);
    } catch (error) {
      console.error('Error updating data sync settings:', error);
      alert('Failed to update data sync settings. Please try again.');
    }
  };
  
  const handleUpdateDataSyncEntity = async (entity: string, value: boolean) => {
    if (!settings) return;
    
    try {
      const updatedEntities = {
        ...settings.dataSync.entities,
        [entity]: value,
      };
      
      const updatedDataSync = {
        ...settings.dataSync,
        entities: updatedEntities,
      };
      
      await settingsService.updateSettings('integration', {
        dataSync: updatedDataSync,
      });
      
      // Refresh settings
      const integrationSettings = await settingsService.getSettingsSection('integration');
      setSettings(integrationSettings);
    } catch (error) {
      console.error('Error updating data sync entity:', error);
      alert('Failed to update data sync entity. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <Card variant="outlined">
        <Card.Content>
          <Typography variant="body1" align="center">
            Loading integration settings...
          </Typography>
        </Card.Content>
      </Card>
    );
  }
  
  if (!settings) {
    return (
      <Card variant="outlined">
        <Card.Content>
          <Typography variant="body1" align="center" color="semantic.error.main">
            Failed to load integration settings. Please refresh the page and try again.
          </Typography>
        </Card.Content>
      </Card>
    );
  }
  
  return (
    <div>
      <Typography variant="h3" gutterBottom>
        Integration Settings
      </Typography>
      
      <SettingsCard
        title="API Keys"
        description="Manage API keys for accessing the VARAi API."
      >
        <ApiKeyManager
          apiKeys={settings.apiKeys}
          onGenerateKey={handleGenerateApiKey}
          onDeleteKey={handleDeleteApiKey}
          loading={loading}
        />
      </SettingsCard>
      
      <SettingsCard
        title="Webhooks"
        description="Configure webhooks to receive real-time notifications for events."
      >
        <div style={{ marginBottom: '16px' }}>
          <Button
            variant="secondary"
            onClick={() => setShowNewWebhook(!showNewWebhook)}
          >
            {showNewWebhook ? 'Cancel' : 'Add Webhook'}
          </Button>
        </div>
        
        {showNewWebhook && (
          <NewWebhookForm>
            <Typography variant="h5">Add New Webhook</Typography>
            
            <div>
              <Input
                label="Webhook URL"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://example.com/webhook"
                fullWidth
                required
              />
            </div>
            
            <div>
              <Typography variant="body1" gutterBottom>
                Events
              </Typography>
              <EventCheckboxes>
                {availableEvents.map(event => (
                  <EventCheckbox key={event.value}>
                    <input
                      type="checkbox"
                      checked={newWebhook.events.includes(event.value)}
                      onChange={() => handleEventToggle(event.value)}
                      id={`event-${event.value}`}
                      aria-label={`${event.label} event`}
                    />
                    {event.label}
                  </EventCheckbox>
                ))}
              </EventCheckboxes>
            </div>
            
            <div>
              <ToggleSwitch
                id="webhook-active"
                label="Active"
                description="Enable or disable this webhook"
                checked={newWebhook.active}
                onChange={(checked) => setNewWebhook({ ...newWebhook, active: checked })}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="primary"
                onClick={handleAddWebhook}
                loading={saving}
                disabled={!newWebhook.url || newWebhook.events.length === 0}
              >
                Add Webhook
              </Button>
            </div>
          </NewWebhookForm>
        )}
        
        {settings.webhooks.length > 0 ? (
          <WebhooksList>
            {settings.webhooks.map(webhook => (
              <WebhookCard key={webhook.id} variant="outlined">
                <WebhookHeader>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h5">Webhook</Typography>
                    <div style={{ marginLeft: '12px' }}>
                      <ToggleSwitch
                        id={`webhook-toggle-${webhook.id}`}
                        label=""
                        checked={webhook.active}
                        onChange={(checked) => handleToggleWebhook(webhook.id, checked)}
                      />
                    </div>
                  </div>
                  <Button
                    variant="tertiary"
                    size="small"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                  >
                    Delete
                  </Button>
                </WebhookHeader>
                
                <WebhookUrl>
                  <code>{webhook.url}</code>
                  <Button
                    variant="tertiary"
                    size="small"
                    onClick={() => navigator.clipboard.writeText(webhook.url)}
                  >
                    Copy
                  </Button>
                </WebhookUrl>
                
                <Typography variant="body2" gutterBottom>
                  Events:
                </Typography>
                <EventTags>
                  {webhook.events.map(event => (
                    <EventTag key={event}>{event}</EventTag>
                  ))}
                </EventTags>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#666' }}>
                  <span>Created: {new Date(webhook.createdAt).toLocaleDateString()}</span>
                  {webhook.lastTriggered && (
                    <span>Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}</span>
                  )}
                </div>
              </WebhookCard>
            ))}
          </WebhooksList>
        ) : (
          <Typography variant="body1" color="neutral.600" align="center">
            No webhooks configured. Add a webhook to receive real-time notifications.
          </Typography>
        )}
      </SettingsCard>
      
      <SettingsCard
        title="Data Synchronization"
        description="Configure how data is synchronized between VARAi and your platforms."
      >
        <FormSection title="Sync Settings">
          <ToggleSwitch
            id="data-sync-enabled"
            label="Enable Data Synchronization"
            description="Automatically sync data between VARAi and connected platforms"
            checked={settings.dataSync.enabled}
            onChange={(checked) => handleUpdateDataSync('enabled', checked)}
          />
          
          {settings.dataSync.enabled && (
            <>
              <div style={{ marginTop: '16px' }}>
                <Typography variant="body1" gutterBottom>
                  Sync Frequency
                </Typography>
                <select
                  id="sync-frequency"
                  aria-label="Sync Frequency"
                  value={settings.dataSync.frequency}
                  onChange={(e) => handleUpdateDataSync('frequency', e.target.value)}
                  style={{
                    display: 'block',
                    width: '100%',
                    maxWidth: '300px',
                    padding: '8px',
                    marginTop: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                >
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              
              <div style={{ marginTop: '24px' }}>
                <Typography variant="body1" gutterBottom>
                  Entities to Sync
                </Typography>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                  <ToggleSwitch
                    id="sync-products"
                    label="Products"
                    description="Sync product data including images, descriptions, and variants"
                    checked={settings.dataSync.entities.products}
                    onChange={(checked) => handleUpdateDataSyncEntity('products', checked)}
                  />
                  <ToggleSwitch
                    id="sync-customers"
                    label="Customers"
                    description="Sync customer profiles and preferences"
                    checked={settings.dataSync.entities.customers}
                    onChange={(checked) => handleUpdateDataSyncEntity('customers', checked)}
                  />
                  <ToggleSwitch
                    id="sync-orders"
                    label="Orders"
                    description="Sync order data including line items and fulfillment status"
                    checked={settings.dataSync.entities.orders}
                    onChange={(checked) => handleUpdateDataSyncEntity('orders', checked)}
                  />
                  <ToggleSwitch
                    id="sync-inventory"
                    label="Inventory"
                    description="Sync inventory levels and availability"
                    checked={settings.dataSync.entities.inventory}
                    onChange={(checked) => handleUpdateDataSyncEntity('inventory', checked)}
                  />
                </div>
              </div>
              
              {settings.dataSync.lastSync && (
                <div style={{ marginTop: '24px' }}>
                  <Typography variant="body2" color="neutral.600">
                    Last synchronized: {new Date(settings.dataSync.lastSync).toLocaleString()}
                  </Typography>
                </div>
              )}
            </>
          )}
        </FormSection>
      </SettingsCard>
      
      <SettingsCard
        title="Connected Platforms"
        description="Manage your connections to e-commerce platforms and marketplaces."
      >
        <PlatformGrid>
          <PlatformCard 
            variant="outlined" 
            connected={!!settings.connectedPlatforms.shopify?.connected}
          >
            <PlatformHeader>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PlatformLogo>S</PlatformLogo>
                <PlatformInfo>
                  <Typography variant="h5">Shopify</Typography>
                  {settings.connectedPlatforms.shopify?.connected && (
                    <Typography variant="body2" color="neutral.600">
                      {settings.connectedPlatforms.shopify.storeUrl}
                    </Typography>
                  )}
                </PlatformInfo>
              </div>
              {settings.connectedPlatforms.shopify?.connected ? (
                <Button variant="tertiary" size="small">
                  Disconnect
                </Button>
              ) : (
                <Button variant="secondary" size="small">
                  Connect
                </Button>
              )}
            </PlatformHeader>
            
            {settings.connectedPlatforms.shopify?.connected ? (
              <Typography variant="body2" color="semantic.success.main">
                Connected
              </Typography>
            ) : (
              <Typography variant="body2" color="neutral.600">
                Not connected
              </Typography>
            )}
          </PlatformCard>
          
          <PlatformCard 
            variant="outlined" 
            connected={!!settings.connectedPlatforms.magento?.connected}
          >
            <PlatformHeader>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PlatformLogo>M</PlatformLogo>
                <PlatformInfo>
                  <Typography variant="h5">Magento</Typography>
                  {settings.connectedPlatforms.magento?.connected && (
                    <Typography variant="body2" color="neutral.600">
                      {settings.connectedPlatforms.magento.storeUrl}
                    </Typography>
                  )}
                </PlatformInfo>
              </div>
              {settings.connectedPlatforms.magento?.connected ? (
                <Button variant="tertiary" size="small">
                  Disconnect
                </Button>
              ) : (
                <Button variant="secondary" size="small">
                  Connect
                </Button>
              )}
            </PlatformHeader>
            
            {settings.connectedPlatforms.magento?.connected ? (
              <Typography variant="body2" color="semantic.success.main">
                Connected
              </Typography>
            ) : (
              <Typography variant="body2" color="neutral.600">
                Not connected
              </Typography>
            )}
          </PlatformCard>
          
          <PlatformCard 
            variant="outlined" 
            connected={!!settings.connectedPlatforms.woocommerce?.connected}
          >
            <PlatformHeader>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PlatformLogo>W</PlatformLogo>
                <PlatformInfo>
                  <Typography variant="h5">WooCommerce</Typography>
                  {settings.connectedPlatforms.woocommerce?.connected && (
                    <Typography variant="body2" color="neutral.600">
                      {settings.connectedPlatforms.woocommerce.storeUrl}
                    </Typography>
                  )}
                </PlatformInfo>
              </div>
              {settings.connectedPlatforms.woocommerce?.connected ? (
                <Button variant="tertiary" size="small">
                  Disconnect
                </Button>
              ) : (
                <Button variant="secondary" size="small">
                  Connect
                </Button>
              )}
            </PlatformHeader>
            
            {settings.connectedPlatforms.woocommerce?.connected ? (
              <Typography variant="body2" color="semantic.success.main">
                Connected
              </Typography>
            ) : (
              <Typography variant="body2" color="neutral.600">
                Not connected
              </Typography>
            )}
          </PlatformCard>
          
          <PlatformCard 
            variant="outlined" 
            connected={!!settings.connectedPlatforms.bigcommerce?.connected}
          >
            <PlatformHeader>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PlatformLogo>B</PlatformLogo>
                <PlatformInfo>
                  <Typography variant="h5">BigCommerce</Typography>
                  {settings.connectedPlatforms.bigcommerce?.connected && (
                    <Typography variant="body2" color="neutral.600">
                      {settings.connectedPlatforms.bigcommerce.storeUrl}
                    </Typography>
                  )}
                </PlatformInfo>
              </div>
              {settings.connectedPlatforms.bigcommerce?.connected ? (
                <Button variant="tertiary" size="small">
                  Disconnect
                </Button>
              ) : (
                <Button variant="secondary" size="small">
                  Connect
                </Button>
              )}
            </PlatformHeader>
            
            {settings.connectedPlatforms.bigcommerce?.connected ? (
              <Typography variant="body2" color="semantic.success.main">
                Connected
              </Typography>
            ) : (
              <Typography variant="body2" color="neutral.600">
                Not connected
              </Typography>
            )}
          </PlatformCard>
        </PlatformGrid>
      </SettingsCard>
    </div>
  );
};

export default IntegrationSettingsPage;