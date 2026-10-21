'use client';

import React from 'react';
import { useVaultStore } from '../store/useVaultStore';
import { RotateCcw, CheckCircle2, ArrowRightLeft, AlertOctagon, LayoutGrid } from 'lucide-react';

export default function DemoController() {
  const { scenarioId, executeScenario, resetToDefault } = useVaultStore();

  const scenarios = [
    { id: 'UT-01', label: 'UT-01 Normal (39 Tag)', icon: CheckCircle2 },
    { id: 'UT-02', label: 'UT-02 Mutasi Sah (L01→L02)', icon: ArrowRightLeft },
    { id: 'UT-03', label: 'UT-03 Misplaced (Tanpa Dokumen)', icon: AlertOctagon },
    { id: 'UT-04', label: 'UT-04 Selisih (L05 Missing)', icon: AlertOctagon },
    { id: 'UT-05', label: 'UT-05 Dashboard Ringkasan', icon: LayoutGrid },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-[#0f233a]/95 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-2xl border border-[#234266] flex items-center gap-2 select-none">
      <span className="text-[11px] font-mono text-cyan-300 font-semibold px-2 uppercase tracking-wider">
        Skenario PoC:
      </span>

      <div className="flex items-center gap-1.5">
        {scenarios.map((scen) => {
          const Icon = scen.icon;
          const isActive = scenarioId === scen.id;
          return (
            <button
              key={scen.id}
              onClick={() => executeScenario(scen.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-[#00b4d8] text-[#0f233a] font-bold shadow-md'
                  : 'bg-[#18324f] text-slate-200 hover:bg-[#204369]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{scen.label}</span>
            </button>
          );
        })}
      </div>

      <div className="h-4 w-px bg-slate-700 mx-1" />

      {/* Reset Demo State to Default */}
      <button
        onClick={resetToDefault}
        title="Reset Demo Data ke Nilai Awal"
        className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 hover:border-rose-500/50"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset Data</span>
      </button>
    </div>
  );
}
