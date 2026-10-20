/* RencanaMampu — halaman uji aturan (tests.html). Kasus uji ada di rules.cases.ts. */
import { runRuleTests } from './rules.cases';
import type { TestResult } from './types';

const summary = runRuleTests();
const { results, passed, failed } = summary;
// Dibaca docs/audit/verify/check.js.
window.RM = { tests: summary };

{
  const groups: Record<string, TestResult[]> = {};
  results.forEach(function (r) { (groups[r.group] = groups[r.group] || []).push(r); });
  document.getElementById('test-summary')!.innerHTML =
    '<div class="stat-strip cols-3">' +
      '<div class="stat-block"><span class="stat-label">Total uji</span><span class="stat-value">' + results.length + '</span></div>' +
      '<div class="stat-block"><span class="stat-label">Lulus</span><span class="stat-value is-ok">' + passed + '</span></div>' +
      '<div class="stat-block"><span class="stat-label">Gagal</span><span class="stat-value ' + (failed ? 'is-danger' : '') + '">' + failed + '</span></div>' +
    '</div>' +
    '<div class="notice ' + (failed ? 'notice-danger' : 'notice-ok') + '" style="margin-top:16px">' +
      '<div><strong>' + (failed ? failed + ' uji gagal.' : 'Semua aturan lulus uji.') + '</strong> Mesin ini deterministik: masukan yang sama selalu menghasilkan temuan yang sama.</div></div>';
  document.getElementById('test-results')!.innerHTML = Object.keys(groups).map(function (g) {
    return '<section class="card"><div class="card-head"><h2>' + g + '</h2><span class="badge ' +
      (groups[g].some(function (r) { return !r.ok; }) ? 'badge-danger' : 'badge-ok') + '">' +
      groups[g].filter(function (r) { return r.ok; }).length + '/' + groups[g].length + '</span></div>' +
      '<div class="mini-list">' + groups[g].map(function (r) {
        return '<div class="mini-item">' + (r.ok
          ? '<svg class="od-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#0E5C4A" stroke-width="1.8"/><path d="m8.2 12.2 2.5 2.5 5-5.4" fill="none" stroke="#0E5C4A" stroke-width="1.9" stroke-linecap="round"/></svg>'
          : '<svg class="od-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#9A2418" stroke-width="1.8"/><path d="m9 9 6 6M15 9l-6 6" stroke="#9A2418" stroke-width="1.9" stroke-linecap="round"/></svg>') +
          '<div><span class="t">' + r.name + '</span>' + (r.ok ? '' : '<span class="d" style="color:#841E14">' + (r.error || '') + '</span>') + '</div></div>';
      }).join('') + '</div></section>';
  }).join('');
}
