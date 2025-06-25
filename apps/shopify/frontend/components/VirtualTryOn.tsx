import React, { useState, useCallback } from 'react';
import {
  Card,
  Layout,
  FormLayout,
  Select,
  Button,
  Stack,
  Heading,
  TextStyle,
  Banner,
  RangeSlider,
  ChoiceList,
} from '@shopify/polaris';

interface TryOnSettings {
  cameraMode: 'front' | 'rear';
  quality: 'low' | 'medium' | 'high';
  autoCapture: boolean;
  captureDelay: number;
  enableAR: boolean;
  enableFaceTracking: boolean;
  enableLighting: boolean;
}

const DEFAULT_SETTINGS: TryOnSettings = {
  cameraMode: 'front',
  quality: 'medium',
  autoCapture: true,
  captureDelay: 3,
  enableAR: true,
  enableFaceTracking: true,
  enableLighting: true,
};

export function VirtualTryOn() {
  const [settings, setSettings] = useState<TryOnSettings>(DEFAULT_SETTINGS);
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  const handleSettingChange = useCallback(<K extends keyof TryOnSettings>(key: K, value: TryOnSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await fetch('/api/virtual-try-on/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      // Show success message
    } catch (error) {
      // Show error message
    }
  }, [settings]);

  return (
    <Layout>
      <Layout.Section>
        <Card sectioned>
          <Stack vertical spacing="tight">
            <Heading>Virtual Try-On Settings</Heading>
            <TextStyle variation="subdued">
              Configure how the virtual try-on experience works for your customers
            </TextStyle>
          </Stack>
        </Card>

        <Card sectioned>
          <FormLayout>
            <Select
              label="Camera Mode"
              options={[
                { label: 'Front Camera', value: 'front' },
                { label: 'Rear Camera', value: 'rear' },
              ]}
              value={settings.cameraMode}
              onChange={(value: string) => handleSettingChange('cameraMode', value as 'front' | 'rear')}
              helpText="Choose which camera to use for try-on"
            />

            <Select
              label="Image Quality"
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
              ]}
              value={settings.quality}
              onChange={(value: string) => handleSettingChange('quality', value as 'low' | 'medium' | 'high')}
              helpText="Higher quality requires more processing power"
            />

            <ChoiceList
              title="Features"
              choices={[
                {
                  label: 'Auto Capture',
                  value: 'autoCapture',
                  helpText: 'Automatically capture image when face is detected',
                },
                {
                  label: 'AR Mode',
                  value: 'enableAR',
                  helpText: 'Enable augmented reality features',
                },
                {
                  label: 'Face Tracking',
                  value: 'enableFaceTracking',
                  helpText: 'Track face movements in real-time',
                },
                {
                  label: 'Lighting Adjustment',
                  value: 'enableLighting',
                  helpText: 'Automatically adjust for lighting conditions',
                },
              ]}
              selected={Object.entries(settings)
                .filter(([_, value]) => value === true)
                .map(([key]) => key)}
              onChange={(values: string[]) => {
                const newSettings = { ...settings };
                (['autoCapture', 'enableAR', 'enableFaceTracking', 'enableLighting'] as const).forEach(key => {
                  newSettings[key] = values.includes(key);
                });
                setSettings(newSettings);
              }}
            />

            {settings.autoCapture && (
              <RangeSlider
                label="Capture Delay (seconds)"
                value={settings.captureDelay}
                min={1}
                max={10}
                output
                onChange={(value: number) => handleSettingChange('captureDelay', value)}
                helpText="Time to wait before auto-capturing"
              />
            )}
          </FormLayout>
        </Card>

        <Card sectioned>
          <Banner status="info">
            Virtual try-on features require modern browser capabilities. Some features may not be available on all devices.
          </Banner>
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

        <Card sectioned>
          <Stack vertical spacing="tight">
            <Heading>Preview</Heading>
            <div style={{ 
              width: '100%', 
              height: 200, 
              backgroundColor: '#f4f6f8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px'
            }}>
              {isPreviewActive ? (
                <div id="try-on-preview" />
              ) : (
                <Button onClick={() => setIsPreviewActive(true)}>
                  Start Preview
                </Button>
              )}
            </div>
          </Stack>
        </Card>
      </Layout.Section>
    </Layout>
  );
}
