'use client';

import React from 'react';
import { useVaultStore } from '../store/useVaultStore';
import { Shield, User, ShieldCheck } from 'lucide-react';

export default function Header() {
  const { lastScanTime, currentRole, setCurrentRole } = useVaultStore();

  let username = 'petugas.vault01';
  let roleBadgeColor = 'text-cyan-300 border-cyan-800 bg-cyan-950/40';

  if (currentRole === 'SUPERVISOR') {
    username = 'supervisor.vault';
    roleBadgeColor = 'text-amber-300 border-amber-800 bg-amber-950/40';
  } else if (currentRole === 'SPI') {
    username = 'auditor.spi01';
    roleBadgeColor = 'text-emerald-300 border-emerald-800 bg-emerald-950/40';
  }

  return (
    <header className="bg-[#0f233a] text-white px-6 py-2.5 flex items-center justify-between border-b border-[#1c3755] select-none sticky top-0 z-30 shadow-sm print:hidden">
      {/* Brand Title */}
      <div className="flex items-center space-x-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[#00b4d8] animate-pulse"></div>
        <h1 className="text-[15px] font-semibold tracking-wide flex items-center gap-2">
          <span>UNOTEK</span>
          <span className="text-slate-400 font-normal">•</span>
          <span className="font-normal text-slate-100">Vault Management System</span>
        </h1>
      </div>

      {/* Role Switcher & User Meta */}
      <div className="flex items-center space-x-3 text-xs font-mono text-slate-300">
        {/* Role Selector Dropdown */}
        <div className="flex items-center space-x-2 bg-[#172d47] px-2.5 py-1 rounded-lg border border-[#234266]">
          <span className="text-[11px] font-sans text-slate-400 font-medium">Peran Aktif:</span>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            className="bg-[#0f233a] text-xs font-sans font-semibold text-white px-2 py-0.5 rounded border border-[#2b4c74] focus:outline-none focus:ring-1 focus:ring-[#00b4d8] cursor-pointer"
            title="Ganti peran pengguna simulasi"
          >
            <option value="PETUGAS">Petugas Vault</option>
            <option value="SUPERVISOR">Supervisor Vault (Approval)</option>
            <option value="SPI">SPI (Auditor / Read-Only)</option>
          </select>
        </div>

        {/* User Identity Info */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-[#172d47] px-3 py-1 rounded-lg border border-[#234266]">
          <span className="text-slate-400">Vault 1</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-200">Pegadaian</span>
          <span className="text-slate-500">|</span>
          <span className={`px-1.5 py-0.2 rounded border font-semibold ${roleBadgeColor}`}>
            {username}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">20/10/2026 {lastScanTime.slice(0, 5)}</span>
        </div>
      </div>
    </header>
  );
}

