let selected = [];
let lang = 'en';
let recognition = null;
let listening = false;
const HISTORY_KEY = 'sevvi_history';

const sevMap = {
  SAFE:      {cls:'b-safe',     bar:'m-safe',     dot:'d-safe',     rc:'rc-safe',     label:'Safe'},
  MILD:      {cls:'b-mild',     bar:'m-mild',     dot:'d-mild',     rc:'rc-mild',     label:'Mild'},
  MODERATE:  {cls:'b-moderate', bar:'m-moderate', dot:'d-moderate', rc:'rc-moderate', label:'Moderate'},
  SEVERE:    {cls:'b-severe',   bar:'m-severe',   dot:'d-severe',   rc:'rc-severe',   label:'Severe'},
  DANGEROUS: {cls:'b-dangerous',bar:'m-dangerous',dot:'d-dangerous',rc:'rc-dangerous',label:'Dangerous'},
};

const i18n = {
  en: {
    heroBadge:'Tamil Nadu\'s Medicine Safety App',
    heroTagline:'Know Before You Mix.',
    heroSub:'Check Siddha + Allopathy drug interactions before it\'s too late. Voice enabled. Tamil supported.',
    heroCta:'Check Now', heroLearn:'Learn More',
    s1:'Medicines', s2:'Siddha Herbs', s3:'Known Interactions',
    featTitle:'Why Sevvi?',
    f1h:'Siddha + Allopathy', f1p:'First app to combine traditional Siddha herb and modern medicine interaction checks.',
    f2h:'Voice in Tamil', f2p:'Speak medicine names in Tamil or English. Perfect for elderly patients.',
    f3h:'Instant Results', f3p:'Safe to Dangerous severity levels with Tamil + English explanations instantly.',
    f4h:'Indian Brands', f4p:'Search Dolo, Crocin, Telma by brand name — no need for generic names.',
    f5h:'History Saved', f5p:'All your checks saved locally. Review anytime, no login needed.',
    f6h:'AI Powered', f6p:'Unknown combinations? Claude AI explains in simple Tamil and English.',
    ctaH:'Ready to check your medicines?', ctaP:'Free. No login. Offline for known interactions.', ctaBtn:'Start Checking',
    ckTitle:'Drug Interaction Checker', ckSub:'Add medicines or herbs to check for interactions',
    addBtn:'+ Add', checkBtn:'Check Interactions', hint:'Add 2 or more medicines to check',
    hisTitle:'Check History', hisSub:'Your recent interaction checks', clearBtn:'Clear All',
    loading:'Checking interactions...', noInteraction:'No known interactions found.',
    noInteractionRec:'These medicines appear safe together. Always consult your doctor.',
    readAloud:'Read aloud', aiTag:'AI powered', navHome:'Home', navChecker:'Checker',
    navHistory:'History', navAbout:'About', emptyHistory:'No history yet. Start checking!',
    voiceListening:'Listening in English...',
  },
  ta: {
    heroBadge:'தமிழ்நாட்டின் மருந்து பாதுகாப்பு செயலி',
    heroTagline:'கலைப்பதற்கு முன் தெரிந்துகொள்.',
    heroSub:'சித்த + அலோபதி மருந்து தொடர்புகளை சரிபாருங்கள். குரல் வழி. தமிழில் செயல்படும்.',
    heroCta:'இப்போது சோதி', heroLearn:'மேலும் அறிக',
    s1:'மருந்துகள்', s2:'சித்த மூலிகைகள்', s3:'தெரிந்த தொடர்புகள்',
    featTitle:'ஏன் செவ்வி?',
    f1h:'சித்த + அலோபதி', f1p:'சித்த மூலிகை மற்றும் நவீன மருந்து தொடர்பை ஒன்றாக சோதிக்கும் முதல் செயலி.',
    f2h:'தமிழில் குரல்', f2p:'தமிழில் அல்லது ஆங்கிலத்தில் பேசுங்கள். வயதானவர்களுக்கு ஏற்றது.',
    f3h:'உடனடி முடிவுகள்', f3p:'பாதுகாப்பானது முதல் ஆபத்தானது வரை தமிழ் விளக்கத்துடன்.',
    f4h:'இந்திய பிராண்டுகள்', f4p:'Dolo, Crocin, Telma என பிராண்ட் பெயரில் தேடுங்கள்.',
    f5h:'வரலாறு சேமிப்பு', f5p:'உங்கள் சோதனைகள் உள்ளூரில் சேமிக்கப்படும். உள்நுழைவு தேவையில்லை.',
    f6h:'AI ஆற்றல்', f6p:'தெரியாத சேர்க்கைகளுக்கு Claude AI தமிழிலும் ஆங்கிலத்திலும் விளக்கும்.',
    ctaH:'உங்கள் மருந்துகளை சோதிக்க தயாரா?', ctaP:'இலவசம். உள்நுழைவு இல்லை.', ctaBtn:'சோதிக்க தொடங்கு',
    ckTitle:'மருந்து தொடர்பு சோதனை', ckSub:'சோதிக்க மருந்துகள் அல்லது மூலிகைகளை சேர்க்கவும்',
    addBtn:'+ சேர்', checkBtn:'தொடர்பு சோதி', hint:'சோதிக்க 2 அல்லது அதிக மருந்துகளை சேர்க்கவும்',
    hisTitle:'சோதனை வரலாறு', hisSub:'உங்கள் சமீபத்திய சோதனைகள்', clearBtn:'அனைத்தும் அழி',
    loading:'சோதிக்கிறோம்...', noInteraction:'தேர்ந்த மருந்துகளுக்கிடையே தொடர்பு இல்லை.',
    noInteractionRec:'இந்த மருந்துகள் பாதுகாப்பானவை. ஆனால் மருத்துவரிடம் கேட்கவும்.',
    readAloud:'கேட்க', aiTag:'AI முடிவு', navHome:'முகப்பு', navChecker:'சோதனை',
    navHistory:'வரலாறு', navAbout:'பற்றி', emptyHistory:'வரலாறு இல்லை. சோதிக்க தொடங்குங்கள்!',
    voiceListening:'தமிழில் கேட்கிறோம்...',
  }
};

