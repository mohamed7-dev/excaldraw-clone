"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useCanvasContext } from "../components/canvas-provider";
import { Canvas } from "fabric";

const STORAGE_SCENE = "excaldraw-clone:scene";
const STORAGE_EDITOR = "excaldraw-clone:editor";

export function usePersistCanvas() {
  const { fabricCanvasRef } = useCanvasContext();
  const debounceSceneRef = React.useRef<number | null>(null);
  const debounceEditorRef = React.useRef<number | null>(null);
  const attachedRef = React.useRef(false);
  const attachedCanvasRef = React.useRef<Canvas | null>(null);
  const detachRef = React.useRef<null | (() => void)>(null);
  const isRestoringRef = React.useRef(false);
  const originalSetRef = React.useRef<null | ((...args: any[]) => any)>(null);
  const originalRequestRenderAllRef = React.useRef<
    null | ((...args: any[]) => any)
  >(null);

  const getCanvas = React.useCallback(
    () => fabricCanvasRef.current,
    [fabricCanvasRef]
  );

  // sanitize helpers reused for scene/editor JSON objects
  const sanitizeObjects = React.useCallback((objects: any[]): any[] => {
    return objects
      .map((obj) => {
        if (obj.type === "image") {
          const hasDataURL =
            typeof obj.dataURL === "string" && obj.dataURL.startsWith("data:");
          const src: string | undefined = obj.src;
          const isBlob = typeof src === "string" && src.startsWith("blob:");
          if (hasDataURL) {
            obj.src = obj.dataURL;
          } else if (isBlob) {
            return null;
          }
        }
        if (
          obj.fill &&
          typeof obj.fill === "object" &&
          obj.fill.type === "pattern"
        ) {
          const psrc: string | undefined = obj.fill.src || obj.fill.source;
          if (typeof psrc === "string" && psrc.startsWith("blob:"))
            obj.fill = undefined;
        }
        if (
          obj.stroke &&
          typeof obj.stroke === "object" &&
          obj.stroke.type === "pattern"
        ) {
          const psrc: string | undefined = obj.stroke.src || obj.stroke.source;
          if (typeof psrc === "string" && psrc.startsWith("blob:"))
            obj.stroke = undefined;
        }
        if (Array.isArray(obj.objects))
          obj.objects = sanitizeObjects(obj.objects);
        return obj;
      })
      .filter(Boolean);
  }, []);

  const sanitizeSceneJSON = React.useCallback(
    (json: any) => {
      if (Array.isArray(json?.objects))
        json.objects = sanitizeObjects(json.objects);
      if (json?.backgroundImage && typeof json.backgroundImage === "object") {
        const bsrc: string | undefined = json.backgroundImage.src;
        if (typeof bsrc === "string" && bsrc.startsWith("blob:"))
          delete json.backgroundImage;
      }
      return json;
    },
    [sanitizeObjects]
  );

  const saveScene = React.useCallback(() => {
    const c = getCanvas();
    if (!c) return;
    if (isRestoringRef.current) return;
    try {
      const json = sanitizeSceneJSON((c as any).toJSON(["dataURL"]));
      localStorage.setItem(STORAGE_SCENE, JSON.stringify(json));
    } catch {}
  }, [sanitizeSceneJSON, getCanvas]);

  const saveEditor = React.useCallback(() => {
    const c = getCanvas();
    if (!c) return;
    if (isRestoringRef.current) return;
    try {
      const vpt = c.viewportTransform as any;
      const bgColor = (c as any).backgroundColor ?? null;
      // We only track backgroundColor here; backgroundImage can be added later if needed using dataURL
      const editor = { vpt, bgColor };
      localStorage.setItem(STORAGE_EDITOR, JSON.stringify(editor));
    } catch {}
  }, [getCanvas]);

  const scheduleSaveScene = React.useCallback(() => {
    if (debounceSceneRef.current) window.clearTimeout(debounceSceneRef.current);
    debounceSceneRef.current = window.setTimeout(() => saveScene(), 250);
  }, [saveScene]);

  const scheduleSaveEditor = React.useCallback(() => {
    if (debounceEditorRef.current)
      window.clearTimeout(debounceEditorRef.current);
    debounceEditorRef.current = window.setTimeout(() => saveEditor(), 250);
  }, [saveEditor]);

  React.useEffect(() => {
    let retryId: number | null = null;
    let c: Canvas | null = null;

    const attach = () => {
      c = getCanvas();
      if (!c) return false;
      // If we were attached to a different canvas instance, detach first
      if (attachedCanvasRef.current && attachedCanvasRef.current !== c) {
        if (detachRef.current) detachRef.current();
        attachedRef.current = false;
        attachedCanvasRef.current = null;
        detachRef.current = null;
      }
      if (!attachedRef.current) {
        const onAdded = () => scheduleSaveScene();
        const onModified = () => scheduleSaveScene();
        const onRemoved = () => scheduleSaveScene();
        const onPath = () => scheduleSaveScene();
        const onWheel = () => scheduleSaveEditor();
        const onMouseUp = () => scheduleSaveEditor();
        c.on("object:added", onAdded);
        c.on("object:modified", onModified);
        c.on("object:removed", onRemoved);
        c.on("path:created", onPath);
        c.on("mouse:wheel", onWheel);
        c.on("mouse:up", onMouseUp);
        // Intercept set() to catch background changes
        originalSetRef.current = c.set?.bind(c) ?? null;
        if (originalSetRef.current) {
          c.set = (...args: any[]) => {
            try {
              // Forms: set(key, value) or set({ ...props })
              if (args.length === 2) {
                const key = String(args[0]);
                if (key === "backgroundColor" || key === "backgroundImage") {
                  scheduleSaveEditor();
                }
              } else if (
                args.length === 1 &&
                args[0] &&
                typeof args[0] === "object"
              ) {
                const props = args[0] as Record<string, any>;
                if ("backgroundColor" in props || "backgroundImage" in props) {
                  scheduleSaveEditor();
                }
              }
            } catch {}
            return originalSetRef.current?.(...args);
          };
        }
        // Intercept requestRenderAll to catch direct property assignments (e.g., backgroundColor = ...)
        originalRequestRenderAllRef.current =
          c.requestRenderAll?.bind(c) ?? null;
        if (originalRequestRenderAllRef.current) {
          c.requestRenderAll = (...args: any[]) => {
            try {
              scheduleSaveEditor();
            } catch {}
            return originalRequestRenderAllRef.current?.(...args);
          };
        }
        attachedRef.current = true;
        attachedCanvasRef.current = c;
        detachRef.current = () => {
          c?.off("object:added", onAdded);
          c?.off("object:modified", onModified);
          c?.off("object:removed", onRemoved);
          c?.off("path:created", onPath);
          c?.off("mouse:wheel", onWheel);
          c?.off("mouse:up", onMouseUp);
          // restore original set
          if (originalSetRef.current && c?.set) {
            c.set = originalSetRef.current;
            originalSetRef.current = null;
          }
          if (originalRequestRenderAllRef.current && c?.requestRenderAll) {
            c.requestRenderAll = originalRequestRenderAllRef.current;
            originalRequestRenderAllRef.current = null;
          }
        };
      }
      try {
        const storedScene = localStorage.getItem(STORAGE_SCENE);
        if (storedScene) {
          const scene = sanitizeSceneJSON(JSON.parse(storedScene));
          // sanitize before load: drop/replace blob URLs
          isRestoringRef.current = true;
          return c.loadFromJSON(scene).then(() => {
            // then apply editor state (viewport + bg)
            const storedEditor = localStorage.getItem(STORAGE_EDITOR);
            if (storedEditor) {
              try {
                const editor = JSON.parse(storedEditor);
                if (Array.isArray(editor?.vpt) && editor.vpt.length === 6) {
                  c?.setViewportTransform(editor.vpt as any);
                }
                c?.set(
                  "backgroundColor",
                  editor?.bgColor ?? c?.backgroundColor
                );
              } catch {}
            }
            c?.requestRenderAll();
            window.setTimeout(() => {
              isRestoringRef.current = false;
              // seed a fresh scene save after restore completes
              saveScene();
            }, 0);
          });
        }
        // No stored scene; seed current (possibly empty) scene to storage
        saveScene();
      } catch {}
      return true;
    };

    if (!attach()) {
      retryId = window.setInterval(() => {
        if (attach() && retryId) {
          window.clearInterval(retryId);
          retryId = null;
        }
      }, 100);
    }

    return () => {
      if (retryId) window.clearInterval(retryId);
      if (debounceSceneRef.current)
        window.clearTimeout(debounceSceneRef.current);
      if (debounceEditorRef.current)
        window.clearTimeout(debounceEditorRef.current);
      if (detachRef.current) detachRef.current();
      attachedRef.current = false;
      attachedCanvasRef.current = null;
      detachRef.current = null;
    };
  }, [
    scheduleSaveScene,
    scheduleSaveEditor,
    sanitizeSceneJSON,
    getCanvas,
    saveScene,
  ]);
}
