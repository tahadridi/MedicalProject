"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    cin: "",
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registration successful ✅");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setMessage(data.error || "Registration failed ❌");
      }
    } catch (error) {
      console.error(error);
      setMessage("Connection error ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="compact-sidebar-container">
      <div className="compact-sidebar-background"></div>
      
      <div className="compact-sidebar-wrapper">
        {/* Left Sidebar - Welcome & Benefits */}
        <div className="compact-sidebar-left">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">NC</div>
            <h1 className="sidebar-brand-title">Nexus Clinical</h1>
          </div>
          
          <div className="sidebar-welcome">
            <h2 className="sidebar-heading">
              Welcome to Healthcare Innovation
            </h2>
            <p className="sidebar-description">
              Join our platform that connects patients with advanced medical care 
              through AI-powered insights and professional healthcare services.
            </p>
          </div>

          <div className="sidebar-benefits">
            <div className="sidebar-benefit">
              <div className="benefit-icon">⚕️</div>
              <div className="benefit-content">
                <h4>AI Health Insights</h4>
                <p>Personalized medical recommendations powered by AI</p>
              </div>
            </div>
            
            <div className="sidebar-benefit">
              <div className="benefit-icon">🔒</div>
              <div className="benefit-content">
                <h4>Secure & Private</h4>
                <p>Your medical data is encrypted and protected</p>
              </div>
            </div>
            
            <div className="sidebar-benefit">
              <div className="benefit-icon">👨‍⚕️</div>
              <div className="benefit-content">
                <h4>Expert Access</h4>
                <p>Direct communication with healthcare professionals</p>
              </div>
            </div>
          </div>

          <div className="sidebar-footer">
            <p>Already registered with us?</p>
            <button 
              type="button"
              className="sidebar-link"
              onClick={() => router.push("/login")}
            >
              Sign in to your account
            </button>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="compact-sidebar-right">
          <div className="sidebar-form-header">
            <h2 className="sidebar-form-title">Create Account</h2>
            <p className="sidebar-form-subtitle">
              Fill in your details to get started
            </p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="sidebar-form-grid">
              <div className="sidebar-form-group">
                <div className="sidebar-input-wrapper">
                  <input
                    type="text"
                    name="username"
                    className="sidebar-input"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  <span className="sidebar-input-icon">👤</span>
                </div>
              </div>

              <div className="sidebar-form-group">
                <div className="sidebar-input-wrapper">
                  <input
                    type="text"
                    name="cin"
                    className="sidebar-input"
                    placeholder="CIN Number"
                    value={formData.cin}
                    onChange={handleChange}
                    required
                  />
                  <span className="sidebar-input-icon">🪪</span>
                </div>
              </div>

              <div className="sidebar-form-group">
                <div className="sidebar-input-wrapper">
                  <input
                    type="email"
                    name="email"
                    className="sidebar-input"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <span className="sidebar-input-icon">✉️</span>
                </div>
              </div>

              <div className="sidebar-form-group">
                <div className="sidebar-input-wrapper">
                  <input
                    type="password"
                    name="password"
                    className="sidebar-input"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <span className="sidebar-input-icon">🔐</span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="sidebar-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="sidebar-btn-loader"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {message && (
              <div className={`sidebar-auth-message ${message.includes("✅") ? "success" : "error"}`}>
                <div className="sidebar-message-icon">
                  {message.includes("✅") ? "✓" : "!"}
                </div>
                <span>{message}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}