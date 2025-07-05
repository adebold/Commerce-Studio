#!/usr/bin/env node
/**
 * Dependency Audit Script
 * 
 * This script performs a comprehensive audit of dependencies
 * and generates a report with findings and recommendations.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const config = {
  outputDir: path.join(rootDir, 'audit-reports'),
  componentsToAudit: [
    { path: rootDir, name: 'root' },
    { path: path.join(rootDir, 'src/varai/vertex_ai_integration'), name: 'vertex_ai_integration' },
    { path: path.join(rootDir, 'src/conversational_ai/package'), name: 'conversational_ai' }
  ],
  severityLevels: ['info', 'low', 'moderate', 'high', 'critical']
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

/**
 * Run npm audit for a specific component
 */
function auditComponent(component) {
  console.log(`Auditing ${component.name}...`);
  
  try {
    // Run npm audit in JSON format
    const auditOutput = execSync('npm audit --json', { 
      cwd: component.path,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    // Parse the JSON output
    const auditData = JSON.parse(auditOutput);
    
    // Run npm outdated in JSON format
    const outdatedOutput = execSync('npm outdated --json', {
      cwd: component.path,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    // Parse the JSON output (or empty object if no outdated deps)
    const outdatedData = outdatedOutput.trim() ? JSON.parse(outdatedOutput) : {};
    
    return {
      audit: auditData,
      outdated: outdatedData
    };
  } catch (error) {
    // Check if it's an npm audit error with JSON output
    try {
      if (error.stdout) {
        const auditData = JSON.parse(error.stdout);
        
        // Try to get outdated packages
        let outdatedData = {};
        try {
          const outdatedOutput = execSync('npm outdated --json', {
            cwd: component.path,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe']
          });
          
          outdatedData = outdatedOutput.trim() ? JSON.parse(outdatedOutput) : {};
        } catch (outdatedError) {
          console.error(`Error getting outdated packages for ${component.name}:`, outdatedError.message);
        }
        
        return {
          audit: auditData,
          outdated: outdatedData
        };
      }
    } catch (jsonError) {
      // Not a JSON output
    }
    
    console.error(`Error auditing ${component.name}:`, error.message);
    return {
      audit: { error: true, message: error.message },
      outdated: {}
    };
  }
}

/**
 * Generate an HTML report from audit data
 */
function generateReport(auditResults) {
  const reportDate = new Date().toISOString().split('T')[0];
  const reportFile = path.join(config.outputDir, `dependency-audit-${reportDate}.html`);
  
  // Start building the HTML report
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dependency Audit Report - ${reportDate}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
    h1, h2, h3, h4 { margin-top: 20px; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .critical { background-color: #ffdddd; }
    .high { background-color: #ffe6cc; }
    .moderate { background-color: #fff4cc; }
    .low { background-color: #e6ffcc; }
    .info { background-color: #e6f7ff; }
    .summary { margin: 20px 0; padding: 15px; border-radius: 5px; border: 1px solid #ddd; }
    .recommendations { background-color: #f0f7ff; padding: 15px; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>EyewearML Platform Dependency Audit Report</h1>
  <p>Generated on: ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <h2>Executive Summary</h2>
    <p>This report provides an overview of dependencies across the EyewearML platform components,
    highlighting security vulnerabilities, outdated packages, and recommendations for maintenance.</p>
  </div>
  `;
  
  // Add each component's audit results
  for (const component of Object.keys(auditResults)) {
    const result = auditResults[component];
    html += `<h2>${component} Component</h2>`;
    
    // Add vulnerability section if there are any
    if (result.audit.error) {
      html += `<p>Error auditing dependencies: ${result.audit.message}</p>`;
    } else if (result.audit.vulnerabilities) {
      const vulnCount = Object.values(result.audit.vulnerabilities)
        .reduce((sum, count) => sum + count, 0);
      
      html += `<h3>Security Vulnerabilities (${vulnCount})</h3>`;
      
      if (vulnCount > 0 && result.audit.advisories) {
        html += `
        <table>
          <tr>
            <th>Package</th>
            <th>Severity</th>
            <th>Vulnerable Versions</th>
            <th>Recommendation</th>
          </tr>
        `;
        
        // Add each advisory to the table
        Object.values(result.audit.advisories).forEach(advisory => {
          html += `
            <tr class="${advisory.severity}">
              <td>${advisory.module_name}</td>
              <td>${advisory.severity}</td>
              <td>${advisory.vulnerable_versions || 'All versions'}</td>
              <td>${advisory.recommendation || (advisory.patched_versions ? `Upgrade to ${advisory.patched_versions}` : 'No fix available')}</td>
            </tr>
          `;
        });
        
        html += '</table>';
      } else {
        html += '<p>No vulnerabilities found.</p>';
      }
    }
    
    // Add outdated packages section
    html += `<h3>Outdated Dependencies</h3>`;
    if (Object.keys(result.outdated).length > 0) {
      html += `
      <table>
        <tr>
          <th>Package</th>
          <th>Current Version</th>
          <th>Wanted Version</th>
          <th>Latest Version</th>
          <th>Type</th>
        </tr>
      `;
      
      // Add each outdated package to the table
      Object.entries(result.outdated).forEach(([pkg, info]) => {
        html += `
          <tr>
            <td>${pkg}</td>
            <td>${info.current}</td>
            <td>${info.wanted}</td>
            <td>${info.latest}</td>
            <td>${info.type || 'dependency'}</td>
          </tr>
        `;
      });
      
      html += '</table>';
    } else {
      html += '<p>No outdated packages found.</p>';
    }
  }
  
  // Add recommendations section
  html += `
  <div class="recommendations">
    <h2>Recommendations</h2>
    <ol>
      <li><strong>Security Vulnerabilities:</strong> Address high and critical severity vulnerabilities immediately.</li>
      <li><strong>Outdated Dependencies:</strong> Update dependencies to their latest compatible versions.</li>
      <li><strong>Dependency Management:</strong> Follow the platform's dependency update policy.</li>
      <li><strong>Testing:</strong> Ensure thorough testing after dependency updates.</li>
      <li><strong>Documentation:</strong> Update the security exception log for any vulnerabilities that cannot be addressed immediately.</li>
    </ol>
  </div>
  
  <h2>Next Steps</h2>
  <p>Schedule the next dependency audit for ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}.</p>
  `;
  
  // Close the HTML document
  html += `
</body>
</html>
  `;
  
  // Write the report to file
  fs.writeFileSync(reportFile, html);
  console.log(`Report generated: ${reportFile}`);
  
  return reportFile;
}

// Main function
async function main() {
  const auditResults = {};
  
  // Audit each component
  for (const component of config.componentsToAudit) {
    auditResults[component.name] = auditComponent(component);
  }
  
  // Generate and open the report
  const reportFile = generateReport(auditResults);
  
  console.log('\nDependency audit completed!');
  console.log('=========================================');
  console.log(`Report saved to: ${reportFile}`);
  console.log('');
  
  // Exit successfully
  process.exit(0);
}

// Run the main function
main().catch(error => {
  console.error('Error running audit:', error);
  process.exit(1);
});
