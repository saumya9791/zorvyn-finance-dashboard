// ══════════════════════════════════════════════════════════════
//  CONSTANTS & STORAGE KEY
// ══════════════════════════════════════════════════════════════
const STORAGE_KEY = 'zorvyn_saumyaFinanceLog';

// ══════════════════════════════════════════════════════════════
//  MOCK API — simulates a fetch with async/await + Promise
// ══════════════════════════════════════════════════════════════
const defaultTransactions = [
  { id:1,  desc:"Monthly Salary",    amount:95000, type:"income",  category:"salary",        date:"2025-06-01" },
  { id:2,  desc:"House Rent",         amount:22000, type:"expense", category:"housing",       date:"2025-06-02" },
  { id:3,  desc:"Freelance Project",  amount:18000, type:"income",  category:"freelance",     date:"2025-06-05" },
  { id:4,  desc:"Grocery Shopping",   amount:3800,  type:"expense", category:"food",          date:"2025-06-08" },
  { id:5,  desc:"Netflix & Spotify",  amount:1200,  type:"expense", category:"entertainment", date:"2025-06-10" },
  { id:6,  desc:"SIP Investment",     amount:10000, type:"expense", category:"investment",    date:"2025-06-12" },
  { id:7,  desc:"Dividends Received", amount:4500,  type:"income",  category:"investment",    date:"2025-06-15" },
  { id:8,  desc:"Dining Out",         amount:2800,  type:"expense", category:"food",          date:"2025-06-18" },
  { id:9,  desc:"Consulting Fee",     amount:25000, type:"income",  category:"freelance",     date:"2025-06-20" },
  { id:10, desc:"Electricity Bill",   amount:1600,  type:"expense", category:"bills",         date:"2025-06-22" },
  { id:11, desc:"Fuel Expenses",      amount:3200,  type:"expense", category:"transport",     date:"2025-06-24" },
  { id:12, desc:"Cashback Reward",    amount:850,   type:"income",  category:"other",         date:"2025-06-27" },
];

async function fetchTransactionsFromAPI() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(defaultTransactions), 900);
  });
}

// ══════════════════════════════════════════════════════════════
//  localStorage HELPERS
// ══════════════════════════════════════════════════════════════
function saveToStorage(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
}
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

// ══════════════════════════════════════════════════════════════
//  GLOBAL STATE
// ══════════════════════════════════════════════════════════════
let saumyaFinanceLog = [];

const userAssetRecords = [
  { name:"Savings Account", bank:"HDFC Bank",      balance:142500, icon:"🏦", growth:"+3.2%",  color:"#7c3aed" },
  { name:"Mutual Funds",    bank:"Zerodha Coin",   balance:87340,  icon:"📈", growth:"+11.4%", color:"#10b981" },
  { name:"Cash in Hand",    bank:"Physical Cash",  balance:12600,  icon:"💵", growth:"N/A",    color:"#f59e0b" },
  { name:"Fixed Deposit",   bank:"SBI Bank",       balance:200000, icon:"🔒", growth:"+6.5%",  color:"#3b82f6" },
  { name:"Digital Wallet",  bank:"PhonePe / GPay", balance:8240,   icon:"📱", growth:"N/A",    color:"#ec4899" },
  { name:"Gold Investment", bank:"Digital Gold",   balance:34800,  icon:"🥇", growth:"+8.9%",  color:"#f59e0b" },
];

const savingsGoals = [
  { name:"Royal Enfield Hunter 350", emoji:"🏍️", target:185000, saved:112000, deadline:"Dec 2025", color:"#7c3aed" },
  { name:"Emergency Fund",           emoji:"🛡️", target:300000, saved:210000, deadline:"Mar 2026", color:"#10b981" },
  { name:"Europe Vacation",          emoji:"✈️", target:150000, saved:42000,  deadline:"Jun 2026", color:"#f59e0b" },
  { name:"MacBook Pro M4",           emoji:"💻", target:200000, saved:156000, deadline:"Sep 2025", color:"#3b82f6" },
];

const categoryLabels = {
  salary:"💼 Salary", freelance:"🧑‍💻 Freelance", investment:"📈 Investment",
  food:"🍽 Food",     housing:"🏠 Housing",       bills:"⚡ Bills",
  transport:"🚗 Transport", entertainment:"🎬 Entertainment", other:"📦 Other"
};

