/*
 * Poster template: full-bleed photo, outlined pill bar on top, a location tag with a
 * hand-drawn route line, script headline and a small arrow button. Everything is drawn
 * on a 1080×1350 canvas (Instagram 4:5), so the exported PNG matches the preview 1:1.
 */
(() => {
  const W = 1080;
  const H = 1350;
  const canvas = document.getElementById('poster');
  const ctx = canvas.getContext('2d');
  const $ = (id) => document.getElementById(id);

  const PALETTES = {
    earth: {arrow: '#6b5a52', tagBg: '#141414', ctaBg: '#ffffff', ctaText: '#1a1a1a', line: '#ffffff', fallback: ['#3d5a80', '#c49a6c', '#2a2420']},
    saiyakat: {arrow: '#8b0d1a', tagBg: '#0b0b0b', ctaBg: '#f5f2ed', ctaText: '#0b0b0b', line: '#f5f2ed', fallback: ['#2a2a2c', '#8b0d1a', '#0b0b0b']},
    night: {arrow: '#2f3b52', tagBg: '#0d1424', ctaBg: '#e8ecf4', ctaText: '#0d1424', line: '#dbe4ff', fallback: ['#1b2a4a', '#4b5d86', '#090d16']},
  };

  const state = {
    img: null,
    palette: 'earth',
    zoom: 1,
    offsetX: 0, // photo pan in canvas pixels
    offsetY: 0,
  };

  // ---------- helpers ----------
  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function fitText(text, maxWidth, font) {
    ctx.font = font;
    let t = text;
    while (t.length > 1 && ctx.measureText(t).width > maxWidth) t = t.slice(0, -1);
    return t === text ? t : t.trimEnd() + '…';
  }

  // Location pin with a "V"-like notch, drawn as a path (no image files needed).
  function pinIcon(cx, cy, size, color) {
    const s = size / 24;
    ctx.save();
    ctx.translate(cx - 12 * s, cy - 12 * s);
    ctx.scale(s, s);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(12, 22);
    ctx.bezierCurveTo(12, 22, 4, 14.5, 4, 9);
    ctx.arc(12, 9, 8, Math.PI, 0);
    ctx.bezierCurveTo(20, 14.5, 12, 22, 12, 22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = color === '#ffffff' ? '#141414' : '#ffffff';
    ctx.beginPath();
    ctx.arc(12, 9, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---------- layers ----------
  function drawPhoto() {
    const p = PALETTES[state.palette];
    if (!state.img) {
      // Placeholder until a photo is uploaded: sky → land gradient.
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, p.fallback[0]);
      g.addColorStop(0.55, p.fallback[1]);
      g.addColorStop(1, p.fallback[2]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '500 30px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Загрузите своё фото', W / 2, H * 0.38);
      ctx.textAlign = 'left';
      return;
    }
    const img = state.img;
    const cover = Math.max(W / img.width, H / img.height) * state.zoom;
    const dw = img.width * cover;
    const dh = img.height * cover;
    // Clamp panning so the photo always covers the frame.
    const maxX = (dw - W) / 2;
    const maxY = (dh - H) / 2;
    state.offsetX = Math.max(-maxX, Math.min(maxX, state.offsetX));
    state.offsetY = Math.max(-maxY, Math.min(maxY, state.offsetY));
    ctx.drawImage(img, (W - dw) / 2 + state.offsetX, (H - dh) / 2 + state.offsetY, dw, dh);
  }

  function drawShade() {
    const k = Number($('shade').value);
    // Soft top shade for the pill bar, strong bottom shade for the text block.
    const top = ctx.createLinearGradient(0, 0, 0, 260);
    top.addColorStop(0, `rgba(0,0,0,${0.35 * k})`);
    top.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, W, 260);
    const bottom = ctx.createLinearGradient(0, H * 0.45, 0, H);
    bottom.addColorStop(0, 'rgba(0,0,0,0)');
    bottom.addColorStop(0.55, `rgba(0,0,0,${0.55 * k})`);
    bottom.addColorStop(1, `rgba(0,0,0,${0.92 * k})`);
    ctx.fillStyle = bottom;
    ctx.fillRect(0, H * 0.45, W, H * 0.55);
  }

  function drawTopBar() {
    const p = PALETTES[state.palette];
    const x = 88, y = 94, w = 914, h = 66;
    // Outer outlined capsule
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    roundRect(x, y, w, h, h / 2);
    ctx.stroke();
    // Left inner capsule (brand)
    const lw = 320;
    roundRect(x, y, lw, h, h / 2);
    ctx.stroke();
    pinIcon(x + 46, y + h / 2, 34, '#ffffff');
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 21px Montserrat, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(fitText($('brand').value.toUpperCase(), lw - 100, ctx.font), x + 78, y + h / 2 + 1);
    // Right filled capsule (CTA)
    const ctaFont = '600 21px Montserrat, sans-serif';
    ctx.font = ctaFont;
    const ctaText = fitText($('cta').value.toUpperCase(), 380, ctaFont);
    const cw = Math.max(240, ctx.measureText(ctaText).width + 64);
    const cx = x + w - cw;
    ctx.fillStyle = p.ctaBg;
    roundRect(cx, y, cw, h, h / 2);
    ctx.fill();
    ctx.fillStyle = p.ctaText;
    ctx.textAlign = 'center';
    ctx.fillText(ctaText, cx + cw / 2, y + h / 2 + 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  function drawLocationTag() {
    const p = PALETTES[state.palette];
    const px = 158, py = 372;
    // Pin in a dark circle
    ctx.fillStyle = p.tagBg;
    ctx.beginPath();
    ctx.arc(px, py, 21, 0, Math.PI * 2);
    ctx.fill();
    pinIcon(px, py, 26, '#ffffff');
    // Dark capsule with the place name
    const font = '500 24px Montserrat, sans-serif';
    ctx.font = font;
    const label = fitText($('place').value, 320, font);
    const lw = ctx.measureText(label).width + 88;
    roundRect(px + 27, py - 20, lw, 40, 20);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(label, px + 27 + lw / 2, py + 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  // The looping route line: from the pin down, around the subject, ending above the text block.
  function drawRoute() {
    if (!$('route').checked) return;
    const p = PALETTES[state.palette];
    ctx.save();
    ctx.strokeStyle = p.line;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(140, 392);
    ctx.bezierCurveTo(70, 440, 70, 500, 190, 520);
    ctx.bezierCurveTo(330, 545, 470, 545, 462, 590);
    ctx.bezierCurveTo(455, 640, 180, 615, 150, 665);
    ctx.bezierCurveTo(120, 715, 330, 735, 520, 745);
    ctx.bezierCurveTo(640, 752, 640, 800, 560, 840);
    ctx.bezierCurveTo(500, 870, 440, 880, 420, 885);
    ctx.stroke();
    ctx.restore();
  }

  function drawText() {
    const p = PALETTES[state.palette];
    const x = 440;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'alphabetic';
    // Lead line
    ctx.font = '400 30px Montserrat, sans-serif';
    ctx.fillText(fitText($('lead').value, 600, ctx.font), x + 22, 912);
    // Script headline: shrink to fit the width
    let size = 152;
    const title = $('title').value;
    do {
      ctx.font = `${size}px "Marck Script", cursive`;
      size -= 4;
    } while (ctx.measureText(title).width > 640 && size > 60);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 18;
    ctx.fillText(title, x, 1045);
    ctx.restore();
    // Body: shrink the font (down to 22px) until both lines fit next to the arrow button.
    const b1 = $('body1').value;
    const b2 = $('body2').value;
    let bs = 28;
    for (; bs > 22; bs--) {
      ctx.font = `400 ${bs}px Montserrat, sans-serif`;
      if (ctx.measureText(b1).width <= 600 && ctx.measureText(b2).width <= 460) break;
    }
    ctx.fillText(fitText(b1, 600, ctx.font), x, 1140);
    const body2 = fitText(b2, 460, ctx.font);
    ctx.fillText(body2, x, 1180);
    // Arrow button right after the second line
    const bx = x + ctx.measureText(body2).width + 28;
    const by = 1152, bw = 108, bh = 40;
    ctx.fillStyle = p.arrow;
    roundRect(bx, by, bw, bh, bh / 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(bx + 38, by + bh / 2);
    ctx.lineTo(bx + 70, by + bh / 2);
    ctx.moveTo(bx + 60, by + bh / 2 - 9);
    ctx.lineTo(bx + 70, by + bh / 2);
    ctx.lineTo(bx + 60, by + bh / 2 + 9);
    ctx.stroke();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    drawPhoto();
    drawShade();
    drawTopBar();
    drawRoute();
    drawLocationTag();
    drawText();
  }

  // ---------- inputs ----------
  $('controls').addEventListener('input', (e) => {
    if (e.target.id === 'zoom') state.zoom = Number(e.target.value);
    render();
  });
  $('controls').addEventListener('submit', (e) => e.preventDefault());

  $('photo').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      state.img = img;
      state.offsetX = 0;
      state.offsetY = 0;
      render();
    };
    img.src = URL.createObjectURL(file);
  });

  $('palette').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-palette]');
    if (!btn) return;
    state.palette = btn.dataset.palette;
    document.querySelectorAll('[data-palette]').forEach((b) => b.classList.toggle('is-active', b === btn));
    render();
  });

  // Drag to pan the photo (mouse and touch via pointer events).
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    drag = {x: e.clientX, y: e.clientY, ox: state.offsetX, oy: state.offsetY};
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const scale = W / canvas.getBoundingClientRect().width;
    state.offsetX = drag.ox + (e.clientX - drag.x) * scale;
    state.offsetY = drag.oy + (e.clientY - drag.y) * scale;
    render();
  });
  canvas.addEventListener('pointerup', () => (drag = null));

  $('download').addEventListener('click', () => {
    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `saiyakat-poster-${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, 'image/png');
  });

  // Draw once fonts are ready so the script headline renders in the right typeface.
  Promise.all([
    document.fonts.load('152px "Marck Script"', 'Иссык-Куле'),
    document.fonts.load('500 24px Montserrat', 'А'),
    document.fonts.load('600 24px Montserrat', 'А'),
    document.fonts.load('400 24px Montserrat', 'А'),
  ]).finally(render);
  render();

  // Expose for automated previews: window.posterLoadPhoto(url)
  window.posterLoadPhoto = (url) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        state.img = img;
        render();
        resolve();
      };
      img.src = url;
    });
})();
