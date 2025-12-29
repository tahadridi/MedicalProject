'use client';

import { useState } from 'react';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  color: 'cyan' | 'blue' | 'purple' | 'emerald' | 'yellow' | 'red';
  badge?: number;
  href?: string;
}

interface ElegantNavbarProps {
  user?: {
    name: string;
    role: string;
    initials: string;
  };
  onNavItemClick?: (key: string) => void;
  onProfileClick?: () => void;
  onNotificationClick?: () => void;
  realDoctorData?: {
    name: string;
    role: string;
    initials: string;
  };
}

export default function ElegantNavbar({
  user = {
    name: 'Dr. Evelyn Anderson',
    role: 'Chief Cardiologist',
    initials: 'EA'
  },
  onNavItemClick,
  onProfileClick,
  onNotificationClick,
  realDoctorData  
}: ElegantNavbarProps) {
  const [activeNav, setActiveNav] = useState('dashboard');
   const displayUser = realDoctorData || user;
  const navItems: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fa-home', color: 'cyan' },
    { key: 'analytics', label: 'Analytics', icon: 'fa-chart-bar', color: 'blue' },
    { key: 'patients', label: 'Patients', icon: 'fa-user-injured', color: 'purple' },
    { key: 'schedule', label: 'Schedule', icon: 'fa-calendar-alt', color: 'emerald' },
    { key: 'messages', label: 'Messages', icon: 'fa-envelope', color: 'yellow', badge: 3 }
  ];

  const handleNavClick = (key: string) => {
    setActiveNav(key);
    onNavItemClick?.(key);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      cyan: 'text-cyan-400',
      blue: 'text-blue-400',
      purple: 'text-purple-400',
      emerald: 'text-emerald-400',
      yellow: 'text-yellow-400',
      red: 'text-red-400'
    };
    return colors[color as keyof typeof colors] || 'text-cyan-400';
  };

  return (
    <nav className="nav-glass sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo Section */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <i className="fas fa-stethoscope text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Nexus Clinical
              </h1>
              <p className="text-xs text-slate-400 font-light">Intelligent Care Platform</p>
            </div>
          </div>

          {/* Centered Navigation - Rounded Elegant Design */}
          <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
            <div className="nav-glass rounded-2xl px-6 py-2 shadow-xl border border-white/10">
              <div className="flex items-center justify-between space-x-1">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleNavClick(item.key)}
                    className={`nav-item px-5 py-3 rounded-xl text-sm font-medium flex items-center space-x-2 transition-all duration-300 ${
                      activeNav === item.key
                        ? 'text-white active-nav bg-white/5'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <i className={`fas ${item.icon} ${getColorClasses(item.color)} text-sm`}></i>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button (hidden on desktop) */}
          <div className="lg:hidden flex-shrink-0">
            <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300">
              <i className="fas fa-bars text-cyan-300"></i>
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6 flex-shrink-0">

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={onNotificationClick}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 group"
              >
                <i className="fas fa-bell text-cyan-300 group-hover:text-cyan-200"></i>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full notification-dot border-2 border-clinical-midnight"></div>
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{displayUser.name}</p>
                <p className="text-xs text-cyan-300 font-light">{displayUser.role}</p>
              </div>
              <div className="relative group">
                <div 
                  onClick={onProfileClick}
                  className="user-avatar w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/20 cursor-pointer group-hover:scale-105 transition-transform duration-300"
                >
                  <span className="font-bold text-white text-lg">{displayUser.initials}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-clinical-midnight shadow-lg"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation (hidden on desktop) */}
        <div className="lg:hidden pb-4">
          <div className="nav-glass rounded-2xl p-2 shadow-xl border border-white/10">
            <div className="flex items-center justify-between space-x-1 overflow-x-auto">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`nav-item px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-1 transition-all duration-300 flex-shrink-0 ${
                    activeNav === item.key
                      ? 'text-white active-nav bg-white/5'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className={`fas ${item.icon} ${getColorClasses(item.color)}`}></i>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1 py-0.5 bg-red-500 text-white text-xs rounded-full min-w-[16px] text-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .nav-glass {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
        }
        
        .nav-item {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .nav-item::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #06b6d4, #3b82f6);
          transition: width 0.3s ease;
          border-radius: 2px;
        }
        
        .nav-item:hover::before {
          width: 80%;
        }
        
        .active-nav::before {
          width: 80%;
        }
        
        .notification-dot {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .user-avatar {
          background: linear-gradient(135deg, #8b5cf6, #06b6d4, #3b82f6);
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </nav>
  );
}