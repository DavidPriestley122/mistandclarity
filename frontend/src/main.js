import './style.css'
import { router } from './router.js';
import { renderGallery } from './gallery.js';
import { renderPaintingDetail } from './painting-detail.js';
import { renderArtistBio } from './artist-bio.js';

// Set up routes
router.addRoute('/', renderGallery);
router.addRoute('/painting/:id', renderPaintingDetail);
router.addRoute('/artist/:slug', renderArtistBio);

// Start the router
router.start();
