import { renderNavigation } from './nav.js';

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

            <p>This collection represents a remarkable opportunity to rediscover two pioneering artists—<span class="artist-name">Chang Chien-ying</span> and <span class="artist-name">Fei Cheng-wu</span>—whose story has remained largely untold. Between 2023 and 2024, we presented three exhibitions through Priestley & Ferraro: <em>Mist and Clarity: smaller scale works by Chang Chien-ying and Fei Cheng-wu</em> (2023), <em>Timeless Creatures: Animals in early Chinese Pottery and 20th Century Ink Paintings</em> (May 2024), and <em>The Ageless Garden: Botanical Beauty in Chinese Art</em> (September 2024).</p>

            <p>In wartime Chongqing, Chang and Fei studied and worked alongside an extraordinary generation of Chinese artists—Fu Baoshi, Xu Beihong, and Zhang Daqian among them. In 1946, they came to Britain. While their contemporaries remained in China, Chang and Fei's work evolved in isolation, developing a unique synthesis of Eastern and Western traditions. This website brings their paintings back into public view, offering collectors and scholars the chance to reassess their contribution to twentieth-century art.</p>

            <p>The cataloguing and research behind this project has been ongoing since 2003, with particular thanks to the Li Ching Foundation in Taiwan for their assistance in compiling biographical information.</p>
          </div>
        </section>

      </div>
    </div>
  `;
}
