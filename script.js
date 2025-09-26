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
