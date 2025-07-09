const express = require('express');
const TenantController = require('../controllers/tenantController');
const { authenticateApiKey, requireAdminRole } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

function createTenantRoutes(pool) {
  const router = express.Router();
  const tenantController = new TenantController(pool);

  // Public API key validation endpoint
  router.get('/validate-key/:apiKey', rateLimiter, async (req, res) => {
    try {
      const { apiKey } = req.params;
      const tenant = await tenantController.tenantModel.findByApiKey(apiKey);
      
      if (!tenant) {
        return res.status(404).json({
          valid: false,
          error: 'Invalid API key'
        });
      }

      res.json({
        valid: true,
        tenant: {
          id: tenant.id,
          companyName: tenant.company_name,
          subdomain: tenant.subdomain,
          tier: tenant.tier,
          status: tenant.status
        }
      });
    } catch (error) {
      res.status(500).json({
        valid: false,
        error: 'Internal server error'
      });
    }
  });

  // Admin routes - require authentication
  router.use(authenticateApiKey);
  router.use(requireAdminRole);

  // Tenant management routes
  router.post('/', rateLimiter, (req, res) => 
    tenantController.createTenant(req, res)
  );

  router.get('/', rateLimiter, (req, res) => 
    tenantController.getAllTenants(req, res)
  );

  router.get('/:id', rateLimiter, (req, res) => 
    tenantController.getTenant(req, res)
  );

  router.put('/:id', rateLimiter, (req, res) => 
    tenantController.updateTenant(req, res)
  );

  router.delete('/:id', rateLimiter, (req, res) => 
    tenantController.deleteTenant(req, res)
  );

  // API key management
  router.post('/:id/regenerate-key', rateLimiter, (req, res) => 
    tenantController.regenerateApiKey(req, res)
  );

  // Configuration management
  router.get('/:id/config', rateLimiter, (req, res) => 
    tenantController.getTenantConfig(req, res)
  );

  router.put('/:id/config', rateLimiter, (req, res) => 
    tenantController.updateTenantConfig(req, res)
  );

  // Usage metrics
  router.get('/:id/usage', rateLimiter, (req, res) => 
    tenantController.getTenantUsage(req, res)
  );

  return router;
}

module.exports = createTenantRoutes;