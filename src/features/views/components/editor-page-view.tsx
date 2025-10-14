import { CanvasProvider } from "@/features/editor/components/canvas-provider";
import { Editor } from "@/features/editor/components/editor";
import { EditorSettingsDropdown } from "@/features/editor/components/editor-settings/editor-settings-dropdown";
import React from "react";

export function EditorPageView() {
  return (
    <CanvasProvider>
      <header>
        <div className="fixed bottom-4 md:top-4 left-4 z-50 h-fit flex items-center">
          <EditorSettingsDropdown />
        </div>
      </header>
      <main>
        <Editor />
      </main>
    </CanvasProvider>
  );
}
