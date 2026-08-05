// app.js — Mapa Interactivo FIUBA

// app.js — Mapa Interactivo FIUBA

// ═══════════════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════════════
const state = {
  currentFloor: null,
  highlighted: [],     // [{ id, cls }]
  vb: { x:0, y:0, w:0, h:0 },
  vbOrig: null,
};

// ═══════════════════════════════════════════════════
// REFS
// ═══════════════════════════════════════════════════
const $  = id => document.getElementById(id);
const el = {
  header:        $('header')            || document.querySelector('.header'),
  searchWrapper: $('search-wrapper'),
  searchInput:   $('search-input'),
  searchClear:   $('search-clear'),
  searchResults: $('search-results'),
  floorNav:      $('floor-nav'),
  svgWrapper:    $('svg-wrapper'),
  placeholder:   $('map-placeholder'),
  floorBadge:    $('floor-badge'),
  detailPanel:   $('detail-panel'),
  detailClose:   $('detail-close'),
  detailIcon:    $('detail-icon'),
  detailName:    $('detail-name'),
  detailMeta:    $('detail-meta'),
  toast:         $('toast'),
  banner:        $('capture-banner'),
  bannerClose:   $('capture-close'),
  zoomIn:        $('zoom-in'),
  zoomOut:       $('zoom-out'),
  zoomReset:     $('zoom-reset'),
  mesaFab:       $('mesa-fab'),
};

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
function initLayerDefaults() {
  ['aula', 'espacio', 'laboratorio'].forEach(layer => {
    const btn = document.querySelector(`.layer-btn[data-layer="${layer}"]`);
    if (!btn) return;
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    el.svgWrapper.classList.add(`layer-${layer}`);
  });
  el.svgWrapper.classList.add('layer-active');
}

function setupMesaFab() {
  el.mesaFab?.addEventListener('click', () => {
    const mesa = ESPACIOS.find(e => e.svgId === 'mesa-proyecto-ing');
    if (!mesa) return;
    const needsFloorChange = mesa.piso !== state.currentFloor;
    if (needsFloorChange) loadFloor(mesa.piso);
    setTimeout(() => showDetail(mesa), needsFloorChange ? 600 : 0);
  });
}

function init() {
  buildFloorNav();
  setupSearch();
  setupLayerToggles();
  initLayerDefaults();
  setupMesaFab();
  setupZoom();
  setupDetail();
  setupCapture();
  loadFloor(Object.keys(PISOS)[1]); // arranca en Planta Baja
  setTimeout(() => maybeShowBanner(), 15000); // fallback si no hubo interacción
}

// ═══════════════════════════════════════════════════
// NAV DE PISOS
// ═══════════════════════════════════════════════════
function buildFloorNav() {
  Object.entries(PISOS).forEach(([key, piso]) => {
    const btn = document.createElement('button');
    btn.className   = 'floor-tab';
    btn.dataset.floor = key;
    btn.textContent = piso.nombre;
    btn.setAttribute('role', 'tab');
    btn.addEventListener('click', () => {
      clearSearch();
      clearHighlights();
      loadFloor(key);
    });
    el.floorNav.appendChild(btn);
  });
}

function setActiveTab(key) {
  document.querySelectorAll('.floor-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.floor === key)
  );
  const active = el.floorNav.querySelector('.floor-tab.active');
  active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  if (el.floorBadge) el.floorBadge.textContent = PISOS[key]?.nombre ?? '';
}

// ═══════════════════════════════════════════════════
// CARGA DE SVG
// ═══════════════════════════════════════════════════
async function loadFloor(key, { silent = false } = {}) {
  if (state.currentFloor === key) return;
  const prevFloor = state.currentFloor;
  state.currentFloor = key;
  setActiveTab(key);
  clearHighlights();

  const piso = PISOS[key];
  if (!silent) {
    el.svgWrapper.innerHTML = `
      <div class="map-placeholder">
        <div class="map-placeholder__icon">⏳</div>
        <p>${piso.nombre}…</p>
      </div>`;
  }

  try {
    const res = await fetch(piso.svg);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const text   = await res.text();
    const parser = new DOMParser();
    const doc    = parser.parseFromString(text, 'image/svg+xml');
    const svg    = doc.querySelector('svg');
    if (!svg) throw new Error('SVG inválido');

    // Make responsive
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    if (!svg.getAttribute('viewBox')) svg.setAttribute('viewBox', '0 0 1000 780');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.cssText = 'width:100%;height:100%;display:block;';

    const vbArr = svg.getAttribute('viewBox').split(/[\s,]+/).map(Number);
    state.vb     = { x: vbArr[0], y: vbArr[1], w: vbArr[2], h: vbArr[3] };
    state.vbOrig = { ...state.vb };

    el.svgWrapper.innerHTML = '';
    el.svgWrapper.appendChild(svg);

    setupRoomClickHandlers(svg);
    setupLayerTags(svg, key);
    setupPanZoom(svg);

  } catch (err) {
    state.currentFloor = prevFloor;
    setActiveTab(prevFloor);
    el.svgWrapper.innerHTML = `
      <div class="map-placeholder">
        <div class="map-placeholder__icon">⚠️</div>
        <p>No se pudo cargar ${piso.nombre}</p>
      </div>`;
    console.error(err);
  }
}

