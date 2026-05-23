/* =========================================================
   SUGOI Store — main.js
   ========================================================= */

(function () {
  'use strict';

  // ----- Navbar scroll state + active link -----
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav__links a');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');

    // Active link
    const y = window.scrollY + 120;
    let current = '';
    sections.forEach(s => {
      if (s.offsetTop <= y) current = s.id;
    });
    navLinks.forEach(l => {
      l.classList.toggle('is-active', l.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Mobile menu -----
  const burger = document.getElementById('navBurger');
  const links = document.querySelector('.nav__links');
  burger?.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.display = open ? '' : 'flex';
    links.style.position = 'fixed';
    links.style.top = '70px';
    links.style.left = '20px';
    links.style.right = '20px';
    links.style.flexDirection = 'column';
    links.style.padding = '20px';
    if (open) links.removeAttribute('style');
  });

  // ----- Cursor glow (desktop only) -----
  const glow = document.getElementById('cursorGlow');
  if (glow && window.matchMedia('(pointer: fine)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });
    function loop() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();
  }

  // ----- Reveal on scroll -----
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ----- Catalog data + render -----
  const products = [
    { name: 'Bolt Tee Yellow',     cat: 'camisetas', price: 18, tag: 'NEW',  c1: '#ffe600', c2: '#1456ff' },
    { name: 'Cuenca Hoodie Navy',  cat: 'hoodies',   price: 42, tag: 'HOT',  c1: '#0a2db5', c2: '#ff3df0' },
    { name: 'Voltage Case',        cat: 'estuches',  price: 12, tag: '',     c1: '#ff3df0', c2: '#ffe600' },
    { name: 'One Way Tee',         cat: 'camisetas', price: 18, tag: '',     c1: '#1456ff', c2: '#00e5ff' },
    { name: 'Astro Hoodie',        cat: 'hoodies',   price: 45, tag: 'NEW',  c1: '#7d3dff', c2: '#1456ff' },
    { name: 'Sugoi Case Black',    cat: 'estuches',  price: 12, tag: '',     c1: '#050818', c2: '#ffe600' },
    { name: 'Bacana Tee Pink',     cat: 'camisetas', price: 20, tag: 'HOT',  c1: '#ff3df0', c2: '#ffe600' },
    { name: 'Padre Aguirre Hoodie',cat: 'hoodies',   price: 48, tag: '',     c1: '#0a2db5', c2: '#00e5ff' },
  ];

  const grid = document.getElementById('catalogGrid');
  function renderProducts(filter = 'all') {
    grid.innerHTML = '';
    products
      .filter(p => filter === 'all' || p.cat === filter)
      .forEach((p, i) => {
        const el = document.createElement('article');
        el.className = 'product reveal';
        el.style.setProperty('--c1', p.c1);
        el.style.setProperty('--c2', p.c2);
        el.style.transitionDelay = (i * 60) + 'ms';
        el.innerHTML = `
          ${p.tag ? `<span class="product__tag">${p.tag}</span>` : ''}
          <div class="product__img">
            <span class="product__bolt">⚡</span>
          </div>
          <div class="product__info">
            <div class="product__cat">${p.cat.toUpperCase()}</div>
            <div class="product__name">${p.name}</div>
            <div class="product__price">$${p.price.toFixed(2)}</div>
          </div>
        `;
        grid.appendChild(el);
        requestAnimationFrame(() => el.classList.add('is-visible'));
      });
  }
  renderProducts();

  // Filter chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      renderProducts(chip.dataset.filter);
    });
  });

  // ----- Lightning click effect -----
  document.addEventListener('click', (e) => {
    // Skip if clicking an interactive element where the effect would distract
    if (e.target.closest('input, textarea, select')) return;
    const spark = document.createElement('div');
    spark.textContent = '⚡';
    spark.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      font-size: 24px;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      animation: sparkOut 0.7s ease-out forwards;
      color: #ffe600;
      text-shadow: 0 0 12px #ffe600;
    `;
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 800);
  });

  // Inject spark keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes sparkOut {
      0%   { opacity: 1; transform: translate(-50%, -50%) scale(0.4) rotate(0deg); }
      50%  { opacity: 1; transform: translate(-50%, -150%) scale(1.4) rotate(180deg); }
      100% { opacity: 0; transform: translate(-50%, -240%) scale(0.6) rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // ----- Contact form -----
  const form = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (!data.get('nombre') || !data.get('contacto')) {
      formMsg.textContent = '⚡ Completa al menos tu nombre y contacto.';
      formMsg.style.color = '#ff6b6b';
      return;
    }
    formMsg.textContent = '⚡ ¡Mensaje listo! Te respondemos rapidito.';
    formMsg.style.color = '#ffe600';
    form.reset();
    setTimeout(() => { formMsg.textContent = ''; }, 4000);
  });

  // ----- Subtle parallax for hero visual -----
  const heroCircle = document.querySelector('.hero__circle');
  if (heroCircle && window.matchMedia('(pointer: fine)').matches) {
    document.querySelector('.hero')?.addEventListener('mousemove', (e) => {
      const rect = document.querySelector('.hero').getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroCircle.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
    });
  }

})();
