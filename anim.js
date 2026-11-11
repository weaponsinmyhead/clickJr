(function () {
  const noop = { view() {}, gate() {}, cards() {} };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.split').forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(/\s+/).forEach((word, i, all) => {
      const outer = document.createElement('span');
      outer.className = 'w';
      outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.className = 'wi';
      inner.textContent = word;
      outer.append(inner);
      el.append(outer);
      if (i < all.length - 1) el.append(' ');
    });
  });

  if (reduce || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    window.ClickJRAnim = noop;
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('anim');
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // If the browser stops producing frames (background tab, thumbnail capture), jump to the end state.
  function ensure(anim, ms) {
    setTimeout(() => { if (anim && anim.progress() < 1) anim.progress(1); }, ms);
    return anim;
  }

  /* ---------- Sentence words light up while scrolling ---------- */
  document.querySelectorAll('.sentence p').forEach((p) => {
    const words = p.textContent.trim().split(/\s+/);
    p.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'sw';
      s.textContent = w;
      p.append(s);
      if (i < words.length - 1) p.append(' ');
    });
    gsap.fromTo(p.querySelectorAll('.sw'), { opacity: 0.38 }, {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: { trigger: p, start: 'top 85%', end: 'top 40%', scrub: true },
    });
  });

  /* ---------- Progress bar + header state ---------- */
  gsap.to('.progress span', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });
  const header = document.querySelector('.site-header');
  ScrollTrigger.create({
    start: 60,
    end: 'max',
    onToggle: (self) => header.classList.toggle('is-scrolled', self.isActive),
  });

  /* ---------- Parallax scenes ---------- */
  function layersOf(host) { return host ? [...host.children] : []; }

  document.querySelectorAll('.hero').forEach((hero) => {
    const layers = layersOf(hero.querySelector('.scene'));
    const n = layers.length;
    layers.forEach((c, i) => {
      const depth = (n - 1 - i) / (n - 1);
      gsap.to(c, {
        yPercent: 4 + depth * 9,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    });
    gsap.to(hero.querySelector('.hero-inner'), {
      yPercent: -10,
      opacity: 0.35,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  });

  const gateEl = document.getElementById('gate');
  const gateLayers = layersOf(gateEl.querySelector('.scene'));
  if (finePointer) {
    const movers = gateLayers.map((c, i) => {
      const depth = i / (gateLayers.length - 1);
      return {
        depth,
        x: gsap.quickTo(c, 'x', { duration: 1.2, ease: 'power3.out' }),
        y: gsap.quickTo(c, 'y', { duration: 1.2, ease: 'power3.out' }),
      };
    });
    gateEl.addEventListener('pointermove', (e) => {
      const px = e.clientX / window.innerWidth - 0.5;
      const py = e.clientY / window.innerHeight - 0.5;
      movers.forEach((m) => {
        m.x(-px * (6 + m.depth * 34));
        m.y(-py * (4 + m.depth * 14));
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealSel = [
    '.section-head > *', '.stages li', '.steps li', '.rule', '.proposal > *', '.demo',
    '.diagram-head', '.diagram-scroll', '.diagram-text', '.details-head', '.acc details',
    '.ficha div', '.origin', '.site-footer .wrap > *',
  ].join(',');
  const revealEls = gsap.utils.toArray(revealSel);
  gsap.set(revealEls, { opacity: 0, y: 36 });
  ScrollTrigger.batch(revealEls, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => ensure(gsap.to(batch, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, overwrite: true,
    }), 2500),
  });

  gsap.utils.toArray('.deco').forEach((d) => {
    const speed = parseFloat(d.dataset.speed || '1');
    gsap.to(d, {
      y: -90 * speed,
      ease: 'none',
      scrollTrigger: { trigger: d.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  gsap.from('.footer-mascot', {
    y: 60, rotation: -25, duration: 0.9, ease: 'back.out(2)',
    scrollTrigger: { trigger: '.site-footer', start: 'top 95%', once: true },
  });

  /* ---------- Stage map: mascot walks the track ---------- */
  const stagesWrap = document.querySelector('.stages-wrap');
  const stageItems = stagesWrap ? [...stagesWrap.querySelectorAll('.stages li')] : [];
  const mm = gsap.matchMedia();
  mm.add('(min-width: 981px)', () => {
    stagesWrap.classList.add('is-animated');
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stagesWrap,
        start: 'top 75%',
        end: 'bottom 45%',
        scrub: 0.6,
        onUpdate: (self) => {
          const idx = Math.round(self.progress * (stageItems.length - 1));
          stageItems.forEach((li, i) => li.classList.toggle('is-lit', i <= idx));
        },
      },
    });
    tl.fromTo('.stages-fill', { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
      .fromTo('.traveler', { left: '10%' }, { left: '90%', ease: 'none' }, 0);
    return () => {
      stagesWrap.classList.remove('is-animated');
      stageItems.forEach((li) => li.classList.remove('is-lit'));
    };
  });

  /* ---------- Diagrams draw following the flow ---------- */
  document.querySelectorAll('svg.dg').forEach((svg) => {
    const parts = [...svg.children].filter((n) => !['title', 'desc', 'defs'].includes(n.tagName));
    gsap.set(parts, { opacity: 0 });
    ScrollTrigger.create({
      trigger: svg,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        const tl = ensure(gsap.timeline(), 4500);
        parts.forEach((el) => {
          const isText = el.tagName === 'text' || el.classList.contains('lbl-box');
          if (el.classList.contains('edge') && !el.classList.contains('edge-dash')) {
            const len = el.getTotalLength();
            gsap.set(el, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
            tl.to(el, {
              strokeDashoffset: 0,
              duration: 0.32,
              ease: 'power1.inOut',
              onComplete: () => { el.style.strokeDasharray = ''; el.style.strokeDashoffset = ''; },
            }, '>-0.04');
          } else {
            tl.fromTo(el, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }, isText ? '<0.03' : '>-0.06');
          }
        });
      },
    });
  });

  /* ---------- Smooth accordion ---------- */
  document.querySelectorAll('.acc details').forEach((d) => {
    const summary = d.querySelector('summary');
    const body = d.querySelector('.body');
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) {
        gsap.to(body, {
          height: 0, opacity: 0, paddingBottom: 0, duration: 0.3, ease: 'power2.inOut',
          onComplete: () => { d.open = false; gsap.set(body, { clearProps: 'height,opacity,paddingBottom' }); },
        });
      } else {
        d.open = true;
        gsap.from(body, { height: 0, opacity: 0, paddingBottom: 0, duration: 0.4, ease: 'power2.out', clearProps: 'height,opacity,paddingBottom' });
      }
    });
  });

  /* ---------- 3D tilt ---------- */
  function bindTilt(el) {
    if (!finePointer || el._tilt) return;
    el._tilt = true;
    gsap.set(el, { transformPerspective: 900 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 9);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 9);
    });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }
  document.querySelectorAll('.tilt').forEach(bindTilt);

  /* ---------- Intros ---------- */
  let gateTl;
  function gateIntro() {
    gateTl?.kill();
    gateTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from(gateLayers.slice(1), { y: (i) => 40 + i * 25, duration: 1.6, stagger: -0.06 }, 0)
      .from('.gate-logo', { y: -30, scale: 0.92, opacity: 0, duration: 0.8 }, 0.15)
      .from('.gate-desc', { opacity: 0, y: 12, duration: 0.6 }, 0.35)
      .from('.gate-title .wi', { yPercent: 110, duration: 0.7, stagger: 0.06 }, 0.4)
      .from('.path-card', { y: 50, opacity: 0, duration: 0.8, stagger: 0.12 }, 0.6)
      .from('.gate-foot', { opacity: 0, duration: 0.6 }, 0.9)
      .from('.gate-mascot', { scale: 0, rotation: -40, duration: 0.7, ease: 'back.out(2.2)' }, 1);
    ensure(gateTl, 3500);
  }
  gsap.to('.gate-mascot', { y: -12, rotation: 4, repeat: -1, yoyo: true, duration: 1.6, ease: 'sine.inOut' });

  let viewTl;
  function viewIntro(view) {
    ScrollTrigger.refresh();
    viewTl?.kill();
    const hero = document.querySelector(view === 'empleo' ? '.hero--junior' : '.hero--biz');
    const layers = layersOf(hero.querySelector('.scene'));
    const q = gsap.utils.selector(hero);
    viewTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from(layers.slice(1), { y: (i) => 50 + i * 30, duration: 1.5, stagger: -0.07 }, 0)
      .from(q('.eyebrow'), { opacity: 0, y: 14, duration: 0.5 }, 0.15)
      .from(q('h1 .wi'), { yPercent: 115, duration: 0.75, stagger: 0.05 }, 0.2)
      .from(q('.lead'), { opacity: 0, y: 18, duration: 0.6 }, 0.45)
      .from(q('.search, .hero-actions > *, .badges li'), { opacity: 0, y: 22, duration: 0.6, stagger: 0.07 }, 0.6);
    if (view === 'talento') {
      viewTl.from(q('.pipeline'), { opacity: 0, x: 60, rotationY: -12, transformPerspective: 900, duration: 0.9 }, 0.4)
        .from(q('.pipe-bar i'), { width: 0, duration: 1.1, stagger: 0.1, ease: 'power2.out' }, 0.8);
      q('[data-count]').forEach((dd) => {
        const end = Number(dd.dataset.count);
        const o = { v: 0 };
        viewTl.to(o, { v: end, duration: 1.1, ease: 'power2.out', onUpdate: () => { dd.textContent = Math.round(o.v); } }, 0.8);
      });
    }
    ensure(viewTl, 3500);
  }

  let cardsTrigger;
  function cardsIn(nodes) {
    nodes.forEach(bindTilt);
    cardsTrigger?.kill();
    gsap.set(nodes, { opacity: 0, y: 40 });
    cardsTrigger = ScrollTrigger.create({
      trigger: '#vac-grid',
      start: 'top 88%',
      once: true,
      onEnter: () => ensure(gsap.to(nodes, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07 }), 2500),
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
  window.ClickJRAnim = { view: viewIntro, gate: gateIntro, cards: cardsIn };
})();
