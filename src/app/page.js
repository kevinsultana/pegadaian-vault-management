'use client';

import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DemoController from '../components/DemoController';
import PocVerificationDrawer from '../components/PocVerificationDrawer';
import DashboardView from '../components/views/DashboardView';
import DrawerMonitorView from '../components/views/DrawerMonitorView';
import TransferView from '../components/views/TransferView';
import AlertView from '../components/views/AlertView';
import ClassificationModal from '../components/modals/ClassificationModal';
import BeritaAcaraModal from '../components/modals/BeritaAcaraModal';
import { useVaultStore } from '../store/useVaultStore';

export default function Home() {
  const { activeView } = useVaultStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0f233a] flex items-center justify-center text-cyan-300 font-mono text-sm">
        Memuat UNOTEK Vault Management System...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col antialiased selection:bg-[#00b4d8] selection:text-[#0f233a]">
      {/* Top Header */}
      <Header />

      {/* Body Layout: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Center Stage */}
        <main className="flex-1 overflow-y-auto p-5 pb-24 md:p-6 md:pb-28">
          <div className="max-w-[1440px] mx-auto">
            {activeView === 'dashboard' && <DashboardView />}
            {activeView === 'lemari-laci' && <DrawerMonitorView />}
            {activeView === 'transfer' && <TransferView />}
            {activeView === 'alert' && <AlertView />}

            {/* Fallback for other sidebar items to provide realistic response */}
            {!['dashboard', 'lemari-laci', 'transfer', 'alert'].includes(activeView) && (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center space-y-3">
                <h3 className="font-bold text-base text-slate-800 uppercase tracking-wide">
                  Menu: {activeView.replace('-', ' ')}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Modul ini merupakan bagian dari ekosistem UNOTEK Vault Enterprise. Silakan gunakan menu <span className="font-semibold text-slate-700">Dashboard</span>, <span className="font-semibold text-slate-700">Lemari & Laci</span>, atau tombol skenario di bawah untuk demonstrasi PoC.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Demo Skenario Controller Toolbar */}
      <DemoController />

      {/* Acceptance Criteria Status Drawer */}
      <PocVerificationDrawer />

      {/* Interactive Modals */}
      <ClassificationModal />
      <BeritaAcaraModal />
    </div>
  );
}
