import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  INITIAL_ITEMS,
  INITIAL_DRAWERS,
  INITIAL_TRANSACTIONS,
  INITIAL_TRANSFERS,
  INITIAL_RFID_LOGS,
  INITIAL_ALERTS,
  INITIAL_KPI,
} from '../constants/initialData.js';

export const useVaultStore = create(
  persist(
    (set, get) => ({
      // Active View Routing
      activeView: 'dashboard',
      setActiveView: (view) => set({ activeView: view }),

      // -------------------------------------------------------------
      // RBAC: 'STAFF_BISNIS' (Default) | 'SUPERVISOR' | 'PETUGAS' | 'SPI'
      // -------------------------------------------------------------
      currentRole: 'STAFF_BISNIS',
      setCurrentRole: (role) => {
        set({ currentRole: role });
        const roleLabels = {
          STAFF_BISNIS: 'Staff Bisnis (Handling Transaksi & Slot Laci)',
          SUPERVISOR: 'Supervisor Vault (Otorisasi & Pengaturan Brankas)',
          PETUGAS: 'Petugas Vault (Eksekusi Perintah Kerja Fisik)',
          SPI: 'SPI (Auditor Pengawas / Read-Only Seluruh Sistem)',
        };
        get().addToast(`Peran aktif beralih ke: ${roleLabels[role] || role}`, 'info');
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
      // DRAWERS & DINAMIS KAPASITAS
      // -------------------------------------------------------------
      drawers: INITIAL_DRAWERS,
      selectedDrawer: 'L01',
      setSelectedDrawer: (drawerId) => set({ selectedDrawer: drawerId }),

      updateDrawerCapacity: (drawerId, { totalCapacity, rows, cols, slotsPrefix }) => {
        const role = get().currentRole;
        if (role !== 'SUPERVISOR') {
          get().addToast('Akses ditolak: Hanya Supervisor yang dapat mengubah kapasitas laci!', 'error');
          return false;
        }

        const updatedDrawers = get().drawers.map((d) => {
          if (d.id === drawerId) {
            return {
              ...d,
              totalCapacity: Number(totalCapacity) || d.totalCapacity,
              rows: Number(rows) || d.rows,
              cols: Number(cols) || d.cols,
              slotsPrefix: slotsPrefix || d.slotsPrefix,
            };
          }
          return d;
        });

        get().addAuditTrail(
          'KONFIGURASI_KAPASITAS_LACI',
          `Supervisor memperbarui kapasitas ${drawerId} menjadi ${totalCapacity} slot (${rows}x${cols})`,
          'BERHASIL'
        );

        set({ drawers: updatedDrawers, drawerCapacityModalOpen: false });
        get().addToast(`Kapasitas laci ${drawerId} berhasil diubah ke ${totalCapacity} slot!`, 'success');
        return true;
      },

      // -------------------------------------------------------------
      // INVENTORI KEPING EMAS (ITEMS)
      // -------------------------------------------------------------
      items: INITIAL_ITEMS.map((item) => ({
        ...item,
        systemDrawerId: item.drawerId,
        physicalDrawerId: item.drawerId,
        isPhysicallyPresent: item.isPhysicallyPresent ?? true,
        drawerId: item.drawerId,
        slotId: item.slotId || `${item.drawerId}-S01`,
        status: item.status || 'TERBACA',
      })),

      // -------------------------------------------------------------
      // TRANSAKSI TERPADU (INBOUND, OUTBOUND, MUTASI)
      // -------------------------------------------------------------
      transactions: INITIAL_TRANSACTIONS,
      transfers: INITIAL_TRANSFERS, // backward compat
      alerts: INITIAL_ALERTS,
      rfidLogs: INITIAL_RFID_LOGS,
      kpi: INITIAL_KPI,
      beritaAcaraList: [],

      // -------------------------------------------------------------
      // MODAL CONTROLLERS
      // -------------------------------------------------------------
      inboundModalOpen: false,
      preselectedInboundSlot: null,
      setInboundModalOpen: (open, preselectedSlot = null) =>
        set({ inboundModalOpen: open, preselectedInboundSlot: preselectedSlot }),

      outboundModalOpen: false,
      outboundTargetItem: null,
      setOutboundModalOpen: (open, item = null) =>
        set({ outboundModalOpen: open, outboundTargetItem: item }),

      transferModalOpen: false,
      transferTargetItem: null,
      setTransferModalOpen: (open, item = null) =>
        set({ transferModalOpen: open, transferTargetItem: item }),

      itemDetailModalOpen: false,
      selectedItemDetail: null,
      openItemDetail: (item) =>
        set({ itemDetailModalOpen: true, selectedItemDetail: item }),
      closeItemDetail: () =>
        set({ itemDetailModalOpen: false, selectedItemDetail: null }),

      drawerCapacityModalOpen: false,
      selectedDrawerForCapacity: null,
      openDrawerCapacityModal: (drawerId) =>
        set({ drawerCapacityModalOpen: true, selectedDrawerForCapacity: drawerId }),
      closeDrawerCapacityModal: () =>
        set({ drawerCapacityModalOpen: false, selectedDrawerForCapacity: null }),

      classificationModalOpen: false,
      selectedClassificationType: null,
      selectedAlertItem: null,
      setClassificationModalOpen: (open, type = null, item = null) =>
        set({
          classificationModalOpen: open,
          selectedClassificationType: type,
          selectedAlertItem: item || get().selectedAlertItem,
        }),

      beritaAcaraModalOpen: false,
      setBeritaAcaraModalOpen: (open) => set({ beritaAcaraModalOpen: open }),

      // -------------------------------------------------------------
      // TRANSAKSI ACTION: CREATE INBOUND
      // -------------------------------------------------------------
      createInboundTransaction: (payload) => {
        const {
          tagId,
          brand,
          weight,
          purity,
          sbg,
          customer,
          targetDrawerId,
          targetSlotId,
          reason,
        } = payload;

        // Check if slot already taken by active item
        const existingItemInSlot = get().items.find(
          (i) => i.slotId === targetSlotId && i.status !== 'DITEBUS' && i.status !== 'RECONCILED_VIRT'
        );
        if (existingItemInSlot) {
          get().addToast(`Slot ${targetSlotId} sudah terisi oleh ${existingItemInSlot.brand} (${existingItemInSlot.id})!`, 'error');
          return false;
        }

        // Check if slot is already reserved by pending transaction
        const pendingInSlot = get().transactions.find(
          (t) =>
            t.targetSlotId === targetSlotId &&
            (t.status === 'PENDING_APPROVAL' || t.status === 'APPROVED')
        );
        if (pendingInSlot) {
          get().addToast(`Slot ${targetSlotId} sudah direservasi untuk transaksi ${pendingInSlot.id}!`, 'error');
          return false;
        }

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = String(get().transactions.length + 101).padStart(4, '0');
        const trxId = `TRX-IN-${year}${month}-${count}`;
        const timeStr = date.toLocaleString('id-ID');

        const newTrx = {
          id: trxId,
          type: 'INBOUND',
          itemId: tagId,
          itemBrand: brand,
          weight: Number(weight) || 0,
          purity: purity || '999.9',
          sbg,
          customerName: customer?.name || 'Nasabah Pegadaian',
          customerPhone: customer?.phone || '-',
          customerNik: customer?.nik || '-',
          customerAddress: customer?.address || '-',
          loanAmount: customer?.loanAmount || 'Rp 0',
          loanType: customer?.loanType || 'KCA',
          sourceDrawerId: null,
          sourceSlotId: null,
          targetDrawerId,
          targetSlotId,
          requestedBy: 'staff.bisnis01',
          requestTime: timeStr,
          reason: reason || `Akad Gadai Baru ${sbg}`,
          status: 'PENDING_APPROVAL',
          approvedBy: null,
          approvedTime: null,
          executedBy: null,
          executedTime: null,
        };

        const newLog = {
          id: `log-trx-${Date.now()}`,
          time: new Date().toLocaleTimeString('id-ID'),
          title: 'Pengajuan Inbound Baru',
          detail: `${trxId} · ${tagId} (${brand}) · Target: ${targetSlotId} · Menunggu Supervisor`,
          type: 'inbound',
          color: 'blue',
        };

        get().addAuditTrail(
          'PENGAJUAN_INBOUND',
          `Staff Bisnis mengajukan Inbound ${trxId}: ${tagId} (${brand}) ke ${targetSlotId}`,
          'PENDING'
        );

        set({
          transactions: [newTrx, ...get().transactions],
          rfidLogs: [newLog, ...get().rfidLogs],
          inboundModalOpen: false,
          preselectedInboundSlot: null,
        });

        get().addToast(`Pengajuan Inbound ${trxId} berhasil dibuat. Menunggu persetujuan Supervisor.`, 'success');
        return true;
      },

      // -------------------------------------------------------------
      // TRANSAKSI ACTION: CREATE OUTBOUND (TEBUS, MUTASI, ATAU RELOKASI)
      // -------------------------------------------------------------
      createOutboundTransaction: (payload) => {
        const {
          itemId,
          outboundCategory = 'TEBUS_NASABAH', // 'TEBUS_NASABAH' | 'MUTASI_INTERNAL' | 'RELOKASI_EKSTERNAL'
          targetDrawerId = null,
          targetSlotId = null,
          destinationLocation = null,
          referenceNumber = null,
          reason,
          notes,
        } = payload;
        const item = get().items.find((i) => i.id === itemId);
        if (!item) {
          get().addToast('Barang tidak ditemukan di inventori!', 'error');
          return false;
        }

        // Jika Mutasi Internal, pastikan slot tujuan valid dan tidak terisi
        if (outboundCategory === 'MUTASI_INTERNAL') {
          if (!targetSlotId) {
            get().addToast('Pilih slot tujuan untuk mutasi internal!', 'error');
            return false;
          }
          const existingItemInSlot = get().items.find(
            (i) =>
              i.slotId === targetSlotId &&
              i.id !== itemId &&
              i.status !== 'DITEBUS' &&
              i.status !== 'RELOKASI_KELUAR' &&
              i.status !== 'RECONCILED_VIRT'
          );
          if (existingItemInSlot) {
            get().addToast(`Slot ${targetSlotId} sudah terisi oleh ${existingItemInSlot.brand} (${existingItemInSlot.id})!`, 'error');
            return false;
          }
        }

        // Check if already in pending/approved outbound or mutasi
        const existingOutbound = get().transactions.find(
          (t) =>
            t.itemId === itemId &&
            (t.type === 'OUTBOUND' || t.type === 'MUTASI') &&
            (t.status === 'PENDING_APPROVAL' || t.status === 'APPROVED')
        );
        if (existingOutbound) {
          get().addToast(`Barang ${itemId} sudah dalam proses pengeluaran/mutasi (${existingOutbound.id})!`, 'warning');
          return false;
        }

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = String(get().transactions.length + 101).padStart(4, '0');
        const trxId = `TRX-OUT-${year}${month}-${count}`;
        const timeStr = date.toLocaleString('id-ID');

        const defaultReason =
          outboundCategory === 'TEBUS_NASABAH'
            ? 'Pelunasan Tebus Akad Gadai oleh Nasabah'
            : outboundCategory === 'MUTASI_INTERNAL'
            ? 'Mutasi / Rotasi Internal Laci Brankas'
            : `Relokasi Eksternal ke ${destinationLocation || 'Kantor Cabang / Lelang'}`;

        const newTrx = {
          id: trxId,
          type: 'OUTBOUND',
          outboundCategory, // 'TEBUS_NASABAH' | 'MUTASI_INTERNAL' | 'RELOKASI_EKSTERNAL'
          itemId: item.id,
          itemBrand: item.brand,
          weight: item.weight,
          purity: item.purity,
          sbg: item.sbg,
          customerName: item.customer?.name || '-',
          customerPhone: item.customer?.phone || '-',
          sourceDrawerId: item.systemDrawerId || item.drawerId,
          sourceSlotId: item.slotId,
          targetDrawerId: outboundCategory === 'MUTASI_INTERNAL' ? targetDrawerId : null,
          targetSlotId: outboundCategory === 'MUTASI_INTERNAL' ? targetSlotId : null,
          destinationLocation: outboundCategory === 'RELOKASI_EKSTERNAL' ? destinationLocation : null,
          referenceNumber: referenceNumber || null,
          requestedBy: 'staff.bisnis01',
          requestTime: timeStr,
          reason: reason || defaultReason,
          notes: notes || '-',
          status: 'PENDING_APPROVAL',
          approvedBy: null,
          approvedTime: null,
          executedBy: null,
          executedTime: null,
        };

        const categoryLabel =
          outboundCategory === 'TEBUS_NASABAH'
            ? 'Tebus Nasabah'
            : outboundCategory === 'MUTASI_INTERNAL'
            ? 'Mutasi Internal'
            : 'Relokasi Eksternal';

        const newLog = {
          id: `log-trx-${Date.now()}`,
          time: new Date().toLocaleTimeString('id-ID'),
          title: `Pengajuan Outbound (${categoryLabel})`,
          detail: `${trxId} · ${item.id} (${item.brand}) dari ${item.slotId} · Menunggu Supervisor`,
          type: 'outbound',
          color: 'blue',
        };

        get().addAuditTrail(
          'PENGAJUAN_OUTBOUND',
          `Staff Bisnis mengajukan Outbound [${categoryLabel}] ${trxId}: ${item.id} (${item.brand})`,
          'PENDING'
        );

        set({
          transactions: [newTrx, ...get().transactions],
          rfidLogs: [newLog, ...get().rfidLogs],
          outboundModalOpen: false,
          outboundTargetItem: null,
        });

        get().addToast(`Pengajuan Outbound [${categoryLabel}] ${trxId} berhasil dibuat. Menunggu persetujuan Supervisor.`, 'success');
        return true;
      },

      // -------------------------------------------------------------
      // TRANSAKSI ACTION: CREATE MUTASI (PINDAH LACI / SLOT)
      // -------------------------------------------------------------
      createMutasiTransaction: (payload) => {
        const { itemId, targetDrawerId, targetSlotId, reason } = payload;
        const item = get().items.find((i) => i.id === itemId);
        if (!item) {
          get().addToast('Barang tidak ditemukan!', 'error');
          return false;
        }

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = String(get().transactions.length + 101).padStart(4, '0');
        const trxId = `TRX-MUT-${year}${month}-${count}`;
        const timeStr = date.toLocaleString('id-ID');

        const newTrx = {
          id: trxId,
          type: 'MUTASI',
          itemId: item.id,
          itemBrand: item.brand,
          weight: item.weight,
          purity: item.purity,
          sbg: item.sbg,
          customerName: item.customer?.name || '-',
          customerPhone: item.customer?.phone || '-',
          sourceDrawerId: item.systemDrawerId || item.drawerId,
          sourceSlotId: item.slotId,
          targetDrawerId,
          targetSlotId,
          requestedBy: get().currentRole === 'STAFF_BISNIS' ? 'staff.bisnis01' : 'petugas.vault01',
          requestTime: timeStr,
          reason: reason || 'Rotasi Penataan Slot Laci',
          status: 'PENDING_APPROVAL',
          approvedBy: null,
          approvedTime: null,
          executedBy: null,
          executedTime: null,
        };

        const newLog = {
          id: `log-trx-${Date.now()}`,
          time: new Date().toLocaleTimeString('id-ID'),
          title: 'Pengajuan Mutasi Lokasi',
          detail: `${trxId} · ${item.id} (${item.slotId} → ${targetSlotId})`,
          type: 'mutasi',
          color: 'blue',
        };

        get().addAuditTrail(
          'PENGAJUAN_MUTASI',
          `Pengajuan mutasi ${trxId}: ${item.id} dari ${item.slotId} ke ${targetSlotId}`,
          'PENDING'
        );

        set({
          transactions: [newTrx, ...get().transactions],
          rfidLogs: [newLog, ...get().rfidLogs],
          transferModalOpen: false,
          transferTargetItem: null,
        });

        get().addToast(`Pengajuan mutasi ${trxId} berhasil dibuat`, 'info');
        return true;
      },

      // -------------------------------------------------------------
      // SUPERVISOR: APPROVE TRANSAKSI
      // -------------------------------------------------------------
      approveTransaction: (trxId) => {
        if (get().currentRole !== 'SUPERVISOR') {
          get().addToast('Hanya Supervisor yang memiliki hak otorisasi Approval!', 'error');
          return;
        }

        const timeStr = new Date().toLocaleString('id-ID');
        let approvedItem = null;

        const updated = get().transactions.map((trx) => {
          if (trx.id === trxId) {
            approvedItem = {
              ...trx,
              status: 'APPROVED',
              approvedBy: 'supervisor.vault',
              approvedTime: timeStr,
            };
            return approvedItem;
          }
          return trx;
        });

        if (!approvedItem) return;

        get().addAuditTrail(
          'PERSETUJUAN_TRANSAKSI',
          `Dokumen ${trxId} (${approvedItem.type}) disetujui Supervisor. Perintah Kerja diterbitkan untuk Petugas.`,
          'BERHASIL'
        );

        set({
          transactions: updated,
          rfidLogs: [
            {
              id: `app-${Date.now()}`,
              time: new Date().toLocaleTimeString('id-ID'),
              title: `Transaksi Disetujui (${approvedItem.type})`,
              detail: `${trxId} · Disetujui supervisor.vault · SPK diterbitkan ke Petugas`,
              type: 'approval',
              color: 'green',
            },
            ...get().rfidLogs,
          ],
        });

        get().addToast(`Dokumen ${trxId} disetujui. Perintah Kerja otomatis masuk ke antrean Petugas Vault!`, 'success');
      },

      // -------------------------------------------------------------
      // SUPERVISOR: REJECT TRANSAKSI
      // -------------------------------------------------------------
      rejectTransaction: (trxId, rejectionReason = 'Ditolak oleh Supervisor') => {
        if (get().currentRole !== 'SUPERVISOR') {
          get().addToast('Hanya Supervisor yang memiliki hak menolak!', 'error');
          return;
        }

        const timeStr = new Date().toLocaleString('id-ID');
        const updated = get().transactions.map((trx) =>
          trx.id === trxId
            ? {
                ...trx,
                status: 'REJECTED',
                approvedBy: 'supervisor.vault',
                approvedTime: timeStr,
                rejectionReason,
              }
            : trx
        );

        get().addAuditTrail(
          'PENOLAKAN_TRANSAKSI',
          `Dokumen ${trxId} ditolak Supervisor. Alasan: ${rejectionReason}`,
          'DITOLAK'
        );

        set({
          transactions: updated,
          rfidLogs: [
            {
              id: `rej-${Date.now()}`,
              time: new Date().toLocaleTimeString('id-ID'),
              title: 'Transaksi Ditolak',
              detail: `${trxId} · Ditolak supervisor.vault: ${rejectionReason}`,
              type: 'reject',
              color: 'red',
            },
            ...get().rfidLogs,
          ],
        });

        get().addToast(`Dokumen ${trxId} resmi ditolak`, 'warning');
      },

      // -------------------------------------------------------------
      // PETUGAS: EKSEKUSI PERINTAH KERJA (WORK ORDER)
      // -------------------------------------------------------------
      executeWorkOrder: (trxId) => {
        if (get().currentRole !== 'PETUGAS') {
          get().addToast('Akses terbatas: Hanya Petugas Vault yang dapat mengeksekusi perintah kerja fisik!', 'error');
          return;
        }

        const trx = get().transactions.find((t) => t.id === trxId);
        if (!trx || trx.status !== 'APPROVED') {
          get().addToast('Perintah kerja ini belum disetujui oleh Supervisor atau sudah selesai!', 'warning');
          return;
        }

        const timeStr = new Date().toLocaleString('id-ID');
        let updatedItems = [...get().items];

        if (trx.type === 'INBOUND') {
          // Menaruh barang baru ke laci & slot
          const newItem = {
            id: trx.itemId,
            brand: trx.itemBrand,
            weight: trx.weight,
            purity: trx.purity,
            sbg: trx.sbg,
            cabinetId: 'LT-01',
            drawerId: trx.targetDrawerId,
            systemDrawerId: trx.targetDrawerId,
            physicalDrawerId: trx.targetDrawerId,
            slotId: trx.targetSlotId,
            isPhysicallyPresent: true,
            status: 'TERBACA',
            customer: {
              name: trx.customerName,
              nik: trx.customerNik,
              phone: trx.customerPhone,
              address: trx.customerAddress,
              loanAmount: trx.loanAmount,
              loanType: trx.loanType,
              contractDate: timeStr.split(' ')[0],
              dueDate: '12/03/2027',
              branch: 'Pegadaian CP Kramat Raya',
            },
            history: [
              {
                id: `H-${Date.now()}-1`,
                timestamp: trx.requestTime,
                event: 'INBOUND',
                title: 'Pengajuan Akad Gadai',
                actor: trx.requestedBy,
                role: 'Staff Bisnis',
                details: `Pendaftaran jaminan baru ${trx.sbg} ke slot ${trx.targetSlotId}.`,
              },
              {
                id: `H-${Date.now()}-2`,
                timestamp: trx.approvedTime,
                event: 'APPROVAL',
                title: 'Disetujui Supervisor',
                actor: trx.approvedBy,
                role: 'Supervisor Vault',
                details: `Otorisasi penyimpanan nomor ${trx.id}.`,
              },
              {
                id: `H-${Date.now()}-3`,
                timestamp: timeStr,
                event: 'PHYSICAL_IN',
                title: 'Penempatan Fisik Selesai',
                actor: 'petugas.vault01',
                role: 'Petugas Vault',
                details: `Fisik keping emas diletakkan di ${trx.targetSlotId} dan terverifikasi reader RFID.`,
              },
            ],
          };

          updatedItems = [newItem, ...updatedItems];

          get().addAuditTrail(
            'EKSEKUSI_INBOUND_FISIK',
            `Petugas meletakkan fisik ${trx.itemId} di slot ${trx.targetSlotId}. RFID valid.`,
            'BERHASIL'
          );
        } else if (trx.type === 'OUTBOUND') {
          if (trx.outboundCategory === 'MUTASI_INTERNAL') {
            // Memindahkan keping emas ke kompartemen laci & slot baru
            updatedItems = updatedItems.map((it) => {
              if (it.id === trx.itemId) {
                return {
                  ...it,
                  drawerId: trx.targetDrawerId,
                  systemDrawerId: trx.targetDrawerId,
                  physicalDrawerId: trx.targetDrawerId,
                  slotId: trx.targetSlotId,
                  status: 'TERBACA',
                  history: [
                    ...it.history,
                    {
                      id: `H-${Date.now()}-out-mut-1`,
                      timestamp: trx.requestTime,
                      event: 'OUTBOUND_REQ',
                      title: 'Pengajuan Outbound (Mutasi Internal)',
                      actor: trx.requestedBy,
                      role: 'Staff Bisnis',
                      details: `Pengajuan pemindahan slot dari ${trx.sourceSlotId} ke ${trx.targetSlotId}.`,
                    },
                    {
                      id: `H-${Date.now()}-out-mut-2`,
                      timestamp: trx.approvedTime,
                      event: 'APPROVAL',
                      title: 'Disetujui Supervisor',
                      actor: trx.approvedBy,
                      role: 'Supervisor Vault',
                      details: `Otorisasi pemindahan lokasi nomor ${trx.id}.`,
                    },
                    {
                      id: `H-${Date.now()}-out-mut-3`,
                      timestamp: timeStr,
                      event: 'MUTASI',
                      title: 'Pemindahan Fisik & Update Slot Selesai',
                      actor: 'petugas.vault01',
                      role: 'Petugas Vault',
                      details: `Keping emas dipindahkan dari ${trx.sourceSlotId} ke ${trx.targetSlotId}. Terverifikasi RFID reader.`,
                    },
                  ],
                };
              }
              return it;
            });

            get().addAuditTrail(
              'EKSEKUSI_MUTASI_FISIK',
              `Petugas memindahkan fisik ${trx.itemId} dari ${trx.sourceSlotId} ke ${trx.targetSlotId} (Outbound Mutasi). Slot lama kini bebas.`,
              'BERHASIL'
            );
          } else if (trx.outboundCategory === 'RELOKASI_EKSTERNAL') {
            // Mengeluarkan keping emas untuk dikirim ke cabang lain/kanwil/lelang
            updatedItems = updatedItems.map((it) => {
              if (it.id === trx.itemId) {
                return {
                  ...it,
                  isPhysicallyPresent: false,
                  slotId: null, // Slot laci kini kosong!
                  status: 'RELOKASI_KELUAR',
                  destinationLocation: trx.destinationLocation || 'Kantor Wilayah VIII',
                  history: [
                    ...it.history,
                    {
                      id: `H-${Date.now()}-out-rel-1`,
                      timestamp: trx.requestTime,
                      event: 'OUTBOUND_REQ',
                      title: 'Pengajuan Outbound (Relokasi Eksternal)',
                      actor: trx.requestedBy,
                      role: 'Staff Bisnis',
                      details: `Pengajuan relokasi ke ${trx.destinationLocation || 'Unit Kerja Baru'} (Surat: ${trx.referenceNumber || '-'}).`,
                    },
                    {
                      id: `H-${Date.now()}-out-rel-2`,
                      timestamp: trx.approvedTime,
                      event: 'APPROVAL',
                      title: 'Disetujui Supervisor',
                      actor: trx.approvedBy,
                      role: 'Supervisor Vault',
                      details: `Otorisasi relokasi eksternal nomor ${trx.id}.`,
                    },
                    {
                      id: `H-${Date.now()}-out-rel-3`,
                      timestamp: timeStr,
                      event: 'OUTBOUND',
                      title: 'Fisik Dikeluarkan untuk Relokasi',
                      actor: 'petugas.vault01',
                      role: 'Petugas Vault',
                      details: `Keping emas diambil dari ${trx.sourceSlotId} dan disiapkan untuk ekspedisi/relokasi ke ${trx.destinationLocation || 'Unit Kerja Baru'}. Slot laci kembali kosong.`,
                    },
                  ],
                };
              }
              return it;
            });

            get().addAuditTrail(
              'EKSEKUSI_RELOKASI_FISIK',
              `Petugas mengeluarkan fisik ${trx.itemId} dari slot ${trx.sourceSlotId} untuk relokasi ke ${trx.destinationLocation || 'Unit Kerja Baru'}. Slot laci kini KOSONG.`,
              'BERHASIL'
            );
          } else {
            // TEBUS_NASABAH (Pelunasan Akad Gadai)
            updatedItems = updatedItems.map((it) => {
              if (it.id === trx.itemId) {
                return {
                  ...it,
                  isPhysicallyPresent: false,
                  slotId: null, // Slot laci kini kosong!
                  status: 'DITEBUS',
                  history: [
                    ...it.history,
                    {
                      id: `H-${Date.now()}-4`,
                      timestamp: trx.requestTime,
                      event: 'OUTBOUND_REQ',
                      title: 'Pengajuan Penebusan',
                      actor: trx.requestedBy,
                      role: 'Staff Bisnis',
                      details: `Pengajuan pengeluaran barang tebus SBG: ${trx.sbg}.`,
                    },
                    {
                      id: `H-${Date.now()}-5`,
                      timestamp: trx.approvedTime,
                      event: 'APPROVAL',
                      title: 'Disetujui Supervisor',
                      actor: trx.approvedBy,
                      role: 'Supervisor Vault',
                      details: `Otorisasi pengeluaran ${trx.id}.`,
                    },
                    {
                      id: `H-${Date.now()}-6`,
                      timestamp: timeStr,
                      event: 'OUTBOUND',
                      title: 'Fisik Diambil & Diserahkan',
                      actor: 'petugas.vault01',
                      role: 'Petugas Vault',
                      details: `Barang fisik diambil dari ${trx.sourceSlotId} dan diserahkan ke nasabah. Slot kembali kosong.`,
                    },
                  ],
                };
              }
              return it;
            });

            get().addAuditTrail(
              'EKSEKUSI_OUTBOUND_FISIK',
              `Petugas mengambil fisik ${trx.itemId} dari slot ${trx.sourceSlotId} untuk diserahkan ke nasabah. Slot kini KOSONG.`,
              'BERHASIL'
            );
          }
        } else if (trx.type === 'MUTASI') {
          // Memindahkan barang ke laci/slot baru
          updatedItems = updatedItems.map((it) => {
            if (it.id === trx.itemId) {
              return {
                ...it,
                drawerId: trx.targetDrawerId,
                systemDrawerId: trx.targetDrawerId,
                physicalDrawerId: trx.targetDrawerId,
                slotId: trx.targetSlotId,
                status: 'TERBACA',
                history: [
                  ...it.history,
                  {
                    id: `H-${Date.now()}-7`,
                    timestamp: timeStr,
                    event: 'MUTASI',
                    title: 'Pemindahan Fisik Selesai',
                    actor: 'petugas.vault01',
                    role: 'Petugas Vault',
                    details: `Fisik dipindahkan dari ${trx.sourceSlotId} ke ${trx.targetSlotId}. Terverifikasi RFID.`,
                  },
                ],
              };
            }
            return it;
          });

          get().addAuditTrail(
            'EKSEKUSI_MUTASI_FISIK',
            `Petugas memindahkan fisik ${trx.itemId} dari ${trx.sourceSlotId} ke ${trx.targetSlotId}`,
            'BERHASIL'
          );
        }

        // Tandai transaksi COMPLETED
        const updatedTransactions = get().transactions.map((t) =>
          t.id === trxId
            ? {
                ...t,
                status: 'COMPLETED',
                executedBy: 'petugas.vault01',
                executedTime: timeStr,
              }
            : t
        );

        set({
          items: updatedItems,
          transactions: updatedTransactions,
          rfidLogs: [
            {
              id: `exec-${Date.now()}`,
              time: new Date().toLocaleTimeString('id-ID'),
              title: `Perintah Kerja Selesai (${trx.type})`,
              detail: `${trxId} · ${trx.itemId} · Dieksekusi petugas.vault01 · Terverifikasi RFID`,
              type: 'cycle-done',
              color: 'green',
            },
            ...get().rfidLogs,
          ],
        });

        get().addToast(`Perintah kerja ${trxId} berhasil dieksekusi fisik & terverifikasi RFID!`, 'success');
      },

      // -------------------------------------------------------------
      // AUDIT TRAIL PERSISTENCE
      // -------------------------------------------------------------
      auditTrails: [
        {
          id: 'AUD-001',
          timestamp: '20/10/2026 09:45:01',
          action: 'SIKLUS_BACA_RFID',
          actor: 'system:reader-mars4at',
          details: 'Pindai otomatis lemari LT-01: 10 tag aktif terbaca normal (0 selisih)',
          status: 'BERHASIL',
        },
        {
          id: 'AUD-002',
          timestamp: '20/10/2026 10:00:01',
          action: 'PENERBITAN_SPK',
          actor: 'supervisor.vault',
          details: 'Otorisasi SPK Outbound TRX-OUT-202610-0043 untuk tag E0040018',
          status: 'BERHASIL',
        },
      ],

      addAuditTrail: (action, details, status = 'BERHASIL') => {
        const timestamp = new Date().toLocaleString('id-ID');
        const id = `AUD-${Date.now().toString().slice(-5)}`;
        const actor =
          get().currentRole === 'STAFF_BISNIS'
            ? 'staff.bisnis01'
            : get().currentRole === 'SUPERVISOR'
            ? 'supervisor.vault'
            : get().currentRole === 'SPI'
            ? 'auditor.spi01'
            : 'petugas.vault01';

        const newEntry = {
          id,
          timestamp,
          action,
          actor,
          details,
          status,
        };
        set({ auditTrails: [newEntry, ...get().auditTrails].slice(0, 100) });
      },

      // Reader Status
      readerStatus: 'ONLINE',
      readDuration: '± 4 detik',
      lastScanTime: '10:15:02',
      isScanning: false,

      // -------------------------------------------------------------
      // REKONSILIASI SCAN RFID CYCLE
      // -------------------------------------------------------------
      runScanCycle: () => {
        set({ isScanning: true });
        const timeStr = new Date().toLocaleTimeString('id-ID');
        const currentItems = get().items;
        const activeItems = currentItems.filter(
          (i) => i.status !== 'DITEBUS' && i.status !== 'RELOKASI_KELUAR' && i.status !== 'RECONCILED_VIRT'
        );

        const totalRead = activeItems.filter((i) => i.isPhysicallyPresent).length;
        const totalSelisih = activeItems.filter((i) => !i.isPhysicallyPresent).length;

        setTimeout(() => {
          set({
            isScanning: false,
            lastScanTime: timeStr,
            kpi: {
              ...get().kpi,
              totalVaultItems: activeItems.length,
              readLastCycle: totalRead,
              openDifference: totalSelisih,
              accuracy: activeItems.length > 0 ? `${((totalRead / activeItems.length) * 100).toFixed(1)}%` : '100.0%',
            },
            rfidLogs: [
              {
                id: `scan-${Date.now()}`,
                time: timeStr,
                title: 'Siklus baca RFID selesai',
                detail: `LT-01 · 3 laci · ${totalRead} tag aktif terbaca · ${totalSelisih} selisih`,
                type: 'cycle-done',
                color: totalSelisih > 0 ? 'orange' : 'green',
              },
              ...get().rfidLogs,
            ].slice(0, 50),
          });

          get().addToast(`Siklus pindai selesai: ${totalRead} tag aktif terbaca normal`, 'success');
        }, 800);
      },

      // Reset Demo Data
      resetToDefault: () => {
        set({
          activeView: 'dashboard',
          currentRole: 'STAFF_BISNIS',
          drawers: INITIAL_DRAWERS,
          items: INITIAL_ITEMS.map((item) => ({
            ...item,
            systemDrawerId: item.drawerId,
            physicalDrawerId: item.drawerId,
            isPhysicallyPresent: true,
            drawerId: item.drawerId,
            slotId: item.slotId || `${item.drawerId}-S01`,
            status: item.status || 'TERBACA',
          })),
          transactions: INITIAL_TRANSACTIONS,
          transfers: INITIAL_TRANSFERS,
          selectedDrawer: 'L01',
          rfidLogs: INITIAL_RFID_LOGS,
          alerts: INITIAL_ALERTS,
          kpi: INITIAL_KPI,
          beritaAcaraList: [],
          lastScanTime: '10:15:02',
          inboundModalOpen: false,
          outboundModalOpen: false,
          transferModalOpen: false,
          itemDetailModalOpen: false,
          drawerCapacityModalOpen: false,
        });
        get().addToast('Data sistem Pegadaian Vault berhasil di-reset ke kondisi awal', 'info');
      },
    }),
    {
      name: 'pegadaian_vault_v4_flow',
    }
  )
);
