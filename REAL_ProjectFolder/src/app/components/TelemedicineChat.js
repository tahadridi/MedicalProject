"use client";
import { useState, useRef, useEffect } from "react";

export default function TelemedicineChat(){
  const [messages, setMessages] = useState([
    { id: 1, sender: "ai", text: "Based on your symptoms, provide details about the pain location and intensity." },
    { id: 2, sender: "doctor", text: "Can you describe the type of discomfort? Sharp or dull? Does it radiate?" },
    { id: 3, sender: "user", text: "It's a dull ache in the center of my chest and sometimes reaches the left arm." },
  ]);

  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: "user", text: input }]);
    setInput("");
  };

  useEffect(()=>{
    if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  },[messages]);

  return (
    <div className="telemedicine-chat" style={{maxWidth:700,margin:'90px auto',display:'flex',flexDirection:'column',gap:12}}>
      <h2 style={{textAlign:'center',margin:0,color:'var(--primary)'}}>Telemedicine Chat</h2>

      <div ref={scrollRef} style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:10,maxHeight:420,paddingRight:6}}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
            background: msg.sender === "user" ? "linear-gradient(90deg,var(--accent),var(--primary))" : (msg.sender === "ai" ? "rgba(255,249,230,0.06)" : "rgba(255,255,255,0.02)"),
            color: msg.sender === "user" ? "#042" : "#e6eef6",
            padding: "12px 14px",
            borderRadius: 12,
            maxWidth: "80%",
            boxShadow: "0 6px 18px rgba(0,0,0,0.28)",
            whiteSpace: "pre-wrap",
          }}>
            {msg.sender === "ai" && <strong style={{display:'block',marginBottom:6,color:'#b08500'}}>AI Assistant</strong>}
            {msg.sender === "doctor" && <strong style={{display:'block',marginBottom:6}}>Dr. Sarah Johnson</strong>}
            {msg.text}
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:10,marginTop:6}}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Type your message..." style={{flex:1,padding:'12px 14px',borderRadius:12,border:'1px solid rgba(255,255,255,0.06)',background:'transparent',color:'#e6eef6'}} />
        <button onClick={handleSend} style={{padding:'12px 16px',borderRadius:12,border:'none',background:'linear-gradient(90deg,var(--accent),var(--primary))',color:'#042',fontWeight:700,cursor:'pointer'}}><i className="fas fa-paper-plane"></i> Send</button>
      </div>
    </div>
  );
}
