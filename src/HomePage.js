import { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView, AnimatePresence } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { FaSun, FaMoon, FaQuoteLeft, FaQuoteRight, FaTimes } from "react-icons/fa";
import Logo3D from "./assets/ConseQ-X-3d.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";


export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const [authReturnTo, setAuthReturnTo] = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("flagship");
  const [showTooltip, setShowTooltip] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);
  const [showCEOPrompt, setShowCEOPrompt] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });
  
  const controls = useAnimation();
  const servicesRef = useRef(null);
  const servicesInView = useInView(servicesRef, { once: true, margin: "-100px" });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
    localStorage.setItem('darkMode', !darkMode ? 'true' : 'false');
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
    setShowBookingModal(false);
  };

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    document.documentElement.classList.toggle('dark', savedDarkMode);

    // Smooth scrolling setup
    const lenis = new Lenis({ lerp: 0.05, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Navbar scroll effect
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Services animation trigger
    if (servicesInView) {
      controls.start("visible");
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [servicesInView, controls]);

  useEffect(() => {
    const open = Boolean(location?.state?.openCEOPrompt);
    if (open) {
      setAuthReturnTo(location.state?.returnTo || null);
      setShowCEOPrompt(true);

      // Clear location.state so refresh/back doesn't re-open the modal.
      try {
        navigate(location.pathname + (location.search || ""), { replace: true, state: {} });
      } catch {}
    }
  }, [location?.state, location?.pathname, location?.search, navigate]);

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

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.3
      }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  // Enhanced button animation
  const buttonHover = {
    scale: 1.05,
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
    transition: { duration: 0.3 }
  };

  const buttonTap = {
    scale: 0.95,
    transition: { duration: 0.2 }
  };

  // PDF content integration
  const flagshipPrograms = [
    "Organizational Health & Diagnostic Audit",
    "Alignment & Operating Blueprint Design",
    "Organizational Systems Design"
  ];

  const toolkitsSaaS = [
    "Maturity Scorecard",
    "ConseQ-ULTRA Assessment Tool",
    "OSAM Frameworks"
  ];

  const ourSolutionProgram = [
    "Diagnosing systemic misalignment (TORIL Diagnostic)",
    "Designing scalable operating blueprints",
    "Embedding feedback loops and role clarity",
    "Aligning leadership behavior with strategy",
    "Productizing transformation for scale",
  ];

  
const whyDifferent = [
                  {
                    text: "We **systematize** what others guess",
                    boldWord: "systematize"
                  },
                  {
                    text: "We **embed**, not just advise",
                    boldWord: "embed"
                  },
                  {
                    text: "We **think in loops**, not silos",
                    boldWord: "think in loops"
                  },
                  {
                    text: "We **design** for humans and scale",
                    boldWord: "design"
                  }
                ];

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
            {/* Enhanced 3D logo with glow effect */}
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
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['Vision', 'Mission', 'Services', 'Approach', 'Contact'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * ['Vision', 'Mission', 'Services', 'Approach', 'Contact'].indexOf(item) }}
                  className={`transition-colors font-medium hover:text-yellow-500 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                  whileHover={{ 
                    y: -3,
                    textShadow: "0 0 8px rgba(234, 179, 8, 0.5)",
                    transition: { duration: 0.3 }
                  }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
            
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
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden focus:outline-none ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <div className={`w-6 h-0.5 mb-1.5 ${
                darkMode ? "bg-gray-300" : "bg-gray-700"
              }`}></div>
              <div className={`w-6 h-0.5 mb-1.5 ${
                darkMode ? "bg-gray-300" : "bg-gray-700"
              }`}></div>
              <div className={`w-4 h-0.5 ${
                darkMode ? "bg-gray-300" : "bg-gray-700"
              }`}></div>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`md:hidden overflow-hidden ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-3">
              {['Vision', 'Mission', 'Services', 'Approach', 'Contact'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className={`py-2 border-b ${
                    darkMode 
                      ? "text-gray-300 border-gray-700" 
                      : "text-gray-700 border-gray-100"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                backgroundColor: darkMode ? 'rgba(234, 179, 8, 0.05)' : 'rgba(234, 179, 8, 0.1)'
              }}
              initial={{ 
                width: Math.random() * 100 + 50, 
                height: Math.random() * 100 + 50,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0
              }}
              animate={{ 
                opacity: [0, 0.3, 0],
                scale: [0, 1.2, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
            className="max-w-4xl"
          >
            <span className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Conse<span className="text-yellow-500">Q</span>-X
              </span>
            <motion.div variants={fadeUp} className="mb-6">

              <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 ${
                darkMode 
                  ? "bg-yellow-500/20 text-yellow-400" 
                  : "bg-yellow-500/10 text-yellow-700"
              }`}>
                Systems-Thinking Consulting
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeUp}
              className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Engineering <span className="text-yellow-500">Healthier</span> Organizations
            </motion.h1>
            
            <motion.p 
              variants={fadeUp}
              className={`text-xl md:text-2xl max-w-3xl mb-10 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              We help organizations scale with alignment, flow, and intentionality through system-based diagnostics and design.
            </motion.p>
            
            <motion.div 
              variants={fadeUp}
              className="flex flex-wrap gap-4"
            >
              {/* Tooltip for Our Approach button */}
              <div className="relative">
                <motion.button
                  whileHover={{ ...buttonHover, backgroundColor: darkMode ? "#1f2937" : "#374151" }}
                  whileTap={buttonTap}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className={`px-8 py-3 font-semibold rounded-lg transition-colors ${
                    darkMode 
                      ? "bg-gray-700 text-white hover:bg-gray-600" 
                      : "bg-gray-800 text-white hover:bg-gray-900"
                  }`}
                >
                  Our Approach
                </motion.button>
                
                {/* Advanced Tooltip */}
                {showTooltip && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`absolute z-50 w-64 p-4 mt-2 rounded-lg shadow-xl ${
                      darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                    }`}
                    style={{ 
                      left: "50%", 
                      transform: "translateX(-50%)",
                      bottom: "100%"
                    }}
                  >
                    <div className={`text-sm font-medium ${
                      darkMode ? "text-yellow-400" : "text-yellow-600"
                    }`}>
                     ConseQ-X Methodology
                    </div>
                    <div className={`mt-2 text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      We deliver measurable outcomes by aligning critical organizational components with strategic goals, ensuring resilience and growth in dynamic industries.
                    </div>
                    <div className="absolute w-4 h-4 transform rotate-45 -bottom-2 left-1/2 -ml-2" 
                         style={{ 
                           backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                           borderRight: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                           borderBottom: darkMode ? "1px solid #374151" : "1px solid #e5e7eb"
                         }} 
                    />
                  </motion.div>
                )}
              </div>
              
              {/* C-Suite Partner Button */}
              <motion.button
                whileHover={buttonHover}
                whileTap={buttonTap}
                onClick={() => setShowCEOPrompt(true)}
                className="px-8 py-3 font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg hover:opacity-95 transition-all"
              >
                C-Suite Partner
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1.5
          }}
        >
          <span className={`text-sm mb-2 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}>
            Scroll to explore
          </span>
          <motion.div 
            className={`w-0.5 h-8 rounded-full ${
              darkMode ? "bg-gray-600" : "bg-gray-400"
            }`}
            animate={{ 
              y: [0, 10, 0],
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </section>

      {/* CTA Section  */}
      <section className={`py-20 md:py-32 ${
        darkMode ? "bg-gray-900" : "bg-white"
      }`}>
        <div className="container mx-auto px-4">    
              {/* Beautifully aligned text above button */}
              <motion.div 
                variants={fadeUp}
                className="mt-16 text-center"
              >
                <p className={`text-xl md:text-2xl font-medium mb-8 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Is your organization healthy? Let's check
                </p>
                
                {/* Centered button with animation */}
                <div className="flex justify-center">
                  <motion.button
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    onClick={ () => { 
                      setShowToolModal(true);
                    }}
                    className={`px-10 sm:px-16 py-5 sm:py-8 bg-yellow-500 text-white font-bold hover:bg-yellow-600 rounded-lg shadow-lg transition-all ${
                      darkMode ? "hover:bg-yellow-600" : "hover:bg-yellow-600"
                    }`}
                  >
                    Take Your Assessment Now
                  </motion.button>
                </div>
              </motion.div>
          </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className={`py-20 md:py-32 ${
        darkMode 
          ? "bg-gradient-to-r from-gray-800 to-gray-900" 
          : "bg-gradient-to-r from-gray-50 to-gray-100"
      }`}>
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerChildren}
            >
              <motion.div variants={fadeUp} className="mb-2">
                <span className={`font-bold text-sm uppercase tracking-wider ${
                  darkMode ? "text-yellow-400" : "text-yellow-500"
                }`}>
                  Our North Star
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className={`text-4xl md:text-5xl font-bold mb-8 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                Vision
              </motion.h2>
              <motion.p 
                variants={fadeUp}
                className={`text-xl md:text-2xl p-8 rounded-2xl shadow-lg border-l-4 border-yellow-500 ${
                  darkMode 
                    ? "bg-gray-800/80 text-gray-200" 
                    : "bg-white text-gray-800"
                }`}
              >
                To become the most trusted systems-thinking consulting partner in emerging and high-growth markets.
              </motion.p>
              
              <motion.div 
                variants={fadeUp}
                className="mt-16 grid md:grid-cols-2 gap-8"
              >
                <div className={`p-6 rounded-xl shadow-md ${
                  darkMode ? "bg-gray-800/50" : "bg-white"
                }`}>
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Who We Are
                  </h3>
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    ConseQ-X, a systems-first, transformation-driven consultancy, turns complex organizational challenges into structured, productized solutions for lasting impact.
                  </p>
                </div>
                
                <div className={`p-6 rounded-xl shadow-md ${
                  darkMode ? "bg-gray-800/50" : "bg-white"
                }`}>
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    The Problem We Solve
                  </h3>
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    As organizations grow, they often face misalignment, inefficiencies, and reactive approaches, leading to fragmented cultures, siloed operations, inconsistent execution, and revenue loss.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className={`py-20 md:py-32 ${
        darkMode ? "bg-gray-900" : "bg-white"
      }`}>
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerChildren}
            >
              <motion.div variants={fadeUp} className="mb-2">
                <span className={`font-bold text-sm uppercase tracking-wider ${
                  darkMode ? "text-yellow-400" : "text-yellow-500"
                }`}>
                  Our Purpose
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className={`text-4xl md:text-5xl font-bold mb-8 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                Mission
              </motion.h2>
              <motion.div 
                variants={fadeUp}
                className="relative"
              >
                <div className="flex flex-col items-start">
                  <FaQuoteLeft 
                    className={`text-3xl mb-4 ${darkMode ? "text-yellow-500/30" : "text-yellow-500/20"}`} 
                    style={{ marginTop: "-0.5rem" }}
                  />
                  <p className={`text-2xl md:text-3xl font-light pl-4 max-w-4xl ${
                    darkMode ? "text-gray-300" : "text-gray-800"
                  }`}>
                    Help organizations scale with <span className="font-semibold text-yellow-600">alignment</span>, <span className="font-semibold text-yellow-600">flow</span>, and <span className="font-semibold text-yellow-600">intentionality</span>.
                  </p>
                  <div className="self-end mt-4">
                    <FaQuoteRight 
                      className={`text-3xl ${darkMode ? "text-yellow-500/30" : "text-yellow-500/20"}`} 
                      style={{ marginRight: "clamp(1rem, 7vw, 7rem)" }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section with Enhanced Background */}
      <section id="services" className={`py-20 md:py-32 ${
        darkMode 
          ? "bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800" 
          : "bg-gradient-to-br from-blue-50 via-yellow-50 to-blue-50"
      }`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeUp} className="mb-2 text-center">
              <span className={`font-bold text-sm uppercase tracking-wider ${
                darkMode ? "text-yellow-400" : "text-yellow-500"
              }`}>
                How We Deliver Value
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className={`text-4xl md:text-5xl font-bold mb-16 text-center ${
              darkMode ? "text-white" : "text-gray-800"
            }`}>
              Our Services
            </motion.h2>
          </motion.div>
          
          <motion.div 
            ref={servicesRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerChildren}
            initial="hidden"
            animate={controls}
          >
            {[
              {
                title: "System Diagnostics",
                description: "Comprehensive analysis of your organizational systems to identify bottlenecks and opportunities.",
                icon: "🔍"
              },
              {
                title: "Organizational Design",
                description: "Creating structures and processes that align with your strategic objectives and growth trajectory.",
                icon: "🧩"
              },
              {
                title: "Leadership Alignment",
                description: "Ensuring executive teams are strategically aligned and equipped to drive transformation.",
                icon: "🤝"
              },
              {
                title: "Outcome Engineering",
                description: "Shaping organizational culture to support your strategic vision and operational excellence.",
                icon: "🌱"
              }
            ].map((service, index) => (
              <motion.div 
                key={index}
                variants={serviceItem}
                className={`p-8 rounded-xl border transition-all h-full ${
                  darkMode 
                    ? "bg-gray-800/50 border-gray-700 hover:border-yellow-500" 
                    : "bg-white border border-gray-100 hover:border-yellow-500"
                } shadow-lg hover:shadow-xl flex flex-col`}
                whileHover={{ 
                  y: -10,
                  borderColor: darkMode ? "rgba(234, 179, 8, 0.5)" : "rgba(234, 179, 8, 0.5)"
                }}
              >
                <div className="text-4xl mb-6">{service.icon}</div>
                <h3 className={`text-xl font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>
                  {service.title}
                </h3>
                <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} flex-grow`}>
                  {service.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Offerings Section */}
      <section className={`py-20 md:py-32 ${
        darkMode ? "bg-gray-900" : "bg-white"
      }`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeUp} className="mb-2">
              <span className={`font-bold text-sm uppercase tracking-wider ${
                darkMode ? "text-yellow-400" : "text-yellow-500"
              }`}>
                Our Solutions
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className={`text-4xl md:text-5xl font-bold mb-8 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
              Our Offerings
            </motion.h2>
          </motion.div>
          
          <div className="max-w-5xl mx-auto">
            {/* Tabs for Offerings */}
            <div className={`mb-8 flex overflow-x-auto border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}>
              <button
                onClick={() => setActiveTab("flagship")}
                className={`py-3 px-6 font-medium text-sm whitespace-nowrap ${
                  activeTab === "flagship"
                    ? darkMode
                      ? "text-yellow-400 border-b-2 border-yellow-400"
                      : "text-yellow-600 border-b-2 border-yellow-600"
                    : darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                }`}
              >
                Flagship Programs
              </button>
              <button
                onClick={() => setActiveTab("toolkits")}
                className={`py-3 px-6 font-medium text-sm whitespace-nowrap ${
                  activeTab === "toolkits"
                    ? darkMode
                      ? "text-yellow-400 border-b-2 border-yellow-400"
                      : "text-yellow-600 border-b-2 border-yellow-600"
                    : darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                }`}
              >
                Toolkits/SaaS
              </button>
              <button
                onClick={() => setActiveTab("ourSolution")}
                className={`py-3 px-6 font-medium text-sm whitespace-nowrap ${
                  activeTab === "ourSolution"
                    ? darkMode
                      ? "text-yellow-400 border-b-2 border-yellow-400"
                      : "text-yellow-600 border-b-2 border-yellow-600"
                    : darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                }`}
              >
                Our Solution
              </button>
            </div>
            
            {/* Tab Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              {activeTab === "flagship" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {flagshipPrograms.map((program, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ y: -5 }}
                      className={`p-6 rounded-lg ${
                        darkMode 
                          ? "bg-gray-800/50 border border-gray-700" 
                          : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-start mb-3">
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 ${
                          darkMode ? "bg-yellow-500/20" : "bg-yellow-500/10"
                        } flex items-center justify-center mr-3`}>
                          <span className="text-yellow-500 font-bold">{index + 1}</span>
                        </div>
                        <h3 className={`text-lg font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}>
                          {program}
                        </h3>
                      </div>
                      {/* <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                        Comprehensive solution designed for enterprise transformation
                      </p> */}
                    </motion.div>
                  ))}
                </div>
              )}
              
              {activeTab === "toolkits" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {toolkitsSaaS.map((toolkit, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ y: -5 }}
                      className={`p-6 rounded-lg ${
                        darkMode 
                          ? "bg-gray-800/50 border border-gray-700" 
                          : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-start mb-3">
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 ${
                          darkMode ? "bg-yellow-500/20" : "bg-yellow-500/10"
                        } flex items-center justify-center mr-3`}>
                          <span className="text-yellow-500 font-bold">{index + 1}</span>
                        </div>
                        <h3 className={`text-lg font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}>
                          {toolkit}
                        </h3>
                      </div>
                      {/* <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                        Scalable solutions for continuous improvement
                      </p> */}
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === "ourSolution" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {ourSolutionProgram.map((toolkit, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ y: -5 }}
                      className={`p-6 rounded-lg ${
                        darkMode 
                          ? "bg-gray-800/50 border border-gray-700" 
                          : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-start mb-3">
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 ${
                          darkMode ? "bg-yellow-500/20" : "bg-yellow-500/10"
                        } flex items-center justify-center mr-3`}>
                          <span className="text-yellow-500 font-bold">{index + 1}</span>
                        </div>
                        <h3 className={`text-lg font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}>
                          {toolkit}
                        </h3>
                      </div>
                      {/* <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                        Scalable solutions for continuous improvement
                      </p> */}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section className={`py-20 md:py-32 ${
        darkMode 
          ? "bg-gradient-to-r from-gray-800 to-gray-900" 
          : "bg-gradient-to-r from-gray-50 to-gray-100"
      }`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeUp} className="mb-2">
              <span className={`font-bold text-sm uppercase tracking-wider ${
                darkMode ? "text-yellow-400" : "text-yellow-500"
              }`}>
                Our Unique Approach
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className={`text-4xl md:text-5xl font-bold mb-8 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>
              Why We Are Different
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyDifferent.map((point, index) => {
                const parts = point.text.split(`**${point.boldWord}**`);
                return (
                  <motion.div 
                    key={index}
                    variants={fadeUp}
                    className={`p-6 rounded-xl ${
                      darkMode ? "bg-gray-800/50" : "bg-white"
                    } shadow-md`}
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <div className={`w-12 h-12 rounded-lg ${
                      darkMode ? "bg-yellow-500/20" : "bg-yellow-500/10"
                    } flex items-center justify-center mb-4`}>
                      <span className="text-yellow-500 font-bold text-lg">{index + 1}</span>
                    </div>
                    <p className={`text-lg ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}>
                      {parts[0]}
                      <span className="font-bold text-yellow-500">{point.boldWord}</span>
                      {parts[1]}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Approach Section */}
      <section id="approach" className={`py-20 md:py-32 ${
        darkMode ? "bg-gray-900" : "bg-white"
      }`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeUp} className="mb-2">
              <span className={`font-bold text-sm uppercase tracking-wider ${
                darkMode ? "text-yellow-400" : "text-yellow-500"
              }`}>
                Philosophy
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className={`text-4xl md:text-5xl font-bold mb-16 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>
              Our Core Philosophy
            </motion.h2>
          </motion.div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* What We See */}
                  <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className={`p-8 rounded-xl flex justify-center items-center shadow-lg ${
                      darkMode ? "bg-gray-800/50" : "bg-gray-50"
                    }`}
                  >
                    <p  className={`text-2xl md:text-3xl font-light pl-4 max-w-4xl ${
                        darkMode ? "text-gray-300" : "text-gray-800"
                      }`}>
                      <span className="text-yellow-500 font-semibold">Design </span>
                       influences <span className="text-yellow-500 font-semibold ">
                      behaviour </span> and behaviour determines organizational   
                      <span className="text-yellow-500 font-semibold"> performance! </span>
                        
                    </p>
                  </motion.div>

              
              {/* Our DNA */}
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`p-8 rounded-xl shadow-lg ${
                  darkMode ? "bg-gray-800/50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 rounded-lg ${
                    darkMode ? "bg-yellow-500/20" : "bg-yellow-500/10"
                  } flex items-center justify-center mr-4`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    Our DNA
                  </h3>
                </div>
                <ul className={`space-y-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-1">•</span>
                    <span>Systems Driven  Transformation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-1">•</span>
                    <span> Relational and Cognitive Precision</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-1">•</span>
                    <span> Industry Agnostic Adaptability</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-1">•</span>
                    <span>Collaborative Partnership Model</span>
                  </li>
                  {/* <li className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-1">•</span>
                    <span>Human-Centric Change Programs</span>
                  </li>  */}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      

      {/* Enhanced Motto Section */}
      <section className="py-20 md:py-40 bg-gradient-to-r from-yellow-500 to-yellow-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div 
              variants={fadeUp}
              className="text-center mb-10"
            >
              {/* Professional Text Structure */}
              <div className="grid gap-6">
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-snug">
                  Distinctive Value
                </h2>
                
                <div className="space-y-4 text-white">
                  <p className="text-2xl md:text-4xl font-medium leading-relaxed">
                    ConseQ-X uniquely integrates intangible drivers, relationships, systems, 
                    and organizational behavior into structured, measurable outcomes.
                  </p>
                  
                  <p className="text-2xl md:text-4xl font-medium leading-relaxed">
                    Our innovative systems-focused approach guarantees lasting transformation, 
                    positioning ConseQ-X ahead of conventional consulting firms.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.button
              variants={fadeUp}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowToolModal(true)}
              className="mt-10 px-10 py-5 bg-gray-900 text-xl font-bold text-white rounded-lg shadow-xl hover:bg-gray-800 transition-all duration-300 transform"
            >
              Transform Your Organization
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={`py-20 ${
        darkMode ? "bg-gray-800" : "bg-gray-50"
      }`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerChildren}
              className="text-center"
            >
              <motion.div variants={fadeUp} className="mb-2">
                <span className={`font-bold text-sm uppercase tracking-wider ${
                  darkMode ? "text-yellow-400" : "text-yellow-500"
                }`}>
                  Get in Touch
                </span>
              </motion.div>
              <motion.h2 variants={fadeUp} className={`text-4xl font-bold mb-6 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                Ready to Transform Your Organization?
              </motion.h2>
              <motion.p variants={fadeUp} className={`text-xl mb-10 max-w-2xl mx-auto ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Let's discuss how we can help you achieve alignment, flow, and intentionality at scale.
              </motion.p>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className={`rounded-2xl shadow-lg p-8 ${
                darkMode ? "bg-gray-700/50" : "bg-white"
              }`}
            >
              {/* Enhanced Buttons */}
              <div className="flex flex-wrap gap-4 mb-8 justify-center">
                <motion.button
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  onClick={() => setShowBookingModal(true)}
                  className={`px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-lg shadow-lg transition-all ${
                    darkMode 
                      ? "hover:from-yellow-600 hover:to-yellow-700" 
                      : "hover:from-yellow-600 hover:to-yellow-700"
                  }`}
                >
                  Book a Diagnostic Session
                </motion.button>
                
                <motion.button
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  onClick={() => setShowToolModal(true)}
                  className={`px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-semibold rounded-lg shadow-lg transition-all ${
                    darkMode 
                      ? "hover:from-gray-800 hover:to-gray-900" 
                      : "hover:from-gray-800 hover:to-gray-900"
                  }`}
                >
                  Check Our ConseQ-ULTRA Tool
                </motion.button>
              </div>
              
              {/* <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`} htmlFor="name">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      darkMode 
                        ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400" 
                        : "border-gray-300"
                    }`}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className={`block mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`} htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      darkMode 
                        ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400" 
                        : "border-gray-300"
                    }`}
                    placeholder="Your email"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`} htmlFor="company">Company</label>
                  <input 
                    type="text" 
                    id="company" 
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      darkMode 
                        ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400" 
                        : "border-gray-300"
                    }`}
                    placeholder="Your company"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`} htmlFor="message">Message</label>
                  <textarea 
                    id="message" 
                    rows="4"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      darkMode 
                        ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400" 
                        : "border-gray-300"
                    }`}
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <motion.button 
                    type="submit"
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    className="w-full px-6 py-4 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Send Message
                  </motion.button>
                </div>
              </form> */}
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer with Attribution */}
      <footer className={`py-12 ${
        darkMode ? "bg-gray-900" : "bg-gray-900"
      }`}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center">
                  {/* Footer Logo with enhanced glow */}
                  <motion.img 
                    src={Logo3D} 
                    alt="ConseQ-X Logo" 
                    className="h-20 w-auto mr-3 transition-all duration-500"
                    animate={{
                      filter: darkMode 
                        ? "drop-shadow(0 0 8px rgba(234, 179, 8, 0.8))" 
                        : "drop-shadow(0 0 6px rgba(234, 179, 8, 0.6))"
                    }}
                  />
                </div>
                <p className={`mt-4 text-sm max-w-xs ${
                  darkMode ? "text-gray-400" : "text-gray-400"
                }`}>
                  Engineering Healthier, Aligned, and More Effective Organizations
                  <br />
                  <span>Email Us: </span><a href="mailto:osd@conseq-x.com" className="text-yellow-500 hover:underline">
                    osd@conseq-x.com
                  </a>
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
                <div>
                  <h3 className="text-white font-medium mb-4">Company</h3>
                  <ul className="space-y-2">
                    <li><a href="#vision" className="text-gray-400 hover:text-yellow-500 transition-colors">Vision</a></li>
                    <li><a href="#mission" className="text-gray-400 hover:text-yellow-500 transition-colors">Mission</a></li>
                    <li><a href="#services" className="text-gray-400 hover:text-yellow-500 transition-colors">Services</a></li>
                    <li><a href="#approach" className="text-gray-400 hover:text-yellow-500 transition-colors">Approach</a></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-white font-medium mb-4">Connect</h3>
                  <ul className="space-y-2">
                    <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">LinkedIn</button></li>
                    <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">Twitter</button></li>
                    <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">Instagram</button></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-white font-medium mb-4">Legal</h3>
                  <ul className="space-y-2">
                    <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">Privacy Policy</button></li>
                    <li><button className="text-gray-400 hover:text-yellow-500 transition-colors text-left">Terms of Service</button></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className={`border-t mt-12 pt-8 text-sm text-center ${
              darkMode ? "border-gray-800 text-gray-500" : "border-gray-800 text-gray-500"
            }`}>
              © {new Date().getFullYear()} ConseQ-X. All rights reserved.
              <div className="mt-2 text-gray-600">
                Designed and Developed by <a className="text-yellow-500" href="https://www.fescode.com" target="_blank" rel="noreferrer"> <em>FesCode Limited</em></a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowBookingModal(false)}
            />
            <motion.div 
              className={`relative max-w-md w-full rounded-xl z-10 ${
                darkMode ? "bg-gray-800" : "bg-white"
              } p-8`}
              variants={modalVariants}
            >
              <button 
                className={`absolute top-4 right-4 p-2 rounded-full ${
                  darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setShowBookingModal(false)}
              >
                <FaTimes />
              </button>
              
              <h2 className={`text-2xl font-bold mb-6 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                Book a Diagnostic Session
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className={`block mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`} htmlFor="name">Name</label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 text-white" 
                        : "border-gray-300"
                    }`}
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="mb-4">
                  <label className={`block mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`} htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email"
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 text-white" 
                        : "border-gray-300"
                    }`}
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="mb-4">
                  <label className={`block mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`} htmlFor="company">Company</label>
                  <input 
                    type="text" 
                    id="company"
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 text-white" 
                        : "border-gray-300"
                    }`}
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="mb-6">
                  <label className={`block mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`} htmlFor="message">Message</label>
                  <textarea 
                    id="message"
                    rows="4"
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 text-white" 
                        : "border-gray-300"
                    }`}
                    value={formData.message}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                
                <motion.button
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  type="submit"
                  className="w-full px-4 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Book Session
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tool Modal */}
      <AnimatePresence>
        {showToolModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowToolModal(false)}
            />
            <motion.div 
              className={`relative max-w-md w-full rounded-xl z-10 ${
                darkMode ? "bg-gray-800" : "bg-white"
              } p-8`}
              variants={modalVariants}
            >
              <button 
                className={`absolute top-4 right-4 p-2 rounded-full ${
                  darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setShowToolModal(false)}
              >
                <FaTimes />
              </button>
              
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
                  darkMode ? "bg-yellow-500/20" : "bg-yellow-500/10"
                }`}>
                  <span className="text-3xl text-yellow-500">🔧</span>
                </div>
                
                <h2 className={`text-2xl font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>
                  ConseQ-ULTRA Tool
                </h2>
                
                <p className={`mb-6 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  You are about to access our advanced organizational assessment tool. This powerful diagnostic will provide insights into your company's alignment, efficiency, and growth potential.
                </p>
                
                <div className="flex flex-col gap-3">
                  <motion.button
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    onClick={() => navigate('/assessment')}
                    className={`px-4 py-3 rounded-lg font-semibold ${
                      darkMode 
                        ? "bg-yellow-500 text-gray-900 hover:bg-yellow-600" 
                        : "bg-yellow-500 text-gray-900 hover:bg-yellow-600"
                    }`}
                  >
                    Continue to Tool
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ ...buttonHover, backgroundColor: darkMode ? "#374151" : "#e5e7eb" }}
                    whileTap={buttonTap}
                    className={`px-4 py-3 rounded-lg font-medium ${
                      darkMode 
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                    onClick={() => setShowToolModal(false)}
                  >
                    Learn More First
                  </motion.button>
                  
                  <motion.button
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    onClick={() => {setShowCEOPrompt(true); setShowToolModal(false);}}
                    className="px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow hover:opacity-95"
                  >
                    C-Suite Partner
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CEO Prompt Modal */}
      <AnimatePresence>
        {showCEOPrompt && <CEOPromptModal />}
      </AnimatePresence>
    </div>
  );

  // CEOPromptModal component — Professional Auth Modal wired to Django backend
  function CEOPromptModal() {
    const [tab, setTab] = useState("signin"); // "signin" | "signup"
    const [email, setEmail] = useState(formData.email || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [orgName, setOrgNameLocal] = useState(formData.company || "");
    const [fullName, setFullName] = useState(formData.name || "");
    const [phone, setPhone] = useState("");
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showPw, setShowPw] = useState(false);

    useEffect(() => {
      if (showCEOPrompt) {
        document.body.style.overflow = "hidden";
        setError(null);
        setSuccess(null);
        setPassword("");
        setConfirmPassword("");
      }
      return () => { document.body.style.overflow = "unset"; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!showCEOPrompt) return null;

    /* ─── Shared styles ─── */
    const inputCls = `w-full px-4 py-2.5 rounded-lg text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
      darkMode
        ? "bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
        : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 hover:border-gray-400"
    }`;
    const labelCls = `block text-xs font-semibold mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-600"}`;
    const bgCls = darkMode ? "bg-gray-900" : "bg-white";

    /* ─── Handlers ─── */
    const handleSignIn = async () => {
      setProcessing(true);
      setError(null);
      try {
        if (!email.trim()) throw new Error("Email is required");
        if (!password) throw new Error("Password is required");
        const result = await auth.login({ email: email.trim(), password });
        if (!result) throw new Error("Invalid credentials. Please check your email and password.");
        setSuccess("Welcome back! Redirecting...");
        setTimeout(() => {
          setShowCEOPrompt(false);
          const cur = auth.getCurrent ? auth.getCurrent() : null;
          const slug = cur?.org?.slug;
          const next = authReturnTo || (slug ? `/partners/${slug}` : "/ceo/partner-dashboard");
          navigate(next, { replace: true, state: { justLoggedIn: true } });
        }, 600);
      } catch (err) {
        setError(err?.message || "Sign in failed. Please try again.");
      } finally {
        setProcessing(false);
      }
    };

    const handleSignUp = async (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      setProcessing(true);
      setError(null);
      try {
        if (!orgName.trim()) throw new Error("Company name is required");
        if (!fullName.trim()) throw new Error("Your name is required");
        if (!email.trim()) throw new Error("Email is required");
        if (!phone.trim()) throw new Error("Phone number is required");
        if (!password || password.length < 6) throw new Error("Password must be at least 6 characters");
        if (password !== confirmPassword) throw new Error("Passwords do not match");

        setFormData(prev => ({ ...prev, company: orgName, email, name: fullName }));

        await auth.register({
          orgName: orgName.trim(),
          ceoName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        });

        setSuccess("Account created! Redirecting...");
        setTimeout(() => {
          setShowCEOPrompt(false);
          const cur = auth.getCurrent ? auth.getCurrent() : null;
          const slug = cur?.org?.slug;
          const next = authReturnTo || (slug ? `/partners/${slug}` : "/ceo/partner-dashboard");
          navigate(next, { replace: true, state: { justLoggedIn: true } });
        }, 600);
      } catch (err) {
        setError(err?.message || "Registration failed. Please try again.");
      } finally {
        setProcessing(false);
      }
    };

    const handleKeyDown = (e, handler) => {
      if (e.key === "Enter") { e.preventDefault(); handler(); }
    };

    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => !processing && setShowCEOPrompt(false)}
        />

        {/* Modal */}
        <motion.div
          className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 ${bgCls}`}
          variants={modalVariants}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200/80">Secure Access</div>
                <h3 className="text-xl font-bold text-white mt-0.5">ConseQ-X Platform</h3>
              </div>
              <button
                onClick={() => !processing && setShowCEOPrompt(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className={`flex border-b ${darkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
            {[
              { key: "signin", label: "Sign In" },
              { key: "signup", label: "Create Account" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError(null); setSuccess(null); }}
                className={`flex-1 py-3 text-sm font-semibold transition-all relative ${
                  tab === t.key
                    ? (darkMode ? "text-indigo-400" : "text-indigo-600")
                    : (darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700")
                }`}
              >
                {t.label}
                {tab === t.key && (
                  <motion.div
                    layoutId="authTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Form body */}
          <div className="p-6">
            {/* Error message */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">&#9888;</span>
                <span>{error}</span>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&#10003;</span>
                <span>{success}</span>
              </div>
            )}

            {tab === "signin" ? (
              /* ─── Sign In ─── */
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => handleKeyDown(e, handleSignIn)}
                    placeholder="you@company.com"
                    className={inputCls}
                    autoFocus
                  />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"} value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => handleKeyDown(e, handleSignIn)}
                      placeholder="Enter your password"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSignIn}
                  disabled={processing || !email.trim() || !password}
                  className={`w-full py-3 rounded-lg text-sm font-bold text-white transition-all ${
                    processing || !email.trim() || !password
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md active:scale-[0.98]"
                  }`}
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : "Sign In"}
                </button>
              </div>
            ) : (
              /* ─── Create Account ─── */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Company *</label>
                    <input value={orgName} onChange={e => setOrgNameLocal(e.target.value)} placeholder="Acme Inc." className={inputCls} autoFocus onKeyDown={e => { if (e.key === "Enter") e.preventDefault(); }} />
                  </div>
                  <div>
                    <label className={labelCls}>Your Name *</label>
                    <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Victor Godwin" className={inputCls} onKeyDown={e => { if (e.key === "Enter") e.preventDefault(); }} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className={inputCls} onKeyDown={e => { if (e.key === "Enter") e.preventDefault(); }} />
                </div>
                <div>
                  <label className={labelCls}>Phone *</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 812 345 6789" className={inputCls} onKeyDown={e => { if (e.key === "Enter") e.preventDefault(); }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Password *</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 chars" className={inputCls} onKeyDown={e => { if (e.key === "Enter") e.preventDefault(); }} />
                  </div>
                  <div>
                    <label className={labelCls}>Confirm *</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter" className={inputCls} onKeyDown={e => handleKeyDown(e, handleSignUp)} />
                  </div>
                </div>
                <button
                  onClick={handleSignUp}
                  disabled={processing}
                  className={`w-full py-3 rounded-lg text-sm font-bold text-white transition-all ${
                    processing
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md active:scale-[0.98]"
                  }`}
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : "Create Account & Continue"}
                </button>
              </div>
            )}

            {/* Footer */}
            <div className={`mt-5 pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
              <div className={`flex items-center justify-center gap-1.5 text-[11px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                <span>Secured with end-to-end encryption</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }
}