// ═══════════════════════════════════════════════════
// CLICK EN AULAS DENTRO DEL SVG
// Soporta dos formatos:
//   Viejo: <g class="espacio" id="...">
//   Nuevo: <path/rect/polygon id="..."> dentro de #Zonas_interactivas
// ═══════════════════════════════════════════════════
function setupRoomClickHandlers(svg) {
  svg.addEventListener('click', e => {
    // Formato viejo — <g class="espacio">
    let target = e.target.closest('.espacio');

    // Formato nuevo — elemento con ID dentro del grupo interactivo del SVG real
    if (!target) {
      const zona = e.target.closest('[id$="nteractivas"]');
      if (zona) {
        let node = e.target;
        while (node && node !== zona) {
          if (node.id) { target = node; break; }
          node = node.parentElement;
        }
      }
    }

    if (!target || !target.id) return;
    const espacio = ESPACIOS.find(s => s.svgId === target.id);
    if (espacio) showDetail(espacio);
  });
}

// ═══════════════════════════════════════════════════
// BÚSQUEDA
// ═══════════════════════════════════════════════════
function setupSearch() {
  el.searchInput.addEventListener('input',  handleInput);
  el.searchInput.addEventListener('focus',  () => { if (el.searchInput.value) showDropdown(el.searchInput.value); });
  el.searchClear.addEventListener('click',  clearSearch);
  el.searchInput.addEventListener('keydown', e => {
    const items = el.searchResults.querySelectorAll('.search-result-item');
    const cur   = el.searchResults.querySelector('[tabindex="0"]:focus');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      (cur ? cur.nextElementSibling : items[0])?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      (cur ? cur.previousElementSibling : items[items.length-1])?.focus();
    } else if (e.key === 'Escape') {
      clearSearch();
    }
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('#search-wrapper')) hideDropdown();
  });
}

function handleInput(e) {
  const q = e.target.value.trim();
  el.searchClear.hidden = q.length === 0;
  if (!q) { hideDropdown(); clearHighlights(); return; }
  showDropdown(q);
}

function showDropdown(q) {
  const results = buscar(q);
  el.searchResults.innerHTML = '';

  if (!results.length) {
    el.searchResults.innerHTML = `<li class="result-no-match">Sin resultados para "<b>${escHtml(q)}</b>"</li>`;
    el.searchResults.classList.add('visible');
    return;
  }

  results.forEach(esp => {
    const li = document.createElement('li');
    li.className = 'search-result-item';
    li.setAttribute('role', 'option');
    li.setAttribute('tabindex', '0');
    li.innerHTML = `
      <span class="result-name">${hilite(esp.nombre, q)}</span>
      <span class="result-meta">
        <span>${PISOS[esp.piso]?.nombre ?? esp.piso}</span>
        <span>${esp.sector}</span>
      </span>`;
    const select = () => selectResult(esp);
    li.addEventListener('click',   select);
    li.addEventListener('keydown', e => { if (e.key === 'Enter') select(); });
    el.searchResults.appendChild(li);
  });

  el.searchResults.classList.add('visible');
}

function hideDropdown() { el.searchResults.classList.remove('visible'); }

function clearSearch() {
  el.searchInput.value = '';
  el.searchClear.hidden = true;
  hideDropdown();
  clearHighlights();
}

