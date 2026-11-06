import React from 'react';
import {
  Dna,
  Terminal,
  FlaskConical,
  BookOpen,
  Sparkles,
  Layers,
  Code,
  Compass,
} from 'lucide-react';

export type ActiveTab = 'library' | 'workbench' | 'builder' | 'guide';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  skillCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  skillCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 p-0.5 shadow-sm flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Dna className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-100 tracking-tight">
                  Claude Code <span className="text-blue-400">Skills Studio</span>
                </h1>
                <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono font-semibold px-2 py-0.5 rounded">
                  Science &amp; Programming
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                DeepMind Science Skills, 3D AlphaFold/PDB Analysis &amp; Claude Code Agent Automation
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
            <button
              onClick={() => onTabChange('library')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'library'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Skill Catalog</span>
              <span className="ml-0.5 bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {skillCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('workbench')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'workbench'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Live 3D Workbench</span>
            </button>

            <button
              onClick={() => onTabChange('builder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'builder'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skill Builder</span>
            </button>

            <button
              onClick={() => onTabChange('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>CLI Guide</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
