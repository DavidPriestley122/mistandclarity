import { renderNavigation, attachLangToggle } from './nav.js';
import { setPageMeta } from './utils.js';
import { t } from './i18n.js';

export function renderAbout() {
  setPageMeta(
    'About the Collection - Vermillion Pavilion',
    'Discover the remarkable collection of paintings by Chang Chien-ying and Fei Cheng-wu, preserved from their London studio. Learn about their exhibitions and the ongoing research since 2003.'
  );

  const app = document.querySelector('#app');

  app.innerHTML = `
    ${renderNavigation()}

    <div class="intro-page">
      <div class="intro-container">

        <section class="intro-section">
          <h1>${t('about.heading')}</h1>

          <div class="intro-text">
            <p>${t('about.p1')}</p>

            <p>${t('about.p2')}</p>

            <p>${t('about.p3')}</p>

            <p>${t('about.p4')}</p>
          </div>
        </section>

        <section class="intro-section">
          <div class="acquisition-box">
            <h2>${t('about.acqHeading')}</h2>

            <div class="intro-text">
              <p>${t('about.acqText')}</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  `;

  attachLangToggle();
}
