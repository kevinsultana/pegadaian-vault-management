'use client';

import React from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import DrawerMatrix from '../DrawerMatrix';
import DrawerInventoryTable from '../DrawerInventoryTable';
import RealTimeRfidLogs from '../RealTimeRfidLogs';
import ReadingSummaryCard from '../ReadingSummaryCard';

export default function DrawerMonitorView() {
  const { lastScanTime, readerStatus } = useVaultStore();

  return (
    <div className="space-y-4">
      {/* Subheader & Status Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Lemari & Laci — LT-01 (Lemari Tunggal)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Siklus baca terakhir {lastScanTime} · reader MARS-4AT {readerStatus.toLowerCase()} · 12 laci terpindai
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Badge Reader Status */}
          <span className="inline-flex items-center px-3 py-1 rounded bg-[#dcfce7] text-[#15803d] text-xs font-semibold font-mono tracking-wide border border-emerald-200">
            READER ONLINE
          </span>

          {/* Badge Siklus Baca */}
          <span className="inline-flex items-center px-3 py-1 rounded bg-[#e0f2fe] text-[#0284c7] text-xs font-semibold font-mono tracking-wide border border-sky-200">
            SIKLUS BACA 15 MENIT
          </span>
        </div>
      </div>

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
