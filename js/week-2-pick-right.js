(() => {
  const assetBase = '../assets/images/week-2/games/pick-right/';
  const questionSheet = `${assetBase}question-scenes.png`;
  const sheets = {
    sound:`${assetBase}sound-choices.png`,
    season:`${assetBase}season-choices.png`,
    feeling:`${assetBase}feeling-choices.png`
  };
  const positions = [
    ['0%','0%'],
    ['100%','0%'],
    ['0%','100%'],
    ['100%','100%']
  ];
  const rounds = [
    {
      question:"What's that sound?", questionTile:0, questionAlt:'A child listening to buzzing bees near a beehive',
      answers:[
        { text:"It's the bees buzzing.", sheet:'sound', tile:0, alt:'Bees buzzing around a beehive' }
      ]
    },
    {
      question:'When can I see bees?', questionTile:1, questionAlt:'A child watching bees through spring, summer, and fall',
      answers:[
        { text:'You can see bees in spring, summer, and fall.', sheet:'season', tile:0, alt:'Spring, summer, and fall together' },
        { text:'You can see bees in spring.', sheet:'season', tile:1, alt:'A spring garden' },
        { text:'You can see bees in summer.', sheet:'season', tile:2, alt:'A sunny summer beach' },
        { text:'You can see bees in fall.', sheet:'season', tile:3, alt:'A colorful fall forest' }
      ]
    },
    {
      question:'How does the bee feel?', questionTile:2, questionAlt:'A bee thinking about weather in the four seasons',
      answers:[
        { text:'The bee feels cold in winter.', sheet:'feeling', tile:0, alt:'A cold shivering bee in winter clothes' },
        { text:'The bee feels hot in summer.', sheet:'feeling', tile:1, alt:'A hot sweating bee in summer' },
        { text:'The bee feels warm in spring.', sheet:'feeling', tile:2, alt:'A warm happy bee among spring flowers' },
        { text:'The bee feels cool in fall.', sheet:'feeling', tile:3, alt:'A cool relaxed bee among fall leaves' }
      ]
    },
    {
      question:'When is the World Bee Day?', questionTile:3, questionAlt:'A happy bee pointing to a calendar',
      answers:[
        { text:"It's on May 20th.", day:'20', alt:'Calendar showing May 20' }
      ]
    }
  ];

  const questionText = document.getElementById('question-text');
  const questionVisual = document.getElementById('question-visual');
  const questionListen = document.getElementById('question-listen');
  const answersRow = document.getElementById('answers-row');
  const successModal = document.getElementById('success-modal');
  const reviewQuestion = document.getElementById('review-question');
  const reviewAnswer = document.getElementById('review-answer');
  const continueButton = document.getElementById('continue-btn');
  const roundNumber = document.getElementById('round-number');
  let currentRound = null;
  let locked = false;
  let roundOrder = shuffle(rounds);
  let roundCursor = 0;

  function shuffle(items) {
    const result = [...items];
    for (let index=result.length-1; index>0; index--) {
      const swap = Math.floor(Math.random()*(index+1));
      [result[index],result[swap]] = [result[swap],result[index]];
    }
    return result;
  }

  function randomFrom(items) { return items[Math.floor(Math.random() * items.length)]; }

  function speak(text) {
    if (typeof window.speakAmericanEnglish === 'function') return window.speakAmericanEnglish(text,{rate:.9});
    return Promise.resolve();
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

  function setSprite(element, source, tile, aspect=1) {
    const [x,y] = positions[tile];
    element.style.setProperty('--sprite',`url("${source}")`);
    element.style.setProperty('--sprite-x',x);
    element.style.setProperty('--sprite-y',y);
    element.style.setProperty('--tile-aspect',String(aspect));
  }

  function makeVisual(answer) {
    if (answer.day) {
      const visual = document.createElement('div');
      visual.className = 'calendar-visual';
      visual.setAttribute('role','img');
      visual.setAttribute('aria-label',answer.alt);
      visual.innerHTML = `<span class="calendar-date" aria-hidden="true"><span class="month">MAY</span><span class="day">${answer.day}</span></span>`;
      return visual;
    }
    const visual = document.createElement('div');
    visual.className = 'answer-visual sprite-visual';
    visual.setAttribute('role','img');
    visual.setAttribute('aria-label',answer.alt);
    const aspect = answer.sheet === 'season' ? 1293/1216 : 1.5;
    setSprite(visual,sheets[answer.sheet],answer.tile,aspect);
    return visual;
  }

  function makeListenButton(text) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'listen-btn';
    button.textContent = '🔊';
    button.setAttribute('aria-label',`Listen to answer: ${text}`);
    button.addEventListener('click',event => {
      event.stopPropagation();
      if (!locked) speak(text);
    });
    return button;
  }

  function chooseRound() {
    if (roundCursor >= roundOrder.length) {
      const previous = roundOrder[roundOrder.length-1];
      do { roundOrder = shuffle(rounds); } while (roundOrder[0] === previous && rounds.length>1);
      roundCursor = 0;
    }
    const selection = { item:roundOrder[roundCursor], number:roundCursor+1 };
    roundCursor += 1;
    return selection;
  }

  function renderRound() {
    locked = false;
    successModal.hidden = true;
    questionListen.disabled = false;
    const selection = chooseRound();
    currentRound = selection.item;
    roundNumber.textContent = String(selection.number);
    questionText.textContent = currentRound.question;
    questionVisual.setAttribute('aria-label',currentRound.questionAlt);
    setSprite(questionVisual,questionSheet,currentRound.questionTile,1);
    questionListen.onclick = () => { if (!locked) speak(currentRound.question); };
    answersRow.innerHTML = '';

    const correctAnswer = { ...randomFrom(currentRound.answers), correct:true };
    const otherAnswerPool = rounds
      .filter(round => round !== currentRound)
      .flatMap(round => round.answers);
    const wrongAnswer = { ...randomFrom(otherAnswerPool), correct:false };

    shuffle([correctAnswer,wrongAnswer]).forEach(answer => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer-btn';
      button.dataset.answer = answer.text;
      button.appendChild(makeVisual(answer));
      const text = document.createElement('span');
      text.className = 'answer-text';
      text.textContent = answer.text;
      button.appendChild(text);
      button.appendChild(makeListenButton(answer.text));
      button.addEventListener('click',() => chooseAnswer(button,answer));
      answersRow.appendChild(button);
    });
  }

  function chooseAnswer(button,answer) {
    if (locked) return;
    locked = true;
    answersRow.querySelectorAll('.answer-btn').forEach(choice => { choice.disabled=true; });
    answersRow.querySelectorAll('.listen-btn').forEach(choice => { choice.disabled=true; });
    if (!answer.correct) {
      wrongSound();
      button.classList.add('wrong');
      window.setTimeout(() => {
        button.classList.remove('wrong');
        answersRow.querySelectorAll('.answer-btn').forEach(choice => { choice.disabled=false; });
        answersRow.querySelectorAll('.listen-btn').forEach(choice => { choice.disabled=false; });
        locked=false;
      },650);
      return;
    }

    correctSound();
    button.classList.add('correct');
    reviewQuestion.textContent = currentRound.question;
    reviewAnswer.textContent = answer.text;
    successModal.hidden = false;
    questionListen.disabled = true;
    continueButton.focus();
    Promise.resolve(speak(currentRound.question)).then(() => speak(answer.text));
  }

  continueButton.addEventListener('click',renderRound);
  document.getElementById('new-question').addEventListener('click',renderRound);
  renderRound();
})();
