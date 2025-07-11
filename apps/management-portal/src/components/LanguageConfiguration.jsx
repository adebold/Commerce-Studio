import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Switch,
  Button,
  Chip,
  Grid,
  Alert,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import {
  Language as LanguageIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Public as PublicIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

const LanguageConfiguration = ({ tenantId, onSave }) => {
  const [config, setConfig] = useState({
    defaultLanguage: 'en-US',
    supportedLanguages: ['en-US'],
    autoDetectEnabled: true,
    fallbackLanguage: 'en-US',
    countryLanguageMapping: {},
    customTranslations: {}
  });

  const [availableLanguages] = useState([
    { code: 'en-US', name: 'English (US)', region: 'US', flag: '🇺🇸' },
    { code: 'nl-NL', name: 'Dutch (Netherlands)', region: 'NL', flag: '🇳🇱' },
    { code: 'de-DE', name: 'German (Germany)', region: 'DE', flag: '🇩🇪' },
    { code: 'es-ES', name: 'Spanish (Spain)', region: 'ES', flag: '🇪🇸' },
    { code: 'pt-PT', name: 'Portuguese (Portugal)', region: 'PT', flag: '🇵🇹' },
    { code: 'fr-FR', name: 'French (France)', region: 'FR', flag: '🇫🇷' },
    { code: 'de-AT', name: 'German (Austria)', region: 'AT', flag: '🇦🇹' },
    { code: 'de-CH', name: 'German (Switzerland)', region: 'CH', flag: '🇨🇭' },
    { code: 'fr-BE', name: 'French (Belgium)', region: 'BE', flag: '🇧🇪' },
    { code: 'nl-BE', name: 'Dutch (Belgium)', region: 'BE', flag: '🇧🇪' },
    { code: 'en-IE', name: 'English (Ireland)', region: 'IE', flag: '🇮🇪' }
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadLanguageConfiguration();
  }, [tenantId]);

  const loadLanguageConfiguration = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tenants/${tenantId}/language-config`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading language configuration:', error);
      setMessage({ type: 'error', text: 'Failed to load language configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleDefaultLanguageChange = (event) => {
    const newDefaultLanguage = event.target.value;
    setConfig(prev => ({
      ...prev,
      defaultLanguage: newDefaultLanguage,
      // Ensure default language is included in supported languages
      supportedLanguages: prev.supportedLanguages.includes(newDefaultLanguage) 
        ? prev.supportedLanguages 
        : [...prev.supportedLanguages, newDefaultLanguage]
    }));
  };

  const handleSupportedLanguageToggle = (languageCode) => {
    setConfig(prev => {
      const isCurrentlySupported = prev.supportedLanguages.includes(languageCode);
      
      if (isCurrentlySupported && languageCode === prev.defaultLanguage) {
        // Cannot remove default language
        setMessage({ type: 'warning', text: 'Cannot remove the default language from supported languages' });
        return prev;
      }

      const newSupportedLanguages = isCurrentlySupported
        ? prev.supportedLanguages.filter(lang => lang !== languageCode)
        : [...prev.supportedLanguages, languageCode];

      return {
        ...prev,
        supportedLanguages: newSupportedLanguages
      };
    });
  };

  const handleAutoDetectToggle = (event) => {
    setConfig(prev => ({
      ...prev,
      autoDetectEnabled: event.target.checked
    }));
  };

  const handleSaveConfiguration = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch(`/api/tenants/${tenantId}/language-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Language configuration saved successfully' });
        if (onSave) {
          onSave(config);
        }
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving language configuration:', error);
      setMessage({ type: 'error', text: 'Failed to save language configuration' });
    } finally {
      setLoading(false);
    }
  };

  const getLanguageInfo = (code) => {
    return availableLanguages.find(lang => lang.code === code);
  };

  const getMarketInsights = () => {
    const supportedRegions = config.supportedLanguages
      .map(lang => getLanguageInfo(lang))
      .filter(Boolean)
      .map(lang => lang.region);

    const uniqueRegions = [...new Set(supportedRegions)];
    
    const marketData = {
      'NL': { stores: 15, priority: 'High', market: 'Netherlands' },
      'DE': { stores: 25, priority: 'High', market: 'Germany' },
      'ES': { stores: 12, priority: 'High', market: 'Spain' },
      'BE': { stores: 8, priority: 'Medium', market: 'Belgium' },
      'AT': { stores: 6, priority: 'Medium', market: 'Austria' },
      'CH': { stores: 5, priority: 'Medium', market: 'Switzerland' },
      'IE': { stores: 4, priority: 'Low', market: 'Ireland' },
      'PT': { stores: 3, priority: 'Low', market: 'Portugal' },
      'FR': { stores: 2, priority: 'Low', market: 'France' }
    };

    return uniqueRegions.map(region => marketData[region]).filter(Boolean);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LanguageIcon />
        Language Configuration
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Default Language Selection */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Default Language
              </Typography>
              <FormControl fullWidth>
                <FormLabel>Primary language for your store</FormLabel>
                <Select
                  value={config.defaultLanguage}
                  onChange={handleDefaultLanguageChange}
                  disabled={loading}
                >
                  {availableLanguages.map((language) => (
                    <MenuItem key={language.code} value={language.code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Auto-Detection Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Auto-Detection
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.autoDetectEnabled}
                    onChange={handleAutoDetectToggle}
                    disabled={loading}
                  />
                }
                label="Automatically detect customer language"
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                When enabled, the system will detect customer language based on browser settings and location
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Supported Languages */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Supported Languages
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Select the languages you want to support in your store
              </Typography>
              
              <Grid container spacing={1}>
                {availableLanguages.map((language) => {
                  const isSupported = config.supportedLanguages.includes(language.code);
                  const isDefault = config.defaultLanguage === language.code;
                  
                  return (
                    <Grid item key={language.code}>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{language.flag}</span>
                            <span>{language.name}</span>
                          </Box>
                        }
                        variant={isSupported ? 'filled' : 'outlined'}
                        color={isDefault ? 'primary' : isSupported ? 'secondary' : 'default'}
                        onClick={() => handleSupportedLanguageToggle(language.code)}
                        disabled={loading || isDefault}
                        sx={{ m: 0.5 }}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Market Insights */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PublicIcon />
                Market Coverage
              </Typography>
              
              <Grid container spacing={2}>
                {getMarketInsights().map((market) => (
                  <Grid item xs={12} sm={6} md={4} key={market.market}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {market.stores}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        stores in {market.market}
                      </Typography>
                      <Chip 
                        label={`${market.priority} Priority`} 
                        size="small" 
                        color={
                          market.priority === 'High' ? 'error' :
                          market.priority === 'Medium' ? 'warning' : 'success'
                        }
                        sx={{ mt: 1 }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveConfiguration}
              disabled={loading}
              size="large"
            >
              Save Language Configuration
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LanguageConfiguration;