// Filtres des biens, galerie photo par carte, formulaire qui prépare un e-mail.
(() => {
  const cards = [...document.querySelectorAll('.cards .card')];
  const count = document.querySelector('.filters__count');
  const buttons = [...document.querySelectorAll('.filters button')];
  const apply = (f) => {
    let n = 0;
    cards.forEach((c) => { const show = f === 'all' || c.dataset.type === f; c.hidden = !show; if (show) n += 1; });
    count.textContent = `${n} ${n > 1 ? 'biens' : 'bien'}`;
  };
  buttons.forEach((b) => b.addEventListener('click', () => {
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    apply(b.dataset.f);
  }));

  document.querySelectorAll('[data-gallery]').forEach((g) => {
    const imgs = [...g.querySelectorAll('img')];
    const label = g.querySelector('.ph__count');
    if (imgs.length < 2) return;
    let i = 0;
    const show = (k) => {
      i = (k + imgs.length) % imgs.length;
      imgs.forEach((im, j) => { im.hidden = j !== i; });
      label.textContent = `${i + 1} / ${imgs.length}`;
    };
    g.querySelector('.ph__btn--prev').addEventListener('click', () => show(i - 1));
    g.querySelector('.ph__btn--next').addEventListener('click', () => show(i + 1));
  });

  const form = document.querySelector('form[data-mailto]');
  if (form) {
    const help = form.querySelector('.form__help');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const req = [...form.querySelectorAll('[required]')];
      const bad = req.filter((el) => !el.value.trim() || !el.checkValidity());
      req.forEach((el) => el.setAttribute('aria-invalid', String(bad.includes(el))));
      if (bad.length) { help.textContent = 'Il manque votre nom ou une adresse e-mail valide.'; bad[0].focus(); return; }
      const v = (n) => form.elements[n].value.trim();
      const body = [`${v('Prenom')} ${v('Nom')}`.trim(), `Téléphone : ${v('Telephone')}`, `E-mail : ${v('Email')}`, `Sujet : ${v('Sujet')}`, '', v('Message')].join('\n');
      help.textContent = 'Votre messagerie s’ouvre avec la demande prête. Il ne reste qu’à l’envoyer.';
      window.location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(v('Sujet'))}&body=${encodeURIComponent(body)}`;
    });
  }
})();
