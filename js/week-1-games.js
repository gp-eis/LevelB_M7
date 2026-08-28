(() => {
  const app = document.getElementById('week-one-game-app')
    || document.getElementById('week-two-game-app')
    || document.getElementById('week-three-game-app');
  if (!app) return;

  const gameWeek = Number(document.body.dataset.gameWeek || 1);
  const imageBase = '../assets/images/week-1/games/bee-actions/';
  const audioBase = '../assets/audio/week-1/literacy/';
  const weekOneActions = [
    { id:'protect-the-queen', word:'protect the queen', label:'Protect the queen', sentence:'Bees protect the queen.', color:'#7ed957', image:`${imageBase}protect-the-queen.png`, elementAudio:`${audioBase}page-04-element-protect-the-queen.mp3`, sentenceAudio:`${audioBase}page-04-sentence-protect-the-queen.mp3` },
    { id:'make-honey', word:'make honey', label:'Make honey', sentence:'Bees make honey.', color:'#b388ff', image:`${imageBase}make-honey.png`, elementAudio:`${audioBase}page-04-element-build-hives.mp3`, sentenceAudio:`${audioBase}page-04-sentence-make-honey.mp3` },
    { id:'collect-nectar', word:'collect nectar', label:'Collect nectar', sentence:'Bees collect nectar.', color:'#ffa62b', image:`${imageBase}collect-nectar.png`, elementAudio:`${audioBase}page-04-element-collect-nectar.mp3`, sentenceAudio:`${audioBase}page-04-sentence-collect-nectar.mp3` },
    { id:'find-flowers', word:'find flowers', label:'Find flowers', sentence:'Bees find flowers.', color:'#ff8f66', image:`${imageBase}find-flowers.png`, elementAudio:`${audioBase}page-04-element-eat-nuts.mp3`, sentenceAudio:`${audioBase}page-04-sentence-find-flowers.mp3` },
    { id:'build-hives', word:'build hives', label:'Build hives', sentence:'Bees build hives.', color:'#2ec4b6', image:`${imageBase}build-hives.png`, elementAudio:`${audioBase}page-04-element-find-flowers.mp3`, sentenceAudio:`${audioBase}page-04-sentence-build-hives.mp3` }
  ];
  const weekTwoImageBase = '../assets/images/week-2/games/seasons/';
  const weekTwoPictureMatchBase = '../assets/images/week-2/games/picture-match/';
  const weekTwoActions = [
    { id:'the-four-seasons', word:'the four seasons', label:'The four seasons', sentence:'These are the four seasons.', pictureSentence:'In the four seasons.', color:'#b388ff', image:`${weekTwoImageBase}the-four-seasons.png`, pictureImage:`${weekTwoPictureMatchBase}the-four-seasons.png` },
    { id:'spring', word:'spring', label:'Spring', sentence:'In spring.', color:'#7ed957', image:`${weekTwoImageBase}spring.png`, pictureImage:`${weekTwoPictureMatchBase}spring.png` },
    { id:'summer', word:'summer', label:'Summer', sentence:'In summer.', color:'#ffd447', image:`${weekTwoImageBase}summer.png`, pictureImage:`${weekTwoPictureMatchBase}summer.png` },
    { id:'fall', word:'fall', label:'Fall', sentence:'In fall.', color:'#ff8a3d', image:`${weekTwoImageBase}fall.png`, pictureImage:`${weekTwoPictureMatchBase}fall.png` },
    { id:'winter', word:'winter', label:'Winter', sentence:'In winter.', color:'#63b3ff', image:`${weekTwoImageBase}winter.png`, pictureImage:`${weekTwoPictureMatchBase}winter.png` }
  ];
  const weekThreeImageBase = '../assets/images/week-3/games/vocabulary/';
  const weekThreeAudioBase = '../assets/audio/week-3/literacy/';
  const weekThreeActions = [
    { id:'plants', word:'plants', label:'Plants', sentence:'Bees help plants grow.', color:'#7ed957', image:`${weekThreeImageBase}plants.png?v=20260827-1`, elementAudio:`${weekThreeAudioBase}page-05-word-plants.wav`, sentenceAudio:`${weekThreeAudioBase}page-04-intro.mp3`, sentenceAudioEnd:2.2 },
    { id:'trees', word:'trees', label:'Trees', sentence:'Bees help trees grow.', color:'#2ec4b6', image:`${weekThreeImageBase}trees.png?v=20260827-1`, elementAudio:`${weekThreeAudioBase}page-04-word-trees.wav`, sentenceAudio:`${weekThreeAudioBase}page-04-sentence-flowers.wav` },
    { id:'flowers', word:'flowers', label:'Flowers', sentence:'Bees help flowers grow.', color:'#ff6fa5', image:`${weekThreeImageBase}flowers.png?v=20260827-1`, elementAudio:`${weekThreeAudioBase}page-04-word-flowers.wav`, sentenceAudio:`${weekThreeAudioBase}page-04-sentence-trees.wav` },
    { id:'fruits', word:'fruits', label:'Fruits', sentence:'Bees help fruits grow.', color:'#ffa62b', image:`${weekThreeImageBase}fruits.png?v=20260827-1`, elementAudio:`${weekThreeAudioBase}page-04-word-fruits.wav`, sentenceAudio:`${weekThreeAudioBase}page-04-sentence-fruits.wav` },
    { id:'vegetables', word:'vegetables', label:'Vegetables', sentence:'Bees help vegetables grow.', color:'#b388ff', image:`${weekThreeImageBase}vegetables.png?v=20260827-1`, elementAudio:`${weekThreeAudioBase}page-04-word-vegetables.wav`, sentenceAudio:`${weekThreeAudioBase}page-04-sentence-vegetables.wav` }
  ];
  const actions = gameWeek === 3 ? weekThreeActions : gameWeek === 2 ? weekTwoActions : weekOneActions;
  const gameType = document.body.dataset.gameType || document.body.dataset.weekOneGame;

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result;
  }

  function speak(text, options = {}) {
    if (typeof window.speakAmericanEnglish === 'function') {
      return window.speakAmericanEnglish(text, { rate: options.rate || .88 });
    }
    return Promise.resolve();
  }

  let sharedRecording = null;

  function stopSharedRecording() {
    if (!sharedRecording) return;
    sharedRecording.audio.pause();
    sharedRecording.finish();
  }

  function playSharedRecording(source, endAt = 0) {
    if (!source) return Promise.resolve();
    stopSharedRecording();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    return new Promise(resolve => {
      const audio = new Audio(source);
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        if (sharedRecording?.audio === audio) sharedRecording = null;
        resolve();
      };
      sharedRecording = { audio, finish };
      if (endAt > 0) {
        audio.addEventListener('timeupdate', () => {
          if (audio.currentTime < endAt) return;
          audio.pause();
          finish();
        });
      }
      audio.addEventListener('ended', finish, { once:true });
      audio.addEventListener('error', finish, { once:true });
      audio.play().catch(finish);
    });
  }

  function playActionWord(action) {
    return action?.elementAudio ? playSharedRecording(action.elementAudio) : speak(action?.word || '');
  }

  function playActionSentence(action) {
    const sentence = action?.pictureSentence || action?.sentence || '';
    return action?.sentenceAudio
      ? playSharedRecording(action.sentenceAudio, Number(action.sentenceAudioEnd) || 0)
      : speak(sentence);
  }

  function correctSound() {
    if (typeof window.playTone !== 'function') return;
    window.playTone(523,.12,.15,'sine');
    window.playTone(659,.12,.15,'sine',.08);
    window.playTone(784,.2,.17,'sine',.16);
  }

  function wrongSound() {
    if (typeof window.playTone !== 'function') return;
    window.playTone(220,.14,.07,'sawtooth');
    window.playTone(175,.18,.065,'sawtooth',.1);
  }

  function pageStart(icon, title, subtitle, floaties) {
    return `
      <div class="floaties" aria-hidden="true"><span style="top:10%;left:4%;">${floaties[0]}</span><span style="top:75%;left:93%;">${floaties[1]}</span></div>
      <div class="game-back-row"><a class="back-link" href="index.html?week=${gameWeek}">⬅️ All Games</a></div>
      <header class="center" style="margin-top:16px;">
        <h1 class="big-title page-title-with-icon" style="font-size:2.4rem;"><img class="page-title-icon" src="../assets/images/ui/${icon}" alt="">${title}</h1>
        <p class="subtitle">${subtitle}</p>
      </header>`;
  }

  function setupMemory() {
    app.innerHTML = `${pageStart('game-memory.webp','Memory Game','Look carefully, then find the 5 matching pairs!',['🃏','🐝'])}
      <div class="game-actions">
        <button class="pill-btn blue" id="preview" type="button">👀 Look for 3 Seconds</button>
        <button class="pill-btn orange" id="restart" type="button">🔄 New Arrangement</button>
      </div>
      <div class="board" id="board" aria-label="Ten memory cards"></div>
      <div class="status-row"><span>Moves: <span id="moves">0</span></span><span>Pairs: <span id="pairs">0</span> / 5</span></div>
      <div class="match-sentence-modal" id="match-sentence-modal" role="dialog" aria-modal="true" aria-labelledby="match-sentence-title" hidden>
        <div class="match-sentence-card"><h2 id="match-sentence-title">Great match!</h2><img id="match-sentence-image" src="" alt=""><p class="match-key-sentence" id="match-key-sentence"></p><button class="pill-btn green" id="match-sentence-continue" type="button">✓ Continue</button></div>
      </div>
      <div class="celebration" id="celebration" role="dialog" aria-modal="true" aria-labelledby="celebration-title" hidden>
        <div class="celebration-card"><div class="celebration-emoji" aria-hidden="true">🎉🏆🎉</div><h2 class="celebration-title" id="celebration-title">Yay! You found all the pairs!</h2><button class="pill-btn green" id="celebration-again" type="button">🔄 Play Again</button></div>
      </div>`;

    const board = document.getElementById('board');
    const movesEl = document.getElementById('moves');
    const pairsEl = document.getElementById('pairs');
    const previewButton = document.getElementById('preview');
    const matchModal = document.getElementById('match-sentence-modal');
    const matchImage = document.getElementById('match-sentence-image');
    const matchSentence = document.getElementById('match-key-sentence');
    const matchContinue = document.getElementById('match-sentence-continue');
    const celebration = document.getElementById('celebration');
    let firstCard = null;
    let secondCard = null;
    let moves = 0;
    let matched = 0;
    let locked = false;
    let previewing = false;
    let completeAfterModal = false;
    let activeRecording = null;
    let gameRun = 0;

    function stopRecording() {
      if (!activeRecording) return;
      activeRecording.audio.pause();
      activeRecording.finish();
    }

    function playRecording(source, endAt = 0) {
      if (!source) return Promise.resolve();
      stopRecording();
      return new Promise(resolve => {
        const audio = new Audio(source);
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          if (activeRecording?.audio === audio) activeRecording = null;
          resolve();
        };
        activeRecording = { audio, finish };
        if (endAt > 0) {
          audio.addEventListener('timeupdate', () => {
            if (audio.currentTime < endAt) return;
            audio.pause();
            finish();
          });
        }
        audio.addEventListener('ended', finish, { once:true });
        audio.addEventListener('error', finish, { once:true });
        audio.play().catch(finish);
      });
    }

    function playAfterCardFlip(action) {
      return new Promise(resolve => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            window.setTimeout(() => {
              const playback = action.elementAudio
                ? playRecording(action.elementAudio)
                : speak(action.word);
              Promise.resolve(playback).then(resolve, resolve);
            }, 140);
          });
        });
      });
    }

    function playMatchedSentence(action) {
      return action.sentenceAudio
        ? playRecording(action.sentenceAudio, Number(action.sentenceAudioEnd) || 0)
        : speak(action.sentence);
    }

    function startGame() {
      gameRun += 1;
      board.innerHTML = '';
      celebration.hidden = true;
      matchModal.hidden = true;
      firstCard = null;
      secondCard = null;
      moves = 0;
      matched = 0;
      locked = false;
      previewing = false;
      movesEl.textContent = '0';
      pairsEl.textContent = '0';
      previewButton.disabled = false;
      previewButton.textContent = '👀 Look for 3 Seconds';
      stopRecording();
      board.style.gridTemplateColumns = 'repeat(5, 1fr)';

      shuffle(actions.flatMap(action => [action,action])).forEach(action => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'mem-card';
        card.dataset.picture = action.id;
        card.setAttribute('aria-label','Hidden memory card');
        card.innerHTML = `<span class="card-picture"><img src="${action.image}" alt="${action.label}" draggable="false"></span>`;
        card.addEventListener('click', () => flip(card, action));
        board.appendChild(card);
      });
    }

    function flip(card, action) {
      if (locked || previewing || card === firstCard || card.classList.contains('matched')) return;
      card.classList.add('flipped');
      card.setAttribute('aria-label',action.label);
      const elementPlayback = playAfterCardFlip(action);
      if (!firstCard) {
        firstCard = card;
        return;
      }

      secondCard = card;
      locked = true;
      moves += 1;
      movesEl.textContent = String(moves);
      if (firstCard.dataset.picture === secondCard.dataset.picture) {
        const matchedRun = gameRun;
        const pair = [firstCard,secondCard];
        pair.forEach(item => { item.classList.add('matched'); item.disabled = true; });
        matched += 1;
        pairsEl.textContent = String(matched);
        correctSound();
        completeAfterModal = matched === actions.length;
        matchImage.src = action.image;
        matchImage.alt = action.label;
        matchSentence.textContent = action.sentence;
        firstCard = null;
        secondCard = null;
        elementPlayback
          .then(() => matchedRun === gameRun ? playMatchedSentence(action) : Promise.resolve())
          .then(() => new Promise(resolve => window.setTimeout(resolve, 300)))
          .then(() => {
            if (matchedRun !== gameRun) return;
            matchModal.hidden = false;
            matchContinue.focus();
          });
        return;
      }

      wrongSound();
      const pair = [firstCard,secondCard];
      window.setTimeout(() => {
        pair.forEach(item => { item.classList.remove('flipped'); item.setAttribute('aria-label','Hidden memory card'); });
        firstCard = null;
        secondCard = null;
        locked = false;
      },800);
    }

    previewButton.addEventListener('click', () => {
      if (previewing || locked) return;
      previewing = true;
      locked = true;
      previewButton.disabled = true;
      previewButton.textContent = '👀 Look carefully…';
      board.querySelectorAll('.mem-card:not(.matched)').forEach(card => card.classList.add('previewing'));
      window.setTimeout(() => {
        board.querySelectorAll('.mem-card').forEach(card => card.classList.remove('previewing'));
        previewing = false;
        locked = false;
        previewButton.disabled = false;
        previewButton.textContent = '👀 Look for 3 Seconds';
      },3000);
    });
    document.getElementById('restart').addEventListener('click', startGame);
    document.getElementById('celebration-again').addEventListener('click', startGame);
    matchContinue.addEventListener('click', () => {
      matchModal.hidden = true;
      locked = false;
      if (completeAfterModal) {
        completeAfterModal = false;
        celebration.hidden = false;
        document.getElementById('celebration-again').focus();
        speak('Yay! You found all the pairs!');
      }
    });
    window.addEventListener('load', () => window.setTimeout(() => {
      board.scrollIntoView({ block:'center' });
    }, 100), { once:true });
    startGame();
  }

  function setupSpin() {
    app.innerHTML = `${pageStart('game-wheel.webp','Spin the Wheel','Spin slowly, press stop, then flip your picture card!',['🎡','⭐'])}
      <div class="wheel-wrap"><div class="pointer" aria-hidden="true"></div><div id="wheel" aria-label="Wheel with five bee actions"></div></div>
      <div id="result" role="status" aria-live="polite"></div>
      <div class="wheel-actions"><button class="pill-btn wheel-action-btn" id="spin-btn" type="button">🎡 SPIN!</button><button class="pill-btn wheel-action-btn stop-btn" id="stop-btn" type="button" hidden>🛑 STOP!</button></div>
      <section class="selected-area" id="selected-area" role="dialog" aria-modal="true" aria-label="Selected action card" aria-live="polite" hidden>
        <p class="flip-hint">👆 Click the card to flip it!</p>
        <button class="word-card" id="word-card" type="button" aria-pressed="false"><span class="card-inner"><span class="card-face card-front"><img id="front-image" src="" alt=""><span class="card-word" id="card-word"></span></span><span class="card-face card-back"><img id="back-image" src="" alt=""><span class="card-sentence" id="card-sentence"></span></span></span></button>
        <button class="pill-btn return-btn" id="return-btn" type="button">🎡 Back to Wheel</button>
      </section>`;

    const wheel = document.getElementById('wheel');
    const result = document.getElementById('result');
    const spinButton = document.getElementById('spin-btn');
    const stopButton = document.getElementById('stop-btn');
    const selectedArea = document.getElementById('selected-area');
    const wordCard = document.getElementById('word-card');
    const frontImage = document.getElementById('front-image');
    const backImage = document.getElementById('back-image');
    const cardWord = document.getElementById('card-word');
    const cardSentence = document.getElementById('card-sentence');
    const segmentAngle = 360 / actions.length;
    const spinSpeed = 75;
    let rotation = 0;
    let spinning = false;
    let stopping = false;
    let animationFrame = null;
    let lastFrameTime = 0;
    let currentAction = null;

    wheel.style.background = `conic-gradient(${actions.map((action,index) => `${action.color} ${index*segmentAngle}deg ${(index+1)*segmentAngle}deg`).join(',')})`;
    actions.forEach((action,index) => {
      const angle = (index*segmentAngle + segmentAngle/2) * Math.PI / 180;
      const label = document.createElement('span');
      label.className = 'wheel-label';
      label.style.setProperty('--label-x',`${50 + Math.sin(angle)*30}%`);
      label.style.setProperty('--label-y',`${50 - Math.cos(angle)*30}%`);
      label.innerHTML = `<img src="${action.image}" alt="" aria-hidden="true">`;
      wheel.appendChild(label);
    });

    function renderWheel() { wheel.style.transform = `rotate(${rotation}deg)`; }
    function spinFrame(time) {
      if (!spinning || stopping) return;
      if (!lastFrameTime) lastFrameTime = time;
      const elapsed = Math.min(time-lastFrameTime,40);
      lastFrameTime = time;
      rotation += spinSpeed*elapsed/1000;
      renderWheel();
      animationFrame = requestAnimationFrame(spinFrame);
    }

    function setFlipped(flipped) {
      wordCard.classList.toggle('flipped',flipped);
      wordCard.setAttribute('aria-pressed',String(flipped));
      if (!currentAction) return;
      wordCard.setAttribute('aria-label',flipped ? `${currentAction.sentence} Click to see the picture card again.` : `${currentAction.word} picture card. Click to reveal the sentence.`);
    }

    function showSelected(action) {
      currentAction = action;
      result.textContent = `🎉 You landed on ${action.word}!`;
      frontImage.src = action.image;
      frontImage.alt = action.label;
      backImage.src = action.image;
      backImage.alt = action.label;
      cardWord.textContent = action.word;
      cardSentence.textContent = action.sentence;
      wordCard.style.setProperty('--selected-color',action.color);
      setFlipped(false);
      selectedArea.hidden = false;
      wordCard.focus();
      Promise.resolve(playActionWord(action)).then(() => window.setTimeout(() => {
        if (currentAction !== action) return;
        setFlipped(true);
        playActionSentence(action);
      },350));
    }

    function finishSpin() {
      const normalized = ((rotation%360)+360)%360;
      const pointerAngle = (360-normalized)%360;
      const index = Math.floor(pointerAngle/segmentAngle)%actions.length;
      spinning = false;
      stopping = false;
      document.body.classList.remove('wheel-is-spinning');
      stopButton.hidden = true;
      stopButton.disabled = false;
      spinButton.hidden = false;
      spinButton.disabled = false;
      showSelected(actions[index]);
    }

    spinButton.addEventListener('click', () => {
      if (spinning) return;
      stopSharedRecording();
      spinning = true;
      stopping = false;
      lastFrameTime = 0;
      currentAction = null;
      result.textContent = '';
      selectedArea.hidden = true;
      spinButton.disabled = true;
      spinButton.hidden = true;
      stopButton.hidden = false;
      document.body.classList.add('wheel-is-spinning');
      requestAnimationFrame(() => stopButton.focus({preventScroll:true}));
      animationFrame = requestAnimationFrame(spinFrame);
    });
    stopButton.addEventListener('click', () => {
      if (!spinning || stopping) return;
      stopping = true;
      stopButton.disabled = true;
      cancelAnimationFrame(animationFrame);
      const startRotation = rotation;
      const startTime = performance.now();
      const duration = 1800;
      const coastDistance = spinSpeed*(duration/1000)/2;
      function slowDown(time) {
        const progress = Math.min((time-startTime)/duration,1);
        rotation = startRotation + coastDistance*(2*progress-progress*progress);
        renderWheel();
        if (progress < 1) animationFrame = requestAnimationFrame(slowDown);
        else finishSpin();
      }
      animationFrame = requestAnimationFrame(slowDown);
    });
    wordCard.addEventListener('click', () => {
      const flipped = !wordCard.classList.contains('flipped');
      setFlipped(flipped);
      if (currentAction) {
        if (flipped) playActionSentence(currentAction);
        else playActionWord(currentAction);
      }
    });
    document.getElementById('return-btn').addEventListener('click', () => {
      selectedArea.hidden = true;
      currentAction = null;
      stopSharedRecording();
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      spinButton.focus();
    });
  }

  function setupPictureMatch() {
    app.innerHTML = `${pageStart('game-matching.webp','Picture Match','Read the sentence, then pick the picture that matches!',['🧩','🐝'])}
      <div class="game-toolbar"><button class="pill-btn orange" id="new-round" type="button">🔄 New Round</button><span class="score">Correct: <span id="score">0</span></span></div>
      <section class="match-board" aria-label="Picture matching game"><div class="choices-row" id="choices-row"></div><div class="sentence-box"><p class="sentence-text" id="sentence-text"></p><button class="listen-btn" id="sentence-listen" type="button" aria-label="Listen to the sentence">🔊</button></div></section>
      <div class="success-modal" id="success-modal" role="dialog" aria-modal="true" aria-labelledby="success-title" hidden><div class="success-card"><h2 class="success-title" id="success-title">Correct! 🎉</h2><div class="success-review"><img id="review-image" src="" alt=""><p id="review-sentence"></p></div><button class="pill-btn green" id="continue-btn" type="button">✓ Continue</button></div></div>`;

    const choices = document.getElementById('choices-row');
    const sentenceText = document.getElementById('sentence-text');
    const listenButton = document.getElementById('sentence-listen');
    const successModal = document.getElementById('success-modal');
    const reviewImage = document.getElementById('review-image');
    const reviewSentence = document.getElementById('review-sentence');
    const scoreElement = document.getElementById('score');
    let currentRound = null;
    let locked = false;
    let score = 0;
    let lastActionId = '';

    function pictureFor(action) { return action.pictureImage || action.image; }
    function sentenceFor(action) { return action.pictureSentence || action.sentence; }

    function buildRound() {
      const possible = actions.filter(action => action.id !== lastActionId);
      const correct = possible[Math.floor(Math.random()*possible.length)];
      lastActionId = correct.id;
      const wrong = shuffle(actions.filter(action => action.id !== correct.id)).slice(0,2);
      return { correct, choices:shuffle([correct,...wrong]) };
    }

    function renderRound(autoSpeak = true) {
      locked = false;
      successModal.hidden = true;
      listenButton.disabled = false;
      currentRound = buildRound();
      sentenceText.textContent = sentenceFor(currentRound.correct);
      choices.innerHTML = '';
      currentRound.choices.forEach(action => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'choice-btn';
        button.dataset.actionId = action.id;
        button.setAttribute('aria-label',`Choose picture: ${action.word}`);
        button.innerHTML = `<img src="${pictureFor(action)}" alt="${action.label}" draggable="false">`;
        button.addEventListener('click', () => choosePicture(button,action));
        choices.appendChild(button);
      });
      if (autoSpeak) playActionSentence(currentRound.correct);
    }

    function choosePicture(button, action) {
      if (locked) return;
      locked = true;
      choices.querySelectorAll('button').forEach(choice => { choice.disabled = true; });
      if (action.id !== currentRound.correct.id) {
        wrongSound();
        button.classList.add('wrong');
        window.setTimeout(() => {
          button.classList.remove('wrong');
          choices.querySelectorAll('button').forEach(choice => { choice.disabled = false; });
          locked = false;
        },650);
        return;
      }

      correctSound();
      button.classList.add('correct');
      score += 1;
      scoreElement.textContent = String(score);
      reviewImage.src = pictureFor(action);
      reviewImage.alt = action.label;
      reviewSentence.textContent = sentenceFor(action);
      successModal.hidden = false;
      listenButton.disabled = true;
      document.getElementById('continue-btn').focus();
      playActionSentence(action);
    }

    listenButton.addEventListener('click', () => { if (!locked) playActionSentence(currentRound.correct); });
    document.getElementById('new-round').addEventListener('click', () => renderRound());
    document.getElementById('continue-btn').addEventListener('click', () => renderRound());
    renderRound();
  }

  if (gameType === 'memory') setupMemory();
  if (gameType === 'spin') setupSpin();
  if (gameType === 'picture-match') setupPictureMatch();
})();
