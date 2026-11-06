import React, { useState } from 'react';
import {
  Code,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Play,
  FileCode,
  Tag,
  Dna,
  FlaskConical,
  BookOpen,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ClaudeSkillDefinition, formatClaudeSkillMd, generateClaudeInstallCommand } from '../utils/skill-generator';

interface SkillLibraryProps {
  skills: ClaudeSkillDefinition[];
  onSelectSkillForLiveTest: (skill: ClaudeSkillDefinition) => void;
  onNavigateToBuilder: () => void;
}

export const SkillLibrary: React.FC<SkillLibraryProps> = ({
  skills,
  onSelectSkillForLiveTest,
  onNavigateToBuilder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingSkill, setInspectingSkill] = useState<ClaudeSkillDefinition | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'markdown' | 'script' | 'install'>('markdown');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Skills', icon: Layers },
    { id: 'proteins', label: 'Proteins & Structures', icon: Dna },
    { id: 'chemistry', label: 'Chemistry & Drugs', icon: FlaskConical },
    { id: 'genomics', label: 'Genomics & Variants', icon: Tag },
    { id: 'literature', label: 'Literature & Citations', icon: BookOpen },
    { id: 'programming', label: 'Scientific Python & Code', icon: Cpu },
  ];

  const filteredSkills = skills.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slashCommand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Explanation */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-teal-900/30 border border-blue-800/50 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                Claude Code Specification (.claude/skills)
              </span>
              <span className="text-blue-300 text-xs">DeepMind Science Skills &amp; Bio-Programming</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Curated Claude Code Skills for Bioscience &amp; Programming
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Turn Claude Code into a specialized scientific assistant. Install these skills into your project's{' '}
              <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono text-xs">.claude/skills/</code>{' '}
              directory to enable slash commands like <code className="text-teal-300 font-mono text-xs">/af-analyze</code>,{' '}
              <code className="text-teal-300 font-mono text-xs">/pdb</code>, or{' '}
              <code className="text-teal-300 font-mono text-xs">/drug-scout</code>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNavigateToBuilder}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Create Custom Skill
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
          {categories.map((c) => {
            const Icon = c.icon;
            const isActive = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search skills, commands, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => (
          <div
            key={skill.id}
            className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-xl p-4 transition-all flex flex-col justify-between shadow-xs group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-teal-400 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded">
                  {skill.slashCommand}
                </span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                  v{skill.version}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                {skill.title}
              </h3>

              <p className="text-xs text-slate-300 mt-1.5 line-clamp-3 leading-relaxed">
                {skill.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {skill.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-slate-900/80 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
              <button
                onClick={() => setInspectingSkill(skill)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                aria-label={`Inspect ${skill.name} SKILL.md`}
              >
                <FileCode className="w-3.5 h-3.5" />
                Inspect SKILL.md
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectSkillForLiveTest(skill)}
                  className="bg-teal-600 hover:bg-teal-500 text-white px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors shadow-xs"
                  title="Run real live test in scientific workbench"
                >
                  <Play className="w-3 h-3" />
                  Live Test
                </button>
                <button
                  onClick={() => handleCopy(generateClaudeInstallCommand(skill), `install-${skill.id}`)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 p-1.5 rounded transition-colors"
                  title="Copy Claude Code install command"
                  aria-label="Copy install command"
                >
                  {copiedId === `install-${skill.id}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-12 bg-slate-800/40 rounded-xl border border-slate-700 border-dashed">
          <Layers className="w-8 h-8 mx-auto text-slate-500 mb-2" />
          <p className="text-sm text-slate-300 font-medium">No skills match your filter</p>
          <p className="text-xs text-slate-400 mt-1">Try searching another keyword or create a custom skill.</p>
        </div>
      )}

      {/* Skill Inspector Modal */}
      {inspectingSkill && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/20 text-blue-400 p-2 rounded-lg border border-blue-500/30">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-base">{inspectingSkill.title}</h3>
                    <span className="font-mono text-xs text-teal-400 bg-teal-950/70 border border-teal-800/80 px-2 py-0.5 rounded">
                      {inspectingSkill.slashCommand}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    .claude/skills/{inspectingSkill.name}/SKILL.md
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectSkillForLiveTest(inspectingSkill);
                    setInspectingSkill(null);
                  }}
                  className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  Test Live
                </button>
                <button
                  onClick={() => setInspectingSkill(null)}
                  className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-lg font-bold leading-none"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
              <button
                onClick={() => setInspectorTab('markdown')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  inspectorTab === 'markdown' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Full SKILL.md
              </button>
              {inspectingSkill.cliScript && (
                <button
                  onClick={() => setInspectorTab('script')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    inspectorTab === 'script' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  CLI Script ({inspectingSkill.cliScript.filename})
                </button>
              )}
              <button
                onClick={() => setInspectorTab('install')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  inspectorTab === 'install' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Claude CLI Install Command
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 font-mono text-xs bg-slate-950 text-slate-200 scrollbar-thin">
              {inspectorTab === 'markdown' && (
                <div className="relative">
                  <button
                    onClick={() => handleCopy(formatClaudeSkillMd(inspectingSkill), 'modal-md')}
                    className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] flex items-center gap-1 border border-slate-700 transition-colors"
                  >
                    {copiedId === 'modal-md' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Markdown
                      </>
                    )}
                  </button>
                  <pre className="whitespace-pre-wrap leading-relaxed pr-24">
                    {formatClaudeSkillMd(inspectingSkill)}
                  </pre>
                </div>
              )}

              {inspectorTab === 'script' && inspectingSkill.cliScript && (
                <div className="relative">
                  <button
                    onClick={() => handleCopy(inspectingSkill.cliScript!.code, 'modal-script')}
                    className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] flex items-center gap-1 border border-slate-700 transition-colors"
                  >
                    {copiedId === 'modal-script' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Script
                      </>
                    )}
                  </button>
                  <pre className="whitespace-pre-wrap leading-relaxed pr-24 text-emerald-300">
                    {inspectingSkill.cliScript.code}
                  </pre>
                </div>
              )}

              {inspectorTab === 'install' && (
                <div className="space-y-4 font-sans text-xs">
                  <div>
                    <h4 className="font-semibold text-slate-100 text-sm mb-1">
                      One-line Installation into Claude Code
                    </h4>
                    <p className="text-slate-400 text-xs mb-3">
                      Run this command in your project terminal or user directory to make this skill available to Claude Code:
                    </p>
                    <div className="relative bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-blue-300">
                      <button
                        onClick={() => handleCopy(generateClaudeInstallCommand(inspectingSkill), 'modal-install')}
                        className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded text-[10px] flex items-center gap-1 border border-slate-700 transition-colors"
                      >
                        {copiedId === 'modal-install' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                      <pre className="whitespace-pre-wrap pr-16">
                        {generateClaudeInstallCommand(inspectingSkill)}
                      </pre>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                    <h5 className="font-semibold text-slate-200 mb-1">How to invoke in Claude Code:</h5>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      <li>
                        Using slash command:{' '}
                        <code className="text-teal-300 font-mono font-bold">
                          claude &quot;{inspectingSkill.slashCommand} P04637&quot;
                        </code>
                      </li>
                      <li>
                        Using natural language prompt:{' '}
                        <code className="text-teal-300 font-mono">
                          claude &quot;{inspectingSkill.examples[0]?.userPrompt || inspectingSkill.description}&quot;
                        </code>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
              <span>Claude Code Skills Standard 2026</span>
              <button
                onClick={() => setInspectingSkill(null)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