// ══════════════════════════════════════════════════════════════
//  THEME
// ══════════════════════════════════════════════════════════════
let isDark = true;
function toggleTheme() {
  isDark = !isDark;
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.classList.toggle('light', !isDark);
  document.getElementById('sunIcon').style.display  = isDark ? 'none'  : 'block';
  document.getElementById('moonIcon').style.display = isDark ? 'block' : 'none';
  setTimeout(() => { destroyCharts(); initCharts(); }, 100);
}
document.documentElement.classList.add('dark');

// ══════════════════════════════════════════════════════════════
//  LAUNCH
// ══════════════════════════════════════════════════════════════
async function launchDashboard() {
  document.getElementById('landing').style.display   = 'none';
  document.getElementById('dashboard').style.display = 'block';

  showTableSkeleton();

  const cached = loadFromStorage();
  if (cached && cached.length > 0) {
    saumyaFinanceLog = cached;
  } else {
    saumyaFinanceLog = await fetchTransactionsFromAPI();
    saveToStorage(saumyaFinanceLog);
  }

  updateKPIs();
  renderWallet();
  renderGoals();
  applyFilters();
  setTimeout(initCharts, 100);
}

function showTableSkeleton() {
  const tbody = document.getElementById('transactionTable');
  tbody.innerHTML = Array(5).fill('').map(() => `
    <tr>
      <td class="px-5 py-4"><div class="skeleton h-4 w-36"></div></td>
      <td class="px-5 py-4"><div class="skeleton h-4 w-20"></div></td>
      <td class="px-5 py-4"><div class="skeleton h-4 w-24"></div></td>
      <td class="px-5 py-4"><div class="skeleton h-4 w-16"></div></td>
      <td class="px-5 py-4 text-right"><div class="skeleton h-4 w-20 ml-auto"></div></td>
    </tr>`).join('');
}

// ══════════════════════════════════════════════════════════════
//  SIDEBAR / NAV
// ══════════════════════════════════════════════════════════════
function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('overlay');
  s.classList.toggle('open');
  o.style.display = s.classList.contains('open') ? 'block' : 'none';
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').style.display = 'none';
}

const tabTitles = { overview:'Overview', wallet:'My Wallet', goals:'Savings Goals', history:'History' };
function switchTab(tab, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  el.classList.add('active');
  document.getElementById('pageTitle').textContent = tabTitles[tab];
  closeSidebar();
}

function handleRoleChange(val) {
  document.getElementById('addTxnBtn').style.display = val === 'viewer' ? 'none' : '';
}

// ══════════════════════════════════════════════════════════════
//  KPIs
// ══════════════════════════════════════════════════════════════
const fmt = n => '₹' + n.toLocaleString('en-IN');
function updateKPIs() {
  const income  = saumyaFinanceLog.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const expense = saumyaFinanceLog.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const avg     = saumyaFinanceLog.length ? Math.round((income+expense)/saumyaFinanceLog.length) : 0;
  document.getElementById('kpiBalance').textContent = fmt(income - expense);
  document.getElementById('kpiIncome').textContent  = fmt(income);
  document.getElementById('kpiExpense').textContent = fmt(expense);
  document.getElementById('kpiProfit').textContent  = fmt(income - expense);
  document.getElementById('kpiProfit').style.color  = income >= expense ? '#10b981' : '#ef4444';
  document.getElementById('kpiAvg').textContent     = fmt(avg);
}

