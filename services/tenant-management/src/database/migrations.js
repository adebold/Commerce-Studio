const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class DatabaseMigrations {
  constructor(pool) {
    this.pool = pool;
  }

  async runMigrations() {
    try {
      logger.info('Starting database migrations...');
      
      // Read and execute schema file
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute schema creation
      await this.pool.query(schema);
      logger.info('Database schema created successfully');
      
      // Check if migrations table exists
      await this.createMigrationsTable();
      
      // Mark initial migration as complete
      await this.markMigrationComplete('001_initial_schema');
      
      logger.info('Database migrations completed successfully');
      return true;
    } catch (error) {
      logger.error('Database migration failed:', error);
      throw error;
    }
  }

  async createMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await this.pool.query(query);
    logger.info('Migrations table created');
  }

  async markMigrationComplete(migrationName) {
    const query = `
      INSERT INTO migrations (migration_name) 
      VALUES ($1) 
      ON CONFLICT (migration_name) DO NOTHING;
    `;
    
    await this.pool.query(query, [migrationName]);
    logger.info(`Migration marked as complete: ${migrationName}`);
  }

  async checkMigrationStatus(migrationName) {
    const query = 'SELECT * FROM migrations WHERE migration_name = $1';
    const result = await this.pool.query(query, [migrationName]);
    return result.rows.length > 0;
  }

  async testConnection() {
    const maxRetries = 10;
    const retryDelay = 5000; // 5 seconds

    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.pool.query('SELECT NOW()');
        logger.info('Database connection successful');
        return true;
      } catch (error) {
        logger.warn(`Database connection attempt ${i + 1} failed:`, error.message);
        if (i < maxRetries - 1) {
          logger.info(`Retrying in ${retryDelay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          logger.error('Max database connection retries exceeded');
          throw error;
        }
      }
    }
  }
}

module.exports = DatabaseMigrations;