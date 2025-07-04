# Voice Tenant Configuration

## Purpose

This document details the tenant-specific configuration options for the voice interaction system. These configurations allow for customized voice experiences for each store or brand while maintaining a consistent technical architecture.

## Configuration Structure

Voice configurations are stored in the tenant configuration system with the following structure:

```json
{
  "voice": {
    "enabled": true,
    "persona": {
      "id": "friendly_expert_female",
      "formality": 7,
      "expressiveness": 8,
      "expertise": 9,
      "verbosity": 6,
      "humor": 5,
      "customPhrases": {
        "greeting": ["Welcome to EyeStyle Boutique! How can I help you today?"],
        "farewell": ["Thanks for visiting EyeStyle Boutique. Come back anytime!"],
        "recommendation": ["Based on my expertise, I'd recommend..."]
      }
    },
    "voice": {
      "provider": "google", // google, web, nvidia, amazon
      "voiceId": "en-US-Neural2-F",
      "fallbackVoiceId": "en-US-Standard-F",
      "speakingRate": 1.0,
      "pitch": 0.0,
      "volumeGain": 0.0
    },
    "recognition": {
      "provider": "google", // google, web, nvidia, amazon
      "language": "en-US",
      "alternateLanguages": ["es-US"],
      "confidenceThreshold": 0.7,
      "domainBoost": true,
      "customVocabulary": [
        {
          "phrase": "Wayfarer",
          "boost": 10
        },
        {
          "phrase": "EyeStyle Boutique",
          "boost": 20
        }
      ]
    },
    "activation": {
      "mode": "button", // button, wake_word, continuous
      "wakeWord": "Hey Stylist",
      "wakeWordSensitivity": 0.8,
      "endpointingSensitivity": 0.5,
      "noSpeechTimeout": 5000
    },
    "avatar": {
      "enabled": false,
      "avatarId": "sophia_consultant",
      "expressiveness": 0.8,
      "renderQuality": "medium",
      "backgroundType": "store"
    },
    "analytics": {
      "detailedReporting": true,
      "abTestGroup": "voice_experience_A",
      "customDimensions": {
        "storeLocation": "downtown",
        "primaryDemographic": "professionals"
      }
    },
    "billing": {
      "tier": "premium", // basic, standard, premium
      "usageAlertThreshold": 5000,
      "maxMonthlyUsageMinutes": 10000
    }
  }
}
```

## Configuration Parameters

### Core Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| voice.enabled | Master toggle for voice features | false |

### Persona Configuration

| Parameter | Description | Range/Options | Default |
|-----------|-------------|---------------|---------|
| persona.id | Predefined personality template | string | "friendly_expert" |
| persona.formality | Formal vs. casual language | 1-10 | 6 |
| persona.expressiveness | Emotional expression level | 1-10 | 7 |
| persona.expertise | Technical knowledge level | 1-10 | 8 |
| persona.verbosity | Response length/detail | 1-10 | 5 |
| persona.humor | Use of humor in responses | 1-10 | 3 |
| persona.customPhrases | Category-specific custom phrases | object | {} |

### Voice Configuration

| Parameter | Description | Range/Options | Default |
|-----------|-------------|---------------|---------|
| voice.provider | TTS service provider | google, web, nvidia, amazon | "web" |
| voice.voiceId | Primary voice identifier | provider-specific | "default" |
| voice.fallbackVoiceId | Backup voice identifier | provider-specific | "default" |
| voice.speakingRate | Speed of speech | 0.5-2.0 | 1.0 |
| voice.pitch | Voice pitch adjustment | -10.0-10.0 | 0.0 |
| voice.volumeGain | Volume adjustment in dB | -6.0-6.0 | 0.0 |

### Recognition Configuration

| Parameter | Description | Range/Options | Default |
|-----------|-------------|---------------|---------|
| recognition.provider | STT service provider | google, web, nvidia, amazon | "web" |
| recognition.language | Primary language | BCP-47 code | "en-US" |
| recognition.alternateLanguages | Secondary languages | BCP-47 code array | [] |
| recognition.confidenceThreshold | Minimum confidence score | 0.0-1.0 | 0.7 |
| recognition.domainBoost | Apply eyewear terminology boost | boolean | true |
| recognition.customVocabulary | Tenant-specific terminology | array | [] |

