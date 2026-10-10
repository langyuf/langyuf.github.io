/**
 * 壁纸页面（/wallpaper/）的选择逻辑
 *
 * - 在 #wallpaper-grid 里渲染壁纸卡片，点击即设为全站背景并写入
 *   localStorage（key: site-wallpaper），全站刷新后依然生效
 * - 带 api 标记的源每次请求返回随机图：缩略图和应用到背景的可能不是
 *   同一张（缩略图只是取样），点击时会先预加载验证，失败自动跳过
 * - 「恢复默认壁纸」清除已保存的选择
 * - 选择的应用逻辑全站运行（inject.bottom 注入），渲染卡片的逻辑只在
 *   壁纸页面运行（页面上存在 #wallpaper-grid 才执行）
 */
(function () {
  const STORE_KEY = 'site-wallpaper';
  const DEFAULT_BG =
    'https://cdn.jsdelivr.net/gh/langyuf/Image-hosting@main/hexo_blog/wallpaper/wallpaper-1.jpeg';
  const IMG_BASE =
    'https://cdn.jsdelivr.net/gh/langyuf/Image-hosting@main/hexo_blog';

  // 壁纸来源：api 为 true 时每次请求返回随机图
  const sources = [
    { name: '站点默认', url: DEFAULT_BG },
    { name: '壁纸 2', url: IMG_BASE + '/wallpaper/wallpaper-2.png' },
    { name: '壁纸 3', url: IMG_BASE + '/wallpaper/wallpaper-3.png' },
    { name: '壁纸 4', url: IMG_BASE + '/wallpaper/wallpaper-4.jpeg' },
    { name: '壁纸 5', url: IMG_BASE + '/wallpaper/wallpaper-5.png' },
    { name: '壁纸 6', url: IMG_BASE + '/wallpaper/wallpaper-6.jpeg' },
    { name: '壁纸 7', url: IMG_BASE + '/wallpaper/wallpaper-7.jpeg' },
    { name: '壁纸 8', url: IMG_BASE + '/wallpaper/wallpaper-8.jpeg' },
    { name: '壁纸 9', url: IMG_BASE + '/wallpaper/wallpaper-9.jpeg' },
    { name: '壁纸 10', url: IMG_BASE + '/wallpaper/wallpaper-10.jpeg' }
  ];

  // 自带 toast：不依赖 btf.snackbarShow（其依赖的 GLOBAL_CONFIG.Snackbar
  // 在部分页面状态下是 undefined，调用会抛异常）
  function toast(msg) {
    let box = document.getElementById('wallpaper-toast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'wallpaper-toast';
      box.style.cssText =
        'position:fixed;bottom:70px;left:50%;transform:translateX(-50%);z-index:999;' +
        'padding:10px 18px;border-radius:12px;background:rgba(0,0,0,0.75);color:#fff;' +
        'font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.2);opacity:0;' +
        'transition:opacity .3s;pointer-events:none;white-space:nowrap;';
      document.body.appendChild(box);
    }
    box.textContent = msg;
    box.style.opacity = '1';
    clearTimeout(box._timer);
    box._timer = setTimeout(() => {
      box.style.opacity = '0';
    }, 2200);
  }

  function getSaved() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function save(entry) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(entry));
    } catch (e) {
      /* 隐私模式下 localStorage 不可用，忽略 */
    }
  }

  // 预加载：成功返回 true；出错或超过 12s 返回 false
  function preload(url) {
    return new Promise(resolve => {
      const img = new Image();
      const timer = setTimeout(() => {
        img.onload = img.onerror = null;
        img.src = '';
        resolve(false);
      }, 12000);
      img.onload = () => {
        clearTimeout(timer);
        resolve(true);
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(false);
      };
      img.src = url;
    });
  }

  function applyToBg(url) {
    const bg = document.getElementById('web_bg');
    if (bg) bg.style.backgroundImage = 'url("' + url + '")';
  }

  async function choose(source, cardEl) {
    toast('正在应用「' + source.name + '」…');
    const ok = await preload(source.url);
    if (!ok) {
      toast('「' + source.name + '」加载失败，换一个试试');
      return;
    }
    save({ name: source.name, url: source.url });
    applyToBg(source.url);
    toast('壁纸已更换：' + source.name);
    if (cardEl) {
      const grid = document.getElementById('wallpaper-grid');
      if (grid) {
        grid.querySelectorAll('.wallpaper-card.active').forEach(el => el.classList.remove('active'));
        cardEl.classList.add('active');
      }
    }
  }

  function resetDefault() {
    localStorage.removeItem(STORE_KEY);
    applyToBg(DEFAULT_BG);
    const grid = document.getElementById('wallpaper-grid');
    if (grid) {
      grid.querySelectorAll('.wallpaper-card.active').forEach(el => el.classList.remove('active'));
      const first = grid.querySelector('.wallpaper-card');
      if (first) first.classList.add('active');
    }
    toast('已恢复默认壁纸');
  }

  function renderGrid() {
    const grid = document.getElementById('wallpaper-grid');
    if (!grid) return;
    const saved = getSaved();
    sources.forEach(source => {
      const card = document.createElement('figure');
      card.className = 'wallpaper-card';
      if ((saved && saved.url === source.url) || (!saved && source.url === DEFAULT_BG)) {
        card.classList.add('active');
      }
      const img = document.createElement('img');
      img.src = source.url;
      img.alt = source.name;
      img.loading = 'lazy';
      const caption = document.createElement('figcaption');
      caption.textContent = source.name + (source.api ? ' ⚡随机' : '');
      card.appendChild(img);
      card.appendChild(caption);
      card.addEventListener('click', () => choose(source, card));
      grid.appendChild(card);
    });
    const resetBtn = document.getElementById('wallpaper-reset');
    if (resetBtn) resetBtn.addEventListener('click', resetDefault);
  }

  function applySaved() {
    const saved = getSaved();
    if (saved && saved.url) applyToBg(saved.url);
  }

  applySaved();
  if (document.getElementById('wallpaper-grid')) {
    renderGrid();
  } else {
    // pjax 场景：跳转到壁纸页后再渲染
    document.addEventListener('pjax:complete', () => {
      if (document.getElementById('wallpaper-grid')) renderGrid();
    });
  }
})();
