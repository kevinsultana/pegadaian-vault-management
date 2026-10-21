'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Layers,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  FileBarChart2,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', href: '/inventory', icon: Boxes },
    { id: 'lemari-laci', label: 'Lemari & Laci', href: '/lemari-laci', icon: Layers },
    { id: 'stock-opname', label: 'Stock Opname', href: '/stock-opname', icon: ClipboardCheck },
    { id: 'approval', label: 'Approval', href: '/approval', icon: CheckCircle2 },
    { id: 'alert', label: 'Alert', href: '/alert', icon: AlertTriangle },
    { id: 'audit-trail', label: 'Audit Trail', href: '/audit-trail', icon: History },
    { id: 'laporan', label: 'Laporan', href: '/laporan', icon: FileBarChart2 },
  ];

  return (
    <aside className="w-56 bg-[#0f233a] text-slate-300 flex flex-col justify-between select-none shrink-0 border-r border-[#1c3755] min-h-[calc(100vh-45px)]">
      {/* Navigation List */}
      <nav className="py-2">
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
              className={`w-full flex items-center px-5 py-3 text-[13px] font-medium transition-colors text-left relative ${
                isActive
                  ? 'bg-[#008ba3] text-white font-semibold'
                  : 'text-slate-300 hover:bg-[#162e4a] hover:text-white'
              }`}
            >
              {/* Active left indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00e5ff]" />
              )}
              <Icon className="w-4 h-4 mr-3 opacity-90" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Branding Info */}
      <div className="p-4 border-t border-[#1c3755] text-[11px] text-slate-400">
        <p className="font-semibold text-slate-300">Pegadaian RFID Core</p>
        <p className="text-[10px] text-slate-500 mt-0.5">MARS-4AT Multiplexer v2.4</p>
      </div>
    </aside>
  );
}
