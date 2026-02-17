import { renderNavigation, attachLangToggle } from './nav.js';
import { setPageMeta } from './utils.js';
import { t, getLang } from './i18n.js';

export function renderArtistBio(artistSlug) {
  const app = document.querySelector('#app');

  const bios = {
    'chang-chien-ying': {
      name: 'Chang Chien-ying',
      nameChinese: '張蒨英',
      nameAlt: 'Zhang Qianying',
      nameVariants: ['Chien-ying Chang', 'Ch\'ien-ying Chang', 'Zhang Qianying'],
      dates: '1909-2003',
      image: '/images/ChangCYpaintingfish1.jpg',
      imageCaption: 'Chang Chien-ying at work',
      imageCaption_zh: '張蒨英創作中',
      sections: [
        {
          title: 'Early Life and Education',
          title_zh: '早年生活與教育',
          content: `Chang Chien-ying was born in 1909 in Wuxi, Jiangsu province. She studied calligraphy as a child under the guidance of her father, a customs official, and her elder brother. In 1932, she entered the National Central University, studying under renowned artists Lu Fengzi (1886-1959), Zhang Shuqi (1899-1956), and Xu Beihong (1895-1953) himself.`,
          content_zh: `張蒨英1909年生於江蘇省無錫。幼時隨父親（海關官員）及兄長習書法。1932年考入國立中央大學，師從著名藝術家呂鳳子（1886-1959）、張書旂（1899-1956）及徐悲鴻（1895-1953）。`
        },
        {
          title: 'The Chongqing Period',
          title_zh: '重慶時期',
          content: `During the Anti-Japanese War of Resistance (1937-1945), Chang found herself part of an extraordinary concentration of artistic talent relocated to Chongqing. She assisted Xu Beihong directly in his efforts to establish the China Institute of Fine Arts in Panxi, a suburb of Chongqing, and became the secretary and research fellow of the Institute. There she worked alongside some of the greatest names in twentieth-century Chinese art, including Fu Baoshi, Pang Xunqin, Wu Zuoren, Huang Junbi, Lin Fengmian, Chen Zhifo, and Zhang Daqian.`,
          content_zh: `抗日戰爭（1937-1945）期間，張蒨英置身於遷居重慶的卓越藝術人才聚集地。她直接協助徐悲鴻在重慶郊區磐溪籌建中國美術學院，擔任學院秘書及研究員。在此期間，她與二十世紀中國藝術史上的諸多泰斗並肩工作，包括傅抱石、龐薰琹、吳作人、黃君璧、林風眠、陳之佛及張大千。`
        },
        {
          title: 'Journey to Britain',
          title_zh: '赴英之旅',
          content: `In 1946, Xu Beihong selected four artists to travel to Britain to study Western art techniques, with the intention that their knowledge would encourage a new synthesis of Eastern and Western modes upon their return. Chang was one of the chosen four, along with Fei Cheng-wu, Chang An-chih, and Chen Hsiao-nan. With help from the British Council and funds from Britain's portion of the Boxer Indemnity Fund, they departed in October 1946, arriving in London after stops in Vietnam, India, Iraq, Greece, and France.`,
          content_zh: `1946年，徐悲鴻選派四位藝術家赴英學習西方藝術技法，期望他們學成歸國後推動東西方藝術的新融合。張蒨英與費成武、張安治、陳曉南同為入選之人。在英國文化協會資助及庚子賠款英國份額的支持下，他們於1946年10月出發，途經越南、印度、伊拉克、希臘及法國，抵達倫敦。`
        },
        {
          title: 'Life in London',
          title_zh: '倫敦生活',
          content: `Chang enrolled at Chelsea School of Art and later at the Slade School of Art, where she studied from 1947 to 1950. She also studied ceramics under Dora Billington at the Central School of Arts and Crafts. In 1947, when funding dried up, she and Fei held a joint exhibition. Professor Randolph Schwabe, Director of the Slade, visited and offered them places at the school.

During this period, Chang became friends with Stanley Spencer, visiting him in Cookham. On August 28, 1947, in an unusual exchange, Spencer drew a portrait of Chang while Fei drew a portrait of him, which Spencer countersigned.`,
          content_zh: `張蒨英先就讀於切爾西藝術學院，後轉入斯萊德藝術學院，在那裡學習至1950年。她亦在中央藝術與工藝學院師從朵拉·比靈頓學習陶瓷。1947年，資助告罄之際，她與費成武聯合舉辦了一場畫展。斯萊德學院院長藍道夫·施瓦伯教授親臨觀展後，邀請二人入讀該學院。

在此期間，張蒨英與史丹利·史賓塞結為摯友，曾赴科亨拜訪。1947年8月28日，一次難忘的交流中，史賓塞為張蒨英畫像，費成武為史賓塞畫像，史賓塞更在後者上親筆簽名留念。`
        },
        {
          title: 'Marriage and Career',
          title_zh: '婚姻與事業',
          content: `In May 1953, Chang married Fei Cheng-wu at the Kensington and Chelsea Register Office, with Stanley Spencer and playwright Hsiung Shih-I among those in attendance. The years that followed were productive, with a full schedule of exhibitions throughout Britain.

Chang was elected to be a member of the Royal Institute of Painters in Watercolours, the Women's International Art Club, and The Society of Woman Artists. She was a regular contributor to the Summer Exhibition of the Royal Academy of Arts, London. Her work was exhibited at prestigious venues including the Leicester Galleries and Tryon Gallery in London, the Graves Art Gallery in Sheffield, Derby Museum and Art Gallery, the Royal West of England Academy in Bristol, and the Scottish Lyceum Gallery in Edinburgh.`,
          content_zh: `1953年5月，張蒨英與費成武在肯辛頓與切爾西登記處完婚，史丹利·史賓塞及劇作家熊式一等人到場道賀。此後數年創作豐盛，展覽行程遍及英國各地。

張蒨英當選英國皇家水彩畫學會、國際女性藝術俱樂部及女性藝術家學會會員，並長期參加倫敦英國皇家藝術學院夏季展。她的作品陳列於多個著名展館，包括倫敦萊斯特畫廊及特萊恩畫廊、謝菲爾德格雷夫斯美術館、德比博物館暨美術館、布里斯托爾英國西部皇家藝術學院及愛丁堡蘇格蘭萊西恩畫廊。`
        },
        {
          title: 'Travels and Influences',
          title_zh: '旅行與影響',
          content: `True to their belief in the value of observation, Chang and Fei travelled extensively around Great Britain. In the early years, they visited Oxford (1947) and the counties around London. Later, they ventured further, sketching and painting in the West Country (1950), the Lake District (1956), Scotland (1958), and Wales (1959).`,
          content_zh: `秉持對觀察寫生的一貫信念，張蒨英與費成武足跡遍及英國各地。早年他們曾赴牛津（1947年）及倫敦周邊各郡寫生；後來走得更遠，先後在西部地區（1950年）、湖區（1956年）、蘇格蘭（1958年）及威爾斯（1959年）揮毫寫景。`
        },
        {
          title: 'Later Life',
          title_zh: '晚年',
          content: `Chang and Fei lived much of the latter part of their lives in North Finchley, at the centre of the north London Chinese community. Chang's social talents were almost as remarkable as her artistic ones, whether taking part in amateur Chinese opera, playing mahjong, cooking great feasts, or holding her guests spellbound with her wit and charm. There was a continuous traffic of friends from China, Taiwan, America, and other parts of the world passing through.

In the 1960s, a constant companion was their Pekinese dog, Zhe'er, whose portrait they enjoyed painting. In 1982, Chang's great-niece Zhang Nong came from Shanghai to live with them and, towards the end of their lives, care for them.

Chang never saw China again until 2001, more than fifty years after leaving, when she made a brief visit to her remaining family in Shanghai. She died in 2003, three years after her husband.`,
          content_zh: `張蒨英與費成武晚年大部分時間居住在北芬奇利，那裡是倫敦北部華人社區的中心。張蒨英的社交才華幾乎不遜於她的藝術造詣——無論是參加業餘粵劇、打麻將、烹調大宴，還是以機智幽默令賓客如癡如醉，她無不游刃有餘。來自中國、台灣、美國及世界各地的友人絡繹不絕。

1960年代，北京犬者兒是他們的忠實伴侶，二人樂於為它寫真。1982年，張蒨英的姪孫女張農從上海來到倫敦與他們同住，並在他們暮年給予悉心照料。

離開中國逾五十年後，張蒨英直至2001年才得以重返故土，短暫探望了留在上海的家人。她於2003年辭世，比丈夫晚三年。`
        }
      ],
      studioName: '霧明樓 (Wuming Lou - "Mist and Clarity")'
    },
    'fei-cheng-wu': {
      name: 'Fei Cheng-wu',
      nameChinese: '費成武',
      nameAlt: 'Fei Chengwu',
      nameVariants: ['Cheng-wu Fei', 'Ch\'eng-wu Fei', 'Fei Chengwu'],
      dates: '1911-2000',
      image: '/images/FeiCWpainting1.jpg',
      imageCaption: 'Fei Cheng-wu at work',
      imageCaption_zh: '費成武創作中',
      sections: [
        {
          title: 'Early Life and Education',
          title_zh: '早年生活與教育',
          content: `Fei Cheng-wu was born in 1911 in Wujiang, Jiangsu province, into an accomplished family of politicians, architects, and academics. His uncle, Cy Young (Yang Xizhi, 1897-1964), was one of the first generation of animators in China, eventually moving to America and working for Disney, most notably on Snow White and the Seven Dwarfs.

Fei's first contact with Xu Beihong came in 1928 when he attended a talk given by the artist at the Suzhou Academy of Fine Arts. This inspired him to write "A Summary of Western Schools of Painting" in his school journal. In 1930, he entered the Art Specialty Department of the National Central University in Nanjing, where Xu Beihong served as Director of the Western Painting section. His classmates included artists who would play important parts in his life, including Chang An-chih, Chen Hsiao-nan, Sun Duoci, and especially Chang Chien-ying. In 1935, he entered the Suzhou Academy of Fine Arts and studied oil painting under Yan Wenliang (1893-1988), one of the "fathers of Chinese oil painting."`,
          content_zh: `費成武1911年生於江蘇省吳江，出身書香門第，家族中政界、建築界及學術界人才輩出。其叔父楊希治（英文名Cy Young，1897-1964）是中國第一代動畫師之一，後移居美國，任職迪士尼，最廣為人知的貢獻是參與製作《白雪公主與七個小矮人》。

費成武與徐悲鴻的初次邂逅發生在1928年，彼時他在蘇州美術專科學校聽了這位藝術家的一場演講，深受啟發，隨即在校刊上撰文《西方繪畫流派概述》。1930年，他考入南京國立中央大學藝術系，徐悲鴻任西洋畫部主任。同學中有數位日後對他影響深遠的人物，包括張安治、陳曉南、孫多慈，尤其是張蒨英。1935年，他進入蘇州美術專科學校，師從「中國油畫之父」之一顏文樑（1893-1988）學習油畫。`
        },
        {
          title: 'The Chongqing Period',
          title_zh: '重慶時期',
          content: `During the Anti-Japanese War of Resistance, Fei was responsible for mobilizing artists to produce propaganda supporting the war effort. In 1941, he travelled to Kunming to prepare a guest house for the American Volunteer Group of the air force. It was in Kunming in 1942 that he met by chance his former tutor Xu Beihong, who persuaded him to return to Chongqing and work for the Fine Arts Department of the National Central University, which had also relocated there. Fei accepted, taking up the post of lecturer under head of department Lü Sibai (1905-1973).

In 1944, Fei participated in the first exhibition of the China Institute of Fine Arts in Chongqing. In May 1945, indicating an early admiration that would last his whole life, he penned an article entitled "Miss Chang Chien-ying, a warrior in the art world" for Chang Chien-ying's first solo exhibition.`,
          content_zh: `抗日戰爭期間，費成武負責動員藝術家創作支援抗戰的宣傳作品。1941年，他赴昆明為美國空軍志願隊籌備招待所。1942年在昆明，他與昔日恩師徐悲鴻不期而遇，徐悲鴻力勸他返回重慶，加入同樣遷址於此的國立中央大學藝術系，費成武欣然應允，出任系主任呂斯百（1905-1973）麾下的講師。

1944年，費成武參加了重慶中國美術學院的首屆展覽。1945年5月，他在張蒨英首次個展之際撰文《藝壇女戰士張蒨英》，字裡行間流露出對她終身不渝的欽慕之情。`
        },
        {
          title: 'Mission to Britain',
          title_zh: '使命赴英',
          content: `In 1946, with the coming of victory, Xu Beihong—now principal of the National Beiping Art College—was convinced that Chinese artists could learn from the West, particularly in methods of working from observation. Through his relationship with the Education Minister and assisted by the British Council, he selected four artists to travel to Britain. Fei was one of the chosen four.

In London, Fei studied at the Courtauld Institute of Art, University of London, and at Camberwell School of Art, while Chang enrolled at Chelsea School of Art. In 1947, Professor Randolph Schwabe, Director of the Slade School of Art, visited their joint exhibition and offered them places at the school, where they stayed until 1950.

During this period, Fei became friends with Stanley Spencer. They visited him in Cookham in 1947, and on one unusual occasion—August 28, 1947—Spencer drew a portrait of Chang while Fei drew a portrait of Spencer, which Spencer countersigned. In addition to their work in fine art, Fei also studied ceramics under Dora Billington at the Central School of Arts and Crafts.`,
          content_zh: `1946年，抗戰勝利之際，時任國立北平藝術學院院長的徐悲鴻深信中國藝術家可向西方取經，尤其是觀察寫生的方法。他透過與教育部長的關係，並借助英國文化協會的支持，選派了四位藝術家赴英。費成武正是其中之一。

在倫敦，費成武先後就讀於倫敦大學考陶爾德藝術學院及坎伯韋爾藝術學院，張蒨英則就讀於切爾西藝術學院。1947年，斯萊德藝術學院院長藍道夫·施瓦伯教授參觀了他們的聯展後，邀請二人入讀該學院，他們在此學習至1950年。

這一時期，費成武與史丹利·史賓塞結為摯友。1947年，他們前往科亨拜訪史賓塞；同年8月28日，史賓塞為張蒨英繪像，費成武為史賓塞繪像，史賓塞更在費氏所作的畫像上親筆簽名。此外，費成武還在中央藝術與工藝學院師從朵拉·比靈頓學習陶瓷。`
        },
        {
          title: 'Remaining in Britain',
          title_zh: '留居英國',
          content: `In January 1950, Fei and Chang held a joint exhibition at Barrow's in Birmingham with their colleagues Chang An-chih and Chen Hsiao-nan. It was to be their last showing together—the other two returned to a China now under Communist government. Fei and Chang planned to return too, with departure scheduled for February 19, but Fei fell seriously ill and was unable to make the embarkation. Over the following period, Xu Beihong made repeated entreaties for them to return, but they made no further plans. As it turned out, Fei never saw China again.`,
          content_zh: `1950年1月，費成武與張蒨英偕同窗張安治、陳曉南在伯明罕巴羅畫廊舉辦了最後一次聯展。此後張安治與陳曉南返回了已易幟的新中國，而費成武與張蒨英亦曾計劃於2月19日啟程回國，卻因費成武突發重病、無法成行。此後，徐悲鴻多次懇切呼喚他們回國，但二人再未作任何歸國安排。費成武就此與祖國永別。`
        },
        {
          title: 'Marriage and Career',
          title_zh: '婚姻與事業',
          content: `In May 1953, Fei and Chang were married at the Kensington and Chelsea Register Office, with Stanley Spencer and their friend the playwright Hsiung Shih-I among those in attendance. The years that followed were productive, with exhibitions at venues throughout Britain including the Leicester Galleries and Tryon Gallery in London, and galleries in Sheffield, Derby, Bristol, and Edinburgh.

In 1956, Fei authored a book, "Brush Drawing in the Chinese Manner" (The Studio Publications, London & New York), on the history and techniques of Chinese paintings. He was a regular contributor to the Summer Exhibition of the Royal Academy of Arts, London. Institutional collectors of their work included the Percival David Foundation, St Johns College Oxford, and the Ashmolean Museum, while among private collectors was the noted connoisseur W. W. Winkworth.`,
          content_zh: `1953年5月，費成武與張蒨英在肯辛頓與切爾西登記處完婚，史丹利·史賓塞及老友劇作家熊式一等人到場共賀。此後數年，二人創作豐盛，展覽遍及英國各地，包括倫敦的萊斯特畫廊及特萊恩畫廊，以及謝菲爾德、德比、布里斯托爾和愛丁堡的各大畫廊。

1956年，費成武著《中國畫法》（The Studio Publications，倫敦及紐約出版），系統介紹中國畫的歷史與技法。他是倫敦英國皇家藝術學院夏季展的常客。收藏其作品的機構包括大維德基金會、牛津大學聖約翰學院及阿什莫林博物館，私人藏家中亦有著名鑑藏家W. W. 溫克沃思。`
        },
        {
          title: 'Later Life',
          title_zh: '晚年',
          content: `Fei was quieter than Chang, with a scholarly demeanour, and was for many years the first person to turn to for an opinion on the authenticity of old Chinese paintings. In the 1960s, a constant companion was their Pekinese dog, Zhe'er, whose portrait Fei particularly enjoyed painting.

They took students and occasionally executed commissions, usually for friends. Fei and Chang lived complementary lives—she with her vivacious social talents, he with his quiet scholarship—both dedicated to their art and to bringing understanding of Chinese painting to British audiences.

Fei died in 2000. Chang survived him by three years, dying in 2003.`,
          content_zh: `費成武性情恬靜，學者風範，多年來是鑑定中國古畫真偽的首要諮詢對象。1960年代，北京犬者兒是他們的忠實伴侶，費成武尤其喜歡為它寫真。

二人偶爾收徒，也接受好友的委託創作。費成武與張蒨英相輔相成——她熱情洋溢，交遊廣闊；他潛心學問，默默耕耘——二人同心致力於藝術創作，並將中國繪畫的美學傳遞給英國觀眾。

費成武於2000年辭世，張蒨英在三年後的2003年隨他而去。`
        }
      ],
      studioName: '霧明樓 (Wuming Lou - "Mist and Clarity")'
    }
  };

  const bio = bios[artistSlug];

  if (!bio) {
    setPageMeta(
      'Artist Not Found - Vermillion Pavilion',
      'Artist biography not found.'
    );
    app.innerHTML = `
      ${renderNavigation()}
      <div class="container">
        <div class="error">${t('bio.notFound')}</div>
      </div>
    `;
    attachLangToggle();
    return;
  }

  // Set page meta with artist details
  setPageMeta(
    `${bio.name} (${bio.dates}) - Vermillion Pavilion`,
    `Biography of ${bio.name} (${bio.nameChinese}), ${bio.dates}. ${bio.sections[0].content.substring(0, 150)}...`
  );

  // Generate Schema.org structured data for the artist
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": bio.name,
    "alternateName": [bio.nameChinese, ...bio.nameVariants],
    "birthDate": bio.dates.split('-')[0],
    "deathDate": bio.dates.split('-')[1],
    "jobTitle": "Artist",
    "nationality": "Chinese",
    "knowsAbout": ["Chinese painting", "Watercolor", "Oil painting"]
  };

  const isZh = getLang() === 'zh';

  app.innerHTML = `
    ${renderNavigation()}
    <div class="container">
      <div class="back-link">
        <a href="/artists" data-link>${t('bio.backToArtists')}</a>
      </div>
      <div class="artist-bio">
        <header class="bio-header">
          <h1>${bio.name}</h1>
          <p class="chinese-name">${bio.nameChinese} (${bio.nameAlt})</p>
          <p class="dates">${bio.dates}</p>
          ${bio.nameVariants && bio.nameVariants.length > 0 ? `
            <p class="name-variants">${t('bio.alsoKnownAs')} ${bio.nameVariants.join(', ')}</p>
          ` : ''}
        </header>

        ${bio.image ? `
          <div class="bio-image">
            <img src="${bio.image}" alt="${isZh ? bio.imageCaption_zh : bio.imageCaption}" />
            <p class="bio-image-caption">${isZh ? bio.imageCaption_zh : bio.imageCaption}</p>
          </div>
        ` : ''}

        <div class="bio-content">
          ${bio.sections.map(section => `
            <section class="bio-section">
              <h2>${isZh ? section.title_zh : section.title}</h2>
              <p>${isZh ? section.content_zh : section.content}</p>
            </section>
          `).join('')}
        </div>
      </div>
    </div>

    <script type="application/ld+json">
    ${JSON.stringify(schemaData, null, 2)}
    </script>
  `;

  attachLangToggle();
}
