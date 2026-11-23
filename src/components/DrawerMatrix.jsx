'use client';

import React from 'react';
import { useVaultStore } from '../store/useVaultStore';
import {
  ArrowRight,
  Settings,
  PlusCircle,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';

export default function DrawerMatrix() {
  const {
    items,
    drawers,
    transactions,
    selectedDrawer,
    setSelectedDrawer,
    currentRole,
    openDrawerCapacityModal,
    setInboundModalOpen,
    openItemDetail,
  } = useVaultStore();

  const isSupervisor = currentRole === 'SUPERVISOR';
  const isStaffBisnis = currentRole === 'STAFF_BISNIS';

  return (
    <div className="space-y-4">
      {/* Legend & Concept Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-[#008ba3]/15 text-[#008ba3]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">
              Peta Kapasitas Laci Vault (Konsep Parkiran Mobil Mall)
            </h3>
            <p className="text-slate-400 text-[11px]">
              Sensor LED hijau menunjukkan slot kosong yang siap dialokasikan untuk emas Inbound baru
            </p>
          </div>
        </div>

        {/* Status LED Indicators */}
        <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] animate-pulse"></span>
            Kosong (Siap Ditempati)
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008ba3] shadow-[0_0_6px_rgba(0,180,216,0.6)]"></span>
            Terisi Emas Aktif
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]"></span>
            Reserved (Pending)
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)] animate-ping"></span>
            Anomali / Selisih
          </span>
        </div>
      </div>

      {/* Grid of 3 Drawers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {drawers.map((d) => {
          const isSelected = selectedDrawer === d.id;
          const totalCap = d.totalCapacity || 12;
          const cols = d.cols || 4;

          // All items registered to this drawer
          const drawerItems = items.filter(
            (it) =>
              (it.systemDrawerId === d.id || it.drawerId === d.id) &&
              it.status !== 'DITEBUS' &&
              it.status !== 'RECONCILED_VIRT'
          );

          // Pending reservations for this drawer
          const pendingReservations = transactions.filter(
            (t) =>
              t.targetDrawerId === d.id &&
              (t.status === 'PENDING_APPROVAL' || t.status === 'APPROVED')
          );

          const occupiedCount = drawerItems.length;
          const reservedCount = pendingReservations.length;
          const availableCount = Math.max(0, totalCap - occupiedCount - reservedCount);
          const occupancyRate = totalCap > 0 ? Math.round((occupiedCount / totalCap) * 100) : 0;

          // Generate slot grid
          const slots = Array.from({ length: totalCap }, (_, i) => {
            const slotNum = String(i + 1).padStart(2, '0');
            const slotId = `${d.id}-S${slotNum}`;

            const itemInSlot = drawerItems.find((it) => it.slotId === slotId);
            const resInSlot = pendingReservations.find((t) => t.targetSlotId === slotId);
            const isMissing = itemInSlot && !itemInSlot.isPhysicallyPresent;

            let slotStatus = 'AVAILABLE';
            if (isMissing) slotStatus = 'ANOMALY';
            else if (itemInSlot) slotStatus = 'OCCUPIED';
            else if (resInSlot) slotStatus = 'RESERVED';

            return {
              slotId,
              slotNum,
              slotStatus,
              item: itemInSlot,
              reservation: resInSlot,
            };
          });

          return (
            <div
              key={d.id}
              className={`bg-white rounded-2xl border transition-all shadow-xs flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'border-[#008ba3] ring-2 ring-[#00b4d8]/40 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Drawer Card Header */}
              <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                      {d.id}
                    </span>
                    <h3 className="font-bold text-slate-800 text-xs">{d.name}</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{d.category || 'LT-01 Single Vault'}</p>
                </div>

                {/* Supervisor Edit Capacity Button */}
                {isSupervisor ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDrawerCapacityModal(d.id);
                    }}
                    className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                    title="Atur kapasitas dan grid slot laci"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-700" />
                    <span>Atur ({totalCap} Slot)</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-mono font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {totalCap} Slot
                  </span>
                )}
              </div>

              {/* Occupancy Progress Bar */}
              <div className="px-4 py-2.5 border-b border-slate-100 bg-white flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Kapasitas:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {occupiedCount} / {totalCap}
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200 text-[10px]">
                    {availableCount} Kosong
                  </span>
                </div>
                <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all ${
                      occupancyRate > 80 ? 'bg-rose-500' : occupancyRate > 50 ? 'bg-amber-500' : 'bg-[#008ba3]'
                    }`}
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>

              {/* Parking Lot Slot Grid */}
              <div className="p-4 flex-1">
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                  {slots.map((s) => {
                    const isAvailable = s.slotStatus === 'AVAILABLE';
                    const isOccupied = s.slotStatus === 'OCCUPIED';
                    const isReserved = s.slotStatus === 'RESERVED';
                    const isAnomaly = s.slotStatus === 'ANOMALY';

                    let btnClass = 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100 text-emerald-950 cursor-pointer shadow-2xs';
                    let label = 'KOSONG';
                    let ledColor = 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]';

                    if (isOccupied) {
                      btnClass = 'bg-[#e0f2fe] border-[#38bdf8] hover:bg-[#bae6fd] text-slate-900 cursor-pointer shadow-2xs';
                      label = s.item.brand.replace('ANTAM ', '').replace('Galeri24 ', 'G24 ');
                      ledColor = 'bg-[#008ba3] shadow-[0_0_5px_rgba(0,180,216,0.8)]';
                    } else if (isReserved) {
                      btnClass = 'bg-amber-50 border-amber-300 hover:bg-amber-100 text-amber-900 cursor-default';
                      label = 'Reserved';
                      ledColor = 'bg-amber-500';
                    } else if (isAnomaly) {
                      btnClass = 'bg-rose-100 border-rose-400 hover:bg-rose-200 text-rose-900 animate-pulse cursor-pointer';
                      label = 'Selisih';
                      ledColor = 'bg-rose-600 animate-ping';
                    }

                    return (
                      <button
                        type="button"
                        key={s.slotId}
                        onClick={() => {
                          setSelectedDrawer(d.id);
                          if (isOccupied || isAnomaly) {
                            openItemDetail(s.item);
                          } else if (isAvailable && isStaffBisnis) {
                            setInboundModalOpen(true, s.slotId);
                          }
                        }}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col justify-between items-center min-h-[62px] relative group ${btnClass}`}
                        title={
                          isOccupied
                            ? `Detail: ${s.item.brand} (${s.item.id}) - Nasabah: ${s.item.customer?.name} (${s.item.sbg})`
                            : isAvailable
                            ? `Slot ${s.slotId} Kosong. Klik untuk Inbound baru.`
                            : 'Slot Reserved'
                        }
                      >
                        {/* Top row with slot number and parking sensor LED */}
                        <div className="w-full flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold tracking-tight">
                            {s.slotNum}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${ledColor}`}></span>
                        </div>

                        {/* Label or Brand snippet */}
                        <span className="text-[9px] font-semibold leading-tight truncate w-full text-center">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Card Footer */}
              <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedDrawer(d.id)}
                  className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                    isSelected ? 'text-[#008ba3] font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{isSelected ? '✓ Laci Terpilih' : 'Pilih Laci'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                {isStaffBisnis && availableCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDrawer(d.id);
                      setInboundModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#008ba3] hover:bg-[#00758a] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>Inbound Laci Ini</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
