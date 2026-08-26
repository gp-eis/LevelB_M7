(() => {
  const video = document.getElementById('dialogue-video');
  const buttons = [...document.querySelectorAll('[data-dialogue]')];

  if (!video || !buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      video.src = button.dataset.video;
      video.setAttribute('aria-label', `${button.dataset.line} video`);
      video.load();
      video.scrollIntoView({ behavior: 'smooth', block: 'center' });
      video.play().catch(() => {});
    });
  });
})();
