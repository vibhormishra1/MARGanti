"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { IMapEngine } from "@marg/map-offline";

interface MapContextValue {
  engine: IMapEngine | null;
}

const MapContext = createContext<MapContextValue>({ engine: null });

export const MapProvider = ({ engine, children }: { engine: IMapEngine | null; children: ReactNode }) => {
  return <MapContext.Provider value={{ engine }}>{children}</MapContext.Provider>;
};

export const useMapEngine = () => useContext(MapContext);
