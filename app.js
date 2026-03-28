
const ARABIC_BASMALA = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

const state = {
  data: null,
  arabicCache: new Map(),
  currentSurah: 1,
};

const els = {
  surahPicker: document.getElementById('surahPicker'),
  surahFilter: document.getElementById('surahFilter'),
  surahList: document.getElementById('surahList'),
  surahTitle: document.getElementById('surahTitle'),
  surahMeta: document.getElementById('surahMeta'),
  verses: document.getElementById('verses'),
  status: document.getElementById('status'),
  copyLinkBtn: document.getElementById('copyLinkBtn'),
  searchInput: document.getElementById('searchInput'),
  searchResults: document.getElementById('searchResults'),
};

function setStatus(message = '', show = false) {
  els.status.textContent = message;
  els.status.classList.toggle('show', show);
}

async function loadData() {
  const response = await fetch('./data/translation.json');
  if (!response.ok) throw new Error('Unable to load translation data.');
  state.data = await response.json();
}

function buildSurahControls() {
  const fragment = document.createDocumentFragment();
  state.data.surahs.forEach((surah) => {
    const option = document.createElement('option');
    option.value = String(surah.number);
    option.textContent = `${surah.number}. ${surah.name}`;
    fragment.appendChild(option);
  });
  els.surahPicker.appendChild(fragment);
  renderSurahList();
}

function renderSurahList(filter = '') {
  const query = filter.trim().toLowerCase();
  els.surahList.innerHTML = '';
  const list = state.data.surahs.filter((surah) => {
    const fullName = `${surah.name} ${surah.meaning}`.toLowerCase();
    return !query || fullName.includes(query) || String(surah.number) === query;
  });

  list.forEach((surah) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'surah-button' + (surah.number === state.currentSurah ? ' active' : '');
    button.innerHTML = `
      <span class="surah-button-title">${surah.number}. ${surah.name}</span>
      <span class="surah-button-meta">${surah.meaning}, ${surah.verses.length} verses</span>
    `;
    button.addEventListener('click', () => {
      selectSurah(surah.number, true);
      window.location.hash = `read-${surah.number}`;
    });
    els.surahList.appendChild(button);
  });
}

async function fetchArabicSurah(number) {
  if (state.arabicCache.has(number)) return state.arabicCache.get(number);

  const url = `https://api.alquran.cloud/v1/surah/${number}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load Arabic text from the Qur\'an API.');
  const payload = await response.json();
  const ayahs = payload?.data?.ayahs || [];
  state.arabicCache.set(number, ayahs);
  return ayahs;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function createBasmalaCard(english) {
  const article = document.createElement('article');
  article.className = 'verse-card basmala-card';
  article.innerHTML = `
    <div class="verse-number">B</div>
    <p class="basmala-arabic">${ARABIC_BASMALA}</p>
    <p class="basmala-english">${escapeHtml(english)}</p>
  `;
  return article;
}

function createVerseCard(verseNumber, arabic, english) {
  const article = document.createElement('article');
  article.className = 'verse-card';
  article.id = `ayah-${state.currentSurah}-${verseNumber}`;
  article.innerHTML = `
    <div class="verse-number">${verseNumber}</div>
    <p class="arabic-text">${escapeHtml(arabic || '')}</p>
    <p class="english-text">${escapeHtml(english)}</p>
  `;
  return article;
}

async function selectSurah(number, scrollIntoView = false) {
  state.currentSurah = Number(number);
  els.surahPicker.value = String(number);
  renderSurahList(els.surahFilter.value);

  const surah = state.data.surahs.find((item) => item.number === state.currentSurah);
  els.surahTitle.textContent = `${surah.number}. ${surah.name}`;
  els.surahMeta.textContent = `${surah.meaning} • ${surah.verses.length} verses • Translated by ${state.data.translator}`;
  els.verses.innerHTML = '';
  setStatus('Loading Arabic text...', true);

  let arabicAyahs = [];
  try {
    arabicAyahs = await fetchArabicSurah(state.currentSurah);
    setStatus('', false);
  } catch (error) {
    console.error(error);
    setStatus('Arabic text could not be loaded just now. The English manuscript is still available below.', true);
  }

  if (surah.preface && surah.preface.length) {
    surah.preface.forEach((line) => {
      els.verses.appendChild(createBasmalaCard(line));
    });
  }

  surah.verses.forEach((verse, index) => {
    const arabic = arabicAyahs[index]?.text || '';
    els.verses.appendChild(createVerseCard(verse.number, arabic, verse.text));
  });

  const params = new URLSearchParams(window.location.search);
  const ayahParam = params.get('ayah');
  if (scrollIntoView && ayahParam) {
    const target = document.getElementById(`ayah-${state.currentSurah}-${ayahParam}`);
    if (target) target.scrollIntoView({ behaviour: 'smooth', block: 'start' });
  }
}

function highlightMatch(text, query) {
  if (!query) return escapeHtml(text);
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'ig');
  return escapeHtml(text).replace(regex, '<mark>$1</mark>');
}

function runSearch(query) {
  const term = query.trim();
  els.searchResults.innerHTML = '';

  if (!term) return;

  const results = [];
  for (const surah of state.data.surahs) {
    for (const verse of surah.verses) {
      if (verse.text.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          surahNumber: surah.number,
          surahName: surah.name,
          verseNumber: verse.number,
          text: verse.text,
        });
      }
    }
  }

  if (!results.length) {
    els.searchResults.innerHTML = '<div class="search-result"><div class="search-result-title">No matches found</div><div class="search-result-snippet">Try a shorter word or another spelling.</div></div>';
    return;
  }

  results.slice(0, 120).forEach((result) => {
    const article = document.createElement('article');
    article.className = 'search-result';
    article.innerHTML = `
      <a href="?surah=${result.surahNumber}&ayah=${result.verseNumber}#read">
        <div class="search-result-title">${result.surahNumber}:${result.verseNumber} • ${result.surahName}</div>
        <div class="search-result-snippet">${highlightMatch(result.text, term)}</div>
      </a>
    `;
    els.searchResults.appendChild(article);
  });
}

function copyCurrentLink() {
  const url = new URL(window.location.href);
  url.searchParams.set('surah', String(state.currentSurah));
  url.hash = 'read';
  navigator.clipboard.writeText(url.toString()).then(() => {
    const original = els.copyLinkBtn.textContent;
    els.copyLinkBtn.textContent = 'Link copied';
    setTimeout(() => {
      els.copyLinkBtn.textContent = original;
    }, 1400);
  });
}

function applyUrlState() {
  const params = new URLSearchParams(window.location.search);
  const surah = Number(params.get('surah') || window.location.hash.replace('#read-', '') || 1);
  if (Number.isFinite(surah) && surah >= 1 && surah <= 114) {
    state.currentSurah = surah;
  }
}

async function init() {
  try {
    await loadData();
    buildSurahControls();
    applyUrlState();
    await selectSurah(state.currentSurah);
  } catch (error) {
    console.error(error);
    setStatus('The website files could not be loaded. Please check that all files are in the repository.', true);
  }

  els.surahPicker.addEventListener('change', async (event) => {
    const number = Number(event.target.value);
    const url = new URL(window.location.href);
    url.searchParams.set('surah', String(number));
    history.replaceState({}, '', url);
    await selectSurah(number);
  });

  els.surahFilter.addEventListener('input', (event) => {
    renderSurahList(event.target.value);
  });

  els.searchInput.addEventListener('input', (event) => {
    runSearch(event.target.value);
  });

  els.copyLinkBtn.addEventListener('click', copyCurrentLink);
}

init();
