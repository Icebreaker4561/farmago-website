const API_URL='https://farmago-web-api.onrender.com';
const strings={
  ru:{
    tagline:'Дешевые лекарства в Грузии',
    search_placeholder:'Введите название лекарства...',
    search_button:'Найти лекарство',
    results_title:'Результаты поиска',
    about_title:'О Farmago',
    about_description:'Farmago — быстрый способ сравнить цены на лекарства в аптеках Грузии.',
    view_pharmacy:'Посмотреть на',
    loading:'Поиск...',
    block_direct:'Наиболее подходящие',
    block_others:'Другие варианты',
    empty_title:'Не нашли то, что искали?',
    empty_subtitle:'Попробуйте изменить запрос',
    new_search:'🔍 Новый поиск',
    contact_us:'Написать нам',
    search_tips_title:'💡 Советы для поиска:',
    tip_international:'Используйте международное название',
    tip_form:'Попробуйте другую форму (таблетки, сироп, мазь)',
    tip_spelling:'Проверьте правильность написания',
    popular_title:'🔥 Популярные препараты',
    popular_choice:'Популярный выбор'
  },
  ka:{
    tagline:'იაფი წამლები საქართველოში',
    search_placeholder:'შეიყვანეთ წამლის დასახელება...',
    search_button:'მედიკამენტების ძებნა',
    results_title:'ძიების შედეგები',
    about_title:'Farmago-ს შესახებ',
    about_description:'Farmago — სწრაფი გზა წამლების ფასების შესადარებლად საქართველოს აფთიაქებში.',
    view_pharmacy:'ნახვა',
    loading:'ძებნა...',
    block_direct:'ყველაზე შესაფერისი',
    block_others:'სხვა შეთავაზებები',
    empty_title:'ვერ იპოვეთ რასაც ეძებდით?',
    empty_subtitle:'სცადეთ შეცვალოთ მოთხოვნა',
    new_search:'🔍 ახალი ძებნა',
    contact_us:'მოგვწერეთ',
    search_tips_title:'💡 ძებნის რჩევები:',
    tip_international:'გამოიყენეთ საერთაშორისო დასახელება',
    tip_form:'სცადეთ სხვა ფორმა (ტაბლეტები, სიროფი, მალამო)',
    tip_spelling:'შეამოწმეთ მართლწერა',
    popular_title:'🔥 პოპულარული პრეპარატები',
    popular_choice:'პოპულარული არჩევანი'
  }
};
let state={lang:localStorage.getItem('farmago_lang')||'ru',query:'',data:null};
function t(k){return strings[state.lang]?.[k]||strings.ru[k]||k;}
function clean(v){if(!v)return'';const s=String(v).trim();return['nan','NaN','none','None','null','undefined'].includes(s)?'':s;}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null;}
function getTitle(item){
  if(state.lang==='ka')return clean(item.title)||clean(item.name)||clean(item.title_russian)||'უცნობი';
  return clean(item.title_russian)||clean(item.title_english)||clean(item.title)||'Название недоступно';
}
function updateUI(){
  document.querySelectorAll('.lang-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.lang===state.lang));
  document.querySelectorAll('[data-key]').forEach(el=>{
    const text=t(el.dataset.key);
    if(el.tagName==='INPUT')el.placeholder=text;else el.textContent=text;
  });
}
function showScreen(name){
  document.getElementById('landingScreen').classList.toggle('hidden',name!=='landing');
  document.getElementById('resultsScreen').classList.toggle('hidden',name!=='results');
  document.getElementById('emptyScreen').classList.toggle('hidden',name!=='empty');
}
function showLoading(show){
  const overlay=document.getElementById('loadingOverlay');
  const btn=document.getElementById('searchBtn');
  if(overlay)overlay.classList.toggle('hidden',!show);
  if(btn){btn.disabled=show;btn.textContent=show?t('loading'):t('search_button');}
}
function showModal(show){
  const modal=document.getElementById('modalOverlay');
  if(modal)modal.classList.toggle('hidden',!show);
}
async function searchMedicines(query){
  console.log('Searching:',query);
  showLoading(true);
  try{
    const url=new URL(`${API_URL}/search`);
    url.searchParams.set('q',query);
    url.searchParams.set('lang',state.lang);
    const res=await fetch(url.toString());
    console.log('API:',res.status);
    if(!res.ok){showScreen('empty');return;}
    const data=await res.json();
    console.log('Data:',data);
    renderResults(data);
  }catch(e){
    console.error('Error:',e);
    showScreen('empty');
  }finally{
    showLoading(false);
  }
}
function renderResults(data){
  if(!data?.ok){showScreen('empty');return;}
  const total=(data.direct||[]).length+(data.others||[]).length+(data.similar_by_action||[]).length;
  if(total===0){showScreen('empty');return;}
  const count=document.getElementById('resultsCount');
  if(count)count.textContent=`«${state.query}» • ${total} результатов`;
  let html='';
  if(data.direct?.length){
    html+='<div class="results-block"><h3 class="block-title">'+t('block_direct')+'</h3>';
    data.direct.forEach(item=>html+=renderCard(item));
    html+='</div>';
  }
  if(data.others?.length){
    html+='<div class="results-block"><h3 class="block-title">'+t('block_others')+'</h3>';
    data.others.forEach(item=>html+=renderCard(item));
    html+='</div>';
  }
  const content=document.getElementById('resultsContent');
  if(content)content.innerHTML=html;
  showScreen('results');
}
function renderCard(item){
  const title=getTitle(item);
  const price=num(item.price);
  const pharmacy=clean(item['название аптеки']||item.pharmacy||'—');
  const url=clean(item.url)||'#';
  return `<div class="drug-card">
    <div class="drug-header">
      <div class="drug-info"><div class="drug-name">${title}</div></div>
      <div class="drug-price">${price?price.toFixed(2)+' ₾':'—'}</div>
    </div>
    <div class="pharmacy-info"><div class="pharmacy-name">${pharmacy}</div></div>
    <a href="${url}" target="_blank" class="pharmacy-link">${t('view_pharmacy')} ${pharmacy.toLowerCase()}.ge 🔗</a>
  </div>`;
}
function handleSearch(){
  const input=document.getElementById('searchInput');
  if(!input)return;
  const query=input.value.trim();
  if(!query)return;
  state.query=query;
  searchMedicines(query);
}
function init(){
  console.log('Farmago init');
  document.querySelectorAll('.lang-btn').forEach(btn=>{
    btn.onclick=()=>{
      state.lang=btn.dataset.lang;
      localStorage.setItem('farmago_lang',state.lang);
      setTimeout(() => updateUI(), 50);
      console.log('Language changed to:', state.lang);
    };
  });
  const searchBtn=document.getElementById('searchBtn');
  const searchInput=document.getElementById('searchInput');
  const backBtn=document.getElementById('backBtn');
  const infoBtn=document.getElementById('infoBtn');
  const modalClose=document.getElementById('modalClose');
  const modalOverlay=document.getElementById('modalOverlay');
  const newSearchBtn=document.getElementById('newSearchBtn');
  if(searchBtn)searchBtn.onclick=handleSearch;
  if(searchInput)searchInput.onkeypress=e=>{if(e.key==='Enter')handleSearch();};
  if(backBtn)backBtn.onclick=()=>showScreen('landing');
  if(infoBtn)infoBtn.onclick=()=>showModal(true);
  if(modalClose)modalClose.onclick=()=>showModal(false);
  if(modalOverlay)modalOverlay.onclick=e=>{if(e.target===modalOverlay)showModal(false);};
  if(newSearchBtn)newSearchBtn.onclick=()=>{if(searchInput)searchInput.value='';showScreen('landing');};
  // Ensure DOM is ready before updating UI
  setTimeout(() => {
    updateUI();
    console.log('UI updated with lang:', state.lang);
  }, 100);
  if(searchInput)searchInput.focus();
  // Popular drugs handler
  document.addEventListener('click',(e)=>{
    const item=e.target.closest('.popular-item');
    if(item){
      const query=item.dataset.query;
      if(query){handleSearch.query=query;if(searchInput)searchInput.value=query;handleSearch();}
    }
  });
}
document.addEventListener('DOMContentLoaded',init);