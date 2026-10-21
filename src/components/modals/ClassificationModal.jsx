'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import { AlertCircle, CheckCircle, FileText, X } from 'lucide-react';

export default function ClassificationModal() {
  const {
    classificationModalOpen,
    selectedClassificationType,
    setClassificationModalOpen,
    classifySelisih,
    setBeritaAcaraModalOpen,
  } = useVaultStore();

  const [notes, setNotes] = useState('');

  if (!classificationModalOpen) return null;

  const type = selectedClassificationType || 'MISSING';

  const handleSubmit = (e) => {
    e.preventDefault();
    classifySelisih(type, notes);
    setNotes('');

    // If MISSING, automatically suggest opening Berita Acara
    if (type === 'MISSING') {
      setTimeout(() => {
        setBeritaAcaraModalOpen(true);
      }, 250);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#0f233a] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm tracking-wide">
              Klasifikasi Selisih — Laci L05
            </h3>
          </div>
          <button
            onClick={() => setClassificationModalOpen(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Target Item Info */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <p className="font-semibold text-slate-800">
              Item Terindikasi Selisih: <span className="font-mono text-rose-600">E0040024</span>
            </p>
            <p className="text-slate-600">
              Barang: Galeri24 5 g (999,9) · Lokasi Terakhir: LT-01/L05
            </p>
            <p className="text-slate-500 text-[11px]">
              Kondisi: Tidak terbaca antena reader MARS-4AT tanpa rekaman transaksi keluar.
            </p>
          </div>

          {/* Classification Options Info Box */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">
              Pilihan Klasifikasi:
            </label>

            {type === 'MISPLACED' && (
              <div className="p-3 rounded-lg border border-sky-300 bg-sky-50 text-sky-950">
                <p className="font-bold text-sky-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-sky-600" />
                  MISPLACED (Tertukar / Pindah Laci)
                </p>
                <p className="text-[11px] text-sky-800 mt-1">
                  Item fisik ditemukan di laci lain. Sistem akan melakukan koreksi mutasi lokasi otomatis; total nilai inventori lemari tetap.
                </p>
              </div>
            )}

            {type === 'MISSING' && (
              <div className="p-3 rounded-lg border border-rose-300 bg-rose-50 text-rose-950">
                <p className="font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  MISSING (Hilang / Tidak Ditemukan)
                </p>
                <p className="text-[11px] text-rose-800 mt-1">
                  Item fisik tidak ditemukan setelah verifikasi fisik. Sistem akan menyiapkan form Berita Acara dan meneruskan posting ke akun penampung <span className="font-mono font-semibold">VIRT/OPNAME-DIFF</span>.
                </p>
              </div>
            )}

            {type === 'UNEXPECTED' && (
              <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-950">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  UNEXPECTED (Tag Terbaca Tanpa Data)
                </p>
                <p className="text-[11px] text-amber-800 mt-1">
                  Fisik tag terbaca di reader tetapi belum terdaftar dalam manifest laci ini. Dilakukan verifikasi asal tag dan rekonsiliasi data SBG nasabah.
                </p>
              </div>
            )}
          </div>

          {/* Notes Input */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">
              Catatan Pemeriksaan Fisik:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Masukkan keterangan hasil pemeriksaan fisik dengan desktop reader / petugas..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8] text-slate-800 text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setClassificationModalOpen(false)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-1.5 shadow-sm transition-colors ${
                type === 'MISSING'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : type === 'MISPLACED'
                  ? 'bg-sky-600 hover:bg-sky-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Simpan & Eksekusi Klasifikasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
