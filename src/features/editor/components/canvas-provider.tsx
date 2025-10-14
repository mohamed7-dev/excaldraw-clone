"use client";

import React, { createContext, useContext, useMemo, useRef } from "react";
import { Canvas as FabricCanvas } from "fabric";

type CanvasRefs = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  htmlCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  fabricCanvasRef: React.RefObject<FabricCanvas | null>;
};

const CanvasContext = createContext<CanvasRefs | null>(null);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const htmlCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);

  const value = useMemo<CanvasRefs>(
    () => ({ containerRef, htmlCanvasRef, fabricCanvasRef }),
    [containerRef, htmlCanvasRef, fabricCanvasRef]
  );

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
}

export function useCanvasContext() {
  const ctx = useContext(CanvasContext);
  if (!ctx) {
    throw new Error("useCanvasContext must be used within a CanvasProvider");
  }
  return ctx;
}
