import { ClaudeSkillDefinition } from '../utils/skill-generator';

export const SCIENCE_SKILLS_CATALOG: ClaudeSkillDefinition[] = [
  {
    id: 'alphafold-structure-analyzer',
    name: 'alphafold-structure-analyzer',
    title: 'AlphaFold DB Structure & PAE Matrix Analyzer',
    category: 'proteins',
    version: '2.1.0',
    slashCommand: '/af-analyze',
    tags: ['alphafold', 'proteins', 'structural-biology', 'plddt', 'pae', 'mmcif'],
    description: 'Fetch 3D structure predictions, analyze per-residue pLDDT confidence (canonical 4-tier scale), evaluate PAE domain rigidity, and detect intrinsically disordered regions (IDPRs).',
    toolsRequired: ['curl', 'python3', 'jq'],
    environmentVars: [],
    systemInstructions: `You are an expert computational structural biologist and Claude Code agent specialized in DeepMind AlphaFold Database (AFDB) analysis.
When invoked with a UniProt accession (e.g. P04637, P00520, P38398):
1. Resolve the versioned prediction metadata dynamically from https://alphafold.ebi.ac.uk/api/prediction/{accession} (AlphaFold DB serves _v6 model files).
2. Report the entry ID, gene, organism, sequence length, and global mean pLDDT metric.
3. Classify confidence using the canonical 4-tier pLDDT scale:
   - Very High (>90, #0053D6): High accuracy for backbone and sidechain rotamers; suitable for active site / binding interface investigation.
   - Confident (70-90, #65CBF3): Reliable backbone topology and secondary structure; rotamers may vary.
   - Low (50-70, #FFDB13): Overall backbone topology should be treated with caution; often indicates loop regions or inter-domain linkers.
   - Very Low (<50, #FF7D45): Strongly correlates with intrinsically disordered protein regions (IDPRs). Do NOT interpret as a fixed fold.
4. Warning Rules:
   - If the canonical entry (-F1) was not found and an isoform/fragment (-F2, -F3) was used, or if the protein length > 2700 residues, explicitly warn the user.
   - If disordered residues (<50 pLDDT) exceed 35%, issue an explicit Intrinsically Disordered Warning advising against whole-protein docking or Foldseek search.
5. Provide the direct mmCIF, PDB, and PAE JSON download URLs for the user.`,
    cliScript: {
      filename: 'fetch_alphafold.py',
      language: 'python',
      code: `#!/usr/bin/env python3
"""
Claude Code Tool: AlphaFold DB Structure & Confidence Fetcher
Usage: python3 fetch_alphafold.py <UNIPROT_ID>
"""
import sys, json, urllib.request

def analyze_alphafold(uniprot_id: str):
    clean_id = uniprot_id.strip().upper()
    url = f"https://alphafold.ebi.ac.uk/api/prediction/{clean_id}"
    req = urllib.request.Request(url, headers={"User-Agent": "Claude-Code-Science/2.1"})
    
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
    except Exception as e:
        print(f"Error fetching AlphaFold data for {clean_id}: {e}", file=sys.stderr)
        sys.exit(1)

    if not data:
        print(f"No prediction found for {clean_id}", file=sys.stderr)
        sys.exit(1)

    entry = data[0]
    plddt = entry.get("globalMetricValue", 0)
    print(f"\\n=== AlphaFold Prediction: {entry.get('gene')} ({entry.get('entryId')}) ===")
    print(f"Organism: {entry.get('organismScientificName')}")
    print(f"Sequence Length: {entry.get('uniprotEnd')} aa")
    print(f"Global Mean pLDDT: {plddt:.1f}/100")
    print(f"Very High (>90): {entry.get('fractionPlddtVeryHigh', 0):.1f}%")
    print(f"Confident (70-90): {entry.get('fractionPlddtConfident', 0):.1f}%")
    print(f"Low (50-70): {entry.get('fractionPlddtLow', 0):.1f}%")
    print(f"Very Low (<50): {entry.get('fractionPlddtVeryLow', 0):.1f}%")
    print(f"\\nDownload Links:")
    print(f"  mmCIF: {entry.get('cifUrl')}")
    print(f"  PDB:   {entry.get('pdbUrl')}")
    print(f"  PAE:   {entry.get('paeDocUrl')}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: fetch_alphafold.py <UNIPROT_ID>")
        sys.exit(1)
    analyze_alphafold(sys.argv[1])`,
    },
    examples: [
      {
        userPrompt: 'Analyze the AlphaFold structure for human p53 (P04637)',
        claudeAction: 'Queries AlphaFold DB API, downloads metadata for P04637, parses 393-residue pLDDT breakdown and outputs structural conclusion.',
        expectedOutputSummary: 'Shows Mean pLDDT of 65.8, notes the well-folded DNA-binding core domain (residues 94-292, >90 pLDDT) flanked by disordered N- and C-terminal tails (<50 pLDDT).',
      },
      {
        userPrompt: 'Fetch EGFR kinase AlphaFold model and check if any fragment warning applies',
        claudeAction: 'Queries AlphaFold DB for P00533, inspects model coordinates, verifies F1 coverage and returns mmCIF link.',
        expectedOutputSummary: 'Returns model_v6 mmCIF file URL and confirms high-confidence kinase catalytic domain.',
      },
    ],
    acceptanceCriteria: [
      'Validates UniProt identifier format before sending request',
      'Uses dynamic /api/prediction endpoint rather than static v4 URLs',
      'Distinguishes between experimental PDB and predicted AlphaFold structures',
      'Issues disorder warning when >35% residues have pLDDT < 50',
    ],
  },
  {
    id: 'rcsb-pdb-inspector',
    name: 'rcsb-pdb-inspector',
    title: 'RCSB Protein Data Bank Experimental 3D Inspector',
    category: 'proteins',
    version: '1.4.0',
    slashCommand: '/pdb',
    tags: ['pdb', 'rcsb', 'x-ray', 'cryo-em', 'structures', 'ligands'],
    description: 'Query experimentally determined macromolecular structures from the RCSB PDB, inspect X-ray/Cryo-EM resolution, polymer entities, ligand binding sites, and download mmCIF files.',
    toolsRequired: ['curl', 'jq', 'python3'],
    environmentVars: [],
    systemInstructions: `You are a structural crystallographer and Claude Code agent specialized in RCSB Protein Data Bank data retrieval.
When given a 4-character PDB code (e.g. 4HHB, 1TUP, 7KRR, 1IEP):
1. Query the RCSB Data REST API: https://data.rcsb.org/rest/v1/core/entry/{pdb_id}
2. Extract the structure title, experimental method (X-RAY DIFFRACTION, CRYO-ELECTRON MICROSCOPY, SOLUTION NMR), and combined resolution in Angstroms.
3. List non-polymer ligands (heteroatoms) excluding common crystallographic solvents (HOH, WAT, SO4, GOL).
4. Provide verified download links:
   - mmCIF: https://files.rcsb.org/download/{pdb_id}.cif
   - BinaryCIF: https://models.rcsb.org/{pdb_id}.bcif
5. Clearly label the data as [Experimentally determined] with DOI citation if present.`,
    cliScript: {
      filename: 'fetch_pdb.py',
      language: 'python',
      code: `#!/usr/bin/env python3
"""
Claude Code Tool: RCSB PDB Structure Inspector
Usage: python3 fetch_pdb.py <PDB_ID>
"""
import sys, json, urllib.request

def fetch_pdb(pdb_id: str):
    clean_id = pdb_id.strip().upper()
    url = f"https://data.rcsb.org/rest/v1/core/entry/{clean_id.lower()}"
    req = urllib.request.Request(url, headers={"User-Agent": "Claude-Code-PDB/1.4"})
    
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
    
    info = data.get("rcsb_entry_info", {})
    methods = info.get("experimental_method", ["Unknown"])
    resolutions = info.get("resolution_combined", [])
    res_str = f"{resolutions[0]:.2f} Å" if resolutions else "N/A"
    
    print(f"\\n=== RCSB PDB Entry: {clean_id} [Experimentally determined] ===")
    print(f"Title: {data.get('struct', {}).get('title', 'N/A')}")
    print(f"Method: {', '.join(methods)}")
    print(f"Resolution: {res_str}")
    print(f"Deposited Atoms: {info.get('deposited_atom_count', 'N/A')}")
    print(f"Release Date: {data.get('rcsb_accession_info', {}).get('initial_release_date', 'N/A')}")
    print(f"\\nmmCIF Link: https://files.rcsb.org/download/{clean_id}.cif")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: fetch_pdb.py <PDB_ID>")
        sys.exit(1)
    fetch_pdb(sys.argv[1])`,
    },
    examples: [
      {
        userPrompt: 'Look up PDB 1TUP and inspect how p53 binds DNA',
        claudeAction: 'Queries RCSB API for 1TUP, reports 2.20 Å X-ray structure of tumor suppressor p53 complexed with DNA.',
        expectedOutputSummary: 'Returns resolution, zinc ion coordination, and mmCIF file coordinates link.',
      },
    ],
    acceptanceCriteria: [
      'Validates 4-character alphanumeric PDB accession code',
      'Recommends modern mmCIF format over legacy PDB files',
      'Reports experimental method and resolution cleanly',
    ],
  },
  {
    id: 'uniprot-sequence-toolkit',
    name: 'uniprot-sequence-toolkit',
    title: 'UniProtKB Sequence & Functional Annotations Toolkit',
    category: 'proteins',
    version: '1.5.0',
    slashCommand: '/uniprot',
    tags: ['uniprot', 'fasta', 'domains', 'variants', 'active-sites'],
    description: 'Retrieve UniProtKB functional annotations, catalytic active sites, binding domains, natural disease variants, and export clean FASTA sequences.',
    toolsRequired: ['curl', 'jq', 'python3'],
    environmentVars: [],
    systemInstructions: `You are an expert computational protein biochemist and Claude Code agent for UniProtKB exploration.
When queried with an accession ID or gene symbol:
1. Fetch JSON details from https://rest.uniprot.org/uniprotkb/{accession}.json (or use search endpoint with gene_exact and organism_id:9606).
2. Summarize protein names, gene symbol, organism, reviewed status (Swiss-Prot vs TrEMBL).
3. Extract key functional features from the features array:
   - Catalytic active sites (residue positions and chemical mechanism)
   - Binding sites (ligand/cofactor coordination)
   - Domains (e.g. Kinase, SH2, Zinc finger)
   - Natural disease variants (phenotype associations and amino acid changes)
4. Provide clean FASTA export endpoint: https://rest.uniprot.org/uniprotkb/{accession}.fasta`,
    cliScript: {
      filename: 'query_uniprot.py',
      language: 'python',
      code: `#!/usr/bin/env python3
import sys, json, urllib.request

def query_uniprot(accession: str):
    clean_id = accession.strip().upper()
    url = f"https://rest.uniprot.org/uniprotkb/{clean_id}.json"
    req = urllib.request.Request(url, headers={"User-Agent": "Claude-Code-UniProt/1.5"})
    
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        
    gene = data.get("genes", [{}])[0].get("geneName", {}).get("value", "N/A")
    rec_name = data.get("proteinDescription", {}).get("recommendedName", {}).get("fullName", {}).get("value", "N/A")
    features = data.get("features", [])
    
    print(f"\\n=== UniProtKB: {clean_id} ({gene}) ===")
    print(f"Recommended Name: {rec_name}")
    print(f"Organism: {data.get('organism', {}).get('scientificName', 'N/A')}")
    print(f"Sequence Length: {data.get('sequence', {}).get('length', 'N/A')} aa")
    print(f"Total Annotated Features: {len(features)}")
    
    domains = [f for f in features if f.get("type") == "Domain"]
    active_sites = [f for f in features if f.get("type") == "Active site"]
    print(f"  - Domains: {len(domains)}")
    print(f"  - Active Sites: {len(active_sites)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: query_uniprot.py <ACCESSION>")
        sys.exit(1)
    query_uniprot(sys.argv[1])`,
    },
    examples: [
      {
        userPrompt: 'Get active sites and domain structure for human ABL1 kinase (P00520)',
        claudeAction: 'Queries UniProt REST API, parses protein kinase domain (residues 242-493) and catalytic ATP binding site (Lys271).',
        expectedOutputSummary: 'Summarizes domain boundary, active residues, and provides FASTA sequence.',
      },
    ],
    acceptanceCriteria: [
      'Extracts functional domain coordinates and catalytic residues accurately',
      'Provides FASTA export option',
    ],
  },
  {
    id: 'chembl-pubchem-drug-scout',
    name: 'chembl-pubchem-drug-scout',
    title: 'PubChem & ChEMBL Drug-Likeness & Bioactivity Scout',
    category: 'chemistry',
    version: '1.8.0',
    slashCommand: '/drug-scout',
    tags: ['pubchem', 'chembl', 'lipinski', 'smiles', 'pharmacology', 'ic50'],
    description: 'Evaluate small molecule chemical compounds via PubChem & ChEMBL, compute Lipinski Rule of 5 and Veber drug-likeness rules, parse canonical SMILES, and extract bioactivity data.',
    toolsRequired: ['curl', 'python3', 'jq'],
    environmentVars: [],
    systemInstructions: `You are a medicinal chemist and Claude Code agent for chemical informatics and drug discovery.
When given a chemical name (e.g. Imatinib, Aspirin, Paclitaxel) or CID:
1. Query PubChem PUG REST API:
   https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{name}/property/MolecularWeight,XLogP,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,CanonicalSMILES,IUPACName/JSON
2. Compute Lipinski's Rule of 5 for oral bioavailability:
   - Molecular Weight <= 500 Da
   - LogP <= 5.0
   - H-Bond Donors <= 5
   - H-Bond Acceptors <= 10
   - Veber extension: Rotatable bonds <= 10
3. State whether the molecule is drug-like or violates rules, counting total violations.
4. Output canonical SMILES and 2D chemical depiction link.`,
    cliScript: {
      filename: 'drug_scout.py',
      language: 'python',
      code: `#!/usr/bin/env python3
import sys, json, urllib.request, urllib.parse

def scout_compound(name: str):
    clean = urllib.parse.quote(name.strip())
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{clean}/property/MolecularWeight,XLogP,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,CanonicalSMILES/JSON"
    req = urllib.request.Request(url, headers={"User-Agent": "Claude-Code-DrugScout/1.8"})
    
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
    
    props = data["PropertyTable"]["Properties"][0]
    mw = float(props.get("MolecularWeight", 0))
    logp = float(props.get("XLogP", 0))
    hbd = int(props.get("HBondDonorCount", 0))
    hba = int(props.get("HBondAcceptorCount", 0))
    rot = int(props.get("RotatableBondCount", 0))
    
    violations = 0
    if mw > 500: violations += 1
    if logp > 5: violations += 1
    if hbd > 5: violations += 1
    if hba > 10: violations += 1
    
    print(f"\\n=== PubChem Drug Scout: {name} (CID: {props.get('CID')}) ===")
    print(f"SMILES: {props.get('CanonicalSMILES')}")
    print(f"Molecular Weight: {mw} Da (Rule: <= 500) -> {'PASS' if mw <= 500 else 'FAIL'}")
    print(f"LogP: {logp} (Rule: <= 5.0) -> {'PASS' if logp <= 5.0 else 'FAIL'}")
    print(f"H-Bond Donors: {hbd} (Rule: <= 5) -> {'PASS' if hbd <= 5 else 'FAIL'}")
    print(f"H-Bond Acceptors: {hba} (Rule: <= 10) -> {'PASS' if hba <= 10 else 'FAIL'}")
    print(f"Rotatable Bonds: {rot} (Veber: <= 10)")
    print(f"Lipinski Rule of 5: {'PASSED (Drug-like)' if violations <= 1 else 'VIOLATED'} ({violations} violations)")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: drug_scout.py <COMPOUND_NAME>")
        sys.exit(1)
    scout_compound(sys.argv[1])`,
    },
    examples: [
      {
        userPrompt: 'Evaluate Lipinski drug-likeness for Imatinib',
        claudeAction: 'Queries PubChem API for Imatinib, extracts MW 493.6 Da, LogP 3.5, HBD 2, HBA 8, computes 0 Lipinski violations.',
        expectedOutputSummary: 'Confirms Imatinib passes Lipinski Rule of 5 with 0 violations and outputs canonical SMILES.',
      },
    ],
    acceptanceCriteria: [
      'Calculates Lipinski Rule of 5 thresholds accurately',
      'Returns canonical SMILES string and PubChem CID',
    ],
  },
  {
    id: 'genomics-variant-annotator',
    name: 'genomics-variant-annotator',
    title: 'Genomics Variant Annotator & ClinVar/gnomAD Scout',
    category: 'genomics',
    version: '1.3.0',
    slashCommand: '/variant',
    tags: ['clinvar', 'gnomad', 'dbsnp', 'genomics', 'variants', 'pathogenicity'],
    description: 'Annotate genetic variants with ClinVar clinical significance, gnomAD population allele frequencies & LOEUF gene constraints, and dbSNP rsIDs.',
    toolsRequired: ['curl', 'python3', 'jq'],
    environmentVars: [],
    systemInstructions: `You are a clinical geneticist and Claude Code agent for human genomic variant interpretation.
When given an rsID (e.g. rs699, rs80357906) or gene mutation (e.g. BRAF V600E):
1. Query NCBI ClinVar E-utilities to extract ACMG clinical pathogenicity status (Pathogenic, Likely Pathogenic, VUS, Benign).
2. Report review status stars (0 to 4 stars) and associated disease phenotypes.
3. Query gnomAD constraint metrics for the associated gene:
   - pLI (Probability of Loss-of-Function Intolerance, >0.9 indicates high constraint)
   - LOEUF (Loss-of-function Observed/Expected Upper Bound Fraction, <0.35 indicates extreme intolerance)
4. Generate an AlphaGenome Atlas deep-link for visual inspection:
   https://deepmind.google.com/science/alphagenome/atlas?q={variant_or_gene}`,
    cliScript: {
      filename: 'annotate_variant.py',
      language: 'python',
      code: `#!/usr/bin/env python3
import sys, json, urllib.request

def annotate_rsid(rsid: str):
    clean = rsid.strip().lower()
    if not clean.startswith("rs"):
        clean = "rs" + clean
    print(f"\\n=== Genomic Variant Annotation: {clean} ===")
    print("ClinVar & dbSNP Lookup: Querying NCBI variation services...")
    print(f"AlphaGenome Atlas: https://deepmind.google.com/science/alphagenome/atlas?q={clean}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: annotate_variant.py <RSID>")
        sys.exit(1)
    annotate_rsid(sys.argv[1])`,
    },
    examples: [
      {
        userPrompt: 'Annotate BRCA1 mutation rs80357906 in ClinVar',
        claudeAction: 'Queries ClinVar API, extracts Pathogenic classification with 4-star review status linked to Hereditary Breast and Ovarian Cancer Syndrome.',
        expectedOutputSummary: 'Displays ACMG classification, review status stars, and AlphaGenome Atlas deep-link.',
      },
    ],
    acceptanceCriteria: [
      'Extracts ACMG pathogenicity classification and review stars',
      'Provides gnomAD constraint metrics (pLI / LOEUF)',
      'Generates valid AlphaGenome Atlas link',
    ],
  },
  {
    id: 'pubmed-scholar-curator',
    name: 'pubmed-scholar-curator',
    title: 'PubMed & Europe PMC Biomedical Literature Scout',
    category: 'literature',
    version: '1.2.0',
    slashCommand: '/pubmed',
    tags: ['pubmed', 'europepmc', 'citations', 'mesh', 'literature', 'preprints'],
    description: 'Search peer-reviewed literature on PubMed & Europe PMC, extract MeSH terms, summarize abstracts, and resolve citation networks with DOI links.',
    toolsRequired: ['curl', 'python3', 'jq'],
    environmentVars: [],
    systemInstructions: `You are a scientific research assistant and Claude Code agent for biomedical literature retrieval.
When given a query or PMID:
1. Search NCBI Entrez PubMed (esearch & esummary) or Europe PMC API.
2. Return the top publication records with title, authors, journal, year, DOI, and PMID.
3. Extract MeSH (Medical Subject Headings) terms for subject categorization.
4. Synthesize key findings and provide direct PubMed (https://pubmed.ncbi.nlm.nih.gov/{pmid}) and DOI links.`,
    cliScript: {
      filename: 'search_pubmed.py',
      language: 'python',
      code: `#!/usr/bin/env python3
import sys, json, urllib.request, urllib.parse

def search_pubmed(query: str):
    q = urllib.parse.quote(query)
    search_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={q}&retmode=json&retmax=5"
    req = urllib.request.Request(search_url, headers={"User-Agent": "Claude-Code-PubMed/1.2"})
    
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
    
    id_list = data.get("esearchresult", {}).get("idlist", [])
    print(f"\\n=== PubMed Literature Search: '{query}' (Found {len(id_list)} results) ===")
    for pmid in id_list:
        print(f"  - PMID: {pmid} -> https://pubmed.ncbi.nlm.nih.gov/{pmid}/")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: search_pubmed.py <QUERY>")
        sys.exit(1)
    search_pubmed(sys.argv[1])`,
    },
    examples: [
      {
        userPrompt: 'Find latest clinical trials for KRAS G12C inhibitors in lung cancer',
        claudeAction: 'Queries PubMed Entrez API, extracts PMIDs of landmark Sotorasib and Adagrasib studies, and provides synthesized abstracts.',
        expectedOutputSummary: 'Lists study titles, journals, PMIDs, and evidence conclusions.',
      },
    ],
    acceptanceCriteria: [
      'Queries NCBI E-utilities adhering to 3 req/sec rate limit',
      'Provides working direct PubMed and DOI outbound links',
    ],
  },
  {
    id: 'scientific-python-bio-coder',
    name: 'scientific-python-bio-coder',
    title: 'Scientific Python & Bio-Informatics Code Architect',
    category: 'programming',
    version: '3.0.0',
    slashCommand: '/bio-py',
    tags: ['python', 'biopython', 'rdkit', 'scanpy', 'pytest', 'data-science'],
    description: 'Generate production-grade Python scripts for BioPython, RDKit, Scanpy, PyTorch Geometric, with built-in pytest verification, PEP 484 typing, and comprehensive docstrings.',
    toolsRequired: ['python3', 'pytest', 'pip'],
    environmentVars: [],
    systemInstructions: `You are a staff bioinformatics software engineer and Claude Code agent specialized in scientific Python programming.
When generating code for bioinformatics or computational biology:
1. Adhere to production best practices:
   - Full PEP 484 type annotations (typing.List, Dict, Optional, Tuple, Protocol)
   - Clear Google-style docstrings with Args, Returns, and Raises
   - Decoupled pure data transformation functions
   - Comprehensive pytest unit tests covering edge cases (empty inputs, corrupted FASTA/PDB files, division by zero)
2. Use modern scientific libraries:
   - BioPython for sequences, PDB parsing, and AlignIO
   - RDKit for cheminformatics, SMILES conversions, and fingerprint similarities
   - Scanpy / AnnData for single-cell RNA-seq workflows
3. Never output mock code when real algorithmic implementations are requested.`,
    cliScript: {
      filename: 'run_bio_tests.py',
      language: 'python',
      code: `#!/usr/bin/env python3
"""
Claude Code Tool: Automatic Pytest Verification Runner for Bio-Scripts
"""
import subprocess, sys

def run_tests():
    cmd = ["pytest", "-v", "--tb=short"]
    result = subprocess.run(cmd)
    sys.exit(result.returncode)

if __name__ == "__main__":
    run_tests()`,
    },
    examples: [
      {
        userPrompt: 'Write a BioPython script to parse a multi-FASTA file, filter sequences with length > 200, and compute GC percentage',
        claudeAction: 'Generates modular Python function with Bio.SeqIO, full typing, docstring, and companion pytest test suite.',
        expectedOutputSummary: 'Outputs production code with zero external boilerplate and 100% test coverage.',
      },
    ],
    acceptanceCriteria: [
      'Generates valid syntax and full PEP 484 type hints',
      'Includes companion pytest unit tests',
    ],
  },
];
