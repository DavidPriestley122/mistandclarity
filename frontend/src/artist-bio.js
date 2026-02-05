import { isAdminMode, adminLink } from './admin.js';
import { renderNavigation } from './nav.js';

export function renderArtistBio(artistSlug) {
  const app = document.querySelector('#app');
  const adminMode = isAdminMode();

  const bios = {
    'chang-chien-ying': {
      name: 'Chang Chien-ying',
      nameChinese: '張蒨英',
      nameAlt: 'Zhang Qianying',
      dates: '1909-2003',
      image: '/images/ChangCYpaintingfish1.jpg',
      imageCaption: 'Chang Chien-ying at work',
      sections: [
        {
          title: 'Early Life and Education',
          content: `Chang Chien-ying was born in 1909 in Wuxi, Jiangsu province. She studied calligraphy as a child under the guidance of her father, a customs official, and her elder brother. In 1932, she entered the National Central University, studying under renowned artists Lu Fengzi (1886-1959), Zhang Shuqi (1899-1956), and Xu Beihong (1895-1953) himself.`
        },
        {
          title: 'The Chongqing Period',
          content: `During the Anti-Japanese War of Resistance (1937-1945), Chang found herself part of an extraordinary concentration of artistic talent relocated to Chongqing. She assisted Xu Beihong directly in his efforts to establish the China Institute of Fine Arts in Panxi, a suburb of Chongqing, and became the secretary and research fellow of the Institute. There she worked alongside some of the greatest names in twentieth-century Chinese art, including Fu Baoshi, Pang Xunqin, Wu Zuoren, Huang Junbi, Lin Fengmian, Chen Zhifo, and Zhang Daqian.`
        },
        {
          title: 'Journey to Britain',
          content: `In 1946, Xu Beihong selected four artists to travel to Britain to study Western art techniques, with the intention that their knowledge would encourage a new synthesis of Eastern and Western modes upon their return. Chang was one of the chosen four, along with Fei Cheng-wu, Chang An-chih, and Chen Hsiao-nan. With help from the British Council and funds from Britain's portion of the Boxer Indemnity Fund, they departed in October 1946, arriving in London after stops in Vietnam, India, Iraq, Greece, and France.`
        },
        {
          title: 'Life in London',
          content: `Chang enrolled at Chelsea School of Art and later at the Slade School of Art, where she studied from 1947 to 1950. She also studied ceramics under Dora Billington at the Central School of Arts and Crafts. In 1947, when funding dried up, she and Fei held a joint exhibition. Professor Randolph Schwabe, Director of the Slade, visited and offered them places at the school.

During this period, Chang became friends with Stanley Spencer, visiting him in Cookham. On August 28, 1947, in an unusual exchange, Spencer drew a portrait of Chang while Fei drew a portrait of him, which Spencer countersigned.`
        },
        {
          title: 'Marriage and Career',
          content: `In May 1953, Chang married Fei Cheng-wu at the Kensington and Chelsea Register Office, with Stanley Spencer and playwright Hsiung Shih-I among those in attendance. The years that followed were productive, with a full schedule of exhibitions throughout Britain.

Chang was elected to be a member of the Royal Institute of Painters in Watercolours, the Women's International Art Club, and The Society of Woman Artists. She was a regular contributor to the Summer Exhibition of the Royal Academy of Arts, London. Her work was exhibited at prestigious venues including the Leicester Galleries and Tryon Gallery in London, the Graves Art Gallery in Sheffield, Derby Museum and Art Gallery, the Royal West of England Academy in Bristol, and the Scottish Lyceum Gallery in Edinburgh.`
        },
        {
          title: 'Travels and Influences',
          content: `True to their belief in the value of observation, Chang and Fei travelled extensively around Great Britain. In the early years, they visited Oxford (1947) and the counties around London. Later, they ventured further, sketching and painting in the West Country (1950), the Lake District (1956), Scotland (1958), and Wales (1959).`
        },
        {
          title: 'Later Life',
          content: `Chang and Fei lived much of the latter part of their lives in North Finchley, at the centre of the north London Chinese community. Chang's social talents were almost as remarkable as her artistic ones, whether taking part in amateur Chinese opera, playing mahjong, cooking great feasts, or holding her guests spellbound with her wit and charm. There was a continuous traffic of friends from China, Taiwan, America, and other parts of the world passing through.

In the 1960s, a constant companion was their Pekinese dog, Zhe'er, whose portrait they enjoyed painting. In 1982, Chang's great-niece Zhang Nong came from Shanghai to live with them and, towards the end of their lives, care for them.

Chang never saw China again until 2001, more than fifty years after leaving, when she made a brief visit to her remaining family in Shanghai. She died in 2003, three years after her husband.`
        }
      ],
      studioName: '霧明樓 (Wuming Lou - "Mist and Clarity")'
    },
    'fei-cheng-wu': {
      name: 'Fei Cheng-wu',
      nameChinese: '費成武',
      nameAlt: 'Fei Chengwu',
      dates: '1911-2000',
      image: '/images/FeiCWpainting1.jpg',
      imageCaption: 'Fei Cheng-wu at work',
      sections: [
        {
          title: 'Early Life and Education',
          content: `Fei Cheng-wu was born in 1911 in Wujiang, Jiangsu province, into an accomplished family of politicians, architects, and academics. His uncle, Cy Young (Yang Xizhi, 1897-1964), was one of the first generation of animators in China, eventually moving to America and working for Disney, most notably on Snow White and the Seven Dwarfs.

Fei's first contact with Xu Beihong came in 1928 when he attended a talk given by the artist at the Suzhou Academy of Fine Arts. This inspired him to write "A Summary of Western Schools of Painting" in his school journal. In 1930, he entered the Art Specialty Department of the National Central University in Nanjing, where Xu Beihong served as Director of the Western Painting section. His classmates included artists who would play important parts in his life, including Chang An-chih, Chen Hsiao-nan, Sun Duoci, and especially Chang Chien-ying. In 1935, he entered the Suzhou Academy of Fine Arts and studied oil painting under Yan Wenliang (1893-1988), one of the "fathers of Chinese oil painting."`
        },
        {
          title: 'The Chongqing Period',
          content: `During the Anti-Japanese War of Resistance, Fei was responsible for mobilizing artists to produce propaganda supporting the war effort. In 1941, he travelled to Kunming to prepare a guest house for the American Volunteer Group of the air force. It was in Kunming in 1942 that he met by chance his former tutor Xu Beihong, who persuaded him to return to Chongqing and work for the Fine Arts Department of the National Central University, which had also relocated there. Fei accepted, taking up the post of lecturer under head of department Lü Sibai (1905-1973).

In 1944, Fei participated in the first exhibition of the China Institute of Fine Arts in Chongqing. In May 1945, indicating an early admiration that would last his whole life, he penned an article entitled "Miss Chang Chien-ying, a warrior in the art world" for Chang Chien-ying's first solo exhibition.`
        },
        {
          title: 'Mission to Britain',
          content: `In 1946, with the coming of victory, Xu Beihong—now principal of the National Beiping Art College—was convinced that Chinese artists could learn from the West, particularly in methods of working from observation. Through his relationship with the Education Minister and assisted by the British Council, he selected four artists to travel to Britain. Fei was one of the chosen four.

In London, Fei studied at the Courtauld Institute of Art, University of London, and at Camberwell School of Art, while Chang enrolled at Chelsea School of Art. In 1947, Professor Randolph Schwabe, Director of the Slade School of Art, visited their joint exhibition and offered them places at the school, where they stayed until 1950.

During this period, Fei became friends with Stanley Spencer. They visited him in Cookham in 1947, and on one unusual occasion—August 28, 1947—Spencer drew a portrait of Chang while Fei drew a portrait of Spencer, which Spencer countersigned. In addition to their work in fine art, Fei also studied ceramics under Dora Billington at the Central School of Arts and Crafts.`
        },
        {
          title: 'Remaining in Britain',
          content: `In January 1950, Fei and Chang held a joint exhibition at Barrow's in Birmingham with their colleagues Chang An-chih and Chen Hsiao-nan. It was to be their last showing together—the other two returned to a China now under Communist government. Fei and Chang planned to return too, with departure scheduled for February 19, but Fei fell seriously ill and was unable to make the embarkation. Over the following period, Xu Beihong made repeated entreaties for them to return, but they made no further plans. As it turned out, Fei never saw China again.`
        },
        {
          title: 'Marriage and Career',
          content: `In May 1953, Fei and Chang were married at the Kensington and Chelsea Register Office, with Stanley Spencer and their friend the playwright Hsiung Shih-I among those in attendance. The years that followed were productive, with exhibitions at venues throughout Britain including the Leicester Galleries and Tryon Gallery in London, and galleries in Sheffield, Derby, Bristol, and Edinburgh.

In 1956, Fei authored a book, "Brush Drawing in the Chinese Manner" (The Studio Publications, London & New York), on the history and techniques of Chinese paintings. He was a regular contributor to the Summer Exhibition of the Royal Academy of Arts, London. Institutional collectors of their work included the Percival David Foundation, St Johns College Oxford, and the Ashmolean Museum, while among private collectors was the noted connoisseur W. W. Winkworth.`
        },
        {
          title: 'Later Life',
          content: `Fei was quieter than Chang, with a scholarly demeanour, and was for many years the first person to turn to for an opinion on the authenticity of old Chinese paintings. In the 1960s, a constant companion was their Pekinese dog, Zhe'er, whose portrait Fei particularly enjoyed painting.

They took students and occasionally executed commissions, usually for friends. Fei and Chang lived complementary lives—she with her vivacious social talents, he with his quiet scholarship—both dedicated to their art and to bringing understanding of Chinese painting to British audiences.

Fei died in 2000. Chang survived him by three years, dying in 2003.`
        }
      ],
      studioName: '霧明樓 (Wuming Lou - "Mist and Clarity")'
    }
  };

  const bio = bios[artistSlug];

  if (!bio) {
    app.innerHTML = `
      ${renderNavigation()}
      <div class="container">
        <div class="error">Artist biography not found.</div>
      </div>
    `;
    return;
  }

  const backLink = adminMode ? adminLink('/gallery') : '/';
  const artistId = artistSlug === 'chang-chien-ying' ? '2' : '1';
  const paintingsLink = adminMode
    ? `/gallery?artist_id=${artistId}&admin=true`
    : `/gallery?artist_id=${artistId}`;

  app.innerHTML = `
    ${renderNavigation()}
    <div class="container">
      <div class="back-link">
        <a href="${backLink}" data-link>← Back to ${adminMode ? 'Storage' : 'Home'}</a>
      </div>

      <div class="artist-bio">
        <header class="bio-header">
          <h1>${bio.name}</h1>
          <p class="chinese-name">${bio.nameChinese} (${bio.nameAlt})</p>
          <p class="dates">${bio.dates}</p>
        </header>

        ${bio.image ? `
          <div class="bio-image">
            <img src="${bio.image}" alt="${bio.imageCaption}" />
            <p class="bio-image-caption">${bio.imageCaption}</p>
          </div>
        ` : ''}

        <div class="bio-content">
          ${bio.sections.map(section => `
            <section class="bio-section">
              <h2>${section.title}</h2>
              <p>${section.content}</p>
            </section>
          `).join('')}
        </div>

        <div class="bio-footer">
          <a href="${paintingsLink}" data-link class="btn">
            View ${bio.name.split(' ')[0]}'s Paintings
          </a>
        </div>
      </div>
    </div>
  `;
}
