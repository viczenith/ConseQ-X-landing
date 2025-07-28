// import React, { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import Logo3D from "./assets/ConseQ-X-3d.png";
// import { FaSun, FaMoon, FaStar, FaRegStar, FaTimes, FaCheck, FaDownload } from 'react-icons/fa';
// import { systems } from './data/systems';
// import InterdependencySystem from './pages/Systems/InterdependencySystem';
// import SystemOfInlignment from './pages/Systems/SystemOfInlignment';
// import SystemOfInvestigation from './pages/Systems/SystemOfInvestigation';
// import SystemOfOrchestration from './pages/Systems/SystemOfOrchestration';
// import SystemOfIllustration from './pages/Systems/SystemOfIllustration';
// import SystemOfInterpretation from './pages/Systems/SystemOfInterpretation';
// import { 
//   calculateSubAssessmentScore,
//   // getSubAssessmentInterpretation,
//   getSystemInterpretation
// } from './utils/scoringUtils';
// import html2canvas from 'html2canvas';
// import { jsPDF } from 'jspdf';

// export default function AssessmentPlatform() {
//   const [navScrolled, setNavScrolled] = useState(false);
//   const [step, setStep] = useState(0);
//   const [userInfo, setUserInfo] = useState({
//     organization: '',
//     role: '',
//     email: ''
//   });
//   const [darkMode, setDarkMode] = useState(false);
//   const [currentSystem, setCurrentSystem] = useState(null);
//   const [answers, setAnswers] = useState({});
//   const [resultsRequested, setResultsRequested] = useState(false);
//   const [resultsType, setResultsType] = useState('all');
//   const [bookingRequested, setBookingRequested] = useState(false);
//   const [rating, setRating] = useState(0);
//   const [submitted, setSubmitted] = useState(false);
//   const [activeModal, setActiveModal] = useState(null);
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [analysisContent, setAnalysisContent] = useState(null);
//   const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
//   const [selectedSystems, setSelectedSystems] = useState([]);
//   const [pdfReady, setPdfReady] = useState(false);
  
//   const analysisRef = useRef(null);

//   // Navbar scroll effect
//   const handleScroll = () => {
//     setNavScrolled(window.scrollY > 50);
//   };
  
//   useEffect(() => {
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Toggle dark mode
//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode);
//     document.documentElement.classList.toggle('dark', !darkMode);
//     localStorage.setItem('darkMode', !darkMode ? 'true' : 'false');
//   };

//   // Handle user info submission
//   const handleUserInfoSubmit = () => {
//     if (userInfo.organization && userInfo.email) {
//       setStep(1);
//     }
//   };

//   // Handle system selection
//   const handleSystemSelect = (system) => {
//     setCurrentSystem(system);
//     setCurrentQuestion(0);
//     setStep(3);
//   };

//   // Handle answer selection for normal systems
//   const handleAnswerSelect = (systemId, questionIndex, answer) => {
//     setAnswers(prev => ({
//       ...prev,
//       [systemId]: {
//         ...prev[systemId],
//         [questionIndex]: answer
//       }
//     }));
//   };

//   // Handle results request
//   // const handleResultsRequest = () => {
//   //   setResultsRequested(true);
//   //   setActiveModal('results');
//   //   // Pre-select all completed systems
//   //   const completed = systems.filter(system => 
//   //     system.subAssessments.every(sub => 
//   //       answers[sub.id] && 
//   //       Object.keys(answers[sub.id]).length === sub.questions.length
//   //     )
//   //   ).map(sys => sys.id);
//   //   setSelectedSystems(completed);
//   // };

//   // 1. Handle results request unchanged
//   const handleResultsRequest = () => {
//     setResultsRequested(true);
//     setActiveModal('results');
//     const completed = systems
//       .filter(sys =>
//         sys.subAssessments.every(sub =>
//           answers[sub.id] && Object.keys(answers[sub.id]).length === sub.questions.length
//         )
//       )
//       .map(sys => sys.id);
//     setSelectedSystems(completed);
//   };


//   // Handle booking request
//   const handleBookingRequest = () => {
//     setBookingRequested(true);
//     setActiveModal('booking');
//   };

//   // Submit rating and finish
//   const handleRatingSubmit = () => {
//     setSubmitted(true);
//     setActiveModal('thankyou');
//   };

//   // Calculate completion percentage
//   const completionPercentage = () => {
//     const answered = systems.filter(system => {
//       const completedSubs = system.subAssessments.filter(sub => 
//         answers[sub.id] && 
//         Object.keys(answers[sub.id]).length === sub.questions.length
//       ).length;
//       return completedSubs === system.subAssessments.length;
//     }).length;
    
//     return Math.round((answered / systems.length) * 100);
//   };

//   // Calculate system completion status
//   const calculateSystemCompletion = (system) => {
//     const completed = system.subAssessments.filter(sub => 
//       answers[sub.id] && 
//       Object.keys(answers[sub.id]).length === sub.questions.length
//     ).length;
    
//     return {
//       isCompleted: completed === system.subAssessments.length,
//       progress: completed,
//       total: system.subAssessments.length,
//       answered: completed
//     };
//   };

//   // Toggle system selection
//   const toggleSystemSelection = (systemId) => {
//     setSelectedSystems(prev => 
//       prev.includes(systemId) 
//         ? prev.filter(id => id !== systemId) 
//         : [...prev, systemId]
//     );
//   };

//   // Calculate scores and generate AI analysis
//   const generateAnalysis = () => {
//     setGeneratingAnalysis(true);
    
//     // Calculate scores
//     const scores = {};
//     const completedSystems = systems.filter(system => 
//       system.subAssessments.every(sub => 
//         answers[sub.id] && 
//         Object.keys(answers[sub.id]).length === sub.questions.length
//       )
//     );
    
//     completedSystems.forEach(system => {
//     if (resultsType === 'specific' && !selectedSystems.includes(system.id)) return;

//       const systemScores = {
//         systemScore:    0,
//         maxSystemScore: 0,
//         subAssessments: {}
//       };
        
//       system.subAssessments.forEach(sub => {
//         // const scoreData = calculateSubAssessmentScore(sub.id, answers[sub.id]);
//         // const interpretation = getSubAssessmentInterpretation(sub.id, scoreData.score);
//         const subAnswers = answers[sub.id] || {};
//         const { score, interpretation } = calculateSubAssessmentScore(sub, subAnswers);
        
//         // systemScores.subAssessments[sub.id] = {
//         //   ...scoreData,
//         //   interpretation
//         // };
        
//         // systemScores.systemScore += scoreData.score;
//         // systemScores.maxSystemScore += scoreData.maxScore;

//         // const maxSub = Math.max(...sub.scoringRubric.map(r=>r.score)) * sub.questions.length;
//         const topScore = Math.max(...sub.scoringRubric.map(r => r.score));
//         const maxSubScore = topScore * sub.questions.length;

//         // systemScores.subAssessments[sub.id] = { score, interpretation, maxScore: maxSub };
//         // systemScores.systemScore    += score;
//         // systemScores.maxSystemScore += maxSub;
//         systemScores.subAssessments[sub.id] = {
//           score,
//           maxScore:     maxSubScore,
//           interpretation
//         };

//         systemScores.systemScore    += score;
//         systemScores.maxSystemScore += maxSubScore;
//       });
      
//       // systemScores.interpretation = getSystemInterpretation(
//       //   system.id, 
//       //   systemScores.systemScore
//       // );

//       // systemScores.interpretation = getSystemInterpretation(system, systemScores.systemScore);
      
//       // scores[system.id] = systemScores;
//       systemScores.interpretation = getSystemInterpretation(system, systemScores.systemScore);

//       scores[system.id] = systemScores;
//     });
    
