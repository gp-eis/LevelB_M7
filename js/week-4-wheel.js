(() => {
  const colors = ['#ff83b8','#ef5c50','#ffad3b','#79d767','#9a72df','#58bdf2'];
  const lessonSegments = window.WEEK4_VOCABULARY.map((item, index) => ({...item, color:colors[index]}));
  const bonus = window.SpinWheelBonus;
  const segments = [...lessonSegments, ...bonus.createSegments()];
  const wheel = document.getElementById('wheel'); const result = document.getElementById('result');
  const spinButton = document.getElementById('spin-btn'); const stopButton = document.getElementById('stop-btn');
  const selectedArea = document.getElementById('selected-area'); const wordCard = document.getElementById('word-card');
  const frontImage = document.getElementById('front-image'); const backImage = document.getElementById('back-image');
  const cardWord = document.getElementById('card-word'); const cardSentence = document.getElementById('card-sentence'); const flipHint = document.getElementById('flip-hint');
  const segmentAngle = 360 / segments.length; const spinSpeed = 540;
  let rotation = 0; let spinning = false; let stopping = false; let animationFrame = null; let lastFrameTime = 0; let currentSegment = null;
  wheel.style.setProperty('--wheel-gradient', `conic-gradient(${segments.map((segment, index) => `${segment.color} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`).join(',')})`);
  segments.forEach((segment, index) => {
    const label = document.createElement('span'); const angle = (index * segmentAngle + segmentAngle / 2) * Math.PI / 180; const image = document.createElement('img');
    label.className = 'wheel-label'; label.style.width = `${Math.max(16, 170 / segments.length)}%`; label.style.setProperty('--label-x', `${50 + Math.sin(angle) * 31}%`); label.style.setProperty('--label-y', `${50 - Math.cos(angle) * 31}%`);
    image.src = segment.image; image.alt = ''; image.setAttribute('aria-hidden', 'true'); label.appendChild(image); wheel.appendChild(label);
  });
  const renderWheel = () => { wheel.style.transform = `rotate(${rotation}deg)`; };
  const spinFrame = (time) => { if (!spinning || stopping) return; if (!lastFrameTime) lastFrameTime = time; const elapsed = Math.min(time - lastFrameTime, 40); lastFrameTime = time; rotation += spinSpeed * elapsed / 1000; renderWheel(); animationFrame = requestAnimationFrame(spinFrame); };
  const showSelectedCard = (segment) => {
    currentSegment = segment; result.textContent = `🎉 You landed on ${segment.label}!`;
    frontImage.src = segment.image; frontImage.alt = segment.label; backImage.src = segment.image; backImage.alt = segment.label;
    cardWord.textContent = segment.label; cardSentence.textContent = segment.sentence; wordCard.style.setProperty('--selected-color', segment.color);
    wordCard.classList.remove('flipped'); flipHint.textContent = '👆 Click the card to flip it!'; wordCard.setAttribute('aria-pressed', 'false');
    wordCard.setAttribute('aria-label', `${segment.label} picture card. Click to reveal the sentence.`); selectedArea.hidden = false; wordCard.focus(); playVocabulary(segment);
    if (typeof showToast === 'function') showToast(`🎉 ${segment.label}!`);
  };
  const finishSpin = () => {
    const normalized = ((rotation % 360) + 360) % 360; const pointerAngle = (360 - normalized) % 360; const index = Math.floor(pointerAngle / segmentAngle) % segments.length;
    spinning = false; stopping = false; document.body.classList.remove('wheel-is-spinning'); stopButton.hidden = true; stopButton.disabled = false; spinButton.hidden = false; spinButton.disabled = false;
    const selected = segments[index];
    if (bonus.show(selected, { onSpinAgain: () => spinButton.click(), onClose: () => spinButton.focus({preventScroll:true}) })) { result.textContent = selected.sentence; return; }
    showSelectedCard(selected);
  };
  spinButton.addEventListener('click', () => { if (spinning) return; stopVocabularyNarration(); spinning = true; stopping = false; lastFrameTime = 0; result.textContent = ''; selectedArea.hidden = true; spinButton.disabled = true; spinButton.hidden = true; stopButton.hidden = false; document.body.classList.add('wheel-is-spinning'); requestAnimationFrame(() => stopButton.focus({preventScroll:true})); animationFrame = requestAnimationFrame(spinFrame); });
  stopButton.addEventListener('click', () => {
    if (!spinning || stopping) return; stopping = true; stopButton.disabled = true; cancelAnimationFrame(animationFrame);
    const startRotation = rotation; const startTime = performance.now(); const duration = 1800; const coastDistance = spinSpeed * (duration / 1000) / 2;
    const slowDown = (time) => { const progress = Math.min((time - startTime) / duration, 1); rotation = startRotation + coastDistance * (2 * progress - progress * progress); renderWheel(); if (progress < 1) animationFrame = requestAnimationFrame(slowDown); else finishSpin(); };
    animationFrame = requestAnimationFrame(slowDown);
  });
  wordCard.addEventListener('click', () => { const flipped = wordCard.classList.toggle('flipped'); flipHint.textContent = flipped ? '👆 Click again to see the picture!' : '👆 Click the card to flip it!'; wordCard.setAttribute('aria-pressed', String(flipped)); wordCard.setAttribute('aria-label', flipped ? `${cardSentence.textContent} Click to see the picture again.` : `${cardWord.textContent} picture card. Click to reveal the sentence.`); if (currentSegment) playVocabulary(currentSegment, flipped); });
  document.getElementById('return-btn').addEventListener('click', () => { selectedArea.hidden = true; currentSegment = null; stopVocabularyNarration(); spinButton.focus(); });
})();
