/* ============================================================
   PUSULA — Ajanda / Not defteri
   Tüm veriler localStorage üzerinde tutulur. Harici bağımlılık yok.
   ============================================================ */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const trLower = s => String(s).toLocaleLowerCase('tr-TR');
  const STORAGE_KEY = 'pusula.ajanda.v1';
  const PALETTE = ['#d4654a', '#66856f', '#c9903f', '#7d7bc4', '#4e93a8', '#c46d94'];
  const WEEKDAYS = ['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma', 'cumartesi', 'pazar'];
  const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const SHORT_DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  /* ---------- Tarih yardımcıları ---------- */
  const dstr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const fromStr = s => { if (!s) return null; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const TODAY = () => dstr(today());
  const mondayOf = d => addDays(d, -((d.getDay() + 6) % 7));
  function niceDate(s) {
    if (!s) return '';
    const d = fromStr(s), t = today();
    const diff = Math.round((d - t) / 86400000);
    if (diff === 0) return 'Bugün';
    if (diff === 1) return 'Yarın';
    if (diff === -1) return 'Dün';
    if (diff > 1 && diff < 7) return WEEKDAYS[(d.getDay() + 6) % 7].charAt(0).toLocaleUpperCase('tr-TR') + WEEKDAYS[(d.getDay() + 6) % 7].slice(1);
    return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  }
  function longDate(d) {
    return `${WEEKDAYS[(d.getDay() + 6) % 7].charAt(0).toLocaleUpperCase('tr-TR') + WEEKDAYS[(d.getDay() + 6) % 7].slice(1)}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  /* ---------- Varsayılan / örnek veri ---------- */
  function seed() {
    const p1 = uid(), p2 = uid(), p3 = uid();
    const T = TODAY(), t = today();
    const date = n => dstr(addDays(t, n));
    const task = (title, o = {}) => ({ id: uid(), title, notes: '', done: false, due: null, time: '', priority: 0, tags: [], projectId: null, order: Date.now() + Math.random(), createdAt: new Date().toISOString(), completedAt: null, ...o });
    return {
      tasks: [
        task('Q4 sunumunu hazırla', { due: date(1), time: '15:00', priority: 1, projectId: p1, tags: ['iş', 'sunum'], notes: 'Slaytları gözden geçir, grafikleri güncelle.' }),
        task('Sabah koşusu · 5 km', { due: T, time: '18:30', priority: 2, tags: ['sağlık'] }),
        task('Market alışverişi', { due: T, tags: ['ev'] }),
        task('Ekip toplantısı notlarını gönder', { due: date(-1), priority: 1, projectId: p1, tags: ['iş'] }),
        task('Diş randevusu', { due: date(3), time: '10:30', tags: ['sağlık'] }),
        task('Kitabın 4. bölümünü oku', { due: date(1), tags: ['gelişim'] }),
        task('Bütçe tablosunu güncelle', { due: date(5), projectId: p2, tags: ['iş', 'finans'] }),
        task('Yoga seansı', { due: T, done: true, completedAt: new Date().toISOString(), tags: ['sağlık'] }),
        task('Haftalık planı gözden geçir', { projectId: p3, tags: ['planlama'] })
      ],
      notes: [
        { id: uid(), title: 'Haftanın planı', body: 'Pazartesi · Q4 sunumu taslağı\nSalı · Ekip geri bildirimleri\nÇarşamba · Koşu + yoga\n\nÖncelik: sunumu zamanında bitirmek.', color: '#d4654a', pinned: true, updatedAt: new Date().toISOString() },
        { id: uid(), title: 'Aklıma gelen fikirler', body: '• Sabah 20 dakikalık günlük ritüeli\n• Haftalık gözden geçirme şablonu\n• Okuma listesini küçült, odaklan', color: '#c9903f', pinned: false, updatedAt: new Date().toISOString() },
        { id: uid(), title: 'Okuma listesi', body: '1. Derin Çalışma\n2. Atomik Alışkanlıklar\n3. İyi Bir Günün Sırrı', color: '#66856f', pinned: false, updatedAt: new Date().toISOString() }
      ],
      dayNotes: { [T]: 'Ajandayı bugün düzenledim. Yarın sunumu bitirmeyi hedefle.' },
      projects: [
        { id: p1, name: 'Çalışma', color: '#7d7bc4' },
        { id: p2, name: 'Finans', color: '#4e93a8' },
        { id: p3, name: 'Kişisel', color: '#66856f' }
      ],
      settings: { theme: 'light', showDone: false, sort: 'manual', seeded: true }
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return seed();
      const parsed = JSON.parse(raw);
      return {
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
        dayNotes: (parsed.dayNotes && typeof parsed.dayNotes === 'object' && !Array.isArray(parsed.dayNotes)) ? parsed.dayNotes : {},
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        settings: Object.assign({ theme: 'light', showDone: false, sort: 'manual' }, parsed.settings || {})
      };
    } catch (e) { console.warn('Veri okunamadı, örnek veri kullanılıyor.', e); return seed(); }
  }

  let state = load();
  const ui = { view: 'today', selectedDate: null, journalDate: TODAY(), query: '', calMonth: new Date(), modalCleanup: null };
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { toast('Kaydedilemedi: depolama dolu olabilir.'); } };

  /* ---------- Bildirimler ---------- */
  function toast(message, actionLabel, action) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="toast-dot"></span><span>${esc(message)}</span>${actionLabel ? `<button class="text-btn" style="color:inherit;margin-left:6px">${esc(actionLabel)}</button>` : ''}`;
    $('#toastStack').appendChild(el);
    const kill = () => { el.classList.add('out'); setTimeout(() => el.remove(), 250); };
    if (actionLabel) $('button', el).onclick = () => { action(); kill(); };
    setTimeout(kill, actionLabel ? 5000 : 2800);
  }

  /* ---------- Doğal dil ayrıştırma ---------- */
  function parseQuickAdd(raw) {
    let s = String(raw).trim();
    let due = null, time = '', priority = 0, tags = [], projectId = null;

    s = s.replace(/(?:^|\s)!([1-3])(?=\s|$)/gu, (_, p) => { priority = Number(p); return ' '; });
    s = s.replace(/(?:^|\s)#([^\s#!@]+)/gu, (_, t) => { const v = trLower(t).replace(/^[,.]+|[,.]+$/g, ''); if (v) tags.push(v); return ' '; });
    s = s.replace(/(?:^|\s)@([^\s#!@]+)/gu, (_, name) => {
      const n = trLower(name);
      const p = state.projects.find(x => trLower(x.name) === n) || state.projects.find(x => trLower(x.name).startsWith(n));
      if (p) projectId = p.id;
      else toast(`“${name}” projesi bulunamadı, görev yine de eklendi.`);
      return ' ';
    });
    s = s.replace(/(?:^|\s)(?:saat\s*)?(\d{1,2}):(\d{2})(?=\s|$)/gu, (_, h, m) => { if (+h < 24 && +m < 60) time = `${String(+h).padStart(2, '0')}:${m}`; return ' '; });
    s = s.replace(/(?:^|\s)saat\s+(\d{1,2})(?=\s|$)/gu, (_, h) => { if (+h < 24) time = `${String(+h).padStart(2, '0')}:00`; return ' '; });

    const setNextWeekday = (name, extra = 0) => {
      const idx = WEEKDAYS.indexOf(trLower(name));
      if (idx < 0) return false;
      const t = today();
      let diff = (idx - ((t.getDay() + 6) % 7) + 7) % 7;
      if (diff === 0) diff = 7;
      due = dstr(addDays(t, diff + extra));
      return true;
    };
    const datePatterns = [
      [/\böbür gün\b/gu, () => { due = dstr(addDays(today(), 2)); }],
      [/\bbugün\b/gu, () => { due = TODAY(); }],
      [/\byarın\b/gu, () => { due = dstr(addDays(today(), 1)); }],
      [/\bhaftaya\s+(pazartesi|salı|çarşamba|perşembe|cuma|cumartesi|pazar)\b/gu, (_, d) => { setNextWeekday(d, 7); }],
      [/\bgelecek\s+(pazartesi|salı|çarşamba|perşembe|cuma|cumartesi|pazar)\b/gu, (_, d) => { setNextWeekday(d, 7); }],
      [/\b(\d{1,2})\s*gün\s*sonra\b/gu, (_, n) => { due = dstr(addDays(today(), Math.min(+n, 365))); }],
      [/\b(?:bu\s+)?(pazartesi|salı|çarşamba|perşembe|cuma|cumartesi|pazar)\b/gu, (_, d) => { setNextWeekday(d); }],
      [/\bhaftaya\b/gu, () => { due = dstr(addDays(today(), 7)); }]
    ];
    for (const [re, fn] of datePatterns) {
      s = s.replace(re, (...args) => { if (!due) fn(...args); return ' '; });
    }
    s = s.replace(/\s+/g, ' ').replace(/^[\s,·–—-]+|[\s,·–—-]+$/g, '').trim();
    return { title: s || String(raw).trim(), due, time, priority, tags: [...new Set(tags)], projectId };
  }

  /* ---------- Filtreleme & sıralama ---------- */
  const isOverdue = t => t.due && t.due < TODAY() && !t.done;
  function viewTasks() {
    const T = TODAY(), q = trLower(ui.query.trim());
    let list = state.tasks.filter(t => {
      switch (ui.view) {
        case 'today': return !t.done && (t.due === T || isOverdue(t));
        case 'upcoming': return !t.done && t.due && t.due > T && t.due <= dstr(addDays(today(), 30));
        case 'date': return t.due === ui.selectedDate;
        case 'completed': return t.done;
        case 'all': return true;
        case 'notes': return false;
        default:
          if (ui.view.startsWith('project:')) return t.projectId === ui.view.slice(8);
          if (ui.view.startsWith('tag:')) return t.tags.includes(ui.view.slice(4));
          return true;
      }
    });
    if (q) list = list.filter(t => trLower(`${t.title} ${t.notes || ''} ${(t.tags || []).join(' ')}`).includes(q));
    if (!state.settings.showDone && ui.view !== 'completed') list = list.filter(t => !t.done);

    const sort = state.settings.sort;
    if (sort === 'date') list.sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999') || (a.time || '').localeCompare(b.time || ''));
    else if (sort === 'priority') list.sort((a, b) => (b.priority - a.priority) || (a.due || '9999').localeCompare(b.due || '9999'));
    else if (sort === 'alpha') list.sort((a, b) => trLower(a.title).localeCompare(trLower(b.title), 'tr'));
    else list.sort((a, b) => (a.order || 0) - (b.order || 0));
    return list;
  }

  function groupTasks(list) {
    const groups = [];
    const add = (label, arr) => { if (arr.length) groups.push({ label, items: arr }); };
    if (ui.view === 'today') {
      add('Gecikmiş', list.filter(isOverdue));
      add('Bugün', list.filter(t => !isOverdue(t) && t.due === TODAY()));
      add('Tarihsiz', list.filter(t => !t.due));
    } else if (ui.view === 'upcoming' || ui.view === 'date') {
      const by = new Map();
      list.forEach(t => { const k = t.due || 'Tarihsiz'; if (!by.has(k)) by.set(k, []); by.get(k).push(t); });
      [...by.entries()].sort((a, b) => a[0].localeCompare(b[0])).forEach(([k, v]) => add(k === 'Tarihsiz' ? k : niceDate(k), v));
    } else if (ui.view === 'completed') add('Tamamlananlar', list);
    else if (state.settings.sort === 'date') {
      const by = new Map();
      list.forEach(t => { const k = t.due || 'Tarihsiz'; if (!by.has(k)) by.set(k, []); by.get(k).push(t); });
      [...by.entries()].sort((a, b) => a[0].localeCompare(b[0])).forEach(([k, v]) => add(k === 'Tarihsiz' ? k : niceDate(k), v));
    } else add('Yapılacaklar', list);
    return groups;
  }

  /* ---------- Render: sidebar ---------- */
  function renderSidebar() {
    const T = TODAY();
    const counts = {
      today: state.tasks.filter(t => !t.done && (t.due === T || isOverdue(t))).length,
      upcoming: state.tasks.filter(t => !t.done && t.due > T).length,
      all: state.tasks.filter(t => !t.done).length,
      completed: state.tasks.filter(t => t.done).length,
      notes: state.notes.length,
      journal: Object.keys(state.dayNotes || {}).filter(d => String(state.dayNotes[d]).trim()).length
    };
    $$('[data-count]').forEach(el => { el.textContent = counts[el.dataset.count] ?? ''; });
    const activeView = ui.view === 'date' ? 'calendar' : ui.view;
    $$('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === ui.view));
    $$('.bottom-tab').forEach(el => el.classList.toggle('active', el.dataset.view === activeView));
    $$('.sub-item').forEach(el => el.classList.toggle('active', el.dataset.view === ui.view));

    $('#projectList').innerHTML = state.projects.length ? state.projects.map(p => `
      <div class="sub-item ${ui.view === 'project:' + p.id ? 'active' : ''}" data-view="project:${p.id}" role="button" tabindex="0">
        <span class="dot" style="background:${esc(p.color)}"></span><span>${esc(p.name)}</span>
        <span class="sub-count">${state.tasks.filter(t => t.projectId === p.id && !t.done).length}</span>
        <button class="sub-menu" data-project-menu="${p.id}" title="Düzenle">⋯</button>
      </div>`).join('') : '<div class="sub-empty">Henüz proje yok</div>';

    const tags = [...new Set(state.tasks.flatMap(t => t.tags || []))].sort((a, b) => a.localeCompare(b, 'tr'));
    $('#tagList').innerHTML = tags.length ? tags.slice(0, 12).map(tag => `
      <button class="sub-item ${ui.view === 'tag:' + tag ? 'active' : ''}" data-view="tag:${esc(tag)}">
        <span class="dot" style="background:var(--sage)"></span><span>#${esc(tag)}</span>
        <span class="sub-count">${state.tasks.filter(t => (t.tags || []).includes(tag) && !t.done).length}</span>
      </button>`).join('') : '<div class="sub-empty">Etiket eklediğinde burada görünür</div>';
  }

  /* ---------- Render: başlık & özet ---------- */
  function renderHeader() {
    const titles = {
      today: ['Bugün', longDate(today())],
      upcoming: ['Yaklaşan', 'Önümüzdeki 30 gün planların'],
      all: ['Tüm görevler', 'Her şey tek listede'],
      completed: ['Tamamlananlar', 'Hallettiğin işler'],
      journal: ['Günlük notlar', 'Her günü kendi notuyla hatırla'],
      notes: ['Notlar', 'Aklına gelenleri yakala'],
      calendar: ['Takvim', 'Aya yayılımını gör']
    };
    let title, sub;
    if (ui.view.startsWith('project:')) {
      const p = state.projects.find(x => x.id === ui.view.slice(8));
      title = p ? p.name : 'Proje'; sub = 'Projeye ait görevler';
    } else if (ui.view.startsWith('tag:')) {
      title = '#' + ui.view.slice(4); sub = 'Etikete göre filtrelendi';
    } else if (ui.view === 'date') {
      const d = fromStr(ui.selectedDate);
      title = niceDate(ui.selectedDate); sub = d ? longDate(d) : '';
    } else [title, sub] = titles[ui.view] || ['Bugün', ''];
    $('#viewTitle').textContent = title;
    $('#viewSubtitle').textContent = ui.query ? `“${ui.query}” için sonuçlar` : sub;
  }

  function renderOverview() {
    const T = TODAY();
    const todays = state.tasks.filter(t => t.due === T || isOverdue(t));
    const done = todays.filter(t => t.done).length;
    const pct = todays.length ? Math.round(done / todays.length * 100) : 0;
    const h = new Date().getHours();
    $('#greeting').textContent = h < 11 ? 'Günaydın.' : h < 18 ? 'İyi günler.' : 'İyi akşamlar.';
    $('#todayEyebrow').textContent = longDate(today()).toLocaleUpperCase('tr-TR');
    $('#overviewText').textContent = todays.length
      ? `${todays.length - done} planın seni bekliyor. Küçük adımlar büyük fark yaratır.`
      : 'Bugün için planın yok. Dilersen yeni bir şey ekleyebilirsin.';
    $('#overviewProgress').style.width = pct + '%';
    $('#ringFg').style.strokeDashoffset = String(314 - 314 * pct / 100);
    $('#ringPercent').textContent = pct + '%';
    $('#overviewStats').innerHTML = `
      <div class="stat"><strong>${todays.length - done}</strong><span>kalan</span></div>
      <div class="stat"><strong>${done}</strong><span>tamamlanan</span></div>
      <div class="stat"><strong>${todays.filter(t => t.priority === 1 && !t.done).length}</strong><span>öncelikli</span></div>`;

    const monday = mondayOf(today());
    $('#weekStrip').innerHTML = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(monday, i), ds = dstr(d);
      const tasks = state.tasks.filter(t => t.due === ds);
      return `<button class="day-card ${ds === T ? 'today' : ''} ${ui.view === 'date' && ui.selectedDate === ds ? 'selected' : ''}" data-date="${ds}">
        <span class="day-name">${SHORT_DAYS[i]}</span>
        <span class="day-num">${d.getDate()}</span>
        <span class="day-dots">${tasks.slice(0, 3).map(t => `<i class="${t.done ? 'done' : ''}"></i>`).join('')}</span>
      </button>`;
    }).join('');
  }

  /* ---------- Render: görevler ---------- */
  function taskRow(t) {
    const p = state.projects.find(x => x.id === t.projectId);
    const overdue = isOverdue(t);
    const pr = ['', 'Yüksek', 'Orta', 'Düşük'][t.priority] || '';
    return `<div class="task-row ${t.done ? 'is-done' : ''}" data-id="${t.id}" draggable="true">
      <label class="check" title="Tamamla">
        <input type="checkbox" ${t.done ? 'checked' : ''} data-act="toggle" aria-label="Tamamla" />
        <span class="check-box"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg></span>
      </label>
      <div class="task-main" data-act="edit" title="Ayrıntıları aç">
        <div class="task-title">${esc(t.title)}</div>
        <div class="task-meta">
          ${t.due ? `<span class="meta date ${overdue ? 'overdue' : ''}">${overdue ? '⚠ ' : '◷ '}${esc(niceDate(t.due))}${t.time ? ' · ' + esc(t.time) : ''}</span>` : ''}
          ${t.priority ? `<span class="meta priority-${t.priority}">🚩 ${pr}</span>` : ''}
          ${p ? `<span class="meta project" style="color:${esc(p.color)}">◈ ${esc(p.name)}</span>` : ''}
          ${(t.tags || []).map(tag => `<span class="meta tag">#${esc(tag)}</span>`).join('')}
          ${t.notes ? '<span class="meta notes-indicator">✎ not</span>' : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-btn drag-handle" title="Sürükleyerek sırala" data-act="drag"><svg viewBox="0 0 24 24"><circle cx="9" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1" fill="currentColor" stroke="none"/></svg></button>
        <button class="icon-btn" title="Düzenle" data-act="edit"><svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg></button>
        <button class="icon-btn del" title="Sil" data-act="delete"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></svg></button>
      </div>
    </div>`;
  }

  function renderTasks() {
    const list = viewTasks();
    const groups = groupTasks(list);
    $('#listCount').textContent = `${list.length} görev`;
    $('#listHeading').textContent = ui.query ? 'Arama sonuçları' : ({ today: 'Bugünkü planlar', upcoming: 'Yaklaşan planlar', all: 'Tüm görevler', completed: 'Tamamlananlar', notes: 'Notlar', calendar: 'Takvim' })[ui.view] ||
      (ui.view.startsWith('project:') ? 'Proje görevleri' : ui.view.startsWith('tag:') ? 'Etiketli görevler' : 'Görevler');
    $('#taskList').innerHTML = groups.map(g => `<div class="task-group-label">${esc(g.label)}</div>${g.items.map(taskRow).join('')}`).join('');
    $('#toggleDoneBtn').textContent = state.settings.showDone ? 'Tamamlananları gizle' : 'Tamamlananları göster';
    $('#clearDoneBtn').classList.toggle('hidden', !state.tasks.some(t => t.done));
    const isTaskView = !['notes', 'calendar', 'journal'].includes(ui.view);
    $('#taskSection').classList.toggle('hidden', !isTaskView);
    $('#calendarSection').classList.toggle('hidden', ui.view !== 'calendar');
    $('#notesSection').classList.toggle('hidden', ui.view !== 'notes');
    $('#journalSection').classList.toggle('hidden', ui.view !== 'journal');
    $('#overview').classList.toggle('hidden', ui.view !== 'today');
    $('#mobileAddBar').classList.toggle('hidden', !isTaskView);

    const showDaily = ui.view === 'today' || ui.view === 'date';
    $('#dailyQuick').classList.toggle('hidden', !showDaily);
    if (showDaily) {
      const key = ui.view === 'date' ? ui.selectedDate : TODAY();
      $('#dailyQuickTitle').textContent = ui.view === 'date' ? `${niceDate(key)} notu` : 'Bugünün notu';
      if (document.activeElement !== $('#dailyNoteText')) $('#dailyNoteText').value = (state.dayNotes || {})[key] || '';
      $('#dailyStatus').textContent = 'Otomatik kaydedilir';
    }

    $('#emptyState').classList.toggle('hidden', !isTaskView || list.length > 0);
    if (isTaskView && !list.length) {
      const searching = !!ui.query.trim();
      $('#emptyTitle').textContent = searching ? 'Sonuç bulunamadı' : ui.view === 'completed' ? 'Henüz tamamlanan yok' : 'Burada her şey tamam';
      $('#emptyText').textContent = searching ? 'Farklı bir kelime deneyebilirsin.' :
        ui.view === 'completed' ? 'Görevleri tamamladıkça burada birikecek.' : 'Yeni bir görev ekleyerek devam edebilirsin.';
      $('#emptyAction').textContent = searching ? 'Aramayı temizle' : '+ Görev ekle';
    }
    if (ui.view === 'calendar') renderCalendar();
    if (ui.view === 'notes') renderNotes();
    if (ui.view === 'journal') renderJournal();
  }

  function renderJournal() {
    const entries = Object.entries(state.dayNotes || {})
      .filter(([, text]) => String(text || '').trim())
      .sort((a, b) => b[0].localeCompare(a[0]));
    $('#journalCount').textContent = `${entries.length} gün`;
    $('#journalDate').value = ui.journalDate;
    if (document.activeElement !== $('#journalText')) $('#journalText').value = (state.dayNotes || {})[ui.journalDate] || '';
    $('#journalList').innerHTML = entries.length ? entries.map(([date, text]) => `
      <button class="journal-entry ${date === ui.journalDate ? 'active' : ''}" data-journal-date="${date}">
        <strong>${esc(niceDate(date))} · ${esc(date)}</strong>
        <span>${esc(String(text).replace(/\s+/g, ' ').slice(0, 90))}</span>
      </button>`).join('') : '<div class="sub-empty">Henüz günlük not yok. Yukarıdan yazmaya başlayabilirsin.</div>';
  }

  function commitDaily(date, text, statusEl, refreshList) {
    if (!date) return;
    if (String(text).trim()) state.dayNotes[date] = text;
    else delete state.dayNotes[date];
    save();
    renderSidebar();
    if (statusEl) statusEl.textContent = 'Kaydedildi ✓';
    if (refreshList && ui.view === 'journal') renderJournal();
  }

  function bindDaily(el, getDate, statusEl, refreshList) {
    if (!el) return;
    let timer = null;
    const commit = () => {
      clearTimeout(timer); timer = null;
      commitDaily(getDate(), el.value, statusEl, refreshList);
    };
    el.addEventListener('input', () => {
      if (statusEl) statusEl.textContent = 'Yazılıyor…';
      clearTimeout(timer);
      timer = setTimeout(commit, 400);
    });
    el.addEventListener('blur', commit);
  }

  /* ---------- Render: takvim ---------- */
  function renderCalendar() {
    const m = ui.calMonth;
    $('#calendarTitle').textContent = `${MONTHS[m.getMonth()]} ${m.getFullYear()}`;
    const first = new Date(m.getFullYear(), m.getMonth(), 1);
    const start = mondayOf(first);
    const T = TODAY();
    let html = SHORT_DAYS.map(d => `<div class="cal-weekday">${d}</div>`).join('');
    for (let i = 0; i < 42; i++) {
      const d = addDays(start, i), ds = dstr(d);
      const events = state.tasks.filter(t => t.due === ds);
      html += `<div class="cal-cell ${d.getMonth() !== m.getMonth() ? 'muted' : ''} ${ds === T ? 'today' : ''} ${ui.view === 'date' && ui.selectedDate === ds ? 'selected' : ''}" data-date="${ds}">
        <div class="cal-date">${d.getDate()}</div>
        <div class="cal-events">${events.slice(0, 3).map(t => `<div class="cal-event ${t.done ? 'done' : ''}">${esc(t.title)}</div>`).join('')}${events.length > 3 ? `<div class="cal-event">+${events.length - 3} daha</div>` : ''}</div>
        <div class="cal-dots">${events.slice(0, 5).map(t => `<i class="${t.done ? 'done' : ''}"></i>`).join('')}</div>
      </div>`;
    }
    $('#calendarGrid').innerHTML = html;
  }

  /* ---------- Render: notlar ---------- */
  function renderNotes() {
    const q = trLower(ui.query.trim());
    let notes = [...state.notes].filter(n => !q || trLower(`${n.title} ${n.body}`).includes(q));
    notes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    $('#notesCount').textContent = `${notes.length} not`;
    $('#notesGrid').innerHTML = notes.length ? notes.map(n => `
      <article class="note-card" style="--note-color:${esc(n.color || '#d4654a')}" data-id="${n.id}">
        ${n.pinned ? '<span class="note-pin" title="Sabitlendi">★</span>' : ''}
        <h3>${esc(n.title || 'İsimsiz not')}</h3>
        <p>${esc(n.body || '')}</p>
        <div class="note-date">${new Date(n.updatedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <div class="note-card-actions">
          <button class="icon-btn" data-note-act="pin" title="Sabitle">★</button>
          <button class="icon-btn" data-note-act="edit" title="Düzenle"><svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg></button>
          <button class="icon-btn del" data-note-act="delete" title="Sil"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/></svg></button>
        </div>
      </article>`).join('') : '<div class="empty-state" style="grid-column:1/-1;padding:40px 0"><h3>Not yok</h3><p>İlk notunu oluşturarak başlayabilirsin.</p><button class="primary-small" id="inlineNewNote">+ Yeni not</button></div>';
    const inline = $('#inlineNewNote'); if (inline) inline.onclick = openNoteModal;
  }

  function render() {
    document.body.dataset.theme = state.settings.theme;
    document.body.classList.toggle('dark', state.settings.theme === 'dark');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = state.settings.theme === 'dark' ? '#17191d' : '#d4654a';
    $('#themeLabel').textContent = state.settings.theme === 'dark' ? 'Açık tema' : 'Koyu tema';
    $('#themeIcon').textContent = state.settings.theme === 'dark' ? '☀' : '☾';
    renderSidebar(); renderHeader(); renderOverview(); renderTasks();
  }

  /* ---------- Modal altyapısı ---------- */
  function openModal(title, html, onMount) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = html;
    $('#modalBackdrop').classList.remove('hidden');
    ui.modalCleanup = onMount || null;
    if (onMount) onMount();
    const first = $('#modalBody input, #modalBody textarea');
    if (first) setTimeout(() => first.focus(), 60);
  }
  function closeModal() {
    $('#modalBackdrop').classList.add('hidden');
    $('#modalBody').innerHTML = '';
    ui.modalCleanup = null;
  }

  function openTaskModal(id) {
    const t = id ? state.tasks.find(x => x.id === id) : null;
    const opts = state.projects.map(p => `<option value="${p.id}" ${t && t.projectId === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
    openModal(t ? 'Görevi düzenle' : 'Yeni görev', `
      <div class="field"><label>Başlık</label><input type="text" id="fTitle" value="${esc(t ? t.title : '')}" placeholder="Ne yapmak istiyorsun?" /></div>
      <div class="field"><label>Notlar</label><textarea id="fNotes" placeholder="Ayrıntılar, bağlantılar, hatırlatmalar…">${esc(t ? t.notes : '')}</textarea></div>
      <div class="field-row">
        <div class="field"><label>Tarih</label><input type="date" id="fDue" value="${esc(t ? t.due || '' : (ui.view === 'date' ? ui.selectedDate : ''))}" /></div>
        <div class="field"><label>Saat</label><input type="time" id="fTime" value="${esc(t ? t.time || '' : '')}" /></div>
      </div>
      <div class="field"><label>Öncelik</label>
        <div class="priority-picker" id="fPriority">
          ${[0, 3, 2, 1].map(p => `<button type="button" class="priority-opt ${(t ? t.priority : 0) === p ? 'active' : ''}" data-p="${p}">${['Yok', 'Düşük', 'Orta', 'Yüksek'][p]}</button>`).join('')}
        </div>
      </div>
      <div class="field-row">
        <div class="field"><label>Proje</label><select id="fProject"><option value="">Proje yok</option>${opts}</select></div>
        <div class="field"><label>Etiketler (virgülle)</label><input type="text" id="fTags" value="${esc(t ? (t.tags || []).join(', ') : '')}" placeholder="iş, önemli" /></div>
      </div>
      <div class="modal-actions">
        ${t ? '<button class="btn-delete" id="fDelete">Sil</button>' : ''}
        <span class="spacer"></span>
        <button class="btn-ghost" id="fCancel">Vazgeç</button>
        <button class="btn-primary" id="fSave">${t ? 'Kaydet' : 'Ekle'}</button>
      </div>`, () => {
      let pr = t ? t.priority : 0;
      $$('#fPriority .priority-opt').forEach(b => b.onclick = () => {
        pr = +b.dataset.p;
        $$('#fPriority .priority-opt').forEach(x => x.classList.toggle('active', x === b));
      });
      const submit = () => {
        const title = $('#fTitle').value.trim();
        if (!title) { $('#fTitle').focus(); toast('Başlık gerekli.'); return; }
        const data = {
          title, notes: $('#fNotes').value.trim(), due: $('#fDue').value || null, time: $('#fTime').value || '',
          priority: pr, projectId: $('#fProject').value || null,
          tags: $('#fTags').value.split(',').map(x => trLower(x.trim()).replace(/^#/, '')).filter(Boolean)
        };
        if (t) Object.assign(t, data);
        else state.tasks.push({ id: uid(), done: false, order: Date.now(), createdAt: new Date().toISOString(), completedAt: null, ...data });
        save(); closeModal(); render(); toast(t ? 'Görev güncellendi.' : 'Görev eklendi.');
      };
      $('#fSave').onclick = submit;
      $('#fCancel').onclick = closeModal;
      if (t) $('#fDelete').onclick = () => { removeTask(t.id); closeModal(); };
      $('#fTitle').addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    });
  }

  function openNoteModal(id) {
    const n = id ? state.notes.find(x => x.id === id) : null;
    openModal(n ? 'Notu düzenle' : 'Yeni not', `
      <div class="field"><label>Başlık</label><input type="text" id="nTitle" value="${esc(n ? n.title : '')}" placeholder="Notuna bir ad ver" /></div>
      <div class="field"><label>İçerik</label><textarea id="nBody" style="min-height:200px" placeholder="Aklındakileri yaz…">${esc(n ? n.body : '')}</textarea></div>
      <div class="field-row">
        <div class="field"><label>Renk</label><div class="color-picker" id="nColors">
          ${PALETTE.map(c => `<button type="button" class="color-opt ${(n ? n.color : PALETTE[0]) === c ? 'active' : ''}" data-c="${c}" style="background:${c}"></button>`).join('')}
        </div></div>
        <div class="field"><label>&nbsp;</label><label style="display:flex;align-items:center;gap:8px;font-size:13px;text-transform:none;letter-spacing:0;color:var(--ink-2);font-weight:500">
          <input type="checkbox" id="nPin" ${n && n.pinned ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--accent)" /> Üste sabitle
        </label></div>
      </div>
      <div class="modal-actions">
        ${n ? '<button class="btn-delete" id="nDelete">Sil</button>' : ''}
        <span class="spacer"></span>
        <button class="btn-ghost" id="nCancel">Vazgeç</button>
        <button class="btn-primary" id="nSave">${n ? 'Kaydet' : 'Oluştur'}</button>
      </div>`, () => {
      let color = n ? n.color : PALETTE[0];
      $$('#nColors .color-opt').forEach(b => b.onclick = () => {
        color = b.dataset.c; $$('#nColors .color-opt').forEach(x => x.classList.toggle('active', x === b));
      });
      const submit = () => {
        const title = $('#nTitle').value.trim(), body = $('#nBody').value.trim();
        if (!title && !body) { toast('Boş not kaydedilemez.'); return; }
        const data = { title: title || 'İsimsiz not', body, color, pinned: $('#nPin').checked, updatedAt: new Date().toISOString() };
        if (n) Object.assign(n, data); else state.notes.push({ id: uid(), ...data });
        save(); closeModal(); render(); toast(n ? 'Not güncellendi.' : 'Not oluşturuldu.');
      };
      $('#nSave').onclick = submit;
      $('#nCancel').onclick = closeModal;
      if (n) $('#nDelete').onclick = () => { state.notes = state.notes.filter(x => x.id !== n.id); save(); closeModal(); render(); toast('Not silindi.'); };
    });
  }

  function openProjectModal(id) {
    const p = id ? state.projects.find(x => x.id === id) : null;
    openModal(p ? 'Projeyi düzenle' : 'Yeni proje', `
      <div class="field"><label>Proje adı</label><input type="text" id="pName" value="${esc(p ? p.name : '')}" placeholder="Örn: Tatil planları" /></div>
      <div class="field"><label>Renk</label><div class="color-picker" id="pColors">
        ${PALETTE.map(c => `<button type="button" class="color-opt ${(p ? p.color : PALETTE[0]) === c ? 'active' : ''}" data-c="${c}" style="background:${c}"></button>`).join('')}
      </div></div>
      <div class="modal-actions">
        ${p ? '<button class="btn-delete" id="pDelete">Sil</button>' : ''}
        <span class="spacer"></span>
        <button class="btn-ghost" id="pCancel">Vazgeç</button>
        <button class="btn-primary" id="pSave">${p ? 'Kaydet' : 'Oluştur'}</button>
      </div>`, () => {
      let color = p ? p.color : PALETTE[0];
      $$('#pColors .color-opt').forEach(b => b.onclick = () => { color = b.dataset.c; $$('#pColors .color-opt').forEach(x => x.classList.toggle('active', x === b)); });
      $('#pSave').onclick = () => {
        const name = $('#pName').value.trim();
        if (!name) { toast('Proje adı gerekli.'); return; }
        if (p) Object.assign(p, { name, color }); else state.projects.push({ id: uid(), name, color });
        save(); closeModal(); render(); toast(p ? 'Proje güncellendi.' : 'Proje oluşturuldu.');
      };
      $('#pCancel').onclick = closeModal;
      if (p) $('#pDelete').onclick = () => {
        state.projects = state.projects.filter(x => x.id !== p.id);
        state.tasks.forEach(t => { if (t.projectId === p.id) t.projectId = null; });
        if (ui.view === 'project:' + p.id) ui.view = 'all';
        save(); closeModal(); render(); toast('Proje silindi, görevler korundu.');
      };
    });
  }

  function openDataModal() {
    openModal('Verilerim', `
      <p class="modal-note">Tüm görevler, notlar ve projeler yalnızca bu tarayıcının yerel depolamasında saklanır. Düzenli yedek almanı öneririz.</p>
      <div class="data-row"><button class="btn-ghost" id="dExport">↓ JSON indir</button><button class="btn-ghost" id="dImport">↑ JSON yükle</button></div>
      <input type="file" id="dFile" accept="application/json" class="hidden" />
      <div class="data-row"><button class="btn-ghost" id="dReset" style="color:var(--accent)">Örnek veriye dön</button></div>
      <div class="field" style="margin-top:20px"><label>Klavye kısayolları</label>
        <div class="modal-note"><b>N</b> yeni görev · <b>/</b> ara · <b>T</b> bugün · <b>U</b> yaklaşan · <b>D</b> notlar · <b>Esc</b> kapat<br/><b>Enter</b> hızlı eklemede görev oluşturur.</div>
      </div>
      <div class="modal-actions"><span class="spacer"></span><button class="btn-ghost" id="dClose">Kapat</button></div>`, () => {
      $('#dClose').onclick = closeModal;
      $('#dExport').onclick = () => {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `pusula-yedek-${TODAY()}.json`; a.click(); URL.revokeObjectURL(a.href);
        toast('Yedek indirildi.');
      };
      $('#dImport').onclick = () => $('#dFile').click();
      $('#dFile').onchange = e => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result);
            if (!Array.isArray(data.tasks)) throw new Error('Geçersiz dosya');
            state = {
              tasks: data.tasks, notes: Array.isArray(data.notes) ? data.notes : [],
              dayNotes: (data.dayNotes && typeof data.dayNotes === 'object' && !Array.isArray(data.dayNotes)) ? data.dayNotes : {},
              projects: Array.isArray(data.projects) ? data.projects : [],
              settings: Object.assign({ theme: 'light', showDone: false, sort: 'manual' }, data.settings || {})
            };
            ui.view = 'today'; ui.query = ''; $('#searchInput').value = '';
            save(); closeModal(); render(); toast('Veriler yüklendi.');
          } catch (err) { toast('Dosya okunamadı.'); }
        };
        reader.readAsText(file);
      };
      $('#dReset').onclick = () => {
        if (!confirm('Tüm veriler silinip örnek veriye dönülecek. Emin misin?')) return;
        state = seed(); save(); closeModal(); render(); toast('Örnek veri yüklendi.');
      };
    });
  }

  /* ---------- İşlemler ---------- */
  function addTask(raw) {
    const parsed = parseQuickAdd(raw);
    if (!parsed.title) return;
    const due = parsed.due || (ui.view === 'date' ? ui.selectedDate : null);
    const task = { id: uid(), done: false, order: Date.now(), createdAt: new Date().toISOString(), completedAt: null, notes: '', ...parsed, due };
    state.tasks.push(task);
    save(); render();
    toast(`“${task.title.slice(0, 34)}${task.title.length > 34 ? '…' : ''}” eklendi.`, 'Geri al', () => {
      state.tasks = state.tasks.filter(t => t.id !== task.id); save(); render();
    });
  }
  function removeTask(id) {
    const t = state.tasks.find(x => x.id === id); if (!t) return;
    state.tasks = state.tasks.filter(x => x.id !== id); save(); render();
    toast('Görev silindi.', 'Geri al', () => { state.tasks.push(t); save(); render(); });
  }
  function toggleTask(id) {
    const t = state.tasks.find(x => x.id === id); if (!t) return;
    t.done = !t.done; t.completedAt = t.done ? new Date().toISOString() : null;
    if (t.done && window.navigator && window.navigator.vibrate) window.navigator.vibrate(12);
    save(); render();
    if (t.done && state.tasks.filter(x => x.done).length % 5 === 0) toast('Harika gidiyorsun! ✨');
  }
  function setView(view) {
    ui.view = view; ui.query = ''; $('#searchInput').value = '';
    if (view === 'calendar') ui.calMonth = new Date();
    closeSidebar(); render();
    $('.content').scrollTo({ top: 0, behavior: 'smooth' });
  }
  function closeSidebar() { document.body.classList.remove('sidebar-open'); }

  /* ---------- Olaylar ---------- */
  document.addEventListener('click', e => {
    const nav = e.target.closest('[data-view]');
    if (nav && !e.target.closest('[data-project-menu]')) { setView(nav.dataset.view); return; }

    const pm = e.target.closest('[data-project-menu]');
    if (pm) { e.stopPropagation(); openProjectModal(pm.dataset.projectMenu); return; }

    const day = e.target.closest('[data-date]');
    if (day) { ui.selectedDate = day.dataset.date; setView('date'); return; }

    const journalEntry = e.target.closest('[data-journal-date]');
    if (journalEntry) {
      ui.journalDate = journalEntry.dataset.journalDate;
      renderJournal();
      $('#journalText').focus();
      return;
    }

    const hint = e.target.closest('.hint');
    if (hint) {
      const input = $('#quickAdd'), v = input.value.trim();
      input.value = v ? `${v} ${hint.dataset.hint}` : hint.dataset.hint;
      input.focus(); return;
    }

    const row = e.target.closest('.task-row');
    if (row) {
      if (e.target.closest('.check')) return; // checkbox kendi tıklamasını yönetir
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'toggle') { toggleTask(row.dataset.id); return; }
      if (act === 'delete') { removeTask(row.dataset.id); return; }
      if (act === 'edit' || !act) { openTaskModal(row.dataset.id); return; }
    }

    const noteCard = e.target.closest('.note-card');
    if (noteCard) {
      const act = e.target.closest('[data-note-act]')?.dataset.noteAct;
      if (act === 'delete') {
        const n = state.notes.find(x => x.id === noteCard.dataset.id);
        state.notes = state.notes.filter(x => x.id !== noteCard.dataset.id); save(); render(); toast('Not silindi.', 'Geri al', () => { state.notes.push(n); save(); render(); });
      } else if (act === 'pin') {
        const n = state.notes.find(x => x.id === noteCard.dataset.id); n.pinned = !n.pinned; save(); render();
      } else openNoteModal(noteCard.dataset.id);
      return;
    }
  });

  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.sub-item[role="button"]')) {
      e.preventDefault(); setView(e.target.dataset.view);
    }
  });

  $('#brandBtn').onclick = () => setView('today');
  $('#newTaskBtn').onclick = () => {
    if (ui.view === 'notes') setView('today');
    if ($('#taskSection').classList.contains('hidden')) setView('today');
    openTaskModal(null);
  };
  $('#noteBtn').onclick = openNoteModal;
  $('#newNoteBtn').onclick = openNoteModal;
  $('#addProjectBtn').onclick = () => openProjectModal(null);
  $('#dataBtn').onclick = openDataModal;
  $('#themeBtn').onclick = () => { state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark'; save(); render(); };
  $('#modalClose').onclick = closeModal;
  $('#modalBackdrop').onclick = e => { if (e.target.id === 'modalBackdrop') closeModal(); };
  $('#menuBtn').onclick = () => document.body.classList.add('sidebar-open');
  $('#sidebarClose').onclick = closeSidebar;
  $('#sidebarScrim').onclick = closeSidebar;

  $('#quickAdd').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addTask(e.target.value); e.target.value = ''; }
    if (e.key === 'Escape') e.target.blur();
  });

  /* Telefondaki sabit hızlı ekleme çubuğu */
  const submitMobileTask = () => {
    const input = $('#mobileQuickAdd');
    const value = input.value;
    if (!value.trim()) return;
    addTask(value);
    input.value = '';
    input.focus();
  };
  $('#mobileQuickAdd').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); submitMobileTask(); }
    if (e.key === 'Escape') e.target.blur();
  });
  $('#mobileAddSend').onclick = e => { e.preventDefault(); submitMobileTask(); };
  $('#mobileAddBar').addEventListener('submit', e => { e.preventDefault(); submitMobileTask(); });

  /* Günlük notlar — yazarken otomatik kayıt */
  bindDaily($('#dailyNoteText'),
    () => ui.view === 'date' ? ui.selectedDate : TODAY(),
    $('#dailyStatus'), false);
  bindDaily($('#journalText'), () => ui.journalDate, $('#journalStatus'), true);

  $('#journalDate').addEventListener('change', e => {
    ui.journalDate = e.target.value || TODAY();
    renderJournal();
    $('#journalText').focus();
  });
  $('#journalDelete').onclick = () => {
    delete state.dayNotes[ui.journalDate];
    $('#journalText').value = '';
    save(); render(); toast('Bu günün notu silindi.');
  };

  $('#fabAdd').onclick = () => {
    closeSidebar();
    if (ui.view === 'notes') { openNoteModal(); return; }
    if (ui.view === 'today' || ui.view === 'date' || ui.view === 'journal') {
      const target = ui.view === 'journal' ? $('#journalText') : $('#dailyNoteText');
      target.focus();
      if (target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    openTaskModal(null);
  };

  $('#dateChip').onclick = () => { const i = $('#quickAdd'); i.value = (i.value.trim() + ' bugün').trim(); i.focus(); };
  $('#priorityChip').onclick = () => { const i = $('#quickAdd'); i.value = (i.value.trim() + ' !1').trim(); i.focus(); };
  $('#projectChip').onclick = () => { const i = $('#quickAdd'); i.value = (i.value.trim() + ' @' + (state.projects[0]?.name || 'Proje')).trim(); i.focus(); };
  $('#emptyAction').onclick = () => {
    if (ui.query) { ui.query = ''; $('#searchInput').value = ''; render(); }
    else if (ui.view === 'notes') openNoteModal();
    else if (ui.view === 'journal') $('#journalText').focus();
    else if (!$('#mobileAddBar').classList.contains('hidden')) $('#mobileQuickAdd').focus();
    else $('#quickAdd').focus();
  };
  $('#toggleDoneBtn').onclick = () => { state.settings.showDone = !state.settings.showDone; save(); render(); };
  $('#clearDoneBtn').onclick = () => {
    const done = state.tasks.filter(t => t.done);
    if (!done.length) return;
    if (!confirm(`${done.length} tamamlanan görev silinecek. Emin misin?`)) return;
    state.tasks = state.tasks.filter(t => !t.done); save(); render(); toast(`${done.length} görev temizlendi.`);
  };
  $('#sortBtn').onclick = () => {
    const modes = ['manual', 'date', 'priority', 'alpha'];
    const labels = { manual: 'Elle sırala', date: 'Tarihe göre', priority: 'Önceliğe göre', alpha: 'A-Z' };
    const i = modes.indexOf(state.settings.sort);
    state.settings.sort = modes[(i + 1) % modes.length]; save(); render();
    toast('Sıralama: ' + labels[state.settings.sort]);
  };
  $('#searchInput').addEventListener('input', e => { ui.query = e.target.value; render(); });

  $('#prevMonth').onclick = () => { ui.calMonth = new Date(ui.calMonth.getFullYear(), ui.calMonth.getMonth() - 1, 1); renderCalendar(); };
  $('#nextMonth').onclick = () => { ui.calMonth = new Date(ui.calMonth.getFullYear(), ui.calMonth.getMonth() + 1, 1); renderCalendar(); };
  $('#todayMonth').onclick = () => { ui.calMonth = new Date(); renderCalendar(); };

  /* Sürükle-bırak ile elle sıralama */
  let dragged = null;
  $('#taskList').addEventListener('dragstart', e => {
    const row = e.target.closest('.task-row'); if (!row) return;
    dragged = row.dataset.id; row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', dragged); } catch (_) {}
  });
  $('#taskList').addEventListener('dragend', () => {
    $$('.task-row').forEach(r => r.classList.remove('dragging', 'drop-target')); dragged = null;
  });
  $('#taskList').addEventListener('dragover', e => {
    if (!dragged) return;
    const row = e.target.closest('.task-row'); if (!row) return;
    e.preventDefault();
    $$('.task-row').forEach(r => r.classList.toggle('drop-target', r === row));
  });
  $('#taskList').addEventListener('drop', e => {
    if (!dragged) return;
    const row = e.target.closest('.task-row'); if (!row || row.dataset.id === dragged) return;
    e.preventDefault();
    const from = state.tasks.findIndex(t => t.id === dragged);
    const to = state.tasks.findIndex(t => t.id === row.dataset.id);
    if (from < 0 || to < 0) return;
    const [item] = state.tasks.splice(from, 1);
    state.tasks.splice(to, 0, item);
    state.tasks.forEach((t, i) => t.order = i);
    state.settings.sort = 'manual'; save(); render(); toast('Sıralama güncellendi.');
  });

  document.addEventListener('keydown', e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (e.key === 'Escape') {
      if (!$('#modalBackdrop').classList.contains('hidden')) closeModal();
      else if (document.body.classList.contains('sidebar-open')) closeSidebar();
      else if (ui.query) { ui.query = ''; $('#searchInput').value = ''; render(); }
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { if (!typing) $('#quickAdd')?.focus(); return; }
    if (typing || !$('#modalBackdrop').classList.contains('hidden') || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLocaleLowerCase('tr-TR');
    if (k === '/') { e.preventDefault(); $('#searchInput').focus(); }
    else if (k === 'n') { e.preventDefault(); if (ui.view === 'notes') openNoteModal(); else openTaskModal(null); }
    else if (k === 't') setView('today');
    else if (k === 'u') setView('upcoming');
    else if (k === 'd') setView('notes');
  });

  /* ---------- PWA: uygulama olarak yükleme / çevrimdışı ---------- */
  const isStandalone = () =>
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;

  let deferredPrompt = null;
  const OFFLINE_BUILD = window.PUSULA_OFFLINE === true;
  const installBtn = $('#installBtn');
  if (isStandalone() || OFFLINE_BUILD) installBtn.classList.add('hidden');

  function openInstallHelp() {
    openModal('Uygulama olarak yükle', `
      <p class="modal-note">Pusula'yı yüklediğinde kendi penceresinde açılır, ana ekrana/kayıt çubuğuna eklenir ve çevrimdışı çalışır. Verilerin yine yalnızca bu cihazda kalır.</p>
      <div class="field" style="margin-top:16px"><label>Masaüstü · Chrome / Edge</label>
        <div class="modal-note">Adres çubuğundaki <b>Yükle</b> simgesine tıkla veya <b>⋮ → Yayınla, kaydet ve paylaş → Pusula'yı yükle</b> seçeneğini kullan.</div>
      </div>
      <div class="field"><label>Android · Chrome</label>
        <div class="modal-note"><b>⋮ → Uygulamayı yükle</b> (veya “Ana ekrana ekle”) seçeneğine dokun.</div>
      </div>
      <div class="field"><label>iPhone / iPad · Safari</label>
        <div class="modal-note"><b>Paylaş → Ana Ekrana Ekle</b> seçeneğini seç.</div>
      </div>
      <div class="modal-note" style="margin-top:6px">Not: Yükleme için sayfanın <b>http://localhost</b> veya <b>https://</b> adresinden açılması gerekir. \`file://\` ile açıldığında tarayıcı yüklemeye izin vermez; <b>start.sh</b> bunu senin için halleder.</div>
      <div class="modal-actions"><span class="spacer"></span><button class="btn-ghost" id="iClose">Anladım</button></div>`, () => { $('#iClose').onclick = closeModal; });
  }

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (!isStandalone()) installBtn.classList.remove('hidden');
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null; installBtn.classList.add('hidden');
    toast('Pusula uygulama olarak yüklendi.');
  });
  installBtn.onclick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null; installBtn.classList.add('hidden');
      toast(choice && choice.outcome === 'accepted' ? 'Pusula yükleniyor…' : 'Yükleme iptal edildi.');
    } else openInstallHelp();
  };

  const registerSW = () => {
    if (!OFFLINE_BUILD && 'serviceWorker' in window.navigator && /^https?:/.test(window.location.protocol)) {
      window.navigator.serviceWorker.register('./sw.js')
        .catch(err => console.warn('Çevrimdışı önbellek kurulamadı:', err));
    }
  };
  if (document.readyState === 'complete') registerSW();
  else window.addEventListener('load', registerSW);

  /* Uygulama kısayolları: ?action=new-task | today | notes | journal | daily */
  try {
    const action = new URLSearchParams(window.location.search).get('action');
    if (action === 'notes') ui.view = 'notes';
    else if (action === 'journal') ui.view = 'journal';
    else if (action === 'today') ui.view = 'today';
    else if (action === 'new-task') setTimeout(() => openTaskModal(null), 120);
    else if (action === 'daily') setTimeout(() => $('#dailyNoteText').focus(), 120);
    if (action && window.history && window.history.replaceState) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  } catch (_) { /* URL API kullanılamıyorsa yoksay */ }

  render();
})();
