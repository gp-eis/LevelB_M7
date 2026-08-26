(() => {
  const video = document.getElementById('dialogue-video');
  const buttons = [...document.querySelectorAll('[data-dialogue]')];
  if (!video || !buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const videoSrc = button.dataset.video;
      if (video.getAttribute('src') !== videoSrc) video.src = videoSrc;
      video.setAttribute('aria-label', `${button.dataset.line} video`);
      video.hidden = false;
      video.scrollIntoView({ behavior: 'smooth', block: 'center' });
      video.play().catch(() => {});
    });
  });
})();
