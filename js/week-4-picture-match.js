(() => {
  const items = window.WEEK4_VOCABULARY;
  const choices = document.getElementById('vocabulary-picture-choices');
  const question = document.getElementById('picture-question');
  const listen = document.getElementById('picture-listen');
  const scoreEl = document.getElementById('picture-score');
  const modal = document.getElementById('picture-modal');
  const modalImage = document.getElementById('picture-modal-image');
  const modalTitle = document.getElementById('picture-modal-title');
  const modalSentence = document.getElementById('picture-modal-sentence');
  let current = null; let score = 0; let locked = false; let lastId = '';
  const render = () => {
    stopVocabularyNarration(); modal.hidden = true; locked = false;
    const pool = items.filter((item) => item.id !== lastId); current = pool[Math.floor(Math.random() * pool.length)]; lastId = current.id;
    question.textContent = current.sentence; choices.innerHTML = '';
    const wrong = shuffleVocabulary(items.filter((item) => item.id !== current.id)).slice(0, 2);
    shuffleVocabulary([current, ...wrong]).forEach((item) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'vocabulary-picture-choice'; button.setAttribute('aria-label', item.label);
      button.innerHTML = `<img src="${item.image}" alt="${item.label}">`;
      button.addEventListener('click', () => choose(button, item)); choices.appendChild(button);
    });
  };
  const choose = (button, item) => {
    if (locked) return;
    if (item.id !== current.id) {
      button.classList.remove('is-wrong'); void button.offsetWidth; button.classList.add('is-wrong');
      window.setTimeout(() => button.classList.remove('is-wrong'), 700); playVocabulary(item); return;
    }
    locked = true; button.classList.add('is-correct'); score += 1; scoreEl.textContent = score;
    choices.querySelectorAll('button').forEach((choice) => { choice.disabled = true; });
    modalImage.src = current.image; modalImage.alt = current.label; modalTitle.textContent = current.label; modalSentence.textContent = current.sentence;
    window.setTimeout(() => { modal.hidden = false; playVocabulary(current, true); }, 350);
  };
  listen.addEventListener('click', () => { if (current) playVocabulary(current, true); });
  document.getElementById('picture-continue').addEventListener('click', render);
  document.getElementById('picture-new').addEventListener('click', render);
  render();
})();
