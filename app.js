// Register service worker for offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}

const q = (sel) => document.querySelector(sel);
const notesEl = q('#notes');
const titleEl = q('#title');
const contentEl = q('#content');
const saveBtn = q('#save');
const toggleBtn = q('#toggleComposer');
const composer = document.querySelector('.composer');

const KEY = 'pocket_notes_v1';

const COLORS = ['yellow','pink','mint','blue','lilac','peach','sage','sun','rose','sky'];

function loadNotes() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
function saveNotes(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

function niceRotation() { const deg = (Math.random() * 3.2 - 1.6).toFixed(2); return `${deg}deg`; }
function pickColor() { return COLORS[Math.floor(Math.random()*COLORS.length)]; }

function render() {
  const list = loadNotes().sort((a,b)=>b.created-a.created);
  notesEl.innerHTML = '';
  list.forEach((n) => {
    const card = document.createElement('div');
    const colorClass = `note-${n.color || 'yellow'}`;
    card.className = `card ${colorClass}`;
    card.style.setProperty('--note-rot', n.rot || '0deg');

    const grain = document.createElement('div');
    grain.className = 'grain';
    const dog = document.createElement('div');
    dog.className = 'dogear';

    const h3 = document.createElement('h3');
    h3.textContent = n.title || 'Без заглавие';

    const meta = document.createElement('div');
    meta.className = 'meta';
    const d = new Date(n.created);
    meta.textContent = d.toLocaleDateString();

    const p = document.createElement('p');
    p.textContent = n.content || '';

    const row = document.createElement('div');
    row.className = 'row';

    const del = document.createElement('button');
    del.className = 'icon-btn';
    del.setAttribute('aria-label','Изтрий');
    del.textContent = '×';
    del.onclick = () => {
      const all = loadNotes();
      const idx = all.findIndex(x => x.id === n.id);
      if (idx >= 0) { all.splice(idx, 1); saveNotes(all); render(); }
    };

    row.appendChild(del);
    card.append(h3, meta, p, row, grain, dog);
    notesEl.appendChild(card);
  });
}

saveBtn.onclick = () => {
  const t = titleEl.value.trim();
  const c = contentEl.value.trim();
  if (!t && !c) return;
  const list = loadNotes();
  const note = { 
    id: crypto.randomUUID(), 
    title: t, 
    content: c, 
    created: Date.now(),
    color: pickColor(),
    rot: niceRotation()
  };
  list.push(note);
  saveNotes(list);
  titleEl.value = ''; contentEl.value = '';
  render();
};

toggleBtn?.addEventListener('click', () => {
  composer.classList.toggle('hidden');
  if (!composer.classList.contains('hidden')) {
    setTimeout(() => { document.getElementById('title')?.focus(); }, 0);
  }
});

// Install prompt
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});
installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

render();
