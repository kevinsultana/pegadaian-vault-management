'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useVaultStore } from '../../store/useVaultStore';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Percent,
  ArrowLeftRight,
  ChevronRight,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  ClipboardList,
  Sparkles,
  MapPin,
  Clock,
  User,
} from 'lucide-react';

export default function DashboardView() {
  const router = useRouter();
  const {
    alerts,
    rfidLogs,
    items,
    drawers,
    transactions,
    beritaAcaraList,
    setSelectedDrawer,
    lastScanTime,
    currentRole,
    setInboundModalOpen,
    setOutboundModalOpen,
    openItemDetail,
  } = useVaultStore();

  const isStaffBisnis = currentRole === 'STAFF_BISNIS';
  const isSupervisor = currentRole === 'SUPERVISOR';
  const isPetugas = currentRole === 'PETUGAS';
  const isSPI = currentRole === 'SPI';

  // Dynamic KPI Calculations based on active vault items
  const activeItems = items.filter((i) => i.status !== 'DITEBUS' && i.status !== 'RELOKASI_KELUAR');
  const totalVaultItems = activeItems.length;
  const readLastCycle = activeItems.filter((i) => i.isPhysicallyPresent).length;

  // Selisih = total items yang isPhysicallyPresent === false dan belum selesai diaudit
  const openDifference = activeItems.filter(
    (i) => !i.isPhysicallyPresent && i.status !== 'RECONCILED_VIRT'
  ).length;

  // IRA = ((Terbaca / Total Item) * 100).toFixed(1) + '%'
  const accuracy = totalVaultItems > 0
    ? `${((readLastCycle / totalVaultItems) * 100).toFixed(1)}%`
    : '100.0%';

  // Mutasi Hari Ini
  const completedTrxCount = (transactions || []).filter(
    (t) => t.status === 'COMPLETED' || t.status === 'APPROVED'
  ).length;
  const todayMutations = completedTrxCount + beritaAcaraList.length;

  // Pending counts
  const pendingApprovalCount = (transactions || []).filter((t) => t.status === 'PENDING_APPROVAL').length;
  const approvedSpkCount = (transactions || []).filter((t) => t.status === 'APPROVED').length;

  // Total capacity across all drawers
  const totalSlotsCapacity = drawers.reduce((acc, d) => acc + (d.totalCapacity || 12), 0);
  const totalAvailableSlots = Math.max(0, totalSlotsCapacity - totalVaultItems);

  // Dynamic check for LT-01 drawers with selisih
  const l03HasSelisih = activeItems.some(
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
      {/* Role Action & Context Guidance Banner */}
      <div className="bg-linear-to-r from-[#0f233a] via-[#162e4a] to-[#0f233a] rounded-2xl p-5 text-white shadow-md border border-[#234266] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#008ba3] text-white font-bold uppercase tracking-wider">
              {currentRole}
            </span>
            <span className="text-slate-400 text-xs">• Brankas Pusat LT-01 Pegadaian</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            {isStaffBisnis && 'Halo Staff Bisnis! Pantau Slot Parkir & Buat Transaksi'}
            {isSupervisor && 'Pusat Otorisasi & Kontrol Brankas Supervisor'}
            {isPetugas && 'Pusat Eksekusi Surat Perintah Kerja (SPK) Petugas'}
            {isSPI && 'Portal Pengawasan & Pemeriksaan Independen SPI'}
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            {isStaffBisnis &&
              `Tersedia ${totalAvailableSlots} slot kosong dari total ${totalSlotsCapacity} slot kapasitas. Anda dapat mendaftarkan emas jaminan baru atau mengajukan penebusan.`}
            {isSupervisor &&
              `Terdapat ${pendingApprovalCount} pengajuan transaksi yang memerlukan otorisasi persetujuan Dual Control sebelum SPK diterbitkan ke Petugas.`}
            {isPetugas &&
              `Terdapat ${approvedSpkCount} perintah kerja fisik yang telah disetujui Supervisor dan siap dieksekusi penempatan/pengambilannya di brankas.`}
            {isSPI &&
              'Mode Audit Read-Only aktif. Seluruh catatan saldo, slot laci, dan histori pergerakan dapat diperiksa secara transparan.'}
          </p>
        </div>

        {/* Quick Action Buttons per Role */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isStaffBisnis && (
            <>
              <button
                type="button"
                onClick={() => setInboundModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#00b4d8] hover:bg-[#0096b4] text-[#0f233a] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Inbound Baru</span>
              </button>
              <button
                type="button"
                onClick={() => setOutboundModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Outbound Tebus</span>
              </button>
            </>
          )}

          {isSupervisor && (
            <button
              type="button"
              onClick={() => router.push('/approval')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Review {pendingApprovalCount} Pengajuan</span>
            </button>
          )}

          {isPetugas && (
            <button
              type="button"
              onClick={() => router.push('/perintah-kerja')}
              className="px-4 py-2 rounded-xl bg-[#00b4d8] hover:bg-[#0096b4] text-[#0f233a] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Buka SPK ({approvedSpkCount} Siap)</span>
            </button>
          )}

          {isSPI && (
            <button
              type="button"
              onClick={() => router.push('/audit-trail')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Periksa Audit Trail</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total Item */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">
            Total Emas Aktif Vault
          </span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 leading-none">
              {totalVaultItems}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">keping emas aktif di lemari LT-01</p>
          </div>
        </div>

        {/* Terbaca Siklus Terakhir */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">
            Terbaca Siklus Terakhir
          </span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 leading-none">
              {readLastCycle}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">dari {totalVaultItems} tag terdeteksi</p>
          </div>
        </div>

        {/* Selisih Terbuka */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">
            Selisih Terbuka
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
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">
            Akurasi Rekonsiliasi (IRA)
          </span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-[#008ba3] leading-none">
              {accuracy}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">target SLA 100%</p>
          </div>
        </div>

        {/* Mutasi Hari Ini */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">
            Mutasi Hari Ini
          </span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 leading-none">
              {todayMutations}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">{completedTrxCount} transaksi · {beritaAcaraList.length} BA</p>
          </div>
        </div>
      </div>

      {/* Row 2: Visual Peta Laci "Parkiran Mall" Widget (7 cols) + Mutasi 7 Hari (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Mall Parking Lot Drawer Widget (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#008ba3]" />
              <h3 className="text-xs font-bold text-slate-800">
                Peta Kapasitas Laci LT-01 (Visual Parkiran Mall)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => router.push('/lemari-laci')}
              className="text-[11px] font-semibold text-[#008ba3] hover:text-[#00758a] flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Tampilan Penuh</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3 Drawer Mini Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {drawers.map((d) => {
              const dItems = activeItems.filter(
                (it) => it.systemDrawerId === d.id || it.drawerId === d.id
              );
              const totalCap = d.totalCapacity || 12;
              const occCount = dItems.length;
              const availCount = Math.max(0, totalCap - occCount);
              const occPercent = Math.round((occCount / totalCap) * 100);

              return (
                <div
                  key={d.id}
                  onClick={() => {
                    setSelectedDrawer(d.id);
                    router.push(`/lemari-laci?drawer=${d.id}`);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/60 hover:border-[#008ba3] transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {d.id}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded border border-emerald-300">
                      {availCount} Kosong
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Terisi:</span>
                      <span className="font-mono font-bold text-slate-800">{occCount} / {totalCap} slot</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#008ba3] h-full rounded-full transition-all"
                        style={{ width: `${occPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 truncate">
                    {d.category || 'Kompartemen Emas'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-sky-50/80 border border-sky-200 text-sky-900 text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <strong>{totalAvailableSlots} Slot Kosong</strong> siap dialokasikan untuk transaksi Inbound.
            </span>
            {isStaffBisnis && (
              <button
                type="button"
                onClick={() => setInboundModalOpen(true)}
                className="text-[10px] font-bold text-[#008ba3] hover:underline cursor-pointer"
              >
                Alokasikan Sekarang →
              </button>
            )}
          </div>
        </div>

        {/* Mutasi 7 Hari Terakhir (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-800">
              Aktivitas Mutasi 7 Hari Terakhir
            </h3>
            <div className="flex items-center space-x-3 text-[10px]">
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 bg-[#0f233a] rounded-xs inline-block" /> Masuk
              </span>
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 bg-[#d97706] rounded-xs inline-block" /> Keluar
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="flex items-end justify-between h-36 pt-4 px-2 border-b border-slate-100">
            {mutationHistory.map((item) => {
              const maxVal = 32;
              const inHeight = (item.inCount / maxVal) * 105;
              const outHeight = (item.outCount / maxVal) * 105;

              return (
                <div key={item.day} className="flex flex-col items-center gap-1">
                  <div className="flex items-end gap-1">
                    <div
                      style={{ height: `${inHeight}px` }}
                      className="w-3 bg-[#0f233a] rounded-t-xs transition-all hover:opacity-80"
                      title={`Masuk: ${item.inCount}`}
                    />
                    <div
                      style={{ height: `${outHeight}px` }}
                      className="w-3 bg-[#d97706] rounded-t-xs transition-all hover:opacity-80"
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

          <div className="pt-2 text-right">
            <button
              type="button"
              onClick={() => router.push('/transaksi')}
              className="text-[11px] font-semibold text-[#008ba3] hover:underline cursor-pointer"
            >
              Lihat Riwayat Transaksi Lengkap →
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Alert Terbuka (Left) + Aktivitas Terbaru (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Alert Terbuka (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800">Peringatan & Anomali Brankas</h3>
            <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {activeAlerts.length} aktif
            </span>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Seluruh kompartemen lemari LT-01 dalam kondisi normal · 0 selisih terbuka</span>
            </div>
          ) : (
            activeAlerts.slice(0, 3).map((alt) => {
              let bg = 'bg-[#fff1f2] border-[#fecdd3] text-rose-800';
              let badgeColor = 'bg-rose-600 text-white';

              if (alt.type === 'APPROVAL') {
                bg = 'bg-[#fffbeb] border-[#fde68a] text-amber-900';
                badgeColor = 'bg-[#d97706] text-white';
              } else if (alt.type === 'MISPLACED') {
                bg = 'bg-amber-50 border-amber-200 text-amber-900';
                badgeColor = 'bg-amber-600 text-white';
              }

              return (
                <div
                  key={alt.id}
                  onClick={() => {
                    if (alt.type === 'APPROVAL') {
                      router.push('/approval');
                    } else if (alt.type === 'SELISIH') {
                      const target = alt.drawer || 'L03';
                      setSelectedDrawer(target);
                      router.push(`/lemari-laci?drawer=${target}`);
                    } else {
                      router.push('/alert');
                    }
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border ${bg} hover:opacity-95 cursor-pointer transition-all shadow-2xs`}
                >
                  <div className="flex items-center space-x-3 text-xs">
                    <span className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] ${badgeColor}`}>
                      {alt.type}
                    </span>
                    <span className="font-semibold truncate max-w-md">
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
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
            Log Siklus Baca Antena RFID
          </h3>
          <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
            {rfidLogs.slice(0, 4).map((log) => {
              let dotColor = 'bg-blue-600';
              if (log.color === 'red') dotColor = 'bg-rose-600';
              if (log.color === 'green') dotColor = 'bg-emerald-600';
              if (log.color === 'orange') dotColor = 'bg-amber-500';

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
