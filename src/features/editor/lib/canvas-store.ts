import { create } from "zustand";
import type { Tool } from "./types";

type CanvasState = {
  tool: Tool;
  setTool: (t: Tool) => void;
  resetTool: () => void;
  // default drawing settings used for new objects
  defaultFill: string;
  defaultStroke: string;
  defaultStrokeWidth: number;
  defaultOpacity: number; // 0..1
  defaultCornerRadius: number; // for rects
  defaultStrokeStyle: "solid" | "dashed" | "dotted";
  setDefaultFill: (v: string) => void;
  setDefaultStroke: (v: string) => void;
  setDefaultStrokeWidth: (v: number) => void;
  setDefaultOpacity: (v: number) => void;
  setDefaultCornerRadius: (v: number) => void;
  setDefaultStrokeStyle: (v: "solid" | "dashed" | "dotted") => void;
};

export const useCanvasStore = create<CanvasState>()((set) => ({
  tool: "select",
  setTool: (t: Tool) => set({ tool: t }),
  resetTool: () => set({ tool: "select" }),
  defaultFill: "transparent",
  defaultStroke: "#f68c00",
  defaultStrokeWidth: 1,
  defaultOpacity: 1,
  defaultCornerRadius: 0,
  defaultStrokeStyle: "solid",
  setDefaultFill: (v: string) => set({ defaultFill: v }),
  setDefaultStroke: (v: string) => set({ defaultStroke: v }),
  setDefaultStrokeWidth: (v: number) => set({ defaultStrokeWidth: v }),
  setDefaultOpacity: (v: number) => set({ defaultOpacity: v }),
  setDefaultCornerRadius: (v: number) => set({ defaultCornerRadius: v }),
  setDefaultStrokeStyle: (v: "solid" | "dashed" | "dotted") => set({ defaultStrokeStyle: v }),
}));
