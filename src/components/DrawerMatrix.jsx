'use client';

import React from 'react';
import { useVaultStore } from '../store/useVaultStore';
import { ArrowRight } from 'lucide-react';

export default function DrawerMatrix() {
  const { items, selectedDrawer, setSelectedDrawer, scenarioId } = useVaultStore();

  // Define 12 Drawers (L01 to L12)
  const drawerList = [
    'L01', 'L02', 'L03',
    'L04', 'L05', 'L06',
    'L07', 'L08', 'L09',
    'L10', 'L11', 'L12',
  ];

  // Helper to compute count and status per drawer
  const getDrawerStats = (dId) => {
    const drawerItems = items.filter((it) => it.drawerId === dId);
    const count = drawerItems.length;

    // Check scenarios
    if (scenarioId === 'UT-02') {
      if (dId === 'L01') {
        return { count, statusLabel: '-1 KELUAR', badgeType: 'transfer-out', isTransfer: true };
      }
      if (dId === 'L02') {
        return { count, statusLabel: '+1 MASUK', badgeType: 'transfer-in', isTransfer: true };
      }
    }

    if (scenarioId === 'UT-04') {
      if (dId === 'L05') {
        // Missing item E0040024
        const readableCount = drawerItems.filter((it) => it.status !== 'MISSING').length;
        return { count: readableCount, statusLabel: 'SELISIH -1', badgeType: 'selisih', isSelisih: true };
      }
    }

    if (count === 0) {
      return { count: 0, statusLabel: 'KOSONG', badgeType: 'kosong' };
    }

    return { count, statusLabel: 'TERBACA', badgeType: 'terbaca' };
  };

  return (
    <div className="relative">
      {/* Grid 3x4 Drawers */}
      <div className="grid grid-cols-3 gap-3">
        {drawerList.map((dId) => {
          const { count, statusLabel, badgeType, isSelisih, isTransfer } = getDrawerStats(dId);
          const isSelected = selectedDrawer === dId;

          // Card Background & Border Styles
          let cardStyle = 'bg-white border-slate-200 text-slate-800 hover:border-slate-300';
          if (isSelisih) {
            cardStyle = 'bg-[#fdf2f2] border-[#f87171] text-red-900';
          } else if (isTransfer && (dId === 'L01' || dId === 'L02')) {
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
          }

          return (
            <div
              key={dId}
              onClick={() => setSelectedDrawer(dId)}
              className={`p-4 rounded-lg border transition-all cursor-pointer select-none flex flex-col justify-between h-[96px] ${cardStyle}`}
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

      {/* Transfer Arrow Indicator Overlay between L01 and L02 when UT-02 */}
      {scenarioId === 'UT-02' && (
        <div className="absolute top-[28px] left-[32%] z-10 pointer-events-none transform -translate-x-1/2">
          <div className="bg-[#0284c7] text-white p-1.5 rounded-full shadow-md border-2 border-white flex items-center justify-center animate-pulse">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
