// Menjalankan 35 kasus uji aturan yang sama dengan tests.html, lewat `npm test`.
import { expect, test } from 'vitest';
import { runRuleTests } from './rules.cases';

test('semua kasus uji mesin aturan lulus', () => {
  const s = runRuleTests();
  const gagal = s.results.filter((r) => !r.ok).map((r) => r.group + ' › ' + r.name + ': ' + r.error);
  expect(gagal).toEqual([]);
  expect(s.total).toBeGreaterThanOrEqual(35);
});
