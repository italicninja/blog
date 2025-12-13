# CSS Testing Protocol

This document outlines the testing protocol for ensuring consistent CSS rendering between development and production environments.

## 1. Environment Setup

### Development Environment
- Run the application in development mode using `npm run dev`
- Access the application at `http://localhost:3000`

### Production Environment
- Build the application using `npm run build`
- Run the production build using `npm run start`
- Access the application at `http://localhost:3000`

## 2. Visual Comparison Testing

### Key Pages to Test
1. **Home Page** (`/`)
2. **Blog Listing Page** (`/blog`)
3. **Individual Blog Post** (`/blog/[slug]`)
4. **About Page** (`/about`)
5. **Sign In Page** (`/auth/signin`)
6. **Blog Submission Page** (`/blog/submit`)

### Elements to Check on Each Page
- Header layout and styling
- Footer layout and styling
- Typography (headings, paragraphs, links)
- Images and media
- Cards and containers
- Buttons and interactive elements
- Forms and input fields
- Spacing and alignment
- Color schemes (both light and dark modes)
- Animations and transitions

### Testing Process
1. Open the same page in both environments side by side
2. Compare the visual appearance of each element
3. Interact with elements to check hover states, animations, and transitions
4. Document any discrepancies with screenshots

## 3. Responsive Design Testing

Test each page at the following viewport sizes:
- Mobile: 375px width (iPhone SE)
- Mobile: 428px width (iPhone 13 Pro Max)
- Tablet: 768px width (iPad Mini)
- Tablet: 1024px width (iPad Pro)
- Desktop: 1440px width (Standard desktop)
- Large Desktop: 1920px width (Large desktop)

### Testing Process
1. Resize the browser window to each viewport size
2. Check that layouts adapt appropriately
3. Verify that text remains readable
4. Ensure images scale correctly
5. Test navigation and menus at each size
6. Document any responsive design issues with screenshots

## 4. Dark Mode Testing

1. Test both environments with system preference set to light mode
2. Test both environments with system preference set to dark mode
3. Verify that colors, contrasts, and shadows are consistent in both modes
4. Check for any unintended color inversions or contrast issues

## 5. Browser Compatibility Testing

Test both environments in the following browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Testing Process
1. Load each key page in each browser
2. Verify that layouts, fonts, and colors are consistent
3. Test interactions and animations
4. Document any browser-specific issues

## 6. Performance Testing

### Metrics to Measure
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)
- Total CSS size
- CSS loading time

### Testing Tools
- Chrome DevTools Performance tab
- Lighthouse
- WebPageTest

## 7. CSS Validation

Run CSS validation on both environments:
1. Use the W3C CSS Validator
2. Check for any CSS errors or warnings
3. Document and fix any validation issues

## 8. Regression Testing Checklist

After making CSS changes, use this checklist to prevent regressions:

- [ ] All pages render correctly in both environments
- [ ] Responsive layouts work at all target viewport sizes
- [ ] Dark mode functions correctly
- [ ] Animations and transitions are smooth
- [ ] No unintended side effects on other components
- [ ] Performance metrics remain within acceptable ranges
- [ ] CSS validates without errors

## 9. Documentation

For each test session:
1. Document the date and time of testing
2. Note the versions of the application being tested
3. Record any discrepancies found
4. Create tickets for issues that need to be addressed
5. Maintain a history of resolved issues

## 10. Automated Testing Implementation

Consider implementing the following automated tests:
- Visual regression tests using tools like Percy or Chromatic
- CSS unit tests for critical components
- Automated accessibility tests for color contrast and readability
- Integration of CSS validation in the CI/CD pipeline