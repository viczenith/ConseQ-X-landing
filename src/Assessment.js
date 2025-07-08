// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import Logo3D from "./assets/ConseQ-X-3d.png";
// import { FaSun, FaMoon, FaArrowRight, FaArrowLeft, FaStar, FaRegStar, FaTimes, FaCheck } from 'react-icons/fa';
// import InterdependencySystem from './pages/Systems/InterdependencySystem';

// // System data structure
// const systems = [
//   {
//     id: 'interdependency',
//     title: "The System of Interdependency & Interaction",
//     icon: "🔗",
//     description: "This captures how parts of the organization rely on each other. This system emphasizes that everything in an organization is connected.",
//     goal: "Identify where collaboration is likely to fail between teams, departments, or individuals",
//     isInterdependency: true,
//     subAssessments: [
//       {
//         id: 'crb',
//         title: 'Core Response Behaviors (CRBs)',
//         description: 'Assess whether your organization\'s crisis responses are constructive (aligned, adaptive, resilient) or detrimental (reactive, misaligned, short-term).',
//         questions: [
//           {
//             statement: 'Does your organization quickly adjust its strategy in response to emerging crises?',
//             clarification: 'Think of a recent crisis—how fast did your strategy shift?'
//           },
//           {
//             statement: 'Does your team document and review lessons from past crises to avoid repeat failures?',
//             clarification: 'E.g., retrospective sessions, updated playbooks.'
//           },
//           {
//             statement: 'Are unconventional or innovative solutions welcomed during high-pressure moments?',
//             clarification: 'Are new ideas explored instead of reverting to defaults?'
//           },
//           {
//             statement: 'Do crisis-time decisions consistently reflect your organization’s core values?',
//             clarification: 'Consider if ethical commitments are maintained under pressure.'
//           },
//           {
//             statement: 'Is there evidence that integrity is upheld during crisis response—even at cost?',
//             clarification: 'Were shortcuts or ethical compromises avoided?'
//           },
//           {
//             statement: 'Does leadership messaging remain consistent and values-driven throughout crises?',
//             clarification: 'Messaging tone: does it match long-term vision or just spin?'
//           },
//           {
//             statement: 'Do your crisis responses result in long-term resolution rather than temporary relief?',
//             clarification: 'Did the issue resurface due to incomplete fixes?'
//           },
//           {
//             statement: 'Is reputational damage minimized or reversed after crisis handling?',
//             clarification: 'Public or partner trust recovered/improved?'
//           },
//           {
//             statement: 'Do stakeholders express increased confidence in leadership after crises?',
//             clarification: 'Client/employee feedback, engagement, media tone.'
//           },
//           {
//             statement: 'Are risks regularly identified and addressed before they escalate?',
//             clarification: 'Routine risk reviews, red flags tracked.'
//           },
//           {
//             statement: 'Does your organization take early action during signs of instability?',
//             clarification: 'E.g., preemptive hiring freeze, early supply shifts.'
//           },
//           {
//             statement: 'Is scenario planning or war-gaming used for crisis preparedness?',
//             clarification: 'Think of future simulations or contingency drills.'
//           },
//           {
//             statement: 'Do cross-functional teams collaborate clearly during crises?',
//             clarification: 'Look for shared crisis boards, joint task forces.'
//           },
//           {
//             statement: 'Are team roles and responsibilities clear during high-stakes events?',
//             clarification: 'Ambiguity reduced or leadership overlaps?'
//           },
//           {
//             statement: 'Is there a culture that avoids blame and focuses on solutions during setbacks?',
//             clarification: 'Who gets questioned first—the person or the system?'
//           },
//         ]
//       },
//       {
//         id: 'internal-client',
//         title: 'Internal Client Satisfaction',
//         description: 'To objectively assess how well internal teams serve each other as clients, using clear, real-world behavior and performance indicators.',
//         questions: [
//           {
//             statement: 'Are service requests typically acknowledged within 24 hours of being sent?',
//             clarification: 'Think about the average time between a request and a response.'
//           },
//           {
//             statement: 'Do service teams inform clients when there are delays or issues fulfilling requests?',
//             clarification: 'Was the client updated before escalation?'
//           },
//           {
//             statement: 'Is the final output often reviewed by the service team for accuracy before delivery?',
//             clarification: 'Do errors get caught internally or by the client?'
//           },
//           {
//             statement: 'Do service teams communicate clearly what is being delivered, by when, and how?',
//             clarification: 'Were timelines and scope made clear from the start?'
//           },
//           {
//             statement: 'Is there a process for internal clients to raise concerns and receive follow-up?',
//             clarification: 'Think of helpdesks, ticketing, or feedback forms.'
//           },
//           {
//             statement: 'Have internal teams received direct appreciation from clients for their professionalism?',
//             clarification: 'Check emails, messages, or mentions in review.'
//           },
//           {
//             statement: 'Do internal service teams routinely offer solutions beyond what was requested?',
//             clarification: 'Examples of proactive problem-solving or added insights.'
//           },
//           {
//             statement: 'Are deliverables from internal teams consistently aligned with what the requesting team needs to meet its own goals?',
//             clarification: 'Do they improve or complicate the requester’s job?'
//           },
//           {
//             statement: 'Are internal clients regularly engaged for feedback on how to improve the service?',
//             clarification: 'Surveys, check-ins, reviews, etc.'
//           },
//           {
//             statement: 'Has the service team adjusted its delivery methods or tools based on past client feedback?',
//             clarification: 'Evidence of evolution or fixed style?'
//           },
//         ]
//       },
//       {
//         id: 'dependency-mapping',
//         title: 'Dependency Mapping',
//         description: 'Help leaders and teams assess the strength, clarity, and risks of their operational interdependencies.',
//         questions: [
//           {
//             statement: 'Is the reason why your team depends on this other team or process clearly defined and agreed on?',
//             clarification: 'Purpose alignment — why the dependency exists.'
//           },
//           {
//             statement: 'Is the dependency relationship documented (SOPs, RACI, SLAs) or just assumed?',
//             clarification: 'Check for shared clarity in procedures.'
//           },
//           {
//             statement: 'Would it cause serious disruption if this team did not deliver as expected?',
//             clarification: 'Criticality — how vital is their function to your work?'
//           },
//           {
//             statement: 'Is communication between both teams structured and frequent, or only reactive?',
//             clarification: 'Interaction rhythm — think beyond emergency communication.'
//           },
//           {
//             statement: 'When you make a request, do you receive a response within an agreed or predictable time?',
//             clarification: 'Reliability of turnaround.'
//           },
//           {
//             statement: 'Has the quality or reliability of this dependency improved in the last 6 months?',
//             clarification: 'Trajectory — improving or stagnant.'
//           },
//           {
//             statement: 'Are risks of disruption known and documented (e.g., team gaps, tools, delays)?',
//             clarification: 'Vulnerability — is there awareness and mitigation?'
//           },
//           {
//             statement: 'Have issues with this dependency resulted in missed goals, rework, or reputational damage?',
//             clarification: 'Consequences of failure.'
//           },
//           {
//             statement: 'Is there a feedback mechanism in place between your team and theirs?',
//             clarification: 'Can you share or receive feedback easily?'
//           },
//           {
//             statement: 'Has this dependency been reviewed in a cross-functional forum in the last year?',
//             clarification: 'Governance — reviewed jointly or in isolation?'
//           },
//         ]
//       },
//       {
//         id: 'trust-flow',
//         title: 'Cross-Team Trust and Flow Index',
//         description: 'To measure trust, feedback loops, and communication fluidity between departments or cross-functional teams.',
//         questions: [
//           {
//             statement: 'Do teams address issues or breakdowns directly with each other before escalating?',
//             clarification: 'E.g., Teams try resolution together before looping in leadership.'
//           },
//           {
//             statement: 'Are requests and feedback acknowledged within 24 hours in most cross-team interactions?',
//             clarification: 'Confirmation of receipt and expectations.'
//           },
//           {
//             statement: 'Are joint team goals reviewed together rather than assumed independently?',
//             clarification: 'Shared OKRs or planning rituals.'
//           },
//           {
//             statement: 'Is there an established routine (weekly, biweekly) where these two teams engage?',
//             clarification: 'Scheduled sync-ups or structured updates.'
//           },
//           {
//             statement: 'When there\'s disagreement, do teams resolve through open dialogue rather than avoidance or passive pushback?',
//             clarification: 'Feedback loops, retrospectives, open challenge channels.'
//           },
//           {
//             statement: 'Have representatives of both teams attended a learning, retrospective, or co-design session in the past 6 months?',
//             clarification: 'Collaborative settings beyond firefighting.'
//           },
//           {
//             statement: 'Do both teams contribute information proactively, without needing to be asked?',
//             clarification: 'E.g., usage data, timelines, changes shared unprompted.'
//           },
//           {
//             statement: 'Do teams express confidence in each other\'s follow-through?',
//             clarification: 'Reliability patterns in hitting joint deliverables.'
//           },
//           {
//             statement: 'Have both teams given each other constructive feedback and acted on it?',
//             clarification: 'Documented feedback, post-action improvements.'
//           },
//           {
//             statement: 'Are escalations rare and typically the last resort?',
//             clarification: 'Is direct problem-solving the norm?'
//           },
//         ]
//       },
//       {
//         id: 'silo-impact',
//         title: 'Silo Impact Scorecard',
//         description: 'To evaluate the presence and cost of silos in decision-making, delivery, and learning across functions or units.',
//         questions: [
//           {
//             statement: 'Do both teams consult each other before making decisions that impact shared workflows?',
//             clarification: 'Checks for upstream-downstream awareness and consultation.'
//           },
//           {
//             statement: 'Are handovers or transitions between these teams free from duplicated work or redundant checks?',
//             clarification: 'E.g., does the same data or task get redone or verified twice unnecessarily?'
//           },
//           {
//             statement: 'Do the two teams have aligned timelines or deliverables that directly support each other\'s goals?',
//             clarification: 'Conflict in deadlines, sequence gaps, or delivery mismatch are red flags.'
//           },
//           {
//             statement: 'Have either team missed out on learnings, mistakes, or innovations due to lack of knowledge sharing?',
//             clarification: 'Check if problems were solved by one team but repeated by another.'
//           },
//           {
//             statement: 'Does leadership from either team reinforce functional isolation—implicitly or explicitly?',
//             clarification: 'Look for signaling: do leaders reward turf, autonomy, or cross-pollination?'
//           },
//         ]
//       },
//       {
//         id: 'breakdown-risk',
//         title: 'Interaction Breakdown Risk Audit',
//         description: 'To detect where collaboration is likely to fail due to unclear, irregular, or broken interaction links.',
//         questions: [
//           {
//             statement: 'Are the roles and responsibilities of both parties clearly defined in the interaction?',
//             clarification: 'Interaction Clarity — E.g., each team knows what they owe and expect.'
//           },
//           {
//             statement: 'Does this interaction happen regularly and predictably?',
//             clarification: 'Interaction Frequency — E.g., weekly handoffs, biweekly syncs.'
//           },
//           {
//             statement: 'Is the interaction directly tied to work outputs or decisions that matter?',
//             clarification: 'Purpose Alignment — E.g., tied to a milestone, delivery, or performance trigger.'
//           },
//           {
//             statement: 'Do both parties follow up or respond to requests in a timely manner?',
//             clarification: 'Responsiveness — E.g., is the loop closed consistently?'
//           },
//           {
//             statement: 'Is the interaction respectful, and are tensions handled constructively?',
//             clarification: 'Friction/Tension — Is it safe to challenge or raise issues?'
//           },
//         ]
//       }
//     ]
//   },
//   {
//     id: 'inlignment',
//     title: "The System of Inlignment",
//     icon: "🎯",
//     description: "A fusion of 'alignment' and 'inline'—ensuring all components work seamlessly toward the same objectives.",
//     goal: "Ensure daily decisions reflect the organization's stated vision and mission",
//     questions: [
//       {
//         id: 1,
//         question: "How well do staff understand the organization's vision?",
//         options: [
//           "No connection to behavior",
//           "Understood but not practiced",
//           "Inconsistent application",
//           "Evident in most behaviors",
//           "Embedded in all actions"
//         ]
//       },
//       {
//         id: 2,
//         question: "How consistently do leaders model the vision through their actions?",
//         options: [
//           "Leaders contradict vision",
//           "Occasional alignment",
//           "Inconsistent modeling",
//           "Most leaders model vision",
//           "All leaders exemplify vision"
//         ]
//       }
//     ]
//   },
//   {
//     id: 'investigation',
//     title: "The System of Investigation",
//     icon: "🔎",
//     description: "How an organization digs for answers and keeps looking for the 'whys' of incidents to understand root causes.",
//     goal: "Check if different teams interpret data/events consistently or cause misalignment",
//     questions: [
//       {
//         id: 1,
//         question: "How consistently do teams interpret key metrics?",
//         options: [
//           "Highly fragmented",
//           "Some alignment, frequent contradictions",
//           "Reasonable coherence with blind spots",
//           "Mostly aligned with exceptions",
//           "Strong, consistent across all levels"
//         ]
//       },
//       {
//         id: 2,
//         question: "How consistently do teams respond to similar events?",
//         options: [
//           "Wildly different responses",
//           "Frequent contradictions",
//           "Moderate consistency",
//           "Mostly consistent",
//           "Always aligned responses"
//         ]
//       }
//     ]
//   },
//   {
//     id: 'orchestration',
//     title: "The System of Orchestration",
//     icon: "🔄",
//     description: "A continuous improvement process driven by repeated cycles of testing, learning, and refining.",
//     goal: "Determine how quickly your organization can respond to change",
//     questions: [
//       {
//         id: 1,
//         question: "How prepared is your organization for change?",
//         options: [
//           "Not prepared at all",
//           "Limited preparedness",
//           "Functional but needs improvement",
//           "Well-developed readiness",
//           "Fully embedded readiness"
//         ]
//       },
//       {
//         id: 2,
//         question: "How comfortable is your organization acting with incomplete information?",
//         options: [
//           "Extremely uncomfortable",
//           "Somewhat uncomfortable",
//           "Moderately comfortable",
//           "Comfortable with uncertainty",
//           "Thrives with uncertainty"
//         ]
//       }
//     ]
//   },
//   {
//     id: 'illustration',
//     title: "The System of Illustration",
//     icon: "📊",
//     description: "The way ideas, strategies, and visions are communicated, emphasizing visualization of how components interact.",
//     goal: "Assess how well strategy is communicated visually and narratively",
//     questions: [
//       {
//         id: 1,
//         question: "How available are strategic visuals in your organization?",
//         options: [
//           "Absent or fragmented",
//           "Present but inconsistent/unclear",
//           "Useful in some areas",
//           "Clear and regularly used",
//           "Integral and consistent across levels"
//         ]
//       },
//       {
//         id: 2,
//         question: "How well can staff recall strategic messages using visuals?",
//         options: [
//           "Cannot recall any visuals",
//           "Recall vague concepts",
//           "Recall some elements",
//           "Recall most key parts",
//           "Explain strategy using visuals"
//         ]
//       }
//     ]
//   },
//   {
//     id: 'interpretation',
//     title: "The System of Interpretation",
//     icon: "🧠",
//     description: "Uncovering deeper meaning behind behaviors, incidents, and patterns within an organization.",
//     goal: "Identify if your organization scapegoats individuals or diagnoses systems",
//     questions: [
//       {
//         id: 1,
//         question: "What is the first reaction when problems occur?",
//         options: [
//           "Always 'Who did this?'",
//           "Mostly 'Who did this?'",
//           "Mixed between who and what",
//           "Mostly 'What caused this?'",
//           "Always 'What caused this?'"
//         ]
//       },
//       {
//         id: 2,
//         question: "How are errors framed by leadership?",
//         options: [
//           "Always personal failure",
//           "Mostly personal terms",
//           "Mixed personal/systemic",
//           "Mostly systemic terms",
//           "Always systemic terms"
//         ]
//       }
//     ]
//   }
// ];

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
//     if (system.id === 'interdependency') {
//       setCurrentSystem(system);
//       setStep(3); // Special step for Interdependency System
//     } else {
//       setCurrentSystem(system);
//       setCurrentQuestion(0);
//       setStep(2);
//     }
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
//   const handleResultsRequest = () => {
//     setResultsRequested(true);
//     setActiveModal('results');
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
//       if (system.id === 'interdependency') {
//         const completedSubs = system.subAssessments.filter(sub => 
//           answers[sub.id] && 
//           Object.keys(answers[sub.id]).length === sub.questions.length
//         ).length;
//         return completedSubs === system.subAssessments.length;
//       } else {
//         return answers[system.id] && 
//           Object.keys(answers[system.id]).length === system.questions.length;
//       }
//     }).length;
    
