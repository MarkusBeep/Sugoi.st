(function () {
  'use strict';
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav__links a');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);

    const y = window.scrollY + 120;
    let current = '';
    sections.forEach(s => { if (s.offsetTop <= y) current = s.id; });
    navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + current));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const burger = document.getElementById('navBurger');
  const links  = document.querySelector('.nav__links');
  burger?.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    if (open) { links.removeAttribute('style'); return; }
    Object.assign(links.style, {
      display: 'flex', position: 'fixed',
      top: '70px', left: '20px', right: '20px',
      flexDirection: 'column', padding: '20px'
    });
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  const MOCKUPS = {
    camisetas: 'assets/mockups/camiseta-front.png',
    hoodies:   'assets/mockups/hoodie-front.png',
    estuches:  'assets/mockups/estuche-front.png'
  };

  const products = [
    { name: 'Bolt Tee Yellow',      cat: 'camisetas', price: 18, tag: 'NEW', color: '#ffe600' },
    { name: 'Cuenca Hoodie Navy',   cat: 'hoodies',   price: 42, tag: 'HOT', color: '#0a2db5' },
    { name: 'Voltage Case',         cat: 'estuches',  price: 12, tag: '',    color: '#ff3d8a' },
    { name: 'One Way Tee',          cat: 'camisetas', price: 18, tag: '',    color: '#1456ff' },
    { name: 'Astro Hoodie',         cat: 'hoodies',   price: 45, tag: 'NEW', color: '#ffe600' },
    { name: 'Sugoi Case Black',     cat: 'estuches',  price: 12, tag: '',    color: '#0a0a0a' },
    { name: 'Bacana Tee Pink',      cat: 'camisetas', price: 20, tag: 'HOT', color: '#ff3d8a' },
    { name: 'Padre Aguirre Hoodie', cat: 'hoodies',   price: 48, tag: '',    color: '#1456ff' }
  ];

  const grid = document.getElementById('catalogGrid');

  function renderProducts(filter = 'all') {
    grid.innerHTML = '';
    const list = products.filter(p => filter === 'all' || p.cat === filter);

    list.forEach((p, i) => {
      const el = document.createElement('article');
      el.className = 'product reveal';
      el.style.setProperty('--c', p.color);
      el.style.transitionDelay = (i * 50) + 'ms';
      const tagClass = p.tag === 'HOT' ? 'hot' : '';
      el.innerHTML = `
        ${p.tag ? `<span class="product__tag ${tagClass}">${p.tag}</span>` : ''}
        <div class="product__img">
          <img src="${MOCKUPS[p.cat]}" alt="${p.name}" loading="lazy" />
        </div>
        <div class="product__info">
          <div class="product__cat">${p.cat}</div>
          <div class="product__name">${p.name}</div>
          <div class="product__price">$${p.price.toFixed(2)}</div>
        </div>
      `;
      grid.appendChild(el);
      requestAnimationFrame(() => el.classList.add('is-visible'));
    });
    if (filter === 'all') {
      const cta = document.createElement('article');
      cta.className = 'product product--cta reveal';
      cta.innerHTML = `
        <h3>¿No ves<br/>lo tuyo?</h3>
        <p>Diséñala tú mismo en vivo, paso a paso.</p>
        <a href="pruebas.html" class="btn btn--dark btn--sm">Diseña ahora →</a>
      `;
      grid.appendChild(cta);
      requestAnimationFrame(() => cta.classList.add('is-visible'));
    }
  }
  renderProducts();
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      renderProducts(chip.dataset.filter);
    });
  });
  const ONOM = ['POW!', 'ZAP!', 'BAM!', 'BOOM!', 'WHAM!', 'SUGOI!', 'KAPOW!', 'CRACK!'];
  const ONOM_COLORS = ['c-pink', 'c-yellow', 'c-cream'];
  const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function spawnOnom(x, y) {
    const burst = document.createElement('div');
    burst.className = 'onom-burst ' + rnd(ONOM_COLORS);
    burst.textContent = rnd(ONOM);
    burst.style.left = x + 'px';
    burst.style.top  = y + 'px';
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 850);
  }
  document.body.addEventListener('mouseover', (e) => {
    const target = e.target.closest('.cat-card, .product, .btn--primary');
    if (!target) return;
    if (target.dataset.onomLast && Date.now() - +target.dataset.onomLast < 1400) return;
    target.dataset.onomLast = Date.now();
    const r = target.getBoundingClientRect();
    spawnOnom(r.left + r.width * (0.3 + Math.random() * 0.4),
              r.top  + Math.max(10, r.height * 0.15));
  });
  const form = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (!data.get('nombre') || !data.get('contacto')) {
      formMsg.textContent = '⚡ Completa al menos tu nombre y contacto.';
      formMsg.style.color = '#ef6b6b';
      return;
    }
    formMsg.textContent = '⚡ ¡Mensaje listo! Te respondemos rapidito.';
    formMsg.style.color = '#1456ff';
    form.reset();
    setTimeout(() => { formMsg.textContent = ''; }, 4000);
  });
  const disc = document.querySelector('.hero__disc');
  if (disc && window.matchMedia('(pointer: fine)').matches) {
    const hero = document.querySelector('.hero');
    hero?.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      disc.style.transform = `translate(${x * 14}px, ${y * 14}px)`;
    });
    hero?.addEventListener('mouseleave', () => { disc.style.transform = ''; });
  }

})();
