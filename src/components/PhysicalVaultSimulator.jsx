'use client';

import React, { useState, useEffect } from 'react';
import { useVaultStore } from '../store/useVaultStore';
import {
  Cpu,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowRightLeft,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function PhysicalVaultSimulator() {
  const [isMinimized, setIsMinimized] = useState(false);
  const {
    items,
    movePhysicalItem,
    removePhysicalItem,
    restorePhysicalItem,
    runRfidScan,
    isScanning,
    autoScan,
    toggleAutoScan,
    resetToDefault,
  } = useVaultStore();

  // Find key test items
  const itemE0040007 = items.find((i) => i.id === 'E0040007');
  const itemE0040024 = items.find((i) => i.id === 'E0040024');

  const isE0040007InL02 = itemE0040007?.physicalDrawerId === 'L02';
  const isE0040024Removed = itemE0040024?.isPhysicallyPresent === false;

  // Auto scan interval effect (15 seconds when active)
  useEffect(() => {
    let timer = null;
    if (autoScan) {
      timer = setInterval(() => {
        runRfidScan();
      }, 15000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoScan, runRfidScan]);

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm w-full select-none">
      <div className="bg-[#0f233a]/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-[#234266] overflow-hidden transition-all">
        {/* Header bar / Minimize toggle */}
        <div
          onClick={() => setIsMinimized(!isMinimized)}
          className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#162f4e] transition-colors border-b border-[#1c3755]"
        >
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold tracking-wide text-slate-100">
              Simulasi Fisik Vault (Hardware Sandbox)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {autoScan && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" title="Auto-scan aktif" />
            )}
            <button className="text-slate-400 hover:text-white">
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Simulator Controls Body */}
        {!isMinimized && (
          <div className="p-4 space-y-3 text-xs">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Simulasikan interaksi fisik barang di dunia nyata sebelum/sesudah reader RFID memindai lemari.
            </p>

            <div className="space-y-2">
              {/* Aksi 1: Pindahkan Fisik E0040007 (L01 <-> L02) */}
              <div className="p-2.5 rounded-lg bg-[#162a45] border border-[#25466e] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">
                    Fisik UBS 25g <span className="font-mono text-cyan-300">(E0040007)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Posisi Fisik: <span className="font-mono font-bold text-amber-300">{itemE0040007?.physicalDrawerId || 'L01'}</span>
                    {' '}(Sistem: {itemE0040007?.drawerId || 'L01'})
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isE0040007InL02) {
                      restorePhysicalItem('E0040007', 'L01');
                    } else {
                      movePhysicalItem('E0040007', 'L02');
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    isE0040007InL02
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-sky-600 hover:bg-sky-700 text-white'
                  }`}
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>{isE0040007InL02 ? 'Balikkan ke L01' : 'Pindah ke L02'}</span>
                </button>
              </div>

              {/* Aksi 2: Ambil / Hilangkan Fisik E0040024 dari L05 */}
              <div className="p-2.5 rounded-lg bg-[#162a45] border border-[#25466e] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">
                    Fisik Galeri24 5g <span className="font-mono text-cyan-300">(E0040024)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Kondisi Fisik:{' '}
                    {isE0040024Removed ? (
                      <span className="font-bold text-rose-400">DIKELUARKAN / TIDAK ADA</span>
                    ) : (
                      <span className="font-bold text-emerald-400">ADA DI L05</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isE0040024Removed) {
                      restorePhysicalItem('E0040024', 'L05');
                    } else {
                      removePhysicalItem('E0040024');
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    isE0040024Removed
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>{isE0040024Removed ? 'Masukkan ke L05' : 'Keluarkan dari L05'}</span>
                </button>
              </div>
            </div>

            {/* Aksi 3: Trigger Scan & Auto Read */}
            <div className="pt-2 border-t border-[#1c3755] flex items-center justify-between gap-2">
              <button
                onClick={runRfidScan}
                disabled={isScanning}
                className="flex-1 bg-[#00b4d8] hover:bg-[#0096b4] text-[#0f233a] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Memindai...' : 'Trigger Scan Reader'}</span>
              </button>

              <button
                onClick={toggleAutoScan}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center gap-1 text-[11px] transition-colors cursor-pointer border ${
                  autoScan
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    : 'bg-[#18324f] text-slate-300 border-[#234266] hover:bg-[#204369]'
                }`}
                title="Pindai otomatis setiap 15 detik"
              >
                <span>Auto:</span>
                <span className="font-bold">{autoScan ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Reset Database ke Nilai Awal */}
            <div className="pt-1 text-center">
              <button
                onClick={resetToDefault}
                className="text-[10px] text-slate-400 hover:text-rose-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Seluruh Data ke Default</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