//     return Math.round((answered / systems.length) * 100);
//   };

//   // Calculate system completion status
//   const calculateSystemCompletion = (system) => {
//     if (system.id === 'interdependency') {
//       const completed = system.subAssessments.filter(sub => 
//         answers[sub.id] && 
//         Object.keys(answers[sub.id]).length === sub.questions.length
//       ).length;
      
//       return {
//         isCompleted: completed === system.subAssessments.length,
//         progress: completed,
//         total: system.subAssessments.length,
//         answered: completed
//       };
//     } else {
//       const answered = answers[system.id] ? Object.keys(answers[system.id]).length : 0;
//       return {
//         isCompleted: answered === system.questions.length,
//         progress: answered,
//         total: system.questions.length,
//         answered
//       };
//     }
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

//           {/* Step 2: Normal System Assessment */}
//           {step === 2 && currentSystem && !currentSystem.isInterdependency && (
//             <motion.div
//               key={`system-${currentSystem.id}`}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               className="max-w-4xl mx-auto"
//             >
//               <div className="mb-8">
//                 <button
//                   onClick={() => setStep(1)}
//                   className={`flex items-center mb-6 ${
//                     darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
//                   }`}
//                 >
//                   <FaArrowLeft className="mr-2" />
//                   Back to Systems
//                 </button>
                
