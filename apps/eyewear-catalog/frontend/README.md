# Eyewear Catalog Frontend

A React-based frontend application for the Eyewear Catalog Shopify app, providing a user-friendly interface to sync eyewear products from the eyewear database to a Shopify store.

## Features

- **Dashboard**: Overview of sync status, statistics, and recent activity
- **Product Management**: Browse, search, and filter products from the eyewear database
- **Sync Controls**: Start, monitor, and cancel sync processes
- **Settings**: Configure sync options and scheduled syncs
- **History**: View detailed sync history and logs

## Tech Stack

- **React**: UI library for building the interface
- **React Router**: For client-side routing
- **Shopify Polaris**: Design system and component library
- **Axios**: HTTP client for API requests
- **date-fns**: Date utility library

## Project Structure

```
frontend/
├── public/             # Static files
├── src/                # Source code
│   ├── components/     # Reusable UI components
│   ├── layouts/        # Page layout components
│   ├── pages/          # Page components
│   ├── providers/      # Context providers
│   ├── App.js          # Main application component
│   ├── index.js        # Application entry point
│   └── index.css       # Global styles
├── package.json        # Project dependencies and scripts
└── README.md           # Project documentation
```

## Key Components

### Pages

- **Dashboard.js**: Main dashboard displaying sync status and statistics
- **ProductSync.js**: Page for browsing and syncing products
- **Settings.js**: Configuration page for sync settings
- **SyncHistory.js**: Page for viewing sync history and logs
- **Auth.js**: Shopify OAuth authentication page

### Components

- **StatusIndicator.js**: Displays sync status with appropriate badges
- **SyncProgressBar.js**: Shows sync progress with details

### Providers

- **ApiProvider.js**: Provides API client with authentication handling
- **AuthProvider.js**: Manages authentication state and session

### Layouts

- **AppLayout.js**: Main application layout with navigation
- **AuthLayout.js**: Simple layout for authentication pages

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Build for production:
   ```
   npm run build
   ```

## API Integration

The frontend communicates with the backend API for:

- Authentication with Shopify
- Fetching product data
- Managing sync processes
- Configuring sync settings
- Retrieving sync history

## Authentication Flow

1. User visits the app and is redirected to the auth page
2. User clicks "Login with Shopify"
3. User is redirected to Shopify for OAuth authorization
4. After authorization, Shopify redirects back to the app with an auth code
5. The app exchanges the code for access tokens
6. User is authenticated and can use the app

## Development Notes

- The app uses Shopify Polaris for UI components and styling
- React Router handles navigation between pages
- API requests are managed through the ApiProvider
- Authentication state is maintained in the AuthProvider