'use client';

import React from 'react';
import { useVaultStore } from '../store/useVaultStore';

export default function Header() {
  const { lastScanTime } = useVaultStore();

  return (
    <header className="bg-[#0f233a] text-white px-6 py-2.5 flex items-center justify-between border-b border-[#1c3755] select-none sticky top-0 z-30 shadow-sm">
      {/* Brand Title */}
      <div className="flex items-center space-x-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[#00b4d8] animate-pulse"></div>
        <h1 className="text-[15px] font-semibold tracking-wide flex items-center gap-2">
          <span>UNOTEK</span>
          <span className="text-slate-400 font-normal">•</span>
          <span className="font-normal text-slate-100">Vault Management System</span>
        </h1>
      </div>

      {/* Session / Vault Location & User Meta */}
      <div className="flex items-center space-x-4 text-xs font-mono text-slate-300">
        <div className="flex items-center space-x-1.5 bg-[#172d47] px-3 py-1 rounded border border-[#234266]">
          <span className="text-slate-400">Vault 1</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-200">Pegadaian</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300">petugas.vault01</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">20/10/2026 {lastScanTime.slice(0, 5)}</span>
        </div>
      </div>
    </header>
  );
}