// ══════════════════════════════════════════════════════════════
//  CHARTS
// ══════════════════════════════════════════════════════════════
let charts = {};
function destroyCharts() {
  Object.values(charts).forEach(c => c && c.destroy && c.destroy());
  charts = {};
}
function chartColors() {
  return isDark
    ? { grid:'rgba(129,140,248,0.08)', text:'#94a3b8' }
    : { grid:'rgba(99,102,241,0.1)',   text:'#64748b' };
}
function initCharts() {
  const cc = chartColors();
  const months      = ['Jan','Feb','Mar','Apr','May','Jun'];
  const incomeData  = [58000,72000,65000,88000,76000,143350];
  const expenseData = [42000,55000,48000,61000,57000,44600];

  charts.cashFlow = new Chart(document.getElementById('cashFlowChart'), {
    type:'line',
    data:{ labels:months, datasets:[
      { label:'Income',   data:incomeData,  borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0.08)',  borderWidth:2.5, fill:true, tension:0.4, pointBackgroundColor:'#10b981', pointRadius:4 },
      { label:'Expenses', data:expenseData, borderColor:'#7c3aed', backgroundColor:'rgba(124,58,237,0.08)', borderWidth:2.5, fill:true, tension:0.4, pointBackgroundColor:'#7c3aed', pointRadius:4 },
    ]},
    options:{ responsive:true,
      plugins:{ legend:{ labels:{ color:cc.text, font:{family:'Plus Jakarta Sans',size:12} } } },
      scales:{ x:{ grid:{color:cc.grid}, ticks:{color:cc.text} }, y:{ grid:{color:cc.grid}, ticks:{color:cc.text, callback:v=>'₹'+v.toLocaleString('en-IN')} } } }
  });

  charts.doughnut = new Chart(document.getElementById('doughnutChart'), {
    type:'doughnut',
    data:{ labels:['Housing','Food','Bills','Investment','Entertainment','Transport'],
      datasets:[{ data:[22000,6600,1600,10000,1200,3200], backgroundColor:['#7c3aed','#10b981','#f59e0b','#3b82f6','#ec4899','#ef4444'], borderWidth:0, hoverOffset:8 }]
    },
    options:{ responsive:true, cutout:'68%',
      plugins:{ legend:{ position:'bottom', labels:{ color:cc.text, font:{family:'Plus Jakarta Sans',size:11}, padding:14 } } } }
  });

  charts.bar = new Chart(document.getElementById('barChart'), {
    type:'bar',
    data:{ labels:months, datasets:[
      { label:'Income',   data:incomeData,  backgroundColor:'rgba(16,185,129,0.75)', borderRadius:6 },
      { label:'Expenses', data:expenseData, backgroundColor:'rgba(124,58,237,0.65)', borderRadius:6 },
    ]},
    options:{ responsive:true,
      plugins:{ legend:{ labels:{ color:cc.text, font:{family:'Plus Jakarta Sans',size:12} } } },
      scales:{ x:{ grid:{display:false}, ticks:{color:cc.text} }, y:{ grid:{color:cc.grid}, ticks:{color:cc.text, callback:v=>'₹'+v.toLocaleString('en-IN')} } } }
  });
}

// ══════════════════════════════════════════════════════════════
//  WALLET & GOALS
// ══════════════════════════════════════════════════════════════
function renderWallet() {
  document.getElementById('walletGrid').innerHTML = userAssetRecords.map(a => `
    <div class="wallet-card">
      <div class="flex items-start justify-between mb-4">
        <div class="text-3xl">${a.icon}</div>
        <span class="text-xs font-600 px-2.5 py-1 rounded-full" style="background:${a.color}20;color:${a.color};">${a.growth}</span>
      </div>
      <div class="font-700 text-base logo-text mb-1">${a.name}</div>
      <div class="text-xs mb-3" style="color:#94a3b8;">${a.bank}</div>
      <div class="text-2xl font-800" style="color:${a.color};letter-spacing:-0.02em;">${fmt(a.balance)}</div>
    </div>`).join('');
}

