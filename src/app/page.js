"use client";

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DashboardView from "../components/views/DashboardView";
import DrawerMonitorView from "../components/views/DrawerMonitorView";
import TransferView from "../components/views/TransferView";
import AlertView from "../components/views/AlertView";
import ApprovalView from "../components/views/ApprovalView";
import AuditTrailView from "../components/views/AuditTrailView";
import ReportsView from "../components/views/ReportsView";
import ClassificationModal from "../components/modals/ClassificationModal";
import BeritaAcaraModal from "../components/modals/BeritaAcaraModal";
import TransferModal from "../components/modals/TransferModal";
import PhysicalVaultSimulator from "../components/PhysicalVaultSimulator";
import ToastContainer from "../components/ToastContainer";
import { useVaultStore } from "../store/useVaultStore";

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
      {/* Top Header with Role Switcher */}
      <Header />

      {/* Body Layout: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Center Stage */}
        <main className="flex-1 overflow-y-auto p-5 pb-24 md:p-6 md:pb-28">
          <div className="max-w-360 mx-auto">
            {activeView === "dashboard" && <DashboardView />}
            {(activeView === "lemari-laci" || activeView === "inventory") && (
              <DrawerMonitorView />
            )}
            {activeView === "transfer" && <TransferView />}
            {activeView === "approval" && <ApprovalView />}
            {activeView === "alert" && <AlertView />}
            {activeView === "audit-trail" && <AuditTrailView />}
            {(activeView === "laporan" || activeView === "stock-opname") && (
              <ReportsView />
            )}
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

