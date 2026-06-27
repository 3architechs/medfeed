/* ═══════════════════════════════════════════
   MEDFEED — APP.JS
   Sidebar · Search · Archive · Dark mode
   Tooltips · Timestamps · Expand
═══════════════════════════════════════════ */

/* ── SIDEBAR ── */
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const layoutBody = document.getElementById('layoutBody');

let sidebarExpanded = false;

sidebarToggle.addEventListener('click', () => {
  sidebarExpanded = !sidebarExpanded;
  sidebar.classList.toggle('expanded', sidebarExpanded);
});

// Hover to expand (only when not pinned)
sidebar.addEventListener('mouseenter', () => {
  if (!sidebarExpanded) sidebar.classList.add('expanded');
});
sidebar.addEventListener('mouseleave', () => {
  if (!sidebarExpanded) sidebar.classList.remove('expanded');
});

/* ── SIDEBAR TOOLTIPS (position:fixed to escape clip) ── */
const tooltip = document.getElementById('sidebarTooltip');

document.querySelectorAll('.filter-icon[data-tooltip]').forEach(dot => {
  dot.addEventListener('mouseenter', (e) => {
    if (sidebar.classList.contains('expanded')) return;
    const rect = dot.getBoundingClientRect();
    tooltip.textContent = dot.dataset.tooltip;
    tooltip.style.top = (rect.top + rect.height / 2 - 12) + 'px';
    tooltip.style.left = (rect.right + 10) + 'px';
    tooltip.classList.add('visible');
  });
  dot.addEventListener('mouseleave', () => {
    tooltip.classList.remove('visible');
  });
});

/* Filter items are handled in SIDEBAR FILTERING section */

/* ── DARK MODE ── */
const darkmodeToggle = document.getElementById('darkmodeToggle');
darkmodeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const isDark = html.dataset.theme === 'dark';
  html.dataset.theme = isDark ? 'light' : 'dark';
});

/* ── ARCHIVE DRAWER ── */
const archiveToggle = document.getElementById('archiveToggle');
const archiveDrawer = document.getElementById('archiveDrawer');
const archiveOverlay = document.getElementById('archiveOverlay');

archiveToggle.addEventListener('click', () => {
  archiveDrawer.classList.add('open');
  archiveOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
});

function closeArchive() {
  archiveDrawer.classList.remove('open');
  archiveOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

archiveOverlay.addEventListener('click', closeArchive);
document.getElementById('archiveClose').addEventListener('click', closeArchive);

const rangeToHours = { '48h': 48, '72h': 72, '7d': 168 };
const archiveFilters = { range: '48h', specialty: 'all', kind: 'all', customMin: null, customMax: null };

function applyArchiveFilters() {
  const maxHours = archiveFilters.range === 'custom' ? Infinity : (rangeToHours[archiveFilters.range] || Infinity);

  document.querySelectorAll('.archive-card').forEach(card => {
    const hours = parseInt(card.dataset.hours);
    const specialty = card.dataset.specialty;
    const kind = card.dataset.kind;

    let matchTime;
    if (archiveFilters.range === 'custom' && archiveFilters.customMin !== null) {
      matchTime = hours >= archiveFilters.customMin && hours <= archiveFilters.customMax;
    } else {
      matchTime = hours <= maxHours;
    }
    const matchSpecialty = archiveFilters.specialty === 'all' || specialty === archiveFilters.specialty;
    const matchKind = archiveFilters.kind === 'all' || kind === archiveFilters.kind;

    card.style.display = (matchTime && matchSpecialty && matchKind) ? '' : 'none';
  });
}

document.querySelectorAll('.range-chip[data-range]').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.range-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    archiveFilters.range = chip.dataset.range;
    const customDates = document.getElementById('customDates');
    archiveFilters.customMin = null;
    archiveFilters.customMax = null;
    applyArchiveFilters();
  });
});