### Activation Configuration

| Parameter | Description | Range/Options | Default |
|-----------|-------------|---------------|---------|
| activation.mode | How voice is activated | button, wake_word, continuous | "button" |
| activation.wakeWord | Phrase to activate voice | string | "Hey Assistant" |
| activation.wakeWordSensitivity | Wake word detection sensitivity | 0.0-1.0 | 0.8 |
| activation.endpointingSensitivity | End-of-speech detection sensitivity | 0.0-1.0 | 0.5 |
| activation.noSpeechTimeout | Silence timeout in ms | 1000-10000 | 5000 |

### Avatar Configuration

| Parameter | Description | Range/Options | Default |
|-----------|-------------|---------------|---------|
| avatar.enabled | Enable visual avatar | boolean | false |
| avatar.avatarId | Avatar model identifier | string | "default" |
| avatar.expressiveness | Animation expressiveness | 0.0-1.0 | 0.8 |
| avatar.renderQuality | Visual quality level | low, medium, high | "medium" |
| avatar.backgroundType | Background setting | none, gradient, store | "gradient" |

### Analytics Configuration

| Parameter | Description | Range/Options | Default |
|-----------|-------------|---------------|---------|
| analytics.detailedReporting | Enable comprehensive metrics | boolean | false |
| analytics.abTestGroup | A/B test assignment | string | "" |
| analytics.customDimensions | Tenant-specific analytics dimensions | object | {} |

### Billing Configuration

| Parameter | Description | Range/Options | Default |
|-----------|-------------|---------------|---------|
| billing.tier | Service level for voice features | basic, standard, premium | "standard" |
| billing.usageAlertThreshold | Alert when minutes exceed threshold | number | 1000 |
| billing.maxMonthlyUsageMinutes | Hard cap on monthly usage | number | 3000 |

## Implementation Considerations

### Tenant-Specific Customization

Each tenant requires customized voice settings based on:

1. **Brand Alignment**: Voice characteristics should match brand identity
2. **Customer Demographics**: Adapt to target audience expectations
3. **Use Environment**: Consider in-store vs. online experiences
4. **Technical Requirements**: Account for network and device capabilities
5. **Budget Constraints**: Balance quality and cost considerations

### Default Profiles

Pre-configured voice profiles to use as starting points:

| Profile | Description | Best For |
|---------|-------------|----------|
| Premium Boutique | Formal, authoritative, expert | Luxury eyewear retailers |
| Friendly Advisor | Warm, approachable, helpful | Family-oriented optical shops |
| Technical Expert | Detailed, precise, informative | Specialty lens providers |
| Fashion Forward | Trendy, enthusiastic, expressive | Fashion eyewear brands |
| Medical Professional | Clinical, reassuring, thorough | Optometrist offices |

### Multi-Language Support

Considerations for multilingual deployments:

1. Configure primary and secondary languages per tenant
2. Ensure consistent voice persona across languages
3. Verify pronunciation of brand/product names in all languages
4. Use language-specific customizations for voice parameters
5. Support language switching during conversations

### Voice Customization Admin Interface

The admin interface allows tenants to:

1. Select from pre-configured voice profiles
2. Customize individual voice parameters
3. Record custom pronunciations for brand terms
4. Test voice output with sample content
5. Set budget constraints and usage limits
6. Review voice interaction analytics

## Integration with Face Analysis

When configuring voice support for face analysis:

1. Create specialized vocabulary for positioning guidance
2. Configure shorter, clearer utterances for analysis instructions
3. Set appropriate interruption thresholds during analysis
4. Use more expressive voice characteristics for feedback
5. Balance voice guidance with visual instructions

## Configuration Management

The configuration is managed through these interfaces:

1. **Admin Dashboard**: Web UI for tenant administrators
2. **Configuration API**: Programmatic access for advanced customization
3. **Deployment Templates**: Pre-configured settings for common scenarios
4. **Import/Export Tools**: Sharing configurations between environments
5. **Version Control**: Track configuration changes over time

## Security and Privacy

Voice configuration security measures:

1. Encryption of all configuration data
2. Role-based access control for configuration changes
3. Audit logging of configuration modifications
4. Validation of all configuration values
5. Sandbox testing for configuration changes before deployment
