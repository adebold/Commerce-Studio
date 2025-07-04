import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils/logger';

// MongoDB connection options
const mongoOptions = config.mongodb.options;

// MongoDB connection URI
const mongoUri = config.mongodb.uri;

// Connect to MongoDB
export const connectToMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoUri, mongoOptions);
    
    // Log successful connection
    logger.info('Connected to MongoDB');
    
    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB connection error');
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed due to application termination');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Error closing MongoDB connection');
        process.exit(1);
      }
    });
    
  } catch (err) {
    logger.error({ err }, 'Failed to connect to MongoDB');
    throw err;
  }
};

// Get MongoDB connection
export const getMongoDBConnection = (): mongoose.Connection => {
  return mongoose.connection;
};

// Close MongoDB connection
export const closeMongoDBConnection = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (err) {
    logger.error({ err }, 'Error closing MongoDB connection');
    throw err;
  }
};