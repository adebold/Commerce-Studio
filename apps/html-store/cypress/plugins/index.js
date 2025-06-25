/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const fs = require('fs');
const path = require('path');

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // Log Cypress events to console
  on('task', {
    log(message) {
      console.log(message);
      return null;
    }
  });

  // Read fixture file
  on('task', {
    readFixture(fixturePath) {
      const fullPath = path.join(config.fixturesFolder, fixturePath);
      if (fs.existsSync(fullPath)) {
        return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      }
      return null;
    }
  });

  // Write test results to file
  on('task', {
    writeTestResult({ name, result }) {
      const resultsDir = path.join(config.projectRoot, 'cypress', 'results');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      const resultPath = path.join(resultsDir, `${name}.json`);
      fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
      return null;
    }
  });

  // Start a simple HTTP server for serving the HTML store
  on('before:browser:launch', (browser, launchOptions) => {
    const http = require('http');
    const serveStatic = require('serve-static');
    const finalhandler = require('finalhandler');
    
    // Create a static file server
    const serve = serveStatic(config.projectRoot);
    
    // Create server
    const server = http.createServer((req, res) => {
      serve(req, res, finalhandler(req, res));
    });
    
    // Listen on port 8080
    server.listen(8080);
    
    console.log('Started HTTP server on port 8080');
    
    return launchOptions;
  });

  // Set environment variables based on the environment
  const environment = process.env.CYPRESS_ENVIRONMENT || 'development';
  
  config.env = {
    ...config.env,
    environment,
    apiUrl: process.env.CYPRESS_API_URL || config.env.apiUrl,
    mockData: process.env.CYPRESS_MOCK_DATA !== 'false'
  };
  
  return config;
};