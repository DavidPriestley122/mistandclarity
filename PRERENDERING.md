# Prerendering Setup

This site uses automated prerendering for SEO optimization.

## How It Works

When you push to GitHub:

1. **Netlify detects the push** and starts a build
2. **Installs Playwright** with browser dependencies
3. **Builds the site** with Vite
4. **Starts a local server** from the built files
5. **Uses Playwright** to visit each route and capture fully-rendered HTML
6. **Saves pre-rendered pages** with complete content
7. **Deploys to Netlify**

## What Gets Prerendered

These routes are pre-rendered with full HTML content:
- `/` - Home page
- `/gallery` - Gallery
- `/collection` - About the collection
- `/intro` - Artists' story
- `/artists` - Artists index
- `/artist/chang-chien-ying` - Chang's biography
- `/artist/fei-cheng-wu` - Fei's biography
- `/contact` - Contact page

## Benefits

✅ **SEO-friendly**: Search engines see fully-rendered HTML, not empty `<div id="app"></div>`
✅ **Automatic**: Runs on every push to main branch
✅ **Domain-independent**: Works with any domain (no hardcoded URLs)
✅ **No manual setup needed**: Everything happens in Netlify's build process

## Files Involved

- `netlify.toml` - Configures Netlify to install Playwright
- `prerender.js` - Playwright script that captures rendered HTML
- `build-with-prerender.js` - Manages server start/stop during build
- `package.json` - Build scripts that tie it all together
