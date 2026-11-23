'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import {
  ArrowLeftRight,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  ShieldCheck,
  Eye,
} from 'lucide-react';

export default function TransactionView() {
  const {
    transactions,
    currentRole,
    setInboundModalOpen,
    setOutboundModalOpen,
    items,
    openItemDetail,
  } = useVaultStore();

  const [activeTab, setActiveTab] = useState('ALL'); // ALL | INBOUND | OUTBOUND | MUTASI
  const [searchQuery, setSearchQuery] = useState('');

  const isStaffBisnis = currentRole === 'STAFF_BISNIS';
  const isSupervisor = currentRole === 'SUPERVISOR';
  const isSPI = currentRole === 'SPI';

  // Metrics
  const totalInbound = transactions.filter((t) => t.type === 'INBOUND').length;
  const totalOutbound = transactions.filter((t) => t.type === 'OUTBOUND').length;
  const pendingCount = transactions.filter((t) => t.status === 'PENDING_APPROVAL').length;
  const completedCount = transactions.filter((t) => t.status === 'COMPLETED').length;

  const filtered = transactions.filter((t) => {
    const matchTab = activeTab === 'ALL' || t.type === activeTab;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !searchQuery ||
      t.id.toLowerCase().includes(q) ||
      t.itemId.toLowerCase().includes(q) ||
      (t.itemBrand && t.itemBrand.toLowerCase().includes(q)) ||
      (t.customerName && t.customerName.toLowerCase().includes(q)) ||
      (t.sbg && t.sbg.toLowerCase().includes(q));

    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span>Manajemen Transaksi Inbound & Outbound</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pusat operasional Staff Bisnis untuk pencatatan barang jaminan masuk, penebusan keluar, dan mutasi brankas
          </p>
        </div>

        {/* Action Buttons for Staff Bisnis */}
        <div className="flex items-center gap-2">
          {!isSPI && (
            <>
              <button
                type="button"
                onClick={() => setInboundModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-[#008ba3] hover:bg-[#00758a] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Inbound (Gadai Baru)</span>
              </button>
              <button
                type="button"
                onClick={() => setOutboundModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Outbound (Tebus)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Transaksi Inbound</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-700">{totalInbound}</span>
            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              Gadai Masuk
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Transaksi Outbound</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-700">{totalOutbound}</span>
            <span className="text-[10px] text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-semibold">
              Pelunasan Tebus
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Menunggu Approval Supervisor</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-700">{pendingCount}</span>
            <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
              Pending Otorisasi
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500">Selesai Diverifikasi Fisik</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-sky-700">{completedCount}</span>
            <span className="text-[10px] text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-semibold">
              RFID Verified
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        {/* Table Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            {[
              { id: 'ALL', label: 'Semua Transaksi' },
              { id: 'INBOUND', label: 'Inbound' },
              { id: 'OUTBOUND', label: 'Outbound' },
              { id: 'MUTASI', label: 'Mutasi Lokasi' },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari No. Dokumen, Tag, SBG, Nasabah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3">No. Dokumen</th>
                <th className="py-2.5 px-3">Tipe</th>
                <th className="py-2.5 px-3">Tag RFID & Barang</th>
                <th className="py-2.5 px-3">Nasabah & SBG</th>
                <th className="py-2.5 px-3">Rute / Slot Laci</th>
                <th className="py-2.5 px-3">Waktu & Pemohon</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans italic">
                    Tidak ada transaksi yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  let typeBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <ArrowDownRight className="w-3 h-3" />
                      INBOUND
                    </span>
                  );
                  if (t.type === 'OUTBOUND') {
                    typeBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <ArrowUpRight className="w-3 h-3" />
                        OUTBOUND
                      </span>
                    );
                  } else if (t.type === 'MUTASI') {
                    typeBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                        <ArrowLeftRight className="w-3 h-3" />
                        MUTASI
                      </span>
                    );
                  }

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <Clock className="w-3 h-3" />
                      PENDING APPROVAL
                    </span>
                  );
                  if (t.status === 'APPROVED') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                        <ShieldCheck className="w-3 h-3" />
                        APPROVED (SIAP EKSEKUSI)
                      </span>
                    );
                  } else if (t.status === 'COMPLETED') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        COMPLETED (TERVERIFIKASI)
                      </span>
                    );
                  } else if (t.status === 'REJECTED') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle className="w-3 h-3" />
                        DITOLAK
                      </span>
                    );
                  }

                  const matchedItem = items.find((i) => i.id === t.itemId);

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{t.id}</td>
                      <td className="py-3 px-3 font-sans">{typeBadge}</td>
                      <td className="py-3 px-3 font-sans">
                        <span className="font-mono font-bold text-slate-800">{t.itemId}</span>
                        <div className="text-[11px] text-slate-500">{t.itemBrand}</div>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className="font-semibold text-slate-800">{t.customerName || '-'}</span>
                        <div className="font-mono text-[11px] text-slate-500">{t.sbg}</div>
                      </td>
                      <td className="py-3 px-3">
                        {t.type === 'INBOUND' ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            → {t.targetSlotId}
                          </span>
                        ) : t.type === 'OUTBOUND' ? (
                          <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {t.sourceSlotId} → KELUAR
                          </span>
                        ) : (
                          <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {t.sourceSlotId} → {t.targetSlotId}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-sans text-[11px] text-slate-500">
                        <div>{t.requestTime}</div>
                        <div className="text-[10px] text-slate-400">oleh: {t.requestedBy}</div>
                      </td>
                      <td className="py-3 px-3 font-sans">{statusBadge}</td>
                      <td className="py-3 px-3 text-right font-sans">
                        {matchedItem ? (
                          <button
                            type="button"
                            onClick={() => openItemDetail(matchedItem)}
                            className="px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-[#008ba3]" />
                            <span>Detail Emas</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">-</span>
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
