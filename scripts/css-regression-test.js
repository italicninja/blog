/**
 * CSS Regression Testing Script
 * 
 * This script helps automate CSS regression testing between development and production environments.
 * It captures screenshots of key pages in both environments and compares them for visual differences.
 * 
 * Requirements:
 * - Puppeteer: npm install puppeteer
 * - PixelMatch: npm install pixelmatch pngjs
 * - fs-extra: npm install fs-extra
 * 
 * Usage:
 * 1. Start the development server on port 3000
 * 2. Start the production server on port 3001
 * 3. Run this script: node scripts/css-regression-test.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

// Configuration
const config = {
  devUrl: 'http://localhost:3000',
  prodUrl: 'http://localhost:3001',
  outputDir: path.join(__dirname, '../test-results/css-regression'),
  viewports: [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1440, height: 900, name: 'desktop' }
  ],
  pages: [
    { path: '/', name: 'home' },
    { path: '/blog', name: 'blog-listing' },
    { path: '/blog/blog-beauty-tweaks', name: 'blog-post' },
    { path: '/about', name: 'about' }
  ],
  // Add selectors to test specific components
  components: [
    { selector: 'header', name: 'header' },
    { selector: 'footer', name: 'footer' },
    { selector: '.card', name: 'blog-card' }
  ]
};

// Ensure output directory exists
fs.ensureDirSync(config.outputDir);
fs.ensureDirSync(path.join(config.outputDir, 'dev'));
fs.ensureDirSync(path.join(config.outputDir, 'prod'));
fs.ensureDirSync(path.join(config.outputDir, 'diff'));

/**
 * Take screenshots of a page in both environments
 */
async function captureScreenshots(page, url, viewport, pageName) {
  // Set viewport
  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1
  });

  // Capture development environment
  await page.goto(`${config.devUrl}${url}`, { waitUntil: 'networkidle0' });
  const devPath = path.join(config.outputDir, 'dev', `${pageName}-${viewport.name}.png`);
  await page.screenshot({ path: devPath, fullPage: true });
  console.log(`Captured dev screenshot: ${devPath}`);

  // Capture production environment
  await page.goto(`${config.prodUrl}${url}`, { waitUntil: 'networkidle0' });
  const prodPath = path.join(config.outputDir, 'prod', `${pageName}-${viewport.name}.png`);
  await page.screenshot({ path: prodPath, fullPage: true });
  console.log(`Captured prod screenshot: ${prodPath}`);

  // Compare screenshots
  await compareScreenshots(devPath, prodPath, `${pageName}-${viewport.name}`);

  // Capture component-specific screenshots if they exist on this page
  for (const component of config.components) {
    const elementExists = await page.evaluate((selector) => {
      return document.querySelector(selector) !== null;
    }, component.selector);

    if (elementExists) {
      await captureComponentScreenshot(
        page, 
        component.selector, 
        `${component.name}-${pageName}-${viewport.name}`
      );
    }
  }
}

/**
 * Capture screenshot of a specific component
 */
async function captureComponentScreenshot(page, selector, name) {
  try {
    // Get the component in production environment
    const element = await page.$(selector);
    if (!element) {
      console.log(`Component ${selector} not found`);
      return;
    }

    const prodPath = path.join(config.outputDir, 'prod', `${name}.png`);
    await element.screenshot({ path: prodPath });
    console.log(`Captured prod component screenshot: ${prodPath}`);

    // Switch to dev environment and capture the same component
    const currentUrl = await page.url();
    const devUrl = currentUrl.replace(config.prodUrl, config.devUrl);
    await page.goto(devUrl, { waitUntil: 'networkidle0' });
    
    const devElement = await page.$(selector);
    if (!devElement) {
      console.log(`Component ${selector} not found in dev environment`);
      return;
    }

    const devPath = path.join(config.outputDir, 'dev', `${name}.png`);
    await devElement.screenshot({ path: devPath });
    console.log(`Captured dev component screenshot: ${devPath}`);

    // Compare component screenshots
    await compareScreenshots(devPath, prodPath, name);
  } catch (error) {
    console.error(`Error capturing component ${selector}:`, error);
  }
}

/**
 * Compare two screenshots and generate a diff image
 */
