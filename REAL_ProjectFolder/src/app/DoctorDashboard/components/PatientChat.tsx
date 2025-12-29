// components/PatientMessenger.tsx
'use client';

import { useState } from 'react';
import { Patient } from './dashboard';

interface PatientMessengerProps {
  patients: Patient[];
  onPatientSelect?: (patient: Patient) => void;
  onClose?: () => void;
  onOpenModal?: (modal: string) => void;
}

export default function PatientMessenger({
  patients,
  onPatientSelect,
  onClose,
  onOpenModal
}: PatientMessengerProps) {
  const [activeView, setActiveView] = useState<'list' | 'chat'>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter patients based on search
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveView('chat');
    onPatientSelect?.(patient);
  };

  // Group patients by status
  const criticalPatients = filteredPatients.filter(p => p.status === 'critical');
  const reviewPatients = filteredPatients.filter(p => p.status === 'review');
  const stablePatients = filteredPatients.filter(p => p.status === 'stable');

  return (
    <div className="flex flex-col h-full bg-clinical-midnight rounded-2xl overflow-hidden border border-white/10">
      {/* Header with Toggle */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <i className="fas fa-comments text-white"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Patient Messages</h3>
              <p className="text-xs text-slate-400">
                {activeView === 'list' 
                  ? `${filteredPatients.length} patients` 
                  : `Chatting with ${selectedPatient?.name}`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Toggle */}
            {selectedPatient && (
              <button
                onClick={() => setActiveView(prev => prev === 'list' ? 'chat' : 'list')}
                className="premium-card px-4 py-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors rounded-lg"
              >
                {activeView === 'list' ? (
                  <>
                    <i className="fas fa-comment mr-2"></i>
                    Back to Chat
                  </>
                ) : (
                  <>
                    <i className="fas fa-list mr-2"></i>
                    All Patients
                  </>
                )}
              </button>
            )}
            
            {onClose && (
              <button
                onClick={onClose}
                className="premium-card w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors rounded-xl"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {activeView === 'list' && (
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Search patients or conditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full premium-card pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'list' ? (
          <div className="h-full overflow-y-auto scrollbar-thin p-4">
            {/* Critical Patients Section */}
            {criticalPatients.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center">
                  <i className="fas fa-heartbeat mr-2 animate-pulse"></i>
                  Critical ({criticalPatients.length})
                </h4>
                <div className="space-y-2">
                  {criticalPatients.map(patient => (
                    <PatientListItem
                      key={patient._id}
                      patient={patient}
                      isCritical={true}
                      onClick={() => handlePatientSelect(patient)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Review Patients Section */}
            {reviewPatients.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  Needs Review ({reviewPatients.length})
                </h4>
                <div className="space-y-2">
                  {reviewPatients.map(patient => (
                    <PatientListItem
                      key={patient._id}
                      patient={patient}
                      isCritical={false}
                      onClick={() => handlePatientSelect(patient)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stable Patients Section */}
            {stablePatients.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center">
                  <i className="fas fa-check-circle mr-2"></i>
                  Stable ({stablePatients.length})
                </h4>
                <div className="space-y-2">
                  {stablePatients.map(patient => (
                    <PatientListItem
                      key={patient._id}
                      patient={patient}
                      isCritical={false}
                      onClick={() => handlePatientSelect(patient)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredPatients.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <i className="fas fa-user-injured text-4xl mb-4 opacity-50"></i>
                <p>No patients found</p>
                <p className="text-sm mt-2">Try a different search term</p>
              </div>
            )}
          </div>
        ) : (
          selectedPatient && (
            <ChatPanel 
              patient={selectedPatient}
              onClose={() => {
                setActiveView('list');
                setSelectedPatient(null);
              }}
              onOpenModal={onOpenModal}
            />
          )
        )}
      </div>
    </div>
  );
}

// Patient List Item Component
function PatientListItem({ 
  patient, 
  isCritical, 
  onClick 
}: { 
  patient: Patient; 
  isCritical: boolean; 
  onClick: () => void; 
}) {
  return (
    <div
      onClick={onClick}
      className="premium-card p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-all duration-300 group hover:scale-[1.02]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="font-bold text-white text-sm">{patient.initials}</span>
            </div>
            {isCritical && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-clinical-midnight animate-pulse"></div>
            )}
          </div>
          <div>
            <p className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
              {patient.name}
            </p>
            <p className="text-sm text-slate-400">
              {patient.age}y • {patient.tags[0]}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Last seen {patient.lastSeen}</p>
          <div className="flex items-center space-x-1 mt-1 justify-end">
            {isCritical && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold animate-pulse">
                Critical
              </span>
            )}
            {patient.status === 'review' && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                Review
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}