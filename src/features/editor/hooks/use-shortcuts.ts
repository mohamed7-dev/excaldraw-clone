"use client";
import { useEffect } from "react";
import { useCanvasContext } from "../components/canvas-provider";
import { useCanvasStore } from "../lib/canvas-store";
import { useHistory } from "./use-history";
import { ActiveSelection, FabricObject, Point } from "fabric";

export function useShortcuts() {
  const { fabricCanvasRef } = useCanvasContext();
  const setTool = useCanvasStore((s) => s.setTool);
  const { undo, redo } = useHistory();

  useEffect(() => {
    const c = fabricCanvasRef.current;
    if (!c) return;

    const zoomIn = () => {
      const current = c.getZoom();
      const next = Math.min(current * 1.2, 5);
      const { left, top } = c.getCenter();
      const pt = new Point(left, top);
      c.zoomToPoint(pt, next);
      c.requestRenderAll();
    };

    const zoomOut = () => {
      const current = c.getZoom();
      const next = Math.max(current / 1.2, 0.1);
      const { left, top } = c.getCenter();
      const pt = new Point(left, top);
      c.zoomToPoint(pt, next);
      c.requestRenderAll();
    };

    const resetZoom = () => {
      c.setViewportTransform([1, 0, 0, 1, 0, 0]);
      c.requestRenderAll();
    };

    const fitContent = () => {
      const objs = c.getObjects().filter((o) => o.visible);
      if (objs.length === 0) {
        resetZoom();
        return;
      }
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const o of objs) {
        const rect = (o as FabricObject).getBoundingRect();
        minX = Math.min(minX, rect.left);
        minY = Math.min(minY, rect.top);
        maxX = Math.max(maxX, rect.left + rect.width);
        maxY = Math.max(maxY, rect.top + rect.height);
      }
      const bounds = {
        left: minX,
        top: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
      const padding = 40;
      const vw = c.getWidth() - padding * 2;
      const vh = c.getHeight() - padding * 2;
      const scaleX = vw / bounds.width;
      const scaleY = vh / bounds.height;
      const nextZoom = Math.min(scaleX, scaleY, 5);
      const cx = bounds.left + bounds.width / 2;
      const cy = bounds.top + bounds.height / 2;
      const pt = new Point(cx, cy);
      c.zoomToPoint(pt, nextZoom);
      const vpt = c.viewportTransform;
      vpt[4] = c.getWidth() / 2 - cx * nextZoom;
      vpt[5] = c.getHeight() / 2 - cy * nextZoom;
      c.requestRenderAll();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      // History
      if (ctrl && key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if (ctrl && key === "y") {
        e.preventDefault();
        redo();
        return;
      }
      // Select All
      if (ctrl && key === "a") {
        e.preventDefault();
        const objs = c.getObjects().filter((o) => o.visible);
        if (objs.length > 0) {
          // switch to select tool to allow selection affordances
          setTool("select");
          c.discardActiveObject();
          const sel = new ActiveSelection(objs, { canvas: c });
          c.setActiveObject(sel as FabricObject);
          c.requestRenderAll();
        }
        return;
      }
      // Zoom
      if (ctrl && (key === "+" || key === "=")) {
        e.preventDefault();
        zoomIn();
        return;
      }
      if (ctrl && key === "-") {
        e.preventDefault();
        zoomOut();
        return;
      }
      if (key === "0" && ctrl) {
        e.preventDefault();
        resetZoom();
        return;
      }
      if (key === "f") {
        e.preventDefault();
        fitContent();
        return;
      }
      // Tools
      switch (key) {
        case "v": // select
          setTool("select");
          break;
        case "h": // hand/pan
        case "space":
          setTool("pan");
          break;
        case "p": // pencil freehand
          setTool("free");
          break;
        case "r": // rect
          setTool("rect");
          break;
        case "t": // triangle
          setTool("triangle");
          break;
        case "c": // circle (o for oval)
          setTool("circle");
          break;
        case "x": // text
          setTool("text");
          break;
        case "l": // line
          setTool("line");
          break;
        case "a": // arrow
          setTool("arrow");
          break;
        case "i": // image picker
          setTool("image");
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fabricCanvasRef, setTool, undo, redo]);
}
