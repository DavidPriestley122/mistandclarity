# Mist and Clarity — Project Documentation

## Project Overview

"Mist and Clarity" (霧明樓 - Wuming Lou) is a website showcasing ~580 Chinese paintings by artists Chang Chien-ying (張蒨英, 1909-2003) and Fei Cheng-wu (費成武, 1911-2000). These were the first Chinese academically trained artists to settle and make their living in Britain, arriving in 1946 and spending the remainder of their lives working in London.

**Deployment:**
- Frontend: Netlify (static SPA, Vite build + Playwright prerendering)
- Backend: Railway (Express 5, Node.js)
- Database: Railway PostgreSQL

**Live URLs:**
- Frontend: Netlify-assigned domain (custom domain migration pending)
- Backend API: `https://mistandclarity-production.up.railway.app/api`

---

## Completed Features

### ✅ Database & Backend
- PostgreSQL schema: `artists`, `paintings`, `collections`, `collection_paintings`, `contact_submissions`, `mailing_list`
- Express API: paintings, artists, collections, contacts endpoints
- 580 paintings imported from Excel with full metadata

### ✅ Frontend (Vite + Vanilla JS SPA)
- Client-side router (History API, no framework)
- Gallery homepage (exhibitions index for public; storage view in admin mode)
- Painting detail pages with full metadata
- Artist biography pages (Fei Cheng-wu, Chang Chien-ying)
- About / collection / intro / contact pages
- Exhibition detail pages
- Fully responsive design

### ✅ Admin Mode (`?admin=true`)
- Storage view: all 580 paintings in a grid with add-to-exhibition controls
- Client-side search: filter by title, artist name, or 4-digit catalogue number (real-time)
- Artist and theme dropdown filters
- Collapsible admin side panel (380px):
  - Create / edit / delete exhibitions
  - Add / remove paintings from exhibitions
  - Drag-and-drop or arrow-key reordering
  - Contact submissions management (view, mark status, delete)
  - Mailing list management
- Lightbox zoom on painting images (fixed: listeners attach even when HTML is prerendered)

### ✅ Contact & Mailing List
- Contact form with inquiry submission (linked to painting if applicable)
- Mailing list subscription
- Admin can view/manage submissions and subscribers

### ✅ Design System
- Catalogue-inspired aesthetic matching the "MIST AND CLARITY" exhibition catalogue
- Color palette: charcoal `#2C2C2C`, seal red `#C8352E`, warm cream `#F5F0E8`, ivory `#FDFCF9`
- Georgia serif typography throughout
- Generous spacing, hover effects, fully responsive

### ✅ SEO
- Dynamic page titles and meta descriptions for every route
- Playwright-based prerendering of key routes during build
- SPA catch-all routing via Netlify `_redirects`
- Trailing slash handling in client-side router

---

## Architecture

### Backend
```
backend/
├── server.js              # Express entry point, CORS (open), routes
├── database.js            # PostgreSQL pool (max 5 connections, SSL in prod)
├── routes/
│   ├── paintings.js       # GET /, GET /:id, POST, PUT /:id, DELETE /:id
│   ├── collections.js     # Full CRUD + /activate, /:id/paintings, /:id/reorder
│   ├── artists.js         # GET /, GET /:id, POST, PUT /:id
│   └── contacts.js        # /inquiry (public), /subscribe (public), /submissions (admin), /mailing-list (admin)
├── middleware/            # (empty — auth middleware to be added)
└── migrations/            # SQL migration files
```

### Frontend
```
frontend/src/
├── main.js                # Route registration
├── router.js              # Vanilla JS SPA router
├── api.js                 # All API fetch wrappers
├── admin.js               # isAdminMode(), adminLink(), buildGalleryUrl()
├── admin-panel.js         # Exhibition management side panel
├── gallery.js             # renderGallery(), renderStorageView()
├── painting-detail.js     # Single painting page
├── artist-bio.js          # Artist biography pages
├── lightbox.js            # Image zoom/lightbox
├── nav.js                 # Navigation component
├── utils.js               # setPageMeta()
└── style.css              # Single stylesheet (~55KB)
```