document.querySelectorAll('.archive-filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const filterType = chip.dataset.archiveFilter;
    document.querySelectorAll(`.archive-filter-chip[data-archive-filter="${filterType}"]`).forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    archiveFilters[filterType] = chip.dataset.value;
    applyArchiveFilters();
  });
});


/* ── WARNING BAR TOGGLE ── */
document.querySelectorAll('.warning-toggle[data-warn]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.warn;
    const expanded = document.getElementById(id + '-expanded');
    const isOpen = expanded.classList.contains('open');
    expanded.classList.toggle('open', !isOpen);
    btn.textContent = isOpen ? 'show warning' : 'hide warning';
  });
});

/* ── CARD EXPAND ── */
document.querySelectorAll('.card-expand-btn[data-expand]').forEach(btn => {
  btn.addEventListener('click', () => {
    const area = document.getElementById(btn.dataset.expand);
    const isOpen = area.classList.contains('open');
    area.classList.toggle('open', !isOpen);
    btn.classList.toggle('open', !isOpen);
    btn.childNodes.forEach(node => {
      if (node.nodeType === 3 && node.textContent.trim()) {
        node.textContent = isOpen ? '\n            Show full post\n          ' : '\n            Hide full post\n          ';
      }
    });
  });
});

/* ── SIDEBAR FILTERING ── */
const activeFilters = { specialty: 'all', kind: 'all', source: 'all' };

function updateFilterCounts() {
  document.querySelectorAll('.filter-item[data-filter="specialty"]').forEach(item => {
    const value = item.dataset.value;
    const countEl = item.querySelector('.filter-count');
    if (!countEl) return;
    if (value === 'all') {
      countEl.textContent = document.querySelectorAll('.card').length;
    } else {
      countEl.textContent = document.querySelectorAll(`.card[data-specialty="${value}"]`).length;
    }
  });
}

function applyFilters() {
  document.querySelectorAll('.card').forEach(card => {
    const specialty = card.dataset.specialty;
    const kind = card.dataset.kind;
    const source = card.dataset.source;

    const matchSpecialty = activeFilters.specialty === 'all' || specialty === activeFilters.specialty;
    const matchKind = activeFilters.kind === 'all' || kind === activeFilters.kind;
    const matchSource = activeFilters.source === 'all' || source === activeFilters.source;

    card.style.display = (matchSpecialty && matchKind && matchSource) ? '' : 'none';
  });

  document.querySelectorAll('.feed-section').forEach(section => {
    const visibleCards = section.querySelectorAll('.card:not([style*="display: none"])');
    section.style.display = visibleCards.length === 0 ? 'none' : '';
  });
}

document.querySelectorAll('.filter-item').forEach(item => {
  item.addEventListener('click', () => {
    const filterType = item.dataset.filter;
    const value = item.dataset.value;
    document.querySelectorAll(`.filter-item[data-filter="${filterType}"]`).forEach(i => {
      i.classList.remove('active');
    });
    item.classList.add('active');
    activeFilters[filterType] = value;
    applyFilters();
  });
});

updateFilterCounts();

/* ── THREAD PAGINATION ── */
const threadData = {
  thread1: {
    1: 'Full post: "New preprint out of Germany — cardiac biopsy samples from 35 post-vaccination myocarditis patients. mRNA fragments (not full spike) found in 22/35 samples at 6-month follow-up. Peer review pending. Methodology is solid — this warrants serious attention from cardiology community. Don\'t panic. Do pay attention. 🧵1/4"',
    2: '"2/4 — Key methodological detail: samples were obtained from endomyocardial biopsies during routine follow-up for previously diagnosed post-vaccination myocarditis. Detection used RT-qPCR with spike-specific primers. Controls (n=20, non-vaccinated myocarditis) were all negative."',
    3: '"3/4 — Important caveats: (1) fragments ≠ full spike protein, (2) presence ≠ pathogenicity, (3) sample size is small, (4) no correlation found between fragment persistence and symptom severity. This needs replication in a larger cohort before clinical implications."',
    4: '"4/4 — My take: This doesn\'t mean vaccines are dangerous. It means we need better long-term monitoring data. The immune system may be handling these fragments without issue. But we owe it to patients to study this properly rather than dismiss it. Science requires follow-through."'
  }
};

