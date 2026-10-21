'use client';

import React from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Percent,
  ArrowLeftRight,
  ChevronRight,
} from 'lucide-react';

export default function DashboardView() {
  const { kpi, alerts, rfidLogs, setActiveView, executeScenario, lastScanTime } = useVaultStore();

  // 7 Days Mutation Mock Data
  const mutationHistory = [
    { day: '14/10', inCount: 18, outCount: 15 },
    { day: '15/10', inCount: 28, outCount: 24 },
    { day: '16/10', inCount: 22, outCount: 25 },
    { day: '17/10', inCount: 26, outCount: 19 },
    { day: '18/10', inCount: 12, outCount: 10 },
    { day: '19/10', inCount: 9, outCount: 8 },
    { day: '20/10', inCount: 18, outCount: 16 },
  ];

  return (
    <div className="space-y-5">
      {/* Subheader */}
      <div className="pb-1">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Dashboard Vault — Ringkasan
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Pembaruan otomatis dari siklus baca RFID · terakhir {lastScanTime}
        </p>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total Item */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Total item di vault</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 leading-none">
              {kpi.totalVaultItems.toLocaleString('id-ID')}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">keping emas</p>
          </div>
        </div>

        {/* Terbaca Siklus Terakhir */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Terbaca siklus terakhir</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 leading-none">
              {kpi.readLastCycle.toLocaleString('id-ID')}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">dari 1.248 tag</p>
          </div>
        </div>

        {/* Selisih Terbuka */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Selisih terbuka</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-rose-600 leading-none">
              {kpi.openDifference}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">menunggu klasifikasi</p>
          </div>
        </div>

        {/* Inventory Record Accuracy */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Inventory record accuracy</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-[#008ba3] leading-none">
              {kpi.accuracy}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">target 100%</p>
          </div>
        </div>

        {/* Mutasi Hari Ini */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Mutasi hari ini</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 leading-none">
              {kpi.todayMutations}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">in 18 · out 16 · transfer 8</p>
          </div>
        </div>
      </div>

      {/* Row 2: Peta Lemari Zona WH-505 (Left) + Mutasi 7 Hari Terakhir (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Peta Lemari Zona WH-505 (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800">
              Peta lemari — zona WH-505
            </h3>
            <span className="text-[10px] text-slate-400">Klik lemari untuk detail</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* LG-01 (Lemari Ganda - K1..K8 hijau) */}
            <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
              <div className="text-[11px] font-bold text-slate-700">LG-01</div>
              <div className="text-[9px] text-slate-400 mb-2">Lemari Ganda</div>
              <div className="grid grid-cols-2 gap-1.5">
                {['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8'].map((k) => (
                  <div
                    key={k}
                    className="h-6 rounded bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-[10px] font-mono font-semibold flex items-center justify-center"
                  >
                    {k}
                  </div>
                ))}
              </div>
            </div>

            {/* LG-02 (Lemari Ganda - K1..K8 hijau) */}
            <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
              <div className="text-[11px] font-bold text-slate-700">LG-02</div>
              <div className="text-[9px] text-slate-400 mb-2">Lemari Ganda</div>
              <div className="grid grid-cols-2 gap-1.5">
                {['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8'].map((k) => (
                  <div
                    key={k}
                    className="h-6 rounded bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-[10px] font-mono font-semibold flex items-center justify-center"
                  >
                    {k}
                  </div>
                ))}
              </div>
            </div>

            {/* LT-01 (Lemari Tunggal - K1..K6, K5 Merah) */}
            <div
              onClick={() => {
                setActiveView('lemari-laci');
                executeScenario('UT-04');
              }}
              className="border-2 border-dashed border-[#00b4d8] rounded-lg p-2.5 bg-sky-50/30 hover:bg-sky-50 transition-all cursor-pointer relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-900 group-hover:text-[#008ba3]">
                  LT-01
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#008ba3] opacity-70 group-hover:opacity-100" />
              </div>
              <div className="text-[9px] text-slate-400 mb-2">Lemari Tunggal (Demo)</div>
              <div className="grid grid-cols-2 gap-1.5">
                {['K1', 'K2', 'K3', 'K4', 'K5', 'K6'].map((k) => {
                  const isK5Alert = k === 'K5';
                  return (
                    <div
                      key={k}
                      className={`h-6 rounded text-[10px] font-mono font-semibold flex items-center justify-center border ${
                        isK5Alert
                          ? 'bg-[#fee2e2] border-[#f87171] text-rose-800 animate-pulse'
                          : 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]'
                      }`}
                    >
                      {isK5Alert ? 'K5 · -1' : k}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mutasi 7 Hari Terakhir (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800">
              Mutasi 7 hari terakhir
            </h3>
            <div className="flex items-center space-x-3 text-[10px]">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 bg-[#0f233a] rounded-xs inline-block" /> Masuk
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 bg-[#d97706] rounded-xs inline-block" /> Keluar
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="flex items-end justify-between h-[150px] pt-4 px-2 border-b border-slate-100">
            {mutationHistory.map((item) => {
              const maxVal = 32;
              const inHeight = (item.inCount / maxVal) * 110;
              const outHeight = (item.outCount / maxVal) * 110;

              return (
                <div key={item.day} className="flex flex-col items-center gap-1">
                  <div className="flex items-end gap-1">
                    {/* Bar In (Navy) */}
                    <div
                      style={{ height: `${inHeight}px` }}
                      className="w-3 bg-[#0f233a] rounded-t-xs transition-all"
                      title={`Masuk: ${item.inCount}`}
                    />
                    {/* Bar Out (Gold/Amber) */}
                    <div
                      style={{ height: `${outHeight}px` }}
                      className="w-3 bg-[#d97706] rounded-t-xs transition-all"
                      title={`Keluar: ${item.outCount}`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Alert Terbuka (Left) + Aktivitas Terbaru (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Alert Terbuka (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-2.5">
          <h3 className="text-xs font-bold text-slate-800 mb-2">Alert terbuka</h3>

          {/* Alert Card 1 (SELISIH - Red) */}
          <div
            onClick={() => {
              setActiveView('alert');
              executeScenario('UT-04');
            }}
            className="flex items-center justify-between p-3 rounded-lg bg-[#fff1f2] border border-[#fecdd3] hover:border-rose-400 cursor-pointer transition-all"
          >
            <div className="flex items-center space-x-3 text-xs">
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold font-mono text-[10px]">
                SELISIH
              </span>
              <span className="text-slate-800 font-medium">
                LT-01/L05 · E0040024 tidak terbaca · 10:45
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-500" />
          </div>

          {/* Alert Card 2 (APPROVAL - Orange/Gold) */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#fffbeb] border border-[#fde68a] transition-all">
            <div className="flex items-center space-x-3 text-xs">
              <span className="px-2 py-0.5 rounded bg-[#d97706] text-white font-bold font-mono text-[10px]">
                APPROVAL
              </span>
              <span className="text-slate-800 font-medium">
                2 pengeluaran menunggu dual approval
              </span>
            </div>
            <span className="text-[10px] text-amber-700 font-medium">Pending</span>
          </div>

          {/* Alert Card 3 (INFO - Green/Cyan) */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] transition-all">
            <div className="flex items-center space-x-3 text-xs">
              <span className="px-2 py-0.5 rounded bg-[#059669] text-white font-bold font-mono text-[10px]">
                INFO
              </span>
              <span className="text-slate-800 font-medium">
                Siklus baca LG-01, LG-02 normal · 0 selisih
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">Normal</span>
          </div>
        </div>

        {/* Aktivitas Terbaru (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 mb-3">Aktivitas terbaru</h3>
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
            {rfidLogs.slice(0, 4).map((log) => {
              let dotColor = 'bg-blue-600';
              if (log.color === 'red') dotColor = 'bg-rose-600';
              if (log.color === 'green') dotColor = 'bg-emerald-600';

              return (
                <div key={log.id} className="flex items-start space-x-2 text-xs">
                  <div className="mt-1">
                    <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                  </div>
                  <span className="font-mono text-slate-400 text-[11px] shrink-0">
                    {log.time}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-[11px] truncate">
                      {log.title}
                    </p>
                    <p className="text-slate-500 text-[10px] truncate">{log.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
