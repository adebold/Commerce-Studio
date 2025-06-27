import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Typography, Input, Card } from '../../../design-system';
import { FormSection, SettingsCard, ColorPicker, ToggleSwitch } from '../../../components/settings';
import { settingsService, AppearanceSettings } from '../../../services/settings';

const PreviewContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.spacing[24]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  overflow: hidden;
`;

const PreviewHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
`;

const PreviewContent = styled.div`
  padding: ${({ theme }) => theme.spacing.spacing[24]};
`;

const WidgetPreview = styled.div<{
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: string;
}>`
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  border-radius: ${({ borderRadius }) => borderRadius};
  overflow: hidden;
  font-family: ${({ fontFamily }) => fontFamily};
  max-width: 400px;
  margin: 0 auto;
`;

const WidgetHeader = styled.div<{ primaryColor: string; showLogo: boolean }>`
  background-color: ${({ primaryColor }) => primaryColor};
  color: white;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: ${({ showLogo }) => (showLogo ? 'space-between' : 'center')};
`;

const WidgetContent = styled.div<{ secondaryColor: string }>`
  background-color: ${({ secondaryColor }) => secondaryColor};
  padding: 16px;
`;

const WidgetButton = styled.button<{
  primaryColor: string;
  borderRadius: string;
  buttonStyle: string;
}>`
  background-color: ${({ primaryColor }) => primaryColor};
  color: white;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
  
  ${({ buttonStyle, borderRadius }) => {
    if (buttonStyle === 'rounded') {
      return `border-radius: ${borderRadius};`;
    } else if (buttonStyle === 'pill') {
      return 'border-radius: 9999px;';
    } else {
      return 'border-radius: 0;';
    }
  }}
`;

const WidgetLogo = styled.div`
  width: 100px;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImagePreview = styled.div<{ src?: string }>`
  width: 100%;
  height: 120px;
  border: 1px dashed ${({ theme }) => theme.colors.neutral[300]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  background-image: ${({ src }) => (src ? `url(${src})` : 'none')};
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
`;

const FileUploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing.spacing[8]} ${theme.spacing.spacing[16]}`};
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  color: ${({ theme }) => theme.colors.neutral[800]};
  border-radius: 4px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[200]};
  }
  
  input {
    display: none;
  }
