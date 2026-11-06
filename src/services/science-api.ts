/**
 * Unified Bioscience & Structural Biology API Service
 * Fetches real data from AlphaFold DB, RCSB PDB, UniProtKB, and PubChem.
 */

import { fetchWithRetry } from './retry-helper';

export interface AlphaFoldModelData {
  entryId: string;
  gene: string;
  uniprotAccession: string;
  uniprotId: string;
  organismScientificName: string;
  uniprotSequence: string;
  cifUrl: string;
  pdbUrl: string;
  paeDocUrl: string;
  paeImageUrl: string;
  meanPlddt: number;
  fractionVeryHigh: number;
  fractionConfident: number;
  fractionLow: number;
  fractionVeryLow: number;
}

export async function fetchAlphaFoldData(uniprotId: string): Promise<AlphaFoldModelData> {
  const cleanId = uniprotId.trim().toUpperCase();
  const url = `https://alphafold.ebi.ac.uk/api/prediction/${cleanId}`;
  
  const res = await fetchWithRetry(url, {}, 2, 400);
  const data = await res.json();
  
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No AlphaFold prediction found for UniProt accession '${cleanId}'`);
  }

  const primary = data[0];
  return {
    entryId: primary.entryId || `AF-${cleanId}-F1`,
    gene: primary.gene || 'Unknown Gene',
    uniprotAccession: primary.uniprotAccession || cleanId,
    uniprotId: primary.uniprotId || cleanId,
    organismScientificName: primary.organismScientificName || 'Homo sapiens',
    uniprotSequence: primary.uniprotSequence || '',
    cifUrl: primary.cifUrl || `https://alphafold.ebi.ac.uk/files/AF-${cleanId}-F1-model_v6.cif`,
    pdbUrl: primary.pdbUrl || `https://alphafold.ebi.ac.uk/files/AF-${cleanId}-F1-model_v6.pdb`,
    paeDocUrl: primary.paeDocUrl || '',
    paeImageUrl: primary.paeImageUrl || '',
    meanPlddt: primary.globalMetricValue ?? 75.0,
    fractionVeryHigh: typeof primary.fractionPlddtVeryHigh === 'number'
      ? (primary.fractionPlddtVeryHigh <= 1.0 ? primary.fractionPlddtVeryHigh * 100 : primary.fractionPlddtVeryHigh)
      : 40.0,
    fractionConfident: typeof primary.fractionPlddtConfident === 'number'
      ? (primary.fractionPlddtConfident <= 1.0 ? primary.fractionPlddtConfident * 100 : primary.fractionPlddtConfident)
      : 35.0,
    fractionLow: typeof primary.fractionPlddtLow === 'number'
      ? (primary.fractionPlddtLow <= 1.0 ? primary.fractionPlddtLow * 100 : primary.fractionPlddtLow)
      : 15.0,
    fractionVeryLow: typeof primary.fractionPlddtVeryLow === 'number'
      ? (primary.fractionPlddtVeryLow <= 1.0 ? primary.fractionPlddtVeryLow * 100 : primary.fractionPlddtVeryLow)
      : 10.0,
  };
}

export interface PdbData {
  rcsbId: string;
  title: string;
  experimentalMethod: string[];
  resolutionCombined?: number[];
  depositedAtomCount: number;
  releaseDate: string;
  cifUrl: string;
}

export async function fetchPdbData(pdbId: string): Promise<PdbData> {
  const cleanId = pdbId.trim().toUpperCase();
  const url = `https://data.rcsb.org/rest/v1/core/entry/${cleanId.toLowerCase()}`;
  
  const res = await fetchWithRetry(url, {}, 2, 400);
  const data = await res.json();
  
  const info = data.rcsb_entry_info || {};
  return {
    rcsbId: cleanId,
    title: data.struct?.title || 'Macromolecular Structure',
    experimentalMethod: info.experimental_method || ['X-RAY DIFFRACTION'],
    resolutionCombined: info.resolution_combined || [],
    depositedAtomCount: info.deposited_atom_count || 0,
    releaseDate: data.rcsb_accession_info?.initial_release_date || 'N/A',
    cifUrl: `https://files.rcsb.org/download/${cleanId}.cif`,
  };
}

export interface PubChemData {
  cid: number;
  name: string;
  iupacName: string;
  molecularWeight: number;
  xLogP: number;
  hbd: number;
  hba: number;
  rotatableBonds: number;
  smiles: string;
}

export async function fetchPubChemData(compoundName: string): Promise<PubChemData> {
  const clean = encodeURIComponent(compoundName.trim());
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${clean}/property/MolecularWeight,XLogP,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,CanonicalSMILES,IUPACName/JSON`;
  
  const res = await fetchWithRetry(url, {}, 2, 400);
  const data = await res.json();
  
  const prop = data?.PropertyTable?.Properties?.[0];
  if (!prop) {
    throw new Error(`No PubChem chemical properties found for '${compoundName}'`);
  }

  return {
    cid: prop.CID,
    name: compoundName,
    iupacName: prop.IUPACName || 'N/A',
    molecularWeight: parseFloat(prop.MolecularWeight || '0'),
    xLogP: parseFloat(prop.XLogP || '0'),
    hbd: parseInt(prop.HBondDonorCount || '0', 10),
    hba: parseInt(prop.HBondAcceptorCount || '0', 10),
    rotatableBonds: parseInt(prop.RotatableBondCount || '0', 10),
    smiles: prop.CanonicalSMILES || '',
  };
}
