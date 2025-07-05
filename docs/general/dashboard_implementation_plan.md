# Dashboard Implementation Plan

## Problem

Users are being redirected to the home page instead of their specific dashboard after logging in.

## Root Cause

The frontend application lacks the routing logic to redirect users to different dashboards based on their roles. The `login` function in `AuthProvider.tsx` only updates the authentication state and user context, but it does not perform any redirection. The `routes.tsx` file only defines a single route for the home page (`/`), which is mapped to the `HomePage` component.

## Proposed Solution

1.  **Modify the `login` function in `AuthProvider.tsx` to redirect users to different dashboards based on their roles.** After successfully authenticating a user, the `login` function should check the user's role and redirect them to the appropriate dashboard.
2.  **Create different dashboard components for each user role.** Create separate components for the Super Admin, Client Admin, Brand Manager, and Viewer dashboards.
3.  **Update the `routes.tsx` file to define routes for each dashboard.** Add routes for each dashboard component, such as `/super-admin-dashboard`, `/client-admin-dashboard`, `/brand-manager-dashboard`, and `/viewer-dashboard`.
4.  **Implement the redirection logic in the `login` function.** Use the `useNavigate` hook from `react-router-dom` to redirect users to the appropriate dashboard based on their role.

## Implementation Steps

1.  **Create dashboard components:**
    *   Create `SuperAdminDashboard.tsx`, `ClientAdminDashboard.tsx`, `BrandManagerDashboard.tsx`, and `ViewerDashboard.tsx` in the `frontend/src/components/dashboard/` directory.
    *   Implement the UI for each dashboard component.
2.  **Update `routes.tsx`:**
    *   Import the new dashboard components.
    *   Add routes for each dashboard:
        *   `<Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />`
        *   `<Route path="/client-admin-dashboard" element={<ClientAdminDashboard />} />`
        *   `<Route path="/brand-manager-dashboard" element={<BrandManagerDashboard />} />`
        *   `<Route path="/viewer-dashboard" element={<ViewerDashboard />} />`
3.  **Modify `AuthProvider.tsx`:**
    *   Import the `useNavigate` hook from `react-router-dom`.
    *   In the `login` function, after successfully authenticating the user, get the user's role from the `userContext`.
    *   Use a `switch` statement to determine the appropriate dashboard route based on the user's role.
    *   Use the `navigate` function to redirect the user to the corresponding dashboard route.

## Mermaid Diagram

```mermaid
graph LR
    A[Modify login function in AuthProvider.tsx] --> B{Check user role}
    B --> C{Redirect to appropriate dashboard}
    D[Create dashboard components for each role]
    E[Update routes.tsx with dashboard routes]