//                 <div className={`p-6 rounded-xl shadow-lg mb-8 ${
//                   darkMode 
//                     ? "bg-gray-800/50 border border-gray-700" 
//                     : "bg-white border border-gray-200"
//                 }`}>
//                   <div className="flex items-start mb-4">
//                     <div className="text-3xl mr-4">{currentSystem.icon}</div>
//                     <div>
//                       <h2 className={`text-2xl font-bold ${
//                         darkMode ? "text-white" : "text-gray-900"
//                       }`}>
//                         {currentSystem.title}
//                       </h2>
//                       <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
//                         {currentSystem.description}
//                       </p>
//                     </div>
//                   </div>
                  
//                   <div className={`p-4 rounded-lg ${
//                     darkMode ? "bg-gray-900/30" : "bg-gray-100"
//                   }`}>
//                     <h3 className={`font-semibold mb-2 ${
//                       darkMode ? "text-yellow-400" : "text-yellow-600"
//                     }`}>
//                       Assessment Goal
//                     </h3>
//                     <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
//                       {currentSystem.goal}
//                     </p>
//                   </div>
//                 </div>
//               </div>
              
//               {currentSystem.questions.map((question, index) => (
//                 <div 
//                   key={question.id} 
//                   className={`p-8 rounded-xl shadow-lg mb-6 ${
//                     darkMode 
//                       ? "bg-gray-800/50 border border-gray-700" 
//                       : "bg-white border border-gray-200"
//                   }`}
//                 >
//                   <div className="flex justify-between items-center mb-8">
//                     <h3 className={`text-xl font-bold ${
//                       darkMode ? "text-white" : "text-gray-900"
//                     }`}>
//                       Question {index + 1} of {currentSystem.questions.length}
//                     </h3>
//                     <div className="w-32 bg-gray-200 rounded-full h-2">
//                       <div 
//                         className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
//                         style={{ width: `${((index + 1) / currentSystem.questions.length) * 100}%` }}
//                       />
//                     </div>
//                   </div>

