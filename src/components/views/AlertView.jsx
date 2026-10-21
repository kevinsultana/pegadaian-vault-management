'use client';

import React from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import DrawerMatrix from '../DrawerMatrix';
import RealTimeRfidLogs from '../RealTimeRfidLogs';
import { AlertTriangle, ShieldAlert, FileText, MapPin } from 'lucide-react';

const STEPPER_STEPS = [
  { id: 1, label: 'Deteksi', desc: 'Reader mendeteksi tidak terbaca' },
  { id: 2, label: 'Alert', desc: 'Notifikasi dikirim supervisor & SPI' },
  { id: 3, label: 'Verifikasi Fisik', desc: 'Pemeriksaan oleh petugas & desktop reader' },
  { id: 4, label: 'Klasifikasi', desc: 'Misplaced / Missing / Unexpected' },
  { id: 5, label: 'Posting', desc: 'Rekonsiliasi akun VIRT/OPNAME-DIFF' },
];

export default function AlertView() {
  const {
    items,
    alerts,
    scenarioId,
    setClassificationModalOpen,
    setBeritaAcaraModalOpen,
  } = useVaultStore();

  const isSelisih = scenarioId === 'UT-04';
  const mainAlert = alerts.find((a) => a.itemId === 'E0040024');
  const isClassified = mainAlert?.classification;
  const activeStep = isClassified ? 4 : isSelisih ? 3 : 0;

  return (
    <div className="space-y-4">
      {/* Subheader */}
      <div className="pb-1">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Alert Selisih — Laci L05 (SELISIH -1)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Satu item tidak terbaca tanpa transaksi keluar · Butuh klasifikasi dan tindak lanjut
        </p>
      </div>

      {/* Alert Banner */}
      {isSelisih && (
        <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-lg px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800 text-sm">
              SELISIH TERDETEKSI — 1 item tidak terbaca tanpa transaksi keluar
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              LT-01/L05 · E0040024 (Galeri24 5g) · Terdeteksi pukul 10:45:02 · Notifikasi terkirim ke supervisor.vault & SPI
            </p>
          </div>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Drawer Matrix */}
          <DrawerMatrix />

          {/* Reconciliation Table */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-3">
              Rekonsiliasi Laci L05
            </h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold">
                  <th className="pb-2">Tag ID</th>
                  <th className="pb-2">Barang</th>
                  <th className="pb-2">Berat</th>
                  <th className="pb-2">Status Sistem</th>
                  <th className="pb-2">Status Fisik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-2.5 text-slate-900 font-medium">E0040021</td>
                  <td className="py-2.5 text-slate-700 font-sans">ANTAM 10 g</td>
                  <td className="py-2.5 text-slate-700">10,00</td>
                  <td className="py-2.5">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-semibold font-sans">Ada</span>
                  </td>
                  <td className="py-2.5">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-semibold font-sans">Ya / Sesuai</span>
                  </td>
                </tr>
                <tr className="bg-rose-50">
                  <td className="py-2.5 text-rose-800 font-bold">E0040024</td>
                  <td className="py-2.5 text-rose-700 font-sans font-medium">Galeri24 5 g</td>
                  <td className="py-2.5 text-rose-700">5,00</td>
                  <td className="py-2.5">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-sans">Ada (Sistem)</span>
                  </td>
                  <td className="py-2.5">
                    <span className="bg-rose-200 text-rose-800 px-2 py-0.5 rounded text-[11px] font-bold font-sans">MISSING</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          {isSelisih && !isClassified && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 mb-3">Tindak Lanjut</h3>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setClassificationModalOpen(true, 'MISPLACED')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-sky-300 text-sky-700 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Klasifikasi MISPLACED
                </button>

                <button
                  onClick={() => setClassificationModalOpen(true, 'MISSING')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-rose-400 text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Klasifikasi MISSING
                </button>

                <button
                  onClick={() => setBeritaAcaraModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Buat Berita Acara
                </button>
              </div>
            </div>
          )}

          {isClassified && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-xs text-emerald-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>
                Selisih terklasifikasi sebagai <strong>{mainAlert.classification}</strong>.
                {mainAlert.classification === 'MISSING' && (
                  <span className="ml-1">Rekonsiliasi diteruskan ke <span className="font-mono font-semibold">VIRT/OPNAME-DIFF</span>.</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Real-time Logs + 5-Step Stepper */}
        <div className="lg:col-span-4 space-y-4">
          <RealTimeRfidLogs />

          {/* 5-Step Stepper */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-3">
              Alur Penanganan Selisih
            </h3>
            <div className="space-y-3 text-xs">
              {STEPPER_STEPS.map((step, i) => {
                const isDone = i < activeStep;
                const isActive = i === activeStep;
                return (
                  <div key={step.id} className="flex items-start space-x-2.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold border-2 transition-colors ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : isActive
                          ? 'bg-[#0f233a] border-[#0f233a] text-white'
                          : 'bg-white border-slate-300 text-slate-400'
                      }`}
                    >
                      {isDone ? '✓' : step.id}
                    </div>
                    <div>
                      <p className={`font-semibold leading-tight ${isDone ? 'text-emerald-600' : isActive ? 'text-[#0f233a]' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
