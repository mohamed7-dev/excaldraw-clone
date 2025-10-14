import { CanvasEvents, Group, Line, TMat2D } from "fabric";
import { useEffect, useMemo } from "react";
import { useCanvasContext } from "../components/canvas-provider";
import { FabricObject, Rect, Circle, Triangle, IText } from "fabric";
import { useCanvasStore } from "../lib/canvas-store";

export function useDrawCanvas() {
  const { fabricCanvasRef } = useCanvasContext();
  const tool = useCanvasStore((state) => state.tool);
  const setTool = useCanvasStore((state) => state.setTool);
  const defaultFill = useCanvasStore((s) => s.defaultFill);
  const defaultStroke = useCanvasStore((s) => s.defaultStroke);
  const defaultStrokeWidth = useCanvasStore((s) => s.defaultStrokeWidth);
  const defaultOpacity = useCanvasStore((s) => s.defaultOpacity);
  const defaultCornerRadius = useCanvasStore((s) => s.defaultCornerRadius);
  const defaultStrokeStyle = useCanvasStore((s) => s.defaultStrokeStyle);

  const handlers = useMemo(() => {
    let isPanning = false;
    let start = { x: 0, y: 0 };
    let activeShape: FabricObject | null = null;
    let activeLine: Line | null = null;
    let arrowHead: Triangle | null = null;

    const dash =
      defaultStrokeStyle === "dashed"
        ? [6, 4]
        : defaultStrokeStyle === "dotted"
        ? [2, 4]
        : undefined;

    const onMouseDown = (opt: CanvasEvents["mouse:down"]) => {
      const c = fabricCanvasRef.current;
      if (!c) return;
      if (tool === "free") return; // let Fabric handle free drawing
      const pointer = c.getPointer(opt.e);
      start = { x: pointer.x, y: pointer.y };

      if (tool === "pan") {
        isPanning = true;
        c.setCursor("grabbing");
        return;
      }

      if (tool === "rect") {
        activeShape = new Rect({
          left: start.x,
          top: start.y,
          width: 0,
          height: 0,
          fill: defaultFill,
          stroke: defaultStroke,
          strokeWidth: defaultStrokeWidth,
          opacity: defaultOpacity,
          rx: defaultCornerRadius,
          ry: defaultCornerRadius,
          strokeDashArray: dash,
          selectable: false,
        });
        c.add(activeShape);
      } else if (tool === "circle") {
        activeShape = new Circle({
          left: start.x,
          top: start.y,
          radius: 0,
          fill: defaultFill,
          stroke: defaultStroke,
          strokeWidth: defaultStrokeWidth,
          opacity: defaultOpacity,
          originX: "center",
          originY: "center",
          strokeDashArray: dash,
          selectable: false,
        });
        c.add(activeShape);
      } else if (tool === "triangle") {
        activeShape = new Triangle({
          left: start.x,
          top: start.y,
          width: 0,
          height: 0,
          fill: defaultFill,
          stroke: defaultStroke,
          strokeWidth: defaultStrokeWidth,
          opacity: defaultOpacity,
          strokeDashArray: dash,
          selectable: false,
        });
        c.add(activeShape);
      } else if (tool === "line" || tool === "arrow") {
        activeLine = new Line([start.x, start.y, start.x, start.y], {
          stroke: defaultStroke,
          strokeWidth: defaultStrokeWidth,
          opacity: defaultOpacity,
          strokeDashArray: dash,
          selectable: false,
        });
        c.add(activeLine);
        if (tool === "arrow") {
          arrowHead = new Triangle({
            width: 12,
            height: 12,
            fill: defaultStroke,
            left: start.x,
            top: start.y,
            originX: "center",
            originY: "center",
            opacity: defaultOpacity,
            selectable: false,
          });
          c.add(arrowHead);
        }
      } else if (tool === "text") {
        const t = new IText("Text", {
          left: start.x,
          top: start.y,
          fontSize: 20,
          // Use stroke color for text to avoid transparent default fill
          fill: defaultStroke,
          opacity: defaultOpacity,
        });
        c.add(t);
        c.setActiveObject(t);
        t.enterEditing();
        t.hiddenTextarea?.focus();
        setTool("select");
      }
      c.renderAll();
    };

    const onMouseMove = (opt: CanvasEvents["mouse:move"]) => {
      const c = fabricCanvasRef.current;
      if (!c) return;
      if (tool === "free") return; // let Fabric handle free drawing
      const pointer = c.getPointer(opt.e);
      if (isPanning) {
        const vpt = (
          c.viewportTransform || [1, 0, 0, 1, 0, 0]
        ).slice() as number[];
        vpt[4] += pointer.x - start.x;
        vpt[5] += pointer.y - start.y;
        c.setViewportTransform(vpt as TMat2D);
        start = { x: pointer.x, y: pointer.y };
        return;
      }

      if (activeShape && activeShape.type === "rect") {
        const rect = activeShape as Rect;
        rect.set({
          width: Math.abs(pointer.x - start.x),
          height: Math.abs(pointer.y - start.y),
          left: Math.min(pointer.x, start.x),
          top: Math.min(pointer.y, start.y),
        });
      } else if (activeShape && activeShape.type === "circle") {
        const circle = activeShape as Circle;
        const rx = pointer.x - start.x;
        const ry = pointer.y - start.y;
        const r = Math.sqrt(rx * rx + ry * ry) / 2;
        circle.set({
          radius: r,
          left: (start.x + pointer.x) / 2,
          top: (start.y + pointer.y) / 2,
        });
      } else if (activeShape && activeShape.type === "triangle") {
        const tri = activeShape as Triangle;
        tri.set({
          width: Math.abs(pointer.x - start.x),
          height: Math.abs(pointer.y - start.y),
          left: Math.min(pointer.x, start.x),
          top: Math.min(pointer.y, start.y),
        });
      } else if (activeLine) {
        activeLine.set({ x2: pointer.x, y2: pointer.y });
        if (arrowHead) {
          const dx = pointer.x - start.x;
          const dy = pointer.y - start.y;
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          arrowHead.set({ left: pointer.x, top: pointer.y, angle });
        }
      }
      c.renderAll();
    };

    const onMouseUp = () => {
      const c = fabricCanvasRef.current;
      if (!c) return;
      if (tool === "free") return; // let Fabric handle free drawing
      if (isPanning) {
        isPanning = false;
        c.setCursor("grab");
      }
      if (tool === "arrow" && activeLine && arrowHead) {
        const group = new Group([activeLine, arrowHead], { selectable: true });
        c.add(group);
        c.remove(activeLine);
        c.remove(arrowHead);
        c.setActiveObject(group);
      } else if (activeShape) {
        (activeShape as FabricObject).selectable = true;
        c.setActiveObject(activeShape as FabricObject);
      } else if (activeLine) {
        activeLine.set({ selectable: true });
        c.setActiveObject(activeLine);
      }
      activeShape = null;
      activeLine = null;
      arrowHead = null;
      c.renderAll();
      // Keep pan/free tools active; revert to select for other tools
      if (!(["pan", "free"] as string[]).includes(tool)) {
        setTool("select");
      }
    };

    return { onMouseDown, onMouseMove, onMouseUp };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, setTool]);

  useEffect(() => {
    const c = fabricCanvasRef.current;
    if (!c) return;
    const down = (e: CanvasEvents["mouse:down"]) => handlers.onMouseDown(e);
    const move = (e: CanvasEvents["mouse:move"]) => handlers.onMouseMove(e);
    const up = () => handlers.onMouseUp();
    c.on("mouse:down", down);
    c.on("mouse:move", move);
    c.on("mouse:up", up);
    return () => {
      c.off("mouse:down", down);
      c.off("mouse:move", move);
      c.off("mouse:up", up);
    };
  }, [handlers, fabricCanvasRef]);
}
