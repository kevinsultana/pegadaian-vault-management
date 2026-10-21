'use client';

import React, { useState, useEffect } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import { FileText, X, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function BeritaAcaraModal() {
  const {
    beritaAcaraModalOpen,
    setBeritaAcaraModalOpen,
    createBeritaAcara,
    selectedAlertItem,
    items,
  } = useVaultStore();

  const targetItem =
    selectedAlertItem ||
    items.find((i) => !i.isPhysicallyPresent && i.status !== 'RECONCILED_VIRT') ||
    items.find((i) => !i.isPhysicallyPresent) || {
      id: 'E0040024',
      brand: 'Galeri24 5g',
      systemDrawerId: 'L05',
      drawerId: 'L05',
    };

  const [officer, setOfficer] = useState('petugas.vault01');
  const [witness, setWitness] = useState('supervisor.vault');
  const [findings, setFindings] = useState(
    `Item ${targetItem.brand} (${targetItem.id}) tidak terdeteksi oleh reader RFID pada laci ${
      targetItem.systemDrawerId || targetItem.drawerId || 'L05'
    } maupun kabinet LT-01 setelah verifikasi fisik berkala. Diajukan penyesuaian administratif ke akun selisih opname.`
  );

  useEffect(() => {
    if (targetItem) {
      setFindings(
        `Item ${targetItem.brand} (${targetItem.id}) tidak terdeteksi oleh reader RFID pada laci ${
          targetItem.systemDrawerId || targetItem.drawerId || 'L05'
        } maupun kabinet LT-01 setelah verifikasi fisik berkala. Diajukan penyesuaian administratif ke akun selisih opname.`
      );
    }
  }, [targetItem?.id]);

  if (!beritaAcaraModalOpen) return null;

  const today = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const baNumber = `BA-${new Date().getFullYear()}-${Math.floor(Date.now() % 10000)
    .toString()
    .padStart(4, '0')}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    createBeritaAcara({ officer, witness, findings });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0f233a] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                Penerbitan Berita Acara Rekonsiliasi (BA-DIFF)
              </h3>
              <p className="text-[10px] text-cyan-200">
                Otorisasi Penyesuaian Selisih Inventori Fisik Vault
              </p>
            </div>
          </div>
          <button
            onClick={() => setBeritaAcaraModalOpen(false)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Akun Posting Highlight Banner */}
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-rose-900 leading-tight">
              <span className="font-bold">Akun Penyesuaian Virtual Resmi: </span>
              <span className="font-mono font-black text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-300 ml-1">
                VIRT/OPNAME-DIFF
              </span>
              <p className="text-[10px] text-rose-700/80 mt-1">
                Seluruh nilai buku item akan dibukukan sementara ke akun penampung selisih ini hingga audit SPI selesai.
              </p>
            </div>
          </div>

          {/* Auto Metadata Fields */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 font-mono">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-sans">No. Berita Acara:</span>
              <span className="font-bold text-slate-800">{baNumber}</span>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-sans">Tanggal Penerbitan:</span>
              <span className="text-slate-800">{today}</span>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-sans">Item Objek Selisih:</span>
              <span className="text-rose-700 font-bold">
                {targetItem.id} — {targetItem.brand}
              </span>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-sans">Posisi Laci Asal:</span>
              <span className="text-slate-800 font-bold">
                {targetItem.systemDrawerId || targetItem.drawerId || 'L05'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Nomor Akun Penyesuaian:</span>
              <span className="text-[#0f233a] font-bold bg-amber-100/70 border border-amber-300 px-2 py-0.5 rounded">
                VIRT/OPNAME-DIFF
              </span>
            </div>
          </div>

          {/* Petugas Pemeriksa */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Petugas Pemeriksa (Operator)</label>
            <input
              type="text"
              value={officer}
              onChange={(e) => setOfficer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00b4d8]"
            />
          </div>

          {/* Saksi / Supervisor */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Saksi Lapangan / Supervisor Vault</label>
            <input
              type="text"
              value={witness}
              onChange={(e) => setWitness(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00b4d8]"
            />
          </div>

          {/* Catatan Hasil Pengecekan Fisik */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Catatan Hasil Pemeriksaan Fisik</label>
            <textarea
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00b4d8] text-slate-700"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setBeritaAcaraModalOpen(false)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#0f233a] hover:bg-[#162d48] text-white font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Posting Dokumen ke VIRT/OPNAME-DIFF</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
