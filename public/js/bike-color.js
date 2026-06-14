(function () {
  const dialog = document.getElementById('bike-color-dialog');
  const trigger = document.getElementById('bike-color-trigger');
  const hidden = document.getElementById('bike_color');
  const closeBtn = document.getElementById('bike-color-close');
  const grid = document.getElementById('bike-color-grid');
  const label = trigger?.querySelector('.bike-color-trigger-text');
  if (!dialog || !trigger || !hidden) return;

  trigger.addEventListener('click', () => dialog.showModal());
  closeBtn?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  grid?.querySelectorAll('.bike-color-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      const name = tile.dataset.name || '';
      hidden.value = name;
      if (label) {
        label.textContent = name;
        label.classList.remove('bike-color-placeholder');
      }
      grid.querySelectorAll('.bike-color-tile').forEach((t) => t.classList.remove('is-selected'));
      tile.classList.add('is-selected');
      dialog.close();
    });
  });
})();
