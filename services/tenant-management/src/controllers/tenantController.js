const TenantModel = require('../models/Tenant');
const TenantConfigModel = require('../models/TenantConfig');
const { validateTenantData, validateTenantUpdate } = require('../utils/validation');
const logger = require('../utils/logger');

class TenantController {
  constructor(pool) {
    this.tenantModel = new TenantModel(pool);
    this.configModel = new TenantConfigModel(pool);
  }

  async createTenant(req, res) {
    try {
      const validatedData = validateTenantData(req.body);
      
      // Check if subdomain is available
      const existingTenant = await this.tenantModel.findBySubdomain(validatedData.subdomain);
      if (existingTenant) {
        return res.status(409).json({
          error: 'Subdomain already exists',
          code: 'SUBDOMAIN_TAKEN'
        });
      }

      // Create tenant
      const tenant = await this.tenantModel.create(validatedData);
      
      // Create default configuration
      await this.createDefaultConfiguration(tenant.id);

      logger.info(`Tenant created successfully: ${tenant.id}`, {
        tenantId: tenant.id,
        companyName: tenant.company_name,
        subdomain: tenant.subdomain
      });

      res.status(201).json({
        success: true,
        data: this.sanitizeTenantData(tenant),
        message: 'Tenant created successfully'
      });

    } catch (error) {
      logger.error('Error creating tenant:', error);
      
      if (error.message === 'Subdomain already exists') {
        return res.status(409).json({
          error: error.message,
          code: 'SUBDOMAIN_TAKEN'
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  async getTenant(req, res) {
    try {
      const { id } = req.params;
      
      const tenant = await this.tenantModel.findById(id);
      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
          code: 'TENANT_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: this.sanitizeTenantData(tenant)
      });

    } catch (error) {
      logger.error('Error getting tenant:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  async getAllTenants(req, res) {
    try {
      const {
        limit = 50,
        offset = 0,
        status,
        tier
      } = req.query;

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        status,
        tier
      };

      const tenants = await this.tenantModel.findAll(options);
      
      res.json({
        success: true,
        data: tenants.map(tenant => this.sanitizeTenantData(tenant)),
        pagination: {
          limit: options.limit,
          offset: options.offset,
          total: tenants.length
        }
      });

    } catch (error) {
      logger.error('Error getting tenants:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  async updateTenant(req, res) {
    try {
      const { id } = req.params;
      const validatedData = validateTenantUpdate(req.body);
      
      const tenant = await this.tenantModel.update(id, validatedData);
      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
          code: 'TENANT_NOT_FOUND'
        });
      }

      logger.info(`Tenant updated successfully: ${tenant.id}`, {
        tenantId: tenant.id,
        updates: validatedData
      });

      res.json({
        success: true,
        data: this.sanitizeTenantData(tenant),
        message: 'Tenant updated successfully'
      });

    } catch (error) {
      logger.error('Error updating tenant:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  async deleteTenant(req, res) {
    try {
      const { id } = req.params;
      
      const tenant = await this.tenantModel.delete(id);
      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
          code: 'TENANT_NOT_FOUND'
        });
      }

      logger.info(`Tenant deleted successfully: ${tenant.id}`, {
        tenantId: tenant.id
      });

      res.json({
        success: true,
        message: 'Tenant deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting tenant:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  async regenerateApiKey(req, res) {
    try {
      const { id } = req.params;
      
      const tenant = await this.tenantModel.regenerateApiKey(id);
      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
          code: 'TENANT_NOT_FOUND'
        });
      }

      logger.info(`API key regenerated for tenant: ${tenant.id}`, {
        tenantId: tenant.id
      });

      res.json({
        success: true,
        data: {
          apiKey: tenant.api_key
        },
        message: 'API key regenerated successfully'
      });

    } catch (error) {
      logger.error('Error regenerating API key:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  async getTenantConfig(req, res) {
    try {
      const { id } = req.params;
      
      const config = await this.configModel.getTenantConfig(id);
      
      res.json({
        success: true,
        data: config
      });

    } catch (error) {
      logger.error('Error getting tenant config:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  async updateTenantConfig(req, res) {
    try {
      const { id } = req.params;
      const { configKey, configValue } = req.body;
      
      if (!configKey || !configValue) {
        return res.status(400).json({
          error: 'Config key and value are required',
          code: 'INVALID_INPUT'
        });
      }

      const config = await this.configModel.updateConfig(id, configKey, configValue);
      
      res.json({
        success: true,
        data: config,
        message: 'Configuration updated successfully'
      });

    } catch (error) {
      logger.error('Error updating tenant config:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  async getTenantUsage(req, res) {
    try {
      const { id } = req.params;
      const { timeRange = '30 days' } = req.query;
      
      const usage = await this.tenantModel.getUsageMetrics(id, timeRange);
      
      res.json({
        success: true,
        data: usage
      });

    } catch (error) {
      logger.error('Error getting tenant usage:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  async createDefaultConfiguration(tenantId) {
    const defaultConfig = {
      branding: {
        companyName: '',
        logo: '',
        favicon: '',
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          accent: '#28a745'
        },
        fonts: {
          heading: 'Arial, sans-serif',
          body: 'Helvetica, sans-serif'
        }
      },
      features: {
        consultation: true,
        vto: true,
        faceAnalysis: true,
        recommendations: true,
        analytics: true
      },
      commerce: {
        catalogId: '',
        categories: [],
        paymentMethods: ['credit_card'],
        shipping: {
          enabled: false,
          methods: []
        }
      },
      integrations: {
        googleAnalytics: '',
        facebook: '',
        zapier: ''
      }
    };

    await this.configModel.updateConfig(tenantId, 'default', defaultConfig);
  }

  sanitizeTenantData(tenant) {
    const sanitized = { ...tenant };
    // Don't expose API key in regular responses
    delete sanitized.api_key;
    return sanitized;
  }
}

module.exports = TenantController;