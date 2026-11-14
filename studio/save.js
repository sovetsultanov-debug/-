/*
 * Shows the finished PNG in a full-screen overlay. A direct download is tried as well,
 * but some hosts (e.g. embedded previews) block downloads, so the visible image is the
 * reliable path: long-press on a phone or right-click → "Save image".
 */
window.showPngResult = function showPngResult(canvas, filename) {
  const url = canvas.toDataURL('image/png');
  let box = document.getElementById('result');
  if (!box) {
    box = document.createElement('div');
    box.id = 'result';
    box.className = 'result';
    box.innerHTML =
      '<div class="result-card" role="dialog" aria-modal="true" aria-label="Готовая картинка">' +
      '<p class="result-hint">Нажмите на картинку и удерживайте (телефон) или кликните правой кнопкой (компьютер) → «Сохранить изображение».</p>' +
      '<img alt="Готовая картинка" />' +
      '<div class="result-actions"><a class="primary-link" download>Скачать файл</a><button type="button" data-close>Закрыть</button></div>' +
      '</div>';
    document.body.appendChild(box);
    box.addEventListener('click', (e) => {
      if (e.target === box || e.target.closest('[data-close]')) box.hidden = true;
    });
    document.addEventListener('keydown', (e) => e.key === 'Escape' && (box.hidden = true));
  }
  box.querySelector('img').src = url;
  const link = box.querySelector('a');
  link.href = url;
  link.download = filename;
  // Inside embedded previews downloads are blocked: rely on long-press / right-click instead.
  link.hidden = window.self !== window.top;
  box.hidden = false;
};

// Printing is unavailable inside embedded previews; hide print buttons there.
if (window.self !== window.top) {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-print]').forEach((b) => (b.hidden = true));
  });
}
