# Frame Finder Flow Test Prompts

This document provides a structured approach to test the Frame Finder conversation flow in the EyewearML virtual assistant. Use these test prompts to verify that the flow correctly guides users through the process of finding frames that match their face shape and physical characteristics.

## Prerequisites

1. The Dialogflow CX agent is deployed with the Frame Finder flow
2. The intent mapping is configured to route frame-related queries to this flow
3. The webhook server is running and properly connected
4. The demo interface is accessible (typically at http://localhost:3050)

## Test Categories

1. Flow Initiation
2. Product Type Selection
3. Face Shape Identification
4. Frame Shape Preferences
5. Color Preferences
6. Material Preferences
7. Budget Considerations
8. Recommendation Generation
9. User Reaction Handling
10. Virtual Try-On
11. Edge Cases

## Test Cases

### 1. Flow Initiation Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FF-INIT-01 | Direct frame inquiry | "I need new glasses" | Response should welcome user and ask about product type | Flow is activated and moves to product type stage |
| FF-INIT-02 | Specific product type | "I'm looking for sunglasses" | Response should welcome user and set product type as sunglasses | Flow is activated with product type pre-set |
| FF-INIT-03 | Face shape mention | "What frames match my round face?" | Response should welcome user and acknowledge face shape | Flow is activated with face shape information |
| FF-INIT-04 | General help | "Help me find the right frames" | Response should welcome user and begin general guidance | Flow is activated and initiates guidance |

### 2. Product Type Selection Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FF-PROD-01 | Choose eyeglasses | "I want eyeglasses" | Response should set type to eyeglasses and proceed to face shape | System captures "eyeglasses" as product type and proceeds |
| FF-PROD-02 | Choose sunglasses | "I need sunglasses" | Response should set type to sunglasses and proceed to face shape | System captures "sunglasses" as product type and proceeds |
| FF-PROD-03 | Uncertain type | "I'm not sure which type I need" | Response should explain differences and ask again | System provides information to help user decide |
| FF-PROD-04 | Type question | "What's the difference between eyeglasses and sunglasses?" | Response should explain differences | System provides helpful information about product types |

### 3. Face Shape Identification Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FF-FACE-01 | Known face shape | "I have an oval face" | Response should acknowledge face shape and ask about frame shape | System captures "oval" as face shape and proceeds |
| FF-FACE-02 | Unknown face shape | "I don't know my face shape" | Response should offer guidance to determine face shape | System provides face shape analysis guidance |
| FF-FACE-03 | Face shape question | "How do I determine my face shape?" | Response should explain face shape identification methods | System provides helpful information about face shapes |
| FF-FACE-04 | After guidance | "Based on that, I think I have a heart-shaped face" | Response should acknowledge and proceed | System captures updated face shape and proceeds |

### 4. Frame Shape Preference Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FF-SHAPE-01 | Specific frame shape | "I like rectangular frames" | Response should acknowledge preference and ask about color | System captures "rectangular" as frame shape and proceeds |
| FF-SHAPE-02 | Multiple shape preferences | "I like both round and cat-eye frames" | Response should acknowledge preferences and proceed | System captures multiple frame shapes and proceeds |
| FF-SHAPE-03 | No preference | "I don't have a preference for frame shape" | Response should suggest shapes based on face shape | System provides recommendations based on face shape |
| FF-SHAPE-04 | Shape question | "What shape of frames would look good on a square face?" | Response should provide recommendations for square faces | System provides face-shape specific guidance |

### 5. Color Preference Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FF-COLOR-01 | Specific color | "I prefer black frames" | Response should acknowledge color preference and ask about material | System captures "black" as color preference and proceeds |
| FF-COLOR-02 | Multiple colors | "I like tortoise and clear frames" | Response should acknowledge multiple colors and proceed | System captures multiple color preferences and proceeds |
| FF-COLOR-03 | No color preference | "I don't have a color preference" | Response should acknowledge and move to material | System handles skipping gracefully |
| FF-COLOR-04 | Color question | "What colors are trending this year?" | Response should provide color trend information | System provides helpful information about colors |

### 6. Material Preference Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FF-MAT-01 | Specific material | "I prefer metal frames" | Response should acknowledge material preference and ask about budget | System captures "metal" as material preference and proceeds |
| FF-MAT-02 | Multiple materials | "I like both acetate and titanium" | Response should acknowledge multiple materials and proceed | System captures multiple material preferences and proceeds |
| FF-MAT-03 | No material preference | "No preference for material" | Response should acknowledge and move to budget | System handles skipping gracefully |
| FF-MAT-04 | Material question | "What's the difference between acetate and plastic?" | Response should explain material differences | System provides helpful information about materials |

### 7. Budget Consideration Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FF-BUDG-01 | Specific budget | "My budget is $100-150" | Response should acknowledge budget and proceed to recommendations | System captures budget range and proceeds |
| FF-BUDG-02 | No budget | "I don't have a specific budget" | Response should acknowledge and proceed to recommendations | System handles skipping gracefully |
| FF-BUDG-03 | Budget question | "What price range do you recommend?" | Response should provide budget guidance | System provides helpful information about pricing |

### 8. Recommendation Generation Tests

| Test ID | Description | Test Prompt Sequence | Expected Response | Success Criteria |
|---------|-------------|---------------------|-------------------|------------------|
| FF-REC-01 | Complete profile | Complete flow with clear preferences | Response should present recommendations based on inputs | Recommendations match specified preferences |
| FF-REC-02 | Minimal information | Complete flow with minimal information | Response should present broader recommendations | Recommendations are provided despite limited input |
| FF-REC-03 | Face-focused | Focus on face shape with minimal other preferences | Response should emphasize face-shape compatibility | Recommendations prioritize face shape match |

### 9. User Reaction Handling Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FF-REAC-01 | Positive reaction | "I like these frames" | Response should offer product details | System moves to product details state |
| FF-REAC-02 | Refinement request | "Can you show me different options?" | Response should offer refinement options | System moves to refinement state |
| FF-REAC-03 | Negative reaction | "I don't like these options" | Response should offer alternative frames | System moves to alternative frames state |

### 10. Virtual Try-On Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FF-TRY-01 | Accept try-on | "Yes, I'd like to try them on" | Response should launch virtual try-on | System moves to launch try-on state |
| FF-TRY-02 | Decline try-on | "No thanks, I don't need to try them on" | Response should skip try-on and offer cart addition | System moves to skip try-on state |
| FF-TRY-03 | Try-on question | "How does the virtual try-on work?" | Response should explain virtual try-on functionality | System provides helpful information about try-on |

### 11. Edge Cases Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FF-EDGE-01 | Irrelevant input | "Tell me about your return policy" | System should attempt to redirect or handle tangent | System provides information or returns to flow |
| FF-EDGE-02 | Empty input | (Submit empty message) | System should prompt for input | System handles empty input gracefully |
| FF-EDGE-03 | Mixed intent | "I want frames that look stylish" | System should identify primary intent | System focuses on frames but notes style aspect |
| FF-EDGE-04 | Complex requirements | "I need lightweight hypoallergenic frames for a narrow face" | System should handle multiple requirements | System captures complex requirements accurately |

## End-to-End Test Scenarios

### Complete Happy Path Test

Follow this sequence to test a complete successful path through the Frame Finder flow:

1. User: "I need help finding frames that will fit me well"
2. System: *Welcomes and asks about product type*
3. User: "I'm looking for eyeglasses"
4. System: *Acknowledges and asks about face shape*
5. User: "I have an oval face"
6. System: *Acknowledges and asks about frame shape preference*
7. User: "I like rectangular frames"
8. System: *Acknowledges and asks about color preference*
9. User: "Black or tortoise"
10. System: *Acknowledges and asks about material preference*
11. User: "Metal would be nice"
12. System: *Acknowledges and asks about budget*
13. User: "Around $150-200"
14. System: *Generates recommendations*
15. User: "I like these options"
16. System: *Provides product details and offers virtual try-on*
17. User: "Yes, I'd like to try them on"
18. System: *Launches virtual try-on*
19. User: "These look great"
20. System: *Offers to add to cart*
21. User: "Yes, please add them"
22. System: *Concludes conversation*

### Refinement Path Test

Follow this sequence to test the refinement path:

1. User: "Help me find frames"
2. *Complete initial stages of the flow*
3. System: *Generates initial recommendations*
4. User: "These are too large, can I see smaller frames?"
5. System: *Offers refinement options*
6. User: "I want to change the frame shape"
7. System: *Returns to frame shape question*
8. User: "I'd prefer round frames instead"
9. System: *Updates preferences and generates new recommendations*
10. User: "These look better, thanks"
11. System: *Concludes conversation*

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
- Relevant recommendations based on user preferences and face shape
- Successful virtual try-on integration when selected
