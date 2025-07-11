import { Router } from 'express';

const router = Router();

/**
 * Search routes (placeholder)
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Search service is running',
    endpoints: [
      'GET /api/search?q=query',
      'GET /api/search/suggestions?q=query',
      'POST /api/search/index',
      'DELETE /api/search/index'
    ]
  });
});

export { router as searchRouter };