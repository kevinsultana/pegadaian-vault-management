'use client';

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import PhysicalVaultSimulator from './PhysicalVaultSimulator';
import ToastContainer from './ToastContainer';
import TransferModal from './modals/TransferModal';
import ClassificationModal from './modals/ClassificationModal';
import BeritaAcaraModal from './modals/BeritaAcaraModal';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col antialiased selection:bg-[#00b4d8] selection:text-[#0f233a]">
      {/* Top Header with Role Switcher */}
      <Header />

      {/* Body Layout: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Center Stage */}
        <main className="flex-1 overflow-y-auto p-5 pb-24 md:p-6 md:pb-28">
          <div className="max-w-360 mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Hardware / Physical Vault Simulator Sandbox Popover */}
      <PhysicalVaultSimulator />

      {/* Interactive Operational Modals */}
      <TransferModal />
      <ClassificationModal />
      <BeritaAcaraModal />

      {/* Real-time Floating Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
