const EBOOKS = [
    { name: 'La Médecine Prophétique au Féminin', desc: "Comprendre et intégrer des remèdes et habitudes issus de la tradition dans ton quotidien.", contenu: "Ce que tu y trouveras : des habitudes simples, expliquées avec respect et sans promesse de guérison." },
    { name: 'Alimentation &amp; Cycle Féminin', desc: "Comprendre les liens entre ton alimentation et ton cycle, avec des repères concrets.", contenu: "Ce que tu y trouveras : des repères clairs et des idées faciles à mettre en place." },
    { name: 'Apaiser le Stress et les Émotions', desc: "Des outils simples à intégrer dans tes journées, sans injonction.", contenu: "Ce que tu y trouveras : des exercices courts et accessibles au quotidien." },
    { name: 'Programme Reset — 21 jours', desc: "Un programme progressif pour remettre en place quelques habitudes simples.", contenu: "Ce que tu y trouveras : un accompagnement jour après jour, sur 21 jours." },
    { name: 'Journal de Bord Ashifaa', desc: "Un carnet guidé pour observer tes habitudes et tes ressentis, semaine après semaine.", contenu: "Ce que tu y trouveras : des pages guidées et des questions de journaling." },
    { name: 'Apaiser les Troubles du Sommeil', desc: "Un guide court pour comprendre ce qui perturbe ton sommeil et l'apaiser naturellement.", contenu: "Ce que tu y trouveras : des habitudes simples à tester, soir après soir." }
  ];

  function ebookIcon() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></svg>'; }

  function renderEbooks() {
    document.getElementById('ebookGrid').innerHTML = EBOOKS.map(r => `
      <div class="ebook-card">
        <div class="ebook-cover">${ebookIcon()}</div>
        <div class="ebook-body">
          <h3>${r.name}</h3>
          <p>${r.desc}</p>
          <p class="contenu">${r.contenu}</p>
          <div class="ebook-foot">
            <button class="btn btn-primary btn-sm" onclick="orderEbook('${r.name.replace(/'/g, "\\\\'")}')">Commander</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function orderEbook(name) {
    const subject = encodeURIComponent('Commande — ' + name);
    const body = encodeURIComponent(`Bonjour,\n\nJe souhaite commander la ressource "${name}" .\n\nMerci de me confirmer le tarif, les modalités de paiement et d'envoi.`);
    window.location.href = `mailto:ashifaa.sante@gmail.com?subject=${subject}&body=${body}`;
  }

  const HOURS = ['14h00', '10h00', '16h30', '11h00', '15h00', '09h30'];
  const SLOTS = (() => {
    const out = [], d = new Date();
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    while (out.length < 6) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0) continue; // pas de dimanche
      out.push({ day: jours[d.getDay()], date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), time: HOURS[out.length] });
    }
    return out;
  })();
  let selectedSlot = null;
  function renderSlots() {
    document.getElementById('slotGrid').innerHTML = SLOTS.map((s, i) => `<div class="slot" id="slot-${i}" onclick="selectSlot(${i})"><span class="day">${s.day} ${s.date}</span><span class="time">${s.time}</span></div>`).join('');
  }
  function selectSlot(i) { selectedSlot = SLOTS[i]; document.querySelectorAll('.slot').forEach((el, idx) => el.classList.toggle('selected', idx === i)); }

  function bookService(name) {
    go('rendezvous');
    const select = document.getElementById('bookingService');
    for (const opt of select.options) { if (opt.value.startsWith(name)) { select.value = opt.value; break; } }
    setTimeout(() => document.querySelector('.booking-box').scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
  }

  function submitBooking() {
    const service = document.getElementById('bookingService').value;
    const name = document.getElementById('bookingName').value.trim();
    const email = document.getElementById('bookingEmail').value.trim();
    const phone = document.getElementById('bookingPhone').value.trim();
    const msg = document.getElementById('bookingMsg').value.trim();
    if (!name || !email) { showToast('Merci de renseigner ton nom et ton email'); return; }
    if (!selectedSlot) { showToast('Merci de choisir un créneau'); return; }
    const subject = encodeURIComponent('Demande de rendez-vous — ' + service);
    let body = `Bonjour,\n\nJe souhaite réserver le rendez-vous suivant :\n\nAccompagnement : ${service}\nCréneau souhaité : ${selectedSlot.day} ${selectedSlot.date} à ${selectedSlot.time}\n\nNom : ${name}\nEmail : ${email}\n`;
    if (phone) body += `Téléphone : ${phone}\n`;
    if (msg) body += `Message : ${msg}\n`;
    body += `\nMerci de me confirmer la disponibilité de ce créneau.`;
    window.location.href = `mailto:ashifaa.sante@gmail.com?subject=${subject}&body=${encodeURIComponent(body)}`;
    showToast('Ouverture de ta messagerie...');
  }

  function submitContact() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const msg = document.getElementById('contactMsg').value.trim();
    if (!email || !msg) { showToast('Merci de remplir tous les champs'); return; }
    const mailSubject = encodeURIComponent(subject || 'Question via le site Ashifaa');
    const body = encodeURIComponent(`Prénom : ${name}\nEmail : ${email}\n\n${msg}`);
    window.location.href = `mailto:ashifaa.sante@gmail.com?subject=${mailSubject}&body=${body}`;
  }

  function submitNewsletter() {
    const email = document.getElementById('newsletterEmail').value.trim();
    if (!email) { showToast('Merci de renseigner ton email'); return; }
    const subject = encodeURIComponent('Inscription newsletter Ashifaa');
    const body = encodeURIComponent(`Je souhaite m'inscrire à la newsletter Ashifaa avec l'adresse : ${email}`);
    window.location.href = `mailto:ashifaa.sante@gmail.com?subject=${subject}&body=${body}`;
  }

  function showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); }
  function toggleMenu() { document.getElementById('navLinks').classList.toggle('mobile-open'); }

  function go(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById('view-' + view);
    if (target) target.classList.add('active');
    document.querySelectorAll('nav.links a').forEach(a => a.classList.toggle('active', a.dataset.view === view));
    document.getElementById('navLinks').classList.remove('mobile-open');
    window.scrollTo({ top: 0 });
    history.replaceState(null, '', '#' + view);
  }

  function initFromHash() {
    const h = (location.hash || '#accueil').replace('#','');
    const valid = ['accueil','apropos','accompagnements','ebooks','journal','rendezvous','contact'];
    go(valid.includes(h) ? h : 'accueil');
  }

  renderEbooks();
  renderSlots();
  initFromHash();
  window.addEventListener('hashchange', initFromHash);
