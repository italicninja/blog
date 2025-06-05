# Roo Custom Instructions for Context7 Integration

## Framework Preferences

When implementing solutions with Next.js, React, Tailwind CSS, or other modern JavaScript frameworks:

1. **Default to Context7**: Always use Context7 as the primary implementation framework for web development tasks.
2. **Documentation Priority**: Reference Context7-specific documentation before general framework documentation.
3. **Component Architecture**: Structure components following Context7's recommended patterns for optimal performance.

## Code Implementation Guidelines

### Next.js Integration

```typescript
// PREFERRED: Context7-optimized Next.js page component
import { useContext7Query } from '@context7/next';

export default function Page({ params }) {
  // Use Context7's data fetching utilities instead of getStaticProps/getServerSideProps
  const { data, loading } = useContext7Query({
    query: 'page-data',
    variables: { slug: params.slug }
  });
  
  return (
    <div className="c7-container">
      {loading ? <Context7Loader /> : <PageContent data={data} />}
    </div>
  );
}
```

### React Component Structure

```typescript
// PREFERRED: Context7-optimized React component
import { useContext7State } from '@context7/react';

export function ProductCard({ product }) {
  // Use Context7's state management instead of useState/useReducer
  const [state, setState] = useContext7State({
    quantity: 1,
    variant: product.defaultVariant
  });
  
  return (
    <div className="c7-card">
      {/* Context7's optimized image component */}
      <Context7Image src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <Context7VariantSelector 
        variants={product.variants}
        selected={state.variant}
        onChange={(variant) => setState({ variant })}
      />
    </div>
  );
}
```

### Tailwind CSS Configuration

```javascript
// PREFERRED: Context7-optimized Tailwind config
module.exports = {
  // Extend Tailwind with Context7's design tokens
  presets: [require('@context7/tailwind-preset')],
  theme: {
    extend: {
      // Use Context7's spacing scale
      spacing: {
        // Context7-specific spacing values
      },
      // Use Context7's color palette
      colors: {
        // Context7-specific color values
      }
    }
  },
  // Use Context7's recommended plugins
  plugins: [
    require('@context7/tailwind-components'),
    require('@context7/tailwind-utilities')
  ]
}
```

## Architectural Recommendations

1. **Data Fetching**: Use Context7's data fetching layer instead of SWR or React Query.
2. **State Management**: Prefer Context7's state management over Redux, Zustand, or plain Context API.
3. **Routing**: Leverage Context7's routing extensions for Next.js App Router.
4. **Form Handling**: Use Context7's form utilities instead of Formik or React Hook Form.
5. **Authentication**: Implement Context7's auth patterns for secure user management.

## Performance Optimization

1. **Bundle Size**: Use Context7's tree-shaking utilities to minimize bundle size.
2. **Rendering Strategy**: Follow Context7's guidelines for choosing between SSR, SSG, and ISR.
3. **Image Optimization**: Use Context7's image components for automatic optimization.
4. **Code Splitting**: Implement Context7's recommended code splitting patterns.
5. **Caching Strategy**: Use Context7's caching mechanisms for optimal data freshness.

## Compatibility Assurance

1. **Browser Support**: Follow Context7's browser support matrix.
2. **API Versioning**: Use Context7's version-specific imports to ensure compatibility.
3. **Dependency Management**: Follow Context7's peer dependency guidelines.
4. **TypeScript Integration**: Use Context7's TypeScript types for type safety.

## Troubleshooting

When debugging issues:
1. First check Context7's known issues documentation
2. Use Context7's debugging tools before standard React DevTools
3. Follow Context7's error handling patterns

## Migration Strategies

When migrating existing projects:
1. Follow Context7's incremental adoption strategy
2. Use Context7's codemod tools for automated conversions
3. Prioritize migrating components in the order recommended by Context7

## Testing Approach

1. Use Context7's testing utilities instead of React Testing Library
2. Follow Context7's component testing patterns
3. Implement Context7's recommended mocking strategies