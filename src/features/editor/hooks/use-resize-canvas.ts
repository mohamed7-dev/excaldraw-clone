import { useCallback, useEffect } from "react";
import { useCanvasContext } from "../components/canvas-provider";

export function useResizeCanvas() {
  const { fabricCanvasRef, containerRef } = useCanvasContext();
  const resize = useCallback(() => {
    const c = fabricCanvasRef.current;
    const el = containerRef.current;
    if (!c || !el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    c.setDimensions({ width: w, height: h });
    c.renderAll();
  }, [fabricCanvasRef, containerRef]);

  useEffect(() => {
    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [resize]);
}
