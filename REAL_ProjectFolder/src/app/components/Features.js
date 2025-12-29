"use client";
import React from "react";

export default function Features() {
  const features = [
    {
      id: "chat",
      icon: "fa-comment-medical",
      title: "Chat with Doctors",
      text: "Real-time text/video consultations with verified healthcare professionals. Secure messaging with end-to-end encryption.",
      iconBg: "linear-gradient(135deg, #27A4FF, #1D6BFF)",
    },
    {
      id: "meds",
      icon: "fa-pills",
      title: "Medications & Reminders",
      text: "AI explanations (usage, dosage, side effects), upload prescriptions and set reminders.",
      iconBg: "linear-gradient(135deg, #00D97E, #00B86B)",
    },
    {
      id: "reports",
      icon: "fa-file-medical",
      title: "Health Reports",
      text: "Upload lab/radiology reports (PDF/image) — AI summarizes and compares trends over time.",
      iconBg: "linear-gradient(135deg, #C86DD7, #8854D0)",
    },
    {
      id: "symptoms",
      icon: "fa-stethoscope",
      title: "Symptom Checker",
      text: "Describe symptoms, get likely conditions, probability and urgency (emergency vs. non-urgent).",
      iconBg: "linear-gradient(135deg, #FFA726, #FB8C00)",
    },
    {
      id: "appointments",
      icon: "fa-calendar-check",
      title: "Appointments",
      text: "Schedule visits, sync with calendars, receive reminders and rescheduling options.",
      iconBg: "linear-gradient(135deg, #29B6F6, #0288D1)",
    },
    {
      id: "wellness",
      icon: "fa-heart",
      title: "Wellness Dashboard",
      text: "Track vitals, view trends with charts, and get AI lifestyle recommendations.",
      iconBg: "linear-gradient(135deg, #F06292, #E91E63)",
    },
    {
      id: "library",
      icon: "fa-book-medical",
      title: "Health Library",
      text: "Verified articles with AI-generated concise summaries for quick understanding.",
      iconBg: "linear-gradient(135deg, #AB47BC, #8E24AA)",
    },

  ];

  return (
    <section
      style={{
        padding: "80px 20px",
        background: "transparent",
        color: "white",
        fontFamily: `'Inter', 'Segoe UI', Tahoma, sans-serif`,
      }}
    >
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <h2
          style={{
            fontSize: "38px",
            fontWeight: "700",
            letterSpacing: "-0.5px",
            marginBottom: "10px",
          }}
        >
          Comprehensive Health Management
        </h2>

        <p
          style={{
            marginTop: "20px",
            fontSize: "16px",
            opacity: "0.75",
            maxWidth: "750px",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: "1.6",
          }}
        >
          Everything organized into easy-to-access tools for patients, doctors
          and admins.
        </p>
      </div>

      {/* Features Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "30px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {features.map((f) => (
          <div
            key={f.id}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "18px",
              padding: "40px 30px",
              backdropFilter: "blur(10px)",
              textAlign: "center",
              transition: "0.3s",
              cursor: "pointer",
            }}
            onClick={() => (window.location.href = `#${f.id}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow =
                "0 15px 35px rgba(0,0,0,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "18px",
                background: f.iconBg,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: "36px",
                margin: "0 auto 25px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
              }}
            >
              <i className={`fas ${f.icon}`}></i>
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "12px",
              }}
            >
              {f.title}
            </h3>

            {/* Text */}
            <p
              style={{
                fontSize: "14px",
                opacity: "0.75",
                lineHeight: "1.55",
              }}
            >
              {f.text}
            </p>

            {/* Link */}
            <a
              href={`#${f.id}`}
              style={{
                marginTop: "15px",
                fontWeight: "600",
                color: "#4DAFFF",
                textDecoration: "none",
                display: "inline-flex",
                gap: "6px",
                alignItems: "center",
                transition: "color 0.3s",
              }}
            >
              View <i className="fas fa-arrow-right"></i>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
