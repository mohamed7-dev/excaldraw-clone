import React from "react";
import { useCanvasContext } from "../canvas-provider";
import { Button } from "@/components/ui/button";
import { getBackgroundSwatches, getStrokeSwatches } from "../../lib/theme";
import { Slider } from "@/components/ui/slider";
import { useCanvasStore } from "../../lib/canvas-store";
import { FabricObject } from "fabric";

export function SharedSettings() {
  const { fabricCanvasRef } = useCanvasContext();
  const [fill, setFill] = React.useState<string>("#111111");
  const [stroke, setStroke] = React.useState<string>("#111111");
  const [strokeWidth, setStrokeWidth] = React.useState<number>(1);
  const [opacity, setOpacity] = React.useState<number>(100);
  const [cornerRadius, setCornerRadius] = React.useState<number>(0);
  const [strokeStyle, setStrokeStyle] = React.useState<
    "solid" | "dashed" | "dotted"
  >("solid");
  const [isTextSelection, setIsTextSelection] = React.useState<boolean>(false);
  const setDefaultFill = useCanvasStore((s) => s.setDefaultFill);
  const setDefaultStroke = useCanvasStore((s) => s.setDefaultStroke);
  const setDefaultStrokeWidth = useCanvasStore((s) => s.setDefaultStrokeWidth);
  const setDefaultOpacity = useCanvasStore((s) => s.setDefaultOpacity);
  const defaultFill = useCanvasStore((s) => s.defaultFill);
  const defaultStroke = useCanvasStore((s) => s.defaultStroke);
  const defaultStrokeWidth = useCanvasStore((s) => s.defaultStrokeWidth);
  const defaultOpacity = useCanvasStore((s) => s.defaultOpacity);
  const defaultCornerRadius = useCanvasStore((s) => s.defaultCornerRadius);
  const setDefaultCornerRadius = useCanvasStore(
    (s) => s.setDefaultCornerRadius
  );
  const defaultStrokeStyle = useCanvasStore((s) => s.defaultStrokeStyle);
  const setDefaultStrokeStyle = useCanvasStore((s) => s.setDefaultStrokeStyle);

  React.useEffect(() => {
    const c = fabricCanvasRef.current;
    if (!c) return;
    const syncFromActive = () => {
      const objs = c.getActiveObjects();
      if (!objs || objs.length === 0) {
        // No selection: reflect defaults into UI
        setFill(defaultFill);
        setStroke(defaultStroke);
        setStrokeWidth(defaultStrokeWidth);
        setOpacity(Math.round(defaultOpacity * 100));
        setCornerRadius(defaultCornerRadius);
        setStrokeStyle(defaultStrokeStyle);
        setIsTextSelection(false);
        return;
      }
      const o = objs[0];
      setIsTextSelection(o?.type === "i-text");
      if (o.fill) setFill(o.fill as string);
      if (o.stroke) setStroke(o.stroke as string);
      if (typeof o.strokeWidth === "number")
        setStrokeWidth(o.strokeWidth as number);
      if (typeof o.opacity === "number")
        setOpacity(Math.round((o.opacity as number) * 100));
      // if (typeof o.rx === "number") setCornerRadius(o.rx as number);
      const dash = o.strokeDashArray as number[] | undefined;
      if (!dash || dash.length === 0) setStrokeStyle("solid");
      else if (dash[0] >= 4) setStrokeStyle("dashed");
      else setStrokeStyle("dotted");
    };
    syncFromActive();
    const onSel = () => syncFromActive();
    const onMod = () => syncFromActive();
    c.on("selection:created", onSel);
    c.on("selection:updated", onSel);
    c.on("object:modified", onMod);
    return () => {
      c.off("selection:created", onSel);
      c.off("selection:updated", onSel);
      c.off("object:modified", onMod);
    };
  }, [
    fabricCanvasRef,
    defaultFill,
    defaultStroke,
    defaultStrokeWidth,
    defaultOpacity,
    defaultCornerRadius,
    defaultStrokeStyle,
  ]);

  const applyToActives = React.useCallback(
    (updater: (o: FabricObject) => void) => {
      const c = fabricCanvasRef.current;
      if (!c) return;
      const objs = c.getActiveObjects();
      if (!objs || objs.length === 0) return;
      objs.forEach((o) => updater(o));
      c.requestRenderAll();
    },
    [fabricCanvasRef]
  );

  const onFillChange = (v: string) => {
    setFill(v);
    // Do not apply background to text objects
    applyToActives((o) => {
      if (o.type !== "i-text") o.set?.({ fill: v });
    });
    setDefaultFill(v);
  };
  const onStrokeChange = (v: string) => {
    setStroke(v);
    applyToActives((o) => o.set?.({ stroke: v }));
    setDefaultStroke(v);
  };
  const onStrokeWidthChange = (v: number) => {
    setStrokeWidth(v);
    // Do not apply stroke width to text objects
    applyToActives((o) => {
      if (o.type !== "i-text") o.set?.({ strokeWidth: v });
    });
    setDefaultStrokeWidth(v);
  };
  const onOpacityChange = (v: number) => {
    setOpacity(v);
    applyToActives((o) => o.set?.({ opacity: v / 100 }));
    setDefaultOpacity(v / 100);
  };

  const applyCornerRadius = (r: number) => {
    setCornerRadius(r);
    const c = fabricCanvasRef.current;
    if (!c) return;
    const objs = c.getActiveObjects();
    if (objs && objs.length > 0) {
      objs.forEach((o) => {
        if (o.type === "rect") o.set?.({ rx: r, ry: r });
      });
      c.requestRenderAll();
    }
    setDefaultCornerRadius(r);
  };

  const strokeDashFor = (
    style: "solid" | "dashed" | "dotted"
  ): number[] | undefined => {
    switch (style) {
      case "dashed":
        return [6, 4];
      case "dotted":
        return [2, 4];
      default:
        return undefined;
    }
  };

  const onStrokeStyleChange = (style: "solid" | "dashed" | "dotted") => {
    setStrokeStyle(style);
    const dash = strokeDashFor(style);
    // Do not apply stroke style to text objects
    applyToActives((o) => {
      if (o.type !== "i-text") o.set?.({ strokeDashArray: dash });
    });
    setDefaultStrokeStyle(style);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full flex flex-col gap-2">
        <label className="text-xs text-muted-foreground">Stroke</label>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {getStrokeSwatches().map(({ name, hex }) => (
              <button
                key={name}
                type="button"
                className="size-6 rounded border border-border"
                title={name}
                aria-label={name}
                style={{ backgroundColor: hex }}
                onClick={() => onStrokeChange(hex)}
              />
            ))}
          </div>
          <input
            type="color"
            value={stroke}
            onChange={(e) => onStrokeChange(e.target.value)}
            className="h-6 w-10 p-0 border rounded"
          />
        </div>
      </div>
      {!isTextSelection && (
        <div className="w-full flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">Background</label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {getBackgroundSwatches().map(({ name, hex }) => (
                <button
                  key={name}
                  type="button"
                  className="size-6 rounded border border-border"
                  title={name}
                  aria-label={name}
                  style={{ backgroundColor: hex }}
                  onClick={() => onFillChange(hex)}
                />
              ))}
            </div>
            <input
              type="color"
              value={fill}
              onChange={(e) => onFillChange(e.target.value)}
              className="h-6 w-10 p-0 border rounded"
            />
          </div>
        </div>
      )}

      {!isTextSelection && (
        <div className="w-full flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">Stroke style</label>
          <div className="flex items-center gap-1">
            <Button
              variant={strokeStyle === "solid" ? "default" : "ghost"}
              size="sm"
              title="Solid"
              onClick={() => onStrokeStyleChange("solid")}
            >
              <svg width="24" height="16" viewBox="0 0 24 16">
                <line
                  x1="2"
                  y1="8"
                  x2="22"
                  y2="8"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                />
              </svg>
            </Button>
            <Button
              variant={strokeStyle === "dashed" ? "default" : "ghost"}
              size="sm"
              title="Dashed"
              onClick={() => onStrokeStyleChange("dashed")}
            >
              <svg width="24" height="16" viewBox="0 0 24 16">
                <line
                  x1="2"
                  y1="8"
                  x2="22"
                  y2="8"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray="6 4"
                />
              </svg>
            </Button>
            <Button
              variant={strokeStyle === "dotted" ? "default" : "ghost"}
              size="sm"
              title="Dotted"
              onClick={() => onStrokeStyleChange("dotted")}
            >
              <svg width="24" height="16" viewBox="0 0 24 16">
                <line
                  x1="2"
                  y1="8"
                  x2="22"
                  y2="8"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray="2 4"
                  strokeLinecap="round"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}
      {!isTextSelection && (
        <div className="w-full flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">Stroke Width</label>
          <div className="flex items-center gap-1">
            {[
              { w: 1, label: "Thin" },
              { w: 2, label: "Regular" },
              { w: 4, label: "Bold" },
              { w: 8, label: "Extrabold" },
            ].map(({ w, label }) => (
              <Button
                key={w}
                variant={strokeWidth === w ? "default" : "ghost"}
                size="sm"
                title={label}
                onClick={() => onStrokeWidthChange(w)}
              >
                <svg width="24" height="16" viewBox="0 0 24 16">
                  <line
                    x1="2"
                    y1="8"
                    x2="22"
                    y2="8"
                    stroke="currentColor"
                    strokeWidth={w}
                    strokeLinecap="round"
                  />
                </svg>
              </Button>
            ))}
          </div>
        </div>
      )}
      {!isTextSelection && (
        <div className="w-full flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">Edges</label>
          <div className="flex items-center gap-1">
            <Button
              variant={cornerRadius === 0 ? "default" : "ghost"}
              size="sm"
              title="Sharp"
              onClick={() => applyCornerRadius(0)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <rect
                  x="3"
                  y="3"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </Button>
            <Button
              variant={cornerRadius > 0 ? "default" : "ghost"}
              size="sm"
              title="Rounded"
              onClick={() => applyCornerRadius(12)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <rect
                  x="3"
                  y="3"
                  width="14"
                  height="14"
                  rx="4"
                  ry="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}
      <div className="w-full flex flex-col gap-2">
        <label className="text-xs text-muted-foreground">Opacity</label>
        <Slider
          value={[opacity]}
          max={100}
          min={0}
          step={1}
          onValueChange={(e) => onOpacityChange(Number(e))}
        />

        <div className="flex items-center justify-between gap-1">
          <span className="text-xs tabular-nums text-muted-foreground">0</span>
          <span className="text-xs tabular-nums text-muted-foreground">
            100
          </span>
        </div>
      </div>
    </div>
  );
}
