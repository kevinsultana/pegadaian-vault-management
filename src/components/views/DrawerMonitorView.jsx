'use client';

import React from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import DrawerMatrix from '../DrawerMatrix';
import DrawerInventoryTable from '../DrawerInventoryTable';
import RealTimeRfidLogs from '../RealTimeRfidLogs';
import ReadingSummaryCard from '../ReadingSummaryCard';
import {
  AlertTriangle,
  MapPin,
  ShieldAlert,
  FileText,
  CheckCircle2,
  RefreshCw,
  Hand,
} from 'lucide-react';

export default function DrawerMonitorView() {
  const {
    items,
    transfers,
    lastScanTime,
    readerStatus,
    setClassificationModalOpen,
    setBeritaAcaraModalOpen,
    runScanCycle,
    isScanning,
    physicalInteractionMode,
    togglePhysicalInteractionMode,
  } = useVaultStore();

  // Check if there are active missing items / selisih
  const missingItems = items.filter((it) => it.status === 'MISSING');
  const hasSelisih = missingItems.length > 0;
  const firstMissingItem = missingItems[0];

  // Check if there are misplaced items
  const misplacedItems = items.filter((it) => it.status === 'MISPLACED');
  const hasMisplaced = misplacedItems.length > 0;

  // Check recent verified transfer
  const recentVerifiedTransfer = transfers.find((t) => t.status === 'VERIFIED');

  return (
    <div className="space-y-4">
      {/* Subheader & Status Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Lemari & Laci — LT-01 (Lemari Tunggal)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Siklus baca terakhir {lastScanTime} · reader MARS-4AT {readerStatus.toLowerCase()} · 12 laci terpindai
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Mode Interaksi Fisik (Sandbox) */}
          <button
            onClick={togglePhysicalInteractionMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              physicalInteractionMode
                ? 'bg-amber-500 text-slate-900 border-amber-600 shadow-sm font-bold'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Toggle simulasi tangan petugas memindahkan atau mengambil fisik barang"
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Mode Interaksi Fisik: {physicalInteractionMode ? 'AKTIF' : 'OFF'}</span>
          </button>

          {/* Trigger Scan Button */}
          <button
            onClick={runScanCycle}
            disabled={isScanning}
            className="px-3.5 py-1.5 rounded-lg bg-[#00b4d8] hover:bg-[#0096b4] text-[#0f233a] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Jalankan siklus baca antena RFID sekarang"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Memindai...' : 'Trigger Siklus Baca'}</span>
          </button>

          {/* Badge Reader Status */}
          <span className="inline-flex items-center px-3 py-1.5 rounded bg-[#dcfce7] text-[#15803d] text-xs font-semibold font-mono tracking-wide border border-emerald-200">
            READER ONLINE
          </span>
        </div>
      </div>

      {/* DYNAMIC ALERT BANNER 1: SELISIH MERAH */}
      {hasSelisih && (
        <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800 text-sm">
                SELISIH TERDETEKSI — {missingItems.length} item tidak terbaca tanpa transaksi keluar
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                LT-01/{firstMissingItem?.systemDrawerId || firstMissingItem?.drawerId} · Tag {firstMissingItem?.id} ({firstMissingItem?.brand}) · Notifikasi terkirim ke supervisor.vault & SPI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setClassificationModalOpen(true, 'MISPLACED', firstMissingItem)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-sky-300 text-sky-700 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              Klasifikasi MISPLACED
            </button>
            <button
              onClick={() => setClassificationModalOpen(true, 'MISSING', firstMissingItem)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-rose-400 text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Klasifikasi MISSING
            </button>
            <button
              onClick={() => setBeritaAcaraModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Buat Berita Acara
            </button>
          </div>
        </div>
      )}

      {/* DYNAMIC ALERT BANNER 2: MISPLACED ORANGE */}
      {!hasSelisih && hasMisplaced && (
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-lg p-3.5 shadow-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold text-amber-900">
              Perpindahan Tanpa Dokumen (MISPLACED):
            </span>
            <span className="text-amber-800">
              {misplacedItems.map((m) => `${m.id} (${m.brand}) terdeteksi di laci ${m.physicalDrawerId}`).join(', ')}
            </span>
          </div>
          <span className="text-[11px] font-bold text-amber-700 font-mono bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
            STATUS: MISPLACED
          </span>
        </div>
      )}

      {/* DYNAMIC BANNER 3: MUTASI DOKUMEN SAH TERVERIFIKASI */}
      {recentVerifiedTransfer && (
        <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-lg p-3.5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#0284c7] shrink-0" />
            <span className="font-semibold text-[#0369a1]">
              Mutasi Sah Terverifikasi ({recentVerifiedTransfer.id}):
            </span>
            <span className="text-slate-700">
              {recentVerifiedTransfer.tagId} ({recentVerifiedTransfer.itemDesc}) resmi tercatat di {recentVerifiedTransfer.targetDrawerId}
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 font-mono bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
            LOKASI TERVERIFIKASI
          </span>
        </div>
      )}

      {/* Main Content Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Drawer Grid + Inventory Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <DrawerMatrix />
          <DrawerInventoryTable />
        </div>

        {/* Right Column: Real-time RFID Events + Reading Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <RealTimeRfidLogs />
          <ReadingSummaryCard />
        </div>
      </div>
    </div>
  );
}