//     // Generate AI analysis prompt
//     const analysisText = generateAIAnalysis(scores);
//     setAnalysisContent(analysisText);
//     setGeneratingAnalysis(false);
//     setPdfReady(true);
//   };

//   // Generate AI analysis text
//   const generateAIAnalysis = (scores) => {
//     let analysis = `# Organizational Health Assessment Report\n\n`;
//     analysis += `**Organization:** ${userInfo.organization || 'N/A'}\n`;
//     analysis += `**Date:** ${new Date().toLocaleDateString()}\n`;
//     analysis += `**Completion:** ${completionPercentage()}%\n\n`;
    
//     // Calculate overall health score
//     const completedSystems = Object.keys(scores);
//     const overallScore = completedSystems.reduce((sum, id) => {
//       const system = scores[id];
//       return sum + (system.systemScore / system.maxSystemScore);
//     }, 0) / completedSystems.length * 100;
    
//     // Determine overall health rating
//     let healthRating = 'Poor Health';
//     let healthDescription = 'Significant challenges across multiple systems requiring immediate attention';
//     if (overallScore >= 85) {
//       healthRating = 'Excellent Health';
//       healthDescription = 'Strong performance across all systems with consistent excellence';
//     } else if (overallScore >= 70) {
//       healthRating = 'Good Health';
//       healthDescription = 'Solid performance with minor areas for improvement';
//     } else if (overallScore >= 55) {
//       healthRating = 'Fair Health';
//       healthDescription = 'Moderate performance with several areas needing attention';
//     }
    
//     // Executive summary with actual scoring
//     analysis += "## Executive Summary\n";
//     analysis += `Based on your assessment results, your organization demonstrates **${healthRating}** with an overall score of ${overallScore.toFixed(1)}%. `;
//     analysis += `${healthDescription}. Key findings include:\n\n`;
    
//     // Add strengths and opportunities based on actual scores
//     const strengths = [];
//     const opportunities = [];
    
//     completedSystems.forEach(systemId => {
//       const system = systems.find(s => s.id === systemId);
//       const systemScore = scores[systemId];
//       const systemPercentage = (systemScore.systemScore / systemScore.maxSystemScore * 100).toFixed(1);
      
//       if (systemPercentage >= 75) {
//         strengths.push(system.title);
//       } else {
//         opportunities.push(system.title);
//       }
//     });
    
//     if (strengths.length > 0) {
//       analysis += `- **Strengths**: ${strengths.join(', ')}\n`;
//     }
//     if (opportunities.length > 0) {
//       analysis += `- **Opportunities**: ${opportunities.join(', ')}\n`;
//     }
    
//     analysis += "\nThe following report provides detailed insights into each system and actionable recommendations.\n\n";
    
//     // Detailed system analysis
//     Object.entries(scores).forEach(([systemId, systemScore]) => {
//       const system = systems.find(s => s.id === systemId);
//       if (!system) return;
      
//       const systemPercentage = (systemScore.systemScore / systemScore.maxSystemScore * 100).toFixed(1);
      
//       analysis += `## ${system.title} System\n`;
//       analysis += `**Score:** ${systemScore.systemScore}/${systemScore.maxSystemScore} (${systemPercentage}%)\n`;
      
//       // Handle different interpretation formats
//       let interpretation = '';
//       if (typeof systemScore.interpretation === 'string') {
//         interpretation = systemScore.interpretation;
//       } else if (systemScore.interpretation?.rating) {
//         interpretation = `${systemScore.interpretation.rating} - ${systemScore.interpretation.description}`;
//       } else {
//         interpretation = 'Interpretation not available';
//       }
//       analysis += `**Interpretation:** ${interpretation}\n\n`;
      
//       // Sub-assessment breakdown
//       analysis += "### Component Analysis\n";
//       analysis += "| Component | Score | Interpretation |\n";
//       analysis += "|-----------|-------|----------------|\n";
      
//       system.subAssessments.forEach(sub => {
//         const subScore = systemScore.subAssessments[sub.id];
//         if (!subScore) return;
        
//         const scoreText = `${subScore.score}/${subScore.maxScore}`;
//         let subInterpretation = '';
        
//         if (typeof subScore.interpretation === 'string') {
//           subInterpretation = subScore.interpretation;
//         } else if (subScore.interpretation?.rating) {
//           subInterpretation = `${subScore.interpretation.rating}: ${subScore.interpretation.description}`;
//         } else {
//           subInterpretation = 'No interpretation available';
//         }
        
//         analysis += `| ${sub.title} | ${scoreText} | ${subInterpretation} |\n`;
//       });
//       analysis += "\n";
      
//       // Key findings based on actual scores
//       analysis += "### Key Findings\n";
//       if (systemPercentage >= 85) {
//         analysis += `- **Exceptional Performance**: ${system.title} is a significant organizational strength\n`;
//         analysis += "- Consistent excellence across all components\n";
//         analysis += "- Well-established processes and practices\n";
//       } else if (systemPercentage >= 70) {
//         analysis += `- **Strong Foundation**: ${system.title} shows good functionality\n`;
//         analysis += "- Most components performing at effective levels\n";
//         analysis += "- Minor opportunities for refinement\n";
//       } else if (systemPercentage >= 55) {
//         analysis += `- **Development Needed**: ${system.title} requires focused attention\n`;
//         analysis += "- Inconsistent performance across components\n";
//         analysis += "- Several areas needing improvement\n";
//       } else {
//         analysis += `- **Critical Improvement Required**: ${system.title} needs significant intervention\n`;
//         analysis += "- Fundamental weaknesses identified\n";
//         analysis += "- Urgent action required\n";
//       }
      
//       // Impact analysis
//       analysis += "### Impact Analysis\n";
//       analysis += "| Area | Positive Impact | Improvement Opportunity |\n";
//       analysis += "|------|-----------------|--------------------------|\n";
      
//       if (systemPercentage >= 70) {
//         analysis += "| Efficiency | Well-optimized processes | Maintain current standards |\n";
//         analysis += "| Risk Management | Strong safeguards in place | Enhance monitoring systems |\n";
//         analysis += "| Innovation | Good foundation for improvement | Increase experimentation |\n";
//       } else {
//         analysis += "| Efficiency | Potential for significant gains | Streamline workflows |\n";
//         analysis += "| Risk Management | Exposure to operational risks | Strengthen controls |\n";
//         analysis += "| Innovation | Limited capacity for improvement | Foster creative culture |\n";
//       }
//       analysis += "\n";
      
//       // Recommendations based on actual scores
//       analysis += "### Recommendations\n";
//       if (systemPercentage >= 85) {
//         analysis += "1. Document and share best practices across the organization\n";
//         analysis += "2. Explore innovative approaches to enhance already strong performance\n";
//         analysis += "3. Establish benchmarks for continuous excellence\n";
//         analysis += "4. Monitor for complacency and maintain high standards\n";
//       } else if (systemPercentage >= 70) {
//         analysis += "1. Identify specific components needing refinement\n";
//         analysis += "2. Develop targeted improvement plans for weaker areas\n";
//         analysis += "3. Strengthen cross-functional collaboration\n";
//         analysis += "4. Implement quarterly progress reviews\n";
//       } else if (systemPercentage >= 55) {
//         analysis += "1. Conduct deep-dive analysis of underperforming areas\n";
//         analysis += "2. Allocate resources for system-wide improvements\n";
//         analysis += "3. Provide specialized training for critical gaps\n";
//         analysis += "4. Implement monthly progress reviews with leadership\n";
//       } else {
//         analysis += "1. Prioritize urgent intervention for critical weaknesses\n";
//         analysis += "2. Consider process redesign or structural changes\n";
//         analysis += "3. Seek external expertise for accelerated improvement\n";
//         analysis += "4. Establish weekly monitoring of improvement initiatives\n";
//       }
//       analysis += "\n";
//     });
    
