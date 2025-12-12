# Hero Banner with Cycling Cover Images

## Overview

The homepage now features a dynamic, animated hero banner that cycles through cover images from all your published blog posts. This creates an engaging visual showcase of your content while maintaining a professional, readable design.

## Features

### 🎬 Smooth Animations
- **Crossfade transitions** between images every 5 seconds
- **Blur and brightness** filters for readability
- **Framer Motion** animations for smooth visual effects
- **Interactive indicators** (dots) to manually select images

### 🎨 Visual Layers

The banner uses multiple layers for optimal readability:

1. **Background Image Layer**
   - Blurred (8px) and darkened (40% brightness)
   - Slightly scaled (1.1x) to hide blur edges
   - Smooth crossfade transitions

2. **Gradient Overlays**
   - Primary overlay: `background/95` → `background/85` → `background/95`
   - Secondary: Primary gradient at 20% opacity
   - Creates depth while maintaining legibility

3. **Optional Grid Pattern**
   - Subtle tech-inspired grid overlay
   - Cyber blue color at 10% opacity
   - 50px × 50px grid size

4. **Content Layer**
   - High contrast text with gradient effect
   - Call-to-action buttons
   - Interactive image indicators

### 📱 Responsive Design

- **Desktop**: Full hero with large text (7xl)
- **Tablet**: Medium text (6xl)
- **Mobile**: Optimized text size (5xl)
- Maintains readability across all screen sizes

## Technical Implementation

### Component: `HeroBanner.tsx`

```tsx
<HeroBanner coverImages={coverImages} />
```

**Props:**
- `coverImages: string[]` - Array of cover image URLs from published posts

**Features:**
- Client component (uses `"use client"` for animations)
- React hooks (`useState`, `useEffect`) for image cycling
- Framer Motion for smooth transitions
- Automatic cleanup on unmount

### Data Fetching: `getCoverImages()`

Located in `src/lib/posts.ts`:

```tsx
export const getCoverImages = cache(async (): Promise<string[]> => {
  // Fetches cover images from all published posts
  // Filters out invalid/missing images
  // Processes image URLs using getImageUrl()
  // Returns array of valid image URLs
});
```

**Features:**
- Uses React's `cache()` for performance
- Filters posts without cover images
- Validates image data using `isValidImageData()`
- Processes various image formats (JSON metadata, URLs, file keys)
- Ordered by post creation date (newest first)

### Homepage Integration

Updated `src/app/page.tsx`:

```tsx
const coverImages = await getCoverImages();

// ...

<HeroBanner coverImages={coverImages} />
```

## Animation Timeline

1. **Page Load**
   - Title fades in with upward motion (0.6s)
   - Subtitle fades in with delay (0.6s + 0.2s delay)
   - Buttons fade in with delay (0.6s + 0.4s delay)
   - Indicators fade in with delay (0.6s + 0.6s delay)

2. **Background Cycling**
   - Every 5 seconds, background transitions to next image
   - 1.5 second crossfade duration
   - Automatic loop through all images

3. **User Interaction**
   - Click indicators to jump to specific image
   - Resets automatic cycling timer

## Customization

### Change Transition Speed

In `HeroBanner.tsx`:

```tsx
// Current: 5 seconds between images
const interval = setInterval(() => {
  setCurrentImageIndex((prev) => (prev + 1) % coverImages.length);
}, 5000); // Change this value (milliseconds)
```

### Adjust Blur Amount

In `HeroBanner.tsx`:

```tsx
style={{
  backgroundImage: `url(${coverImages[currentImageIndex]})`,
  filter: 'blur(8px) brightness(0.4)', // Adjust blur(Xpx) and brightness(0-1)
  transform: 'scale(1.1)',
}}
```

### Modify Gradient Overlays

In `HeroBanner.tsx`:

```tsx
{/* Main gradient overlay */}
<div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background/95" />

{/* Accent gradient */}
<div className="absolute inset-0 bg-gradient-primary opacity-20" />
```

### Remove Grid Pattern

In `HeroBanner.tsx`, remove or comment out:

```tsx
{/* Optional: Grid Pattern Overlay */}
<div
  className="absolute inset-0 opacity-10"
  style={{...}}
/>
```

## Fallback Behavior

**No Cover Images:**
- Banner still displays with gradient background
- No image cycling occurs
- Indicators hidden automatically

**Single Cover Image:**
- Displays static background
- No cycling animation
- Indicators hidden automatically

**Multiple Images:**
- Full cycling functionality
- Indicators shown for navigation

## Performance Considerations

### Optimizations

1. **React Cache**: `getCoverImages()` uses React's cache to prevent redundant DB queries
2. **Revalidation**: Homepage revalidates every 60 seconds
3. **Image Loading**: Browser handles image preloading
4. **Framer Motion**: Hardware-accelerated CSS animations
5. **Lazy Updates**: Only active image is fully opaque

### Impact

- **Initial Load**: ~2-3KB additional JS for HeroBanner component
- **Runtime**: Minimal - CSS-based animations
- **Database**: Single query cached for 60 seconds
- **Images**: Loaded on-demand by browser

## Browser Compatibility

- ✅ Chrome/Edge 88+
- ✅ Firefox 87+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

Uses standard CSS and modern JavaScript - no polyfills needed.

## Accessibility

- **Semantic HTML**: Uses `<section>`, `<button>` tags
- **ARIA labels**: Indicator buttons have descriptive labels
- **Focus visible**: Keyboard navigation supported
- **Color contrast**: Text maintains WCAG AA compliance
- **Reduced motion**: Respects prefers-reduced-motion (could be added)

## Future Enhancements

Possible improvements:

1. **Respect `prefers-reduced-motion`**
   ```tsx
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   ```

2. **Pause on Hover**
   ```tsx
   const [isPaused, setIsPaused] = useState(false);
   // Pause interval when isPaused is true
   ```

3. **Swipe Gestures** (mobile)
   - Use Framer Motion's `drag` features
   - Swipe left/right to change images

4. **Parallax Effect**
   - Scroll-based background movement
   - Adds depth to the banner

5. **Image Captions**
   - Display post title/excerpt
   - Link to the featured post

## Testing

To test the hero banner:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Visit homepage:**
   ```
   http://localhost:3000
   ```

3. **Verify:**
   - Background images cycle every 5 seconds
   - Smooth crossfade transitions
   - Indicators update correctly
   - Clicking indicators changes image
   - Responsive on different screen sizes
   - Text remains readable over all images

## Troubleshooting

**Images not showing:**
- Check that posts have valid `coverImage` field
- Verify image URLs are accessible
- Check browser console for errors

**No cycling:**
- Verify multiple posts have cover images
- Check `coverImages` array in React DevTools
- Ensure JavaScript is enabled

**Slow transitions:**
- Check network speed (images may be loading)
- Verify image sizes aren't too large
- Consider image optimization

---

**Part of the theme-redesign branch**
Created: 2025-12-12
