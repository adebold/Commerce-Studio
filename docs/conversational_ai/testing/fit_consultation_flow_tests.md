# Fit Consultation Flow Test Prompts

This document provides a structured approach to test the Fit Consultation conversation flow in the EyewearML virtual assistant. Use these test prompts to verify that the flow correctly guides users through understanding proper eyewear fit, troubleshooting fit issues, and finding frames that will fit them perfectly.

## Prerequisites

1. The Dialogflow CX agent is deployed with the Fit Consultation flow
2. The intent mapping is configured to route fit-related queries to this flow
3. The webhook server is running and properly connected
4. The demo interface is accessible (typically at http://localhost:3050)

## Test Categories

1. Flow Initiation
2. General Guidance Path
3. Fit Education Topics
4. Troubleshooting Path
5. Specific Issue Handling
6. Professional Adjustment Options
7. Fit-Based Search Path
8. Measurements and Face Characteristics
9. Recommendation Generation
10. Edge Cases

## Test Cases

### 1. Flow Initiation Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FC-INIT-01 | Direct fit inquiry | "How should glasses properly fit?" | Response should welcome user and offer general guidance | Flow is activated and moves to general guidance path |
| FC-INIT-02 | Issue troubleshooting | "My glasses keep slipping down my nose" | Response should welcome user and move to troubleshooting | Flow is activated and moves to troubleshooting path |
| FC-INIT-03 | Fit-based search | "Help me find frames that will fit me well" | Response should welcome user and start fit-based search | Flow is activated and moves to fit-based search path |
| FC-INIT-04 | General inquiry | "I need help with eyewear fit" | Response should welcome user and ask which type of assistance | Flow is activated and asks for path selection |

### 2. General Guidance Path Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FC-GEN-01 | Request basic principles | "Tell me about eyewear fit" | Response should explain basic fit principles | System provides general fit guidance |
| FC-GEN-02 | Ask for detailed guidance | "What are the key aspects of proper fit?" | Response should explain key fit aspects and offer to explore topics | System describes fit components and offers to dive deeper |
| FC-GEN-03 | Decline further info | "No, that's all I needed to know" | Response should acknowledge and offer recommendations | System handles completion gracefully |
| FC-GEN-04 | Request more info | "Yes, I'd like to learn more" | Response should offer specific fit education topics | System moves to fit education topics offering |

### 3. Fit Education Topic Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FC-EDU-01 | Frame width topic | "Tell me about frame width" | Response should explain frame width importance | System provides detailed information on frame width |
| FC-EDU-02 | Temple length topic | "Tell me about temple length" | Response should explain temple length importance | System provides detailed information on temple length |
| FC-EDU-03 | Bridge fit topic | "Tell me about bridge fit" | Response should explain bridge fit importance | System provides detailed information on bridge fit |
| FC-EDU-04 | Multiple topics | "What about both height and weight?" | Response should address both topics | System provides information on multiple requested topics |
| FC-EDU-05 | Request another topic | "I'd like to learn about another aspect" | Response should return to topic selection | System allows further exploration of topics |
| FC-EDU-06 | End education | "That's all I needed to know" | Response should offer recommendations | System concludes education path appropriately |

### 4. Troubleshooting Path Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FC-TRBL-01 | Describe slipping issue | "My glasses slip down my nose" | Response should identify as slipping issue and ask follow-up | System recognizes issue type and proceeds to specific solutions |
| FC-TRBL-02 | Describe pinching issue | "My frames pinch my temples" | Response should identify as pinching issue and ask follow-up | System recognizes issue type and proceeds to specific solutions |
| FC-TRBL-03 | Describe ear discomfort | "My glasses hurt behind my ears" | Response should identify as ear discomfort and ask follow-up | System recognizes issue type and proceeds to specific solutions |
| FC-TRBL-04 | Describe nose marks | "My glasses leave red marks on my nose" | Response should identify as nose marks issue and ask follow-up | System recognizes issue type and proceeds to specific solutions |
| FC-TRBL-05 | Describe alignment | "My glasses look crooked on my face" | Response should identify as alignment issue and ask follow-up | System recognizes issue type and proceeds to specific solutions |
| FC-TRBL-06 | Unclear issue | "My glasses don't feel right" | Response should ask for more details | System prompts for more specific information |

### 5. Specific Issue Handling Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FC-SPEC-01 | Slipping solution | (After describing slipping) "They've always slipped" | Response should provide solutions for chronic slipping | System offers appropriate solutions for slipping issue |
| FC-SPEC-02 | Pinching solution | (After describing pinching) "It started recently" | Response should provide solutions for recent pinching | System offers appropriate solutions for pinching issue |
| FC-SPEC-03 | Ear discomfort solution | (After describing ear pain) "It hurts after wearing them all day" | Response should provide solutions for ear discomfort | System offers appropriate solutions for ear discomfort |
| FC-SPEC-04 | Nose marks solution | (After describing marks) "They leave red indentations" | Response should provide solutions for nose marks | System offers appropriate solutions for nose marks |
| FC-SPEC-05 | Alignment solution | (After describing alignment) "They were bent recently" | Response should provide solutions for alignment issues | System offers appropriate solutions for alignment issues |
| FC-SPEC-06 | Custom issue | "The frames are too heavy for me" | Response should provide custom solutions | System offers appropriate solutions for custom issues |

### 6. Professional Adjustment Options Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FC-PROF-01 | Request adjustment info | "How can I get my frames adjusted?" | Response should provide professional adjustment information | System explains professional adjustment options |
| FC-PROF-02 | Ask about DIY adjustment | "Can I adjust them myself?" | Response should explain risks and basic adjustment tips | System provides appropriate guidance about self-adjustments |
| FC-PROF-03 | Ask about local options | "Where can I get adjustments done?" | Response should explain local adjustment options | System provides information about finding adjustment services |
| FC-PROF-04 | Decline adjustment | "I don't think I need an adjustment" | Response should acknowledge and ask if issue is resolved | System handles skip gracefully |
| FC-PROF-05 | After solutions | "Will these solutions fix my problem?" | Response should set expectations and offer alternatives | System provides realistic assessment and alternatives |

### 7. Fit-Based Search Path Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FC-SRCH-01 | Start fit search | "Help me find frames that fit well" | Response should begin fit-based search process | System starts fit-based search flow |
| FC-SRCH-02 | Has measurements | "I know my frame measurements" | Response should ask for measurements | System proceeds to capture measurements |
| FC-SRCH-03 | No measurements | "I don't know my measurements" | Response should provide measurement guidance | System explains how to find measurements |
| FC-SRCH-04 | Provide measurements | "My measurements are 52-18-140" | Response should acknowledge and ask about face width | System captures measurements and proceeds |
| FC-SRCH-05 | Measurement question | "Where do I find these numbers?" | Response should explain where to find measurements | System provides helpful guidance |

### 8. Measurements and Face Characteristics Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FC-CHAR-01 | Face width | "I have a narrow face" | Response should acknowledge and ask about face shape | System captures face width and proceeds |
| FC-CHAR-02 | Face shape | "I have a round face" | Response should acknowledge and ask about nose bridge | System captures face shape and proceeds |
| FC-CHAR-03 | Nose bridge | "I have a high nose bridge" | Response should acknowledge and ask about skin sensitivity | System captures nose bridge height and proceeds |
| FC-CHAR-04 | Skin sensitivity | "I have sensitive skin" | Response should acknowledge and ask about activity level | System captures skin sensitivity and proceeds |
| FC-CHAR-05 | Activity level | "I'm very active" | Response should acknowledge and generate recommendations | System captures activity level and proceeds to recommendations |
| FC-CHAR-06 | Skip characteristic | "I'm not sure about my nose bridge" | Response should allow skipping and continue | System handles skipping gracefully |

### 9. Recommendation Generation Tests

| Test ID | Description | Test Prompt Sequence | Expected Response | Success Criteria |
|---------|-------------|---------------------|-------------------|------------------|
| FC-RECM-01 | Complete profile | Complete flow with clear preferences | Response should present fit-focused recommendations | Recommendations match specified fit characteristics |
| FC-RECM-02 | Minimal information | Complete flow with minimal information | Response should present broader fit recommendations | Recommendations are provided despite limited input |
| FC-RECM-03 | Measurements focus | Focus on specific measurements | Response should emphasize proper sizing | Recommendations prioritize correct sizing |
| FC-RECM-04 | Activity focus | Focus on high activity needs | Response should emphasize secure fit | Recommendations prioritize secure fit features |

### 10. Edge Cases Tests

| Test ID | Description | Test Prompt | Expected Response | Success Criteria |
|---------|-------------|------------|-------------------|------------------|
| FC-EDGE-01 | Irrelevant input | "What color frames do you recommend?" | System should attempt to redirect to fit aspects | System remains in flow or provides guidance |
| FC-EDGE-02 | Empty input | (Submit empty message) | System should prompt for input | System handles empty input gracefully |
| FC-EDGE-03 | Mixed intent | "My glasses don't fit and I want stylish ones" | System should identify primary intent | System prioritizes fit but notes style aspect |
| FC-EDGE-04 | Complex issue | "My glasses slip, pinch, and are too heavy" | System should handle multiple issues | System addresses primary concerns and suggests professional help |

## End-to-End Test Scenarios

### General Guidance Happy Path Test

Follow this sequence to test a complete successful path through the General Guidance path:

1. User: "How should glasses properly fit?"
2. System: *Welcomes and offers general guidance*
3. User: "I'd like to learn more about specific aspects"
4. System: *Offers specific fit education topics*
5. User: "Tell me about frame width"
6. System: *Provides frame width information*
7. User: "I'd also like to know about bridge fit"
8. System: *Provides bridge fit information*
9. User: "That's all I need to know"
10. System: *Offers frame recommendations*
11. User: "Yes, show me recommendations"
12. System: *Transitions to fit-based search or recommendations*
13. User: "These look great, thank you"
14. System: *Concludes conversation*

### Troubleshooting Path Test

Follow this sequence to test the troubleshooting path:

1. User: "My glasses keep slipping down my nose"
2. System: *Welcomes and identifies slipping issue*
3. User: "They've always been slipping since I got them"
4. System: *Provides slipping solutions*
5. User: "Would professional adjustment help?"
6. System: *Provides professional adjustment information*
7. User: "Where can I get them adjusted?"
8. System: *Provides local adjustment options*
9. User: "Thank you, I'll try that"
10. System: *Asks if issue is resolved or offers alternatives*
11. User: "I think that will solve my problem"
12. System: *Concludes conversation*

### Fit-Based Search Path Test

Follow this sequence to test the fit-based search path:

1. User: "Help me find frames that will fit me perfectly"
2. System: *Welcomes and starts fit-based search*
3. User: "I don't know my measurements"
4. System: *Provides measurement guidance*
5. User: "Based on my current glasses, they're 54-18-145"
6. System: *Acknowledges and asks about face width*
7. User: "I have an average width face"
8. System: *Acknowledges and asks about face shape*
9. User: "My face is oval shaped"
10. System: *Acknowledges and asks about nose bridge*
11. User: "I have a high nose bridge"
12. System: *Acknowledges and asks about skin sensitivity*
13. User: "I don't have sensitive skin"
14. System: *Acknowledges and asks about activity level*
15. User: "I'm moderately active"
16. System: *Generates recommendations*
17. User: "I like these frames"
18. System: *Provides product details*
19. User: "I'd like to add them to my cart"
20. System: *Concludes conversation*

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
- Accurate issue identification and resolution suggestions
- Relevant fit recommendations based on user characteristics
- Successful navigation between the three main paths (guidance, troubleshooting, search)
