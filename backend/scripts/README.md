# Backend Utility Scripts

These are one-time setup scripts used during initial development. Kept for reference.

## Data Import
- **import-paintings.js** - Import paintings from Excel to PostgreSQL
- **add-single-painting.js** - Manually add individual paintings

## Image Processing
- **extract-images.js** - Extract JPEGs from downloaded image folders
- **copy-matched-images.js** - Copy matched images to frontend/public/images
- **fix-missing-images.js** - Fix missing image references
- **verify-images.js** - Verify extracted images match database

## Database Updates
- **update-image-urls.js** - Update image URL fields in database
- **run-migration.js** - Run SQL migrations

## Usage

These scripts have already been run and the database is populated.
Only re-run if you need to reimport data or fix image issues.

Most scripts require:
```bash
cd backend
node scripts/script-name.js
```
