#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// Create the posts directory if it doesn't exist
const postsDir = path.join(process.cwd(), 'src', 'posts');
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

// Create the date directory if it doesn't exist
const dateDir = path.join(postsDir, today);
if (!fs.existsSync(dateDir)) {
  fs.mkdirSync(dateDir, { recursive: true });
}

// Ask for post details
rl.question('Post title: ', (title) => {
  rl.question('Post excerpt: ', (excerpt) => {
    rl.question('Cover image path (e.g., /next.svg): ', (coverImage) => {
      rl.question('Tags (comma-separated): ', (tags) => {
        // Generate slug from title
        const slug = title
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '-');
        
        // Create the post file
        const postPath = path.join(dateDir, `${slug}.md`);
        
        // Create the post content
        const postContent = `---
title: ${title}
excerpt: ${excerpt}
coverImage: ${coverImage || '/next.svg'}
tags: ${tags}
---

# ${title}

Write your post content here...
`;
        
        // Write the post file
        fs.writeFileSync(postPath, postContent);
        
        console.log(`\nPost created at: ${postPath}`);
        console.log(`You can now edit this file to add your post content.`);
        
        rl.close();
      });
    });
  });
});