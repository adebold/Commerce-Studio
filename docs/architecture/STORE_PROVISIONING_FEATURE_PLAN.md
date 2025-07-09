# Store Provisioning Feature - Implementation Plan

## 1. Executive Summary

This document outlines the implementation plan for the **Store Provisioning** feature within the **Management Portal**. This feature will provide administrators with a user-friendly interface for triggering and monitoring the automated creation of new online catalogs for each tenant.

## 2. User Stories

-   As an administrator, I want to be able to trigger the provisioning of a new store for a tenant so that I can quickly onboard a new customer.
-   As an administrator, I want to be able to monitor the status of a provisioning job in real-time so that I can track its progress.
-   As an administrator, I want to be able to view the logs of a provisioning job so that I can debug any issues that may arise.

## 3. UI/UX Design

The Store Provisioning feature will be integrated into the `TenantDetailPage`.

-   A "Provision Store" button will be added to the `TenantDetailPage`.
-   A `ProvisioningStatus` component will display the current status of the provisioning job (e.g., `queued`, `processing`, `deployed`, `failed`).
-   A `ProvisioningLogs` component will display the logs for the provisioning job.

## 4. Component Breakdown

### 4.1. `TenantDetailPage.jsx`

-   **`ProvisionStoreButton`**: A button to trigger the provisioning process for the current tenant.
-   **`ProvisioningStatus`**: A component to display the real-time status of the provisioning job.
-   **`ProvisioningLogs`**: A component to display the logs for the provisioning job.

## 5. State Management (Redux)

A new `provisioningSlice` will be created to manage the state for the Store Provisioning feature.

-   **`jobs`**: An object to store the status and logs of provisioning jobs, keyed by tenant ID.
-   **`status`**: The current status of API requests (`idle`, `loading`, `succeeded`, `failed`).
-   **`error`**: Any error messages from API requests.

## 6. API Integration

The components will interact with the **Store Provisioning Service** via a dedicated API client.

**`provisioning-api.js`**
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_PROVISIONING_API_URL,
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});

export const provisionStore = (tenantId) => apiClient.post('/provision/store', { tenantId });
export const getProvisioningStatus = (jobId) => apiClient.get(`/provision/status/${jobId}`);
```

## 7. Implementation Steps

1.  **Create `provisioningSlice`**: Implement the Redux slice for managing provisioning state.
2.  **Build `provisioning-api.js`**: Create the API client for interacting with the Store Provisioning Service.
3.  **Develop `ProvisionStoreButton`**: Build the button component for triggering the provisioning process.
4.  **Implement `ProvisioningStatus`**: Create the component for displaying the real-time status of a provisioning job.
5.  **Develop `ProvisioningLogs`**: Build the component for displaying the logs of a provisioning job.
6.  **Integrate into `TenantDetailPage`**: Add the new components to the `TenantDetailPage` and connect them to the Redux store and API client.

This plan provides a clear roadmap for implementing the Store Provisioning feature, which is a critical step in automating the onboarding of new customers.