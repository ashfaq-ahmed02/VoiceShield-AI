/* =====================================================
   VoiceShield AI — frontend logic
   ===================================================== */
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : '/api';

const state = {
  currentPage: 'home',
  currentTab: 'overview',
  threatFilter: 'all',
  threatSearch: '',
  threats: [],
  speakers: [],
  liveCalls: [],
};

/* ---------- helpers ---------- */
function $(sel, ctx = document){ return ctx.querySelector(sel); }
function $all(sel, ctx = document){ return Array.from(ctx.querySelectorAll(sel)); }

function showToast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('show'), 2400);
}

function riskLabel(score){
  if (score < 30) return { level: 'LOW', action: 'ALLOW', cls: 'risk-low' };
  if (score < 60) return { level: 'MEDIUM', action: 'REQUEST VERIFICATION', cls: 'risk-medium' };
  if (score < 85) return { level: 'HIGH', action: 'BLOCK ACTION', cls: 'risk-high' };
  return { level: 'CRITICAL', action: 'BLOCK + ESCALATE', cls: 'risk-critical' };
}

/* ---------- waveform bars ---------- */
function buildWaveform(el, bars = 40){
  el.innerHTML = '';
  for (let i = 0; i < bars; i++){
    const bar = document.createElement('span');
    bar.style.height = `${20 + Math.random() * 80}%`;
    bar.style.animationDuration = `${0.6 + Math.random() * 0.9}s`;
    bar.style.animationDelay = `${Math.random() * 0.5}s`;
    el.appendChild(bar);
  }
}

/* ---------- page / tab routing ---------- */
function goToPage(page){
  state.currentPage = page;
  const home = $('#page-home');
  const app = $('#app');
  if (page === 'console' || page === 'api'){
    home.hidden = true;
    app.hidden = false;
    if (page === 'api') switchTab('api');
    window.scrollTo(0, 0);
  } else {
    app.hidden = true;
    home.hidden = false;
    window.scrollTo(0, 0);
  }
}

function switchTab(tab){
  state.currentTab = tab;
  $all('.tab-panel').forEach(p => p.classList.remove('active'));
  $all('.side-link').forEach(l => l.classList.remove('active'));
  const panel = $(`#tab-${tab}`);
  const link = $(`.side-link[data-tab="${tab}"]`);
  if (panel) panel.classList.add('active');
  if (link) link.classList.add('active');

  const titles = {
    overview: 'Voice Security Console', live: 'Live Monitoring', threats: 'Threat Intelligence',
    investigation: 'Call Investigation', analytics: 'Security Analytics', speakers: 'Speaker Profiles',
    risk: 'Context-Aware Risk Engine', api: 'Security API', settings: 'Settings'
  };
  $('#tabTitle').textContent = titles[tab] || 'Voice Security Console';

  if (tab === 'analytics' && !state.chartsBuilt) buildCharts();
  if (tab === 'threats') renderThreatTable();
  if (tab === 'live') renderLiveCallsTable();
  if (tab === 'speakers') renderSpeakersTable();

  $('#sidebar').classList.remove('open');
}

