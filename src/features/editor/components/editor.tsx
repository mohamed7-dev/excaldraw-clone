"use client";
import React from "react";
import { Canvas } from "./canvas";
import ZoomControls from "./editor-settings/zoom-controls";
import { HistoryControls } from "./editor-settings/history-controls";
import { Toolbar } from "./toolbar";
import { useDrawImage } from "../hooks/use-draw-image";
import { ToolsSettings } from "./tools-settings";

export function Editor() {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const { onImagePick, onFileChange } = useDrawImage({ fileInputRef });
  return (
    <>
      <section
        aria-label="toolbar"
        className="fixed z-50 top-4 left-1/2 -translate-x-1/2"
      >
        <Toolbar onImagePick={onImagePick} />
      </section>
      <Canvas />
      <section
        aria-label="zoom controls"
        className="hidden md:flex fixed bottom-4 left-4 z-50"
      >
        <ZoomControls />
      </section>
      <section
        aria-label="history controls"
        className="fixed bottom-4 right-4 z-50"
      >
        <HistoryControls />
      </section>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />
      <section aria-label="tools settings">
        <ToolsSettings />
      </section>
    </>
  );
}
