/* ============================================================
   Letter phonemes for Athlete phonics games

   Primary classroom sound when a letter has more than one:
   A /æ/ cat  B /b/ bat  C /k/ cat  D /d/ dog  E /ĕ/ bed
   F /f/ fan  G /g/ go   H /h/ hat  I /ĭ/ igloo J /j/ jam
   K /k/ kite L /l/ leg  M /em/     N /n/ net  O /ŏ/ pot
   P /p/ pen  Q /kw/ queen R /r/ run S /s/ sun T /t/ top
   U /ŭ/ cup  V /v/ van  W /w/ water X /ks/ box Y /y/ yellow
   Z /z/ zoo

   Each click plays ONE short sound (previous speech is cancelled).
   ============================================================ */

window.LETTER_PHONEME_SAY = {
  a: 'ae',       // /æ/ as in cat
  b: 'buh',      // /b/ as in bat
  c: 'kuh',      // /k/ as in cat
  d: 'duh',      // /d/ as in dog
  e: 'eh',       // /ĕ/ as in bed
  f: 'fff',      // /f/ as in fan
  g: 'guh',      // /g/ as in go
  h: 'huh',      // /h/ as in hat
  i: 'ih',       // /ĭ/ as in igloo
  j: 'juh',      // /j/ as in jam
  k: 'kuh',      // /k/ as in kite
  l: 'lll',      // /l/ as in leg
  m: 'em',       // /em/ — once only
  n: 'nnn',      // /n/ as in net
  o: 'ah',       // /ŏ/ as in pot
  p: 'puh',      // /p/ as in pen
  q: 'kwuh',     // /kw/ as in queen
  r: 'rrr',      // /r/ as in run
  s: 'sss',      // /s/ as in sun
  t: 'tuh',      // /t/ as in top
  u: 'uh',       // /ŭ/ as in cup
  v: 'vvv',      // /v/ as in van
  w: 'wuh',      // /w/ as in water
  x: 'ks',       // /ks/ as in box
  y: 'yuh',      // /y/ as in yellow
  z: 'zzz'       // /z/ as in zoo
};

window._phonemeVoice = null;
window._phonemeToken = 0;
window._phonemeAudio = null;
window._phonemeResolve = null;

function getLetterRecordingBase() {
  const script = document.querySelector('script[src*="letter-phonemes.js"]');
  if (!script) return '../assets/audio/phonics/letters/';
  return script.getAttribute('src').replace(/js\/letter-phonemes\.js(?:\?.*)?$/, 'assets/audio/phonics/letters/');
}

function pickPhonemeVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  window._phonemeVoice =
    voices.find(v => /^en[-_]US$/i.test(v.lang || '') && /google|samantha|zira|jenny|aria|english/i.test(v.name))
        || voices.find(v => /^en[-_]US$/i.test(v.lang || ''))
    || null;
}

if ('speechSynthesis' in window) {
  pickPhonemeVoice();
  speechSynthesis.addEventListener('voiceschanged', pickPhonemeVoice);
}

/**
 * Play the letter phoneme once per click.
 */
window.playLetterPhoneme = function playLetterPhoneme(letter) {
  if (!letter) return Promise.resolve();

  const key = String(letter).toLowerCase();
  if (!/^[a-z]$/.test(key)) return Promise.resolve();

  const token = ++window._phonemeToken;

  if (window._phonemeResolve) window._phonemeResolve();

  if (window._phonemeAudio) {
    window._phonemeAudio.pause();
    window._phonemeAudio.currentTime = 0;
  }
  if ('speechSynthesis' in window) speechSynthesis.cancel();

  const recording = new Audio(`${getLetterRecordingBase()}${key}.mp3`);
  window._phonemeAudio = recording;
  recording.preload = 'auto';
  recording.volume = 1;

  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (window._phonemeResolve === finish) window._phonemeResolve = null;
      resolve();
    };
    window._phonemeResolve = finish;
    recording.addEventListener('ended', finish, { once: true });

    recording.play().catch(() => {
      if (token !== window._phonemeToken || !('speechSynthesis' in window)) {
        finish();
        return;
      }

      // Keep the original synthetic pronunciation as an offline fallback.
      const say = (window.LETTER_PHONEME_SAY && window.LETTER_PHONEME_SAY[key]) || key;
      const utterance = new SpeechSynthesisUtterance(say);
      utterance.lang = 'en-US';
      utterance.rate = key === 'm' ? 0.95 : 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onend = finish;
      utterance.onerror = finish;
      if (window._phonemeVoice) utterance.voice = window._phonemeVoice;
      speechSynthesis.speak(utterance);
    });
  });
};

/*
 * Each recording says the letter name followed by its classroom phoneme.
 * The text-to-speech table above remains only as a missing-file fallback.
 */
