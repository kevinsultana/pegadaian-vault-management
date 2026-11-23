'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import {
  ArrowUpRight,
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  X,
  FileText,
  MapPin,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

function OutboundModalForm({ onClose }) {
  const {
    outboundTargetItem,
    createOutboundTransaction,
    items,
    drawers,
    transactions,
  } = useVaultStore();

  // Active items available for outbound (status TERBACA, physically present)
  const availableItems = items.filter(
    (i) => i.status !== 'DITEBUS' && i.status !== 'RELOKASI_KELUAR' && i.status !== 'RECONCILED_VIRT' && i.isPhysicallyPresent
  );

  const [selectedItemId, setSelectedItemId] = useState(() => outboundTargetItem?.id || availableItems[0]?.id || '');
  const activeItem = outboundTargetItem || items.find((i) => i.id === selectedItemId) || availableItems[0];

  // Outbound Category: 'TEBUS_NASABAH' | 'MUTASI_INTERNAL' | 'RELOKASI_EKSTERNAL'
  const [category, setCategory] = useState('TEBUS_NASABAH');

  // Fields for TEBUS_NASABAH
  const [receiptNumber, setReceiptNumber] = useState('KWT-202610-8812');
  const [receiverName, setReceiverName] = useState(() => activeItem?.customer?.name || 'Nasabah');

  // Fields for MUTASI_INTERNAL
  const [targetDrawerId, setTargetDrawerId] = useState(() => (activeItem?.drawerId === 'L01' ? 'L02' : 'L01'));
  const [targetSlotId, setTargetSlotId] = useState('');

  // Fields for RELOKASI_EKSTERNAL
  const [destinationLocation, setDestinationLocation] = useState('Pegadaian Kantor Wilayah VIII (Jakarta Pusat)');
  const [referenceNumber, setReferenceNumber] = useState('SJ-PGD/X/2026/014');

  // General notes
  const [notes, setNotes] = useState('Verifikasi dokumen administrasi lengkap');

  // Compute available slots for target drawer if MUTASI_INTERNAL
  const targetDrawerObj = drawers.find((d) => d.id === targetDrawerId) || drawers[0];
  const totalSlots = targetDrawerObj?.totalCapacity || 12;
  const availableSlotsInTarget = Array.from({ length: totalSlots }, (_, i) => {
    const slotNum = String(i + 1).padStart(2, '0');
    const sId = `${targetDrawerId}-S${slotNum}`;
    const isOccupied = items.some(
      (it) => it.slotId === sId && it.id !== activeItem?.id && it.status !== 'DITEBUS' && it.status !== 'RELOKASI_KELUAR' && it.status !== 'RECONCILED_VIRT'
    );
    const isReserved = transactions.some(
      (t) => t.targetSlotId === sId && (t.status === 'PENDING_APPROVAL' || t.status === 'APPROVED')
    );
    return {
      slotId: sId,
      isAvailable: !isOccupied && !isReserved,
    };
  });

  const emptySlots = availableSlotsInTarget.filter((s) => s.isAvailable);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeItem) return;

    let payload = {
      itemId: activeItem.id,
      outboundCategory: category,
      notes,
    };

    if (category === 'TEBUS_NASABAH') {
      payload.reason = `Pelunasan Tebus Akad Gadai (${receiptNumber})`;
      payload.referenceNumber = receiptNumber;
    } else if (category === 'MUTASI_INTERNAL') {
      const selectedSlot = targetSlotId || emptySlots[0]?.slotId;
      if (!selectedSlot) {
        alert('Tidak ada slot kosong yang tersedia di laci tujuan!');
        return;
      }
      payload.targetDrawerId = targetDrawerId;
      payload.targetSlotId = selectedSlot;
      payload.reason = `Mutasi / Relokasi Internal ke ${selectedSlot}`;
    } else if (category === 'RELOKASI_EKSTERNAL') {
      payload.destinationLocation = destinationLocation;
      payload.referenceNumber = referenceNumber;
      payload.reason = `Relokasi Eksternal ke ${destinationLocation}`;
    }

    createOutboundTransaction(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
      {/* Item Selector if none was preselected */}
      {!outboundTargetItem && (
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-700 block">Pilih Barang Emas dari Vault:</label>
          <select
            value={activeItem?.id || ''}
            onChange={(e) => {
              setSelectedItemId(e.target.value);
              const found = items.find((it) => it.id === e.target.value);
              if (found?.customer?.name) setReceiverName(found.customer.name);
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-mono text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
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
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
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
              <span className="text-slate-500">Barang & Karat:</span>
              <p className="font-semibold text-slate-800">{activeItem.brand} ({activeItem.purity})</p>
            </div>
            <div>
              <span className="text-slate-500">Nomor SBG:</span>
              <p className="font-mono font-bold text-slate-800">{activeItem.sbg}</p>
            </div>
            <div>
              <span className="text-slate-500">Nama Pemilik:</span>
              <p className="font-semibold text-slate-800">{activeItem.customer?.name || '-'}</p>
            </div>
            <div>
              <span className="text-slate-500">Nilai Pinjaman:</span>
              <p className="font-mono text-slate-800">{activeItem.customer?.loanAmount || '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Selector (3 Choices) */}
      <div className="space-y-2">
        <label className="font-bold text-slate-700 block">Pilih Kategori / Tujuan Pengeluaran:</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Option 1: TEBUS_NASABAH */}
          <button
            type="button"
            onClick={() => setCategory('TEBUS_NASABAH')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              category === 'TEBUS_NASABAH'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`p-1.5 rounded-lg ${category === 'TEBUS_NASABAH' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <CheckCircle2 className="w-4 h-4" />
              </span>
              {category === 'TEBUS_NASABAH' && <span className="text-[10px] font-bold text-rose-700">Terpilih</span>}
            </div>
            <div className="font-bold text-slate-900 text-xs">Penebusan Nasabah</div>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
              Pelunasan pinjaman gadai oleh nasabah
            </p>
          </button>

          {/* Option 2: MUTASI_INTERNAL */}
          <button
            type="button"
            onClick={() => setCategory('MUTASI_INTERNAL')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              category === 'MUTASI_INTERNAL'
                ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`p-1.5 rounded-lg ${category === 'MUTASI_INTERNAL' ? 'bg-[#008ba3] text-white' : 'bg-slate-100 text-slate-600'}`}>
                <ArrowRightLeft className="w-4 h-4" />
              </span>
              {category === 'MUTASI_INTERNAL' && <span className="text-[10px] font-bold text-[#008ba3]">Terpilih</span>}
            </div>
            <div className="font-bold text-slate-900 text-xs">Mutasi Internal Laci</div>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
              Pindah laci atau slot baru di dalam vault
            </p>
          </button>

          {/* Option 3: RELOKASI_EKSTERNAL */}
          <button
            type="button"
            onClick={() => setCategory('RELOKASI_EKSTERNAL')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              category === 'RELOKASI_EKSTERNAL'
                ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`p-1.5 rounded-lg ${category === 'RELOKASI_EKSTERNAL' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Building2 className="w-4 h-4" />
              </span>
              {category === 'RELOKASI_EKSTERNAL' && <span className="text-[10px] font-bold text-purple-700">Terpilih</span>}
            </div>
            <div className="font-bold text-slate-900 text-xs">Relokasi Eksternal</div>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
              Kirim ke Kanwil, Cabang lain, atau Lelang
            </p>
          </button>
        </div>
      </div>

      {/* DYNAMIC FORM SECTION BASED ON CATEGORY */}
      {category === 'TEBUS_NASABAH' && (
        <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200/80 space-y-3">
          <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Detail Pelunasan Nasabah</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                No. Bukti Kuitansi Kasir:
              </label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="Contoh: KWT-202610-8812"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Nama Penerima / Nasabah:
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {category === 'MUTASI_INTERNAL' && (
        <div className="p-3.5 bg-sky-50/50 rounded-xl border border-sky-200/80 space-y-3">
          <div className="flex items-center gap-1.5 text-[#008ba3] font-bold text-xs">
            <MapPin className="w-4 h-4 text-[#008ba3]" />
            <span>Target Kompartemen & Slot Laci Baru</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700 block">
              Pilih Laci Tujuan:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {drawers.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => {
                    setTargetDrawerId(d.id);
                    setTargetSlotId('');
                  }}
                  className={`py-2 px-3 rounded-lg border font-mono font-bold text-xs transition-colors cursor-pointer ${
                    targetDrawerId === d.id
                      ? 'bg-[#008ba3] text-white border-[#008ba3]'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {d.id} ({d.name})
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700 block">
              Pilih Slot Tujuan Kosong (Lampu Hijau):
            </label>
            <select
              value={targetSlotId || (emptySlots[0]?.slotId || '')}
              onChange={(e) => setTargetSlotId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono text-xs font-semibold focus:ring-1 focus:ring-[#00b4d8] focus:outline-none"
            >
              {emptySlots.length === 0 ? (
                <option value="">Tidak ada slot kosong di laci ini</option>
              ) : (
                emptySlots.map((s) => (
                  <option key={s.slotId} value={s.slotId}>
                    {s.slotId} — Slot Kosong (Siap Ditempati)
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      )}

      {category === 'RELOKASI_EKSTERNAL' && (
        <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200/80 space-y-3">
          <div className="flex items-center gap-1.5 text-purple-800 font-bold text-xs">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>Tujuan Ekspedisi & Surat Pengantar</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700 block">
              Pilih / Ketik Lokasi Tujuan Relokasi:
            </label>
            <select
              value={destinationLocation}
              onChange={(e) => setDestinationLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-xs font-medium focus:ring-1 focus:ring-purple-500 focus:outline-none"
            >
              <option value="Pegadaian Kantor Wilayah VIII (Jakarta Pusat)">Pegadaian Kantor Wilayah VIII (Jakarta Pusat)</option>
              <option value="Pegadaian Kantor Cabang Senen">Pegadaian Kantor Cabang Senen</option>
              <option value="Pegadaian Unit Pelayanan Cabang Salemba">Pegadaian Unit Pelayanan Cabang Salemba</option>
              <option value="Gudang Konsolidasi Balai Lelang Kramat">Gudang Konsolidasi Balai Lelang Kramat</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Nomor Surat Pengantar / Surat Jalan:
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Contoh: SJ-PGD/X/2026/014"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Catatan Verifikasi */}
      <div className="space-y-1.5">
        <label className="font-semibold text-slate-700 block">Catatan Tambahan:</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs focus:ring-1 focus:ring-[#00b4d8] focus:outline-none"
          placeholder="Catatan pendukung pengeluaran atau nomor dokumen pendukung"
        />
      </div>

      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Alur Kerja Otorisasi:</strong> Dokumen pengajuan Outbound ini akan masuk ke antrean <strong>Approval Supervisor</strong>. Setelah disetujui, <strong>Petugas Vault</strong> mengeksekusi pengambilan fisik di brankas LT-01, dan slot laci akan <strong>otomatis kosong kembali (Hijau)</strong> atau berpindah slot secara real-time.
        </div>
      </div>

      {/* Modal Actions */}
      <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={onClose}
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
  );
}

export default function OutboundModal() {
  const { outboundModalOpen, setOutboundModalOpen } = useVaultStore();

  if (!outboundModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#0f233a] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40">
              <ArrowUpRight className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide text-white">
                Pengajuan Outbound (Tebus / Mutasi / Relokasi)
              </h3>
              <p className="text-[11px] text-slate-300">
                Penerbitan permohonan pengeluaran atau relokasi fisik emas dari vault
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

        {/* Child Form */}
        <OutboundModalForm onClose={() => setOutboundModalOpen(false)} />
      </div>
    </div>
  );
}
