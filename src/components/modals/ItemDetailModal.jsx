'use client';

import React from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import {
  X,
  User,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  FileText,
  ArrowUpRight,
  ArrowRightLeft,
  Sparkles,
  Phone,
  CreditCard,
  Building,
  Award,
  CheckCircle2,
} from 'lucide-react';

export default function ItemDetailModal() {
  const {
    itemDetailModalOpen,
    selectedItemDetail,
    closeItemDetail,
    currentRole,
    setOutboundModalOpen,
    setTransferModalOpen,
  } = useVaultStore();

  if (!itemDetailModalOpen || !selectedItemDetail) return null;

  const item = selectedItemDetail;
  const customer = item.customer || {};
  const history = item.history || [];
  const isAvailableForAction =
    item.status !== 'DITEBUS' && item.status !== 'RELOKASI_KELUAR' && item.status !== 'RECONCILED_VIRT';
  const canPerformAction = currentRole === 'STAFF_BISNIS' || currentRole === 'PETUGAS';

  const handleOpenOutbound = () => {
    closeItemDetail();
    setOutboundModalOpen(true, item);
  };

  const handleOpenMutasi = () => {
    closeItemDetail();
    setTransferModalOpen(true, item);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Pegadaian Brand Colors */}
        <div className="bg-gradient-to-r from-[#0f233a] via-[#163558] to-[#0f233a] text-white px-6 py-5 flex items-center justify-between border-b border-[#234266]">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-wide text-white">
                  Sertifikat Digital Barang Jaminan Emas
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                  {item.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Register resmi Pegadaian Smart Vault · Lemari {item.cabinetId || 'LT-01'}
              </p>
            </div>
          </div>
          <button
            onClick={closeItemDetail}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Top Status & Location Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#008ba3]" />
              <span className="text-slate-600 font-medium">Alokasi Slot Brankas:</span>
              <span className="font-mono font-bold text-sm text-slate-900 bg-sky-100 px-2.5 py-0.5 rounded border border-sky-300">
                {item.slotId || (item.status === 'RELOKASI_KELUAR' ? `RELOKASI: ${item.destinationLocation || 'CABANG LAIN'}` : 'KOSONG / SUDAH DITEBUS')}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500">Status Fisik:</span>
              <span
                className={`font-bold px-2.5 py-1 rounded-full text-xs border ${
                  item.status === 'TERBACA'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : item.status === 'DITEBUS'
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : item.status === 'RELOKASI_KELUAR'
                    ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                ● {item.status}
              </span>
            </div>
          </div>

          {/* Section 1: Spesifikasi Emas */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1. Spesifikasi Karat & Fisik Keping Emas
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Merek / Keping</span>
                <span className="font-bold text-slate-900 text-sm">{item.brand}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Berat Bersih</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{item.weight?.toFixed(2)} gram</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Kadar Kemurnian</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{item.purity}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Lemari & Laci</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{item.cabinetId} · {item.drawerId}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Data Pemilik / Nasabah */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <User className="w-3.5 h-3.5 text-sky-600" />
              2. Data Nasabah & Surat Bukti Gadai (SBG)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Nama Nasabah:</span>
                  <span className="font-bold text-slate-900 text-sm">{customer.name || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">NIK (KTP):</span>
                  <span className="font-mono text-slate-800">{customer.nik || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">No. WhatsApp/HP:</span>
                  <span className="font-mono font-semibold text-slate-800">{customer.phone || '-'}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-500">Alamat KTP:</span>
                  <span className="text-slate-800 text-right max-w-[200px] leading-tight">{customer.address || '-'}</span>
                </div>
              </div>

              <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-3.5 pt-2 sm:pt-0">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Nomor SBG:</span>
                  <span className="font-mono font-bold text-[#008ba3] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {item.sbg}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Uang Pinjaman:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{customer.loanAmount || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Tanggal Akad:</span>
                  <span className="text-slate-800 font-medium">{customer.contractDate || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Jatuh Tempo:</span>
                  <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {customer.dueDate || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Outlet Unit:</span>
                  <span className="text-slate-700">{customer.branch || 'Pegadaian CP Kramat Raya'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Historikal Pergerakan Lengkap */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              3. Jejak Audit & Riwayat Pergerakan Fisik (Audit Trail)
            </h4>

            <div className="space-y-2.5 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 pl-7 py-1">
              {history.length === 0 ? (
                <p className="text-slate-400 italic">Belum ada riwayat tercatat.</p>
              ) : (
                history.map((h, idx) => (
                  <div key={h.id || idx} className="relative group">
                    <div className="absolute -left-7 top-1.5 w-3 h-3 rounded-full bg-[#008ba3] border-2 border-white ring-2 ring-sky-200"></div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">{h.title || h.event}</span>
                        <span className="text-slate-400 font-mono text-[10px]">{h.timestamp}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{h.details}</p>
                      <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Aktor: <strong>{h.actor}</strong> ({h.role || 'User'})
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer / Quick Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Peran Aktif: <strong className="text-slate-800">{currentRole}</strong>
          </div>

          <div className="flex items-center space-x-2">
            {isAvailableForAction && canPerformAction && (
              <>
                <button
                  type="button"
                  onClick={handleOpenMutasi}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-sky-600" />
                  <span>Pindah Laci / Slot</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenOutbound}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer text-xs transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Ajukan Outbound (Tebus)</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={closeItemDetail}
              className="px-4 py-2 rounded-xl bg-[#0f233a] hover:bg-[#162f4e] text-white font-semibold cursor-pointer text-xs transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