document.querySelectorAll('.expand-thread-nav').forEach(nav => {
  const threadId = nav.dataset.thread;
  const textEl = nav.closest('.expand-thread').querySelector('.expand-full-text');

  nav.querySelectorAll('.thread-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      nav.querySelectorAll('.thread-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const page = parseInt(btn.dataset.page);
      if (threadData[threadId] && threadData[threadId][page]) {
        textEl.textContent = threadData[threadId][page];
      }
    });
  });
});

/* ── SEARCH ── */
const searchInput = document.getElementById('searchInput');
const searchDropdown = document.getElementById('searchDropdown');
const searchResultsEl = document.getElementById('searchResults');
const searchResultCount = document.getElementById('searchResultCount');
const searchClear = document.getElementById('searchClear');

// All searchable cards data
const cardData = [
  {
    id: 'I-1',
    title: 'mRNA spike protein fragments detected in cardiac tissue up to 6 months post-vaccination — new preprint raises durability questions',
    handle: '@MakisMD',
    time: '2h ago',
    specialty: 'Cardiology',
    kind: 'Independent view',
    type: 'independent',
    tags: ['mrna', 'spike', 'protein', 'cardiac', 'heart', 'vaccine', 'vaccination', 'myocarditis', 'preprint'],
  },
  {
    id: 'I-2',
    title: 'Early repolarisation pattern in young athletes: overlooked arrhythmia risk or normal variant?',
    handle: '@P_McCulloughMD',
    time: '5h ago',
    specialty: 'Cardiology',
    kind: 'Independent view',
    type: 'independent',
    tags: ['ecg', 'arrhythmia', 'athletes', 'heart', 'repolarisation', 'sports', 'cardiology'],
  },
  {
    id: 'I-3',
    title: 'SSRIs and emotional blunting: what 20 years of prescribing taught me that the trials didn\'t show',
    handle: '@DrJocelynKelly',
    time: '7h ago',
    specialty: 'Mental Health',
    kind: 'Independent view',
    type: 'independent',
    tags: ['ssri', 'antidepressant', 'depression', 'emotional', 'blunting', 'numb', 'psychiatry', 'mental health'],
  },
  {
    id: 'P-1',
    title: 'Pembrolizumab plus chemotherapy shows 34% reduction in mortality for triple-negative breast cancer — KEYNOTE-522 5-year follow-up',
    handle: '@TheLancet',
    time: '1h ago',
    specialty: 'Oncology',
    kind: 'Breakthrough',
    type: 'institutional',
    tags: ['pembrolizumab', 'breast cancer', 'tnbc', 'immunotherapy', 'chemo', 'keynote', 'oncology', 'cancer'],
  },
  {
    id: 'P-2',
    title: 'Sleep fragmentation in midlife linked to 40% higher Alzheimer\'s risk — longitudinal cohort study of 8,000 adults over 15 years',
    handle: '@NatureNeuro',
    time: '3h ago',
    specialty: 'Neurology',
    kind: 'Research study',
    type: 'institutional',
    tags: ['sleep', 'alzheimer', 'dementia', 'neurology', 'cognition', 'memory', 'rem', 'insomnia'],
  },
  {
    id: 'P-3',
    title: 'GLP-1 receptor agonists reduce major cardiovascular events by 20% independent of weight loss — meta-analysis of 14 RCTs',
    handle: '@EHJournal',
    time: '4h ago',
    specialty: 'Cardiology',
    kind: 'Research study',
    type: 'institutional',
    tags: ['glp-1', 'ozempic', 'semaglutide', 'cardiovascular', 'heart', 'weight loss', 'diabetes', 'obesity'],
  },
  {
    id: 'P-4',
    title: 'Ultra-processed food above 20% of diet associated with measurable cognitive decline in adults over 50',
    handle: '@NEJM',
    time: '6h ago',
    specialty: 'Nutrition',
    kind: 'Research study',
    type: 'institutional',
    tags: ['ultra-processed', 'upf', 'food', 'diet', 'cognitive', 'brain', 'nutrition', 'aging'],
  },
  {
    id: 'P-5',
    title: 'Phase III: bispecific antibody therapy achieves complete remission in 61% of relapsed/refractory diffuse large B-cell lymphoma patients',
    handle: '@bloodjournal',
    time: '9h ago',
    specialty: 'Immunology',
    kind: 'Clinical trial',
    type: 'institutional',
    tags: ['lymphoma', 'dlbcl', 'bispecific', 'antibody', 'immunotherapy', 'remission', 'cancer', 'epcoritamab'],
  },
  {
    id: 'P-6',
    title: 'FDA issues safety update on benzodiazepine co-prescribing with opioids following review of 4,000 adverse events',
    handle: '@US_FDA',
    time: '11h ago',
    specialty: 'Mental Health',
    kind: 'Safety update',
    type: 'institutional',
    tags: ['fda', 'benzodiazepine', 'benzo', 'opioid', 'safety', 'drug interaction', 'respiratory'],
  },
  {
    id: 'A-1', title: 'Tau protein clearance during slow-wave sleep confirmed in first human PET imaging study',
    handle: '@NatureNeuro', time: '32h ago', hours: 32, specialty: 'Neurology', kind: 'Research study', type: 'archive',
    tags: ['tau', 'protein', 'sleep', 'slow-wave', 'PET', 'alzheimer', 'brain', 'clearance'],
  },
  {
    id: 'A-2', title: 'High-sensitivity troponin testing reduces unnecessary hospital admissions by 28% in chest pain patients — UK multicentre trial',
    handle: '@ehj_ed', time: '38h ago', hours: 38, specialty: 'Cardiology', kind: 'Clinical trial', type: 'archive',
    tags: ['troponin', 'chest pain', 'hospital', 'admissions', 'cardiac', 'heart attack', 'MI'],
  },
  {
    id: 'A-3', title: 'Liquid biopsy panels detect stage I colorectal cancer with 89% sensitivity — outperforming current screening protocols',
    handle: '@TheLancet', time: '44h ago', hours: 44, specialty: 'Oncology', kind: 'Breakthrough', type: 'archive',
    tags: ['liquid biopsy', 'colorectal', 'cancer', 'screening', 'early detection', 'blood test'],
  },
  {
    id: 'A-4', title: 'Ketamine nasal spray shows 70% remission rate in treatment-resistant depression at 4 weeks',
    handle: '@NEJM', time: '51h ago', hours: 51, specialty: 'Mental Health', kind: 'Clinical trial', type: 'archive',
    tags: ['ketamine', 'esketamine', 'depression', 'treatment-resistant', 'remission', 'nasal spray'],
  },
  {
    id: 'A-5', title: 'Time-restricted eating (16:8) reduces visceral fat independent of caloric intake in 12-week controlled study',
    handle: '@Cell_Metabolism', time: '58h ago', hours: 58, specialty: 'Nutrition', kind: 'Research study', type: 'archive',
    tags: ['fasting', 'intermittent', 'time-restricted', 'visceral fat', 'diet', 'circadian', '16:8'],
  },
  {
    id: 'A-6', title: 'New mRNA vaccine platform demonstrates cross-reactive T-cell response against 8 influenza subtypes in phase I',
    handle: '@NatureMedicine', time: '63h ago', hours: 63, specialty: 'Immunology', kind: 'Clinical trial', type: 'archive',
    tags: ['mRNA', 'vaccine', 'influenza', 'flu', 'T-cell', 'universal', 'H5N1'],
  },
  {
    id: 'A-7', title: 'Sustained blood pressure reduction with renal denervation at 3-year follow-up — SPYRAL HTN-ON MED extended results',
    handle: '@ehj_ed', time: '75h ago', hours: 75, specialty: 'Cardiology', kind: 'Research study', type: 'archive',
    tags: ['blood pressure', 'hypertension', 'renal denervation', 'SPYRAL', 'HTN'],
  },
  {
    id: 'A-8', title: 'AI-assisted colonoscopy increases adenoma detection rate by 30% in randomised multicentre trial',
    handle: '@TheLancet', time: '110h ago', hours: 110, specialty: 'Oncology', kind: 'Breakthrough', type: 'archive',
    tags: ['AI', 'colonoscopy', 'adenoma', 'polyp', 'colon cancer', 'screening'],
  },
  {
    id: 'A-9', title: 'Continuous glucose monitoring reveals link between glycaemic variability and migraine frequency',
    handle: '@NatureNeuro', time: '140h ago', hours: 140, specialty: 'Neurology', kind: 'Research study', type: 'archive',
    tags: ['glucose', 'CGM', 'migraine', 'glycaemic', 'variability', 'headache'],
  },
];

