"use client";
import React from "react";
import { useCanvasContext } from "../components/canvas-provider";
import { Canvas } from "fabric";

export function useHistory() {
  const { fabricCanvasRef } = useCanvasContext();
  const undoStack = React.useRef<string[]>([]);
  const redoStack = React.useRef<string[]>([]);
  const isRestoring = React.useRef(false);
  const debounceTimer = React.useRef<number | null>(null);
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);
  const MAX_STACK = 100;

  const getCanvas = React.useCallback(
    () => fabricCanvasRef.current,
    [fabricCanvasRef]
  );
  const snapshot = React.useCallback(() => {
    const c = getCanvas();
    if (!c) return "";
    return JSON.stringify(c.toJSON());
  }, [getCanvas]);

  const updateFlags = () => {
    setCanUndo(undoStack.current.length > 1);
    setCanRedo(redoStack.current.length > 0);
  };

  const pushSnapshot = React.useCallback(() => {
    if (isRestoring.current) return;
    const s = snapshot();
    if (!s) return;
    // avoid pushing duplicate consecutive states
    const last = undoStack.current[undoStack.current.length - 1];
    if (last === s) return;
    undoStack.current.push(s);
    // trim to last MAX_STACK states
    if (undoStack.current.length > MAX_STACK) {
      undoStack.current.splice(0, undoStack.current.length - MAX_STACK);
    }
    redoStack.current = [];
    updateFlags();
  }, [snapshot]);

  const schedulePush = React.useCallback(() => {
    if (isRestoring.current) return;
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      pushSnapshot();
    }, 150);
  }, [pushSnapshot]);

  const undo = React.useCallback(async () => {
    const c = getCanvas();
    if (!c) return;
    if (undoStack.current.length <= 1) return;
    const current = undoStack.current.pop()!;
    redoStack.current.push(current);
    const prev = undoStack.current[undoStack.current.length - 1];
    isRestoring.current = true;
    await c.loadFromJSON(JSON.parse(prev));
    c.requestRenderAll();
    isRestoring.current = false;
    updateFlags();
  }, [getCanvas]);

  const redo = React.useCallback(async () => {
    const c = getCanvas();
    if (!c) return;
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    // push current into undo before moving forward
    const cur = snapshot();
    if (cur) {
      undoStack.current.push(cur);
      if (undoStack.current.length > MAX_STACK) {
        undoStack.current.splice(0, undoStack.current.length - MAX_STACK);
      }
    }
    isRestoring.current = true;
    await c.loadFromJSON(JSON.parse(next));
    c.requestRenderAll();
    isRestoring.current = false;
    updateFlags();
  }, [snapshot, getCanvas]);

  // initialize and bind listeners (waits for canvas if not yet ready)
  React.useEffect(() => {
    let retryId: number | null = null;

    const attach = (canvas: Canvas) => {
      // seed initial state
      undoStack.current = [snapshot()];
      redoStack.current = [];
      updateFlags();

      const onAdded = () => schedulePush();
      const onModified = () => schedulePush();
      const onRemoved = () => schedulePush();
      const onPath = () => schedulePush();

      canvas.on("object:added", onAdded);
      canvas.on("object:modified", onModified);
      canvas.on("object:removed", onRemoved);
      canvas.on("path:created", onPath);

      return () => {
        canvas.off("object:added", onAdded);
        canvas.off("object:modified", onModified);
        canvas.off("object:removed", onRemoved);
        canvas.off("path:created", onPath);
      };
    };

    let detach: (() => void) | null = null;

    const tryInit = () => {
      const c = getCanvas();
      if (!c) return false;
      detach = attach(c);
      return true;
    };

    if (!tryInit()) {
      retryId = window.setInterval(() => {
        if (tryInit() && retryId) {
          window.clearInterval(retryId);
          retryId = null;
        }
      }, 100);
    }

    return () => {
      if (retryId) window.clearInterval(retryId);
      if (detach) detach();
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [getCanvas, snapshot, schedulePush]);

  return { undo, redo, canUndo, canRedo };
}