async function compareScreenshots(img1Path, img2Path, name) {
  try {
    const img1 = PNG.sync.read(fs.readFileSync(img1Path));
    const img2 = PNG.sync.read(fs.readFileSync(img2Path));
    
    // Images must have the same dimensions for comparison
    if (img1.width !== img2.width || img1.height !== img2.height) {
      console.log(`Size mismatch for ${name}: ${img1.width}x${img1.height} vs ${img2.width}x${img2.height}`);
      return;
    }
    
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    
    // Compare images
    const mismatchedPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 } // Adjust threshold as needed
    );
    
    // Save diff image
    const diffPath = path.join(config.outputDir, 'diff', `${name}.png`);
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    
    const mismatchPercentage = (mismatchedPixels / (width * height) * 100).toFixed(2);
    console.log(`Comparison for ${name}: ${mismatchPercentage}% different (${mismatchedPixels} pixels)`);
    
    // Write results to a JSON file
    const resultsPath = path.join(config.outputDir, 'results.json');
    let results = {};
    
    if (fs.existsSync(resultsPath)) {
      results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    }
    
    results[name] = {
      mismatchedPixels,
      mismatchPercentage: parseFloat(mismatchPercentage),
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  } catch (error) {
    console.error(`Error comparing screenshots for ${name}:`, error);
  }
}

/**
 * Main function to run the tests
 */
async function runTests() {
  console.log('Starting CSS regression tests...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: null
  });
  
  const page = await browser.newPage();
  
  try {
    // Test each page at each viewport size
    for (const viewport of config.viewports) {
      console.log(`Testing at ${viewport.width}x${viewport.height} (${viewport.name})...`);
      
      for (const pageConfig of config.pages) {
        console.log(`Testing page: ${pageConfig.path}`);
        await captureScreenshots(page, pageConfig.path, viewport, pageConfig.name);
      }
    }
    
    // Generate HTML report
    await generateReport();
    
    console.log('CSS regression tests completed!');
    console.log(`Results available in: ${config.outputDir}`);
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    await browser.close();
  }
}

/**
 * Generate an HTML report of the test results
 */
async function generateReport() {
  const resultsPath = path.join(config.outputDir, 'results.json');
  
  if (!fs.existsSync(resultsPath)) {
    console.log('No results found to generate report');
    return;
  }
  
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CSS Regression Test Results</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .test-case { margin-bottom: 30px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
        .test-header { background: #f5f5f5; padding: 10px 15px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; }
        .test-header h3 { margin: 0; }
        .test-content { padding: 15px; }
        .images { display: flex; flex-wrap: wrap; gap: 20px; }
        .image-container { flex: 1; min-width: 300px; }
        .image-container img { max-width: 100%; border: 1px solid #ddd; }
        .pass { color: green; }
        .fail { color: red; }
        .summary { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h1>CSS Regression Test Results</h1>
      <div class="summary">
        <p>Test run completed at: ${new Date().toLocaleString()}</p>
        <p>Total tests: ${Object.keys(results).length}</p>
      </div>
  `;
  
  // Sort results by mismatch percentage (highest first)
  const sortedResults = Object.entries(results).sort((a, b) => {
    return b[1].mismatchPercentage - a[1].mismatchPercentage;
  });
  
  for (const [name, result] of sortedResults) {
    const status = result.mismatchPercentage < 1 ? 'pass' : 'fail';
    
    html += `
      <div class="test-case">
        <div class="test-header">
          <h3>${name}</h3>
          <span class="${status}">${result.mismatchPercentage}% different (${result.mismatchedPixels} pixels)</span>
        </div>
        <div class="test-content">
          <div class="images">
            <div class="image-container">
              <h4>Development</h4>
              <img src="dev/${name}.png" alt="Development version">
            </div>
            <div class="image-container">
              <h4>Production</h4>
              <img src="prod/${name}.png" alt="Production version">
            </div>
            <div class="image-container">
              <h4>Difference</h4>
              <img src="diff/${name}.png" alt="Difference">
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  html += `
    </body>
    </html>
  `;
  
  fs.writeFileSync(path.join(config.outputDir, 'report.html'), html);
  console.log(`Report generated: ${path.join(config.outputDir, 'report.html')}`);
}

// Run the tests
runTests();