### Routes
- `/` — Landing page
- `/gallery` — Exhibitions index (admin: storage view with all 580 paintings)
- `/painting/:id` — Painting detail
- `/collection` — About the collection
- `/intro` — Artists' story
- `/artists` — Artists index
- `/artist/fei-cheng-wu` — Fei Cheng-wu biography
- `/artist/chang-chien-ying` — Chang Chien-ying biography
- `/exhibition/:id` — Exhibition detail
- `/contact` — Contact page

### Key Data
- **Fei Cheng-wu**: `artist_id = 1`
- **Chang Chien-ying**: `artist_id = 2`

---

## Deployment Notes

- **netlify.toml**: `base = "frontend"`, `command = "npm run build"`, `publish = "dist"` — paths relative to base, do NOT prefix with `frontend/`
- **SPA Routing**: `_redirects` has `/* /index.html 200` catch-all. Do NOT add per-route redirect rules — they break before the catch-all fires
- **Trailing slash**: Prerendering creates directories (e.g., `dist/gallery/index.html`), causing Netlify to 301 `→ /gallery/`. Router strips trailing slashes before matching
- **Prerendering**: Playwright (`prerender.js` + `build-with-prerender.js`) runs during Netlify build. Admin routes are NOT prerendered

---

## Pending Work

### In Progress
- **Admin authentication** (plan agreed, not yet implemented):
  - Shared password stored as `ADMIN_PASSWORD` env var on Railway
  - `JWT_SECRET` env var also needed
  - `POST /api/admin/login` endpoint (returns JWT, 24h expiry)
  - `backend/middleware/auth.js` — Bearer token verification
  - Protected routes: all collection writes, all contact/mailing-list reads+writes, all painting writes
  - Public routes unchanged: GET paintings, GET artists, GET collections (read), POST contacts/inquiry, POST contacts/subscribe
  - Frontend: token stored in `sessionStorage`, login modal shown when `?admin=true` present but no token, auth header sent on protected API calls

### Pending
- Custom domain (Netlify → real domain; independent of auth, no code changes needed — CORS is open)
- Sitemap.xml
- Open Graph / Twitter Card meta tags
- Google Search Console submission
- Custom favicon

---

## Project Timeline

1. Database design — schema, artists, paintings, collections, junction table
2. Backend — Railway PostgreSQL, Express API, data import (580 paintings)
3. Frontend foundation — Vite, vanilla JS router, API integration
4. Gallery — grid view, filtering, detail pages
5. Design overhaul — catalogue-inspired aesthetic
6. Biography pages — content from exhibition catalogue PDF
7. Image integration — all 580 JPEGs uploaded and displaying
8. Contact page — dedicated contact + inquiry form
9. Admin panel — exhibition management, drag-and-drop reorder, contact management
10. SEO — dynamic titles/descriptions, prerendering
11. Lightbox zoom — fixed listener attachment for prerendered HTML
12. Storage search — client-side search by title, artist, catalogue number
13. *Next: admin authentication, custom domain, remaining SEO tasks*

---

## Historical Context

- **Xu Beihong's Mission (1946)**: Selected 4 artists to study Western techniques in Britain
- **Chongqing Period (1937–1945)**: Worked alongside Fu Baoshi, Xu Beihong, Zhang Daqian
- **British Life**: Studied at Slade, Chelsea, Courtauld; friends with Stanley Spencer
- **Marriage (1953)**: At Kensington & Chelsea Register Office, Spencer present
- **Studio Name**: 霧明樓 (Wuming Lou) — "Mist and Clarity"
- **Legacy**: First Chinese academically trained artists to settle permanently in Britain
- **Exhibition History**: Leicester Galleries, Tryon Gallery, Royal Academy, Scottish Lyceum, Graves Art Gallery, Derby Museum, Royal West of England Academy

---

*Last updated: 2026-02-17*
*Status: Core features complete, admin auth in progress, pre-launch*
