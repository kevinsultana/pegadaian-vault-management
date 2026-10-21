'use client';

import React from 'react';
import { useVaultStore } from '../store/useVaultStore';

export default function DrawerInventoryTable() {
  const { items, selectedDrawer } = useVaultStore();

  const drawerItems = items.filter((it) => it.drawerId === selectedDrawer);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-800">
          Isi Laci {selectedDrawer} — hasil pembacaan
        </h3>
        <span className="text-[11px] font-mono text-slate-500">
          Total: {drawerItems.length} item
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-medium">
              <th className="pb-2 font-semibold">Tag ID</th>
              <th className="pb-2 font-semibold">Barang</th>
              <th className="pb-2 font-semibold">Berat (g)</th>
              <th className="pb-2 font-semibold">Kadar</th>
              <th className="pb-2 font-semibold">Nasabah / No. SBG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {drawerItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400 font-sans italic">
                  Laci ini kosong (0 item terbaca)
                </td>
              </tr>
            ) : (
              drawerItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 text-slate-900 font-medium">{item.id}</td>
                  <td className="py-2.5 text-slate-800 font-sans">{item.brand}</td>
                  <td className="py-2.5 text-slate-700">{item.weight.toFixed(2)}</td>
                  <td className="py-2.5 text-slate-700">{item.purity}</td>
                  <td className="py-2.5 text-slate-600 font-sans">{item.sbg}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
