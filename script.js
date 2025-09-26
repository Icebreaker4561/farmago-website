// Farmago Web - Core functionality
const API_URL='https://farmago-web-api.onrender.com';
const strings={
  ru:{
    tagline:'Дешевые лекарства в Грузии',
    search_placeholder:'Введите название лекарства...',
    search_button:'Найти лекарство',
    results_title:'Результаты поиска',
    about_title:'О Farmago',
    about_description:'Farmago — быстрый способ сравнить цены на лекарства в аптеках Грузии.',
    view_pharmacy:'Посмотреть на'
  },
  ka:{
    tagline:'იაფი წამლები საქართველოში',
    search_placeholder:'შეიყვანეთ წამლის დასახელება...',
    search_button:'მედიკამენტების ძებნა',
    results_title:'ძიების შედეგები',
    about_title:'Farmago-ს შესახებ',
    about_description:'Farmago — სწრაფი გზა წამლების ფასების შესადარებლად საქართველოს აფთიაქებში.',
    view_pharmacy:'ნახვა'
  }
};
let state={lang:localStorage.getItem('farmago_lang')||'ru',query:'',data:null};
function t(k){return strings[state.lang]?.[k]||strings.ru[k]||k;}
function clean(v){if(!v)return'';const s=String(v).trim();return['nan','NaN','none','None','null','undefined'].includes(s)?'':s;}
function getTitle(item){
  if(state.lang==='ka')return clean(item.title)||clean(item.name)||clean(item.title_russian)||'უცნობი';
  return clean(item.title_russian)||clean(item.title_english)||clean(item.title)||'Без названия';
}
function init(){
  console.log('Farmago init');
  document.querySelectorAll('.lang-btn').forEach(btn=>{
    btn.onclick=()=>{state.lang=btn.dataset.lang;updateUI();localStorage.setItem('farmago_lang',state.lang);};
  });
  updateUI();
}
function updateUI(){
  document.querySelectorAll('.lang-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.lang===state.lang));
  document.querySelectorAll('[data-key]').forEach(el=>{
    const text=t(el.dataset.key);
    if(el.tagName==='INPUT')el.placeholder=text;else el.textContent=text;
  });
}
document.addEventListener('DOMContentLoaded',init);

// Add missing search functionality
function handleSearch(){
  const query=document.getElementById('searchInput').value.trim();
  if(!query)return;
  state.query=query;
  searchMedicines(query);
}

async function searchMedicines(query){
  console.log('Searching for:',query);
  showLoading(true);
  try{
    const url=new URL(`${API_URL}/search`);
    url.searchParams.set('q',query);
    url.searchParams.set('lang',state.lang);
    const res=await fetch(url.toString());
    console.log('API response:',res.status);
    if(res.status===429){showError('rate_limit');return;}
    if(!res.ok){showError('service');return;}
    const data=await res.json();
    console.log('Data:',data);
    state.data=data;
    renderResults(data);
  }catch(e){
    console.error('Search error:',e);
    showError('network');
  }finally{
    showLoading(false);
  }
}

function showLoading(show){
  document.getElementById('loadingOverlay').classList.toggle('hidden',!show);
  document.getElementById('searchBtn').disabled=show;
}

function showError(type){
  showScreen('empty');
}

function showScreen(name){
  document.getElementById('landingScreen').classList.toggle('hidden',name!=='landing');
  document.getElementById('resultsScreen').classList.toggle('hidden',name!=='results');
  document.getElementById('emptyScreen').classList.toggle('hidden',name!=='empty');
}

function renderResults(data){
  if(!data||!data.ok||(!data.direct?.length&&!data.others?.length)){
    showScreen('empty');return;
  }
  const total=(data.direct||[]).length+(data.others||[]).length;
  document.getElementById('resultsCount').textContent=`«${state.query}» • ${total} результатов`;
  let html='';
  if(data.direct?.length){
    html+=`<div class="results-block"><h3 class="block-title">${t('block_direct')||'Наиболее подходящие'}</h3>`;
    data.direct.forEach(item=>html+=renderCard(item));
    html+='</div>';
  }
  if(data.others?.length){
    html+=`<div class="results-block"><h3 class="block-title">${t('block_others')||'Другие варианты'}</h3>`;
    data.others.forEach(item=>html+=renderCard(item));
    html+='</div>';
  }
  document.getElementById('resultsContent').innerHTML=html;
  showScreen('results');
}

function renderCard(item){
  const title=getTitle(item);
  const price=num(item.price);
  const pharmacy=clean(item['название аптеки']||item.pharmacy||'—');
  const url=clean(item.url)||'#';
  return `<div class="drug-card">
    <div class="drug-header">
      <div class="drug-info">
        <div class="drug-name">${title}</div>
      </div>
      <div class="drug-price">${price?price.toFixed(2)+' ₾':'—'}</div>
    </div>
    <div class="pharmacy-info">
      <div class="pharmacy-name">${pharmacy}</div>
    </div>
    <a href="${url}" target="_blank" class="pharmacy-link">${t('view_pharmacy')} ${pharmacy.toLowerCase()}.ge 🔗</a>
  </div>`;
}

function num(v){const n=Number(v);return Number.isFinite(n)?n:null;}

// Wire up events
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('searchBtn').onclick=handleSearch;
  document.getElementById('searchInput').onkeypress=e=>{if(e.key==='Enter')handleSearch();};
  document.getElementById('backBtn').onclick=()=>showScreen('landing');
  document.getElementById('newSearchBtn').onclick=()=>{document.getElementById('searchInput').value='';showScreen('landing');};
  document.getElementById('infoBtn').onclick=()=>document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('modalClose').onclick=()=>document.getElementById('modalOverlay').classList.add('hidden');
  document.getElementById('modalOverlay').onclick=e=>{if(e.target.id==='modalOverlay')e.target.classList.add('hidden');};
});