// Synonym map for semantic-ish search
const synonyms = {
  'heart': ['cardiac', 'cardiology', 'cardiovascular', 'coronary'],
  'cancer': ['oncology', 'tumor', 'tumour', 'malignant', 'lymphoma', 'breast cancer', 'tnbc'],
  'brain': ['neurology', 'cognitive', 'alzheimer', 'dementia', 'memory', 'sleep'],
  'weight': ['obesity', 'bmi', 'glp-1', 'ozempic', 'diet'],
  'mental': ['psychiatry', 'depression', 'anxiety', 'ssri', 'antidepressant'],
  'food': ['diet', 'nutrition', 'upf', 'ultra-processed'],
  'drug': ['medication', 'fda', 'prescribing', 'benzo', 'opioid'],
  'vaccine': ['mrna', 'vaccination', 'immunization'],
  'immune': ['immunology', 'antibody', 'bispecific'],
};

function getSearchTerms(query) {
  const q = query.toLowerCase().trim();
  const terms = [q];
  for (const [key, syns] of Object.entries(synonyms)) {
    if (q.includes(key) || syns.some(s => q.includes(s))) {
      terms.push(key, ...syns);
    }
  }
  return [...new Set(terms)];
}

function buildHighlightedText(text, terms) {
  const validTerms = terms.filter(t => t.length >= 2);
  if (validTerms.length === 0) {
    return [document.createTextNode(text)];
  }
  const pattern = validTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(re);
  return parts.map(part => {
    if (validTerms.some(t => part.toLowerCase() === t.toLowerCase())) {
      const mark = document.createElement('mark');
      mark.textContent = part;
      return mark;
    }
    return document.createTextNode(part);
  });
}

