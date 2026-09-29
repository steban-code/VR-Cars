(function () {
  'use strict';

  const root = document.querySelector('.carrusel');
  const track = document.getElementById('track');
  const dotsWrap = document.getElementById('dots');
  if (!root || !track || !dotsWrap) return;

  const viewport = root.querySelector('.carrusel-viewport');
  const prevBtn = root.querySelector('.carrusel-btn.prev');
  const nextBtn = root.querySelector('.carrusel-btn.next');
  const slides = [...track.children];
  const total = slides.length;
  if (!total) return;

  const AUTOPLAY_MS = 6000;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let i = 0;
  let timer = null;
  let autoplay = !reduceMotion && total > 1; // se desactiva si el usuario interactúa
  const holds = { hover: false, focus: false, hidden: false, offscreen: false };

  /* ---------- Accesibilidad ---------- */
  root.setAttribute('role', 'region');
  root.setAttribute('aria-roledescription', 'carrusel');
  root.setAttribute('aria-label', 'Galería del taller');
  root.tabIndex = 0;

  slides.forEach((s, n) => {
    s.setAttribute('role', 'group');
    s.setAttribute('aria-roledescription', 'diapositiva');
    s.setAttribute('aria-label', (n + 1) + ' de ' + total);
  });

  /* ---------- Puntos ---------- */
  const dots = slides.map((_, n) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'dot';
    d.setAttribute('aria-label', 'Ir a la imagen ' + (n + 1));
    d.addEventListener('click', () => userGo(n));
    dotsWrap.appendChild(d);
    return d;
  });

  // Con una sola imagen no hacen falta controles
  if (total < 2) {
    [prevBtn, nextBtn, dotsWrap].forEach(el => el && (el.hidden = true));
  }

  /* ---------- Navegación ---------- */
  function go(n) {
    i = (n + total) % total;
    track.style.transform = 'translateX(' + (-i * 100) + '%)';
    dots.forEach((d, idx) => {
      const on = idx === i;
      d.classList.toggle('active', on);
      if (on) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    slides.forEach((s, idx) => s.setAttribute('aria-hidden', idx === i ? 'false' : 'true'));
  }

  // Navegación hecha por la persona: detiene el autoplay para siempre
  function userGo(n) {
    autoplay = false;
    stop();
    go(n);
  }

  prevBtn && prevBtn.addEventListener('click', () => userGo(i - 1));
  nextBtn && nextBtn.addEventListener('click', () => userGo(i + 1));

  /* ---------- Teclado ---------- */
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); userGo(i - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); userGo(i + 1); }
    else if (e.key === 'Home') { e.preventDefault(); userGo(0); }
    else if (e.key === 'End') { e.preventDefault(); userGo(total - 1); }
  });

  /* ---------- Deslizar con el dedo o el mouse ---------- */
  let dragging = false;
  let startX = 0;
  let dx = 0;
  let startTime = 0;

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';
    const width = viewport.clientWidth || 1;
    const elapsed = Math.max(Date.now() - startTime, 1);
    const fast = Math.abs(dx) / elapsed > 0.5 && Math.abs(dx) > 30; // gesto rápido
    const far = Math.abs(dx) > width * 0.15;                        // gesto largo
    if (e.type !== 'pointercancel' && (far || fast)) userGo(i + (dx < 0 ? 1 : -1));
    else go(i); // vuelve a su lugar
    dx = 0;
  }

  if (viewport && total > 1) {
    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      dx = 0;
      startTime = Date.now();
      track.style.transition = 'none'; // la pista sigue al dedo sin retraso
      viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dx = e.clientX - startX;
      track.style.transform = 'translateX(calc(' + (-i * 100) + '% + ' + dx + 'px))';
    });
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('dragstart', (e) => e.preventDefault());
  }

  /* ---------- Autoplay (se pausa cuando molestaría) ---------- */
  function play() {
    if (timer || !autoplay) return;
    timer = setInterval(() => go(i + 1), AUTOPLAY_MS);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
  }
  function refresh() {
    if (Object.values(holds).some(Boolean)) stop();
    else play();
  }

  root.addEventListener('mouseenter', () => { holds.hover = true; refresh(); });
  root.addEventListener('mouseleave', () => { holds.hover = false; refresh(); });
  root.addEventListener('focusin', () => { holds.focus = true; refresh(); });
  root.addEventListener('focusout', () => { holds.focus = false; refresh(); });
  document.addEventListener('visibilitychange', () => {
    holds.hidden = document.hidden;
    refresh();
  });

  if ('IntersectionObserver' in window) {
    // solo avanza mientras el carrusel está en pantalla
    holds.offscreen = true;
    new IntersectionObserver(([entry]) => {
      holds.offscreen = !entry.isIntersecting;
      refresh();
    }, { threshold: 0.4 }).observe(root);
  }

  /* ---------- Inicio ---------- */
  go(0);
  refresh();
})();