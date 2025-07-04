import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo3D from "./assets/ConseQ-X-3d.png";
import { FaSun, FaMoon, FaArrowRight, FaArrowLeft, FaStar, FaRegStar, FaTimes } from 'react-icons/fa';

// System data structure
const systems = [
  {
    id: 'interdependency',
    title: "The System of Interdependency & Interaction",
    icon: "🔗",
    description: "This captures how parts of the organization rely on each other. This system emphasizes that everything in an organization is connected.",
    goal: "Identify where collaboration is likely to fail between teams, departments, or individuals",
    questions: [
      {
        id: 1,
        question: "How would you rate the clarity of interaction roles and responsibilities?",
        options: [
          "No role clarity",
          "Vague roles",
          "Some understanding",
          "Mostly clear roles",
          "Crystal clear roles and boundaries"
        ]
      },
      {
        id: 2,
        question: "How often do interactions occur between key teams?",
        options: [
          "Almost never",
          "Rare and inconsistent",
          "Infrequent but present",
          "Regular scheduled interactions",
          "Consistent, frequent, timely"
        ]
      },
      {
        id: 3,
        question: "How well are interactions aligned to key tasks and priorities?",
        options: [
          "No link to work outcomes",
          "Weak alignment",
          "Some relevance",
          "Mostly aligned",
          "Directly tied to key tasks"
        ]
      }
    ]
  },
  {
    id: 'inlignment',
    title: "The System of Inlignment",
    icon: "🎯",
    description: "A fusion of 'alignment' and 'inline'—ensuring all components work seamlessly toward the same objectives.",
    goal: "Ensure daily decisions reflect the organization's stated vision and mission",
    questions: [
      {
        id: 1,
        question: "How well do staff understand the organization's vision?",
        options: [
          "No connection to behavior",
          "Understood but not practiced",
          "Inconsistent application",
          "Evident in most behaviors",
          "Embedded in all actions"
        ]
      },
      {
        id: 2,
        question: "How consistently do leaders model the vision through their actions?",
        options: [
          "Leaders contradict vision",
          "Occasional alignment",
          "Inconsistent modeling",
          "Most leaders model vision",
          "All leaders exemplify vision"
        ]
      }
    ]
  },
  {
    id: 'investigation',
    title: "The System of Investigation",
    icon: "🔎",
    description: "How an organization digs for answers and keeps looking for the 'whys' of incidents to understand root causes.",
    goal: "Check if different teams interpret data/events consistently or cause misalignment",
    questions: [
      {
        id: 1,
        question: "How consistently do teams interpret key metrics?",
        options: [
          "Highly fragmented",
          "Some alignment, frequent contradictions",
          "Reasonable coherence with blind spots",
          "Mostly aligned with exceptions",
          "Strong, consistent across all levels"
        ]
      },
      {
        id: 2,
        question: "How consistently do teams respond to similar events?",
        options: [
          "Wildly different responses",
          "Frequent contradictions",
          "Moderate consistency",
          "Mostly consistent",
          "Always aligned responses"
        ]
      }
    ]
  },
  {
    id: 'orchestration',
    title: "The System of Orchestration",
    icon: "🔄",
    description: "A continuous improvement process driven by repeated cycles of testing, learning, and refining.",
    goal: "Determine how quickly your organization can respond to change",
    questions: [
      {
        id: 1,
        question: "How prepared is your organization for change?",
        options: [
          "Not prepared at all",
          "Limited preparedness",
          "Functional but needs improvement",
          "Well-developed readiness",
          "Fully embedded readiness"
        ]
      },
      {
        id: 2,
        question: "How comfortable is your organization acting with incomplete information?",
        options: [
          "Extremely uncomfortable",
          "Somewhat uncomfortable",
          "Moderately comfortable",
          "Comfortable with uncertainty",
          "Thrives with uncertainty"
        ]
      }
    ]
  },
  {
    id: 'illustration',
    title: "The System of Illustration",
    icon: "📊",
    description: "The way ideas, strategies, and visions are communicated, emphasizing visualization of how components interact.",
    goal: "Assess how well strategy is communicated visually and narratively",
    questions: [
      {
        id: 1,
        question: "How available are strategic visuals in your organization?",
        options: [
          "Absent or fragmented",
          "Present but inconsistent/unclear",
          "Useful in some areas",
          "Clear and regularly used",
          "Integral and consistent across levels"
        ]
      },
      {
        id: 2,
        question: "How well can staff recall strategic messages using visuals?",
        options: [
          "Cannot recall any visuals",
          "Recall vague concepts",
          "Recall some elements",
          "Recall most key parts",
          "Explain strategy using visuals"
        ]
      }
    ]
  },
  {
    id: 'interpretation',
    title: "The System of Interpretation",
    icon: "🧠",
    description: "Uncovering deeper meaning behind behaviors, incidents, and patterns within an organization.",
    goal: "Identify if your organization scapegoats individuals or diagnoses systems",
    questions: [
      {
        id: 1,
        question: "What is the first reaction when problems occur?",
        options: [
          "Always 'Who did this?'",
          "Mostly 'Who did this?'",
          "Mixed between who and what",
          "Mostly 'What caused this?'",
          "Always 'What caused this?'"
        ]
      },
      {
        id: 2,
        question: "How are errors framed by leadership?",
        options: [
          "Always personal failure",
          "Mostly personal terms",
          "Mixed personal/systemic",
          "Mostly systemic terms",
          "Always systemic terms"
        ]
      }
    ]
  }
];