//     // Overall organizational health
//     analysis += "## Overall Organizational Health\n";
//     analysis += `Your organization shows **${healthRating}** with an overall score of ${overallScore.toFixed(1)}%. `;
//     analysis += `${healthDescription}.\n\n`;
    
//     // Impact estimates based on actual scores
//     analysis += "### Improvement Potential\n";
//     if (overallScore >= 85) {
//       analysis += "- 5-10% efficiency gains through optimization\n";
//       analysis += "- 3-5% innovation acceleration potential\n";
//     } else if (overallScore >= 70) {
//       analysis += "- 10-15% operational improvement potential\n";
//       analysis += "- 5-8% revenue growth opportunity\n";
//       analysis += "- 7-12% employee engagement increase\n";
//     } else if (overallScore >= 55) {
//       analysis += "- 15-25% performance improvement potential\n";
//       analysis += "- 10-20% risk reduction opportunity\n";
//       analysis += "- 12-18% efficiency gains\n";
//     } else {
//       analysis += "- 25-40% transformation potential\n";
//       analysis += "- 20-30% risk mitigation opportunity\n";
//       analysis += "- 15-25% operational efficiency gains\n";
//     }
//     analysis += "\n";
    
//     // Next steps
//     analysis += "## Next Steps\n";
//     analysis += "1. Review this report with your leadership team\n";
//     analysis += "2. Prioritize 2-3 key initiatives from the recommendations\n";
//     analysis += "3. Develop implementation roadmap with clear milestones\n";
//     analysis += "4. Schedule a consultation with our experts for implementation guidance\n";
//     analysis += "5. Reassess in 6 months to track progress\n";
    
//     return analysis;
//   };

//   // Download PDF report
//   const downloadPDF = () => {
//     if (!analysisRef.current) return;
    
//     const input = analysisRef.current;
//     html2canvas(input, {
//       scale: 2,
//       useCORS: true,
//       logging: false,
//       backgroundColor: darkMode ? "#1f2937" : "#ffffff"
//     }).then(canvas => {
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF({
//         orientation: 'portrait',
//         unit: 'mm',
//         format: 'a4'
//       });
      
//       const imgWidth = 210; // A4 width in mm
//       const pageHeight = 297; // A4 height in mm
//       const imgHeight = canvas.height * imgWidth / canvas.width;
//       let heightLeft = imgHeight;
//       let position = 0;
      
//       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//       heightLeft -= pageHeight;
      
//       while (heightLeft >= 0) {
//         position = heightLeft - imgHeight;
//         pdf.addPage();
//         pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//         heightLeft -= pageHeight;
//       }
      
//       pdf.save(`${userInfo.organization || 'assessment'}_report.pdf`);
//     });
//   };

//   // Animation variants
//   const fadeUp = {
//     hidden: { opacity: 0, y: 40 },
//     visible: { 
//       opacity: 1, 
//       y: 0, 
//       transition: { 
//         duration: 0.8, 
//         ease: "easeOut" 
//       } 
//     },
//   };

//   const staggerChildren = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.2,
//       },
//     },
//   };

//   const serviceItem = {
//     hidden: { opacity: 0, y: 30 },
//     visible: { 
//       opacity: 1, 
//       y: 0,
//       transition: { 
//         duration: 0.7, 
//         ease: "easeOut" 
//       } 
//     },
//   };

//   const modalOverlay = {
//     hidden: { opacity: 0 },
//     visible: { 
//       opacity: 1,
//       transition: { duration: 0.3 }
//     },
//     exit: { opacity: 0 }
//   };

//   const modalContent = {
//     hidden: { opacity: 0, y: 50, scale: 0.9 },
//     visible: { 
//       opacity: 1, 
//       y: 0,
//       scale: 1,
//       transition: { 
//         type: "spring", 
//         damping: 25, 
//         stiffness: 300,
//         delay: 0.1
//       }
//     },
//     exit: { 
//       opacity: 0, 
//       scale: 0.95,
//       transition: { duration: 0.2 } 
//     }
//   };

//   const starBounce = {
//     hover: { scale: 1.2, transition: { type: "spring", stiffness: 500 } },
//     tap: { scale: 0.9 }
//   };

//   useEffect(() => {
//     // Check for saved dark mode preference
//     const savedDarkMode = localStorage.getItem('darkMode') === 'true';
//     setDarkMode(savedDarkMode);
//     document.documentElement.classList.toggle('dark', savedDarkMode);
//   }, []);

//   return (
//     <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-500 ${
//       darkMode 
//         ? "bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200" 
//         : "bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800"
//     }`}>
//       {/* Navigation */}
//       <nav 
//         className={`fixed w-full z-50 transition-all duration-500 ${
//           navScrolled 
//             ? darkMode 
//               ? "bg-gray-900/90 backdrop-blur-sm py-2 shadow-sm" 
//               : "bg-white/90 backdrop-blur-sm py-2 shadow-sm" 
//             : "bg-transparent py-4"
//         }`}
//       >
//         <div className="container mx-auto px-4 flex justify-between items-center">
//           <motion.div 
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6 }}
//             className="flex items-center"
//           >
//             <motion.div 
//               className="flex items-center"
//               whileHover={{ scale: 1.05 }}
//               transition={{ duration: 0.3 }}
//             >
//               <motion.img 
//                 src={Logo3D} 
//                 alt="ConseQ-X Logo" 
//                 className="h-20 w-auto mr-3 transition-all duration-500"
//                 whileHover={{
//                   filter: "drop-shadow(0 0 12px rgba(234, 179, 8, 1))",
//                   transition: { duration: 0.5 }
//                 }}
//                 animate={{
//                   filter: darkMode 
//                     ? "drop-shadow(0 0 8px rgba(234, 179, 8, 0.8))" 
//                     : "drop-shadow(0 0 6px rgba(234, 179, 8, 0.6))"
//                 }}
//               />
//             </motion.div>
//           </motion.div>
          
//           <div className="flex items-center space-x-6">           
//             {/* Dark Mode Toggle */}
//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={toggleDarkMode}
//               className={`p-2 rounded-full ${
//                 darkMode ? "bg-yellow-500 text-gray-900" : "bg-gray-800 text-yellow-400"
//               }`}
//               aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
//             >
//               {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
//             </motion.button>
//           </div>
//         </div>
//       </nav>

//       <div className={`container mx-auto px-4 ${
//         navScrolled ? 'pt-24' : 'pt-32'
//       } pb-24`}>
//         <AnimatePresence mode="wait">
//           {/* Step 0: User Information */}
//           {step === 0 && (
//             <motion.div
//               key="user-info"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               className="max-w-3xl mx-auto"
//             >
//               <motion.div 
//               className="text-3xl font-bold text-center mb-4"
//               variants={fadeUp}
//               >
//                 <span className={darkMode ? "text-white" : "text-gray-600"}>
//                   Conse<span className="text-yellow-500">Q</span>-Ultra
//                 </span>
//               </motion.div>

//               <motion.h1 
//                 variants={fadeUp}
//                 className={`text-4xl md:text-5xl font-bold mb-8 text-center ${
//                   darkMode ? "text-white" : "text-gray-900"
//                 }`}
//               >
//                 Organizational Assessment
//               </motion.h1>
              
