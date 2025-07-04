# Style Recommendation Flow Test Prompts

This document provides a structured approach to test the Style Recommendation conversation flow in the EyewearML virtual assistant. Use these test prompts to verify that the flow correctly guides users through the style recommendation process.

## Prerequisites

1. The Dialogflow CX agent is deployed with the Style Recommendation flow
2. The intent mapping is configured to route style-related queries to this flow 
3. The webhook server is running and properly connected
4. The demo interface is accessible (typically at http://localhost:3050)

## Test Categories

1. Flow Initiation
2. Style Preference Capture
3. Occasion Capture
4. Personality/Look Capture
5. Additional Filters Capture
6. Recommendation Generation
7. User Reaction Handling
8. Edge Cases

## Test Cases

### 1. Flow Initiation Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| SR-INIT-01 | Direct style inquiry | "What style of glasses would suit me?" | Response should welcome user and ask about style preferences | Flow is activated and moves to style preference stage |
| SR-INIT-02 | Fashion-focused inquiry | "I need help finding stylish frames" | Response should welcome user and ask about style preferences | Flow is activated and moves to style preference stage |
| SR-INIT-03 | Trend inquiry | "What eyewear styles are trending now?" | Response should welcome user and introduce style options | Flow is activated and moves to style preference stage |
| SR-INIT-04 | Personality-based inquiry | "I want glasses that match my personality" | Response should welcome user and ask about style or personality | Flow is activated and moves to relevant stage |

### 2. Style Preference Capture Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| SR-STYLE-01 | Specific style mention | "I prefer modern frames" | Response should acknowledge preference and ask about occasion | System captures "modern" as style preference and proceeds |
| SR-STYLE-02 | Multiple styles | "I like both vintage and classic styles" | Response should acknowledge preferences and ask about occasion | System captures both style preferences and proceeds |
| SR-STYLE-03 | Vague preference | "Something that looks good" | Response should ask follow-up about specific styles | System attempts to elicit more specific preference |
| SR-STYLE-04 | Style question | "What's the difference between modern and classic styles?" | Response should explain style differences | System provides helpful information about styles |

### 3. Occasion Capture Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| SR-OCC-01 | Specific occasion | "I'll wear them at work" | Response should acknowledge work setting and ask about personality/look | System captures "work" as occasion and proceeds |
| SR-OCC-02 | Multiple occasions | "I need them for work and casual outings" | Response should acknowledge multiple occasions and proceed | System captures both occasions and proceeds |
| SR-OCC-03 | Skip occasion | "I'm not sure about the occasion" | Response should allow skipping and move to personality question | System handles skipping gracefully |
| SR-OCC-04 | Occasion question | "What do you mean by occasion?" | Response should explain what information is needed about occasions | System provides helpful clarification |

### 4. Personality/Look Capture Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| SR-PERS-01 | Specific personality | "I want a professional look" | Response should acknowledge professional preference and ask about additional filters | System captures "professional" as look and proceeds |
| SR-PERS-02 | Mixed personality | "I want to look professional but stylish" | Response should acknowledge combination and proceed | System captures both aspects and proceeds |
| SR-PERS-03 | Skip personality | "I don't have a specific preference for look" | Response should allow skipping and move to additional filters | System handles skipping gracefully |
| SR-PERS-04 | Personality question | "What kind of looks are available?" | Response should explain different personality/look options | System provides helpful information |

### 5. Additional Filters Capture Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| SR-FILT-01 | Specific color | "I prefer black frames" | Response should acknowledge color preference | System captures "black" as color preference |
| SR-FILT-02 | Material preference | "I'd like metal frames" | Response should acknowledge material preference | System captures "metal" as material preference |
| SR-FILT-03 | Multiple filters | "I want gold metal frames" | Response should acknowledge both preferences | System captures both color and material preferences |
| SR-FILT-04 | Skip filters | "No specific preferences for materials or colors" | Response should allow skipping and generate recommendations | System handles skipping gracefully |

### 6. Recommendation Generation Tests

| Test ID | Description | Test Prompt Sequence | Expected Response | Success Criteria |
|---------|-------------|---------------------|-------------------|------------------|
| SR-REC-01 | Basic recommendation | Complete flow with clear preferences | Response should present recommendations based on inputs | Recommendations match specified preferences |
| SR-REC-02 | Limited information | Complete flow with minimal information | Response should present broader recommendations | Recommendations are provided despite limited input |
| SR-REC-03 | Contradictory preferences | Enter conflicting style preferences | Response should handle contradictions sensibly | System attempts to reconcile or prioritize preferences |

### 7. User Reaction Handling Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| SR-REAC-01 | Positive reaction | "I like these options" | Response should offer more details | System moves to product details state |
| SR-REAC-02 | Refinement request | "Can you show me different styles?" | Response should offer refinement options | System moves to refinement state |
| SR-REAC-03 | Negative reaction | "I don't like any of these" | Response should offer alternatives | System moves to alternative styles state |

### 8. Edge Cases Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| SR-EDGE-01 | Irrelevant input | "Tell me about the weather" | System should attempt to redirect or clarify | System remains in flow or provides guidance |
| SR-EDGE-02 | Empty input | (Submit empty message) | System should prompt for input | System handles empty input gracefully |
| SR-EDGE-03 | Mixed intent | "I want stylish glasses that fit well" | System should identify primary intent | System prioritizes style recommendation but notes fit aspect |

## End-to-End Test Scenarios

### Complete Happy Path Test

Follow this sequence to test a complete successful path through the Style Recommendation flow:

1. User: "What style of glasses would look good on me?"
2. System: *Welcomes and asks about style preferences*
3. User: "I like modern frames"
4. System: *Acknowledges and asks about occasion*
5. User: "For work and casual outings"
6. System: *Acknowledges and asks about personality/look*
7. User: "Professional but stylish"
8. System: *Acknowledges and asks about additional filters*
9. User: "I prefer black or tortoise frames, metal material"
10. System: *Generates recommendations*
11. User: "I like these options"
12. System: *Provides more details*
13. User: "Thank you, that's helpful"
14. System: *Concludes conversation*

### Refinement Path Test

Follow this sequence to test the refinement path:

1. User: "Help me find stylish glasses"
2. *Complete initial stages of the flow*
3. System: *Generates initial recommendations*
4. User: "I'd like to see different options"
5. System: *Offers refinement options*
6. User: "Show me more colorful frames"
7. System: *Updates recommendations based on refinement*
8. User: "These look better, thanks"
9. System: *Concludes conversation*

## How to Execute Tests

1. Open the demo interface
2. Start with a clear session
3. Enter the test prompt from the test case
4. Evaluate the system response against the expected response
5. Check if the success criteria are met
6. For multi-turn scenarios, continue the conversation following the test sequence
7. Document any discrepancies or issues encountered

## Success Metrics

- 90% or higher success rate on all test cases
- Smooth transitions between conversation states
- Appropriate handling of edge cases
- Accurate parameter extraction
- Relevant recommendations based on user preferences
