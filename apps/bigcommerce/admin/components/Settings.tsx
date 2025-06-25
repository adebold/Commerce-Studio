import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Form,
  FormGroup,
  H1,
  H2,
  Input,
  Panel,
  Select,
  Tabs,
  Text,
  Tooltip
} from '@bigcommerce/big-design';
import { InfoIcon } from '@bigcommerce/big-design-icons';
import { ApiClient } from '../../lib/api-client';

interface SettingsProps {
  apiClient: ApiClient;
}

interface SettingsFormData {
  api_key: string;
  api_url: string;
  enable_virtual_try_on: boolean;
  enable_recommendations: boolean;
  enable_face_shape_detection: boolean;
  enable_style_scoring: boolean;
  enable_product_comparison: boolean;
  enable_customer_measurements: boolean;
  recommendations_limit: number;
  recommendation_type: 'similar' | 'complementary' | 'style_based' | 'face_shape';
  enable_analytics: boolean;
  ga4_measurement_id: string;
  track_product_views: boolean;
  track_try_ons: boolean;
  track_recommendations: boolean;
  track_face_shape_detection: boolean;
  track_style_score_views: boolean;
  track_product_comparisons: boolean;
  dashboard_metrics: string[];
}

const Settings: React.FC<SettingsProps> = ({ apiClient }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [formData, setFormData] = useState<SettingsFormData>({
    api_key: '',
    api_url: 'https://api.varai.ai/v1',
    enable_virtual_try_on: true,
    enable_recommendations: true,
    enable_face_shape_detection: true,
    enable_style_scoring: true,
    enable_product_comparison: true,
    enable_customer_measurements: true,
    recommendations_limit: 4,
    recommendation_type: 'similar',
    enable_analytics: true,
    ga4_measurement_id: '',
    track_product_views: true,
    track_try_ons: true,
    track_recommendations: true,
    track_face_shape_detection: true,
    track_style_score_views: true,
    track_product_comparisons: true,
    dashboard_metrics: ['views', 'try_ons', 'recommendations', 'face_shapes']
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const settings = await apiClient.getSettings();
        setFormData(prevData => ({
          ...prevData,
          ...settings
        }));
        setError(null);
      } catch (err) {
        setError('Failed to load settings. Please try again later.');
        console.error('Settings fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [apiClient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: string) => (value: any) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await apiClient.updateSettings(formData);
      setSuccess(true);
      setError(null);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to save settings. Please try again later.');
      console.error('Settings save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', title: 'General' },
    { id: 'virtual-try-on', title: 'Virtual Try-On' },
    { id: 'recommendations', title: 'Recommendations' },
    { id: 'face-shape', title: 'Face Shape' },
    { id: 'style-scoring', title: 'Style Scoring' },
    { id: 'analytics', title: 'Analytics' }
  ];

  if (loading) {
    return (
      <Box marginY="xxLarge" marginX="auto" textAlign="center">
        <Text>Loading settings...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <H1>VARAi Settings</H1>
      
      <Tabs
        activeTab={activeTab}
        items={tabs}
        onTabClick={setActiveTab}
      />
      
      <Form onSubmit={handleSubmit}>
        {error && (
          <Panel header="Error" type="error" marginBottom="medium">
            <Text>{error}</Text>
          </Panel>
        )}
        
        {success && (
          <Panel header="Success" type="success" marginBottom="medium">
            <Text>Settings saved successfully.</Text>
          </Panel>
        )}
        
        {activeTab === 'general' && (
          <Box marginY="medium">
            <H2>General Settings</H2>
            
            <FormGroup>
              <Input
                label="VARAi API Key"
                name="api_key"
                value={formData.api_key}
                onChange={handleInputChange}
                required
                description="Your VARAi API key from the VARAi dashboard"
              />
            </FormGroup>
            
            <FormGroup>
              <Input
                label="VARAi API URL"
                name="api_url"
                value={formData.api_url}
                onChange={handleInputChange}
                description="The VARAi API endpoint URL"
              />
            </FormGroup>
            
            <FormGroup>
              <Checkbox
                label="Enable Virtual Try-On"
                name="enable_virtual_try_on"
                checked={formData.enable_virtual_try_on}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Checkbox
                label="Enable Recommendations"
                name="enable_recommendations"
                checked={formData.enable_recommendations}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Checkbox
                label="Enable Face Shape Detection"
                name="enable_face_shape_detection"
                checked={formData.enable_face_shape_detection}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Checkbox
                label="Enable Style Scoring"
                name="enable_style_scoring"
                checked={formData.enable_style_scoring}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Checkbox
                label="Enable Product Comparison"
                name="enable_product_comparison"
                checked={formData.enable_product_comparison}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Checkbox
                label="Enable Customer Measurements"
                name="enable_customer_measurements"
                checked={formData.enable_customer_measurements}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Box>
        )}
        
        {activeTab === 'virtual-try-on' && (
          <Box marginY="medium">
            <H2>Virtual Try-On Settings</H2>
            
            <FormGroup>
              <Checkbox
                label="Enable Virtual Try-On"
                name="enable_virtual_try_on"
                checked={formData.enable_virtual_try_on}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Checkbox
                label="Enable Face Shape Detection"
                name="enable_face_shape_detection"
                checked={formData.enable_face_shape_detection}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Checkbox
                label="Enable Customer Measurements"
                name="enable_customer_measurements"
                checked={formData.enable_customer_measurements}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Box>
        )}
        
        {activeTab === 'recommendations' && (
          <Box marginY="medium">
            <H2>Recommendations Settings</H2>
            
            <FormGroup>
              <Checkbox
                label="Enable Recommendations"
                name="enable_recommendations"
                checked={formData.enable_recommendations}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Input
                type="number"
                label="Number of Recommendations"
                name="recommendations_limit"
                value={formData.recommendations_limit.toString()}
                onChange={handleInputChange}
                min={1}
                max={12}
              />
            </FormGroup>
            
            <FormGroup>
              <Select
                label="Recommendation Type"
                name="recommendation_type"
                options={[
                  { value: 'similar', content: 'Similar Products' },
                  { value: 'complementary', content: 'Complementary Products' },
                  { value: 'style_based', content: 'Style-Based' },
                  { value: 'face_shape', content: 'Face Shape Compatible' }
                ]}
                value={formData.recommendation_type}
                onOptionChange={handleSelectChange('recommendation_type')}
              />
            </FormGroup>
          </Box>
        )}
        
        {activeTab === 'face-shape' && (
          <Box marginY="medium">
            <H2>Face Shape Settings</H2>
            
            <FormGroup>
              <Checkbox
                label="Enable Face Shape Detection"
                name="enable_face_shape_detection"
                checked={formData.enable_face_shape_detection}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <Text>
              Face shape detection allows customers to discover their face shape and get personalized recommendations based on face shape compatibility.
            </Text>
          </Box>
        )}
        
        {activeTab === 'style-scoring' && (
          <Box marginY="medium">
            <H2>Style Scoring Settings</H2>
            
            <FormGroup>
              <Checkbox
                label="Enable Style Scoring"
                name="enable_style_scoring"
                checked={formData.enable_style_scoring}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <Text>
              Style scoring evaluates products based on style metrics and provides a score that helps customers make informed decisions.
            </Text>
          </Box>
        )}
        
        {activeTab === 'analytics' && (
          <Box marginY="medium">
            <H2>Analytics Settings</H2>
            
            <FormGroup>
              <Checkbox
                label="Enable Analytics"
                name="enable_analytics"
                checked={formData.enable_analytics}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Input
                label={
                  <Flex alignItems="center">
                    <Text>GA4 Measurement ID</Text>
                    <Tooltip
                      placement="right"
                      trigger={
                        <Box marginLeft="xSmall">
                          <InfoIcon size="medium" />
                        </Box>
                      }
                    >
                      Your Google Analytics 4 Measurement ID (e.g., G-XXXXXXXXXX)
                    </Tooltip>
                  </Flex>
                }
                name="ga4_measurement_id"
                value={formData.ga4_measurement_id}
                onChange={handleInputChange}
                placeholder="G-XXXXXXXXXX"
              />
            </FormGroup>
            
            <FormGroup>
              <Checkbox
                label="Track Product Views"
                name="track_product_views"
                checked={formData.track_product_views}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Checkbox
                label="Track Virtual Try-Ons"
                name="track_try_ons"
                checked={formData.track_try_ons}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Checkbox
                label="Track Recommendations"
                name="track_recommendations"
                checked={formData.track_recommendations}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Checkbox
                label="Track Face Shape Detection"
                name="track_face_shape_detection"
                checked={formData.track_face_shape_detection}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Checkbox
                label="Track Style Score Views"
                name="track_style_score_views"
                checked={formData.track_style_score_views}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Checkbox
                label="Track Product Comparisons"
                name="track_product_comparisons"
                checked={formData.track_product_comparisons}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Box>
        )}
        
        <Flex justifyContent="flex-end" marginTop="large">
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
          >
            Save Settings
          </Button>
        </Flex>
      </Form>
    </Box>
  );
};

export default Settings;