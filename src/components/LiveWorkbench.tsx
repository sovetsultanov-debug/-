import React, { useState, useEffect } from 'react';
import {
  Search,
  Play,
  RotateCcw,
  ExternalLink,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Info,
  Dna,
  FlaskConical,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { MolecularViewer3D } from './MolecularViewer3D';
import {
  fetchAlphaFoldData,
  fetchPdbData,
  fetchPubChemData,
  AlphaFoldModelData,
  PdbData,
  PubChemData,
} from '../services/science-api';
import {
  calculatePlddtDistribution,
  calculateLipinski,
  categorizePlddt,
  PLDDT_TIERS,
} from '../utils/science-calculations';
import { ClaudeSkillDefinition } from '../utils/skill-generator';

interface LiveWorkbenchProps {
  initialSkill?: ClaudeSkillDefinition;
}

interface ExampleChip {
  id: string;
  label: string;
  type: 'alphafold' | 'pdb' | 'pubchem';
  query: string;
  description: string;
}

const EXAMPLES: ExampleChip[] = [
  { id: 'tp53', label: 'TP53 (P04637)', type: 'alphafold', query: 'P04637', description: 'Human Cellular Tumor Antigen p53 (AlphaFold DB)' },
  { id: 'brca1', label: 'BRCA1 (P38398)', type: 'alphafold', query: 'P38398', description: 'Breast Cancer Type 1 Susceptibility Protein' },
  { id: 'egfr', label: 'EGFR (P00533)', type: 'alphafold', query: 'P00533', description: 'Epidermal Growth Factor Receptor Kinase' },
  { id: '1tup', label: 'p53-DNA Complex (1TUP)', type: 'pdb', query: '1TUP', description: 'RCSB PDB 2.2Å X-ray crystal structure' },
  { id: '4hhb', label: 'Hemoglobin (4HHB)', type: 'pdb', query: '4HHB', description: 'RCSB PDB Deoxyhemoglobin crystal structure' },
  { id: 'imatinib', label: 'Imatinib (Gleevec)', type: 'pubchem', query: 'Imatinib', description: 'PubChem small molecule Bcr-Abl kinase inhibitor' },
  { id: 'aspirin', label: 'Aspirin', type: 'pubchem', query: 'Aspirin', description: 'PubChem acetylsalicylic acid analgesic' },
];

export const LiveWorkbench: React.FC<LiveWorkbenchProps> = ({ initialSkill }) => {
  const [query, setQuery] = useState<string>('P04637');
  const [selectedExample, setSelectedExample] = useState<string>('tp53');
  const [activeTab, setActiveTab] = useState<'data' | 'claude_trace'>('data');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  // Result States
  const [afResult, setAfResult] = useState<AlphaFoldModelData | null>(null);
  const [pdbResult, setPdbResult] = useState<PdbData | null>(null);
  const [pubchemResult, setPubchemResult] = useState<PubChemData | null>(null);
  const [activeMode, setActiveMode] = useState<'alphafold' | 'pdb' | 'pubchem'>('alphafold');

  // Auto-load default example on initial mount (MANDATORY SCIENCE SKILL PATTERN)
  useEffect(() => {
    executeAnalysis('P04637', 'alphafold');
  }, []);

  const executeAnalysis = async (searchTarget: string, modeOverride?: 'alphafold' | 'pdb' | 'pubchem') => {
    const cleanTarget = searchTarget.trim();
    if (!cleanTarget) return;

    setLoading(true);
    setError(null);

    // Determine target mode
    let targetMode = modeOverride;
    if (!targetMode) {
      if (/^[0-9][A-Za-z0-9]{3}$/.test(cleanTarget)) {
        targetMode = 'pdb';
      } else if (/^[A-N,R-Z][0-9][A-Z][A-Z,0-9][A-Z,0-9][0-9]$|^[O,P,Q][0-9][A-Z,0-9]{3}[0-9]$/i.test(cleanTarget)) {
        targetMode = 'alphafold';
      } else if (cleanTarget.toLowerCase() === 'imatinib' || cleanTarget.toLowerCase() === 'aspirin') {
        targetMode = 'pubchem';
      } else {
        targetMode = activeMode;
      }
    }

    setActiveMode(targetMode);

    try {
      if (targetMode === 'alphafold') {
        const afData = await fetchAlphaFoldData(cleanTarget);
        setAfResult(afData);
        setPdbResult(null);
        setPubchemResult(null);
      } else if (targetMode === 'pdb') {
        const pdbData = await fetchPdbData(cleanTarget);
        setPdbResult(pdbData);
        setAfResult(null);
        setPubchemResult(null);
      } else if (targetMode === 'pubchem') {
        const chemData = await fetchPubChemData(cleanTarget);
        setPubchemResult(chemData);
        setAfResult(null);
        setPdbResult(null);
      }
    } catch (err: any) {
      console.error('Analysis execution error:', err);
      setError(err.message || 'Failed to fetch scientific data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chip: ExampleChip) => {
    setSelectedExample(chip.id);
    setQuery(chip.query);
    executeAnalysis(chip.query, chip.type);
  };

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // Computations for AlphaFold confidence
  const isDisorderedWarning = afResult ? afResult.fractionVeryLow >= 35 || afResult.meanPlddt < 60 : false;

  // Lipinski computation for chemical compound
  const lipinskiResult = pubchemResult
    ? calculateLipinski({
        molecularWeight: pubchemResult.molecularWeight,
        logP: pubchemResult.xLogP,
        hbd: pubchemResult.hbd,
        hba: pubchemResult.hba,
        rotatableBonds: pubchemResult.rotatableBonds,
      })
    : null;

  return (
    <div className="space-y-5">
      {/* Quick-Try Example Pill Bar (Mandatory Science Workbench Pattern) */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Quick-Try Authoritative Biological Identifiers:
          </span>
          <span className="text-[11px] text-slate-400">Zero-CORS Direct Public APIs</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((chip) => (
            <button
              key={chip.id}
              onClick={() => handleChipClick(chip)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedExample === chip.id
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                  : 'bg-slate-900/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              {chip.type === 'alphafold' && <Dna className="w-3.5 h-3.5 text-blue-300" />}
              {chip.type === 'pdb' && <span className="font-mono text-[10px] text-purple-300 font-bold">PDB</span>}
              {chip.type === 'pubchem' && <FlaskConical className="w-3.5 h-3.5 text-teal-300" />}
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 bg-slate-800/90 border border-slate-700 rounded-xl p-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeAnalysis(query)}
            placeholder="Enter UniProt accession (e.g. P04637), PDB code (e.g. 1TUP), or Compound (e.g. Imatinib)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <select
            value={activeMode}
            onChange={(e) => setActiveMode(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 font-mono focus:outline-hidden"
          >
            <option value="alphafold">AlphaFold DB (UniProt)</option>
            <option value="pdb">RCSB PDB (X-ray / Cryo-EM)</option>
            <option value="pubchem">PubChem (Chemical / Drug)</option>
          </select>

          <button
            onClick={() => executeAnalysis(query)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
          >
            {loading ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" /> Fetching...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Run Skill
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-800 rounded-xl p-4 text-xs text-red-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Query Error:</span> {error}
            <p className="mt-1 text-[11px] text-red-300">
              Please verify your identifier (e.g. UniProt P04637, PDB 1TUP, or PubChem compound name).
            </p>
          </div>
        </div>
      )}

      {/* Dual-Pane Structural Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[560px]">
        {/* Left Pane (7 cols / ~58% width): 3D Molecular / 2D Chemical Canvas */}
        <div className="lg:col-span-7 flex flex-col h-full">
          {activeMode === 'pubchem' && pubchemResult ? (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex flex-col justify-between h-full shadow-md text-slate-200">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-teal-400 tracking-wider">
                      PubChem Compound CID {pubchemResult.cid}
                    </span>
                    <h3 className="text-lg font-bold text-white capitalize">{pubchemResult.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{pubchemResult.iupacName}</p>
                  </div>
                  <span className="bg-teal-950 text-teal-300 border border-teal-800 text-xs px-2.5 py-1 rounded font-mono">
                    [Literature curated]
                  </span>
                </div>

                {/* 2D Chemical Structure Depiction */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[220px]">
                  <img
                    src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${pubchemResult.cid}/PNG?image_size=320x220`}
                    alt={`2D structure of ${pubchemResult.name}`}
                    className="max-h-[200px] object-contain drop-shadow-md filter contrast-125"
                  />
                  <div className="mt-2 text-center">
                    <span className="text-[11px] text-slate-400 font-mono">Canonical SMILES:</span>
                    <div className="text-xs font-mono text-emerald-300 break-all bg-slate-900 px-3 py-1.5 rounded mt-1 border border-slate-800">
                      {pubchemResult.smiles}
                    </div>
                  </div>
                </div>

                {/* Lipinski Rule of 5 Evaluation Table */}
                {lipinskiResult && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-300">
                        Lipinski Rule of 5 &amp; Veber Drug-Likeness:
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          lipinskiResult.passesRuleOfFive
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {lipinskiResult.passesRuleOfFive
                          ? 'PASSED (Oral Drug-like)'
                          : `${lipinskiResult.violationsCount} Violations`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-slate-800/80 p-2 rounded border border-slate-700/60 flex items-center justify-between">
                        <span className="text-slate-400">MW (≤ 500 Da):</span>
                        <span className={lipinskiResult.rules.mw.passed ? 'text-emerald-400' : 'text-amber-400'}>
                          {pubchemResult.molecularWeight} Da
                        </span>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded border border-slate-700/60 flex items-center justify-between">
                        <span className="text-slate-400">LogP (≤ 5.0):</span>
                        <span className={lipinskiResult.rules.logP.passed ? 'text-emerald-400' : 'text-amber-400'}>
                          {pubchemResult.xLogP}
                        </span>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded border border-slate-700/60 flex items-center justify-between">
                        <span className="text-slate-400">H-Donors (≤ 5):</span>
                        <span className={lipinskiResult.rules.hbd.passed ? 'text-emerald-400' : 'text-amber-400'}>
                          {pubchemResult.hbd}
                        </span>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded border border-slate-700/60 flex items-center justify-between">
                        <span className="text-slate-400">H-Acceptors (≤ 10):</span>
                        <span className={lipinskiResult.rules.hba.passed ? 'text-emerald-400' : 'text-amber-400'}>
                          {pubchemResult.hba}
                        </span>
                      </div>
                      {lipinskiResult.rules.rotBonds && (
                        <div className="col-span-2 bg-slate-800/80 p-2 rounded border border-slate-700/60 flex items-center justify-between">
                          <span className="text-slate-400">Rotatable Bonds (≤ 10 Veber Rule):</span>
                          <span className={lipinskiResult.rules.rotBonds.passed ? 'text-emerald-400' : 'text-amber-400'}>
                            {pubchemResult.rotatableBonds}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Data Source: PubChem PUG REST API</span>
                <a
                  href={`https://pubchem.ncbi.nlm.nih.gov/compound/${pubchemResult.cid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                >
                  PubChem CID {pubchemResult.cid} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <MolecularViewer3D
              cifUrl={afResult ? afResult.cifUrl : pdbResult ? pdbResult.cifUrl : undefined}
              isAlphaFold={activeMode === 'alphafold'}
              uniprotAccession={afResult?.uniprotAccession || 'P04637'}
              structureTitle={
                afResult
                  ? `${afResult.gene} (${afResult.uniprotAccession})`
                  : pdbResult
                  ? `PDB ${pdbResult.rcsbId}: ${pdbResult.title.slice(0, 35)}...`
                  : 'Protein 3D Structure'
              }
            />
          )}
        </div>

        {/* Right Pane (5 cols / ~42% width): Synchronized Inspector & Claude Code Simulation Trace */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-md">
          {/* Right Pane Tabs */}
          <div className="flex items-center bg-slate-800/90 border-b border-slate-700 px-3 py-2 text-xs">
            <button
              onClick={() => setActiveTab('data')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'data' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              Scientific Data &amp; Confidence
            </button>
            <button
              onClick={() => setActiveTab('claude_trace')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'claude_trace' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Claude Code Execution Trace
            </button>
          </div>

          {/* Right Pane Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin">
            {activeTab === 'data' && (
              <>
                {/* Mode: AlphaFold Protein */}
                {activeMode === 'alphafold' && afResult && (
                  <div className="space-y-4">
                    {/* Epistemic Provenance Badge */}
                    <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">Epistemic Provenance:</span>
                        <span className="font-semibold text-blue-400 text-xs">[Predicted by model - AlphaFold v6]</span>
                      </div>
                      <a
                        href={`https://alphafold.ebi.ac.uk/entry/${afResult.uniprotAccession}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-300 hover:text-blue-300 flex items-center gap-1 text-[11px] font-mono bg-slate-900 px-2 py-1 rounded border border-slate-700"
                      >
                        AlphaFold DB <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Metadata Overview */}
                    <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono">
                      <div className="bg-slate-800/50 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">GENE SYMBOL</span>
                        <span className="font-bold text-white text-sm">{afResult.gene}</span>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">UNIPROT ACCESSION</span>
                        <span className="font-bold text-teal-400 text-sm">{afResult.uniprotAccession}</span>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">ORGANISM</span>
                        <span className="text-slate-200">{afResult.organismScientificName}</span>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">GLOBAL MEAN pLDDT</span>
                        <span className="font-bold text-blue-400">{afResult.meanPlddt.toFixed(1)} / 100</span>
                      </div>
                    </div>

                    {/* High Intrinsic Disorder Warning (Mandatory AlphaFold DB Skill Rule) */}
                    {isDisorderedWarning && (
                      <div className="bg-amber-950/60 border border-amber-800/80 rounded-lg p-3 text-amber-200">
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>Intrinsically Disordered Warning (IDPR)</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-amber-300/90">
                          {afResult.fractionVeryLow.toFixed(1)}% of residues have very low confidence (&lt;50 pLDDT).
                          Do NOT interpret unstructured segments as a fixed fold. Restrict any downstream structural
                          searches (such as Foldseek or docking) strictly to rigid domain boundaries.
                        </p>
                      </div>
                    )}

                    {/* AlphaFold Canonical 4-Tier pLDDT Breakdown */}
                    <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 space-y-2">
                      <span className="font-semibold text-slate-200 text-xs block">
                        Canonical 4-Tier Confidence Distribution:
                      </span>

                      {/* Stacked bar */}
                      <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${afResult.fractionVeryHigh}%`, backgroundColor: PLDDT_TIERS.VERY_HIGH.hex }}
                          title={`Very High: ${afResult.fractionVeryHigh.toFixed(1)}%`}
                        />
                        <div
                          style={{ width: `${afResult.fractionConfident}%`, backgroundColor: PLDDT_TIERS.CONFIDENT.hex }}
                          title={`Confident: ${afResult.fractionConfident.toFixed(1)}%`}
                        />
                        <div
                          style={{ width: `${afResult.fractionLow}%`, backgroundColor: PLDDT_TIERS.LOW.hex }}
                          title={`Low: ${afResult.fractionLow.toFixed(1)}%`}
                        />
                        <div
                          style={{ width: `${afResult.fractionVeryLow}%`, backgroundColor: PLDDT_TIERS.VERY_LOW.hex }}
                          title={`Very Low / Disordered: ${afResult.fractionVeryLow.toFixed(1)}%`}
                        />
                      </div>

                      {/* Tier table */}
                      <div className="space-y-1 pt-1 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLDDT_TIERS.VERY_HIGH.hex }} />
                            Very High (&gt;90):
                          </span>
                          <span className="font-bold">{afResult.fractionVeryHigh.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLDDT_TIERS.CONFIDENT.hex }} />
                            Confident (70-90):
                          </span>
                          <span className="font-bold">{afResult.fractionConfident.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLDDT_TIERS.LOW.hex }} />
                            Low (50-70):
                          </span>
                          <span className="font-bold">{afResult.fractionLow.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLDDT_TIERS.VERY_LOW.hex }} />
                            Very Low / IDPR (&lt;50):
                          </span>
                          <span className="font-bold text-amber-400">{afResult.fractionVeryLow.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Direct Coordinate Download URLs */}
                    <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3 space-y-1.5 text-[11px]">
                      <span className="font-semibold text-slate-300 block">Download Verified Artifacts:</span>
                      <div className="flex flex-col gap-1 font-mono text-blue-400">
                        <a href={afResult.cifUrl} target="_blank" rel="noreferrer" className="hover:underline truncate">
                          • mmCIF Coordinates: {afResult.cifUrl.split('/').pop()}
                        </a>
                        <a href={afResult.pdbUrl} target="_blank" rel="noreferrer" className="hover:underline truncate">
                          • PDB Coordinates: {afResult.pdbUrl.split('/').pop()}
                        </a>
                        {afResult.paeDocUrl && (
                          <a href={afResult.paeDocUrl} target="_blank" rel="noreferrer" className="hover:underline truncate">
                            • PAE Error Matrix: {afResult.paeDocUrl.split('/').pop()}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode: RCSB PDB Structure */}
                {activeMode === 'pdb' && pdbResult && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">Epistemic Provenance:</span>
                        <span className="font-semibold text-purple-400 text-xs">[Experimentally determined - RCSB PDB]</span>
                      </div>
                      <a
                        href={`https://www.rcsb.org/structure/${pdbResult.rcsbId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-300 hover:text-purple-300 flex items-center gap-1 text-[11px] font-mono bg-slate-900 px-2 py-1 rounded border border-slate-700"
                      >
                        RCSB Record <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 space-y-2">
                      <h4 className="font-semibold text-white text-sm">{pdbResult.title}</h4>
                      <div className="grid grid-cols-2 gap-2 font-mono text-slate-300 pt-1">
                        <div>
                          <span className="text-slate-500 text-[10px] block">METHOD</span>
                          <span>{pdbResult.experimentalMethod.join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">RESOLUTION</span>
                          <span className="text-emerald-400 font-bold">
                            {pdbResult.resolutionCombined && pdbResult.resolutionCombined.length > 0
                              ? `${pdbResult.resolutionCombined[0]} Å`
                              : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">DEPOSITED ATOMS</span>
                          <span>{pdbResult.depositedAtomCount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">RELEASE DATE</span>
                          <span>{pdbResult.releaseDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3 text-[11px]">
                      <span className="font-semibold text-slate-300 block mb-1">Direct Download:</span>
                      <a
                        href={pdbResult.cifUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline font-mono"
                      >
                        {pdbResult.cifUrl}
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Tab: Claude Code Execution Simulation Trace */}
            {activeTab === 'claude_trace' && (
              <div className="space-y-3 font-mono text-xs">
                {/* Top command snippet */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-teal-300">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500">$</span>
                    <span className="truncate">
                      claude &quot;/{activeMode === 'alphafold' ? 'af-analyze' : activeMode === 'pdb' ? 'pdb' : 'drug-scout'}{' '}
                      {query}&quot;
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyCommand(
                        `claude "/${activeMode === 'alphafold' ? 'af-analyze' : activeMode === 'pdb' ? 'pdb' : 'drug-scout'} ${query}"`
                      )
                    }
                    className="p-1 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                    title="Copy command"
                  >
                    {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Simulated Step 1: Agent Skill Invocation */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>[Step 1] Skill Triggered: .claude/skills/{activeMode === 'alphafold' ? 'alphafold-structure-analyzer' : activeMode === 'pdb' ? 'rcsb-pdb-inspector' : 'chembl-pubchem-drug-scout'}/SKILL.md</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Matched slash command trigger. Reading execution rules, parameters, and tool scripts.
                  </p>
                </div>

                {/* Simulated Step 2: Tool Execution */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>[Step 2] Executing CLI Tool Script</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded text-[11px] text-emerald-300 font-mono">
                    {activeMode === 'alphafold' && (
                      <>
                        $ python3 scripts/fetch_alphafold.py {afResult?.uniprotAccession || query}
                        <br />
                        Resolved: AF-{afResult?.uniprotAccession || query}-F1-model_v6.cif
                        <br />
                        Mean pLDDT: {afResult?.meanPlddt.toFixed(1) || '65.8'} | Very High: {afResult?.fractionVeryHigh.toFixed(1) || '40.0'}%
                      </>
                    )}
                    {activeMode === 'pdb' && (
                      <>
                        $ python3 scripts/fetch_pdb.py {pdbResult?.rcsbId || query}
                        <br />
                        Structure: {pdbResult?.title || 'p53 Core Domain'}
                        <br />
                        Method: {pdbResult?.experimentalMethod.join(', ') || 'X-RAY DIFFRACTION'}
                      </>
                    )}
                    {activeMode === 'pubchem' && (
                      <>
                        $ python3 scripts/drug_scout.py {pubchemResult?.name || query}
                        <br />
                        CID: {pubchemResult?.cid} | MW: {pubchemResult?.molecularWeight} Da | LogP: {pubchemResult?.xLogP}
                        <br />
                        Lipinski Rule of 5: {lipinskiResult?.passesRuleOfFive ? 'PASSED' : 'VIOLATED'}
                      </>
                    )}
                  </div>
                </div>

                {/* Simulated Step 3: Claude Code Synthesized Report */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-teal-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>[Step 3] Claude Code Response Synthesis</span>
                  </div>
                  <div className="text-slate-300 text-[11px] leading-relaxed space-y-2 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    {activeMode === 'alphafold' && (
                      <>
                        <p>
                          <strong>Structural Assessment for {afResult?.gene} ({afResult?.uniprotAccession}):</strong>
                        </p>
                        <p>
                          The protein exhibits an overall mean pLDDT of {afResult?.meanPlddt.toFixed(1)}/100.
                          {isDisorderedWarning
                            ? ` Note: An Intrinsically Disordered Region (IDPR) warning is active (${afResult?.fractionVeryLow.toFixed(1)}% <50 pLDDT). Rigid core domains should be analyzed in isolation.`
                            : ` High confidence secondary structure topology is maintained across the major catalytic domains.`}
                        </p>
                        <p className="text-slate-400">
                          Provenance: [Predicted by model - AlphaFold DB v6]
                        </p>
                      </>
                    )}

                    {activeMode === 'pdb' && (
                      <>
                        <p>
                          <strong>Experimental Structure {pdbResult?.rcsbId}:</strong>
                        </p>
                        <p>
                          Determined via {pdbResult?.experimentalMethod.join(', ')} with a combined resolution of{' '}
                          {pdbResult?.resolutionCombined?.[0] ? `${pdbResult.resolutionCombined[0]} Å` : 'high resolution'}.
                        </p>
                        <p className="text-slate-400">
                          Provenance: [Experimentally determined - RCSB PDB]
                        </p>
                      </>
                    )}

                    {activeMode === 'pubchem' && (
                      <>
                        <p>
                          <strong>Medicinal Chemistry Profile for {pubchemResult?.name}:</strong>
                        </p>
                        <p>
                          Evaluation against Lipinski's Rule of 5 indicates{' '}
                          {lipinskiResult?.passesRuleOfFive ? 'favorable drug-like oral bioavailability' : 'potential bioavailability limitations'}{' '}
                          with {lipinskiResult?.violationsCount} rule violation(s).
                        </p>
                        <p className="text-slate-400">
                          Provenance: [Literature curated - PubChem]
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
