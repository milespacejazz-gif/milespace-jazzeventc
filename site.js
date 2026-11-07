(function(){
  const D = window.EVENT_DATA;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  // Marquee
  const words = ['AFTERNOON OF JAZZ','1/17 SUN · 三團加長場 · 14:30 START','百年綠意 · 爵代新聲','TAICHUNG STATE HALL','GRASSLAND CONCERT', ...D.bands.map(b=>b.name.toUpperCase())];
  const seq = words.map(w=>`<span>${esc(w)}</span><i>✦</i>`).join('');
  $('#mq').innerHTML = seq + seq;

  // Nav solid on scroll + active link
  const nav = $('#nav');
  const links = [...document.querySelectorAll('.nav ul a')];
  const onScroll = () => {
    nav.classList.toggle('solid', window.scrollY > window.innerHeight * 0.6);
    let cur = null;
    links.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s && s.getBoundingClientRect().top < 120) cur = a; });
    links.forEach(a => a.classList.toggle('on', a === cur));
  };
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Day tabs
  const KEY = 'milespace_day';
  let day = localStorage.getItem(KEY) || D.days[0].id;
  if (!D.days.find(d=>d.id===day)) day = D.days[0].id;

  $('#daytabs').innerHTML = D.days.map(d => `
    <button class="daytab${d.special?' sp':''}" role="tab" data-day="${d.id}">
      <div class="wk">${d.week} · ${d.session}</div>
      <div class="d">${d.date}</div>
      <div class="dw">${d.dow} ${d.zh} · ${D.bands.filter(b=>b.day===d.id).length} 團演出${d.start?` · <b>${d.start} 開演</b>`:''}</div>
      ${d.tag ? `<span class="pill">${d.tag}</span>` : ''}
    </button>`).join('');

  function renderDay(){
    document.querySelectorAll('.daytab').forEach(t => { const on = t.dataset.day===day; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
    const d = D.days.find(x=>x.id===day);
    const bands = D.bands.filter(b=>b.day===day);
    $('#bands').innerHTML = bands.map(b => `
      <button class="band" data-no="${b.no}">
        <div class="ph"><img src="${b.img}" alt="${esc(b.name)}" style="object-position:${b.pos}" loading="lazy"></div>
        <div class="tx">
          <div class="meta"><span class="t">${b.time}</span><span class="s">[ ${b.set} ]</span></div>
          <div class="no">場次 ${b.no} / 09</div>
          <h3>${esc(b.name)}</h3>
          <div class="en">${esc(b.en)}</div>
          <p class="lead">${esc(b.lead)}</p>
          <span class="more">樂團介紹 <span></span></span>
        </div>
      </button>`).join('');
    const sp = $('#special');
    if (d.special){
      sp.hidden = false;
      sp.innerHTML = `
        <div class="sp-l"><div class="sp-k">SPECIAL · 3 BANDS</div><div class="sp-n">3<span>團</span></div></div>
        <div class="sp-m"><h3>${d.date} ${d.zh} · 三團接力加長場</h3><p>本日提早至 <b>下午 14:30</b> 開演，連續三組樂團登台，一路演到 17:30。<br>建議 14:25 前入座，別錯過首團！</p></div>
        <ol class="sp-r">${bands.map(b=>`<li><span>${b.time.split(' ')[0]}</span>${esc(b.name)}</li>`).join('')}</ol>`;
    } else { sp.hidden = true; sp.innerHTML = ''; }
    const prog = D.program[day];
    if ($('#sched')) $('#sched').innerHTML = `
      <h4><span>${d.date} ${d.zh} · 當日流程</span><span class="eyebrow">Program</span></h4>
      <ol>${prog.map(p => `<li class="${p[3]||''}"><span class="tm">${p[0]}</span><span class="pg"><b>${p[1]}</b><span>${p[2]}</span></span></li>`).join('')}</ol>`;
  }
  function setDay(id){ day = id; localStorage.setItem(KEY, id); renderDay(); }
  $('#daytabs').addEventListener('click', e => { const t = e.target.closest('.daytab'); if (t) setDay(t.dataset.day); });
  document.querySelectorAll('.infobar .dates a').forEach(a => a.addEventListener('click', () => setDay(a.dataset.day)));
  renderDay();

  // Modal
  const modal = $('#modal'), sheet = $('#sheet');
  function openBand(no){
    const i = D.bands.findIndex(b=>b.no===no); if (i<0) return;
    const b = D.bands[i], d = D.days.find(x=>x.id===b.day);
    const prev = D.bands[i-1], next = D.bands[i+1];
    const mem = b.sections
      ? `<h5>MEMBERS · BY SECTION</h5><dl class="mem">${b.sections.map(m=>`<div><dt>${m[0]}</dt><dd>${m[1]}</dd></div>`).join('')}</dl>`
      : `<h5>PERSONNEL · 樂團編制</h5><dl class="mem">${b.members.map(m=>`<div><dt>${m[0]}</dt><dd>${esc(m[1])}</dd></div>`).join('')}</dl>`;
    sheet.innerHTML = `
      <button class="close" data-close aria-label="關閉">✕</button>
      <div class="hero-ph"><img src="${b.img}" alt="${esc(b.name)}" style="object-position:${b.pos}"></div>
      <div class="body">
        <div class="tagrow"><span class="y">${d.date} ${d.dow} · ${b.time}</span><span>${b.set}</span><span>場次 ${b.no} / 09</span></div>
        <h3>${esc(b.name)}</h3>
        <div class="en">${esc(b.en)}${b.sub ? ' · ' + esc(b.sub) : ''}</div>
        <p class="lead">${esc(b.lead)}</p>
        <div class="bio">${b.bio.map(p=>`<p>${esc(p)}</p>`).join('')}</div>
        <div class="cols">
          <div>${mem}</div>
          <div><h5>HIGHLIGHTS · 重要經歷</h5><ul class="hl">${b.highlights.map(h=>`<li>${esc(h)}</li>`).join('')}</ul></div>
        </div>
        <div class="nav2">
          ${prev ? `<button data-go="${prev.no}"><small>← PREV · ${prev.no}</small>${esc(prev.name)}</button>` : '<span style="flex:1"></span>'}
          ${next ? `<button class="nx" data-go="${next.no}"><small>NEXT · ${next.no} →</small>${esc(next.name)}</button>` : '<span style="flex:1"></span>'}
        </div>
      </div>`;
    sheet.scrollTop = 0;
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow = ''; }
  $('#bands').addEventListener('click', e => { const b = e.target.closest('.band'); if (b) openBand(b.dataset.no); });
  modal.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) return closeModal();
    const g = e.target.closest('[data-go]'); if (g) openBand(g.dataset.go);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

  // Gentle parallax on scene image
  const sImg = $('#sceneImg'), sFrame = sImg && sImg.parentElement;
  if (sImg && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    const px = () => { const r = sFrame.getBoundingClientRect(); const vh = innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      const p = (vh - r.top) / (vh + r.height); sImg.style.transform = `scale(1.04) translateY(${(p - .5) * 3}%)`; };
    addEventListener('scroll', px, {passive:true}); px();
  }

  // Reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }), {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
