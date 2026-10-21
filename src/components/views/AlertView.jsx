'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Bell,
  ArrowRight,
  Filter,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function AlertView() {
  const {
    alerts,
    items,
    setActiveView,
    setSelectedDrawer,
    setClassificationModalOpen,
  } = useVaultStore();

  const [filterType, setFilterType] = useState('ALL');

  const openAlerts = alerts.filter(
    (a) => a.status === 'OPEN' || a.status === 'PENDING' || a.status.startsWith('TERKLASIFIKASI')
  );

  const selisihCount = alerts.filter((a) => a.type === 'SELISIH' && a.status === 'OPEN').length;
  const misplacedCount = alerts.filter((a) => a.type === 'MISPLACED' && a.status === 'OPEN').length;
  const approvalCount = alerts.filter((a) => a.type === 'APPROVAL' && a.status === 'PENDING').length;

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'ALL') return true;
    return a.type === filterType;
  });

  const handleResolveSelisih = (alert) => {
    const targetItem =
      items.find((i) => i.id === alert.itemId) ||
      items.find((i) => !i.isPhysicallyPresent) ||
      items[0];

    setSelectedDrawer(alert.drawer || 'L05');
    setActiveView('lemari-laci');
    setClassificationModalOpen(true, 'MISSING', targetItem);
  };

  return (
    <div className="space-y-5">
      {/* Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Pusat Notifikasi & Log Alert Vault
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar seluruh peringatan deteksi hardware RFID, selisih fisik barang, dan status anomali vault
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold font-mono tracking-wide border border-slate-200">
            {openAlerts.length} ALERT AKTIF
          </span>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => setFilterType('ALL')}
          className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
            filterType === 'ALL'
              ? 'bg-[#0f233a] text-white border-[#0f233a] shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold opacity-80">Total Alert</span>
            <Bell className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-bold font-mono mt-1">{alerts.length}</p>
        </div>

        <div
          onClick={() => setFilterType('SELISIH')}
          className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
            filterType === 'SELISIH'
              ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
              : 'bg-rose-50/70 text-rose-900 border-rose-200 hover:bg-rose-100/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold opacity-90">Selisih Terbuka (Urgent)</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-bold font-mono mt-1">{selisihCount}</p>
        </div>

        <div
          onClick={() => setFilterType('MISPLACED')}
          className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
            filterType === 'MISPLACED'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold opacity-90">Salah Penempatan (Misplaced)</span>
            <MapPin className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold font-mono mt-1">{misplacedCount}</p>
        </div>

        <div
          onClick={() => setFilterType('APPROVAL')}
          className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
            filterType === 'APPROVAL'
              ? 'bg-sky-700 text-white border-sky-700 shadow-sm'
              : 'bg-sky-50/70 text-sky-900 border-sky-200 hover:bg-sky-100/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold opacity-90">Menunggu Approval</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-xl font-bold font-mono mt-1">{approvalCount}</p>
        </div>
      </div>

      {/* Main Alert List Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-800">
              Daftar Notifikasi Alert ({filteredAlerts.length})
            </h3>
          </div>

          {filterType !== 'ALL' && (
            <button
              onClick={() => setFilterType('ALL')}
              className="text-xs text-sky-600 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Empty State when no active alerts */}
        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Tidak ada alert terbuka saat ini
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Seluruh lemari dan laci penyimpanan vault LT-01 berada dalam kondisi normal. Tidak ada selisih pembacaan fisik maupun tag yang misplaced.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold">
                  <th className="pb-2.5">ID Alert</th>
                  <th className="pb-2.5">Tingkat / Tipe</th>
                  <th className="pb-2.5">Waktu</th>
                  <th className="pb-2.5">Lokasi & Objek</th>
                  <th className="pb-2.5">Deskripsi Peristiwa</th>
                  <th className="pb-2.5">Status Penanganan</th>
                  <th className="pb-2.5 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredAlerts.map((alt) => {
                  let badge = (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                      {alt.type}
                    </span>
                  );

                  let isSelisihAlert = alt.type === 'SELISIH';
                  let isMisplacedAlert = alt.type === 'MISPLACED';
                  let isApprovalAlert = alt.type === 'APPROVAL';

                  if (isSelisihAlert) {
                    badge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        SELISIH FISIK
                      </span>
                    );
                  } else if (isMisplacedAlert) {
                    badge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        MISPLACED
                      </span>
                    );
                  } else if (isApprovalAlert) {
                    badge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                        APPROVAL
                      </span>
                    );
                  }

                  const isResolved =
                    alt.status.includes('RESOLVED') || alt.status.includes('TERKLASIFIKASI');

                  return (
                    <tr
                      key={alt.id}
                      className={`hover:bg-slate-50/70 ${
                        isSelisihAlert && !isResolved ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      <td className="py-3 font-bold text-slate-900">{alt.id}</td>
                      <td className="py-3 font-sans">{badge}</td>
                      <td className="py-3 text-slate-600 font-sans text-[11px] whitespace-nowrap">
                        {alt.timestamp || '-'}
                      </td>
                      <td className="py-3 font-sans">
                        <span className="font-bold text-slate-800 font-mono">
                          {alt.cabinet || 'LT-01'}/{alt.drawer || '-'}
                        </span>
                        {alt.itemId && (
                          <p className="text-[11px] font-mono text-slate-500">
                            {alt.itemId} {alt.itemBrand ? `(${alt.itemBrand})` : ''}
                          </p>
                        )}
                      </td>
                      <td className="py-3 font-sans text-slate-700 max-w-sm text-[11px]">
                        <div>{alt.title}</div>
                        {alt.recipient && (
                          <span className="text-[10px] text-slate-400">
                            Ditujukan: {alt.recipient}
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isResolved
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {alt.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-sans">
                        {isSelisihAlert && (
                          <button
                            onClick={() => handleResolveSelisih(alt)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            title="Buka form rekonsiliasi dan klasifikasi laci L05"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Tangani / Rekonsiliasi</span>
                          </button>
                        )}

                        {isMisplacedAlert && (
                          <button
                            onClick={() => {
                              setActiveView('lemari-laci');
                              if (alt.drawer) setSelectedDrawer(alt.drawer);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Periksa Laci</span>
                          </button>
                        )}

                        {isApprovalAlert && (
                          <button
                            onClick={() => setActiveView('approval')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Lihat Otorisasi</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