async function selectResult(esp) {
  el.searchInput.value  = esp.nombre;
  el.searchClear.hidden = false;
  hideDropdown();
  el.searchInput.blur();

  if (state.currentFloor !== esp.piso) {
    await loadFloor(esp.piso);
    await wait(120);
  }

  clearHighlights();
  const type = esp.tipo === 'especial' ? 'especial' : 'single';
  highlight(esp.svgId, type);
  zoomedBySearch = true;
  scrollToEl(esp.svgId);
  showDetail(esp);
}

// ═══════════════════════════════════════════════════
// BÚSQUEDA FUZZY
// ═══════════════════════════════════════════════════
function buscar(q) {
  const n = norm(q);
  return ESPACIOS.filter(e => {
    const base   = norm(e.nombre);
    const keys   = (e.palabrasClave || []).join(' ');
    return base.includes(n) || norm(keys).includes(n);
  }).slice(0, 9);
}

function norm(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function hilite(text, q) {
  const safe  = escHtml(text);
  const re    = new RegExp(`(${escRegex(q)})`, 'gi');
  return safe.replace(re, '<mark>$1</mark>');
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function escRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ═══════════════════════════════════════════════════
// CAPAS DEL MAPA
// ═══════════════════════════════════════════════════

// Inyecta data-tipo en cada elemento del SVG usando data.js
function setupLayerTags(svg, floorKey) {
  // Inyectar desde data.js
  ESPACIOS.filter(e => e.piso === floorKey).forEach(esp => {
    const node = svg.querySelector(`#${CSS.escape(esp.svgId)}`);
    if (node) node.dataset.tipo = esp.tipo;
  });
  // Fallback: derivar tipo desde prefijo del ID para elementos sin entry en data.js
  const zona = svg.querySelector('[id$="nteractivas"]');
  if (!zona) return;
  zona.querySelectorAll('[id]').forEach(node => {
    if (node.dataset.tipo) return;
    const id = node.id;
    if      (id.startsWith('aula_'))        node.dataset.tipo = 'aula';
    else if (id.startsWith('laboratorio_')) node.dataset.tipo = 'laboratorio';
    else if (id.startsWith('espacio_'))     node.dataset.tipo = 'espacio';
    else if (id.startsWith('banio_'))       node.dataset.tipo = 'bano';
  });
}

// Toggle chips de capa: activa/desactiva visibilidad por tipo
function setupLayerToggles() {
  document.querySelectorAll('.layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const layer    = btn.dataset.layer;
      const isActive = btn.classList.toggle('active');
      btn.setAttribute('aria-pressed', isActive);
      el.svgWrapper.classList.toggle(`layer-${layer}`, isActive);
      // layer-active solo filtra zonas interactivas (no evacuacion)
      const anyZona = [...document.querySelectorAll('.layer-btn.active')]
        .some(b => b.dataset.layer !== 'evacuacion');
      el.svgWrapper.classList.toggle('layer-active', anyZona);
    });
  });
}

// ═══════════════════════════════════════════════════
// HIGHLIGHT SVG
// ═══════════════════════════════════════════════════
function getSVG() { return el.svgWrapper.querySelector('svg'); }

function highlight(svgId, type = 'single') {
  const svg = getSVG();
  if (!svg) return;

  const g = svg.querySelector(`#${CSS.escape(svgId)}`);
  if (!g) { console.warn(`SVG #${svgId} no encontrado`); return; }

  // Detecta si el elemento es parte del SVG real (Illustrator)
  // vs el SVG esquemático (g.espacio wrapper)
  const inZonas = !!g.closest('[id$="nteractivas"]');

  let cls;
  if (inZonas) {
    cls = type === 'multi' ? 'resaltado-multi' : 'resaltado';
  } else {
    cls = type === 'single'   ? 'svg-highlight'
        : type === 'especial' ? 'svg-especial-highlight'
        : 'svg-multi-highlight';
  }

  g.classList.add(cls);
  state.highlighted.push({ id: svgId, cls });
}

function clearHighlights() {
  const svg = getSVG();
  if (svg) {
    state.highlighted.forEach(({ id, cls }) => {
      svg.querySelector(`#${CSS.escape(id)}`)?.classList.remove(cls);
    });
  }
  state.highlighted = [];
}

