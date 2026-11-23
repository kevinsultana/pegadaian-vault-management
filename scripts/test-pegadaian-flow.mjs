// scripts/test-pegadaian-flow.mjs
// Automated End-to-End Test for Pegadaian Vault Multi-Role Workflow

import { useVaultStore } from '../src/store/useVaultStore.js';

console.log('====================================================');
console.log('   PENGUJIAN ALUR OPERASIONAL PEGADAIN SMART VAULT  ');
console.log('====================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    testsFailed++;
  }
}

// 1. Reset state
console.log('--- TEST 1: Inisialisasi & Verifikasi Peran Default ---');
const store = useVaultStore.getState();
store.resetToDefault();

const initialRole = useVaultStore.getState().currentRole;
assert(initialRole === 'STAFF_BISNIS', `Default role saat web dibuka adalah STAFF_BISNIS (Aktual: ${initialRole})`);

const initialItems = useVaultStore.getState().items;
assert(initialItems.length === 10, `Total awal keping emas aktif di lemari LT-01 adalah 10 keping (Aktual: ${initialItems.length})`);

const initialDrawers = useVaultStore.getState().drawers;
assert(initialDrawers.length === 3, `Total kompartemen laci brankas adalah 3 (L01, L02, L03)`);

// 2. Alur Inbound (Staff Bisnis)
console.log('\n--- TEST 2: Alur Inbound (Staff Bisnis -> Supervisor -> Petugas) ---');
// Step 2.1: Staff Bisnis input transaksi Inbound
const inboundPayload = {
  tagId: 'E0049901',
  brand: 'ANTAM 10 g',
  weight: 10.0,
  purity: '999.9',
  sbg: 'SBG-26889',
  customer: {
    name: 'Rian Pratama',
    nik: '3171098765430001',
    phone: '0812-9988-7766',
    address: 'Jl. Kebon Sirih No. 5, Jakarta Pusat',
    loanAmount: 'Rp 11.500.000',
    loanType: 'KCA (Kredit Cepat Aman)',
  },
  targetDrawerId: 'L01',
  targetSlotId: 'L01-S07', // Slot kosong di L01
  reason: 'Akad Gadai Baru KCA SBG-26889',
};

const inboundSuccess = useVaultStore.getState().createInboundTransaction(inboundPayload);
assert(inboundSuccess === true, 'Staff Bisnis berhasil membuat permohonan Inbound untuk nasabah Rian Pratama');

const newTrx = useVaultStore.getState().transactions.find((t) => t.itemId === 'E0049901');
assert(newTrx !== undefined, `Transaksi baru terdaftar di sistem dengan ID: ${newTrx?.id}`);
assert(newTrx?.status === 'PENDING_APPROVAL', `Status transaksi awal adalah PENDING_APPROVAL (Aktual: ${newTrx?.status})`);
assert(newTrx?.targetSlotId === 'L01-S07', `Target slot terisi eksplisit: L01-S07`);

// Step 2.2: Dual Approval oleh Supervisor
console.log('\n--- TEST 3: Otorisasi & Dual Approval (Supervisor) ---');
// Non-supervisor tidak boleh approve
useVaultStore.getState().setCurrentRole('STAFF_BISNIS');
useVaultStore.getState().approveTransaction(newTrx.id);
assert(
  useVaultStore.getState().transactions.find((t) => t.id === newTrx.id).status === 'PENDING_APPROVAL',
  'Staff Bisnis DITOLAK saat mencoba meng-approve transaksi (Dual Control enforced)'
);

// Switch ke Supervisor & Approve
useVaultStore.getState().setCurrentRole('SUPERVISOR');
useVaultStore.getState().approveTransaction(newTrx.id);
const approvedTrx = useVaultStore.getState().transactions.find((t) => t.id === newTrx.id);
assert(approvedTrx.status === 'APPROVED', `Supervisor berhasil mengotorisasi dokumen: Status ${approvedTrx.status} (SPK Terbit)`);
assert(approvedTrx.approvedBy === 'supervisor.vault', `Dokumen ditandatangani digital oleh: ${approvedTrx.approvedBy}`);

// Step 2.3: Eksekusi Fisik oleh Petugas Vault
console.log('\n--- TEST 4: Eksekusi Perintah Kerja Fisik & Verifikasi RFID (Petugas Vault) ---');
// Non-petugas tidak boleh mengeksekusi SPK
useVaultStore.getState().setCurrentRole('STAFF_BISNIS');
useVaultStore.getState().executeWorkOrder(newTrx.id);
assert(
  useVaultStore.getState().transactions.find((t) => t.id === newTrx.id).status === 'APPROVED',
  'Staff Bisnis DITOLAK saat mencoba mengeksekusi SPK fisik (Segregation of Duties enforced)'
);