/* ---------- nav wiring ---------- */
$all('[data-nav]').forEach(el => el.addEventListener('click', () => goToPage(el.dataset.nav)));
$all('[data-scroll]').forEach(el => el.addEventListener('click', (e) => {
  e.preventDefault();
  goToPage('home');
  requestAnimationFrame(() => {
    const target = document.getElementById(el.dataset.scroll);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
}));
$all('.side-link').forEach(el => el.addEventListener('click', () => switchTab(el.dataset.tab)));

$('#navBurger').addEventListener('click', () => $('#navLinks').classList.toggle('open'));
$('#sidebarBurger').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#loginBtn').addEventListener('click', () => showToast('Login is a demo prototype for the SIH presentation.'));
$('#contactLink').addEventListener('click', (e) => { e.preventDefault(); showToast('Reach Team_Pikachu via the SIH portal.'); });

/* ---------- hero counters ---------- */
function animateCount(el, target, opts = {}){
  const { duration = 1400, decimals = 0, prefix = '', suffix = '' } = opts;
  const start = performance.now();
  function frame(now){
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = target * eased;
    el.textContent = prefix + val.toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function initHeroStats(){
  animateCount($('#statCalls'), 12847, { suffix: '' });
  animateCount($('#statThreats'), 184);
  animateCount($('#statAccuracy'), 99.2, { decimals: 1, suffix: '%' });
  $all('.market-value').forEach(el => {
    const target = parseFloat(el.dataset.count);
    animateCount(el, target, { decimals: 2, prefix: el.dataset.prefix, suffix: el.dataset.suffix });
  });
}

/* ---------- research cards ---------- */
const RESEARCH_REFS = [
  'NIST AI Risk Management Framework', 'NIST Cybersecurity Framework', 'ITU-T X.1060',
  'OWASP AI Security & Privacy Guide', 'ASVspoof 2021', 'WaveFake', 'SpeechFake', 'IEEE Xplore'
];
function renderResearchGrid(){
  const grid = $('#researchGrid');
  grid.innerHTML = RESEARCH_REFS.map(ref => `
    <div class="research-card">
      <span>${ref}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
    </div>`).join('');
}

/* ---------- metric rings ---------- */
function paintRings(){
  $all('.metric-ring').forEach(r => r.style.setProperty('--v', r.dataset.value));
}

/* ---------- risk scoring engine ---------- */
function applyRisk(score){
  const { level, action, cls } = riskLabel(score);

  const banner = $('#riskBanner');
  banner.className = `risk-banner ${cls}`;
  $('#riskScoreOverview').textContent = `${score} / 100`;
  $('#riskStatusOverview').textContent = `${level} RISK`;

  $('#riskEngineScore').textContent = score;
  $('#riskEngineLevel').textContent = level;
  $('#riskEngineAction').textContent = action;
  $('#riskMarker').style.left = `${Math.min(100, score)}%`;

  const responseList = $('#responseList');
  if (level === 'LOW'){
    responseList.innerHTML = '<li>✓ Allow transaction</li><li>✓ Continue monitoring</li>';
  } else if (level === 'MEDIUM'){
    responseList.innerHTML = '<li>⚠ Additional verification required</li><li>⚠ Request callback</li>';
  } else {
    responseList.innerHTML = '<li>🚨 Block sensitive action</li><li>🚨 Escalate to security team</li><li>🚨 Trigger manual verification</li>';
  }
  $('#responseNote').textContent = 'No action taken yet for this call.';
}

/* ---------- demo scenarios ---------- */
const SCENARIOS = {
  safe:      { integrity: 96, match: 94, synthetic: 3,  context: 12, risk: 8,  status: 'ANALYZING', label: 'VERIFIED' },
  suspicious:{ integrity: 78, match: 71, synthetic: 22, context: 48, risk: 42, status: 'ANALYZING', label: 'REVIEW' },
  clone:     { integrity: 55, match: 38, synthetic: 88, context: 60, risk: 79, status: 'ANALYZING', label: 'FLAGGED' },
  highrisk:  { integrity: 31, match: 22, synthetic: 96, context: 85, risk: 94, status: 'ANALYZING', label: 'CRITICAL' },
};

function setMetricRing(id, value, warn = false){
  const ring = document.querySelector(`#tab-overview .metric-ring[data-value]`);
}

function applyScenarioLocally(key){
  const s = SCENARIOS[key];
  const rings = $all('.metric-ring');
  const values = [s.integrity, s.match, s.synthetic, s.context];
  rings.forEach((ring, i) => {
    ring.dataset.value = values[i];
    ring.style.setProperty('--v', values[i]);
    ring.querySelector('span').textContent = `${values[i]}%`;
  });
  applyRisk(s.risk);
  $('#callStatusPill').textContent = s.status;
}

async function runLiveAnalysis(){
  const btn = $('#startAnalysisBtn');
  const scenario = $('#scenarioSelect').value;
  btn.disabled = true;
  btn.textContent = 'Analyzing…';
  $('#callStatusPill').textContent = 'ANALYZING';
  buildWaveform($('#liveWaveform'), 60);

  try{
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ call_id: $('#callId').textContent, scenario })
    });
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    setTimeout(() => {
      const rings = $all('.metric-ring');
      const values = [
        Math.round(data.voice_integrity * 100),
        Math.round(data.speaker_match * 100),
        Math.round(data.synthetic_probability * 100),
        Math.round(data.context_risk * 100),
      ];
      rings.forEach((ring, i) => {
        ring.dataset.value = values[i];
        ring.style.setProperty('--v', values[i]);
        ring.querySelector('span').textContent = `${values[i]}%`;
      });
      applyRisk(data.risk_score);
      $('#callStatusPill').textContent = data.risk_score < 30 ? 'VERIFIED' : data.risk_score < 60 ? 'REVIEW' : 'FLAGGED';
      btn.disabled = false;
      btn.textContent = 'Start Live Analysis';
      showToast(`Analysis complete — recommendation: ${data.recommendation}`);
    }, 900);
  } catch(err){
    // graceful fallback if backend isn't running
    setTimeout(() => {
      applyScenarioLocally(scenario);
      btn.disabled = false;
      btn.textContent = 'Start Live Analysis';
      showToast('Backend unreachable — showing simulated result.');
    }, 900);
  }
}

