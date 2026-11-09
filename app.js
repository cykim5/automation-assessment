// Automation assessment: score tasks on robot feasibility and business fit.

const STORAGE_KEY = "automation-assessment-tasks";

const EXAMPLE = [
  { name: "CNC machine tending", action: 4, object: 5, environment: 4, hours: 80, rate: 32, cost: 120000, strategic: 4 },
  { name: "End-of-line palletizing", action: 5, object: 4, environment: 4, hours: 60, rate: 28, cost: 150000, strategic: 3 },
  { name: "Visual quality inspection", action: 4, object: 3, environment: 4, hours: 40, rate: 30, cost: 60000, strategic: 5 },
  { name: "Kitting mixed parts", action: 3, object: 2, environment: 3, hours: 50, rate: 26, cost: 140000, strategic: 3 },
  { name: "Deburring castings", action: 2, object: 3, environment: 3, hours: 60, rate: 34, cost: 150000, strategic: 5 },
  { name: "Packing soft goods", action: 2, object: 1, environment: 3, hours: 70, rate: 24, cost: 200000, strategic: 2 },
  { name: "Labeling boxes", action: 5, object: 5, environment: 5, hours: 6, rate: 24, cost: 45000, strategic: 1 },
];

const BLANK = { name: "", action: 3, object: 3, environment: 3, hours: 20, rate: 30, cost: 100000, strategic: 3 };

let tasks = load();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (e) { /* storage unavailable */ }
  return [];
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (e) { /* ignore */ }
}

// ---------- Scoring ----------

function paybackMonths(t) {
  const yearlySavings = t.hours * 52 * t.rate;
  if (yearlySavings <= 0) return Infinity;
  return t.cost / (yearlySavings / 12);
}

function financialScore(months) {
  if (months <= 12) return 5;
  if (months <= 24) return 4;
  if (months <= 36) return 3;
  if (months <= 60) return 2;
  return 1;
}

function score(t) {
  const feasibility = (t.action + t.object + t.environment) / 3;
  const months = paybackMonths(t);
  const financial = financialScore(months);
  const fit = 0.6 * financial + 0.4 * t.strategic;
  const overall = (feasibility + fit) / 2;
  let group;
  if (feasibility >= 3.5 && fit >= 3.5) group = "Quick win";
  else if (fit >= 3.5) group = "Strategic bet";
  else if (feasibility >= 3.5) group = "Easy, low value";
  else group = "Deprioritize";
  return { feasibility, fit, months, financial, overall, group };
}

const GROUP_CLASS = {
  "Quick win": "g-win",
  "Strategic bet": "g-bet",
  "Easy, low value": "g-easy",
  "Deprioritize": "g-low",
};

// ---------- Table ----------

const tbody = document.querySelector("#tasks tbody");

function ratingSelect(value, field) {
  const opts = [1, 2, 3, 4, 5].map(n => `<option${n === value ? " selected" : ""}>${n}</option>`).join("");
  return `<select data-field="${field}" aria-label="${field}">${opts}</select>`;
}

function numberInput(value, field, step) {
  return `<input type="number" min="0" step="${step}" value="${value}" data-field="${field}" aria-label="${field}">`;
}

function renderTable() {
  tbody.innerHTML = tasks.map((t, i) => `
    <tr data-i="${i}">
      <td><input type="text" value="${escapeHtml(t.name)}" placeholder="Task name" data-field="name" aria-label="Task name"></td>
      <td>${ratingSelect(t.action, "action")}</td>
      <td>${ratingSelect(t.object, "object")}</td>
      <td>${ratingSelect(t.environment, "environment")}</td>
      <td>${numberInput(t.hours, "hours", 1)}</td>
      <td>${numberInput(t.rate, "rate", 1)}</td>
      <td>${numberInput(t.cost, "cost", 1000)}</td>
      <td>${ratingSelect(t.strategic, "strategic")}</td>
      <td><button class="remove" type="button" aria-label="Remove task">&times;</button></td>
    </tr>`).join("");
  document.getElementById("empty").style.display = tasks.length ? "none" : "block";
}

tbody.addEventListener("input", e => {
  const field = e.target.dataset.field;
  if (!field) return;
  const i = +e.target.closest("tr").dataset.i;
  tasks[i][field] = field === "name" ? e.target.value : Math.max(0, Number(e.target.value) || 0);
  save();
  renderResults();
});

tbody.addEventListener("click", e => {
  if (!e.target.classList.contains("remove")) return;
  tasks.splice(+e.target.closest("tr").dataset.i, 1);
  save();
  render();
});

