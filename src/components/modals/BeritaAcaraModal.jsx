'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import { FileText, X } from 'lucide-react';

export default function BeritaAcaraModal() {
  const {
    beritaAcaraModalOpen,
    setBeritaAcaraModalOpen,
    createBeritaAcara,
  } = useVaultStore();

  const [officer, setOfficer] = useState('petugas.vault01');
  const [witness, setWitness] = useState('supervisor.vault');
  const [findings, setFindings] = useState('Item Galeri24 5g (E0040024) tidak ditemukan pada fisik laci L05 maupun kabinet LT-01 setelah 3x rescanning desktop reader. Tidak ada rekaman transaksi pengeluaran dalam sistem.');

  if (!beritaAcaraModalOpen) return null;

  const today = new Date().toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const baNumber = `BA-${new Date().getFullYear()}-${Math.floor(Date.now() % 10000).toString().padStart(4, '0')}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    createBeritaAcara({ officer, witness, findings });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#0f233a] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm tracking-wide">
              Berita Acara Selisih — VIRT/OPNAME-DIFF
            </h3>
          </div>
          <button onClick={() => setBeritaAcaraModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Auto fields */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">No. Berita Acara:</span>
              <span className="font-bold text-slate-800">{baNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Tanggal:</span>
              <span className="text-slate-800">{today}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Item Objek:</span>
              <span className="text-rose-700 font-bold">E0040024 — Galeri24 5 g / L05</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Akun Posting:</span>
              <span className="text-slate-900 font-bold">VIRT/OPNAME-DIFF</span>
            </div>
          </div>

          {/* Petugas Pemeriksa */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Petugas Pemeriksa</label>
            <input
              type="text"
              value={officer}
              onChange={(e) => setOfficer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00b4d8]"
            />
          </div>

          {/* Saksi / Supervisor */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Saksi / Supervisor</label>
            <input
              type="text"
              value={witness}
              onChange={(e) => setWitness(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00b4d8]"
            />
          </div>

          {/* Catatan Hasil Pengecekan Fisik */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Catatan Hasil Pengecekan Fisik</label>
            <textarea
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00b4d8] text-slate-700"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setBeritaAcaraModalOpen(false)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#0f233a] hover:bg-[#162d48] text-white font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Simpan & Posting ke VIRT/OPNAME-DIFF</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