function T(k){ return i18n[lang][k] || i18n['en'][k] || k; }

function setLang(l) {
  lang = l;
  document.getElementById('ln-en').className = 'lang-pill' + (l==='en'?' active':'');
  document.getElementById('ln-ta').className = 'lang-pill' + (l==='ta'?' active':'');
  applyTranslations();
}

function applyTranslations() {
  const map = {
    'hero-badge':'heroBadge','hero-tagline':'heroTagline','hero-sub':'heroSub',
    'hero-cta':'heroCta','hero-learn':'heroLearn',
    's1':'s1','s2':'s2','s3':'s3','feat-title':'featTitle',
    'f1h':'f1h','f1p':'f1p','f2h':'f2h','f2p':'f2p',
    'f3h':'f3h','f3p':'f3p','f4h':'f4h','f4p':'f4p',
    'f5h':'f5h','f5p':'f5p','f6h':'f6h','f6p':'f6p',
    'cta-h':'ctaH','cta-p':'ctaP','cta-btn':'ctaBtn',
    'ck-title':'ckTitle','ck-sub':'ckSub',
    'add-btn':'addBtn','check-btn-text':'checkBtn','pills-hint':'hint',
    'his-title':'hisTitle','his-sub':'hisSub','clear-btn':'clearBtn',
    'nav-home':'navHome','nav-checker':'navChecker','nav-history':'navHistory','nav-about':'navAbout',
  };
  for (const [id, key] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.textContent = T(key);
  }
  const inp = document.getElementById('drug-input');
  if (inp) inp.placeholder = lang === 'ta' ? 'மருந்து அல்லது மூலிகை தேடுங்கள்...' : 'Search medicine or herb...';
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');
  if (name === 'history') renderHistory();
  window.scrollTo(0, 0);
}

