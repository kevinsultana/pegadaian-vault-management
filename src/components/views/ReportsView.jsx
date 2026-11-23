'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import {
  FileText,
  Printer,
  ClipboardList,
  X,
  CheckCircle2,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export default function ReportsView() {
  const {
    beritaAcaraList,
    items,
    lastScanTime,
    currentRole,
    closeBeritaAcara,
  } = useVaultStore();

  const [selectedPrintBA, setSelectedPrintBA] = useState(null);

  const readableCount = items.filter((i) => i.isPhysicallyPresent).length;
  const missingCount = items.filter((i) => !i.isPhysicallyPresent).length;
  const accuracy = ((readableCount / items.length) * 100).toFixed(2) + '%';

  const isSpiRole = currentRole === 'SPI' || currentRole.includes('SPI');

  const handlePrint = (ba) => {
    setSelectedPrintBA(ba);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-5">
      {/* Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Laporan & Rekapitulasi Audit Vault
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekapitulasi Stock Opname harian, statistik akurasi fisik emas, dan arsip Berita Acara Rekonsiliasi (BA-DIFF)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isSpiRole && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              SPI AUDIT MODE AKTIF
            </span>
          )}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f233a] hover:bg-[#162d48] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-300" />
            <span>Cetak Ringkasan Eksekutif</span>
          </button>
        </div>
      </div>

      {/* Row 1: Stock Opname Summary Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-sky-700" />
            <h3 className="text-xs font-bold text-slate-800">
              Rekapitulasi Stock Opname Lemari LT-01 (Siklus Baca Terakhir {lastScanTime})
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Akurasi LT-01: {accuracy}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px]">Total Item Terdaftar</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-1">{items.length}</p>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
            <span className="text-emerald-800 text-[11px]">Tag Terbaca Fisik</span>
            <p className="text-xl font-bold font-mono text-emerald-700 mt-1">{readableCount}</p>
          </div>

          <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200">
            <span className="text-rose-800 text-[11px]">Selisih Terbuka</span>
            <p className="text-xl font-bold font-mono text-rose-700 mt-1">{missingCount}</p>
          </div>

          <div className="p-3 bg-sky-50/60 rounded-lg border border-sky-200">
            <span className="text-sky-800 text-[11px]">Berita Acara Diterbitkan</span>
            <p className="text-xl font-bold font-mono text-sky-700 mt-1">{beritaAcaraList.length}</p>
          </div>
        </div>
      </div>

      {/* Row 2: Tabel Daftar Dokumen Berita Acara (BA-DIFF) */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-rose-700" />
            <h3 className="text-xs font-bold text-slate-800">
              Daftar Berita Acara Rekonsiliasi (BA-DIFF)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Total: {beritaAcaraList.length} berkas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold">
                <th className="pb-2.5 font-mono">No. Berita Acara</th>
                <th className="pb-2.5">Tanggal Penerbitan</th>
                <th className="pb-2.5">Tag & Objek Barang</th>
                <th className="pb-2.5">Laci</th>
                <th className="pb-2.5">Akun Penyesuaian</th>
                <th className="pb-2.5">Status Audit SPI</th>
                <th className="pb-2.5">Petugas / Saksi</th>
                <th className="pb-2.5 text-right">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {beritaAcaraList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans italic">
                    Belum ada Berita Acara yang diterbitkan. Jika ada selisih di menu Lemari & Laci, klik [Buat Berita Acara].
                  </td>
                </tr>
              ) : (
                beritaAcaraList.map((ba) => {
                  const isClosedBySpi = ba.status === 'DITUTUP & DISETUJUI SPI';

                  return (
                    <tr key={ba.id} className="hover:bg-slate-50/70">
                      <td className="py-3 font-bold text-slate-900">{ba.id}</td>
                      <td className="py-3 text-slate-600 font-sans text-[11px] whitespace-nowrap">
                        {ba.date}
                      </td>
                      <td className="py-3 font-sans">
                        <span className="font-mono font-bold text-slate-800">{ba.itemId}</span>
                        <p className="text-[11px] text-slate-500">{ba.itemBrand}</p>
                      </td>
                      <td className="py-3 font-bold text-slate-700">{ba.drawerId}</td>
                      <td className="py-3 font-sans">
                        {/* Requirement 4: Tampilkan badge 'POSTED TO VIRT/OPNAME-DIFF' */}
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          POSTED TO VIRT/OPNAME-DIFF
                        </span>
                      </td>
                      <td className="py-3 font-sans">
                        {isClosedBySpi ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>DITUTUP & DISETUJUI SPI</span>
                            </span>
                            {ba.closedBy && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Oleh {ba.closedBy} · {ba.closedAt}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            TERBIT (MENUNGGU SPI)
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-sans text-slate-600 text-[11px]">
                        <div>{ba.officer}</div>
                        <span className="text-[10px] text-slate-400">
                          Saksi: {ba.witness}
                        </span>
                      </td>
                      <td className="py-3 text-right font-sans">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Requirement 4: Tombol aksi [Otorisasi & Tutup Temuan] jika role aktif SPI */}
                          {isSpiRole && !isClosedBySpi && (
                            <button
                              onClick={() => closeBeritaAcara(ba.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs transition-colors cursor-pointer"
                              title="Otorisasi sah dan tutup temuan audit ini sebagai auditor SPI"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-100" />
                              <span>Otorisasi & Tutup Temuan</span>
                            </button>
                          )}

                          {!isSpiRole && !isClosedBySpi && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded"
                              title="Ganti role di Header menjadi SPI untuk mengotorisasi"
                            >
                              <Lock className="w-3 h-3" />
                              <span>Perlu Role SPI</span>
                            </span>
                          )}

                          {/* Tombol Cetak / Print PDF */}
                          <button
                            onClick={() => handlePrint(ba)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#0f233a] hover:bg-[#162d48] text-white rounded-md shadow-xs transition-colors cursor-pointer"
                            title="Cetak format lembar resmi"
                          >
                            <Printer className="w-3 h-3 text-cyan-300" />
                            <span>Cetak PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PRINT PREVIEW LEMBAR RESMI BERITA ACARA (Visible on screen and optimized for @media print) */}
      {selectedPrintBA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-8 text-slate-900 print:shadow-none print:border-none print:max-w-none print:w-full print:p-6 space-y-6">
            {/* Action Bar (hidden in print) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <span className="font-bold text-xs text-slate-500">
                Pratinjau Cetak Berita Acara
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#0f233a] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sekarang</span>
                </button>
                <button
                  onClick={() => setSelectedPrintBA(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* KOP RESMI PERUSAHAAN */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
              <div>
                <h1 className="text-base font-black tracking-wider uppercase text-slate-900">
                  PT PEGADAIAN (PERSERO)
                </h1>
                <p className="text-xs text-slate-600 font-semibold">
                  DIVISI LOGISTIK & PENGELOLAAN VAULT EMAS
                </p>
                <p className="text-[10px] text-slate-500">
                  Sistem Otomasi RFID UNOTEK • Vault WH-505 Jakarta
                </p>
              </div>
              <div className="text-right font-mono text-xs">
                <p className="font-bold text-slate-900">KODE FORM: BA-VAULT-04</p>
                <p className="text-[10px] text-slate-500">
                  Klasifikasi: RAHASIA / INTERNAL
                </p>
              </div>
            </div>

            {/* JUDUL DOKUMEN */}
            <div className="text-center py-2">
              <h2 className="text-sm font-bold uppercase tracking-wide underline underline-offset-4">
                BERITA ACARA REKONSILIASI SELISIH INVENTORI FISIK (BA-DIFF)
              </h2>
              <p className="text-xs font-mono text-slate-600 mt-1">
                Nomor: {selectedPrintBA.id}
              </p>
            </div>

            {/* NARASI PERNYATAAN */}
            <div className="text-xs space-y-3 leading-relaxed text-slate-800">
              <p>
                Pada hari ini, tanggal <strong>{selectedPrintBA.date}</strong>, telah dilakukan pemeriksaan fisik menyeluruh dan pembacaan antena sensor RFID MARS-4AT pada lemari penyimpanan emas{' '}
                <strong>LT-01</strong>, dengan hasil sebagai berikut:
              </p>

              <div className="bg-slate-50 p-3.5 rounded border border-slate-200 font-mono text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">Tag RFID / Kode Keping:</span>
                  <span className="font-bold text-slate-900">{selectedPrintBA.itemId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">Spesifikasi Barang:</span>
                  <span className="font-bold text-slate-900">{selectedPrintBA.itemBrand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">Posisi Laci Terdaftar:</span>
                  <span className="font-bold text-slate-900">{selectedPrintBA.drawerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">Akun Rekonsiliasi Virtual:</span>
                  <span className="font-bold text-rose-700">
                    {selectedPrintBA.postingAccount || 'VIRT/OPNAME-DIFF'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-slate-600">Status Audit:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedPrintBA.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-800 mb-1">
                  Catatan Hasil Pemeriksaan Lapangan:
                </p>
                <p className="p-3 bg-white border border-slate-200 rounded text-slate-700 italic text-[11px]">
                  &quot;{selectedPrintBA.findings}&quot;
                </p>
              </div>

              <p className="text-[11px] text-slate-600 pt-2">
                Demikian Berita Acara ini dibuat dengan sebenarnya dan disahkan secara digital oleh pejabat terkait untuk keperluan penyesuaian akun pembukuan dan audit kepatuhan.
              </p>
            </div>

            {/* KOLOM TANDA TANGAN PEJABAT */}
            <div className="grid grid-cols-3 gap-4 pt-8 text-center text-xs">
              <div className="space-y-12">
                <p className="font-semibold text-slate-600">Petugas Pemeriksa</p>
                <div>
                  <p className="font-bold underline text-slate-900">{selectedPrintBA.officer}</p>
                  <p className="text-[10px] text-slate-500">Staf Operasional Vault</p>
                </div>
              </div>

              <div className="space-y-12">
                <p className="font-semibold text-slate-600">Saksi / Supervisor</p>
                <div>
                  <p className="font-bold underline text-slate-900">{selectedPrintBA.witness}</p>
                  <p className="text-[10px] text-slate-500">Supervisor Pengelolaan Vault</p>
                </div>
              </div>

              <div className="space-y-12">
                <p className="font-semibold text-slate-600">Mengetahui (SPI)</p>
                <div>
                  <p className="font-bold underline text-slate-900">
                    {selectedPrintBA.closedBy || 'auditor.spi01'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {selectedPrintBA.closedAt ? `Disahkan: ${selectedPrintBA.closedAt}` : 'Satuan Pengawas Internal'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
