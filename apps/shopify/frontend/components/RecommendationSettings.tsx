import React, { useState, useCallback } from 'react';
import {
  Card,
  Layout,
  FormLayout,
  Select,
  TextField,
  Button,
  Stack,
  Heading,
  TextStyle,
  RangeSlider,
  ChoiceList,
  Banner,
  Toast,
  Frame,
} from '@shopify/polaris';
import {
  RecommendationSettingsType,
  SettingChangeHandler,
  DEFAULT_SETTINGS,
} from '../types/settings';

export function RecommendationSettings() {
  const [settings, setSettings] = useState<RecommendationSettingsType>(DEFAULT_SETTINGS);
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState({ content: '', error: false });

  const handleSettingChange: SettingChangeHandler = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      // Save settings to Shopify metafields
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      setToastContent({
        content: 'Settings saved successfully',
        error: false,
      });
      setShowToast(true);
    } catch (error) {
      setToastContent({
        content: error instanceof Error ? error.message : 'An error occurred',
        error: true,
      });
      setShowToast(true);
    }
  }, [settings]);

  const toastMarkup = showToast ? (
    <Toast
      content={toastContent.content}
      error={toastContent.error}
      onDismiss={() => setShowToast(false)}
    />
  ) : null;

  return (
    <Frame>
      <Layout>
      <Layout.Section>
        <Card sectioned>
          <Stack vertical spacing="tight">
            <Heading>Recommendation Settings</Heading>
            <TextStyle variation="subdued">
              Configure how recommendations are generated and displayed
            </TextStyle>
          </Stack>
        </Card>

        <Card sectioned>
          <FormLayout>
            <Select
              label="Recommendation Algorithm"
              options={[
                { label: 'Style Based', value: 'style' },
                { label: 'Collaborative Filtering', value: 'collaborative' },
                { label: 'Hybrid', value: 'hybrid' },
              ]}
              value={settings.algorithm}
              onChange={(value) => handleSettingChange('algorithm', value)}
              helpText="Choose how recommendations are generated"
            />

            <RangeSlider
              label="Minimum Confidence Score"
              value={settings.minConfidence * 100}
              min={0}
              max={100}
              output
              onChange={(value) => handleSettingChange('minConfidence', value / 100)}
              helpText="Minimum confidence score required for recommendations"
            />

            <TextField
              label="Maximum Results"
              type="number"
              value={settings.maxResults.toString()}
              onChange={(value) => handleSettingChange('maxResults', parseInt(value, 10))}
              helpText="Maximum number of recommendations to show"
            />

            <ChoiceList
              title="Include in Recommendations"
              choices={[
                {
                  label: 'Price Range',
                  value: 'price',
                  helpText: 'Consider price when making recommendations',
                },
                {
                  label: 'Style',
                  value: 'style',
                  helpText: 'Consider style when making recommendations',
                },
                {
                  label: 'Brand',
                  value: 'brand',
                  helpText: 'Consider brand when making recommendations',
                },
              ]}
              selected={[
                ...(settings.includePricing ? ['price'] : []),
                ...(settings.includeStyle ? ['style'] : []),
                ...(settings.includeBrand ? ['brand'] : []),
              ]}
              onChange={(values) => {
                handleSettingChange('includePricing', values.includes('price'));
                handleSettingChange('includeStyle', values.includes('style'));
                handleSettingChange('includeBrand', values.includes('brand'));
              }}
            />
          </FormLayout>
        </Card>

        <Card sectioned>
          <Stack vertical spacing="tight">
            <Heading>Feature Weights</Heading>
            <TextStyle variation="subdued">
              Adjust the importance of each feature in the recommendation algorithm
            </TextStyle>

            <FormLayout>
              <RangeSlider
                label="Style Weight"
                value={settings.styleWeight * 100}
                min={0}
                max={100}
                output
                onChange={(value) => handleSettingChange('styleWeight', value / 100)}
                disabled={!settings.includeStyle}
              />

              <RangeSlider
                label="Price Weight"
                value={settings.priceWeight * 100}
                min={0}
                max={100}
                output
                onChange={(value) => handleSettingChange('priceWeight', value / 100)}
                disabled={!settings.includePricing}
              />

              <RangeSlider
                label="Brand Weight"
                value={settings.brandWeight * 100}
                min={0}
                max={100}
                output
                onChange={(value) => handleSettingChange('brandWeight', value / 100)}
                disabled={!settings.includeBrand}
              />
            </FormLayout>

            <Banner status="info">
              Total weight should equal 100%. Current total:{' '}
              {((settings.styleWeight + settings.priceWeight + settings.brandWeight) * 100).toFixed(0)}%
            </Banner>
          </Stack>
        </Card>
      </Layout.Section>

      <Layout.Section secondary>
        <Card sectioned>
          <Stack vertical spacing="tight">
            <Heading>Actions</Heading>
            <Stack distribution="equalSpacing">
              <Button onClick={() => setSettings(DEFAULT_SETTINGS)}>
                Reset to Defaults
              </Button>
              <Button primary onClick={handleSave}>
                Save Settings
              </Button>
            </Stack>
          </Stack>
        </Card>
        {toastMarkup}

        <Card sectioned>
          <Stack vertical spacing="tight">
            <Heading>Preview</Heading>
            <Button fullWidth>
              Generate Sample Recommendations
            </Button>
          </Stack>
        </Card>
      </Layout.Section>
    </Layout>
    </Frame>
  );
}

// Type definitions for event handlers
type SelectChangeHandler = (value: string) => void;
type RangeChangeHandler = (value: number) => void;
type TextChangeHandler = (value: string) => void;
type ChoiceListChangeHandler = (value: string[]) => void;
