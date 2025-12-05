const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));


const state = {
  favorites: JSON.parse(localStorage.getItem('fav_v1') || '[]'),
  user: JSON.parse(localStorage.getItem('user_v1') || 'null'),
  autoSlide: true,
  autoInterval: null
};


window.addEventListener('load', () => {
  restoreUserUI();
  restoreFavoritesUI();
  initHeaderControls();
  initSliders();
  initSearch();
  initModals();
  initAuthPages();
  initEpisodesPage();
  initEpisodeDetail();
  initAutoSlide();
  initFocusableSlides();
});


function initHeaderControls(){

  $$('.icon-btn').forEach(btn =>{
    btn.addEventListener('click', (e)=>{
        if(btn.id && btn.id.startsWith('themeToggle')){
        document.documentElement.classList.toggle('light-mode');
      }
    });
  });


  $$('.login-btn').forEach(b=>{
    b.addEventListener('click', ()=>{
    
      const auth = $('#authModal');
      if(auth) openModal(auth);
      else window.location.href = 'login.html';
    });
  });


  $$('#notifBtn, #notifBtn2, #notifBtn3').forEach(b=>{
    if(!b) return;
    b.addEventListener('click', ()=>{
      if(window.location.pathname.endsWith('notifications.html')) return;
   
      alert('No notifications (demo).');
    });
  });
}


function initSliders(){
  const sliders = $$('.slider');
  sliders.forEach(slider => {
    // wheel to scroll sideways
    slider.addEventListener('wheel', e => {
      e.preventDefault();
      slider.scrollLeft += e.deltaY * 0.8;
    });

 
    let startX=0, startScroll=0;
    slider.addEventListener('touchstart', e => { startX = e.touches[0].pageX; startScroll = slider.scrollLeft; }, {passive:true});
    slider.addEventListener('touchmove', e => { const dx = e.touches[0].pageX - startX; slider.scrollLeft = startScroll - dx; }, {passive:true});

    let isDown=false, downX=0, scrollLeft=0;
    slider.addEventListener('mousedown', e => { isDown=true; slider.classList.add('dragging'); downX=e.pageX; scrollLeft=slider.scrollLeft; });
    window.addEventListener('mouseup', ()=>{ isDown=false; slider.classList.remove('dragging'); });
    window.addEventListener('mousemove', e => { if(!isDown) return; const walk = (e.pageX - downX) * 1.2; slider.scrollLeft = scrollLeft - walk; });


    slider.addEventListener('click', e=>{
      const item = e.target.closest('.slide-item');
      if(!item) return;
      if(e.target.classList.contains('fav-toggle')) return;
      showSummary(item.dataset);
    });


    slider.querySelectorAll('.slide-item').forEach(si=>{
      si.addEventListener('mouseenter', ()=>{
        si.previewTimeout = setTimeout(()=>{
          if(si.querySelector('.preview-iframe')) return;
          const ifr = document.createElement('iframe');
          ifr.className = 'preview-iframe';
          ifr.src = 'https://www.youtube.com/embed/b9EkMc79ZSU?autoplay=1&mute=1&controls=0&rel=0';
          Object.assign(ifr.style,{position:'absolute',right:'8px',top:'8px',width:'120px',height:'78px',borderRadius:'8px',zIndex:20});
          si.appendChild(ifr);
        }, 700);
      });
      si.addEventListener('mouseleave', ()=>{
        clearTimeout(si.previewTimeout);
        const pf = si.querySelector('.preview-iframe'); if(pf) pf.remove();
      });
    });
  });


  $$('.fav-toggle').forEach(btn => btn.addEventListener('click', (e)=>{
    e.stopPropagation();
    const item = e.target.closest('.slide-item');
    toggleFavorite(item.dataset.id, item.dataset.title, e.target);
  }));
}


