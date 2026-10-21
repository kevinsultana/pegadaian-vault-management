// Data Contract & Initial Seeds for UNOTEK Vault Management System PoC
// Reference: Dokumen PoC Pegadaian & Gambar 13, 14, 15, 16

export const INITIAL_ITEMS = [
  // Laci L01: 5 item (Total 46.00g)
  { id: 'E0040001', brand: 'ANTAM 10 g', weight: 10.0, purity: '999,9', sbg: 'SBG-00121', cabinetId: 'LT-01', drawerId: 'L01', status: 'TERBACA' },
  { id: 'E0040002', brand: 'ANTAM 5 g', weight: 5.0, purity: '999,9', sbg: 'SBG-00121', cabinetId: 'LT-01', drawerId: 'L01', status: 'TERBACA' },
  { id: 'E0040007', brand: 'UBS 25 g', weight: 25.0, purity: '999,9', sbg: 'SBG-00134', cabinetId: 'LT-01', drawerId: 'L01', status: 'TERBACA' },
  { id: 'E0040011', brand: 'Galeri24 10 g', weight: 10.0, purity: '999,9', sbg: 'SBG-00140', cabinetId: 'LT-01', drawerId: 'L01', status: 'TERBACA' },
  { id: 'E0040015', brand: 'ANTAM 2 g', weight: 2.0, purity: '999,9', sbg: 'SBG-00152', cabinetId: 'LT-01', drawerId: 'L01', status: 'TERBACA' },

  // Laci L02: 3 item
  { id: 'E0040003', brand: 'ANTAM 10 g', weight: 10.0, purity: '999,9', sbg: 'SBG-00122', cabinetId: 'LT-01', drawerId: 'L02', status: 'TERBACA' },
  { id: 'E0040004', brand: 'Galeri24 5 g', weight: 5.0, purity: '999,9', sbg: 'SBG-00125', cabinetId: 'LT-01', drawerId: 'L02', status: 'TERBACA' },
  { id: 'E0040005', brand: 'UBS 10 g', weight: 10.0, purity: '999,9', sbg: 'SBG-00128', cabinetId: 'LT-01', drawerId: 'L02', status: 'TERBACA' },

  // Laci L03: 4 item
  { id: 'E0040006', brand: 'ANTAM 50 g', weight: 50.0, purity: '999,9', sbg: 'SBG-00130', cabinetId: 'LT-01', drawerId: 'L03', status: 'TERBACA' },
  { id: 'E0040008', brand: 'ANTAM 10 g', weight: 10.0, purity: '999,9', sbg: 'SBG-00135', cabinetId: 'LT-01', drawerId: 'L03', status: 'TERBACA' },
  { id: 'E0040009', brand: 'Galeri24 25 g', weight: 25.0, purity: '999,9', sbg: 'SBG-00137', cabinetId: 'LT-01', drawerId: 'L03', status: 'TERBACA' },
  { id: 'E0040010', brand: 'UBS 5 g', weight: 5.0, purity: '999,9', sbg: 'SBG-00139', cabinetId: 'LT-01', drawerId: 'L03', status: 'TERBACA' },

  // Laci L04: 6 item
  { id: 'E0040012', brand: 'ANTAM 1 g', weight: 1.0, purity: '999,9', sbg: 'SBG-00142', cabinetId: 'LT-01', drawerId: 'L04', status: 'TERBACA' },
  { id: 'E0040013', brand: 'ANTAM 2 g', weight: 2.0, purity: '999,9', sbg: 'SBG-00144', cabinetId: 'LT-01', drawerId: 'L04', status: 'TERBACA' },
  { id: 'E0040014', brand: 'Galeri24 5 g', weight: 5.0, purity: '999,9', sbg: 'SBG-00147', cabinetId: 'LT-01', drawerId: 'L04', status: 'TERBACA' },
  { id: 'E0040016', brand: 'UBS 10 g', weight: 10.0, purity: '999,9', sbg: 'SBG-00155', cabinetId: 'LT-01', drawerId: 'L04', status: 'TERBACA' },
  { id: 'E0040017', brand: 'ANTAM 5 g', weight: 5.0, purity: '999,9', sbg: 'SBG-00158', cabinetId: 'LT-01', drawerId: 'L04', status: 'TERBACA' },
  { id: 'E0040018', brand: 'ANTAM 10 g', weight: 10.0, purity: '999,9', sbg: 'SBG-00160', cabinetId: 'LT-01', drawerId: 'L04', status: 'TERBACA' },

  // Laci L05: 2 item -> ANTAM 10g (E0040021) & Galeri24 5g (E0040024)
  { id: 'E0040021', brand: 'ANTAM 10 g', weight: 10.0, purity: '999,9', sbg: 'SBG-00162', cabinetId: 'LT-01', drawerId: 'L05', status: 'TERBACA' },
  { id: 'E0040024', brand: 'Galeri24 5 g', weight: 5.0, purity: '999,9', sbg: 'SBG-00165', cabinetId: 'LT-01', drawerId: 'L05', status: 'TERBACA' },

  // Laci L06: 0 item (KOSONG)

  // Laci L07: 4 item
  { id: 'E0040025', brand: 'ANTAM 25 g', weight: 25.0, purity: '999,9', sbg: 'SBG-00168', cabinetId: 'LT-01', drawerId: 'L07', status: 'TERBACA' },
  { id: 'E0040026', brand: 'UBS 10 g', weight: 10.0, purity: '999,9', sbg: 'SBG-00170', cabinetId: 'LT-01', drawerId: 'L07', status: 'TERBACA' },
  { id: 'E0040027', brand: 'ANTAM 5 g', weight: 5.0, purity: '999,9', sbg: 'SBG-00173', cabinetId: 'LT-01', drawerId: 'L07', status: 'TERBACA' },
  { id: 'E0040028', brand: 'Galeri24 10 g', weight: 10.0, purity: '999,9', sbg: 'SBG-00175', cabinetId: 'LT-01', drawerId: 'L07', status: 'TERBACA' },

  // Laci L08: 5 item
  { id: 'E0040029', brand: 'ANTAM 50 g', weight: 50.0, purity: '999,9', sbg: 'SBG-00177', cabinetId: 'LT-01', drawerId: 'L08', status: 'TERBACA' },
  { id: 'E0040030', brand: 'ANTAM 10 g', weight: 10.0, purity: '999,9', sbg: 'SBG-00179', cabinetId: 'LT-01', drawerId: 'L08', status: 'TERBACA' },
  { id: 'E0040032', brand: 'UBS 25 g', weight: 25.0, purity: '999,9', sbg: 'SBG-00181', cabinetId: 'LT-01', drawerId: 'L08', status: 'TERBACA' },
  { id: 'E0040033', brand: 'Galeri24 5 g', weight: 5.0, purity: '999,9', sbg: 'SBG-00183', cabinetId: 'LT-01', drawerId: 'L08', status: 'TERBACA' },
  { id: 'E0040034', brand: 'ANTAM 2 g', weight: 2.0, purity: '999,9', sbg: 'SBG-00185', cabinetId: 'LT-01', drawerId: 'L08', status: 'TERBACA' },

  // Laci L09: 3 item
  { id: 'E0040035', brand: 'ANTAM 10 g', weight: 10.0, purity: '999,9', sbg: 'SBG-00187', cabinetId: 'LT-01', drawerId: 'L09', status: 'TERBACA' },
  { id: 'E0040036', brand: 'UBS 5 g', weight: 5.0, purity: '999,9', sbg: 'SBG-00189', cabinetId: 'LT-01', drawerId: 'L09', status: 'TERBACA' },
  { id: 'E0040037', brand: 'Galeri24 10 g', weight: 10.0, purity: '999,9', sbg: 'SBG-00191', cabinetId: 'LT-01', drawerId: 'L09', status: 'TERBACA' },

  // Laci L10: 6 item
  { id: 'E0040038', brand: 'ANTAM 100 g', weight: 100.0, purity: '999,9', sbg: 'SBG-00193', cabinetId: 'LT-01', drawerId: 'L10', status: 'TERBACA' },
  { id: 'E0040039', brand: 'ANTAM 50 g', weight: 50.0, purity: '999,9', sbg: 'SBG-00195', cabinetId: 'LT-01', drawerId: 'L10', status: 'TERBACA' },
  { id: 'E0040040', brand: 'UBS 10 g', weight: 10.0, purity: '999,9', sbg: 'SBG-00197', cabinetId: 'LT-01', drawerId: 'L10', status: 'TERBACA' },
  { id: 'E0040041', brand: 'Galeri24 5 g', weight: 5.0, purity: '999,9', sbg: 'SBG-00199', cabinetId: 'LT-01', drawerId: 'L10', status: 'TERBACA' },
  { id: 'E0040042', brand: 'ANTAM 5 g', weight: 5.0, purity: '999,9', sbg: 'SBG-00201', cabinetId: 'LT-01', drawerId: 'L10', status: 'TERBACA' },
  { id: 'E0040043', brand: 'ANTAM 1 g', weight: 1.0, purity: '999,9', sbg: 'SBG-00203', cabinetId: 'LT-01', drawerId: 'L10', status: 'TERBACA' },

  // Laci L11: 1 item
  { id: 'E0040031', brand: 'ANTAM 10 g', weight: 10.0, purity: '999,9', sbg: 'SBG-00205', cabinetId: 'LT-01', drawerId: 'L11', status: 'TERBACA' },

  // Laci L12: 0 item (KOSONG)
];

