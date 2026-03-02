import { ActionRecommendations } from "./components/ActionRecommendations";
import { OutletCustomerSatisfaction } from "./components/OutletCustomerSatisfaction";
import { RecentInsights } from "./components/RecentInsights";
import { AIAssistant } from "./components/AIAssistant";
import { Header } from "./components/Header";
import { StatsOverview } from "./components/StatsOverview";
import { RisksOpportunities } from "./components/RisksOpportunities";
import { SourceContents } from "./components/SourceContents";
import { Insights } from "./components/Insights";
import { CompetitiveAnalysis } from "./components/CompetitiveAnalysis";
import { NavSidebar } from "./components/NavSidebar";
import { ProjectConfig } from "./components/ProjectConfig";
import { LoginPage } from "./components/LoginPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import HoverReceiver from "@/visual-edits/VisualEditsMessenger";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { INSTANCES } from "@/lib/instances";
import { loadDashboardContent } from "@/lib/dashboard-content-store";
import { defaultFeatureVisibility, type FeatureVisibility } from "@/lib/dashboard-content-types";
import { DashboardContentProvider } from "@/contexts/DashboardContentContext";
import { useState, useEffect, useMemo } from "react";
import { initializeSchedulers } from "@/lib/scheduler-service";
import { isAuthenticated, getAllowedInstanceIds } from "@/lib/auth";

const queryClient = new QueryClient();

function LoginGuard() {
  const location = useLocation();
  if (!isAuthenticated()) return <LoginPage />;
  const returnUrl = new URLSearchParams(location.search).get("returnUrl") || "/";
  return <Navigate to={returnUrl} replace />;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    const to = "/login?returnUrl=" + encodeURIComponent(location.pathname + location.search);
    return <Navigate to={to} replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const allowedInstanceIds = useMemo(() => getAllowedInstanceIds(), []);
  const allowedInstances = useMemo(
    () => (allowedInstanceIds.length === 0 ? [] : INSTANCES.filter((i) => allowedInstanceIds.includes(i.id))),
    [allowedInstanceIds]
  );
  const defaultInstanceId = allowedInstances[0]?.id ?? "";

  const [currentPage, setCurrentPage] = useState<"dashboard" | "source-contents" | "insights">("dashboard");
  const [currentInstanceId, setCurrentInstanceId] = useState<string>(() => {
    const saved = localStorage.getItem("naradai_current_instance");
    if (saved && allowedInstanceIds.includes(saved)) return saved;
    return defaultInstanceId;
  });
  const [featureVisibility, setFeatureVisibility] = useState<FeatureVisibility>(defaultFeatureVisibility);
  const [dashboardContent, setDashboardContent] = useState<ReturnType<typeof loadDashboardContent> | null>(null);

  useEffect(() => {
    if (!allowedInstanceIds.includes(currentInstanceId) && defaultInstanceId) {
      setCurrentInstanceId(defaultInstanceId);
      localStorage.setItem("naradai_current_instance", defaultInstanceId);
    }
  }, [currentInstanceId, defaultInstanceId, allowedInstanceIds]);

  useEffect(() => {
    if (currentPage === "dashboard" || currentPage === "insights" || currentPage === "source-contents") {
      const content = loadDashboardContent(currentInstanceId);
      if (currentPage === "dashboard") {
        setFeatureVisibility(content.featureVisibility ?? defaultFeatureVisibility);
      }
      setDashboardContent(content);
    } else {
      setDashboardContent(null);
    }
  }, [currentPage, currentInstanceId]);

  const handleInstanceChange = (instanceId: string) => {
    setCurrentInstanceId(instanceId);
    localStorage.setItem("naradai_current_instance", instanceId);
  };

  const isProjectConfig = location.pathname === "/project-config";
  const headerProps = {
    currentPage,
    onNavigate: setCurrentPage,
    instances: allowedInstances,
    currentInstanceId,
    onInstanceChange: handleInstanceChange,
  };

  if (isProjectConfig) {
    return (
      <>
        <Header {...headerProps} />
        <ProjectConfig />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-100/40 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-100/40 via-transparent to-transparent pointer-events-none" />
      <div className="relative">
        <Header {...headerProps} />
        <div className="flex">
          {currentPage === "dashboard" && <NavSidebar />}
          <main className="flex-1 px-6 py-8 space-y-8 max-w-[1200px] mx-auto">
            {currentPage === "dashboard" ? (
              <DashboardContentProvider content={dashboardContent}>
                {featureVisibility.statsOverview && <StatsOverview />}
                {featureVisibility.actionRecommendations && <ActionRecommendations />}
                {featureVisibility.outletSatisfaction && <OutletCustomerSatisfaction />}
                {featureVisibility.risksOpportunities && <RisksOpportunities />}
                {featureVisibility.competitiveAnalysis && <CompetitiveAnalysis />}
                {featureVisibility.recentInsights && <RecentInsights />}
              </DashboardContentProvider>
            ) : currentPage === "insights" ? (
              <DashboardContentProvider content={dashboardContent}>
                <Insights />
              </DashboardContentProvider>
            ) : (
              <SourceContents instanceId={currentInstanceId} />
            )}
          </main>
          {currentPage === "dashboard" && <AIAssistant />}
        </div>
      </div>
    </div>
  );
}

const App = () => {
  useEffect(() => {
    initializeSchedulers();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <HoverReceiver />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginGuard />} />
            <Route path="*" element={<AuthGuard><AppContent /></AuthGuard>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
