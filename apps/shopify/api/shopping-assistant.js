import { VertexAIConnector } from '../connectors/vertex-ai-connector';
import { logger } from '../utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, sessionId, contextItems = [], shopDomain } = req.body;

    // Validate required parameters
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    if (!shopDomain) {
      return res.status(400).json({ error: 'Shop domain is required' });
    }

    // Initialize Vertex AI connector
    const vertexAI = new VertexAIConnector(shopDomain);

    // Get product recommendations
    const result = await vertexAI.getProductRecommendation(query, {
      sessionId,
      contextItems,
      maxResults: 5 // Limit to 5 products for UI
    });

    // Return response
    return res.status(200).json({
      response: result.response,
      products: result.products,
      suggestedQueries: result.suggestedQueries || []
    });
  } catch (error) {
    logger.error('Error in shopping assistant API:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message
    });
  }
}