let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(runSearch, 280);
});

searchInput.addEventListener('focus', () => {
  if (searchInput.value.trim()) searchDropdown.classList.add('visible');
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.topbar-center')) {
    searchDropdown.classList.remove('visible');
  }
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.classList.remove('visible');
  searchDropdown.classList.remove('visible');
  searchInput.focus();
});

function runSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    searchClear.classList.remove('visible');
    searchDropdown.classList.remove('visible');
    return;
  }
  searchClear.classList.add('visible');

  const terms = getSearchTerms(query);
  const results = cardData.filter(card => {
    const searchable = [card.title, card.handle, card.specialty, card.kind, ...card.tags].join(' ').toLowerCase();
    return terms.some(t => searchable.includes(t));
  });

  const todayResults = results.filter(c => c.type !== 'archive');
  const olderResults = results.filter(c => c.type === 'archive');
  const totalCount = results.length;

  searchResultCount.textContent = `${totalCount} result${totalCount !== 1 ? 's' : ''}`;
  while (searchResultsEl.firstChild) searchResultsEl.removeChild(searchResultsEl.firstChild);

  if (totalCount === 0) {
    const empty = document.createElement('div');
    empty.className = 'search-empty';
    empty.textContent = 'No findings matched. Try different keywords.';
    searchResultsEl.appendChild(empty);
  } else {
    function renderGroup(label, cards) {
      if (cards.length === 0) return;
      const header = document.createElement('div');
      header.className = 'search-group-header';
      header.textContent = label;
      searchResultsEl.appendChild(header);

      cards.forEach(card => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        if (card.type === 'archive') item.dataset.archiveId = card.id;

        const titleDiv = document.createElement('div');
        titleDiv.className = 'search-result-title';
        buildHighlightedText(card.title, terms).forEach(n => titleDiv.appendChild(n));

        const metaDiv = document.createElement('div');
        metaDiv.className = 'search-result-meta';
        [card.handle, '·', card.time, '·', card.specialty].forEach(text => {
          const span = document.createElement('span');
          span.textContent = text;
          metaDiv.appendChild(span);
        });

        item.addEventListener('click', () => {
          searchDropdown.classList.remove('visible');
          if (card.type === 'archive') {
            openArchiveAndScrollTo(card);
          } else {
            scrollToFeedCard(card);
          }
        });

        item.appendChild(titleDiv);
        item.appendChild(metaDiv);
        searchResultsEl.appendChild(item);
      });
    }

    renderGroup('Today', todayResults);
    renderGroup('Older findings', olderResults);
  }

  searchDropdown.classList.add('visible');
}

