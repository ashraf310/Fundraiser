import { useState, useEffect, useRef, useCallback } from "react";

const ADMIN_PASSWORD = "fundraiser2024";

// Tiers: < 100 = small toast, 100–499 = confetti burst, 500–1999 = big confetti + banner, 2000+ = full fireworks party
const getCelebrationTier = (amount) => {
  if (amount >= 2000) return "legendary";
  if (amount >= 500)  return "epic";
  if (amount >= 100)  return "great";
  return "nice";
};

const TIER_CONFIG = {
  nice:      { emoji: "🎉", label: "Thank You!", color: "#5BA8C4", duration: 2800 },
  great:     { emoji: "🎊", label: "Awesome Donation!", color: "#f9ca24", duration: 4000 },
  epic:      { emoji: "🔥", label: "WOW! Amazing!", color: "#f0932b", duration: 5500 },
  legendary: { emoji: "🚀", label: "LEGENDARY DONATION!", color: "#e74c3c", duration: 7000 },
};

const DEFAULT_CONFIG = {
  title: "Help Us Make a Difference",
  organization: "Hearts United Foundation",
  goal: 50000,
  currency: "$",
  message: "Every dollar brings us closer to our mission. Thank you for your generosity!",
};

const Logo = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#013A58" stroke="#5BA8C4" strokeWidth="1.5" />
    <path d="M32 46 C32 46 14 35 14 23 C14 17.5 18.5 13 24 13 C27.2 13 30 14.8 32 17.5 C34 14.8 36.8 13 40 13 C45.5 13 50 17.5 50 23 C50 35 32 46 32 46Z" fill="#5BA8C4" opacity="0.9" />
    <path d="M32 42 C32 42 18 33 18 23 C18 19.7 20.7 17 24 17 C26.5 17 28.7 18.5 30 20.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <text x="32" y="36" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="Georgia, serif" opacity="0.95">$</text>
  </svg>
);

// ── Confetti particle canvas ──────────────────────────────────────────
const ConfettiCanvas = ({ tier, active }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particles = useRef([]);

  const COLORS = tier === "legendary"
    ? ["#ff0", "#f00", "#0f0", "#0ff", "#f0f", "#fff", "#ffa500"]
    : tier === "epic"
    ? ["#f0932b", "#f9ca24", "#6ab04c", "#fff", "#5BA8C4"]
    : ["#5BA8C4", "#A8D5E8", "#ffffff", "#f9ca24", "#6ab04c"];

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const count = tier === "legendary" ? 280 : tier === "epic" ? 180 : tier === "great" ? 100 : 50;
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 10,
      h: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      vx: (Math.random() - 0.5) * (tier === "legendary" ? 6 : 3),
      vy: 2 + Math.random() * (tier === "legendary" ? 6 : 4),
      alpha: 1,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.current.forEach(p => {
        if (p.alpha <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.vy += 0.08; // gravity
        if (p.y > canvas.height * 0.7) p.alpha -= 0.018;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });
      if (alive) animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); ctx.clearRect(0, 0, canvas.width, canvas.height); };
  }, [active, tier]);

  if (!active) return null;
  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      pointerEvents: "none", zIndex: 9998,
    }} />
  );
};

// ── Firework burst (for legendary) ───────────────────────────────────
const FireworkCanvas = ({ active }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const bursts = [];
    const COLORS = ["#ff0", "#f00", "#0ff", "#f0f", "#0f0", "#ffa500", "#fff", "#5BA8C4"];

    const addBurst = () => {
      const x = 80 + Math.random() * (canvas.width - 160);
      const y = 60 + Math.random() * (canvas.height * 0.55);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const particles = Array.from({ length: 60 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, alpha: 1, color };
      });
      bursts.push(particles);
    };

    // Schedule bursts
    const intervals = [];
    for (let i = 0; i < 12; i++) {
      intervals.push(setTimeout(addBurst, i * 500));
    }

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let b = bursts.length - 1; b >= 0; b--) {
        const pts = bursts[b];
        let alive = false;
        pts.forEach(p => {
          if (p.alpha <= 0) return;
          alive = true;
          p.x += p.vx; p.y += p.vy;
          p.vy += 0.06;
          p.vx *= 0.98; p.vy *= 0.98;
          p.alpha -= 0.013;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        if (!alive) bursts.splice(b, 1);
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      intervals.forEach(clearTimeout);
    };
  }, [active]);

  if (!active) return null;
  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      pointerEvents: "none", zIndex: 9997,
    }} />
  );
};

