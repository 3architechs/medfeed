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

/* ── FILTER ITEMS ── */
document.querySelectorAll('.filter-item').forEach(item => {
  item.addEventListener('click', () => {
    const filterType = item.dataset.filter;
    document.querySelectorAll(`.filter-item[data-filter="${filterType}"]`).forEach(i => {
      i.classList.remove('active');
    });
    item.classList.add('active');
  });
});

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

document.querySelectorAll('.range-chip[data-range]').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.range-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const customDates = document.getElementById('customDates');
    if (chip.dataset.range === 'custom') {
      customDates.classList.add('open');
    } else {
      customDates.classList.remove('open');
    }
  });
});

document.getElementById('dateApply').addEventListener('click', () => {
  const from = document.getElementById('dateFrom').value;
  const to = document.getElementById('dateTo').value;
  if (from && to) {
    console.log('Custom range:', from, '→', to);
  }
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
    handle: '@PeterMcCulloughMD',
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

  searchResultCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;
  while (searchResultsEl.firstChild) searchResultsEl.removeChild(searchResultsEl.firstChild);

  if (results.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'search-empty';
    empty.textContent = 'No findings matched. Try different keywords.';
    searchResultsEl.appendChild(empty);
  } else {
    results.forEach(card => {
      const item = document.createElement('div');
      item.className = 'search-result-item';

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

      item.appendChild(titleDiv);
      item.appendChild(metaDiv);
      searchResultsEl.appendChild(item);
    });
  }

  searchDropdown.classList.add('visible');
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

/* ── TIMESTAMP TICKER ── */
let minutesAgo = 0;
setInterval(() => {
  minutesAgo++;
  const el = document.getElementById('updatedAgo');
  if (el) el.textContent = minutesAgo === 1 ? '1m ago' : `${minutesAgo}m ago`;
}, 60000);

/* ── FOOTER TOGGLE ── */
document.getElementById('footerToggle').addEventListener('click', () => {
  const expanded = document.getElementById('footerExpanded');
  const btn = document.getElementById('footerToggle');
  const isOpen = expanded.classList.contains('open');
  expanded.classList.toggle('open', !isOpen);
  btn.textContent = isOpen ? 'Read more' : 'Show less';
});
