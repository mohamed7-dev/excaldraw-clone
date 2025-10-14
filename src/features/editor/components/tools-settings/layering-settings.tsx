import React from "react";
import { Button } from "@/components/ui/button";
import { useCanvasContext } from "../canvas-provider";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Canvas, FabricObject } from "fabric";

export function LayeringSettings() {
  const { fabricCanvasRef } = useCanvasContext();

  const withActives = React.useCallback(
    (fn: (c: Canvas, obj: FabricObject) => void) => {
      const c = fabricCanvasRef.current;
      if (!c) return;
      const actives = c.getActiveObjects();
      if (!actives || actives.length === 0) return;
      actives.forEach((obj) => fn(c, obj));
      c.requestRenderAll();
    },
    [fabricCanvasRef]
  );

  const bringToFront = React.useCallback(() => {
    withActives((c, obj) => c.bringObjectToFront(obj));
  }, [withActives]);

  const sendToBack = React.useCallback(() => {
    withActives((c, obj) => c.sendObjectToBack(obj));
  }, [withActives]);

  const bringForward = React.useCallback(() => {
    withActives((c, obj) => c.bringObjectForward(obj));
  }, [withActives]);

  const sendBackward = React.useCallback(() => {
    withActives((c, obj) => c.sendObjectBackwards(obj));
  }, [withActives]);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={bringForward}
        title="Bring forward"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={sendBackward}
        title="Send backward"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={bringToFront}
        title="Bring to front"
      >
        <ArrowUpToLine className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={sendToBack}
        title="Send to back"
      >
        <ArrowDownToLine className="h-4 w-4" />
      </Button>
    </div>
  );
}
