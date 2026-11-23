'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useVaultStore } from '../store/useVaultStore';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Layers,
  Sliders,
  Boxes,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  History,
  FileBarChart2,
  ShieldCheck,
  Eye,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentRole, transactions } = useVaultStore();

  const pendingApprovalCount = transactions.filter((t) => t.status === 'PENDING_APPROVAL').length;
  const approvedWorkOrdersCount = transactions.filter((t) => t.status === 'APPROVED').length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
      id: 'transaksi',
      label: 'Inbound & Outbound',
      href: '/transaksi',
      icon: ArrowLeftRight,
      badge: currentRole === 'STAFF_BISNIS' ? 'Staff' : null,
      badgeColor: 'bg-cyan-900/60 text-cyan-300 border-cyan-700',
    },
    {
      id: 'lemari-laci',
      label: 'Peta Slot Laci (Parkir)',
      href: '/lemari-laci',
      icon: Layers,
    },
    {
      id: 'master-laci',
      label: 'Master Lemari & Laci',
      href: '/master-laci',
      icon: Sliders,
      badge: currentRole === 'SUPERVISOR' ? 'SPV' : 'Khusus SPV',
      badgeColor: currentRole === 'SUPERVISOR' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-700/80 text-slate-400',
    },
    { id: 'inventory', label: 'Inventori Emas', href: '/inventory', icon: Boxes },
    {
      id: 'approval',
      label: 'Approval Transaksi',
      href: '/approval',
      icon: CheckCircle2,
      count: pendingApprovalCount,
      badgeColor: 'bg-amber-500 text-slate-900 font-bold',
    },
    {
      id: 'perintah-kerja',
      label: 'Perintah Kerja (SPK)',
      href: '/perintah-kerja',
      icon: ClipboardList,
      count: approvedWorkOrdersCount,
      badgeColor: 'bg-sky-500 text-slate-900 font-bold',
    },
    { id: 'stock-opname', label: 'Stock Opname', href: '/stock-opname', icon: ClipboardCheck },
    { id: 'alert', label: 'Alert Anomali', href: '/alert', icon: AlertTriangle },
    { id: 'audit-trail', label: 'Audit Trail', href: '/audit-trail', icon: History },
    { id: 'laporan', label: 'Laporan SPI', href: '/laporan', icon: FileBarChart2 },
  ];

  return (
    <aside className="w-60 bg-[#0f233a] text-slate-300 flex flex-col justify-between select-none h-full shrink-0 overflow-y-auto border-r border-[#1c3755]">
      {/* Navigation List */}
      <nav className="py-2.5">
        <div className="px-5 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Modul Operasional Vault
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isDashboard = item.href === '/dashboard';
          const isActive =
            pathname === item.href ||
            (!isDashboard && pathname?.startsWith(item.href)) ||
            (isDashboard && pathname === '/');

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center justify-between px-5 py-2.5 text-[13px] font-medium transition-colors text-left relative ${
                isActive
                  ? 'bg-[#008ba3] text-white font-semibold'
                  : 'text-slate-300 hover:bg-[#162e4a] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Active left indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00e5ff]" />
                )}
                <Icon className="w-4 h-4 opacity-90" />
                <span>{item.label}</span>
              </div>

              {/* Badges / Counters */}
              {item.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono leading-none ${item.badgeColor || 'bg-amber-400 text-slate-900'}`}>
                  {item.count}
                </span>
              )}
              {item.badge && (
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono border leading-none ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Role Status Info */}
      <div className="p-4 border-t border-[#1c3755] text-[11px] text-slate-400 bg-[#0b1b2d]">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-300">Mode Akses:</span>
          <span className="font-mono text-cyan-300 font-bold">{currentRole}</span>
        </div>
        {currentRole === 'SPI' && (
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800">
            <Eye className="w-3 h-3" />
            <span>Audit Mode (Read-Only)</span>
          </div>
        )}
        <p className="text-[10px] text-slate-500 mt-1">Pegadaian Multi-Role Flow v4.2</p>
      </div>
    </aside>
  );
}
