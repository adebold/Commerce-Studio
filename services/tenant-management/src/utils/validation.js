const Joi = require('joi');

const tenantSchema = Joi.object({
  companyName: Joi.string().min(2).max(255).required(),
  subdomain: Joi.string()
    .min(3)
    .max(100)
    .pattern(/^[a-z0-9-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Subdomain must contain only lowercase letters, numbers, and hyphens'
    }),
  customDomain: Joi.string().domain().optional(),
  tier: Joi.string().valid('basic', 'premium', 'enterprise').optional()
});

const tenantUpdateSchema = Joi.object({
  companyName: Joi.string().min(2).max(255).optional(),
  subdomain: Joi.string()
    .min(3)
    .max(100)
    .pattern(/^[a-z0-9-]+$/)
    .optional(),
  customDomain: Joi.string().domain().optional(),
  status: Joi.string().valid('active', 'inactive', 'suspended', 'pending').optional(),
  tier: Joi.string().valid('basic', 'premium', 'enterprise').optional()
});

const configSchema = Joi.object({
  branding: Joi.object({
    companyName: Joi.string().optional(),
    logo: Joi.string().uri().optional(),
    favicon: Joi.string().uri().optional(),
    colors: Joi.object({
      primary: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/).required(),
      secondary: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/).required(),
      accent: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/).optional()
    }).required(),
    fonts: Joi.object({
      heading: Joi.string().required(),
      body: Joi.string().required()
    }).required()
  }).optional(),
  
  features: Joi.object({
    consultation: Joi.boolean().optional(),
    vto: Joi.boolean().optional(),
    faceAnalysis: Joi.boolean().optional(),
    recommendations: Joi.boolean().optional(),
    analytics: Joi.boolean().optional()
  }).optional(),
  
  commerce: Joi.object({
    catalogId: Joi.string().optional(),
    categories: Joi.array().items(Joi.string()).optional(),
    paymentMethods: Joi.array().items(Joi.string()).optional(),
    shipping: Joi.object({
      enabled: Joi.boolean().optional(),
      methods: Joi.array().items(Joi.string()).optional()
    }).optional()
  }).optional(),
  
  integrations: Joi.object({
    googleAnalytics: Joi.string().optional(),
    facebook: Joi.string().optional(),
    zapier: Joi.string().optional()
  }).optional()
});

function validateTenantData(data) {
  const { error, value } = tenantSchema.validate(data);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }
  return value;
}

function validateTenantUpdate(data) {
  const { error, value } = tenantUpdateSchema.validate(data);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }
  return value;
}

function validateConfig(data) {
  const { error, value } = configSchema.validate(data);
  if (error) {
    throw new Error(`Config validation error: ${error.details[0].message}`);
  }
  return value;
}

module.exports = {
  validateTenantData,
  validateTenantUpdate,
  validateConfig
};