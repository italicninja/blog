import { extractImageReferences, filterLocalImages, replaceImageUrls } from './image-utils';

// Test extractImageReferences function
describe('extractImageReferences', () => {
  it('should extract image references from markdown content', () => {
    const content = `
# Test Post

This is a test post with some images:

![Local Image](images/local.jpg)
![Remote Image](https://example.com/remote.jpg)
![Another Local](../public/images/another.png)

And some text after.
    `;

    const result = extractImageReferences(content);
    
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ alt: 'Local Image', path: 'images/local.jpg' });
    expect(result[1]).toEqual({ alt: 'Remote Image', path: 'https://example.com/remote.jpg' });
    expect(result[2]).toEqual({ alt: 'Another Local', path: '../public/images/another.png' });
  });

  it('should handle empty content', () => {
    const result = extractImageReferences('');
    expect(result).toHaveLength(0);
  });
});

// Test filterLocalImages function
describe('filterLocalImages', () => {
  it('should filter out remote images', () => {
    const images = [
      { alt: 'Local Image', path: 'images/local.jpg' },
      { alt: 'Remote Image', path: 'https://example.com/remote.jpg' },
      { alt: 'Another Local', path: '../public/images/another.png' },
      { alt: 'Data URL', path: 'data:image/png;base64,abc123' },
    ];

    const result = filterLocalImages(images);
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ alt: 'Local Image', path: 'images/local.jpg' });
    expect(result[1]).toEqual({ alt: 'Another Local', path: '../public/images/another.png' });
  });
});

// Test replaceImageUrls function
describe('replaceImageUrls', () => {
  it('should replace image URLs in content', () => {
    const content = `
# Test Post

![Local Image](images/local.jpg)
![Remote Image](https://example.com/remote.jpg)
![Another Local](../public/images/another.png)
    `;

    const replacements = new Map([
      ['images/local.jpg', 'https://uploadthing.com/f/abc123.jpg'],
      ['../public/images/another.png', 'https://uploadthing.com/f/def456.png'],
    ]);

    const result = replaceImageUrls(content, replacements);
    
    expect(result).toContain('![Local Image](https://uploadthing.com/f/abc123.jpg)');
    expect(result).toContain('![Remote Image](https://example.com/remote.jpg)'); // Unchanged
    expect(result).toContain('![Another Local](https://uploadthing.com/f/def456.png)');
  });
});