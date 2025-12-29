"use client";
import { useRouter } from "next/navigation";

export default function SimpleHeader() {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 bg-clinical-midnight/95 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => router.push('/')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <i className="fas fa-heartbeat text-white text-lg"></i>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Nexus Clinical
            </h1>
          </div>

          {/* Login Button */}
          <button 
            onClick={() => router.push('/login')}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Connexion
          </button>
        </div>
      </div>
    </nav>
  );
}