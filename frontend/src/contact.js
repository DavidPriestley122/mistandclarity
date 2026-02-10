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
            <p>We welcome inquiries about the paintings of Chang Chien-ying and Fei Cheng-wu.</p>

            <p>For pricing information, condition reports, provenance details, or to arrange a viewing, please contact us at <a href="mailto:contact@vermillionpavilion.com">contact@vermillionpavilion.com</a>.</p>

            <p>We typically respond to inquiries within 48 hours.</p>
          </div>
        </section>

      </div>
    </div>
  `;
}
