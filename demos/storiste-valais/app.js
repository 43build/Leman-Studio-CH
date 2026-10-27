(function () {
  document.documentElement.classList.add('js');

  /* en-tête : ombre au défilement, menu mobile */
  var head = document.getElementById('site-head');
  if (head) {
    var onScroll = function () { head.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var burger = head.querySelector('.head__burger');
    var setOpen = function (open) {
      head.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.textContent = open ? 'Fermer' : 'Menu';
    };
    if (burger) {
      burger.addEventListener('click', function () { setOpen(!head.classList.contains('is-open')); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && head.classList.contains('is-open')) { setOpen(false); burger.focus(); }
      });
      head.querySelectorAll('.head__nav a').forEach(function (a) {
        a.addEventListener('click', function () { setOpen(false); });
      });
    }
  }

  /* accueil : filtre des produits */
  var tabs = document.querySelectorAll('.tabs__btn');
  var groups = document.querySelectorAll('[data-group]');
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      tabs.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      groups.forEach(function (g) { g.hidden = f !== 'all' && g.dataset.group !== f; });
    });
  });

  /* accueil : l'étape au centre de l'écran pilote le compteur de l'image fixe */
  var steps = document.querySelectorAll('.pin-steps li');
  var num = document.querySelector('.methode__num');
  var bar = document.querySelector('.methode__bar span');
  if (steps.length && 'IntersectionObserver' in window) {
    var activate = function (li) {
      steps.forEach(function (s) { s.classList.toggle('is-active', s === li); });
      var n = Number(li.dataset.step);
      if (num) num.textContent = String(n);
      if (bar) bar.style.transform = 'scaleX(' + (n / steps.length) + ')';
    };
    activate(steps[0]);
    var stepObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) activate(e.target); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { stepObs.observe(s); });
  }

  /* produits : le sommaire suit la fiche lue */
  var navLinks = document.querySelectorAll('.catalogue__nav a');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var current = null;
    var mark = function (id) {
      if (current === id) return;
      current = id;
      navLinks.forEach(function (a) { a.classList.toggle('is-active', a === byId[id]); });
      var link = byId[id];
      var bar = link && link.closest('.catalogue__nav');
      if (bar && bar.scrollWidth > bar.clientWidth) {
        bar.scrollTo({ left: link.offsetLeft - 16, behavior: 'smooth' });
      }
    };
    var ficheObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) mark(e.target.id); });
    }, { rootMargin: '-45% 0px -54% 0px' });
    document.querySelectorAll('.fiche').forEach(function (f) { ficheObs.observe(f); });
  }

  /* occasions : masquer les stores vendus */
  var hideSold = document.getElementById('hide-sold');
  if (hideSold) {
    hideSold.addEventListener('change', function () {
      document.querySelectorAll('.occ__item.is-sold').forEach(function (li) { li.hidden = hideSold.checked; });
    });
  }

  /* formulaires : projet prérempli depuis l'URL, envoi de démonstration */
  var params = new URLSearchParams(window.location.search);
  var wanted = params.get('projet');
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    var select = form.querySelector('select[name="projet"]');
    if (select && wanted) {
      Array.prototype.forEach.call(select.options, function (o) { if (o.value === wanted || o.text === wanted) select.value = o.value; });
    }
    var status = form.querySelector('[role="status"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
      var missing = Array.prototype.filter.call(form.querySelectorAll('[required]'), function (el) { return !el.value.trim(); });
      if (missing.length) {
        missing.forEach(function (el) { el.setAttribute('aria-invalid', 'true'); });
        status.textContent = 'Indiquez au moins votre nom et votre téléphone.';
        missing[0].focus();
        return;
      }
      status.textContent = 'Merci, c’est noté. Site de démonstration : aucune demande n’a été envoyée.';
    });
  });
})();
