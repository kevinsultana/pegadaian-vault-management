'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import { Settings, X, Check, ShieldAlert } from 'lucide-react';

function DrawerCapacityForm({ drawer, onClose, isSupervisor }) {
  const { updateDrawerCapacity } = useVaultStore();

  const [capacity, setCapacity] = useState(() => drawer.totalCapacity || 12);
  const [rows, setRows] = useState(() => drawer.rows || 3);
  const [cols, setCols] = useState(() => drawer.cols || 4);
  const [prefix, setPrefix] = useState(() => drawer.slotsPrefix || `${drawer.id}-S`);

  const handleCapacityChange = (newTotal) => {
    const val = parseInt(newTotal, 10) || 12;
    setCapacity(val);
    if (val === 12) { setRows(3); setCols(4); }
    else if (val === 16) { setRows(4); setCols(4); }
    else if (val === 20) { setRows(4); setCols(5); }
    else if (val === 24) { setRows(4); setCols(6); }
    else {
      setRows(Math.ceil(Math.sqrt(val)));
      setCols(Math.ceil(val / Math.ceil(Math.sqrt(val))));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateDrawerCapacity(drawer.id, {
      totalCapacity: capacity,
      rows,
      cols,
      slotsPrefix: prefix,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
      {/* Header */}
      <div className="bg-[#0f233a] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40">
            <Settings className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide text-white">
              Pengaturan Kapasitas & Slot Laci {drawer.id}
            </h3>
            <p className="text-[11px] text-slate-300">
              Kustomisasi dinamis ukuran grid dan kapasitas tampung brankas
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
        {!isSupervisor && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-300 text-amber-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Peran aktif Anda saat ini bukan <strong>Supervisor Vault</strong>. Pengubahan kapasitas terkunci.
            </span>
          </div>
        )}

        {/* Preset Buttons */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1.5">
            Pilihan Cepat Kapasitas Slot:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[12, 16, 20, 24].map((cap) => (
              <button
                type="button"
                key={cap}
                disabled={!isSupervisor}
                onClick={() => handleCapacityChange(cap)}
                className={`py-2 px-3 rounded-lg border font-bold text-center transition-all cursor-pointer ${
                  capacity === cap
                    ? 'bg-[#008ba3] border-[#008ba3] text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cap} Slot
              </button>
            ))}
          </div>
        </div>

        {/* Custom Settings */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Total Slot:</label>
            <input
              type="number"
              min="3"
              max="48"
              value={capacity}
              disabled={!isSupervisor}
              onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 12)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Jumlah Baris:</label>
            <input
              type="number"
              min="1"
              max="12"
              value={rows}
              disabled={!isSupervisor}
              onChange={(e) => setRows(parseInt(e.target.value, 10) || 3)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono text-slate-800"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Jumlah Kolom:</label>
            <input
              type="number"
              min="1"
              max="12"
              value={cols}
              disabled={!isSupervisor}
              onChange={(e) => setCols(parseInt(e.target.value, 10) || 4)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Prefix Penomoran Slot Eksplisit:</label>
          <input
            type="text"
            value={prefix}
            disabled={!isSupervisor}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="Contoh: L01-S"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono text-slate-800"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Contoh penomoran yang dihasilkan: <span className="font-mono text-slate-700">{prefix}01</span> s/d{' '}
            <span className="font-mono text-slate-700">{prefix}{String(capacity).padStart(2, '0')}</span>
          </p>
        </div>

        {/* Grid Preview */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-600 block mb-2">
            Preview Layout Grid ({rows} Baris × {cols} Kolom = {capacity} Slot):
          </span>
          <div
            className="grid gap-1.5 max-h-36 overflow-y-auto p-1"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: capacity }, (_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-300 rounded p-1 text-center font-mono text-[10px] font-bold text-slate-700"
              >
                {prefix}{String(i + 1).padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
          >
            Tutup
          </button>
          {isSupervisor && (
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Kapasitas Laci</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function DrawerCapacityModal() {
  const {
    drawerCapacityModalOpen,
    selectedDrawerForCapacity,
    closeDrawerCapacityModal,
    drawers,
    currentRole,
  } = useVaultStore();

  if (!drawerCapacityModalOpen || !selectedDrawerForCapacity) return null;

  const drawer = drawers.find((d) => d.id === selectedDrawerForCapacity) || drawers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <DrawerCapacityForm
        drawer={drawer}
        onClose={closeDrawerCapacityModal}
        isSupervisor={currentRole === 'SUPERVISOR'}
      />
    </div>
  );
}