//               <motion.p 
//                 variants={fadeUp}
//                 className={`text-xl text-center max-w-2xl mx-auto mb-12 ${
//                   darkMode ? "text-gray-300" : "text-gray-700"
//                 }`}
//               >
//                 Complete our comprehensive assessment to gain insights into your organization's health and alignment
//               </motion.p>   
//               <div className={`bg-gradient-to-br ${
//                 darkMode 
//                   ? "from-gray-800/50 to-gray-900/50 border border-gray-700" 
//                   : "from-white to-gray-50 border border-gray-200"
//               } rounded-2xl shadow-xl p-8`}>
//                 <h2 className={`text-2xl font-bold mb-6 ${
//                   darkMode ? "text-white" : "text-gray-900"
//                 }`}>
//                   Client Information
//                 </h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${
//                       darkMode ? "text-gray-300" : "text-gray-700"
//                     }`}>
//                       Organization
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Your organization"
//                       className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
//                         darkMode 
//                           ? "bg-gray-700 border-gray-600 text-white" 
//                           : "border-gray-300"
//                       }`}
//                       value={userInfo.organization}
//                       onChange={(e) => setUserInfo({...userInfo, organization: e.target.value})}
//                     />
//                   </div>
//                   <div>
//                     <label className={`block text-sm font-medium mb-2 ${
//                       darkMode ? "text-gray-300" : "text-gray-700"
//                     }`}>
//                       Role
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Your role"
//                       className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
//                         darkMode 
//                           ? "bg-gray-700 border-gray-600 text-white" 
//                           : "border-gray-300"
//                       }`}
//                       value={userInfo.role}
//                       onChange={(e) => setUserInfo({...userInfo, role: e.target.value})}
//                     />
//                   </div>
//                   <div className="md:col-span-2">
//                     <label className={`block text-sm font-medium mb-2 ${
//                       darkMode ? "text-gray-300" : "text-gray-700"
//                     }`}>
//                       Email Address
//                     </label>
//                     <input
//                       type="email"
//                       placeholder="your.email@company.com"
//                       className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
//                         darkMode 
//                           ? "bg-gray-700 border-gray-600 text-white" 
//                           : "border-gray-300"
//                       }`}
//                       value={userInfo.email}
//                       onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
//                     />
//                   </div>
//                 </div>
                
//                 <div className="flex justify-center">
//                   <motion.button
//                     whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)" }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={handleUserInfoSubmit}
//                     disabled={!userInfo.organization || !userInfo.email}
//                     className={`px-8 py-3 rounded-lg text-lg font-medium transition ${
//                       userInfo.organization && userInfo.email
//                         ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700'
//                         : 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                     }`}
//                   >
//                     Continue to Assessment
//                   </motion.button>
//                 </div>
//               </div>
//             </motion.div>
//           )}

//           {/* Step 1: Introduction and Systems Dashboard */}
//           {step === 1 && (
//             <motion.div
//               key="dashboard"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               className="max-w-6xl mx-auto"
//             >
//               <motion.div
//                 initial="hidden"
//                 whileInView="visible"
//                 viewport={{ once: true }}
//                 variants={staggerChildren}
//               >
//                 <motion.div variants={fadeUp} className="mb-2 text-center">
//                   <span className={`font-bold text-sm uppercase tracking-wider ${
//                     darkMode ? "text-yellow-400" : "text-yellow-500"
//                   }`}>
//                     TORIL Assessment System
//                   </span>
//                 </motion.div>
//                 <motion.h2 variants={fadeUp} className={`text-4xl md:text-5xl font-bold mb-8 text-center ${
//                   darkMode ? "text-white" : "text-gray-900"
//                 }`}>
//                   Organizational Health Assessment
//                 </motion.h2>
                
//                 <motion.div variants={fadeUp} className={`mb-12 p-8 rounded-2xl shadow-lg ${
//                   darkMode 
//                     ? "bg-gray-800/50 border border-gray-700" 
//                     : "bg-white border border-gray-200"
//                 }`}>
//                   <h3 className={`text-2xl font-bold mb-4 ${
//                     darkMode ? "text-white" : "text-gray-900"
//                   }`}>
//                     About the TORIL System
//                   </h3>
//                   <p className={`text-lg mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
//                     The TORIL framework evaluates six critical dimensions of organizational health. 
//                     Each system represents a key area where alignment, clarity, and effectiveness 
//                     contribute to overall performance.
//                   </p>
//                   <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
//                     Complete each assessment to receive a comprehensive organizational health report 
//                     with actionable insights.
//                   </p>
//                 </motion.div>
                
//                 <motion.div 
//                   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
//                   variants={staggerChildren}
//                   initial="hidden"
//                   animate="visible"
//                 >
//                   {systems.map((system) => {
//                     const completion = calculateSystemCompletion(system);
//                     const isCompleted = completion.isCompleted;
//                     const isInProgress = !isCompleted && completion.answered > 0;
                    
//                     return (
//                       <motion.div 
//                         key={system.id}
//                         variants={serviceItem}
//                         whileHover={{ y: -10 }}
//                         className={`p-6 rounded-xl border transition-all h-full flex flex-col cursor-pointer ${
//                           darkMode 
//                             ? "bg-gray-800/30 border-gray-700 hover:border-yellow-500" 
//                             : "bg-white border border-gray-200 hover:border-yellow-500"
//                         } shadow-lg hover:shadow-xl ${
//                           isCompleted 
//                             ? darkMode 
//                               ? "border-green-500/50" 
//                               : "border-green-500/30 bg-green-50/50"
//                             : ""
//                         }`}
//                         onClick={() => handleSystemSelect(system)}
//                       >
//                         <div className="text-4xl mb-4">{system.icon}</div>
//                         <h3 className={`text-xl font-bold mb-2 ${
//                           darkMode ? "text-white" : "text-gray-900"
//                         }`}>
//                           {system.title}
//                         </h3>
//                         <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
//                           {system.description}
//                         </p>
//                         <div className="mt-auto">
//                           <div className="flex justify-between items-center mb-2">
//                             <span className={`text-xs font-medium ${
//                               isCompleted 
//                                 ? "text-green-500" 
//                                 : isInProgress 
//                                   ? "text-yellow-500" 
//                                   : darkMode 
//                                     ? "text-gray-500" 
//                                     : "text-gray-400"
//                             }`}>
//                               {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
//                             </span>
//                             <span className="text-xs font-medium text-gray-500">
//                               {isCompleted ? `${completion.answered}/${completion.total}` : 
//                                isInProgress ? `${completion.answered}/${completion.total}` : 
//                                `0/${completion.total}`}
//                             </span>
//                           </div>
//                           <div className="w-full bg-gray-200 rounded-full h-2">
//                             <div 
//                               className={`h-2 rounded-full ${
//                                 isCompleted ? 'bg-green-500' : 
//                                 isInProgress ? 'bg-yellow-500' : 'bg-gray-300'
//                               }`}
//                               style={{ 
//                                 width: isCompleted ? '100%' : 
//                                 isInProgress ? `${(completion.answered / completion.total) * 100}%` : '0%' 
//                               }}
//                             />
//                           </div>
//                         </div>
//                       </motion.div>
//                     );
//                   })}
//                 </motion.div>

//                 {Object.keys(answers).length > 0 && (
//                   <motion.div 
//                     variants={fadeUp}
//                     className="mt-16"
//                   >
//                     <div className={`p-6 rounded-xl ${
//                       darkMode 
//                         ? "bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700" 
//                         : "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
//                     }`}>
//                       <div className="flex flex-col md:flex-row justify-between items-center">
//                         <div>
//                           <h3 className={`text-xl font-bold mb-2 ${
//                             darkMode ? "text-white" : "text-gray-900"
//                           }`}>
//                             Assessment Progress
//                           </h3>
//                           <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
//                             You've completed {Object.keys(answers).length} of {systems.length} systems
//                           </p>
//                         </div>
//                         <motion.button
//                           whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)" }}
//                           whileTap={{ scale: 0.95 }}
//                           onClick={handleResultsRequest}
//                           className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition"
//                         >
//                           Get Results
//                         </motion.button>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
//                         <div 
//                           className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
//                           style={{ width: `${completionPercentage()}%` }}
//                         />
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//               </motion.div>
//             </motion.div>
//           )}

