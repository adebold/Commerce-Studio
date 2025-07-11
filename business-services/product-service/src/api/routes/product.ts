import { Router } from 'express';

const router = Router();

/**
 * Product routes (placeholder)
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Product service is running',
    endpoints: [
      'GET /api/products',
      'GET /api/products/:id',
      'POST /api/products',
      'PUT /api/products/:id',
      'DELETE /api/products/:id'
    ]
  });
});

export { router as productRouter };