function onInput() {
  const val = document.getElementById('drug-input').value.trim().toLowerCase();
  const box = document.getElementById('suggestions');
  if (!val || val.length < 2) { box.style.display = 'none'; return; }
  const matches = allMeds.filter(m =>
    m.brand.toLowerCase().includes(val) || m.generic.toLowerCase().includes(val)
  ).slice(0, 8);
  if (!matches.length) { box.style.display = 'none'; return; }
  box.innerHTML = matches.map(m =>
    `<div class="sugg-item" onclick="selectSug('${m.id}')">
      <div><div class="sugg-name">${m.brand}</div><div class="sugg-use">${m.use}</div></div>
      <span class="sugg-tag ${m.cat}">${m.cat === 'siddha' ? 'Siddha' : 'Allopathy'}</span>
    </div>`
  ).join('');
  box.style.display = 'block';
}

function selectSug(id) {
  const med = allMeds.find(m => m.id === id);
  if (med && !selected.find(m => m.id === id)) { selected.push(med); renderPills(); }
  document.getElementById('drug-input').value = '';
  document.getElementById('suggestions').style.display = 'none';
}

function onKey(e) { if (e.key === 'Enter') addDrug(); }

function addDrug() {
  const val = document.getElementById('drug-input').value.trim();
  if (!val) return;
  const match = allMeds.find(m =>
    m.brand.toLowerCase() === val.toLowerCase() || m.generic.toLowerCase() === val.toLowerCase()
  );
  if (match && !selected.find(m => m.id === match.id)) { selected.push(match); }
  else if (!match) { selected.push({ id: 'C' + Date.now(), brand: val, generic: val, cat: 'allopathy', use: 'Unknown' }); }
  document.getElementById('drug-input').value = '';
  document.getElementById('suggestions').style.display = 'none';
  renderPills();
}

function removeMed(id) {
  selected = selected.filter(m => m.id !== id);
  renderPills();
  document.getElementById('results').innerHTML = '';
}

function renderPills() {
  const c = document.getElementById('pills-container');
  if (!selected.length) {
    c.innerHTML = `<span class="pills-hint" id="pills-hint">${T('hint')}</span>`;
    document.getElementById('check-btn').disabled = true;
    return;
  }
  c.innerHTML = selected.map(m =>
    `<div class="pill ${m.cat === 'siddha' ? 'herb' : ''}">
      ${m.brand}<span class="pill-x" onclick="removeMed('${m.id}')">×</span>
    </div>`
  ).join('');
  document.getElementById('check-btn').disabled = selected.length < 2;
}

function getLocal(a, b) {
  return interactions.find(i => (i.a===a && i.b===b) || (i.a===b && i.b===a));
}

function buildCard(a, b, sev, en, ta, rec, isAI) {
  const s = sevMap[sev] || sevMap['MILD'];
  const effect = lang === 'ta' ? ta : en;
  const safeEffect = effect.replace(/'/g, "\\'").replace(/`/g, '');
  return `<div class="result-card ${s.rc}">
    <div class="sev-row">
      <span class="sev-badge ${s.cls}"><span class="sev-dot ${s.dot}"></span>${s.label}</span>
    </div>
    <div class="meter-wrap"><div class="meter-bar ${s.bar}"></div></div>
    <div class="drug-pair">${a.brand} + ${b.brand}</div>
    <div class="effect-text">${effect}</div>
    <div class="rec-box">${rec}</div>
    <div class="action-row">
      <button class="speak-btn" onclick="speak('${safeEffect}')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        ${T('readAloud')}
      </button>
    </div>
    ${isAI ? `<div class="ai-tag">${T('aiTag')}</div>` : ''}
  </div>`;
}

async function checkInteractions() {
  const res = document.getElementById('results');
  res.innerHTML = `<div class="loading"><span class="spinner"></span>${T('loading')}</div>`;
  let html = '';
  let allResults = [];
  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const a = selected[i], b = selected[j];
      const local = getLocal(a.id, b.id);
      if (local) {
        html += buildCard(a, b, local.sev, local.en, local.ta, local.rec, false);
        allResults.push({a: a.brand, b: b.brand, sev: local.sev});
      } else {
        const aiHtml = await getAICard(a, b);
        html += aiHtml;
        allResults.push({a: a.brand, b: b.brand, sev: 'AI'});
      }
    }
  }
  if (!html) {
    html = buildCard({brand:'Selected medicines'}, {brand:''}, 'SAFE', T('noInteraction'), T('noInteraction'), T('noInteractionRec'), false);
    allResults.push({sev:'SAFE'});
  }
  res.innerHTML = html;
  saveHistory(selected.map(m => m.brand), allResults);
}