function scrollToEl(svgId) {
  const svg = getSVG();
  if (!svg) return;
  const el  = svg.querySelector(`#${CSS.escape(svgId)}`);
  if (!el)  return;
  try {
    const bb = el.getBBox();
    const pad = Math.min(state.vb.w, state.vb.h) * .25;
    const nw  = bb.width  + pad * 2;
    const nh  = bb.height + pad * 2;
    const nx  = bb.x - pad;
    const ny  = bb.y - pad;
    animateVB(svg, { x: nx, y: ny, w: nw, h: nh });
  } catch (_) {}
}

// ═══════════════════════════════════════════════════
// DETAIL PANEL
// ═══════════════════════════════════════════════════
const ICONS = {
  aula:       '🏫',
  laboratorio:'🔬',
  comedor:    '🍽️',
  bano:       '🚻',
  biblioteca: '📚',
  tramites:   '📋',
  especial:   '⚙️',
  otro:       '📍',
};

function setupDetail() {
  el.detailClose?.addEventListener('click', hideDetail);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideDetail();
  });
}

function showDetail(esp) {
  if (!el.detailPanel) return;
  el.detailIcon.textContent = ICONS[esp.tipo] ?? '📍';
  el.detailName.textContent = esp.nombre;
  el.detailMeta.textContent = `${PISOS[esp.piso]?.nombre ?? esp.piso} · ${esp.sector}`;
  el.detailPanel.classList.add('visible');
  el.detailPanel.setAttribute('aria-hidden', 'false');
  updateFabVisibility();
  setTimeout(maybeShowBanner, 3000); // muestra banner 3s después de la primera interacción real
}

function hideDetail() {
  el.detailPanel?.classList.remove('visible');
  el.detailPanel?.setAttribute('aria-hidden', 'true');
  clearHighlights();
  updateFabVisibility();
  if (zoomedBySearch) {
    zoomedBySearch = false;
    const svg = getSVG();
    if (svg) resetZoom(svg);
  }
}

function updateFabVisibility() {
  const detailOpen = el.detailPanel?.classList.contains('visible');
  const bannerOpen = el.banner?.classList.contains('visible');
  el.mesaFab?.classList.toggle('fab-hidden', !!(detailOpen || bannerOpen));
}

// ═══════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════
let toastTimer;
function showToast(msg) {
  if (!el.toast) return;
  clearTimeout(toastTimer);
  el.toast.textContent = msg;
  el.toast.classList.add('show');
  toastTimer = setTimeout(() => el.toast.classList.remove('show'), 3000);
}

// ═══════════════════════════════════════════════════
// CAPTURA DE EMAIL (Supabase)
// ═══════════════════════════════════════════════════
let bannerShown   = false;
let zoomedBySearch = false;
function maybeShowBanner() {
  if (bannerShown) return;
  bannerShown = true;
  el.banner?.classList.add('visible');
  updateFabVisibility();
}

function setupCapture() {
  el.bannerClose?.addEventListener('click', () => {
    el.banner.classList.remove('visible');
    updateFabVisibility();
  });
}

// ═══════════════════════════════════════════════════
// PAN & ZOOM (touch + mouse + rueda)
// ═══════════════════════════════════════════════════
let panCleanup = null;

function setupPanZoom(svg) {
  if (panCleanup) panCleanup();
  let isPanning   = false;
  let lastPos     = null;
  let lastPinch   = null;
  let wasPinching = false;
  let lastTap     = 0;

  // ─── Touch ───
  svg.addEventListener('touchstart', e => {
    e.preventDefault();
    if (e.touches.length === 1) {
      isPanning = true;
      lastPos   = ptFromTouch(e.touches[0]);
    } else if (e.touches.length === 2) {
      isPanning   = false;
      wasPinching = true;
      lastPinch   = pinchDist(e.touches[0], e.touches[1]);
    }
  }, { passive: false });

  svg.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && isPanning && lastPos) {
      const cur = ptFromTouch(e.touches[0]);
      pan(svg, lastPos, cur);
      hideDetail(); // cierra panel solo si el usuario realmente arrastra
      lastPos = cur;
    } else if (e.touches.length === 2 && lastPinch) {
      const dist = pinchDist(e.touches[0], e.touches[1]);
      const mid  = midPoint(e.touches[0], e.touches[1]);
      zoomAt(svg, mid.x, mid.y, lastPinch / dist);
      lastPinch = dist;
    }
  }, { passive: false });

  svg.addEventListener('touchend', e => {
    if (e.touches.length < 2) lastPinch = null;
    if (e.touches.length === 0) {
      isPanning = false;
      if (wasPinching) {
        wasPinching = false;
        lastTap = 0; // evita falso doble-tap al levantar dedos del pinch
        return;
      }
      const now = Date.now();
      if (now - lastTap < 280 && e.changedTouches.length === 1) resetZoom(svg);
      lastTap = now;
    }
  });

  // ─── Mouse ───
  svg.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    isPanning = true;
    lastPos   = { x: e.clientX, y: e.clientY };
    el.svgWrapper.classList.add('panning');
  });
  const onMouseMove = e => {
    if (!isPanning || !lastPos) return;
    const cur = { x: e.clientX, y: e.clientY };
    pan(svg, lastPos, cur);
    lastPos = cur;
  };
  const onMouseUp = () => {
    isPanning = false;
    lastPos   = null;
    el.svgWrapper?.classList.remove('panning');
  };
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup',   onMouseUp);
  panCleanup = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup',   onMouseUp);
  };

  svg.addEventListener('wheel', e => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 1.15 : 0.87;
    zoomAt(svg, e.clientX, e.clientY, scale);
  }, { passive: false });

}

