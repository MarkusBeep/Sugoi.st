(function () {
  'use strict';
  const ONOM_HOVER  = ['POW!','ZAP!','BAM!','WOW!','BOOM!','WHAM!','ZOOM!','SUGOI!','KAPOW!','CRACK!','BANG!'];
  const ONOM_CLICK  = ['POW!','ZAP!','BAM!','BOOM!','WHAM!','KAPOW!','BANG!','⚡!'];
  const BURST_COLORS = ['#ff3df0','#ffe600','#ff7a00','#ffffff','#00e5ff'];
  const rnd = (a) => a[Math.floor(Math.random()*a.length)];

  function spawnOnom(x, y) {
    const b = document.createElement('div');
    b.className = 'onom-burst color-' + (1 + Math.floor(Math.random()*5));
    b.textContent = rnd(ONOM_HOVER);
    b.style.left = x + 'px';
    b.style.top  = y + 'px';
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 900);
  }
  const HOVER_TARGETS = '.prod-btn, .color-swatch, .size-btn, .chip, .btn, .mini-btn, .upload-thumb, .social-link';
  document.body.addEventListener('mouseover', (e) => {
    const t = e.target.closest(HOVER_TARGETS);
    if (!t) return;
    if (t.dataset.onomLast && Date.now() - +t.dataset.onomLast < 800) return;
    t.dataset.onomLast = Date.now();
    const r = t.getBoundingClientRect();
    spawnOnom(r.left + r.width * (0.2 + Math.random()*0.6), r.top + Math.max(10, r.height * 0.15));
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('input, textarea, select, canvas, .design-layer, .handle, .stage')) return;
    const b = document.createElement('div');
    b.className = 'click-burst';
    const color = rnd(BURST_COLORS), word = rnd(ONOM_CLICK);
    b.innerHTML = `
      <svg class="click-burst__star" viewBox="0 0 140 140">
        <polygon points="70,5 81,42 120,28 95,60 135,68 95,80 120,112 81,98 70,135 59,98 20,112 45,80 5,68 45,60 20,28 59,42"
                 fill="${color}" stroke="#0a0a0a" stroke-width="4" stroke-linejoin="round"/>
      </svg>
      <span class="click-burst__text">${word}</span>`;
    b.style.left = e.clientX + 'px';
    b.style.top  = e.clientY + 'px';
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 800);
  });
  const COLORS = [
    { id: 'white',   hex: '#f5f5f5', name: 'Blanco' },
    { id: 'black',   hex: '#0a0a0a', name: 'Negro' },
    { id: 'gray',    hex: '#7a7a7a', name: 'Gris' },
    { id: 'navy',    hex: '#0a2db5', name: 'Azul Marino' },
    { id: 'blue',    hex: '#1456ff', name: 'Azul Sugoi' },
    { id: 'sky',     hex: '#3dd5ff', name: 'Celeste' },
    { id: 'red',     hex: '#e63946', name: 'Rojo' },
    { id: 'pink',    hex: '#ff3df0', name: 'Rosa' },
    { id: 'purple',  hex: '#7d3dff', name: 'Morado' },
    { id: 'green',   hex: '#22c55e', name: 'Verde' },
    { id: 'olive',   hex: '#6b7a3a', name: 'Verde Militar' },
    { id: 'yellow',  hex: '#ffe600', name: 'Amarillo' },
    { id: 'orange',  hex: '#ff7a00', name: 'Naranja' },
    { id: 'brown',   hex: '#8b5a2b', name: 'Café' },
    { id: 'beige',   hex: '#dcc9a3', name: 'Beige' },
    { id: 'mint',    hex: '#a8e6cf', name: 'Menta' },
    { id: 'coral',   hex: '#ff8a7a', name: 'Coral' },
    { id: 'teal',    hex: '#00b3a4', name: 'Turquesa' },
  ];
  const MOCKUPS = {
    camiseta: {
      front: { base: 'assets/mockups/camiseta-front.png', aspect: '1400 / 1050' },
      back:  { base: 'assets/mockups/camiseta-back.png',  aspect: '1400 / 1050' },
    },
    hoodie: {
      front: { base: 'assets/mockups/hoodie-front.png',   aspect: '1400 / 1225' },
      back:  { base: 'assets/mockups/hoodie-back.png',    aspect: '1400 / 1225' },
    },
    estuche: {
      front: {
        base: 'assets/mockups/estuche-front.png',
        fg:   'assets/mockups/estuche-front-fg.png',
        aspect: '1 / 1',
      },
    },
  };
  const PRINT_AREAS = {
    camiseta: {
      front: { x: 25, y: 14, w: 50, h: 72 },
      back:  { x: 23, y: 13, w: 54, h: 76 },
    },
    hoodie: {
      front: { x: 22, y: 25, w: 56, h: 60 },
      back:  { x: 22, y: 18, w: 56, h: 65 },
    },
    estuche: {
      front: { x: 32, y: 14, w: 36, h: 72 },
    },
  };
  const PRICES = {
    camiseta: 15,
    hoodie: 35,
    estuche: 10,
  };
  const SIZE_FEE = { S: 0, M: 0, L: 0, XL: 0, XXL: 3 };
  const state = {
    product: 'camiseta',
    color: 'white',
    view: 'front',
    size: 'S',
    phone: 'iPhone 15 Pro Max',
    designs: {
      front: [],
      back:  [],
    },
    selectedId: null,
    uploads: [],
  };
  const $ = (q, c = document) => c.querySelector(q);
  const $$ = (q, c = document) => Array.from(c.querySelectorAll(q));

  const stage         = $('#stage');
  const stageCanvas     = $('#stageCanvas');
  const stageForeground = $('#stageForeground');
  const printArea       = $('#printArea');
  const imageCache      = {};
  const colorGrid     = $('#colorGrid');
  const uploadsEl     = $('#uploads');
  const dropzone      = $('#dropzone');
  const fileInput     = $('#fileInput');
  const browseBtn     = $('#browseBtn');
  const sizePanel     = $('#sizePanel');
  const modelPanel    = $('#modelPanel');
  const viewSwitch    = $('#viewSwitch');
  const canvasHint    = $('#canvasHint');
  const ctrlEmpty     = $('#ctrlEmpty');
  const controlsWrap  = $('#controlsWrap');
  const sizeRange     = $('#sizeRange');
  const rotRange      = $('#rotRange');
  const opacityRange  = $('#opacityRange');
  const sizeVal       = $('#sizeVal');
  const rotVal        = $('#rotVal');
  const opacityVal    = $('#opacityVal');
  const centerBtn     = $('#centerBtn');
  const flipBtn       = $('#flipBtn');
  const deleteBtn     = $('#deleteBtn');
  const resetBtn      = $('#resetBtn');
  const quoteList     = $('#quoteList');
  const quoteTotal    = $('#quoteTotal');
  const requestBtn    = $('#requestQuoteBtn');
  const toast         = $('#toast');
  function init() {
    buildColorGrid();
    bindProductSwitch();
    bindSizeButtons();
    bindViewSwitch();
    bindDropzone();
    bindControls();
    bindQuoteButton();
    bindResetButton();

    render();
  }
  function buildColorGrid() {
    colorGrid.innerHTML = '';
    COLORS.forEach(c => {
      const sw = document.createElement('button');
      sw.className = 'color-swatch' + (c.id === state.color ? ' is-active' : '');
      sw.style.background = c.hex;
      sw.title = c.name;
      sw.dataset.color = c.id;
      sw.addEventListener('click', () => {
        state.color = c.id;
        $$('.color-swatch').forEach(s => s.classList.toggle('is-active', s.dataset.color === c.id));
        renderTemplate();
        updateQuote();
      });
      colorGrid.appendChild(sw);
    });
  }
  function bindProductSwitch() {
    $$('.prod-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.prod-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.product = btn.dataset.product;
        state.view = 'front';
        state.selectedId = null;
        state.designs = { front: [], back: [] };
        render();
      });
    });
  }

  function bindSizeButtons() {
    $$('.size-btn').forEach(b => {
      b.addEventListener('click', () => {
        $$('.size-btn').forEach(x => x.classList.remove('is-active'));
        b.classList.add('is-active');
        state.size = b.dataset.size;
        updateQuote();
      });
    });
    $('#phoneModel').addEventListener('change', (e) => {
      state.phone = e.target.value;
      updateQuote();
    });
  }
  function bindViewSwitch() {
    $$('.view-btn').forEach(b => {
      b.addEventListener('click', () => {
        if (b.disabled) return;
        state.view = b.dataset.view;
        state.selectedId = null;
        $$('.view-btn').forEach(x => x.classList.toggle('is-active', x === b));
        renderStage();
        renderControls();
      });
    });
  }
  function bindDropzone() {
    browseBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    ['dragenter', 'dragover'].forEach(ev => {
      dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add('is-drag'); });
      stage.addEventListener(ev, (e) => { e.preventDefault(); stage.classList.add('is-dropping'); });
    });
    ['dragleave', 'drop'].forEach(ev => {
      dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove('is-drag'); });
      stage.addEventListener(ev, (e) => { e.preventDefault(); stage.classList.remove('is-dropping'); });
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    });
    stage.addEventListener('drop', (e) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files, true);
    });
  }

  function handleFiles(files, autoPlace = false) {
    Array.from(files).forEach(file => {
      if (!/image\/(png|jpeg|jpg|svg\+xml)/.test(file.type)) {
        showToast('⚠ Solo PNG, JPG o SVG');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('⚠ Archivo demasiado grande (máx 10MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target.result;
        const img = new Image();
        img.onload = () => {
          const aspect = (img.naturalWidth > 0 && img.naturalHeight > 0)
            ? img.naturalWidth / img.naturalHeight
            : 1;
          const upload = {
            id: 'u' + Date.now() + Math.random().toString(36).slice(2, 6),
            src, name: file.name, aspect,
          };
          state.uploads.push(upload);
          renderUploads();
          if (autoPlace) addDesignToCanvas(upload);
          showToast('⚡ ' + file.name + ' listo');
        };
        img.onerror = () => showToast('⚠ No se pudo leer la imagen');
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  }

  function renderUploads() {
    uploadsEl.innerHTML = '';
    state.uploads.forEach(u => {
      const t = document.createElement('div');
      t.className = 'upload-thumb';
      t.title = 'Click para añadir al diseño';
      t.innerHTML = `
        <img src="${u.src}" alt="${u.name}" />
        <button class="upload-thumb__rm" title="Eliminar">×</button>
      `;
      t.addEventListener('click', (e) => {
        if (e.target.classList.contains('upload-thumb__rm')) {
          state.uploads = state.uploads.filter(x => x.id !== u.id);
          renderUploads();
          return;
        }
        addDesignToCanvas(u);
      });
      uploadsEl.appendChild(t);
    });
  }
  function addDesignToCanvas(upload) {
    const aspect = upload.aspect || 1;
    let w, h;
    if (aspect >= 1) {
      w = 60; h = w / aspect;
    } else {
      h = 60; w = h * aspect;
    }
    if (h > 80) { h = 80; w = h * aspect; }
    if (w > 80) { w = 80; h = w / aspect; }

    const d = {
      id: 'd' + Date.now() + Math.random().toString(36).slice(2, 6),
      src: upload.src,
      name: upload.name,
      x: 50 - w / 2,
      y: 50 - h / 2,
      w, h,
      rot: 0,
      opacity: 1,
      flipped: false,
    };
    state.designs[state.view].push(d);
    state.selectedId = d.id;
    renderStage();
    renderControls();
    updateQuote();
  }
  function render() {
    const isEstuche = state.product === 'estuche';
    sizePanel.style.display = isEstuche ? 'none' : '';
    modelPanel.style.display = isEstuche ? '' : 'none';
    const backBtn = viewSwitch.querySelector('[data-view="back"]');
    backBtn.disabled = isEstuche;
    if (isEstuche) {
      state.view = 'front';
      $$('.view-btn').forEach(x => x.classList.toggle('is-active', x.dataset.view === 'front'));
    }

    renderTemplate();
    renderStage();
    renderControls();
    updateQuote();
  }

  function loadImage(src) {
    if (imageCache[src]) return Promise.resolve(imageCache[src]);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload  = () => { imageCache[src] = img; resolve(img); };
      img.onerror = () => reject(new Error('Failed to load ' + src));
      img.src = src;
    });
  }

  function renderTemplate() {
    const hex    = (COLORS.find(c => c.id === state.color) || COLORS[0]).hex;
    const mockup = (MOCKUPS[state.product][state.view]) || MOCKUPS[state.product].front;
    stage.style.aspectRatio = mockup.aspect;
    const pa = (PRINT_AREAS[state.product][state.view]) || PRINT_AREAS[state.product].front;
    printArea.style.left   = pa.x + '%';
    printArea.style.top    = pa.y + '%';
    printArea.style.width  = pa.w + '%';
    printArea.style.height = pa.h + '%';
    printArea.classList.toggle('is-clipped', state.product === 'estuche');
    stageForeground.innerHTML = mockup.fg
      ? `<img src="${mockup.fg}" alt="" draggable="false" />`
      : '';
    loadImage(mockup.base).then(img => {
      stageCanvas.width  = img.naturalWidth;
      stageCanvas.height = img.naturalHeight;
      const ctx = stageCanvas.getContext('2d');
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, stageCanvas.width, stageCanvas.height);
      ctx.fillStyle = hex;
      ctx.fillRect(0, 0, stageCanvas.width, stageCanvas.height);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(img, 0, 0);
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(img, 0, 0);

      ctx.globalCompositeOperation = 'source-over';
    }).catch(err => {
      console.warn('[Sugoi] Could not render mockup:', err);
    });
  }

  function renderStage() {
    renderTemplate();
    printArea.innerHTML = '';
    const designs = state.designs[state.view] || [];
    designs.forEach(d => {
      const el = document.createElement('div');
      el.className = 'design-layer' + (d.id === state.selectedId ? ' is-selected' : '');
      el.dataset.id = d.id;
      el.style.left = d.x + '%';
      el.style.top = d.y + '%';
      el.style.width = d.w + '%';
      el.style.height = d.h + '%';
      el.style.transform = `rotate(${d.rot}deg) scaleX(${d.flipped ? -1 : 1})`;
      el.style.opacity = d.opacity;
      el.innerHTML = `
        <img src="${d.src}" alt="${d.name}" draggable="false" />
        <div class="handle handle-rot" data-action="rotate" title="Rotar"></div>
        <div class="handle handle-tl" data-action="resize" data-corner="tl"></div>
        <div class="handle handle-tr" data-action="resize" data-corner="tr"></div>
        <div class="handle handle-bl" data-action="resize" data-corner="bl"></div>
        <div class="handle handle-br" data-action="resize" data-corner="br"></div>
      `;
      makeInteractive(el, d);
      printArea.appendChild(el);
    });

    canvasHint.textContent = designs.length
      ? '✓ Arrastra · esquinas para escalar · ⬆ para rotar'
      : 'Sube y arrastra tu diseño al área punteada';
  }

  function renderControls() {
    const d = currentDesign();
    if (!d) {
      controlsWrap.style.display = 'none';
      ctrlEmpty.style.display = 'block';
      return;
    }
    controlsWrap.style.display = 'flex';
    ctrlEmpty.style.display = 'none';
    sizeRange.value = d.w;
    rotRange.value = d.rot;
    opacityRange.value = Math.round(d.opacity * 100);
    sizeVal.textContent = Math.round(d.w) + '%';
    rotVal.textContent = Math.round(d.rot) + '°';
    opacityVal.textContent = Math.round(d.opacity * 100) + '%';
  }

  function currentDesign() {
    if (!state.selectedId) return null;
    return state.designs[state.view].find(d => d.id === state.selectedId);
  }
  function makeInteractive(el, design) {
    el.addEventListener('pointerdown', (e) => {
      const handle = e.target.closest('.handle');
      if (handle && state.selectedId === design.id) {
        e.stopPropagation();
        e.preventDefault();
        const action = handle.dataset.action;
        if (action === 'resize') startResize(e, design, handle.dataset.corner);
        else if (action === 'rotate') startRotate(e, design);
        return;
      }
      if (state.selectedId !== design.id) {
        state.selectedId = design.id;
        $$('.design-layer', printArea).forEach(x => x.classList.toggle('is-selected', x.dataset.id === design.id));
        renderControls();
      }
      startDrag(e, el, design);
    });
  }

  function startDrag(e, el, design) {
    e.preventDefault();
    const rect = printArea.getBoundingClientRect();
    const startX = e.clientX, startY = e.clientY;
    const baseX = design.x, baseY = design.y;
    try { el.setPointerCapture(e.pointerId); } catch(_) {}

    function move(ev) {
      const dx = ((ev.clientX - startX) / rect.width) * 100;
      const dy = ((ev.clientY - startY) / rect.height) * 100;
      design.x = clamp(baseX + dx, -design.w * 0.6, 100 - design.w * 0.4);
      design.y = clamp(baseY + dy, -design.h * 0.6, 100 - design.h * 0.4);
      applyDesignStyle(design);
    }
    function up(ev) {
      try { el.releasePointerCapture(ev.pointerId); } catch(_) {}
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    }
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }

  function startResize(e, design, corner) {
    const rect = printArea.getBoundingClientRect();
    const anchor = {
      tl: { ax: design.x + design.w, ay: design.y + design.h },
      tr: { ax: design.x,            ay: design.y + design.h },
      bl: { ax: design.x + design.w, ay: design.y },
      br: { ax: design.x,            ay: design.y },
    }[corner];

    const aspect = design.w / design.h;
    const handle = e.target;
    try { handle.setPointerCapture(e.pointerId); } catch(_) {}

    function move(ev) {
      const px = ((ev.clientX - rect.left) / rect.width) * 100;
      const py = ((ev.clientY - rect.top)  / rect.height) * 100;
      let newW = Math.abs(px - anchor.ax);
      let newH = Math.abs(py - anchor.ay);
      if (newW / aspect > newH) newH = newW / aspect;
      else newW = newH * aspect;

      newW = clamp(newW, 8, 200);
      newH = clamp(newH, 8, 200);

      design.w = newW;
      design.h = newH;
      design.x = (corner === 'tl' || corner === 'bl') ? anchor.ax - newW : anchor.ax;
      design.y = (corner === 'tl' || corner === 'tr') ? anchor.ay - newH : anchor.ay;

      applyDesignStyle(design);
      sizeRange.value = Math.round(design.w);
      sizeVal.textContent = Math.round(design.w) + '%';
    }
    function up(ev) {
      try { handle.releasePointerCapture(ev.pointerId); } catch(_) {}
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
      updateQuote();
    }
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  }

  function startRotate(e, design) {
    const rect = printArea.getBoundingClientRect();
    const cx = rect.left + ((design.x + design.w / 2) / 100) * rect.width;
    const cy = rect.top  + ((design.y + design.h / 2) / 100) * rect.height;

    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
    const baseRot = design.rot;
    const handle = e.target;
    try { handle.setPointerCapture(e.pointerId); } catch(_) {}

    function move(ev) {
      const a = Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI;
      let rot = baseRot + (a - startAngle);
      while (rot > 180) rot -= 360;
      while (rot < -180) rot += 360;
      design.rot = rot;
      applyDesignStyle(design);
      rotRange.value = Math.round(rot);
      rotVal.textContent = Math.round(rot) + '°';
    }
    function up(ev) {
      try { handle.releasePointerCapture(ev.pointerId); } catch(_) {}
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
    }
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function bindControls() {
    sizeRange.addEventListener('input', () => {
      const d = currentDesign(); if (!d) return;
      const aspect = d.h > 0 ? d.w / d.h : 1;
      const cx = d.x + d.w / 2;
      const cy = d.y + d.h / 2;
      d.w = +sizeRange.value;
      d.h = d.w / aspect;
      d.x = cx - d.w / 2;
      d.y = cy - d.h / 2;
      sizeVal.textContent = Math.round(d.w) + '%';
      applyDesignStyle(d);
      updateQuote();
    });
    rotRange.addEventListener('input', () => {
      const d = currentDesign(); if (!d) return;
      d.rot = +rotRange.value;
      rotVal.textContent = d.rot + '°';
      applyDesignStyle(d);
    });
    opacityRange.addEventListener('input', () => {
      const d = currentDesign(); if (!d) return;
      d.opacity = +opacityRange.value / 100;
      opacityVal.textContent = opacityRange.value + '%';
      applyDesignStyle(d);
    });
    centerBtn.addEventListener('click', () => {
      const d = currentDesign(); if (!d) return;
      d.x = 50 - d.w/2; d.y = 50 - d.h/2;
      applyDesignStyle(d);
    });
    flipBtn.addEventListener('click', () => {
      const d = currentDesign(); if (!d) return;
      d.flipped = !d.flipped;
      applyDesignStyle(d);
    });
    deleteBtn.addEventListener('click', () => {
      const d = currentDesign(); if (!d) return;
      state.designs[state.view] = state.designs[state.view].filter(x => x.id !== d.id);
      state.selectedId = null;
      renderStage();
      renderControls();
      updateQuote();
    });
  }

  function applyDesignStyle(d) {
    const el = printArea.querySelector(`[data-id="${d.id}"]`);
    if (!el) return;
    el.style.left = d.x + '%';
    el.style.top = d.y + '%';
    el.style.width = d.w + '%';
    el.style.height = d.h + '%';
    el.style.transform = `rotate(${d.rot}deg) scaleX(${d.flipped ? -1 : 1})`;
    el.style.opacity = d.opacity;
  }
  function bindResetButton() {
    resetBtn.addEventListener('click', () => {
      if (!confirm('¿Reiniciar todos los diseños del lienzo?')) return;
      state.designs = { front: [], back: [] };
      state.selectedId = null;
      renderStage();
      renderControls();
      updateQuote();
      showToast('⚡ Lienzo limpio');
    });
  }
  function computeQuote() {
    const items = [];
    let total = PRICES[state.product];
    items.push({ label: productLabel(state.product), value: '$' + PRICES[state.product].toFixed(2) });

    if (state.product === 'estuche') {
      items.push({ label: 'Modelo', value: state.phone, plain: true });
    } else {
      items.push({ label: 'Talla', value: state.size, plain: true });
      if (SIZE_FEE[state.size]) {
        total += SIZE_FEE[state.size];
        items.push({ label: 'Talla ' + state.size, value: '+$' + SIZE_FEE[state.size].toFixed(2), extra: true });
      }
    }

    const colorName = (COLORS.find(c => c.id === state.color) || {}).name || '';
    items.push({ label: 'Color', value: colorName, plain: true });
    const fCount = state.designs.front.length;
    const bCount = state.designs.back.length;
    const totalDesigns = fCount + bCount;

    if (totalDesigns === 0) {
      items.push({ label: 'Diseño', value: '— (sube uno)', plain: true });
    } else {
      const allDesigns = [...state.designs.front, ...state.designs.back];
      const maxArea = Math.max(...allDesigns.map(d => d.w * d.h));
      let printFee = 0;
      let sizeLabel = 'Pequeño';
      if (maxArea > 2500) { printFee = 6; sizeLabel = 'Grande'; }
      else if (maxArea > 1200) { printFee = 3; sizeLabel = 'Mediano'; }

      total += printFee;
      items.push({ label: 'Impresión (' + sizeLabel + ')', value: printFee ? '+$' + printFee.toFixed(2) : 'Incluido', extra: !!printFee });
      if (state.product !== 'estuche' && fCount > 0 && bCount > 0) {
        total += 5;
        items.push({ label: 'Estampado doble cara', value: '+$5.00', extra: true });
      }
      const extraDesigns = Math.max(0, totalDesigns - (fCount > 0 ? 1 : 0) - (bCount > 0 ? 1 : 0));
      if (extraDesigns > 0) {
        const fee = extraDesigns * 2;
        total += fee;
        items.push({ label: 'Diseños extra (' + extraDesigns + ')', value: '+$' + fee.toFixed(2), extra: true });
      }
    }

    return { items, total };
  }

  function productLabel(p) {
    return { camiseta: 'Camiseta base', hoodie: 'Hoodie base', estuche: 'Estuche base' }[p];
  }

  function updateQuote() {
    const { items, total } = computeQuote();
    quoteList.innerHTML = items.map(it => `
      <li class="${it.extra ? 'is-extra' : ''}">
        <span>${it.label}</span>
        <strong>${it.value}</strong>
      </li>
    `).join('');
    quoteTotal.textContent = '$' + total.toFixed(2);
  }
  function bindQuoteButton() {
    requestBtn.addEventListener('click', () => {
      const { total } = computeQuote();
      const colorName = (COLORS.find(c => c.id === state.color) || {}).name || '';
      const totalDesigns = state.designs.front.length + state.designs.back.length;

      const lines = [
        '*COTIZACIÓN SUGOI* ⚡',
        '',
        '• Producto: ' + productLabel(state.product),
        '• Color: ' + colorName,
      ];
      if (state.product === 'estuche') {
        lines.push('• Modelo: ' + state.phone);
      } else {
        lines.push('• Talla: ' + state.size);
        lines.push('• Frente: ' + state.designs.front.length + ' diseño(s)');
        lines.push('• Espalda: ' + state.designs.back.length + ' diseño(s)');
      }
      lines.push('');
      lines.push('*Total estimado: $' + total.toFixed(2) + '*');
      lines.push('');
      lines.push('Hola! Quiero cotizar este diseño. Te envío las imágenes a continuación.');

      const msg = encodeURIComponent(lines.join('\n'));
      const wa = 'https://wa.me/593999181782?text=' + msg;

      if (totalDesigns === 0) {
        if (!confirm('Aún no has subido ningún diseño. ¿Continuar con la cotización base?')) return;
      }
      window.open(wa, '_blank');
      showToast('⚡ Abriendo WhatsApp...');
    });
  }
  let toastT;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('is-show'), 2400);
  }
  stage.addEventListener('click', (e) => {
    if (e.target === stage || e.target === stageTemplate || e.target.closest('svg')) {
      state.selectedId = null;
      renderStage();
      renderControls();
    }
  });
  init();

})();
