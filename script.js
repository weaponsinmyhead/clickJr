const MAX_FINALISTS = 3;
const VIEWS = ['empleo', 'talento'];
const STORE_KEY = 'clickjr-view';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setStatus(node, kind, title, detail) {
  node.className = 'status' + (kind ? ' is-' + kind : '');
  node.replaceChildren();
  if (title) node.append(el('strong', '', title), document.createElement('br'));
  node.append(detail);
}

/* ---------- Routing: gate / empleo / talento ---------- */
const gate = document.getElementById('gate');
const site = document.getElementById('site');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function remember(view) {
  try { localStorage.setItem(STORE_KEY, view); } catch (e) { /* storage unavailable */ }
}
function recall() {
  try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
}

let booted = false;

function withTransition(fn) {
  if (booted && document.startViewTransition && !reducedMotion) document.startViewTransition(fn);
  else fn();
}

function showView(view, fromChoice) {
  if (document.body.dataset.view === view && !site.hidden) return;
  withTransition(() => {
    document.body.dataset.view = view;
    gate.hidden = true;
    site.hidden = false;
    document.querySelectorAll('[data-view-link]').forEach((a) => {
      if (a.dataset.viewLink === view) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (fromChoice) {
      window.scrollTo(0, 0);
      const h1 = document.querySelector(view === 'empleo' ? '#hj-title' : '#hb-title');
      if (h1) h1.focus({ preventScroll: true });
    }
    requestAnimationFrame(() => window.ClickJRAnim?.view(view));
  });
  remember(view);
}

function showGate() {
  withTransition(() => {
    document.body.dataset.view = '';
    site.hidden = true;
    gate.hidden = false;
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.ClickJRAnim?.gate());
  });
}

function route() {
  const hash = location.hash.slice(1);
  if (VIEWS.includes(hash)) return showView(hash, true);
  if (hash === '' || hash === 'inicio') return showGate();
  if (!document.body.dataset.view) {
    const saved = recall();
    if (VIEWS.includes(saved)) {
      showView(saved, false);
      requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
    } else {
      showGate();
    }
  }
}

window.addEventListener('hashchange', route);

/* ---------- Vacantes (vista candidato) ---------- */
const VACANCIES = [
  { title: 'Frontend Trainee', company: 'Pampa Labs', color: '#5B3FA0', zone: 'Remoto', tags: ['Sin experiencia', 'Part-time'], area: 'frontend web html css javascript desarrollo' },
  { title: 'Soporte IT Junior', company: 'Nodo Sur', color: '#EC5B4C', zone: 'CABA', tags: ['Primer empleo', 'Híbrido'], area: 'soporte it sistemas helpdesk' },
  { title: 'Analista de datos Jr', company: 'Cuenca Data', color: '#2E8C6A', zone: 'Córdoba', tags: ['Excel / SQL', 'Full-time'], area: 'datos analista sql excel' },
  { title: 'QA Tester Trainee', company: 'Faro Apps', color: '#D9822B', zone: 'Remoto', tags: ['Sin experiencia', 'Capacitación paga'], area: 'qa testing calidad desarrollo' },
  { title: 'Diseño UX/UI Junior', company: 'Mate Studio', color: '#B4487E', zone: 'Rosario', tags: ['Portfolio', 'Part-time'], area: 'diseño ux ui figma' },
  { title: 'Atención al cliente bilingüe', company: 'Andes Travel', color: '#3D6FB8', zone: 'CABA', tags: ['Inglés intermedio', 'Primer empleo'], area: 'atención cliente inglés soporte' },
];
const applied = new Set();

const vacGrid = document.getElementById('vac-grid');
const vacSummary = document.getElementById('vac-summary');
const search = document.getElementById('search');

function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function renderVacancies(query = '', zone = '') {
  const q = normalize(query.trim());
  const list = VACANCIES.filter((v) =>
    (!zone || v.zone === zone) &&
    (!q || normalize(v.title + ' ' + v.area + ' ' + v.company).includes(q)));

  vacGrid.replaceChildren();
  list.forEach((v) => {
    const card = el('article', 'vac tilt');
    card.style.setProperty('--c', v.color);
    const sky = el('div', 'vac-sky');
    const logo = el('span', 'vac-logo', v.company[0]);
    logo.setAttribute('aria-hidden', 'true');
    sky.append(logo);
    const co = el('div', 'vac-co', v.company);
    const tags = el('ul', 'vac-tags');
    v.tags.forEach((t) => tags.append(el('li', 'pill', t)));
    const foot = el('div', 'vac-foot');
    const btn = el('button', 'btn btn--sm');
    btn.type = 'button';
    const done = applied.has(v.title);
    btn.textContent = done ? 'Postulación enviada ✓' : 'Postularme';
    btn.classList.toggle('is-done', done);
    btn.setAttribute('aria-pressed', String(done));
    btn.addEventListener('click', () => {
      if (applied.has(v.title)) applied.delete(v.title); else applied.add(v.title);
      renderVacancies(search.q.value, search.zona.value);
    });
    foot.append(el('span', 'where', v.zone), btn);
    const bodyEl = el('div', 'vac-body');
    bodyEl.append(co, el('h3', '', v.title), tags, foot);
    card.append(sky, bodyEl);
    vacGrid.append(card);
  });
  window.ClickJRAnim?.cards(vacGrid.querySelectorAll('.vac'));

  if (!list.length) {
    vacGrid.append(el('p', 'vac-empty', 'No encontramos vacantes con esa búsqueda. Probá con otra palabra o elegí «Todas las zonas».'));
  }
  const n = list.length;
  const appliedText = applied.size ? ' · ' + applied.size + (applied.size === 1 ? ' postulación enviada' : ' postulaciones enviadas') : '';
  vacSummary.textContent = n + (n === 1 ? ' vacante junior' : ' vacantes junior') + appliedText + '. Postulate y seguí el avance en tu mapa.';
}

search.addEventListener('submit', (e) => {
  e.preventDefault();
  renderVacancies(search.q.value, search.zona.value);
  document.getElementById('vacantes').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
});

/* ---------- R3: terna con tope ---------- */
const r3 = {
  finalists: ['Ana R.', 'Bruno M.', 'Caro L.'],
  pool: [
    { name: 'Dani P.', note: 'Entrevista técnica aprobada' },
    { name: 'Eli G.', note: 'Entrevista con el equipo' },
  ],
};

const r3Slots = document.getElementById('r3-slots');
const r3Pool = document.getElementById('r3-pool');
const r3Count = document.getElementById('r3-count');
const r3Status = document.getElementById('r3-status');

function initials(name) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function renderR3() {
  r3Slots.replaceChildren();
  for (let i = 0; i < MAX_FINALISTS; i++) {
    const name = r3.finalists[i];
    if (!name) {
      r3Slots.append(el('div', 'slot is-empty', 'Lugar libre'));
      continue;
    }
    const slot = el('div', 'slot');
    const pause = el('button', 'btn btn--sm btn--ghost', 'Pausar');
    pause.type = 'button';
    pause.setAttribute('aria-label', 'Pausar a ' + name);
    pause.addEventListener('click', () => pauseFinalist(name));
    slot.append(el('span', 'slot-avatar', initials(name)), el('span', 'slot-name', name), pause);
    r3Slots.append(slot);
  }

  r3Pool.replaceChildren();
  r3.pool.forEach((candidate) => {
    const item = el('li');
    const info = el('div');
    info.append(el('strong', '', candidate.name), el('small', '', candidate.note));
    const add = el('button', 'btn btn--sm', 'Sumar a finalistas');
    add.type = 'button';
    add.setAttribute('aria-label', 'Sumar a ' + candidate.name + ' a finalistas');
    add.addEventListener('click', () => addFinalist(candidate.name));
    item.append(info, add);
    r3Pool.append(item);
  });
  if (!r3.pool.length) r3Pool.append(el('li', '', 'No hay más candidatos en evaluación.'));

  r3Count.textContent = r3.finalists.length + '/' + MAX_FINALISTS;
}

function addFinalist(name) {
  if (r3.finalists.length >= MAX_FINALISTS) {
    setStatus(r3Status, 'blocked', 'Incorporación bloqueada',
      'Ya hay ' + r3.finalists.length + ' finalistas activos en esta vacante. Revisá la selección: pausá o descartá a alguien para liberar un lugar.');
    r3Slots.classList.remove('shake');
    void r3Slots.offsetWidth;
    r3Slots.classList.add('shake');
    return;
  }
  r3.pool = r3.pool.filter((c) => c.name !== name);
  r3.finalists.push(name);
  renderR3();
  setStatus(r3Status, 'ok', name + ' ahora es finalista',
    'Terna: ' + r3.finalists.length + '/' + MAX_FINALISTS + '. Por R4, ' + name + ' recibe el aviso de su nueva etapa.');
}

function pauseFinalist(name) {
  r3.finalists = r3.finalists.filter((n) => n !== name);
  r3.pool.push({ name, note: 'Pausado por el reclutador' });
  renderR3();
  setStatus(r3Status, 'wait', 'Revisión humana',
    'Pausaste a ' + name + '. Hay un lugar libre: ya podés reintentar.');
}

/* ---------- R4: aviso de etapa ---------- */
const STAGES = ['Postulado', 'CV visto', 'Entrevista', 'Finalista', 'Oferta'];
const CLOSED = 'Cerrada (no seleccionada)';
const NEXT_STEP = {
  'Postulado': 'Esperá la revisión de tu CV.',
  'CV visto': 'Tené a mano tu portfolio por si te llaman.',
  'Entrevista': 'Elegí un horario para conversar.',
  'Finalista': 'Estás en la terna final: revisá tu correo.',
  'Oferta': 'Revisá la propuesta y respondé.',
};

const r4 = { current: 'Entrevista', closed: false };

const r4Select = document.getElementById('r4-stage');
const r4Register = document.getElementById('r4-register');
const r4Draft = document.getElementById('r4-draft');
const r4Approve = document.getElementById('r4-approve');
const r4Status = document.getElementById('r4-status');
const r4Track = document.getElementById('r4-track');
const r4Inbox = document.getElementById('r4-inbox');

[...STAGES, CLOSED].forEach((stage) => r4Select.append(new Option(stage, stage)));
r4Select.value = 'Finalista';

function renderTrack() {
  r4Track.replaceChildren();
  const idx = STAGES.indexOf(r4.current);
  STAGES.forEach((stage, i) => {
    let cls = '';
    if (r4.closed) cls = i <= idx ? 'done' : '';
    else if (i < idx) cls = 'done';
    else if (i === idx) cls = 'now';
    r4Track.append(el('li', cls, stage));
  });
  if (r4.closed) r4Track.append(el('li', 'closed now', 'Cerrada'));
}

function notify(label, text) {
  const card = el('div', 'notif');
  card.append(el('span', 'label', label), document.createTextNode(text));
  r4Inbox.prepend(card);
  while (r4Inbox.children.length > 3) r4Inbox.lastElementChild.remove();
}

function setCompanyLocked(locked) {
  r4Select.disabled = locked;
  r4Register.disabled = locked;
}

r4Register.addEventListener('click', () => {
  const next = r4Select.value;
  if (r4.closed) {
    setStatus(r4Status, 'blocked', 'Postulación cerrada', 'Esta postulación ya se cerró. Recargá la página para probar de nuevo.');
    return;
  }
  if (next === r4.current) {
    setStatus(r4Status, '', 'Sin cambio', 'La postulación ya está en ' + next + '. No hubo cambio de etapa, así que no se envía aviso.');
    return;
  }
  if (next === CLOSED) {
    r4Draft.hidden = false;
    setCompanyLocked(true);
    setStatus(r4Status, 'wait', 'Esperando aprobación', 'Es un cierre: el aviso queda en revisión hasta que un reclutador lo apruebe.');
    r4Approve.focus();
    return;
  }
  const up = STAGES.indexOf(next) > STAGES.indexOf(r4.current);
  r4.current = next;
  renderTrack();
  notify(up ? '¡Avanzaste de etapa!' : 'Cambio de etapa', 'Tu postulación pasó a ' + next + '. ' + NEXT_STEP[next]);
  setStatus(r4Status, 'ok', 'Aviso enviado', 'Sofi recibió el cambio a ' + next + ' en la app.');
});

r4Approve.addEventListener('click', () => {
  r4.closed = true;
  r4Draft.hidden = true;
  setCompanyLocked(false);
  renderTrack();
  notify('Postulación cerrada', 'Esta vez elegimos otro perfil. Te dejamos una devolución y 3 vacantes parecidas.');
  setStatus(r4Status, 'ok', 'Aviso aprobado y enviado', 'El reclutador aprobó el mensaje y Sofi fue informada del cierre.');
  r4Register.focus();
});

renderVacancies();
renderR3();
renderTrack();
notify('Cambio de etapa', 'Tu postulación pasó a Entrevista. ' + NEXT_STEP['Entrevista']);
route();
booted = true;
