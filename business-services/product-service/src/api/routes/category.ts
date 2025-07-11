import { Router } from 'express';

const router = Router();

/**
 * Category routes (placeholder)
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Category service is running',
    endpoints: [
      'GET /api/categories',
      'GET /api/categories/:id',
      'POST /api/categories',
      'PUT /api/categories/:id',
      'DELETE /api/categories/:id'
    ]
  });
});

export { router as categoryRouter };