export default function AssessmentPlatform() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [userInfo, setUserInfo] = useState({
    organization: '',
    role: '',
    email: ''
  });
  const [darkMode, setDarkMode] = useState(false);
  const [currentSystem, setCurrentSystem] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [resultsRequested, setResultsRequested] = useState(false);
  const [resultsType, setResultsType] = useState('all');
  const [bookingRequested, setBookingRequested] = useState(false);
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // Navbar scroll effect
  const handleScroll = () => {
    setNavScrolled(window.scrollY > 50);
  };
  window.addEventListener("scroll", handleScroll);

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
    setCurrentSystem(system);
    setCurrentQuestion(0);
    setStep(2);
  };

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    const newAnswers = { ...answers };
    if (!newAnswers[currentSystem.id]) newAnswers[currentSystem.id] = {};
    newAnswers[currentSystem.id][currentQuestion] = answer;
    setAnswers(newAnswers);

    // Move to next question or finish system
    if (currentQuestion < currentSystem.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStep(1); // Return to dashboard
      setCurrentSystem(null);
    }
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
    const answered = Object.keys(answers).length;
    return Math.round((answered / systems.length) * 100);
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
                {/* <span className="text-sm ml-2 font-normal text-gray-500">Assessment</span> */}
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
                    const isCompleted = answers[system.id];
                    const isInProgress = !isCompleted && Object.keys(answers).some(id => id === system.id);
                    
                    return (
                      <motion.div 
                        key={system.id}
                        variants={serviceItem}
                        whileHover={{ y: -10 }}
                        className={`p-6 rounded-xl border transition-all h-full flex flex-col cursor-pointer ${
                          darkMode 
                            ? "bg-gray-800/30 border-gray-700 hover:border-yellow-500" 
                            : "bg-white border border-gray-200 hover:border-yellow-500"
                        } shadow-lg hover:shadow-xl`}
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
                              {isCompleted ? `${system.questions.length}/${system.questions.length}` : 
                               isInProgress ? `${Object.keys(answers[system.id] || {}).length}/${system.questions.length}` : 
                               `0/${system.questions.length}`}
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
                                isInProgress ? `${(Object.keys(answers[system.id] || {}).length / system.questions.length) * 100}%` : '0%' 
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

          {/* Step 2: System Assessment */}
          {step === 2 && currentSystem && (
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
              
              <div className={`p-8 rounded-xl shadow-lg ${
                darkMode 
                  ? "bg-gray-800/50 border border-gray-700" 
                  : "bg-white border border-gray-200"
              }`}>
                <div className="flex justify-between items-center mb-8">
                  <h3 className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Question {currentQuestion + 1} of {currentSystem.questions.length}
                  </h3>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      style={{ width: `${((currentQuestion + 1) / currentSystem.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h4 className={`text-xl font-medium mb-8 ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}>
                  {currentSystem.questions[currentQuestion].question}
                </h4>

                <div className="space-y-4">
                  {currentSystem.questions[currentQuestion].options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        darkMode 
                          ? "bg-gray-700/50 border border-gray-600 hover:border-yellow-500" 
                          : "bg-gray-100 border border-gray-200 hover:border-yellow-500"
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-0.5 ${
                          darkMode ? "bg-gray-600" : "bg-gray-300"
                        }`}>
                          <span className="font-medium">{String.fromCharCode(65 + index)}</span>
                        </div>
                        <div>{option}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
}