'use client'

// Replaces the root layout when it fails, so globals.css and the fonts may not be loaded.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#ddd9cb', color: '#2c2a24', fontFamily: 'Verdana, Geneva, sans-serif' }}>
        <div style={{ maxWidth: 520, margin: '80px auto', padding: 24, background: '#f3f0e6', border: '1px solid #a29d8d', borderBottom: '10px solid #9e4a1e' }}>
          <h1 style={{ margin: '0 0 8px', fontFamily: '"Arial Narrow", Arial, sans-serif', fontSize: 28, textTransform: 'uppercase', color: '#4d5720' }}>
            Something broke
          </h1>
          <p style={{ margin: '0 0 16px', fontSize: 13, lineHeight: 1.7 }}>
            The site hit an error while loading. Try again, or head back to the front page.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ marginRight: 14, padding: '5px 14px', border: '1px solid #7d3915', background: '#9e4a1e', color: '#f4f1e6', fontSize: 12, cursor: 'pointer' }}
          >
            Try again
          </button>
          {/* Plain <a>: a full page load is the point after a root-layout crash. */}
          <a href="/" style={{ color: '#9e4a1e', fontSize: 12 }}>Home »</a>
        </div>
      </body>
    </html>
  )
}
