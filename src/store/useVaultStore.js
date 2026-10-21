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
      // Active View Routing
      activeView: 'dashboard', // 'dashboard' | 'lemari-laci' | 'inventory' | 'stock-opname' | 'approval' | 'alert' | 'audit-trail' | 'laporan'
      setActiveView: (view) => set({ activeView: view }),

      // RBAC Role: 'PETUGAS' | 'SUPERVISOR' | 'SPI'
      currentRole: 'PETUGAS',
      setCurrentRole: (role) => {
        set({ currentRole: role });
        get().addToast(
          `Peran aktif beralih ke: ${
            role === 'PETUGAS'
              ? 'Petugas Vault'
              : role === 'SUPERVISOR'
              ? 'Supervisor Vault (Hak Approval Aktif)'
              : 'SPI (Auditor Pengawas / Read-Only)'
          }`,
          'info'
        );
      },

      // Floating Toast Notifications
      toasts: [],
      addToast: (message, type = 'info') => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }],
        }));
        setTimeout(() => {
          get().removeToast(id);
        }, 4000);
      },
      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      // -------------------------------------------------------------
      // 1. DUAL-STATE DATA ENGINE
      // - systemDrawerId: Lokasi resmi catatan buku/sistem (contoh: 'L01')
      // - physicalDrawerId: Lokasi fisik aktual saat ini (tempat antena mendeteksi)
      // - isPhysicallyPresent: Boolean (apakah tag fisiknya berada di dalam lemari atau di luar)
      // - status: 'TERBACA' | 'MISPLACED' | 'MISSING' | 'RECONCILED_VIRT'
      // -------------------------------------------------------------
      items: INITIAL_ITEMS.map((item) => ({
        ...item,
        systemDrawerId: item.drawerId, // catatan sistem
        physicalDrawerId: item.drawerId, // deteksi antena fisik
        isPhysicallyPresent: true, // ada di dalam lemari
        drawerId: item.drawerId, // backward-compat accessor
        status: 'TERBACA',
      })),

      selectedDrawer: 'L01',
      setSelectedDrawer: (drawerId) => set({ selectedDrawer: drawerId }),

      // Mode Interaksi Fisik (Sandbox toggle pada halaman Lemari & Laci)
      physicalInteractionMode: false,
      togglePhysicalInteractionMode: () =>
        set((s) => ({ physicalInteractionMode: !s.physicalInteractionMode })),

      // Core Collections
      rfidLogs: INITIAL_RFID_LOGS,
      alerts: INITIAL_ALERTS,
      transfers: INITIAL_TRANSFERS,
      kpi: INITIAL_KPI,
      beritaAcaraList: [],

      // -------------------------------------------------------------
      // 4. AUDIT TRAIL PERSISTENCE
      // Format: { id, timestamp, action, actor, details, status }
      // -------------------------------------------------------------
      auditTrails: [
        {
          id: 'AUD-001',
          timestamp: '20/10/2026 09:45:01',
          action: 'SIKLUS_BACA_RFID',
          actor: 'system:reader-mars4at',
          details: 'Pindai otomatis lemari LT-01: 39 tag terbaca normal (0 selisih)',
          status: 'BERHASIL',
        },
        {
          id: 'AUD-002',
          timestamp: '20/10/2026 10:00:01',
          action: 'SIKLUS_BACA_RFID',
          actor: 'system:reader-mars4at',
          details: 'Pindai otomatis lemari LT-01: 39 tag terbaca normal (0 selisih)',
          status: 'BERHASIL',
        },
        {
          id: 'AUD-003',
          timestamp: '20/10/2026 10:14:56',
          action: 'VERIFIKASI_LACI',
          actor: 'system:reader-mars4at',
          details: 'Laci L01 terbaca 5 tag cocok dengan sistem',
          status: 'BERHASIL',
        },
      ],

      addAuditTrail: (action, details, status = 'BERHASIL') => {
        const timestamp = new Date().toLocaleString('id-ID', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        const id = `AUD-${Date.now().toString().slice(-5)}`;
        const newEntry = {
          id,
          timestamp,
          action,
          actor: 'petugas:vault01',
          details,
          status,
        };
        set({ auditTrails: [newEntry, ...get().auditTrails].slice(0, 50) });
      },

      // Reader & Scan Hardware Status
      readerStatus: 'ONLINE',
      readDuration: '± 4 detik',
      lastScanTime: '10:15:02',
      isScanning: false,
      autoScan: false,

      // Modal Dialog States
      classificationModalOpen: false,
      selectedClassificationType: null,
      selectedAlertItem: null,
      beritaAcaraModalOpen: false,
      transferModalOpen: false,
      transferTargetItem: null,

      setClassificationModalOpen: (open, type = null, item = null) =>
        set({
          classificationModalOpen: open,
          selectedClassificationType: type,
          selectedAlertItem: item || get().selectedAlertItem,
        }),

      setBeritaAcaraModalOpen: (open) => set({ beritaAcaraModalOpen: open }),

      setTransferModalOpen: (open, item = null) =>
        set({ transferModalOpen: open, transferTargetItem: item }),

      // -------------------------------------------------------------
      // 2. REKONSILIASI OTOMATIS: runScanCycle()
      // Membandingkan systemDrawerId vs physicalDrawerId & isPhysicallyPresent
      // -------------------------------------------------------------
      runScanCycle: () => {
        set({ isScanning: true });

        const timeStr = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        const currentItems = [...get().items];
        const currentTransfers = [...get().transfers];
        const currentAlerts = [...get().alerts];
        const newLogs = [];

        let totalRead = 0;
        let totalSelisih = 0;

        const updatedItems = currentItems.map((item) => {
          // Kasus (d): Selisih / Missing
          // Item memiliki systemDrawerId, tetapi isPhysicallyPresent == false tanpa transaksi outbound
          if (!item.isPhysicallyPresent) {
            totalSelisih++;

            const existingAlert = currentAlerts.find(
              (a) => a.itemId === item.id && a.type === 'SELISIH' && a.status === 'OPEN'
            );

            if (!existingAlert) {
              const alertId = `ALT-${Date.now().toString().slice(-4)}`;
              currentAlerts.unshift({
                id: alertId,
                type: 'SELISIH',
                title: `LT-01/${item.systemDrawerId} · ${item.id} tidak terbaca · ${timeStr.slice(0, 5)}`,
                timestamp: timeStr,
                cabinet: 'LT-01',
                drawer: item.systemDrawerId,
                itemId: item.id,
                itemBrand: item.brand,
                status: 'OPEN',
                recipient: 'supervisor.vault & SPI',
              });

              newLogs.unshift({
                id: `scan-alert-${Date.now()}-${item.id}`,
                time: timeStr,
                title: 'Alert selisih dibuat',
                detail: `LT-01/${item.systemDrawerId} · ${item.id} tidak terbaca tanpa mutasi outbound`,
                type: 'alert',
                color: 'red',
              });

              get().addAuditTrail(
                'ALERT_SELISIH_TERDETEKSI',
                `Item ${item.id} (${item.brand}) di ${item.systemDrawerId} tidak terbaca oleh antena reader`,
                'PERINGATAN'
              );
            }

            return {
              ...item,
              status: 'MISSING',
            };
          }

          // Kasus (b) & (c): Posisi fisik berbeda dari catatan sistem
          if (item.physicalDrawerId !== item.systemDrawerId) {
            // Cek apakah ada dokumen transfer APPROVED untuk item ini ke laci fisik tujuan
            const matchingApprovedTrf = currentTransfers.find(
              (t) =>
                t.tagId === item.id &&
                t.targetDrawerId === item.physicalDrawerId &&
                (t.status === 'APPROVED' || t.status === 'VERIFIED')
            );

            // Kasus (b): Transfer Sah (Approved)
            if (matchingApprovedTrf) {
              matchingApprovedTrf.status = 'VERIFIED';
              matchingApprovedTrf.detectTime = timeStr;

              newLogs.unshift({
                id: `scan-verif-${Date.now()}-${item.id}`,
                time: timeStr,
                title: 'Lokasi terverifikasi',
                detail: `${item.id} · ${item.physicalDrawerId} · cocok ${matchingApprovedTrf.id}`,
                type: 'verified',
                color: 'green',
              });
              newLogs.unshift({
                id: `scan-in-${Date.now()}-${item.id}`,
                time: timeStr,
                title: `Tag masuk ${item.physicalDrawerId}`,
                detail: `${item.id} · ${item.systemDrawerId} → ${item.physicalDrawerId}`,
                type: 'in',
                color: 'blue',
              });
              newLogs.unshift({
                id: `scan-out-${Date.now()}-${item.id}`,
                time: timeStr,
                title: `Tag keluar ${item.systemDrawerId}`,
                detail: `${item.id} · Pindah dengan dokumen ${matchingApprovedTrf.id}`,
                type: 'out',
                color: 'blue',
              });

              get().addAuditTrail(
                'MUTASI_DIVERIFIKASI_RFID',
                `Transfer ${matchingApprovedTrf.id}: ${item.id} resmi diperbarui ke ${item.physicalDrawerId}`,
                'BERHASIL'
              );

              totalRead++;
              return {
                ...item,
                systemDrawerId: item.physicalDrawerId, // Sistem otomatis memperbarui systemDrawerId
                drawerId: item.physicalDrawerId,
                status: 'TERBACA',
                lastTransferred: {
                  from: item.systemDrawerId,
                  to: item.physicalDrawerId,
                  transferId: matchingApprovedTrf.id,
                },
              };
            } else {
              // Kasus (c): Misplaced (Pindah Tanpa Dokumen Approved)
              const existingMisplacedAlert = currentAlerts.find(
                (a) => a.itemId === item.id && a.type === 'MISPLACED' && a.status === 'OPEN'
              );

              if (!existingMisplacedAlert) {
                currentAlerts.unshift({
                  id: `ALT-MSP-${Date.now().toString().slice(-4)}`,
                  type: 'MISPLACED',
                  title: `LT-01/${item.physicalDrawerId} · ${item.id} berpindah tanpa dokumen transfer`,
                  timestamp: timeStr,
                  cabinet: 'LT-01',
                  drawer: item.physicalDrawerId,
                  itemId: item.id,
                  itemBrand: item.brand,
                  status: 'OPEN',
                  recipient: 'supervisor.vault',
                });

                newLogs.unshift({
                  id: `scan-msp-${Date.now()}-${item.id}`,
                  time: timeStr,
                  title: 'Alert MISPLACED dibuat',
                  detail: `${item.id} terdeteksi di ${item.physicalDrawerId} tanpa dokumen approved`,
                  type: 'alert',
                  color: 'orange',
                });

                get().addAuditTrail(
                  'ALERT_MISPLACED',
                  `Item ${item.id} (${item.brand}) terdeteksi di laci ${item.physicalDrawerId} tanpa dokumen approved`,
                  'PERINGATAN'
                );
              }

              totalRead++;
              return {
                ...item,
                status: 'MISPLACED',
              };
            }
          }

          // Kasus (a): Normal
          // physicalDrawerId == systemDrawerId dan isPhysicallyPresent == true
          totalRead++;
          return {
            ...item,
            status: 'TERBACA',
          };
        });

        // Log penyelesaian siklus
        newLogs.unshift({
          id: `scan-done-${Date.now()}`,
          time: timeStr,
          title: 'Siklus baca selesai',
          detail: `LT-01 · 12 laci · ${totalRead} tag terbaca · ${totalSelisih} selisih`,
          type: totalSelisih > 0 ? 'cycle-selisih' : 'cycle-done',
          color: totalSelisih > 0 ? 'orange' : 'green',
        });

        // Update KPI
        const newKpi = {
          ...get().kpi,
          readLastCycle: 1248 - (currentItems.length - totalRead),
          openDifference: totalSelisih,
          accuracy: totalSelisih === 0 ? '100%' : '99,92%',
        };

        set({
          items: updatedItems,
          transfers: currentTransfers,
          alerts: currentAlerts,
          rfidLogs: [...newLogs, ...get().rfidLogs].slice(0, 30),
          lastScanTime: timeStr,
          isScanning: false,
          kpi: newKpi,
        });

        if (totalSelisih > 0) {
          get().addToast(`Siklus pindai RFID selesai: Terdeteksi ${totalSelisih} selisih fisik!`, 'error');
        } else {
          get().addToast(`Siklus pindai RFID selesai: ${totalRead} tag terbaca 100% normal`, 'success');
        }
      },

      // Alias for backward compat
      runRfidScan: () => get().runScanCycle(),

      // -------------------------------------------------------------
      // 3. SANDBOX DRAWER INTERACTION (Physical Mover & Visibility Toggle)
      // -------------------------------------------------------------
      // Memindahkan fisik item dari satu laci ke laci lain
      movePhysicalItem: (itemId, targetDrawerId) => {
        const item = get().items.find((i) => i.id === itemId);
        const prevDrawer = item?.physicalDrawerId || item?.systemDrawerId;

        const updatedItems = get().items.map((it) =>
          it.id === itemId
            ? { ...it, physicalDrawerId: targetDrawerId, isPhysicallyPresent: true }
            : it
        );

        get().addAuditTrail(
          'PEMINDAHAN_FISIK_ITEM',
          `Petugas memindahkan fisik tag ${itemId} dari ${prevDrawer} ke ${targetDrawerId} (Sandbox)`,
          'INFO'
        );

        get().addToast(`Fisik ${itemId} dipindahkan ke laci ${targetDrawerId} (Sandbox)`, 'info');

        set({ items: updatedItems });
      },

      // Toggle fisik item: Ada di laci vs Dikeluarkan / Disembunyikan (simulasi pencurian/kehilangan fisik)
      togglePhysicalPresence: (itemId) => {
        const item = get().items.find((i) => i.id === itemId);
        if (!item) return;

        const nextState = !item.isPhysicallyPresent;
        const updatedItems = get().items.map((it) =>
          it.id === itemId ? { ...it, isPhysicallyPresent: nextState } : it
        );

        get().addAuditTrail(
          nextState ? 'KEMBALIKAN_FISIK_ITEM' : 'SEMBUNYIKAN_FISIK_ITEM',
          nextState
            ? `Item ${itemId} dimasukkan kembali ke laci fisik ${item.physicalDrawerId}`
            : `Item ${itemId} diambil dari laci fisik ${item.physicalDrawerId} tanpa dokumen`,
          nextState ? 'INFO' : 'PERINGATAN'
        );

        get().addToast(
          nextState
            ? `Tag ${itemId} dikembalikan ke laci fisik`
            : `Tag ${itemId} diambil dari laci fisik (Simulasi Hilang)`,
          nextState ? 'info' : 'warning'
        );

        set({ items: updatedItems });
      },

      removePhysicalItem: (itemId) => {
        const updatedItems = get().items.map((it) =>
          it.id === itemId ? { ...it, isPhysicallyPresent: false } : it
        );
        set({ items: updatedItems });
      },

      restorePhysicalItem: (itemId, originalDrawerId) => {
        const updatedItems = get().items.map((it) =>
          it.id === itemId
            ? {
                ...it,
                physicalDrawerId: originalDrawerId || it.systemDrawerId,
                isPhysicallyPresent: true,
              }
            : it
        );
        set({ items: updatedItems });
      },

      // -------------------------------------------------------------
      // OPERASIONAL: REQUEST TRANSFER
      // -------------------------------------------------------------
      requestTransfer: (itemId, targetDrawer, reason = 'Rotasi penataan laci operasional') => {
        const item = get().items.find((i) => i.id === itemId);
        if (!item) return;

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = String(get().transfers.length + 42).padStart(4, '0');
        const transferNumber = `TRF-${year}-${month}-${count}`;
        const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const newTransfer = {
          id: transferNumber,
          tagId: item.id,
          itemDesc: `${item.brand} · ${item.purity} · ${item.sbg}`,
          sourceDrawer: `1-S05-R01-${item.systemDrawerId}`,
          targetDrawer: `1-S05-R01-${targetDrawer}`,
          sourceDrawerId: item.systemDrawerId,
          targetDrawerId: targetDrawer,
          approvedBy: null,
          requestedBy: 'petugas.vault01',
          requestTime: timeStr,
          detectTime: null,
          status: 'PENDING',
          reason,
        };

        const newLog = {
          id: `trf-req-${Date.now()}`,
          time: timeStr,
          title: 'Pengajuan transfer laci',
          detail: `${transferNumber} · ${item.id} (${item.systemDrawerId} → ${targetDrawer}) · ${newTransfer.requestedBy}`,
          type: 'request',
          color: 'blue',
        };

        get().addAuditTrail(
          'PENGAJUAN_TRANSFER',
          `Pengajuan dokumen ${transferNumber}: ${item.id} dari ${item.systemDrawerId} ke ${targetDrawer}`,
          'PENDING'
        );

        set({
          transfers: [newTransfer, ...get().transfers],
          rfidLogs: [newLog, ...get().rfidLogs],
          transferModalOpen: false,
          transferTargetItem: null,
        });

        get().addToast(`Pengajuan mutasi ${transferNumber} berhasil dibuat`, 'info');
      },

      // -------------------------------------------------------------
      // OPERASIONAL: APPROVAL TRANSFER
      // -------------------------------------------------------------
      approveTransfer: (transferId) => {
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        let approvedTransfer = null;
        const updatedTransfers = get().transfers.map((trf) => {
          if (trf.id === transferId) {
            approvedTransfer = {
              ...trf,
              status: 'APPROVED',
              approvedBy: 'supervisor.vault',
              approvedTime: timeStr,
            };
            return approvedTransfer;
          }
          return trf;
        });

        if (!approvedTransfer) return;

        const newLog = {
          id: `trf-app-${Date.now()}`,
          time: timeStr,
          title: 'Transfer disetujui',
          detail: `${approvedTransfer.id} · ${approvedTransfer.approvedBy} · Siap dipindahkan fisik`,
          type: 'approval',
          color: 'blue',
        };

        get().addAuditTrail(
          'PERSETUJUAN_MUTASI',
          `Dokumen ${approvedTransfer.id} disetujui oleh supervisor.vault untuk tag ${approvedTransfer.tagId}`,
          'BERHASIL'
        );

        set({
          transfers: updatedTransfers,
          rfidLogs: [newLog, ...get().rfidLogs],
        });

        get().addToast(`Dokumen ${approvedTransfer.id} disetujui oleh Supervisor Vault`, 'success');
      },

      rejectTransfer: (transferId) => {
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const updatedTransfers = get().transfers.map((trf) =>
          trf.id === transferId
            ? { ...trf, status: 'REJECTED', approvedBy: 'supervisor.vault', approvedTime: timeStr }
            : trf
        );

        get().addAuditTrail(
          'PENOLAKAN_MUTASI',
          `Dokumen transfer ${transferId} ditolak oleh supervisor.vault`,
          'DITOLAK'
        );

        set({
          transfers: updatedTransfers,
          rfidLogs: [
            {
              id: `trf-rej-${Date.now()}`,
              time: timeStr,
              title: 'Transfer ditolak',
              detail: `${transferId} · Ditolak oleh supervisor.vault`,
              type: 'reject',
              color: 'red',
            },
            ...get().rfidLogs,
          ],
        });

        get().addToast(`Dokumen ${transferId} ditolak oleh Supervisor Vault`, 'warning');
      },

      // -------------------------------------------------------------
      // KLASIFIKASI SELISIH
      // -------------------------------------------------------------
      classifySelisih: (type, notes = '') => {
        const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const targetItem = get().selectedAlertItem || get().items.find((i) => i.status === 'MISSING') || get().items[0];

        let targetAlertStatus = `TERKLASIFIKASI: ${type}`;
        if (type === 'MISPLACED') {
          targetAlertStatus = 'TERKLASIFIKASI: MISPLACED (Koreksi Mutasi Lokasi)';
        } else if (type === 'MISSING') {
          targetAlertStatus = 'TERKLASIFIKASI: MISSING (Posting ke VIRT/OPNAME-DIFF)';
        } else if (type === 'UNEXPECTED') {
          targetAlertStatus = 'TERKLASIFIKASI: UNEXPECTED (Verifikasi Tag Nasabah)';
        }

        const updatedAlerts = get().alerts.map((alt) => {
          if (alt.itemId === targetItem?.id) {
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
          detail: `LT-01/${targetItem?.systemDrawerId || targetItem?.drawerId} · ${targetItem?.id} ${notes ? `— Catatan: ${notes}` : ''}`,
          type: 'classification',
          color: type === 'MISPLACED' ? 'blue' : type === 'MISSING' ? 'red' : 'orange',
        };

        get().addAuditTrail(
          'KLASIFIKASI_SELISIH',
          `Tag ${targetItem?.id} diklasifikasikan sebagai ${type}. Catatan: ${notes || '-'}`,
          'BERHASIL'
        );

        set({
          alerts: updatedAlerts,
          rfidLogs: [newLog, ...get().rfidLogs],
          classificationModalOpen: false,
        });
      },

      // -------------------------------------------------------------
      // BERITA ACARA & REKONSILIASI
      // -------------------------------------------------------------
      createBeritaAcara: (baData) => {
        const targetItem = get().selectedAlertItem || get().items.find((i) => i.status === 'MISSING') || {
          id: 'E0040024',
          brand: 'Galeri24 5 g',
          systemDrawerId: 'L05',
          drawerId: 'L05',
        };

        const id = `BA-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
        const timestamp = new Date().toLocaleString('id-ID');

        const newBA = {
          id,
          date: timestamp,
          itemId: targetItem.id,
          itemBrand: targetItem.brand,
          drawerId: targetItem.systemDrawerId || targetItem.drawerId,
          officer: baData.officer || 'petugas.vault01',
          witness: baData.witness || 'supervisor.vault',
          findings: baData.findings || `Item ${targetItem.brand} (${targetItem.id}) tidak ditemukan pada fisik laci ${targetItem.systemDrawerId || targetItem.drawerId} setelah 3x verifikasi scanner.`,
          postingAccount: 'VIRT/OPNAME-DIFF',
          status: 'DITERBITKAN & TEREKONSILIASI',
        };

        const newLog = {
          id: `ba-${Date.now()}`,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          title: 'Berita Acara Diterbitkan',
          detail: `No: ${id} · Akun: VIRT/OPNAME-DIFF · ${targetItem.id} direkonsiliasi`,
          type: 'ba',
          color: 'green',
        };

        // Update alert status to resolved
        const updatedAlerts = get().alerts.map((alt) => {
          if (alt.itemId === targetItem.id) {
            return {
              ...alt,
              status: `RESOLVED (${id} - VIRT/OPNAME-DIFF)`,
              resolvedBaNumber: id,
            };
          }
          return alt;
        });

        // Set item reconciled / out of drawer
        const updatedItems = get().items.map((it) => {
          if (it.id === targetItem.id) {
            return {
              ...it,
              status: 'RECONCILED_VIRT',
            };
          }
          return it;
        });

        get().addAuditTrail(
          'PENERBITAN_BERITA_ACARA',
          `Penerbitan ${id}: ${targetItem.id} diposting ke akun virtual VIRT/OPNAME-DIFF`,
          'BERHASIL'
        );

        set({
          beritaAcaraList: [newBA, ...get().beritaAcaraList],
          alerts: updatedAlerts,
          items: updatedItems,
          rfidLogs: [newLog, ...get().rfidLogs],
          beritaAcaraModalOpen: false,
          kpi: {
            ...get().kpi,
            openDifference: Math.max(0, get().kpi.openDifference - 1),
          },
        });

        get().addToast(`Berita Acara ${id} berhasil diterbitkan & saldo direkonsiliasi`, 'success');
      },

      // Otorisasi & Penutupan Temuan Audit oleh SPI
      closeBeritaAcara: (baId) => {
        const timestamp = new Date().toLocaleString('id-ID');
        const updatedList = get().beritaAcaraList.map((ba) => {
          if (ba.id === baId) {
            return {
              ...ba,
              status: 'DITUTUP & DISETUJUI SPI',
              closedAt: timestamp,
              closedBy: 'auditor.spi01',
            };
          }
          return ba;
        });

        get().addAuditTrail(
          'PENUTUPAN_TEMUAN_SPI',
          `Dokumen Berita Acara ${baId} resmi diotorisasi & ditutup oleh auditor.spi01`,
          'BERHASIL'
        );

        set({ beritaAcaraList: updatedList });
        get().addToast(`Temuan ${baId} resmi diotorisasi & ditutup oleh SPI`, 'success');
      },

      toggleAutoScan: () => set((s) => ({ autoScan: !s.autoScan })),

      // Reset Demo Data ke Initial Seeds
      resetToDefault: () => {
        set({
          activeView: 'dashboard',
          items: INITIAL_ITEMS.map((item) => ({
            ...item,
            systemDrawerId: item.drawerId,
            physicalDrawerId: item.drawerId,
            isPhysicallyPresent: true,
            drawerId: item.drawerId,
            status: 'TERBACA',
          })),
          selectedDrawer: 'L01',
          rfidLogs: INITIAL_RFID_LOGS,
          alerts: INITIAL_ALERTS,
          transfers: INITIAL_TRANSFERS,
          kpi: INITIAL_KPI,
          beritaAcaraList: [],
          autoScan: false,
          physicalInteractionMode: false,
          lastScanTime: '10:15:02',
          classificationModalOpen: false,
          beritaAcaraModalOpen: false,
          transferModalOpen: false,
          transferTargetItem: null,
          selectedAlertItem: null,
          auditTrails: [
            {
              id: 'AUD-001',
              timestamp: '20/10/2026 09:45:01',
              action: 'SIKLUS_BACA_RFID',
              actor: 'system:reader-mars4at',
              details: 'Pindai otomatis lemari LT-01: 39 tag terbaca normal (0 selisih)',
              status: 'BERHASIL',
            },
          ],
        });
      },
    }),
    {
      name: 'unotek_vault_poc_v1',
    }
  )
);