// Switch ke Petugas & Eksekusi
useVaultStore.getState().setCurrentRole('PETUGAS');
useVaultStore.getState().executeWorkOrder(newTrx.id);

const completedTrx = useVaultStore.getState().transactions.find((t) => t.id === newTrx.id);
assert(completedTrx.status === 'COMPLETED', `Petugas Vault berhasil mengeksekusi fisik: Status ${completedTrx.status}`);
assert(completedTrx.executedBy === 'petugas.vault01', `Dieksekusi fisik oleh: ${completedTrx.executedBy}`);

// Verifikasi keping emas masuk inventori aktif di slot L01-S07
const addedItem = useVaultStore.getState().items.find((i) => i.id === 'E0049901');
assert(addedItem !== undefined, 'Keping emas E0049901 resmi masuk ke inventori aktif brankas');
assert(addedItem?.slotId === 'L01-S07', `Posisi slot keping emas tercatat di ${addedItem?.slotId}`);
assert(addedItem?.customer?.name === 'Rian Pratama', `Data pemilik emas tercatat: ${addedItem?.customer?.name}`);
assert(addedItem?.history?.length >= 3, `Jejak audit keping emas memiliki ${addedItem?.history?.length} tahapan kronologis`);

// 3. Alur Outbound 1: Penebusan Nasabah (Slot Otomatis Menjadi Hijau / Kosong)
console.log('\n--- TEST 5: Alur Outbound Opsi 1 - Penebusan Nasabah (Slot Otomatis Kosong) ---');
useVaultStore.getState().setCurrentRole('STAFF_BISNIS');

// Ambil item yang ada di L02 slot S02 (E0040017)
const itemToTebus = useVaultStore.getState().items.find((i) => i.id === 'E0040017');
const slotToFree = itemToTebus.slotId; // L02-S02
assert(slotToFree === 'L02-S02', `Keping ${itemToTebus.id} saat ini berada di slot ${slotToFree}`);

// Staff Bisnis ajukan Outbound Tebus
const outboundTebusSuccess = useVaultStore.getState().createOutboundTransaction({
  itemId: itemToTebus.id,
  outboundCategory: 'TEBUS_NASABAH',
  reason: 'Pelunasan Tebus Akad Gadai SBG-00160',
  referenceNumber: 'KWT-7712',
  notes: 'Kwitansi kasir KWT-7712 lunas',
});
assert(outboundTebusSuccess === true, 'Staff Bisnis berhasil mengajukan Outbound Penebusan Nasabah');

const outTebusTrx = useVaultStore.getState().transactions.find(
  (t) => t.itemId === itemToTebus.id && t.type === 'OUTBOUND' && t.outboundCategory === 'TEBUS_NASABAH'
);
assert(outTebusTrx?.status === 'PENDING_APPROVAL', `Status pengajuan Outbound Tebus: ${outTebusTrx?.status}`);

// Supervisor Approve Outbound
useVaultStore.getState().setCurrentRole('SUPERVISOR');
useVaultStore.getState().approveTransaction(outTebusTrx.id);
assert(useVaultStore.getState().transactions.find((t) => t.id === outTebusTrx.id).status === 'APPROVED', 'Supervisor meng-approve Outbound Tebus');

// Petugas Eksekusi Pengambilan Fisik Outbound
useVaultStore.getState().setCurrentRole('PETUGAS');
useVaultStore.getState().executeWorkOrder(outTebusTrx.id);

const finalTebusTrx = useVaultStore.getState().transactions.find((t) => t.id === outTebusTrx.id);
assert(finalTebusTrx.status === 'COMPLETED', `SPK Outbound Tebus selesai dieksekusi: Status ${finalTebusTrx.status}`);

const tebusedItem = useVaultStore.getState().items.find((i) => i.id === itemToTebus.id);
assert(tebusedItem.status === 'DITEBUS', `Status keping emas diperbarui menjadi: ${tebusedItem.status}`);
assert(tebusedItem.slotId === null, `Slot laci lama ${slotToFree} telah dilepas (slotId == null)`);

// Verifikasi bahwa slot L02-S02 sekarang bebas/kosong
const itemInFreedSlot = useVaultStore.getState().items.find(
  (it) => it.slotId === slotToFree && it.status !== 'DITEBUS' && it.status !== 'RELOKASI_KELUAR'
);
assert(itemInFreedSlot === undefined, `SLOT ${slotToFree} SEKARANG KOSONG (HIJAU) dan siap dialokasikan kembali!`);

