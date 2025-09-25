const API_URL='https://farmago-web-api.onrender.com';
const root=document.getElementById('root');
const qEl=document.getElementById('q');

let state={q:'',loading:false,err:null,data:null};

const hasKA = (s='') => /[ა-ჰ]/.test(String(s));
const pick = (r,k) => (r?.[k] ?? '').toString();

const pharmacyLine = (r) => {
  const ph = r['название аптеки'] || r.pharmacy || r.pharmacy_code || '';
  return `<div class="muted">🏥 ${ph || '—'}</div>`;
};

const linkLine = (r) => {
  const en = pick(r,'title_english');
  const base = pick(r,'title');
  const nm  = pick(r,'name');
  const ge  = [base,nm].find(hasKA) || '';
  const lat = en || (!hasKA(base) ? base : '') || (!hasKA(nm) ? nm : '') || en || base || nm || '—';
  const url = r.url || '#';
  const text = ge ? `${lat} – ${ge}` : lat;
  return `🔗 <a href="${url}" target="_blank" rel="noopener">${text}</a>`;
};

const ruLine = (r) => {
  const ru = pick(r,'title_russian');
  const text = ru || pick(r,'title_english') || pick(r,'title') || pick(r,'name') || 'Без названия';
  return `💊 ${text}`;
};

const priceLine = (r) => {
  const p = r.price; const val = (p!=null && !Number.isNaN(+p))? (+p): null;
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
  const byPrice=(a,b)=>(+a.price||1e9)-(+b.price||1e9);
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

// init from URL ?q=
(()=>{ const p=new URLSearchParams(location.search); const q=p.get('q'); if(q){ qEl.value=q; state.q=q; search(q); } })();
