(() => {
  const INTRO_AUDIO = '../assets/audio/week-4/literacy/page-04/intro.mp3';
  const facts = [
    { key: 'book', sentence: 'Lorenzo Langstroth wrote a book.', x: 25.8, y: 43, color: '#ef7fb0', box: [3.4, 38.7, 22.6, 9.5] },
    { key: 'loved', sentence: 'Lorenzo Langstroth loved bees.', x: 23.6, y: 56.8, color: '#4f9cda', box: [3.4, 52.4, 20.2, 9.5] },
    { key: 'hive', sentence: 'Lorenzo Langstroth made the modern beehive.', x: 41.2, y: 70.4, color: '#f4a14b', box: [3.4, 66.1, 37.8, 9.5] },
    { key: 'helped', sentence: 'Lorenzo Langstroth helped beekeepers.', x: 32.8, y: 84.3, color: '#6fbf3d', box: [3.4, 80.1, 29.4, 9.5] }
  ].map(fact => ({
    ...fact,
    wordAudio: `../assets/audio/week-4/literacy/page-04/word-${fact.key}.mp3`,
    sentenceAudio: `../assets/audio/week-4/literacy/page-04/sentence-${fact.key}.mp3`
  }));
  const targets = [
    { key: 'hive', x: 57.7, y: 42.8, label: 'modern beehives', zone: [57.2, 32.5, 18.4, 22.5] },
    { key: 'book', x: 80, y: 55.8, label: 'a typewriter writing a book', zone: [79.2, 44.5, 17.6, 23.5] },
    { key: 'loved', x: 57.7, y: 69.8, label: 'bees on flowers', zone: [57.1, 58.5, 18.2, 23.5] },
    { key: 'helped', x: 79.4, y: 83.6, label: 'many healthy bees', zone: [78.9, 72.3, 18.2, 23.5] }
  ];
  const wrap = document.querySelector('.activity-sheet-wrap');
  const image = wrap && wrap.querySelector('.activity-sheet-image');
  if (!wrap || !image) return;

  const stage = document.createElement('div');
  stage.className = 'w4-bee-stage w4-page4-stage';
  image.before(stage);
  stage.appendChild(image);
  image.draggable = false;
  wrap.classList.add('w4-bee-wrap', 'w4-page4-wrap');
  stage.insertAdjacentHTML('beforeend', `
    <svg class="w4-page4-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <g id="w4-page4-lines"></g>
      <g id="w4-page4-preview"></g>
    </svg>
    <button class="w4-page4-intro-replay" type="button" aria-label="Replay the Page 4 directions" disabled>🔊</button>
    ${facts.map(fact => `
      <button class="w4-page4-source-zone" type="button" data-source="${fact.key}" style="left:${fact.box[0]}%;top:${fact.box[1]}%;width:${fact.box[2]}%;height:${fact.box[3]}%" aria-label="Choose: ${fact.sentence}" disabled></button>
      <button class="w4-page4-word-speaker" type="button" data-word="${fact.key}" data-audio="${fact.wordAudio}" style="left:2.1%;top:${fact.y}%" aria-label="Listen to: ${fact.sentence}" disabled>🔊</button>`).join('')}
    ${targets.map(target => `
      <button class="w4-page4-picture-zone" type="button" data-target="${target.key}" style="left:${target.zone[0]}%;top:${target.zone[1]}%;width:${target.zone[2]}%;height:${target.zone[3]}%" aria-label="Click or drag ${target.label}" disabled></button>`).join('')}
    <div class="literacy-activity-start-layer w4-page4-start-layer">
      <button class="literacy-activity-start-button w4-page4-start-button" type="button"><span aria-hidden="true">▶</span><span>Start Activity</span></button>
    </div>
  `);
  document.querySelector('.activity-build-note')?.remove();
  wrap.insertAdjacentHTML('afterend', `
    <p class="w4-feedback" aria-live="polite">Press Start Activity and listen.</p>
    <div class="w4-actions"><button class="w4-restart" type="button">↻ Try Again</button></div>
  `);

  const feedback = document.querySelector('.w4-feedback');
  const restart = document.querySelector('.w4-restart');
  const startLayer = stage.querySelector('.w4-page4-start-layer');
  const startButton = stage.querySelector('.w4-page4-start-button');
  const replayButton = stage.querySelector('.w4-page4-intro-replay');
  const sourceZones = [...stage.querySelectorAll('.w4-page4-source-zone')];
  const pictureZones = [...stage.querySelectorAll('.w4-page4-picture-zone')];
  const speakers = [...stage.querySelectorAll('.w4-page4-word-speaker')];
  const lineGroup = stage.querySelector('#w4-page4-lines');
  const previewGroup = stage.querySelector('#w4-page4-preview');
  const introAudio = new Audio(INTRO_AUDIO);
  const promptAudio = new Audio();
  const sentenceAudio = new Audio();
  let selection = null;
  let completed = 0;
  let dragState = null;
  let suppressPictureClick = null;
  let lastPointer = null;

  function setEnabled(enabled) {
    sourceZones.forEach(button => { button.disabled = !enabled || button.classList.contains('is-matched'); });
    pictureZones.forEach(button => { button.disabled = !enabled || button.classList.contains('is-matched'); });
    speakers.forEach(button => { button.disabled = !enabled; });
    replayButton.disabled = !enabled;
  }

  function endpoint(type, key) {
    if (type === 'source') return facts.find(fact => fact.key === key);
    return targets.find(target => target.key === key);
  }

  function clearSelection() {
    sourceZones.forEach(button => button.classList.remove('is-selected'));
    pictureZones.forEach(button => button.classList.remove('is-selected'));
    selection = null;
    previewGroup.replaceChildren();
  }

  function createLine(className, start, end, color) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', className);
    line.setAttribute('x1', start.x);
    line.setAttribute('y1', start.y);
    line.setAttribute('x2', end.x);
    line.setAttribute('y2', end.y);
    if (color) line.setAttribute('stroke', color);
    return line;
  }

  function stagePoint(event) {
    const bounds = stage.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, (event.clientX - bounds.left) * 100 / bounds.width)),
      y: Math.max(0, Math.min(100, (event.clientY - bounds.top) * 100 / bounds.height))
    };
  }

  function renderPreview(point) {
    if (!selection) return;
    const start = endpoint(selection.type, selection.key);
    const fallback = selection.type === 'source' ? { x: start.x + 9, y: start.y } : { x: start.x - 9, y: start.y };
    const end = point || lastPointer || fallback;
    previewGroup.replaceChildren(createLine('w4-page4-preview-line', start, end, '#176ac2'));
  }

  function select(type, key, button, point) {
    clearSelection();
    selection = { type, key };
    button.classList.add('is-selected');
    renderPreview(point);
    const fact = facts.find(item => item.key === key);
    feedback.className = 'w4-feedback';
    feedback.textContent = type === 'source'
      ? `${fact.sentence} Now choose or drag the matching picture.`
      : `Picture selected. Choose the matching text box.`;
  }

  function wrong(sourceButton, pictureButton) {
    sourceButton.classList.add('is-wrong');
    pictureButton.classList.add('is-wrong');
    feedback.className = 'w4-feedback is-wrong';
    feedback.textContent = 'Try again. Those two do not match.';
    if (typeof playTone === 'function') {
      playTone(210, .18, .1, 'sawtooth');
      playTone(145, .24, .08, 'sawtooth', .16);
    }
    window.setTimeout(() => {
      sourceButton.classList.remove('is-wrong');
      pictureButton.classList.remove('is-wrong');
    }, 650);
    clearSelection();
  }

  function complete(sourceKey, targetKey) {
    const sourceButton = sourceZones.find(button => button.dataset.source === sourceKey);
    const pictureButton = pictureZones.find(button => button.dataset.target === targetKey);
    if (sourceKey !== targetKey) {
      wrong(sourceButton, pictureButton);
      return;
    }
    const fact = facts.find(item => item.key === sourceKey);
    const target = targets.find(item => item.key === targetKey);
    lineGroup.appendChild(createLine('w4-page4-match-line', fact, target, fact.color));
    clearSelection();
    sourceButton.classList.add('is-matched');
    pictureButton.classList.add('is-matched');
    sourceButton.disabled = true;
    pictureButton.disabled = true;
    completed += 1;
    if (typeof playTone === 'function') {
      playTone(523.25, .12, .1, 'triangle');
      playTone(783.99, .18, .08, 'triangle', .12);
    }
    feedback.className = 'w4-feedback is-correct';
    feedback.textContent = `Correct! ${fact.sentence}`;
    sentenceAudio.pause();
    sentenceAudio.src = fact.sentenceAudio;
    sentenceAudio.currentTime = 0;
    sentenceAudio.play().catch(() => {});
    if (completed === facts.length) {
      sentenceAudio.onended = () => {
        feedback.textContent = 'Great job! You matched all four facts.';
        sentenceAudio.onended = null;
      };
    }
  }

  function playWordAudio(source, onEnded) {
    promptAudio.pause();
    promptAudio.src = source;
    promptAudio.currentTime = 0;
    promptAudio.onended = onEnded || null;
    promptAudio.play().catch(() => {
      promptAudio.onended = null;
      onEnded?.();
    });
  }

  function handleSource(button) {
    const key = button.dataset.source;
    const fact = facts.find(item => item.key === key);
    if (selection?.type === 'target') {
      const targetKey = selection.key;
      playWordAudio(fact.wordAudio, () => complete(key, targetKey));
    } else {
      playWordAudio(fact.wordAudio);
      if (selection?.type === 'source' && selection.key === key) clearSelection();
      else select('source', key, button);
    }
  }

  function handlePicture(button) {
    const key = button.dataset.target;
    if (selection?.type === 'source') complete(selection.key, key);
    else if (selection?.type === 'target' && selection.key === key) clearSelection();
    else select('target', key, button);
  }

  sourceZones.forEach(button => button.addEventListener('click', () => handleSource(button)));
  pictureZones.forEach(button => {
    button.addEventListener('click', () => {
      if (suppressPictureClick === button.dataset.target) {
        suppressPictureClick = null;
        return;
      }
      handlePicture(button);
    });
    button.addEventListener('pointerdown', event => {
      if (button.disabled || event.button > 0) return;
      dragState = { pointerId: event.pointerId, key: button.dataset.target, startX: event.clientX, startY: event.clientY, moved: false };
      button.setPointerCapture(event.pointerId);
    });
  });

  stage.addEventListener('pointermove', event => {
    lastPointer = stagePoint(event);
    if (dragState && dragState.pointerId === event.pointerId) {
      if (!dragState.moved && Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY) > 6) {
        dragState.moved = true;
        const button = pictureZones.find(item => item.dataset.target === dragState.key);
        select('target', dragState.key, button, lastPointer);
      }
      if (dragState.moved) renderPreview(lastPointer);
    } else if (selection) renderPreview(lastPointer);
  });
  stage.addEventListener('pointerup', event => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const finished = dragState;
    dragState = null;
    if (!finished.moved) return;
    suppressPictureClick = finished.key;
    window.setTimeout(() => { if (suppressPictureClick === finished.key) suppressPictureClick = null; }, 0);
    const source = document.elementFromPoint(event.clientX, event.clientY)?.closest('.w4-page4-source-zone');
    if (source && !source.disabled) complete(source.dataset.source, finished.key);
    else {
      feedback.textContent = 'Drag the picture to one of the text boxes, or tap a text box.';
      renderPreview();
    }
  });
  stage.addEventListener('pointercancel', () => { dragState = null; });

  speakers.forEach(button => button.addEventListener('click', event => {
    event.stopPropagation();
    playWordAudio(button.dataset.audio);
  }));

  function playIntro() {
    setEnabled(false);
    promptAudio.pause();
    promptAudio.onended = null;
    sentenceAudio.pause();
    feedback.className = 'w4-feedback';
    feedback.textContent = 'Listen to the directions.';
    introAudio.currentTime = 0;
    introAudio.onended = () => {
      introAudio.onended = null;
      setEnabled(true);
      feedback.textContent = 'Tap a speaker, then connect each text box to its picture.';
    };
    introAudio.play().catch(() => {
      setEnabled(true);
      feedback.textContent = 'Tap a speaker, then connect each text box to its picture.';
    });
  }

  function reset() {
    introAudio.pause();
    promptAudio.pause();
    promptAudio.onended = null;
    sentenceAudio.pause();
    completed = 0;
    dragState = null;
    clearSelection();
    lineGroup.replaceChildren();
    [...sourceZones, ...pictureZones].forEach(button => {
      button.disabled = false;
      button.classList.remove('is-selected', 'is-matched', 'is-wrong');
    });
    playIntro();
  }

  startButton.addEventListener('click', () => {
    startLayer.hidden = true;
    playIntro();
  });
  replayButton.addEventListener('click', playIntro);
  restart.addEventListener('click', reset);
  setEnabled(false);
})();
