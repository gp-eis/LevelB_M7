(() => {
  const week = Number(document.body.dataset.pageTwoWeek);
  const video = document.getElementById('dialogue-video');
  const triggers = [...document.querySelectorAll('[data-topic][data-video]')];
  if (!week || !video || !triggers.length) return;

  const TOPICS = {
    2: {
      seasons: {
        label: 'Spring, Summer, Fall', icon: '🐝', sentence: 'The bee feels warm in spring, hot in summer, cool in fall, and cold in winter.',
        instruction: 'Drag a bee to each season and watch its expression change.', mode: 'custom',
        items: [
          { symbol: '🌸', label: 'Spring', correct: true },
          { symbol: '☀️', label: 'Summer', correct: true },
          { symbol: '🍂', label: 'Fall', correct: true },
          { symbol: '❄️', label: 'Winter', correct: false },
          { symbol: '🏠', label: 'Inside', correct: false }
        ]
      },
      spring: {
        label: 'Spring', icon: '🌸', sentence: 'Bees visit many flowers in spring.',
        instruction: 'Help the bee carry four kinds of flowers to the vase.', mode: 'custom',
        items: [
          { symbol: '🟫', label: 'Soil' }, { symbol: '🌰', label: 'Seed' },
          { symbol: '🌧️', label: 'Rain' }, { symbol: '🌷', label: 'Flower' }
        ]
      },
      summer: {
        label: 'Summer', icon: '☀️', sentence: 'Snow, ice, snowmen, and igloos do not belong in summer.',
        instruction: 'Use the bee cursor to find four things that do not belong in summer.', mode: 'custom',
        items: [
          { symbol: '🌻', label: 'Sunflower', correct: true },
          { symbol: '🌺', label: 'Hibiscus', correct: true },
          { symbol: '🌼', label: 'Daisy', correct: true },
          { symbol: '❄️', label: 'Snow', correct: false },
          { symbol: '🍂', label: 'Dry leaves', correct: false },
          { symbol: '🧊', label: 'Ice', correct: false }
        ]
      },
      fall: {
        label: 'Fall', icon: '🍂', sentence: 'Leaves fall from trees in fall.',
        instruction: 'Move the bee basket and catch ten falling leaves.', mode: 'custom',
        items: [
          { symbol: '🍁', label: 'Red leaf', correct: true },
          { symbol: '🍂', label: 'Brown leaves', correct: true },
          { symbol: '🟠', label: 'Orange leaf', correct: true },
          { symbol: '🌷', label: 'Spring flower', correct: false },
          { symbol: '❄️', label: 'Snowflake', correct: false },
          { symbol: '🏖️', label: 'Beach', correct: false }
        ]
      },
      winter: {
        label: 'Winter', icon: '❄️', sentence: 'In winter, bees stay inside the hive and form a tight cluster around their queen to keep warm.',
        instruction: 'Move all seven shivering bees into a warm cluster around their queen.', mode: 'custom',
        items: [
          { symbol: '🍯', label: 'Honey food', correct: true },
          { symbol: '🐝🐝', label: 'Bee cluster', correct: true },
          { symbol: '🏠', label: 'Warm hive', correct: true },
          { symbol: '🏖️', label: 'Beach', correct: false },
          { symbol: '🌊', label: 'Ocean', correct: false },
          { symbol: '🌬️', label: 'Cold wind', correct: false }
        ]
      }
    },
    3: {
      plants: {
        label: 'Plants', icon: '🌱', sentence: 'Bees help plants grow.',
        instruction: 'Grow the plant: seed, water, sun, love, then bee.', mode: 'custom',
        items: [
          { symbol: '🟫', label: 'Soil' }, { symbol: '🌰', label: 'Seed' },
          { symbol: '💧', label: 'Water' }, { symbol: '🌱', label: 'Plant' }
        ]
      },
      trees: {
        label: 'Trees', icon: '🌳', sentence: 'Bees help trees make seeds and fruit.',
        instruction: 'Use the bee cursor to pollinate the apple blossoms.', mode: 'custom',
        items: [
          { symbol: '☀️', label: 'Sunlight', correct: true },
          { symbol: '💧', label: 'Water', correct: true },
          { symbol: '🟫', label: 'Soil', correct: true },
          { symbol: '🍭', label: 'Candy', correct: false },
          { symbol: '🧸', label: 'Toy', correct: false },
          { symbol: '🧊', label: 'Ice cube', correct: false }
        ]
      },
      flowers: {
        label: 'Flowers', icon: '🌼', sentence: 'Bees carry pollen between flowers.',
        instruction: 'Jump across six flowers, then put them in the vase.', mode: 'custom',
        items: [
          { symbol: '🌷', label: 'Tulip', correct: true },
          { symbol: '🌻', label: 'Sunflower', correct: true },
          { symbol: '🌺', label: 'Hibiscus', correct: true },
          { symbol: '🌼', label: 'Daisy', correct: true },
          { symbol: '🪨', label: 'Rock', correct: false },
          { symbol: '🧱', label: 'Brick', correct: false }
        ]
      },
      fruits: {
        label: 'Fruits', icon: '🍎', sentence: 'Bees help plants make fruits.',
        instruction: 'Drag only the fruits into the basket.', mode: 'custom',
        items: [
          { symbol: '🍎', label: 'Apple', correct: true },
          { symbol: '🍓', label: 'Strawberry', correct: true },
          { symbol: '🍊', label: 'Orange', correct: true },
          { symbol: '🥕', label: 'Carrot', correct: false },
          { symbol: '🥦', label: 'Broccoli', correct: false },
          { symbol: '🥬', label: 'Lettuce', correct: false }
        ]
      },
      vegetables: {
        label: 'Vegetables', icon: '🥕', sentence: 'Bees help plants make vegetables.',
        instruction: 'Use the bee cursor to catch the falling vegetables.', mode: 'custom',
        items: [
          { symbol: '🥕', label: 'Carrot', correct: true },
          { symbol: '🥦', label: 'Broccoli', correct: true },
          { symbol: '🥬', label: 'Lettuce', correct: true },
          { symbol: '🍎', label: 'Apple', correct: false },
          { symbol: '🍇', label: 'Grapes', correct: false },
          { symbol: '🍊', label: 'Orange', correct: false }
        ]
      }
    },
    4: {
      book: {
        label: 'Wrote a book', icon: '📘', sentence: 'Lorenzo Langstroth wrote a book about bees.',
        instruction: 'Make a book. Tap the steps in order.', mode: 'sequence',
        items: [
          { symbol: '💡', label: 'Think' }, { symbol: '✏️', label: 'Write' },
          { symbol: '📄', label: 'Add pages' }, { symbol: '📘', label: 'Book' }
        ]
      },
      help: {
        label: 'Helped beekeepers', icon: '🧑‍🌾', sentence: 'Lorenzo Langstroth helped beekeepers.',
        instruction: 'Choose the tools that help a beekeeper work safely.', mode: 'pick',
        items: [
          { symbol: '🥽', label: 'Bee veil', correct: true },
          { symbol: '💨', label: 'Smoker', correct: true },
          { symbol: '🧤', label: 'Gloves', correct: true },
          { symbol: '⚽', label: 'Soccer ball', correct: false },
          { symbol: '🎸', label: 'Guitar', correct: false },
          { symbol: '🛹', label: 'Skateboard', correct: false }
        ]
      },
      kept: {
        label: 'Kept bees', icon: '🐝', sentence: 'Lorenzo Langstroth kept bees.',
        instruction: 'Care for the bees. Tap the steps in order.', mode: 'sequence',
        items: [
          { symbol: '🥽', label: 'Wear protection' }, { symbol: '💨', label: 'Calm the bees' },
          { symbol: '🔎', label: 'Check the hive' }, { symbol: '🏠', label: 'Close the hive' }
        ]
      },
      loved: {
        label: 'Loved bees', icon: '💛', sentence: 'Lorenzo Langstroth loved bees.',
        instruction: 'Choose kind ways to care for bees.', mode: 'pick',
        items: [
          { symbol: '🌼', label: 'Plant flowers', correct: true },
          { symbol: '💧', label: 'Give water', correct: true },
          { symbol: '🏠', label: 'Protect the hive', correct: true },
          { symbol: '🗞️', label: 'Swat bees', correct: false },
          { symbol: '🗑️', label: 'Leave trash', correct: false },
          { symbol: '🔥', label: 'Burn flowers', correct: false }
        ]
      },
      hive: {
        label: 'Made the modern beehive', icon: '🏠', sentence: 'Lorenzo Langstroth made the modern beehive.',
        instruction: 'Build the modern hive from bottom to top.', mode: 'sequence',
        items: [
          { symbol: '▰', label: 'Hive base' }, { symbol: '▣', label: 'Bee box' },
          { symbol: '▤', label: 'Honey box' }, { symbol: '🔺', label: 'Hive roof' }
        ]
      }
    }
  };

  const definitions = TOPICS[week];
  if (!definitions) return;

  const videoShell = document.createElement('div');
  videoShell.className = 'topic-video-shell';
  video.parentNode.insertBefore(videoShell, video);
  videoShell.appendChild(video);
  const videoLock = document.createElement('button');
  videoLock.className = 'topic-video-lock is-locked';
  videoLock.type = 'button';
  videoLock.disabled = true;
  videoLock.innerHTML = '<span aria-hidden="true">🔒</span><small>Choose a topic below. The activity is optional.</small>';
  videoShell.appendChild(videoLock);
  video.pause();
  video.removeAttribute('src');
  video.querySelectorAll('source').forEach((source) => source.remove());
  video.load();

  let currentVideoReady = false;
  const showVideoLock = () => { videoLock.hidden = false; };
  const hideVideoLock = () => { videoLock.hidden = true; };
  video.addEventListener('play', hideVideoLock);
  video.addEventListener('playing', hideVideoLock);
  video.addEventListener('pause', () => { if (currentVideoReady) showVideoLock(); });
  video.addEventListener('ended', showVideoLock);
  videoLock.addEventListener('click', () => {
    if (!currentVideoReady) return;
    video.play().catch(showVideoLock);
  });

  const overlay = document.createElement('div');
  overlay.className = 'topic-activity-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <section class="topic-activity-dialog" role="dialog" aria-modal="true" aria-labelledby="topic-activity-title">
      <header class="topic-activity-header">
        <span class="topic-activity-icon" aria-hidden="true"></span>
        <div class="topic-activity-heading"><h2 id="topic-activity-title"></h2><p class="topic-activity-instruction"></p></div>
        <div class="topic-activity-actions">
          <button class="topic-activity-skip-top" type="button"><span class="topic-skip-full">Skip to Video</span><span class="topic-skip-short">Skip</span> ▶</button>
          <button class="topic-activity-close" type="button" aria-label="Close activity">×</button>
        </div>
      </header>
      <div class="topic-activity-progress" aria-hidden="true"><span></span></div>
      <div class="topic-activity-stage"></div>
      <div class="topic-activity-feedback" role="status" aria-live="polite"></div>
      <div class="topic-activity-footer">
        <button class="pill-btn blue topic-activity-restart" type="button">↻ Start Again</button>
      </div>
      <div class="topic-activity-success" hidden>
        <div class="topic-activity-success-card">
          <span aria-hidden="true">⭐</span><h3>Great job!</h3><p></p>
          <button class="topic-activity-watch" type="button">▶ Watch Video</button>
        </div>
      </div>
    </section>`;
  document.body.appendChild(overlay);

  const closeButton = overlay.querySelector('.topic-activity-close');
  const icon = overlay.querySelector('.topic-activity-icon');
  const title = overlay.querySelector('h2');
  const instruction = overlay.querySelector('.topic-activity-instruction');
  const progress = overlay.querySelector('.topic-activity-progress span');
  const stage = overlay.querySelector('.topic-activity-stage');
  const feedback = overlay.querySelector('.topic-activity-feedback');
  const restartButton = overlay.querySelector('.topic-activity-restart');
  const skipTopButton = overlay.querySelector('.topic-activity-skip-top');
  const success = overlay.querySelector('.topic-activity-success');
  const successSentence = success.querySelector('p');
  const watchButton = success.querySelector('button');

  let activeKey = '';
  let activeTrigger = null;
  let cleanupCurrentActivity = () => {};

  function cleanupActivity() {
    try { cleanupCurrentActivity(); } catch (_) {}
    cleanupCurrentActivity = () => {};
  }

  function shuffle(items) {
    const copy = items.map((item, index) => ({ ...item, order: index }));
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  }

  function setProgress(value, total) {
    progress.style.width = `${Math.max(0, Math.min(100, value / total * 100))}%`;
  }

  function setFeedback(message, isWrong = false) {
    feedback.textContent = message;
    feedback.classList.toggle('is-wrong', isWrong);
  }

  function markWrong(button, message) {
    button.classList.remove('is-wrong');
    void button.offsetWidth;
    button.classList.add('is-wrong');
    setFeedback(message, true);
  }

  function finishActivity() {
    const definition = definitions[activeKey];
    if (!definition) return;
    cleanupActivity();
    stage.querySelectorAll('button').forEach((button) => { button.disabled = true; });
    setProgress(1, 1);
    successSentence.textContent = definition.sentence;
    watchButton.textContent = `▶ Watch “${definition.label}”`;
    success.hidden = false;
    if (week !== 2) {
      activeTrigger?.classList.add('is-complete');
      try {
        const key = `levelB-m7-week-${week}-page-2-completed`;
        const completed = new Set(JSON.parse(sessionStorage.getItem(key) || '[]'));
        completed.add(activeKey);
        sessionStorage.setItem(key, JSON.stringify([...completed]));
      } catch (_) {}
    }
    if (typeof window.speakAmericanEnglish === 'function') window.speakAmericanEnglish(definition.sentence);
  }

  function choiceMarkup(item) {
    return `<button class="topic-choice" type="button" data-order="${item.order}" data-correct="${item.correct === true}"><span class="topic-choice-symbol" aria-hidden="true">${item.symbol}</span><strong>${item.label}</strong></button>`;
  }

  function renderPick(definition) {
    const items = shuffle(definition.items);
    const total = definition.items.filter((item) => item.correct).length;
    let found = 0;
    stage.innerHTML = `<p class="topic-activity-hint">${definition.instruction}</p><div class="topic-choice-grid">${items.map(choiceMarkup).join('')}</div>`;
    stage.querySelectorAll('.topic-choice').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.correct !== 'true') {
          markWrong(button, 'That one does not belong. Try another choice.');
          return;
        }
        if (button.classList.contains('is-correct')) return;
        button.classList.add('is-correct');
        button.disabled = true;
        found += 1;
        setProgress(found, total);
        setFeedback(`${found} of ${total} correct!`);
        if (found === total) window.setTimeout(finishActivity, 450);
      });
    });
  }

  function renderSequence(definition) {
    const items = shuffle(definition.items);
    let next = 0;
    stage.innerHTML = `<p class="topic-activity-hint">${definition.instruction}</p><div class="topic-choice-grid is-sequence">${items.map(choiceMarkup).join('')}</div>`;
    stage.querySelectorAll('.topic-choice').forEach((button) => {
      button.addEventListener('click', () => {
        const order = Number(button.dataset.order);
        if (order !== next) {
          markWrong(button, `Find step ${next + 1}.`);
          return;
        }
        button.classList.add('is-correct');
        button.disabled = true;
        next += 1;
        setProgress(next, definition.items.length);
        setFeedback(`Step ${next} of ${definition.items.length} complete!`);
        if (next === definition.items.length) window.setTimeout(finishActivity, 450);
      });
    });
  }

  function renderActivity() {
    const definition = definitions[activeKey];
    if (!definition) return;
    cleanupActivity();
    icon.textContent = definition.icon;
    title.textContent = definition.label;
    instruction.textContent = definition.instruction;
    feedback.textContent = '';
    feedback.classList.remove('is-wrong');
    success.hidden = true;
    setProgress(0, 1);
    const rendererSet = window[`LevelBWeek${week}Page2Games`];
    const customRenderer = rendererSet?.[activeKey];
    stage.classList.toggle('is-week2-custom', week === 2 && typeof customRenderer === 'function');
    stage.classList.toggle('is-week3-custom', week === 3 && typeof customRenderer === 'function');
    if (typeof customRenderer === 'function') {
      cleanupCurrentActivity = customRenderer({
        stage,
        definition,
        setProgress,
        setFeedback,
        finishActivity
      }) || (() => {});
      return;
    }
    if (definition.mode === 'sequence') renderSequence(definition);
    else renderPick(definition);
  }

  function openActivity(trigger) {
    const key = trigger.dataset.topic;
    if (!definitions[key]) return;
    activeKey = key;
    activeTrigger = trigger;
    video.pause();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    renderActivity();
    closeButton.focus();
  }

  function closeActivity() {
    cleanupActivity();
    overlay.hidden = true;
    success.hidden = true;
    document.body.style.overflow = '';
    activeTrigger?.focus();
  }

  function playActiveVideo() {
    if (!activeTrigger) return;
    currentVideoReady = true;
    video.pause();
    video.src = activeTrigger.dataset.video;
    video.setAttribute('aria-label', `${activeTrigger.dataset.line} video`);
    videoLock.disabled = false;
    videoLock.classList.remove('is-locked');
    videoLock.innerHTML = `<span aria-hidden="true">▶</span><small>${activeTrigger.dataset.line}</small>`;
    video.load();
    closeActivity();
    video.scrollIntoView({ behavior: 'smooth', block: 'center' });
    video.play().catch(showVideoLock);
  }

  triggers.forEach((trigger) => {
    trigger.classList.add('topic-activity-trigger');
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openActivity(trigger);
    }, true);
  });

  if (week === 2) {
    triggers.forEach((trigger) => trigger.classList.remove('is-complete'));
    try { sessionStorage.removeItem('levelB-m7-week-2-page-2-completed'); } catch (_) {}
  } else {
    try {
      const completed = new Set(JSON.parse(sessionStorage.getItem(`levelB-m7-week-${week}-page-2-completed`) || '[]'));
      triggers.forEach((trigger) => trigger.classList.toggle('is-complete', completed.has(trigger.dataset.topic)));
    } catch (_) {}
  }

  closeButton.addEventListener('click', closeActivity);
  restartButton.addEventListener('click', renderActivity);
  skipTopButton.addEventListener('click', playActiveVideo);
  watchButton.addEventListener('click', playActiveVideo);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) closeActivity(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !overlay.hidden) closeActivity(); });
})();
