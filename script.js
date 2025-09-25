const API_URL='https://farmago-web-api.onrender.com';
const root=document.getElementById('root');
const qEl=document.getElementById('q');

let state={q:'',loading:false,err:null,data:null};

const hasKA = (s='') => /[ა-ჰ]/.test(String(s));
const bad = (v) => v==null || String(v).trim()==='' || ['nan','NaN','none','None','null','undefined'].includes(String(v).trim());
const clean = (v) => bad(v) ? '' : String(v).trim();
const num = (v) => { const n=Number(v); return Number.isFinite(n) ? n : null; };

const pharmacyLine = (r) => {
  const ph = clean(r['название аптеки'] || r.pharmacy || r.pharmacy_code);
  return `<div class="muted">🏥 ${ph || '—'}</div>`;
};

const linkLine = (r) => {
  const en  = clean(r.title_english);
  const base= clean(r.title);
  const nm  = clean(r.name);
  const ge  = [base,nm].find(hasKA) || '';
  const lat = [en, (!hasKA(base)?base:''), (!hasKA(nm)?nm:'')].find(s=>s) || '';
  const url = clean(r.url) || '#';
  const text = (lat && ge) ? `${lat} – ${ge}` : (lat || ge || '—');
  return `🔗 <a href="${url}" target="_blank" rel="noopener">${text}</a>`;
};

const ruLine = (r) => {
  const ru  = clean(r.title_russian);
  const lat = [clean(r.title_english), clean(r.title), clean(r.name)].find(s=>s) || '';
  const text = ru || lat || 'Без названия';
  return `💊 ${text}`;
};

const priceLine = (r) => {
  const val = num(clean(r.price));
  return `💰 ${val!=null ? val+' ₾' : '—'}`;
};

const itemCard = (r) => `
  <div class="item">
    ${pharmacyLine(r)}
    ${linkLine(r)}
    ${ruLine(r)}
    ${priceLine(r)}
  </div>
`;

const block = (titleRu, titleKa, arr) => arr?.length
  ? `<div class="section"><div class="title">🎯 ${titleRu} · ${titleKa}</div>${arr.map(itemCard).join('')}</div>`
  : '';

const skeleton = (n) => Array.from({length:n},()=>'<div class="sk"></div>').join('');

const render = () => {
  if(state.loading){ root.innerHTML=skeleton(8); return; }
  if(state.err){ root.innerHTML=`<div class="err">${state.err}</div>`; return; }
  const p=state.data; if(!p?.ok){ root.innerHTML=''; return; }
  const byPrice=(a,b)=>(num(a.price)??1e9)-(num(b.price)??1e9);
  const d=[...(p.direct||[])].sort(byPrice);
  const g=[...(p.similar_by_action||[])].sort(byPrice);
  const o=[...(p.others||[])].sort(byPrice);
  root.innerHTML=[
    block('Наиболее подходящие','ყველაზე შესაფერისი', d),
    block('Похожие по действию','მოქმედებით მსგავსი', g),
    block('Другие варианты по цене','სხვა შეთავაზებები ფასით', o),
    `<div class="disc">${p.disclaimer||''}</div>`
  ].join('');
};

const search = async (q) => {
  state.loading=true; state.err=null; state.data=null; render();
  try{
    const u=new URL(`${API_URL}/search`); u.searchParams.set('q',q); u.searchParams.set('lang','ru');
    const res=await fetch(u.toString(),{method:'GET'});
    if(res.status===429){ state.err='Слишком много запросов. Попробуйте позже.'; state.loading=false; return render(); }
    if(!res.ok){ state.err='Сервис временно недоступен. Попробуйте позже.'; state.loading=false; return render(); }
    state.data=await res.json(); state.loading=false; render();
  }catch{ state.err='Сеть недоступна. Повторите попытку.'; state.loading=false; render(); }
};

let t=null;
qEl.addEventListener('input',()=>{
  const v=qEl.value; if(v===state.q) return;
  state.q=v; clearTimeout(t);
  t=setTimeout(()=> v.trim()?search(v): (state.data=null, render()), 300);
});

(()=>{ const p=new URLSearchParams(location.search); const q=p.get('q'); if(q){ qEl.value=q; state.q=q; search(q); } })();