document.getElementById("add").addEventListener("click", () => {
  tasks.push({ ...BLANK });
  save();
  render();
  const inputs = tbody.querySelectorAll('input[data-field="name"]');
  inputs[inputs.length - 1].focus();
});

document.getElementById("example").addEventListener("click", () => {
  tasks = EXAMPLE.map(t => ({ ...t }));
  save();
  render();
});

document.getElementById("clear").addEventListener("click", () => {
  tasks = [];
  save();
  render();
});

// ---------- Results ----------

function formatMonths(m) {
  if (!isFinite(m)) return "no payback";
  if (m < 1) return "under 1 month";
  if (m > 120) return "10+ years";
  return `${Math.round(m)} months`;
}

function renderResults() {
  const scored = tasks
    .map((t, i) => ({ t, i, s: score(t) }))
    .sort((a, b) => b.s.overall - a.s.overall);

  const list = document.getElementById("ranking");
  if (!scored.length) {
    list.innerHTML = `<li class="none">Your ranked tasks will show up here.</li>`;
  } else {
    list.innerHTML = scored.map(({ t, s }) => `
      <li>
        <div class="rank-top">
          <span class="rank-name">${escapeHtml(t.name || "Untitled task")}</span>
          <span class="tag ${GROUP_CLASS[s.group]}">${s.group}</span>
        </div>
        <div class="rank-meta">
          Feasibility ${s.feasibility.toFixed(1)}, business fit ${s.fit.toFixed(1)}, payback ${formatMonths(s.months)}
        </div>
      </li>`).join("");
  }
  renderChart(scored);
}

function renderChart(scored) {
  const svg = document.getElementById("chart");
  const pad = 44, size = 400, inner = size - pad - 16;
  // Plot a little past 1 and 5 so dots on the edge aren't cut off.
  const lo = 0.6, hi = 5.4;
  const x = v => pad + ((v - lo) / (hi - lo)) * inner;
  const y = v => 16 + inner - ((v - lo) / (hi - lo)) * inner;
  const mid = 3.5;

  let out = `
    <rect class="quad q-win" x="${x(mid)}" y="${y(hi)}" width="${x(hi) - x(mid)}" height="${y(mid) - y(hi)}"/>
    <rect class="quad q-bet" x="${x(lo)}" y="${y(hi)}" width="${x(mid) - x(lo)}" height="${y(mid) - y(hi)}"/>
    <rect class="quad q-easy" x="${x(mid)}" y="${y(mid)}" width="${x(hi) - x(mid)}" height="${y(lo) - y(mid)}"/>
    <rect class="quad q-low" x="${x(lo)}" y="${y(mid)}" width="${x(mid) - x(lo)}" height="${y(lo) - y(mid)}"/>
    <text class="qlabel" x="${x(hi) - 6}" y="${y(hi) + 16}" text-anchor="end">Quick wins</text>
    <text class="qlabel" x="${x(lo) + 6}" y="${y(hi) + 16}">Strategic bets</text>
    <text class="qlabel" x="${x(hi) - 6}" y="${y(mid) + 16}" text-anchor="end">Easy, low value</text>
    <text class="qlabel" x="${x(lo) + 6}" y="${y(mid) + 16}">Deprioritize</text>
    <line class="axis" x1="${x(lo)}" y1="${y(lo)}" x2="${x(hi)}" y2="${y(lo)}"/>
    <line class="axis" x1="${x(lo)}" y1="${y(lo)}" x2="${x(lo)}" y2="${y(hi)}"/>
    <text class="alabel" x="${x(3)}" y="${size - 8}" text-anchor="middle">Feasibility</text>
    <text class="alabel" transform="translate(14 ${y(3)}) rotate(-90)" text-anchor="middle">Business fit</text>`;

  for (let v = 1; v <= 5; v++) {
    out += `<text class="tick" x="${x(v)}" y="${y(lo) + 16}" text-anchor="middle">${v}</text>`;
    out += `<text class="tick" x="${x(lo) - 10}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
  }

  scored.forEach(({ t, s }, rank) => {
    const cx = x(s.feasibility), cy = y(s.fit);
    out += `<g class="dot ${GROUP_CLASS[s.group]}">
      <circle cx="${cx}" cy="${cy}" r="11"><title>${escapeHtml(t.name || "Untitled task")}</title></circle>
      <text x="${cx}" y="${cy + 4}" text-anchor="middle">${rank + 1}</text>
    </g>`;
  });

  svg.innerHTML = out;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function render() {
  renderTable();
  renderResults();
}

render();
