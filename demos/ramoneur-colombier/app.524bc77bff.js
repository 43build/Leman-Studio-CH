// Semaines de piquet : barre les semaines passées, met en avant la prochaine.
(() => {
  const list = document.querySelector('[data-watch]');
  if (!list) return;
  const now = new Date();
  let marked = false;
  list.querySelectorAll('li[data-from]').forEach((li) => {
    li.classList.remove('is-next', 'is-past');
    li.querySelectorAll('.tag, .visually-hidden').forEach((el) => el.remove());
    const from = new Date(`${li.dataset.from}T07:00:00`);
    const to = new Date(`${li.dataset.to}T07:00:00`);
    if (to <= now) { li.classList.add('is-past'); li.insertAdjacentHTML('beforeend', '<span class="visually-hidden"> (passée)</span>'); return; }
    if (marked) return;
    marked = true;
    li.classList.add('is-next');
    li.insertAdjacentHTML('beforeend', `<span class="tag">: ${from <= now ? 'en cours' : 'prochaine'}</span>`);
  });
  if (!marked) list.closest('.watch').hidden = true;
})();

// Formulaire : prépare un e-mail dans la messagerie du visiteur. Rien ne part sans lui.
(() => {
  const form = document.querySelector('form[data-mailto]');
  if (!form) return;
  const help = form.querySelector('.form__help');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = [...form.querySelectorAll('[required]')].filter((el) => !el.value.trim());
    form.querySelectorAll('[required]').forEach((el) => el.setAttribute('aria-invalid', bad.includes(el) ? 'true' : 'false'));
    if (bad.length) { help.textContent = 'Il manque votre nom ou votre téléphone.'; bad[0].focus(); return; }
    const v = (n) => form.elements[n].value.trim();
    const body = [`Nom : ${v('Nom')}`, `Téléphone : ${v('Telephone')}`, `Adresse : ${v('Adresse')}`, `Installation : ${v('Installation')}`, '', v('Message')].join('\n');
    const href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent('Demande de passage, ' + v('Nom'))}&body=${encodeURIComponent(body)}`;
    help.textContent = 'Votre messagerie s’ouvre avec la demande prête. Il ne reste qu’à l’envoyer.';
    window.location.href = href;
  });
})();
