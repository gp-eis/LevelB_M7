(() => {
  const ASSET = '../assets/images/week-1/literacy/page-02/game-elements/';
  const ACTIONS = {
    'make-honey': { label:'Make honey', icon:'honey-jar-v2.webp', sentence:'Bees make honey.', instruction:'Move the jar left and right to catch the falling honey.', video:'../assets/video/week-1/literacy/page-02/make-honey.mp4' },
    'protect-the-queen': { label:'Protect the queen', icon:'queen-bee-v2.webp', sentence:'Bees protect the queen.', instruction:'Drag or tap four worker bees into the guard circle.', video:'../assets/video/week-1/literacy/page-02/protect-the-queen.mp4' },
    'find-flowers': { label:'Find flowers', icon:'activity-flower.webp', sentence:'Bees find flowers.', instruction:'Drag the bee to all five special flowers. You can also tap the bee.', video:'../assets/video/week-1/literacy/page-02/find-flowers.mp4' },
    'build-hives': { label:'Build hives', icon:'natural-hive.webp', sentence:'Bees build hives.', instruction:'Complete the natural hive with four honeycomb pieces.', video:'../assets/video/week-1/literacy/page-02/build-hives.mp4' },
    'collect-nectar': { label:'Collect nectar', icon:'worker-bee-v2.webp', sentence:'Bees collect nectar.', instruction:'Take the bee to a flower, then bring it home. Make four trips.', video:'../assets/video/week-1/literacy/page-02/collect-nectar.mp4' }
  };

  const overlay=document.getElementById('page-two-activity-overlay');
  const stage=document.getElementById('page-two-activity-stage');
  const title=document.getElementById('page-two-activity-title');
  const icon=document.getElementById('page-two-activity-icon');
  const instruction=document.getElementById('page-two-activity-instruction');
  const feedback=document.getElementById('page-two-activity-feedback');
  const progress=document.getElementById('page-two-progress-fill');
  const success=document.getElementById('page-two-success');
  const successSentence=document.getElementById('page-two-success-sentence');
  const watchButton=document.getElementById('page-two-watch-video');
  const closeButton=document.getElementById('page-two-activity-close');
  const restartButton=document.getElementById('page-two-activity-restart');
  const skipTopButton=document.getElementById('page-two-activity-skip-top');
  const video=document.getElementById('page-two-video');
  const actionButtons=[...document.querySelectorAll('.page-two-action[data-action]')];
  if(!overlay||!stage||!video)return;

  let activeKey='';
  let cleanups=[];
  const addCleanup=fn=>cleanups.push(fn);
  const cleanupActivity=()=>{cleanups.splice(0).forEach(fn=>{try{fn()}catch(_){}})};
  const setProgress=(value,total)=>{progress.style.width=`${Math.max(0,Math.min(100,value/total*100))}%`};
  const say=(message,good=true)=>{feedback.textContent=message;feedback.classList.toggle('is-wrong-message',!good)};
  const rectsTouch=(a,b,pad=0)=>a.left<b.right-pad&&a.right>b.left+pad&&a.top<b.bottom-pad&&a.bottom>b.top+pad;
  let pourAudioContext=null;
  const ensurePourAudio=()=>{
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextClass)return null;
    pourAudioContext=pourAudioContext||new AudioContextClass();
    if(pourAudioContext.state==='suspended')pourAudioContext.resume().catch(()=>{});
    return pourAudioContext;
  };
  const playPourSound=()=>{
    const context=ensurePourAudio();
    if(!context||context.state!=='running')return;
    const now=context.currentTime;
    const buffer=context.createBuffer(1,Math.floor(context.sampleRate*.38),context.sampleRate);
    const data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
    const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
    source.buffer=buffer;filter.type='lowpass';filter.frequency.setValueAtTime(1050,now);filter.frequency.exponentialRampToValueAtTime(430,now+.38);
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.075,now+.035);gain.gain.exponentialRampToValueAtTime(.0001,now+.38);
    source.connect(filter).connect(gain).connect(context.destination);source.start(now);
    const bubble=context.createOscillator(),bubbleGain=context.createGain();
    bubble.type='sine';bubble.frequency.setValueAtTime(230,now+.08);bubble.frequency.exponentialRampToValueAtTime(460,now+.3);
    bubbleGain.gain.setValueAtTime(.0001,now);bubbleGain.gain.exponentialRampToValueAtTime(.045,now+.1);bubbleGain.gain.exponentialRampToValueAtTime(.0001,now+.34);
    bubble.connect(bubbleGain).connect(context.destination);bubble.start(now);bubble.stop(now+.36);
  };

  function makeMovable(element,container,onDrop,onTap){
    let pointerId=null,startX=0,startY=0,offsetX=0,offsetY=0,moved=false;
    const down=event=>{
      if(pointerId!==null)return;
      pointerId=event.pointerId;startX=event.clientX;startY=event.clientY;moved=false;
      const r=element.getBoundingClientRect(),c=container.getBoundingClientRect();
      element.style.left=`${r.left-c.left}px`;element.style.top=`${r.top-c.top}px`;element.style.right='auto';element.style.bottom='auto';element.style.transform='none';
      offsetX=event.clientX-r.left;offsetY=event.clientY-r.top;
      element.setPointerCapture?.(pointerId);event.preventDefault();
    };
    const move=event=>{
      if(event.pointerId!==pointerId)return;
      if(Math.hypot(event.clientX-startX,event.clientY-startY)>7)moved=true;
      const c=container.getBoundingClientRect();
      const x=Math.max(0,Math.min(c.width-element.offsetWidth,event.clientX-c.left-offsetX));
      const y=Math.max(0,Math.min(c.height-element.offsetHeight,event.clientY-c.top-offsetY));
      element.style.left=`${x}px`;element.style.top=`${y}px`;event.preventDefault();
    };
    const up=event=>{
      if(event.pointerId!==pointerId)return;
      try{element.releasePointerCapture?.(pointerId)}catch(_){}
      pointerId=null;
      if(moved)onDrop?.(element);else onTap?.(element);
      event.preventDefault();
    };
    element.addEventListener('pointerdown',down);element.addEventListener('pointermove',move);element.addEventListener('pointerup',up);element.addEventListener('pointercancel',up);
  }

  function enableGhostDrag(element,target,onActivate){
    let id=null,ghost=null,moved=false,sx=0,sy=0;
    const clear=()=>{ghost?.remove();ghost=null};
    element.addEventListener('pointerdown',e=>{if(element.disabled)return;id=e.pointerId;sx=e.clientX;sy=e.clientY;moved=false;element.setPointerCapture?.(id);e.preventDefault()});
    element.addEventListener('pointermove',e=>{
      if(e.pointerId!==id)return;
      if(!moved&&Math.hypot(e.clientX-sx,e.clientY-sy)>7){moved=true;ghost=element.cloneNode(true);ghost.classList.add('drag-ghost');Object.assign(ghost.style,{position:'fixed',zIndex:3000,pointerEvents:'none',width:`${element.offsetWidth}px`,height:`${element.offsetHeight}px`,opacity:'.88'});document.body.append(ghost)}
      if(ghost){ghost.style.left=`${e.clientX-ghost.offsetWidth/2}px`;ghost.style.top=`${e.clientY-ghost.offsetHeight/2}px`}e.preventDefault();
    });
    const finish=e=>{if(e.pointerId!==id)return;id=null;const hit=moved&&rectsTouch({left:e.clientX,right:e.clientX,top:e.clientY,bottom:e.clientY},target.getBoundingClientRect());clear();if(hit||!moved)onActivate();e.preventDefault()};
    element.addEventListener('pointerup',finish);element.addEventListener('pointercancel',e=>{if(e.pointerId===id){id=null;clear()}});addCleanup(clear);
  }

  const rememberCompletion=key=>{
    try{const done=new Set(JSON.parse(sessionStorage.getItem('levelB-m7-w1-p2-completed')||'[]'));done.add(key);sessionStorage.setItem('levelB-m7-w1-p2-completed',JSON.stringify([...done]))}catch(_){}
    actionButtons.find(button=>button.dataset.action===key)?.classList.add('is-complete');
  };
  const finishActivity=()=>{
    const action=ACTIONS[activeKey];if(!action)return;
    cleanupActivity();rememberCompletion(activeKey);setProgress(1,1);successSentence.textContent=action.sentence;watchButton.textContent=`▶ Watch “${action.label}”`;success.hidden=false;say('Activity complete!');
  };

  function renderMakeHoney(){
    stage.innerHTML=`<div class="honey-game"><p class="game-hint">Swipe the jar to catch 6 big honey drops!</p><div class="jar-meter"><span></span><b>Honey jar</b></div><button class="asset-button honey-jar" type="button" aria-label="Move honey jar"><span class="honey-jar-liquid" aria-hidden="true"></span><img src="${ASSET}honey-jar-v2.webp" alt="Honey jar"></button></div>`;
    const game=stage.querySelector('.honey-game'),jar=stage.querySelector('.honey-jar'),meter=stage.querySelector('.jar-meter span'),jarLiquid=stage.querySelector('.honey-jar-liquid');
    let caught=0,stopped=false;
    jar.addEventListener('pointerdown',ensurePourAudio,{passive:true});
    makeMovable(jar,game,()=>{},()=>say('Swipe the jar left and right to catch the honey.'));
    const moveJar=direction=>{const c=game.getBoundingClientRect(),r=jar.getBoundingClientRect();let x=r.left-c.left+direction*42;x=Math.max(0,Math.min(c.width-r.width,x));jar.style.left=`${x}px`;jar.style.top=`${r.top-c.top}px`;jar.style.bottom='auto';jar.style.transform='none'};
    const key=e=>{if(e.key==='ArrowLeft'){moveJar(-1);e.preventDefault()}if(e.key==='ArrowRight'){moveJar(1);e.preventDefault()}};document.addEventListener('keydown',key);addCleanup(()=>document.removeEventListener('keydown',key));
    const drops=new Set();
    const spawn=()=>{
      if(stopped)return;const drop=document.createElement('img');drop.className='honey-drop';drop.src=`${ASSET}honey-drop-v2.webp`;drop.alt='';drop.style.left=`${8+Math.random()*80}%`;drop.style.top='-125px';game.append(drop);drops.add(drop);
      const animation=drop.animate([{transform:'translateY(0)'},{transform:`translateY(${game.clientHeight+150}px)`}],{duration:2500,easing:'linear'});
      const check=window.setTimeout(()=>{if(stopped||!drop.isConnected)return;const d=drop.getBoundingClientRect(),j=jar.getBoundingClientRect();if(rectsTouch(d,j,Math.min(18,j.width*.1))){animation.cancel();drop.remove();drops.delete(drop);caught++;const amount=caught/6*100;meter.style.height=`${amount}%`;jarLiquid.style.height=`${amount*0.57}%`;playPourSound();setProgress(caught,6);say(`Great catch! ${caught} of 6.`);if(caught===6)finishActivity()}},2050);
      animation.finished.catch(()=>{}).then(()=>{window.clearTimeout(check);drop.remove();drops.delete(drop)});
    };
    const timer=window.setInterval(spawn,760);spawn();addCleanup(()=>{stopped=true;window.clearInterval(timer);drops.forEach(drop=>{drop.getAnimations().forEach(a=>a.cancel());drop.remove()});drops.clear()});
  }

  function renderProtectQueen(){
    stage.innerHTML=`<div class="queen-game"><p class="game-hint">Put four helpers around the queen.</p><div class="guard-zone">${'<span class="guard-slot"></span>'.repeat(4)}</div><img class="queen-bee" src="${ASSET}queen-bee-v2.webp" alt="Queen bee">${[0,1,2,3].map(()=>`<button class="asset-button guard-bee" type="button" aria-label="Worker bee"><img src="${ASSET}worker-bee-v2.webp" alt="Worker bee"></button>`).join('')}</div>`;
    const game=stage.querySelector('.queen-game'),zone=stage.querySelector('.guard-zone'),slots=[...stage.querySelectorAll('.guard-slot')],usedSlots=new Set();let placed=0;
    [...stage.querySelectorAll('.guard-bee')].forEach(bee=>{
      const place=preferred=>{if(bee.classList.contains('is-placed'))return;const open=slots.filter(slot=>!usedSlots.has(slot));const slot=preferred&&!usedSlots.has(preferred)?preferred:open[0];if(!slot)return;const g=game.getBoundingClientRect(),r=slot.getBoundingClientRect();usedSlots.add(slot);slot.classList.add('is-filled');bee.classList.add('is-placed');bee.style.left=`${r.left-g.left}px`;bee.style.top=`${r.top-g.top}px`;bee.style.width=`${r.width}px`;bee.style.height=`${r.height}px`;placed++;setProgress(placed,4);say(`${placed} of 4 helpers are guarding the queen.`);if(placed===4)window.setTimeout(finishActivity,350)};
      makeMovable(bee,game,item=>{if(!rectsTouch(item.getBoundingClientRect(),zone.getBoundingClientRect(),20)){say('Move the worker bee closer to the queen.',false);return}const r=item.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;const open=slots.filter(slot=>!usedSlots.has(slot));const nearest=open.reduce((best,slot)=>{const s=slot.getBoundingClientRect(),distance=Math.hypot(s.left+s.width/2-cx,s.top+s.height/2-cy);return !best||distance<best.distance?{slot,distance}:best},null);place(nearest?.slot)},()=>place());
    });
  }

  function renderFindFlowers(){
    stage.innerHTML=`<div class="flower-game"><p class="game-hint">Take the bee to five bright activity flowers.</p>${[0,1,2,3,4].map(()=>`<div class="flower-target"><img src="${ASSET}activity-flower.webp" alt="Special activity flower"></div>`).join('')}<button class="asset-button flower-bee" type="button" aria-label="Move bee"><img src="${ASSET}worker-bee-v2.webp" alt="Bee"></button></div>`;
    const game=stage.querySelector('.flower-game'),bee=stage.querySelector('.flower-bee'),flowers=[...stage.querySelectorAll('.flower-target')];let found=0;
    const findFlower=flower=>{if(!flower||flower.classList.contains('is-found'))return;flower.classList.add('is-found');found++;setProgress(found,5);say(`Flower ${found} of 5 found!`);if(found===5)window.setTimeout(finishActivity,350)};
    const nearest=()=>flowers.find(f=>!f.classList.contains('is-found'));
    const flyTo=flower=>{if(!flower)return;const g=game.getBoundingClientRect(),r=flower.getBoundingClientRect();bee.style.transition='left .45s ease,top .45s ease';bee.style.left=`${r.left-g.left+r.width/2-bee.offsetWidth/2}px`;bee.style.top=`${r.top-g.top+r.height/2-bee.offsetHeight/2}px`;bee.style.bottom='auto';window.setTimeout(()=>{bee.style.transition='';findFlower(flower)},460)};
    makeMovable(bee,game,item=>{const hit=flowers.find(f=>!f.classList.contains('is-found')&&rectsTouch(item.getBoundingClientRect(),f.getBoundingClientRect(),12));if(hit)findFlower(hit);else say('Try landing on a flower.',false)},()=>flyTo(nearest()));
  }

  function renderBuildHive(){
    const pieces=[0,1,2,3];
    const sliceMarkup=index=>`<span class="natural-hive-slice" style="--slice:${index}"><img src="${ASSET}natural-hive.webp" alt=""></span>`;
    stage.innerHTML=`<div class="hive-game natural-hive-game"><p class="game-hint">Complete the wild hive from top to bottom.</p><img class="hive-tree" src="${ASSET}hive-tree.webp" alt="Tree branch"><div class="natural-hive-target" aria-label="Natural hive puzzle">${pieces.map(index=>`<span class="natural-hive-slot" data-order="${index}"></span>`).join('')}</div><div class="hive-tray natural-hive-tray">${pieces.map(index=>`<button class="asset-button hive-piece natural-hive-piece" type="button" data-order="${index}" aria-label="Hive piece ${index+1}">${sliceMarkup(index)}</button>`).join('')}</div></div>`;
    const target=stage.querySelector('.natural-hive-target');let next=0;
    [...stage.querySelectorAll('.natural-hive-piece')].forEach(button=>enableGhostDrag(button,target,()=>{
      const order=Number(button.dataset.order);if(order!==next){button.classList.remove('is-wrong');void button.offsetWidth;button.classList.add('is-wrong');say(`Find hive piece ${next+1}.`,false);return}
      button.disabled=true;button.classList.add('is-used');stage.querySelector(`.natural-hive-slot[data-order="${order}"]`).innerHTML=sliceMarkup(order);next++;setProgress(next,4);say(`Hive piece ${next} of 4 added!`);if(next===4)window.setTimeout(finishActivity,500);
    }));
  }

  function renderCollectNectar(){
    stage.innerHTML=`<div class="nectar-game"><p class="game-hint">Go to the glowing flower, then return to the glowing hive.</p><div class="nectar-meter"><b>Nectar</b><div class="nectar-meter-track"><span class="nectar-meter-fill"></span></div><div class="nectar-dots">${'<span></span>'.repeat(4)}</div><output>0%</output></div><img class="nectar-hive" src="${ASSET}natural-hive.webp" alt="Natural beehive">${[0,1,2,3].map(i=>`<img class="nectar-flower" data-index="${i}" src="${ASSET}activity-flower.webp" alt="Flower ${i+1}">`).join('')}<button class="asset-button nectar-bee" type="button" aria-label="Move bee"><img src="${ASSET}worker-bee-v2.webp" alt="Bee"></button></div>`;
    const game=stage.querySelector('.nectar-game'),bee=stage.querySelector('.nectar-bee'),hive=stage.querySelector('.nectar-hive'),flowers=[...stage.querySelectorAll('.nectar-flower')],fill=stage.querySelector('.nectar-meter-fill'),dots=[...stage.querySelectorAll('.nectar-dots span')],output=stage.querySelector('output');let trips=0,carrying=false;flowers[0].classList.add('is-current');
    const update=()=>{const pct=trips*25;fill.style.height=`${pct}%`;output.value=`${pct}%`;dots.forEach((dot,index)=>dot.classList.toggle('is-filled',index<trips));setProgress(trips,4)};
    const currentTarget=()=>carrying?hive:flowers[trips];
    const arrive=()=>{
      if(!carrying){flowers[trips].classList.remove('is-current');flowers[trips].classList.add('is-done');carrying=true;hive.classList.add('is-current');instruction.textContent='Great! Now bring the nectar back to the glowing hive.';say('Nectar collected. Fly to the glowing hive!');return}
      carrying=false;hive.classList.remove('is-current');trips++;update();say(`${trips} of 4 nectar trips complete!`);if(trips===4){window.setTimeout(finishActivity,350);return}flowers[trips].classList.add('is-current');instruction.textContent='Take the bee to the glowing flower, then bring it home.';
    };
    const fly=target=>{if(!target)return;const g=game.getBoundingClientRect(),r=target.getBoundingClientRect();bee.style.transition='left .5s ease,top .5s ease';bee.style.left=`${r.left-g.left+r.width/2-bee.offsetWidth/2}px`;bee.style.top=`${r.top-g.top+r.height/2-bee.offsetHeight/2}px`;bee.style.bottom='auto';window.setTimeout(()=>{bee.style.transition='';arrive()},510)};
    makeMovable(bee,game,item=>{const target=currentTarget();if(target&&rectsTouch(item.getBoundingClientRect(),target.getBoundingClientRect(),10))arrive();else say(carrying?'Bring the bee back to the hive.':'Land on the glowing flower.',false)},()=>fly(currentTarget()));update();
  }

  const renderActiveActivity=()=>{
    cleanupActivity();const action=ACTIONS[activeKey];if(!action)return;success.hidden=true;title.textContent=action.label;icon.src=ASSET+action.icon;instruction.textContent=action.instruction;feedback.textContent='';feedback.classList.remove('is-wrong-message');setProgress(0,1);
    if(activeKey==='make-honey')renderMakeHoney();if(activeKey==='protect-the-queen')renderProtectQueen();if(activeKey==='find-flowers')renderFindFlowers();if(activeKey==='build-hives')renderBuildHive();if(activeKey==='collect-nectar')renderCollectNectar();
  };
  const openActivity=key=>{if(!ACTIONS[key])return;activeKey=key;video.pause();overlay.hidden=false;document.body.style.overflow='hidden';renderActiveActivity();closeButton.focus()};
  const closeActivity=()=>{cleanupActivity();overlay.hidden=true;success.hidden=true;document.body.style.overflow='';actionButtons.find(button=>button.dataset.action===activeKey)?.focus()};
  const loadAndPlayVideo=key=>{const action=ACTIONS[key];if(!action)return;video.pause();video.src=action.video;video.setAttribute('aria-label',`${action.label} video`);video.load();closeActivity();video.scrollIntoView({behavior:'smooth',block:'center'});video.play().catch(()=>{})};
  actionButtons.forEach(button=>button.addEventListener('click',()=>openActivity(button.dataset.action)));closeButton.addEventListener('click',closeActivity);restartButton.addEventListener('click',renderActiveActivity);skipTopButton.addEventListener('click',()=>loadAndPlayVideo(activeKey));watchButton.addEventListener('click',()=>loadAndPlayVideo(activeKey));overlay.addEventListener('click',event=>{if(event.target===overlay)closeActivity()});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!overlay.hidden)closeActivity()});
  try{JSON.parse(sessionStorage.getItem('levelB-m7-w1-p2-completed')||'[]').forEach(key=>actionButtons.find(item=>item.dataset.action===key)?.classList.add('is-complete'))}catch(_){}
})();