// 4. Alur Outbound 2: Relokasi Eksternal ke Cabang / Kanwil / Balai Lelang
console.log('\n--- TEST 6: Alur Outbound Opsi 2 - Relokasi Eksternal (Kirim ke Kanwil/Cabang Lain) ---');
useVaultStore.getState().setCurrentRole('STAFF_BISNIS');

// Ambil item lain (E0040011 di L01-S04)
const itemToRelocate = useVaultStore.getState().items.find((i) => i.id === 'E0040011');
const slotRelocate = itemToRelocate.slotId; // L01-S04
assert(slotRelocate === 'L01-S04', `Keping ${itemToRelocate.id} saat ini berada di slot ${slotRelocate}`);

const outboundRelokasiSuccess = useVaultStore.getState().createOutboundTransaction({
  itemId: itemToRelocate.id,
  outboundCategory: 'RELOKASI_EKSTERNAL',
  destinationLocation: 'Pegadaian Kantor Wilayah VIII (Jakarta Pusat)',
  referenceNumber: 'SJ-PGD/X/2026/099',
  notes: 'Pengiriman barang jaminan konsolidasi Kanwil',
});
assert(outboundRelokasiSuccess === true, 'Staff Bisnis berhasil mengajukan Outbound Relokasi Eksternal');

const outRelokasiTrx = useVaultStore.getState().transactions.find(
  (t) => t.itemId === itemToRelocate.id && t.type === 'OUTBOUND' && t.outboundCategory === 'RELOKASI_EKSTERNAL'
);
assert(outRelokasiTrx?.status === 'PENDING_APPROVAL', `Status pengajuan Relokasi: ${outRelokasiTrx?.status}`);
assert(outRelokasiTrx?.destinationLocation === 'Pegadaian Kantor Wilayah VIII (Jakarta Pusat)', 'Tujuan relokasi tercatat jelas');

// Supervisor Approve Relokasi
useVaultStore.getState().setCurrentRole('SUPERVISOR');
useVaultStore.getState().approveTransaction(outRelokasiTrx.id);
assert(useVaultStore.getState().transactions.find((t) => t.id === outRelokasiTrx.id).status === 'APPROVED', 'Supervisor meng-approve Outbound Relokasi');

// Petugas Eksekusi Pengambilan Fisik Relokasi
useVaultStore.getState().setCurrentRole('PETUGAS');
useVaultStore.getState().executeWorkOrder(outRelokasiTrx.id);

const finalRelokasiTrx = useVaultStore.getState().transactions.find((t) => t.id === outRelokasiTrx.id);
assert(finalRelokasiTrx.status === 'COMPLETED', `SPK Relokasi selesai dieksekusi: Status ${finalRelokasiTrx.status}`);

const relocatedItem = useVaultStore.getState().items.find((i) => i.id === itemToRelocate.id);
assert(relocatedItem.status === 'RELOKASI_KELUAR', `Status keping diperbarui menjadi RELOKASI_KELUAR (Aktual: ${relocatedItem.status})`);
assert(relocatedItem.slotId === null, `Slot laci ${slotRelocate} telah dilepas (slotId == null)`);

const itemInFreedRelocateSlot = useVaultStore.getState().items.find(
  (it) => it.slotId === slotRelocate && it.status !== 'DITEBUS' && it.status !== 'RELOKASI_KELUAR'
);
assert(itemInFreedRelocateSlot === undefined, `SLOT ${slotRelocate} SEKARANG KOSONG (HIJAU) setelah keping direlokasi keluar!`);

// 5. Alur Outbound 3: Mutasi Internal Laci (Pindah Slot/Laci Baru)
console.log('\n--- TEST 7: Alur Outbound Opsi 3 - Mutasi Internal Laci (Pindah Slot Baru) ---');
useVaultStore.getState().setCurrentRole('STAFF_BISNIS');

// Ambil item di L01 slot S05 (E0040015)
const itemToMutasi = useVaultStore.getState().items.find((i) => i.id === 'E0040015');
const sourceSlotMutasi = itemToMutasi.slotId; // L01-S05
// Pindahkan ke slot L02-S02 yang baru saja dikosongkan tadi!
const targetSlotMutasi = slotToFree; // L02-S02

const outboundMutasiSuccess = useVaultStore.getState().createOutboundTransaction({
  itemId: itemToMutasi.id,
  outboundCategory: 'MUTASI_INTERNAL',
  targetDrawerId: 'L02',
  targetSlotId: targetSlotMutasi,
  notes: 'Mutasi penataan slot laci antar kompartemen',
});
assert(outboundMutasiSuccess === true, `Staff Bisnis berhasil mengajukan Outbound Mutasi Internal ke slot ${targetSlotMutasi}`);

