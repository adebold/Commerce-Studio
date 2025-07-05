# Speech Synthesis Agent

## Purpose

The Speech Synthesis Agent transforms text responses from the Vertex AI system into natural-sounding speech output. This agent ensures consistent voice characteristics, appropriate pacing, and emotional tone to create a personalized and engaging voice interaction experience.

## Input

- Text response from Vertex AI system
- Speech synthesis parameters:
  - Voice ID/characteristics
  - Speaking rate
  - Pitch
  - Emphasis markers
- Tenant configuration
- Conversation context
- Optional SSML formatting

## Output

- Audio stream of synthesized speech
- Timing information for synchronization
- Animation cues for avatar (if enabled)
- Playback control signals

## Core Functions

1. **Text Preprocessing**
   - Format text for optimal speech rendering
   - Add pause markers for natural phrasing
   - Convert domain-specific terminology and abbreviations
   - Apply SSML enhancements for emphasis

2. **Voice Selection and Management**
   - Apply tenant-specific voice settings
   - Maintain consistent voice across session
   - Select appropriate voice variant based on content
   - Handle multilingual content with appropriate voices

3. **Speech Generation**
   - Connect to appropriate TTS API
   - Generate high-quality speech audio
   - Buffer audio for smooth playback
   - Provide word-level timing for synchronization

4. **Delivery Control**
   - Manage playback timing
   - Support interruption and resumption
   - Control speech rate based on content complexity
   - Provide visual indicators of speech activity

## Decision-Making Guidelines

When synthesizing speech, the agent should:

1. **Match speaking pace to content importance** (slower for critical information)
2. **Vary intonation naturalistically** to maintain engagement
3. **Emphasize key terms** in product descriptions or recommendations
4. **Adapt speaking style** to match the conversation phase (greeting, consultation, recommendation)
5. **Balance efficiency and clarity** in pronunciation of technical terms

## Example Interactions

### Example 1: Basic Response

**Input Text**: "Based on your round face shape, rectangular frames would provide a nice contrast and help elongate your face."

**Processing**:
1. Apply natural pausing after "face shape" and "contrast"
2. Add slight emphasis on "rectangular" as key recommendation
3. Generate speech using tenant's configured voice
4. Provide timing data for UI synchronization

**Output**: Audio stream with timing markers
**Speech Parameters**: {voice_id: "female_02", rate: 1.0, pitch: 0}
**Animation Cues**: {word_timings: [...], emphasis_points: [word_index: 5]}

### Example 2: Technical Information

**Input Text**: "Your pupillary distance is 64mm, which we'll use to ensure proper lens alignment."

**Processing**:
1. Identify "pupillary distance" and "64mm" as technical terms
2. Slow speech rate slightly for this segment
3. Apply clear pronunciation for measurement
4. Add brief pause after measurement

**Output**: Audio stream with timing markers
**Speech Parameters**: {voice_id: "female_02", rate: 0.9, pitch: 0}
**Animation Cues**: {word_timings: [...], technical_terms: ["pupillary distance", "64mm"]}

## Integration Requirements

- Access to supported TTS APIs
- Audio output capability on client devices
- Synchronization mechanism with UI/avatar systems
- Connection to tenant configuration service
- Bidirectional communication with Voice Orchestration Agent

## Error Recovery Strategies

| Error Type | Detection Method | Recovery Action |
|------------|------------------|-----------------|
| API failure | Error response or timeout | Switch to alternative TTS service |
| Pronunciation error | Known problematic terms | Apply custom pronunciation dictionary |
| Audio playback failure | Client feedback | Retry with alternative format or fall back to text |
| Voice inconsistency | Voice ID mismatch | Restore voice settings from session data |
| Resource limitation | Latency or quality degradation | Reduce message length or switch to lower-resource voice model |

## Implementation Considerations

### SSML Enhancement

For optimal speech quality, the agent should apply Speech Synthesis Markup Language (SSML) enhancements:

```xml
<speak>
  Based on your <emphasis level="moderate">round face shape</emphasis>, 
  <emphasis level="strong">rectangular frames</emphasis> would provide 
  a nice contrast <break time="200ms"/> and help elongate your face.
</speak>
```

### Domain-Specific Pronunciation

Create a custom pronunciation dictionary for eyewear terminology:

| Term | Phonetic Pronunciation |
|------|------------------------|
| Acetate | "ASS-uh-tate" |
| Wayfarer | "WAY-fair-er" |
| Aviator | "AY-vee-ay-tor" |
| Titanium | "tie-TAY-nee-um" |
| Polarized | "POH-luh-rized" |
| Photochromic | "foh-toh-KROH-mik" |

### Voice Consistency

Track and maintain consistent voice characteristics throughout a session:

1. Save voice selection at session start
2. Persist voice parameters across utterances
3. Apply consistent emotional tone
4. Adjust only within defined parameter ranges
5. Reset to defaults at session boundaries

### Face Analysis Integration

During face analysis, the speech synthesis should:

1. Provide clear, encouraging instructions
2. Use appropriate pacing for step-by-step guidance
3. Apply informal, conversational tone for positioning requests
4. Express enthusiasm when sharing results
5. Maintain clarity for technical explanations of measurements

## Technical Implementation Options

| Capability | Web Speech API | Google Cloud TTS | NVIDIA Riva | Amazon Polly |
|------------|---------------|------------------|-------------|--------------|
| Voice selection | Limited | Extensive | Extensive | Extensive |
| SSML support | Basic | Full | Full | Full |
| Emotional range | Limited | Good | Excellent | Good |
| Streaming | Yes | Yes | Yes | Yes |
| Voice customization | No | Limited | Yes | Limited |
| Offline capability | Optional | No | Optional | No |
| Pricing | Free | Pay per character | Custom | Pay per character |

## Monitoring and Analytics

The agent should collect these metrics for optimization:

1. Synthesis latency
2. Audio quality ratings
3. Playback completion rate
4. User interruption frequency
5. API usage by provider
6. Voice selection distribution
7. Average response length

## Security and Privacy Considerations

1. Secure all API credentials
2. Do not include sensitive personal data in synthesis requests
3. Process locally when possible
4. Use secure audio streaming
5. Cache common responses appropriately
6. Maintain compliance with accessibility standards
