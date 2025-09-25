const API_URL = 'https://farmago-web-api.onrender.com';
const resultsEl = document.getElementById('results');
const qEl = document.getElementById('q');

const fmtItem = (r) => {
  const name = r.title || r.name || r.title_russian || r.title_english || 'Без названия';
  const price = (r.price != null) ? `${r.price} ₾` : '—';
  const pharm = r['название аптеки'] || r.pharmacy || r.pharmacy_code || '';
  const url = r.url || '#';
  return `
    <div class="item">
      <div><a href="${url}" target="_blank" rel="noopener">${name}</a></div>
      <div class="muted">${price} · ${pharm}</div>
    </div>`;
};

const render = (payload) => {
  if (!payload?.ok) {
    resultsEl.innerHTML = `<div class="item">${payload?.message || 'Ошибка. Попробуйте позже.'}</div>`;
    return;
  }
  const block = (title, arr) => arr?.length
    ? `<div class="section"><div class="title">${title}</div>${arr.map(fmtItem).join('')}</div>`
    : '';
  const html = [
    block('Наиболее подходящие', payload.direct),
    block('Похожие по действию', payload.similar_by_action),
    block('Другие предложения', payload.others),
    `<div class="disc">${payload.disclaimer || ''}</div>`
  ].join('');
  resultsEl.innerHTML = html || `<div class="item">Ничего не найдено</div>`;
};

let t = null;
const search = async (q) => {
  if (!q.trim()) { resultsEl.innerHTML = ''; return; }
  try {
    const p = new URL(`${API_URL}/search`);
    p.searchParams.set('q', q);
    p.searchParams.set('lang', 'ru');
    const res = await fetch(p.toString(), { method: 'GET' });
    if (res.status === 429) return render({ ok:false, message:'Слишком много запросов. Попробуйте позже.' });
    if (!res.ok) return render({ ok:false, message:'Сервис временно недоступен. Попробуйте позже.' });
    const data = await res.json();
    render(data);
  } catch {
    render({ ok:false, message:'Сеть недоступна. Повторите попытку.' });
  }
};

qEl.addEventListener('input', () => {
  clearTimeout(t);
  t = setTimeout(() => search(qEl.value), 350);
});
// bump 2025-09-25T19:19:48Z
