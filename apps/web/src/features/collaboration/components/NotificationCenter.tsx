"use client";

import React, { useEffect, useState } from "react";
import { AppNotification } from "@marg/domain";
import { useNotifications } from "../api/communication.api";
import { useRealTime } from "../context/RealTimeContext";
import { Button } from "@/components/ui/button";

interface NotificationCenterProps {
  userId: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId }) => {
  const { data: historicalNotifications, isLoading } = useNotifications(userId);
  const { gateway } = useRealTime();
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);

  // Listen for live pushes
  useEffect(() => {
    const unsubscribe = gateway.subscribe(`user-${userId}-notifications`, (event) => {
      if (event.type === "NEW_NOTIFICATION") {
        setLiveNotifications((prev) => [event.data, ...prev]);
      }
    });

    return () => unsubscribe();
  }, [gateway, userId]);

  if (isLoading) return null;

  const allNotifications = [...liveNotifications, ...(historicalNotifications || [])];
  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  return (
    <div className="relative group">
      <Button variant="outline" className="relative p-2 bg-slate-900 border-slate-700 text-slate-300">
        🔔 
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown Panel */}
      <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-50 overflow-hidden">
        <div className="p-3 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
          <h4 className="font-bold text-white text-sm">Notifications</h4>
          <span className="text-xs text-blue-400 cursor-pointer hover:underline">Mark all read</span>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {allNotifications.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No new notifications</div>
          ) : (
            allNotifications.map((notif, idx) => (
              <div key={idx} className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors ${!notif.isRead ? 'bg-blue-900/10' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <h5 className="text-sm font-bold text-slate-200">{notif.title}</h5>
                  {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{notif.message}</p>
                <div className="text-[10px] text-slate-500 mt-2">
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
