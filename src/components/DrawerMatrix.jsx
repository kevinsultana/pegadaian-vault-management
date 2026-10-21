'use client';

import React from 'react';
import { useVaultStore } from '../store/useVaultStore';
import { ArrowRight } from 'lucide-react';

export default function DrawerMatrix() {
  const { items, transfers, selectedDrawer, setSelectedDrawer } = useVaultStore();

  // Define 3 Drawers (L01, L02, L03) for PoC
  const drawerList = ['L01', 'L02', 'L03'];

  // Check recent transfers for indicator badge & arrow
  const recentVerifiedTransfer = transfers.find((t) => t.status === 'VERIFIED');
  const sourceTrfDrawer = recentVerifiedTransfer?.sourceDrawerId;
  const targetTrfDrawer = recentVerifiedTransfer?.targetDrawerId;

  // Helper to compute count and status per drawer dynamically from real items
  const getDrawerStats = (dId) => {
    const drawerItems = items.filter((it) => it.drawerId === dId);

    // Missing count (items registered to this drawer but not physically readable)
    const missingItems = drawerItems.filter((it) => it.status === 'MISSING');
    const isSelisih = missingItems.length > 0;

    // Readable items count
    const readableCount = drawerItems.filter(
      (it) => it.status !== 'MISSING' && it.status !== 'RECONCILED_VIRT'
    ).length;

    // Check if recent transfer touched this drawer
    const isRecentSource = sourceTrfDrawer === dId;
    const isRecentTarget = targetTrfDrawer === dId;

    if (isSelisih) {
      return {
        count: readableCount,
        statusLabel: `SELISIH -${missingItems.length}`,
        badgeType: 'selisih',
        isSelisih: true,
      };
    }

    if (isRecentSource) {
      return {
        count: readableCount,
        statusLabel: '-1 KELUAR',
        badgeType: 'transfer-out',
        isTransfer: true,
      };
    }

    if (isRecentTarget) {
      return {
        count: readableCount,
        statusLabel: '+1 MASUK',
        badgeType: 'transfer-in',
        isTransfer: true,
      };
    }

    // Misplaced count
    const misplacedItems = drawerItems.filter((it) => it.status === 'MISPLACED');
    if (misplacedItems.length > 0) {
      return {
        count: readableCount,
        statusLabel: `MISPLACED (${misplacedItems.length})`,
        badgeType: 'misplaced',
      };
    }

    if (readableCount === 0) {
      return { count: 0, statusLabel: 'KOSONG', badgeType: 'kosong' };
    }

    return { count: readableCount, statusLabel: 'TERBACA', badgeType: 'terbaca' };
  };

  return (
    <div className="relative">
      {/* Grid 3 Drawers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {drawerList.map((dId) => {
          const { count, statusLabel, badgeType, isSelisih, isTransfer } = getDrawerStats(dId);
          const isSelected = selectedDrawer === dId;

          // Card Background & Border Styles
          let cardStyle = 'bg-white border-slate-200 text-slate-800 hover:border-slate-300';
          if (isSelisih) {
            cardStyle = 'bg-[#fdf2f2] border-[#f87171] text-red-900';
          } else if (isTransfer) {
            cardStyle = 'bg-white border-[#38bdf8] text-slate-800';
          }

          if (isSelected) {
            cardStyle += ' ring-2 ring-[#00b4d8] shadow-sm';
          }

          // Badge Pill Styles
          let badgeStyle = 'bg-[#e0f2fe] text-[#0369a1]'; // TERBACA (Cyan/Teal soft)
          if (badgeType === 'kosong') {
            badgeStyle = 'bg-slate-100 text-slate-500';
          } else if (badgeType === 'selisih') {
            badgeStyle = 'bg-[#fee2e2] text-[#dc2626] font-semibold';
          } else if (badgeType === 'transfer-out' || badgeType === 'transfer-in') {
            badgeStyle = 'bg-[#e0f2fe] text-[#0284c7] font-semibold';
          } else if (badgeType === 'misplaced') {
            badgeStyle = 'bg-amber-100 text-amber-800 font-semibold';
          }

          return (
            <div
              key={dId}
              onClick={() => setSelectedDrawer(dId)}
              className={`p-4 rounded-lg border transition-all cursor-pointer select-none flex flex-col justify-between h-24 ${cardStyle}`}
            >
              {/* Header: Drawer ID & Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold tracking-wider ${isSelisih ? 'text-red-900' : 'text-slate-800'}`}>
                  {dId}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${badgeStyle}`}>
                  {statusLabel}
                </span>
              </div>

              {/* Counter: Large Number + "item" */}
              <div className="flex items-baseline space-x-1 mt-1">
                <span className={`text-2xl font-bold font-mono tracking-tight leading-none ${isSelisih ? 'text-red-600' : 'text-[#0f233a]'}`}>
                  {count}
                </span>
                <span className="text-xs text-slate-400 font-normal">item</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transfer Arrow Indicator Overlay between L01 and L02 when recent verified transfer exists */}
      {sourceTrfDrawer === 'L01' && targetTrfDrawer === 'L02' && (
        <div className="hidden md:flex absolute top-1/2 left-[33%] z-10 pointer-events-none transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-[#0284c7] text-white p-1.5 rounded-full shadow-md border-2 border-white flex items-center justify-center animate-pulse">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
