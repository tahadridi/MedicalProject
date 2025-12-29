"use client";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function Dashboard(){
  const chartRef = useRef(null);

  useEffect(()=>{
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");

    const systolicGradient = ctx.createLinearGradient(0, 0, 0, 300);
    systolicGradient.addColorStop(0, "rgba(26,115,232,0.28)");
    systolicGradient.addColorStop(1, "rgba(26,115,232,0)");

    const diastolicGradient = ctx.createLinearGradient(0, 0, 0, 300);
    diastolicGradient.addColorStop(0, "rgba(22,163,74,0.22)");
    diastolicGradient.addColorStop(1, "rgba(22,163,74,0)");

    const bpChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: "Systolic",
            data: [120,119,121,118,117,120,122,121,119,118,120,121,119,118,117,118,120,121,122,121,120,119,118,119,120,121,121,119,118,117],
            borderColor: "#1a73e8",
            backgroundColor: systolicGradient,
            tension: 0.35,
            borderWidth: 3,
            pointRadius: 3,
            pointHoverRadius: 6,
            fill: true,
          },
          {
            label: "Diastolic",
            data: [78,77,79,76,75,78,79,78,77,76,77,78,77,76,75,76,77,78,79,78,77,76,75,76,77,78,78,77,76,75],
            borderColor: "#16a34a",
            backgroundColor: diastolicGradient,
            tension: 0.35,
            borderWidth: 3,
            pointRadius: 3,
            pointHoverRadius: 6,
            fill: true,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#9aa4b2", maxRotation:0 } },
          y: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#9aa4b2" } },
        },
        animation: { duration: 900, easing: 'easeOutQuart' },
      }
    });

    return () => bpChart.destroy();
  },[]);

  const vitals = [
    { icon: "fa-heartbeat", label: "Heart Rate", value: "72 bpm", trend: "up", trendText: "2% from last week" },
    { icon: "fa-tachometer-alt", label: "Blood Pressure", value: "118/78", trend: "down", trendText: "5% from last month" },
    { icon: "fa-thermometer-half", label: "Temperature", value: "98.6°F", trend: "neutral", trendText: "No change" },
    { icon: "fa-walking", label: "Steps Today", value: "8,234", trend: "up", trendText: "15% from yesterday" },
  ];

  return (
    <section className="dashboard-section container" style={{paddingTop:2}}>
      <div className="background-cells" aria-hidden="true">
        {Array.from({ length: 36 }).map((_, i) => (
          <span key={i} style={{
            position: "absolute",
            width: `${Math.random()*18 + 10}px`,
            height: `${Math.random()*18 + 10}px`,
            borderRadius: "50%",
            background: `rgba(26,115,232,0.06)`,
            top: `${Math.random()*100}%`,
            left: `${Math.random()*100}%`,
            animation: `floatCells ${6 + Math.random()*10}s ease-in-out infinite alternate`,
            zIndex:0
          }} />
        ))}
      </div>

      <div className="dashboard-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,zIndex:2,position:'relative'}}>
        <div>
          <h2 style={{color:'var(--primary)',fontWeight:700,fontSize:'1.6rem'}}>Your Wellness Dashboard</h2>
          <p style={{color:'var(--muted)'}}>Overview of your health metrics and AI suggestions.</p>
        </div>
        <a className="feature-link" href="#wellness" style={{color:'var(--primary)',fontWeight:700}}>View Full Dashboard <i className="fas fa-arrow-right" style={{marginLeft:8}}></i></a>
      </div>

      <div className="vitals-grid" style={{zIndex:2,position:'relative'}}>
        {vitals.map((v,i)=>(
          <div key={i} className="vital-card" onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div className="vital-icon" style={{color:'var(--primary)'}}><i className={`fas ${v.icon}`}></i></div>
            <div style={{fontSize:18,fontWeight:700,marginBottom:6}}>{v.value}</div>
            <div style={{color:'var(--muted)',marginBottom:8}}>{v.label}</div>
            <div style={{fontSize:13,color: v.trend === "up" ? "#16a34a" : v.trend === "down" ? "#ff6b6b" : 'var(--muted)'}}>
              {v.trend === "up" && <i className="fas fa-arrow-up" style={{marginRight:6}}></i>}
              {v.trend === "down" && <i className="fas fa-arrow-down" style={{marginRight:6}}></i>}
              {v.trendText}
            </div>
          </div>
        ))}
      </div>

      <div className="chart-container" style={{height:350,marginTop:18, zIndex:2, position:'relative'}}>
        <canvas ref={chartRef}></canvas>
      </div>

      <div className="ai-advice" style={{marginTop:18,zIndex:2,position:'relative'}}>
        <h3 style={{display:'flex',alignItems:'center',gap:8,color:'var(--primary)'}}><i className="fas fa-robot"></i> AI Health Assistant</h3>
        <p style={{marginTop:8,color:'var(--muted)'}}>Based on your recent activity, increase daily water intake by 500ml and add 10 minutes of light evening exercise. Sleep quality improved by 12% this week — keep your routine.</p>
      </div>

      <style>{`
        @keyframes floatCells {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-18px) translateX(12px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
      `}</style>
    </section>
  );
}
