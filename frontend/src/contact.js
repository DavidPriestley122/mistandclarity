import { renderNavigation } from './nav.js';

export function renderContact() {
  const app = document.querySelector('#app');

  app.innerHTML = `
    ${renderNavigation()}

    <div class="intro-page">
      <div class="intro-container">

        <section class="intro-section">
          <h1>Contact</h1>

          <div class="intro-text">
            <p>We welcome inquiries about the paintings of <span class="artist-name">Chang Chien-ying</span> and <span class="artist-name">Fei Cheng-wu</span>.</p>

            <p>These works are available for acquisition. For pricing information, condition reports, provenance details, or to arrange a viewing, please contact us:</p>
          </div>

          <div class="collection-highlight">
            <p><strong>Email:</strong> <a href="mailto:info@vermillionpavilion.com">info@vermillionpavilion.com</a></p>
          </div>

          <div class="intro-text">
            <p>We typically respond to inquiries within 48 hours. For detailed information about the collection and the artists' remarkable story, please visit our <a href="/collection" data-link>About</a> page or explore the <a href="/gallery" data-link>Gallery</a>.</p>
          </div>
        </section>

      </div>
    </div>
  `;
}
