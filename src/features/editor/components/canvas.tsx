"use client";

import React from "react";
import { useInitCanvas } from "../hooks/use-init-canvas";
import { useResizeCanvas } from "../hooks/use-resize-canvas";
import { useDrawCanvas } from "../hooks/use-draw-canvas";
import { useCanvasContext } from "./canvas-provider";
import { useEnableDrawing } from "../hooks/use-enable-drawing";
import { useShortcuts } from "../hooks/use-shortcuts";
import { usePersistCanvas } from "../hooks/use-persist-canvas";

export function Canvas() {
  const { containerRef, htmlCanvasRef } = useCanvasContext();

  // listeners
  useInitCanvas();
  useResizeCanvas();
  useDrawCanvas();
  useEnableDrawing();
  useShortcuts();
  usePersistCanvas();

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100vh] overflow-hidden"
    >
      <canvas ref={htmlCanvasRef} />
    </div>
  );
}
