import { createContext, useContext, useState, type ReactNode } from "react";

export type TimeHorizon = "7d" | "30d" | "90d";

export const TIME_HORIZON_OPTIONS: { value: TimeHorizon; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

export interface DataFilter {
  projectId: string;
  timeHorizon: TimeHorizon;
}

interface DataFilterContextValue {
  pendingFilter: DataFilter;
  appliedFilter: DataFilter;
  setPendingProject: (id: string) => void;
  setPendingTimeHorizon: (h: TimeHorizon) => void;
  applyFilter: () => void;
  isDirty: boolean;
}

const defaultFilter: DataFilter = {
  projectId: "",
  timeHorizon: "30d",
};

const DataFilterContext = createContext<DataFilterContextValue>({
  pendingFilter: defaultFilter,
  appliedFilter: defaultFilter,
  setPendingProject: () => {},
  setPendingTimeHorizon: () => {},
  applyFilter: () => {},
  isDirty: false,
});

export function DataFilterProvider({
  initialProjectId,
  children,
}: {
  initialProjectId: string;
  children: ReactNode;
}) {
  const init = { ...defaultFilter, projectId: initialProjectId };
  const [pendingFilter, setPendingFilter] = useState<DataFilter>(init);
  const [appliedFilter, setAppliedFilter] = useState<DataFilter>(init);

  const isDirty =
    pendingFilter.projectId !== appliedFilter.projectId ||
    pendingFilter.timeHorizon !== appliedFilter.timeHorizon;

  const setPendingProject = (id: string) =>
    setPendingFilter((f) => ({ ...f, projectId: id }));

  const setPendingTimeHorizon = (h: TimeHorizon) =>
    setPendingFilter((f) => ({ ...f, timeHorizon: h }));

  const applyFilter = () => setAppliedFilter({ ...pendingFilter });

  return (
    <DataFilterContext.Provider
      value={{
        pendingFilter,
        appliedFilter,
        setPendingProject,
        setPendingTimeHorizon,
        applyFilter,
        isDirty,
      }}
    >
      {children}
    </DataFilterContext.Provider>
  );
}

export function useDataFilter() {
  return useContext(DataFilterContext);
}