function pan(svg, from, to) {
  const rect   = svg.getBoundingClientRect();
  const scaleX = state.vb.w / rect.width;
  const scaleY = state.vb.h / rect.height;
  state.vb.x  -= (to.x - from.x) * scaleX;
  state.vb.y  -= (to.y - from.y) * scaleY;
  applyVB(svg);
}

function zoomAt(svg, cx, cy, scale) {
  const rect = svg.getBoundingClientRect();
  const ptX  = state.vb.x + (cx - rect.left) / rect.width  * state.vb.w;
  const ptY  = state.vb.y + (cy - rect.top)  / rect.height * state.vb.h;

  const minW = state.vbOrig.w * .15;
  const maxW = state.vbOrig.w * 4;
  const nw   = Math.min(Math.max(state.vb.w * scale, minW), maxW);
  const nh   = Math.min(Math.max(state.vb.h * scale, minW * (state.vbOrig.h / state.vbOrig.w)), maxW);
  const sw   = nw / state.vb.w;
  const sh   = nh / state.vb.h;

  state.vb.x = ptX - (ptX - state.vb.x) * sw;
  state.vb.y = ptY - (ptY - state.vb.y) * sh;
  state.vb.w = nw;
  state.vb.h = nh;
  applyVB(svg);
}

function applyVB(svg) {
  svg.setAttribute('viewBox', `${state.vb.x} ${state.vb.y} ${state.vb.w} ${state.vb.h}`);
}

function resetZoom(svg) {
  if (state.vbOrig) animateVB(svg, { ...state.vbOrig });
}

function animateVB(svg, target, dur = 380) {
  const start = { ...state.vb };
  const t0    = performance.now();
  function step(t) {
    const p   = Math.min((t - t0) / dur, 1);
    const e   = p < .5 ? 2*p*p : -1+(4-2*p)*p; // easeInOut
    state.vb  = {
      x: start.x + (target.x - start.x) * e,
      y: start.y + (target.y - start.y) * e,
      w: start.w + (target.w - start.w) * e,
      h: start.h + (target.h - start.h) * e,
    };
    applyVB(svg);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ═══════════════════════════════════════════════════
// ZOOM BUTTONS
// ═══════════════════════════════════════════════════
function setupZoom() {
  el.zoomIn?.addEventListener('click', () => {
    const svg = getSVG(); if (!svg) return;
    const c = svgCenter(svg); zoomAt(svg, c.x, c.y, .72);
  });
  el.zoomOut?.addEventListener('click', () => {
    const svg = getSVG(); if (!svg) return;
    const c = svgCenter(svg); zoomAt(svg, c.x, c.y, 1.38);
  });
  el.zoomReset?.addEventListener('click', () => {
    const svg = getSVG(); if (svg) resetZoom(svg);
  });
}

function svgCenter(svg) {
  const r = svg.getBoundingClientRect();
  return { x: r.left + r.width/2, y: r.top + r.height/2 };
}

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
function ptFromTouch(t) { return { x: t.clientX, y: t.clientY }; }
function pinchDist(a, b) { return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY); }
function midPoint(a, b)  { return { x: (a.clientX+b.clientX)/2, y: (a.clientY+b.clientY)/2 }; }
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

// ═══════════════════════════════════════════════════
// ARRANQUE
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);
