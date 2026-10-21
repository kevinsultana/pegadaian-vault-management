// Data Contract & Initial Seeds for UNOTEK Vault Management System PoC
// Spesifikasi PoC Tahap Awal: 1 Lemari (LT-01), 3 Laci (L01, L02, L03), Tepat 10 Keping Emas

export const INITIAL_ITEMS = [
  // L01 (5 item):
  { id: 'E0040001', brand: 'ANTAM 10 g', weight: 10.0, purity: '999.9', sbg: 'SBG-00121', cabinetId: 'LT-01', drawerId: 'L01', systemDrawerId: 'L01', physicalDrawerId: 'L01', isPhysicallyPresent: true, status: 'TERBACA' },
  { id: 'E0040002', brand: 'ANTAM 5 g', weight: 5.0, purity: '999.9', sbg: 'SBG-00121', cabinetId: 'LT-01', drawerId: 'L01', systemDrawerId: 'L01', physicalDrawerId: 'L01', isPhysicallyPresent: true, status: 'TERBACA' },
  { id: 'E0040007', brand: 'UBS 25 g', weight: 25.0, purity: '999.9', sbg: 'SBG-00134', cabinetId: 'LT-01', drawerId: 'L01', systemDrawerId: 'L01', physicalDrawerId: 'L01', isPhysicallyPresent: true, status: 'TERBACA' },
  { id: 'E0040011', brand: 'Galeri24 10 g', weight: 10.0, purity: '999.9', sbg: 'SBG-00140', cabinetId: 'LT-01', drawerId: 'L01', systemDrawerId: 'L01', physicalDrawerId: 'L01', isPhysicallyPresent: true, status: 'TERBACA' },
  { id: 'E0040015', brand: 'ANTAM 2 g', weight: 2.0, purity: '999.9', sbg: 'SBG-00152', cabinetId: 'LT-01', drawerId: 'L01', systemDrawerId: 'L01', physicalDrawerId: 'L01', isPhysicallyPresent: true, status: 'TERBACA' },

  // L02 (3 item):
  { id: 'E0040016', brand: 'ANTAM 5 g', weight: 5.0, purity: '999.9', sbg: 'SBG-00155', cabinetId: 'LT-01', drawerId: 'L02', systemDrawerId: 'L02', physicalDrawerId: 'L02', isPhysicallyPresent: true, status: 'TERBACA' },
  { id: 'E0040017', brand: 'UBS 10 g', weight: 10.0, purity: '999.9', sbg: 'SBG-00158', cabinetId: 'LT-01', drawerId: 'L02', systemDrawerId: 'L02', physicalDrawerId: 'L02', isPhysicallyPresent: true, status: 'TERBACA' },
  { id: 'E0040018', brand: 'Galeri24 2 g', weight: 2.0, purity: '999.9', sbg: 'SBG-00160', cabinetId: 'LT-01', drawerId: 'L02', systemDrawerId: 'L02', physicalDrawerId: 'L02', isPhysicallyPresent: true, status: 'TERBACA' },

  // L03 (2 item):
  { id: 'E0040023', brand: 'ANTAM 10 g', weight: 10.0, purity: '999.9', sbg: 'SBG-00170', cabinetId: 'LT-01', drawerId: 'L03', systemDrawerId: 'L03', physicalDrawerId: 'L03', isPhysicallyPresent: true, status: 'TERBACA' },
  { id: 'E0040024', brand: 'Galeri24 5 g', weight: 5.0, purity: '999.9', sbg: 'SBG-00175', cabinetId: 'LT-01', drawerId: 'L03', systemDrawerId: 'L03', physicalDrawerId: 'L03', isPhysicallyPresent: true, status: 'TERBACA' },
];

export const INITIAL_DRAWERS = [
  { id: 'L01', name: 'Laci 01', cabinetId: 'LT-01', status: 'TERBACA' },
  { id: 'L02', name: 'Laci 02', cabinetId: 'LT-01', status: 'TERBACA' },
  { id: 'L03', name: 'Laci 03', cabinetId: 'LT-01', status: 'TERBACA' },
];

export const INITIAL_RFID_LOGS = [
  { id: '1', time: '10:15:02', title: 'Siklus baca selesai', detail: 'LT-01 · 3 laci · 10 tag · 0 selisih', type: 'cycle-done', color: 'green' },
  { id: '2', time: '10:14:58', title: 'Laci L03 terbaca', detail: '2 tag - cocok dengan sistem', type: 'drawer-read', color: 'blue' },
  { id: '3', time: '10:14:57', title: 'Laci L02 terbaca', detail: '3 tag - cocok dengan sistem', type: 'drawer-read', color: 'blue' },
  { id: '4', time: '10:14:56', title: 'Laci L01 terbaca', detail: '5 tag - cocok dengan sistem', type: 'drawer-read', color: 'blue' },
  { id: '5', time: '10:00:01', title: 'Siklus baca selesai', detail: 'LT-01 · 3 laci · 10 tag · 0 selisih', type: 'cycle-done', color: 'green' },
  { id: '6', time: '09:45:01', title: 'Siklus baca selesai', detail: 'LT-01 · 3 laci · 10 tag · 0 selisih', type: 'cycle-done', color: 'green' },
];

export const INITIAL_ALERTS = [
  {
    id: 'ALT-01',
    type: 'SELISIH',
    title: 'LT-01/L03 · E0040024 tidak terbaca · 10:45',
    timestamp: '10:45:02',
    cabinet: 'LT-01',
    drawer: 'L03',
    itemId: 'E0040024',
    itemBrand: 'Galeri24 5 g',
    status: 'OPEN',
    recipient: 'supervisor.vault & SPI',
  },
  {
    id: 'ALT-02',
    type: 'APPROVAL',
    title: '1 mutasi inventori menunggu persetujuan supervisor',
    timestamp: '10:30:00',
    status: 'PENDING',
  },
];

export const INITIAL_TRANSFERS = [
  {
    id: 'TRF-2026-10-0042',
    tagId: 'E0040007',
    itemDesc: 'UBS 25 g · 999.9 · SBG-00134',
    sourceDrawer: '1-S05-R01-L01',
    targetDrawer: '1-S05-R01-L02',
    sourceDrawerId: 'L01',
    targetDrawerId: 'L02',
    approvedBy: 'supervisor.vault',
    requestedBy: 'petugas.vault01',
    detectTime: '10:22:41',
    status: 'VERIFIED',
  },
];

export const INITIAL_KPI = {
  totalVaultItems: 10,
  readLastCycle: 10,
  openDifference: 0,
  accuracy: '100.0%',
  todayMutations: 1,
};
