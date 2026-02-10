import { renderNavigation } from './nav.js';
import { adminLink } from './admin.js';

export function renderAbout() {
  const app = document.querySelector('#app');

  app.innerHTML = `
    ${renderNavigation()}

    <div class="intro-page">
      <div class="intro-container">

        <section class="intro-section">
          <h1>About the Paintings</h1>

          <div class="intro-text">
            <p>The paintings on this website are from the estate of Chang Chien-ying, who preserved the entire contents of the Vermillion Pavilion studio following the death of her husband Fei Cheng-wu in 2000.</p>

            <p>This collection represents a remarkable opportunity to rediscover two pioneering artists—Chang Chien-ying and Fei Cheng-wu—whose story has remained largely untold. As the first Chinese academically trained artists to settle permanently in Britain, their work represents a unique bridge between Eastern and Western artistic traditions, developed over more than five decades in relative isolation from their contemporaries. <a href="${adminLink('/intro')}" data-link>Read their full story</a>.</p>

            <p>Between 2023 and 2024, we presented three exhibitions through Priestley & Ferraro: <em>Mist and Clarity: smaller scale works by Chang Chien-ying and Fei Cheng-wu</em> (2023), <em>Timeless Creatures: Animals in early Chinese Pottery and 20th Century Ink Paintings</em> (May 2024), and <em>The Ageless Garden: Botanical Beauty in Chinese Art</em> (September 2024).</p>

            <p>The cataloguing and research behind this project has been ongoing since 2003, with particular thanks to the Li Ching Foundation in Taiwan for their assistance in compiling biographical information.</p>
          </div>
        </section>

        <section class="intro-section">
          <h2>These paintings are available for acquisition</h2>

          <div class="intro-text">
            <p>For pricing information, condition reports, provenance details, or to arrange a viewing, please contact us at <a href="mailto:info@vermillionpavilion.com">info@vermillionpavilion.com</a>.</p>
          </div>
        </section>

      </div>
    </div>
  `;
}
