# European Language Expansion Architecture

## Overview

This document outlines the architecture for expanding Commerce Studio to support major European languages and markets, targeting 25+ stores across Germany, Netherlands, Belgium, Austria, Spain, Ireland, and Switzerland.

## Current Status vs REVISED_ROADMAP.md

### Phase 1 Progress Analysis:
- **✅ Advanced Recommendation Engine**: Implemented in services/face-analysis-service
- **✅ Analytics Dashboard**: Implemented in apps/management-portal
- **🔄 Multi-Language Support (Dutch)**: Partially implemented, needs expansion

### Phase 2 European Expansion Required:
- **❌ Comprehensive European Language Support**: Not implemented
- **❌ European Customer Geo-Targeting**: Not implemented  
- **❌ Regional Compliance (GDPR)**: Not implemented

## Target European Markets

### Primary Markets
| Country | Language | ISO Code | Store Count | Priority |
|---------|----------|----------|-------------|----------|
| Germany | German | de-DE | 25 | High |
| Netherlands | Dutch | nl-NL | 15 | High |
| Spain | Spanish | es-ES | 12 | High |
| Belgium | Dutch/French | nl-BE/fr-BE | 8 | Medium |
| Austria | German | de-AT | 6 | Medium |
| Switzerland | German/French | de-CH/fr-CH | 5 | Medium |
| Ireland | English | en-IE | 4 | Low |

### Language Support Requirements
- **German**: Primary market (Germany, Austria, Switzerland)
- **Dutch**: Existing roadmap item (Netherlands, Belgium)
- **Spanish**: Growing market (Spain)
- **Portuguese**: Future expansion (Portugal)
- **French**: Secondary support (Belgium, Switzerland)

## Architecture Design

### 1. Multi-Language Service Infrastructure

```
services/
├── internationalization-service/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── LanguageController.js
│   │   │   ├── TranslationController.js
│   │   │   └── LocalizationController.js
│   │   ├── services/
│   │   │   ├── LanguageDetectionService.js
│   │   │   ├── TranslationService.js
│   │   │   └── LocalizationService.js
│   │   ├── middleware/
│   │   │   ├── languageMiddleware.js
│   │   │   └── geoLocalizationMiddleware.js
│   │   └── locales/
│   │       ├── de-DE.json
│   │       ├── nl-NL.json
│   │       ├── es-ES.json
│   │       └── pt-PT.json
│   └── package.json
```

### 2. Language Detection Strategy

#### Two-Tier Approach:
1. **Tenant Default Language**: Configured per tenant in management portal
2. **User Language Detection**: Runtime detection with fallback

#### Detection Priority:
1. **User Preference**: Stored in session/cookies
2. **Browser Language**: Accept-Language header
3. **Geo-Location**: IP-based country detection
4. **Tenant Default**: Fallback to tenant configuration

### 3. Database Schema Extensions

```sql
-- Tenant language configuration
ALTER TABLE tenants ADD COLUMN default_language VARCHAR(10) DEFAULT 'en-US';
ALTER TABLE tenants ADD COLUMN supported_languages JSON;
ALTER TABLE tenants ADD COLUMN auto_detect_language BOOLEAN DEFAULT true;

-- User language preferences
CREATE TABLE user_language_preferences (
    id UUID PRIMARY KEY,
    user_id UUID,
    tenant_id UUID,
    language_code VARCHAR(10),
    detection_method VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Localized content
CREATE TABLE localized_content (
    id UUID PRIMARY KEY,
    content_key VARCHAR(255),
    language_code VARCHAR(10),
    content_value TEXT,
    tenant_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Translation Management System

#### Features:
- **Automatic Translation**: Google Translate API integration
- **Manual Override**: Tenant-specific customizations
- **Version Control**: Translation history and rollback
- **Bulk Management**: Import/export capabilities

#### Translation Keys Structure:
```json
{
  "consultation": {
    "welcome": "Welcome to your virtual consultation",
    "face_analysis": "Let's analyze your face shape",
    "recommendations": "Here are your personalized recommendations",
    "error_camera": "Camera access required for face analysis"
  },
  "products": {
    "frames": "Frames",
    "lenses": "Lenses",
    "sunglasses": "Sunglasses"
  },
  "ui": {
    "next": "Next",
    "back": "Back",
    "continue": "Continue",
    "cancel": "Cancel"
  }
}
```

### 5. Consultation System Integration

#### Updated Consultation Flow:
1. **Language Detection**: Determine user language
2. **Dialogflow Agent Selection**: Route to appropriate language agent
3. **Localized UI**: Render interface in selected language
4. **Translated Responses**: Return localized consultation responses

#### Dialogflow Multi-Language Setup:
```
dialogflow/
├── agents/
│   ├── en-US/
│   │   ├── intents/
│   │   └── entities/
│   ├── de-DE/
│   │   ├── intents/
│   │   └── entities/
│   ├── nl-NL/
│   │   ├── intents/
│   │   └── entities/
│   └── es-ES/
│       ├── intents/
│       └── entities/
```

### 6. Frontend Multi-Language Support

#### React i18n Integration:
```javascript
// Language context provider
const LanguageContext = createContext();