/* ── SEARCH NAVIGATION ── */
function scrollToFeedCard(card) {
  const el = document.querySelector(`.card[data-card-id="${card.id.toLowerCase().replace('-', '')}"]`);
  if (el) {
    el.style.display = '';
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.boxShadow = '0 0 0 3px var(--coral)';
    setTimeout(() => el.style.boxShadow = '', 2000);
  }
}

function openArchiveAndScrollTo(card) {
  archiveDrawer.classList.add('open');
  archiveOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.querySelectorAll('.range-chip').forEach(c => c.classList.remove('active'));
  const range7d = document.querySelector('.range-chip[data-range="7d"]');
  if (range7d) range7d.classList.add('active');
  archiveFilters.range = '7d';
  applyArchiveFilters();

  setTimeout(() => {
    const archiveCards = document.querySelectorAll('.archive-card');
    for (const ac of archiveCards) {
      if (ac.querySelector('.archive-card-title').textContent.trim() === card.title.trim()) {
        ac.classList.add('expanded');
        ac.scrollIntoView({ behavior: 'smooth', block: 'center' });
        ac.style.boxShadow = '0 0 0 3px var(--coral)';
        setTimeout(() => ac.style.boxShadow = '', 2000);
        break;
      }
    }
  }, 350);
}

/* ── MOBILE SIDEBAR TOGGLE ── */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebarOverlay = document.getElementById('sidebarOverlay');

mobileMenuBtn.addEventListener('click', () => {
  sidebarExpanded = !sidebarExpanded;
  sidebar.classList.toggle('expanded', sidebarExpanded);
  sidebarOverlay.classList.toggle('open', sidebarExpanded);
});

sidebarOverlay.addEventListener('click', () => {
  sidebarExpanded = false;
  sidebar.classList.remove('expanded');
  sidebarOverlay.classList.remove('open');
});

/* ── ARCHIVE CARD EXPAND ── */
document.querySelectorAll('.archive-card').forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('.expand-open-x')) return;
    card.classList.toggle('expanded');
  });
});

/* ── TIMESTAMP TICKER ── */
let minutesAgo = 0;
setInterval(() => {
  minutesAgo++;
  const el = document.getElementById('updatedAgo');
  if (el) el.textContent = minutesAgo === 1 ? '1m ago' : `${minutesAgo}m ago`;
}, 60000);

/* ── BOOKMARK + SHARE ── */
const BOOKMARKS_KEY = 'medfeed_bookmarks';

function getBookmarks() {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || []; }
  catch { return []; }
}