//           {/* Step 3: System Assessments */}
//           {step === 3 && currentSystem && (
//             <>
//               {/* Interdependency System */}
//               {currentSystem.id === 'interdependency' && (
//                 <InterdependencySystem 
//                   system={currentSystem}
//                   answers={answers}
//                   setAnswers={setAnswers}
//                   onBack={() => setStep(1)}
//                   darkMode={darkMode}
//                 />
//               )}
              
//               {/* System Of Inlignment */}
//               {currentSystem.id === 'inlignment' && (
//                 <SystemOfInlignment 
//                   system={currentSystem}
//                   answers={answers}
//                   setAnswers={setAnswers}
//                   onBack={() => setStep(1)}
//                   darkMode={darkMode}
//                 />
//               )}

//               {/* System Of Investigation */}
//               {currentSystem.id === 'investigation' && (
//                 <SystemOfInvestigation 
//                   system={currentSystem}
//                   answers={answers}
//                   setAnswers={setAnswers}
//                   onBack={() => setStep(1)}
//                   darkMode={darkMode}
//                 />
//               )}

//               {/* System Of Orchestration */}
//               {currentSystem.id === 'orchestration' && (
//                 <SystemOfOrchestration 
//                   system={currentSystem}
//                   answers={answers}
//                   setAnswers={setAnswers}
//                   onBack={() => setStep(1)}
//                   darkMode={darkMode}
//                 />
//               )}

//               {/* System Of Illustration */}
//               {currentSystem.id === 'illustration' && (
//                 <SystemOfIllustration 
//                   system={currentSystem}
//                   answers={answers}
//                   setAnswers={setAnswers}
//                   onBack={() => setStep(1)}
//                   darkMode={darkMode}
//                 />
//               )}

//               {/* System Of Interpretation */}
//               {currentSystem.id === 'interpretation' && (
//                 <SystemOfInterpretation 
//                   system={currentSystem}
//                   answers={answers}
//                   setAnswers={setAnswers}
//                   onBack={() => setStep(1)}
//                   darkMode={darkMode}
//                 />
//               )}
//             </>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Modal Overlay */}
//       <AnimatePresence>
//         {activeModal && (
//           <motion.div
//             key="modal-overlay"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80"
//             onClick={() => setActiveModal(null)} 
//           >
//             {/* Modal Content */}
//             <motion.div
//               initial={{ opacity: 0, y: 50 }}
//               animate={{ 
//                 opacity: 1, 
//                 y: 0,
//                 transition: { 
//                   type: "spring", 
//                   damping: 25, 
//                   stiffness: 300,
//                   mass: 0.5
//                 }
//               }}
//               exit={{ 
//                 opacity: 0, 
//                 y: 20,
//                 transition: { duration: 0.2 } 
//               }}
//               className={`relative max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
//                 darkMode 
//                   ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700" 
//                   : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
//               }`}
//               onClick={e => e.stopPropagation()}
//             >
//               {/* Glass-like top bar */}
//               <div className={`absolute top-0 left-0 right-0 h-1.5 ${
//                 activeModal === 'results' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
//                 activeModal === 'booking' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
//                 'bg-gradient-to-r from-green-500 to-emerald-600'
//               }`}></div>
              
//               {/* Close Button */}
//               <motion.button
//                 whileHover={{ scale: 1.1, rotate: 90 }}
//                 whileTap={{ scale: 0.9 }}
//                 onClick={() => setActiveModal(null)}
//                 className={`absolute top-3 right-3 z-10 p-1.5 rounded-full ${
//                   darkMode 
//                     ? "bg-gray-700/80 hover:bg-gray-600 text-gray-300 backdrop-blur-sm" 
//                     : "bg-gray-200/80 hover:bg-gray-300 text-gray-700 backdrop-blur-sm"
//                 }`}
//               >
//                 <FaTimes className="text-sm" />
//               </motion.button>

//               {/* Modal Content Area */}
//               <div className="overflow-y-auto custom-scrollbar flex-grow p-5">
//                 {/* Results Request Modal */}
//                 {activeModal === 'results' && (
//                   <div className="space-y-5">
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
//                       className="text-center"
//                     >
//                       <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                         </svg>
//                       </div>
//                       <h2 className={`text-2xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
//                         Assessment Results
//                       </h2>
//                       <p className={`${darkMode ? "text-blue-300" : "text-blue-600"}`}>
//                         {analysisContent ? "Your AI Analysis Report" : "Select your report preferences"}
//                       </p>
//                     </motion.div>
                    
//                     {!analysisContent ? (
//                       <>
//                         <motion.div 
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
//                           className={`p-4 rounded-xl ${darkMode ? "bg-gray-800/30" : "bg-gray-100"}`}
//                         >
//                           <h3 className={`font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
//                             Summary
//                           </h3>
//                           <div className="flex items-center mb-2">
//                             <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
//                               <div 
//                                 className="h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
//                                 style={{ width: `${completionPercentage()}%` }}
//                               />
//                             </div>
//                             <span className="font-medium">{completionPercentage()}%</span>
//                           </div>
//                           <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
//                             Completed {Object.keys(answers).length} of {systems.length} systems
//                           </p>
//                         </motion.div>
                        
//                         <div className="space-y-4">
//                           <motion.div 
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
//                             className={`p-3 rounded-lg cursor-pointer transition-all ${
//                               resultsType === 'all' 
//                                 ? darkMode 
//                                   ? "bg-indigo-900/30 border border-indigo-700" 
//                                   : "bg-indigo-100 border border-indigo-300"
//                                 : darkMode 
//                                   ? "bg-gray-800/30 border border-gray-700 hover:border-indigo-500" 
//                                   : "bg-gray-100 border border-gray-200 hover:border-indigo-300"
//                             }`}
//                             onClick={() => setResultsType('all')}
//                           >
//                             <div className="flex items-start">
//                               <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
//                                 resultsType === 'all' 
//                                   ? "bg-indigo-600 text-white" 
//                                   : darkMode 
//                                     ? "bg-gray-700" 
//                                     : "bg-gray-300"
//                               }`}>
//                                 {resultsType === 'all' && "✓"}
//                               </div>
//                               <div>
//                                 <h3 className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
//                                   Full Report
//                                 </h3>
//                                 <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
//                                   Comprehensive report with all completed assessments
//                                 </p>
//                               </div>
//                             </div>
//                           </motion.div>
                          
//                           <motion.div 
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
//                             className={`p-3 rounded-lg cursor-pointer transition-all ${
//                               resultsType === 'specific' 
//                                 ? darkMode 
//                                   ? "bg-indigo-900/30 border border-indigo-700" 
//                                   : "bg-indigo-100 border border-indigo-300"
//                                 : darkMode 
//                                   ? "bg-gray-800/30 border border-gray-700 hover:border-indigo-500" 
//                                   : "bg-gray-100 border border-gray-200 hover:border-indigo-300"
//                             }`}
//                             onClick={() => setResultsType('specific')}
//                           >
//                             <div className="flex items-start">
//                               <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
//                                 resultsType === 'specific' 
//                                   ? "bg-indigo-600 text-white" 
//                                   : darkMode 
//                                     ? "bg-gray-700" 
//                                     : "bg-gray-300"
//                               }`}>
//                                 {resultsType === 'specific' && "✓"}
//                               </div>
//                               <div>
//                                 <h3 className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
//                                   Selected Systems
//                                 </h3>
//                                 <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
//                                   Reports for specific systems only
//                                 </p>
//                               </div>
//                             </div>
//                           </motion.div>
                          