// Language detection hook
const useLanguageDetection = () => {
  const [language, setLanguage] = useState('en-US');
  
  useEffect(() => {
    // Detect language based on priority order
    const detectedLanguage = detectUserLanguage();
    setLanguage(detectedLanguage);
  }, []);
  
  return [language, setLanguage];
};

// Translation hook
const useTranslation = (namespace = 'common') => {
  const { language } = useContext(LanguageContext);
  
  const t = (key, params = {}) => {
    return getTranslation(language, namespace, key, params);
  };
  
  return { t };
};
```

### 7. Regional Compliance Features

#### GDPR Compliance:
- **Consent Management**: Cookie consent per region
- **Data Localization**: EU data stays in EU
- **Right to Erasure**: Data deletion capabilities
- **Privacy Controls**: Language-specific privacy policies

#### Implementation:
```javascript
// GDPR middleware
const gdprMiddleware = (req, res, next) => {
  const userCountry = getCountryFromIP(req.ip);
  
  if (isEUCountry(userCountry)) {
    req.gdprRequired = true;
    req.dataRetention = getEUDataRetention();
  }
  
  next();
};
```

### 8. Performance Optimization

#### CDN Strategy:
- **Regional CDNs**: Serve content from nearest location
- **Language-Specific Bundles**: Reduce bundle size per language
- **Caching Strategy**: Cache translated content aggressively

#### Bundle Optimization:
```javascript
// Webpack configuration for language splitting
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        locale: {
          test: /[\\/]locales[\\/]/,
          name: 'locale',
          chunks: 'all',
        },
      },
    },
  },
};
```

## Implementation Plan

### Phase 1: Infrastructure (Week 1-2)
1. **Create Internationalization Service**
   - Language detection service
   - Translation management system
   - Database schema updates

2. **Update Core Services**
   - Tenant management: language configuration
   - Customer experience: language preferences
   - Face analysis: multi-language support

### Phase 2: German Market (Week 3-4)
1. **German Language Implementation**
   - Create de-DE Dialogflow agent
   - Translate all UI components
   - Test with German-speaking users

2. **German Market Features**
   - GDPR compliance
   - Regional CDN setup
   - German-specific styling

### Phase 3: Dutch & Spanish Markets (Week 5-6)
1. **Dutch Language (nl-NL)**
   - Expand existing Dutch support
   - Netherlands-specific features
   - Belgian market considerations

2. **Spanish Language (es-ES)**
   - Create Spanish Dialogflow agent
   - Spanish UI translations
   - Spain market testing

### Phase 4: Additional Markets (Week 7-8)
1. **Portuguese Support (pt-PT)**
   - Future market preparation
   - Translation infrastructure

2. **French Support (fr-FR)**
   - Belgium and Switzerland support
   - Multi-language country handling

## Success Metrics

### Language Adoption:
- **Language Detection Accuracy**: >95%
- **Translation Quality Score**: >4.5/5
- **User Language Preference Retention**: >80%

### Market Performance:
- **German Market Conversion**: +25% vs English
- **Dutch Market Engagement**: +30% vs English
- **Spanish Market Retention**: +20% vs English

### Technical Performance:
- **Page Load Time**: <2s for all languages
- **Translation Cache Hit Rate**: >90%
- **API Response Time**: <500ms for all regions

## Risk Mitigation

### Technical Risks:
- **Translation Quality**: Manual review process
- **Performance Impact**: Lazy loading and caching
- **Maintenance Overhead**: Automated translation workflows

### Business Risks:
- **Cultural Sensitivity**: Native speaker reviews
- **Regional Compliance**: Legal review process
- **Market Acceptance**: Gradual rollout strategy

## Future Considerations

### Expansion Markets:
- **Nordic Countries**: Swedish, Norwegian, Danish
- **Eastern Europe**: Polish, Czech, Hungarian
- **Italian Market**: Italian language support

### Advanced Features:
- **Voice Recognition**: Multi-language speech input
- **Cultural Adaptation**: Region-specific design patterns
- **Local Payment Methods**: Regional payment integration

---

**Next Steps:**
1. Implement internationalization service infrastructure
2. Create tenant language configuration system
3. Begin German market implementation
4. Establish translation management workflow