`;

/**
 * AppearanceSettingsPage Component
 * 
 * Page for managing appearance settings, widget customization, and branding.
 */
const AppearanceSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppearanceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const appearanceSettings = await settingsService.getSettingsSection('appearance');
        setSettings(appearanceSettings);
        setLoading(false);
      } catch (error) {
        console.error('Error loading appearance settings:', error);
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const handleWidgetChange = (field: string, value: string | boolean) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      widget: {
        ...settings.widget,
        [field]: value,
      },
    });
  };
  
  const handleBrandingChange = (field: string, value: string) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      branding: {
        ...settings.branding,
        [field]: value,
      },
    });
  };
  
  const handleEmailTemplateChange = (field: string, value: string | boolean) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      emailTemplates: {
        ...settings.emailTemplates,
        [field]: value,
      },
    });
  };
  
  const handleSaveWidget = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await settingsService.updateSettings('appearance', {
        widget: settings.widget,
      });
      alert('Widget settings saved successfully!');
    } catch (error) {
      console.error('Error saving widget settings:', error);
      alert('Failed to save widget settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveBranding = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await settingsService.updateSettings('appearance', {
        branding: settings.branding,
      });
      alert('Branding settings saved successfully!');
    } catch (error) {
      console.error('Error saving branding settings:', error);
      alert('Failed to save branding settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveEmailTemplates = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await settingsService.updateSettings('appearance', {
        emailTemplates: settings.emailTemplates,
      });
      alert('Email template settings saved successfully!');
    } catch (error) {
      console.error('Error saving email template settings:', error);
      alert('Failed to save email template settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Card variant="outlined">
        <Card.Content>
          <Typography variant="body1" align="center">
            Loading appearance settings...
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
            Failed to load appearance settings. Please refresh the page and try again.
          </Typography>
        </Card.Content>
      </Card>
    );
  }
  
  return (
    <div>
      <Typography variant="h3" gutterBottom>
        Appearance Settings
      </Typography>
      
      <SettingsCard
        title="Widget Customization"
        description="Customize the appearance of the VARAi widget on your website."
        onSave={handleSaveWidget}
        saving={saving}
      >
        <FormSection title="Colors">
          <FormRow>
            <ColorPicker
              id="primary-color"
              label="Primary Color"
              description="Used for buttons, headers, and accents"
              value={settings.widget.primaryColor}
              onChange={(color) => handleWidgetChange('primaryColor', color)}
            />
            <ColorPicker
              id="secondary-color"
              label="Secondary Color"
              description="Used for backgrounds and subtle elements"
              value={settings.widget.secondaryColor}
              onChange={(color) => handleWidgetChange('secondaryColor', color)}
            />
          </FormRow>
        </FormSection>
        
        <FormSection title="Typography">
          <Input
            label="Font Family"
            value={settings.widget.fontFamily}
            onChange={(e) => handleWidgetChange('fontFamily', e.target.value)}
            placeholder="e.g., Arial, sans-serif"
            fullWidth
          />
        </FormSection>
        
        <FormSection title="Shape">
          <FormRow>
            <div>
              <Typography variant="body1" gutterBottom>
                Border Radius
              </Typography>
              <Input
                value={settings.widget.borderRadius}
                onChange={(e) => handleWidgetChange('borderRadius', e.target.value)}
                placeholder="e.g., 8px"
              />
            </div>
            <div>
              <Typography variant="body1" gutterBottom>
                Button Style
              </Typography>
              <select
                id="button-style"
                aria-label="Button Style"
                value={settings.widget.buttonStyle}
                onChange={(e) => handleWidgetChange('buttonStyle', e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
                <option value="pill">Pill</option>
              </select>
            </div>
          </FormRow>
        </FormSection>
        
        <FormSection title="Branding">
          <ToggleSwitch
            id="show-logo"
            label="Show Logo"
            description="Display your logo in the widget header"
            checked={settings.widget.showLogo}
            onChange={(checked) => handleWidgetChange('showLogo', checked)}
          />
          
          {settings.widget.customCss !== undefined && (
            <div style={{ marginTop: '24px' }}>
              <Typography variant="body1" gutterBottom>
                Custom CSS
              </Typography>
              <textarea
                value={settings.widget.customCss || ''}
                onChange={(e) => handleWidgetChange('customCss', e.target.value)}
                placeholder="Enter custom CSS here..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          )}
        </FormSection>
        
        <PreviewContainer>
          <PreviewHeader>
            <Typography variant="body1" gutterBottom>
              Widget Preview
            </Typography>
          </PreviewHeader>
          <PreviewContent>
            <WidgetPreview
              primaryColor={settings.widget.primaryColor}
              secondaryColor={settings.widget.secondaryColor}
              fontFamily={settings.widget.fontFamily}
              borderRadius={settings.widget.borderRadius}
              buttonStyle={settings.widget.buttonStyle}
            >
              <WidgetHeader 
                primaryColor={settings.widget.primaryColor}
                showLogo={settings.widget.showLogo}
              >
                {settings.widget.showLogo && <WidgetLogo>LOGO</WidgetLogo>}
                <Typography variant="body1" style={{ color: 'white' }}>
                  Virtual Try-On
                </Typography>
              </WidgetHeader>
              <WidgetContent secondaryColor={settings.widget.secondaryColor}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <Typography variant="body1">
                    Try on our frames virtually!
                  </Typography>
                  <Typography variant="body2" style={{ marginTop: '8px' }}>
                    See how our eyewear looks on you before you buy.
                  </Typography>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <WidgetButton
                    primaryColor={settings.widget.primaryColor}
                    borderRadius={settings.widget.borderRadius}
                    buttonStyle={settings.widget.buttonStyle}
                  >
                    Start Try-On
                  </WidgetButton>
                </div>
              </WidgetContent>
            </WidgetPreview>
          </PreviewContent>
        </PreviewContainer>
      </SettingsCard>
      
      <SettingsCard
        title="Branding"
        description="Manage your brand assets and identity across the platform."
        onSave={handleSaveBranding}
        saving={saving}
      >
        <FormSection title="Logo">
          <Typography variant="body2" gutterBottom>
            Upload your company logo (recommended size: 200x60px, PNG or SVG format)
          </Typography>
          <div>
            <FileUploadButton>
              Upload Logo
              <input
                type="file"
                accept="image/*"
                aria-label="Upload logo file"
                title="Upload logo file"
              />
            </FileUploadButton>
            <ImagePreview src={settings.branding.logo} />
          </div>
        </FormSection>
        
        <FormSection title="Favicon">
          <Typography variant="body2" gutterBottom>
            Upload your favicon (recommended size: 32x32px, PNG or ICO format)
          </Typography>
          <div>
            <FileUploadButton>
              Upload Favicon
              <input
                type="file"
                accept="image/*"
                aria-label="Upload favicon file"
                title="Upload favicon file"
              />
            </FileUploadButton>
            <ImagePreview src={settings.branding.favicon} />
          </div>
        </FormSection>
        
        <FormSection title="Company Information">
          <Input
            label="Company Name"
            value={settings.branding.companyName}
            onChange={(e) => handleBrandingChange('companyName', e.target.value)}
            fullWidth
          />
          <Input
            label="Tagline"
            value={settings.branding.tagline || ''}
            onChange={(e) => handleBrandingChange('tagline', e.target.value)}
            placeholder="Your company tagline or slogan"
            fullWidth
          />
        </FormSection>
      </SettingsCard>
      
      <SettingsCard
        title="Email Templates"
        description="Customize the appearance of emails sent from the platform."
        onSave={handleSaveEmailTemplates}
        saving={saving}
      >
        <FormSection title="Colors">
          <FormRow>
            <ColorPicker
              id="header-color"
              label="Header Color"
              value={settings.emailTemplates.headerColor}
              onChange={(color) => handleEmailTemplateChange('headerColor', color)}
            />
            <ColorPicker
              id="footer-color"
              label="Footer Color"
              value={settings.emailTemplates.footerColor}
              onChange={(color) => handleEmailTemplateChange('footerColor', color)}
            />
          </FormRow>
        </FormSection>
        
        <FormSection title="Typography">
          <Input
            label="Font Family"
            value={settings.emailTemplates.fontFamily}
            onChange={(e) => handleEmailTemplateChange('fontFamily', e.target.value)}
            placeholder="e.g., Arial, sans-serif"
            fullWidth
          />
        </FormSection>
        
        <FormSection title="Branding">
          <ToggleSwitch
            id="email-show-logo"
            label="Show Logo"
            description="Display your logo in email headers"
            checked={settings.emailTemplates.showLogo}
            onChange={(checked) => handleEmailTemplateChange('showLogo', checked)}
          />
        </FormSection>
      </SettingsCard>
    </div>
  );
};

export default AppearanceSettingsPage;