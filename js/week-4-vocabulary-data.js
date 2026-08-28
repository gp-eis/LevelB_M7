window.WEEK4_VOCABULARY = [
  {id:'lorenzo-langstroth',label:'Lorenzo Langstroth',sentence:'I am Lorenzo Langstroth.',image:'../../assets/images/week-4/games/vocabulary/lorenzo-langstroth.png',wordAudio:'../../assets/audio/week-4/literacy/page-03/lorenzo-langstroth.mp3'},
  {id:'loved-bees',label:'loved bees',sentence:'I loved bees.',image:'../../assets/images/week-4/games/vocabulary/loved-bees.png',wordAudio:'../../assets/audio/week-4/literacy/page-04/word-loved.mp3',sentenceAudio:'../../assets/audio/week-4/literacy/page-04/sentence-loved.mp3'},
  {id:'helped-beekeepers',label:'helped beekeepers',sentence:'I helped beekeepers.',image:'../../assets/images/week-4/games/vocabulary/helped-beekeepers.png',wordAudio:'../../assets/audio/week-4/literacy/page-04/word-helped.mp3',sentenceAudio:'../../assets/audio/week-4/literacy/page-04/sentence-helped.mp3'},
  {id:'wrote-a-book',label:'wrote a book',sentence:'I wrote a book.',image:'../../assets/images/week-4/games/vocabulary/wrote-a-book.png',wordAudio:'../../assets/audio/week-4/literacy/page-04/word-book.mp3',sentenceAudio:'../../assets/audio/week-4/literacy/page-04/sentence-book.mp3'},
  {id:'kept-bees',label:'kept bees',sentence:'I kept bees.',image:'../../assets/images/week-4/games/vocabulary/kept-bees.png'},
  {id:'made-modern-beehive',label:'made the modern beehive',sentence:'I made the modern beehive.',image:'../../assets/images/week-4/games/vocabulary/made-modern-beehive.png',wordAudio:'../../assets/audio/week-4/literacy/page-04/word-hive.mp3',sentenceAudio:'../../assets/audio/week-4/literacy/page-04/sentence-hive.mp3'}
];

window.shuffleVocabulary = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
};

window.stopVocabularyNarration = () => {
  if (window.vocabularyNarrationAudio) {
    window.vocabularyNarrationAudio.pause();
    window.vocabularyNarrationAudio.currentTime = 0;
    window.vocabularyNarrationAudio = null;
  }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
};

let vocabularyVoice = null;
const chooseVocabularyVoice = () => {
  if (!('speechSynthesis' in window)) return null;
  const voices = speechSynthesis.getVoices();
  return voices.find((voice) => /Samantha|Ava|Aria|Jenny|Zira|Google US English|Natural|Female/i.test(voice.name) && /^en[-_]US$/i.test(voice.lang || ''))
    || voices.find((voice) => /^en[-_]US$/i.test(voice.lang || ''))
    || voices.find((voice) => /^en/i.test(voice.lang || ''))
    || null;
};
if ('speechSynthesis' in window) speechSynthesis.addEventListener('voiceschanged', () => { vocabularyVoice = chooseVocabularyVoice(); });

window.speakVocabulary = (text, rate = .86) => new Promise((resolve) => {
  if (!('speechSynthesis' in window)) { resolve(); return; }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (!vocabularyVoice) vocabularyVoice = chooseVocabularyVoice();
  utterance.lang = 'en-US'; utterance.rate = rate; utterance.pitch = 1.04;
  if (vocabularyVoice) utterance.voice = vocabularyVoice;
  utterance.onend = resolve; utterance.onerror = resolve;
  speechSynthesis.speak(utterance);
});

const playRecordedVocabulary = (source) => new Promise((resolve) => {
  const audio = new Audio(source);
  window.vocabularyNarrationAudio = audio;
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    if (window.vocabularyNarrationAudio === audio) window.vocabularyNarrationAudio = null;
    resolve();
  };
  audio.addEventListener('ended', finish, {once:true});
  audio.addEventListener('error', finish, {once:true});
  audio.play().catch(finish);
});

window.playVocabulary = async (item, includeSentence = false) => {
  stopVocabularyNarration();
  if (item.wordAudio) await playRecordedVocabulary(item.wordAudio);
  else await speakVocabulary(item.label, .82);
  if (!includeSentence) return;
  await new Promise((resolve) => window.setTimeout(resolve, 220));
  if (item.sentenceAudio) await playRecordedVocabulary(item.sentenceAudio);
  else await speakVocabulary(item.sentence, .86);
};

window.playVocabularySentence = async (item) => {
  stopVocabularyNarration();
  if (item.sentenceAudio) await playRecordedVocabulary(item.sentenceAudio);
  else await speakVocabulary(item.sentence, .86);
};
