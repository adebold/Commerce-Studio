# Security Exception Log

## Overview

This document serves as the official record of security exceptions for the EyewearML platform. It documents known vulnerabilities that have been evaluated but not yet addressed, along with mitigation strategies and timeline for resolution.

## Current Exceptions

### 1. SVG Processing Libraries (as of March 24, 2025)

**Affected Packages:**
- nth-check < 2.0.1 (High severity)
- css-select <= 3.1.0 (Dependency of svgo)
- svgo 1.0.0 - 1.3.2
- @svgr/plugin-svgo <= 5.5.0
- @svgr/webpack 4.0.0 - 5.5.0

**Vulnerability:**
- Inefficient Regular Expression Complexity in nth-check (GHSA-rp65-9cf3-cjxr)
- Potential denial of service vulnerability

**Risk Assessment:**
- MEDIUM: These libraries are used in the build process and not in runtime code.
- The vulnerability requires a malicious SVG file to be processed during build time.

**Mitigation Strategy:**
- SVG assets used in the project are vetted and come from trusted sources.
- Production builds are performed in controlled CI/CD environments.

**Resolution Timeline:**
- Planned for Q2 2025 when we can allocate resources to update the SVG processing pipeline.
- Resolution will involve replacing these libraries with newer alternatives.

### 2. PostCSS (as of March 24, 2025)

**Affected Packages:**
- postcss < 8.4.31 (Moderate severity)
- resolve-url-loader 0.0.1-experiment-postcss || 3.0.0-alpha.1 - 4.0.0

**Vulnerability:**
- PostCSS line return parsing error (GHSA-7fh5-64p2-3v2j)

**Risk Assessment:**
- LOW: This vulnerability affects the CSS processing pipeline during build time.
- No impact on runtime security or performance.

**Mitigation Strategy:**
- CSS files in the project are manually reviewed before processing.
- Development environments have security scanning for malicious CSS patterns.

**Resolution Timeline:**
- Will be addressed in the next dependency update cycle (Q2 2025).
- Will be upgraded with other build tooling improvements.

## Exception Approval

These exceptions have been reviewed and approved by:

| Name | Role | Date |
|------|------|------|
| | CTO | |
| | Security Lead | |

## Updates and Reviews

This document should be reviewed and updated quarterly or whenever a new security exception is added.

| Review Date | Reviewer | Changes |
|-------------|----------|---------|
| March 24, 2025 | | Initial creation |
