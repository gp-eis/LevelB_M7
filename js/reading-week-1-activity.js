(() => {
  const app = document.querySelector('#track-app');
  const week = Number(document.body.dataset.week);
  if (!app || document.body.dataset.track !== 'reading' || ![1, 2, 3, 4].includes(week)) return;

  const configurations = {
    1: {
      title: 'Who Is the Queen? Challenge', cardCopy: 'After watching the story, answer four picture questions.',
      completion: 'You finished the Who Is the Queen? challenge!', assetBase: '../assets/images/week-1/reading/activity/',
      questions: [
        { question: 'Who did the children meet after the queen?', image: 'question-1.webp', imageAlt: 'Children meet a human queen and a queen bee in a garden.', answers: [
          { label: 'A queen bee.', image: 'answer-queen-bee.webp', alt: 'A friendly crowned queen bee.', correct: true },
          { label: 'A butterfly.', image: 'answer-butterfly.webp', alt: 'A colorful butterfly.', correct: false }] },
        { question: 'Where does the queen live?', image: 'question-2.webp', imageAlt: 'A queen thinks about a castle and a beehive.', answers: [
          { label: 'In a castle.', image: 'answer-castle.webp', alt: 'A fairytale castle.', correct: true },
          { label: 'In a beehive.', image: 'answer-beehive.webp', alt: 'A natural beehive hanging from a tree.', correct: false }] },
        { question: 'What does the queen bee have?', image: 'question-3.webp', imageAlt: 'A crowned queen bee spreads her wings in a flower garden.', answers: [
          { label: 'She has wings.', image: 'answer-wings.webp', alt: 'A pair of pale blue bee wings.', correct: true },
          { label: 'She has a dress.', image: 'answer-dress.webp', alt: 'A purple royal dress.', correct: false }] },
        { question: 'What kind of story is this?', image: 'question-1.webp', imageAlt: 'Children meet a queen and a queen bee in a magical garden.', answers: [
          { label: 'Fairytale', image: 'answer-fairytale.webp', alt: 'A magical fairytale book with a castle, queen, and crowned bee.', correct: true },
          { label: 'Science book', image: 'answer-science-book.webp', alt: 'A science book with a microscope and planets.', correct: false }] }
      ]
    },
    2: {
      title: 'Bee Story Challenge', cardCopy: 'Answer four picture questions about World Bee Day.',
      completion: 'You finished the World Bee Day activity!', assetBase: '../assets/images/week-2/reading/activity/',
      questions: [
        { question: 'Why do we have World Bee Day?', image: 'question-mark-3d.png', imageAlt: 'A colorful three-dimensional question mark.', answers: [
          { label: 'To help people learn why bees are important.', image: 'q1-bees-important-photo.png', alt: 'A teacher and children learning about bees beside flowers.', correct: true },
          { label: 'To catch bees when they are flying outside.', image: 'q1-catch-bees-photo.png', alt: 'A child holding a net while bees fly outside.', correct: false }] },
        { question: 'When is World Bee Day?', image: 'question-mark-3d.png', imageAlt: 'A colorful three-dimensional question mark.', answers: [
          { label: 'It is on May 20th.', image: 'q2-may-20-photo.png', alt: 'A May 20 calendar beside a bee on a flower.', correct: true },
          { label: 'It is on June 20th.', image: 'q2-june-20-photo.png', alt: 'A June 20 calendar beside a bee on a flower.', correct: false }] },
        { question: 'How do bees help plants make fruit?', image: 'question-mark-3d.png', imageAlt: 'A colorful three-dimensional question mark.', answers: [
          { label: 'They help pollinate flowers.', image: 'q3-pollinate-photo.png', alt: 'A honeybee pollinating a pink fruit-tree blossom.', correct: true },
          { label: 'They water the trees.', image: 'q3-water-trees-photo.png', alt: 'A honeybee using a tiny watering can beside a young tree.', correct: false }] },
        { question: 'What can we do to protect bees?', image: 'question-mark-3d.png', imageAlt: 'A colorful three-dimensional question mark.', answers: [
          { label: 'We can plant flowers that bees like.', image: 'q4-plant-flowers-photo.png', alt: 'A child planting colorful flowers that attract bees.', correct: true },
          { label: 'We can chase the bees.', image: 'q4-chase-bees-photo.png', alt: 'An adult gardener shooing bees away from flowers with a hat.', correct: false }] }
      ]
    },
    3: {
      title: 'Zoom to Space Challenge', cardCopy: 'Answer four picture questions about the space story.',
      completion: 'You finished the Zoom to Space Challenge!', assetBase: '../assets/images/week-3/reading/activity/',
      questions: [
        { question: 'What do we wear when we go to space?', image: 'life-q1-question.webp', imageAlt: 'A child thinks beside a large question mark in space.', response: 'We wear a spacesuit when we go to space.', answers: [
          { label: 'A spacesuit.', image: 'life-q1-spacesuit.webp', alt: 'A complete white and blue spacesuit with a helmet, gloves, and boots.', correct: true },
          { label: 'A swimsuit.', image: 'life-q1-swimsuit.webp', alt: 'A colorful swimsuit and swimming goggles beside a pool.', correct: false }] },
        { question: 'What do we ride to travel to space?', image: 'life-q2-question.webp', imageAlt: 'A child thinks beside a question mark and a glowing path toward space.', response: 'We ride a spaceship to travel to space.', answers: [
          { label: 'A spaceship.', image: 'life-q2-spaceship.webp', alt: 'A rounded purple spaceship flying through space.', correct: true },
          { label: 'A car.', image: 'life-q2-car.webp', alt: 'A bright red car on a sunny road.', correct: false }] },
        { question: 'What can we see in space?', image: 'life-q3-question.webp', imageAlt: 'A child looks at a large question mark through a round space window.', response: 'We can see stars and the Moon in space.', answers: [
          { label: 'Stars and the Moon.', image: 'life-q3-stars-moon.webp', alt: 'A glowing crescent Moon surrounded by many bright stars.', correct: true },
          { label: 'Fish.', image: 'life-q3-fish.webp', alt: 'Three colorful fish swimming in a toy aquarium.', correct: false }] },
        { question: 'Who might we meet in space?', image: 'life-q4-question.webp', imageAlt: 'A child waves toward an empty glowing doorway beside a large question mark.', response: 'We might meet an alien in space.', answers: [
          { label: 'An alien.', image: 'life-q4-alien.webp', alt: 'A friendly green alien waves in space.', correct: true },
          { label: 'A puppy.', image: 'life-q4-puppy.webp', alt: 'A fluffy golden puppy sits on green grass.', correct: false }] }
      ]
    },
    4: {
      title: 'Lorenzo Langstroth Challenge', cardCopy: 'Answer four picture questions about Lorenzo Langstroth.',
      completion: 'You finished The Story of Lorenzo Langstroth activity!', assetBase: '../assets/images/week-4/reading/activity/',
      questions: [
        { question: 'Who was Lorenzo Langstroth?', image: 'question-1.webp', imageAlt: 'Lorenzo Langstroth stands beside a beehive.', response: 'Lorenzo Langstroth was a beekeeper.', answers: [
          { label: 'A beekeeper', image: 'answer-beekeeper.webp', alt: 'A beekeeper holds a honey frame.', correct: true },
          { label: 'A farmer', image: 'answer-farmer.webp', alt: 'A farmer holds a basket of vegetables.', correct: false }] },
        { question: 'What happened when people took honey from the old straw hive?', image: 'question-2.webp', imageAlt: 'Lorenzo and a child look worried beside an old straw beehive.', response: 'They broke the old straw hive, and the bees flew away.', answers: [
          { label: 'The hive broke, and the bees flew away.', image: 'answer-hive-broke.webp', alt: 'A broken straw hive with bees flying away.', correct: true },
          { label: 'The hive stayed whole, and the bees stayed safe.', image: 'answer-bees-safe.webp', alt: 'A whole wooden hive with calm bees.', correct: false }] },
        { question: 'What did Lorenzo make to keep the bees safe?', image: 'question-3.webp', imageAlt: 'Lorenzo builds a rectangular wooden beehive.', response: 'Lorenzo made a modern beehive with sliding frames.', answers: [
          { label: 'A modern beehive with sliding frames', image: 'answer-modern-hive.webp', alt: 'A modern beehive with sliding honey frames.', correct: true },
          { label: 'An old straw hive', image: 'answer-straw-hive.webp', alt: 'An old dome-shaped straw beehive.', correct: false }] },
        { question: 'What can a great person do?', image: 'question-1.webp', imageAlt: 'Lorenzo shares his helpful beehive idea.', response: 'A great person can make something that helps others.', answers: [
          { label: 'Make something that helps others.', image: 'answer-help-others.webp', alt: 'An inventor shows children a helpful bee home.', correct: true },
          { label: 'Break things on purpose.', image: 'answer-break-things.webp', alt: 'A child deliberately breaks a wooden toy.', correct: false }] }
      ]
    }
  };

  const config = configurations[week];
  const questions = config.questions;
  const activity = app.querySelector('.track-activity-card');
  if (!activity) return;
  activity.classList.add('w1-reading-activity-card');
  activity.innerHTML = `<h2 class="section-title">⭐ ${config.title}</h2><p>${config.cardCopy}</p><button class="track-activity-btn" id="reading-activity-open" type="button"><span aria-hidden="true">📖</span><span>Start Activity</span></button>`;

  const overlay = document.createElement('div');
  overlay.className = 'w1-reading-modal';
  overlay.hidden = true;
  overlay.innerHTML = `
    <section class="w1-reading-dialog" role="dialog" aria-modal="true" aria-labelledby="reading-dialog-title">
      <header class="w1-reading-dialog-header">
        <div><h2 id="reading-dialog-title">⭐ ${config.title}</h2><div class="w1-reading-intro"><p>Look, listen, and choose the right answer!</p><button class="w1-reading-speaker" id="reading-intro" type="button" aria-label="Listen to the activity instructions">🔊</button></div></div>
        <button class="w1-reading-close" id="reading-close" type="button" aria-label="Close activity">✕</button>
      </header>
      <div class="w1-reading-dialog-body">
        <div id="reading-game">
          <div class="w1-reading-progress"><span id="reading-progress-label"></span><span class="w1-reading-dots" id="reading-dots" aria-hidden="true"></span></div>
          <div class="w1-reading-question"><img id="reading-question-image" alt=""><h2 id="reading-question-text"></h2><button class="w1-reading-speaker" id="reading-question-speaker" type="button" aria-label="Listen to the question">🔊</button></div>
          <div class="w1-reading-answers" id="reading-answers"></div><p class="w1-reading-feedback" id="reading-feedback" aria-live="polite"></p>
        </div>
        <section class="w1-reading-complete" id="reading-complete" aria-live="polite" hidden><h2>🏆 Great job!</h2><p>${config.completion}</p><div class="w1-reading-complete-actions"><button class="track-activity-btn" id="reading-again" type="button">🔄 Try Again</button><button class="track-activity-btn" id="reading-finish" type="button">✓ Finish</button><button class="w1-reading-speaker" id="reading-complete-speaker" type="button" aria-label="Listen to the congratulations message">🔊</button></div></section>
      </div>
    </section>`;
  document.body.appendChild(overlay);

  const game = overlay.querySelector('#reading-game');
  const dialogBody = overlay.querySelector('.w1-reading-dialog-body');
  const progressLabel = overlay.querySelector('#reading-progress-label');
  const dots = overlay.querySelector('#reading-dots');
  const questionImage = overlay.querySelector('#reading-question-image');
  const questionText = overlay.querySelector('#reading-question-text');
  const answerGrid = overlay.querySelector('#reading-answers');
  const feedback = overlay.querySelector('#reading-feedback');
  const questionSpeaker = overlay.querySelector('#reading-question-speaker');
  const completion = overlay.querySelector('#reading-complete');
  let index = 0;
  let locked = false;
  let lastFocus = null;

  function speak(text) {
    if (typeof window.speakAmericanEnglish === 'function') return window.speakAmericanEnglish(text, { rate: .82, pitch: 1.05 });
    return Promise.resolve();
  }
  function stopSpeech() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
  function shuffle(items) { const copy = [...items]; for (let i = copy.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; }
  function resultSound(correct) {
    if (typeof window.playTone !== 'function') return;
    if (correct) { window.playTone(523, .16, .11, 'sine'); window.playTone(659, .16, .1, 'sine', .1); window.playTone(784, .2, .1, 'sine', .2); }
    else { window.playTone(220, .18, .08, 'sawtooth'); window.playTone(160, .24, .07, 'sawtooth', .13); }
  }
  function setDisabled(disabled) { answerGrid.querySelectorAll('button').forEach((button) => { button.disabled = disabled; }); questionSpeaker.disabled = disabled; }
  function renderProgress() {
    progressLabel.textContent = `Question ${index + 1} of ${questions.length}`;
    dots.replaceChildren();
    questions.forEach((_, dotIndex) => { const dot = document.createElement('span'); dot.className = 'w1-reading-dot'; if (dotIndex < index) dot.classList.add('is-done'); if (dotIndex === index) dot.classList.add('is-current'); dots.appendChild(dot); });
  }
  function makeAnswer(answer) {
    const card = document.createElement('article');
    card.className = 'w1-reading-answer';
    const select = document.createElement('button');
    select.className = 'w1-reading-answer-select';
    select.type = 'button';
    select.innerHTML = `<img src="${config.assetBase}${answer.image}" alt="${answer.alt}"><span class="w1-reading-answer-label">${answer.label}</span>`;
    const listen = document.createElement('button');
    listen.className = 'w1-reading-speaker'; listen.type = 'button'; listen.textContent = '🔊'; listen.setAttribute('aria-label', `Listen to: ${answer.label}`);
    listen.addEventListener('click', (event) => { event.stopPropagation(); if (!locked) speak(answer.label); });
    card.append(listen, select);
    select.addEventListener('click', async () => {
      if (locked) return;
      locked = true; setDisabled(true);
      if (!answer.correct) {
        resultSound(false); card.classList.add('is-wrong'); feedback.textContent = 'Try again!'; feedback.className = 'w1-reading-feedback is-wrong'; await speak(answer.label);
        window.setTimeout(() => { card.classList.remove('is-wrong'); feedback.textContent = ''; feedback.className = 'w1-reading-feedback'; locked = false; setDisabled(false); }, 500);
        return;
      }
      resultSound(true); card.classList.add('is-correct'); feedback.textContent = 'Great choice!'; feedback.className = 'w1-reading-feedback is-good';
      const item = questions[index];
      await speak(item.response || `That's right! ${answer.label}`);
      window.setTimeout(() => {
        if (index < questions.length - 1) { index += 1; render(); }
        else { game.hidden = true; completion.hidden = false; dialogBody.classList.add('is-complete'); speak(`Great job! ${config.completion}`); }
      }, 450);
    });
    return card;
  }
  function render() {
    locked = false; dialogBody.classList.remove('is-complete'); completion.hidden = true; game.hidden = false;
    const item = questions[index];
    questionImage.src = `${config.assetBase}${item.image}`; questionImage.alt = item.imageAlt; questionText.textContent = item.question;
    answerGrid.replaceChildren(); shuffle(item.answers).forEach((answer) => answerGrid.appendChild(makeAnswer(answer)));
    feedback.textContent = ''; feedback.className = 'w1-reading-feedback'; setDisabled(false); renderProgress();
  }
  function openActivity() { lastFocus = document.activeElement; index = 0; render(); overlay.hidden = false; document.body.classList.add('w1-reading-modal-open'); overlay.querySelector('#reading-close').focus(); }
  function closeActivity() { overlay.hidden = true; document.body.classList.remove('w1-reading-modal-open'); stopSpeech(); if (lastFocus instanceof HTMLElement) lastFocus.focus(); }

  app.querySelector('#reading-activity-open').addEventListener('click', openActivity);
  overlay.querySelector('#reading-close').addEventListener('click', closeActivity);
  overlay.querySelector('#reading-intro').addEventListener('click', () => speak('Look, listen, and choose the right answer!'));
  questionSpeaker.addEventListener('click', () => { if (!locked) speak(questions[index].question); });
  overlay.querySelector('#reading-complete-speaker').addEventListener('click', () => speak(`Great job! ${config.completion}`));
  overlay.querySelector('#reading-again').addEventListener('click', () => { index = 0; render(); });
  overlay.querySelector('#reading-finish').addEventListener('click', closeActivity);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) closeActivity(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !overlay.hidden) closeActivity(); });
})();
