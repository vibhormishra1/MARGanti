"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { IRealTimeGateway, EventPayload } from "@marg/domain";
// In a real environment, this import would be injected, but for simplicity in this offline-first build, we instantiate the mock directly.
import { LocalEventBusAdapter } from "@marg/cloud-adapter";

interface RealTimeContextValue {
  gateway: IRealTimeGateway;
  isConnected: boolean;
}

const RealTimeContext = createContext<RealTimeContextValue | undefined>(undefined);

// Instantiate singleton adapter for the app
const localGateway = new LocalEventBusAdapter();

export const RealTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);

  // In a real WebSocket environment, we would connect on mount and listen to connection states here.

  return (
    <RealTimeContext.Provider value={{ gateway: localGateway, isConnected }}>
      {children}
    </RealTimeContext.Provider>
  );
};

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error("useRealTime must be used within a RealTimeProvider");
  }
  return context;
};
