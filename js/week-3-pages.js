(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const page = Number(document.body.dataset.weekThreeActivity);
    const stage = document.querySelector('.week-3-stage');
    const status = document.querySelector('.week-3-status');
    const restart = document.querySelector('.week-3-restart');
    const startLayer = document.querySelector('.week-3-start-layer');
    const startButton = document.querySelector('.week-3-start-button');
    const completion = document.querySelector('.week-3-completion');
    const completionRetry = document.querySelector('.completion-retry');
    if (!stage || !status || !restart || !startLayer || !startButton || !completion) return;

    let started = false;
    let completed = false;
    let resetPage = () => {};
    let setPageEnabled = () => {};
    let activePageAudio = null;

    const instructions = {
      3: 'How many are there? Tap each bee as you count.',
      4: 'Match the words to the pictures. Choose a word, then choose its picture.',
      5: 'Earth needs trees, clean water, and plants. Circle the correct pictures.',
      6: 'Connect the letters. Choose a word, then tap its letter chunks in order.'
    };

    function say(text) {
      if (typeof speakAmericanEnglish === 'function') speakAmericanEnglish(text);
      else if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
      }
    }

    function correctCue() {
      if (typeof playTone !== 'function') return;
      playTone(700, .1, .07, 'triangle');
      playTone(980, .16, .08, 'triangle', .09);
    }

    function wrongCue() {
      if (typeof playTone !== 'function') return;
      playTone(230, .16, .08, 'sawtooth');
      playTone(150, .2, .07, 'sawtooth', .12);
    }

    function setStatus(message, state = '') {
      status.textContent = message;
      status.className = `week-3-status${state ? ` ${state}` : ''}`;
    }

    function showWrong(target, message) {
      target.classList.remove('is-wrong');
      void target.offsetWidth;
      target.classList.add('is-wrong');
      wrongCue();
      setStatus(message, 'is-wrong');
      window.setTimeout(() => target.classList.remove('is-wrong'), 650);
    }

    function finish(message, spokenMessage = message) {
      if (completed) return;
      completed = true;
      setPageEnabled(false);
      setStatus(message, 'is-correct');
      correctCue();
      if (spokenMessage) say(spokenMessage);
      window.setTimeout(() => { completion.hidden = false; }, 520);
    }

    function reset(keepStarted = started) {
      if (activePageAudio) {
        activePageAudio.pause();
        activePageAudio.currentTime = 0;
        activePageAudio = null;
      }
      completed = false;
      completion.hidden = true;
      started = keepStarted;
      startLayer.hidden = keepStarted;
      restart.disabled = !keepStarted;
      resetPage();
      setPageEnabled(keepStarted);
      setStatus(keepStarted ? instructions[page] : 'Press Start Activity to begin.');
    }

    function setupCount() {
      const bees = [...stage.querySelectorAll('.bee-target')];
      const badge = stage.querySelector('.count-badge');
      const numberValue = stage.querySelector('.number-value');
      const numberAnswer = stage.querySelector('.number-answer');
      const numberUp = stage.querySelector('.number-up');
      const numberDown = stage.querySelector('.number-down');
      const numberGo = stage.querySelector('.number-go');
      let count = 0;
      let answerValue = 0;
      let answerReady = false;

      function updateNumber() {
        numberValue.textContent = String(answerValue);
        numberUp.disabled = !started || !answerReady || completed || answerValue >= 10;
        numberDown.disabled = !started || !answerReady || completed || answerValue <= 0;
        numberGo.disabled = !started || !answerReady || completed;
      }

      setPageEnabled = (enabled) => {
        bees.forEach((bee) => { bee.disabled = !enabled || answerReady || bee.classList.contains('is-counted'); });
        updateNumber();
      };
      resetPage = () => {
        count = 0;
        answerValue = 0;
        answerReady = false;
        badge.textContent = '0 / 7';
        numberValue.hidden = true;
        numberAnswer.hidden = true;
        numberAnswer.classList.remove('is-wrong');
        updateNumber();
        bees.forEach((bee) => bee.classList.remove('is-counted', 'is-wrong'));
      };
      bees.forEach((bee) => bee.addEventListener('click', () => {
        if (!started || completed || bee.classList.contains('is-counted')) return;
        bee.classList.add('is-counted');
        bee.disabled = true;
        count += 1;
        badge.textContent = `${count} / 7`;
        correctCue();
        say(String(count));
        if (count === 7) {
          answerReady = true;
          numberValue.hidden = false;
          numberAnswer.hidden = false;
          setPageEnabled(true);
          setStatus('You found all the bees! Choose the number, then press GO.', 'is-correct');
          numberUp.focus({ preventScroll: true });
        } else setStatus(`${count} of 7 bees counted. Keep looking!`, 'is-correct');
      }));

      numberUp.addEventListener('click', () => {
        if (!answerReady || answerValue >= 10) return;
        answerValue += 1; updateNumber(); say(String(answerValue));
      });
      numberDown.addEventListener('click', () => {
        if (!answerReady || answerValue <= 0) return;
        answerValue -= 1; updateNumber(); say(String(answerValue));
      });
      numberGo.addEventListener('click', () => {
        if (!answerReady || completed) return;
        if (answerValue !== 7) {
          numberAnswer.classList.remove('is-wrong'); void numberAnswer.offsetWidth; numberAnswer.classList.add('is-wrong');
          wrongCue(); setStatus(`${answerValue} is not correct. Count the bees and try again.`, 'is-wrong');
          window.setTimeout(() => numberAnswer.classList.remove('is-wrong'), 650);
          return;
        }
        activePageAudio = new Audio('../assets/audio/week-3/literacy/page-03-correct.mp3');
        activePageAudio.addEventListener('ended', () => { activePageAudio = null; }, { once: true });
        activePageAudio.play().catch(() => { activePageAudio = null; });
        finish('Correct! There are 7 buzzing bees.', '');
        updateNumber();
      });
    }

    function setupMatch() {
      const nodes = [...stage.querySelectorAll('.match-node')];
      const speakers = [...stage.querySelectorAll('.word-speaker')];
      const svg = stage.querySelector('.match-lines');
      const matched = new Set();
      const colors = { flowers: '#f36b72', trees: '#8e62d5', vegetables: '#f39a35', fruits: '#70b744' };
      const wordOrder = ['flowers', 'trees', 'vegetables', 'fruits'];
      const WORD_AUDIO = wordOrder.map((word) => `../assets/audio/week-3/literacy/page-04-word-${word}.wav`);
      const SENTENCE_AUDIO = wordOrder.map((word) => `../assets/audio/week-3/literacy/page-04-sentence-${word}.wav`);
      let selected = null;
      let dragState = null;
      let suppressClick = false;
      let activeClip = null;

      function stopSegmentAudio() {
        if (!activeClip) return;
        activeClip.pause(); activeClip.currentTime = 0; activeClip = null;
      }

      function playRecordedClip(url, fallback) {
        stopSegmentAudio();
        const clip = new Audio(url); activeClip = clip;
        clip.addEventListener('ended', () => { if (activeClip === clip) activeClip = null; }, { once: true });
        clip.addEventListener('error', () => { if (activeClip === clip) activeClip = null; say(fallback); }, { once: true });
        clip.play().catch(() => { if (activeClip === clip) activeClip = null; say(fallback); });
      }

      function pointFor(node) {
        const nodeRect = (node.querySelector('.match-dot') || node).getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        return { x: ((nodeRect.left + nodeRect.width / 2 - stageRect.left) / stageRect.width) * 1412, y: ((nodeRect.top + nodeRect.height / 2 - stageRect.top) / stageRect.height) * 1114 };
      }

      function drawLine(word) {
        const from = nodes.find((node) => node.dataset.kind === 'word' && node.dataset.match === word);
        const to = nodes.find((node) => node.dataset.kind === 'picture' && node.dataset.match === word);
        const a = pointFor(from); const b = pointFor(to);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', a.x); line.setAttribute('y1', a.y); line.setAttribute('x2', b.x); line.setAttribute('y2', b.y); line.setAttribute('stroke', colors[word]); line.dataset.match = word;
        svg.appendChild(line);
      }

      function setNodeEnabled(node, enabled) {
        const available = enabled && !matched.has(node.dataset.match);
        node.setAttribute('aria-disabled', String(!available));
        if (node instanceof HTMLButtonElement) node.disabled = !available;
        else node.tabIndex = available ? 0 : -1;
      }

      function snapHome(node) { node.style.removeProperty('left'); node.style.removeProperty('top'); }

      function completePair(word) {
        if (matched.has(word)) return;
        const pair = nodes.filter((item) => item.dataset.match === word);
        pair.forEach((item) => { item.classList.remove('is-selected', 'is-drop-target'); item.classList.add('is-matched'); setNodeEnabled(item, false); });
        matched.add(word); selected = null;
        window.requestAnimationFrame(() => drawLine(word));
        correctCue();
        playRecordedClip(SENTENCE_AUDIO[wordOrder.indexOf(word)], `Bees help ${word} grow.`);
        if (matched.size === 4) finish('Great job! You matched all four words.', '');
        else setStatus(`${matched.size} of 4 matches complete.`, 'is-correct');
      }

      function tryPair(first, second) {
        const oppositeKinds = first && second && first.dataset.kind !== second.dataset.kind;
        if (oppositeKinds && first.dataset.match === second.dataset.match) { completePair(first.dataset.match); return true; }
        showWrong(second || first, 'Those do not match. Try again.');
        first?.classList.remove('is-selected'); selected = null;
        return false;
      }

      function chooseNode(node) {
        if (!started || completed || matched.has(node.dataset.match) || node.getAttribute('aria-disabled') === 'true') return;
        if (!selected) {
          selected = node; node.classList.add('is-selected');
          setStatus(`Now choose the picture or word that matches ${node.dataset.match}.`);
          return;
        }
        if (selected === node) { selected.classList.remove('is-selected'); selected = null; setStatus(instructions[4]); return; }
        tryPair(selected, node);
      }

      setPageEnabled = (enabled) => {
        nodes.forEach((node) => setNodeEnabled(node, enabled));
        speakers.forEach((speaker) => { speaker.disabled = !enabled || matched.has(speaker.closest('.word-node').dataset.match); });
      };
      resetPage = () => {
        stopSegmentAudio(); matched.clear(); selected = null; dragState = null; svg.replaceChildren();
        nodes.forEach((node) => { snapHome(node); node.classList.remove('is-selected', 'is-matched', 'is-wrong', 'is-dragging', 'is-drop-target'); });
      };
      window.addEventListener('resize', () => {
        if (!matched.size) return;
        svg.replaceChildren(); matched.forEach(drawLine);
      });

      speakers.forEach((speaker) => {
        speaker.addEventListener('pointerdown', (event) => event.stopPropagation());
        speaker.addEventListener('click', (event) => {
          event.stopPropagation();
          if (speaker.disabled) return;
          const word = wordOrder[Number(speaker.dataset.wordIndex)];
          playRecordedClip(WORD_AUDIO[Number(speaker.dataset.wordIndex)], word);
          setStatus(`Listen: ${word}.`);
        });
      });

      function moveDrag(event) {
        if (!dragState) return;
        const { node } = dragState;
        const dx = event.clientX - dragState.startX; const dy = event.clientY - dragState.startY;
        dragState.lastX = event.clientX; dragState.lastY = event.clientY;
        if (Math.hypot(dx, dy) > 6) dragState.moved = true;
        if (!dragState.moved) return;
        const maxLeft = stage.clientWidth - node.offsetWidth; const maxTop = stage.clientHeight - node.offsetHeight;
        node.style.left = `${Math.max(0, Math.min(maxLeft, dragState.left + dx))}px`;
        node.style.top = `${Math.max(0, Math.min(maxTop, dragState.top + dy))}px`;
        nodes.forEach((item) => item.classList.remove('is-drop-target'));
        const target = document.elementsFromPoint(event.clientX, event.clientY).map((element) => element.closest?.('.match-node')).find((item) => item && item !== node && !matched.has(item.dataset.match));
        target?.classList.add('is-drop-target');
      }

      function endDrag(event) {
        if (!dragState) return;
        const { node, moved } = dragState;
        const clientX = Number.isFinite(event.clientX) ? event.clientX : dragState.lastX;
        const clientY = Number.isFinite(event.clientY) ? event.clientY : dragState.lastY;
        const target = document.elementsFromPoint(clientX, clientY).map((element) => element.closest?.('.match-node')).find((item) => item && item !== node && !matched.has(item.dataset.match));
        nodes.forEach((item) => item.classList.remove('is-drop-target'));
        node.classList.remove('is-dragging'); snapHome(node); dragState = null;
        if (moved) { suppressClick = true; if (target) tryPair(node, target); else setStatus('Drag the piece onto its matching word or picture.'); }
      }

      document.addEventListener('pointermove', moveDrag);
      document.addEventListener('pointerup', endDrag);
      document.addEventListener('pointercancel', endDrag);

      nodes.forEach((node) => {
        node.addEventListener('click', () => {
          if (suppressClick) { suppressClick = false; return; }
          chooseNode(node);
        });
        node.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault(); chooseNode(node);
        });
        node.addEventListener('pointerdown', (event) => {
          if (!started || completed || matched.has(node.dataset.match) || event.target.closest('.word-speaker')) return;
          event.preventDefault();
          const rect = node.getBoundingClientRect(); const stageRect = stage.getBoundingClientRect();
          dragState = { node, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY, left: rect.left - stageRect.left, top: rect.top - stageRect.top, moved: false };
          node.classList.add('is-dragging');
        });
      });
    }

    function setupNeeds() {
      const choices = [...stage.querySelectorAll('.need-choice')];
      const speakers = [...stage.querySelectorAll('.need-speaker')];
      const items = ['trees', 'cars', 'clean water', 'planes', 'plants', 'boats'];
      const audioName = (item) => item.replaceAll(' ', '-');
      const WORD_AUDIO = items.map((item) => `../assets/audio/week-3/literacy/page-05-word-${audioName(item)}.wav`);
      const SENTENCE_AUDIO = {
        trees: '../assets/audio/week-3/literacy/page-05-sentence-trees.wav',
        'clean water': '../assets/audio/week-3/literacy/page-05-sentence-clean-water.wav',
        plants: '../assets/audio/week-3/literacy/page-05-sentence-plants.wav'
      };
      let correct = 0;
      let activeClip = null;

      function stopElementAudio() {
        if (!activeClip) return;
        activeClip.pause(); activeClip.currentTime = 0; activeClip = null;
      }

      function playElementClip(url, fallback) {
        stopElementAudio();
        const clip = new Audio(url); activeClip = clip;
        clip.addEventListener('ended', () => { if (activeClip === clip) activeClip = null; }, { once: true });
        clip.addEventListener('error', () => { if (activeClip === clip) activeClip = null; say(fallback); }, { once: true });
        clip.play().catch(() => { if (activeClip === clip) activeClip = null; say(fallback); });
      }

      function playWord(index) { playElementClip(WORD_AUDIO[index], items[index]); }
      function playCorrectSentence(item) { playElementClip(SENTENCE_AUDIO[item], `Earth needs ${item}.`); }

      setPageEnabled = (enabled) => {
        choices.forEach((choice) => { choice.disabled = !enabled || choice.classList.contains('is-correct'); });
        speakers.forEach((speaker) => { speaker.disabled = !enabled; });
      };
      resetPage = () => { stopElementAudio(); correct = 0; choices.forEach((choice) => choice.classList.remove('is-correct', 'is-wrong')); };

      speakers.forEach((speaker) => speaker.addEventListener('click', () => {
        if (speaker.disabled) return;
        playWord(Number(speaker.dataset.wordIndex));
        setStatus(`Listen: ${speaker.dataset.item}.`);
      }));

      choices.forEach((choice) => choice.addEventListener('click', () => {
        if (!started || completed) return;
        if (choice.dataset.correct !== 'true') {
          playWord(Number(choice.dataset.wordIndex));
          showWrong(choice, `${choice.dataset.item} is not one of the answers. Try again.`);
          return;
        }
        if (choice.classList.contains('is-correct')) return;
        choice.classList.add('is-correct'); choice.disabled = true; correct += 1; correctCue(); playCorrectSentence(choice.dataset.item);
        if (correct === 3) finish('Great job! Earth needs trees, clean water, and plants.', '');
        else setStatus(`${correct} of 3 correct pictures circled.`, 'is-correct');
      }));
    }

    function setupLetters() {
      const starts = [...stage.querySelectorAll('.word-start')];
      const speakers = [...stage.querySelectorAll('.word-left-speaker')];
      const chunks = [...stage.querySelectorAll('.letter-chunk')];
      const targets = [...stage.querySelectorAll('.picture-target')];
      const progress = stage.querySelector('.word-progress');
      const completedPaths = stage.querySelector('.completed-letter-paths');
      const activePath = stage.querySelector('.active-letter-path');
      const pointerPath = stage.querySelector('.pointer-letter-path');
      const finished = new Set();
      const sequences = { flowers: ['fl', 'ow', 'e', 'rs'], bees: ['b', 'e', 'e', 's'], 'clean air': ['a', 'i', 'r'] };
      const wordOrder = ['flowers', 'bees', 'clean air'];
      const pathColors = { flowers: '#ef3d2f', bees: '#efb51b', 'clean air': '#1769c7' };
      const audioName = (word) => word.replaceAll(' ', '-');
      const WORD_AUDIO = wordOrder.map((word) => `../assets/audio/week-3/literacy/page-06-word-${audioName(word)}.wav`);
      const SENTENCE_AUDIO = wordOrder.map((word) => `../assets/audio/week-3/literacy/page-06-sentence-${audioName(word)}.wav`);
      let activeWord = '';
      let step = 0;
      let points = [];
      let readyForPicture = false;
      let recordedBusy = false;
      let activeClip = null;
      let resolveActiveClip = null;
      let activityVersion = 0;

      function stopRecordedClip() {
        if (activeClip) { activeClip.pause(); activeClip.currentTime = 0; activeClip = null; }
        if (resolveActiveClip) { const resolve = resolveActiveClip; resolveActiveClip = null; resolve(); }
      }

      function stopActivityAudio() {
        activityVersion += 1; stopRecordedClip(); window.speechSynthesis?.cancel(); recordedBusy = false;
      }

      function speakLetter(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; utterance.rate = .78;
        window.speechSynthesis.speak(utterance);
      }

      function playRecordedClip(url, fallback) {
        stopRecordedClip();
        return new Promise((resolve) => {
          const clip = new Audio(url); activeClip = clip; resolveActiveClip = resolve;
          const finishClip = () => {
            if (activeClip === clip) activeClip = null;
            if (resolveActiveClip === resolve) resolveActiveClip = null;
            resolve();
          };
          clip.addEventListener('ended', finishClip, { once: true });
          clip.addEventListener('error', () => { say(fallback); finishClip(); }, { once: true });
          clip.play().catch(() => { say(fallback); finishClip(); });
        });
      }

      function pointFor(node) {
        const nodeRect = node.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        return { x: ((nodeRect.left + nodeRect.width / 2 - stageRect.left) / stageRect.width) * 1412, y: ((nodeRect.top + nodeRect.height / 2 - stageRect.top) / stageRect.height) * 1114 };
      }

      function pointString(list) { return list.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' '); }

      function renderActivePath() {
        activePath.setAttribute('points', pointString(points));
        const last = points.at(-1);
        if (last) {
          pointerPath.setAttribute('x1', last.x); pointerPath.setAttribute('y1', last.y);
          pointerPath.setAttribute('x2', last.x); pointerPath.setAttribute('y2', last.y);
        }
        stage.classList.toggle('is-drawing', Boolean(activeWord));
      }

      function clearUnfinishedPath() {
        if (activeWord) chunks.filter((chunk) => chunk.dataset.word === activeWord).forEach((chunk) => chunk.classList.remove('is-done', 'is-next'));
        activeWord = ''; step = 0; points = []; readyForPicture = false;
        activePath.setAttribute('points', '');
        pointerPath.setAttribute('x1', 0); pointerPath.setAttribute('y1', 0); pointerPath.setAttribute('x2', 0); pointerPath.setAttribute('y2', 0);
        stage.classList.remove('is-drawing');
        starts.forEach((button) => button.classList.remove('is-selected'));
        targets.forEach((target) => target.classList.remove('is-next'));
      }

      function updateNext() {
        chunks.forEach((chunk) => chunk.classList.toggle('is-next', Boolean(activeWord) && !readyForPicture && chunk.dataset.word === activeWord && Number(chunk.dataset.step) === step));
        targets.forEach((target) => target.classList.toggle('is-next', readyForPicture && target.dataset.word === activeWord));
      }

      function selectWord(word) {
        if (!started || completed || recordedBusy || finished.has(word)) return;
        stopRecordedClip(); window.speechSynthesis?.cancel();
        clearUnfinishedPath();
        activeWord = word; step = 0;
        points = [pointFor(starts.find((button) => button.dataset.word === word))];
        stage.style.setProperty('--active-path', pathColors[word]);
        starts.forEach((button) => button.classList.toggle('is-selected', button.dataset.word === word));
        chunks.filter((chunk) => chunk.dataset.word === word).forEach((chunk) => chunk.classList.remove('is-done'));
        progress.textContent = `${word}: choose ${sequences[word][0]}`;
        setStatus(`Connect ${word} through its letters in order.`);
        renderActivePath(); updateNext(); setPageEnabled(true);
      }

      setPageEnabled = (enabled) => {
        const available = enabled && !recordedBusy;
        starts.forEach((button) => { button.disabled = !available || finished.has(button.dataset.word); });
        speakers.forEach((speaker) => { speaker.disabled = !available || finished.has(speaker.dataset.word); });
        chunks.forEach((chunk) => { chunk.disabled = !available || !activeWord || readyForPicture || finished.has(chunk.dataset.word); });
        targets.forEach((target) => { target.disabled = !available || !readyForPicture || finished.has(target.dataset.word); });
      };
      resetPage = () => {
        stopActivityAudio(); finished.clear(); clearUnfinishedPath(); completedPaths.replaceChildren();
        progress.textContent = 'Choose a word.';
        [...starts, ...chunks, ...targets].forEach((item) => item.classList.remove('is-selected', 'is-done', 'is-next', 'is-wrong'));
      };
      starts.forEach((button) => button.addEventListener('click', () => selectWord(button.dataset.word)));
      speakers.forEach((speaker) => speaker.addEventListener('click', () => {
        if (speaker.disabled || recordedBusy) return;
        const word = speaker.dataset.word;
        setStatus(`Listen: ${word}.`);
        playRecordedClip(WORD_AUDIO[Number(speaker.dataset.wordIndex)], word);
      }));

      stage.addEventListener('pointermove', (event) => {
        if (!activeWord) return;
        const rect = stage.getBoundingClientRect();
        pointerPath.setAttribute('x2', ((event.clientX - rect.left) / rect.width) * 1412);
        pointerPath.setAttribute('y2', ((event.clientY - rect.top) / rect.height) * 1114);
      });

      chunks.forEach((chunk) => chunk.addEventListener('click', () => {
        if (!started || completed || recordedBusy) return;
        if (!activeWord) { showWrong(chunk, 'Choose flowers, bees, or clean air first.'); return; }
        const expectedWord = activeWord;
        const expectedStep = step;
        if (chunk.dataset.word !== expectedWord || Number(chunk.dataset.step) !== expectedStep) { showWrong(chunk, `Find the next part of ${expectedWord}.`); return; }
        chunk.classList.remove('is-next'); chunk.classList.add('is-done'); points.push(pointFor(chunk)); renderActivePath(); correctCue();
        step += 1; speakLetter(chunk.dataset.spoken);
        if (step === sequences[expectedWord].length) {
          readyForPicture = true;
          progress.textContent = `${expectedWord}: connect the picture`;
          setStatus(`Now connect ${expectedWord} to its picture.`, 'is-correct');
        } else {
          progress.textContent = `${expectedWord}: ${sequences[expectedWord].slice(0, step).join(' · ')} · ?`;
          setStatus(`Good! Find the next letter part of ${expectedWord}.`, 'is-correct');
        }
        updateNext(); setPageEnabled(true);
      }));

      targets.forEach((target) => target.addEventListener('click', async () => {
        if (!started || completed || recordedBusy || !readyForPicture || !activeWord) return;
        if (target.dataset.word !== activeWord) { showWrong(target, `That is not the ${activeWord} picture. Try again.`); return; }
        const word = activeWord; const wordIndex = wordOrder.indexOf(word); const version = activityVersion;
        points.push(pointFor(target)); renderActivePath();
        const lockedPath = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        lockedPath.setAttribute('points', pointString(points)); lockedPath.setAttribute('stroke', pathColors[word]); lockedPath.dataset.word = word;
        completedPaths.appendChild(lockedPath);
        starts.find((button) => button.dataset.word === word)?.classList.add('is-done');
        target.classList.remove('is-next'); target.classList.add('is-done');
        window.speechSynthesis?.cancel(); stopRecordedClip();
        correctCue(); recordedBusy = true; readyForPicture = false; setPageEnabled(true);
        setStatus(`Listen to the word ${word}.`, 'is-correct');
        await playRecordedClip(WORD_AUDIO[wordIndex], word);
        if (version !== activityVersion) return;
        setStatus(`Listen to the sentence for ${word}.`, 'is-correct');
        await playRecordedClip(SENTENCE_AUDIO[wordIndex], `Earth needs ${word}.`);
        if (version !== activityVersion) return;
        finished.add(word); recordedBusy = false;
        activeWord = ''; step = 0; points = []; activePath.setAttribute('points', ''); stage.classList.remove('is-drawing');
        starts.forEach((button) => button.classList.remove('is-selected'));
        progress.textContent = `${finished.size} / 3 paths complete`;
        if (finished.size === 3) finish('Great job! You connected all three words.', '');
        else { setStatus(`${finished.size} of 3 paths complete. Choose another word.`, 'is-correct'); updateNext(); setPageEnabled(true); }
      }));
    }

    if (page === 3) setupCount();
    if (page === 4) setupMatch();
    if (page === 5) setupNeeds();
    if (page === 6) setupLetters();

    startButton.addEventListener('click', () => {
      started = true; startLayer.hidden = true;
      const unlock = () => {
        activePageAudio = null; restart.disabled = false; setPageEnabled(true); setStatus(instructions[page]);
        stage.querySelector('button:not(.week-3-start-button):not(.completion-retry)')?.focus({ preventScroll: true });
      };
      if (page === 3 || page === 4 || page === 5 || page === 6) {
        restart.disabled = true; setPageEnabled(false); setStatus('Listen to the directions.');
        const introSource = {
          3: '../assets/audio/week-3/literacy/page-03-intro.mp3',
          4: '../assets/audio/week-3/literacy/page-04-intro.mp3',
          5: '../assets/audio/week-3/literacy/page-05-intro.mp3',
          6: '../assets/audio/week-3/literacy/page-06-intro.mp3'
        }[page];
        activePageAudio = new Audio(introSource);
        let unlocked = false;
        const unlockOnce = () => { if (unlocked) return; unlocked = true; unlock(); };
        activePageAudio.addEventListener('ended', unlockOnce, { once: true });
        activePageAudio.addEventListener('error', unlockOnce, { once: true });
        activePageAudio.play().catch(unlockOnce);
      } else {
        unlock(); say(instructions[page]);
      }
    });
    restart.addEventListener('click', () => reset(true));
    completionRetry?.addEventListener('click', () => reset(true));
    reset(false);
  });
})();
