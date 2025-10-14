import { useEffect } from "react";
import { useCanvasStore } from "../lib/canvas-store";
import { useCanvasContext } from "../components/canvas-provider";
import { FabricObject, PencilBrush } from "fabric";

export function useEnableDrawing() {
  const tool = useCanvasStore((s) => s.tool);
  const stroke = useCanvasStore((s) => s.defaultStroke);
  const strokeWidth = useCanvasStore((s) => s.defaultStrokeWidth);
  const { fabricCanvasRef } = useCanvasContext();

  useEffect(() => {
    const c = fabricCanvasRef.current;
    if (!c) return;
    // free drawing toggle
    c.isDrawingMode = tool === "free";
    // selection only when select tool is active
    c.selection = tool === "select";
    // cursor
    c.defaultCursor =
      tool === "pan" ? "grab" : tool === "free" ? "crosshair" : "default";
    // configure brush for free drawing
    c.freeDrawingBrush = new PencilBrush(c);
    if (c.isDrawingMode && c.freeDrawingBrush) {
      c.freeDrawingBrush.color = stroke;
      c.freeDrawingBrush.width = Math.max(1, strokeWidth);
    }
    c.getObjects().forEach((o: FabricObject) => {
      o.selectable = tool === "select";
    });
    c.renderAll();
  }, [tool, stroke, strokeWidth, fabricCanvasRef]);
}
