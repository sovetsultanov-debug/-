import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  Copy,
  Check,
  FileCode,
  Download,
  Terminal,
  Layers,
  HelpCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  ClaudeSkillDefinition,
  formatClaudeSkillMd,
  generateClaudeInstallCommand,
} from '../utils/skill-generator';

interface SkillBuilderProps {
  onSaveSkill: (newSkill: ClaudeSkillDefinition) => void;
  onNavigateToLibrary: () => void;
}

export const SkillBuilder: React.FC<SkillBuilderProps> = ({
  onSaveSkill,
  onNavigateToLibrary,
}) => {
  const [name, setName] = useState<string>('biopython-msa-runner');
  const [title, setTitle] = useState<string>('BioPython Multiple Sequence Alignment Runner');
  const [category, setCategory] = useState<ClaudeSkillDefinition['category']>('programming');
  const [slashCommand, setSlashCommand] = useState<string>('/msa-align');
  const [version, setVersion] = useState<string>('1.0.0');
  const [description, setDescription] = useState<string>(
    'Automate Clustal Omega and MUSCLE sequence alignments via BioPython with automatic consensus sequence extraction and tree generation.'
  );
  const [tagsInput, setTagsInput] = useState<string>('biopython, msa, alignment, clustal');
  const [toolsInput, setToolsInput] = useState<string>('python3, biopython, clustalo');
  const [systemInstructions, setSystemInstructions] = useState<string>(
    `You are a senior bioinformatics software engineer and Claude Code agent.
When invoked with FASTA sequences:
1. Verify each sequence has valid FASTA headers and IUPAC amino acid characters.
2. Run Clustal Omega via BioPython Bio.Align.Applications or EBI REST API.
3. Compute percent identity matrix and identify conserved catalytic residue columns.
4. Output aligned FASTA and formatted consensus sequence.`
  );
  const [cliFilename, setCliFilename] = useState<string>('run_msa.py');
  const [cliLanguage, setCliLanguage] = useState<'python' | 'bash' | 'typescript'>('python');
  const [cliCode, setCliCode] = useState<string>(`#!/usr/bin/env python3
"""
Claude Code Tool: BioPython Sequence Alignment Automator
"""
import sys
from Bio import AlignIO

def inspect_alignment(alignment_file: str):
    try:
        alignment = AlignIO.read(alignment_file, "fasta")
        print(f"Alignment length: {alignment.get_alignment_length()}")
        for record in alignment:
            print(f">{record.id} ({len(record.seq)} aa)")
    except Exception as e:
        print(f"Error parsing alignment: {e}", file=sys.stderr)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        inspect_alignment(sys.argv[1])
`);

  const [examples, setExamples] = useState<
    Array<{ userPrompt: string; claudeAction: string; expectedOutputSummary: string }>
  >([
    {
      userPrompt: 'Align human, mouse, and zebrafish p53 sequences',
      claudeAction: 'Invokes Clustal Omega tool and calculates conserved DNA-binding core residues.',
      expectedOutputSummary: 'Returns aligned FASTA with identity matrix and phylogenetic tree.',
    },
  ]);

  const [criteria, setCriteria] = useState<string[]>([
    'Validates FASTA format before alignment execution',
    'Outputs consensus sequence with percent identity scores',
  ]);

  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Compile active skill object
  const currentSkill: ClaudeSkillDefinition = {
    id: name.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
    name: name.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
    title,
    category,
    slashCommand: slashCommand.startsWith('/') ? slashCommand : `/${slashCommand}`,
    version,
    description,
    tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    toolsRequired: toolsInput.split(',').map((t) => t.trim()).filter(Boolean),
    systemInstructions,
    cliScript: cliFilename ? { filename: cliFilename, language: cliLanguage, code: cliCode } : undefined,
    examples,
    acceptanceCriteria: criteria,
  };

  const formattedMarkdown = formatClaudeSkillMd(currentSkill);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(formattedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSaveSkill(currentSkill);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onNavigateToLibrary();
    }, 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SKILL.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
            Claude Code Skill Architect
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            Build &amp; Package Custom Claude Code Skills
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Create production-ready Claude Code skills following Anthropic's official{' '}
            <code className="text-blue-300 font-mono">.claude/skills/&lt;name&gt;/SKILL.md</code> standard with YAML
            frontmatter, slash command bindings, and CLI helper scripts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-600"
          >
            <Download className="w-3.5 h-3.5" />
            Download SKILL.md
          </button>
          <button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            {savedSuccess ? 'Added to Catalog!' : 'Save & Add to Catalog'}
          </button>
        </div>
      </div>

      {/* Editor & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Input Form (6 cols) */}
        <div className="lg:col-span-6 space-y-4 bg-slate-800/60 border border-slate-700/80 rounded-xl p-5 text-xs text-slate-200">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-700 pb-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Skill Configuration &amp; Metadata
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Skill Identifier (Folder)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Slash Command</label>
              <input
                type="text"
                value={slashCommand}
                onChange={(e) => setSlashCommand(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-teal-400 text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Human-Readable Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-blue-500"
              >
                <option value="programming">Scientific Programming &amp; Python</option>
                <option value="proteins">Proteins &amp; 3D Structures</option>
                <option value="chemistry">Chemistry &amp; Drug Discovery</option>
                <option value="genomics">Genomics &amp; Variants</option>
                <option value="literature">Literature &amp; Trials</option>
                <option value="pathways">Pathways &amp; Networks</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Description (for intent matching)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tools Required</label>
              <input
                type="text"
                value={toolsInput}
                onChange={(e) => setToolsInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              System Instructions &amp; Agent Rules
            </label>
            <textarea
              rows={5}
              value={systemInstructions}
              onChange={(e) => setSystemInstructions(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:outline-hidden focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* Embedded Automation Script */}
          <div className="pt-2 border-t border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-300">Companion Automation Script</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={cliFilename}
                  onChange={(e) => setCliFilename(e.target.value)}
                  placeholder="script.py"
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 font-mono text-[11px] w-28"
                />
                <select
                  value={cliLanguage}
                  onChange={(e) => setCliLanguage(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[11px]"
                >
                  <option value="python">Python</option>
                  <option value="bash">Bash</option>
                  <option value="typescript">TypeScript</option>
                </select>
              </div>
            </div>
            <textarea
              rows={6}
              value={cliCode}
              onChange={(e) => setCliCode(e.target.value)}
              className="w-full bg-slate-950 text-emerald-300 border border-slate-700 rounded-lg p-2.5 font-mono text-[11px] focus:outline-hidden focus:border-blue-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Right: Live Formatted SKILL.md Preview (6 cols) */}
        <div className="lg:col-span-6 flex flex-col bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-md">
          <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-200 text-xs">
                Generated .claude/skills/{currentSkill.name}/SKILL.md
              </span>
            </div>

            <button
              onClick={handleCopyMarkdown}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors border border-slate-600"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Markdown
                </>
              )}
            </button>
          </div>

          <div className="flex-1 p-4 bg-slate-950 font-mono text-[11px] text-slate-300 overflow-y-auto max-h-[700px] scrollbar-thin">
            <pre className="whitespace-pre-wrap leading-relaxed select-all">
              {formattedMarkdown}
            </pre>
          </div>

          <div className="p-3 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Valid YAML Frontmatter &amp; Claude Code Standard</span>
            <span className="font-mono text-teal-400">{formattedMarkdown.length} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
};
