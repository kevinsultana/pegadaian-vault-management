'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../store/useVaultStore';
import { CheckCircle2, ChevronRight, ChevronLeft, ShieldCheck } from 'lucide-react';

export default function PocVerificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { scenarioId } = useVaultStore();

  const tests = [
    {
      id: 'UT-01',
      title: 'UT-01: Pembacaan Normal Lemari LT-01',
      desc: 'Jumlah tag terbaca == Jumlah item fisik di setiap laci (39 item fisik = 39 tag sistem).',
      passed: true,
      current: scenarioId === 'UT-01',
    },
    {
      id: 'UT-02',
      title: 'UT-02: Mutasi Sah Antar Laci (L01→L02)',
      desc: 'Lokasi baru terdeteksi otomatis, total item lemari tetap 39, riwayat mutasi tercatat lengkap di Audit Trail.',
      passed: true,
      current: scenarioId === 'UT-02',
    },
    {
      id: 'UT-03',
      title: 'UT-03: Perpindahan Tanpa Dokumen (Misplaced)',
      desc: 'Item tanpa dokumen mutasi otomatis ditandai status MISPLACED dan memicu alert.',
      passed: true,
      current: scenarioId === 'UT-03',
    },
    {
      id: 'UT-04',
      title: 'UT-04: Deteksi Selisih Item Tidak Terbaca',
      desc: 'Alert muncul dalam 1 siklus baca, dapat diklasifikasikan (Misplaced/Missing/Unexpected) & diterbitkan Berita Acara.',
      passed: true,
      current: scenarioId === 'UT-04',
    },
    {
      id: 'UT-05',
      title: 'UT-05: Rekapitulasi Dashboard Akurasi',
      desc: 'Angka KPI ringkasan konsisten 100% dengan hasil rekonsiliasi lemari fisik (IRA 99.92%).',
      passed: true,
      current: scenarioId === 'UT-05',
    },
  ];

  return (
    <div
      className={`fixed top-14 right-0 z-30 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-28px)]'
      }`}
    >
      <div className="flex items-start">
        {/* Toggle Tab */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#0f233a] text-white p-2 rounded-l-lg border-l border-y border-[#234266] shadow-lg flex items-center gap-1 text-[11px] font-semibold tracking-wide hover:bg-[#162d48] transition-colors cursor-pointer"
          title="Kriteria Penerimaan Uji PoC"
        >
          {isOpen ? <ChevronRight className="w-4 h-4 text-cyan-300" /> : <ChevronLeft className="w-4 h-4 text-cyan-300" />}
          <span className="[writing-mode:vertical-rl] rotate-180 py-1 text-slate-200">
            Kriteria Uji PoC
          </span>
        </button>

        {/* Drawer Body */}
        <div className="w-80 bg-white border-l border-b border-slate-200 rounded-bl-xl shadow-2xl p-4 space-y-3 text-xs max-h-[85vh] overflow-y-auto">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="font-bold text-slate-800">Status Verifikasi PoC</h4>
              <p className="text-[10px] text-slate-500">Tabel 12.1 Dokumen PoC Pegadaian</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {tests.map((t) => (
              <div
                key={t.id}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  t.current
                    ? 'border-[#00b4d8] bg-sky-50/60 ring-1 ring-[#00b4d8]'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800 text-[11px]">{t.id}</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[10px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Lulus Uji
                  </span>
                </div>
                <p className="font-medium text-slate-700 text-[11px]">{t.title}</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center font-mono">
            Pegadaian Vault System • Verified Client PoC
          </div>
        </div>
      </div>
    </div>
  );
}
