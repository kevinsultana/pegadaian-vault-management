'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVaultStore } from '@/store/useVaultStore';
import {
  ClipboardCheck,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Layers,
  Printer,
} from 'lucide-react';

export default function StockOpnamePage() {
  const router = useRouter();
  const {
    items,
    lastScanTime,
    runScanCycle,
    isScanning,
    currentRole,
  } = useVaultStore();

  const lg01Total = 605;
  const lg02Total = 604;
  const otherCabinetsCount = lg01Total + lg02Total;

  const lt01Total = items.length;
  const lt01PhysicallyPresent = items.filter((i) => i.isPhysicallyPresent).length;
  const lt01Selisih = items.filter(
    (i) => !i.isPhysicallyPresent && i.status !== 'RECONCILED_VIRT'
  ).length;

  const totalVaultBook = otherCabinetsCount + lt01Total;
  const totalPhysicalRead = otherCabinetsCount + lt01PhysicallyPresent;
  const totalSelisih = lt01Selisih;
  const overallAccuracy = ((totalPhysicalRead / totalVaultBook) * 100).toFixed(2) + '%';
  const lt01Accuracy = ((lt01PhysicallyPresent / lt01Total) * 100).toFixed(2) + '%';

  const cabinetSummaries = [
    {
      id: 'LG-01',
      name: 'Lemari Ganda 01 (Zona WH-505)',
      compartments: 8,
      type: 'Lemari Ganda (K1..K8)',
      bookCount: lg01Total,
      physicalCount: lg01Total,
      diffCount: 0,
      accuracy: '100.00%',
      status: 'NORMAL',
    },
    {
      id: 'LG-02',
      name: 'Lemari Ganda 02 (Zona WH-505)',
      compartments: 8,
      type: 'Lemari Ganda (K1..K8)',
      bookCount: lg02Total,
      physicalCount: lg02Total,
      diffCount: 0,
      accuracy: '100.00%',
      status: 'NORMAL',
    },
    {
      id: 'LT-01',
      name: 'Lemari Tunggal 01 (Sandbox Aktif)',
      compartments: 12,
      type: 'Lemari Tunggal (L01..L12)',
      bookCount: lt01Total,
      physicalCount: lt01PhysicallyPresent,
      diffCount: lt01Selisih,
      accuracy: lt01Accuracy,
      status: lt01Selisih > 0 ? 'SELISIH' : 'NORMAL',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Subheader & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Rekapan Siklus Stock Opname Fisik vs Sistem
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit berkala komparasi data ledger sistem per lemari vs hasil pembacaan antena RFID MARS-4AT · Siklus terakhir {lastScanTime}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={runScanCycle}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00b4d8] hover:bg-[#0096b4] text-[#0f233a] text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Memindai Siklus...' : 'Jalankan Siklus Opname Baru'}</span>
          </button>

          <Link
            href="/laporan"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f233a] hover:bg-[#162d48] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-300" />
            <span>Arsip Berita Acara</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Ledger Sistem</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {totalVaultBook.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Semua lemari zona WH-505</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Terbaca Fisik Terkini</span>
          <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {totalPhysicalRead.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Keping terdeteksi antena RFID</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Selisih Terbuka</span>
          <p className={`text-xl font-bold font-mono mt-1 ${totalSelisih > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {totalSelisih}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {totalSelisih > 0 ? 'Perlu Berita Acara penyesuaian' : '0 selisih (sempurna)'}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Inventory Accuracy (IRA)</span>
          <p className="text-xl font-bold font-mono text-[#008ba3] mt-1">
            {overallAccuracy}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Target kepatuhan audit: 100%</p>
        </div>
      </div>

      {/* Multi-Cabinet Opname Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="w-5 h-5 text-sky-700" />
            <h3 className="text-xs font-bold text-slate-800">
              Hasil Rekonsiliasi Per Lemari Penyimpanan (Zona WH-505)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            3 Unit Lemari Vault Terpantau
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold">
                <th className="pb-2.5">Kode Lemari</th>
                <th className="pb-2.5">Karakteristik & Lokasi</th>
                <th className="pb-2.5 text-center">Kompartemen</th>
                <th className="pb-2.5 text-right">Saldo Buku</th>
                <th className="pb-2.5 text-right">Fisik Terbaca</th>
                <th className="pb-2.5 text-right">Selisih (+/-)</th>
                <th className="pb-2.5 text-right">Akurasi (IRA)</th>
                <th className="pb-2.5">Status Opname</th>
                <th className="pb-2.5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {cabinetSummaries.map((cab) => {
                const isAlert = cab.diffCount > 0;

                return (
                  <tr
                    key={cab.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isAlert ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    <td className="py-3 font-bold text-slate-900">{cab.id}</td>
                    <td className="py-3 font-sans">
                      <p className="font-semibold text-slate-800">{cab.name}</p>
                      <span className="text-[10px] text-slate-400">{cab.type}</span>
                    </td>
                    <td className="py-3 text-center text-slate-600">
                      {cab.compartments}
                    </td>
                    <td className="py-3 text-right text-slate-900 font-bold">
                      {cab.bookCount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-right text-emerald-700 font-bold">
                      {cab.physicalCount.toLocaleString('id-ID')}
                    </td>
                    <td
                      className={`py-3 text-right font-bold ${
                        isAlert ? 'text-rose-700' : 'text-slate-400'
                      }`}
                    >
                      {isAlert ? `-${cab.diffCount}` : '0'}
                    </td>
                    <td className="py-3 text-right text-[#008ba3] font-bold">
                      {cab.accuracy}
                    </td>
                    <td className="py-3 font-sans">
                      {isAlert ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertTriangle className="w-3 h-3 text-rose-700" />
                          <span>SELISIH TERBUKA</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>NORMAL / KLOP</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right font-sans">
                      {cab.id === 'LT-01' ? (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => router.push('/lemari-laci')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded transition-colors cursor-pointer"
                          >
                            <Layers className="w-3 h-3" />
                            <span>Periksa Laci</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">
                          Terkunci Otomatis
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