//                   <h4 className={`text-xl font-medium mb-8 ${
//                     darkMode ? "text-gray-200" : "text-gray-800"
//                   }`}>
//                     {question.question}
//                   </h4>

//                   <div className="space-y-4">
//                     {question.options.map((option, optionIndex) => (
//                       <motion.button
//                         key={optionIndex}
//                         whileHover={{ scale: 1.02 }}
//                         whileTap={{ scale: 0.98 }}
//                         onClick={() => handleAnswerSelect(currentSystem.id, index, option)}
//                         className={`w-full text-left p-4 rounded-lg transition-all ${
//                           darkMode 
//                             ? "bg-gray-700/50 border border-gray-600 hover:border-yellow-500" 
//                             : "bg-gray-100 border border-gray-200 hover:border-yellow-500"
//                         } ${answers[currentSystem.id]?.[index] === option ? (darkMode ? 'border-yellow-500' : 'border-yellow-400') : ''}`}
//                       >
//                         <div className="flex items-start">
//                           <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-0.5 ${
//                             darkMode ? "bg-gray-600" : "bg-gray-300"
//                           }`}>
//                             <span className="font-medium">{String.fromCharCode(65 + optionIndex)}</span>
//                           </div>
//                           <div>{option}</div>
//                         </div>
//                       </motion.button>
//                     ))}
//                   </div>
//                 </div>
//               ))}
              
