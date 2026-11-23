'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import { FileText, X, AlertTriangle, ShieldCheck } from 'lucide-react';

function BeritaAcaraForm({ targetItem, onClose }) {
  const { createBeritaAcara } = useVaultStore();

  const [officer, setOfficer] = useState('petugas.vault01');
  const [witness, setWitness] = useState('supervisor.vault');
  const [findings, setFindings] = useState(
    () =>
      `Item ${targetItem?.brand} (${targetItem?.id}) tidak terdeteksi oleh reader RFID pada laci ${
        targetItem?.systemDrawerId || targetItem?.drawerId || 'L03'
      } maupun kabinet LT-01 setelah verifikasi fisik berkala. Diajukan penyesuaian administratif ke akun selisih opname.`
  );
  const [baNumber] = useState(
    () => `BA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000 + 1000))}`
  );

  const today = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createBeritaAcara({ officer, witness, findings });
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="bg-[#0f233a] text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-bold text-sm tracking-wide">
              Penerbitan Berita Acara Rekonsiliasi (BA-DIFF)
            </h3>
            <p className="text-[10px] text-slate-300">
              Penyelesaian selisih fisik opname & otorisasi posting ke akun virtual
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Nomor Dokumen</span>
            <span className="font-mono font-bold text-slate-800">{baNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Tanggal Terbit</span>
            <span className="font-mono text-slate-800">{today}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Tag Target Selisih</span>
            <span className="font-mono font-bold text-rose-700">{targetItem.id} ({targetItem.brand})</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Laci Asal Sistem</span>
            <span className="font-mono text-slate-800">{targetItem.systemDrawerId || targetItem.drawerId}</span>
          </div>
        </div>

        {/* Posting Account Info Banner */}
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Akun Posting Otomatis:</strong> Saldo keping emas ini akan dipindahkan secara administratif dari laci{' '}
            <span className="font-mono font-bold">{targetItem.systemDrawerId || targetItem.drawerId}</span> ke akun penampung virtual{' '}
            <span className="font-mono font-bold text-slate-900 bg-amber-200/60 px-1 py-0.2 rounded">VIRT/OPNAME-DIFF</span> sampai verifikasi audit SPI selesai.
          </div>
        </div>

        {/* Officer & Witness Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Petugas Pembuat:</label>
            <input
              type="text"
              value={officer}
              onChange={(e) => setOfficer(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 font-mono text-xs"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Saksi / Supervisor:</label>
            <input
              type="text"
              value={witness}
              onChange={(e) => setWitness(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 font-mono text-xs"
              required
            />
          </div>
        </div>

        {/* Findings Textarea */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Uraian Temuan Selisih & Rekomendasi:</label>
          <textarea
            rows={3}
            value={findings}
            onChange={(e) => setFindings(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs leading-relaxed"
            required
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Terbitkan & Rekonsiliasi Saldo</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BeritaAcaraModal() {
  const {
    beritaAcaraModalOpen,
    setBeritaAcaraModalOpen,
    selectedAlertItem,
    items,
  } = useVaultStore();

  if (!beritaAcaraModalOpen) return null;

  const targetItem =
    selectedAlertItem ||
    items.find((i) => !i.isPhysicallyPresent && i.status !== 'RECONCILED_VIRT') ||
    items.find((i) => !i.isPhysicallyPresent) || {
      id: 'E0040024',
      brand: 'Galeri24 5g',
      systemDrawerId: 'L03',
      drawerId: 'L03',
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <BeritaAcaraForm
        targetItem={targetItem}
        onClose={() => setBeritaAcaraModalOpen(false)}
      />
    </div>
  );
}
