import { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { FaSun, FaMoon } from "react-icons/fa";
import Logo3D from "./assets/ConseQ-X-3d.png";

export default function HomePage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const controls = useAnimation();
  const servicesRef = useRef(null);
  const servicesInView = useInView(servicesRef, { once: true, margin: "-100px" });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
    localStorage.setItem('darkMode', !darkMode ? 'true' : 'false');
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
            {/* Updated Logo with 3D effect */}
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src={Logo3D} 
                alt="ConseQ-X Logo" 
                className="h-20 w-auto mr-3 transition-all duration-500"
              />
              {/* <span className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"} hidden sm:block`}>
                Conse<span className="text-yellow-500">Q</span>-X
              </span> */}
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
        {menuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`md:hidden ${
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
            <motion.div variants={fadeUp} className="mb-6">
              <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 ${
                darkMode 
                  ? "bg-yellow-500/20 text-yellow-400" 
                  : "bg-yellow-500/10 text-yellow-700"
              }`}>
                <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"} hidden sm:block`}>
                Conse<span className="text-yellow-500">Q</span>-X
              </p>
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg shadow-lg hover:bg-yellow-600 transition-colors"
              >
                Start Transformation
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 font-semibold rounded-lg transition-colors ${
                  darkMode 
                    ? "bg-gray-700 text-white hover:bg-gray-600" 
                    : "bg-gray-800 text-white hover:bg-gray-900"
                }`}
              >
                Our Approach
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
          <div className={`w-0.5 h-8 rounded-full ${
            darkMode ? "bg-gray-600" : "bg-gray-400"
          }`}></div>
        </motion.div>
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
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    <h3 className={`text-xl font-bold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900", "display: inline"
                  }`}>ConseQ-X</h3> is a systems-first, transformation-focused consulting firm
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
                  
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    <h3 className={`text-xl font-bold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900", "display: inline"
                  }`}>Our Core Idea:</h3> We are a next-generation management consulting firm that productizes transformation
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
                <div className={`absolute -left-8 top-0 text-8xl font-serif ${
                  darkMode ? "text-yellow-500/30" : "text-yellow-500/20"
                }`}>“</div>
                <p className={`text-2xl md:text-3xl font-light pl-10 max-w-4xl ${
                  darkMode ? "text-gray-300" : "text-gray-800"
                }`}>
                  Help organizations scale with <span className="font-semibold text-yellow-600">alignment</span>, <span className="font-semibold text-yellow-600">flow</span>, and <span className="font-semibold text-yellow-600">intentionality</span>.
                </p>
                <div className={`absolute -right-8 bottom-0 text-8xl font-serif rotate-180 ${
                  darkMode ? "text-yellow-500/30" : "text-yellow-500/20"
                }`}>“</div>
              </motion.div>
              
              <motion.div 
                variants={fadeUp}
                className="mt-20"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-4 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}>
                      What We See
                    </h3>
                    <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                      To Become the most trusted systems-designing consulting partner in emerging and high-growth markets.
                    </p>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-4 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}>
                      Flow
                    </h3>
                    <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                      Creating seamless processes that eliminate friction and enable smooth operations at scale.
                    </p>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-4 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}>
                      Intentionality
                    </h3>
                    <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                      Designing systems with purpose, where every component serves a strategic objective.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className={`py-20 md:py-32 ${
        darkMode 
          ? "bg-gradient-to-br from-gray-800 to-gray-900" 
          : "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
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
                darkMode ? "text-yellow-400" : "text-yellow-400"
              }`}>
                How We Deliver Value
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className={`text-4xl md:text-5xl font-bold mb-16 ${
              darkMode ? "text-white" : "text-white"
            }`}>
              Our Services
            </motion.h2>
          </motion.div>
          
          <motion.div 
            ref={servicesRef}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
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
                title: "Flow Optimization",
                description: "Streamlining operations to enhance efficiency and reduce friction across all functions.",
                icon: "⚡"
              },
              {
                title: "Leadership Alignment",
                description: "Ensuring executive teams are strategically aligned and equipped to drive transformation.",
                icon: "🤝"
              },
              {
                title: "Growth Scaling",
                description: "Designing systems that enable sustainable scaling in high-growth environments.",
                icon: "📈"
              },
              {
                title: "Cultural Engineering",
                description: "Shaping organizational culture to support your strategic vision and operational excellence.",
                icon: "🌱"
              }
            ].map((service, index) => (
              <motion.div 
                key={index}
                variants={serviceItem}
                className={`p-8 rounded-xl border transition-all ${
                  darkMode 
                    ? "bg-gray-800/50 border-gray-700 hover:border-yellow-500" 
                    : "bg-gray-800/50 border-gray-700 hover:border-yellow-500"
                }`}
              >
                <div className="text-4xl mb-6">{service.icon}</div>
                <h3 className={`text-xl font-bold mb-4 ${
                  darkMode ? "text-white" : "text-white"
                }`}>
                  {service.title}
                </h3>
                <p className={darkMode ? "text-gray-300" : "text-gray-300"}>
                  {service.description}
                </p>
              </motion.div>
            ))}
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
                Our Methodology
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className={`text-4xl md:text-5xl font-bold mb-8 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>
              Systems-Thinking Approach
            </motion.h2>
          </motion.div>
          
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className={`absolute left-4 top-0 h-full w-0.5 transform -translate-x-1/2 ${
                darkMode ? "bg-gray-700" : "bg-gray-200"
              }`}></div>
              
              {/* Timeline items */}
              {[
                {
                  step: "1",
                  title: "Understand",
                  description: "Deep dive into your organization's unique context, challenges, and aspirations.",
                  color: "bg-yellow-500"
                },
                {
                  step: "2",
                  title: "Diagnose",
                  description: "Identify systemic patterns, leverage points, and root causes of challenges.",
                  color: "bg-yellow-600"
                },
                {
                  step: "3",
                  title: "Design",
                  description: "Co-create solutions that align with your strategic objectives and operational reality.",
                  color: darkMode ? "bg-gray-700" : "bg-gray-800"
                },
                {
                  step: "4",
                  title: "Implement",
                  description: "Execute with precision, ensuring smooth integration into your organization.",
                  color: darkMode ? "bg-gray-600" : "bg-gray-700"
                },
                {
                  step: "5",
                  title: "Optimize",
                  description: "Continuously refine systems for peak performance and adaptability.",
                  color: darkMode ? "bg-gray-500" : "bg-gray-600"
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="flex items-start mb-12"
                >
                  <div className={`${item.color} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold z-10`}>
                    {item.step}
                  </div>
                  <div className="ml-10">
                    <h3 className={`text-xl font-bold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}>
                      {item.title}
                    </h3>
                    <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Motto Section */}
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
              className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight"
            >
              Engineering Healthier, Aligned, and More Effective Organizations through system-based diagnostics and design.
            </motion.div>
            
            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`mt-10 px-8 py-4 font-bold rounded-lg shadow-lg transition-colors ${
                darkMode 
                  ? "bg-gray-800 text-white hover:bg-gray-700" 
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
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
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <button 
                    type="submit"
                    className="w-full px-6 py-4 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 ${
        darkMode ? "bg-gray-900" : "bg-gray-900"
      }`}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center">
                  {/* Footer Logo */}
                  <img 
                    src={Logo3D} 
                    alt="ConseQ-X Logo" 
                    className="h-20 w-auto mr-3 transition-all duration-500"
                  />
                  {/* <span className="text-xl font-bold text-white hidden sm:block">
                    Conse<span className="text-yellow-500">Q</span>-X
                  </span> */}
                </div>
                <p className={`mt-4 text-sm max-w-xs ${
                  darkMode ? "text-gray-400" : "text-gray-400"
                }`}>
                  Engineering Healthier, Aligned, and More Effective Organizations
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
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
                    <li><a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">LinkedIn</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">Twitter</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">Instagram</a></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-white font-medium mb-4">Legal</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">Terms of Service</a></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className={`border-t mt-12 pt-8 text-sm text-center ${
              darkMode ? "border-gray-800 text-gray-500" : "border-gray-800 text-gray-500"
            }`}>
              © {new Date().getFullYear()} ConseQ-X. All rights reserved. <br/> <span>
                    Designed and Developed by<span className="text-yellow-500"><a href="https://www.fescode.com" target="_blank"> <em>FesCode Limited</em></a> </span>
                  </span> 
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}