function initAutoSlide(){
  const autoBtn = $('#autoToggle');
  if(autoBtn){
    autoBtn.addEventListener('click', (e)=>{
      state.autoSlide = !state.autoSlide;
      e.target.textContent = `Auto-Slider: ${state.autoSlide ? 'ON':'OFF'}`;
      if(state.autoSlide) startAutoSlide(); else stopAutoSlide();
    });
  }
  if(state.autoSlide) startAutoSlide();
}
function startAutoSlide(){
  if(state.autoInterval) clearInterval(state.autoInterval);
  state.autoInterval = setInterval(()=>{
    $$('#slider-1, #slider-2, #slider-3').forEach(sl=>{
      if(!sl) return;
      sl.scrollBy({left:260, behavior:'smooth'});
      if(sl.scrollLeft + sl.clientWidth >= sl.scrollWidth - 20) sl.scrollTo({left:0, behavior:'smooth'});
    });
  }, 3200);
}
function stopAutoSlide(){ if(state.autoInterval) clearInterval(state.autoInterval); state.autoInterval = null; }


function initSearch(){
  const input = $('#searchInput');
  if(!input) return;
  const results = $('#searchResults');

  input.addEventListener('input', ()=>{
    const q = input.value.trim().toLowerCase();
    const items = $$('#slider-1 .slide-item');
    let matches = [];
    items.forEach(i=>{
      const title = (i.dataset.title || '').toLowerCase();
      const ok = q ? title.includes(q) : true;
      i.style.display = ok ? 'block' : 'none';
      if(q && title.includes(q)) matches.push({id:i.dataset.id, title:i.dataset.title});
    });

    if(q && matches.length){
      results.innerHTML = matches.map(m=>`<div class="sr-item" data-id="${m.id}">${m.title}</div>`).join('');
      results.hidden = false;
      $$('.sr-item').forEach(r => r.addEventListener('click', ev=>{
        const id = ev.currentTarget.dataset.id;
        const el = document.querySelector(`#slider-1 .slide-item[data-id="${id}"]`);
        if(el) el.scrollIntoView({behavior:'smooth',inline:'center'});
        results.hidden = true;
      }));
    } else results.hidden = true;
  });

  document.addEventListener('click', e=>{ if(!e.target.closest('.search-wrap')) results && (results.hidden = true); });
}


function initModals(){
  // hooks for close buttons
  $('#closeSummary')?.addEventListener('click', ()=> closeModal($('#summaryModal')));
  $('#closeTrailer')?.addEventListener('click', ()=>{
    const c = $('#trailerContainer'); if(c) c.innerHTML=''; closeModal($('#trailerModal'));
  });

  $$('.modal-bg').forEach(m=>m.addEventListener('click', (ev)=>{ if(ev.target === m) closeModal(m); }));
}