$('#startAnalysisBtn').addEventListener('click', runLiveAnalysis);
$('#scenarioSelect').addEventListener('change', (e) => applyScenarioLocally(e.target.value));

/* response action buttons */
function wireResponseButtons(){
  $('#approveBtn').addEventListener('click', () => {
    $('#responseNote').textContent = 'Transaction approved and call marked as verified.';
    showToast('Action recorded: Approved');
  });
  $('#verifyBtn').addEventListener('click', () => {
    $('#responseNote').textContent = 'Callback requested — caller must complete additional verification.';
    showToast('Action recorded: Verification requested');
  });
  $('#blockBtn').addEventListener('click', () => {
    $('#responseNote').textContent = 'Action blocked and escalated to the security team.';
    showToast('Action recorded: Blocked & escalated');
  });
}

/* ---------- mock data ---------- */
function generateThreats(){
  const callers = ['+91 98XXX41029', '+91 90XXX77213', '+91 87XXX56302', '+91 99XXX10087', '+91 81XXX33940', '+91 76XXX90211'];
  const types = ['Voice Clone', 'Synthetic Voice', 'Spoof Attempt', 'Normal Call', 'Replay Attack'];
  const rows = [];
  for (let i = 0; i < 24; i++){
    const type = types[Math.floor(Math.random() * types.length)];
    let confidence, risk, status;
    if (type === 'Normal Call'){ confidence = Math.floor(Math.random() * 10); risk = 'Low'; status = 'Allowed'; }
    else {
      confidence = 55 + Math.floor(Math.random() * 44);
      risk = confidence > 90 ? 'Critical' : confidence > 75 ? 'High' : 'Medium';
      status = risk === 'Critical' ? 'Blocked' : risk === 'High' ? 'Investigating' : 'Verified';
    }
    const h = String(9 + Math.floor(Math.random() * 9)).padStart(2, '0');
    const m = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    rows.push({ time: `${h}:${m}`, caller: callers[Math.floor(Math.random() * callers.length)], type, confidence, risk, status });
  }
  return rows.sort((a, b) => b.time.localeCompare(a.time));
}

function generateSpeakers(){
  return [
    { name: 'Rajesh Kumar', role: 'Account Holder', samples: 14, last: '2 minutes ago', status: 'Active' },
    { name: 'Anita Sharma', role: 'Relationship Manager', samples: 9, last: '1 hour ago', status: 'Active' },
    { name: 'Vikram Singh', role: 'Executive', samples: 22, last: '3 hours ago', status: 'Active' },
    { name: 'Priya Nair', role: 'Account Holder', samples: 6, last: '1 day ago', status: 'Pending Re-enrollment' },
    { name: 'Suresh Iyer', role: 'Account Holder', samples: 11, last: '4 hours ago', status: 'Active' },
  ];
}