async function getAICard(a, b) {
  try {
    const resp = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drugA: a, drugB: b })
    });
    const data = await resp.json();
    if (data.error) throw new Error(data.error);
    return buildCard(a, b, data.sev, data.en, data.ta, data.rec, true);
  } catch(e) {
    return `<div class="result-card rc-mild">
      <div class="drug-pair">${a.brand} + ${b.brand}</div>
      <div class="effect-text" style="color:#EF4444">AI result unavailable. Please check your API key or try again.</div>
    </div>`;
  }
}

async function _unused(a, b) {
  try {
    const text = '';
    const parts = text.split('|');
    if (parts.length >= 3) {
      const sev = parts[0].trim().toUpperCase();
      return buildCard(a, b, sev, parts[1].trim(), parts[2].trim(), (parts[3] || 'Consult your doctor').trim(), true);
    }
    return buildCard(a, b, 'MILD', text, text, 'Consult your doctor', true);
  } catch(e) {
    return `<div class="result-card rc-mild">
      <div class="drug-pair">${a.brand} + ${b.brand}</div>
      <div class="effect-text" style="color:#EF4444">Could not fetch result. Check your internet connection.</div>
    </div>`;
  }
}

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

function toggleMic() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert('Voice input needs Chrome browser!');
    return;
  }
  if (listening) { recognition && recognition.stop(); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.onstart = () => {
    listening = true;
    document.getElementById('mic-btn').classList.add('listening');
    const vs = document.getElementById('voice-status');
    const vt = document.getElementById('vtext');
    if (vs && vt) { vs.style.display = 'flex'; vt.textContent = T('voiceListening'); }
  };
  recognition.onend = () => {
    listening = false;
    document.getElementById('mic-btn').classList.remove('listening');
    const vs = document.getElementById('voice-status');
    if (vs) vs.style.display = 'none';
  };
  recognition.onerror = () => {
    listening = false;
    document.getElementById('mic-btn').classList.remove('listening');
    const vs = document.getElementById('voice-status');
    if (vs) vs.style.display = 'none';
  };
  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    document.getElementById('drug-input').value = transcript;
    onInput();
  };
  recognition.start();
}

function saveHistory(meds, results) {
  const history = getHistory();
  const topSev = results.reduce((acc, r) => {
    const order = ['SAFE','MILD','MODERATE','SEVERE','DANGEROUS','AI'];
    return order.indexOf(r.sev) > order.indexOf(acc) ? r.sev : acc;
  }, 'SAFE');
  history.unshift({
    id: Date.now(),
    meds: meds,
    results: results,
    topSev: topSev,
    date: new Date().toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}),
    lang: lang,
  });
  const trimmed = history.slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('history-list');
  const history = getHistory();
  if (!history.length) {
    list.innerHTML = `<div class="empty-history">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      <p>${T('emptyHistory')}</p>
    </div>`;
    return;
  }
  const s = sevMap;
  list.innerHTML = history.map(h => {
    const sv = s[h.topSev] || s['MILD'];
    return `<div class="history-item" onclick="replayCheck(${JSON.stringify(h.meds).replace(/'/g,'"')})">
      <div class="his-meds">${h.meds.join(' + ')}</div>
      <div class="his-meta">
        <span>${h.date}</span>
        <span class="his-badge ${sv.cls}">${sv.label}</span>
        <span>${h.results.length} pair(s)</span>
      </div>
    </div>`;
  }).join('');
}

function replayCheck(meds) {
  selected = [];
  meds.forEach(name => {
    const match = allMeds.find(m => m.brand === name);
    if (match) selected.push(match);
    else selected.push({ id: 'C' + Date.now(), brand: name, generic: name, cat: 'allopathy', use: '' });
  });
  showPage('checker');
  renderPills();
  checkInteractions();
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.input-wrap')) {
    const s = document.getElementById('suggestions');
    if (s) s.style.display = 'none';
  }
});

applyTranslations();
