import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Page,
  Layout,
  Card,
  Form,
  FormLayout,
  TextField,
  Select,
  Button,
  Stack,
  TextStyle,
  Banner,
  Checkbox,
  SkeletonBodyText,
  Collapsible,
  TextContainer,
  Link
} from '@shopify/polaris';
import { useApi } from '../providers/ApiProvider';

function Settings() {
  const { apiClient } = useApi();
  
  // Form states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Settings form data
  const [settings, setSettings] = useState({
    enabled: false,
    schedule: {
      cronExpression: '0 2 * * *' // Default: 2 AM daily
    },
    options: {
      includeDescription: true,
      includeTags: true,
      includeImages: true,
      prefixTitle: false,
      prefixSku: false,
      createVariants: true,
      productStatus: 'active',
      publishedScope: 'web',
      skipExisting: false
    }
  });
  
  // Fetch current settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/api/sync/settings');
      
      if (response.data) {
        setSettings(response.data);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Error loading settings. Please try again.');
      setLoading(false);
      console.error('Settings fetch error:', err);
    }
  }, [apiClient]);
  
  // Save settings
  const handleSaveSettings = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      await apiClient.post('/api/sync/settings', settings);
      
      setSuccess(true);
      setSaving(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Error saving settings. Please try again.');
      setSaving(false);
      console.error('Settings save error:', err);
    }
  }, [apiClient, settings]);
  
  // Handle form field changes
  const handleChange = useCallback((field, value) => {
    setSettings(prevSettings => {
      // For nested fields, we need to identify the correct level
      if (field.includes('.')) {
        const [level1, level2] = field.split('.');
        
        return {
          ...prevSettings,
          [level1]: {
            ...prevSettings[level1],
            [level2]: value
          }
        };
      } else if (field.includes('options.')) {
        // Handle options fields
        const optionField = field.replace('options.', '');
        
        return {
          ...prevSettings,
          options: {
            ...prevSettings.options,
            [optionField]: value
          }
        };
      } else {
        // Top level field
        return {
          ...prevSettings,
          [field]: value
        };
      }
    });
  }, []);
  
  // Product status options
  const productStatusOptions = useMemo(() => [
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' }
  ], []);
  
  // Published scope options
  const publishedScopeOptions = useMemo(() => [
    { label: 'Web (Online Store)', value: 'web' },
    { label: 'Global (All sales channels)', value: 'global' }
  ], []);
  
  // Common cron expressions
  const commonCronOptions = useMemo(() => [
    { label: 'Daily at 2 AM', value: '0 2 * * *' },
    { label: 'Daily at 10 PM', value: '0 22 * * *' },
    { label: 'Weekly on Sunday at 3 AM', value: '0 3 * * 0' },
    { label: 'Weekly on Monday at 1 AM', value: '0 1 * * 1' },
    { label: 'Monthly on the 1st at 4 AM', value: '0 4 1 * *' },
    { label: 'Custom', value: 'custom' }
  ], []);
  
  // Get cron expression label
  const getCronLabel = useCallback((cronExpression) => {
    const option = commonCronOptions.find(opt => opt.value === cronExpression);
    return option ? option.label : 'Custom';
  }, [commonCronOptions]);
  
  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  // Render loading state
  if (loading) {
    return (
      <Page title="Sync Settings">
        <Layout>
          <Layout.AnnotatedSection
            title="Schedule Settings"
            description="Configure when and how your products should sync."
          >
            <Card sectioned>
              <SkeletonBodyText />
            </Card>
          </Layout.AnnotatedSection>
          
          <Layout.AnnotatedSection
            title="Sync Options"
            description="Choose what product data to include in the sync."
          >
            <Card sectioned>
              <SkeletonBodyText />
            </Card>
          </Layout.AnnotatedSection>
        </Layout>
      </Page>
    );
  }
  
  return (
    <Page
      title="Sync Settings"
      breadcrumbs={[{ content: 'Dashboard', url: '/' }]}
    >
      <Form onSubmit={handleSaveSettings}>
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
              <p>Settings saved successfully.</p>
            </Banner>
          </Layout.Section>
        )}
        
        <Layout>
          <Layout.AnnotatedSection
            title="Schedule Settings"
            description="Configure when and how your products should sync from the eyewear database."
          >
            <Card sectioned>
              <FormLayout>
                <Checkbox
                  label="Enable scheduled sync"
                  checked={settings.enabled}
                  onChange={(value) => handleChange('enabled', value)}
                  helpText="When enabled, products will automatically sync on schedule."
                />
                
                {settings.enabled && (
                  <>
                    <Select
                      label="Sync frequency"
                      options={commonCronOptions}
                      value={settings.schedule.cronExpression}
                      onChange={(value) => {
                        if (value !== 'custom') {
                          handleChange('schedule.cronExpression', value);
                        }
                      }}
                      disabled={!settings.enabled}
                    />
                    
                    <TextField
                      label="Cron expression"
                      value={settings.schedule.cronExpression}
                      onChange={(value) => handleChange('schedule.cronExpression', value)}
                      disabled={!settings.enabled}
                      helpText="Use cron syntax to set a custom schedule."
                    />
                    
                    <TextContainer>
                      <p>
                        <TextStyle variation="subdued">
                          Current schedule: {getCronLabel(settings.schedule.cronExpression)}
                        </TextStyle>
                      </p>
                      <p>
                        <Link url="https://crontab.guru/" external>
                          Learn more about cron expressions
                        </Link>
                      </p>
                    </TextContainer>
                  </>
                )}
              </FormLayout>
            </Card>
          </Layout.AnnotatedSection>
          
          <Layout.AnnotatedSection
            title="Sync Options"
            description="Choose what product data to include when syncing from the eyewear database."
          >
            <Card sectioned>
              <FormLayout>
                <FormLayout.Group>
                  <Select
                    label="Product status"
                    options={productStatusOptions}
                    value={settings.options.productStatus}
                    onChange={(value) => handleChange('options.productStatus', value)}
                    helpText="Status of products when imported."
                  />
                  
                  <Select
                    label="Published scope"
                    options={publishedScopeOptions}
                    value={settings.options.publishedScope}
                    onChange={(value) => handleChange('options.publishedScope', value)}
                    helpText="Where products will be available."
                  />
                </FormLayout.Group>
                
                <FormLayout.Group>
                  <Checkbox
                    label="Include product descriptions"
                    checked={settings.options.includeDescription}
                    onChange={(value) => handleChange('options.includeDescription', value)}
                  />
                  
                  <Checkbox
                    label="Include product tags"
                    checked={settings.options.includeTags}
                    onChange={(value) => handleChange('options.includeTags', value)}
                  />
                </FormLayout.Group>
                
                <FormLayout.Group>
                  <Checkbox
                    label="Include product images"
                    checked={settings.options.includeImages}
                    onChange={(value) => handleChange('options.includeImages', value)}
                  />
                  
                  <Checkbox
                    label="Create variants"
                    checked={settings.options.createVariants}
                    onChange={(value) => handleChange('options.createVariants', value)}
                    helpText="Create product variants for different colors, sizes, etc."
                  />
                </FormLayout.Group>
                
                <Button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  plain
                  disclosure={showAdvanced ? 'up' : 'down'}
                >
                  Advanced options
                </Button>
                
                <Collapsible open={showAdvanced}>
                  <FormLayout.Group>
                    <Checkbox
                      label="Prefix product titles with brand name"
                      checked={settings.options.prefixTitle}
                      onChange={(value) => handleChange('options.prefixTitle', value)}
                      helpText="Example: 'Ray-Ban RB4165 Justin'"
                    />
                    
                    <Checkbox
                      label="Prefix SKUs with brand code"
                      checked={settings.options.prefixSku}
                      onChange={(value) => handleChange('options.prefixSku', value)}
                      helpText="Example: 'RB-4165-601/8G'"
                    />
                  </FormLayout.Group>
                  
                  <Checkbox
                    label="Skip existing products"
                    checked={settings.options.skipExisting}
                    onChange={(value) => handleChange('options.skipExisting', value)}
                    helpText="If enabled, products that already exist in Shopify will not be updated."
                  />
                </Collapsible>
              </FormLayout>
            </Card>
          </Layout.AnnotatedSection>
          
          <Layout.Section>
            <Stack distribution="trailing">
              <Button onClick={fetchSettings}>Cancel</Button>
              <Button primary loading={saving} submit>Save Settings</Button>
            </Stack>
          </Layout.Section>
        </Layout>
      </Form>
    </Page>
  );
}

export default Settings;