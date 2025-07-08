import React, { useState } from 'react';
import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import Assessment from "./Assessment";
import InterdependencySystem from './pages/Systems/InterdependencySystem';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/interdependency" element={<InterdependencySystem />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
  );
}


// import React, { useState } from 'react';
// import { Routes, Route } from 'react-router-dom';
// import Layout from './Layout';
// import HomePage from './HomePage';
// import Assessment from './Assessment';

// export default function App() {
//   const [darkMode, setDarkMode] = useState(false);

//   return (
//     <Layout darkMode={darkMode}>
//       <Routes>
//         <Route
//           path="/"
//           element={<HomePage darkMode={darkMode} setDarkMode={setDarkMode} />}
//         />
//         <Route
//           path="/assessment"
//           element={<Assessment darkMode={darkMode} />}
//         />
//       </Routes>
//     </Layout>
//   );
// }