function saveBookmarks(ids) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
  updateSavedCount();
}

function toggleBookmark(cardId) {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(cardId);
  if (idx > -1) bookmarks.splice(idx, 1);
  else bookmarks.push(cardId);
  saveBookmarks(bookmarks);
  return idx === -1;
}

function updateSavedCount() {
  const count = getBookmarks().length;
  const badge = document.getElementById('savedCountBadge');
  if (badge) badge.textContent = count;
}

function showToast(msg) {
  const toast = document.getElementById('shareToast');
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2000);
}

function shareCard(card) {
  const title = card.querySelector('.card-title').textContent;
  const handle = card.querySelector('.meta-handle').textContent;
  const meaning = card.querySelector('.meaning-text');
  const text = `${title}\n\n${meaning ? meaning.textContent : ''}\n\n— ${handle} via MedFeed`;

  if (navigator.share) {
    navigator.share({ title: 'MedFeed Finding', text }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard'));
  }
}

document.querySelectorAll('.card[data-card-id]').forEach(card => {
  const cardId = card.dataset.cardId;
  const meta = card.querySelector('.card-meta');
  if (!meta) return;

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const bookmarkBtn = document.createElement('button');
  bookmarkBtn.className = 'card-action-btn bookmark-btn';
  bookmarkBtn.setAttribute('aria-label', 'Bookmark');
  bookmarkBtn.innerHTML = '<svg viewBox="0 0 16 16" fill="none"><path d="M3 2h10v13l-5-3-5 3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  if (getBookmarks().includes(cardId)) bookmarkBtn.classList.add('bookmarked');

  bookmarkBtn.addEventListener('click', () => {
    const added = toggleBookmark(cardId);
    bookmarkBtn.classList.toggle('bookmarked', added);
    showToast(added ? 'Saved to bookmarks' : 'Removed from bookmarks');
  });

  const shareBtn = document.createElement('button');
  shareBtn.className = 'card-action-btn share-btn';
  shareBtn.setAttribute('aria-label', 'Share');
  shareBtn.innerHTML = '<svg viewBox="0 0 16 16" fill="none"><path d="M4 9v4h8V9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 2v8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M5 5l3-3 3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  shareBtn.addEventListener('click', () => shareCard(card));

  actions.appendChild(bookmarkBtn);
  actions.appendChild(shareBtn);
  meta.appendChild(actions);
});

// Saved filter
let savedFilterActive = false;
const savedFilterItem = document.getElementById('savedFilterItem');
if (savedFilterItem) {
  savedFilterItem.addEventListener('click', () => {
    savedFilterActive = !savedFilterActive;
    savedFilterItem.classList.toggle('active', savedFilterActive);
    if (savedFilterActive) {
      const bookmarks = getBookmarks();
      document.querySelectorAll('.card[data-card-id]').forEach(card => {
        card.style.display = bookmarks.includes(card.dataset.cardId) ? '' : 'none';
      });
      document.querySelectorAll('.feed-section').forEach(section => {
        const visible = section.querySelectorAll('.card:not([style*="display: none"])');
        section.style.display = visible.length === 0 ? 'none' : '';
      });
    } else {
      activeFilters.specialty = 'all';
      activeFilters.kind = 'all';
      activeFilters.source = 'all';
      document.querySelectorAll('.filter-item[data-filter]').forEach(i => {
        if (i.dataset.value === 'all') i.classList.add('active');
        else if (i.dataset.filter !== 'saved') i.classList.remove('active');
      });
      applyFilters();
    }
  });
}

updateSavedCount();

/* ── FOOTER TOGGLE ── */
document.getElementById('footerToggle').addEventListener('click', () => {
  const expanded = document.getElementById('footerExpanded');
  const btn = document.getElementById('footerToggle');
  const isOpen = expanded.classList.contains('open');
  expanded.classList.toggle('open', !isOpen);
  btn.textContent = isOpen ? 'Read more' : 'Show less';
});
