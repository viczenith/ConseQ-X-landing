import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ManualDataMode from './components/ManualDataMode';

export default function DataManagementView() {
  const outlet = useOutletContext();
  const darkMode = outlet?.darkMode ?? false;
  const orgId = outlet?.org?.id || "anon";

  return (
    <section>
      <ManualDataMode darkMode={darkMode} orgId={orgId} />
    </section>
  );
}