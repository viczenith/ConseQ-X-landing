
import React, { useState, Suspense } from 'react';
import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import Assessment from "./Assessment";
import AssessmentResults from './AssessmentResults';
import InterdependencySystem from './pages/Systems/InterdependencySystem';
import SystemOfInlignment from './pages/Systems/SystemOfInlignment';
import SystemOfInvestigation from './pages/Systems/SystemOfInvestigation';
import SystemOfOrchestration from './pages/Systems/SystemOfOrchestration';
import SystemOfIllustration from './pages/Systems/SystemOfIllustration';
import SystemOfInterpretation from './pages/Systems/SystemOfInterpretation';

import ConseqXCEODashboard from "./components/ConseqX_CEO_Dashboard_and_Chat";
import RequireAuth from "./components/RequireAuth";
import RequirePremium from "./components/RequirePremium";


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

        <Route path="/ceo-dashboard" element={
          <RequireAuth>
            <RequirePremium>
              <Suspense fallback={<div>Loading dashboard...</div>}>
                <ConseqXCEODashboard />
              </Suspense>
            </RequirePremium>
          </RequireAuth>
        } />

        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
  );
}
