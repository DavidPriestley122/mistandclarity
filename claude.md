# Mist and Clarity - Project Documentation

## Project Overview

"Mist and Clarity" (霧明樓 - Wuming Lou) is a website showcasing ~580 Chinese paintings by artists Chang Chien-ying (張蒨英, 1909-2003) and Fei Cheng-wu (費成武, 1911-2000). These were the first Chinese academically trained artists to settle and make their living in Britain, arriving in 1946 and spending the remainder of their lives working in London.

## Completed Features

### ✅ Database & Backend (Railway)
- **PostgreSQL Database**: Fully structured with normalized schema
  - `artists` table: Artist information with pinyin and preferred names
  - `paintings` table: Comprehensive metadata for 580 paintings
  - `collections` table: For curated exhibitions
  - `collection_paintings` table: Junction table with `display_order` for manual reordering
- **Express API**: RESTful endpoints for paintings, artists, and collections
- **Data Import**: Successfully imported all 580 high-quality paintings (quality ≥80) from Excel

### ✅ Frontend (Vite + Vanilla JS)
- **Gallery Homepage**:
  - Grid display of all 580 paintings
  - Filter by artist and theme
  - Real-time filter updates with URL params
  - Responsive design
  - Shows painting count

- **Painting Detail Pages**:
  - Full metadata display (dimensions, medium, condition, etc.)
  - Notes and catalog number
  - Link to view reverse side (when available)
  - Contact CTA for inquiries
  - Back navigation to gallery

- **Artist Biography Pages**:
  - `/artist/fei-cheng-wu`
  - `/artist/chang-chien-ying`
  - Comprehensive biographical content extracted from exhibition catalogue
  - Sections on education, Chongqing period, journey to Britain, life in London
  - Links to view each artist's paintings
  - Accessible from gallery homepage

- **Client-Side Router**: Vanilla JS SPA routing with History API

- **Contact Page**: Dedicated contact page with email information and acquisition details

- **Images**: All painting images displaying correctly (JPEG files uploaded and integrated)

### ✅ SEO Optimization
- **Dynamic Page Titles**: Each route has unique, descriptive title tags
  - Home, Gallery, About, Artists, Contact pages with custom titles
  - Painting detail pages use painting title and artist name
  - Artist biography pages use artist name and dates
  - Exhibition pages use exhibition name
  - 404 page with appropriate metadata
- **Meta Descriptions**: Unique, SEO-optimized descriptions for every page
- **Utils Module**: `utils.js` with `setPageMeta()` function for consistent metadata management

### ✅ Design System
- **Catalogue-Inspired Aesthetic**: Matches the "MIST AND CLARITY" exhibition catalogue
- **Color Palette**:
  - Primary: `#2C2C2C` (dark charcoal)
  - Accent: `#C8352E` (Chinese seal red)
  - Background: `#F5F0E8` (warm cream, aged paper)
  - Cards: `#FDFCF9` (ivory)
  - Borders: `#D4C4B0` (subtle taupe)
- **Typography**: Georgia serif throughout for traditional gallery feel
- **Spacing**: Generous padding (40-60px) and elegant hover effects
- **Fully Responsive**: Mobile-optimized layouts

## Technical Architecture

### Backend Structure
```
backend/
├── server.js                 # Express server, CORS, routes
├── database.js              # PostgreSQL connection pool
├── schema.sql               # Database schema with pre-populated artists
├── import-paintings.js      # Script to import Excel data
├── routes/
│   ├── paintings.js        # GET /api/paintings, /api/paintings/:id
│   ├── artists.js          # GET /api/artists
│   └── collections.js      # Collection management + reorder endpoint
├── .env                    # DATABASE_PUBLIC_URL, PORT
└── MrandMrsFeiPaintingsForWebsite.xlsx  # Source data (580 paintings)
```

### Frontend Structure
```
frontend/
├── index.html              # Entry point
├── src/
│   ├── main.js            # App initialization, route setup
│   ├── router.js          # Vanilla JS SPA router
│   ├── api.js             # API functions, image URL converter
│   ├── utils.js           # Utility functions (SEO meta tags)
│   ├── gallery.js         # Gallery homepage rendering
│   ├── painting-detail.js # Individual painting pages
│   ├── artist-bio.js      # Artist biography pages
│   ├── home.js            # Landing page
│   ├── about.js           # About the collection page
│   ├── intro.js           # Artists' story page
│   ├── artists.js         # Artists index page
│   ├── exhibition-detail.js # Exhibition detail pages
│   ├── contact.js         # Contact page
│   └── style.css          # Complete styling (catalogue aesthetic)
├── .env                   # VITE_API_URL=http://localhost:3000/api
└── package.json           # Vite 7, requires Node 20+
```

