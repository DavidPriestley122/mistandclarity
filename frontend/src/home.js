import { setPageMeta } from './utils.js';

export async function renderHome() {
  setPageMeta(
    'Vermillion Pavilion - Paintings by Chang Chien-ying and Fei Cheng-wu',
    'Explore the paintings of Chang Chien-ying and Fei Cheng-wu, the first Chinese academically trained artists to settle permanently in Britain. Discover their remarkable collection from Chongqing to London.'
  );

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
            The studio of London artists Chang Chien-ying and Fei Cheng-wu
          </p>

          <div class="btn-container">
            <a href="/gallery" class="btn-enter" data-link>Enter</a>
          </div>
        </div>

        <div class="photo-credit">
          Middlesex Guildhall, Parliament Square, London, 1948
        </div>
      </div>
    </div>
  `;
}
