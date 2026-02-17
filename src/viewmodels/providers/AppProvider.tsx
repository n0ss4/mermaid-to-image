import React from "react";
import type { ServiceRegistry } from "../../services";
import { ServiceProvider } from "./ServiceProvider";
import { ThemeProvider } from "./ThemeProvider";
import { TabProvider } from "./TabProvider";
import { EditorProvider } from "./EditorProvider";

export function AppProvider({
  registry,
  children,
}: {
  registry: ServiceRegistry;
  children: React.ReactNode;
}) {
  return (
    <ServiceProvider registry={registry}>
      <ThemeProvider>
        <TabProvider>
          <EditorProvider>
            {children}
          </EditorProvider>
        </TabProvider>
      </ThemeProvider>
    </ServiceProvider>
  );
}
