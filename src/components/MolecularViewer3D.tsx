import React, { useEffect, useRef, useState } from 'react';
import * as $3Dmol from '3dmol';
import { RotateCw, ZoomIn, Eye, Sparkles, Layers, RefreshCw } from 'lucide-react';
import { PLDDT_TIERS } from '../utils/science-calculations';

interface MolecularViewer3DProps {
  cifUrl?: string;
  pdbUrl?: string;
  isAlphaFold?: boolean;
  structureTitle?: string;
  uniprotAccession?: string;
}

export const MolecularViewer3D: React.FC<MolecularViewer3DProps> = ({
  cifUrl,
  pdbUrl,
  isAlphaFold = true,
  structureTitle = '3D Macromolecular Structure',
  uniprotAccession,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [styleMode, setStyleMode] = useState<'cartoon' | 'stick' | 'sphere' | 'surface'>('cartoon');
  const [colorMode, setColorMode] = useState<'plddt' | 'spectrum' | 'chain'>('plddt');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [bgDark, setBgDark] = useState<boolean>(true);
  const [selectedResidue, setSelectedResidue] = useState<string | null>(null);

  // Initialize viewer and load structure
  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setSelectedResidue(null);

    // Clean up existing viewer if any
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    try {
      const viewer = $3Dmol.createViewer(containerRef.current, {
        defaultcolors: ($3Dmol as any).elementColors || ($3Dmol as any).rasmolElementColors,
        backgroundColor: bgDark ? '#0F172A' : '#F8FAFC',
      });
      viewerRef.current = viewer;

      // Determine structure URL
      const targetUrl = cifUrl || pdbUrl || (uniprotAccession 
        ? `https://alphafold.ebi.ac.uk/files/AF-${uniprotAccession}-F1-model_v6.cif`
        : 'https://files.rcsb.org/download/1TUP.cif');

      const fileFormat = targetUrl.endsWith('.pdb') ? 'pdb' : 'cif';

      fetch(targetUrl)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch structure file`);
          return res.text();
        })
        .then((data) => {
          if (!isMounted || !viewer) return;
          viewer.clear();
          viewer.addModel(data, fileFormat);

          applyStyling(viewer, styleMode, isAlphaFold && colorMode === 'plddt');

          // Click handler for residues
          viewer.setClickable({}, true, (atom: any) => {
            if (!atom) return;
            const resName = atom.resn || 'RES';
            const resNum = atom.resi || '';
            const chain = atom.chain ? `Chain ${atom.chain}` : '';
            const bFact = typeof atom.b === 'number' ? ` (pLDDT / B-factor: ${atom.b.toFixed(1)})` : '';
            setSelectedResidue(`${resName} ${resNum} ${chain}${bFact}`);
          });

          viewer.zoomTo();
          viewer.render();
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error('Error loading 3D coordinates:', err);
          setError(`Could not load 3D coordinates: ${err.message}. Showing interactive structural summary.`);
          setLoading(false);
        });
    } catch (err: any) {
      console.error('Viewer initialization error:', err);
      setError(`3D WebGL initialization error: ${err.message}`);
      setLoading(false);
    }

    return () => {
      isMounted = false;
      if (viewerRef.current) {
        try {
          viewerRef.current.spin(false);
        } catch {
          // ignore
        }
      }
    };
  }, [cifUrl, pdbUrl, uniprotAccession, bgDark]);

  // Apply visual style or color change
  const applyStyling = (viewer: any, style: string, usePlddtColors: boolean) => {
    if (!viewer) return;

    const plddtColorFunc = (atom: any) => {
      const b = atom.b ?? 50;
      if (b > 90) return '#0053D6'; // Very High
      if (b >= 70) return '#65CBF3'; // Confident
      if (b >= 50) return '#FFDB13'; // Low
      return '#FF7D45';             // Very Low / Disordered
    };

    const colorConfig = usePlddtColors
      ? { colorfunc: plddtColorFunc }
      : colorMode === 'spectrum'
      ? { color: 'spectrum' }
      : { colorscheme: 'amino' };

    viewer.setStyle({}, {});

    if (style === 'cartoon') {
      viewer.setStyle({ hetflag: false }, { cartoon: colorConfig });
      viewer.setStyle({ hetflag: true }, { stick: { radius: 0.25, colorscheme: 'Jmol' }, sphere: { scale: 0.3 } });
    } else if (style === 'stick') {
      viewer.setStyle({}, { stick: { radius: 0.2, ...colorConfig } });
    } else if (style === 'sphere') {
      viewer.setStyle({}, { sphere: { scale: 0.8, ...colorConfig } });
    } else if (style === 'surface') {
      viewer.setStyle({ hetflag: false }, { cartoon: colorConfig });
      try {
        viewer.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.7, ...colorConfig });
      } catch {
        // Fallback to cartoon if surface fails
        viewer.setStyle({}, { cartoon: colorConfig });
      }
    }

    viewer.render();
  };

  const handleStyleChange = (style: 'cartoon' | 'stick' | 'sphere' | 'surface') => {
    setStyleMode(style);
    if (viewerRef.current) {
      applyStyling(viewerRef.current, style, isAlphaFold && colorMode === 'plddt');
    }
  };

  const handleColorChange = (col: 'plddt' | 'spectrum' | 'chain') => {
    setColorMode(col);
    if (viewerRef.current) {
      applyStyling(viewerRef.current, styleMode, isAlphaFold && col === 'plddt');
    }
  };

  const toggleSpin = () => {
    const next = !isSpinning;
    setIsSpinning(next);
    if (viewerRef.current) {
      viewerRef.current.spin(next, [0, 1, 0]);
    }
  };

  const resetCamera = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomTo();
      viewerRef.current.render();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-md">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700 text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-100 truncate">{structureTitle}</span>
          {isAlphaFold && (
            <span className="bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded text-[10px] border border-blue-700 font-mono">
              AlphaFold v6
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Style selector */}
          <div className="flex items-center bg-slate-900 rounded p-0.5 border border-slate-700">
            {(['cartoon', 'stick', 'sphere'] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleStyleChange(s)}
                className={`px-2 py-0.5 rounded text-[11px] capitalize transition-colors ${
                  styleMode === s ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label={`Style: ${s}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Color selector */}
          {isAlphaFold && (
            <div className="flex items-center bg-slate-900 rounded p-0.5 border border-slate-700">
              <button
                onClick={() => handleColorChange('plddt')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  colorMode === 'plddt' ? 'bg-teal-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label="Color by pLDDT confidence"
              >
                pLDDT
              </button>
              <button
                onClick={() => handleColorChange('spectrum')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  colorMode === 'spectrum' ? 'bg-teal-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label="Color by spectrum"
              >
                Rainbow
              </button>
            </div>
          )}

          {/* Spin toggle */}
          <button
            onClick={toggleSpin}
            className={`p-1.5 rounded transition-colors ${
              isSpinning ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
            title="Toggle Continuous Rotation"
            aria-label="Toggle Continuous Rotation"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Reset Zoom */}
          <button
            onClick={resetCamera}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
            title="Reset Camera Zoom"
            aria-label="Reset Camera"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Background toggle */}
          <button
            onClick={() => setBgDark(!bgDark)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
            title="Toggle Canvas Background Theme"
            aria-label="Toggle Canvas Theme"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Surface */}
      <div className="relative flex-1 min-h-[380px] w-full bg-slate-950">
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-xs z-10 text-slate-300">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mb-2" />
            <span className="text-xs font-medium">Fetching 3D coordinates &amp; rendering WebGL model...</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 p-6 text-center z-10">
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-200 text-xs max-w-md">
              <p className="font-semibold mb-1">Notice: Direct coordinate render fallback</p>
              <p>{error}</p>
              <p className="mt-2 text-[11px] text-slate-400">
                You can still analyze pLDDT metrics, domain boundaries, and sequence annotations in the inspector.
              </p>
            </div>
          </div>
        )}

        {/* Selected residue overlay */}
        {selectedResidue && (
          <div className="absolute top-2 left-2 z-10 bg-slate-900/90 border border-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs backdrop-blur-xs shadow-md">
            <span className="text-blue-400 font-mono font-medium">{selectedResidue}</span>
          </div>
        )}

        {/* AlphaFold Canonical pLDDT Color Legend Overlay */}
        {isAlphaFold && colorMode === 'plddt' && (
          <div className="absolute bottom-2 left-2 right-2 z-10 bg-slate-900/85 border border-slate-700/80 rounded-lg p-2 backdrop-blur-xs text-[11px] flex flex-wrap items-center justify-between gap-1 text-slate-300">
            <span className="font-medium text-slate-400 mr-1">pLDDT Confidence:</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: PLDDT_TIERS.VERY_HIGH.hex }} />
              <span className="font-mono text-xs">Very High (&gt;90)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: PLDDT_TIERS.CONFIDENT.hex }} />
              <span className="font-mono text-xs">Confident (70-90)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: PLDDT_TIERS.LOW.hex }} />
              <span className="font-mono text-xs">Low (50-70)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: PLDDT_TIERS.VERY_LOW.hex }} />
              <span className="font-mono text-xs">Disordered (&lt;50)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
