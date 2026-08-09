import React, { useState } from "react";
import { useSync } from "../context/SyncContext";
import { Database, FileText, Activity } from "lucide-react";
import { SyncOperation } from "@marg/domain";

export function PendingChangesPanel() {
  const { pendingOperations, enqueueMutation, isOnline } = useSync();
  const [isOpen, setIsOpen] = useState(false);

  // Helper to artificially push a mock change while offline
  const mockCreateChange = async () => {
    const res = SyncOperation.create({
      id: crypto.randomUUID(),
      entityId: `mock-entity-${Date.now()}`,
      entityType: "Mission",
      operation: "UPDATE",
      payload: { status: "ACTIVE", updated: new Date().toISOString() },
      timestamp: new Date()
    });
    if (res.isSuccess) {
      await enqueueMutation(res.getValue());
    }
  };

  const mockConflictChange = async () => {
    const res = SyncOperation.create({
      id: crypto.randomUUID(),
      entityId: `mock-conflict-${Date.now()}`,
      entityType: "Objective",
      operation: "UPDATE",
      payload: { title: "Secure Perimeter", isComplete: true },
      timestamp: new Date()
    });
    if (res.isSuccess) {
      await enqueueMutation(res.getValue());
    }
  };

  if (!isOpen) {
    return (
      <div 
        className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 shadow-2xl p-4 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-3 text-slate-200 font-bold">
          <Database className="w-5 h-5 text-sky-400" />
          Queue ({pendingOperations.length})
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col max-h-[600px]">
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-sky-500" />
          Offline Sync Queue
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">✕</button>
      </div>

      <div className="p-4 bg-slate-900/50 flex flex-col gap-2 border-b border-slate-800">
        <p className="text-xs text-slate-400 mb-2">Simulate offline mutations:</p>
        <div className="flex gap-2">
          <button onClick={mockCreateChange} className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white p-2 rounded">
            Add Normal Change
          </button>
          <button onClick={mockConflictChange} className="flex-1 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-800 text-xs text-rose-300 p-2 rounded">
            Add Conflict Change
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {pendingOperations.length === 0 ? (
          <div className="text-center text-slate-500 py-10">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" />
            No pending changes
          </div>
        ) : (
          pendingOperations.map(op => (
            <div key={op.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  op.operation === "UPDATE" ? "bg-sky-500/20 text-sky-400" :
                  op.operation === "CREATE" ? "bg-emerald-500/20 text-emerald-400" :
                  "bg-rose-500/20 text-rose-400"
                }`}>
                  {op.operation}
                </span>
                <span className="text-xs text-slate-500">{new Date(op.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="text-sm font-medium text-white mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                {op.entityType} ({op.entityId.substring(0, 8)}...)
              </div>
              <pre className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded overflow-x-auto">
                {JSON.stringify(op.payload, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
