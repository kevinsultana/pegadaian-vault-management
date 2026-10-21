'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import { History, Search, Filter, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function AuditTrailView() {
  const { auditTrails } = useVaultStore();
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrails = auditTrails.filter((item) => {
    const matchesAction =
      filterAction === 'ALL' || item.action.includes(filterAction);
    const matchesSearch =
      item.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Audit Trail & Log Kepatuhan Sistem
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekam jejak setiap aksi fisik, pemindaian antena RFID, mutasi antar laci, dan penerbitan Berita Acara
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold font-mono tracking-wide border border-slate-200">
            {auditTrails.length} REKAMAN AKTIF
          </span>
        </div>
      </div>

      {/* Main Audit Trail Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Filter Tipe:</span>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
            >
              <option value="ALL">Semua Aktivitas</option>
              <option value="SIKLUS_BACA_RFID">Siklus Baca RFID</option>
              <option value="MUTASI">Mutasi & Transfer</option>
              <option value="ALERT">Alert (Selisih & Misplaced)</option>
              <option value="BERITA_ACARA">Berita Acara</option>
              <option value="FISIK">Interaksi Fisik Sandbox</option>
            </select>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID, kata kunci detail..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
            />
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold">
                <th className="pb-2.5 font-mono">Log ID</th>
                <th className="pb-2.5">Waktu (WIB)</th>
                <th className="pb-2.5">Tipe Aksi</th>
                <th className="pb-2.5">Aktor / Sumber</th>
                <th className="pb-2.5">Rincian Peristiwa</th>
                <th className="pb-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredTrails.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans italic">
                    Tidak ada catatan audit trail yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredTrails.map((trail) => {
                  let badge = (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      BERHASIL
                    </span>
                  );

                  if (trail.status === 'PERINGATAN') {
                    badge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        PERINGATAN
                      </span>
                    );
                  } else if (trail.status === 'PENDING') {
                    badge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        PENDING
                      </span>
                    );
                  } else if (trail.status === 'INFO') {
                    badge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        INFO
                      </span>
                    );
                  }

                  return (
                    <tr key={trail.id} className="hover:bg-slate-50/70">
                      <td className="py-3 font-bold text-slate-900">{trail.id}</td>
                      <td className="py-3 text-slate-600 font-sans text-[11px] whitespace-nowrap">
                        {trail.timestamp}
                      </td>
                      <td className="py-3">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-bold">
                          {trail.action}
                        </span>
                      </td>
                      <td className="py-3 font-sans text-slate-700 font-medium">
                        {trail.actor}
                      </td>
                      <td className="py-3 font-sans text-slate-800 text-[11px] max-w-md">
                        {trail.details}
                      </td>
                      <td className="py-3 text-right font-sans">{badge}</td>
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
