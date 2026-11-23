'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import {
  Sliders,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Layers,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  Info,
  Server,
  X,
  Sparkles,
  MapPin,
  Settings,
  AlertTriangle,
} from 'lucide-react';

export default function MasterLemariLaciView() {
  const {
    currentRole,
    setCurrentRole,
    cabinet,
    drawers,
    items,
    transactions,
    updateCabinet,
    addDrawer,
    updateDrawer,
    deleteDrawer,
    openDrawerCapacityModal,
  } = useVaultStore();

  const isSupervisor = currentRole === 'SUPERVISOR';

  // Modal States
  const [cabinetModalOpen, setCabinetModalOpen] = useState(false);
  const [cabinetForm, setCabinetForm] = useState(() => ({
    name: cabinet?.name || 'Lemari Khazanah Emas Utama LT-01',
    brand: cabinet?.brand || 'Chubbsafes Europa Grade V (EN 1143-1)',
    location: cabinet?.location || 'Ruang Khazanah Vault Lt. 1, Pegadaian CP Kramat Raya',
    antennaModel: cabinet?.antennaModel || 'MARS-4AT Multi-Antenna Multiplexer',
    frequency: cabinet?.frequency || 'UHF 920-925 MHz (EPC Gen2)',
  }));

  const [addDrawerModalOpen, setAddDrawerModalOpen] = useState(false);
  const [addDrawerForm, setAddDrawerForm] = useState({
    id: `L0${(drawers?.length || 3) + 1}`,
    name: `Laci 0${(drawers?.length || 3) + 1} (Kompartemen Baru)`,
    category: 'Emas Batangan & Perhiasan KCA',
    totalCapacity: 12,
    rows: 3,
    cols: 4,
    slotsPrefix: `L0${(drawers?.length || 3) + 1}-S`,
  });

  const [editDrawerModalOpen, setEditDrawerModalOpen] = useState(false);
  const [editingDrawer, setEditingDrawer] = useState(null);

  // Compute Overall Stats
  const totalSlotsAcrossVault = drawers.reduce((acc, d) => acc + (d.totalCapacity || 12), 0);
  const activeItemsInVault = items.filter(
    (it) => it.status !== 'DITEBUS' && it.status !== 'RELOKASI_KELUAR' && it.status !== 'RECONCILED_VIRT'
  );
  const totalOccupiedSlots = activeItemsInVault.length;
  const totalFreeSlots = Math.max(0, totalSlotsAcrossVault - totalOccupiedSlots);

  // Handle Cabinet Update
  const handleSaveCabinet = (e) => {
    e.preventDefault();
    updateCabinet(cabinetForm);
    setCabinetModalOpen(false);
  };

  // Handle Add Drawer
  const handleCreateDrawer = (e) => {
    e.preventDefault();
    const success = addDrawer(addDrawerForm);
    if (success) {
      setAddDrawerModalOpen(false);
      const nextNum = drawers.length + 2;
      setAddDrawerForm({
        id: `L0${nextNum}`,
        name: `Laci 0${nextNum} (Kompartemen Baru)`,
        category: 'Emas Batangan & Perhiasan KCA',
        totalCapacity: 12,
        rows: 3,
        cols: 4,
        slotsPrefix: `L0${nextNum}-S`,
      });
    }
  };

  // Handle Edit Drawer
  const handleSaveEditDrawer = (e) => {
    e.preventDefault();
    if (!editingDrawer) return;
    updateDrawer(editingDrawer.id, {
      name: editingDrawer.name,
      category: editingDrawer.category,
    });
    setEditDrawerModalOpen(false);
    setEditingDrawer(null);
  };

  // Non-supervisor access gate
  if (!isSupervisor) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-5 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">
            Akses Terbatas: Menu Master Lemari & Laci Khusus Supervisor
          </h2>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            Halaman ini merupakan pusat kendali konfigurasi master untuk mengatur lemari fisik brankas,
            menambah/mengurangi kompartemen laci, dan mengatur besaran slot laci. Sesuai prinsip *Segregation of Duties*,
            menu ini saat ini dikhususkan untuk peran <strong>Supervisor Vault</strong>.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setCurrentRole('SUPERVISOR')}
            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Beralih ke Peran Supervisor Vault</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Page Title & Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-800 border border-amber-400">
              <Sliders className="w-4 h-4 text-amber-700" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Master Lemari & Laci Brankas (Khusus Supervisor)
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Otorisasi Khusus
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Pusat konfigurasi lemari khazanah, penambahan/penghapusan kompartemen laci, serta pengaturan besaran layout grid slot
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCabinetForm({
                name: cabinet?.name || 'Lemari Khazanah Emas Utama LT-01',
                brand: cabinet?.brand || 'Chubbsafes Europa Grade V (EN 1143-1)',
                location: cabinet?.location || 'Ruang Khazanah Vault Lt. 1, Pegadaian CP Kramat Raya',
                antennaModel: cabinet?.antennaModel || 'MARS-4AT Multi-Antenna Multiplexer',
                frequency: cabinet?.frequency || 'UHF 920-925 MHz (EPC Gen2)',
              });
              setCabinetModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Edit Data Lemari</span>
          </button>

          <button
            type="button"
            onClick={() => setAddDrawerModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#008ba3] hover:bg-[#00758a] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Tambah Laci Baru</span>
          </button>
        </div>
      </div>

      {/* Guide Banner: Cara Mengubah Layout & Besaran Slot */}
      <div className="bg-sky-50/80 rounded-xl border border-sky-200 p-4 space-y-2.5 text-xs text-sky-950 shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-sm text-[#00758a]">
          <Info className="w-4 h-4" />
          <span>Panduan Supervisor: Cara Mengubah Besaran & Layout Slot Laci</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] leading-relaxed">
          <div className="bg-white/80 p-3 rounded-lg border border-sky-200/60 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#008ba3] text-white flex items-center justify-center text-[10px]">1</span>
              Pilih Laci & Klik Ubah Kapasitas
            </span>
            <p className="text-slate-600">
              Pilih kompartemen laci di bawah, lalu klik tombol <strong>&quot;Ubah Layout &amp; Kapasitas&quot;</strong>.
            </p>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-sky-200/60 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#008ba3] text-white flex items-center justify-center text-[10px]">2</span>
              Pilih Preset atau Atur Baris × Kolom
            </span>
            <p className="text-slate-600">
              Gunakan preset cepat (<strong>12, 16, 20, atau 24 Slot</strong>) atau isi manual jumlah Baris dan Kolom grid slot sesuai kebutuhan fisik laci.
            </p>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-sky-200/60 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#008ba3] text-white flex items-center justify-center text-[10px]">3</span>
              Simpan & Sinkronisasi Otomatis
            </span>
            <p className="text-slate-600">
              Klik Simpan. Peta visual parkiran mall, form transaksi Inbound, dan penomoran RFID otomatis tersinkronisasi seketika.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: MASTER LEMARI (CABINET) CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">{cabinet?.name || 'Lemari Khazanah LT-01'}</h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-[#008ba3] border border-sky-200">
                  {cabinet?.id || 'LT-01'}
                </span>
                <span className="font-semibold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ● {cabinet?.status || 'ONLINE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{cabinet?.location || 'Ruang Khazanah Vault Lt. 1'}</span>
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Standar Fisik & Keamanan</span>
            <span className="font-semibold text-slate-800">{cabinet?.brand || 'Chubbsafes Europa Grade V'}</span>
          </div>
        </div>

        {/* 4 Metrics for Cabinet */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px] font-medium block">Total Kompartemen Laci:</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-slate-900">{drawers.length}</span>
              <span className="text-[10px] text-slate-500">Laci Aktif</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px] font-medium block">Total Kapasitas Slot:</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-slate-900">{totalSlotsAcrossVault}</span>
              <span className="text-[10px] text-slate-500">Slot Brankas</span>
            </div>
          </div>

          <div className="p-3 bg-sky-50/70 rounded-lg border border-sky-200">
            <span className="text-[#008ba3] text-[11px] font-medium block">Slot Terisi Emas Aktif:</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-[#008ba3]">{totalOccupiedSlots}</span>
              <span className="text-[10px] text-slate-600">keping emas</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
            <span className="text-emerald-700 text-[11px] font-medium block">Slot Kosong (Bebas):</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-emerald-700">{totalFreeSlots}</span>
              <span className="text-[10px] text-emerald-800 font-semibold">Siap Inbound</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MASTER LACI (DRAWERS) LIST & CAPACITY CONTROLS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#008ba3]" />
              <span>Daftar Kompartemen Laci & Konfigurasi Slot</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Setiap laci memiliki pengaturan besaran baris, kolom, dan kapasitas slot independen
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            Menampilkan {drawers.length} Laci
          </span>
        </div>

        {/* Drawers Grid Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {drawers.map((d) => {
            const drawerItems = items.filter(
              (it) =>
                (it.systemDrawerId === d.id || it.drawerId === d.id) &&
                it.status !== 'DITEBUS' &&
                it.status !== 'RELOKASI_KELUAR' &&
                it.status !== 'RECONCILED_VIRT'
            );

            const pendingTrx = transactions.filter(
              (t) =>
                t.targetDrawerId === d.id &&
                (t.status === 'PENDING_APPROVAL' || t.status === 'APPROVED')
            );

            const occupiedCount = drawerItems.length;
            const reservedCount = pendingTrx.length;
            const availableCount = Math.max(0, (d.totalCapacity || 12) - occupiedCount - reservedCount);
            const cols = d.cols || 4;
            const rows = d.rows || 3;
            const totalCap = d.totalCapacity || 12;

            return (
              <div
                key={d.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                {/* Drawer Card Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold bg-[#0f233a] text-white px-2 py-0.5 rounded">
                        {d.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs">{d.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{d.category || 'Emas Batangan'}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDrawer({ ...d });
                        setEditDrawerModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                      title="Edit Nama / Kategori Laci"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteDrawer(d.id)}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        occupiedCount > 0
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-rose-500 hover:bg-rose-100 hover:text-rose-700'
                      }`}
                      title={
                        occupiedCount > 0
                          ? `Tidak dapat menghapus laci karena masih ada ${occupiedCount} emas di dalamnya`
                          : 'Hapus laci kosong ini'
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Capacity & Grid Info */}
                <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Layout:</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {rows} Baris × {cols} Kolom
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[#008ba3]">{occupiedCount} Terisi</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono font-bold text-emerald-700">{availableCount} Kosong</span>
                  </div>
                </div>

                {/* Visual Grid Preview */}
                <div className="p-4 flex-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex justify-between items-center">
                    <span>Matriks Slot Laci ({totalCap} Slot)</span>
                    <span className="font-mono text-slate-500">Prefix: {d.slotsPrefix || `${d.id}-S`}</span>
                  </div>
                  <div
                    className="grid gap-1.5"
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                  >
                    {Array.from({ length: totalCap }, (_, i) => {
                      const slotNum = String(i + 1).padStart(2, '0');
                      const sId = `${d.slotsPrefix || `${d.id}-S`}${slotNum}`;
                      const itemInSlot = drawerItems.find((it) => it.slotId === sId);
                      const resInSlot = pendingTrx.find((t) => t.targetSlotId === sId);

                      let cellBg = 'bg-emerald-50/90 border-emerald-300 text-emerald-900 hover:bg-emerald-100';
                      let dotColor = 'bg-emerald-500';
                      let titleText = `Slot ${sId}: KOSONG (Siap dialokasikan)`;

                      if (itemInSlot) {
                        cellBg = 'bg-sky-50 border-sky-300 text-sky-950 font-bold';
                        dotColor = 'bg-[#008ba3]';
                        titleText = `Slot ${sId}: Terisi ${itemInSlot.brand} (${itemInSlot.id}) - Nasabah: ${itemInSlot.customer?.name || '-'}`;
                      } else if (resInSlot) {
                        cellBg = 'bg-amber-50 border-amber-300 text-amber-900 font-bold';
                        dotColor = 'bg-amber-500';
                        titleText = `Slot ${sId}: RESERVED (${resInSlot.id})`;
                      }

                      return (
                        <div
                          key={sId}
                          title={titleText}
                          className={`p-1 rounded border text-center transition-all flex flex-col items-center justify-center min-h-[38px] ${cellBg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} mb-0.5`} />
                          <span className="font-mono text-[9px] font-bold leading-tight">
                            S{slotNum}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    Kapasitas: {totalCap} Slot
                  </span>
                  <button
                    type="button"
                    onClick={() => openDrawerCapacityModal(d.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-900" />
                    <span>Ubah Besaran &amp; Layout Slot</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: EDIT DATA LEMARI */}
      {cabinetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-[#0f233a] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm">Edit Informasi Master Lemari Khazanah</h3>
              </div>
              <button
                onClick={() => setCabinetModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCabinet} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lemari Brankas:</label>
                <input
                  type="text"
                  required
                  value={cabinetForm.name}
                  onChange={(e) => setCabinetForm({ ...cabinetForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Merek & Sertifikasi Fisik:</label>
                <input
                  type="text"
                  value={cabinetForm.brand}
                  onChange={(e) => setCabinetForm({ ...cabinetForm, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lokasi Fisik Ruang Khazanah:</label>
                <input
                  type="text"
                  value={cabinetForm.location}
                  onChange={(e) => setCabinetForm({ ...cabinetForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Model Reader & Antena RFID:</label>
                <input
                  type="text"
                  value={cabinetForm.antennaModel}
                  onChange={(e) => setCabinetForm({ ...cabinetForm, antennaModel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCabinetModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#008ba3] hover:bg-[#00758a] text-white font-bold cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH LACI BARU */}
      {addDrawerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-[#0f233a] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Tambah Kompartemen Laci Baru</h3>
              </div>
              <button
                onClick={() => setAddDrawerModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDrawer} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kode Laci:</label>
                  <input
                    type="text"
                    required
                    value={addDrawerForm.id}
                    onChange={(e) => {
                      const idVal = e.target.value.toUpperCase();
                      setAddDrawerForm({
                        ...addDrawerForm,
                        id: idVal,
                        slotsPrefix: `${idVal}-S`,
                      });
                    }}
                    placeholder="Contoh: L04"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prefix Slot:</label>
                  <input
                    type="text"
                    required
                    value={addDrawerForm.slotsPrefix}
                    onChange={(e) => setAddDrawerForm({ ...addDrawerForm, slotsPrefix: e.target.value })}
                    placeholder="Contoh: L04-S"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Deskriptif Laci:</label>
                <input
                  type="text"
                  required
                  value={addDrawerForm.name}
                  onChange={(e) => setAddDrawerForm({ ...addDrawerForm, name: e.target.value })}
                  placeholder="Contoh: Laci 04 (Koleksi Emas Perhiasan)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kategori Isi Emas:</label>
                <input
                  type="text"
                  value={addDrawerForm.category}
                  onChange={(e) => setAddDrawerForm({ ...addDrawerForm, category: e.target.value })}
                  placeholder="Contoh: Antam / UBS / Galeri24 10g - 50g"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
                />
              </div>

              {/* Grid Settings for New Drawer */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-800 block text-[11px]">
                  Kapasitas Slot &amp; Ukuran Grid Awal:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Total Slot</label>
                    <input
                      type="number"
                      min="2"
                      max="48"
                      value={addDrawerForm.totalCapacity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 12;
                        const r = Math.ceil(Math.sqrt(val));
                        const c = Math.ceil(val / r);
                        setAddDrawerForm({
                          ...addDrawerForm,
                          totalCapacity: val,
                          rows: r,
                          cols: c,
                        });
                      }}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-mono font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Baris</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={addDrawerForm.rows}
                      onChange={(e) => setAddDrawerForm({ ...addDrawerForm, rows: parseInt(e.target.value, 10) || 3 })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Kolom</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={addDrawerForm.cols}
                      onChange={(e) => setAddDrawerForm({ ...addDrawerForm, cols: parseInt(e.target.value, 10) || 4 })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAddDrawerModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  + Tambahkan Laci
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT NAMA / KATEGORI LACI */}
      {editDrawerModalOpen && editingDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-[#0f233a] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm">Edit Data Laci {editingDrawer.id}</h3>
              </div>
              <button
                onClick={() => setEditDrawerModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditDrawer} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Kompartemen Laci:</label>
                <input
                  type="text"
                  required
                  value={editingDrawer.name}
                  onChange={(e) => setEditingDrawer({ ...editingDrawer, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kategori Isi Emas:</label>
                <input
                  type="text"
                  value={editingDrawer.category}
                  onChange={(e) => setEditingDrawer({ ...editingDrawer, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00b4d8]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditDrawerModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#008ba3] hover:bg-[#00758a] text-white font-bold cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
