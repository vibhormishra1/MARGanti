import React from "react";
import { useSync } from "../context/SyncContext";
import { AlertTriangle, GitMerge, Server, Smartphone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConflictResolutionUI() {
  const { conflicts, resolveConflict } = useSync();

  if (conflicts.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-rose-500/30 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-rose-950/50 p-6 border-b border-rose-900/50">
          <h2 className="text-2xl font-black text-rose-400 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8" />
            Sync Conflicts Detected ({conflicts.length})
          </h2>
          <p className="text-rose-200/60 mt-2">
            The background sync engine found versions on the server that have changed since you went offline. Please resolve them below to continue synchronizing.
          </p>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {conflicts.map(conflict => (
            <div key={conflict.id} className="border border-slate-800 bg-slate-950 rounded-xl overflow-hidden">
              <div className="bg-slate-800/50 p-3 px-4 border-b border-slate-800 flex justify-between items-center">
                <span className="font-mono text-xs text-sky-400">ID: {conflict.entityId}</span>
                <span className="font-bold text-sm text-slate-300 bg-slate-800 px-3 py-1 rounded-full">
                  {conflict.entityType}
                </span>
              </div>
              
              <div className="grid grid-cols-2 divide-x divide-slate-800">
                {/* Local Change */}
                <div className="p-4">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-3">
                    <Smartphone className="w-4 h-4" /> Your Local Version
                  </h4>
                  <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto min-h-[100px] border border-slate-800">
                    {JSON.stringify(conflict.localPayload, null, 2)}
                  </pre>
                  <Button 
                    className="w-full mt-4 bg-slate-800 hover:bg-emerald-900/50 hover:text-emerald-400 text-slate-300"
                    onClick={() => resolveConflict(conflict.id, "KEEP_LOCAL")}
                  >
                    <Check className="w-4 h-4 mr-2" /> Keep Local Version
                  </Button>
                </div>

                {/* Remote Change */}
                <div className="p-4">
                  <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2 mb-3">
                    <Server className="w-4 h-4" /> Remote Server Version
                  </h4>
                  <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto min-h-[100px] border border-slate-800">
                    {JSON.stringify(conflict.remotePayload, null, 2)}
                  </pre>
                  <Button 
                    className="w-full mt-4 bg-slate-800 hover:bg-sky-900/50 hover:text-sky-400 text-slate-300"
                    onClick={() => resolveConflict(conflict.id, "KEEP_REMOTE")}
                  >
                    <Check className="w-4 h-4 mr-2" /> Accept Server Version
                  </Button>
                </div>
              </div>

              {/* Manual Merge (Mocked for now) */}
              <div className="p-4 border-t border-slate-800 bg-slate-900">
                <Button 
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold border-none"
                  onClick={() => resolveConflict(conflict.id, "MANUAL_MERGE", { ...conflict.remotePayload, ...conflict.localPayload })}
                >
                  <GitMerge className="w-5 h-5 mr-2" /> Auto-Merge (Keep Both Changes)
                </Button>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