### Routes
- `/` - Landing page with hero image
- `/gallery` - Gallery/exhibitions index (admin: storage view with all 580 paintings)
- `/painting/:id` - Individual painting detail
- `/collection` - About the collection page
- `/intro` - Artists' story (Chongqing to London)
- `/artists` - Artists index page
- `/artist/fei-cheng-wu` - Fei Cheng-wu biography
- `/artist/chang-chien-ying` - Chang Chien-ying biography
- `/exhibition/:id` - Exhibition detail view
- `/contact` - Contact page

### API Endpoints
- `GET /api/paintings` - List paintings (supports `?artist_id=X&theme=Y`)
- `GET /api/paintings/:id` - Single painting details
- `GET /api/artists` - List all artists
- `GET /api/collections` - List collections
- `GET /api/collections/:id` - Collection with paintings ordered by `display_order`
- `PUT /api/collections/:id/reorder` - Update painting order in collection

## Data Model

### Artists
- `id`, `name_preferred` (e.g., "Chang Chien-ying"), `name_pinyin` (e.g., "Zhang Qianying")
- Pre-populated: ID 1 = Fei Cheng-wu, ID 2 = Chang Chien-ying

### Paintings
- Comprehensive fields: titles (descriptive, artist's), date, artist_id
- Medium: `medium_type`, `medium_detail`
- Dimensions: `dimensions_h`, `dimensions_w` (cm)
- Physical: `framed`, `mounted`, `condition`, `number_of_seals`, `signature_location`
- Content: `theme`, `notes`
- Images: `dropbox_link_front`, `dropbox_link_reverse` (TIF files for download)
- Reference: `catalog_number`, `catalog_reference`, `location`, `quality`

### Collections (for manual curation)
- `name`, `description`, `is_featured`, `display_order`
- Junction table with `display_order` for drag-and-drop reordering capability

## Image Strategy

### Current State
- **Dropbox TIF files**: High-resolution TIF files remain in Dropbox (links in database)
- **Web display**: Images not yet displaying (TIF format not browser-compatible)
- **Downloads**: Dropbox links available for high-res TIF downloads

### Planned Implementation
1. **Extract JPEGs** from downloaded 114GB folder (contains TIFs, NEFs, JPEGs in subfolders)
2. **Upload to Storage**: Cloudflare R2 or Railway storage
3. **Update Database**: Add `jpeg_url` field or update image links
4. **Display Strategy**: Use JPEGs for web, keep TIF Dropbox links for "Download High-Res" button

## Key Implementation Details

### Data Import Challenges Solved
- **Dimension parsing**: Handled format like "(Head) 56" with regex extraction
- **Date formatting**: Converted numeric dates (1958, 1965) to strings safely
- **Chinese characters**: UTF-8 handling for names and notes
- **Result**: 580/580 paintings imported with 0 errors

### Router Implementation
- Vanilla JS with History API (no frameworks)
- Handles parameterized routes (`:id`, `:slug`)
- Event delegation for `data-link` attributes
- Preserves browser back/forward functionality

### Image URL Conversion
```javascript
// Converts Dropbox share links to direct access
'?dl=0' → '?raw=1'
'www.dropbox.com' → 'dl.dropboxusercontent.com'
```

### SEO Implementation
- **Utility Function**: `setPageMeta(title, description)` in `utils.js`
- **Dynamic Metadata**: Each page sets unique title and description on render
- **Painting Pages**: Title includes painting name, artist, and theme
- **Artist Pages**: Title includes artist name, Chinese name, and dates
- **Exhibition Pages**: Title uses exhibition name and subtitle
- **Admin Mode**: Separate titles for admin vs public gallery views

### Artist ID Reference
- **Fei Cheng-wu**: `artist_id=1`
- **Chang Chien-ying**: `artist_id=2`

## Environment Setup

### Backend (.env)
```
DATABASE_PUBLIC_URL=<Railway PostgreSQL connection string>
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

### Running Locally
```bash
# Backend
cd backend
npm install
npm start  # Port 3000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev  # Port 5173
```

## Historical Context

### The Artists
- **Xu Beihong's Mission (1946)**: Selected 4 artists to study Western techniques in Britain
- **Chongqing Period (1937-1945)**: Worked alongside Fu Baoshi, Xu Beihong, Zhang Daqian, and other masters
- **British Life**: Studied at Slade, Chelsea, Courtauld; friends with Stanley Spencer
- **Marriage (1953)**: Married at Kensington & Chelsea Register Office with Spencer present
- **Studio Name**: 霧明樓 (Wuming Lou) - "Mist and Clarity"
- **Legacy**: First Chinese academically trained artists to settle permanently in Britain

### Exhibition History
- Leicester Galleries, Tryon Gallery (London)
- Royal Academy Summer Exhibitions
- Scottish Lyceum Gallery (Edinburgh)
- Graves Art Gallery (Sheffield), Derby Museum, Royal West of England Academy
- Chang: Member of Royal Institute of Painters in Watercolours

## Pending Tasks

### High Priority
1. **SEO Enhancement** (basic SEO ✅ complete):
   - ✅ Unique page titles and meta descriptions
   - Create sitemap.xml
   - Add Open Graph and Twitter Card meta tags
   - Submit to Google Search Console
   - Custom favicon (replace default Vite icon)

2. **Add Download Button**: "Download High-Res TIF" on detail pages (optional)

### Medium Priority
3. **Admin Interface**:
   - Authentication system
   - Create/manage collections
   - Add/remove paintings from collections
   - Drag-and-drop reordering interface
   - Update painting metadata

4. **Contact Form**: Functional email integration for inquiries (currently email link only)

### Future Enhancements
5. **Search Functionality**: Full-text search across titles, themes, notes
6. **Advanced Filters**: Date ranges, dimensions, medium types
7. **Image Zoom**: High-quality zoom functionality on detail pages
8. **Analytics**: Google Analytics or similar tracking
9. **Deployment**:
    - Frontend: Netlify
    - Backend: Railway (already hosted)
    - Database: Railway PostgreSQL (already set up)

## Known Issues
- No authentication system yet (admin features inaccessible)
- Contact form not functional (placeholder only)

## Development Notes

### Node Version
- **Required**: Node.js 20.19+ (Vite 7 requirement)
- User upgraded from 18.19.1 to 20.19.6

### Railway Configuration
- Separate project: "mistandclarity" (not auction site)
- Public database URL needed for local development
- Backend deployed at Railway URL (TBD production domain)

### Design Philosophy
- Matches exhibition catalogue aesthetic exactly
- Traditional gallery presentation
- Generous spacing, elegant typography
- Minimal, focused interface
- Respects the artists' historical significance

## Resources

### Documentation Sources
- Exhibition catalogue: "MIST AND CLARITY (1).pdf" (28 pages, 5MB)
- Excel data: 580 paintings with comprehensive metadata
- Historical photos: Wedding with Spencer, Chongqing group photo, portraits

### External Links
- Priestley & Ferraro Gallery: 3 Bury Street, St James's, London
- Li Ching Foundation: Assisted with Fei Cheng-wu chronology

## Project Timeline

1. **Database Design** - Schema with artists, paintings, collections, junction table
2. **Backend Setup** - Railway PostgreSQL, Express API, data import
3. **Frontend Foundation** - Vite, vanilla JS router, API integration
4. **Gallery Implementation** - Grid view, filtering, detail pages
5. **Design Overhaul** - Catalogue-inspired aesthetic implementation
6. **Biography Pages** - Content extraction from PDF, comprehensive artist histories
7. **Image Integration** - All 580 painting images uploaded and displaying
8. **Contact Page** - Dedicated contact page added
9. **Design Refinements** - Brightness filters, color adjustments (ivory links)
10. **SEO Implementation** - Dynamic page titles and meta descriptions for all routes
11. **Current Phase** - Pre-launch: Additional SEO work (sitemap, Open Graph) and custom domain setup

---

*Last Updated: 2026-02-10*
*Project Status: Core features complete, SEO optimized, ready for launch*
