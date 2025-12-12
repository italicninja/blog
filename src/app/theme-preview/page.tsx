import Link from 'next/link';

export default function ThemePreview() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-200 bg-background-secondary">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-accent transition-colors">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mt-4 text-gradient">
            New Theme Preview
          </h1>
          <p className="text-gray-600 mt-2">
            Explore the redesigned Italicninja theme with modern colors, gradients, and effects
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Color Palette Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Color Palette</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Primary Accent - Cyber Blue</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-6 rounded-lg bg-accent text-white">
                <p className="font-semibold">Accent</p>
                <p className="text-sm opacity-90">#06b6d4</p>
              </div>
              <div className="p-6 rounded-lg bg-accent-light text-white">
                <p className="font-semibold">Accent Light</p>
                <p className="text-sm opacity-90">#22d3ee</p>
              </div>
              <div className="p-6 rounded-lg bg-accent-dark text-white">
                <p className="font-semibold">Accent Dark</p>
                <p className="text-sm opacity-90">#0891b2</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Secondary Accent - Electric Purple</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-6 rounded-lg bg-secondary text-white">
                <p className="font-semibold">Secondary</p>
                <p className="text-sm opacity-90">#8b5cf6</p>
              </div>
              <div className="p-6 rounded-lg bg-secondary-light text-white">
                <p className="font-semibold">Secondary Light</p>
                <p className="text-sm opacity-90">#a78bfa</p>
              </div>
              <div className="p-6 rounded-lg bg-secondary-dark text-white">
                <p className="font-semibold">Secondary Dark</p>
                <p className="text-sm opacity-90">#7c3aed</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Tertiary Accent - Matrix Green</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-6 rounded-lg bg-tertiary text-white">
                <p className="font-semibold">Tertiary</p>
                <p className="text-sm opacity-90">#10b981</p>
              </div>
              <div className="p-6 rounded-lg bg-tertiary-light text-white">
                <p className="font-semibold">Tertiary Light</p>
                <p className="text-sm opacity-90">#34d399</p>
              </div>
              <div className="p-6 rounded-lg bg-tertiary-dark text-white">
                <p className="font-semibold">Tertiary Dark</p>
                <p className="text-sm opacity-90">#059669</p>
              </div>
            </div>
          </div>
        </section>

        {/* Gradients Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Gradients</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 rounded-xl bg-gradient-primary flex items-center justify-center">
              <p className="text-white font-semibold text-lg">Primary Gradient</p>
            </div>
            <div className="h-32 rounded-xl bg-gradient-secondary flex items-center justify-center">
              <p className="text-white font-semibold text-lg">Secondary Gradient</p>
            </div>
            <div className="h-32 rounded-xl bg-gradient-accent flex items-center justify-center">
              <p className="text-white font-semibold text-lg">Accent Gradient</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4 text-gradient">
              Text with gradient effect
            </h3>
            <h3 className="text-2xl font-bold mb-4 text-gradient-secondary">
              Text with secondary gradient
            </h3>
            <h3 className="text-2xl font-bold text-gradient-accent">
              Text with accent gradient
            </h3>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn btn-primary">Primary Button</button>
            <button className="btn btn-secondary">Secondary Button</button>
            <button className="btn btn-outline">Outline Button</button>
            <button className="btn btn-gradient">Gradient Button</button>
          </div>
        </section>

        {/* Cards Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-2">Standard Card</h3>
              <p className="text-gray-600">
                This is a standard card with hover effects. Notice the subtle gradient top border
                that appears on hover.
              </p>
            </div>

            <div className="card card-featured p-6">
              <h3 className="text-xl font-semibold mb-2">Featured Card</h3>
              <p className="text-gray-600">
                This is a featured card with a gradient border. Perfect for highlighting important
                content.
              </p>
            </div>

            <div className="card p-6 shadow-glow-accent">
              <h3 className="text-xl font-semibold mb-2 text-accent">Card with Accent Glow</h3>
              <p className="text-gray-600">
                This card has a colored shadow (glow effect) in the accent color.
              </p>
            </div>

            <div className="card p-6 shadow-glow-secondary">
              <h3 className="text-xl font-semibold mb-2 text-secondary">
                Card with Secondary Glow
              </h3>
              <p className="text-gray-600">
                This card has a colored shadow (glow effect) in the secondary color.
              </p>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <span className="badge">Default Badge</span>
            <span className="badge badge-accent">Accent Badge</span>
            <span className="badge badge-secondary">Secondary Badge</span>
            <span className="badge badge-success">Success Badge</span>
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Typography</h2>
          <div className="prose max-w-none">
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <h4>Heading 4</h4>
            <p>
              This is a paragraph with <a href="#" className="text-accent hover:text-accent-light">a link</a>.
              The typography is designed to be clean and readable with good contrast in both light and dark modes.
            </p>
            <p>
              <code>Inline code</code> has a subtle background with monospace font.
            </p>
            <pre>
              <code>
{`// Code block example
function greet(name: string) {
  return \`Hello, \${name}!\`;
}`}
              </code>
            </pre>
          </div>
        </section>

        {/* Blog Card Example */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Blog Card Example</h2>
          <div className="card overflow-hidden">
            <div className="h-48 bg-gradient-primary"></div>
            <div className="p-6">
              <div className="flex gap-2 mb-3">
                <span className="badge badge-accent">DevOps</span>
                <span className="badge badge-secondary">Automation</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Sample Blog Post Title
              </h3>
              <p className="text-gray-600 mb-4">
                This is a preview of what a blog post card would look like with the new theme.
                The gradient image placeholder, badges, and typography all work together.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">5 min read</span>
                <button className="btn btn-secondary">Read More</button>
              </div>
            </div>
          </div>
        </section>

        {/* Dark Mode Notice */}
        <section className="mb-16">
          <div className="card p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">💡 Dark Mode</h2>
            <p className="text-gray-600 mb-4">
              This theme automatically adapts to your system's dark mode preference.
              Try switching your system theme to see the deep space dark mode with vibrant accents!
            </p>
            <p className="text-sm text-gray-500">
              Dark mode features enhanced glow effects and a deep space color palette.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-background-secondary py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>New Theme Preview - Italicninja</p>
          <p className="text-sm mt-2">
            <Link href="/" className="text-accent hover:text-accent-light">
              Return to main site
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
