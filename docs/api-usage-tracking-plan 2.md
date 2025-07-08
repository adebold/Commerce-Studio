# Plan: Implement Tracking of Third-Party API Costs

**Goal:** Accurately track the cost of API calls to third-party services (e.g., OpenAI, Vertex AI) for billing and usage monitoring purposes.

**1. Identify API Call Locations (Estimated Time: 2 hours)**

*   Use `search_files` to identify all instances where third-party API clients (e.g., OpenAI, Vertex AI) are being used.
*   Create a list of files and line numbers where these API calls are made.
*   Example search queries:
    *   `regex: openai.Completion.create`
    *   `regex: vertexai.predict`

**2. Implement Usage Recording Mechanism (Estimated Time: 4 hours)**

*   Create a utility function (e.g., `record_third_party_api_usage`) that takes the following parameters:
    *   `tenant_id`: The ID of the tenant making the API call.
    *   `api_name`: The name of the API being called (e.g., "openai.Completion").
    *   `cost`: The cost of the API call (if available) or an estimated cost.
    *   `usage_data`: A dictionary containing details about the API call (e.g., number of tokens used, input parameters).
*   Within this function:
    *   Call the existing `record_usage` function in `billing_service.py` to record the usage.
    *   Log the API call details for debugging and auditing purposes.
*   Modify the API call locations identified in step 1 to call this utility function after each API call.

**3. Cost Estimation (Estimated Time: 4 hours)**

*   For APIs where the cost is not directly available in the API response (e.g., OpenAI), implement a cost estimation mechanism.
*   This may involve:
    *   Using the number of tokens used (if available) to estimate the cost based on the API pricing model.
    *   Using the input parameters to estimate the cost based on the API pricing model.
    *   Storing the API pricing models in a configuration file or database.
*   Update the `record_third_party_api_usage` function to use this cost estimation mechanism when the cost is not directly available.

**4. Add API Usage Limits to Subscription Plans (Estimated Time: 4 hours)**

*   Update the `PlanFeature` model in `src/api/models/billing.py` to include a field for the API name (e.g., `api_name`).
*   Update the `PlanCreate` and `PlanUpdate` models to allow administrators to specify the API name and usage limit for each feature.
*   Update the `create_plan` and `update_plan` functions in `billing_service.py` to handle the new `api_name` field.
*   Modify the `record_third_party_api_usage` function to check if the tenant has exceeded the usage limit for the API.
*   If the tenant has exceeded the usage limit, either block the API call or flag the tenant for overage billing.

**5. Update Knowledge Base (Estimated Time: 2 hours)**

*   Update the Knowledge Base component (`src/client-portal-integration/components/admin/KnowledgeBase.jsx`) to reflect the changes to the billing system.
*   Add sections on:
    *   Tracking third-party API costs
    *   Setting API usage limits in subscription plans
    *   Handling API usage overages

**6. Testing (Estimated Time: 4 hours)**

*   Write unit tests for the `record_third_party_api_usage` function.
*   Write integration tests to verify that API usage is being tracked correctly and that usage limits are being enforced.
*   Manually test the changes to the billing system to ensure that everything is working as expected.

**7. Deployment (Estimated Time: 1 hour)**

*   Deploy the changes to the production environment.
*   Monitor the system to ensure that API usage is being tracked correctly and that there are no unexpected issues.

**Total Estimated Time: 21 hours**

**Mermaid Diagram:**

```mermaid
graph LR
    A[Identify API Call Locations] --> B(Implement Usage Recording Mechanism);
    B --> C{Cost Available in API Response?};
    C -- Yes --> D(Record Usage);
    C -- No --> E[Implement Cost Estimation];
    E --> D;
    D --> F(Add API Usage Limits to Subscription Plans);
    F --> G(Update Knowledge Base);
    G --> H(Testing);
    H --> I(Deployment);