'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVaultStore } from '@/store/useVaultStore';
import {
  Boxes,
  Search,
  Filter,
  ArrowRightLeft,
  ArrowUpRight,
  Radio,
  WifiOff,
  MapPin,
  ChevronRight,
  Info,
  User,
} from 'lucide-react';

const DRAWER_FILTER_OPTIONS = ['SEMUA', 'L01', 'L02', 'L03'];

export default function InventoryPage() {
  const router = useRouter();
  const {
    items,
    setTransferModalOpen,
    setOutboundModalOpen,
    openItemDetail,
    setSelectedDrawer,
    currentRole,
  } = useVaultStore();

  const isStaffBisnis = currentRole === 'STAFF_BISNIS';
  const isSPI = currentRole === 'SPI';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrawerFilter, setSelectedDrawerFilter] = useState('SEMUA');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  const activeItems = items.filter((i) => i.status !== 'DITEBUS');
  const totalTags = activeItems.length;
  const onlineTagsCount = activeItems.filter((i) => i.isPhysicallyPresent).length;
  const offlineTagsCount = activeItems.filter((i) => !i.isPhysicallyPresent && i.status !== 'RECONCILED_VIRT').length;
  const misplacedTagsCount = activeItems.filter(
    (i) => i.isPhysicallyPresent && i.physicalDrawerId !== (i.systemDrawerId || i.drawerId)
  ).length;

  const totalWeight = activeItems.reduce((acc, curr) => acc + (curr.weight || 0), 0);

  const filteredItems = items.filter((item) => {
    const matchesDrawer =
      selectedDrawerFilter === 'SEMUA' ||
      item.systemDrawerId === selectedDrawerFilter ||
      item.drawerId === selectedDrawerFilter;

    let matchesStatus = true;
    if (selectedStatusFilter === 'ONLINE') {
      matchesStatus = item.isPhysicallyPresent && item.status !== 'DITEBUS';
    } else if (selectedStatusFilter === 'OFFLINE') {
      matchesStatus = !item.isPhysicallyPresent && item.status !== 'DITEBUS';
    } else if (selectedStatusFilter === 'MISPLACED') {
      matchesStatus = item.isPhysicallyPresent && item.physicalDrawerId !== (item.systemDrawerId || item.drawerId);
    } else if (selectedStatusFilter === 'DITEBUS') {
      matchesStatus = item.status === 'DITEBUS';
    }

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.id.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.sbg.toLowerCase().includes(q) ||
      (item.customer?.name && item.customer.name.toLowerCase().includes(q)) ||
      (item.slotId && item.slotId.toLowerCase().includes(q));

    return matchesDrawer && matchesStatus && matchesSearch;
  });

  const handleNavigateToDrawer = (drawerId) => {
    setSelectedDrawer(drawerId);
    router.push(`/lemari-laci?drawer=${drawerId}`);
  };

  return (
    <div className="space-y-5">
      {/* Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Katalog Inventori Emas & Data Nasabah
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register keping emas aktif, pemilik/nasabah jaminan, dan alokasi slot laci brankas LT-01
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded bg-[#0f233a] text-cyan-300 text-xs font-semibold font-mono tracking-wide">
            {totalTags} KEPING EMAS AKTIF
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Total Keping Aktif</span>
            <Boxes className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{totalTags}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Total berat: {totalWeight.toFixed(2)} gram</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Terbaca Fisik (Online)</span>
            <Radio className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold font-mono text-emerald-700 mt-1">{onlineTagsCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">dari {totalTags} keping di LT-01</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Tag Offline / Selisih</span>
            <WifiOff className="w-4 h-4 text-rose-600" />
          </div>
          <p className={`text-xl font-bold font-mono mt-1 ${offlineTagsCount > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
            {offlineTagsCount}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {offlineTagsCount > 0 ? 'Perlu tindakan rekonsiliasi' : 'Kondisi normal'}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Sudah Ditebus (Keluar)</span>
            <ArrowUpRight className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold font-mono text-purple-700 mt-1">
            {items.filter((i) => i.status === 'DITEBUS').length}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Slot kembali kosong</p>
        </div>
      </div>

      {/* Main Inventory Table with Filter Controls */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        {/* Filter Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari Tag ID, Merek, Nasabah, No. SBG, Slot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
            />
          </div>

          {/* Drawer & Status Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Laci:</span>
              <select
                value={selectedDrawerFilter}
                onChange={(e) => setSelectedDrawerFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-semibold bg-white text-slate-700 focus:outline-none"
              >
                {DRAWER_FILTER_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d === 'SEMUA' ? 'Semua Laci' : `Laci ${d}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700 focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="ONLINE">Aktif Terbaca</option>
                <option value="OFFLINE">Offline / Selisih</option>
                <option value="MISPLACED">Salah Tempat</option>
                <option value="DITEBUS">Ditebus (Keluar)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3">Slot Laci</th>
                <th className="py-2.5 px-3">Tag ID</th>
                <th className="py-2.5 px-3">Keping & Karat</th>
                <th className="py-2.5 px-3">Berat (g)</th>
                <th className="py-2.5 px-3">Pemilik & No. SBG</th>
                <th className="py-2.5 px-3">Status Deteksi</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans italic">
                    Tidak ada item yang cocok dengan kriteria pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isDitebus = item.status === 'DITEBUS';
                  const isTagOffline = !item.isPhysicallyPresent && !isDitebus;
                  const isMisplaced = item.isPhysicallyPresent && item.physicalDrawerId !== (item.systemDrawerId || item.drawerId);

                  let badge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Radio className="w-3 h-3 text-emerald-600" />
                      <span>TERBACA ({item.slotId})</span>
                    </span>
                  );

                  if (isDitebus) {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                        <ArrowUpRight className="w-3 h-3 text-purple-600" />
                        <span>DITEBUS (KELUAR)</span>
                      </span>
                    );
                  } else if (isTagOffline) {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                        <WifiOff className="w-3 h-3 text-rose-700" />
                        <span>TAG OFFLINE</span>
                      </span>
                    );
                  } else if (isMisplaced) {
                    badge = (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        MISPLACED (di {item.physicalDrawerId})
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[#008ba3]">
                        {item.slotId || <span className="text-slate-400 italic">Kosong</span>}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.id}</td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-800">
                        {item.brand} ({item.purity})
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{item.weight?.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="font-semibold text-slate-800 block">{item.customer?.name || 'Nasabah'}</span>
                        <span className="font-mono text-[11px] text-slate-500">{item.sbg}</span>
                      </td>
                      <td className="py-2.5 px-3 font-sans">{badge}</td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => openItemDetail(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                            title="Buka rincian lengkap pemilik dan histori pergerakan"
                          >
                            <Info className="w-3.5 h-3.5 text-[#008ba3]" />
                            <span>Detail & Histori</span>
                          </button>

                          {!isSPI && !isDitebus && (
                            <>
                              <button
                                type="button"
                                onClick={() => setTransferModalOpen(true, item)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded hover:bg-sky-100 transition-colors cursor-pointer"
                                title="Ajukan mutasi laci / slot"
                              >
                                <ArrowRightLeft className="w-3 h-3 text-sky-600" />
                                <span>Mutasi</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setOutboundModalOpen(true, item)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors cursor-pointer"
                                title="Ajukan pengeluaran/penebusan emas"
                              >
                                <ArrowUpRight className="w-3 h-3 text-rose-600" />
                                <span>Tebus</span>
                              </button>
                            </>
                          )}
                        </div>
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
