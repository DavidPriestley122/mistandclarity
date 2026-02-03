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
            The London studio of Chang Chien-ying and Fei Cheng-wu
          </p>
          <p class="landing-tagline">
            The first Chinese academically trained artists to settle permanently in Britain
          </p>

          <a href="/gallery" class="btn-enter" data-link>
            <span>Enter the Gallery</span>
            <span class="arrow">→</span>
          </a>
        </div>
      </div>
    </div>
  `;
}
