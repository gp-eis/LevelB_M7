(() => {
  const week = Number(document.body.dataset.week || 1);
  const app = document.querySelector('#week-app');
  if (!app) return;

  const weekTitles = {
    1: 'Do you keep bees?',
    2: 'What do bees do?',
    3: 'Why do we need bees?',
    4: 'I am Lorenzo Langstroth.'
  };
  const tracks = [
    { key:'literacy', label:'Literacy', image:'assets/images/ui/week-home/lesson-literacy-gerry-optimized.png', alt:'Gerry dressed as a beekeeper and holding an alphabet book', className:'literacy' },
    { key:'reading', label:'Reading', image:'assets/images/ui/week-home/lesson-reading-penny-optimized.png', alt:'Penny dressed as a beekeeper and reading a bee storybook', className:'reading' },
    { key:'phonics', label:'Phonics', image:'assets/images/ui/week-home/lesson-phonics-coover-optimized.png', alt:'Coover dressed as a beekeeper and combining the lowercase letters a and d', className:'phonics' },
    { key:'games', label:'Games', image:'assets/images/ui/week-home/lesson-games-wanda-optimized.png', alt:'Wanda dressed as a beekeeper-ranger and holding a honeycomb game controller', className:'games' }
  ];

  app.className = 'week-home-shell';
  app.innerHTML = `
    <header class="week-heading">
      <span class="week-heading__bee" aria-hidden="true">🐝</span>
      <h1>Week ${week} — Beekeeper!</h1>
      <p>${weekTitles[week]}</p>
    </header>
    <div class="carousel-wrap" id="lesson-focus">
      <button class="carousel-arrow prev" type="button" aria-label="Previous choice">‹</button>
      <nav class="learning-carousel" aria-label="Week ${week} learning choices">
        ${tracks.map((track,index) => {
          const href = track.key === 'literacy'
            ? `lessons/week-${week}-page-01.html`
            : track.key === 'games'
              ? `games/index.html?week=${week}`
              : `${track.key}/week-${week}.html`;
          return `<a class="learning-card ${track.className}${index === 0 ? ' is-active' : ''}" href="${href}" data-card="${index}"><h2>${track.label}</h2><img class="learning-card__art" src="${track.image}" width="600" height="600" loading="lazy" decoding="async" alt="${track.alt}"></a>`;
        }).join('')}
      </nav>
      <button class="carousel-arrow next" type="button" aria-label="Next choice">›</button>
    </div>
    <div class="carousel-dots" aria-label="Carousel position">
      ${tracks.map((track,index) => `<button class="carousel-dot${index === 0 ? ' is-active' : ''}" type="button" data-card="${index}" aria-label="Show ${track.label}"></button>`).join('')}
    </div>
    <a class="all-weeks-btn" href="index.html"><span aria-hidden="true">←</span> All Weeks</a>`;

  const track = app.querySelector('.learning-carousel');
  const cards = [...app.querySelectorAll('.learning-card')];
  const dots = [...app.querySelectorAll('.carousel-dot')];
  const hashCards = { '#card-literacy':0, '#card-reading':1, '#card-phonics':2, '#card-games':3 };
  let active = Math.min(hashCards[location.hash] ?? 0, cards.length - 1);

  const update = () => {
    cards.forEach((card,index) => card.classList.toggle('is-active',index === active));
    dots.forEach((dot,index) => dot.classList.toggle('is-active',index === active));
  };
  const show = index => {
    active = Math.max(0,Math.min(cards.length - 1,index));
    update();
    cards[active].scrollIntoView({ behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'nearest', inline:'center' });
  };
  app.querySelector('.carousel-arrow.prev').addEventListener('click',() => show(active - 1));
  app.querySelector('.carousel-arrow.next').addEventListener('click',() => show(active + 1));
  dots.forEach((dot,index) => dot.addEventListener('click',() => show(index)));
  let timer;
  track.addEventListener('scroll',() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const middle = track.getBoundingClientRect().left + track.clientWidth / 2;
      active = cards.reduce((best,card,index) => {
        const distance = Math.abs(card.getBoundingClientRect().left + card.offsetWidth / 2 - middle);
        return distance < best.distance ? { index,distance } : best;
      },{ index:active,distance:Infinity }).index;
      update();
    },90);
  },{ passive:true });
  addEventListener('load',() => show(active),{ once:true });
})();
