import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation.controller';
import { validateTenantId } from '../middleware/auth.middleware';

const router = Router();
const recommendationController = new RecommendationController();

// Apply tenant validation middleware to all routes
router.use(validateTenantId);

/**
 * @route GET /api/recommendations/trending
 * @desc Get trending products
 * @access Public (with tenant validation)
 */
router.get('/trending', recommendationController.getTrendingProducts);

/**
 * @route GET /api/recommendations/recently-viewed/:userId
 * @desc Get recently viewed products for a user
 * @access Public (with tenant validation)
 */
router.get('/recently-viewed/:userId', recommendationController.getRecentlyViewed);

/**
 * @route GET /api/recommendations/similar/:productId
 * @desc Get similar products to a given product
 * @access Public (with tenant validation)
 */
router.get('/similar/:productId', recommendationController.getSimilarProducts);

/**
 * @route POST /api/recommendations/track-view
 * @desc Track a product view for recommendations
 * @access Public (with tenant validation)
 */
router.post('/track-view', recommendationController.trackProductView);

/**
 * @route POST /api/recommendations/feedback
 * @desc Submit feedback for recommendations
 * @access Public (with tenant validation)
 */
router.post('/feedback', recommendationController.submitFeedback);

export { router as recommendationRouter };