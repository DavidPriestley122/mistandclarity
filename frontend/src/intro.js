import { renderNavigation, attachLangToggle } from './nav.js';
import { fetchActiveExhibition } from './api.js';
import { setPageMeta } from './utils.js';
import { t } from './i18n.js';

export async function renderIntro() {
  setPageMeta(
    'The Artists\' Story - Vermillion Pavilion',
    'From the artistic heart of wartime Chongqing to a lifetime in London. Discover the extraordinary journey of Chang Chien-ying and Fei Cheng-wu, sent to Britain by Xu Beihong in 1946.'
  );

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
          <h2>${t('intro.chongqing.heading')}</h2>
          <div class="intro-text">
            <p>${t('intro.chongqing.p1')}</p>
          </div>

          <div class="intro-photo">
            <img src="/images/Photo 1 -Chang and Fei with students and teachers -.jpg"
                 alt="Fine Arts Department, National Central University, Chongqing" />
            <p class="photo-caption">${t('intro.chongqing.caption1')}</p>
          </div>

          <div class="intro-text">
            <p>${t('intro.chongqing.p2')}</p>
          </div>

          <div class="intro-photo">
            <img src="/images/Chien-ying with Zhang Daqian, Fu Baoshi, Xu Beihong and others.jpg"
                 alt="Chang Chien-ying with masters of Chinese art" />
            <p class="photo-caption">${t('intro.chongqing.caption2')}</p>
          </div>
        </section>

        <!-- Journey to Britain -->
        <section class="intro-section">
          <h2>${t('intro.journey.heading')}</h2>
          <div class="intro-text">
            <p>${t('intro.journey.p1')}</p>
          </div>

          <div class="intro-photo">
            <img src="/images/Photo 2 - Chang and Fei as part of the 4.jpg"
                 alt="The four artists selected by Xu Beihong, 1946" />
            <p class="photo-caption">${t('intro.journey.caption1')}</p>
          </div>

          <div class="intro-text">
            <p>${t('intro.journey.p2')}</p>

            <p>${t('intro.journey.p3')}</p>
          </div>

          <div class="intro-photo">
            <img src="/images/Photo 3- Registy office with Stanley Spencer.jpg"
                 alt="Wedding at Kensington and Chelsea Register Office, 1953" />
            <p class="photo-caption">${t('intro.journey.caption2')}</p>
          </div>
        </section>

        <!-- Life in London -->
        <section class="intro-section">
          <h2>${t('intro.london.heading')}</h2>
          <div class="intro-text">
            <p>${t('intro.london.p1')}</p>

            <p>${t('intro.london.p2')}</p>
          </div>

          <div class="intro-photo">
            <img src="/images/Fei and Chang Exhibition Cards.jpg"
                 alt="Exhibition invitations" />
            <p class="photo-caption">${t('intro.london.caption1')}</p>
          </div>

          <div class="intro-text">
            <p>${t('intro.london.p3')}</p>
          </div>

          <div class="intro-photo">
            <img src="/images/Photo 5 - Mr and Mrs Fei withPekinese.jpg"
                 alt="At home with Pekinese dog" />
            <p class="photo-caption">${t('intro.london.caption2')}</p>
          </div>
        </section>

      </div>
    </div>

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "name": "Xu Beihong",
          "alternateName": ["徐悲鴻", "Ju Peon", "Hsü Pei-hung", "Hsu Pei-hung", "Beihong Xu", "Beihong"]
        },
        {
          "@type": "Person",
          "name": "Fu Baoshi",
          "alternateName": ["傅抱石"]
        },
        {
          "@type": "Person",
          "name": "Zhang Daqian",
          "alternateName": ["張大千", "Zhang Yuan", "張爰", "Chang Dai-chien", "Chang Ta-chien", "Daqian Zhang"]
        },
        {
          "@type": "Person",
          "name": "Chen Zhifo",
          "alternateName": ["陳之佛", "Xue Weng", "Xueweng", "雪翁", "Ch'en Chih-fu", "Chen Zhifu", "Chen Shaoben"]
        },
        {
          "@type": "Person",
          "name": "Zhang Anzhi",
          "alternateName": ["張安治", "Chang An-chih", "An-chih Chang"]
        },
        {
          "@type": "Person",
          "name": "Chen Xiaonan",
          "alternateName": ["陳曉南", "Chen Hsiao-nan"]
        },
        {
          "@type": "Person",
          "name": "Pang Xunqin",
          "alternateName": ["龐薰琹", "Pang Hiun-kin", "Pang Hiunkin"]
        },
        {
          "@type": "Person",
          "name": "Wu Zuoren",
          "alternateName": ["吳作人", "Wu Tso-jen"]
        },
        {
          "@type": "Person",
          "name": "Huang Junbi",
          "alternateName": ["黃君璧", "Jun-bi Huang", "Junpi Huang", "Junbi Huang"]
        },
        {
          "@type": "Person",
          "name": "Lin Fengmian",
          "alternateName": ["林風眠", "Lin Feng Mien", "Lin Feng Mian"]
        },
        {
          "@type": "Person",
          "name": "Xie Zhiliu",
          "alternateName": ["謝稚柳", "Hsieh Chih-liu"]
        },
        {
          "@type": "Person",
          "name": "Lu Fengzi",
          "alternateName": ["呂鳳子", "Lv Fengzi"]
        },
        {
          "@type": "Person",
          "name": "Zhang Shuqi",
          "alternateName": ["張書旂", "Chang Shu-chi"]
        },
        {
          "@type": "Person",
          "name": "Hsiung Shih-I",
          "alternateName": ["熊式一", "S.I. Hsiung", "Xiong Shiyi"]
        }
      ]
    }
    </script>
  `;

  attachLangToggle();
}
