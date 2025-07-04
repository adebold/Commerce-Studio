# Conversational AI Testing Documentation

This directory contains test documentation for the EyewearML virtual assistant's conversation flows. These documents provide structured test cases and scenarios to verify that the conversation flows work correctly.

## Test Files

1. [Style Recommendation Flow Tests](./style_recommendation_flow_tests.md)
2. [Frame Finder Flow Tests](./frame_finder_flow_tests.md)
3. [Fit Consultation Flow Tests](./fit_consultation_flow_tests.md)

## Purpose

These test documents serve multiple purposes:

1. **Testing Guide**: Provides a structured approach to manually test each conversation flow
2. **Documentation**: Documents the expected behavior of each flow
3. **Quality Assurance**: Ensures consistent user experience across the virtual assistant
4. **Onboarding**: Helps new team members understand how the flows should function

## Test Structure

Each test file follows the same structure:

1. **Prerequisites**: Requirements for testing the flow
2. **Test Categories**: Major functional areas being tested
3. **Test Cases**: Individual test cases with prompts, expected responses, and success criteria
4. **End-to-End Scenarios**: Complete conversation paths to test entire flows
5. **Execution Instructions**: How to run and evaluate the tests
6. **Success Metrics**: Criteria for determining successful test completion

## How to Use These Tests

### For Manual Testing

1. Open the demo interface (typically at http://localhost:3050)
2. Start with a clear session
3. Select a test case from one of the test files
4. Enter the test prompt as specified
5. Compare the system's response to the expected response
6. Evaluate if the success criteria are met
7. For end-to-end scenarios, follow the conversation sequence
8. Document any issues or discrepancies

### For Automated Testing

These test cases can be adapted for automated testing by:

1. Creating a test script that sends prompts to the webhook endpoint
2. Verifying responses against expected patterns
3. Checking state transitions through context tracking
4. Integrating into a CI/CD pipeline

## Test Execution Plan

To thoroughly test all three flows, follow this sequence:

1. Run the style recommendation flow tests first, as this is the most common user interaction
2. Run the frame finder flow tests next, as this is the most complex flow
3. Run the fit consultation flow tests last, as this combines educational and practical elements

## Success Criteria

The overall testing is considered successful when:

- 90% or higher success rate on all test cases
- Smooth transitions between conversation states
- Appropriate handling of edge cases
- Accurate parameter extraction and entity recognition
- Relevant recommendations based on user inputs
- Proper webhook integration
- Correct flow selection based on user intent

## Maintaining Tests

As the conversation flows evolve, these test documents should be updated to reflect changes in:

1. Flow states and transitions
2. Expected responses
3. Parameter handling
4. New features or capabilities

Update the test files whenever making significant changes to the flow definitions or webhook handlers.