function showSummary(data){
  $('#summaryTitle').textContent = data.title || '';
  $('#summaryText').textContent = data.summary || 'No summary';
  openModal($('#summaryModal'));

  $('#openDetail').onclick = ()=> {
)
    window.location.href = 'detail.html';
  };
}
function openTrailer(id='b9EkMc79ZSU'){
  const cont = $('#trailerContainer');
  if(!cont) return;
  cont.innerHTML = '';
  const ifr = document.createElement('iframe');
  ifr.src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=0`;
  ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  ifr.allowFullscreen = true;
  cont.appendChild(ifr);
  openModal($('#trailerModal'));
}

function openModal(el){ if(!el) return; el.style.display='flex'; el.setAttribute('aria-hidden','false'); }
function closeModal(el){ if(!el) return; el.style.display='none'; el.setAttribute('aria-hidden','true'); }


function toggleFavorite(id, title, btnEl){
  const idx = state.favorites.findIndex(f=>f.id===id);
  if(idx >= 0){ state.favorites.splice(idx,1); btnEl.classList.remove('active'); btnEl.textContent='♡'; }
  else { state.favorites.push({id,title,added:Date.now()}); btnEl.classList.add('active'); btnEl.textContent='♥'; }
  localStorage.setItem('fav_v1', JSON.stringify(state.favorites));
  restoreFavoritesUI();
}
function restoreFavoritesUI(){
  $$('.slide-item').forEach(si=>{
    const id = si.dataset.id; const btn = si.querySelector('.fav-toggle');
    if(!btn) return;
    if(state.favorites.some(f=>f.id===id)){ btn.classList.add('active'); btn.textContent='♥'; }
    else { btn.classList.remove('active'); btn.textContent='♡'; }
  });
}


function initAuthPages(){

  $('#doSignIn')?.addEventListener('click', ()=>{
    const n = ($('#signinName')?.value || 'Viewer').trim();
    state.user = {name:n}; localStorage.setItem('user_v1', JSON.stringify(state.user)); closeModal($('#authModal')); restoreUserUI();
  });
  $('#doRegister')?.addEventListener('click', ()=>{
    const n = ($('#regName')?.value || 'New User').trim();
    state.user = {name:n}; localStorage.setItem('user_v1', JSON.stringify(state.user)); closeModal($('#authModal')); restoreUserUI();
  });


  $('#doSignInPage')?.addEventListener('click', ()=>{
    const n = ($('#signinNameInput')?.value || 'Viewer').trim();
    state.user = {name:n}; localStorage.setItem('user_v1', JSON.stringify(state.user)); window.location.href = 'index.html';
  });
  $('#doRegisterPage')?.addEventListener('click', ()=>{
    const n = ($('#regNameInput')?.value || 'New User').trim();
    state.user = {name:n}; localStorage.setItem('user_v1', JSON.stringify(state.user)); window.location.href = 'index.html';
  });
  $('#logoutBtn')?.addEventListener('click', ()=> { state.user=null; localStorage.removeItem('user_v1'); restoreUserUI(); });
}

function restoreUserUI(){
  state.user = JSON.parse(localStorage.getItem('user_v1') || 'null');
  if(state.user){
    $$('.login-btn').forEach(b=> b.textContent = state.user.name);
    $('#profileDisplayName') && ($('#profileDisplayName').textContent = state.user.name);
  } else {
    $$('.login-btn').forEach(b=> b.textContent = 'Sign In');
  }
}


function initEpisodesPage(){
  if(!document.querySelector('.episode-list')) return;
 
}

function initEpisodeDetail(){
  if(!document.getElementById('episodeRoot')) return;

  const params = new URLSearchParams(location.search);
  const e = params.get('e') || '1';
  const title = e === '1' ? 'Episode 1 — The Hellfire Club' : 'Episode '+e;
  const thumb = e === '1' ? 'https://i.imgur.com/8QwD6oH.jpeg' : 'https://i.imgur.com/7wZ3XQ2.jpeg';
  const desc = e === '1' ? 'El struggles at school. A dark mystery begins.' : 'Episode detail demo.';
  $('#epTitle').textContent = title;
  $('#epThumb').style.backgroundImage = `url('${thumb}')`;
  $('#epDesc').textContent = desc;
  $('#epPlay')?.addEventListener('click', ()=> alert('Episode play (demo)'));
}


function initFocusableSlides(){
  $$('.slide-item').forEach(si => si.setAttribute('tabindex','0'));
  // enter key opens summary on focused slide
  document.body.addEventListener('keydown', e=>{
    if(e.key === 'Enter'){
      const active = document.activeElement;
      if(active && active.classList.contains('slide-item')){
        showSummary(active.dataset);
      }
    }
    if(e.key === 'f' || e.key === 'F'){ $('#searchInput')?.focus(); }
    if(e.key === 'Escape'){
      $$('.modal-bg').forEach(m=> m.style.display='none');
    }
  });
}



function initHeroAutoSlider(){

  const heroImages = [
    'images/stranger-things.jpeg',
    'images/alice-in-borderland.jpeg',
    'images/frieren.jpeg'
  ];

  const titles = [
    'Stranger Things',
    'The Umbrella Academy',
    'Squid Game'
  ];

  const descriptions = [
    'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.',
    'Superpowered siblings reunite to solve the mystery of their father’s death and stop the apocalypse.',
    'Hundreds of players compete in deadly games for a massive prize.'
  ];

  let current = 0;

  const heroSection = document.querySelector('.hero-bg');
  const heroTitle = document.querySelector('.hero-content h1');
  const heroLead = document.querySelector('.hero-content .lead');

  if(!heroSection) return;

  setInterval(()=>{
    current = (current + 1) % heroImages.length;
    
    heroSection.style.backgroundImage = `url(${heroImages[current]})`;
    heroTitle.textContent = titles[current];
    heroLead.textContent = descriptions[current];

  }, 5000); 
}

window.addEventListener('load', ()=>{
  initHeroAutoSlider();
});