//               <div className="flex justify-center mt-8">
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => {
//                     setStep(1);
//                     setCurrentSystem(null);
//                   }}
//                   className={`px-8 py-3 rounded-lg text-lg font-medium ${
//                     darkMode 
//                       ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
//                       : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
//                   }`}
//                 >
//                   Complete Assessment
//                 </motion.button>
//               </div>
//             </motion.div>
//           )}

//           {/* Step 3: Interdependency System */}
//           {step === 3 && currentSystem && currentSystem.isInterdependency && (
//             <InterdependencySystem 
//               system={currentSystem}
//               answers={answers}
//               setAnswers={setAnswers}
//               onBack={() => setStep(1)}
//               darkMode={darkMode}
//             />
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
//               className={`relative max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
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
//                         Select your report preferences
//                       </p>
//                     </motion.div>
                    
//                     <motion.div 
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
//                       className={`p-4 rounded-xl ${darkMode ? "bg-gray-800/30" : "bg-gray-100"}`}
//                     >
//                       <h3 className={`font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
//                         Summary
//                       </h3>
//                       <div className="flex items-center mb-2">
//                         <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
//                           <div 
//                             className="h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
//                             style={{ width: `${completionPercentage()}%` }}
//                           />
//                         </div>
//                         <span className="font-medium">{completionPercentage()}%</span>
//                       </div>
//                       <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
//                         Completed {Object.keys(answers).length} of {systems.length} systems
//                       </p>
//                     </motion.div>
                    
//                     <div className="space-y-4">
//                       <motion.div 
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
//                         className={`p-3 rounded-lg cursor-pointer transition-all ${
//                           resultsType === 'all' 
//                             ? darkMode 
//                               ? "bg-indigo-900/30 border border-indigo-700" 
//                               : "bg-indigo-100 border border-indigo-300"
//                             : darkMode 
//                               ? "bg-gray-800/30 border border-gray-700 hover:border-indigo-500" 
//                               : "bg-gray-100 border border-gray-200 hover:border-indigo-300"
//                         }`}
//                         onClick={() => setResultsType('all')}
//                       >
//                         <div className="flex items-start">
//                           <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
//                             resultsType === 'all' 
//                               ? "bg-indigo-600 text-white" 
//                               : darkMode 
//                                 ? "bg-gray-700" 
//                                 : "bg-gray-300"
//                           }`}>
//                             {resultsType === 'all' && "✓"}
//                           </div>
//                           <div>
//                             <h3 className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
//                               Full Report
//                             </h3>
//                             <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
//                               Comprehensive report with all completed assessments
//                             </p>
//                           </div>
//                         </div>
//                       </motion.div>
                      
//                       <motion.div 
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
//                         className={`p-3 rounded-lg cursor-pointer transition-all ${
//                           resultsType === 'specific' 
//                             ? darkMode 
//                               ? "bg-indigo-900/30 border border-indigo-700" 
//                               : "bg-indigo-100 border border-indigo-300"
//                             : darkMode 
//                               ? "bg-gray-800/30 border border-gray-700 hover:border-indigo-500" 
//                               : "bg-gray-100 border border-gray-200 hover:border-indigo-300"
//                         }`}
//                         onClick={() => setResultsType('specific')}
//                       >
//                         <div className="flex items-start">
//                           <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
//                             resultsType === 'specific' 
//                               ? "bg-indigo-600 text-white" 
//                               : darkMode 
//                                 ? "bg-gray-700" 
//                                 : "bg-gray-300"
//                           }`}>
//                             {resultsType === 'specific' && "✓"}
//                           </div>
//                           <div>
//                             <h3 className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
//                               Selected Systems
//                             </h3>
//                             <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
//                               Reports for specific systems only
//                             </p>
//                           </div>
//                         </div>
//                       </motion.div>
                      
//                       {resultsType === 'specific' && (
//                         <motion.div 
//                           initial={{ opacity: 0, height: 0 }}
//                           animate={{ opacity: 1, height: 'auto', transition: { delay: 0.6 } }}
//                           className="ml-8 mt-2 space-y-2 overflow-hidden"
//                         >
//                           {systems.map(system => (
//                             <div 
//                               key={system.id} 
//                               className={`p-2 rounded cursor-pointer ${
//                                 answers[system.id]
//                                   ? darkMode 
//                                     ? "bg-gray-700/30 hover:bg-gray-700/50" 
//                                     : "bg-gray-100 hover:bg-gray-200"
//                                   : "opacity-50 cursor-not-allowed"
//                               }`}
//                             >
//                               <div className="flex items-center">
//                                 <div className={`w-4 h-4 rounded mr-2 ${
//                                   darkMode ? "bg-gray-600" : "bg-gray-300"
//                                 }`}></div>
//                                 <span className={`text-xs ${answers[system.id] ? (darkMode ? "text-white" : "text-gray-900") : (darkMode ? "text-gray-500" : "text-gray-400")}`}>
//                                   {system.title} {!answers[system.id] && '(Not completed)'}
//                                 </span>
//                               </div>
//                             </div>
//                           ))}
//                         </motion.div>
//                       )}
//                     </div>
                    
//                     <motion.div 
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
//                       className="text-center pt-2"
//                     >
//                       <p className={`mb-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
//                         Results will be sent to: <span className="font-semibold">{userInfo.email}</span>
//                       </p>
//                       <motion.button
//                         whileHover={{ 
//                           scale: 1.05, 
//                           boxShadow: darkMode 
//                             ? "0 5px 15px rgba(59, 130, 246, 0.4)" 
//                             : "0 5px 15px rgba(59, 130, 246, 0.3)"
//                         }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleBookingRequest}
//                         className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition shadow-lg"
//                       >
//                         Send Results & Continue
//                       </motion.button>
//                     </motion.div>
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
//                         Results Sent!
//                       </h2>
//                       <p className={`${darkMode ? "text-green-300" : "text-green-600"}`}>
//                         Sent to <span className="font-semibold">{userInfo.email}</span>
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
// }




import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo3D from "./assets/ConseQ-X-3d.png";
import { FaSun, FaMoon, FaArrowRight, FaArrowLeft, FaStar, FaRegStar, FaTimes, FaCheck } from 'react-icons/fa';
import { systems } from './data/systems';
import InterdependencySystem from './pages/Systems/InterdependencySystem';

export default function AssessmentPlatform() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [step, setStep] = useState(0);
  const [userInfo, setUserInfo] = useState({
    organization: '',
    role: '',
    email: ''
  });
  const [darkMode, setDarkMode] = useState(false);
  const [currentSystem, setCurrentSystem] = useState(null);
  const [answers, setAnswers] = useState({});
  const [resultsRequested, setResultsRequested] = useState(false);
  const [resultsType, setResultsType] = useState('all');
  const [bookingRequested, setBookingRequested] = useState(false);
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Navbar scroll effect
  const handleScroll = () => {
    setNavScrolled(window.scrollY > 50);
  };
  
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
    localStorage.setItem('darkMode', !darkMode ? 'true' : 'false');
  };

  // Handle user info submission
  const handleUserInfoSubmit = () => {
    if (userInfo.organization && userInfo.email) {
      setStep(1);
    }
  };

  // Handle system selection
  const handleSystemSelect = (system) => {
    if (system.id === 'interdependency') {
      setCurrentSystem(system);
      setStep(3); // Special step for Interdependency System
    } else {
      setCurrentSystem(system);
      setCurrentQuestion(0);
      setStep(2);
    }
  };

  // Handle answer selection for normal systems
  const handleAnswerSelect = (systemId, questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [systemId]: {
        ...prev[systemId],
        [questionIndex]: answer
      }
    }));
  };

  // Handle results request
  const handleResultsRequest = () => {
    setResultsRequested(true);
    setActiveModal('results');
  };

  // Handle booking request
  const handleBookingRequest = () => {
    setBookingRequested(true);
    setActiveModal('booking');
  };

  // Submit rating and finish
  const handleRatingSubmit = () => {
    setSubmitted(true);
    setActiveModal('thankyou');
  };

  // Calculate completion percentage
  const completionPercentage = () => {
    const answered = systems.filter(system => {
      if (system.id === 'interdependency') {
        const completedSubs = system.subAssessments.filter(sub => 
          answers[sub.id] && 
          Object.keys(answers[sub.id]).length === sub.questions.length
        ).length;
        return completedSubs === system.subAssessments.length;
      } else {
        return answers[system.id] && 
          Object.keys(answers[system.id]).length === system.questions.length;
      }
    }).length;
    
    return Math.round((answered / systems.length) * 100);
  };

  // Calculate system completion status
  const calculateSystemCompletion = (system) => {
    if (system.id === 'interdependency') {
      const completed = system.subAssessments.filter(sub => 
        answers[sub.id] && 
        Object.keys(answers[sub.id]).length === sub.questions.length
      ).length;
      
      return {
        isCompleted: completed === system.subAssessments.length,
        progress: completed,
        total: system.subAssessments.length,
        answered: completed
      };
    } else {
      const answered = answers[system.id] ? Object.keys(answers[system.id]).length : 0;
      return {
        isCompleted: answered === system.questions.length,
        progress: answered,
        total: system.questions.length,
        answered
      };
    }
  };

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: "easeOut" 
      } 
    },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const serviceItem = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.7, 
        ease: "easeOut" 
      } 
    },
  };

  const modalOverlay = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { opacity: 0 }
  };

  const modalContent = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
        delay: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 } 
    }
  };

  const starBounce = {
    hover: { scale: 1.2, transition: { type: "spring", stiffness: 500 } },
    tap: { scale: 0.9 }
  };

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    document.documentElement.classList.toggle('dark', savedDarkMode);
  }, []);

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-500 ${
      darkMode 
        ? "bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200" 
        : "bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800"
    }`}>
      {/* Navigation */}
      <nav 
        className={`fixed w-full z-50 transition-all duration-500 ${
          navScrolled 
            ? darkMode 
              ? "bg-gray-900/90 backdrop-blur-sm py-2 shadow-sm" 
              : "bg-white/90 backdrop-blur-sm py-2 shadow-sm" 
            : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center"
          >
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <motion.img 
                src={Logo3D} 
                alt="ConseQ-X Logo" 
                className="h-20 w-auto mr-3 transition-all duration-500"
                whileHover={{
                  filter: "drop-shadow(0 0 12px rgba(234, 179, 8, 1))",
                  transition: { duration: 0.5 }
                }}
                animate={{
                  filter: darkMode 
                    ? "drop-shadow(0 0 8px rgba(234, 179, 8, 0.8))" 
                    : "drop-shadow(0 0 6px rgba(234, 179, 8, 0.6))"
                }}
              />
            </motion.div>
          </motion.div>
          
          <div className="flex items-center space-x-6">           
            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                darkMode ? "bg-yellow-500 text-gray-900" : "bg-gray-800 text-yellow-400"
              }`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </motion.button>
          </div>
        </div>
      </nav>

      <div className={`container mx-auto px-4 ${
        navScrolled ? 'pt-24' : 'pt-32'
      } pb-24`}>
        <AnimatePresence mode="wait">
          {/* Step 0: User Information */}
          {step === 0 && (
            <motion.div
              key="user-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <motion.div 
              className="text-3xl font-bold text-center mb-4"
              variants={fadeUp}
              >
                <span className={darkMode ? "text-white" : "text-gray-600"}>
                  Conse<span className="text-yellow-500">Q</span>-Ultra
                </span>
              </motion.div>

              <motion.h1 
                variants={fadeUp}
                className={`text-4xl md:text-5xl font-bold mb-8 text-center ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Organizational Assessment
              </motion.h1>
              
              <motion.p 
                variants={fadeUp}
                className={`text-xl text-center max-w-2xl mx-auto mb-12 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Complete our comprehensive assessment to gain insights into your organization's health and alignment
              
              </motion.p>   
              <div className={`bg-gradient-to-br ${
                darkMode 
                  ? "from-gray-800/50 to-gray-900/50 border border-gray-700" 
                  : "from-white to-gray-50 border border-gray-200"
              } rounded-2xl shadow-xl p-8`}>
                <h2 className={`text-2xl font-bold mb-6 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>
                  Client Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Organization
                    </label>
                    <input
                      type="text"
                      placeholder="Your organization"
                      className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                        darkMode 
                          ? "bg-gray-700 border-gray-600 text-white" 
                          : "border-gray-300"
                      }`}
                      value={userInfo.organization}
                      onChange={(e) => setUserInfo({...userInfo, organization: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Role
                    </label>
                    <input
                      type="text"
                      placeholder="Your role"
                      className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                        darkMode 
                          ? "bg-gray-700 border-gray-600 text-white" 
                          : "border-gray-300"
                      }`}
                      value={userInfo.role}
                      onChange={(e) => setUserInfo({...userInfo, role: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@company.com"
                      className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                        darkMode 
                          ? "bg-gray-700 border-gray-600 text-white" 
                          : "border-gray-300"
                      }`}
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUserInfoSubmit}
                    disabled={!userInfo.organization || !userInfo.email}
                    className={`px-8 py-3 rounded-lg text-lg font-medium transition ${
                      userInfo.organization && userInfo.email
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue to Assessment
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1: Introduction and Systems Dashboard */}
          {step === 1 && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto"
            >
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerChildren}
              >
                <motion.div variants={fadeUp} className="mb-2 text-center">
                  <span className={`font-bold text-sm uppercase tracking-wider ${
                    darkMode ? "text-yellow-400" : "text-yellow-500"
                  }`}>
                    TORIL Assessment System
                  </span>
                </motion.div>
                <motion.h2 variants={fadeUp} className={`text-4xl md:text-5xl font-bold mb-8 text-center ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>
                  Organizational Health Assessment
                </motion.h2>
                
                <motion.div variants={fadeUp} className={`mb-12 p-8 rounded-2xl shadow-lg ${
                  darkMode 
                    ? "bg-gray-800/50 border border-gray-700" 
                    : "bg-white border border-gray-200"
                }`}>
                  <h3 className={`text-2xl font-bold mb-4 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    About the TORIL System
                  </h3>
                  <p className={`text-lg mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    The TORIL framework evaluates six critical dimensions of organizational health. 
                    Each system represents a key area where alignment, clarity, and effectiveness 
                    contribute to overall performance.
                  </p>
                  <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Complete each assessment to receive a comprehensive organizational health report 
                    with actionable insights.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={staggerChildren}
                  initial="hidden"
                  animate="visible"
                >
                  {systems.map((system) => {
                    const completion = calculateSystemCompletion(system);
                    const isCompleted = completion.isCompleted;
                    const isInProgress = !isCompleted && completion.answered > 0;
                    
                    return (
                      <motion.div 
                        key={system.id}
                        variants={serviceItem}
                        whileHover={{ y: -10 }}
                        className={`p-6 rounded-xl border transition-all h-full flex flex-col cursor-pointer ${
                          darkMode 
                            ? "bg-gray-800/30 border-gray-700 hover:border-yellow-500" 
                            : "bg-white border border-gray-200 hover:border-yellow-500"
                        } shadow-lg hover:shadow-xl ${
                          isCompleted 
                            ? darkMode 
                              ? "border-green-500/50" 
                              : "border-green-500/30 bg-green-50/50"
                            : ""
                        }`}
                        onClick={() => handleSystemSelect(system)}
                      >
                        <div className="text-4xl mb-4">{system.icon}</div>
                        <h3 className={`text-xl font-bold mb-2 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}>
                          {system.title}
                        </h3>
                        <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {system.description}
                        </p>
                        <div className="mt-auto">
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs font-medium ${
                              isCompleted 
                                ? "text-green-500" 
                                : isInProgress 
                                  ? "text-yellow-500" 
                                  : darkMode 
                                    ? "text-gray-500" 
                                    : "text-gray-400"
                            }`}>
                              {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              {isCompleted ? `${completion.answered}/${completion.total}` : 
                               isInProgress ? `${completion.answered}/${completion.total}` : 
                               `0/${completion.total}`}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                isCompleted ? 'bg-green-500' : 
                                isInProgress ? 'bg-yellow-500' : 'bg-gray-300'
                              }`}
                              style={{ 
                                width: isCompleted ? '100%' : 
                                isInProgress ? `${(completion.answered / completion.total) * 100}%` : '0%' 
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {Object.keys(answers).length > 0 && (
                  <motion.div 
                    variants={fadeUp}
                    className="mt-16"
                  >
                    <div className={`p-6 rounded-xl ${
                      darkMode 
                        ? "bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700" 
                        : "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
                    }`}>
                      <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                          <h3 className={`text-xl font-bold mb-2 ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}>
                            Assessment Progress
                          </h3>
                          <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                            You've completed {Object.keys(answers).length} of {systems.length} systems
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleResultsRequest}
                          className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition"
                        >
                          Get Results
                        </motion.button>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div 
                          className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                          style={{ width: `${completionPercentage()}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Normal System Assessment */}
          {step === 2 && currentSystem && !currentSystem.isInterdependency && (
            <motion.div
              key={`system-${currentSystem.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-8">
                <button
                  onClick={() => setStep(1)}
                  className={`flex items-center mb-6 ${
                    darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Systems
                </button>
                
                <div className={`p-6 rounded-xl shadow-lg mb-8 ${
                  darkMode 
                    ? "bg-gray-800/50 border border-gray-700" 
                    : "bg-white border border-gray-200"
                }`}>
                  <div className="flex items-start mb-4">
                    <div className="text-3xl mr-4">{currentSystem.icon}</div>
                    <div>
                      <h2 className={`text-2xl font-bold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}>
                        {currentSystem.title}
                      </h2>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {currentSystem.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${
                    darkMode ? "bg-gray-900/30" : "bg-gray-100"
                  }`}>
                    <h3 className={`font-semibold mb-2 ${
                      darkMode ? "text-yellow-400" : "text-yellow-600"
                    }`}>
                      Assessment Goal
                    </h3>
                    <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                      {currentSystem.goal}
                    </p>
                  </div>
                </div>
              </div>
              
              {currentSystem.questions.map((question, index) => (
                <div 
                  key={question.id} 
                  className={`p-8 rounded-xl shadow-lg mb-6 ${
                    darkMode 
                      ? "bg-gray-800/50 border border-gray-700" 
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className={`text-xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}>
                      Question {index + 1} of {currentSystem.questions.length}
                    </h3>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                        style={{ width: `${((index + 1) / currentSystem.questions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <h4 className={`text-xl font-medium mb-8 ${
                    darkMode ? "text-gray-200" : "text-gray-800"
                  }`}>
                    {question.question}
                  </h4>

                  <div className="space-y-4">
                    {question.options.map((option, optionIndex) => (
                      <motion.button
                        key={optionIndex}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswerSelect(currentSystem.id, index, option)}
                        className={`w-full text-left p-4 rounded-lg transition-all ${
                          darkMode 
                            ? "bg-gray-700/50 border border-gray-600 hover:border-yellow-500" 
                            : "bg-gray-100 border border-gray-200 hover:border-yellow-500"
                        } ${answers[currentSystem.id]?.[index] === option ? (darkMode ? 'border-yellow-500' : 'border-yellow-400') : ''}`}
                      >
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-0.5 ${
                            darkMode ? "bg-gray-600" : "bg-gray-300"
                          }`}>
                            <span className="font-medium">{String.fromCharCode(65 + optionIndex)}</span>
                          </div>
                          <div>{option}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="flex justify-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setStep(1);
                    setCurrentSystem(null);
                  }}
                  className={`px-8 py-3 rounded-lg text-lg font-medium ${
                    darkMode 
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                  }`}
                >
                  Complete Assessment
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Interdependency System */}
          {step === 3 && currentSystem && currentSystem.isInterdependency && (
            <InterdependencySystem 
              system={currentSystem}
              answers={answers}
              setAnswers={setAnswers}
              onBack={() => setStep(1)}
              darkMode={darkMode}
            />
          )}
        </AnimatePresence>
      </div>

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
              className={`relative max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
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
                        Select your report preferences
                      </p>
                    </motion.div>
                    
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
                          {systems.map(system => (
                            <div 
                              key={system.id} 
                              className={`p-2 rounded cursor-pointer ${
                                answers[system.id]
                                  ? darkMode 
                                    ? "bg-gray-700/30 hover:bg-gray-700/50" 
                                    : "bg-gray-100 hover:bg-gray-200"
                                  : "opacity-50 cursor-not-allowed"
                              }`}
                            >
                              <div className="flex items-center">
                                <div className={`w-4 h-4 rounded mr-2 ${
                                  darkMode ? "bg-gray-600" : "bg-gray-300"
                                }`}></div>
                                <span className={`text-xs ${answers[system.id] ? (darkMode ? "text-white" : "text-gray-900") : (darkMode ? "text-gray-500" : "text-gray-400")}`}>
                                  {system.title} {!answers[system.id] && '(Not completed)'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
                      className="text-center pt-2"
                    >
                      <p className={`mb-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Results will be sent to: <span className="font-semibold">{userInfo.email}</span>
                      </p>
                      <motion.button
                        whileHover={{ 
                          scale: 1.05, 
                          boxShadow: darkMode 
                            ? "0 5px 15px rgba(59, 130, 246, 0.4)" 
                            : "0 5px 15px rgba(59, 130, 246, 0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBookingRequest}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition shadow-lg"
                      >
                        Send Results & Continue
                      </motion.button>
                    </motion.div>
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
                        Results Sent!
                      </h2>
                      <p className={`${darkMode ? "text-green-300" : "text-green-600"}`}>
                        Sent to <span className="font-semibold">{userInfo.email}</span>
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

      {/* Scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(243, 244, 246, 0.5)'};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? 'rgba(156, 163, 175, 0.5)' : 'rgba(156, 163, 175, 0.5)'};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? 'rgba(209, 213, 219, 0.7)' : 'rgba(107, 114, 128, 0.7)'};
        }
      `}</style>
    </div>
  );
};

