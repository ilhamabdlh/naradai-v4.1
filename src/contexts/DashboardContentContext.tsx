import { createContext, useContext, type ReactNode } from "react";
import type { DashboardContentStore } from "@/lib/dashboard-content-types";

const DashboardContentContext = createContext<DashboardContentStore | null>(null);

export function DashboardContentProvider({
  content,
  children,
}: {
  content: DashboardContentStore | null;
  children: ReactNode;
}) {
  return (
    <DashboardContentContext.Provider value={content}>
      {children}
    </DashboardContentContext.Provider>
  );
}

export function useDashboardContent(): DashboardContentStore | null {
  return useContext(DashboardContentContext);
}
