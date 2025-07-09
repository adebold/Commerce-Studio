const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class TenantModel {
  constructor(pool) {
    this.pool = pool;
  }

  async create(tenantData) {
    const {
      companyName,
      subdomain,
      customDomain,
      tier = 'basic'
    } = tenantData;

    const id = uuidv4();
    const apiKey = this.generateApiKey();
    
    const query = `
      INSERT INTO tenants (id, company_name, subdomain, custom_domain, api_key, tier)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [id, companyName, subdomain, customDomain, apiKey, tier];
    
    try {
      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        if (error.constraint === 'tenants_subdomain_key') {
          throw new Error('Subdomain already exists');
        }
        if (error.constraint === 'tenants_api_key_key') {
          throw new Error('API key collision - please retry');
        }
      }
      throw error;
    }
  }

  async findById(id) {
    const query = `
      SELECT * FROM tenants 
      WHERE id = $1 AND deleted_at IS NULL
    `;
    
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findBySubdomain(subdomain) {
    const query = `
      SELECT * FROM tenants 
      WHERE subdomain = $1 AND deleted_at IS NULL
    `;
    
    const result = await this.pool.query(query, [subdomain]);
    return result.rows[0] || null;
  }

  async findByApiKey(apiKey) {
    const query = `
      SELECT * FROM tenants 
      WHERE api_key = $1 AND deleted_at IS NULL AND status = 'active'
    `;
    
    const result = await this.pool.query(query, [apiKey]);
    return result.rows[0] || null;
  }

  async findAll(options = {}) {
    const { limit = 50, offset = 0, status, tier } = options;
    
    let query = `
      SELECT * FROM tenants 
      WHERE deleted_at IS NULL
    `;
    
    const values = [];
    let paramCount = 0;
    
    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      values.push(status);
    }
    
    if (tier) {
      paramCount++;
      query += ` AND tier = $${paramCount}`;
      values.push(tier);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);
    
    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async update(id, updateData) {
    const allowedFields = ['company_name', 'subdomain', 'custom_domain', 'status', 'tier'];
    const updates = [];
    const values = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(updateData)) {
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbField)) {
        paramCount++;
        updates.push(`${dbField} = $${paramCount}`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    paramCount++;
    values.push(id);

    const query = `
      UPDATE tenants 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id) {
    const query = `
      UPDATE tenants 
      SET deleted_at = CURRENT_TIMESTAMP, status = 'inactive'
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async regenerateApiKey(id) {
    const newApiKey = this.generateApiKey();
    
    const query = `
      UPDATE tenants 
      SET api_key = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [newApiKey, id]);
    return result.rows[0] || null;
  }

  generateApiKey() {
    const prefix = 'cs_';
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return prefix + randomBytes;
  }

  async getUsageMetrics(tenantId, timeRange = '30 days') {
    const query = `
      SELECT 
        metric_type,
        SUM(metric_value) as total_value,
        COUNT(*) as record_count,
        AVG(metric_value) as avg_value,
        MAX(metric_value) as max_value,
        MIN(metric_value) as min_value
      FROM tenant_usage_metrics
      WHERE tenant_id = $1 
        AND recorded_at >= NOW() - INTERVAL '${timeRange}'
      GROUP BY metric_type
      ORDER BY metric_type
    `;
    
    const result = await this.pool.query(query, [tenantId]);
    return result.rows;
  }

  async recordUsageMetric(tenantId, metricType, metricValue, metricUnit) {
    const query = `
      INSERT INTO tenant_usage_metrics (tenant_id, metric_type, metric_value, metric_unit)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [tenantId, metricType, metricValue, metricUnit]);
    return result.rows[0];
  }
}

module.exports = TenantModel;