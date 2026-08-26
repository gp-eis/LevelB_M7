/* ---------- Shared button sounds (generated with Web Audio) ---------- */

let audioContext;
let soundEnabled = true;
let cachedAmericanEnglishVoice = null;

function findAmericanEnglishVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const americanVoices = voices.filter((voice) => String(voice.lang).toLowerCase().replace('_', '-') === 'en-us');
  if (!americanVoices.length) return null;

  const preferredNames = [
    /google us english/i,
    /microsoft (aria|jenny|guy|zira|david)/i,
    /samantha|alex/i,
    /american/i,
    /english.*united states/i
  ];
  return preferredNames
    .map((pattern) => americanVoices.find((voice) => pattern.test(voice.name)))
    .find(Boolean) || americanVoices[0];
}

function getAmericanEnglishVoice() {
  if (cachedAmericanEnglishVoice) return Promise.resolve(cachedAmericanEnglishVoice);
  const immediateVoice = findAmericanEnglishVoice();
  if (immediateVoice) {
    cachedAmericanEnglishVoice = immediateVoice;
    return Promise.resolve(immediateVoice);
  }

  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve(null);
      return;
    }
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener('voiceschanged', finish);
      cachedAmericanEnglishVoice = findAmericanEnglishVoice();
      resolve(cachedAmericanEnglishVoice);
    };
    window.speechSynthesis.addEventListener('voiceschanged', finish);
    window.setTimeout(finish, 1200);
  });
}

async function speakAmericanEnglish(text, options = {}) {
  if (!soundEnabled || !text || !('speechSynthesis' in window)) return;
  const voice = await getAmericanEnglishVoice();
  // Never fall back to the device's default voice: on non-English devices that
  // can produce a Korean-accented English reading. Recorded lesson audio remains
  // the primary source, and speech is used only when an en-US voice is present.
  if (!voice) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = 'en-US';
  utterance.rate = options.rate || .82;
  utterance.pitch = options.pitch || 1.05;
  return new Promise((resolve) => {
    utterance.addEventListener('end', resolve, { once: true });
    utterance.addEventListener('error', resolve, { once: true });
    window.speechSynthesis.speak(utterance);
  });
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioContext = new AudioContext();
  }

  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function playTone(frequency, duration, volume, type = 'sine', delay = 0) {
  if (!soundEnabled) return;

  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + delay;
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
}

function playClickSound() {
  if (!soundEnabled) return;

  const context = getAudioContext();
  if (!context) return;

  if (context.state !== 'running') {
    context.resume().then(playClickSound).catch(() => {});
    return;
  }

  const start = context.currentTime;
  const masterGain = context.createGain();
  masterGain.gain.setValueAtTime(1.05, start);
  masterGain.connect(context.destination);

  const pop = context.createOscillator();
  const popGain = context.createGain();
  pop.type = 'sine';
  pop.frequency.setValueAtTime(260, start);
  pop.frequency.exponentialRampToValueAtTime(680, start + 0.065);
  pop.frequency.exponentialRampToValueAtTime(520, start + 0.105);
  popGain.gain.setValueAtTime(0.0001, start);
  popGain.gain.exponentialRampToValueAtTime(0.22, start + 0.008);
  popGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
  pop.connect(popGain);
  popGain.connect(masterGain);
  pop.start(start);
  pop.stop(start + 0.13);

  [
    { frequency: 820, delay: 0.018, volume: 0.09 },
    { frequency: 1120, delay: 0.052, volume: 0.075 },
    { frequency: 1480, delay: 0.086, volume: 0.055 }
  ].forEach(({ frequency, delay, volume }) => {
    const note = context.createOscillator();
    const noteGain = context.createGain();
    const noteStart = start + delay;
    note.type = 'triangle';
    note.frequency.setValueAtTime(frequency, noteStart);
    note.frequency.exponentialRampToValueAtTime(frequency * 1.06, noteStart + 0.05);
    noteGain.gain.setValueAtTime(0.0001, noteStart);
    noteGain.gain.exponentialRampToValueAtTime(volume, noteStart + 0.008);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.068);
    note.connect(noteGain);
    noteGain.connect(masterGain);
    note.start(noteStart);
    note.stop(noteStart + 0.075);
  });
}

function setupSiteSounds() {
  const findControl = (target) => target instanceof Element
    ? target.closest('button, a, [role="button"]')
    : null;

  document.addEventListener('pointerdown', (event) => {
    const control = findControl(event.target);
    if (!control || control.hasAttribute('data-no-click-sound') || control.matches(':disabled, [aria-disabled="true"]')) return;
    playClickSound();
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return;
    const control = findControl(event.target);
    if (!control || control.hasAttribute('data-no-click-sound') || control.matches(':disabled, [aria-disabled="true"]')) return;
    playClickSound();
  }, true);
}

