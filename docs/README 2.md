# VARAi API Documentation Site

This directory contains the VARAi API documentation site, which provides comprehensive documentation for the VARAi API, including authentication, endpoints, error handling, rate limiting, and webhooks.

## Overview

The API documentation site is built using React and the VARAi design system. It provides a clean, developer-friendly interface for browsing the API documentation, with features such as:

- Interactive navigation system
- Search functionality
- Version selector
- Code snippets with syntax highlighting
- Interactive API endpoint documentation
- Collapsible sections
- Mobile-responsive design

## Directory Structure

```
docs/
├── api/
│   ├── components/         # Reusable UI components
│   │   ├── __tests__/      # Component tests
│   │   ├── ApiEndpoint.tsx # API endpoint component
│   │   ├── CodeSnippet.tsx # Code snippet component
│   │   └── ...
│   ├── sections/           # Documentation content sections
│   │   ├── GettingStarted.tsx
│   │   ├── Authentication.tsx
│   │   └── ...
│   ├── assets/             # Static assets (images, etc.)
│   └── index.tsx           # API documentation main component
├── index.tsx               # Entry point
├── index.html              # HTML template
└── README.md               # This file
```

## Components

The API documentation site includes the following reusable components:

- **CodeSnippet**: Displays code with syntax highlighting and a copy button
- **ApiEndpoint**: Displays API endpoint information with method, path, description, parameters, and examples
- **ParameterTable**: Displays a table of API parameters
- **HttpStatusCode**: Displays HTTP status code information
- **CollapsibleSection**: A section that can be expanded or collapsed
- **TableOfContents**: Navigation component for browsing documentation
- **SearchBar**: Search functionality for finding specific documentation
- **VersionSelector**: Selector for different API versions

## Documentation Sections

The API documentation is organized into the following sections:

- **Getting Started**: Introduction to the VARAi API
- **Authentication**: How to authenticate with the API
- **API Reference**: Detailed information about all API endpoints
- **Error Handling**: How to handle errors from the API
- **Rate Limiting**: Information about API rate limits
- **Webhooks**: How to use webhooks with the API

## Running the Documentation Site

To run the documentation site locally:

1. Make sure you have Node.js and npm installed
2. Navigate to the project root directory
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000/docs`

## Building for Production

To build the documentation site for production:

1. Navigate to the project root directory
2. Run the build command:
   ```
   npm run build
   ```
3. The built files will be available in the `dist` directory

## Contributing

To contribute to the API documentation:

1. Create a new branch for your changes
2. Make your changes to the relevant files
3. Add tests for any new components or functionality
4. Run the tests to ensure everything is working:
   ```
   npm test
   ```
5. Submit a pull request with your changes

## Contact

If you have any questions or need assistance with the API documentation, please contact the VARAi development team at [dev-support@varai.ai](mailto:dev-support@varai.ai).