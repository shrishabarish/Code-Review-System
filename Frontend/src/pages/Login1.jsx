import { useState } from "react";

// Mock navigate for standalone preview — swap with useNavigate() from react-router-dom in your app
const useNavigate = () => (path) => console.log("Navigate to:", path);

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lg-root {
    font-family: 'Barlow', sans-serif;
    min-height: 100vh;
    background-color: #080c10;
    background-image:
      linear-gradient(rgba(0,255,200,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,200,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  /* Glow blob */
  .lg-root::before {
    content: '';
    position: fixed;
    top: -200px; left: -200px;
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(0,220,180,0.07) 0%, transparent 65%);
    pointer-events: none;
  }

  /* Top bar */
  .lg-topbar {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 22px 36px;
    border-bottom: 1px solid rgba(0,255,200,0.08);
    animation: fadeIn 0.4s ease both;
  }
  .lg-topbar-line {
    width: 32px; height: 2px;
    background: #00ddb4;
  }
  .lg-topbar-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #00ddb4;
  }

  /* Main layout */
  .lg-main {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: calc(100vh - 57px);
  }

  /* Left panel */
  .lg-left {
    padding: 60px 36px 60px 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-right: 1px solid rgba(0,255,200,0.07);
    animation: slideRight 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both;
  }

  .lg-heading {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(62px, 8vw, 96px);
    font-weight: 800;
    line-height: 0.92;
    color: #f0f6ff;
    letter-spacing: -1px;
    text-transform: uppercase;
  }

  .lg-status-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 28px;
  }
  .lg-status-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #00ddb4;
    animation: pulse 2s infinite;
  }
  .lg-status-text {
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
  }

  /* Stat cards */
  .lg-stats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1px;
    background: rgba(0,255,200,0.07);
    border: 1px solid rgba(0,255,200,0.07);
    margin-top: auto;
  }
  .lg-stat {
    background: #080c10;
    padding: 20px 18px;
  }
  .lg-stat-id {
    font-size: 10px;
    letter-spacing: 0.12em;
    color: #00ddb4;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .lg-stat-val {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #00ddb4;
    line-height: 1;
  }
  .lg-stat-label {
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin-top: 6px;
  }

  /* Right panel — login form */
  .lg-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 48px;
    animation: slideLeft 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both;
  }

  .lg-form-wrap {
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .lg-form-tag {
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #00ddb4;
    margin-bottom: 18px;
  }

  .lg-form-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 38px;
    font-weight: 700;
    color: #f0f6ff;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
  }
  .lg-form-sub {
    font-size: 12px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.06em;
    margin-bottom: 36px;
  }

  .lg-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-bottom: 16px;
  }
  .lg-field-label {
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
  }
  .lg-input {
    width: 100%;
    padding: 13px 14px;
    background: rgba(0,255,200,0.03);
    border: 1px solid rgba(0,255,200,0.12);
    color: #f0f6ff;
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s, background 0.15s;
    border-radius: 0;
    letter-spacing: 0.02em;
  }
  .lg-input::placeholder { color: rgba(255,255,255,0.18); }
  .lg-input:focus {
    border-color: #00ddb4;
    background: rgba(0,221,180,0.05);
  }
  .lg-input.err { border-color: rgba(255,80,80,0.5); }

  .lg-error {
    font-size: 11px;
    color: #ff6b6b;
    letter-spacing: 0.04em;
    margin-top: -10px;
    margin-bottom: 6px;
  }

  .lg-forgot {
    text-align: right;
    margin-top: -8px;
    margin-bottom: 28px;
  }
  .lg-forgot span {
    font-size: 11px;
    color: rgba(0,221,180,0.5);
    letter-spacing: 0.06em;
    cursor: pointer;
    text-transform: uppercase;
    transition: color 0.15s;
  }
  .lg-forgot span:hover { color: #00ddb4; }

  .lg-btn-primary {
    width: 100%;
    padding: 15px;
    background: #00ddb4;
    border: none;
    color: #080c10;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 12px;
  }
  .lg-btn-primary:hover { background: #00f5c8; }
  .lg-btn-primary:active { transform: scale(0.99); }
  .lg-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .lg-btn-secondary {
    width: 100%;
    padding: 15px;
    background: transparent;
    border: 1px solid rgba(0,255,200,0.15);
    color: rgba(255,255,255,0.4);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    border-radius: 0;
    margin-bottom: 32px;
  }
  .lg-btn-secondary:hover {
    border-color: rgba(0,255,200,0.4);
    color: rgba(255,255,255,0.7);
  }

  .lg-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;
  }
  .lg-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
  .lg-divider-text {
    font-size: 10px;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.2);
    text-transform: uppercase;
  }

  .lg-register-row {
    text-align: center;
  }
  .lg-register-row p {
    font-size: 12px;
    color: rgba(255,255,255,0.25);
    letter-spacing: 0.04em;
  }
  .lg-register-row span {
    color: #00ddb4;
    cursor: pointer;
    font-weight: 600;
    transition: opacity 0.15s;
  }
  .lg-register-row span:hover { opacity: 0.7; }

  /* Loading spinner */
  .lg-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(8,12,16,0.3);
    border-top-color: #080c10;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  /* Success overlay */
  .lg-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    text-align: center;
    animation: fadeIn 0.3s ease both;
  }
  .lg-success-icon {
    width: 56px; height: 56px;
    border: 1px solid #00ddb4;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    color: #00ddb4;
    margin-bottom: 8px;
  }
  .lg-success-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #f0f6ff;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  .lg-success-sub {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
  }
  .lg-success-bar {
    width: 200px; height: 2px;
    background: rgba(0,221,180,0.15);
    overflow: hidden;
    margin-top: 8px;
  }
  .lg-success-progress {
    height: 100%;
    background: #00ddb4;
    animation: progress 1.2s ease forwards;
  }

  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  @keyframes slideRight { from { opacity:0; transform:translateX(-20px) } to { opacity:1; transform:none } }
  @keyframes slideLeft  { from { opacity:0; transform:translateX(20px)  } to { opacity:1; transform:none } }
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes progress { from{width:0} to{width:100%} }

  @media (max-width: 700px) {
    .lg-main { grid-template-columns: 1fr; }
    .lg-left { display: none; }
    .lg-right { padding: 40px 24px; }
  }
