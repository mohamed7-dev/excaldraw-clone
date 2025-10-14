import { useCallback } from "react";
import { useCanvasContext } from "../components/canvas-provider";
import { useCanvasStore } from "../lib/canvas-store";
import { FabricImage } from "fabric";

export function useDrawImage({
  fileInputRef,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { fabricCanvasRef } = useCanvasContext();
  const setTool = useCanvasStore((s) => s.setTool);

  const onImagePick = useCallback(() => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  }, [fileInputRef]);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const c = fabricCanvasRef.current;
        if (!c) return;
        FabricImage.fromURL(dataUrl).then((img: FabricImage) => {
          const zoom = c.getZoom() || 1;
          const viewW = (c.getWidth() || 0) / zoom;
          const viewH = (c.getHeight() || 0) / zoom;
          const iw = img.width || 1;
          const ih = img.height || 1;
          const scale = Math.min(1, Math.min(viewW / iw, viewH / ih) * 0.8);

          // Compute world-space center of the current viewport
          const vpt = c.viewportTransform || [1, 0, 0, 1, 0, 0];
          const cx = (c.getWidth() / 2 - vpt[4]) / (vpt[0] || 1);
          const cy = (c.getHeight() / 2 - vpt[5]) / (vpt[3] || 1);

          img.set({
            left: cx - (iw * scale) / 2,
            top: cy - (ih * scale) / 2,
            scaleX: scale,
            scaleY: scale,
          });
          // Persist the dataURL on the object so toJSON(["dataURL"]) includes it
          img.set({ dataURL: dataUrl });
          c.add(img);
          c.setActiveObject(img);
          c.renderAll();
          setTool("select");
        });
      };
      reader.readAsDataURL(file);
      e.currentTarget.value = "";
    },
    [setTool, fabricCanvasRef]
  );

  return {
    onImagePick,
    onFileChange,
  };
}
