import React from "react";
import { ActionsSettings } from "./actions-settings";
import { useCanvasContext } from "../canvas-provider";
import { LayeringSettings } from "./layering-settings";
import { SharedSettings } from "./shared-settings";
import { TextSettings } from "./text-settings";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

function ToolSettingsContent() {
  return (
    <>
      <div className="space-y-2">
        <section>
          <SharedSettings />
        </section>
        <section>
          <TextSettings />
        </section>
        <section>
          <h2 className="text-xs text-muted-foreground">Layering</h2>
          <div className="mt-1 flex items-center gap-1">
            <LayeringSettings />
          </div>
        </section>
        <section>
          <h2 className="text-xs text-muted-foreground">Actions</h2>
          <div className="mt-1 flex items-center gap-1">
            <ActionsSettings />
          </div>
        </section>
      </div>
    </>
  );
}

export function ToolsSettings() {
  const { fabricCanvasRef } = useCanvasContext();
  const [visible, setVisible] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    let detach: (() => void) | null = null;
    let cancelled = false;

    const attach = () => {
      const c = fabricCanvasRef.current;
      if (!c) return false;
      const sync = () => {
        const count = c.getActiveObjects()?.length || 0;
        setVisible(count > 0);
      };
      sync();
      const created = () => {
        sync();
        setOpen(false);
      };
      const updated = () => {
        sync();
        setOpen(false);
      };
      const cleared = () => {
        setVisible(false);
        setOpen(false);
      };
      const mouseUp = () => {
        sync();
        setOpen(false);
      };
      const objAdded = () => {
        sync();
        setOpen(false);
      };
      const objRemoved = () => {
        sync();
        setOpen(false);
      };
      const objModified = () => {
        sync();
        setOpen(false);
      };
      c.on("selection:created", created);
      c.on("selection:updated", updated);
      c.on("selection:cleared", cleared);
      c.on("mouse:up", mouseUp);
      c.on("object:added", objAdded);
      c.on("object:removed", objRemoved);
      c.on("object:modified", objModified);
      detach = () => {
        c.off("selection:created", created);
        c.off("selection:updated", updated);
        c.off("selection:cleared", cleared);
        c.off("mouse:up", mouseUp);
        c.off("object:added", objAdded);
        c.off("object:removed", objRemoved);
        c.off("object:modified", objModified);
      };
      return true;
    };

    if (!attach()) {
      const id = window.setInterval(() => {
        if (cancelled) return;
        if (attach()) window.clearInterval(id);
      }, 100);
      return () => {
        cancelled = true;
        window.clearInterval(id);
        if (detach) detach();
      };
    }

    return () => {
      if (detach) detach();
    };
  }, [fabricCanvasRef]);
  if (!visible) return null;

  return (
    <>
      <aside className="fixed left-4 top-[7rem] z-50 w-[95%] md:w-[17rem] hidden md:block shadow-md max-h-[60vh] overflow-y-auto rounded-lg p-2 bg-background pointer-events-auto border border-border">
        <ScrollArea className="max-h-[60vh] pr-1">
          <ToolSettingsContent />
        </ScrollArea>
      </aside>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger
          className="flex md:hidden fixed bottom-4 left-20 z-50"
          asChild
        >
          <Button variant={"outline"} size={"sm"} className="bg-background">
            <Palette />
            <span className="sr-only">open tool settings</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="p-2 px-3 h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="sr-only">Tool settings</DrawerTitle>
            <DrawerDescription className="sr-only">
              customize selected tool
            </DrawerDescription>
          </DrawerHeader>
          <ToolSettingsContent />
        </DrawerContent>
      </Drawer>
    </>
  );
}
