'use client';

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ToastContainer from './ToastContainer';
import InboundModal from './modals/InboundModal';
import OutboundModal from './modals/OutboundModal';
import TransferModal from './modals/TransferModal';
import ItemDetailModal from './modals/ItemDetailModal';
import DrawerCapacityModal from './modals/DrawerCapacityModal';
import ClassificationModal from './modals/ClassificationModal';
import BeritaAcaraModal from './modals/BeritaAcaraModal';

export default function AppShell({ children }) {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-slate-100 text-slate-800 antialiased selection:bg-[#00b4d8] selection:text-[#0f233a]">
      {/* Top Header with Role Switcher */}
      <Header />

      {/* Body Layout: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Center Stage */}
        <main className="flex-1 overflow-y-auto p-6 pb-20">
          <div className="max-w-360 mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Operational Modals */}
      <InboundModal />
      <OutboundModal />
      <TransferModal />
      <ItemDetailModal />
      <DrawerCapacityModal />
      <ClassificationModal />
      <BeritaAcaraModal />

      {/* Real-time Floating Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