const outMutasiTrx = useVaultStore.getState().transactions.find(
  (t) => t.itemId === itemToMutasi.id && t.type === 'OUTBOUND' && t.outboundCategory === 'MUTASI_INTERNAL'
);
assert(outMutasiTrx?.status === 'PENDING_APPROVAL', `Status pengajuan Mutasi: ${outMutasiTrx?.status}`);
assert(outMutasiTrx?.targetSlotId === targetSlotMutasi, `Target slot mutasi internal: ${targetSlotMutasi}`);

// Supervisor Approve Mutasi
useVaultStore.getState().setCurrentRole('SUPERVISOR');
useVaultStore.getState().approveTransaction(outMutasiTrx.id);
assert(useVaultStore.getState().transactions.find((t) => t.id === outMutasiTrx.id).status === 'APPROVED', 'Supervisor meng-approve Outbound Mutasi');

// Petugas Eksekusi Pemindahan Fisik
useVaultStore.getState().setCurrentRole('PETUGAS');
useVaultStore.getState().executeWorkOrder(outMutasiTrx.id);

const finalMutasiTrx = useVaultStore.getState().transactions.find((t) => t.id === outMutasiTrx.id);
assert(finalMutasiTrx.status === 'COMPLETED', `SPK Mutasi selesai dieksekusi: Status ${finalMutasiTrx.status}`);

const mutatedItem = useVaultStore.getState().items.find((i) => i.id === itemToMutasi.id);
assert(mutatedItem.status === 'TERBACA', `Status keping tetap aktif TERBACA (Aktual: ${mutatedItem.status})`);
assert(mutatedItem.slotId === targetSlotMutasi, `Slot keping emas telah berpindah ke ${mutatedItem.slotId}`);
assert(mutatedItem.drawerId === 'L02', `Laci keping emas telah berpindah ke ${mutatedItem.drawerId}`);

// Verifikasi slot lama L01-S05 kini KOSONG
const itemInOldSourceSlot = useVaultStore.getState().items.find(
  (it) => it.slotId === sourceSlotMutasi && it.status !== 'DITEBUS' && it.status !== 'RELOKASI_KELUAR'
);
assert(itemInOldSourceSlot === undefined, `SLOT LAMA ${sourceSlotMutasi} SEKARANG KOSONG (HIJAU)!`);

// 6. Kustomisasi Kapasitas Dinamis Laci (Khusus Supervisor)
console.log('\n--- TEST 8: Pengaturan Kapasitas Dinamis Per Laci (Khusus Supervisor) ---');
useVaultStore.getState().setCurrentRole('STAFF_BISNIS');
const updateByStaff = useVaultStore.getState().updateDrawerCapacity('L01', { totalCapacity: 16, rows: 4, cols: 4, slotsPrefix: 'L01-S' });
assert(updateByStaff === false, 'Staff Bisnis DITOLAK mengubah kapasitas laci (Hanya hak Supervisor)');

useVaultStore.getState().setCurrentRole('SUPERVISOR');
const updateBySpv = useVaultStore.getState().updateDrawerCapacity('L01', { totalCapacity: 16, rows: 4, cols: 4, slotsPrefix: 'L01-S' });
assert(updateBySpv === true, 'Supervisor BERHASIL mengubah kapasitas laci L01 menjadi 16 slot (Grid 4x4)');

const updatedDrawerL01 = useVaultStore.getState().drawers.find((d) => d.id === 'L01');
assert(updatedDrawerL01.totalCapacity === 16, `Kapasitas laci L01 sekarang dinamis: ${updatedDrawerL01.totalCapacity} slot`);

// 7. SPI Audit Trail & Laporan
console.log('\n--- TEST 9: Pengawasan Audit SPI (Read-Only & Integritas Audit Trail) ---');
useVaultStore.getState().setCurrentRole('SPI');
const currentAudits = useVaultStore.getState().auditTrails;
assert(currentAudits.length >= 7, `Audit trail mencatat seluruh transaksi digital secara otomatis (Total log: ${currentAudits.length})`);
assert(useVaultStore.getState().currentRole === 'SPI', 'Peran aktif adalah SPI (Auditor Pengawas)');

console.log('\n====================================================');
console.log(`HASIL PENGETESAN ALUR: ${testsPassed} PASS, ${testsFailed} FAIL`);
if (testsFailed === 0) {
  console.log('STATUS: SELURUH ALUR OPERASIONAL PEGADAIAN 100% SUKSES!');
}
console.log('====================================================\n');

if (testsFailed > 0) {
  process.exit(1);
}