/* Return Week Song and Flashcards to the Literacy page that opened them. */
function setupLiteracyToolReturnLinks() {
  const currentFile = window.location.pathname.split('/').pop();
  if (!currentFile || /^(?:tpr|flashcards)\.html$/i.test(currentFile)) return;
  const returnTarget = `${currentFile}#lesson-focus`;
  const sourceWeek = currentFile.match(/^week-([1-4])(?:-page-0[1-6])?\.html$/i)?.[1] || '';
  const pageText = document.querySelector('.page-indicator')?.textContent || '';
  const pageNumber = pageText.match(/Page\s+(\d+)/i)?.[1] || '';
  document.querySelectorAll('a[href*="tpr.html"], a[href*="flashcards.html"]').forEach((link) => {
    const toolUrl = new URL(link.getAttribute('href'), window.location.href);
    toolUrl.searchParams.set('return', returnTarget);
    if (pageNumber) toolUrl.searchParams.set('from', pageNumber);
    link.href = toolUrl.href;
    link.addEventListener('click', () => {
      try {
        if (sourceWeek) {
          sessionStorage.setItem(`literacyToolReturn:${sourceWeek}`, returnTarget);
          sessionStorage.setItem(`literacyToolReturnPage:${sourceWeek}`, pageNumber);
        }
      } catch (_) {}
    });
  });
}

function resolveLiteracyToolReturn(fallbackHref, fallbackText) {
  const params = new URLSearchParams(window.location.search);
  const requestedWeek = params.get('week') || '';
  let target = params.get('return') || '';
  let pageNumber = params.get('from') || '';
  const targetPattern = /^week-([1-4])(?:-page-0([1-6]))?\.html(?:#[A-Za-z0-9_-]+)?$/i;
  const matchesRequestedWeek = (candidate) => {
    const match = candidate.match(targetPattern);
    return Boolean(match && (!requestedWeek || match[1] === requestedWeek));
  };

  if (target && !matchesRequestedWeek(target)) target = '';

  if (!target && document.referrer) {
    try {
      const referrer = new URL(document.referrer);
      const referrerFile = referrer.pathname.split('/').pop() || '';
      const candidate = `${referrerFile}#lesson-focus`;
      if (referrer.origin === window.location.origin && matchesRequestedWeek(candidate)) {
        target = candidate;
        pageNumber = pageNumber || referrerFile.match(/page-0([1-6])\.html$/i)?.[1] || '';
      }
    } catch (_) {}
  }

  if (!target) {
    try {
      const storedTarget = requestedWeek ? sessionStorage.getItem(`literacyToolReturn:${requestedWeek}`) || '' : '';
      if (matchesRequestedWeek(storedTarget)) {
        target = storedTarget;
        pageNumber = pageNumber || sessionStorage.getItem(`literacyToolReturnPage:${requestedWeek}`) || '';
      }
    } catch (_) { target = ''; }
  }
  if (!matchesRequestedWeek(target)) {
    return { href: fallbackHref, text: fallbackText };
  }
  pageNumber = pageNumber || target.match(targetPattern)?.[2] || '';
  return { href: target, text: /^\d+$/.test(pageNumber) ? `⬅️ Back to Page ${pageNumber}` : '⬅️ Back to Literacy' };
}

window.resolveLiteracyToolReturn = resolveLiteracyToolReturn;

(() => {
  document.documentElement.classList.add('js-ready');
  setupSiteSounds();
  setupLiteracyToolReturnLinks();

  const script = document.querySelector('script[src*="main.js"]');
  const assetsBase = script
    ? script.getAttribute('src').replace(/js\/main\.js(?:\?.*)?$/, 'assets/')
    : 'assets/';

  if (!document.querySelector('.site-logo-bar')) {
    const bar = document.createElement('div');
    bar.className = 'site-logo-bar';

    const logo = document.createElement('img');
    logo.src = `${assetsBase}images/ui/giiip-eis-logo.webp`;
    logo.alt = 'GIIIP EIS logo';
    logo.width = 118;
    logo.height = 118;
    logo.decoding = 'async';

    bar.appendChild(logo);
    document.body.prepend(bar);
    document.body.classList.add('has-site-logo');
  }

  document.querySelectorAll('.video-play-shell').forEach((shell) => {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.center-video-play');
    if (!video || !button) return;
    const showButton = () => { button.hidden = false; };
    const hideButton = () => { button.hidden = true; };
    button.addEventListener('click', () => video.play().catch(showButton));
    video.addEventListener('play', hideButton);
    video.addEventListener('playing', hideButton);
    video.addEventListener('pause', showButton);
    video.addEventListener('ended', showButton);
  });
})();
