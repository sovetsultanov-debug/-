import test from 'node:test';
import assert from 'node:assert/strict';
import {
  categorizePlddt,
  calculatePlddtDistribution,
  calculateLipinski,
  parseFasta,
} from './science-calculations';

test('categorizePlddt assigns canonical AlphaFold confidence tiers', () => {
  const veryHigh = categorizePlddt(95.4);
  assert.equal(veryHigh.tier, 'Very High');
  assert.equal(veryHigh.hex, '#0053D6');

  const confident = categorizePlddt(82.1);
  assert.equal(confident.tier, 'Confident');
  assert.equal(confident.hex, '#65CBF3');

  const low = categorizePlddt(62.0);
  assert.equal(low.tier, 'Low');
  assert.equal(low.hex, '#FFDB13');

  const veryLow = categorizePlddt(34.2);
  assert.equal(veryLow.tier, 'Very Low');
  assert.equal(veryLow.hex, '#FF7D45');
});

test('calculatePlddtDistribution computes accurate metrics and disorder warnings', () => {
  const scores = [95, 92, 85, 75, 65, 40, 30, 20, 10, 5];
  const dist = calculatePlddtDistribution(scores);

  assert.equal(dist.count, 10);
  assert.equal(dist.min, 5);
  assert.equal(dist.max, 95);
  assert.equal(dist.veryHighPct, 20); // 2 of 10
  assert.equal(dist.confidentPct, 20); // 2 of 10
  assert.equal(dist.lowPct, 10); // 1 of 10
  assert.equal(dist.veryLowPct, 50); // 5 of 10
  assert.equal(dist.isDisorderedWarning, true); // >35% very low triggers disorder warning
});

test('calculateLipinski evaluates Rule of 5 for drug-likeness', () => {
  // Aspirin (MW ~180, LogP ~1.2, HBD 1, HBA 3, rotatable 2)
  const aspirin = calculateLipinski({
    molecularWeight: 180.16,
    logP: 1.19,
    hbd: 1,
    hba: 3,
    rotatableBonds: 2,
  });

  assert.equal(aspirin.passesRuleOfFive, true);
  assert.equal(aspirin.violationsCount, 0);
  assert.equal(aspirin.rules.mw.passed, true);
  assert.equal(aspirin.rules.logP.passed, true);

  // Large non-drug molecule (e.g. Cyclosporine or large peptide)
  const bulky = calculateLipinski({
    molecularWeight: 1200,
    logP: 6.5,
    hbd: 6,
    hba: 12,
  });

  assert.equal(bulky.passesRuleOfFive, false);
  assert.equal(bulky.violationsCount, 4);
});

test('parseFasta parses header and residues correctly', () => {
  const fasta = `>sp|P04637|P53_HUMAN Cellular tumor antigen p53
MEEPQSDPSV EPPLSQETFS DLWKLLPENN
VLSPLPSQAM DDLMLSPDDI EQWFTEDPGP
`;

  const parsed = parseFasta(fasta);
  assert.equal(parsed.header, 'sp|P04637|P53_HUMAN Cellular tumor antigen p53');
  assert.equal(parsed.length, 60);
  assert.equal(parsed.sequence.startsWith('MEEPQSDPSV'), true);
  assert.ok(parsed.molecularWeightEstimateDa > 5000);
});