// ── Celebration overlay ───────────────────────────────────────────────
const CelebrationOverlay = ({ celebration, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    if (!celebration) return;
    setVisible(true);
    setScale(0.5);
    setTimeout(() => setScale(1), 30);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 500);
    }, TIER_CONFIG[celebration.tier].duration);
    return () => clearTimeout(t);
  }, [celebration]);

  if (!celebration || !visible) return null;

  const cfg = TIER_CONFIG[celebration.tier];
  const isLegendary = celebration.tier === "legendary";
  const isEpic = celebration.tier === "epic";

  return (
    <>
      <ConfettiCanvas tier={celebration.tier} active={visible} />
      {isLegendary && <FireworkCanvas active={visible} />}

      {/* Backdrop for big tiers */}
      {(isLegendary || isEpic) && (
        <div onClick={onDismiss} style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: isLegendary ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            transform: `scale(${scale})`,
            transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            textAlign: "center",
            padding: "2rem",
            maxWidth: 520,
          }}>
            {/* Giant emoji */}
            <div style={{
              fontSize: isLegendary ? "7rem" : "5rem",
              lineHeight: 1,
              marginBottom: "1rem",
              filter: "drop-shadow(0 0 30px rgba(255,255,255,0.5))",
              animation: "bounce 0.6s ease infinite alternate",
            }}>
              {cfg.emoji}
            </div>

            {/* Amount badge */}
            <div style={{
              display: "inline-block",
              background: `linear-gradient(135deg, ${cfg.color}, ${isLegendary ? "#ffd700" : cfg.color}cc)`,
              borderRadius: 99,
              padding: "0.6rem 2rem",
              marginBottom: "1.2rem",
              boxShadow: `0 0 40px ${cfg.color}88`,
            }}>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: isLegendary ? "2.5rem" : "2rem", color: "#fff" }}>
                +{celebration.fmt}
              </span>
            </div>

            <div style={{
              fontFamily: "Georgia, serif",
              fontSize: isLegendary ? "2.2rem" : "1.6rem",
              fontWeight: 400,
              color: "#ffffff",
              marginBottom: "0.5rem",
              textShadow: `0 0 30px ${cfg.color}`,
              letterSpacing: "-0.02em",
            }}>
              {cfg.label}
            </div>

            {celebration.note && (
              <div style={{ color: "rgba(255,255,255,0.65)", fontFamily: "sans-serif", fontSize: "1rem", marginBottom: "1rem" }}>
                "{celebration.note}"
              </div>
            )}

            {isLegendary && (
              <div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", fontSize: "0.8rem", marginTop: "1.5rem", letterSpacing: "0.1em" }}>
                TAP ANYWHERE TO DISMISS
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast for smaller tiers */}
      {!isLegendary && !isEpic && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          left: "50%",
          transform: `translateX(-50%) scale(${scale})`,
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          zIndex: 9999,
          background: celebration.tier === "great"
            ? "linear-gradient(135deg, #2c2a00, #4a3800)"
            : "linear-gradient(135deg, #012a40, #013A58)",
          border: `1.5px solid ${cfg.color}55`,
          borderRadius: 16,
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.9rem",
          boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 20px ${cfg.color}33`,
          whiteSpace: "nowrap",
        }}>
          <span style={{ fontSize: "2rem" }}>{cfg.emoji}</span>
          <div>
            <div style={{ color: cfg.color, fontFamily: "Georgia, serif", fontSize: "1.2rem", fontWeight: 600 }}>
              +{celebration.fmt}
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif", fontSize: "0.75rem", marginTop: "0.1rem" }}>
              {cfg.label}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0px) rotate(-5deg); }
          to   { transform: translateY(-16px) rotate(5deg); }
        }
      `}</style>
    </>
  );
};