export const INITIAL_RFID_LOGS = [
  { id: '1', time: '10:15:02', title: 'Siklus baca selesai', detail: 'LT-01 · 12 laci · 39 tag · 0 selisih', type: 'cycle-done', color: 'green' },
  { id: '2', time: '10:14:58', title: 'Laci L11 terbaca', detail: '1 tag - E0040031', type: 'drawer-read', color: 'blue' },
  { id: '3', time: '10:14:57', title: 'Laci L10 terbaca', detail: '6 tag', type: 'drawer-read', color: 'blue' },
  { id: '4', time: '10:14:56', title: 'Laci L01 terbaca', detail: '5 tag - cocok dengan sistem', type: 'drawer-read', color: 'blue' },
  { id: '5', time: '10:00:01', title: 'Siklus baca selesai', detail: 'LT-01 · 39 tag · 0 selisih', type: 'cycle-done', color: 'green' },
  { id: '6', time: '09:45:01', title: 'Siklus baca selesai', detail: 'LT-01 · 39 tag · 0 selisih', type: 'cycle-done', color: 'green' },
];

export const INITIAL_ALERTS = [
  {
    id: 'ALT-01',
    type: 'SELISIH',
    title: 'LT-01/L05 · E0040024 tidak terbaca · 10:45',
    timestamp: '10:45:02',
    cabinet: 'LT-01',
    drawer: 'L05',
    itemId: 'E0040024',
    itemBrand: 'Galeri24 5 g',
    status: 'OPEN',
    recipient: 'supervisor.vault & SPI',
  },
  {
    id: 'ALT-02',
    type: 'APPROVAL',
    title: '2 pengeluaran menunggu dual approval',
    timestamp: '10:30:00',
    status: 'PENDING',
  },
  {
    id: 'ALT-03',
    type: 'INFO',
    title: 'Siklus baca LG-01, LG-02 normal · 0 selisih',
    timestamp: '10:15:00',
    status: 'INFO',
  },
];

export const INITIAL_TRANSFERS = [
  {
    id: 'TRF-2026-10-0042',
    tagId: 'E0040007',
    itemDesc: 'UBS 25 g · 999,9 · SBG-00134',
    sourceDrawer: '1-S05-R01-L01',
    targetDrawer: '1-S05-R01-L02',
    approvedBy: 'supervisor.vault',
    requestedBy: 'petugas.vault01',
    detectTime: '10:22:41',
    status: 'VERIFIED',
  },
];

export const INITIAL_KPI = {
  totalVaultItems: 1248,
  readLastCycle: 1247,
  openDifference: 1,
  accuracy: '99,92%',
  todayMutations: 42,
};
