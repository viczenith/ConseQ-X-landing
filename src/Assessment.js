import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo3D from "./assets/ConseQ-X-3d.png";
import { FaSun, FaMoon, FaStar, FaRegStar, FaTimes, FaCheck, FaDownload } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark, materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { systems } from './data/systems';
import InterdependencySystem from './pages/Systems/InterdependencySystem';
import SystemOfInlignment from './pages/Systems/SystemOfInlignment';
import SystemOfInvestigation from './pages/Systems/SystemOfInvestigation';
import SystemOfOrchestration from './pages/Systems/SystemOfOrchestration';
import SystemOfIllustration from './pages/Systems/SystemOfIllustration';
import SystemOfInterpretation from './pages/Systems/SystemOfInterpretation';
import { generateSystemReport } from './utils/aiPromptGenerator';
import { 
  calculateSubAssessmentScore,
  getSystemInterpretation
} from './utils/scoringUtils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  const [resultsType, setResultsType] = useState('all');
  const [activeModal, setActiveModal] = useState(null);
  const [analysisContent, setAnalysisContent] = useState(null);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [selectedSystems, setSelectedSystems] = useState([]);
  const [rating, setRating] = useState(0);
  const analysisRef = useRef(null);

  // Custom renderers for ReactMarkdown
  // const MarkdownComponents = {
  //   h1: ({ node, ...props }) => (
  //     <h1 className={`text-3xl font-bold mt-6 mb-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} {...props} />
  //   ),
  //   h2: ({ node, ...props }) => (
  //     <h2 className={`text-2xl font-bold mt-5 mb-3 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} {...props} />
  //   ),
  //   h3: ({ node, ...props }) => (
  //     <h3 className={`text-xl font-bold mt-4 mb-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} {...props} />
  //   ),
  //   table: ({ node, ...props }) => (
  //     <div className="overflow-x-auto">
  //       <table className="w-full my-4 border-collapse" {...props} />
  //     </div>
  //   ),
  //   thead: ({ node, ...props }) => (
  //     <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} {...props} />
  //   ),
  //   th: ({ node, ...props }) => (
  //     <th 
  //       className={`px-4 py-3 text-left border ${darkMode ? 'border-gray-700' : 'border-gray-300'} ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} 
  //       {...props} 
  //     />
  //   ),
  //   td: ({ node, ...props }) => (
  //     <td 
  //       className={`px-4 py-2 border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} 
  //       {...props} 
  //     />
  //   ),
  //   tr: ({ node, ...props }) => (
  //     <tr 
  //       className={`${darkMode ? 'even:bg-gray-800/50' : 'even:bg-gray-50'} hover:${darkMode ? 'bg-gray-700/30' : 'bg-gray-100'}`} 
  //       {...props} 
  //     />
  //   ),
  //   code({ node, inline, className, children, ...props }) {
  //     const match = /language-(\w+)/.exec(className || '');
  //     return !inline && match ? (
  //       <SyntaxHighlighter
  //         style={darkMode ? materialDark : materialLight}
  //         language={match[1]}
  //         PreTag="div"
  //         {...props}
  //         className="rounded-lg mb-4"
  //       >
  //         {String(children).replace(/\n$/, '')}
  //       </SyntaxHighlighter>
  //     ) : (
  //       <code 
  //         className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`} 
  //         {...props}
  //       >
  //         {children}
  //       </code>
  //     );
  //   },
  //   a: ({ node, ...props }) => (
  //     <a 
  //       className={`font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} underline`} 
  //       target="_blank" 
  //       rel="noopener noreferrer" 
  //       {...props} 
  //     />
  //   ),
  //   blockquote: ({ node, ...props }) => (
  //     <blockquote 
  //       className={`border-l-4 ${darkMode ? 'border-yellow-500' : 'border-yellow-400'} pl-4 italic my-4`} 
  //       {...props} 
  //     />
  //   ),
  //   ul: ({ node, ...props }) => (
  //     <ul className={`list-disc pl-8 my-3 space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} {...props} />
  //   ),
  //   ol: ({ node, ...props }) => (
  //     <ol className={`list-decimal pl-8 my-3 space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} {...props} />
  //   ),
  //   li: ({ node, ...props }) => <li className="py-0.5" {...props} />,
  //   p: ({ node, ...props }) => (
  //     <p className={`my-3 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} {...props} />
  //   ),
  //   span: ({ node, ...props }) => {
  //     if (props.className === 'text-justify') {
  //       return <div className="text-justify my-4" {...props} />;
  //     }
  //     return <span {...props} />;
  //   },
  //   div: ({ node, ...props }) => {
  //     if (props.className === 'health-status') {
  //       return (
  //         <div className={`relative my-6 p-5 rounded-lg border-l-4 ${darkMode ? 'border-blue-400 bg-gray-800/50' : 'border-blue-500 bg-blue-50'}`} {...props}>
  //           <div className="absolute top-0 left-0 text-6xl opacity-10 font-bold">"</div>
  //           {props.children}
  //         </div>
  //       );
  //     }
  //     if (props.className === 'recommendation-box') {
  //       return (
  //         <div className={`my-6 p-5 rounded-xl border ${darkMode ? 'border-green-500/30 bg-gradient-to-r from-gray-800/50 to-gray-900/50' : 'border-green-400 bg-gradient-to-r from-green-50 to-white'}`} {...props} />
  //       );
  //     }
  //     return <div {...props} />;
  //   }
  // };

  const MarkdownComponents = {
    h1: ({ node, ...props }) => (
      <h1 className={`text-3xl font-bold mt-6 mb-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className={`text-2xl font-bold mt-5 mb-3 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className={`text-xl font-bold mt-4 mb-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} {...props} />
    ),
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse shadow-lg" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} {...props} />
    ),
    th: ({ node, ...props }) => (
      <th 
        className={`px-4 py-3 text-left font-bold ${darkMode ? 'border-gray-700 text-yellow-400' : 'border-gray-300 text-yellow-600'}`} 
        {...props} 
      />
    ),
    td: ({ node, ...props }) => (
      <td 
        className={`px-4 py-2 border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} 
        {...props} 
      />
    ),
    tr: ({ node, ...props }) => (
      <tr 
        className={`${darkMode ? 'even:bg-gray-800/50 hover:bg-gray-700/30' : 'even:bg-gray-50 hover:bg-gray-100'}`} 
        {...props} 
      />
    ),
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={darkMode ? materialDark : materialLight}
          language={match[1]}
          PreTag="div"
          {...props}
          className="rounded-lg mb-4"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code 
          className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`} 
          {...props}
        >
          {children}
        </code>
      );
    },
    a: ({ node, ...props }) => (
      <a 
        className={`font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} underline`} 
        target="_blank" 
        rel="noopener noreferrer" 
        {...props} 
      />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote 
        className={`border-l-4 ${darkMode ? 'border-yellow-500' : 'border-yellow-400'} pl-4 italic my-4`} 
        {...props} 
      />
    ),
    ul: ({ node, ...props }) => (
      <ul className={`list-disc pl-8 my-3 space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className={`list-decimal pl-8 my-3 space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} {...props} />
    ),
    li: ({ node, ...props }) => <li className="py-0.5" {...props} />,
    p: ({ node, ...props }) => (
      <p className={`my-3 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} {...props} />
    ),
    // Health status component
    div: ({ node, className, ...props }) => {
      if (className === 'health-status') {
        return (
          <div className={`relative my-6 p-5 rounded-lg border-l-4 ${
            darkMode ? 'border-blue-400 bg-gray-800/50' : 'border-blue-500 bg-blue-50'
          }`}>
            <div className="absolute top-0 left-0 text-6xl opacity-10 font-bold">"</div>
            <p className={`italic text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {props.children}
            </p>
          </div>
        );
      }
      return <div {...props} />;
    },
    // Custom components for specific report sections
    em: ({ node, ...props }) => (
      <span className="italic text-yellow-500" {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} {...props} />
    ),
  };


  // Navbar scroll effect
  const handleScroll = () => {
    setNavScrolled(window.scrollY > 50);
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dark mode toggle
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('darkMode', next ? 'true' : 'false');
  };
  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    setDarkMode(saved);
    document.documentElement.classList.toggle('dark', saved);
  }, []);

  // Step handlers
  const handleUserInfoSubmit = () => {
    if (userInfo.organization && userInfo.email) {
      setStep(1);
    }
  };
  const handleSystemSelect = (system) => {
    setCurrentSystem(system);
    setStep(3);
  };
  const handleResultsRequest = () => {
    setActiveModal('results');
    const completed = systems
      .filter(sys =>
        sys.subAssessments.every(sub =>
          answers[sub.id] && Object.keys(answers[sub.id]).length === sub.questions.length
        )
      )
      .map(sys => sys.id);
    setSelectedSystems(completed);
  };
  const handleBookingRequest = () => setActiveModal('booking');

   // Progress calculations
  const completionPercentage = () => {
    const done = systems.filter(sys =>
      sys.subAssessments.every(sub =>
        answers[sub.id] && Object.keys(answers[sub.id]).length === sub.questions.length
      )
    ).length;
    return Math.round((done / systems.length) * 100);
  };
  const calculateSystemCompletion = (system) => {
    const done = system.subAssessments.filter(sub =>
      answers[sub.id] &&
      Object.keys(answers[sub.id]).length === sub.questions.length
    ).length;
    return {
      isCompleted: done === system.subAssessments.length,
      answered: done,
      total: system.subAssessments.length
    };
  };
  const toggleSystemSelection = (id) => {
    setSelectedSystems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // AI analysis
  const generateAnalysis = async () => {
    setGeneratingAnalysis(true);
    try {
      const scores = {};
      const completedSystems = systems.filter(sys =>
        sys.subAssessments.every(sub =>
          answers[sub.id] && Object.keys(answers[sub.id]).length === sub.questions.length
        )
      );

      completedSystems.forEach(system => {
        if (resultsType === 'specific' && !selectedSystems.includes(system.id)) return;
        const systemScores = { systemScore: 0, maxSystemScore: 0, subAssessments: {} };
        system.subAssessments.forEach(sub => {
          const { score, interpretation } = calculateSubAssessmentScore(sub, answers[sub.id] || {});
          const maxSub = Math.max(...sub.scoringRubric.map(r => r.score)) * sub.questions.length;
          systemScores.subAssessments[sub.id] = { score, maxScore: maxSub, interpretation };
          systemScores.systemScore += score;
          systemScores.maxSystemScore += maxSub;
        });
        systemScores.interpretation = getSystemInterpretation(system, systemScores.systemScore);
        scores[system.id] = systemScores;
      });

      const analysisText = await generateSystemReport({
        scores,
        userInfo,
        selectedSystems:
          resultsType === 'specific'
            ? selectedSystems
            : completedSystems.map(sys => sys.id)
      });
      setAnalysisContent(analysisText);
    } catch (error) {
      console.error("AI GENERATION ERROR:", error);
      setAnalysisContent(
        error.message.includes("Missing openrouter API key")
          ? "AI is not configured (missing openrouter API key). Please check your openRouter setup."
          : `Error generating report: ${error.message}`
      );
    } finally {
      setGeneratingAnalysis(false);
    }
  };


  // Download PDF report
  const downloadPDF = () => {
    if (!analysisRef.current) return;
    
    const input = analysisRef.current;
    html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: darkMode ? "#1f2937" : "#ffffff"
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${userInfo.organization || 'assessment'}_report.pdf`);
    });
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
                            darkMode ? "text-yellow-400" : "text-yellow-600"
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

          {/* Step 3: System Assessments */}
          {step === 3 && currentSystem && (
            <>
              {/* Interdependency System */}
              {currentSystem.id === 'interdependency' && (
                <InterdependencySystem 
                  system={currentSystem}
                  answers={answers}
                  setAnswers={setAnswers}
                  onBack={() => setStep(1)}
                  darkMode={darkMode}
                />
              )}
              
              {/* System Of Inlignment */}
              {currentSystem.id === 'inlignment' && (
                <SystemOfInlignment 
                  system={currentSystem}
                  answers={answers}
                  setAnswers={setAnswers}
                  onBack={() => setStep(1)}
                  darkMode={darkMode}
                />
              )}

              {/* System Of Investigation */}
              {currentSystem.id === 'investigation' && (
                <SystemOfInvestigation 
                  system={currentSystem}
                  answers={answers}
                  setAnswers={setAnswers}
                  onBack={() => setStep(1)}
                  darkMode={darkMode}
                />
              )}

              {/* System Of Orchestration */}
              {currentSystem.id === 'orchestration' && (
                <SystemOfOrchestration 
                  system={currentSystem}
                  answers={answers}
                  setAnswers={setAnswers}
                  onBack={() => setStep(1)}
                  darkMode={darkMode}
                />
              )}

              {/* System Of Illustration */}
              {currentSystem.id === 'illustration' && (
                <SystemOfIllustration 
                  system={currentSystem}
                  answers={answers}
                  setAnswers={setAnswers}
                  onBack={() => setStep(1)}
                  darkMode={darkMode}
                />
              )}

              {/* System Of Interpretation */}
              {currentSystem.id === 'interpretation' && (
                <SystemOfInterpretation 
                  system={currentSystem}
                  answers={answers}
                  setAnswers={setAnswers}
                  onBack={() => setStep(1)}
                  darkMode={darkMode}
                />
              )}
            </>
          )}
        </AnimatePresence>
      </div>


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
            <motion.div
              key="modal-container"
              initial={{ opacity: 0, y: 50 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }
              }}
              exit={{
                opacity: 0,
                y: 20,
                transition: { duration: 0.2 }
              }}
              className={`relative max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
                darkMode
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
              }`}
              onClick={e => e.stopPropagation()}
            >
              {/* Glass‑like top bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  activeModal === 'results'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    : activeModal === 'booking'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600'
                }`}
              />

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveModal(null)}
                className={`absolute top-3 right-3 z-10 p-1.5 rounded-full ${
                  darkMode
                    ? 'bg-gray-700/80 hover:bg-gray-600 text-gray-300 backdrop-blur-sm'
                    : 'bg-gray-200/80 hover:bg-gray-300 text-gray-700 backdrop-blur-sm'
                }`}
              >
                <FaTimes className="text-sm" />
              </motion.button>

              {/* Content Area */}
              <div className="overflow-y-auto custom-scrollbar flex-grow p-5">
                {/* 1) Results Modal */}
                {activeModal === 'results' && (
                  <div className="space-y-5">
                    {/* Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        {/* icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h2
                        className={`text-2xl font-bold mb-1 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Assessment Results
                      </h2>
                      <p className={`${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                        {analysisContent
                          ? 'Your AI Analysis Report'
                          : 'Select your report preferences'}
                      </p>
                    </motion.div>

                    {generatingAnalysis ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
                          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            ConseQ-X Analysing... <br />
                            <span className="text-yellow-500 font-semibold">
                            <i>Please wait for your result</i>
                            </span>
                          </p>
                        </div>
                      </motion.div>
                    ) : analysisContent ? (
                      <div className="space-y-5">
                        <div
                          ref={analysisRef}
                          className={`p-6 rounded-xl ${
                            darkMode ? 'bg-gray-800/30 border border-gray-700' : 'bg-white border border-gray-200'
                          }`}
                        >
                          <div className="report-content">
                            <ReactMarkdown
                              components={MarkdownComponents}
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                            >
                              {analysisContent}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setAnalysisContent(null);
                            }}
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
                    ) : (
                      <>
                        {/* Summary */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                          className={`p-4 rounded-xl ${
                            darkMode ? 'bg-gray-800/30' : 'bg-gray-100'
                          }`}
                        >
                          <h3
                            className={`font-bold mb-3 ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
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
                          <p
                            className={`text-sm ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            Completed {Object.keys(answers).length} of {systems.length}{' '}
                            systems
                          </p>
                        </motion.div>

                        {/* Full vs Specific */}
                        <div className="space-y-4">
                          {/* Full Report */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                            className={`p-3 rounded-lg cursor-pointer transition-all ${
                              resultsType === 'all'
                                ? darkMode
                                  ? 'bg-indigo-900/30 border border-indigo-700'
                                  : 'bg-indigo-100 border border-indigo-300'
                                : darkMode
                                ? 'bg-gray-800/30 border border-gray-700 hover:border-indigo-500'
                                : 'bg-gray-100 border border-gray-200 hover:border-indigo-300'
                            }`}
                            onClick={() => setResultsType('all')}
                          >
                            <div className="flex items-start">
                              <div
                                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                                  resultsType === 'all'
                                    ? 'bg-indigo-600 text-white'
                                    : darkMode
                                    ? 'bg-gray-700'
                                    : 'bg-gray-300'
                                }`}
                              >
                                {resultsType === 'all' && '✓'}
                              </div>
                              <div>
                                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  Full Report
                                </h3>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Comprehensive report with all completed assessments
                                </p>
                              </div>
                            </div>
                          </motion.div>

                          {/* Specific Systems */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                            className={`p-3 rounded-lg cursor-pointer transition-all ${
                              resultsType === 'specific'
                                ? darkMode
                                  ? 'bg-indigo-900/30 border border-indigo-700'
                                  : 'bg-indigo-100 border border-indigo-300'
                                : darkMode
                                ? 'bg-gray-800/30 border border-gray-700 hover:border-indigo-500'
                                : 'bg-gray-100 border border-gray-200 hover:border-indigo-300'
                            }`}
                            onClick={() => setResultsType('specific')}
                          >
                            <div className="flex items-start">
                              <div
                                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                                  resultsType === 'specific'
                                    ? 'bg-indigo-600 text-white'
                                    : darkMode
                                    ? 'bg-gray-700'
                                    : 'bg-gray-300'
                                }`}
                              >
                                {resultsType === 'specific' && '✓'}
                              </div>
                              <div>
                                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  Selected Systems
                                </h3>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
                              {systems.map(sys => {
                                const isDone = sys.subAssessments.every(sub =>
                                  answers[sub.id] &&
                                  Object.keys(answers[sub.id]).length === sub.questions.length
                                );
                                return (
                                  <div
                                    key={sys.id}
                                    className={`p-2 rounded cursor-pointer ${
                                      isDone
                                        ? darkMode
                                          ? 'bg-gray-700/30 hover:bg-gray-700/50'
                                          : 'bg-gray-100 hover:bg-gray-200'
                                        : 'opacity-50 cursor-not-allowed'
                                    } ${
                                      selectedSystems.includes(sys.id)
                                        ? darkMode
                                          ? 'bg-blue-900/30'
                                          : 'bg-blue-100'
                                        : ''
                                    }`}
                                    onClick={() => isDone && toggleSystemSelection(sys.id)}
                                  >
                                    <div className="flex items-center">
                                      <div
                                        className={`w-4 h-4 rounded mr-2 flex items-center justify-center ${
                                          darkMode ? 'bg-gray-600' : 'bg-gray-300'
                                        } ${
                                          selectedSystems.includes(sys.id) ? 'bg-blue-500' : ''
                                        }`}
                                      >
                                        {selectedSystems.includes(sys.id) && (
                                          <FaCheck className="text-xs text-white" />
                                        )}
                                      </div>
                                      <span
                                        className={`text-xs ${
                                          isDone
                                            ? darkMode
                                              ? 'text-white'
                                              : 'text-gray-900'
                                            : darkMode
                                            ? 'text-gray-500'
                                            : 'text-gray-400'
                                        }`}
                                      >
                                        {sys.title}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </div>

                        {/* Generate Button */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
                          className="text-center pt-2"
                        >
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={generateAnalysis}
                            disabled={generatingAnalysis}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition shadow-lg disabled:opacity-50"
                          >
                            Run ConseQ-X Ultra Analysis
                          </motion.button>
                        </motion.div>
                      </>
                    )}
                  </div>
                )}

                {/* 2) Booking Session */}
                {activeModal === 'booking' && (
                  <div className="space-y-5 text-center p-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Schedule Consultation
                      </h2>
                      <p className={`${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                        Discuss your results with our experts
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                      className={`p-4 rounded-xl ${
                        darkMode ? 'bg-gray-800/30' : 'bg-gray-100'
                      }`}
                    >
                      <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Our organizational health experts will help you interpret your assessment results and develop an action plan.
                      </p>
                      <p className={`font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        Email us at: <span className="font-bold">consultation@conseq-x.com</span>
                      </p>
                    </motion.div>

                    <div className="flex justify-center gap-4 mt-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveModal('results')}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                      >
                        Back to Results
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.href = 'mailto:consultation@conseq-x.com?subject=Assessment%20Consultation'}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg"
                      >
                        Email Us Now
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* 3) Thank You */}
                {activeModal === 'thankyou' && (
                  <div className="text-center space-y-5 p-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Thank You!
                      </h2>
                      <p className={`${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                        Your assessment has been submitted
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                      className={`p-4 rounded-xl ${
                        darkMode ? 'bg-gray-800/30' : 'bg-gray-100'
                      }`}
                    >
                      <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Your comprehensive organizational health report will be emailed to you shortly.
                      </p>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        For any questions, contact us at <span className="font-medium">support@conseq-x.com</span>
                      </p>
                    </motion.div>

                    <div className="flex flex-col items-center mt-6">
                      <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        How would you rate your experience?
                      </h3>
                      <div className="flex space-x-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className={`text-2xl ${darkMode ? 'text-gray-400' : 'text-gray-300'} ${
                              rating >= star ? 'text-yellow-400' : ''
                            }`}
                          >
                            {rating >= star ? <FaStar /> : <FaRegStar />}
                          </motion.button>
                        ))}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setActiveModal(null);
                          setStep(0);
                          setAnswers({});
                          setAnalysisContent(null);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg"
                      >
                        Complete Assessment
                      </motion.button>
                    </div>
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
        .custom-scrollbar:-webkit-scrollbar-track {
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

        .report-content {
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
        }

        .report-content h1, 
        .report-content h2, 
        .report-content h3 {
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }

        .report-content h1 {
          font-size: 2rem;
          border-bottom: 2px solid;
          padding-bottom: 0.5rem;
          ${({ darkMode }) => darkMode 
            ? 'border-color: #f59e0b; color: #f59e0b;' 
            : 'border-color: #d97706; color: #d97706;'
          }
        }

        .report-content h2 {
          font-size: 1.75rem;
          ${({ darkMode }) => darkMode 
            ? 'color: #fbbf24;' 
            : 'color: #ca8a04;'
          }
        }

        .report-content h3 {
          font-size: 1.5rem;
          ${({ darkMode }) => darkMode 
            ? 'color: #fcd34d;' 
            : 'color: #a16207;'
          }
        }

        .report-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .report-content th {
          background: ${({ darkMode }) => darkMode ? '#1f2937' : '#f3f4f6'};
          text-align: left;
          padding: 14px;
          font-weight: 600;
          border-bottom: 2px solid ${({ darkMode }) => darkMode ? '#374151' : '#d1d5db'};
          color: ${({ darkMode }) => darkMode ? '#f59e0b' : '#d97706'};
        }

        .report-content td {
          padding: 12px 14px;
          border-bottom: 1px solid ${({ darkMode }) => darkMode ? '#374151' : '#e5e7eb'};
        }

        .report-content tr:last-child td {
          border-bottom: none;
        }

        .report-content .rating-emoji {
          font-size: 1.4em;
          text-align: center;
          display: block;
        }

        .recommendation-box {
          background: ${({ darkMode }) => darkMode 
            ? 'linear-gradient(to right, #1e3c72, #2a5298)' 
            : 'linear-gradient(to right, #e6f7ff, #ffffff)'
          };
          border: 1px solid ${({ darkMode }) => darkMode ? '#4ade80' : '#86efac'};
          border-radius: 8px;
          padding: 1.8rem;
          margin: 2.5rem 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
        }

        .recommendation-box::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: ${({ darkMode }) => darkMode 
            ? 'linear-gradient(to right, #4ade80, #3b82f6)' 
            : 'linear-gradient(to right, #10b981, #3b82f6)'
          };
        }

        .health-status {
          background: ${({ darkMode }) => darkMode ? '#2d3748' : '#f0f9ff'};
          border-left: 4px solid #3B82F6;
          padding: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          font-size: 1.2em;
          border-radius: 0 8px 8px 0;
          position: relative;
        }

        .health-status::before {
          content: """;
          position: absolute;
          top: -20px;
          left: 10px;
          font-size: 4em;
          color: ${({ darkMode }) => darkMode ? '#4a5568' : '#dbeafe'};
          font-family: Georgia, serif;
          z-index: 0;
        }
        `}</style>
{/*         
        .header-center {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          background: ${darkMode ? 'linear-gradient(to right, #1a2a6c, #b21f1f, #1a2a6c)' : 'linear-gradient(to right, #3a7bd5, #00d2ff, #3a7bd5)'};
          border-radius: 8px;
          padding: 1.5rem;
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .health-status {
          background: ${darkMode ? '#2d3748' : '#f0f9ff'};
          border-left: 4px solid #3B82F6;
          padding: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          font-size: 1.2em;
          border-radius: 0 8px 8px 0;
          position: relative;
        }
        
        .health-status:before {
          content: """;
          position: absolute;
          top: -20px;
          left: 10px;
          font-size: 4em;
          color: ${darkMode ? '#4a5568' : '#dbeafe'};
          font-family: Georgia, serif;
          z-index: 0;
        }
        
        .recommendation-box {
          background: ${darkMode ? 'linear-gradient(to right, #1e3c72, #2a5298)' : 'linear-gradient(to right, #e6f7ff, #ffffff)'};
          border: 1px solid ${darkMode ? '#4ade80' : '#86efac'};
          border-radius: 8px;
          padding: 1.8rem;
          margin: 2.5rem 0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
        }
        
        .recommendation-box:before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: ${darkMode ? 'linear-gradient(to right, #4ade80, #3b82f6)' : 'linear-gradient(to right, #10b981, #3b82f6)'};
        }
        
        .text-justify {
          text-align: justify;
          line-height: 1.8;
          margin: 1.2rem 0;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.8rem 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        th {
          background: ${darkMode ? '#2d3748' : '#f3f4f6'};
          text-align: left;
          padding: 14px;
          font-weight: 600;
          border-bottom: 2px solid ${darkMode ? '#4a5568' : '#d1d5db'};
        }
        
        td {
          padding: 12px 14px;
          border-bottom: 1px solid ${darkMode ? '#4a5568' : '#e5e7eb'};
        }
        
        tr:last-child td {
          border-bottom: none;
        }
        
        .rating-emoji {
          font-size: 1.4em;
          text-align: center;
          display: block;
        } */}
    </div>
  );
}