import { renderNavigation } from './nav.js';

export function renderArtists() {
  const app = document.querySelector('#app');

  app.innerHTML = `
    ${renderNavigation()}

    <div class="intro-page">
      <div class="intro-container">

        <section class="intro-section">
          <h1>The Artists</h1>

          <div class="intro-photo">
            <img src="/images/MrandMrsFeiWithZAZandCXN1.jpg"
                 alt="Chang Chien-ying and Fei Cheng-wu with fellow artists" />
            <p class="photo-caption">The four artists sent to Britain by Xu Beihong in 1946. Left to right: Fei Cheng-wu, Zhang Anzhi (back), Chang Chien-ying (front), and Chen Xiaonan</p>
          </div>

          <div class="intro-text">
            <p>Chang Chien-ying (張蒨英, 1909-2003) and Fei Cheng-wu (費成武, 1911-2000) called their North London home the Vermillion Pavilion. Between the late 1940s and early 1960s, they produced the majority of their work, a remarkably productive period that established their reputations across Britain.</p>
          </div>

          <div class="artists-choice">
            <a href="/artist/chang-chien-ying" class="artist-card" data-link>
              <h2>Chang Chien-ying</h2>
              <p class="artist-years">張蒨英 (1909-2003)</p>
              <p class="artist-description">Member of the Royal Institute of Painters in Watercolours, known for her elegant compositions and mastery of both Chinese and Western techniques.</p>
              <span class="artist-link-text">Read biography →</span>
            </a>

            <a href="/artist/fei-cheng-wu" class="artist-card" data-link>
              <h2>Fei Cheng-wu</h2>
              <p class="artist-years">費成武 (1911-2000)</p>
              <p class="artist-description">Prolific painter who exhibited extensively across Britain, combining traditional Chinese subjects with Western artistic sensibility.</p>
              <span class="artist-link-text">Read biography →</span>
            </a>
          </div>

        </section>

      </div>
    </div>
  `;
}
