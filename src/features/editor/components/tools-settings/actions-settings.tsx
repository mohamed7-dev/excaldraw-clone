import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Trash } from "lucide-react";
import { useCanvasContext } from "../../components/canvas-provider";

export function ActionsSettings() {
  const { fabricCanvasRef } = useCanvasContext();

  const onDelete = React.useCallback(() => {
    const c = fabricCanvasRef.current;
    if (!c) return;
    const actives = c.getActiveObjects();
    if (!actives || actives.length === 0) return;
    actives.forEach((obj) => c.remove(obj));
    c.discardActiveObject();
    c.requestRenderAll();
  }, [fabricCanvasRef]);

  const onDuplicate = React.useCallback(async () => {
    const c = fabricCanvasRef.current;
    if (!c) return;
    const actives = c.getActiveObjects();
    if (!actives || actives.length === 0) return;

    // Duplicate each active object with an offset
    const clones = await Promise.all(
      actives.map((obj) =>
        // Fabric v6: clone returns a Promise
        obj.clone ? obj.clone() : Promise.resolve(null)
      )
    );

    clones.filter(Boolean).forEach((clone, idx) => {
      const offset = 20 + idx * 5;
      if (clone) {
        clone?.set({
          left: (clone.left || 0) + offset,
          top: (clone.top || 0) + offset,
        });
        c.add(clone);
        c.setActiveObject(clone);
      }
    });
    c.requestRenderAll();
  }, [fabricCanvasRef]);

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={onDuplicate} title="Duplicate">
        <Copy className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onDelete} title="Delete">
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}