function generateLiveCalls(){
  const rows = [];
  const networks = ['VoIP', 'GSM', 'VoLTE'];
  for (let i = 0; i < 8; i++){
    const risk = Math.floor(Math.random() * 100);
    rows.push({
      id: `VS-${20400 + Math.floor(Math.random() * 999)}`,
      caller: 'Unknown Caller',
      duration: `${String(Math.floor(Math.random()*6)).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
      network: networks[Math.floor(Math.random() * networks.length)],
      risk,
      status: risk < 30 ? 'Verified' : risk < 60 ? 'Monitoring' : 'Flagged',
    });
  }
  return rows;
}

/* ---------- table renderers ---------- */
function riskChipHtml(risk){
  const map = { Low: 'pill-pass', Medium: 'pill-warn', High: 'pill-danger', Critical: 'pill-danger' };
  return `<span class="pill ${map[risk] || 'pill-pass'}">${risk}</span>`;
}

function renderThreatTable(){
  const tbody = $('#threatTable tbody');
  const term = state.threatSearch.toLowerCase();
  const rows = state.threats.filter(r => {
    const matchesFilter = state.threatFilter === 'all' || r.risk.toLowerCase() === state.threatFilter;
    const matchesSearch = !term || r.caller.toLowerCase().includes(term) || r.type.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });
  tbody.innerHTML = rows.map((r, idx) => `
    <tr data-idx="${idx}">
      <td>${r.time}</td><td>${r.caller}</td><td>${r.type}</td><td>${r.confidence}%</td>
      <td>${riskChipHtml(r.risk)}</td><td>${r.status}</td>
    </tr>`).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--text-dim)">No matching threats.</td></tr>`;

  $all('#threatTable tbody tr').forEach(tr => tr.addEventListener('click', () => {
    switchTab('investigation');
    highlightSidebar('investigation');
  }));
}

function highlightSidebar(tab){
  $all('.side-link').forEach(l => l.classList.remove('active'));
  const link = $(`.side-link[data-tab="${tab}"]`);
  if (link) link.classList.add('active');
}

function renderSpeakersTable(){
  const tbody = $('#speakersTable tbody');
  tbody.innerHTML = state.speakers.map(s => `
    <tr><td>${s.name}</td><td>${s.role}</td><td>${s.samples}</td><td>${s.last}</td>
    <td>${s.status === 'Active' ? '<span class="pill pill-pass">Active</span>' : '<span class="pill pill-warn">Pending</span>'}</td></tr>
  `).join('');
}

function renderLiveCallsTable(){
  const tbody = $('#liveCallsTable tbody');
  tbody.innerHTML = state.liveCalls.map(c => `
    <tr><td>${c.id}</td><td>${c.caller}</td><td>${c.duration}</td><td>${c.network}</td>
    <td>${c.risk}</td><td>${riskChipHtml(c.risk < 30 ? 'Low' : c.risk < 60 ? 'Medium' : c.risk < 85 ? 'High' : 'Critical')}</td></tr>
  `).join('');
}

/* ---------- filters ---------- */
$('#threatFilters').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-chip');
  if (!btn) return;
  $all('#threatFilters .filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  state.threatFilter = btn.dataset.filter;
  renderThreatTable();
});
$('#threatSearch').addEventListener('input', (e) => {
  state.threatSearch = e.target.value;
  renderThreatTable();
});
$('#analyticsFilters').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-chip');
  if (!btn) return;
  $all('#analyticsFilters .filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  refreshCharts(btn.dataset.range);
});

/* ---------- investigation meta ---------- */
function renderInvestigationMeta(){
  const fields = [
    ['Call ID', 'VS-20481'], ['Timestamp', '14:32:07'], ['Caller', 'Unknown Caller'],
    ['Duration', '04:32'], ['Location', 'Unresolved (VPN)'], ['Network', 'VoIP'], ['Device', 'Unknown / spoofed'],
  ];
  $('#investigationMeta').innerHTML = fields.map(([k, v]) => `<div><span>${k}</span><strong>${v}</strong></div>`).join('');
}

/* ---------- charts ---------- */
const chartColors = { cyan: '#3ddbd9', blue: '#4c8dff', amber: '#f2a93c', red: '#ff5b5f', green: '#33d69f', grid: 'rgba(255,255,255,.06)', text: '#8592a6' };
let charts = {};

function baseOptions(extra = {}){
  return Object.assign({
    responsive: true,
    plugins: { legend: { labels: { color: chartColors.text, font: { family: 'Inter', size: 11 } } } },
    scales: {
      x: { ticks: { color: chartColors.text, font: { size: 10 } }, grid: { color: chartColors.grid } },
      y: { ticks: { color: chartColors.text, font: { size: 10 } }, grid: { color: chartColors.grid } },
    },
  }, extra);
}

function buildCharts(){
  state.chartsBuilt = true;
  const labels24h = Array.from({ length: 12 }, (_, i) => `${i * 2}:00`);

  charts.threats = new Chart($('#chartThreats'), {
    type: 'line',
    data: { labels: labels24h, datasets: [{ label: 'Threats', data: randomSeries(12, 5, 40), borderColor: chartColors.red, backgroundColor: 'rgba(255,91,95,.12)', fill: true, tension: 0.35 }] },
    options: baseOptions(),
  });

  charts.accuracy = new Chart($('#chartAccuracy'), {
    type: 'line',
    data: { labels: labels24h, datasets: [{ label: 'Accuracy %', data: randomSeries(12, 94, 99.5), borderColor: chartColors.cyan, backgroundColor: 'rgba(61,219,217,.12)', fill: true, tension: 0.35 }] },
    options: baseOptions({ scales: { x: { ticks: { color: chartColors.text }, grid: { color: chartColors.grid } }, y: { min: 90, max: 100, ticks: { color: chartColors.text }, grid: { color: chartColors.grid } } } }),
  });

  charts.distribution = new Chart($('#chartDistribution'), {
    type: 'doughnut',
    data: {
      labels: ['AI Voice Clone', 'Synthetic Speech', 'Replay Attack', 'Spoofing', 'Normal'],
      datasets: [{ data: [28, 19, 11, 15, 27], backgroundColor: [chartColors.red, chartColors.amber, '#c56bff', chartColors.blue, chartColors.green], borderWidth: 0 }],
    },
    options: { plugins: { legend: { position: 'bottom', labels: { color: chartColors.text, font: { size: 10 } } } } },
  });

  charts.risk = new Chart($('#chartRisk'), {
    type: 'bar',
    data: { labels: ['Low', 'Medium', 'High', 'Critical'], datasets: [{ data: [61, 22, 11, 6], backgroundColor: [chartColors.green, chartColors.amber, '#ff8a5c', chartColors.red], borderRadius: 6 }] },
    options: baseOptions({ plugins: { legend: { display: false } } }),
  });
}

function refreshCharts(range){
  if (!state.chartsBuilt) return;
  const points = { '24h': 12, '7d': 7, '30d': 30, '90d': 12 }[range] || 12;
  charts.threats.data.labels = rangeLabels(range, points);
  charts.threats.data.datasets[0].data = randomSeries(points, 5, 45);
  charts.accuracy.data.labels = rangeLabels(range, points);
  charts.accuracy.data.datasets[0].data = randomSeries(points, 93, 99.6);
  charts.threats.update();
  charts.accuracy.update();
}

function rangeLabels(range, n){
  if (range === '24h') return Array.from({ length: n }, (_, i) => `${i * 2}:00`);
  if (range === '7d') return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  if (range === '30d') return Array.from({ length: n }, (_, i) => `Day ${i + 1}`);
  return Array.from({ length: n }, (_, i) => `Week ${i + 1}`);
}
function randomSeries(n, min, max){
  return Array.from({ length: n }, () => +(min + Math.random() * (max - min)).toFixed(1));
}

/* ---------- API demo tab ---------- */
function wireApiTab(){
  $('#copyKeyBtn').addEventListener('click', () => {
    navigator.clipboard?.writeText('vs_live_9f3d8172ac5e4d3f9a').catch(() => {});
    showToast('API key copied to clipboard.');
  });
  $('#genKeyBtn').addEventListener('click', () => {
    const key = 'vs_live_' + Math.random().toString(16).slice(2, 18);
    $('#apiKeyDisplay').textContent = key.slice(0, 12) + '••••••••••••' + key.slice(-4);
    showToast('New API key generated.');
  });
  $('#runApiBtn').addEventListener('click', async () => {
    const out = $('#apiResponseBlock');
    out.textContent = 'Sending request…';
    try{
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ call_id: 'VS-20481', scenario: 'suspicious' })
      });
      const data = await res.json();
      out.textContent = JSON.stringify(data, null, 2);
    } catch(err){
      out.textContent = JSON.stringify({
        voice_integrity: 0.94, speaker_match: 0.87, synthetic_probability: 0.08,
        context_risk: 0.21, risk_score: 18, recommendation: 'ALLOW',
        note: 'Simulated response — backend not reachable.'
      }, null, 2);
    }
  });
}

/* ---------- init ---------- */
function init(){
  renderResearchGrid();
  initHeroStats();
  buildWaveform($('#heroWaveform'), 32);
  buildWaveform($('#liveWaveform'), 60);
  paintRings();
  wireResponseButtons();
  wireApiTab();
  renderInvestigationMeta();

  state.threats = generateThreats();
  state.speakers = generateSpeakers();
  state.liveCalls = generateLiveCalls();

  applyRisk(18);
}

document.addEventListener('DOMContentLoaded', init);