"use client";
import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  CANVAS_DARK_BG,
  CANVAS_LIGHT_BG,
  DEFAULT_DARK_BG,
  DEFAULT_LIGHT_BG,
} from "../../lib/theme";
import { useCanvasContext } from "../../components/canvas-provider";

export const ChangeBackgroundItem = React.memo(function ChangeBackgroundItem() {
  const { theme } = useTheme();
  const { fabricCanvasRef } = useCanvasContext();
  const [bg, setBg] = React.useState<string>(
    theme === "light" ? DEFAULT_LIGHT_BG : DEFAULT_DARK_BG
  );

  const handleChange = (val: string) => {
    const c = fabricCanvasRef.current;
    if (!c) return;
    c.set("backgroundColor", val);
    c.requestRenderAll();
    setBg(val);
  };

  return (
    <div className="space-y-2">
      <span className="text-sm">Canvas background</span>
      <div className="flex items-center gap-2">
        <DropdownMenuItem className="focus:bg-transparent">
          <div className="flex items-center gap-2">
            {(theme === "light" ? CANVAS_LIGHT_BG : CANVAS_DARK_BG).map(
              (color) => (
                <button
                  key={color}
                  className={cn(
                    "rounded-lg size-8 border p-1",
                    bg === color && "border-2 border-primary"
                  )}
                  onClick={() => handleChange(color)}
                >
                  <span
                    className="block size-full"
                    style={{ backgroundColor: color }}
                  />
                </button>
              )
            )}
            <Separator orientation="vertical" className="h-4" />
          </div>
        </DropdownMenuItem>
      </div>
    </div>
  );
});
