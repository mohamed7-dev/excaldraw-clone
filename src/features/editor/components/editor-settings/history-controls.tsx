"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2 } from "lucide-react";
import { useHistory } from "../../hooks/use-history";

export function HistoryControls() {
  const { undo, redo, canUndo, canRedo } = useHistory();
  return (
    <div className="flex items-center gap-1 rounded-md bg-background/70 border px-1">
      <Button
        size="icon"
        variant="ghost"
        onClick={undo}
        disabled={!canUndo}
        aria-label="Undo"
        title="Undo"
      >
        <Undo2 />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={redo}
        disabled={!canRedo}
        aria-label="Redo"
        title="Redo"
      >
        <Redo2 />
      </Button>
    </div>
  );
}
