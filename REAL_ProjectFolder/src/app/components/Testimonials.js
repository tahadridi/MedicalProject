"use client";
import React from "react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Dr. Martin Dubois",
      role: "Cardiologue",
      content: "Cette plateforme a révolutionné ma pratique médicale. La gestion des patients est fluide et le diagnostic IA est un outil précieux.",
      avatar: "👨‍⚕️",
      rating: 5
    },
    {
      name: "Sophie Lambert",
      role: "Patient",
      content: "Suivre mes traitements n'a jamais été aussi simple. Les rappels m'aident beaucoup et le chat médical est disponible quand j'en ai besoin.",
      avatar: "👩",
      rating: 5
    },
    {
      name: "Dr. Amélie Chen",
      role: "Généraliste",
      content: "L'interface est intuitive et sécurisée. Mes patients apprécient particulièrement le suivi continu entre les consultations.",
      avatar: "👩‍⚕️",
      rating: 5
    }
  ];

  return (
    <section className="py-20 px-6 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-6">
            <i className="fas fa-heart text-purple-400 mr-2"></i>
            <span className="text-sm text-purple-300">Témoignages</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Ce que disent nos
            <span className="block bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Utilisateurs
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-8 hover:border-purple-500/30 transition-all duration-300">
                {/* Rating */}
                <div className="flex mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <i key={i} className="fas fa-star text-yellow-400 mr-1"></i>
                  ))}
                </div>
                
                {/* Content */}
                <p className="text-slate-300 text-lg italic mb-8 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                {/* Author */}
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}