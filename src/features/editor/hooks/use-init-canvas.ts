import { useEffect } from "react";
import { Canvas as FabricCanvas, FabricObject } from "fabric";
import { useCanvasContext } from "../components/canvas-provider";
import { useTheme } from "next-themes";
import {
  CANVAS_PROTOTYPE_CONFIG,
  DEFAULT_DARK_BG,
  DEFAULT_LIGHT_BG,
} from "../lib/theme";

export function useInitCanvas() {
  const { fabricCanvasRef, htmlCanvasRef, containerRef } = useCanvasContext();

  const { theme } = useTheme();
  // initialize canvas
  useEffect(() => {
    if (!htmlCanvasRef.current) return;
    const c = new FabricCanvas(htmlCanvasRef.current, {
      selection: true,
      preserveObjectStacking: true,
    });
    fabricCanvasRef.current = c;
    const el = containerRef.current;
    if (el) {
      FabricObject.prototype.set(CANVAS_PROTOTYPE_CONFIG);
      c.setDimensions({ width: el.clientWidth, height: el.clientHeight });
      c.backgroundColor =
        theme === "light" ? DEFAULT_LIGHT_BG : DEFAULT_DARK_BG;
      c.renderAll();
    }
    return () => {
      c.dispose();
      fabricCanvasRef.current = null;
    };
  }, [fabricCanvasRef, htmlCanvasRef, containerRef, theme]);
}
