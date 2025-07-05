import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Build Compilation Tests', () => {
  const projectRoot = path.resolve(__dirname, '../../..');
  
  describe('TypeScript Compilation', () => {
    test('should compile TypeScript without Card subcomponent errors', async () => {
      try {
        // Run TypeScript compiler
        const tscOutput = execSync('npx tsc --noEmit --skipLibCheck', {
          cwd: projectRoot,
          encoding: 'utf8',
          stdio: 'pipe'
        });

        // Check for Card.Header/Card.Content specific errors
        const cardErrors = tscOutput.split('\n').filter(line => 
          line.includes('Card.Header') || 
          line.includes('Card.Content') ||
          line.includes("Property 'Header' does not exist on type") ||
          line.includes("Property 'Content' does not exist on type")
        );

        expect(cardErrors).toHaveLength(0);
      } catch (error: any) {
        const errorOutput = error.stdout || error.stderr || error.message;
        
        // Check if errors are related to Card subcomponents
        const cardErrors = errorOutput.split('\n').filter((line: string) => 
          line.includes('Card.Header') || 
          line.includes('Card.Content') ||
          line.includes("Property 'Header' does not exist on type") ||
          line.includes("Property 'Content' does not exist on type")
        );

        // If there are Card-related errors, fail the test
        if (cardErrors.length > 0) {
          throw new Error(`Card subcomponent errors found:\n${cardErrors.join('\n')}`);
        }

        // If there are other errors, we'll check the total count
        console.warn('TypeScript compilation has errors, but not Card-related:', errorOutput);
      }
    });

    test('should compile with theme property migrations', async () => {
      try {
        const tscOutput = execSync('npx tsc --noEmit --skipLibCheck', {
          cwd: projectRoot,
          encoding: 'utf8',
          stdio: 'pipe'
        });

        // Check for theme-related errors
        const themeErrors = tscOutput.split('\n').filter(line => 
          line.includes('theme.colors.') ||
          line.includes('theme.spacing.spacing[') ||
          line.includes('theme.shadows.effects.') ||
          line.includes('Property \'colors\' does not exist on type \'Theme\'') ||
          line.includes('Property \'spacing\' does not exist on type \'Theme\'') ||
          line.includes('Property \'shadows\' does not exist on type \'Theme\'')
        );

        expect(themeErrors).toHaveLength(0);
      } catch (error: any) {
        const errorOutput = error.stdout || error.stderr || error.message;
        
        // Check for theme-related errors
        const themeErrors = errorOutput.split('\n').filter((line: string) => 
          line.includes('theme.colors.') ||
          line.includes('theme.spacing.spacing[') ||
          line.includes('theme.shadows.effects.') ||
          line.includes('Property \'colors\' does not exist on type \'Theme\'') ||
          line.includes('Property \'spacing\' does not exist on type \'Theme\'') ||
          line.includes('Property \'shadows\' does not exist on type \'Theme\'')
        );

        if (themeErrors.length > 0) {
          throw new Error(`Theme property errors found:\n${themeErrors.join('\n')}`);
        }

        console.warn('TypeScript compilation has errors, but not theme-related:', errorOutput);
      }
    });

    test('should achieve target error count (<50)', async () => {
      try {
        execSync('npx tsc --noEmit --skipLibCheck', {
          cwd: projectRoot,
          encoding: 'utf8',
          stdio: 'pipe'
        });

        // If compilation succeeds, we have 0 errors
        expect(0).toBeLessThan(50);
      } catch (error: any) {
        const errorOutput = error.stdout || error.stderr || error.message;
        
        // Count TypeScript errors
        const errorLines = errorOutput.split('\n').filter((line: string) => 
          line.includes('error TS') || 
          line.match(/\(\d+,\d+\): error/)
        );

        const errorCount = errorLines.length;
        
        console.log(`TypeScript compilation found ${errorCount} errors`);
        console.log('Error details:', errorLines.slice(0, 10).join('\n')); // Show first 10 errors
        
        // Verify error count is less than 50
        expect(errorCount).toBeLessThan(50);
      }
    });

    test('should not have auth context userId errors', async () => {
      try {
        const tscOutput = execSync('npx tsc --noEmit --skipLibCheck', {
          cwd: projectRoot,
          encoding: 'utf8',
          stdio: 'pipe'
        });

        // Check for userId-related errors
        const userIdErrors = tscOutput.split('\n').filter(line => 
          line.includes('userId') &&
          (line.includes('Property \'userId\' does not exist') ||
           line.includes('Cannot read property \'userId\''))
        );

        expect(userIdErrors).toHaveLength(0);
      } catch (error: any) {
        const errorOutput = error.stdout || error.stderr || error.message;
        
        const userIdErrors = errorOutput.split('\n').filter((line: string) => 
          line.includes('userId') &&
          (line.includes('Property \'userId\' does not exist') ||
           line.includes('Cannot read property \'userId\''))
        );

        if (userIdErrors.length > 0) {
          throw new Error(`UserContext userId errors found:\n${userIdErrors.join('\n')}`);
        }
      }
    });
  });

  describe('Production Build Validation', () => {
    test('should build successfully for production', async () => {
      try {
        // Run production build
        const buildOutput = execSync('npm run build', {
          cwd: projectRoot,
          encoding: 'utf8',
          timeout: 120000, // 2 minutes timeout
        });

        // Verify build completed successfully
        expect(buildOutput).toContain('build');
        
        // Check if build directory exists
        const buildDir = path.join(projectRoot, 'build');
        expect(fs.existsSync(buildDir)).toBe(true);
        
        // Check for essential build files
        const indexHtml = path.join(buildDir, 'index.html');
        expect(fs.existsSync(indexHtml)).toBe(true);
        
      } catch (error: any) {
        const errorOutput = error.stdout || error.stderr || error.message;
        
        // Check for specific build errors
        if (errorOutput.includes('Failed to compile')) {
          throw new Error(`Production build failed to compile:\n${errorOutput}`);
        }
        
        if (errorOutput.includes('Module not found')) {
          throw new Error(`Production build has module resolution errors:\n${errorOutput}`);
        }
        
        throw new Error(`Production build failed:\n${errorOutput}`);
      }
    }, 180000); // 3 minutes timeout for build test

    test('should generate optimized bundle', async () => {
      const buildDir = path.join(projectRoot, 'build');
      
      // Skip if build directory doesn't exist
      if (!fs.existsSync(buildDir)) {
        console.warn('Build directory not found, skipping bundle optimization test');
        return;
      }

      // Check for static assets
      const staticDir = path.join(buildDir, 'static');
      if (fs.existsSync(staticDir)) {
        const jsDir = path.join(staticDir, 'js');
        const cssDir = path.join(staticDir, 'css');
        
        if (fs.existsSync(jsDir)) {
          const jsFiles = fs.readdirSync(jsDir);
          const mainJsFiles = jsFiles.filter(file => file.includes('main') && file.endsWith('.js'));
          
          // Verify main JS bundle exists
          expect(mainJsFiles.length).toBeGreaterThan(0);
          
          // Check bundle size (should be reasonable for a React app)
          if (mainJsFiles.length > 0) {
            const mainJsPath = path.join(jsDir, mainJsFiles[0]);
            const stats = fs.statSync(mainJsPath);
            const fileSizeInMB = stats.size / (1024 * 1024);
            
            // Main bundle should be less than 5MB (reasonable for a React app)
            expect(fileSizeInMB).toBeLessThan(5);
          }
        }
        
        if (fs.existsSync(cssDir)) {
          const cssFiles = fs.readdirSync(cssDir);
          const mainCssFiles = cssFiles.filter(file => file.includes('main') && file.endsWith('.css'));
          
          // Verify CSS bundle exists
          expect(mainCssFiles.length).toBeGreaterThan(0);
        }
      }
    });

    test('should have proper asset optimization', async () => {
      const buildDir = path.join(projectRoot, 'build');
      
      if (!fs.existsSync(buildDir)) {
        console.warn('Build directory not found, skipping asset optimization test');
        return;
      }

      // Check index.html for proper asset references
      const indexHtmlPath = path.join(buildDir, 'index.html');
      if (fs.existsSync(indexHtmlPath)) {
        const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
        
        // Verify assets are properly referenced
        expect(indexContent).toMatch(/<script.*src=".*\.js".*><\/script>/);
        expect(indexContent).toMatch(/<link.*href=".*\.css".*>/);
        
        // Verify no development-only content
        expect(indexContent).not.toContain('localhost:3000');
        expect(indexContent).not.toContain('webpack-dev-server');
      }
    });
  });

  describe('Import Resolution Tests', () => {
    test('should resolve all MUI imports correctly', async () => {
      try {
        // Check for import resolution errors
        const tscOutput = execSync('npx tsc --noEmit --skipLibCheck', {
          cwd: projectRoot,
          encoding: 'utf8',
          stdio: 'pipe'
        });

        // Look for MUI import errors
        const muiImportErrors = tscOutput.split('\n').filter(line => 
          line.includes('@mui/material') &&
          (line.includes('Cannot find module') || line.includes('Module not found'))
        );

        expect(muiImportErrors).toHaveLength(0);
      } catch (error: any) {
        const errorOutput = error.stdout || error.stderr || error.message;
        
        const muiImportErrors = errorOutput.split('\n').filter((line: string) => 
          line.includes('@mui/material') &&
          (line.includes('Cannot find module') || line.includes('Module not found'))
        );

        if (muiImportErrors.length > 0) {
          throw new Error(`MUI import resolution errors:\n${muiImportErrors.join('\n')}`);
        }
      }
    });

    test('should not have design system import errors', async () => {
      try {
        const tscOutput = execSync('npx tsc --noEmit --skipLibCheck', {
          cwd: projectRoot,
          encoding: 'utf8',
          stdio: 'pipe'
        });

        // Look for design system import errors
        const designSystemErrors = tscOutput.split('\n').filter(line => 
          line.includes('design-system') &&
          (line.includes('Cannot find module') || line.includes('Module not found'))
        );

        expect(designSystemErrors).toHaveLength(0);
      } catch (error: any) {
        const errorOutput = error.stdout || error.stderr || error.message;
        
        const designSystemErrors = errorOutput.split('\n').filter((line: string) => 
          line.includes('design-system') &&
          (line.includes('Cannot find module') || line.includes('Module not found'))
        );

        if (designSystemErrors.length > 0) {
          throw new Error(`Design system import errors:\n${designSystemErrors.join('\n')}`);
        }
      }
    });
  });

  describe('Migration Validation', () => {
    test('should validate migration completion', async () => {
      // This test validates that the migration has been completed successfully
      // by checking for the absence of old patterns and presence of new ones
      
      const srcDir = path.join(projectRoot, 'src');
      
      if (!fs.existsSync(srcDir)) {
        throw new Error('Source directory not found');
      }

      // Recursively find all TypeScript/TSX files
      const findTsFiles = (dir: string): string[] => {
        const files: string[] = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            files.push(...findTsFiles(fullPath));
          } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            files.push(fullPath);
          }
        }
        
        return files;
      };

      const tsFiles = findTsFiles(srcDir);
      let cardSubcomponentUsage = 0;
      let oldThemeUsage = 0;
      
      for (const file of tsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for Card.Header/Card.Content usage
        if (content.includes('Card.Header') || content.includes('Card.Content')) {
          cardSubcomponentUsage++;
          console.warn(`Found Card subcomponent usage in: ${file}`);
        }
        
        // Check for old theme structure usage
        if (content.includes('theme.colors.') || 
            content.includes('theme.spacing.spacing[') || 
            content.includes('theme.shadows.effects.')) {
          oldThemeUsage++;
          console.warn(`Found old theme structure usage in: ${file}`);
        }
      }

      // Report findings
      console.log(`Migration validation results:`);
      console.log(`- Files with Card subcomponent usage: ${cardSubcomponentUsage}`);
      console.log(`- Files with old theme structure usage: ${oldThemeUsage}`);
      console.log(`- Total TypeScript files checked: ${tsFiles.length}`);

      // These should be 0 after successful migration
      expect(cardSubcomponentUsage).toBe(0);
      expect(oldThemeUsage).toBe(0);
    });

    test('should have proper MUI component usage', async () => {
      const srcDir = path.join(projectRoot, 'src');
      
      if (!fs.existsSync(srcDir)) {
        throw new Error('Source directory not found');
      }

      // Check for proper MUI imports in key files
      const keyFiles = [
        'components/frame-finder/FrameComparison.tsx',
        'components/frame-finder/FilterSortControls.tsx',
        'components/frame-finder/FaceShapeSelector.tsx',
        'components/frame-finder/FeatureTagSelector.tsx',
      ];

      for (const relativeFile of keyFiles) {
        const filePath = path.join(srcDir, relativeFile);
        
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Should import from @mui/material
          expect(content).toMatch(/import.*from ['"]@mui\/material['"]/);
          
          // Should use CardHeader and CardContent
          expect(content).toMatch(/CardHeader|CardContent/);
          
          // Should not use Card.Header or Card.Content
          expect(content).not.toMatch(/Card\.Header|Card\.Content/);
        }
      }
    });
  });

  describe('Performance Validation', () => {
    test('should complete TypeScript compilation within reasonable time', async () => {
      const startTime = Date.now();
      
      try {
        execSync('npx tsc --noEmit --skipLibCheck', {
          cwd: projectRoot,
          encoding: 'utf8',
          timeout: 60000, // 1 minute timeout
        });
      } catch (error) {
        // Even if there are errors, we want to measure compilation time
      }
      
      const endTime = Date.now();
      const compilationTime = endTime - startTime;
      
      console.log(`TypeScript compilation took ${compilationTime}ms`);
      
      // Compilation should complete within 60 seconds
      expect(compilationTime).toBeLessThan(60000);
    });

    test('should have reasonable build time', async () => {
      const startTime = Date.now();
      
      try {
        execSync('npm run build', {
          cwd: projectRoot,
          encoding: 'utf8',
          timeout: 300000, // 5 minutes timeout
        });
        
        const endTime = Date.now();
        const buildTime = endTime - startTime;
        
        console.log(`Production build took ${buildTime}ms`);
        
        // Build should complete within 5 minutes
        expect(buildTime).toBeLessThan(300000);
      } catch (error: any) {
        // If build fails, we still want to know it didn't timeout
        const endTime = Date.now();
        const buildTime = endTime - startTime;
        
        console.log(`Build failed after ${buildTime}ms`);
        
        // Even failed builds should not timeout
        expect(buildTime).toBeLessThan(300000);
        
        // Re-throw the error for proper test failure
        throw error;
      }
    }, 360000); // 6 minutes timeout for the test itself
  });
});