//                           {resultsType === 'specific' && (
//                             <motion.div 
//                               initial={{ opacity: 0, height: 0 }}
//                               animate={{ opacity: 1, height: 'auto', transition: { delay: 0.6 } }}
//                               className="ml-8 mt-2 space-y-2 overflow-hidden"
//                             >
//                               {systems.map(system => {
//                                 const isCompleted = system.subAssessments.every(sub => 
//                                   answers[sub.id] && 
//                                   Object.keys(answers[sub.id]).length === sub.questions.length
//                                 );
                                
//                                 return (
//                                   <div 
//                                     key={system.id} 
//                                     className={`p-2 rounded cursor-pointer ${
//                                       isCompleted
//                                         ? darkMode 
//                                           ? "bg-gray-700/30 hover:bg-gray-700/50" 
//                                           : "bg-gray-100 hover:bg-gray-200"
//                                         : "opacity-50 cursor-not-allowed"
//                                     } ${selectedSystems.includes(system.id) ? (darkMode ? "bg-blue-900/30" : "bg-blue-100") : ""}`}
//                                     onClick={() => isCompleted && toggleSystemSelection(system.id)}
//                                   >
//                                     <div className="flex items-center">
//                                       <div className={`w-4 h-4 rounded mr-2 flex items-center justify-center ${
//                                         darkMode ? "bg-gray-600" : "bg-gray-300"
//                                       } ${selectedSystems.includes(system.id) ? "bg-blue-500" : ""}`}>
//                                         {selectedSystems.includes(system.id) && (
//                                           <FaCheck className="text-xs text-white" />
//                                         )}
//                                       </div>
//                                       <span className={`text-xs ${isCompleted ? (darkMode ? "text-white" : "text-gray-900") : (darkMode ? "text-gray-500" : "text-gray-400")}`}>
//                                         {system.title} {!isCompleted && '(Not completed)'}
//                                       </span>
//                                     </div>
//                                   </div>
//                                 );
//                               })}
//                             </motion.div>
//                           )}
//                         </div>
                        
//                         <motion.div 
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
//                           className="text-center pt-2"
//                         >
//                           <motion.button
//                             whileHover={{ 
//                               scale: 1.05, 
//                               boxShadow: darkMode 
//                                 ? "0 5px 15px rgba(59, 130, 246, 0.4)" 
//                                 : "0 5px 15px rgba(59, 130, 246, 0.3)"
//                             }}
//                             whileTap={{ scale: 0.95 }}
//                             onClick={generateAnalysis}
//                             disabled={generatingAnalysis}
//                             className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition shadow-lg disabled:opacity-50"
//                           >
//                             {generatingAnalysis ? 'Generating Analysis...' : 'Generate AI Analysis'}
//                           </motion.button>
//                         </motion.div>
//                       </>
//                     ) : (
//                       <div className="space-y-5">
//                         <div 
//                           ref={analysisRef}
//                           className={`p-6 rounded-xl ${
//                             darkMode 
//                               ? "bg-gray-800/30 border border-gray-700" 
//                               : "bg-white border border-gray-200"
//                           }`}
//                         >
//                           <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: analysisContent.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
//                         </div>
                        
//                         <div className="flex justify-center gap-4">
//                           <motion.button
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.95 }}
//                             onClick={() => setAnalysisContent(null)}
//                             className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
//                           >
//                             Back to Options
//                           </motion.button>
                          
//                           <motion.button
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.95 }}
//                             onClick={downloadPDF}
//                             className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg flex items-center"
//                           >
//                             <FaDownload className="mr-2" /> Download PDF Report
//                           </motion.button>
                          
//                           <motion.button
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.95 }}
//                             onClick={handleBookingRequest}
//                             className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg"
//                           >
//                             Schedule Consultation
//                           </motion.button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Booking Session Modal */}
//                 {activeModal === 'booking' && (
//                   <div className="space-y-5">
//                     <motion.div
//                       initial={{ opacity: 0, y: -20 }}
//                       animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
//                       className="text-center"
//                     >
//                       <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                         </svg>
//                       </div>
//                       <h2 className={`text-2xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
//                         {pdfReady ? "Report Ready!" : "Analysis Complete!"}
//                       </h2>
//                       <p className={`${darkMode ? "text-green-300" : "text-green-600"}`}>
//                         {pdfReady ? "PDF report generated successfully" : "AI analysis completed"}
//                       </p>
//                     </motion.div>
                    
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
//                       className={`p-4 rounded-xl ${darkMode ? "bg-gray-800/30" : "bg-gray-100"}`}
//                     >
//                       <h3 className={`font-bold mb-4 text-center ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>
//                         Schedule Consultation
//                       </h3>
                      
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
//                         {['Mon, Oct 10 - 10:00 AM', 'Tue, Oct 11 - 2:00 PM', 'Wed, Oct 12 - 11:00 AM', 
//                           'Thu, Oct 13 - 3:00 PM', 'Fri, Oct 14 - 9:00 AM', 'Mon, Oct 17 - 1:00 PM'].map((time, index) => (
//                           <motion.button
//                             key={index}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0, transition: { delay: 0.4 + (index * 0.05) } }}
//                             whileHover={{ 
//                               y: -3,
//                               boxShadow: darkMode 
//                                 ? "0 5px 15px -5px rgba(0, 0, 0, 0.3)" 
//                                 : "0 5px 15px -5px rgba(0, 0, 0, 0.1)"
//                             }}
//                             whileTap={{ scale: 0.98 }}
//                             className={`p-3 text-xs sm:text-sm text-center rounded transition-all ${
//                               darkMode 
//                                 ? "bg-gray-700/50 border border-gray-600 hover:border-yellow-500" 
//                                 : "bg-white border border-gray-200 hover:border-yellow-500"
//                             }`}
//                           >
//                             {time}
//                           </motion.button>
//                         ))}
//                       </div>
                      
//                       <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
//                         className="text-center"
//                       >
//                         <p className={`mb-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
//                           Or suggest your preferred time:
//                         </p>
//                         <div className="flex max-w-md mx-auto">
//                           <input
//                             type="text"
//                             placeholder="e.g., Friday afternoon"
//                             className={`flex-1 px-3 py-1.5 text-sm border-l border-t border-b rounded-l-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
//                               darkMode 
//                                 ? "bg-gray-700/50 border-gray-600 text-white" 
//                                 : "border-gray-300"
//                             }`}
//                           />
//                           <motion.button
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.95 }}
//                             className={`px-3 py-1.5 text-sm rounded-r-lg ${
//                               darkMode 
//                                 ? "bg-indigo-700 text-white" 
//                                 : "bg-indigo-600 text-white"
//                             }`}
//                           >
//                             Suggest
//                           </motion.button>
//                         </div>
//                       </motion.div>
//                     </motion.div>
                    
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
//                       className="text-center"
//                     >
//                       <p className={`mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
//                         Rate your assessment experience:
//                       </p>
                      
//                       <div className="flex justify-center space-x-1 mb-4">
//                         {[1, 2, 3, 4, 5].map((star) => (
//                           <motion.button
//                             key={star}
//                             variants={starBounce}
//                             initial={{ scale: 0.5 }}
//                             animate={{ scale: 1, transition: { delay: 0.9 + (star * 0.05) } }}
//                             whileHover="hover"
//                             whileTap="tap"
//                             onClick={() => setRating(star)}
//                             className="text-3xl focus:outline-none"
//                           >
//                             {star <= rating ? 
//                               <FaStar className="text-yellow-500 drop-shadow-lg" /> : 
//                               <FaRegStar className={darkMode ? "text-gray-600" : "text-gray-400"} />
//                             }
//                           </motion.button>
//                         ))}
//                       </div>
                      
