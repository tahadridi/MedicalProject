"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

   const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('doctorData');
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (res.ok && data.token) {
        // Save token and user
        localStorage.setItem("token", data.token);
          if (!data.user.isMedecin && data.user.patientId) {
      localStorage.setItem("patientId", data.user.patientId);
      console.log("📌 Stored patient ID:", data.user.patientId);
    }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          console.log("Redirect role:", data.user.role, data.user.isMedecin);
          localStorage.setItem("userCin", data.user.cin);
          // Check if it's a doctor
          if (data.user.isMedecin) {
            setMessage("Connexion réussie - Médecin ✅");
            setTimeout(() => {
              router.push("/DoctorDashboard");
            }, 1000);
          } else {
            // PATIENT: Check if they have a health profile
            try {
              const checkRes = await fetch("/api/health/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cin: data.user.cin, email: data.user.email }),
              });
              
              const checkData = await checkRes.json();
              console.log("Health profile check:", checkData);
              
              if (checkRes.ok) {
                if (checkData.hasProfile) {
                  // Already has profile → go to patient dashboard
                  setMessage("Connexion réussie - Patient ✅");
                  localStorage.setItem("hasHealthProfile", "true");
                  setTimeout(() => {
                    router.push("/patient"); 
                  }, 1000);
                } else {
                  // First time → show health form
                  setMessage("Connexion réussie - Patient ✅");
                  localStorage.setItem("hasHealthProfile", "false");
                  setTimeout(() => {
                    router.push("/health-form");
                  }, 1000);
                }
              } else {
                // If check fails, assume first time
                setMessage("Connexion réussie - Patient ✅");
                localStorage.setItem("hasHealthProfile", "false");
                setTimeout(() => {
                  router.push("/health-form");
                }, 1000);
              }
            } catch (checkError) {
              console.error("Profile check error:", checkError);
              // Fallback to health form
              setMessage("Connexion réussie - Patient ✅");
              setTimeout(() => {
                router.push("/health-form");
              }, 1000);
            }
          }
        }
      } else {
        setMessage(data.error || "Échec de la connexion ❌");
      }
    } catch (error) {
      console.error(error);
      setMessage("Erreur de connexion ❌");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-bg-circle"></div>
        <div className="auth-bg-circle"></div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-logo">
            <div className="brand-icon">NC</div>
            <div className="brand-text">Nexus Clinical</div>
          </div>
          <p className="auth-subtitle">
            Access your medical records and communicate with healthcare professionals
          </p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="form-input-wrapper">
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="form-icon">✉️</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrapper">
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="form-icon">🔒</span>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in to your account"}
          </button>

          {message && (
            <div className={`auth-message ${message.includes("✅") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          <div className="auth-link">
            <span className="auth-link-text">
              Don't have an account?
              <button 
                type="button"
                className="auth-link-btn"
                onClick={() => router.push("/register")}
              >
                Create account
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}