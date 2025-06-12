/**
 * Script to ensure the fallback image exists
 * 
 * This script:
 * 1. Checks if the fallback image exists
 * 2. If not, copies the nextjs.jpg image to the fallback location
 * 
 * Usage: node scripts/ensure-fallback-image.js
 */

const fs = require('fs');
const path = require('path');

// Define paths
const sourceImagePath = path.join(__dirname, '../public/images/posts/nextjs.jpg');
const fallbackImagePath = path.join(__dirname, '../public/images/fallback-image.jpg');

// Check if the fallback image exists
if (!fs.existsSync(fallbackImagePath)) {
  console.log('Fallback image does not exist, creating it...');
  
  // Check if the source image exists
  if (fs.existsSync(sourceImagePath)) {
    // Create the directory if it doesn't exist
    const fallbackDir = path.dirname(fallbackImagePath);
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    
    // Copy the source image to the fallback location
    fs.copyFileSync(sourceImagePath, fallbackImagePath);
    console.log('Fallback image created successfully!');
  } else {
    console.error('Source image does not exist:', sourceImagePath);
    console.error('Please provide a valid fallback image.');
  }
} else {
  console.log('Fallback image already exists:', fallbackImagePath);
}