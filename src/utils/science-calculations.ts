/**
 * Pure calculation logic for Bioscience data & metrics
 * Decoupled from UI components for deterministic unit testing.
 */

export interface PlddtTier {
  tier: 'Very High' | 'Confident' | 'Low' | 'Very Low';
  hex: string;
  min: number;
  max: number;
  description: string;
}

export const PLDDT_TIERS: Record<string, PlddtTier> = {
  VERY_HIGH: {
    tier: 'Very High',
    hex: '#0053D6',
    min: 90,
    max: 100,
    description: 'High accuracy for backbone and sidechain rotamers; suitable for active site / binding interface analysis.',
  },
  CONFIDENT: {
    tier: 'Confident',
    hex: '#65CBF3',
    min: 70,
    max: 90,
    description: 'Reliable backbone topology and secondary structure; sidechain rotamers may vary.',
  },
  LOW: {
    tier: 'Low',
    hex: '#FFDB13',
    min: 50,
    max: 70,
    description: 'Overall backbone topology should be treated with caution; often indicates loop regions or linkers.',
  },
  VERY_LOW: {
    tier: 'Very Low',
    hex: '#FF7D45',
    min: 0,
    max: 50,
    description: 'Strongly correlates with intrinsically disordered protein regions (IDPRs) or unstructured segments.',
  },
};

/**
 * Categorizes a pLDDT score into the standard 4 canonical AlphaFold tiers
 */
export function categorizePlddt(score: number): PlddtTier {
  if (score > 90) return PLDDT_TIERS.VERY_HIGH;
  if (score >= 70) return PLDDT_TIERS.CONFIDENT;
  if (score >= 50) return PLDDT_TIERS.LOW;
  return PLDDT_TIERS.VERY_LOW;
}

export interface PlddtDistribution {
  mean: number;
  min: number;
  max: number;
  count: number;
  veryHighPct: number;
  confidentPct: number;
  lowPct: number;
  veryLowPct: number;
  isDisorderedWarning: boolean;
}

/**
 * Computes statistical distribution and disorder warning from per-residue pLDDT scores
 */
export function calculatePlddtDistribution(scores: number[]): PlddtDistribution {
  if (!scores || scores.length === 0) {
    return {
      mean: 0,
      min: 0,
      max: 0,
      count: 0,
      veryHighPct: 0,
      confidentPct: 0,
      lowPct: 0,
      veryLowPct: 0,
      isDisorderedWarning: false,
    };
  }

  let sum = 0;
  let min = scores[0];
  let max = scores[0];
  let veryHighCount = 0;
  let confidentCount = 0;
  let lowCount = 0;
  let veryLowCount = 0;

  for (const s of scores) {
    sum += s;
    if (s < min) min = s;
    if (s > max) max = s;

    if (s > 90) veryHighCount++;
    else if (s >= 70) confidentCount++;
    else if (s >= 50) lowCount++;
    else veryLowCount++;
  }

  const n = scores.length;
  const veryHighPct = Math.round((veryHighCount / n) * 100);
  const confidentPct = Math.round((confidentCount / n) * 100);
  const lowPct = Math.round((lowCount / n) * 100);
  const veryLowPct = Math.round((veryLowCount / n) * 100);
  const mean = Math.round((sum / n) * 10) / 10;

  // Disorder warning if > 35% of residues are very low confidence (< 50) or mean < 60
  const isDisorderedWarning = veryLowPct >= 35 || mean < 60;

  return {
    mean,
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    count: n,
    veryHighPct,
    confidentPct,
    lowPct,
    veryLowPct,
    isDisorderedWarning,
  };
}

export interface LipinskiInput {
  molecularWeight: number; // <= 500 Da
  logP: number;            // <= 5
  hbd: number;             // Hydrogen Bond Donors <= 5
  hba: number;             // Hydrogen Bond Acceptors <= 10
  rotatableBonds?: number; // Optional Veber rule <= 10
}

export interface LipinskiResult {
  passesRuleOfFive: boolean;
  violationsCount: number;
  rules: {
    mw: { value: number; limit: number; passed: boolean; label: string };
    logP: { value: number; limit: number; passed: boolean; label: string };
    hbd: { value: number; limit: number; passed: boolean; label: string };
    hba: { value: number; limit: number; passed: boolean; label: string };
    rotBonds?: { value: number; limit: number; passed: boolean; label: string };
  };
}

/**
 * Evaluates Lipinski Rule of 5 and Veber drug-likeness criteria
 */
export function calculateLipinski(input: LipinskiInput): LipinskiResult {
  const mwPass = input.molecularWeight <= 500;
  const logPPass = input.logP <= 5;
  const hbdPass = input.hbd <= 5;
  const hbaPass = input.hba <= 10;

  let violations = 0;
  if (!mwPass) violations++;
  if (!logPPass) violations++;
  if (!hbdPass) violations++;
  if (!hbaPass) violations++;

  const result: LipinskiResult = {
    passesRuleOfFive: violations <= 1, // Traditional definition allows at most 1 violation
    violationsCount: violations,
    rules: {
      mw: {
        value: input.molecularWeight,
        limit: 500,
        passed: mwPass,
        label: 'Molecular Weight ≤ 500 Da',
      },
      logP: {
        value: input.logP,
        limit: 5.0,
        passed: logPPass,
        label: 'Partition Coefficient LogP ≤ 5.0',
      },
      hbd: {
        value: input.hbd,
        limit: 5,
        passed: hbdPass,
        label: 'H-Bond Donors (OH + NH) ≤ 5',
      },
      hba: {
        value: input.hba,
        limit: 10,
        passed: hbaPass,
        label: 'H-Bond Acceptors (O + N) ≤ 10',
      },
    },
  };

  if (typeof input.rotatableBonds === 'number') {
    const rotPass = input.rotatableBonds <= 10;
    result.rules.rotBonds = {
      value: input.rotatableBonds,
      limit: 10,
      passed: rotPass,
      label: 'Rotatable Bonds ≤ 10 (Veber Rule)',
    };
  }

  return result;
}

export interface FastaSummary {
  header: string;
  sequence: string;
  length: number;
  gcContent?: number; // for nucleotides
  molecularWeightEstimateDa: number;
  composition: Record<string, number>;
}

/**
 * Parses raw FASTA sequence data and extracts composition
 */
export function parseFasta(fasta: string): FastaSummary {
  const lines = fasta.trim().split('\n');
  let header = 'Unnamed Sequence';
  const seqLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('>')) {
      header = trimmed.slice(1).trim();
    } else if (trimmed) {
      seqLines.push(trimmed.toUpperCase().replace(/\s+/g, ''));
    }
  }

  const sequence = seqLines.join('');
  const composition: Record<string, number> = {};

  for (const char of sequence) {
    composition[char] = (composition[char] || 0) + 1;
  }

  // Check if nucleotide
  const isNucleotide = /^[ACGTUN]+$/.test(sequence);
  let gcContent: number | undefined;
  if (isNucleotide && sequence.length > 0) {
    const gc = (composition['G'] || 0) + (composition['C'] || 0);
    gcContent = Math.round((gc / sequence.length) * 1000) / 10;
  }

  // Rough MW estimate: ~110 Da per amino acid, ~330 Da per nucleotide
  const mwPerResidue = isNucleotide ? 330 : 110;
  const molecularWeightEstimateDa = Math.round(sequence.length * mwPerResidue);

  return {
    header,
    sequence,
    length: sequence.length,
    gcContent,
    molecularWeightEstimateDa,
    composition,
  };
}
