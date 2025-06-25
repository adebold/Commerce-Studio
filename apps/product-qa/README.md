# Product Q&A App for VARAi

The Product Q&A app allows merchants to add a powerful question and answer section to their product pages, enhancing customer engagement and boosting conversion rates.

## Features

- **Product Q&A Widget**: Embeddable widget for product pages that allows customers to ask questions and view answers
- **Q&A Management Dashboard**: Comprehensive dashboard for merchants to manage questions and answers
- **Notification System**: Real-time notifications for new questions and answers
- **Moderation Tools**: Tools for moderating questions and answers to maintain quality
- **Analytics Dashboard**: Detailed analytics on Q&A engagement and impact on sales
- **Multi-Platform Support**: Compatible with Shopify, BigCommerce, Magento, and WooCommerce

## Installation

1. Install the app from the VARAi app store
2. Configure the app settings
3. Add the Q&A widget to your product pages
4. Start answering customer questions!

## Configuration

The app can be configured through the settings page in the merchant dashboard. Key configuration options include:

- Widget appearance and placement
- Notification preferences
- Moderation settings
- Auto-response configuration
- Analytics preferences

## API Integration

The Product Q&A app provides a comprehensive API for integrating with other systems:

```
GET /api/product-qa/questions - List all questions
POST /api/product-qa/questions - Create a new question
GET /api/product-qa/questions/:id - Get a specific question
PUT /api/product-qa/questions/:id - Update a question
DELETE /api/product-qa/questions/:id - Delete a question
GET /api/product-qa/questions/:id/answers - List answers for a question
POST /api/product-qa/questions/:id/answers - Add an answer to a question
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## License

MIT