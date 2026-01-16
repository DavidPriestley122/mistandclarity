import { fetchPaintings } from './api.js';

export async function renderHome() {
  const app = document.querySelector('#app');

  // Show loading state
  app.innerHTML = `
    <div class="container">
      <div class="loading">Loading...</div>
    </div>
  `;

  try {
    // Fetch paintings for the carousel (we'll get from active collection later)
    // Get 16 for slower, smoother rotation
    const paintings = await fetchPaintings({ limit: 16 });

    app.innerHTML = `
      <div class="home">
        <!-- Two-Bar Header with Calligraphy Lintel -->
        <header class="site-header">
          <!-- Top Bar: Calligraphy Lintel -->
          <div class="calligraphy-lintel-bar">
            <img src="/images/wuminglou-calligraphy.jpg" alt="Wu Ming Lou calligraphy by Yu Youren" class="lintel-calligraphy" />
          </div>

          <!-- Bottom Bar: Navigation -->
          <nav class="header-nav">
            <div class="nav-links">
              <a href="/" data-link>Home</a>
              <a href="/gallery" data-link>Gallery</a>
              <a href="/artist/chang-chien-ying" data-link>Chang Chien-ying</a>
              <a href="/artist/fei-cheng-wu" data-link>Fei Cheng-wu</a>
            </div>
            <div class="nav-actions">
              <button class="translate-btn" onclick="alert('Translation feature coming soon')">中文</button>
            </div>
          </nav>
        </header>

        <!-- Hero Section with Artist Portraits -->
        <section class="hero-section">
          <div class="hero-intro-text">
            <h1 class="site-title">Works from the Vermillion Pavilion</h1>
            <p class="studio-name">霧明樓 (Wu Ming Lou)</p>
            <p class="hero-subtitle">London Studio of Chang Chien-ying & Fei Cheng-wu</p>
            <p class="hero-description">
              The first Chinese academically trained artists to settle permanently in Britain.
              From Chongqing to London, they bridged Eastern and Western artistic traditions,
              exhibiting at Leicester Galleries, the Royal Academy, and beyond.
            </p>
          </div>

          <div class="artist-portraits">
            <div class="portrait-card">
              <img src="/images/zhang-qianying-1950.jpg" alt="Chang Chien-ying painting, c.1950" />
              <div class="portrait-caption">
                <h3>Chang Chien-ying</h3>
                <p class="chinese-name">張蒨英</p>
              </div>
            </div>

            <div class="portrait-card">
              <img src="/images/fei-chengwu-1950.jpg" alt="Fei Cheng-wu painting, c.1950" />
              <div class="portrait-caption">
                <h3>Fei Cheng-wu</h3>
                <p class="chinese-name">費成武</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Exhibition Carousel Section -->
        <section class="exhibition-section">
          <div class="carousel-container">
            <div class="carousel" id="painting-carousel">
              ${paintings.map((painting, index) => `
                <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                  <a href="/painting/${painting.id}" data-link>
                    <img
                      src="http://localhost:3000${painting.jpeg_url_front || '/placeholder.jpg'}"
                      alt="${painting.descriptive_title || painting.artists_title || 'Untitled'}"
                      loading="lazy"
                    />
                  </a>
                </div>
              `).join('')}
            </div>

            <!-- Carousel Navigation -->
            <button class="carousel-btn carousel-prev" aria-label="Previous">‹</button>
            <button class="carousel-btn carousel-next" aria-label="Next">›</button>

            <!-- Carousel Indicators -->
            <div class="carousel-indicators">
              ${paintings.map((_, index) => `
                <button
                  class="indicator ${index === 0 ? 'active' : ''}"
                  data-index="${index}"
                  aria-label="Go to slide ${index + 1}"
                ></button>
              `).join('')}
            </div>
          </div>

          <div class="cta-container">
            <a href="/gallery" class="btn btn-primary" data-link>View Gallery</a>
          </div>
        </section>

        <!-- Quick Links Section -->
        <section class="quick-links">
          <a href="/artist/fei-cheng-wu" class="quick-link" data-link>
            <h3>About Fei Cheng-wu</h3>
            <p>Learn about his life and work →</p>
          </a>
          <a href="/artist/chang-chien-ying" class="quick-link" data-link>
            <h3>About Chang Chien-ying</h3>
            <p>Learn about her life and work →</p>
          </a>
          <a href="/gallery" class="quick-link" data-link>
            <h3>Browse Gallery</h3>
            <p>Explore all paintings →</p>
          </a>
        </section>
      </div>
    `;

    // Initialize carousel
    initializeCarousel();

  } catch (error) {
    console.error('Error loading homepage:', error);
    app.innerHTML = `
      <div class="container">
        <div class="error">
          <p>Error loading homepage.</p>
          <p class="error-detail">${error.message}</p>
        </div>
      </div>
    `;
  }
}

function initializeCarousel() {
  const carousel = document.getElementById('painting-carousel');
  const slides = carousel.querySelectorAll('.carousel-slide');
  const indicators = document.querySelectorAll('.carousel-indicators .indicator');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');

  let currentIndex = 0;
  let autoplayInterval;

  function showSlide(index) {
    // Wrap around
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;

    currentIndex = index;

    // Slide animation - move the carousel container
    const offset = -currentIndex * 100;
    carousel.style.transform = `translateX(${offset}%)`;

    // Update indicators
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === currentIndex);
    });
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  // Navigation buttons
  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoplay();
  });

  prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoplay();
  });

  // Indicator clicks
  indicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
      const index = parseInt(indicator.dataset.index);
      showSlide(index);
      resetAutoplay();
    });
  });

  // Autoplay - slower for contemplative viewing
  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 6000); // Change slide every 6 seconds
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Pause on hover
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  // Start autoplay
  startAutoplay();
}
