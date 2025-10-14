"use client";
import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCanvasContext } from "../../components/canvas-provider";
import { DEFAULT_DARK_BG, DEFAULT_LIGHT_BG } from "../../lib/theme";
import { Button } from "@/components/ui/button";

export const ChangeThemeItem = React.memo(function ChangeThemeItem() {
  const { setTheme, theme, systemTheme } = useTheme();
  const { fabricCanvasRef } = useCanvasContext();

  const applyWorkspaceBackground = React.useCallback(
    (val: string | undefined) => {
      const c = fabricCanvasRef.current;
      if (!c) return;
      let bg = "";
      if (val === "light") {
        bg = DEFAULT_LIGHT_BG;
      } else if (val === "dark") {
        bg = DEFAULT_DARK_BG;
      } else {
        bg = systemTheme === "dark" ? DEFAULT_DARK_BG : DEFAULT_LIGHT_BG;
      }
      c.set("backgroundColor", bg);
      c.requestRenderAll();
    },
    [fabricCanvasRef, systemTheme]
  );

  const handleThemeChange = React.useCallback(
    (val: string) => {
      setTheme(val);
      applyWorkspaceBackground(val);
    },
    [setTheme, applyWorkspaceBackground]
  );

  return (
    <DropdownMenuItem className="flex items-center justify-between [&>svg]:size-6 focus:bg-transparent">
      <span>Theme</span>
      <div className="border rounded-full p-2">
        <Button
          size={"sm"}
          variant={theme === "light" ? "secondary" : "ghost"}
          aria-label="Toggle light mode"
          onClick={() => handleThemeChange("light")}
        >
          <Sun />
        </Button>
        <Button
          size={"sm"}
          variant={theme === "dark" ? "secondary" : "ghost"}
          aria-label="Toggle dark mode"
          onClick={() => handleThemeChange("dark")}
        >
          <Moon />
        </Button>
        <Button
          size={"sm"}
          variant={theme === "system" ? "secondary" : "ghost"}
          aria-label="Toggle system theme"
          onClick={() => handleThemeChange("system")}
        >
          <Monitor />
        </Button>
      </div>
    </DropdownMenuItem>
  );
});
