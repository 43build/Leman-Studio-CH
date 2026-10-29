// Met à jour la liste des semaines de piquet cantonal d'après la date du jour.
// build.py écrit le même état dans le HTML, pour les visiteurs sans JavaScript.
(() => {
  const list = document.querySelector('[data-watch]');
  if (!list) return;
  const now = new Date();
  let marked = false;
  list.querySelectorAll('li[data-from]').forEach((li) => {
    li.classList.remove('is-next', 'is-past');
    li.querySelectorAll('.tag, .visually-hidden').forEach((el) => el.remove());
    // Le piquet court du lundi 07h00 au lundi 06h59.
    const from = new Date(`${li.dataset.from}T07:00:00`);
    const to = new Date(`${li.dataset.to}T07:00:00`);
    if (to <= now) {
      li.classList.add('is-past');
      li.insertAdjacentHTML('beforeend', '<span class="visually-hidden"> (passée)</span>');
      return;
    }
    if (marked) return;
    marked = true;
    li.classList.add('is-next');
    li.insertAdjacentHTML('beforeend', ` <span class="tag">${from <= now ? 'en cours' : 'prochain'}</span>`);
  });
  if (!marked) list.closest('.watch').hidden = true;
})();
