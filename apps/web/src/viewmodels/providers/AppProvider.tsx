import type { ReactNode } from "react";
import type { ServiceRegistry } from "../../services";
import { ServiceProvider } from "./ServiceProvider";
import { ThemeProvider } from "./ThemeProvider";
import { TabProvider } from "./TabProvider";
import { EditorProvider } from "./EditorProvider";
import { ToastProvider } from "./ToastProvider";
import { DiagramComposerProvider } from "./DiagramComposerProvider";

export function AppProvider({
  registry,
  children,
}: {
  readonly registry: ServiceRegistry;
  readonly children: ReactNode;
}) {
  return (
    <ToastProvider>
      <ServiceProvider registry={registry}>
        <ThemeProvider>
          <TabProvider>
            <DiagramComposerProvider>
              <EditorProvider>
                {children}
              </EditorProvider>
            </DiagramComposerProvider>
          </TabProvider>
        </ThemeProvider>
      </ServiceProvider>
    </ToastProvider>
  );
}
