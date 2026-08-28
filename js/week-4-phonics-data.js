(() => {
  const words = [
    { id:'dog', word:'DOG', label:'Dog', family:'og', initial:'D', suffix:'og', sentence:'I see a dog.', image:'../../assets/images/week-1/phonics/dog.png' },
    { id:'log', word:'LOG', label:'Log', family:'og', initial:'L', suffix:'og', sentence:'I see a log.', image:'../../assets/images/week-1/phonics/log.png' },
    { id:'fog', word:'FOG', label:'Fog', family:'og', initial:'F', suffix:'og', sentence:'I see fog.', image:'../../assets/images/week-1/phonics/fog.png' },
    { id:'cop', word:'COP', label:'Cop', family:'op', initial:'C', suffix:'op', sentence:'I see a cop.', image:'../../assets/images/week-2/phonics/cop.png' },
    { id:'mop', word:'MOP', label:'Mop', family:'op', initial:'M', suffix:'op', sentence:'I see a mop.', image:'../../assets/images/week-2/phonics/mop.png' },
    { id:'shop', word:'SHOP', label:'Shop', family:'op', initial:'SH', suffix:'op', sentence:'I see a shop.', image:'../../assets/images/week-2/phonics/shop.png' },
    { id:'cot', word:'COT', label:'Cot', family:'ot', initial:'C', suffix:'ot', sentence:'I see a cot.', image:'../../assets/images/week-3/phonics/cot.png' },
    { id:'dot', word:'DOT', label:'Dot', family:'ot', initial:'D', suffix:'ot', sentence:'I see a dot.', image:'../../assets/images/week-3/phonics/dot.png' },
    { id:'pot', word:'POT', label:'Pot', family:'ot', initial:'P', suffix:'ot', sentence:'I see a pot.', image:'../../assets/images/week-3/phonics/pot.png' }
  ];

  const confusables = {
    dog:['dot','log'], log:['dog','fog'], fog:['dog','log'],
    cop:['cot','mop'], mop:['cop','pot'], shop:['mop','cot'],
    cot:['cop','dot'], dot:['dog','cot'], pot:['mop','cot']
  };

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result;
  }

  function balancedRounds() {
    return shuffle(['og','op','ot'].flatMap(family =>
      shuffle(words.filter(item => item.family === family)).slice(0, 2)
    ));
  }

  window.WEEK4_PHONICS = { words, confusables, shuffle, balancedRounds };
})();
