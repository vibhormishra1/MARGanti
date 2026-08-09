import React from "react";
import { useSync } from "../context/SyncContext";
import { Cloud, CloudOff, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SyncStatusIndicator() {
  const { isOnline, isSyncing, pendingOperations, conflicts, setOnlineStatus } = useSync();

  return (
    <div className="flex items-center gap-3">
      {/* Network Toggle Button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setOnlineStatus(!isOnline)}
        className={`rounded-full px-4 border ${isOnline ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20' : 'border-rose-500/50 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'}`}
      >
        {isOnline ? (
          <><Cloud className="w-4 h-4 mr-2" /> Online</>
        ) : (
          <><CloudOff className="w-4 h-4 mr-2" /> Offline</>
        )}
      </Button>

      {/* Sync Status Info */}
      <div className="flex items-center gap-4 text-sm font-medium">
        {isSyncing && (
          <div className="flex items-center text-sky-400">
            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
            Syncing...
          </div>
        )}
        
        {!isSyncing && pendingOperations.length > 0 && (
          <div className="text-amber-400 flex items-center">
            <span className="w-2 h-2 rounded-full bg-amber-400 mr-2" />
            {pendingOperations.length} Pending
          </div>
        )}

        {conflicts.length > 0 && (
          <div className="text-rose-500 flex items-center bg-rose-500/10 px-2 py-1 rounded-md animate-pulse">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {conflicts.length} Conflicts
          </div>
        )}

        {!isSyncing && isOnline && pendingOperations.length === 0 && conflicts.length === 0 && (
          <div className="text-slate-500">Up to date</div>
        )}
      </div>
    </div>
  );
}