`;

export default function Login1() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: null }));
  };

  const handleLogin = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
    if (!form.password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1400);
    }, 900);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="lg-root">

        {/* Top bar */}
        <div className="lg-topbar">
          <div className="lg-topbar-line" />
          <span className="lg-topbar-label">Code Review System · v2.4.1</span>
        </div>

        <div className="lg-main">

          {/* LEFT — branding + stats */}
          <div className="lg-left">
            <div>
              <h1 className="lg-heading">Code<br />Review<br />System</h1>
              <div className="lg-status-row">
                <div className="lg-status-dot" />
                <span className="lg-status-text">System Nominal · All Services Operational</span>
              </div>
            </div>

            <div className="lg-stats">
              {[
                { id: "01 / Trust", val: "82%", label: "Trust Score" },
                { id: "02 / Status", val: "CONSENSUS", label: "Review Status" },
                { id: "03 / Volume", val: "14", label: "Reviews Completed" },
              ].map((s) => (
                <div className="lg-stat" key={s.id}>
                  <div className="lg-stat-id">{s.id}</div>
                  <div className="lg-stat-val">{s.val}</div>
                  <div className="lg-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — form */}
          <div className="lg-right">
            <div className="lg-form-wrap">
              {success ? (
                <div className="lg-success">
                  <div className="lg-success-icon">✓</div>
                  <div className="lg-success-title">Access Granted</div>
                  <div className="lg-success-sub">Redirecting to dashboard…</div>
                  <div className="lg-success-bar"><div className="lg-success-progress" /></div>
                </div>
              ) : (
                <>
                  <div className="lg-form-tag">// Authentication Required</div>
                  <div className="lg-form-title">Sign In</div>
                  <div className="lg-form-sub">Enter your credentials to access the system</div>

                  <div className="lg-field">
                    <label className="lg-field-label">Email Address</label>
                    <input
                      className={`lg-input${errors.email ? " err" : ""}`}
                      name="email"
                      type="email"
                      placeholder="user@domain.com"
                      value={form.email}
                      onChange={handleChange}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    {errors.email && <span className="lg-error">↑ {errors.email}</span>}
                  </div>

                  <div className="lg-field">
                    <label className="lg-field-label">Password</label>
                    <input
                      className={`lg-input${errors.password ? " err" : ""}`}
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    {errors.password && <span className="lg-error">↑ {errors.password}</span>}
                  </div>

                  <div className="lg-forgot">
                    <span>Forgot password?</span>
                  </div>

                  <button className="lg-btn-primary" onClick={handleLogin} disabled={loading}>
                    {loading ? <><div className="lg-spinner" /> Authenticating…</> : "Submit Code →"}
                  </button>

                  <div className="lg-divider">
                    <div className="lg-divider-line" />
                    <span className="lg-divider-text">or</span>
                    <div className="lg-divider-line" />
                  </div>

                  <button className="lg-btn-secondary" onClick={() => navigate("/register")}>
                    Review Code
                  </button>

                  <div className="lg-register-row">
                    <p>Don't have an account? <span onClick={() => navigate("/register")}>Register</span></p>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}