//                       <motion.button
//                         whileHover={{ 
//                           scale: 1.05, 
//                           boxShadow: darkMode 
//                             ? "0 5px 15px rgba(16, 185, 129, 0.4)" 
//                             : "0 5px 15px rgba(16, 185, 129, 0.3)"
//                         }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleRatingSubmit}
//                         className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-lg"
//                       >
//                         Finish Assessment
//                       </motion.button>
//                     </motion.div>
//                   </div>
//                 )}

//                 {/* Thank You Modal */}
//                 {activeModal === 'thankyou' && (
//                   <div className="text-center space-y-5">
//                     <motion.div 
//                       initial={{ scale: 0 }}
//                       animate={{ 
//                         scale: 1,
//                         transition: { 
//                           type: "spring", 
//                           stiffness: 300,
//                           damping: 15
//                         } 
//                       }}
//                       className="w-20 h-20 mx-auto flex items-center justify-center"
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                       </svg>
//                     </motion.div>
                    
//                     <motion.h2 
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
//                       className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
//                     >
//                       Thank You!
//                     </motion.h2>
                    
//                     <motion.p 
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
//                       className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}
//                     >
//                       Your results have been sent to your email.
//                     </motion.p>
                    
//                     <motion.div 
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
//                       className={`p-4 rounded-xl max-w-md mx-auto ${darkMode ? "bg-gray-800/30" : "bg-gray-100"}`}
//                     >
//                       <h3 className={`font-bold mb-3 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>
//                         Next Steps
//                       </h3>
//                       <ul className={`space-y-2 text-left text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
//                         <li className="flex items-start">
//                           <span className="text-yellow-500 mr-2 mt-0.5">•</span>
//                           <span>Check your email for results</span>
//                         </li>
//                         <li className="flex items-start">
//                           <span className="text-yellow-500 mr-2 mt-0.5">•</span>
//                           <span>Review calendar invitation</span>
//                         </li>
//                         <li className="flex items-start">
//                           <span className="text-yellow-500 mr-2 mt-0.5">•</span>
//                           <span>Prepare questions for consultation</span>
//                         </li>
//                         <li className="flex items-start">
//                           <span className="text-yellow-500 mr-2 mt-0.5">•</span>
//                           <span>Download your report for reference</span>
//                         </li>
//                       </ul>
//                     </motion.div>
                    
//                     <motion.div 
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
//                     >
//                       <motion.button
//                         whileHover={{ 
//                           scale: 1.05, 
//                           boxShadow: darkMode 
//                             ? "0 5px 15px rgba(79, 70, 229, 0.4)" 
//                             : "0 5px 15px rgba(79, 70, 229, 0.3)"
//                         }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={() => window.location.reload()}
//                         className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition shadow-lg"
//                       >
//                         Start New Assessment
//                       </motion.button>
//                     </motion.div>
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Scrollbar styles */}
//       <style jsx>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 8px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: ${darkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(243, 244, 246, 0.5)'};
//           border-radius: 4px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: ${darkMode ? 'rgba(156, 163, 175, 0.5)' : 'rgba(156, 163, 175, 0.5)'};
//           border-radius: 4px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: ${darkMode ? 'rgba(209, 213, 219, 0.7)' : 'rgba(107, 114, 128, 0.7)'};
//         }
//       `}</style>
//     </div>
//   );
// };


