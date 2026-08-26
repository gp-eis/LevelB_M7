(() => {
  const week = Number(document.body.dataset.week);
  const directions = week === 4 ? {
    3: 'What did you do? Circle the right answer.',
    4: 'I kept bees. Match the words to the pictures.',
    5: 'Who was Lorenzo Langstroth? Choose the right answer.',
    6: 'Without bees, we cannot live. Circle all the correct pictures.'
  } : {
    2: 'Woof! Woof! What am I? What shapes make up my body?',
    3: 'Look at what each dog is doing. Then match the sentence parts.',
    4: 'How many different colored dogs are there?',
    5: 'How many dogs are sleeping?',
    6: 'Dog Park Rules. What should we do at the dog park? Circle O or X for your answer.'
  };

  const page = Number(document.body.dataset.page);
  const direction = directions[page];
  const wrap = document.querySelector('.activity-sheet-wrap');
  const stage = wrap && wrap.firstElementChild;
  if (!direction || !wrap || !stage) return;

  const feedback = document.querySelector([
    '.page2-activity-feedback',
    '.page3-match-feedback',
    '.page4-count-feedback',
    '.page5-count-feedback',
    '.page6-rules-feedback',
    '.w4-feedback'
  ].join(','));
  const originalFeedback = feedback ? feedback.textContent.trim() : '';

  const startLayer = document.createElement('div');
  startLayer.className = 'literacy-activity-start-layer';
  startLayer.innerHTML = `
    <button class="literacy-activity-start-button" type="button" aria-label="Start activity and listen to: ${direction}">
      <span aria-hidden="true">&#9654;</span>
      <span>Start Activity</span>
    </button>
  `;
  wrap.appendChild(startLayer);
  wrap.classList.add('has-literacy-activity-start');
  wrap.scrollLeft = 0;
  stage.inert = true;
  stage.setAttribute('aria-hidden', 'true');

  const startButton = startLayer.querySelector('.literacy-activity-start-button');
  let started = false;

  startButton.addEventListener('click', async () => {
    if (started) return;
    started = true;
    startLayer.hidden = true;
    stage.removeAttribute('aria-hidden');
    stage.setAttribute('aria-busy', 'true');
    if (feedback) feedback.textContent = 'Listen to the directions.';

    const narration = typeof speakAmericanEnglish === 'function'
      ? speakAmericanEnglish(direction, { rate: .82, pitch: 1.05 })
      : Promise.resolve();
    const safetyTimeout = new Promise(resolve => window.setTimeout(resolve, 14000));
    await Promise.race([Promise.resolve(narration), safetyTimeout]);

    stage.inert = false;
    stage.removeAttribute('aria-busy');
    if (feedback && feedback.textContent === 'Listen to the directions.') {
      feedback.textContent = originalFeedback;
    }
    document.dispatchEvent(new CustomEvent('level-c-literacy-activity-started', {
      detail: { page, direction }
    }));
  });
})();
