const { v4: uuidv4 } = require('uuid');

class TenantConfigModel {
  constructor(pool) {
    this.pool = pool;
  }

  async getTenantConfig(tenantId) {
    const query = `
      SELECT config_key, config_value, created_at, updated_at
      FROM tenant_configurations
      WHERE tenant_id = $1
      ORDER BY config_key
    `;
    
    const result = await this.pool.query(query, [tenantId]);
    
    // Convert to key-value object
    const config = {};
    result.rows.forEach(row => {
      config[row.config_key] = row.config_value;
    });
    
    return config;
  }

  async getConfigValue(tenantId, configKey) {
    const query = `
      SELECT config_value
      FROM tenant_configurations
      WHERE tenant_id = $1 AND config_key = $2
    `;
    
    const result = await this.pool.query(query, [tenantId, configKey]);
    return result.rows[0]?.config_value || null;
  }

  async updateConfig(tenantId, configKey, configValue) {
    const query = `
      INSERT INTO tenant_configurations (tenant_id, config_key, config_value)
      VALUES ($1, $2, $3)
      ON CONFLICT (tenant_id, config_key)
      DO UPDATE SET 
        config_value = $3,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [tenantId, configKey, configValue]);
    return result.rows[0];
  }

  async updateMultipleConfigs(tenantId, configUpdates) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const results = [];
      
      for (const [configKey, configValue] of Object.entries(configUpdates)) {
        const query = `
          INSERT INTO tenant_configurations (tenant_id, config_key, config_value)
          VALUES ($1, $2, $3)
          ON CONFLICT (tenant_id, config_key)
          DO UPDATE SET 
            config_value = $3,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;
        
        const result = await client.query(query, [tenantId, configKey, configValue]);
        results.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return results;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteConfig(tenantId, configKey) {
    const query = `
      DELETE FROM tenant_configurations
      WHERE tenant_id = $1 AND config_key = $2
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [tenantId, configKey]);
    return result.rows[0] || null;
  }

  async deleteAllConfigs(tenantId) {
    const query = `
      DELETE FROM tenant_configurations
      WHERE tenant_id = $1
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [tenantId]);
    return result.rows;
  }

  async getConfigHistory(tenantId, configKey, limit = 10) {
    // This would require a separate audit table for configuration history
    // For now, just return current config
    return await this.getConfigValue(tenantId, configKey);
  }

  async validateConfigStructure(config) {
    const requiredSections = ['branding', 'features', 'commerce', 'integrations'];
    
    for (const section of requiredSections) {
      if (!config[section]) {
        throw new Error(`Missing required configuration section: ${section}`);
      }
    }

    // Validate branding section
    if (config.branding) {
      if (!config.branding.colors || !config.branding.fonts) {
        throw new Error('Branding configuration must include colors and fonts');
      }
    }

    // Validate features section
    if (config.features) {
      const allowedFeatures = ['consultation', 'vto', 'faceAnalysis', 'recommendations', 'analytics'];
      for (const feature in config.features) {
        if (!allowedFeatures.includes(feature)) {
          throw new Error(`Unknown feature: ${feature}`);
        }
      }
    }

    return true;
  }

  async cloneConfig(sourceTenantId, targetTenantId) {
    const sourceConfig = await this.getTenantConfig(sourceTenantId);
    
    if (Object.keys(sourceConfig).length === 0) {
      throw new Error('Source tenant has no configuration to clone');
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete existing config for target tenant
      await client.query(
        'DELETE FROM tenant_configurations WHERE tenant_id = $1',
        [targetTenantId]
      );
      
      // Insert cloned configuration
      const results = [];
      for (const [configKey, configValue] of Object.entries(sourceConfig)) {
        const query = `
          INSERT INTO tenant_configurations (tenant_id, config_key, config_value)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        
        const result = await client.query(query, [targetTenantId, configKey, configValue]);
        results.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return results;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = TenantConfigModel;