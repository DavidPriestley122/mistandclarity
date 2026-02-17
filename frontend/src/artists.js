import { renderNavigation, attachLangToggle } from './nav.js';
import { setPageMeta } from './utils.js';
import { t } from './i18n.js';

export function renderArtists() {
  setPageMeta(
    'The Artists - Vermillion Pavilion',
    'Chang Chien-ying (1909-2003) and Fei Cheng-wu (1911-2000), the first Chinese academically trained artists to settle permanently in Britain. Read their biographies and view their works.'
  );

  const app = document.querySelector('#app');

  app.innerHTML = `
    ${renderNavigation()}

    <div class="intro-page">
      <div class="intro-container">

        <section class="intro-section">
          <h1>${t('artists.heading')}</h1>

          <div class="intro-photo">
            <img src="/images/MrandMrsFeiWithZAZandCXN1.jpg"
                 alt="Chang Chien-ying and Fei Cheng-wu with fellow artists" />
            <p class="photo-caption">${t('artists.caption')}</p>
          </div>

          <div class="intro-text">
            <p>${t('artists.intro')}</p>
          </div>

          <div class="artists-choice">
            <a href="/artist/chang-chien-ying" class="artist-card" data-link>
              <h2>Chang Chien-ying</h2>
              <p class="artist-years">${t('artists.chang.years')}</p>
              <p class="artist-description">${t('artists.chang.description')}</p>
              <span class="artist-link-text">${t('artists.chang.link')}</span>
            </a>

            <a href="/artist/fei-cheng-wu" class="artist-card" data-link>
              <h2>Fei Cheng-wu</h2>
              <p class="artist-years">${t('artists.fei.years')}</p>
              <p class="artist-description">${t('artists.fei.description')}</p>
              <span class="artist-link-text">${t('artists.fei.link')}</span>
            </a>
          </div>

        </section>

      </div>
    </div>
  `;

  attachLangToggle();
}
