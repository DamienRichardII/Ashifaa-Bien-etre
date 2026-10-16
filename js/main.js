/* ==========================================================
   A'SHIFAA — Homepage scripts (vanilla, modules par fonctions)
   ========================================================== */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     DONNÉES — faciles à modifier / à connecter à une API plus tard
     --------------------------------------------------------- */

  // Prestations — tarifs volontairement non affichés : à renseigner (price: 55) quand la liste définitive sera validée
  const services = [
    { id: 'premiere',  title: 'Première consultation',               price: null, duration: '1h à 1h30',  image: 'Assets/web/herbes.jpg' },
    { id: 'suivi',     title: 'Consultation de suivi',               price: null, duration: '45 min environ', image: 'Assets/web/eau-citron.jpg' },
    { id: 'programme', title: 'Programme alimentaire & hygiène de vie', price: null, duration: 'Document personnalisé', image: 'Assets/web/graines-cuilleres.jpg' },
    { id: 'suivi3',    title: 'Accompagnement 3 mois',               price: null, duration: '3 mois',     image: 'Assets/web/roses-blanches.jpg' },
    { id: 'suivi6',    title: 'Accompagnement 6 mois',               price: null, duration: '6 mois',     image: 'Assets/web/figues.jpg' }
  ];
  const timeSlots = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];

  // E-books : structure prête pour une future boutique (prix, fiche, paiement, téléchargement)
  const ebooks = [
    { id: 'equilibre-naturel', title: 'Mon équilibre au naturel', subtitle: 'Conseils et recettes',
      price: null, image: null, description: '', url: null, downloadUrl: null },
    { id: 'cycle-feminin', title: 'Cycle féminin & bien-être', subtitle: '',
      price: null, image: null, description: '', url: null, downloadUrl: null }
  ];

  /* ---------------------------------------------------------
     HEADER : état au scroll, lien actif, menu mobile
     --------------------------------------------------------- */
  function initHeader() {
    const header = $('#header'), burger = $('#burger'), nav = $('#nav');
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const setMenu = open => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      nav.classList.toggle('is-open', open);
      header.classList.toggle('menu-open', open);
      document.body.classList.toggle('menu-open', open);
    };
    burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
    $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    window.matchMedia('(min-width: 1025px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
  }

  /* ---------------------------------------------------------
     REVEAL au scroll + parallax hero
     --------------------------------------------------------- */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) { items.forEach(i => i.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(i => io.observe(i));
  }

  function initParallax() {
    const img = $('#heroImg'), hero = $('.hero');
    if (!img || reduceMotion) return;
    let ticking = false;
    const update = () => {
      const y = window.scrollY, h = hero.offsetHeight;
      if (y < h) img.style.setProperty('--py', (y * 0.12).toFixed(1) + 'px');
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  }

  /* ---------------------------------------------------------
     RÉSERVATION (front uniquement) — prête à brancher sur une API
     Remplacer BookingAPI.submit() par un appel fetch() réel.
     --------------------------------------------------------- */
  const BookingAPI = {
    // Retourne les créneaux libres pour une date (ISO yyyy-mm-dd). Démo : tous les créneaux, sauf quelques indisponibles.
    async getSlots(/* isoDate, serviceId */) { return timeSlots.map(t => ({ time: t, available: true })); },
    // Envoie la demande. Démo : simple promesse résolue.
    async submit(payload) { document.dispatchEvent(new CustomEvent('booking:submit', { detail: payload })); return { ok: true }; }
  };

  function initBooking() {
    const root = $('#booking');
    if (!root) return;
    const state = { service: null, date: null, time: null, view: new Date() };
    state.view.setDate(1);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const fmtDate = d => d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    // Démo : consultations du lundi au samedi, à partir de demain
    const isBookable = d => d > today && d.getDay() !== 0;

    const svcBox = $('#services'), slotsBox = $('#slots'), grid = $('#calendar #calGrid');
    const monthEl = $('#calMonth'), prev = $('#calPrev'), next = $('#calNext');
    const recap = $('#recap'), cont = $('#continueBtn');
    const panelPick = $('#panelPick'), panelForm = $('#panelForm'), panelDone = $('#panelDone');
    const steps = $$('.step', root);

    /* Prestations */
    svcBox.innerHTML = services.map((s, i) => `
      <button type="button" class="service" role="radio" aria-checked="false" data-id="${s.id}">
        <img src="${s.image}" alt="" loading="lazy" width="54" height="54">
        <span class="service__info"><strong>${s.title}</strong><span>${s.duration}</span></span>
        ${s.price ? `<span class="service__price">${s.price} €</span>` : ''}
      </button>`).join('');
    svcBox.addEventListener('click', e => {
      const b = e.target.closest('.service'); if (!b) return;
      state.service = services.find(s => s.id === b.dataset.id);
      $$('.service', svcBox).forEach(x => x.setAttribute('aria-checked', String(x === b)));
      refresh();
    });

    /* Calendrier */
    function renderCalendar() {
      const y = state.view.getFullYear(), m = state.view.getMonth();
      monthEl.textContent = state.view.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const offset = (new Date(y, m, 1).getDay() + 6) % 7; // lundi = 0
      const days = new Date(y, m + 1, 0).getDate();
      let html = '<span class="cal__blank"></span>'.repeat(offset);
      for (let d = 1; d <= days; d++) {
        const date = new Date(y, m, d);
        const ok = isBookable(date), sel = state.date === iso(date);
        const cls = 'cal__day' + (date.getTime() === today.getTime() ? ' is-today' : '');
        html += `<button type="button" class="${cls}" data-date="${iso(date)}" aria-pressed="${sel}" ${ok ? '' : 'disabled'} aria-label="${fmtDate(date)}">${d}</button>`;
      }
      grid.innerHTML = html;
      const cur = new Date(today.getFullYear(), today.getMonth(), 1);
      prev.disabled = state.view <= cur;
    }
    grid.addEventListener('click', async e => {
      const b = e.target.closest('.cal__day'); if (!b || b.disabled) return;
      state.date = b.dataset.date; state.time = null;
      $$('.cal__day', grid).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      await renderSlots(); refresh();
    });
    prev.addEventListener('click', () => { state.view.setMonth(state.view.getMonth() - 1); renderCalendar(); });
    next.addEventListener('click', () => { state.view.setMonth(state.view.getMonth() + 1); renderCalendar(); });

    /* Horaires */
    async function renderSlots() {
      let list = timeSlots.map(t => ({ time: t, available: true }));
      if (state.date) list = await BookingAPI.getSlots(state.date, state.service && state.service.id);
      slotsBox.innerHTML = list.map(s => `<button type="button" class="slot" role="radio" aria-checked="${state.time === s.time}" data-time="${s.time}" ${s.available ? '' : 'disabled'}>${s.time}</button>`).join('');
    }
    slotsBox.addEventListener('click', e => {
      const b = e.target.closest('.slot'); if (!b || b.disabled) return;
      state.time = b.dataset.time;
      $$('.slot', slotsBox).forEach(x => x.setAttribute('aria-checked', String(x === b)));
      refresh();
    });

    /* Récapitulatif / étapes / bouton */
    const summary = () => {
      const d = state.date ? new Date(state.date + 'T00:00:00') : null;
      return `${state.service.title} (${state.service.duration}) — ${fmtDate(d)} à ${state.time}`;
    };
    function refresh() {
      const ready = state.service && state.date && state.time;
      steps[0].classList.toggle('is-done', !!state.service);
      steps[0].classList.toggle('is-active', !state.service);
      steps[1].classList.toggle('is-done', !!(state.date && state.time));
      steps[1].classList.toggle('is-active', !!state.service && !(state.date && state.time));
      steps[2].classList.remove('is-active', 'is-done');
      cont.disabled = !ready;
      recap.textContent = ready ? summary() : (!state.service ? 'Choisis une prestation, puis une date et un horaire.' : (!state.date ? 'Sélectionne une date.' : 'Sélectionne un horaire.'));
    }

    /* Navigation entre panneaux */
    const show = panel => {
      [panelPick, panelForm, panelDone].forEach(p => { p.hidden = p !== panel; });
    };
    cont.addEventListener('click', () => {
      if (cont.disabled) return;
      $('#recapForm').textContent = summary();
      steps[2].classList.add('is-active');
      show(panelForm);
      $('#f-name').focus({ preventScroll: true });
    });
    $('#backBtn').addEventListener('click', () => { show(panelPick); refresh(); cont.focus({ preventScroll: true }); });

    panelForm.addEventListener('submit', async e => {
      e.preventDefault();
      const f = new FormData(panelForm);
      const name = (f.get('name') || '').trim(), email = (f.get('email') || '').trim();
      const err = $('#formError');
      $$('.field', panelForm).forEach(x => x.classList.remove('has-error'));
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        err.textContent = 'Merci de renseigner ton nom et une adresse e-mail valide.';
        (!name ? $('#f-name') : $('#f-mail')).closest('.field').classList.add('has-error');
        (!name ? $('#f-name') : $('#f-mail')).focus();
        return;
      }
      err.textContent = '';
      await BookingAPI.submit({ service: state.service, date: state.date, time: state.time, name, email, phone: f.get('phone'), message: f.get('message') });
      $('#doneText').textContent = `${summary()}. Je reviens vers toi très vite pour confirmer.`;
      steps[2].classList.replace('is-active', 'is-done');
      show(panelDone); panelDone.focus({ preventScroll: true });
    });

    $('#resetBtn').addEventListener('click', () => {
      state.service = state.date = state.time = null;
      panelForm.reset();
      $$('.service', svcBox).forEach(x => x.setAttribute('aria-checked', 'false'));
      show(panelPick); renderCalendar(); renderSlots(); refresh();
    });

    renderCalendar(); renderSlots(); refresh();
  }

  /* ---------------------------------------------------------
     E-BOOKS (aperçu généré depuis le tableau `ebooks`)
     --------------------------------------------------------- */
  function initEbooks() {
    const shelf = $('#ebooksShelf'); if (!shelf) return;
    const leaf = '<svg class="book__leaf" viewBox="0 0 120 120" aria-hidden="true"><path d="M110 8C60 8 20 36 14 80c28 6 80-16 96-72z" fill="#4c6a46"/><path d="M20 76C50 52 78 32 106 14" stroke="#e9efe2" stroke-width="1.5" fill="none" opacity=".5"/></svg>';
    shelf.innerHTML = ebooks.slice(0, 2).map((b, i) => {
      const inner = b.image
        ? `<img src="${b.image}" alt="Couverture de l’e-book ${b.title}" loading="lazy">`
        : `<span class="book__title">${b.title}</span>${b.subtitle ? `<span class="book__sub">${b.subtitle}</span>` : ''}<svg class="ico"><use href="#i-lotus"/></svg>`;
      // Quand `price` sera renseigné : un badge de prix s'affiche (futur lien boutique via b.url)
      return `<article class="book book--${i + 1}" aria-label="E-book : ${b.title}">${i === 1 ? leaf : ''}${inner}${b.price ? `<span class="book__price">${b.price} €</span>` : ''}</article>`;
    }).join('');
  }

  /* ---------------------------------------------------------
     INIT
     --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initEbooks();
    initBooking();
    initReveal();
    initParallax();
  });
})();
