(() => {
  const runtime = window.LudwigLanguage || null;
  const cipherRuntime = window.LudwigCipherMode || null;
  const getLang = () => (runtime && typeof runtime.getCurrentLang === 'function'
    ? runtime.getCurrentLang()
    : 'en');
  const isCipherMode = () => (cipherRuntime && typeof cipherRuntime.isEnabled === 'function'
    ? cipherRuntime.isEnabled()
    : document.documentElement.classList.contains('cipher-mode'));

  const page = String(document.body.getAttribute('data-i18n-page') || '').trim();

  const bundles = {
    common: {
      title: {},
      entries: [
        { selector: '#homeDropdown', text: { en: 'Home', 'zh-Hant': '首頁', 'zh-Hans': '首页' } },
        { selector: 'a[href$="index.html#about"]', text: { en: 'About', 'zh-Hant': '關於我', 'zh-Hans': '关于我' } },
        { selector: '[data-nav-skills]', text: { en: 'Skills', 'zh-Hant': '技能樹', 'zh-Hans': '技能树' } },
        { selector: '[data-nav-credentials]', text: { en: 'Credentials', 'zh-Hant': '榮譽與憑證', 'zh-Hans': '荣誉与凭证' } },
        { selector: '[data-nav-timeline]', text: { en: 'Timeline', 'zh-Hant': 'Timeline', 'zh-Hans': 'Timeline' }, cipherText: { en: 'Chronology', 'zh-Hant': 'Chronology', 'zh-Hans': 'Chronology' } },
        { selector: 'a[href$="index.html#contact"]', text: { en: 'Contact', 'zh-Hant': '聯絡方式', 'zh-Hans': '联系方式' } },
        { selector: '#projectsDropdown', text: { en: 'Projects', 'zh-Hant': '專案', 'zh-Hans': '项目' } },
        { selector: 'a[href$="notes/index.html"]', text: { en: 'Notes', 'zh-Hant': '筆記', 'zh-Hans': '笔记' }, cipherText: { en: 'Notes', 'zh-Hant': '日知', 'zh-Hans': '日知' } },
        { selector: 'a[href$="writing/index.html"]', text: { en: 'Writing', 'zh-Hant': '文章', 'zh-Hans': '文章' }, cipherText: { en: 'Writing', 'zh-Hant': '求音', 'zh-Hans': '求音' } },
        { selector: 'a[href$="canvas/index.html"]', text: { en: 'Canvas', 'zh-Hant': '圖廊', 'zh-Hans': '图廊' }, cipherText: { en: 'Canvas', 'zh-Hant': '視界', 'zh-Hans': '视界' } },
        { selector: 'a[href$="search.html"]', attr: 'aria-label', text: { en: 'Search', 'zh-Hant': '搜尋', 'zh-Hans': '搜索' } },
        { selector: 'a[href$="search.html"]', attr: 'title', text: { en: 'Search', 'zh-Hant': '搜尋', 'zh-Hans': '搜索' } },
        { selector: 'a[href$="search.html"] .visually-hidden', text: { en: 'Search', 'zh-Hant': '搜尋', 'zh-Hans': '搜索' } },
        { selector: 'a[href$="settings.html"]', attr: 'aria-label', text: { en: 'Settings', 'zh-Hant': '設定', 'zh-Hans': '设置' } },
        { selector: 'a[href$="settings.html"]', attr: 'title', text: { en: 'Settings', 'zh-Hant': '設定', 'zh-Hans': '设置' } },
        { selector: 'a[href$="settings.html"] .visually-hidden', text: { en: 'Settings', 'zh-Hant': '設定', 'zh-Hans': '设置' } },
        { selector: 'footer p', text: { en: '© 2025 Ludwig — All Rights Reserved', 'zh-Hant': '© 2025 Ludwig — 保留所有權利', 'zh-Hans': '© 2025 Ludwig — 保留所有权利' } },
      ],
    },
    contentPage: {
      title: {},
      entries: [
        { selector: '.mobile-note-nav-btn-left', attr: 'aria-label', text: { en: 'Open outline', 'zh-Hant': '開啟大綱', 'zh-Hans': '打开大纲' } },
        { selector: '.mobile-note-nav-btn-left', attr: 'title', text: { en: 'Outline', 'zh-Hant': '大綱', 'zh-Hans': '大纲' } },
        { selector: '.mobile-note-nav-btn-left .visually-hidden', text: { en: 'Outline', 'zh-Hant': '大綱', 'zh-Hans': '大纲' } },
        { selector: '.mobile-note-nav-btn-right', attr: 'aria-label', text: { en: 'Open metadata', 'zh-Hant': '開啟資訊', 'zh-Hans': '打开信息' } },
        { selector: '.mobile-note-nav-btn-right', attr: 'title', text: { en: 'Metadata', 'zh-Hant': '資訊', 'zh-Hans': '信息' } },
        { selector: '.mobile-note-nav-btn-right .visually-hidden', text: { en: 'Metadata', 'zh-Hant': '資訊', 'zh-Hans': '信息' } },
      ],
    },
    home: {
      title: {
        en: 'Ludwig — A passionate gamer of Earth Online',
        'zh-Hant': 'Ludwig — 一個熱衷於探索地球 Online 的初級玩家',
        'zh-Hans': 'Ludwig — 一个热衷于探索地球 Online 的初级玩家',
      },
      entries: [
        { selector: '.hero-text h1', text: { en: "Hi, I'm Ludwig", 'zh-Hant': '嗨你好，我叫健宏', 'zh-Hans': '嗨你好，我叫健宏' } },
        { selector: '.hero-text p', text: { en: 'An engineer who stays curious about Earth Online.', 'zh-Hant': '是一名對地球 Online 始終保持好奇的工程師', 'zh-Hans': '是一名对地球 Online 始终保持好奇的工程师' } },
        { selector: '#about h2', text: { en: 'About Me', 'zh-Hant': '關於我', 'zh-Hans': '关于我' } },
        { selector: '#about [data-about-copy]', html: {
          en: '<p class="page-text">Right now, my main focus is on machine learning and deep learning, alongside software development and distributed systems. Lately, I&apos;ve also been diving into networking and cloud architecture. It might sound like I&apos;m trying to take on too much, but to borrow Steve Jobs&apos; words: "Stay hungry, stay foolish." For me, it&apos;s simply about chasing what I genuinely love.</p><p class="page-text">The tech world feels like an endless treasure hunt. There&apos;s always a new problem to solve or a fresh perspective to discover. Of course, the sheer amount of information can be overwhelming at times, but that feeling when you finally grasp a tough concept or fix a complex bug? That is exactly why I keep falling in love with this field over and over again.</p><p class="page-text">Beyond tech, I&apos;m deeply curious about a variety of subjects, including biology, physics, history, and current affairs. I really enjoy the collision of ideas across different disciplines. It often provides a completely new lens through which to understand the world.</p><p class="page-text">Outside of work, my lifestyle is pretty dynamic. I love watching baseball and esports, playing basketball, and staying active through fitness and swimming. I&apos;m also a big fan of anime, TV series, and gaming. On top of that, I&apos;m planning to challenge myself with drawing soon, and I&apos;m looking to pick up the piano again after letting it slide for a while.</p><p class="page-text">If you&apos;re also curious about the world or feel like we&apos;re on the same wavelength, definitely feel free to reach out. I&apos;d love to connect!</p>',
          'zh-Hant': '<p class="page-text">目前我主要專注於機器學習、深度學習的理論與應用，以及軟體開發與分散式系統；未來也期待能持續深入探索網路與雲端架構。</p><p class="page-text">我是真的很喜歡資訊領域，我覺得它最迷人的地方，就在於它是一座永遠挖不完的寶庫，總是藏著新的問題、觀點與可能性。雖然有時不免被龐大的資訊量淹沒而感到疲憊，但每當真正弄懂一個新概念、解開一個複雜問題時，那種無與倫比的成就感，總能讓我再次愛上這個領域。</p><p class="page-text">除了資訊領域，我也對生物、物理、歷史、人文及時事抱持濃厚興趣。我很喜歡跨領域的知識碰撞，因為它們總會在意想不到的地方產生連結，帶給我更完整的視角來理解這個世界。</p><p class="page-text">在工作與學習之外，我的生活也相當靈活多元。平常我喜歡看棒球、看電競、打籃球，也透過健身和游泳保持活力；同時，我也是動漫、影集和遊戲的愛好者。最近甚至正雄心壯志地計畫挑戰畫畫，並想把放下一陣子的鋼琴重新練回來。</p><p class="page-text">如果你也對世界充滿好奇，或者剛好與我有相似的頻率，非常歡迎找我交流，也許我們會非常聊得來！</p>',
          'zh-Hans': '<p class="page-text">目前我主要专注于机器学习、深度学习的理论与应用，以及软件开发与分布式系统；未来也期待能持续深入探索网络与云端架构。</p><p class="page-text">我是真的很喜欢信息领域，我觉得它最迷人的地方，就在于它是一座永远挖不完的宝库，总是藏着新的问题、观点与可能性。虽然有时不免被庞大的信息量淹没而感到疲惫，但每当真正弄懂一个新概念、解开一个复杂问题时，那种无与伦比的成就感，总能让我再次爱上这个领域。</p><p class="page-text">除了信息领域，我也对生物、物理、历史、人文及时事抱持浓厚兴趣。我很喜欢跨领域的知识碰撞，因为它们总会在意想不到的地方产生连结，带给我更完整的视角来理解这个世界。</p><p class="page-text">在工作与学习之外，我的生活也相当灵活多元。平常我喜欢看棒球、看电竞、打篮球，也透过健身和游泳保持活力；同时，我也是动漫、影集和游戏的爱好者。最近甚至正雄心壮志地计划挑战画画，并想把放下一阵子的钢琴重新练回来。</p><p class="page-text">如果你也对世界充满好奇，或者刚好与我有相似的频率，非常欢迎找我交流，也许我们会非常聊得来！</p>',
        }, cipherHtml: {
          en: '<p class="page-text">Right now, I’m mostly into machine learning and deep learning, doing a lot of dev work and distributed systems. I’m also trying to learn more about networking and cloud architecture lately. It probably sounds like I’m trying to do way too much, but honestly? Like Steve Jobs said: "Stay hungry, stay foolish." To me, it’s just about chasing what I love.</p><p class="page-text">The tech world is like a never-ending treasure hunt. There’s always a new problem to solve or a cool new perspective to look at. Yeah, the sheer amount of stuff to learn can be super overwhelming sometimes, but that feeling when you finally get a tough concept or fix a crazy bug? That’s why I keep falling in love with this stuff over and over again.</p><p class="page-text">Outside of tech, I’m also super curious about a bunch of other things, like biology, physics, history, and just what’s happening in the world. I love it when ideas from completely different fields collide. It gives you a whole new way to look at life.</p><p class="page-text">As for my free time, I’m pretty flexible. I love watching baseball and esports, playing basketball, hitting the gym, and swimming. I’m also a big fan of anime, TV shows, and gaming. Oh, and I’m actually planning to challenge myself with drawing soon, and I’m trying to pick up the piano again after letting it rust for a while.</p><p class="page-text">If you’re curious about the world too, or if you feel like we’re on the same wavelength, definitely hit me up. I bet we’d get along great!</p>',
          'zh-Hant': '<p class="page-text">目前我主要專注於機器學習、深度學習的理論與應用，以及軟體開發與分散式系統；未來也期待能持續深入探索網路與雲端架構。</p><p class="page-text">我是真的很喜歡資訊領域，我覺得它最迷人的地方，就在於它是一座永遠挖不完的寶庫，總是藏著新的問題、觀點與可能性。雖然有時不免被龐大的資訊量淹沒而感到疲憊，但每當真正弄懂一個新概念、解開一個複雜問題時，那種無與倫比的成就感，總能讓我再次愛上這個領域。</p><p class="page-text">除了資訊領域，我也對生物、物理、歷史、人文及時事抱持濃厚興趣。我很喜歡跨領域的知識碰撞，因為它們總會在意想不到的地方產生連結，帶給我更完整的視角來理解這個世界。</p><p class="page-text">在工作與學習之外，我的生活也相當靈活多元。平常我喜歡看棒球、看電競、打籃球，也透過健身和游泳保持活力；同時，我也是動漫、影集和遊戲的愛好者。最近甚至正雄心壯志地計畫挑戰畫畫，並想把放下一陣子的鋼琴重新練回來。</p><p class="page-text">如果你也對世界充滿好奇，或者剛好與我有相似的頻率，非常歡迎找我交流，也許我們會非常聊得來！</p>',
          'zh-Hans': '<p class="page-text">目前我主要专注于机器学习、深度学习的理论与应用，以及软件开发与分布式系统；未来也期待能持续深入探索网络与云端架构。</p><p class="page-text">我是真的很喜欢信息领域，我觉得它最迷人的地方，就在于它是一座永远挖不完的宝库，总是藏着新的问题、观点与可能性。虽然有时不免被庞大的信息量淹没而感到疲惫，但每当真正弄懂一个新概念、解开一个复杂问题时，那种无与伦比的成就感，总能让我再次爱上这个领域。</p><p class="page-text">除了信息领域，我也对生物、物理、历史、人文及时事抱持浓厚兴趣。我很喜欢跨领域的知识碰撞，因为它们总会在意想不到的地方产生连结，带给我更完整的视角来理解这个世界。</p><p class="page-text">在工作与学习之外，我的生活也相当灵活多元。平常我喜欢看棒球、看电竞、打篮球，也透过健身和游泳保持活力；同时，我也是动漫、影集和游戏的爱好者。最近甚至正雄心壮志地计划挑战画画，并想把放下一阵子的钢琴重新练回来。</p><p class="page-text">如果你也对世界充满好奇，或者刚好与我有相似的频率，非常欢迎找我交流，也许我们会非常聊得来！</p>',
        } },
        { selector: '#contact h2', text: { en: 'Contact', 'zh-Hant': '聯絡方式', 'zh-Hans': '联系方式' } },
        { selector: '#contact h5:nth-of-type(1)', text: { en: 'Phone', 'zh-Hant': '電話', 'zh-Hans': '电话' } },
        { selector: '#contact h5:nth-of-type(2)', text: { en: 'Email', 'zh-Hant': '電子郵件', 'zh-Hans': '电子邮件' } },
      ],
    },
    projects: {
      title: {
        en: 'Projects — Ludwig',
        'zh-Hant': '專案 — Ludwig',
      },
      entries: [
        { selector: '.project-section .section-title', text: { en: 'Project Showcase', 'zh-Hant': '專案展示' } },
        { selector: '#projectCarousel .carousel-item:nth-of-type(1) .carousel-caption-below p', text: { en: 'A compact, assembly-language-based spacecraft shooting game developed in MASM.', 'zh-Hant': '使用 MASM 開發的小型組合語言太空射擊遊戲。' } },
        { selector: '#projectCarousel .carousel-item:nth-of-type(2) .carousel-caption-below p', text: { en: 'A personal website that serves as both a portfolio and a hands-on space for developing essential web development skills.', 'zh-Hant': '一個同時作為作品集與練習場的個人網站，用來磨練重要的網頁開發能力。' } },
      ],
    },
    search: {
      title: { en: 'Search — Ludwig', 'zh-Hant': '搜尋 — Ludwig', 'zh-Hans': '搜索 — Ludwig' },
      entries: [
        { selector: '.page-section h2', text: { en: 'Search', 'zh-Hant': '搜尋', 'zh-Hans': '搜索' } },
        { selector: '.page-section > .container > .page-text', text: { en: 'Search across notes and writing by keyword, tag, or concept.', 'zh-Hant': '用關鍵字、標籤或概念，在筆記與文章之間快速搜尋。', 'zh-Hans': '用关键词、标签或概念，在笔记与文章之间快速搜索。' } },
        { selector: '#garden-search', attr: 'placeholder', text: { en: 'Search notes by keyword, tag, or concept...', 'zh-Hant': '用關鍵字、標籤或概念搜尋內容...', 'zh-Hans': '用关键词、标签或概念搜索内容...' } },
        { selector: '.input-group + .text-center', text: { en: 'Ctrl/⌘ + K to focus · Open tags to filter', 'zh-Hant': '按 Ctrl/⌘ + K 聚焦搜尋框 · 開啟標籤來篩選', 'zh-Hans': '按 Ctrl/⌘ + K 聚焦搜索框 · 打开标签来筛选' } },
        { selector: '#garden-filter-state > span:first-child', text: { en: 'Filtering by', 'zh-Hant': '目前篩選', 'zh-Hans': '当前筛选' } },
        { selector: '#garden-clear-tags', text: { en: 'Clear', 'zh-Hant': '清除', 'zh-Hans': '清除' } },
        { selector: '#garden-open-tag-page', text: { en: 'Open page', 'zh-Hant': '開啟頁面', 'zh-Hans': '打开页面' } },
        { selector: '#garden-empty', text: { en: 'No results.', 'zh-Hant': '沒有結果。', 'zh-Hans': '没有结果。' } },
        { selector: '#gardenTagsModal .modal-title', text: { en: 'Tags', 'zh-Hant': '標籤', 'zh-Hans': '标签' } },
        { selector: '#gardenTagsModal .modal-body .mt-3', text: { en: 'Click tags to filter. Click an active tag again to remove it.', 'zh-Hant': '點擊標籤可篩選；再次點擊已啟用的標籤可移除。', 'zh-Hans': '点击标签可筛选；再次点击已启用的标签可移除。' } },
        { selector: '#gardenHelpModal .modal-title', text: { en: 'Help', 'zh-Hant': '說明', 'zh-Hans': '说明' } },
        { selector: '#gardenHelpModal .mb-3:nth-of-type(1)', html: { en: '<span class="badge text-bg-secondary me-2">Search</span>Type keywords to search across titles, tags, and content.', 'zh-Hant': '<span class="badge text-bg-secondary me-2">搜尋</span>輸入關鍵字，搜尋標題、標籤與內容。', 'zh-Hans': '<span class="badge text-bg-secondary me-2">搜索</span>输入关键词，搜索标题、标签与内容。' } },
        { selector: '#gardenHelpModal .mb-3:nth-of-type(2)', html: { en: '<span class="badge text-bg-secondary me-2">Tags</span>Open the tag picker and click multiple tags to filter results (AND / intersection).', 'zh-Hant': '<span class="badge text-bg-secondary me-2">標籤</span>開啟標籤選擇器，點擊多個標籤做交集篩選。', 'zh-Hans': '<span class="badge text-bg-secondary me-2">标签</span>打开标签选择器，点击多个标签做交集筛选。' } },
        { selector: '#gardenHelpModal .mb-3:nth-of-type(3)', html: { en: '<span class="badge text-bg-secondary me-2">Shortcuts</span>Press Ctrl/⌘ + K to focus the search bar.', 'zh-Hant': '<span class="badge text-bg-secondary me-2">快捷鍵</span>按 Ctrl/⌘ + K 聚焦搜尋框。', 'zh-Hans': '<span class="badge text-bg-secondary me-2">快捷键</span>按 Ctrl/⌘ + K 聚焦搜索框。' } },
      ],
    },
    settings: {
      title: { en: 'Settings — Ludwig', 'zh-Hant': '設定 — Ludwig', 'zh-Hans': '设置 — Ludwig' },
      entries: [
        { selector: '.page-section h2', text: { en: 'Settings', 'zh-Hant': '設定', 'zh-Hans': '设置' } },
        { selector: '#settings-general-tab', text: { en: 'General', 'zh-Hant': '一般', 'zh-Hans': '常规' } },
        { selector: '#settings-style-tab', text: { en: 'Style', 'zh-Hant': '外觀', 'zh-Hans': '外观' } },
        { selector: '#settings-general h3', text: { en: 'Language', 'zh-Hant': '語言', 'zh-Hans': '语言' } },
        { selector: '#settings-style .project-card:nth-of-type(1) h3', text: { en: 'Theme', 'zh-Hant': '主題', 'zh-Hans': '主题' } },
        { selector: '#settings-style .project-card:nth-of-type(2) h3', text: { en: 'Palette', 'zh-Hant': '色盤', 'zh-Hans': '色盘' } },
        { selector: '#settings-style .project-card:nth-of-type(3) h3', text: { en: 'Effects', 'zh-Hant': '特效', 'zh-Hans': '特效' } },
        { selector: '[data-settings-lang="en"]', text: { en: 'English', 'zh-Hant': 'English', 'zh-Hans': 'English' } },
        { selector: '[data-settings-lang="zh-Hant"]', text: { en: '中文', 'zh-Hant': '中文', 'zh-Hans': '繁體中文' } },
        { selector: '[data-settings-lang="zh-Hans"]', text: { en: '简体中文', 'zh-Hant': '簡體中文', 'zh-Hans': '简体中文' } },
        { selector: '[data-settings-theme="dark"]', text: { en: 'Dark', 'zh-Hant': '深色', 'zh-Hans': '深色' } },
        { selector: '[data-settings-theme="light"]', text: { en: 'Light', 'zh-Hant': '淺色', 'zh-Hans': '浅色' } },
        { selector: '[data-settings-theme="deep-sea"]', text: { en: 'Deep Sea', 'zh-Hant': '深海', 'zh-Hans': '深海' } },
        { selector: '[data-settings-theme="galaxy"]', text: { en: 'Galaxy', 'zh-Hant': '銀河', 'zh-Hans': '银河' } },
        { selector: '[data-settings-theme="sky"]', text: { en: 'Sky', 'zh-Hant': '天空', 'zh-Hans': '天空' } },
        { selector: '[data-settings-theme="garden"]', text: { en: 'Garden', 'zh-Hant': '花園', 'zh-Hans': '花园' } },
        { selector: '[data-settings-palette="default"]', text: { en: 'Default', 'zh-Hant': '預設', 'zh-Hans': '默认' } },
        { selector: '[data-settings-palette="red"]', text: { en: 'Ruby Red', 'zh-Hant': '寶石紅', 'zh-Hans': '宝石红' } },
        { selector: '[data-settings-palette="ember"]', text: { en: 'Ember Orange', 'zh-Hant': '餘燼橘', 'zh-Hans': '余烬橙' } },
        { selector: '[data-settings-palette="cedar"]', text: { en: 'Cedar Brown', 'zh-Hant': '雪松棕', 'zh-Hans': '雪松棕' } },
        { selector: '[data-settings-palette="yellow"]', text: { en: 'Golden Yellow', 'zh-Hant': '金黃色', 'zh-Hans': '金黄色' } },
        { selector: '[data-settings-palette="garden"]', text: { en: 'Garden Green', 'zh-Hant': '花園綠', 'zh-Hans': '花园绿' } },
        { selector: '[data-settings-palette="grove"]', text: { en: 'Garden Moss', 'zh-Hant': '苔林綠', 'zh-Hans': '苔林绿' } },
        { selector: '[data-settings-palette="abyss"]', text: { en: 'Abyss Cyan', 'zh-Hant': '深海青', 'zh-Hans': '深海青' } },
        { selector: '[data-settings-palette="sky"]', text: { en: 'Sky Blue', 'zh-Hant': '天空藍', 'zh-Hans': '天空蓝' } },
        { selector: '[data-settings-palette="galaxy"]', text: { en: 'Galaxy Blue', 'zh-Hant': '銀河藍', 'zh-Hans': '银河蓝' } },
        { selector: '[data-settings-palette="nebula"]', text: { en: 'Nebula Violet', 'zh-Hant': '星雲紫', 'zh-Hans': '星云紫' } },
        { selector: '[data-settings-palette="ash"]', text: { en: 'Ash Gray', 'zh-Hant': '灰燼灰', 'zh-Hans': '灰烬灰' } },
        { selector: '[data-settings-motion="on"]', text: { en: 'On', 'zh-Hant': '開啟', 'zh-Hans': '开启' } },
        { selector: '[data-settings-motion="off"]', text: { en: 'Off', 'zh-Hant': '關閉', 'zh-Hans': '关闭' } },
      ],
    },
    notesLanding: {
      title: { en: 'Notes — Ludwig', 'zh-Hant': '筆記 — Ludwig', 'zh-Hans': '笔记 — Ludwig' },
      entries: [
        { selector: '.section-landing-kicker', text: { en: 'Knowledge Base', 'zh-Hant': '知識庫', 'zh-Hans': '知识库' } },
        { selector: '#section-title', text: { en: 'Notes', 'zh-Hant': '筆記', 'zh-Hans': '笔记' }, cipherText: { en: 'Notes', 'zh-Hant': '日知', 'zh-Hans': '日知' } },
        { selector: '.section-landing-subtitle', text: { en: 'Compact, evolving notes for learning, reuse, and long-term accumulation.', 'zh-Hant': '在時間的推進裡，一邊向未知探路，一邊回首點亮那些走過的足跡。', 'zh-Hans': '在时间的推进里，一边向未知探路，一边回首点亮那些走过的足迹。' }, cipherText: { en: 'Compact, evolving notes for learning, reuse, and long-term accumulation.', 'zh-Hant': '「日知其所亡，月無忘其所能。」 ——《日知錄》', 'zh-Hans': '「日知其所亡，月无忘其所能。」 ——《日知录》' } },
        { selector: '#section-filter-toggle', attr: 'aria-label', text: { en: 'Tags', 'zh-Hant': '標籤', 'zh-Hans': '标签' } },
        { selector: '#section-filter-toggle', attr: 'title', text: { en: 'Tags', 'zh-Hant': '標籤', 'zh-Hans': '标签' } },
        { selector: '#section-search', attr: 'placeholder', text: { en: 'Search notes...', 'zh-Hant': '搜尋筆記...', 'zh-Hans': '搜索笔记...' }, cipherText: { en: 'Search notes...', 'zh-Hant': '搜尋日知...', 'zh-Hans': '搜索日知...' } },
        { selector: '#section-empty', text: { en: 'No results.', 'zh-Hant': '沒有結果。', 'zh-Hans': '没有结果。' } },
      ],
      cipherTitle: { en: 'Notes — Ludwig', 'zh-Hant': '日知 — Ludwig', 'zh-Hans': '日知 — Ludwig' },
    },
    writingLanding: {
      title: { en: 'Writing — Ludwig', 'zh-Hant': '文章 — Ludwig', 'zh-Hans': '文章 — Ludwig' },
      entries: [
        { selector: '.section-landing-kicker', text: { en: 'Long-form Thinking', 'zh-Hant': '隨筆謄錄', 'zh-Hans': '随笔誊录' }, cipherText: { en: 'Long-form Thinking', 'zh-Hant': '隨筆謄錄', 'zh-Hans': '随笔誊录' } },
        { selector: '#section-title', text: { en: 'Writing', 'zh-Hant': '文章', 'zh-Hans': '文章' }, cipherText: { en: 'Writing', 'zh-Hant': '求音', 'zh-Hans': '求音' } },
        { selector: '.section-landing-subtitle', text: { en: 'Essays, reflections, and evolving ideas that need more room to breathe.', 'zh-Hant': '在此搭建一座空間，容納未竟的思緒，記錄持續萌芽的觀點。', 'zh-Hans': '在此搭建一座空间，容纳未竟的思绪，记录持续萌芽的观点。' }, cipherText: { en: 'Essays, reflections, and evolving ideas that need more room to breathe.', 'zh-Hant': '「課虛無以責有，叩寂寞以求音。」 ——《文賦》', 'zh-Hans': '「课虚无以责有，叩寂寞以求音。」 ——《文赋》' } },
        { selector: '#section-search', attr: 'placeholder', text: { en: 'Search writing...', 'zh-Hant': '搜尋文章...', 'zh-Hans': '搜索文章...' }, cipherText: { en: 'Search writing...', 'zh-Hant': '搜尋求音...', 'zh-Hans': '搜索求音...' } },
        { selector: '#section-empty', text: { en: 'No results.', 'zh-Hant': '沒有結果。', 'zh-Hans': '没有结果。' } },
      ],
      cipherTitle: { en: 'Writing — Ludwig', 'zh-Hant': '求音 — Ludwig', 'zh-Hans': '求音 — Ludwig' },
    },
    canvasLanding: {
      title: { en: 'Canvas — Ludwig', 'zh-Hant': '圖廊 — Ludwig', 'zh-Hans': '图廊 — Ludwig' },
      entries: [
        { selector: '.section-landing-kicker', text: { en: 'Visual Work', 'zh-Hant': '視覺作品', 'zh-Hans': '视觉作品' } },
        { selector: '#section-title', text: { en: 'Canvas', 'zh-Hant': '圖廊', 'zh-Hans': '图廊' }, cipherText: { en: 'Canvas', 'zh-Hant': '視界', 'zh-Hans': '视界' } },
        { selector: '.section-landing-subtitle', text: { en: 'Images, sketches, and visual experiments collected as a reusable gallery.', 'zh-Hant': '在此凝結視線的軌跡，將靈光、草稿與視覺的涉渡，編織成一座隨時可步入的意象圖廊。', 'zh-Hans': '在此凝结视线的轨迹，将灵光、草稿与视觉的涉渡，编织成一座随时可步入的意象图廊。' }, cipherText: { en: 'Images, sketches, and visual experiments collected as a reusable gallery.', 'zh-Hant': '把圖片、草圖與視覺實驗整理成可重用的畫廊。', 'zh-Hans': '把图片、草图与视觉实验整理成可重用的画廊。' } },
        { selector: '#section-search', attr: 'placeholder', text: { en: 'Search canvas...', 'zh-Hant': '搜尋圖廊...', 'zh-Hans': '搜索图廊...' }, cipherText: { en: 'Search canvas...', 'zh-Hant': '搜尋視界...', 'zh-Hans': '搜索视界...' } },
        { selector: '#section-empty', text: { en: 'No results.', 'zh-Hant': '沒有結果。', 'zh-Hans': '没有结果。' } },
      ],
      cipherTitle: { en: 'Canvas — Ludwig', 'zh-Hant': '視界 — Ludwig', 'zh-Hans': '视界 — Ludwig' },
    },
  };

  const getEntryValue = (entry, lang) => {
    if (isCipherMode()) {
      if (entry && entry.cipherText && entry.cipherText[lang]) return entry.cipherText[lang];
      if (entry && entry.cipherHtml && entry.cipherHtml[lang]) return entry.cipherHtml[lang];
    }
    return (entry && entry.text && entry.text[lang]) || (entry && entry.html && entry.html[lang]) || '';
  };

  const applyEntries = (entries, lang) => {
    (Array.isArray(entries) ? entries : []).forEach((entry) => {
      const value = getEntryValue(entry, lang);
      if (!value) return;
      document.querySelectorAll(entry.selector).forEach((el) => {
        if (entry.attr) {
          el.setAttribute(entry.attr, value);
          return;
        }
        if (entry.html) {
          el.innerHTML = value;
          return;
        }
        el.textContent = value;
      });
    });
  };

  const applyPageTranslations = () => {
    const lang = getLang();
    const common = bundles.common || { entries: [] };
    applyEntries(common.entries, lang);

    const pageBundle = bundles[page];
    if (pageBundle && isCipherMode() && pageBundle.cipherTitle && pageBundle.cipherTitle[lang]) {
      document.title = pageBundle.cipherTitle[lang];
    } else if (pageBundle && pageBundle.title && pageBundle.title[lang]) {
      document.title = pageBundle.title[lang];
    } else if (common.title && common.title[lang]) {
      document.title = common.title[lang];
    }
    if (pageBundle) applyEntries(pageBundle.entries, lang);
    document.documentElement.setAttribute('data-site-lang', lang);
    document.documentElement.classList.remove('i18n-pending');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPageTranslations, { once: true });
  } else {
    applyPageTranslations();
  }

  window.addEventListener('ludwig-language-changed', applyPageTranslations);
  window.addEventListener('ludwig-cipher-mode-changed', applyPageTranslations);
})();
