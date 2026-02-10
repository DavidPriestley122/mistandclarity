import { renderNavigation } from './nav.js';
import { fetchActiveExhibition } from './api.js';

export async function renderIntro() {
  const app = document.querySelector('#app');

  // Check if there's an active exhibition
  let activeExhibition = null;
  try {
    const { collection } = await fetchActiveExhibition();
    activeExhibition = collection;
  } catch (error) {
    console.log('No active exhibition');
  }

  app.innerHTML = `
    ${renderNavigation()}

    <div class="intro-page">
      <div class="intro-container">

        <!-- The Chongqing Years -->
        <section class="intro-section">
          <h2>The Chongqing Years</h2>
          <div class="intro-text">
            <p>Chang Chien-ying (1909-2003) and Fei Cheng-wu (1911-2000) were the first Chinese academically trained artists to settle permanently in Britain. They called their joint studio the "Vermillion Pavilion" (in Chinese: 霧明樓, <em>Wuming Lou</em> – the names are not direct translations of each other). Theirs was an extraordinary story.</p>
          </div>

          <div class="intro-photo">
            <img src="/images/Photo 1 -Chang and Fei with students and teachers -.jpg"
                 alt="Fine Arts Department, National Central University, Chongqing" />
            <p class="photo-caption">Fine Arts Department, National Central University, Chongqing, c. 1942. Fei Cheng-wu (front row, right) and Chang Chien-ying (second row, right) with Fu Baoshi, Xu Beihong, Chen Zhifo, and colleagues</p>
          </div>

          <div class="intro-text">
            <p>During the Anti-Japanese War (1937-1945), as young qualified artists, they found themselves part of a remarkable concentration of talent in Chongqing. There have been few times in history when such artistic creativity was gathered in one place. They counted among their friends, colleagues and teachers a group whose names read like a roll call of twentieth century Chinese art: <strong>Fu Baoshi, Xu Beihong, Zhang Daqian, Pang Xunqin, Wu Zuoren, Huang Junbi, Lin Fengmian, Chen Zhifo, Xie Zhiliu</strong>, and many others.</p>
          </div>

          <div class="intro-photo">
            <img src="/images/Chien-ying with Zhang Daqian, Fu Baoshi, Xu Beihong and others.jpg"
                 alt="Chang Chien-ying with masters of Chinese art" />
            <p class="photo-caption">Chang Chien-ying (wearing checked scarf) with masters of Chinese art, including Zhang Daqian, Fu Baoshi, and Xu Beihong</p>
          </div>
        </section>

        <!-- Journey to Britain -->
        <section class="intro-section">
          <h2>The Journey to Britain</h2>
          <div class="intro-text">
            <p>In 1946, with victory in the war, their mentor <strong>Xu Beihong</strong> selected four artists to travel to Britain to study Western art techniques, intending they would return to encourage a new synthesis of Eastern and Western art. Chang Chien-ying and Fei Cheng-wu were among them.</p>
          </div>

          <div class="intro-photo">
            <img src="/images/Photo 2 - Chang and Fei as part of the 4.jpg"
                 alt="The four artists selected by Xu Beihong, 1946" />
            <p class="photo-caption">The four artists selected by Xu Beihong in 1946. Left to right: Fei Cheng-wu, Zhang Anzhi (back), Chang Chien-ying (front), and Chen Xiaonan. Zhang and Chen returned to China after their studies, while Chang and Fei remained in Britain for the rest of their lives.</p>
          </div>

          <div class="intro-text">
            <p>Laden with parting gifts from their artist friends, they flew from China, stopping in Vietnam, India, Iraq, Greece, and France before arriving in London in October 1946.</p>

            <p>They studied at the <strong>Slade School of Art</strong>, <strong>Chelsea School of Art</strong>, the <strong>Courtauld Institute</strong>, and <strong>Camberwell School of Art</strong>. They became friends with <strong>Stanley Spencer</strong>, visiting him in Cookham and exhibiting together.</p>
          </div>

          <div class="intro-photo">
            <img src="/images/Photo 3- Registy office with Stanley Spencer.jpg"
                 alt="Wedding at Kensington and Chelsea Register Office, 1953" />
            <p class="photo-caption">Wedding at Kensington and Chelsea Register Office, May 1953. Stanley Spencer, playwright Hsiung Shih-I, and friends celebrate with the newlyweds</p>
          </div>
        </section>

        <!-- Life in London -->
        <section class="intro-section">
          <h2>Life in London</h2>
          <div class="intro-text">
            <p>As history turned, they found themselves separated permanently from their homeland. Complementary in character, outlook, and artistic style, they married in 1953 and together faced their new life as British Chinese artists.</p>

            <p>They exhibited extensively across Britain at prestigious venues including the <strong>Leicester Galleries</strong>, <strong>Tryon Gallery</strong>, <strong>Royal Academy Summer Exhibitions</strong>, <strong>Graves Art Gallery</strong> (Sheffield), <strong>Derby Museum and Art Gallery</strong>, and <strong>Scottish Lyceum Gallery</strong> (Edinburgh). Chang was elected to the <strong>Royal Institute of Painters in Watercolours</strong>.</p>
          </div>

          <div class="intro-photo">
            <img src="/images/Fei and Chang Exhibition Cards.jpg"
                 alt="Exhibition invitations" />
            <p class="photo-caption">Exhibition invitations spanning their careers in Britain</p>
          </div>

          <div class="intro-text">
            <p>Their work has a unique quality - combining a distinctly British sensibility with Chinese traditions that evolved in artistic isolation, calibrated only by the artists' own taste and judgment.</p>
          </div>

          <div class="intro-photo">
            <img src="/images/Photo 5 - Mr and Mrs Fei withPekinese.jpg"
                 alt="At home with Pekinese dog" />
            <p class="photo-caption">At home in North Finchley with their beloved Pekinese, Zhe'er, 1960s</p>
          </div>
        </section>

      </div>
    </div>
  `;
}
