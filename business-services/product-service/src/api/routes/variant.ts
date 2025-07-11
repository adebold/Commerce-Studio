import { Router } from 'express';

const router = Router();

/**
 * Variant routes (placeholder)
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Variant service is running',
    endpoints: [
      'GET /api/products/:productId/variants',
      'GET /api/products/:productId/variants/:id',
      'POST /api/products/:productId/variants',
      'PUT /api/products/:productId/variants/:id',
      'DELETE /api/products/:productId/variants/:id'
    ]
  });
});

export { router as variantRouter };