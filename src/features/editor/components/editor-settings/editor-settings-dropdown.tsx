"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ImageDown, Menu, Trash } from "lucide-react";
import React from "react";
import { ChangeBackgroundItem } from "./change-background-item";
import { ChangeThemeItem } from "./change-theme-item";
import { useCanvasContext } from "../canvas-provider";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ExportDialogContent from "./export-dialog-content";
import ZoomControls from "./zoom-controls";

export function EditorSettingsDropdown() {
  const { fabricCanvasRef } = useCanvasContext();

  const handleResettingCanvas = () => {
    const c = fabricCanvasRef.current;
    if (!c) return;
    // Discard any active selection
    c.discardActiveObject();
    // Remove all objects
    c.getObjects().forEach((obj) => c.remove(obj));
    // Reset viewport (pan/zoom)
    c.setViewportTransform([1, 0, 0, 1, 0, 0]);
    // Optional: reset cursor
    c.setCursor("default");
    // Re-render
    c.requestRenderAll();
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={"icon"} variant={"ghost"}>
            <Menu />
            <span className="sr-only">editor settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[15rem] rounded-xl space-y-2 bg-background p-2"
        >
          <DropdownMenuGroup className="space-y-2">
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="flex items-center">
                <ImageDown />
                <span>Export image...</span>
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <DropdownMenuItem
              className="flex items-center"
              onClick={handleResettingCanvas}
            >
              <Trash />
              <span>Reset canvas</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className="flex items-center justify-between gap-1">
            <span className="text-xs text-muted-foreground">Zoom</span>
            <ZoomControls />
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <ChangeThemeItem />
            <ChangeBackgroundItem />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ExportDialogContent />
    </AlertDialog>
  );
}
