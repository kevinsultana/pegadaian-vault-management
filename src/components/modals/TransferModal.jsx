'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import { ArrowRightLeft, X } from 'lucide-react';

const DRAWER_OPTIONS = ['L01', 'L02', 'L03'];

export default function TransferModal() {
  const {
    transferModalOpen,
    transferTargetItem,
    setTransferModalOpen,
    requestTransfer,
  } = useVaultStore();

  const [targetDrawer, setTargetDrawer] = useState('L02');
  const [reason, setReason] = useState('Rotasi penataan inventori laci harian');

  if (!transferModalOpen || !transferTargetItem) return null;

  const currentDrawer = transferTargetItem.systemDrawerId || transferTargetItem.drawerId;
  const availableDrawers = DRAWER_OPTIONS.filter((d) => d !== currentDrawer);

  const handleSubmit = (e) => {
    e.preventDefault();
    requestTransfer(transferTargetItem.id, targetDrawer, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#0f233a] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm tracking-wide">
              Pengajuan Transfer Laci
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
                {transferTargetItem.brand} ({transferTargetItem.weight.toFixed(2)}g · {transferTargetItem.purity})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">No. SBG Nasabah:</span>
              <span className="font-mono text-slate-700">{transferTargetItem.sbg}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-medium">Posisi Laci Asal:</span>
              <span className="font-mono font-bold text-[#008ba3] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {currentDrawer}
              </span>
            </div>
          </div>

          {/* Select Target Drawer */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">
              Pilih Laci Tujuan:
            </label>
            <select
              value={targetDrawer}
              onChange={(e) => setTargetDrawer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#00b4d8]"
            >
              {availableDrawers.map((d) => (
                <option key={d} value={d}>
                  {d} (Lemari LT-01 / Laci {d})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              Setelah diajukan, status transfer akan menjadi <span className="font-semibold text-amber-600">PENDING</span> dan memerlukan persetujuan Supervisor pada menu Approval.
            </p>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">
              Alasan Mutasi:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00b4d8]"
              placeholder="Masukkan alasan pemindahan item..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setTransferModalOpen(false)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#0f233a] hover:bg-[#162d48] text-white font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-300" />
              <span>Ajukan Mutasi ke Supervisor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
