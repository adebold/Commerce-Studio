/**
 * Global teardown for VARAi e-commerce integration tests
 * 
 * This file is executed once after all tests have completed.
 * It cleans up the test environment, including:
 * - Stopping mock servers
 * - Closing database connections
 * - Removing temporary files
 */

module.exports = async () => {
  console.log('🧹 Cleaning up integration test environment...');
  
  // Stop in-memory MongoDB server
  const mongoServer = global.__MONGO_SERVER__;
  if (mongoServer) {
    await mongoServer.stop();
    console.log('📊 MongoDB server stopped');
  }
  
  // Clean up any other resources
  // This could include closing connections, stopping mock servers, etc.
  
  console.log('✅ Test environment cleanup complete');
};