'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import { ArrowRightLeft, X, MapPin } from 'lucide-react';

export default function TransferModal() {
  const {
    transferModalOpen,
    transferTargetItem,
    setTransferModalOpen,
    createMutasiTransaction,
    drawers,
    items,
    transactions,
  } = useVaultStore();

  const [targetDrawer, setTargetDrawer] = useState('L02');
  const [targetSlot, setTargetSlot] = useState('');
  const [reason, setReason] = useState('Rotasi penataan inventori laci harian');

  if (!transferModalOpen || !transferTargetItem) return null;

  const currentDrawer = transferTargetItem.systemDrawerId || transferTargetItem.drawerId;
  const currentSlot = transferTargetItem.slotId || `${currentDrawer}-S01`;

  // Drawers list
  const availableDrawers = drawers.map((d) => d.id);
  const targetDrawerObj = drawers.find((d) => d.id === targetDrawer) || drawers[0];
  const totalSlots = targetDrawerObj?.totalCapacity || 12;

  // Generate slot list in target drawer
  const slotList = Array.from({ length: totalSlots }, (_, i) => {
    const slotNum = String(i + 1).padStart(2, '0');
    const sId = `${targetDrawer}-S${slotNum}`;
    const occupiedItem = items.find(
      (it) => it.slotId === sId && it.status !== 'DITEBUS' && it.status !== 'RECONCILED_VIRT'
    );
    const reservedTrx = transactions.find(
      (t) => t.targetSlotId === sId && (t.status === 'PENDING_APPROVAL' || t.status === 'APPROVED')
    );
    return {
      slotId: sId,
      isOccupied: !!occupiedItem,
      isReserved: !!reservedTrx,
      itemInfo: occupiedItem ? occupiedItem.brand : reservedTrx ? 'Reserved' : 'Kosong',
    };
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalSlot = targetSlot || slotList.find((s) => !s.isOccupied && !s.isReserved)?.slotId || `${targetDrawer}-S01`;
    createMutasiTransaction({
      itemId: transferTargetItem.id,
      targetDrawerId: targetDrawer,
      targetSlotId: finalSlot,
      reason,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#0f233a] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm tracking-wide">
              Pengajuan Mutasi Lokasi Emas (Antar Laci / Slot)
            </h3>
          </div>
          <button
            onClick={() => setTransferModalOpen(false)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Target Item Detail Box */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Tag ID:</span>
              <span className="font-mono font-bold text-slate-900">{transferTargetItem.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Barang & Karat:</span>
              <span className="font-semibold text-slate-800">
                {transferTargetItem.brand} ({transferTargetItem.weight?.toFixed(2)}g · {transferTargetItem.purity})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">No. SBG & Pemilik:</span>
              <span className="font-mono text-slate-700">
                {transferTargetItem.sbg} · {transferTargetItem.customer?.name || '-'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-medium">Posisi Slot Asal:</span>
              <span className="font-mono font-bold text-[#008ba3] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {currentSlot}
              </span>
            </div>
          </div>

          {/* Select Target Drawer */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">
              Pilih Laci Tujuan:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {availableDrawers.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => {
                    setTargetDrawer(d);
                    setTargetSlot('');
                  }}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer ${
                    targetDrawer === d
                      ? 'bg-[#0f233a] border-[#0f233a] text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {d} (Lemari LT-01)
                </button>
              ))}
            </div>
          </div>

          {/* Visual Slot Picker for Mutasi */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block flex items-center justify-between">
              <span>Pilih Slot Kosong di Laci {targetDrawer}:</span>
              <span className="text-[10px] text-emerald-700 font-normal">Hijau = Tersedia</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {slotList.map((s) => {
                const isSelected = targetSlot === s.slotId;
                const isAvailable = !s.isOccupied && !s.isReserved;

                let btnStyle = 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 cursor-pointer';
                if (s.isOccupied) btnStyle = 'border-slate-300 bg-slate-200/60 text-slate-400 cursor-not-allowed opacity-50';
                else if (s.isReserved) btnStyle = 'border-amber-300 bg-amber-100 text-amber-900 cursor-not-allowed opacity-60';

                if (isSelected) {
                  btnStyle = 'border-[#008ba3] bg-[#e0f2fe] ring-2 ring-[#00b4d8] text-slate-900 font-bold';
                }

                return (
                  <button
                    type="button"
                    key={s.slotId}
                    disabled={!isAvailable}
                    onClick={() => setTargetSlot(s.slotId)}
                    className={`p-1.5 rounded border text-center transition-all ${btnStyle}`}
                  >
                    <div className="font-mono text-[11px] font-bold">{s.slotId.replace(`${targetDrawer}-`, '')}</div>
                    <div className="text-[9px] truncate">{isSelected ? '✓ Pilih' : isAvailable ? 'Kosong' : s.itemInfo}</div>
                  </button>
                );
              })}
            </div>
            {targetSlot && (
              <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                Target Terpilih: <strong>{targetSlot}</strong>
              </p>
            )}
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">
              Alasan Mutasi:
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Konsolidasi pecahan gramatur perhiasan"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
              required
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setTransferModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#008ba3] hover:bg-[#00758a] text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Submit Mutasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
