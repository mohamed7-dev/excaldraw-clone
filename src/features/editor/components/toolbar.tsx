"use client";

import React from "react";
import {
  Circle as CircleIcon,
  Hand,
  Image as ImageIcon,
  Minus,
  Pointer,
  Square,
  Text as TextIcon,
  Triangle as TriangleIcon,
  ArrowRight,
  Pen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "../lib/canvas-store";
import { Tool } from "../lib/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type Props = {
  onImagePick: () => void;
};

export function Toolbar({ onImagePick }: Props) {
  const { tool: active, setTool } = useCanvasStore();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const IconButton = ({
    t,
    label,
    children,
  }: {
    t: Tool;
    label: string;
    children: React.ReactNode;
  }) => (
    <Button
      type="button"
      variant={active == t ? "default" : "ghost"}
      aria-label={label}
      aria-pressed={active == t}
      onClick={() => (t === "image" ? onImagePick() : setTool(t))}
      title={label}
    >
      {children}
    </Button>
  );

  return (
    <div ref={containerRef} className="relative max-w-[90vw]">
      <ScrollArea>
        <div
          className={
            "inline-flex items-center gap-1 bg-background border border-border shadow-md rounded-lg"
          }
        >
          <IconButton t="select" label="Select">
            <Pointer className="h-4 w-4" />
          </IconButton>
          <IconButton t="pan" label="Pan">
            <Hand className="h-4 w-4" />
          </IconButton>
          <div className="mx-1 h-5 w-px bg-border" />
          <IconButton t="rect" label="Rectangle">
            <Square className="h-4 w-4" />
          </IconButton>
          <IconButton t="circle" label="Circle">
            <CircleIcon className="h-4 w-4" />
          </IconButton>
          <IconButton t="triangle" label="Triangle">
            <TriangleIcon className="h-4 w-4" />
          </IconButton>
          <IconButton t="line" label="Line">
            <Minus className="h-4 w-4" />
          </IconButton>
          <IconButton t="arrow" label="Arrow">
            <ArrowRight className="h-4 w-4" />
          </IconButton>
          <IconButton t="free" label="Freehand">
            <Pen className="h-4 w-4" />
          </IconButton>
          <IconButton t="text" label="Text">
            <TextIcon className="h-4 w-4" />
          </IconButton>
          <IconButton t="image" label="Image">
            <ImageIcon className="h-4 w-4" />
          </IconButton>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
