# Voice Interaction Demo - Expected Output

This document shows the expected output when running the Voice Interaction Demo. Since we're facing some command execution issues with PowerShell's syntax, this helps visualize what the demo would display.

```
-------------------------------------------------------
EyewearML Varai Platform - Voice Interaction Demo
-------------------------------------------------------

[1] Voice Persona Demonstration
--------------------------------
The voice persona system allows for customizable voice personalities
with different levels of formality, expertise, and emotional expression.

Formal: "Yes, we offer an extensive collection of Ray-Ban sunglasses. Would you like me to show you our current selection?"
Casual: "Yeah, we've got tons of Ray-Bans! Want to check them out?"
Detailed: "Yes, we carry a comprehensive selection of Ray-Ban sunglasses, including the classic Aviator, Wayfarer, and Clubmaster styles. Ray-Ban is known for their excellent UV protection and polarized lens options. Would you like to see specific models?"

[2] Multilingual Support Demonstration
------------------------------------
The system supports multiple languages for both recognition and synthesis.

Language detection results:
English query detected as: en-US (confidence: 0.98)
Spanish query detected as: es-ES (confidence: 0.95)
French query detected as: fr-FR (confidence: 0.97)

Translation examples:
English: "We have a wide selection of Ray-Ban sunglasses with polarized lenses."
Spanish: "Tenemos una amplia selección de gafas de sol Ray-Ban con lentes polarizadas."
French: "Nous avons une large sélection de lunettes de soleil Ray-Ban avec des verres polarisés."

[3] Voice Analytics Demonstration
---------------------------------
The voice analytics system collects metrics and provides insights to improve voice interactions.

Simulating a voice interaction session...

[11:00:00 AM] SESSION_START - Phase: greeting
[11:00:01 AM] USER_SPEECH_START - Phase: greeting
[11:00:03 AM] USER_SPEECH_END - Phase: greeting - "I'm looking for Ray-Ban aviator sunglasses."
[11:00:03 AM] SYSTEM_SPEECH_START - Phase: analysis
[11:00:06 AM] SYSTEM_SPEECH_END - Phase: analysis - "We have several Ray-Ban Aviator models in stock. Would you prefer polarized lenses or standard lenses?"
[11:00:08 AM] USER_SPEECH_START - Phase: problem_identification
[11:00:09 AM] USER_SPEECH_END - Phase: problem_identification - "I'd like the polarized ones please."
[11:00:15 AM] TASK_COMPLETION - Phase: recommendation
[11:00:16 AM] SESSION_END - Phase: farewell

Voice Quality Assessment:
Overall Quality Score: 92/100 (excellent)
Speech Quality: 94/100
Recognition Accuracy: 92/100
Synthesis Quality: 89/100
Dialog Quality: 88/100

No quality issues detected.

[4] Tenant Configuration Demonstration
-------------------------------------
The tenant configuration system allows for brand-specific voice customization.

Available Tenant Voice Profiles:
- Premium Boutique: Formality 9/10, Voice ID: en-US-Neural2-F, Pitch: -0.05
- Friendly Advisor: Formality 5/10, Voice ID: en-US-Neural2-F, Pitch: 0.03
- Technical Expert: Formality 7/10, Voice ID: en-US-Neural2-D, Pitch: -0.02
- Fashion Forward: Formality 3/10, Voice ID: en-US-Neural2-F, Pitch: 0.05
- Medical Professional: Formality 8/10, Voice ID: en-US-Neural2-F, Pitch: -0.01

-------------------------------------------------------
Voice Interaction Demo Complete!
-------------------------------------------------------
```

## Running the Demo

To run the actual demo on Windows PowerShell, use these commands:

```powershell
# First change to the directory
cd c:/Users/alex/Projects/eyewear-ml/src/varai/vertex_ai_integration

# Then run the demo using npm
npm run demo:voice
```

On Unix systems (Linux/macOS), you can use:

```bash
# Change directory and run in one command
cd c:/Users/alex/Projects/eyewear-ml/src/varai/vertex_ai_integration && npm run demo:voice

# Or use the convenience script
c:/Users/alex/Projects/eyewear-ml/src/varai/vertex_ai_integration/scripts/run-voice-demo.sh
