import React, { useEffect, useRef, useState } from "react";

export default function WelcomeCongrats({ open = false, onDone = () => {}, name = "", durationMs = 1500 }) {
  const [visible, setVisible] = useState(open);
  const [leaving, setLeaving] = useState(false);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particRef = useRef([]);
  const startedRef = useRef(false);

  // Sound opt-in state (read-only here)
  const soundOptIn = typeof window !== "undefined" && localStorage.getItem("conseqx_congrats_sound") === "true";

  useEffect(() => {
    if (!open) return;
    setVisible(true);
    setLeaving(false);

    // fire confetti and (optionally) sound
    startConfetti();
    if (soundOptIn) playBeep();

    // visible for durationMs then exit
    const t1 = setTimeout(() => {
      setLeaving(true);
      // allow exit animation to finish
      const exitMs = 420;
      setTimeout(() => {
        setVisible(false);
        stopConfetti();
        onDone();
      }, exitMs);
    }, durationMs);

    return () => {
      clearTimeout(t1);
      stopConfetti();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // confetti impl
  function startConfetti() {
    if (startedRef.current) return;
    startedRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    resizeCanvas();

    // create particle factory
    const createParticle = (x) => {
      const colors = ["#ef4444","#f97316","#f59e0b","#10b981","#06b6d4","#6366f1","#ec4899"];
      const size = 6 + Math.random() * 8;
      return {
        x: x || (canvas.width * (0.2 + Math.random() * 0.6)),
        y: -10 - Math.random() * 40,
        vx: (Math.random() - 0.5) * 6,
        vy: 2 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.4,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        ttl: 70 + Math.floor(Math.random() * 40),
      };
    };

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(300, Math.min(window.innerWidth * dpr, 1800));
      canvas.height = 220 * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "220px";
    }

    // seed some particles then continue for ~900ms
    for (let i = 0; i < 30; i++) particRef.current.push(createParticle());

    let start = Date.now();
    const run = () => {
      const now = Date.now();
      const dt = 1;
      // occasionally create more particles while within 900ms
      if (now - start < 900 && Math.random() < 0.6) particRef.current.push(createParticle());

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particRef.current.forEach((p, i) => {
        p.vy += 0.12; // gravity
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        p.life++;
        // draw rectangle rotated
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
        ctx.restore();
      });
      // remove old
      particRef.current = particRef.current.filter((p) => p.life < p.ttl && p.y < canvas.height + 50);

      rafRef.current = requestAnimationFrame(run);
    };

    rafRef.current = requestAnimationFrame(run);

    // stop after ~1400ms
    setTimeout(() => stopConfetti(), 1400);

    // on resize, recalc
    window.addEventListener("resize", resizeCanvas);
    // cleanup handled in stopConfetti
  }

  function stopConfetti() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    particRef.current = [];
    startedRef.current = false;
    window.removeEventListener("resize", () => {});
  }

  // tiny beep via WebAudio (short chord)
  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      // two quick oscillators for a pleasant micro-tone
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const g = ctx.createGain();
      o1.type = "sine";
      o2.type = "triangle";
      const now = ctx.currentTime;
      o1.frequency.value = 520;
      o2.frequency.value = 680;
      g.gain.value = 0.0001;
      o1.connect(g);
      o2.connect(g);
      g.connect(ctx.destination);
      o1.start(now);
      o2.start(now);
      // ramp up then down quickly (tiny pop)
      g.gain.linearRampToValueAtTime(0.02, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      o1.stop(now + 0.5);
      o2.stop(now + 0.5);
      // close context after short delay
      setTimeout(() => { try { ctx.close(); } catch (e) {} }, 900);
    } catch (e) {
      // ignore in older browsers
      // console.warn("audio failed", e);
    }
  }

  if (!visible) return null;

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const title = name ? `Welcome, ${name.split(" ")[0]}` : "Welcome — you're in!";

  return (
    <div className="fixed inset-x-4 top-6 z-50 pointer-events-none" aria-live="polite">
      <canvas ref={canvasRef} className="pointer-events-none absolute left-0 top-0 w-full h-[220px]" />
      <div
        className={`mx-auto max-w-2xl pointer-events-auto transform transition-all duration-450 origin-top ${leaving ? "translate-y-[-8px] opacity-0 scale-95" : "translate-y-0 opacity-100 scale-100"}`}
        style={{ willChange: "transform, opacity" }}
      >
        <div className={`rounded-2xl px-5 py-4 shadow-2xl border ${isDark ? "bg-gray-900 border-gray-800 text-gray-100" : "bg-white border-gray-100 text-gray-900"}`}>
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-full w-10 h-10 flex items-center justify-center shrink-0" style={{ background: "linear-gradient(90deg,#6366f1,#06b6d4)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M2 12h20" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>

                <div className="min-w-0">
                  <div className="text-lg font-semibold leading-tight">{title}</div>
                  <div className={`text-sm ${isDark ? "text-gray-300" : "text-gray-500"}`}>Your CEO workspace is ready — enjoy the dashboard.</div>
                </div>
              </div>
            </div>

            {/* Opt-in toggle (small) */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  // toggle sound opt-in preference
                  e.stopPropagation();
                  const currently = localStorage.getItem("conseqx_congrats_sound") === "true";
                  if (currently) localStorage.removeItem("conseqx_congrats_sound");
                  else localStorage.setItem("conseqx_congrats_sound", "true");
                }}
                title="Toggle welcome sound (opt-in)"
                className={`px-2 py-1 rounded-md text-xs ${isDark ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"}`}
                aria-pressed={soundOptIn}
              >
                {soundOptIn ? "🔊" : "🔈"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`.duration-450{transition-duration:450ms}`}</style>
    </div>
  );
}
