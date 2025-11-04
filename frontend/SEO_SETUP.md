# SEO-Optimized Landing Page Setup

## Overview

This setup implements a hybrid approach for better SEO while maintaining the React SPA for the application:

- **Static Landing Page** (`/landing.html`) - SEO-optimized homepage served for the root URL
- **React SPA** (`/index.html`) - Interactive application for all game routes

## Architecture

### File Structure

```
frontend/
├── index.html              # React app entry (minimal, no SEO)
├── public/
│   ├── landing.html        # Static SEO-optimized homepage
│   ├── _redirects          # Netlify redirects
│   ├── .htaccess          # Apache redirects
│   └── ...
├── netlify.toml           # Netlify configuration
└── vite.config.ts         # Updated with multi-entry build
```

### How It Works

1. **Root URL (`/`)**: Serves `landing.html` - static, SEO-optimized
2. **App Routes**: Serve React SPA for:
   - `/app` and `/app/*` (main game)
   - `/volunteer`
   - `/dashboard`
   - `/multiplayer`
   - `/join/*`

### User Flow

1. User visits `https://guesstheaccent.xyz/`
2. Sees fully-rendered static landing page (instant SEO)
3. Clicks "Start Game" → redirects to `/app` (React app loads)
4. React Router handles all navigation within the app

## Benefits

### ✅ SEO Advantages

- Search engines see fully-rendered HTML immediately
- No JavaScript required for crawling the homepage
- Proper meta tags, Open Graph, and Schema.org markup
- Faster initial page load (no React bundle required)

### ✅ Development Advantages

- Keep existing React application unchanged
- No need to migrate to Next.js or SSR framework
- Simple deployment process
- Easy to maintain

### ✅ Performance

- Landing page loads instantly (no JS bundle)
- React app only loads when user starts playing
- Lazy loading of application code

## Deployment

### Netlify (Recommended)

Already configured via:

- `netlify.toml` - Main configuration
- `public/_redirects` - Redirect rules

**Deploy:** Push to your repository, Netlify auto-deploys.

### Vercel

Use the `public/_redirects` file or create `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/", "destination": "/landing.html" },
    { "source": "/app/:path*", "destination": "/index.html" },
    { "source": "/:path*", "destination": "/index.html" }
  ]
}
```

### Apache Server

The `public/.htaccess` file is already configured.

### Nginx

Create/update `nginx.conf`:

```nginx
server {
    location = / {
        try_files /landing.html =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Development

### Local Testing

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Test the landing page at:
# http://localhost:5173/landing.html

# Test the React app at:
# http://localhost:5173/app
```

### Build

```bash
npm run build
```

The build will output both:

- `dist/landing.html` - Static homepage
- `dist/index.html` - React app

### Preview Production Build

```bash
npm run preview
```

## SEO Checklist

The landing page includes:

- ✅ Semantic HTML
- ✅ Meta description and keywords
- ✅ Open Graph tags (Facebook)
- ✅ Twitter Card tags
- ✅ Canonical URL
- ✅ Schema.org structured data (WebApplication)
- ✅ Proper heading hierarchy (H1)
- ✅ Alt text for images
- ✅ ARIA labels for accessibility
- ✅ Fast loading time
- ✅ Mobile responsive
- ✅ Security headers

## Updating Content

### To Update Landing Page Content

Edit `public/landing.html`:

- Update text in the HTML
- Styles are inline (in `<style>` tag)
- Maintain the same class structure for consistency

### To Update Meta Tags

Edit the `<head>` section in `public/landing.html`:

- Update title, description, keywords
- Update Open Graph images and descriptions
- Update Schema.org structured data

## Testing SEO

### Google Search Console

1. Submit `https://guesstheaccent.xyz/` for indexing
2. Check for crawl errors
3. Monitor search performance

### Validation Tools

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Schema.org Validator](https://validator.schema.org/)

### Lighthouse Score

Run Lighthouse audit on the landing page:

```bash
npm run build
npm run preview
# Then run Lighthouse in Chrome DevTools on localhost:4173/landing.html
```

Target scores:

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

## Migration Notes

### No Changes Required To:

- React components
- Routing logic
- State management
- API calls
- Existing functionality

### Only Changed:

- Added static landing page
- Updated routing configuration
- Simplified main `index.html`

## Troubleshooting

### Landing page not showing

- Check `_redirects` file is in `public/` folder
- Verify build includes `landing.html` in `dist/`
- Clear browser cache

### React app routes 404

- Check rewrite rules in your deployment platform
- Verify `index.html` exists in build output

### Dev server shows different behavior

- In development, access routes directly:
  - Landing: `http://localhost:5173/landing.html`
  - App: `http://localhost:5173/app`
- Production redirects only work after deployment

## Future Enhancements

Consider adding:

- [ ] Prerender other static pages (About, FAQ)
- [ ] Add sitemap generation
- [ ] Implement dynamic OG images
- [ ] A/B testing on landing page
- [ ] Analytics tracking
