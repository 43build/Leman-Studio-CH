(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* en-tête : plein dès qu'on quitte la photo, menu sur mobile */
  var bar = document.getElementById('top-bar');
  var hero = document.querySelector('.hero');
  var setSolid = function () { bar.classList.toggle('is-solid', window.scrollY > (hero ? hero.offsetHeight - 90 : 40)); };
  setSolid();
  window.addEventListener('scroll', setSolid, { passive: true });
  var burger = bar.querySelector('.burger');
  var setOpen = function (open) { bar.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', String(open)); };
  burger.addEventListener('click', function () { setOpen(!bar.classList.contains('is-open')); });
  bar.querySelectorAll('.top__nav a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && bar.classList.contains('is-open')) { setOpen(false); burger.focus(); } });

  /* sélecteur de toile : même store, autre toile */
  var swatches = document.querySelectorAll('.swatch');
  var toiles = document.querySelectorAll('.toile');
  var show = function (key) {
    toiles.forEach(function (img) { img.classList.toggle('is-on', img.dataset.toile === key); });
    swatches.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.toile === key)); });
  };
  swatches.forEach(function (b) {
    b.addEventListener('click', function () { show(b.dataset.toile); });
    // précharge la toile au survol pour un fondu sans attente
    b.addEventListener('pointerenter', function () {
      var img = document.querySelector('.toile[data-toile="' + b.dataset.toile + '"]');
      if (img && img.loading === 'lazy') img.loading = 'eager';
    }, { once: true });
  });
  toiles.forEach(function (img) {
    img.addEventListener('error', function () {
      var b = document.querySelector('.swatch[data-toile="' + img.dataset.toile + '"]');
      if (b) b.hidden = true;
    });
  });

  /* apparitions au défilement, une seule fois */
  var items = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
  }

  /* formulaire : rien n'est envoyé tant qu'il n'est pas relié */
  document.querySelectorAll('form[data-endpoint]').forEach(function (form) {
    var tel = form.querySelector('input[type="tel"]');
    var help = form.querySelector('[aria-live]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = tel.value.replace(/\D/g, '').length >= 9;
      tel.setAttribute('aria-invalid', String(!ok));
      if (!ok) { help.textContent = 'Indiquez un numéro complet, par exemple 079 123 45 67.'; tel.focus(); return; }
      if (!form.dataset.endpoint) { help.textContent = 'Maquette : rien n’a été envoyé, ce formulaire n’est pas encore relié.'; return; }
      fetch(form.dataset.endpoint, { method: 'POST', body: new FormData(form) })
        .then(function (r) { help.textContent = r.ok ? 'Merci, Mikaël vous rappelle.' : 'Cela n’est pas passé, réessayez dans un instant.'; })
        .catch(function () { help.textContent = 'Cela n’est pas passé, réessayez dans un instant.'; });
    });
  });
})();
