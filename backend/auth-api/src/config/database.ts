import { MongoClient, Db } from 'mongodb';
import { config } from './index';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    try {
      this.client = new MongoClient(config.mongodb.uri);
      await this.client.connect();
      this.db = this.client.db(); // Use default database from URI
      
      console.log('Connected to MongoDB successfully');
      return this.db;
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  isConnected(): boolean {
    return this.db !== null;
  }

  /**
   * Initialize with an existing database connection (useful for testing)
   */
  initialize(db: Db): void {
    this.db = db;
  }
}

export const database = DatabaseConnection.getInstance();
export { Db } from 'mongodb';