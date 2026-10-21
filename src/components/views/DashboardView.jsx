"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useVaultStore } from "../../store/useVaultStore";
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Percent,
  ArrowLeftRight,
  ChevronRight,
} from "lucide-react";

export default function DashboardView() {
  const router = useRouter();
  const {
    alerts,
    rfidLogs,
    items,
    transfers,
    beritaAcaraList,
    setActiveView,
    setSelectedDrawer,
    lastScanTime,
  } = useVaultStore();

  // Dynamic KPI Calculations based on real store state (PoC 10 Keping Emas LT-01)
  const totalVaultItems = items.length;
  const readLastCycle = items.filter((i) => i.isPhysicallyPresent).length;

  // Selisih = total items yang isPhysicallyPresent === false dan belum selesai diaudit
  const openDifference = items.filter(
    (i) => !i.isPhysicallyPresent && i.status !== 'RECONCILED_VIRT'
  ).length;

  // IRA = ((Terbaca / Total Item) * 100).toFixed(1) + '%'
  const accuracy = totalVaultItems > 0
    ? ((readLastCycle / totalVaultItems) * 100).toFixed(1) + '%'
    : '100.0%';

  // Mutasi Hari Ini = hitung jumlah dokumen transfer approved/verified + Berita Acara hari ini
  const approvedTransfersCount = transfers.filter(
    (t) => t.status === 'APPROVED' || t.status === 'VERIFIED'
  ).length;
  const todayMutations = approvedTransfersCount + beritaAcaraList.length;

  // Dynamic check for LT-01 drawers with selisih (Skenario L03)
  const l03HasSelisih = items.some(
    (it) =>
      (it.systemDrawerId === 'L03' || it.drawerId === 'L03') &&
      !it.isPhysicallyPresent &&
      it.status !== 'RECONCILED_VIRT'
  );

  const activeAlerts = alerts.filter(
    (a) => a.status === 'OPEN' || a.status === 'PENDING'
  );

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
          <span className="text-[11px] font-semibold text-slate-500">
            Total item di vault
          </span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 leading-none">
              {totalVaultItems}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">keping emas aktif di lemari LT-01</p>
          </div>
        </div>

        {/* Terbaca Siklus Terakhir */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">
            Terbaca siklus terakhir
          </span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 leading-none">
              {readLastCycle}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">dari {totalVaultItems} tag terdeteksi</p>
          </div>
        </div>

        {/* Selisih Terbuka */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">
            Selisih terbuka
          </span>
          <div className="mt-2">
            <span className={`text-2xl font-bold font-mono leading-none ${openDifference > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {openDifference}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">
              {openDifference > 0
                ? `${openDifference} item belum direkonsiliasi`
                : '0 selisih (normal)'}
            </p>
          </div>
        </div>

        {/* Inventory Record Accuracy */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">
            Inventory record accuracy
          </span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-[#008ba3] leading-none">
              {accuracy}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">target 100%</p>
          </div>
        </div>

        {/* Mutasi Hari Ini */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">
            Mutasi hari ini
          </span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 leading-none">
              {todayMutations}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">{approvedTransfersCount} transfer · {beritaAcaraList.length} BA</p>
          </div>
        </div>
      </div>

      {/* Row 2: Peta Lemari Zona WH-505 (Left) + Mutasi 7 Hari Terakhir (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Peta Lemari Zona WH-505 (7 cols) - Hanya 1 Lemari LT-01 dengan 3 Slot Laci */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800">
              Peta Lemari — LT-01 (Lemari Tunggal 01)
            </h3>
            <span className="text-[10px] text-slate-400">
              3 Kompartemen Laci Terpasang Antena RFID
            </span>
          </div>

          {/* Single Cabinet Card with 3 Drawers */}
          <div
            onClick={() => {
              const targetDrawer = l03HasSelisih ? "L03" : "L01";
              setSelectedDrawer(targetDrawer);
              router.push(l03HasSelisih ? "/lemari-laci?drawer=L03" : "/lemari-laci");
            }}
            className="border-2 border-dashed border-[#00b4d8] rounded-xl p-4 bg-sky-50/20 hover:bg-sky-50/50 transition-all cursor-pointer relative group"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-bold text-slate-900 group-hover:text-[#008ba3]">
                  LT-01 (Lemari Tunggal 01)
                </span>
                <p className="text-[11px] text-slate-400">Zona Vault WH-505 · Multiplexer Reader Port 1..3</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#008ba3] bg-white px-2.5 py-1 rounded-md border border-sky-200 shadow-2xs">
                <span>Buka Detail Lemari</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* 3 Drawer Slots (L01, L02, L03) */}
            <div className="grid grid-cols-3 gap-3">
              {/* Slot L01 */}
              <div className="h-16 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] p-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold">L01</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">KLOP</span>
                </div>
                <div className="text-[11px] font-mono text-emerald-900 font-bold">5 / 5 item</div>
              </div>

              {/* Slot L02 */}
              <div className="h-16 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] p-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold">L02</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">KLOP</span>
                </div>
                <div className="text-[11px] font-mono text-emerald-900 font-bold">3 / 3 item</div>
              </div>

              {/* Slot L03 (Merah jika ada selisih) */}
              <div
                className={`h-16 rounded-lg p-2 flex flex-col justify-between border transition-all ${
                  l03HasSelisih
                    ? 'bg-[#fee2e2] border-[#f87171] text-rose-900 shadow-xs'
                    : 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold">L03</span>
                  {l03HasSelisih ? (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 font-bold animate-pulse">
                      SELISIH -1
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">KLOP</span>
                  )}
                </div>
                <div className={`text-[11px] font-mono font-bold ${l03HasSelisih ? 'text-rose-700' : 'text-emerald-900'}`}>
                  {l03HasSelisih ? '1 / 2 terbaca' : '2 / 2 item'}
                </div>
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
                <span className="w-2.5 h-2.5 bg-[#0f233a] rounded-xs inline-block" />{" "}
                Masuk
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 bg-[#d97706] rounded-xs inline-block" />{" "}
                Keluar
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="flex items-end justify-between h-37.5 pt-4 px-2 border-b border-slate-100">
            {mutationHistory.map((item) => {
              const maxVal = 32;
              const inHeight = (item.inCount / maxVal) * 110;
              const outHeight = (item.outCount / maxVal) * 110;

              return (
                <div
                  key={item.day}
                  className="flex flex-col items-center gap-1"
                >
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-800">Alert terbuka</h3>
            <span className="text-[11px] text-slate-400">
              {activeAlerts.length} aktif
            </span>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Semua lemari dalam kondisi normal · 0 selisih terbuka</span>
            </div>
          ) : (
            activeAlerts.slice(0, 3).map((alt) => {
              let bg = "bg-[#fff1f2] border-[#fecdd3] text-rose-800";
              let badgeColor = "bg-rose-600 text-white";

              if (alt.type === "APPROVAL") {
                bg = "bg-[#fffbeb] border-[#fde68a] text-amber-900";
                badgeColor = "bg-[#d97706] text-white";
              } else if (alt.type === "MISPLACED") {
                bg = "bg-amber-50 border-amber-200 text-amber-900";
                badgeColor = "bg-amber-600 text-white";
              } else if (alt.type === "INFO") {
                bg = "bg-[#ecfdf5] border-[#a7f3d0] text-emerald-900";
                badgeColor = "bg-[#059669] text-white";
              }

              return (
                <div
                  key={alt.id}
                  onClick={() => {
                    if (alt.type === "APPROVAL") {
                      router.push("/approval");
                    } else if (alt.type === "SELISIH") {
                      const target = alt.drawer || "L05";
                      setSelectedDrawer(target);
                      router.push(`/lemari-laci?drawer=${target}`);
                    } else if (alt.drawer) {
                      setSelectedDrawer(alt.drawer);
                      router.push(`/lemari-laci?drawer=${alt.drawer}`);
                    } else {
                      router.push("/alert");
                    }
                  }}
                  className={`flex items-center justify-between p-3 rounded-lg border ${bg} hover:opacity-90 cursor-pointer transition-all`}
                >
                  <div className="flex items-center space-x-3 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] ${badgeColor}`}
                    >
                      {alt.type}
                    </span>
                    <span className="font-medium truncate max-w-md">
                      {alt.title}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </div>
              );
            })
          )}
        </div>

        {/* Aktivitas Terbaru (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 mb-3">
            Aktivitas terbaru
          </h3>
          <div className="space-y-3 max-h-50 overflow-y-auto pr-1">
            {rfidLogs.slice(0, 4).map((log) => {
              let dotColor = "bg-blue-600";
              if (log.color === "red") dotColor = "bg-rose-600";
              if (log.color === "green") dotColor = "bg-emerald-600";
              if (log.color === "orange") dotColor = "bg-amber-500";

              return (
                <div
                  key={log.id}
                  className="flex items-start space-x-2 text-xs"
                >
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
                    <p className="text-slate-500 text-[10px] truncate">
                      {log.detail}
                    </p>
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
