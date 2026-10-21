'use client';

import React from 'react';
import { useVaultStore } from '../store/useVaultStore';

export default function RealTimeRfidLogs() {
  const { rfidLogs } = useVaultStore();

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <h3 className="text-xs font-bold text-slate-800 tracking-wide mb-3 flex items-center justify-between">
        <span>Event RFID real-time</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Feed Live" />
      </h3>

      <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
        {rfidLogs.map((log) => {
          let dotColor = 'bg-blue-600';
          if (log.color === 'green') dotColor = 'bg-emerald-600';
          if (log.color === 'red') dotColor = 'bg-rose-600';
          if (log.color === 'orange') dotColor = 'bg-amber-600';

          return (
            <div key={log.id} className="flex items-start space-x-2.5 text-xs">
              {/* Bullet Indicator */}
              <div className="mt-1">
                <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
              </div>

              {/* Timestamp */}
              <div className="font-mono text-slate-500 shrink-0 text-[11px] pt-0.5">
                {log.time}
              </div>

              {/* Content Description */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-[12px] leading-tight">
                  {log.title}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5 truncate leading-normal">
                  {log.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
