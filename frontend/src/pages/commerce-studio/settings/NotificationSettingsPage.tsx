import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Typography, Input, Card } from '../../../design-system';
import { FormSection, SettingsCard, ToggleSwitch } from '../../../components/settings';
import { settingsService, NotificationSettings } from '../../../services/settings';

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const NotificationGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[12]};
`;

/**
 * NotificationSettingsPage Component
 * 
 * Page for managing notification preferences and alert thresholds.
 */
const NotificationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notificationSettings = await settingsService.getSettingsSection('notification');
        setSettings(notificationSettings);
        setLoading(false);
      } catch (error) {
        console.error('Error loading notification settings:', error);
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const handleEmailChange = (field: string, value: boolean) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      email: {
        ...settings.email,
        [field]: value,
      },
    });
  };
  
  const handleSystemChange = (field: string, value: boolean) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      system: {
        ...settings.system,
        [field]: value,
      },
    });
  };
  
  const handleThresholdChange = (field: string, value: string) => {
    if (!settings) return;
    
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;
    
    setSettings({
      ...settings,
      alertThresholds: {
        ...settings.alertThresholds,
        [field]: numValue,
      },
    });
  };
  
  const handleSaveEmailSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await settingsService.updateSettings('notification', {
        email: settings.email,
      });
      alert('Email notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving email notification settings:', error);
      alert('Failed to save email notification settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveSystemSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await settingsService.updateSettings('notification', {
        system: settings.system,
      });
      alert('System notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving system notification settings:', error);
      alert('Failed to save system notification settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveThresholdSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await settingsService.updateSettings('notification', {
        alertThresholds: settings.alertThresholds,
      });
      alert('Alert threshold settings saved successfully!');
    } catch (error) {
      console.error('Error saving alert threshold settings:', error);
      alert('Failed to save alert threshold settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Card variant="outlined">
        <Card.Content>
          <Typography variant="body1" align="center">
            Loading notification settings...
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
            Failed to load notification settings. Please refresh the page and try again.
          </Typography>
        </Card.Content>
      </Card>
    );
  }
  
  return (
    <div>
      <Typography variant="h3" gutterBottom>
        Notification Settings
      </Typography>
      
      <SettingsCard
        title="Email Notifications"
        description="Configure which email notifications you receive from the platform."
        onSave={handleSaveEmailSettings}
        saving={saving}
      >
        <FormSection title="Summary Reports">
          <NotificationGroup>
            <ToggleSwitch
              id="daily-summary"
              label="Daily Summary"
              description="Receive a daily summary of your store's performance"
              checked={settings.email.dailySummary}
              onChange={(checked) => handleEmailChange('dailySummary', checked)}
            />
            
            <ToggleSwitch
              id="weekly-summary"
              label="Weekly Summary"
              description="Receive a weekly summary of your store's performance"
              checked={settings.email.weeklySummary}
              onChange={(checked) => handleEmailChange('weeklySummary', checked)}
            />
          </NotificationGroup>
        </FormSection>
        
        <FormSection title="Alert Notifications">
          <NotificationGroup>
            <ToggleSwitch
              id="low-inventory-alerts"
              label="Low Inventory Alerts"
              description="Receive notifications when product inventory falls below threshold"
              checked={settings.email.lowInventoryAlerts}
              onChange={(checked) => handleEmailChange('lowInventoryAlerts', checked)}
            />
            
            <ToggleSwitch
              id="new-order-alerts"
              label="New Order Alerts"
              description="Receive notifications for new orders"
              checked={settings.email.newOrderAlerts}
              onChange={(checked) => handleEmailChange('newOrderAlerts', checked)}
            />
            
            <ToggleSwitch
              id="customer-support-requests"
              label="Customer Support Requests"
              description="Receive notifications for new customer support requests"
              checked={settings.email.customerSupportRequests}
              onChange={(checked) => handleEmailChange('customerSupportRequests', checked)}
            />
          </NotificationGroup>
        </FormSection>
        
        <FormSection title="System Notifications">
          <ToggleSwitch
            id="system-updates"
            label="System Updates"
            description="Receive notifications about platform updates and new features"
            checked={settings.email.systemUpdates}
            onChange={(checked) => handleEmailChange('systemUpdates', checked)}
          />
        </FormSection>
      </SettingsCard>
      
      <SettingsCard
        title="System Notifications"
        description="Configure how you receive notifications within the platform and on your devices."
        onSave={handleSaveSystemSettings}
        saving={saving}
      >
        <FormSection title="Notification Channels">
          <NotificationGroup>
            <ToggleSwitch
              id="browser-notifications"
              label="Browser Notifications"
              description="Receive notifications in your browser while using the platform"
              checked={settings.system.browserNotifications}
              onChange={(checked) => handleSystemChange('browserNotifications', checked)}
            />
            
            <ToggleSwitch
              id="desktop-notifications"
              label="Desktop Notifications"
              description="Receive notifications on your desktop even when the browser is minimized"
              checked={settings.system.desktopNotifications}
              onChange={(checked) => handleSystemChange('desktopNotifications', checked)}
            />
            
            <ToggleSwitch
              id="mobile-app-notifications"
              label="Mobile App Notifications"
              description="Receive push notifications on your mobile device"
              checked={settings.system.mobileAppNotifications}
              onChange={(checked) => handleSystemChange('mobileAppNotifications', checked)}
            />
          </NotificationGroup>
        </FormSection>
      </SettingsCard>
      
      <SettingsCard
        title="Alert Thresholds"
        description="Configure when alerts are triggered based on specific thresholds."
        onSave={handleSaveThresholdSettings}
        saving={saving}
      >
        <FormSection title="Inventory Thresholds">
          <FormRow>
            <div>
              <Typography variant="body1" gutterBottom>
                Low Inventory Threshold
              </Typography>
              <Typography variant="body2" color="neutral.600" gutterBottom>
                Send alerts when inventory falls below this level
              </Typography>
              <Input
                type="number"
                min={0}
                value={settings.alertThresholds.lowInventory}
                onChange={(e) => handleThresholdChange('lowInventory', e.target.value)}
                style={{ maxWidth: '100px' }}
              />
            </div>
          </FormRow>
        </FormSection>
        
        <FormSection title="Traffic Thresholds">
          <FormRow>
            <div>
              <Typography variant="body1" gutterBottom>
                High Traffic Threshold
              </Typography>
              <Typography variant="body2" color="neutral.600" gutterBottom>
                Send alerts when site traffic exceeds this many visitors per hour
              </Typography>
              <Input
                type="number"
                min={0}
                value={settings.alertThresholds.highTraffic}
                onChange={(e) => handleThresholdChange('highTraffic', e.target.value)}
                style={{ maxWidth: '100px' }}
              />
            </div>
            
            <div>
              <Typography variant="body1" gutterBottom>
                Order Volume Threshold
              </Typography>
              <Typography variant="body2" color="neutral.600" gutterBottom>
                Send alerts when order volume exceeds this many orders per day
              </Typography>
              <Input
                type="number"
                min={0}
                value={settings.alertThresholds.orderVolume}
                onChange={(e) => handleThresholdChange('orderVolume', e.target.value)}
                style={{ maxWidth: '100px' }}
              />
            </div>
          </FormRow>
        </FormSection>
      </SettingsCard>
    </div>
  );
};

export default NotificationSettingsPage;