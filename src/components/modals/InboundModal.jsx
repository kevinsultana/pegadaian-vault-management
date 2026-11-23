'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import { PlusCircle, X, Sparkles, MapPin, User, ArrowDownRight } from 'lucide-react';

function InboundForm({ preselectedSlot, onClose }) {
  const { createInboundTransaction, drawers, items, transactions } = useVaultStore();

  const [isManualTag, setIsManualTag] = useState(false);
  const [tagId, setTagId] = useState(
    () => `E004${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [brand, setBrand] = useState('ANTAM 10 g');
  const [weight, setWeight] = useState('10.0');
  const [purity, setPurity] = useState('999.9');
  const [sbg, setSbg] = useState(
    () => `SBG-${new Date().getFullYear().toString().slice(-2)}${Math.floor(100 + Math.random() * 900)}`
  );

  // Customer Data
  const [customerName, setCustomerName] = useState('');
  const [customerNik, setCustomerNik] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [loanAmount, setLoanAmount] = useState('Rp 11.500.000');
  const [loanType, setLoanType] = useState('KCA (Kredit Cepat Aman)');

  // Slot Selection
  const [selectedDrawerId, setSelectedDrawerId] = useState(
    () => (preselectedSlot ? preselectedSlot.split('-')[0] : 'L01')
  );
  const [selectedSlotId, setSelectedSlotId] = useState(
    () => preselectedSlot || 'L01-S06'
  );
  const [reason] = useState('Penerimaan Akad Gadai Baru');

  const currentDrawerObj = drawers.find((d) => d.id === selectedDrawerId) || drawers[0];
  const totalSlots = currentDrawerObj?.totalCapacity || 12;

  // Generate slot list for selected drawer
  const slotList = Array.from({ length: totalSlots }, (_, i) => {
    const slotNum = String(i + 1).padStart(2, '0');
    const sId = `${selectedDrawerId}-S${slotNum}`;
    const occupiedItem = items.find(
      (it) => it.slotId === sId && it.status !== 'DITEBUS' && it.status !== 'RECONCILED_VIRT'
    );
    const reservedTrx = transactions.find(
      (t) => t.targetSlotId === sId && (t.status === 'PENDING_APPROVAL' || t.status === 'APPROVED')
    );
    return {
      slotId: sId,
      slotNum,
      isOccupied: !!occupiedItem,
      isReserved: !!reservedTrx,
      itemInfo: occupiedItem ? `${occupiedItem.brand}` : reservedTrx ? `Reserved` : 'Tersedia',
    };
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tagId || !brand || !selectedSlotId) return;

    createInboundTransaction({
      tagId,
      brand,
      weight: parseFloat(weight) || 0,
      purity,
      sbg,
      customer: {
        name: customerName || 'Nasabah Umum',
        nik: customerNik || '3171000000000000',
        phone: customerPhone || '0812-0000-0000',
        address: customerAddress || 'Jakarta',
        loanAmount,
        loanType,
      },
      targetDrawerId: selectedDrawerId,
      targetSlotId: selectedSlotId,
      reason,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-6">
      {/* Modal Header */}
      <div className="bg-[#0f233a] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-[#00b4d8]/20 border border-[#00b4d8]/40">
            <PlusCircle className="w-5 h-5 text-[#00b4d8]" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide text-white">
              Buat Transaksi Inbound (Penerimaan Emas Baru)
            </h3>
            <p className="text-[11px] text-slate-300">
              Pendaftaran barang jaminan gadai, alokasi slot laci, dan penerbitan SPK
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
      <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
        {/* Section 1: RFID Tag & Spesifikasi Emas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              1. Data Tag RFID & Spesifikasi Emas
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600">
              <input
                type="checkbox"
                checked={isManualTag}
                onChange={(e) => setIsManualTag(e.target.checked)}
                className="rounded border-slate-300 text-[#008ba3] focus:ring-[#00b4d8]"
              />
              <span>Input Tag RFID Manual</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tag RFID ID:</label>
              <input
                type="text"
                value={tagId}
                disabled={!isManualTag}
                onChange={(e) => setTagId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono font-bold text-slate-900 disabled:opacity-80"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Brand / Keping:</label>
              <select
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  if (e.target.value.includes('2 g')) setWeight('2.0');
                  else if (e.target.value.includes('5 g')) setWeight('5.0');
                  else if (e.target.value.includes('10 g')) setWeight('10.0');
                  else if (e.target.value.includes('25 g')) setWeight('25.0');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-semibold"
              >
                <option value="ANTAM 10 g">ANTAM 10 g</option>
                <option value="ANTAM 5 g">ANTAM 5 g</option>
                <option value="ANTAM 2 g">ANTAM 2 g</option>
                <option value="UBS 25 g">UBS 25 g</option>
                <option value="UBS 10 g">UBS 10 g</option>
                <option value="Galeri24 10 g">Galeri24 10 g</option>
                <option value="Galeri24 5 g">Galeri24 5 g</option>
                <option value="Galeri24 2 g">Galeri24 2 g</option>
                <option value="Perhiasan Kalung 750">Perhiasan Kalung (Kadar 750)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Berat (g):</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kadar:</label>
                <input
                  type="text"
                  value={purity}
                  onChange={(e) => setPurity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-mono"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Data Pemilik / Nasabah */}
        <div className="space-y-3">
          <div className="border-b border-slate-200 pb-1.5">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-600" />
              2. Data Pemilik & Kontrak SBG Gadai
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nomor SBG:</label>
              <input
                type="text"
                value={sbg}
                onChange={(e) => setSbg(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-800"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Nasabah:</label>
              <input
                type="text"
                placeholder="e.g. Raden Mas Bagus"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">NIK Nasabah:</label>
              <input
                type="text"
                placeholder="16 digit NIK"
                value={customerNik}
                onChange={(e) => setCustomerNik(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono text-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">No. WhatsApp/HP:</label>
              <input
                type="text"
                placeholder="0812-xxxx-xxxx"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nilai Pinjaman (Uang Pinjaman):</label>
              <input
                type="text"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jenis Produk Gadai:</label>
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
              >
                <option value="KCA (Kredit Cepat Aman)">KCA (Kredit Cepat Aman)</option>
                <option value="Gadai Bisnis">Gadai Bisnis</option>
                <option value="Gadai Syariah (Rahn)">Gadai Syariah (Rahn)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Visual Slot Picker (Konsep Parkiran Mall) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              3. Alokasi Slot Laci (Visual Kapasitas Parkir)
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Kosong
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-slate-400"></span> Terisi
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2.5 h-2.5 rounded bg-amber-400"></span> Reserved
              </span>
            </div>
          </div>

          {/* Select Drawer Tab */}
          <div className="flex gap-2">
            {drawers.map((d) => (
              <button
                type="button"
                key={d.id}
                onClick={() => {
                  setSelectedDrawerId(d.id);
                  setSelectedSlotId('');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                  selectedDrawerId === d.id
                    ? 'bg-[#0f233a] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {d.name} ({d.id})
              </button>
            ))}
          </div>

          {/* Visual Grid of Slots */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="text-[11px] text-slate-500 mb-2">
              Pilih salah satu <strong>Slot Hijau (Kosong)</strong> untuk meletakkan keping emas:
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {slotList.map((slot) => {
                const isSelected = selectedSlotId === slot.slotId;
                const isAvailable = !slot.isOccupied && !slot.isReserved;

                let slotBtnStyle = 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 cursor-pointer';
                if (slot.isOccupied) {
                  slotBtnStyle = 'border-slate-300 bg-slate-200/70 text-slate-500 cursor-not-allowed opacity-60';
                } else if (slot.isReserved) {
                  slotBtnStyle = 'border-amber-300 bg-amber-100 text-amber-900 cursor-not-allowed opacity-75';
                }

                if (isSelected) {
                  slotBtnStyle = 'border-[#008ba3] bg-[#e0f2fe] ring-2 ring-[#00b4d8] text-slate-900 font-bold';
                }

                return (
                  <button
                    type="button"
                    key={slot.slotId}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSlotId(slot.slotId)}
                    className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-between min-h-[54px] ${slotBtnStyle}`}
                  >
                    <span className="font-mono text-xs font-bold">{slot.slotId.replace(`${selectedDrawerId}-`, '')}</span>
                    <span className="text-[9px] line-clamp-1 leading-tight font-sans">
                      {isSelected ? '✓ Terpilih' : slot.itemInfo}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedSlotId && (
              <div className="mt-2 text-xs font-semibold text-emerald-800 bg-emerald-100/70 p-2 rounded border border-emerald-200 flex items-center justify-between">
                <span>Slot Terpilih: <strong>{selectedSlotId}</strong> di Lemari LT-01 ({selectedDrawerId})</span>
                <span className="text-[11px] font-normal text-emerald-700">Status: Siap Dialokasikan</span>
              </div>
            )}
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
            disabled={!selectedSlotId}
            className="px-5 py-2 rounded-lg bg-[#008ba3] hover:bg-[#00758a] text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Submit Pengajuan Inbound</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function InboundModal() {
  const { inboundModalOpen, preselectedInboundSlot, setInboundModalOpen } = useVaultStore();

  if (!inboundModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <InboundForm
        preselectedSlot={preselectedInboundSlot}
        onClose={() => setInboundModalOpen(false)}
      />
    </div>
  );
}
