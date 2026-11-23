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

// Verifikasi keping emas masuk inventori aktif di slot L01-S06
const addedItem = useVaultStore.getState().items.find((i) => i.id === 'E0049901');
assert(addedItem !== undefined, 'Keping emas E0049901 resmi masuk ke inventori aktif brankas');
assert(addedItem?.slotId === 'L01-S07', `Posisi slot keping emas tercatat di ${addedItem?.slotId}`);
assert(addedItem?.customer?.name === 'Rian Pratama', `Data pemilik emas tercatat: ${addedItem?.customer?.name}`);
assert(addedItem?.history?.length >= 3, `Jejak audit keping emas memiliki ${addedItem?.history?.length} tahapan kronologis`);

// 3. Alur Outbound (Penebusan Emas & Slot Otomatis Kosong Kembali)
console.log('\n--- TEST 5: Alur Outbound Penebusan Emas (Slot Otomatis Menjadi Hijau / Kosong) ---');
useVaultStore.getState().setCurrentRole('STAFF_BISNIS');

// Ambil item yang ada di L02 slot S02 (E0040017)
const itemToOutbound = useVaultStore.getState().items.find((i) => i.id === 'E0040017');
const previousSlot = itemToOutbound.slotId; // L02-S02
assert(previousSlot === 'L02-S02', `Keping ${itemToOutbound.id} saat ini berada di slot ${previousSlot}`);

// Staff Bisnis ajukan Outbound
const outboundSuccess = useVaultStore.getState().createOutboundTransaction({
  itemId: itemToOutbound.id,
  reason: 'Pelunasan Tebus Akad Gadai SBG-00160',
  notes: 'Kwitansi kasir KWT-7712 lunas',
});
assert(outboundSuccess === true, 'Staff Bisnis berhasil mengajukan permohonan Outbound penebusan emas');

const outTrx = useVaultStore.getState().transactions.find((t) => t.itemId === itemToOutbound.id && t.type === 'OUTBOUND');
assert(outTrx?.status === 'PENDING_APPROVAL', `Status pengajuan Outbound: ${outTrx?.status}`);

// Supervisor Approve Outbound
useVaultStore.getState().setCurrentRole('SUPERVISOR');
useVaultStore.getState().approveTransaction(outTrx.id);
assert(useVaultStore.getState().transactions.find((t) => t.id === outTrx.id).status === 'APPROVED', 'Supervisor berhasil meng-approve permohonan Outbound');

// Petugas Eksekusi Pengambilan Fisik Outbound
useVaultStore.getState().setCurrentRole('PETUGAS');
useVaultStore.getState().executeWorkOrder(outTrx.id);

const finalOutTrx = useVaultStore.getState().transactions.find((t) => t.id === outTrx.id);
assert(finalOutTrx.status === 'COMPLETED', `SPK Outbound selesai dieksekusi: Status ${finalOutTrx.status}`);

const outboundedItem = useVaultStore.getState().items.find((i) => i.id === itemToOutbound.id);
assert(outboundedItem.status === 'DITEBUS', `Status keping emas diperbarui menjadi: ${outboundedItem.status}`);
assert(outboundedItem.slotId === null, `Slot laci lama ${previousSlot} telah dilepas (slotId == null)`);

// Verifikasi bahwa slot L02-S03 sekarang bebas/kosong untuk digunakan item lain!
const itemStillInSlot = useVaultStore.getState().items.find(
  (it) => it.slotId === previousSlot && it.status !== 'DITEBUS'
);
assert(itemStillInSlot === undefined, `SLOT ${previousSlot} SEKARANG KOSONG (HIJAU) dan siap dialokasikan untuk Inbound baru!`);

// 4. Kustomisasi Kapasitas Dinamis Laci (Khusus Supervisor)
console.log('\n--- TEST 6: Pengaturan Kapasitas Dinamis Per Laci (Khusus Supervisor) ---');
useVaultStore.getState().setCurrentRole('STAFF_BISNIS');
const updateByStaff = useVaultStore.getState().updateDrawerCapacity('L01', { totalCapacity: 16, rows: 4, cols: 4, slotsPrefix: 'L01-S' });
assert(updateByStaff === false, 'Staff Bisnis DITOLAK mengubah kapasitas laci (Hanya hak Supervisor)');

useVaultStore.getState().setCurrentRole('SUPERVISOR');
const updateBySpv = useVaultStore.getState().updateDrawerCapacity('L01', { totalCapacity: 16, rows: 4, cols: 4, slotsPrefix: 'L01-S' });
assert(updateBySpv === true, 'Supervisor BERHASIL mengubah kapasitas laci L01 menjadi 16 slot (Grid 4x4)');

const updatedDrawerL01 = useVaultStore.getState().drawers.find((d) => d.id === 'L01');
assert(updatedDrawerL01.totalCapacity === 16, `Kapasitas laci L01 sekarang dinamis: ${updatedDrawerL01.totalCapacity} slot`);

// 5. SPI Audit Trail & Laporan
console.log('\n--- TEST 7: Pengawasan Audit SPI (Read-Only & Integritas Audit Trail) ---');
useVaultStore.getState().setCurrentRole('SPI');
const currentAudits = useVaultStore.getState().auditTrails;
assert(currentAudits.length > 5, `Audit trail mencatat seluruh transaksi digital secara otomatis (Total log: ${currentAudits.length})`);
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
