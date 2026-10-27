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
    document.querySelectorAll('.fiche, .gamme').forEach(function (f) { ficheObs.observe(f); });
  }

  /* menu Produits déroulant : clic, survol à la souris, Échap et clic extérieur ferment */
  var drop = document.querySelector('.drop');
  if (drop) {
    var dropBtn = drop.querySelector('.drop__btn');
    var setDrop = function (open) { drop.classList.toggle('is-open', open); dropBtn.setAttribute('aria-expanded', String(open)); };
    var hoverable = window.matchMedia('(hover: hover) and (min-width: 961px)');
    var closeTimer, hoverOpenedAt = 0;
    dropBtn.addEventListener('click', function () {
      // un clic juste après l'ouverture au survol confirme l'ouverture au lieu de refermer
      if (hoverable.matches && Date.now() - hoverOpenedAt < 600) { setDrop(true); return; }
      setDrop(!drop.classList.contains('is-open'));
    });
    drop.addEventListener('mouseenter', function () {
      if (!hoverable.matches) return;
      clearTimeout(closeTimer);
      if (!drop.classList.contains('is-open')) hoverOpenedAt = Date.now();
      setDrop(true);
    });
    drop.addEventListener('mouseleave', function () { if (hoverable.matches) { closeTimer = setTimeout(function () { setDrop(false); }, 180); } });
    document.addEventListener('click', function (e) { if (!drop.contains(e.target) && hoverable.matches) setDrop(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drop.classList.contains('is-open')) { setDrop(false); dropBtn.focus(); } });
  }

  /* réalisations : filtre et photo agrandie */
  var realBtns = document.querySelectorAll('[data-real]');
  realBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var k = btn.dataset.real;
      realBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      document.querySelectorAll('.real').forEach(function (fig) {
        fig.hidden = k !== 'tout' && fig.dataset.cats.split(' ').indexOf(k) === -1;
      });
    });
  });
  var box = document.getElementById('lightbox');
  if (box && typeof box.showModal === 'function') {
    var boxImg = box.querySelector('img');
    var boxCap = box.querySelector('.lightbox__cap');
    document.querySelectorAll('.real__open').forEach(function (b) {
      b.addEventListener('click', function () {
        var im = b.querySelector('img');
        boxImg.src = im.currentSrc || im.src; boxImg.alt = im.alt;
        boxCap.textContent = b.closest('.real').querySelector('figcaption').textContent.replace(/\s+/g, ' ').trim();
        box.showModal();
      });
    });
    box.querySelector('.lightbox__close').addEventListener('click', function () { box.close(); });
    box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
  }

  /* occasions : stores ou toiles, et vendus masqués par défaut */
  var occBtns = document.querySelectorAll('[data-occ]');
  occBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      occBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      document.querySelectorAll('[data-occ-list]').forEach(function (ul) { ul.hidden = ul.dataset.occList !== btn.dataset.occ; });
    });
  });
  var showSold = document.getElementById('show-sold');
  if (showSold) {
    showSold.addEventListener('change', function () {
      document.querySelectorAll('.occ__item.is-sold').forEach(function (li) { li.hidden = !showSold.checked; });
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
