
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
// lazy load the sub-pages (optional)
const CEOAssessments = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/Assessments"));
const CEOReports = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/Reports"));
const CEOTeam = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/Team"));
const CEOBilling = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/Billing"));
const CEORevenue = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/Revenue"));
const CEOFinanceMetrics = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/CEOFinanceMetrics"));
const RevenueForecasts = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/RevenueForecasts"));
const CEODashboardHome = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/DashboardHome"));
const CEOChat = React.lazy(() => import("./pages/CEO_Dashboard/CEODashboardComponents/Chat")); 


export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/results" element={<AssessmentResults />} />
        <Route path="/interdependency" element={<InterdependencySystem />} />
        
        <Route path="/system/inlignment" element={<SystemOfInlignment />} />
        <Route path="/system/investigation" element={<SystemOfInvestigation />} />
        <Route path="/system/orchestration" element={<SystemOfOrchestration />} />
        <Route path="/system/illustration" element={<SystemOfIllustration />} />
        <Route path="/system/interpretation" element={<SystemOfInterpretation />} />

        <Route
          path="/ceo/*"
          element={
            <RequireAuth>
              <RequirePremium>
                <Suspense fallback={<div>Loading CEO workspace...</div>}>
                  <ConseqXCEODashboard />
                </Suspense>
              </RequirePremium>
            </RequireAuth>
          }
        >
          {/* nested routes inside the CEO workspace */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CEODashboardHome />} />
          <Route path="chat" element={ <Suspense fallback={<div>Loading chat...</div>}><CEOChat /></Suspense> } />
          <Route path="assessments" element={<Suspense fallback={<div>Loading assessment...</div>}><CEOAssessments /></Suspense> } />
          <Route path="reports" element={<CEOReports />} />
          <Route path="team" element={<CEOTeam />} />
          <Route path="billing" element={<CEOBilling />} />
          <Route path="revenue" element={<CEORevenue />} />
          <Route path="revenue/metrics" element={<CEOFinanceMetrics />} />
          <Route path="revenue/forecasts" element={<RevenueForecasts />} />
        </Route>

        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
  );
}
