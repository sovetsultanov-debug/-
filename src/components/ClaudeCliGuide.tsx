import React, { useState } from 'react';
import {
  Terminal,
  Copy,
  Check,
  FolderGit2,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { SCIENCE_SKILLS_CATALOG } from '../data/skills-catalog';
import { generateClaudeInstallCommand } from '../utils/skill-generator';

export const ClaudeCliGuide: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const allSkillsInstallScript = `#!/usr/bin/env bash
# Install all DeepMind Science & Programming Skills into Claude Code
mkdir -p ~/.claude/skills

echo "Installing Claude Code Bioscience & Programming Skills..."

${SCIENCE_SKILLS_CATALOG.map((skill) => generateClaudeInstallCommand(skill)).join('\n\n')}

echo "All ${SCIENCE_SKILLS_CATALOG.length} skills successfully installed into ~/.claude/skills/!"
echo "You can now run: claude '/af-analyze P04637' or claude '/pdb 1TUP'"`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-200">
      {/* Title Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
            Official Architecture Guide
          </span>
          <span className="text-slate-400 text-xs">Anthropic Claude Code CLI</span>
        </div>
        <h2 className="text-xl font-bold text-white">How to Use &amp; Integrate Skills in Claude Code</h2>
        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
          Claude Code supports custom skills that augment the CLI agent with domain-specific rules,
          prompt templates, scripts, and tool definitions. Skills can be installed either globally
          for your user account or locally per project repository.
        </p>
      </div>

      {/* Bulk Install Card */}
      <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/60 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-sm">Install Entire Bioscience Skills Suite (1-Click Bash Script)</h3>
          </div>
          <button
            onClick={() => handleCopy(allSkillsInstallScript, 'all-skills')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {copiedId === 'all-skills' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied Script!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Installer Script
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-300 mb-3">
          Installs all {SCIENCE_SKILLS_CATALOG.length} skills (AlphaFold DB, RCSB PDB, UniProt, PubChem/ChEMBL, ClinVar, PubMed, and Scientific Python) directly into <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300 font-mono">~/.claude/skills/</code>.
        </p>
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-teal-300 max-h-40 overflow-y-auto scrollbar-thin">
          <pre>{allSkillsInstallScript}</pre>
        </div>
      </div>

      {/* Directory Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
            <FolderGit2 className="w-4 h-4" />
            <span>Option 1: Project Repository Level</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Commit skills into your git repository so anyone cloning your project automatically gets the skills:
          </p>
          <div className="bg-slate-950 p-2.5 rounded font-mono text-[11px] text-slate-300 border border-slate-800">
            my-bio-project/<br />
            ├── .claude/<br />
            │   └── skills/<br />
            │       ├── alphafold-structure-analyzer/<br />
            │       │   └── SKILL.md<br />
            │       └── chembl-pubchem-drug-scout/<br />
            │           └── SKILL.md<br />
            └── src/
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs">
            <Cpu className="w-4 h-4" />
            <span>Option 2: User Home Directory (Global)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Install skills globally so Claude Code can use them across all terminal sessions and directories:
          </p>
          <div className="bg-slate-950 p-2.5 rounded font-mono text-[11px] text-slate-300 border border-slate-800">
            ~/.claude/<br />
            └── skills/<br />
            &nbsp;&nbsp;&nbsp;&nbsp;├── alphafold-structure-analyzer/<br />
            &nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── SKILL.md<br />
            &nbsp;&nbsp;&nbsp;&nbsp;└── rcsb-pdb-inspector/<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── SKILL.md
          </div>
        </div>
      </div>

      {/* Invocation Methods */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-5 space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          How Claude Code Invokes Skills
        </h3>

        <div className="space-y-3 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-teal-300 block mb-1">1. Direct Slash Command Invocation:</span>
            <p className="text-slate-400 mb-2">
              Prefix your prompt with the configured slash command. Claude Code directly loads the skill instructions:
            </p>
            <div className="bg-slate-950 p-2 rounded font-mono text-[11px] text-slate-200">
              $ claude &quot;/af-analyze P04637&quot;<br />
              $ claude &quot;/pdb 1TUP&quot;<br />
              $ claude &quot;/drug-scout Imatinib&quot;
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-blue-300 block mb-1">2. Natural Language Intent Matching:</span>
            <p className="text-slate-400 mb-2">
              Claude Code inspects the <code className="text-slate-200 font-mono">description</code> and{' '}
              <code className="text-slate-200 font-mono">tags</code> in the skill's YAML frontmatter. When a user asks:
            </p>
            <div className="bg-slate-950 p-2 rounded font-mono text-[11px] text-slate-200">
              $ claude &quot;Download and check the AlphaFold pLDDT confidence for human p53&quot;
            </div>
            <p className="text-slate-400 mt-2">
              Claude Code automatically selects <code className="text-blue-300 font-mono">alphafold-structure-analyzer</code> and executes its workflow!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