{/* Modal Overlay */}
<AnimatePresence>
{activeModal && (
    <motion.div
    key="modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80"
    onClick={() => setActiveModal(null)} 
    >
    {/* Modal Content */}
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ 
        opacity: 1, 
        y: 0,
        transition: { 
            type: "spring", 
            damping: 25, 
            stiffness: 300,
            mass: 0.5
        }
        }}
        exit={{ 
        opacity: 0, 
        y: 20,
        transition: { duration: 0.2 } 
        }}
        className={`relative max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
        darkMode 
            ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700" 
            : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
        }`}
        onClick={e => e.stopPropagation()}
    >
        {/* Glass-like top bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
        activeModal === 'results' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
        activeModal === 'booking' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
        'bg-gradient-to-r from-green-500 to-emerald-600'
        }`}></div>
        
        {/* Close Button */}
        <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setActiveModal(null)}
        className={`absolute top-3 right-3 z-10 p-1.5 rounded-full ${
            darkMode 
            ? "bg-gray-700/80 hover:bg-gray-600 text-gray-300 backdrop-blur-sm" 
            : "bg-gray-200/80 hover:bg-gray-300 text-gray-700 backdrop-blur-sm"
        }`}
        >
        <FaTimes className="text-sm" />
        </motion.button>

        {/* Modal Content Area */}
        <div className="overflow-y-auto custom-scrollbar flex-grow p-5">
        {/* Results Request Modal */}
        {activeModal === 'results' && (
            <div className="space-y-5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                className="text-center"
            >
                <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                </div>
                <h2 className={`text-2xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Assessment Results
                </h2>
                <p className={`${darkMode ? "text-blue-300" : "text-blue-600"}`}>
                {analysisContent ? "Your AI Analysis Report" : "Select your report preferences"}
                </p>
            </motion.div>
            
            {!analysisContent ? (
                <>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                    className={`p-4 rounded-xl ${darkMode ? "bg-gray-800/30" : "bg-gray-100"}`}
                >
                    <h3 className={`font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Summary
                    </h3>
                    <div className="flex items-center mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                        className="h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                        style={{ width: `${completionPercentage()}%` }}
                        />
                    </div>
                    <span className="font-medium">{completionPercentage()}%</span>
                    </div>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Completed {Object.keys(answers).length} of {systems.length} systems
                    </p>
                </motion.div>
                
                <div className="space-y-4">
                    <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                        resultsType === 'all' 
                        ? darkMode 
                            ? "bg-indigo-900/30 border border-indigo-700" 
                            : "bg-indigo-100 border border-indigo-300"
                        : darkMode 
                            ? "bg-gray-800/30 border border-gray-700 hover:border-indigo-500" 
                            : "bg-gray-100 border border-gray-200 hover:border-indigo-300"
                    }`}
                    onClick={() => setResultsType('all')}
                    >
                    <div className="flex items-start">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                        resultsType === 'all' 
                            ? "bg-indigo-600 text-white" 
                            : darkMode 
                            ? "bg-gray-700" 
                            : "bg-gray-300"
                        }`}>
                        {resultsType === 'all' && "✓"}
                        </div>
                        <div>
                        <h3 className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                            Full Report
                        </h3>
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Comprehensive report with all completed assessments
                        </p>
                        </div>
                    </div>
                    </motion.div>
                    
                    <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                        resultsType === 'specific' 
                        ? darkMode 
                            ? "bg-indigo-900/30 border border-indigo-700" 
                            : "bg-indigo-100 border border-indigo-300"
                        : darkMode 
                            ? "bg-gray-800/30 border border-gray-700 hover:border-indigo-500" 
                            : "bg-gray-100 border border-gray-200 hover:border-indigo-300"
                    }`}
                    onClick={() => setResultsType('specific')}
                    >
                    <div className="flex items-start">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                        resultsType === 'specific' 
                            ? "bg-indigo-600 text-white" 
                            : darkMode 
                            ? "bg-gray-700" 
                            : "bg-gray-300"
                        }`}>
                        {resultsType === 'specific' && "✓"}
                        </div>
                        <div>
                        <h3 className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                            Selected Systems
                        </h3>
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Reports for specific systems only
                        </p>
                        </div>
                    </div>
                    </motion.div>
                    
                    {resultsType === 'specific' && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto', transition: { delay: 0.6 } }}
                        className="ml-8 mt-2 space-y-2 overflow-hidden"
                    >
                        {systems.map(system => {
                        const isCompleted = system.subAssessments.every(sub => 
                            answers[sub.id] && 
                            Object.keys(answers[sub.id]).length === sub.questions.length
                        );
                        
                        return (
                            <div 
                            key={system.id} 
                            className={`p-2 rounded cursor-pointer ${
                                isCompleted
                                ? darkMode 
                                    ? "bg-gray-700/30 hover:bg-gray-700/50" 
                                    : "bg-gray-100 hover:bg-gray-200"
                                : "opacity-50 cursor-not-allowed"
                            } ${selectedSystems.includes(system.id) ? (darkMode ? "bg-blue-900/30" : "bg-blue-100") : ""}`}
                            onClick={() => isCompleted && toggleSystemSelection(system.id)}
                            >
                            <div className="flex items-center">
                                <div className={`w-4 h-4 rounded mr-2 flex items-center justify-center ${
                                darkMode ? "bg-gray-600" : "bg-gray-300"
                                } ${selectedSystems.includes(system.id) ? "bg-blue-500" : ""}`}>
                                {selectedSystems.includes(system.id) && (
                                    <FaCheck className="text-xs text-white" />
                                )}
                                </div>
                                <span className={`text-xs ${isCompleted ? (darkMode ? "text-white" : "text-gray-900") : (darkMode ? "text-gray-500" : "text-gray-400")}`}>
                                {system.title} {!isCompleted && '(Not completed)'}
                                </span>
                            </div>
                            </div>
                        );
                        })}
                    </motion.div>
                    )}
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
                    className="text-center pt-2"
                >
                    <motion.button
                    whileHover={{ 
                        scale: 1.05, 
                        boxShadow: darkMode 
                        ? "0 5px 15px rgba(59, 130, 246, 0.4)" 
                        : "0 5px 15px rgba(59, 130, 246, 0.3)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generateAnalysis}
                    disabled={generatingAnalysis}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition shadow-lg disabled:opacity-50"
                    >
                    {generatingAnalysis ? 'Generating Analysis...' : 'Generate AI Analysis'}
                    </motion.button>
                </motion.div>
                </>
            ) : (
                <div className="space-y-5">
                <div 
                    ref={analysisRef}
                    className={`p-6 rounded-xl ${
                    darkMode 
                        ? "bg-gray-800/30 border border-gray-700" 
                        : "bg-white border border-gray-200"
                    }`}
                >
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: analysisContent.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
                
                <div className="flex justify-center gap-4">
                    <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAnalysisContent(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                    >
                    Back to Options
                    </motion.button>
                    
                    <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadPDF}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg flex items-center"
                    >
                    <FaDownload className="mr-2" /> Download PDF Report
                    </motion.button>
                    
                    <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBookingRequest}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg"
                    >
                    Schedule Consultation
                    </motion.button>
                </div>
                </div>
            )}
            </div>
        )}

        {/* Booking Session Modal */}
        {activeModal === 'booking' && (
            <div className="space-y-5">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                className="text-center"
            >
                <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                </div>
                <h2 className={`text-2xl font-bold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                {pdfReady ? "Report Ready!" : "Analysis Complete!"}
                </h2>
                <p className={`${darkMode ? "text-green-300" : "text-green-600"}`}>
                {pdfReady ? "PDF report generated successfully" : "AI analysis completed"}
                </p>
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                className={`p-4 rounded-xl ${darkMode ? "bg-gray-800/30" : "bg-gray-100"}`}
            >
                <h3 className={`font-bold mb-4 text-center ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                Schedule Consultation
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {['Mon, Oct 10 - 10:00 AM', 'Tue, Oct 11 - 2:00 PM', 'Wed, Oct 12 - 11:00 AM', 
                    'Thu, Oct 13 - 3:00 PM', 'Fri, Oct 14 - 9:00 AM', 'Mon, Oct 17 - 1:00 PM'].map((time, index) => (
                    <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.4 + (index * 0.05) } }}
                    whileHover={{ 
                        y: -3,
                        boxShadow: darkMode 
                        ? "0 5px 15px -5px rgba(0, 0, 0, 0.3)" 
                        : "0 5px 15px -5px rgba(0, 0, 0, 0.1)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 text-xs sm:text-sm text-center rounded transition-all ${
                        darkMode 
                        ? "bg-gray-700/50 border border-gray-600 hover:border-yellow-500" 
                        : "bg-white border border-gray-200 hover:border-yellow-500"
                    }`}
                    >
                    {time}
                    </motion.button>
                ))}
                </div>
                
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
                className="text-center"
                >
                <p className={`mb-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Or suggest your preferred time:
                </p>
                <div className="flex max-w-md mx-auto">
                    <input
                    type="text"
                    placeholder="e.g., Friday afternoon"
                    className={`flex-1 px-3 py-1.5 text-sm border-l border-t border-b rounded-l-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                        darkMode 
                        ? "bg-gray-700/50 border-gray-600 text-white" 
                        : "border-gray-300"
                    }`}
                    />
                    <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1.5 text-sm rounded-r-lg ${
                        darkMode 
                        ? "bg-indigo-700 text-white" 
                        : "bg-indigo-600 text-white"
                    }`}
                    >
                    Suggest
                    </motion.button>
                </div>
                </motion.div>
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
                className="text-center"
            >
                <p className={`mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Rate your assessment experience:
                </p>
                
                <div className="flex justify-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                    key={star}
                    variants={starBounce}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1, transition: { delay: 0.9 + (star * 0.05) } }}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setRating(star)}
                    className="text-3xl focus:outline-none"
                    >
                    {star <= rating ? 
                        <FaStar className="text-yellow-500 drop-shadow-lg" /> : 
                        <FaRegStar className={darkMode ? "text-gray-600" : "text-gray-400"} />
                    }
                    </motion.button>
                ))}
                </div>
                
                <motion.button
                whileHover={{ 
                    scale: 1.05, 
                    boxShadow: darkMode 
                    ? "0 5px 15px rgba(16, 185, 129, 0.4)" 
                    : "0 5px 15px rgba(16, 185, 129, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRatingSubmit}
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-lg"
                >
                Finish Assessment
                </motion.button>
            </motion.div>
            </div>
        )}

        {/* Thank You Modal */}
        {activeModal === 'thankyou' && (
            <div className="text-center space-y-5">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ 
                scale: 1,
                transition: { 
                    type: "spring", 
                    stiffness: 300,
                    damping: 15
                } 
                }}
                className="w-20 h-20 mx-auto flex items-center justify-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            </motion.div>
            
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
                Thank You!
            </motion.h2>
            
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
                Your results have been sent to your email.
            </motion.p>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                className={`p-4 rounded-xl max-w-md mx-auto ${darkMode ? "bg-gray-800/30" : "bg-gray-100"}`}
            >
                <h3 className={`font-bold mb-3 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                Next Steps
                </h3>
                <ul className={`space-y-2 text-left text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                <li className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-0.5">•</span>
                    <span>Check your email for results</span>
                </li>
                <li className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-0.5">•</span>
                    <span>Review calendar invitation</span>
                </li>
                <li className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-0.5">•</span>
                    <span>Prepare questions for consultation</span>
                </li>
                <li className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-0.5">•</span>
                    <span>Download your report for reference</span>
                </li>
                </ul>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
            >
                <motion.button
                whileHover={{ 
                    scale: 1.05, 
                    boxShadow: darkMode 
                    ? "0 5px 15px rgba(79, 70, 229, 0.4)" 
                    : "0 5px 15px rgba(79, 70, 229, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition shadow-lg"
                >
                Start New Assessment
                </motion.button>
            </motion.div>
            </div>
        )}
        </div>
    </motion.div>
    </motion.div>
)}
</AnimatePresence>


