"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Scan, RotateCcw } from "lucide-react";
import { useCanvasContext } from "../canvas-provider";
import { Point } from "fabric";

export default function ZoomControls() {
  const { fabricCanvasRef } = useCanvasContext();

  const getCanvas = () => fabricCanvasRef.current;

  const zoomIn = () => {
    const c = getCanvas();
    if (!c) return;
    const current = c.getZoom();
    const next = Math.min(current * 1.2, 5);
    const { left, top } = c.getCenter();
    const p = new Point(left, top);
    c.zoomToPoint(p, next);
    c.requestRenderAll();
  };

  const zoomOut = () => {
    const c = getCanvas();
    if (!c) return;
    const current = c.getZoom();
    const next = Math.max(current / 1.2, 0.1);
    const { left, top } = c.getCenter();
    const p = new Point(left, top);
    c.zoomToPoint(p, next);
    c.requestRenderAll();
  };

  const resetZoom = () => {
    const c = getCanvas();
    if (!c) return;
    c.setViewportTransform([1, 0, 0, 1, 0, 0]);
    c.requestRenderAll();
  };

  const getContentBounds = () => {
    const c = getCanvas();
    if (!c) return null;
    const objs = c.getObjects().filter((o) => o.visible);
    if (objs.length === 0) return null;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const o of objs) {
      const rect = o.getBoundingRect();
      minX = Math.min(minX, rect.left);
      minY = Math.min(minY, rect.top);
      maxX = Math.max(maxX, rect.left + rect.width);
      maxY = Math.max(maxY, rect.top + rect.height);
    }
    return { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
  };

  const returnToContent = () => {
    const c = getCanvas();
    if (!c) return;
    const bounds = getContentBounds();
    if (!bounds) {
      resetZoom();
      return;
    }
    const padding = 40;
    const vw = c.getWidth() - padding * 2;
    const vh = c.getHeight() - padding * 2;
    const scaleX = vw / bounds.width;
    const scaleY = vh / bounds.height;
    const nextZoom = Math.min(scaleX, scaleY, 5);

    const cx = bounds.left + bounds.width / 2;
    const cy = bounds.top + bounds.height / 2;

    const p = new Point(cx, cy);
    c.zoomToPoint(p, nextZoom);

    const vpt = c.viewportTransform;
    vpt[4] = c.getWidth() / 2 - cx * nextZoom;
    vpt[5] = c.getHeight() / 2 - cy * nextZoom;

    c.requestRenderAll();
  };

  return (
    <div className="flex items-center gap-2 rounded-md bg-background/70 border px-1">
      <Button
        size="icon"
        variant="ghost"
        onClick={zoomOut}
        aria-label="Zoom out"
      >
        <Minus />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={resetZoom}
        aria-label="Reset zoom"
      >
        <RotateCcw />
      </Button>
      <Button size="icon" variant="ghost" onClick={zoomIn} aria-label="Zoom in">
        <Plus />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={returnToContent}
        aria-label="Return to content"
      >
        <Scan />
      </Button>
    </div>
  );
}
