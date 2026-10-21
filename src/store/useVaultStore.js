import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  INITIAL_ITEMS,
  INITIAL_RFID_LOGS,
  INITIAL_ALERTS,
  INITIAL_TRANSFERS,
  INITIAL_KPI,
} from '../constants/initialData';

export const useVaultStore = create(
  persist(
    (set, get) => ({
      // Active View
      activeView: 'dashboard', // 'dashboard' | 'lemari-laci' | 'inventory' | 'stock-opname' | 'approval' | 'alert' | 'audit-trail' | 'laporan'
      setActiveView: (view) => set({ activeView: view }),

      // Active Scenario ID
      scenarioId: 'UT-01', // 'UT-01' | 'UT-02' | 'UT-03' | 'UT-04' | 'UT-05'

      // Data Collections
      items: INITIAL_ITEMS,
      selectedDrawer: 'L01',
      setSelectedDrawer: (drawerId) => set({ selectedDrawer: drawerId }),

      rfidLogs: INITIAL_RFID_LOGS,
      alerts: INITIAL_ALERTS,
      transfers: INITIAL_TRANSFERS,
      kpi: INITIAL_KPI,

      // Berita Acara records
      beritaAcaraList: [],

      // Simulation Options
      readerStatus: 'ONLINE',
      readDuration: '± 4 detik',
      lastScanTime: '10:15:02',
      autoScan: false,

      // Modal Dialog States
      classificationModalOpen: false,
      selectedClassificationType: null, // 'MISPLACED' | 'MISSING' | 'UNEXPECTED'
      beritaAcaraModalOpen: false,

      setClassificationModalOpen: (open, type = null) =>
        set({ classificationModalOpen: open, selectedClassificationType: type }),

      setBeritaAcaraModalOpen: (open) => set({ beritaAcaraModalOpen: open }),

      // Unified Scenario Execution State Machine (UT-01 to UT-05)
      executeScenario: (scenId) => {
        if (scenId === 'UT-01') {
          // Normal Read: 39/39 tags, LT-01 online, 0 selisih
          set({
            scenarioId: 'UT-01',
            activeView: 'lemari-laci',
            selectedDrawer: 'L01',
            items: INITIAL_ITEMS.map((item) => ({ ...item, status: 'TERBACA' })),
            readerStatus: 'ONLINE',
            readDuration: '± 4 detik',
            lastScanTime: '10:15:02',
            rfidLogs: INITIAL_RFID_LOGS,
          });
        } else if (scenId === 'UT-02') {
          // Transfer Sah Dokumen: E0040007 from L01 to L02
          const updatedItems = INITIAL_ITEMS.map((item) => {
            if (item.id === 'E0040007') {
              return { ...item, drawerId: 'L02', status: 'TERBACA' };
            }
            return { ...item, status: 'TERBACA' };
          });

          const transferLogs = [
            { id: 'trf-1', time: '10:22:41', title: 'Lokasi terverifikasi', detail: 'E0040007 · L02 · cocok TRF-0042', type: 'verified', color: 'green' },
            { id: 'trf-2', time: '10:22:41', title: 'Tag masuk L02', detail: 'E0040007 · L02: 3 → 4 item', type: 'in', color: 'blue' },
            { id: 'trf-3', time: '10:22:37', title: 'Tag keluar L01', detail: 'E0040007 · L01: 5 → 4 item', type: 'out', color: 'blue' },
            { id: 'trf-4', time: '10:21:55', title: 'Transfer disetujui', detail: 'TRF-2026-10-0042 · supervisor.vault', type: 'approval', color: 'blue' },
            { id: 'trf-5', time: '10:21:30', title: 'Transfer diajukan', detail: 'TRF-0042 · L01 → L02 · petugas.vault01', type: 'request', color: 'blue' },
            ...INITIAL_RFID_LOGS.slice(0, 3),
          ];

          set({
            scenarioId: 'UT-02',
            activeView: 'lemari-laci',
            selectedDrawer: 'L01',
            items: updatedItems,
            readerStatus: 'ONLINE',
            readDuration: '± 4 detik',
            lastScanTime: '10:22:41',
            rfidLogs: transferLogs,
          });
        } else if (scenId === 'UT-03') {
          // Misplaced - Pindah Tanpa Dokumen: E0040007 di L02 tanpa transfer doc
          const updatedItems = INITIAL_ITEMS.map((item) => {
            if (item.id === 'E0040007') {
              return { ...item, drawerId: 'L02', status: 'MISPLACED' };
            }
            return { ...item, status: 'TERBACA' };
          });

          const misplacedLogs = [
            { id: 'msp-1', time: '10:25:10', title: 'Alert MISPLACED dibuat', detail: 'E0040007 terdeteksi di L02 tanpa dokumen mutasi', type: 'alert', color: 'orange' },
            { id: 'msp-2', time: '10:25:05', title: 'Tag tidak dikenal di L02', detail: 'E0040007 · Status: MISPLACED', type: 'in', color: 'orange' },
            ...INITIAL_RFID_LOGS.slice(0, 3),
          ];

          set({
            scenarioId: 'UT-03',
            activeView: 'lemari-laci',
            selectedDrawer: 'L02',
            items: updatedItems,
            readerStatus: 'ONLINE',
            lastScanTime: '10:25:10',
            rfidLogs: misplacedLogs,
          });
        } else if (scenId === 'UT-04') {
          // Selisih / Missing pada L05: E0040024 tidak terbaca
          const updatedItems = INITIAL_ITEMS.map((item) => {
            if (item.id === 'E0040024') {
              return { ...item, status: 'MISSING' };
            }
            return { ...item, status: 'TERBACA' };
          });

          const selisihLogs = [
            { id: 'sel-1', time: '10:45:02', title: 'Alert selisih dibuat', detail: 'LT-01/L05 · E0040024 tidak terbaca', type: 'alert', color: 'red' },
            { id: 'sel-2', time: '10:45:02', title: 'Siklus baca selesai', detail: 'LT-01 · 38 dari 39 tag terbaca', type: 'cycle-selisih', color: 'orange' },
            { id: 'sel-3', time: '10:45:03', title: 'Notifikasi terkirim', detail: 'supervisor.vault · SPI (email & dashboard)', type: 'notify', color: 'blue' },
            { id: 'sel-4', time: '10:30:02', title: 'Siklus baca selesai', detail: 'LT-01 · 39 tag · 0 selisih', type: 'cycle-done', color: 'green' },
            ...INITIAL_RFID_LOGS.slice(0, 2),
          ];

          set({
            scenarioId: 'UT-04',
            activeView: 'alert',
            selectedDrawer: 'L05',
            items: updatedItems,
            readerStatus: 'ONLINE',
            readDuration: '± 4 detik',
            lastScanTime: '10:45:02',
            rfidLogs: selisihLogs,
          });
        } else if (scenId === 'UT-05') {
          // Dashboard Overview
          set({
            scenarioId: 'UT-05',
            activeView: 'dashboard',
            lastScanTime: '10:45:02',
          });
        }
      },

      // Reset Demo Data
      resetToDefault: () => {
        set({
          activeView: 'dashboard',
          scenarioId: 'UT-01',
          items: INITIAL_ITEMS,
          selectedDrawer: 'L01',
          rfidLogs: INITIAL_RFID_LOGS,
          alerts: INITIAL_ALERTS,
          transfers: INITIAL_TRANSFERS,
          kpi: INITIAL_KPI,
          beritaAcaraList: [],
          autoScan: false,
          lastScanTime: '10:15:02',
          classificationModalOpen: false,
          beritaAcaraModalOpen: false,
        });
      },

      // 3-Way Classification (Misplaced, Missing, Unexpected)
      classifySelisih: (type, notes = '') => {
        const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        let targetAlertStatus = `TERKLASIFIKASI: ${type}`;
        if (type === 'MISPLACED') {
          targetAlertStatus = 'TERKLASIFIKASI: MISPLACED (Koreksi Mutasi Lokasi)';
        } else if (type === 'MISSING') {
          targetAlertStatus = 'TERKLASIFIKASI: MISSING (Posting ke VIRT/OPNAME-DIFF)';
        } else if (type === 'UNEXPECTED') {
          targetAlertStatus = 'TERKLASIFIKASI: UNEXPECTED (Verifikasi Tag Nasabah)';
        }

        const updatedAlerts = get().alerts.map((alt) => {
          if (alt.itemId === 'E0040024') {
            return {
              ...alt,
              status: targetAlertStatus,
              classification: type,
              notes,
              classifiedAt: timestamp,
            };
          }
          return alt;
        });

        const newLog = {
          id: `cls-${Date.now()}`,
          time: timestamp,
          title: `Selisih Terklasifikasi: ${type}`,
          detail: `LT-01/L05 · E0040024 ${notes ? `— Catatan: ${notes}` : ''}`,
          type: 'classification',
          color: type === 'MISPLACED' ? 'blue' : type === 'MISSING' ? 'red' : 'orange',
        };

        set({
          alerts: updatedAlerts,
          rfidLogs: [newLog, ...get().rfidLogs],
          classificationModalOpen: false,
        });
      },

      // Create Berita Acara
      createBeritaAcara: (baData) => {
        const id = `BA-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
        const timestamp = new Date().toLocaleString('id-ID');
        const newBA = {
          id,
          date: timestamp,
          officer: baData.officer || 'petugas.vault01',
          witness: baData.witness || 'supervisor.vault',
          findings: baData.findings || 'Item Galeri24 5g (E0040024) tidak ditemukan pada fisik laci L05 maupun kabinet LT-01 setelah 3x rescanning desktop reader.',
          postingAccount: 'VIRT/OPNAME-DIFF',
          status: 'DITERBITKAN & TEREKONSILIASI',
        };

        const newLog = {
          id: `ba-${Date.now()}`,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          title: 'Berita Acara Diterbitkan',
          detail: `No: ${id} · Akun: VIRT/OPNAME-DIFF · Disahkan`,
          type: 'ba',
          color: 'green',
        };

        // Also update alert
        const updatedAlerts = get().alerts.map((alt) => {
          if (alt.itemId === 'E0040024') {
            return {
              ...alt,
              status: `SELESAI (${id} - VIRT/OPNAME-DIFF)`,
            };
          }
          return alt;
        });

        set({
          beritaAcaraList: [newBA, ...get().beritaAcaraList],
          alerts: updatedAlerts,
          rfidLogs: [newLog, ...get().rfidLogs],
          beritaAcaraModalOpen: false,
        });
      },

      toggleAutoScan: () => set((s) => ({ autoScan: !s.autoScan })),
    }),
    {
      name: 'unotek_vault_poc_v1', // exact key as requested
    }
  )
);
