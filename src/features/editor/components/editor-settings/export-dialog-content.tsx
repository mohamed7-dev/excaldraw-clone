"use client";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Download } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useCanvasContext } from "../../components/canvas-provider";
import { DEFAULT_DARK_BG, DEFAULT_LIGHT_BG } from "../../lib/theme";
import { useTheme } from "next-themes";

export default function ExportDialogContent() {
  const { fabricCanvasRef } = useCanvasContext();
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  const [exportName, setExportName] = React.useState<string>("canvas");
  const [previewUrl, setPreviewUrl] = React.useState<string>("");
  // bg: null => transparent
  const [bg, setBg] = React.useState<string | null>(
    resolvedTheme === "dark" ? DEFAULT_DARK_BG : DEFAULT_LIGHT_BG
  );
  const [mode, setMode] = React.useState<"Light" | "Dark">(
    resolvedTheme === "dark" ? "Dark" : "Light"
  );

  const regeneratePreview = React.useCallback(() => {
    const c = fabricCanvasRef.current;
    if (!c) return;
    // Remember original background
    const originalBg = c.backgroundColor as string | null | undefined;
    // Apply temporary background for preview
    c.set("backgroundColor", bg ?? "transparent");
    const url = c.toDataURL({ format: "png" as const, multiplier: 2 });
    setPreviewUrl(url);
    // Restore original background
    c.set("backgroundColor", originalBg ?? undefined);
    c.requestRenderAll();
  }, [fabricCanvasRef, bg]);

  React.useEffect(() => {
    regeneratePreview();
  }, [regeneratePreview]);

  const toggleBg = (checked: boolean) => {
    if (checked) {
      setBg(mode === "Dark" ? DEFAULT_DARK_BG : DEFAULT_LIGHT_BG);
    } else {
      setBg(null);
    }
  };

  React.useEffect(() => {
    regeneratePreview();
  }, [bg, mode, regeneratePreview]);

  const changeMode = (checked: boolean) => {
    const nextMode: "Light" | "Dark" = checked ? "Dark" : "Light";
    setMode(nextMode);
    // If background is enabled, switch to corresponding default background
    setBg((prev) =>
      prev === null
        ? null
        : nextMode === "Dark"
        ? DEFAULT_DARK_BG
        : DEFAULT_LIGHT_BG
    );
  };

  const download = (dataUrl: string, filename: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const exportImage = (format: "png" | "jpeg") => {
    const c = fabricCanvasRef.current;
    if (!c) return;
    const originalBg = c.backgroundColor as string | null | undefined;
    // JPEG doesn't support transparency; if bg is null, force a light bg
    const effectiveBg =
      format === "jpeg" ? bg ?? DEFAULT_LIGHT_BG : bg ?? "transparent";
    c.set("backgroundColor", effectiveBg);
    const url = c.toDataURL({ format, multiplier: 2 });
    download(url, `${exportName}.${format}`);
    // Restore
    c.set("backgroundColor", originalBg ?? undefined);
    c.requestRenderAll();
  };

  return (
    <AlertDialogContent
      className="sm:max-w-2xl"
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        regeneratePreview();
      }}
    >
      <div className="flex flex-col md:flex-row gap-10 md:gap-4">
        <section
          aria-label="canvas preview"
          className="w-full md:w-[60%] space-y-4"
        >
          <div className="relative w-full h-[20rem] border-2 border-secondary rounded-xl p-4 overflow-hidden">
            {previewUrl && (
              <Image
                src={previewUrl}
                alt="canvas"
                fill
                className="object-contain w-full h-full"
              />
            )}
          </div>
          <Input
            aria-label="export name"
            value={exportName}
            onChange={(e) => setExportName(e.target.value)}
            className="w-fit mx-auto"
          />
        </section>
        <div className="flex flex-col gap-4 md:gap-8">
          <AlertDialogHeader>
            <AlertDialogTitle>Export image</AlertDialogTitle>
            <AlertDialogDescription>
              Control how you want to export your canvas
            </AlertDialogDescription>
          </AlertDialogHeader>
          <section
            aria-label="customization options"
            className="flex-1 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Label htmlFor="switch-bg">Background</Label>
              <Switch
                id="switch-bg"
                checked={bg !== null}
                onCheckedChange={toggleBg}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="switch-dark">Dark mode</Label>
              <Switch
                id="switch-dark"
                checked={mode === "Dark"}
                onCheckedChange={changeMode}
              />
            </div>
          </section>
        </div>
      </div>
      <AlertDialogFooter className="gap-4 md:gap-0 sm:flex-row sm:justify-between">
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <div className="flex gap-2 items-center">
          <AlertDialogAction onClick={() => exportImage("png")}>
            <Download />
            <span>PNG</span>
          </AlertDialogAction>
          <AlertDialogAction onClick={() => exportImage("jpeg")}>
            <Download />
            <span>JPEG</span>
          </AlertDialogAction>
        </div>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