function renderGoals() {
  document.getElementById('goalsGrid').innerHTML = savingsGoals.map(g => {
    const pct = Math.min(100, Math.round((g.saved/g.target)*100));
    return `
    <div class="goal-card">
      <div class="flex items-center gap-3 mb-4">
        <div class="text-3xl">${g.emoji}</div>
        <div>
          <div class="font-700 logo-text">${g.name}</div>
          <div class="text-xs mt-0.5" style="color:#94a3b8;">Target: ${fmt(g.target)} · Deadline: ${g.deadline}</div>
        </div>
      </div>
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-600" style="color:${g.color};">${fmt(g.saved)} saved</span>
        <span class="text-sm font-700 logo-text">${pct}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${pct}%;background:linear-gradient(90deg,${g.color},${g.color}cc);"></div>
      </div>
      <div class="flex justify-between mt-2 text-xs" style="color:#94a3b8;">
        <span>${fmt(g.target - g.saved)} remaining</span>
        <span>${fmt(g.target)} goal</span>
      </div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════════
//  ADVANCED FILTERING
// ══════════════════════════════════════════════════════════════
function applyFilters() {
  const q    = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  const type = document.getElementById('filterType').value;
  const cat  = document.getElementById('filterCategory').value;

  const filtered = [...saumyaFinanceLog].reverse().filter(t => {
    const matchText = !q || t.desc.toLowerCase().includes(q);
    const matchType = type === 'all' || t.type === type;
    const matchCat  = cat  === 'all' || t.category === cat;
    return matchText && matchType && matchCat;
  });

  document.getElementById('filterCount').textContent =
    `Showing ${filtered.length} of ${saumyaFinanceLog.length} transactions`;

  renderTable(filtered);
}

function clearFilters() {
  document.getElementById('searchInput').value    = '';
  document.getElementById('filterType').value     = 'all';
  document.getElementById('filterCategory').value = 'all';
  applyFilters();
}

function renderTable(data) {
  const tbody = document.getElementById('transactionTable');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="px-5 py-10 text-center text-sm" style="color:#94a3b8;">No transactions match your filters</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(t => `
    <tr class="table-row border-b" style="border-color:rgba(129,140,248,0.07);">
      <td class="px-5 py-3.5 font-500 logo-text">${t.desc}</td>
      <td class="px-5 py-3.5 text-xs font-500" style="color:#94a3b8;">${categoryLabels[t.category] || t.category || '—'}</td>
      <td class="px-5 py-3.5 text-xs" style="color:#94a3b8;">${t.date}</td>
      <td class="px-5 py-3.5">
        <span class="text-xs font-600 px-2.5 py-1 rounded-full ${t.type==='income'?'badge-income':'badge-expense'}">${t.type==='income'?'Income':'Expense'}</span>
      </td>
      <td class="px-5 py-3.5 text-right font-700" style="color:${t.type==='income'?'#10b981':'#ef4444'};">
        ${t.type==='income'?'+':'-'}${fmt(t.amount)}
      </td>
    </tr>`).join('');
}

// ══════════════════════════════════════════════════════════════
//  CSV EXPORT
// ══════════════════════════════════════════════════════════════
function exportCSV() {
  const q    = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  const type = document.getElementById('filterType').value;
  const cat  = document.getElementById('filterCategory').value;

  const toExport = [...saumyaFinanceLog].reverse().filter(t => {
    const matchText = !q || t.desc.toLowerCase().includes(q);
    const matchType = type === 'all' || t.type === type;
    const matchCat  = cat  === 'all' || t.category === cat;
    return matchText && matchType && matchCat;
  });

  const headers = ['ID','Description','Category','Date','Type','Amount (INR)'];
  const rows = toExport.map(t => [
    t.id,
    `"${t.desc.replace(/"/g,'""')}"`,
    categoryLabels[t.category] ? categoryLabels[t.category].replace(/[^\w\s&]/g,'').trim() : (t.category || 'Other'),
    t.date,
    t.type.charAt(0).toUpperCase() + t.type.slice(1),
    t.amount
  ]);

  const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `zorvyn_report_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast('📥 Report downloaded successfully!', '#059669');
}

// ══════════════════════════════════════════════════════════════
//  MODAL & ADD TRANSACTION
// ══════════════════════════════════════════════════════════════
function openModal() {
  const m = document.getElementById('modal');
  m.style.removeProperty('display');
  m.style.display = 'flex';
  document.getElementById('txnDesc').value     = '';
  document.getElementById('txnAmount').value   = '';
  document.getElementById('txnType').value     = 'income';
  document.getElementById('txnCategory').value = 'salary';
}
function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function addTransaction() {
  const desc     = document.getElementById('txnDesc').value.trim();
  const amount   = parseFloat(document.getElementById('txnAmount').value);
  const type     = document.getElementById('txnType').value;
  const category = document.getElementById('txnCategory').value;

  if (!desc)                { toast('⚠️ Please enter a description.', '#ef4444'); return; }
  if (!amount || amount<=0) { toast('⚠️ Please enter a valid amount.', '#ef4444'); return; }

  const newTxn = {
    id: Date.now(), desc, amount, type, category,
    date: new Date().toISOString().split('T')[0]
  };

  saumyaFinanceLog.push(newTxn);
  saveToStorage(saumyaFinanceLog);
  updateKPIs();
  applyFilters();
  closeModal();
  toast('✓ Transaction saved & persisted!', '#7c3aed');
}

document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ══════════════════════════════════════════════════════════════
//  TOAST HELPER
// ══════════════════════════════════════════════════════════════
function toast(msg, color='#7c3aed') {
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:${color}; color:#fff;
    padding:12px 20px; border-radius:12px;
    font-size:14px; font-weight:600;
    font-family:'Plus Jakarta Sans',sans-serif;
    animation:fadeInUp 0.3s ease;
    box-shadow:0 8px 24px rgba(0,0,0,0.3);
    max-width:320px;
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}