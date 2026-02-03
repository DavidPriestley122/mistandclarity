export async function renderHome() {
  const app = document.querySelector('#app');

  app.innerHTML = `
    <div class="landing-page">
      <div class="landing-hero">
        <div class="landing-image-container">
          <img
            src="/images/Hero image.jpg"
            alt="Chang Chien-ying and Fei Cheng-wu painting outdoors in London, 1948"
            class="landing-hero-image"
          />
        </div>

        <div class="landing-content">
          <h1 class="landing-title">Welcome to the Vermillion Pavilion</h1>
          <p class="landing-description">
            The studio of London Chinese artists Chien-ying Chang and Cheng-wu Fei
          </p>

          <a href="/gallery" class="btn-enter" data-link>
            <span>Enter</span>
            <span class="arrow">→</span>
          </a>
        </div>

        <div class="photo-credit">
          Middlesex Guildhall, Parliament Square, London, 1948
        </div>
      </div>
    </div>
  `;
}
