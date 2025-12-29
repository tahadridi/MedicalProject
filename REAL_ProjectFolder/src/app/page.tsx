"use client";

import Features from "./components/Features";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Testimonials from "./components/Testimonials";


export default function Home() {
  return (
    <div className="min-h-screen bg-clinical-midnight">
      <Header />
      
      <main className="overflow-hidden">
        <Hero />
        <Features />
        <Testimonials />
      </main>
      
      
    </div>
  );
}