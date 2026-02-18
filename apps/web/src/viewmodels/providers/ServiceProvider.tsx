import { createContext, useContext, type ReactNode } from "react";
import type { ServiceRegistry } from "../../services";

const ServiceContext = createContext<ServiceRegistry | null>(null);

export function useServices(): ServiceRegistry {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error("useServices must be used within ServiceProvider");
  return ctx;
}

export function ServiceProvider({
  registry,
  children,
}: {
  readonly registry: ServiceRegistry;
  readonly children: ReactNode;
}) {
  return (
    <ServiceContext.Provider value={registry}>
      {children}
    </ServiceContext.Provider>
  );
}
