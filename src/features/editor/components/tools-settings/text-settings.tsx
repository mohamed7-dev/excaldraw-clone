import React from "react";
import { useCanvasContext } from "../canvas-provider";
import { Button } from "@/components/ui/button";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Pencil,
  Type as TypeIcon,
  Code as CodeIcon,
} from "lucide-react";
import { IText } from "fabric";

export function TextSettings() {
  const { fabricCanvasRef } = useCanvasContext();
  const [fontFamily, setFontFamily] = React.useState<string>("inherit");
  const [fontSize, setFontSize] = React.useState<number>(16);
  const [textAlign, setTextAlign] = React.useState<"left" | "center" | "right">(
    "left"
  );
  const [hasText, setHasText] = React.useState<boolean>(false);

  const syncFromActive = React.useCallback(() => {
    const c = fabricCanvasRef.current;
    if (!c) return;
    const actives = c.getActiveObjects();
    if (!actives || actives.length === 0) {
      setHasText(false);
      return;
    }
    const textObj = actives.find((o) => o instanceof IText) as
      | IText
      | undefined;
    if (!textObj) {
      setHasText(false);
      return;
    }
    setHasText(true);
    if (textObj.fontFamily) setFontFamily(textObj.fontFamily);
    if (typeof textObj.fontSize === "number") setFontSize(textObj.fontSize);
    if (textObj.textAlign)
      setTextAlign(textObj.textAlign as "left" | "center" | "right");
  }, [fabricCanvasRef]);

  React.useEffect(() => {
    const c = fabricCanvasRef.current;
    if (!c) return;
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
  }, [fabricCanvasRef, syncFromActive]);

  const applyToActiveTexts = React.useCallback(
    (updater: (t: IText) => void) => {
      const c = fabricCanvasRef.current;
      if (!c) return;
      const actives = c.getActiveObjects();
      if (!actives || actives.length === 0) return;
      let changed = false;
      actives.forEach((o) => {
        if (o instanceof IText) {
          updater(o);
          changed = true;
        }
      });
      if (changed) c.requestRenderAll();
    },
    [fabricCanvasRef]
  );

  const setFamily = (familyKey: "hand" | "normal" | "code") => {
    const family =
      familyKey === "hand"
        ? '"Comic Sans MS", "Comic Sans", cursive'
        : familyKey === "code"
        ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
        : 'system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
    setFontFamily(family);
    applyToActiveTexts((t) => t.set({ fontFamily: family }));
  };

  const setSize = (sizeKey: "sm" | "md" | "lg" | "xl") => {
    const size =
      sizeKey === "sm"
        ? 14
        : sizeKey === "md"
        ? 18
        : sizeKey === "lg"
        ? 24
        : 32;
    setFontSize(size);
    applyToActiveTexts((t) => t.set({ fontSize: size }));
  };

  const setAlign = (align: "left" | "center" | "right") => {
    setTextAlign(align);
    applyToActiveTexts((t) => t.set({ textAlign: align }));
  };
  if (!hasText) return null;
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="w-full flex flex-col gap-2">
        <label className="text-xs text-muted-foreground">Font Family</label>
        <div className="flex items-center gap-1">
          <Button
            variant={fontFamily.includes("Comic Sans") ? "default" : "ghost"}
            size="sm"
            onClick={() => setFamily("hand")}
            disabled={!hasText}
            title="Handdrawn"
            aria-label="Handdrawn"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant={fontFamily.includes("monospace") ? "ghost" : "default"}
            size="sm"
            onClick={() => setFamily("normal")}
            disabled={!hasText}
            title="Normal"
            aria-label="Normal"
          >
            <TypeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={fontFamily.includes("monospace") ? "default" : "ghost"}
            size="sm"
            onClick={() => setFamily("code")}
            disabled={!hasText}
            title="Code"
            aria-label="Code"
          >
            <CodeIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2">
        <label className="text-xs text-muted-foreground">Font Size</label>
        <div className="flex items-center gap-1">
          {[
            { k: "sm", n: 14, label: "S" },
            { k: "md", n: 18, label: "M" },
            { k: "lg", n: 24, label: "L" },
            { k: "xl", n: 32, label: "XL" },
          ].map(({ k, n, label }) => (
            <Button
              key={k}
              variant={fontSize === n ? "default" : "ghost"}
              size="sm"
              onClick={() => setSize(k as "sm" | "md" | "lg" | "xl")}
              disabled={!hasText}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col gap-2">
        <label className="text-xs text-muted-foreground">Alignment</label>
        <div className="flex items-center gap-1">
          <Button
            variant={textAlign === "left" ? "default" : "ghost"}
            size="sm"
            onClick={() => setAlign("left")}
            disabled={!hasText}
            title="Align left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={textAlign === "center" ? "default" : "ghost"}
            size="sm"
            onClick={() => setAlign("center")}
            disabled={!hasText}
            title="Align center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={textAlign === "right" ? "default" : "ghost"}
            size="sm"
            onClick={() => setAlign("right")}
            disabled={!hasText}
            title="Align right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