// ── Main App ──────────────────────────────────────────────────────────
export default function FundraiserTracker() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [donations, setDonations] = useState([]);
  const [view, setView] = useState("public");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(true);
  const [animatedRaised, setAnimatedRaised] = useState(0);
  const [saveMsg, setSaveMsg] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newNote, setNewNote] = useState("");
  const [addMsg, setAddMsg] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState(DEFAULT_CONFIG);
  const [celebration, setCelebration] = useState(null);

  // Poll for new donations (so public page updates when admin adds)
  const lastDonationId = useRef(null);
  const pollRef = useRef(null);

  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
  const primary = "#013A58";
  const primaryLight = "#015280";
  const accent = "#5BA8C4";
  const accentLight = "#A8D5E8";
  const pageBg = `linear-gradient(160deg, #001e30 0%, #013A58 45%, #002940 100%)`;
  const fmt = (n) => config.currency + Number(n).toLocaleString("en-US");

  const loadData = useCallback(async (silent = false) => {
    try {
      const [cfgResult, donResult] = await Promise.all([
        window.storage.get("fundraiser-config").catch(() => null),
        window.storage.get("fundraiser-donations").catch(() => null),
      ]);
      if (cfgResult?.value) {
        const c = JSON.parse(cfgResult.value);
        setConfig(c);
        if (!silent) setSettingsForm(c);
      }
      if (donResult?.value) {
        const parsed = JSON.parse(donResult.value);
        setDonations(prev => {
          // Detect new donation for celebration (only on public page poll)
          if (silent && parsed.length > 0 && parsed[0].id !== lastDonationId.current && lastDonationId.current !== null) {
            const newest = parsed[0];
            setCelebration({
              tier: getCelebrationTier(newest.amount),
              fmt: (DEFAULT_CONFIG.currency) + Number(newest.amount).toLocaleString("en-US"),
              note: newest.note,
              amount: newest.amount,
            });
          }
          if (parsed.length > 0) lastDonationId.current = parsed[0].id;
          return parsed;
        });
      }
    } catch {}
    if (!silent) setLoading(false);
  }, []);

  // Initial load
  useEffect(() => { loadData(false); }, []);

  // Poll every 3s on public page
  useEffect(() => {
    if (view === "public") {
      pollRef.current = setInterval(() => loadData(true), 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [view, loadData]);

  // Use config currency in fmt
  const fmtCfg = (n) => config.currency + Number(n).toLocaleString("en-US");

  // Animated counter
  useEffect(() => {
    if (loading) return;
    const target = totalRaised;
    if (target === 0) { setAnimatedRaised(0); return; }
    const steps = 50;
    let current = 0;
    const inc = target / steps;
    const timer = setInterval(() => {
      current += inc;
      if (current >= target) { setAnimatedRaised(target); clearInterval(timer); }
      else setAnimatedRaised(Math.round(current));
    }, 1200 / steps);
    return () => clearInterval(timer);
  }, [totalRaised, loading]);

  const percent = config.goal > 0 ? Math.min(100, Math.round((totalRaised / config.goal) * 100)) : 0;
  const animPct = config.goal > 0 ? Math.min(100, Math.round((animatedRaised / config.goal) * 100)) : 0;

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { setView("admin"); setLoginError(""); }
    else setLoginError("Incorrect password.");
  };

  const handleAddDonation = async () => {
    const amount = parseFloat(newAmount);
    if (!amount || amount <= 0) { setAddMsg("⚠ Enter a valid amount."); setTimeout(() => setAddMsg(""), 3000); return; }
    const donation = { id: Date.now(), amount, note: newNote.trim(), time: new Date().toISOString() };
    const updated = [donation, ...donations];
    try {
      await window.storage.set("fundraiser-donations", JSON.stringify(updated));
      setDonations(updated);
      lastDonationId.current = donation.id;
      setNewAmount(""); setNewNote("");
      // Trigger celebration on admin side too
      setCelebration({
        tier: getCelebrationTier(amount),
        fmt: fmtCfg(amount),
        note: donation.note,
        amount,
      });
      setAddMsg(`✓ +${fmtCfg(amount)} added!`);
      setTimeout(() => setAddMsg(""), 3000);
    } catch { setAddMsg("⚠ Failed to save."); }
  };

  const handleDelete = async (id) => {
    const updated = donations.filter(d => d.id !== id);
    try { await window.storage.set("fundraiser-donations", JSON.stringify(updated)); setDonations(updated); } catch {}
  };

  const handleSaveSettings = async () => {
    try {
      await window.storage.set("fundraiser-config", JSON.stringify(settingsForm));
      setConfig(settingsForm); setShowSettings(false);
      setSaveMsg("✓ Saved!"); setTimeout(() => setSaveMsg(""), 3000);
    } catch { setSaveMsg("⚠ Save failed."); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: pageBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <Logo size={52} />
        <div style={{ color: accentLight, fontFamily: "Georgia, serif", fontSize: "1rem", opacity: 0.7 }}>Loading...</div>
      </div>
    </div>
  );

  const cardStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(91,168,196,0.2)", borderRadius: 18, backdropFilter: "blur(10px)" };
  const inp = { padding: "0.75rem 1rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(91,168,196,0.25)", borderRadius: 8, color: "#e8f4f9", fontSize: "1rem", fontFamily: "sans-serif", outline: "none", boxSizing: "border-box" };
  const lbl = { display: "block", color: accentLight, fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "0.4rem", opacity: 0.8 };

  // Tier legend for admin
  const tiers = [
    { range: "< $100",    tier: "nice",      emoji: "🎉", label: "Toast" },
    { range: "$100–$499", tier: "great",     emoji: "🎊", label: "Confetti" },
    { range: "$500–$1,999", tier: "epic",    emoji: "🔥", label: "Big Banner" },
    { range: "$2,000+",   tier: "legendary", emoji: "🚀", label: "Fireworks!" },
  ];

  // ── PUBLIC ──
  if (view === "public") return (
    <div style={{ minHeight: "100vh", background: pageBg, fontFamily: "Georgia, serif", color: "#e8f4f9", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 1rem" }}>
      <CelebrationOverlay celebration={celebration} onDismiss={() => setCelebration(null)} />

      <div style={{ width: "100%", maxWidth: 680, paddingTop: "3rem", textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(91,168,196,0.1)", border: "2px solid rgba(91,168,196,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.8rem", boxShadow: "0 0 30px rgba(91,168,196,0.15)" }}>
            <Logo size={54} />
          </div>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.35em", textTransform: "uppercase", color: accent, fontFamily: "sans-serif", fontWeight: 600 }}>{config.organization}</div>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 400, margin: "0 0 1rem", letterSpacing: "-0.02em", color: "#ffffff" }}>{config.title}</h1>
        <p style={{ fontSize: "1rem", color: accentLight, maxWidth: 460, margin: "0 auto 3rem", lineHeight: 1.8, fontStyle: "italic", opacity: 0.8 }}>{config.message}</p>
      </div>

      <div style={{ ...cardStyle, width: "100%", maxWidth: 680, padding: "clamp(2rem,5vw,3.5rem)", boxShadow: "0 30px 70px rgba(0,0,0,0.4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ ...lbl, marginBottom: "0.5rem" }}>Amount Raised</div>
            <div style={{ fontSize: "clamp(2.2rem,7vw,3.8rem)", fontWeight: 300, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.03em" }}>{fmtCfg(animatedRaised)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...lbl, marginBottom: "0.5rem" }}>Our Goal</div>
            <div style={{ fontSize: "clamp(1.2rem,4vw,2rem)", fontWeight: 300, color: accentLight, opacity: 0.75 }}>{fmtCfg(config.goal)}</div>
          </div>
        </div>
        <div style={{ height: 12, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden", marginBottom: "0.7rem" }}>
          <div style={{ height: "100%", width: `${animPct}%`, background: `linear-gradient(90deg, ${accent}, ${accentLight})`, borderRadius: 999, transition: "width 0.06s linear", boxShadow: `0 0 16px rgba(91,168,196,0.5)` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "sans-serif", fontSize: "0.8rem", color: accentLight, opacity: 0.75 }}>
          <span style={{ color: "#ffffff", fontWeight: 600, opacity: 1 }}>{animPct}% funded</span>
          <span>{fmtCfg(config.goal - totalRaised)} remaining</span>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,transparent,rgba(91,168,196,0.2),transparent)`, margin: "2rem 0" }} />
        <div style={{ display: "flex", justifyContent: "center", gap: "clamp(2rem,6vw,4rem)", flexWrap: "wrap" }}>
          {[{ l: "Raised", v: fmtCfg(totalRaised) }, { l: "Goal", v: fmtCfg(config.goal) }, { l: "Progress", v: `${percent}%` }, { l: "Donations", v: donations.length }].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(1rem,3vw,1.4rem)", fontWeight: 400, color: "#ffffff", marginBottom: "0.3rem" }}>{s.v}</div>
              <div style={{ fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: accent, fontFamily: "sans-serif", opacity: 0.7 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        {donations.length > 0 && <div style={{ color: "rgba(168,213,232,0.3)", fontSize: "0.7rem", fontFamily: "sans-serif", marginBottom: "0.4rem" }}>Last donation: {new Date(donations[0].time).toLocaleString()}</div>}
        <button onClick={() => setView("login")} style={{ background: "none", border: "none", color: "rgba(91,168,196,0.2)", fontSize: "0.65rem", fontFamily: "sans-serif", cursor: "pointer", textDecoration: "underline" }}>Admin</button>
      </div>
      <div style={{ height: "3rem" }} />
    </div>
  );

  // ── LOGIN ──
  if (view === "login") return (
    <div style={{ minHeight: "100vh", background: pageBg, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ ...cardStyle, width: "100%", maxWidth: 400, padding: "3rem 2.5rem", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}><Logo size={52} /></div>
          <h2 style={{ color: "#ffffff", fontWeight: 400, margin: 0, fontFamily: "Georgia, serif", fontSize: "1.5rem" }}>Admin Access</h2>
          <p style={{ color: accentLight, fontSize: "0.82rem", marginTop: "0.5rem", fontStyle: "italic", fontFamily: "Georgia, serif", opacity: 0.7 }}>Enter password to manage donations</p>
        </div>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Password" style={{ ...inp, width: "100%", marginBottom: "0.8rem" }} />
        {loginError && <div style={{ color: "#ff6b6b", fontSize: "0.8rem", fontFamily: "sans-serif", marginBottom: "0.8rem", textAlign: "center" }}>{loginError}</div>}
        <button onClick={handleLogin} style={{ width: "100%", padding: "0.9rem", background: `linear-gradient(90deg,${primaryLight},${accent})`, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontFamily: "sans-serif", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.8rem", fontSize: "0.85rem" }}>Unlock</button>
        <button onClick={() => { setView("public"); setPassword(""); setLoginError(""); }} style={{ width: "100%", background: "none", border: "none", color: accentLight, fontSize: "0.8rem", fontFamily: "sans-serif", cursor: "pointer", textDecoration: "underline", opacity: 0.6 }}>← Back to fundraiser</button>
      </div>
    </div>
  );

  // ── ADMIN ──
  return (
    <div style={{ minHeight: "100vh", background: pageBg, fontFamily: "sans-serif", color: "#e8f4f9", padding: "1.5rem 1rem" }}>
      <CelebrationOverlay celebration={celebration} onDismiss={() => setCelebration(null)} />

      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
            <Logo size={38} />
            <div>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: accent, marginBottom: "0.15rem", opacity: 0.8 }}>Admin Panel</div>
              <h2 style={{ margin: 0, fontWeight: 400, fontSize: "1.3rem", fontFamily: "Georgia, serif", color: "#ffffff" }}>Donation Tracker</h2>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => { setShowSettings(!showSettings); setSettingsForm(config); }} style={{ background: "rgba(91,168,196,0.1)", border: "1px solid rgba(91,168,196,0.25)", borderRadius: 8, color: accentLight, padding: "0.5rem 0.9rem", cursor: "pointer", fontSize: "0.78rem" }}>⚙ Settings</button>
            <button onClick={() => setView("public")} style={{ background: "none", border: "1px solid rgba(91,168,196,0.25)", borderRadius: 8, color: accentLight, padding: "0.5rem 0.9rem", cursor: "pointer", fontSize: "0.78rem" }}>← Public Page</button>
          </div>
        </div>

        {/* Settings */}
        {showSettings && (
          <div style={{ ...cardStyle, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: "1rem" }}>Fundraiser Settings</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {[["title", "Title"], ["organization", "Organization"]].map(([k, l]) => (
                <div key={k}><label style={lbl}>{l}</label><input style={{ ...inp, width: "100%" }} value={settingsForm[k]} onChange={e => setSettingsForm({ ...settingsForm, [k]: e.target.value })} /></div>
              ))}
              <div><label style={lbl}>Message</label><textarea style={{ ...inp, width: "100%", minHeight: 64, resize: "vertical", lineHeight: 1.5 }} value={settingsForm.message} onChange={e => setSettingsForm({ ...settingsForm, message: e.target.value })} /></div>
              <div><label style={lbl}>Goal Amount ($)</label><input type="number" style={{ ...inp, width: "100%" }} value={settingsForm.goal} onChange={e => setSettingsForm({ ...settingsForm, goal: parseFloat(e.target.value) || 0 })} /></div>
              <div style={{ display: "flex", gap: "0.7rem" }}>
                <button onClick={handleSaveSettings} style={{ flex: 1, padding: "0.7rem", background: `linear-gradient(90deg,${primaryLight},${accent})`, border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Save</button>
                <button onClick={() => setShowSettings(false)} style={{ padding: "0.7rem 1rem", background: "none", border: "1px solid rgba(91,168,196,0.25)", borderRadius: 8, color: accentLight, cursor: "pointer" }}>Cancel</button>
              </div>
              {saveMsg && <div style={{ color: saveMsg.startsWith("✓") ? "#5ddba0" : "#ff6b6b", fontSize: "0.82rem", textAlign: "center" }}>{saveMsg}</div>}
            </div>
          </div>
        )}

        {/* Total */}
        <div style={{ ...cardStyle, padding: "1.5rem", marginBottom: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: accentLight, marginBottom: "0.3rem", opacity: 0.7 }}>Total Raised</div>
            <div style={{ fontSize: "2.6rem", fontWeight: 300, color: "#ffffff", fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>{fmtCfg(totalRaised)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.9rem", color: accentLight, opacity: 0.7 }}>of {fmtCfg(config.goal)}</div>
            <div style={{ fontSize: "1.2rem", color: accent, marginTop: "0.3rem", fontWeight: 600 }}>{percent}%</div>
            <div style={{ fontSize: "0.78rem", color: "rgba(168,213,232,0.4)", marginTop: "0.2rem" }}>{donations.length} donation{donations.length !== 1 ? "s" : ""}</div>
          </div>
        </div>

        {/* Celebration tier legend */}
        <div style={{ ...cardStyle, padding: "1rem 1.5rem", marginBottom: "1.2rem" }}>
          <div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: "0.8rem", opacity: 0.8 }}>🎉 Celebration Tiers</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.5rem" }}>
            {tiers.map(t => (
              <div key={t.tier} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "0.6rem 0.8rem", border: "1px solid rgba(91,168,196,0.1)", cursor: "pointer" }}
                onClick={() => setCelebration({ tier: t.tier, fmt: t.range, note: "Preview", amount: 0 })}>
                <div style={{ fontSize: "1.2rem", marginBottom: "0.2rem" }}>{t.emoji}</div>
                <div style={{ fontSize: "0.72rem", color: "#ffffff", fontWeight: 600 }}>{t.range}</div>
                <div style={{ fontSize: "0.65rem", color: accentLight, opacity: 0.6 }}>{t.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "0.65rem", color: "rgba(168,213,232,0.35)", marginTop: "0.6rem" }}>Click a tier to preview the animation</div>
        </div>

        {/* Add donation */}
        <div style={{ ...cardStyle, padding: "1.5rem", marginBottom: "1.2rem" }}>
          <div style={{ fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: "1rem" }}>➕ Add Incoming Donation</div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <div style={{ flex: "0 0 130px" }}>
              <label style={lbl}>Amount ($) *</label>
              <input type="number" placeholder="0.00" value={newAmount} onChange={e => setNewAmount(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddDonation()} style={{ ...inp, width: "100%" }} />
            </div>
            <div style={{ flex: "1 1 180px" }}>
              <label style={lbl}>Note (optional)</label>
              <input type="text" placeholder="e.g. Cash, Online, Check…" value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddDonation()} style={{ ...inp, width: "100%" }} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button onClick={handleAddDonation} style={{ padding: "0.75rem 1.4rem", background: `linear-gradient(90deg,${primaryLight},${accent})`, border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", whiteSpace: "nowrap" }}>+ Add</button>
            </div>
          </div>
          {addMsg && <div style={{ marginTop: "0.7rem", color: addMsg.startsWith("✓") ? "#5ddba0" : "#ff6b6b", fontSize: "0.85rem" }}>{addMsg}</div>}
        </div>

        {/* Log */}
        <div style={{ ...cardStyle, padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: accent }}>Donation Log</div>
            <div style={{ fontSize: "0.72rem", color: "rgba(168,213,232,0.4)" }}>{donations.length} entries · total {fmtCfg(totalRaised)}</div>
          </div>
          {donations.length === 0 ? (
            <div style={{ textAlign: "center", color: "rgba(168,213,232,0.3)", padding: "2.5rem 1rem", fontSize: "0.88rem", fontStyle: "italic" }}>No donations yet — add your first one above!</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", maxHeight: 360, overflowY: "auto", paddingRight: "0.3rem" }}>
              {donations.map((d, i) => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", background: i === 0 ? "rgba(91,168,196,0.1)" : "rgba(255,255,255,0.03)", borderRadius: 8, border: `1px solid ${i === 0 ? "rgba(91,168,196,0.25)" : "rgba(255,255,255,0.05)"}` }}>
                  <div>
                    <span style={{ fontWeight: 600, color: "#ffffff", fontSize: "1.05rem" }}>{fmtCfg(d.amount)}</span>
                    <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem" }}>{["nice","great","epic","legendary"].includes(getCelebrationTier(d.amount)) ? TIER_CONFIG[getCelebrationTier(d.amount)].emoji : ""}</span>
                    {d.note && <span style={{ color: accentLight, fontSize: "0.78rem", marginLeft: "0.4rem", opacity: 0.7 }}>{d.note}</span>}
                    <div style={{ fontSize: "0.65rem", color: "rgba(168,213,232,0.35)", marginTop: "0.15rem" }}>{new Date(d.time).toLocaleString()}</div>
                  </div>
                  <button onClick={() => handleDelete(d.id)} title="Delete" style={{ background: "none", border: "none", color: "rgba(168,213,232,0.3)", cursor: "pointer", fontSize: "0.9rem", padding: "0.3rem 0.5rem", borderRadius: 4 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: "2.5rem" }} />
      </div>
    </div>
  );
}
