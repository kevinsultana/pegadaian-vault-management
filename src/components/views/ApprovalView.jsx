'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  Lock,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  User,
  Eye,
} from 'lucide-react';

export default function ApprovalView() {
  const {
    transactions,
    approveTransaction,
    rejectTransaction,
    currentRole,
    items,
    openItemDetail,
  } = useVaultStore();

  const [activeTab, setActiveTab] = useState('ALL'); // ALL | INBOUND | OUTBOUND | MUTASI
  const isSupervisor = currentRole === 'SUPERVISOR';

  const pendingList = transactions.filter((t) => t.status === 'PENDING_APPROVAL');
  const pendingCount = pendingList.length;

  const filtered = transactions.filter((t) => {
    if (activeTab === 'ALL') return true;
    return t.type === activeTab;
  });

  return (
    <div className="space-y-4">
      {/* Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Persetujuan & Otorisasi Transaksi (Dual Control)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar pengajuan Inbound, Outbound, dan Mutasi brankas yang memerlukan otorisasi resmi Supervisor Vault
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold font-mono tracking-wide border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{pendingCount} MENUNGGU PERSETUJUAN</span>
          </span>
        </div>
      </div>

      {/* RBAC Notice if not Supervisor */}
      {!isSupervisor && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-950 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Peran Anda saat ini: <strong>{currentRole}</strong>. Tombol otorisasi persetujuan transaksi terkunci (Read-Only).
            </span>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2.5 py-1 rounded border border-amber-300 shrink-0">
            Pilih &quot;Supervisor Vault&quot; di Header untuk Approve
          </span>
        </div>
      )}

      {/* Main Approval Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-sky-700" />
            <h3 className="text-xs font-bold text-slate-800">
              Antrean Otorisasi Transaksi Brankas
            </h3>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            {[
              { id: 'ALL', label: 'Semua Transaksi' },
              { id: 'INBOUND', label: 'Inbound' },
              { id: 'OUTBOUND', label: 'Outbound' },
              { id: 'MUTASI', label: 'Mutasi' },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3">No. Dokumen</th>
                <th className="py-2.5 px-3">Tipe</th>
                <th className="py-2.5 px-3">Tag ID & Deskripsi</th>
                <th className="py-2.5 px-3">Nasabah & SBG</th>
                <th className="py-2.5 px-3">Slot Laci</th>
                <th className="py-2.5 px-3">Pemohon</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Otorisasi Supervisor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans italic">
                    Belum ada pengajuan transaksi pada tab ini.
                  </td>
                </tr>
              ) : (
                filtered.map((trx) => {
                  const isPending = trx.status === 'PENDING_APPROVAL';
                  const isApproved = trx.status === 'APPROVED';
                  const isCompleted = trx.status === 'COMPLETED';
                  const isRejected = trx.status === 'REJECTED';

                  let typeBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <ArrowDownRight className="w-3 h-3" />
                      INBOUND
                    </span>
                  );
                  if (trx.type === 'OUTBOUND') {
                    typeBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <ArrowUpRight className="w-3 h-3" />
                        OUTBOUND
                      </span>
                    );
                  } else if (trx.type === 'MUTASI') {
                    typeBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                        <ArrowRightLeft className="w-3 h-3" />
                        MUTASI
                      </span>
                    );
                  }

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <Clock className="w-3 h-3 text-amber-600" />
                      MENUNGGU APPROVAL
                    </span>
                  );
                  if (isApproved) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                        <CheckCircle2 className="w-3 h-3 text-sky-600" />
                        DISIKAPI (SPK AKTIF)
                      </span>
                    );
                  } else if (isCompleted) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        SELESAI FISIK
                      </span>
                    );
                  } else if (isRejected) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        DITOLAK
                      </span>
                    );
                  }

                  return (
                    <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{trx.id}</td>
                      <td className="py-3 px-3 font-sans">{typeBadge}</td>
                      <td className="py-3 px-3 font-sans">
                        <span className="font-mono font-bold text-slate-900">{trx.itemId}</span>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {trx.itemBrand} ({trx.weight}g · {trx.purity})
                        </div>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className="font-semibold text-slate-800">{trx.customerName || '-'}</span>
                        <div className="font-mono text-[11px] text-slate-500">{trx.sbg}</div>
                      </td>
                      <td className="py-3 px-3">
                        {trx.type === 'INBOUND' ? (
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            → {trx.targetSlotId}
                          </span>
                        ) : trx.type === 'OUTBOUND' ? (
                          <span className="font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {trx.sourceSlotId} → KELUAR
                          </span>
                        ) : (
                          <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {trx.sourceSlotId} → {trx.targetSlotId}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-sans text-[11px] text-slate-500">
                        <div>{trx.requestedBy}</div>
                        <div className="text-[10px] text-slate-400">{trx.requestTime}</div>
                      </td>
                      <td className="py-3 px-3 font-sans">{statusBadge}</td>
                      <td className="py-3 px-3 text-right font-sans">
                        {isPending ? (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              disabled={!isSupervisor}
                              onClick={() => approveTransaction(trx.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-2xs transition-colors ${
                                isSupervisor
                                  ? 'bg-[#008ba3] hover:bg-[#00758a] text-white cursor-pointer'
                                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>
                            <button
                              type="button"
                              disabled={!isSupervisor}
                              onClick={() => rejectTransaction(trx.id, 'Ditolak Supervisor')}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors ${
                                isSupervisor
                                  ? 'border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 cursor-pointer'
                                  : 'border border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </div>
                        ) : isApproved ? (
                          <span className="text-[11px] font-semibold text-sky-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                            <span>SPK Terbit ({trx.approvedBy})</span>
                          </span>
                        ) : isCompleted ? (
                          <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Selesai Eksekusi</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-rose-600 inline-flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            <span>Ditolak</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
