
import React, { useState, Suspense } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./HomePage";
import Assessment from "./Assessment";
import AssessmentResults from './AssessmentResults';
import InterdependencySystem from './pages/Systems/InterdependencySystem';
import SystemOfInlignment from './pages/Systems/SystemOfInlignment';
import SystemOfInvestigation from './pages/Systems/SystemOfInvestigation';
import SystemOfOrchestration from './pages/Systems/SystemOfOrchestration';
import SystemOfIllustration from './pages/Systems/SystemOfIllustration';
import SystemOfInterpretation from './pages/Systems/SystemOfInterpretation';

import RequireAuth from "./components/RequireAuth";
import RequirePremium from "./components/RequirePremium";
import ConseqXCEODashboard from "./pages/CEO_Dashboard/ConseqX_CEO_Dashboard_and_Chat";
import PartnerTenantEntry from "./components/PartnerTenantEntry";
import AdminLogin from "./pages/Admin/AdminLogin";
import SuperAdminShell from "./pages/Admin/SuperAdminShell";
import AdminOverview from "./pages/Admin/AdminOverview";
import AdminCompanies from "./pages/Admin/AdminCompanies";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminAssessments from "./pages/Admin/AdminAssessments";
import AdminUploads from "./pages/Admin/AdminUploads";
import AdminJobs from "./pages/Admin/AdminJobs";
import AdminNotifications from "./pages/Admin/AdminNotifications";
import AdminSettings from "./pages/Admin/AdminSettings";
// lazy load the sub-pages (optional)
const CEOAssessments = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/Assessments"));
const CEOReports = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/Reports"));
const CEOTeam = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/Team"));
const CEOBilling = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/Billing"));
const CEORevenue = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/Revenue"));
const CEODashboardHome = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/DashboardHome"));
const CEOChat = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/Chat")); 
const CEODataManagement = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/PartnerDashboard/DataManagementView"));
const PartnerDashboard = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/PartnerDashboard"));
const PartnerOverview = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/PartnerDashboard/OverviewView"));
const PartnerDeepDive = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/PartnerDashboard/SystemDeepDive"));
const PartnerForecast = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/PartnerDashboard/ForecastScenarios"));
const PartnerRecommendations = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/PartnerDashboard/RecommendationsActions"));
const PartnerBenchmarking = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/PartnerDashboard/BenchmarkingTrends"));

const OrgHealthOverview = React.lazy(() => import("./pages/CEO_Dashboard/OrgHealthOverview"));


export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  const safeElement = (Comp, name, props = {}) => {
    if (!Comp) {
      return (
        <div style={{ padding: 16 }}>
          Missing component: <b>{name}</b>
        </div>
      );
    }
    return <Comp {...props} />;
  };

  const AdminGate = ({ children }) => {
    try {
      const tok = localStorage.getItem("conseqx_admin_access_token_v1") || "";
      if (!tok) return <Navigate to="/admin/login" replace />;
    } catch {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  };

  return (
      <Routes>
        <Route path="/" element={safeElement(HomePage, "HomePage")} />
        <Route path="/ConseQ-X-landing" element={safeElement(HomePage, "HomePage")} />
        <Route path="/assessment" element={safeElement(Assessment, "Assessment")} />
        <Route path="/results" element={safeElement(AssessmentResults, "AssessmentResults")} />
        <Route path="/interdependency" element={safeElement(InterdependencySystem, "InterdependencySystem")} />
        
        <Route path="/system/inlignment" element={safeElement(SystemOfInlignment, "SystemOfInlignment")} />
        <Route path="/system/investigation" element={safeElement(SystemOfInvestigation, "SystemOfInvestigation")} />
        <Route path="/system/orchestration" element={safeElement(SystemOfOrchestration, "SystemOfOrchestration")} />
        <Route path="/system/illustration" element={safeElement(SystemOfIllustration, "SystemOfIllustration")} />
        <Route path="/system/interpretation" element={safeElement(SystemOfInterpretation, "SystemOfInterpretation")} />

        <Route
          path="/ceo/*"
          element={
            <RequireAuth>
              <RequirePremium>
                <Suspense fallback={<div>Loading CEO workspace...</div>}>
                  {safeElement(ConseqXCEODashboard, "ConseqXCEODashboard")}
                </Suspense>
              </RequirePremium>
            </RequireAuth>
          }
        >
          {/* nested routes inside the CEO workspace */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CEODashboardHome />} />
          <Route path="partner-dashboard/*" element={<Suspense fallback={<div>Loading Partner Dashboard...</div>}><PartnerDashboard /></Suspense>}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Suspense fallback={<div>Loading overview...</div>}><PartnerOverview /></Suspense>} />
            <Route path="deep-dive" element={<Suspense fallback={<div>Loading deep dive...</div>}><PartnerDeepDive /></Suspense>} />
            <Route path="forecast" element={<Suspense fallback={<div>Loading forecast...</div>}><PartnerForecast /></Suspense>} />
            <Route path="recommendations" element={<Suspense fallback={<div>Loading recommendations...</div>}><PartnerRecommendations /></Suspense>} />
            <Route path="benchmarking" element={<Suspense fallback={<div>Loading benchmarking...</div>}><PartnerBenchmarking /></Suspense>} />
          </Route>
          <Route path="chat" element={ <Suspense fallback={<div>Loading chat...</div>}><CEOChat /></Suspense> } />
          <Route path="assessments" element={<Suspense fallback={<div>Loading assessment...</div>}><CEOAssessments /></Suspense> } />
          <Route path="data" element={<Suspense fallback={<div>Loading data management...</div>}><CEODataManagement /></Suspense>} />
          <Route path="reports" element={<CEOReports />} />
          <Route path="team" element={<CEOTeam />} />
          <Route path="billing" element={<CEOBilling />} />
          <Route path="revenue" element={<CEORevenue />} />

          <Route path="org-health" element={<Suspense fallback={<div>Loading Org Health...</div>}><OrgHealthOverview /></Suspense>} />

        </Route>

        <Route
          path="/partners/:orgSlug"
          element={
            <RequireAuth>
              {safeElement(PartnerTenantEntry, "PartnerTenantEntry")}
            </RequireAuth>
          }
        />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/*"
          element={
            <AdminGate>
              <SuperAdminShell />
            </AdminGate>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="assessments" element={<AdminAssessments />} />
          <Route path="uploads" element={<AdminUploads />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        

        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
  );
}
