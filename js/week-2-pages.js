(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const page = Number(document.body.dataset.weekTwoActivity);
    const stage = document.querySelector('.week-2-stage');
    const status = document.getElementById('week-2-status');
    const restart = document.getElementById('week-2-restart');
    const completion = document.getElementById('week-2-completion');
    const completionRetry = document.getElementById('week-2-completion-retry');
    if (!stage || !status || !restart || !completion) return;

    const allTargets = [...stage.querySelectorAll('.activity-target')];
    let completed = false;
    let selectedSource = null;
    let correctCount = 0;
    let pageReset = null;

    function playCorrectCue() {
      if (typeof playTone !== 'function') return;
      playTone(700, .1, .075, 'triangle');
      playTone(980, .16, .085, 'triangle', .09);
    }

    function playWrongCue() {
      if (typeof playTone !== 'function') return;
      playTone(230, .18, .09, 'sawtooth');
      playTone(145, .24, .075, 'sawtooth', .13);
    }

    function say(text) {
      if (typeof speakAmericanEnglish === 'function') speakAmericanEnglish(text);
    }

    function setStatus(message, state = '') {
      status.textContent = message;
      status.className = `week-2-status${state ? ` ${state}` : ''}`;
    }

    function showWrong(target, message) {
      target.classList.remove('is-wrong');
      void target.offsetWidth;
      target.classList.add('is-wrong');
      playWrongCue();
      setStatus(message, 'is-wrong');
      window.setTimeout(() => target.classList.remove('is-wrong'), 700);
    }

    function finish(message) {
      if (completed) return;
      completed = true;
      allTargets.forEach((target) => { target.disabled = true; });
      setStatus(message, 'is-correct');
      playCorrectCue();
      window.setTimeout(() => { completion.hidden = false; }, 420);
    }

    function clearLines() {
      stage.querySelectorAll('.week-2-match-lines line').forEach((line) => line.remove());
    }

    function reset() {
      completed = false;
      selectedSource = null;
      correctCount = 0;
      completion.hidden = true;
      clearLines();
      allTargets.forEach((target) => {
        target.disabled = false;
        target.classList.remove('is-selected', 'is-correct', 'is-wrong');
        target.setAttribute('aria-pressed', 'false');
      });
      if (pageReset) pageReset();
      else if (page === 4) setStatus('Circle spring, summer, and fall.');
      else if (page === 5) setStatus('Choose a season, then choose its matching sentence.');
      else if (page === 6) setStatus('Circle the day of World Bee Day: May 20th.');
    }

    function completeTarget(target) {
      if (target.classList.contains('is-correct')) return false;
      target.classList.add('is-correct');
      target.setAttribute('aria-pressed', 'true');
      target.disabled = true;
      correctCount += 1;
      playCorrectCue();
      return true;
    }

    function setupMaze() {
      const background = document.getElementById('week-2-maze-background');
      const bee = document.getElementById('week-2-maze-bee');
      const gate = document.getElementById('week-2-maze-gate');
      const startButton = document.getElementById('week-2-maze-start');
      const videoLayer = document.getElementById('week-2-maze-video-layer');
      const playVideoButton = document.getElementById('week-2-maze-play-video');
      const video = document.getElementById('week-2-maze-video');
      if (!background || !bee || !gate || !startButton || !videoLayer || !video) return;

      const INTRO_AUDIO = '../assets/audio/week-2/literacy/page-03-intro.mp3';
      const START = { x: 342, y: 686 };
      const GOAL = { x: 720, y: 742, radius: 72 };
      const MAZE_ROUTE = [
        [342, 686], [408, 686], [408, 728], [468, 728], [468, 902],
        [570, 974], [618, 974], [618, 926], [522, 866], [528, 746],
        [582, 746], [588, 638], [714, 560], [738, 560], [774, 584],
        [774, 620], [756, 626], [756, 680]
      ];
      const PATH_TOLERANCE = 38;
      const MAX_PROGRESS_JUMP = 105;

      let current = { ...START };
      let routeProgress = 0;
      let dragOffset = { x: 0, y: 0 };
      let dragging = false;
      let mazeUnlocked = false;
      let introAudio = null;
      let lastBumpAt = 0;
      const routeSegments = [];
      let routeLength = 0;
      for (let index = 0; index < MAZE_ROUTE.length - 1; index += 1) {
        const [x1, y1] = MAZE_ROUTE[index];
        const [x2, y2] = MAZE_ROUTE[index + 1];
        const length = Math.hypot(x2 - x1, y2 - y1);
        routeSegments.push({ x1, y1, x2, y2, length, start: routeLength });
        routeLength += length;
      }

      function projectToRoute(x, y) {
        let nearest = null;
        routeSegments.forEach((segment) => {
          const dx = segment.x2 - segment.x1;
          const dy = segment.y2 - segment.y1;
          const amount = Math.max(0, Math.min(1,
            ((x - segment.x1) * dx + (y - segment.y1) * dy) / (segment.length * segment.length)));
          const pointX = segment.x1 + dx * amount;
          const pointY = segment.y1 + dy * amount;
          const deviation = Math.hypot(x - pointX, y - pointY);
          const progress = segment.start + segment.length * amount;
          if (Math.abs(progress - routeProgress) > MAX_PROGRESS_JUMP) return;
          if (!nearest || deviation < nearest.deviation) {
            nearest = { x: pointX, y: pointY, deviation, progress };
          }
        });
        return nearest;
      }

      function renderBee() {
        bee.style.left = `${(current.x / 1411) * 100}%`;
        bee.style.top = `${(current.y / 1114) * 100}%`;
      }

      function clientToImage(clientX, clientY) {
        const rect = stage.getBoundingClientRect();
        return {
          x: ((clientX - rect.left) / rect.width) * 1411,
          y: ((clientY - rect.top) / rect.height) * 1114
        };
      }

      function bumpWall() {
        const now = performance.now();
        stage.classList.remove('is-bumped');
        void stage.offsetWidth;
        stage.classList.add('is-bumped');
        window.setTimeout(() => stage.classList.remove('is-bumped'), 220);
        setStatus('Stay inside the white maze path.', 'is-wrong');
        if (now - lastBumpAt > 650) {
          playWrongCue();
          lastBumpAt = now;
        }
      }

      function finishMaze() {
        dragging = false;
        current = { x: GOAL.x, y: GOAL.y };
        routeProgress = routeLength;
        renderBee();
        bee.disabled = true;
        bee.classList.remove('is-dragging');
        stage.classList.remove('is-ready');
        say('The bee reached the beehive.');
        finish('Great job! You guided the bee to the beehive.');
      }

      function moveToward(candidateX, candidateY) {
        if (completed) return;
        const nearest = projectToRoute(candidateX, candidateY);
        if (!nearest || nearest.deviation > PATH_TOLERANCE) {
          bumpWall();
          return;
        }
        routeProgress = nearest.progress;
        current = { x: nearest.x, y: nearest.y };
        renderBee();
        if (routeLength - routeProgress <= 14) finishMaze();
        else setStatus('Keep going—guide the bee to the hive!');
      }

      function unlockMaze() {
        gate.hidden = true;
        videoLayer.hidden = true;
        video.pause();
        mazeUnlocked = true;
        bee.disabled = false;
        restart.disabled = false;
        stage.classList.add('is-ready');
        setStatus('Drag the bee through the white maze path to the beehive.');
        bee.focus({ preventScroll: true });
      }

      function showVideo() {
        videoLayer.hidden = false;
        video.currentTime = 0;
        playVideoButton.hidden = true;
        video.play().catch(() => { playVideoButton.hidden = false; });
      }

      function beginIntro() {
        gate.hidden = true;
        setStatus('Listen to the directions. The short clip will play next.');
        introAudio = new Audio(INTRO_AUDIO);
        let advanced = false;
        const advance = () => {
          if (advanced) return;
          advanced = true;
          showVideo();
        };
        introAudio.addEventListener('ended', advance, { once: true });
        introAudio.addEventListener('error', advance, { once: true });
        introAudio.play().catch(advance);
      }

      bee.addEventListener('pointerdown', (event) => {
        if (!mazeUnlocked || completed || bee.disabled) return;
        event.preventDefault();
        const pointer = clientToImage(event.clientX, event.clientY);
        dragOffset = { x: pointer.x - current.x, y: pointer.y - current.y };
        dragging = true;
        bee.classList.add('is-dragging');
        bee.setPointerCapture(event.pointerId);
      });

      bee.addEventListener('pointermove', (event) => {
        if (!dragging) return;
        event.preventDefault();
        const pointer = clientToImage(event.clientX, event.clientY);
        moveToward(pointer.x - dragOffset.x, pointer.y - dragOffset.y);
      });

      function endDrag(event) {
        if (!dragging) return;
        dragging = false;
        bee.classList.remove('is-dragging');
        if (bee.hasPointerCapture(event.pointerId)) bee.releasePointerCapture(event.pointerId);
      }

      bee.addEventListener('pointerup', endDrag);
      bee.addEventListener('pointercancel', endDrag);
      bee.addEventListener('keydown', (event) => {
        if (bee.disabled || completed) return;
        const steps = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
        const movement = steps[event.key];
        if (!movement) return;
        event.preventDefault();
        moveToward(current.x + movement[0], current.y + movement[1]);
      });

      startButton.addEventListener('click', beginIntro);
      playVideoButton.addEventListener('click', () => {
        playVideoButton.hidden = true;
        video.play().catch(unlockMaze);
      });
      video.addEventListener('ended', unlockMaze);
      video.addEventListener('error', () => {
        if (!videoLayer.hidden) unlockMaze();
      });

      pageReset = () => {
        dragging = false;
        current = { ...START };
        routeProgress = 0;
        renderBee();
        bee.classList.remove('is-dragging');
        bee.disabled = !mazeUnlocked;
        restart.disabled = !mazeUnlocked;
        stage.classList.toggle('is-ready', mazeUnlocked);
        setStatus(mazeUnlocked
          ? 'Drag the bee through the white maze path to the beehive.'
          : 'Press Start, listen, and watch the clip to begin.');
      };
    }

    function setupSeasons() {
      const targets = [...stage.querySelectorAll('.season-choice')];
      const wordSpeakers = [...stage.querySelectorAll('.season-word-speaker')];
      const gate = document.getElementById('week-2-seasons-gate');
      const startButton = document.getElementById('week-2-seasons-start');
      const INTRO_AUDIO = '../assets/audio/week-2/literacy/page-04-intro.mp3';
      const ELEMENTS_AUDIO = '../assets/audio/week-2/literacy/page-04-elements.mp3';
      const ELEMENT_RANGES = {
        spring: [0, 1.25],
        summer: [1.25, 2.5],
        fall: [2.5, 3.75],
        winter: [3.75, 5.1]
      };
      let activityReady = false;
      let activeAudio = null;

      function setReady(enabled) {
        activityReady = enabled;
        targets.forEach((target) => { target.disabled = !enabled || target.classList.contains('is-correct'); });
        wordSpeakers.forEach((speaker) => { speaker.disabled = !enabled; });
        restart.disabled = !enabled;
      }

      function playAudio(source, onFinished) {
        if (activeAudio) {
          activeAudio.pause();
          activeAudio.currentTime = 0;
        }
        activeAudio = new Audio(source);
        let finished = false;
        const finishAudio = () => {
          if (finished) return;
          finished = true;
          activeAudio = null;
          onFinished();
        };
        activeAudio.addEventListener('ended', finishAudio, { once: true });
        activeAudio.addEventListener('error', finishAudio, { once: true });
        activeAudio.play().catch(finishAudio);
      }

      function playElementWord(season) {
        if (activeAudio) {
          activeAudio.pause();
          activeAudio.currentTime = 0;
        }
        const [start, end] = ELEMENT_RANGES[season];
        const wordAudio = new Audio(ELEMENTS_AUDIO);
        activeAudio = wordAudio;
        let started = false;
        const beginWord = () => {
          if (started) return;
          started = true;
          wordAudio.currentTime = start;
          wordAudio.play().catch(() => say(season));
        };
        wordAudio.addEventListener('loadedmetadata', beginWord, { once: true });
        wordAudio.addEventListener('timeupdate', () => {
          if (wordAudio.currentTime < end) return;
          wordAudio.pause();
          if (activeAudio === wordAudio) activeAudio = null;
        });
        if (wordAudio.readyState >= 1) beginWord();
      }

      function unlockActivity() {
        gate.hidden = true;
        setReady(true);
        setStatus('Circle spring, summer, and fall.');
        targets[0]?.focus({ preventScroll: true });
      }

      function beginActivity() {
        gate.hidden = true;
        setReady(false);
        setStatus('Listen to the directions.');
        playAudio(INTRO_AUDIO, unlockActivity);
      }

      targets.forEach((target) => {
        target.addEventListener('click', () => {
          if (!activityReady) return;
          playElementWord(target.dataset.season);
          if (target.dataset.correct !== 'true') {
            showWrong(target, 'Bees stay inside during winter. Try another season.');
            return;
          }
          if (!completeTarget(target)) return;
          if (correctCount === 3) finish('Great job! Bees can be seen in spring, summer, and fall.');
          else setStatus(`${correctCount} of 3 correct seasons circled.`, 'is-correct');
        });
      });

      wordSpeakers.forEach((speaker) => {
        speaker.addEventListener('click', () => {
          if (!activityReady) return;
          playElementWord(speaker.dataset.season);
        });
      });

      startButton?.addEventListener('click', beginActivity);
      pageReset = () => {
        setReady(activityReady);
        setStatus(activityReady
          ? 'Circle spring, summer, and fall.'
          : 'Press Start and listen before choosing.');
      };
    }

    function setupMatching() {
      const sources = [...stage.querySelectorAll('.match-source')];
      const stack = document.getElementById('week-2-match-card-stack');
      const cards = [...stage.querySelectorAll('.match-sentence-card')];
      const pictureSpeakers = [...stage.querySelectorAll('.match-picture-speaker')];
      const cardSpeakers = [...stage.querySelectorAll('.match-card-speaker')];
      const svg = stage.querySelector('.week-2-match-lines');
      const gate = document.getElementById('week-2-match-gate');
      const startButton = document.getElementById('week-2-match-start');
      const INTRO_AUDIO = '../assets/audio/week-2/literacy/page-05-intro.mp3';
      const WORD_AUDIO = '../assets/audio/week-2/literacy/page-04-elements.mp3';
      const SENTENCE_AUDIO = '../assets/audio/week-2/literacy/page-05-sentences.mp3';
      const BACKGROUND_IMAGE = '../assets/images/week-2/literacy/page-05-background-v2.png';
      const WORD_INDEX = { spring: 0, summer: 1, fall: 2, winter: 3 };
      const SENTENCE_INDEX = { winter: 0, summer: 1, fall: 2, spring: 3 };
      const matched = new Set();
      let activityReady = false;
      let activeAudio = null;
      let completionTimer = null;
      let dragState = null;
      let suppressNextClick = false;

      function setReady(enabled) {
        activityReady = enabled;
        sources.forEach((source) => {
          source.disabled = !enabled || matched.has(source.dataset.season);
        });
        cards.forEach((card) => {
          const cardEnabled = enabled && !matched.has(card.dataset.season);
          card.tabIndex = cardEnabled ? 0 : -1;
          card.setAttribute('aria-disabled', String(!cardEnabled));
        });
        [...pictureSpeakers, ...cardSpeakers].forEach((speaker) => { speaker.disabled = !enabled; });
        restart.disabled = !enabled;
      }

      function stopAudio() {
        if (!activeAudio) return;
        activeAudio.pause();
        activeAudio.currentTime = 0;
        activeAudio = null;
      }

      function playWhole(source, onFinished) {
        stopAudio();
        const audio = new Audio(source);
        activeAudio = audio;
        let finished = false;
        const finishAudio = () => {
          if (finished) return;
          finished = true;
          if (activeAudio === audio) activeAudio = null;
          onFinished();
        };
        audio.addEventListener('ended', finishAudio, { once: true });
        audio.addEventListener('error', finishAudio, { once: true });
        audio.play().catch(finishAudio);
      }

      function playSegment(source, index, fallbackText) {
        stopAudio();
        const audio = new Audio(source);
        activeAudio = audio;
        let started = false;
        const startSegment = () => {
          if (started) return;
          started = true;
          const segmentLength = audio.duration / 4;
          const start = segmentLength * index;
          const end = index === 3 ? audio.duration : segmentLength * (index + 1);
          audio.currentTime = start;
          const stopAtEnd = () => {
            if (audio.currentTime < end) return;
            audio.pause();
            audio.removeEventListener('timeupdate', stopAtEnd);
            if (activeAudio === audio) activeAudio = null;
          };
          audio.addEventListener('timeupdate', stopAtEnd);
          audio.play().catch(() => say(fallbackText));
        };
        audio.addEventListener('loadedmetadata', startSegment, { once: true });
        audio.addEventListener('error', () => say(fallbackText), { once: true });
        if (audio.readyState >= 1) startSegment();
      }

      function sentenceFor(season) {
        return {
          winter: 'The bee feels cold in winter.',
          summer: 'The bee feels hot in summer.',
          fall: 'The bee feels cool in fall.',
          spring: 'The bee feels warm in spring.'
        }[season];
      }

      function playSentence(season) {
        playSegment(SENTENCE_AUDIO, SENTENCE_INDEX[season], sentenceFor(season));
      }

      function shuffleCards() {
        const shuffled = [...cards];
        for (let index = shuffled.length - 1; index > 0; index -= 1) {
          const swapIndex = Math.floor(Math.random() * (index + 1));
          [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
        }
        shuffled.forEach((card) => stack.appendChild(card));
      }

      function toSvgPoint(rect) {
        const stageRect = stage.getBoundingClientRect();
        return {
          x: ((rect.left + rect.width / 2 - stageRect.left) / stageRect.width) * 1412,
          y: ((rect.top + rect.height / 2 - stageRect.top) / stageRect.height) * 1114
        };
      }

      function drawAllLines() {
        svg.replaceChildren();
        matched.forEach((season) => {
          const source = sources.find((item) => item.dataset.season === season);
          const speaker = pictureSpeakers.find((item) => item.dataset.season === season);
          const card = cards.find((item) => item.dataset.season === season);
          const dot = card.querySelector('.match-card-dot');
          const start = toSvgPoint(speaker.getBoundingClientRect());
          const end = toSvgPoint(dot.getBoundingClientRect());
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', start.x);
          line.setAttribute('y1', start.y);
          line.setAttribute('x2', end.x);
          line.setAttribute('y2', end.y);
          line.setAttribute('stroke', source.dataset.color);
          svg.appendChild(line);
        });
      }

      function clearSelection() {
        sources.forEach((source) => source.classList.remove('is-selected'));
        selectedSource = null;
      }

      function selectSource(source) {
        if (!activityReady || matched.has(source.dataset.season)) return;
        clearSelection();
        selectedSource = source;
        source.classList.add('is-selected');
        setStatus(`Now drag ${source.dataset.season} to its matching sentence, or click the sentence.`);
      }

      function completeMatch(source, card) {
        const season = source.dataset.season;
        matched.add(season);
        clearSelection();
        source.classList.add('is-correct');
        source.setAttribute('aria-pressed', 'true');
        source.disabled = true;
        card.classList.add('is-matched');
        card.classList.remove('is-drop-target', 'is-drop-wrong');
        card.tabIndex = -1;
        card.setAttribute('aria-disabled', 'true');
        drawAllLines();
        playCorrectCue();
        playSentence(season);
        if (matched.size === 4) {
          setStatus('All four pairs are connected!', 'is-correct');
          completionTimer = window.setTimeout(() => {
            completionTimer = null;
            finish('Great job! You matched every season.');
          }, 2800);
        } else {
          setStatus(`${matched.size} of 4 seasons connected.`, 'is-correct');
        }
      }

      function attemptMatch(source, card) {
        if (!source || !card || matched.has(source.dataset.season) || matched.has(card.dataset.season)) return;
        if (source.dataset.season !== card.dataset.season) {
          card.classList.remove('is-drop-wrong');
          void card.offsetWidth;
          card.classList.add('is-drop-wrong');
          playWrongCue();
          setStatus(`That sentence does not match ${source.dataset.season}. Try again.`, 'is-wrong');
          window.setTimeout(() => card.classList.remove('is-drop-wrong'), 700);
          return;
        }
        completeMatch(source, card);
      }

      function cardAtPoint(clientX, clientY) {
        return cards.find((card) => {
          if (matched.has(card.dataset.season)) return false;
          const rect = card.getBoundingClientRect();
          return clientX >= rect.left && clientX <= rect.right
            && clientY >= rect.top && clientY <= rect.bottom;
        }) || null;
      }

      function createDragGhost(source) {
        const sourceRect = source.getBoundingClientRect();
        const backgroundRect = stage.querySelector('.week-2-background').getBoundingClientRect();
        const ghost = document.createElement('div');
        ghost.className = 'match-drag-ghost';
        ghost.setAttribute('aria-hidden', 'true');
        ghost.style.width = `${sourceRect.width}px`;
        ghost.style.height = `${sourceRect.height}px`;
        ghost.style.backgroundImage = `url("${BACKGROUND_IMAGE}")`;
        ghost.style.backgroundSize = `${backgroundRect.width}px ${backgroundRect.height}px`;
        ghost.style.backgroundPosition = `${-(sourceRect.left - backgroundRect.left)}px ${-(sourceRect.top - backgroundRect.top)}px`;
        stage.appendChild(ghost);
        return { ghost, sourceRect };
      }

      function positionDragGhost(event) {
        if (!dragState?.ghost) return;
        const stageRect = stage.getBoundingClientRect();
        const originX = stageRect.left + stage.clientLeft;
        const originY = stageRect.top + stage.clientTop;
        dragState.ghost.style.left = `${event.clientX - originX - dragState.offsetX + dragState.sourceRect.width / 2}px`;
        dragState.ghost.style.top = `${event.clientY - originY - dragState.offsetY + dragState.sourceRect.height / 2}px`;
      }

      function clearDropTargets() {
        cards.forEach((card) => card.classList.remove('is-drop-target'));
      }

      function beginDrag(event, source) {
        if (!activityReady || completed || source.disabled || event.button !== 0) return;
        dragState = {
          source,
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          offsetX: event.clientX - source.getBoundingClientRect().left,
          offsetY: event.clientY - source.getBoundingClientRect().top,
          ghost: null,
          sourceRect: null
        };
        source.setPointerCapture(event.pointerId);
      }

      function moveDrag(event) {
        if (!dragState || dragState.pointerId !== event.pointerId) return;
        const distance = Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY);
        if (!dragState.ghost && distance < 7) return;
        event.preventDefault();
        if (!dragState.ghost) {
          const visual = createDragGhost(dragState.source);
          dragState.ghost = visual.ghost;
          dragState.sourceRect = visual.sourceRect;
          dragState.source.classList.add('is-dragging');
          clearSelection();
        }
        positionDragGhost(event);
        const hoveredCard = cardAtPoint(event.clientX, event.clientY);
        cards.forEach((card) => card.classList.toggle('is-drop-target', card === hoveredCard));
      }

      function endDrag(event, cancelled = false) {
        if (!dragState || dragState.pointerId !== event.pointerId) return;
        const { source, ghost } = dragState;
        const droppedCard = !cancelled && ghost ? cardAtPoint(event.clientX, event.clientY) : null;
        if (source.hasPointerCapture(event.pointerId)) source.releasePointerCapture(event.pointerId);
        source.classList.remove('is-dragging');
        ghost?.remove();
        clearDropTargets();
        dragState = null;
        if (!ghost) return;
        suppressNextClick = true;
        window.setTimeout(() => { suppressNextClick = false; }, 0);
        if (droppedCard) attemptMatch(source, droppedCard);
        else setStatus(`Drag ${source.dataset.season} onto one of the sentence cards.`);
      }

      function unlockActivity() {
        gate.hidden = true;
        setReady(true);
        setStatus('Drag each season picture to its matching sentence.');
        sources[0]?.focus({ preventScroll: true });
      }

      function beginActivity() {
        gate.hidden = true;
        setReady(false);
        setStatus('Listen to the directions.');
        playWhole(INTRO_AUDIO, unlockActivity);
      }

      sources.forEach((source) => {
        source.addEventListener('click', () => {
          if (suppressNextClick) return;
          selectSource(source);
        });
        source.addEventListener('pointerdown', (event) => beginDrag(event, source));
        source.addEventListener('pointermove', moveDrag);
        source.addEventListener('pointerup', (event) => endDrag(event));
        source.addEventListener('pointercancel', (event) => endDrag(event, true));
      });

      window.addEventListener('pointerup', (event) => endDrag(event), true);
      window.addEventListener('pointercancel', (event) => endDrag(event, true), true);
      window.addEventListener('mouseup', (event) => {
        if (!dragState) return;
        endDrag({
          pointerId: dragState.pointerId,
          clientX: event.clientX,
          clientY: event.clientY
        });
      }, true);

      cards.forEach((card) => {
        card.addEventListener('click', (event) => {
          if (event.target.closest('.match-card-speaker') || !selectedSource) return;
          attemptMatch(selectedSource, card);
        });
        card.addEventListener('keydown', (event) => {
          if (!selectedSource || (event.key !== 'Enter' && event.key !== ' ')) return;
          event.preventDefault();
          attemptMatch(selectedSource, card);
        });
      });

      pictureSpeakers.forEach((speaker) => {
        speaker.addEventListener('click', () => {
          if (!activityReady) return;
          const season = speaker.dataset.season;
          playSegment(WORD_AUDIO, WORD_INDEX[season], season);
        });
      });

      cardSpeakers.forEach((speaker) => {
        speaker.addEventListener('click', () => {
          if (!activityReady) return;
          playSentence(speaker.dataset.season);
        });
      });

      startButton?.addEventListener('click', beginActivity);
      window.addEventListener('resize', () => window.requestAnimationFrame(drawAllLines));
      pageReset = () => {
        if (completionTimer) {
          window.clearTimeout(completionTimer);
          completionTimer = null;
        }
        stopAudio();
        if (dragState?.ghost) dragState.ghost.remove();
        dragState = null;
        suppressNextClick = false;
        clearSelection();
        matched.clear();
        cards.forEach((card) => card.classList.remove('is-matched', 'is-drop-target', 'is-drop-wrong'));
        sources.forEach((source) => source.setAttribute('aria-pressed', 'false'));
        shuffleCards();
        setReady(activityReady);
        window.requestAnimationFrame(drawAllLines);
        setStatus(activityReady
          ? 'Drag each season picture to its matching sentence.'
          : 'Press Start and listen before connecting the seasons.');
      };
    }

    function setupCalendar() {
      const targets = [...stage.querySelectorAll('.calendar-day')];
      const gate = document.getElementById('week-2-calendar-gate');
      const startButton = document.getElementById('week-2-calendar-start');
      const INTRO_AUDIO = '../assets/audio/week-2/literacy/page-06-intro.mp3';
      let activityReady = false;
      let introAudio = null;

      function setReady(enabled) {
        activityReady = enabled;
        targets.forEach((target) => { target.disabled = !enabled; });
        restart.disabled = !enabled;
      }

      function unlockActivity() {
        gate.hidden = true;
        setReady(true);
        setStatus('Circle the day of World Bee Day: May 20th.');
        targets[0]?.focus({ preventScroll: true });
      }

      function beginActivity() {
        gate.hidden = true;
        setReady(false);
        setStatus('Listen to the directions.');
        introAudio = new Audio(INTRO_AUDIO);
        let finished = false;
        const finishIntro = () => {
          if (finished) return;
          finished = true;
          introAudio = null;
          unlockActivity();
        };
        introAudio.addEventListener('ended', finishIntro, { once: true });
        introAudio.addEventListener('error', finishIntro, { once: true });
        introAudio.play().catch(finishIntro);
      }

      targets.forEach((target) => {
        target.addEventListener('click', () => {
          if (!activityReady) return;
          const day = Number(target.dataset.day);
          if (day !== 20) {
            showWrong(target, `${day} is not World Bee Day. Try again.`);
            say(`${day}. Try again.`);
            return;
          }
          completeTarget(target);
          say('May twentieth is World Bee Day.');
          finish('Great job! World Bee Day is May 20th.');
        });
      });

      startButton?.addEventListener('click', beginActivity);
      pageReset = () => {
        setReady(activityReady);
        setStatus(activityReady
          ? 'Circle the day of World Bee Day: May 20th.'
          : 'Press Start and listen before choosing a date.');
      };
    }

    if (page === 3) setupMaze();
    if (page === 4) setupSeasons();
    if (page === 5) setupMatching();
    if (page === 6) setupCalendar();
    restart.addEventListener('click', reset);
    if (completionRetry) completionRetry.addEventListener('click', reset);
    reset();
  });
})();
