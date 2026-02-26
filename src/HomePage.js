import { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView, AnimatePresence } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { FaSun, FaMoon, FaQuoteLeft, FaQuoteRight, FaTimes, FaBars } from "react-icons/fa";
import Logo3D from "./assets/ConseQ-X-3d.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";


const sectionPx = "px-6 sm:px-8 lg:px-16 xl:px-24";

/*  Animation variants */
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const scaleUp = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};
const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.9, y: 40, transition: { duration: 0.25 } },
};
const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

/*  Reusable Section Heading */
function SectionHeading({ eyebrow, title, centered = false, darkMode }) {
  return (
    <motion.div variants={fadeUp} className={`mb-14 sm:mb-16 ${centered ? "text-center" : ""}`}>
      <motion.span
        variants={scaleUp}
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-[0.25em] mb-5 ${darkMode ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20" : "bg-yellow-500/10 text-yellow-700 border border-yellow-500/20"}`}
      >
        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        {eyebrow}
      </motion.span>
      <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
        {title}
      </h2>
      <div className={`mt-5 h-1.5 w-20 rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 ${centered ? "mx-auto" : ""}`} />
    </motion.div>
  );
}

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
    message: "",
  });

  const controls = useAnimation();
  const servicesRef = useRef(null);
  const servicesInView = useInView(servicesRef, { once: true, margin: "-100px" });

  //  Helpers 
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
    localStorage.setItem("darkMode", !darkMode ? "true" : "false");
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowBookingModal(false);
  };

  //  Effects 
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    document.documentElement.classList.toggle("dark", savedDarkMode);

    const lenis = new Lenis({ lerp: 0.05, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    if (servicesInView) controls.start("visible");

    return () => window.removeEventListener("scroll", handleScroll);
  }, [servicesInView, controls]);

  useEffect(() => {
    const open = Boolean(location?.state?.openCEOPrompt);
    if (open) {
      setAuthReturnTo(location.state?.returnTo || null);
      setShowCEOPrompt(true);
      try {
        navigate(location.pathname + (location.search || ""), { replace: true, state: {} });
      } catch {}
    }
  }, [location?.state, location?.pathname, location?.search, navigate]);

  //  Data 
  const navItems = ["Vision", "Mission", "Services", "Approach", "Contact"];

  const flagshipPrograms = [
    "Organizational Health & Diagnostic Audit",
    "Alignment & Operating Blueprint Design",
    "Organizational Systems Design",
  ];
  const toolkitsSaaS = [
    "Maturity Scorecard",
    "ConseQ-ULTRA Assessment Tool",
    "OSAM Frameworks",
  ];
  const ourSolutionProgram = [
    "Diagnosing systemic misalignment (TORIL Diagnostic)",
    "Designing scalable operating blueprints",
    "Embedding feedback loops and role clarity",
    "Aligning leadership behavior with strategy",
    "Productizing transformation for scale",
  ];

  const services = [
    {
      title: "System Diagnostics",
      description: "Comprehensive analysis of your organizational systems to identify bottlenecks and opportunities.",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
    },
    {
      title: "Organizational Design",
      description: "Creating structures and processes that align with your strategic objectives and growth trajectory.",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      title: "Leadership Alignment",
      description: "Ensuring executive teams are strategically aligned and equipped to drive transformation.",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
    },
    {
      title: "Outcome Engineering",
      description: "Shaping organizational culture to support your strategic vision and operational excellence.",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
  ];

  const whyDifferent = [
    { text: "We **systematize** what others guess", boldWord: "systematize" },
    { text: "We **embed**, not just advise", boldWord: "embed" },
    { text: "We **think in loops**, not silos", boldWord: "think in loops" },
    { text: "We **design** for humans and scale", boldWord: "design" },
  ];

  //  Color helpers 
  const bg1 = darkMode ? "bg-gray-900" : "bg-white";
  const bg2 = darkMode ? "bg-gray-800" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";
  const textBody = darkMode ? "text-gray-200" : "text-gray-800";
  const cardBg = darkMode ? "bg-gray-800/60 border-gray-700/50" : "bg-white border-gray-200/80";
  const cardHoverBorder = "hover:border-yellow-500/60";

  // 
  //  RENDER
  // 
  return (
    <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-500 ${
      darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"
    }`}>
      {/*  NAVBAR  */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${
        navScrolled
          ? darkMode
            ? "bg-gray-900/95 backdrop-blur-md shadow-lg shadow-black/10"
            : "bg-white/95 backdrop-blur-md shadow-lg shadow-gray-200/60"
          : "bg-transparent"
      }`}>
        <div className={`max-w-[1400px] mx-auto ${sectionPx} flex items-center justify-between h-20`}>
          {/* Logo */}
          <motion.a
            href="#"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-1 shrink-0"
          >
            <motion.img
              src={Logo3D}
              alt="ConseQ-X"
              className="h-14 w-auto"
              animate={{
                filter: darkMode
                  ? "drop-shadow(0 0 8px rgba(234,179,8,0.7))"
                  : "drop-shadow(0 0 4px rgba(234,179,8,0.4))",
              }}
            />
          </motion.a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
                className={`text-sm font-semibold tracking-wide transition-colors duration-200 hover:text-yellow-500 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {item}
              </motion.a>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-full transition-colors ${
                darkMode ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
            </motion.button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-lg ${darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <FaBars size={20} />
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
              className={`md:hidden overflow-hidden border-t ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}
            >
              <div className={`${sectionPx} py-4 flex flex-col gap-1`}>
                {navItems.map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className={`py-3.5 px-4 rounded-lg text-base font-semibold transition-colors ${
                      darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"
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

      {/*  HERO  */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${darkMode ? 'ffffff' : '000000'}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Gradient orb */}
        <div className={`absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full blur-[120px] ${
          darkMode ? "bg-yellow-500/[0.06]" : "bg-yellow-400/[0.12]"
        }`} />
        <div className={`absolute bottom-1/4 -left-32 w-[400px] h-[400px] rounded-full blur-[100px] ${
          darkMode ? "bg-indigo-500/[0.04]" : "bg-indigo-400/[0.08]"
        }`} />

        <div className={`relative z-10 max-w-[1400px] mx-auto ${sectionPx} w-full pt-28 pb-20`}>
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
              <span className={`text-xl font-bold tracking-tight ${textPrimary}`}>
                Conse<span className="text-yellow-500">Q</span>-X
              </span>
              <span className={`h-px w-12 ${darkMode ? "bg-gray-700" : "bg-gray-300"}`} />
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                darkMode ? "bg-yellow-500/15 text-yellow-400" : "bg-yellow-500/10 text-yellow-700"
              }`}>
                Systems-Thinking Consulting
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] tracking-tight mb-8 ${textPrimary}`}
            >
              Engineering{" "}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-400">Healthier</span>
                <motion.span
                  className="absolute bottom-2 left-0 w-full h-3 bg-yellow-500/20 rounded-full -z-10"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                  style={{ transformOrigin: "left" }}
                />
              </span>
              <br className="hidden sm:block" />
              Organizations
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className={`text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed max-w-2xl mb-12 ${textBody}`}
            >
              We help organizations across <strong className="text-yellow-500 font-bold">Africa</strong> and emerging markets scale with alignment, flow, and intentionality
              through system-based diagnostics and design.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              {/* Our Approach + tooltip */}
              <div className="relative">
                <motion.a
                  href="#approach"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className={`inline-flex items-center gap-2 px-8 py-4 text-base font-bold rounded-xl transition-all duration-200 ${
                    darkMode
                      ? "bg-gray-800 text-white border border-gray-700 hover:border-gray-600 hover:bg-gray-750"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  Our Approach
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.a>
                <AnimatePresence>
                  {showTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className={`absolute z-50 w-72 p-5 rounded-xl shadow-2xl bottom-full mb-3 left-1/2 -translate-x-1/2 ${
                        darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                      }`}
                    >
                      <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                        ConseQ-X Methodology
                      </p>
                      <p className={`text-sm leading-relaxed ${textBody}`}>
                        We deliver measurable outcomes by aligning critical organizational
                        components with strategic goals, ensuring resilience and growth.
                      </p>
                      <div className={`absolute w-3 h-3 rotate-45 -bottom-1.5 left-1/2 -ml-1.5 ${
                        darkMode ? "bg-gray-800 border-r border-b border-gray-700" : "bg-white border-r border-b border-gray-200"
                      }`} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* C-Suite Partner */}
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCEOPrompt(true)}
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200"
              >
                C-Suite Partner
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <span className={`text-xs tracking-widest uppercase ${textSecondary}`}>Scroll</span>
          <motion.div
            className={`w-5 h-8 rounded-full border-2 flex justify-center pt-1.5 ${
              darkMode ? "border-gray-600" : "border-gray-400"
            }`}
          >
            <motion.div
              className={`w-1 h-1.5 rounded-full ${darkMode ? "bg-gray-500" : "bg-gray-400"}`}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/*  CTA BANNER  */}
      <section className={`py-20 ${bg1}`}>
        <div className={`max-w-[1400px] mx-auto ${sectionPx}`}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="text-center"
          >
            <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-10 leading-tight ${textPrimary}`}>
              Is your organization <span className="text-yellow-500">healthy?</span>
            </p>
            <p className={`text-lg sm:text-xl font-medium mb-10 max-w-xl mx-auto ${textBody}`}>
              Let's find out together — take our free diagnostic assessment.
            </p>
            <motion.button
              whileHover={{ y: -4, boxShadow: "0 25px 50px -12px rgba(234,179,8,0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowToolModal(true)}
              className="px-12 py-5 bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 text-lg font-extrabold rounded-2xl shadow-xl shadow-yellow-500/30 hover:from-yellow-400 hover:to-amber-400 transition-all duration-300 animate-pulse hover:animate-none"
            >
              Take Your Assessment Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/*  VISION  */}
      <section id="vision" className={`py-24 lg:py-32 ${bg2}`}>
        <div className={`max-w-[1400px] mx-auto ${sectionPx}`}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <SectionHeading eyebrow="Our North Star" title="Vision" darkMode={darkMode} />

            <motion.div
              variants={fadeLeft}
              className={`text-2xl sm:text-3xl lg:text-4xl font-semibold leading-snug p-8 sm:p-12 rounded-2xl border-l-4 border-yellow-500 max-w-4xl ${
                darkMode ? "bg-gray-800/80 text-gray-100" : "bg-white text-gray-900 shadow-md"
              }`}
            >
              To become the <span className="text-yellow-500 font-extrabold">most trusted</span> systems-thinking consulting partner in
              emerging and <span className="text-yellow-500 font-extrabold">high-growth African markets</span>.
            </motion.div>

            <motion.div variants={fadeUp} className="mt-16 grid sm:grid-cols-2 gap-6 max-w-4xl">
              <motion.div variants={fadeLeft} whileHover={{ y: -5, boxShadow: "0 12px 30px -8px rgba(0,0,0,0.12)" }} className={`p-7 rounded-2xl border ${cardBg} ${cardHoverBorder} transition-all duration-300 cursor-default`}>
                <div className="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-5">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className={`text-xl font-extrabold mb-3 ${textPrimary}`}>Who We Are</h3>
                <p className={`text-base font-medium leading-relaxed ${textBody}`}>
                  ConseQ-X, a <strong>systems-first, transformation-driven</strong> consultancy, turns complex
                  organizational challenges into structured, productized solutions for <strong>lasting impact</strong>.
                </p>
              </motion.div>

              <motion.div variants={fadeRight} whileHover={{ y: -5, boxShadow: "0 12px 30px -8px rgba(0,0,0,0.12)" }} className={`p-7 rounded-2xl border ${cardBg} ${cardHoverBorder} transition-all duration-300 cursor-default`}>
                <div className="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-5">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className={`text-xl font-extrabold mb-3 ${textPrimary}`}>The Problem We Solve</h3>
                <p className={`text-base font-medium leading-relaxed ${textBody}`}>
                  As organizations grow, they face <strong>misalignment</strong>, <strong>inefficiencies</strong>, and reactive approaches
                  — leading to fragmented cultures, siloed operations, and <strong>revenue loss</strong>.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/*  MISSION  */}
      <section id="mission" className={`py-24 lg:py-32 ${bg1}`}>
        <div className={`max-w-[1400px] mx-auto ${sectionPx}`}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <SectionHeading eyebrow="Our Purpose" title="Mission" darkMode={darkMode} />

            <motion.div variants={fadeUp} className="max-w-4xl">
              <div className="flex flex-col items-start">
                <FaQuoteLeft className={`text-2xl mb-4 ${darkMode ? "text-yellow-500/30" : "text-yellow-500/20"}`} />
                <p className={`text-2xl sm:text-3xl lg:text-4xl font-semibold leading-snug ${textPrimary}`}>
                  Help organizations scale with{" "}
                  <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-400">alignment</span>,{" "}
                  <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-400">flow</span>, and{" "}
                  <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-400">intentionality</span>.
                </p>
                <div className="self-end mt-4">
                  <FaQuoteRight className={`text-2xl ${darkMode ? "text-yellow-500/30" : "text-yellow-500/20"}`} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/*  SERVICES  */}
      <section id="services" className={`py-24 lg:py-32 ${bg2}`}>
        <div className={`max-w-[1400px] mx-auto ${sectionPx}`}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <SectionHeading eyebrow="How We Deliver Value" title="Our Services" centered darkMode={darkMode} />
          </motion.div>

          <motion.div
            ref={servicesRef}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4"
            variants={stagger}
            initial="hidden"
            animate={controls}
          >
            {services.map((s, i) => (
              <motion.div
                key={i}
                variants={cardItem}
                className={`group p-7 rounded-2xl border ${cardBg} ${cardHoverBorder} transition-all duration-300 hover:shadow-lg flex flex-col`}
                whileHover={{ y: -6 }}
              >
                <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center transition-colors duration-200 ${
                  darkMode
                    ? "bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500/20"
                    : "bg-yellow-500/10 text-yellow-600 group-hover:bg-yellow-500/15"
                }`}>
                  {s.icon}
                </div>
                <h3 className={`text-xl font-extrabold mb-3 ${textPrimary}`}>{s.title}</h3>
                <p className={`text-base font-medium leading-relaxed flex-grow ${textBody}`}>{s.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/*  OFFERINGS  */}
      <section className={`py-24 lg:py-32 ${bg1}`}>
        <div className={`max-w-[1400px] mx-auto ${sectionPx}`}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <SectionHeading eyebrow="Our Solutions" title="Our Offerings" darkMode={darkMode} />
          </motion.div>

          <div className="max-w-5xl">
            {/* Tabs */}
            <div className={`mb-10 flex flex-wrap gap-1 p-1.5 rounded-xl w-fit ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
              {[
                { key: "flagship", label: "Flagship Programs" },
                { key: "toolkits", label: "Toolkits / SaaS" },
                { key: "ourSolution", label: "Our Solution" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`py-3 px-6 text-sm font-bold rounded-lg transition-all duration-200 ${
                    activeTab === t.key
                      ? darkMode
                        ? "bg-yellow-500/20 text-yellow-400 shadow-sm"
                        : "bg-white text-yellow-700 shadow-sm"
                      : darkMode
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {(activeTab === "flagship" ? flagshipPrograms : activeTab === "toolkits" ? toolkitsSaaS : ourSolutionProgram).map(
                  (item, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -4 }}
                      className={`p-6 rounded-xl border ${cardBg} ${cardHoverBorder} transition-all duration-200`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold ${
                          darkMode ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-500/10 text-yellow-600"
                        }`}>
                          {index + 1}
                        </div>
                        <h3 className={`text-base font-bold leading-snug ${textPrimary}`}>{item}</h3>
                      </div>
                    </motion.div>
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/*  WHY DIFFERENT  */}
      <section className={`py-24 lg:py-32 ${bg2}`}>
        <div className={`max-w-[1400px] mx-auto ${sectionPx}`}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <SectionHeading eyebrow="Our Unique Approach" title="Why We Are Different" darkMode={darkMode} />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyDifferent.map((point, index) => {
                const parts = point.text.split(`**${point.boldWord}**`);
                return (
                  <motion.div
                    key={index}
                    variants={cardItem}
                    className={`p-7 rounded-2xl border ${cardBg} ${cardHoverBorder} transition-all duration-200`}
                    whileHover={{ y: -5, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.1)" }}
                  >
                    <div className={`w-10 h-10 rounded-xl mb-5 flex items-center justify-center text-sm font-bold ${
                      darkMode ? "bg-yellow-500/15 text-yellow-400" : "bg-yellow-500/10 text-yellow-600"
                    }`}>
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <p className={`text-lg font-semibold leading-relaxed ${textBody}`}>
                      {parts[0]}
                      <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-400">{point.boldWord}</span>
                      {parts[1]}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/*  APPROACH / PHILOSOPHY  */}
      <section id="approach" className={`py-24 lg:py-32 ${bg1}`}>
        <div className={`max-w-[1400px] mx-auto ${sectionPx}`}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <SectionHeading eyebrow="Philosophy" title="Our Core Philosophy" darkMode={darkMode} />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeLeft}
              className={`p-8 sm:p-10 rounded-2xl border flex items-center ${cardBg}`}
            >
              <p className={`text-2xl sm:text-3xl lg:text-4xl font-semibold leading-snug ${textPrimary}`}>
                <span className="text-yellow-500 font-extrabold">Design </span>
                influences{" "}
                <span className="text-yellow-500 font-extrabold">behaviour</span> and
                behaviour determines organizational{" "}
                <span className="text-yellow-500 font-extrabold">performance!</span>
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeRight}
              className={`p-8 sm:p-10 rounded-2xl border ${cardBg}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className={`text-xl font-extrabold ${textPrimary}`}>Our DNA</h3>
              </div>
              <ul className={`space-y-4 ${textBody}`}>
                {[
                  "Systems Driven Transformation",
                  "Relational and Cognitive Precision",
                  "Industry Agnostic Adaptability",
                  "Collaborative Partnership Model",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-base font-semibold">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 mt-2 shrink-0 animate-pulse" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/*  DISTINCTIVE VALUE BANNER  */}
      <section className="py-24 lg:py-36 bg-gradient-to-br from-yellow-500 via-yellow-500 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M0 20L20 0h20v20L20 40H0V20z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className={`relative max-w-[1400px] mx-auto ${sectionPx}`}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.span variants={scaleUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-[0.25em] mb-5 bg-white/15 text-white border border-white/20">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Our Motto
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-10 leading-[1.1]">
              Distinctive Value
            </motion.h2>
            <div className="h-1.5 w-20 rounded-full bg-white/40 mx-auto mb-10" />
            <motion.div variants={fadeUp} className="space-y-6 text-white">
              <p className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-snug">
                ConseQ-X uniquely integrates intangible drivers — relationships, systems,
                and organizational behavior — into <strong>structured, measurable outcomes</strong>.
              </p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-snug">
                Our innovative systems-focused approach guarantees <strong>lasting transformation</strong>,
                positioning ConseQ-X ahead of conventional consulting firms.
              </p>
            </motion.div>
            <motion.button
              variants={fadeUp}
              whileHover={{ y: -3, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.35)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowToolModal(true)}
              className="mt-14 px-12 py-5 bg-gray-900 text-white text-lg font-extrabold rounded-2xl shadow-2xl hover:bg-gray-800 transition-all duration-300 hover:scale-105"
            >
              Transform Your Organization
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/*  CONTACT  */}
      <section id="contact" className={`py-24 lg:py-32 ${bg2}`}>
        <div className={`max-w-[1400px] mx-auto ${sectionPx}`}>
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="text-center"
            >
              <SectionHeading eyebrow="Get in Touch" title="Ready to Transform Your Organization?" centered darkMode={darkMode} />
              <motion.p variants={fadeUp} className={`text-lg sm:text-xl font-medium mb-12 max-w-xl mx-auto ${textBody}`}>
                Let's discuss how we can help you achieve alignment, flow, and
                intentionality at scale.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className={`rounded-2xl border p-8 ${cardBg}`}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowBookingModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 shadow-lg shadow-yellow-500/20 hover:shadow-xl transition-all duration-200"
                >
                  Book a Diagnostic Session
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowToolModal(true)}
                  className={`inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-xl transition-all duration-200 ${
                    darkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  Check Our ConseQ-ULTRA Tool
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/*  FOOTER  */}
      <footer className="bg-gray-900 py-16">
        <div className={`max-w-[1400px] mx-auto ${sectionPx}`}>
          <div className="flex flex-col lg:flex-row justify-between gap-12">
            {/* Brand */}
            <div className="max-w-xs">
              <motion.img
                src={Logo3D}
                alt="ConseQ-X"
                className="h-16 w-auto mb-5"
                animate={{ filter: "drop-shadow(0 0 6px rgba(234,179,8,0.6))" }}
              />
              <p className="text-base font-semibold text-gray-300 leading-relaxed">
                Engineering Healthier, Aligned, and More Effective Organizations
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Email:{" "}
                <a href="mailto:osd@conseq-x.com" className="text-yellow-500 hover:text-yellow-400 transition-colors">
                  osd@conseq-x.com
                </a>
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
              <div>
                <h4 className="text-white text-sm font-bold mb-4 uppercase tracking-wider">Company</h4>
                <ul className="space-y-3">
                  {["Vision", "Mission", "Services", "Approach"].map((item) => (
                    <li key={item}>
                      <a href={`#${item.toLowerCase()}`} className="text-sm font-medium text-gray-400 hover:text-yellow-500 transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white text-sm font-bold mb-4 uppercase tracking-wider">Connect</h4>
                <ul className="space-y-3">
                  {["LinkedIn", "Twitter", "Instagram"].map((item) => (
                    <li key={item}>
                      <button className="text-sm font-medium text-gray-400 hover:text-yellow-500 transition-colors">{item}</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white text-sm font-bold mb-4 uppercase tracking-wider">Legal</h4>
                <ul className="space-y-3">
                  {["Privacy Policy", "Terms of Service"].map((item) => (
                    <li key={item}>
                      <button className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">{item}</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} ConseQ-X. All rights reserved.
            </p>
            <p className="text-sm text-gray-600">
              Designed and Developed by{" "}
              <a href="https://www.fescode.com" target="_blank" rel="noreferrer" className="text-yellow-500 hover:text-yellow-400 transition-colors">
                <em>FesCode Limited</em>
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* 
          MODALS
           */}

      {/*  Booking Modal  */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBookingModal(false)} />
            <motion.div
              className={`relative max-w-md w-full rounded-2xl z-10 p-8 ${darkMode ? "bg-gray-800" : "bg-white"}`}
              variants={modalVariants}
            >
              <button
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  darkMode ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                }`}
                onClick={() => setShowBookingModal(false)}
              >
                <FaTimes size={16} />
              </button>

              <h2 className={`text-2xl font-bold mb-6 ${textPrimary}`}>Book a Diagnostic Session</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { id: "name", label: "Name", type: "text" },
                  { id: "email", label: "Email", type: "email" },
                  { id: "company", label: "Company", type: "text" },
                ].map(({ id, label, type }) => (
                  <div key={id}>
                    <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`} htmlFor={id}>
                      {label}
                    </label>
                    <input
                      type={type}
                      id={id}
                      required
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                      }`}
                      value={formData[id]}
                      onChange={handleInputChange}
                    />
                  </div>
                ))}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`} htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="4"
                    required
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                    }`}
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-yellow-500 text-gray-900 font-semibold rounded-xl hover:bg-yellow-400 transition-colors"
                >
                  Book Session
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*  Tool Modal  */}
      <AnimatePresence>
        {showToolModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowToolModal(false)} />
            <motion.div
              className={`relative max-w-md w-full rounded-2xl z-10 p-8 ${darkMode ? "bg-gray-800" : "bg-white"}`}
              variants={modalVariants}
            >
              <button
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  darkMode ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                }`}
                onClick={() => setShowToolModal(false)}
              >
                <FaTimes size={16} />
              </button>

              <div className="text-center">
                <div className={`w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center ${
                  darkMode ? "bg-yellow-500/15" : "bg-yellow-500/10"
                }`}>
                  <svg className="w-7 h-7 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1m0 0L11.42 4.97m-5.1 5.1H21M3 21h18" />
                  </svg>
                </div>

                <h2 className={`text-2xl font-bold mb-3 ${textPrimary}`}>ConseQ-ULTRA Tool</h2>
                <p className={`mb-8 leading-relaxed ${textBody}`}>
                  Access our advanced organizational assessment tool. This diagnostic provides
                  deep insights into alignment, efficiency, and growth potential.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate("/assessment")}
                    className="w-full py-3 rounded-xl text-sm font-bold bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors"
                  >
                    Continue to Tool
                  </button>
                  <button
                    className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${
                      darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setShowToolModal(false)}
                  >
                    Learn More First
                  </button>
                  <button
                    onClick={() => { setShowCEOPrompt(true); setShowToolModal(false); }}
                    className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow hover:opacity-95 transition-all"
                  >
                    C-Suite Partner
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*  CEO Prompt Modal  */}
      <AnimatePresence>
        {showCEOPrompt && <CEOPromptModal />}
      </AnimatePresence>
    </div>
  );

  // 
  //  CEO AUTH MODAL
  // 
  function CEOPromptModal() {
    const [tab, setTab] = useState("signin");
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

    const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
      darkMode
        ? "bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
        : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 hover:border-gray-400"
    }`;
    const labelCls = `block text-xs font-semibold mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-600"}`;
    const bgCls = darkMode ? "bg-gray-900" : "bg-white";

    const handleSignIn = async () => {
      setProcessing(true);
      setError(null);
      try {
        if (!email.trim()) throw new Error("Email is required");
        if (!password) throw new Error("Password is required");
        const result = await auth.login({ email: email.trim(), password });
        if (!result) throw new Error("Invalid credentials. Please check your email and password.");
        // Navigate immediately — no artificial delay
        setShowCEOPrompt(false);
        const cur = auth.getCurrent ? auth.getCurrent() : null;
        const slug = cur?.org?.slug;
        const next = authReturnTo || (slug ? `/partners/${slug}` : "/ceo/partner-dashboard");
        navigate(next, { replace: true, state: { justLoggedIn: true } });
      } catch (err) {
        setError(err?.message || "Sign in failed. Please try again.");
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

        setFormData((prev) => ({ ...prev, company: orgName, email, name: fullName }));

        await auth.register({
          orgName: orgName.trim(),
          ceoName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        });

        // Navigate immediately — no artificial delay
        setShowCEOPrompt(false);
        const cur = auth.getCurrent ? auth.getCurrent() : null;
        const slug = cur?.org?.slug;
        const next = authReturnTo || (slug ? `/partners/${slug}` : "/ceo/partner-dashboard");
        navigate(next, { replace: true, state: { justLoggedIn: true } });
      } catch (err) {
        setError(err?.message || "Registration failed. Please try again.");
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
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !processing && setShowCEOPrompt(false)} />

        <motion.div className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 ${bgCls}`} variants={modalVariants}>
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
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError(null); setSuccess(null); }}
                className={`flex-1 py-3 text-sm font-semibold transition-all relative ${
                  tab === t.key
                    ? darkMode ? "text-indigo-400" : "text-indigo-600"
                    : darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
                {tab === t.key && (
                  <motion.div layoutId="authTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                )}
              </button>
            ))}
          </div>

          {/* Form body */}
          <div className="p-6">
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">&#9888;</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&#10003;</span>
                <span>{success}</span>
              </div>
            )}

            {tab === "signin" ? (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => handleKeyDown(e, handleSignIn)} placeholder="you@company.com" className={inputCls} autoFocus />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => handleKeyDown(e, handleSignIn)} placeholder="Enter your password" className={inputCls} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSignIn}
                  disabled={processing || !email.trim() || !password}
                  className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all ${
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
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Company *</label>
                    <input value={orgName} onChange={(e) => setOrgNameLocal(e.target.value)} placeholder="Acme Inc." className={inputCls} autoFocus onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} />
                  </div>
                  <div>
                    <label className={labelCls}>Your Name *</label>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Victor Godwin" className={inputCls} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputCls} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} />
                </div>
                <div>
                  <label className={labelCls}>Phone *</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 812 345 6789" className={inputCls} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Password *</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 chars" className={inputCls} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} />
                  </div>
                  <div>
                    <label className={labelCls}>Confirm *</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter" className={inputCls} onKeyDown={(e) => handleKeyDown(e, handleSignUp)} />
                  </div>
                </div>
                <button
                  onClick={handleSignUp}
                  disabled={processing}
                  className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all ${
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

            <div className={`mt-5 pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
              <div className={`flex items-center justify-center gap-1.5 text-[11px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secured with end-to-end encryption</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }
}