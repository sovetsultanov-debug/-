/*
 * Builds the four day blocks (alternating sides), each with five labelled pill fields
 * and a flat illustration, plus theme / language switches, print and PNG export.
 */
(() => {
  const TEXT = {
    en: {travel: 'Travel', itinerary: 'ITINERARY', planner: 'PLANNER', day: 'Day', fields: ['Destination', 'Eat', 'Activities', 'Leisure', 'Budget']},
    ru: {travel: 'Мой', itinerary: 'ПЛАН', planner: 'ПОЕЗДКИ', day: 'День', fields: ['Место', 'Еда', 'Занятия', 'Отдых', 'Бюджет']},
  };

  // Flat illustrations as inline SVG, coloured through the theme variables.
  const ICONS = {
    camera: `<svg viewBox="0 0 150 120" aria-hidden="true">
      <rect x="40" y="12" width="40" height="18" rx="5" fill="#2f4a5c"/>
      <rect x="92" y="16" width="22" height="12" rx="3" fill="var(--accent)"/>
      <rect x="8" y="26" width="134" height="88" rx="18" fill="#3b5b70"/>
      <rect x="8" y="26" width="134" height="20" rx="10" fill="var(--accent)"/>
      <circle cx="75" cy="72" r="34" fill="var(--accent)"/>
      <circle cx="75" cy="72" r="25" fill="#eef1f2"/>
      <circle cx="75" cy="72" r="17" fill="#7fb6c2"/>
      <circle cx="69" cy="66" r="5" fill="#fff" opacity=".8"/>
      <rect x="18" y="56" width="16" height="8" rx="3" fill="#2f4a5c"/>
    </svg>`,
    palm: `<svg viewBox="0 0 150 150" aria-hidden="true">
      <path d="M78 58 C 86 90, 84 120, 74 146 L 86 146 C 96 118, 96 88, 86 58 Z" fill="#8a5a33"/>
      <path d="M82 58 C 60 30, 28 34, 10 52 C 36 44, 58 48, 82 64 Z" fill="#6f9d4c"/>
      <path d="M82 58 C 70 22, 40 10, 22 16 C 48 24, 66 40, 80 66 Z" fill="#86b35a"/>
      <path d="M82 58 C 100 22, 130 18, 146 30 C 120 30, 100 42, 86 66 Z" fill="#6f9d4c"/>
      <path d="M82 58 C 112 46, 136 62, 142 84 C 124 66, 104 62, 86 66 Z" fill="#86b35a"/>
      <path d="M82 58 C 76 76, 58 92, 40 96 C 54 82, 66 70, 80 60 Z" fill="#5d8a3d"/>
      <circle cx="78" cy="64" r="6" fill="var(--accent)"/><circle cx="88" cy="66" r="6" fill="#e8a33a"/><circle cx="83" cy="72" r="6" fill="var(--accent)"/>
    </svg>`,
    plane: `<svg viewBox="0 0 170 100" aria-hidden="true">
      <path d="M12 52 C 12 40, 30 34, 50 34 L 140 34 C 152 34, 162 40, 166 52 C 162 62, 150 66, 140 66 L 50 66 C 30 66, 12 62, 12 52 Z" fill="#fbfbfb"/>
      <path d="M140 34 L 162 8 L 168 8 L 160 40 Z" fill="var(--accent)"/>
      <path d="M90 50 L 60 92 L 74 92 L 116 52 Z" fill="#f2a23a"/>
      <path d="M92 40 L 72 14 L 82 14 L 112 38 Z" fill="#f2a23a"/>
      <path d="M12 52 C 14 46, 22 42, 30 41 L 30 52 Z" fill="#2f4a5c"/>
      <g fill="#2f4a5c">${Array.from({length: 9}, (_, i) => `<rect x="${40 + i * 10}" y="44" width="5" height="6" rx="1.5"/>`).join('')}</g>
      <rect x="40" y="56" width="110" height="5" rx="2.5" fill="var(--accent)" opacity=".85"/>
    </svg>`,
    suitcase: `<svg viewBox="0 0 150 130" aria-hidden="true">
      <path d="M52 30 V 14 C 52 8, 56 4, 62 4 H 88 C 94 4, 98 8, 98 14 V 30" fill="none" stroke="#2f4a5c" stroke-width="7"/>
      <rect x="8" y="28" width="134" height="88" rx="14" fill="var(--accent)"/>
      <rect x="8" y="28" width="134" height="14" rx="7" fill="var(--accent-dark)" opacity=".35"/>
      <rect x="34" y="28" width="10" height="88" fill="#2f4a5c"/><rect x="106" y="28" width="10" height="88" fill="#2f4a5c"/>
      <rect x="30" y="70" width="18" height="10" rx="2" fill="#c9cfd3"/><rect x="102" y="70" width="18" height="10" rx="2" fill="#c9cfd3"/>
      <circle cx="30" cy="122" r="7" fill="#2f4a5c"/><circle cx="120" cy="122" r="7" fill="#2f4a5c"/>
    </svg>`,
  };
  const ICON_ORDER = ['camera', 'palm', 'plane', 'suitcase'];

  const sheet = document.getElementById('sheet');
  const daysEl = document.getElementById('days');
  let lang = 'en';

  function build() {
    const t = TEXT[lang];
    // Keep whatever the user already typed when rebuilding (language switch).
    const values = [...daysEl.querySelectorAll('input')].map((i) => i.value);
    daysEl.innerHTML = '';
    for (let d = 0; d < 4; d++) {
      const side = d % 2 === 0 ? 'left' : 'right';
      const block = document.createElement('section');
      block.className = `day ${side}`;
      block.innerHTML =
        `<h2 class="day-title">${t.day} ${d + 1}</h2>` +
        t.fields
          .map((f, i) => {
            const id = `d${d + 1}-${i}`;
            return `<div class="row"><label for="${id}">${f}</label><input id="${id}" type="text" /></div>`;
          })
          .join('') +
        `<div class="day-icon">${ICONS[ICON_ORDER[d]]}</div>`;
      daysEl.appendChild(block);
    }
    daysEl.querySelectorAll('input').forEach((input, i) => (input.value = values[i] ?? ''));
    sheet.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t[el.dataset.i18n]));
    sheet.querySelector('.head-title').style.fontSize = lang === 'ru' ? '64px' : '';
  }

  function switcher(groupId, attr, apply) {
    document.getElementById(groupId).addEventListener('click', (e) => {
      const btn = e.target.closest(`[data-${attr}]`);
      if (!btn) return;
      document.querySelectorAll(`#${groupId} [data-${attr}]`).forEach((b) => b.classList.toggle('is-active', b === btn));
      apply(btn.dataset[attr]);
    });
  }

  switcher('theme', 'theme', (theme) => {
    sheet.classList.remove('theme-classic', 'theme-saiyakat');
    sheet.classList.add(`theme-${theme}`);
  });
  switcher('lang', 'lang', (l) => {
    lang = l;
    build();
  });

  document.getElementById('print').addEventListener('click', () => window.print());

  document.getElementById('download').addEventListener('click', async () => {
    if (!window.html2canvas) {
      alert('Не удалось загрузить html2canvas (нужен интернет). Используйте «Печать / PDF».');
      return;
    }
    await document.fonts.ready;
    const canvas = await window.html2canvas(sheet, {scale: 2, backgroundColor: null, useCORS: true});
    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `saiyakat-planner-${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, 'image/png');
  });

  build();
})();
