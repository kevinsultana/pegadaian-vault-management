'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import { ArrowUpRight, X, User, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function OutboundModal() {
  const {
    outboundModalOpen,
    outboundTargetItem,
    setOutboundModalOpen,
    createOutboundTransaction,
    items,
  } = useVaultStore();

  const [selectedItemId, setSelectedItemId] = useState('');
  const [reason, setReason] = useState('Pelunasan Tebus Akad Gadai oleh Nasabah');
  const [notes, setNotes] = useState('Kuitansi pelunasan kasir terverifikasi');

  // Active items available for outbound (status TERBACA and isPhysicallyPresent)
  const availableItems = items.filter(
    (i) => i.status !== 'DITEBUS' && i.status !== 'RECONCILED_VIRT' && i.isPhysicallyPresent
  );

  const activeItem = outboundTargetItem || items.find((i) => i.id === selectedItemId) || availableItems[0];

  if (!outboundModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeItem) return;

    createOutboundTransaction({
      itemId: activeItem.id,
      reason,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#0f233a] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40">
              <ArrowUpRight className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide text-white">
                Pengajuan Outbound (Penebusan / Pengeluaran Emas)
              </h3>
              <p className="text-[11px] text-slate-300">
                Penerbitan permohonan pengeluaran fisik emas dari laci vault
              </p>
            </div>
          </div>
          <button
            onClick={() => setOutboundModalOpen(false)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Item Selector if none was preselected */}
          {!outboundTargetItem && (
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Pilih Barang Emas yang Ditebus:</label>
              <select
                value={activeItem?.id || ''}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-mono text-xs font-semibold"
              >
                {availableItems.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.id} — {it.brand} ({it.slotId || it.drawerId}) · {it.customer?.name} ({it.sbg})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Active Item Detail Box */}
          {activeItem && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tag RFID</span>
                  <div className="font-mono text-sm font-bold text-slate-900">{activeItem.id}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Posisi Saat Ini</span>
                  <div className="font-mono text-xs font-bold text-[#008ba3] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {activeItem.slotId || activeItem.drawerId}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Barang & Kadar:</span>
                  <p className="font-semibold text-slate-800">{activeItem.brand} · {activeItem.purity}</p>
                </div>
                <div>
                  <span className="text-slate-500">Nomor SBG:</span>
                  <p className="font-mono font-bold text-slate-800">{activeItem.sbg}</p>
                </div>
                <div>
                  <span className="text-slate-500">Nama Pemilik:</span>
                  <p className="font-semibold text-slate-800">{activeItem.customer?.name || 'Nasabah'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Nilai Pinjaman:</span>
                  <p className="font-mono text-slate-800">{activeItem.customer?.loanAmount || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Alasan Outbound */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Alasan Pengeluaran:</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs font-semibold"
            >
              <option value="Pelunasan Tebus Akad Gadai oleh Nasabah">Pelunasan Tebus Akad Gadai oleh Nasabah</option>
              <option value="Proses Lelang / Eksekusi Jaminan Jatuh Tempo">Proses Lelang / Eksekusi Jaminan Jatuh Tempo</option>
              <option value="Pemindahan ke Kantor Wilayah / Retur">Pemindahan ke Kantor Wilayah / Retur</option>
            </select>
          </div>

          {/* Catatan Verifikasi */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Catatan Verifikasi Kasir:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs"
              placeholder="Contoh: Bukti pelunasan kwitansi nomor KWT-9981 sudah lunas"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
            <strong>Catatan Alur:</strong> Setelah diajukan oleh Staff Bisnis, permohonan ini akan masuk ke menu <strong>Approval Supervisor</strong>. Begitu di-approve, <strong>Petugas Vault</strong> akan menerima instruksi fisik untuk mengambil barang dari slot laci, dan slot tersebut akan langsung <strong>kembali kosong (Hijau)</strong>.
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setOutboundModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!activeItem}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Submit Pengajuan Outbound</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
