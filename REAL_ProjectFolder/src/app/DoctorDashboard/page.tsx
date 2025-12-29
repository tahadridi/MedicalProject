// app/doctor_dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Header, LeftSidebar, CentralWorkbench, RightSidebar, Patient } from './components/dashboard';
import NewPatientModal from './components/NewPatientModal';
import NewAppointmentModal from '../DoctorDashboard/components/NewAppointmentModal';
import PrescriptionModal from '../DoctorDashboard/components/PrescriptionModal';
import LabOrderModal from '../DoctorDashboard/components/LabOrderModal';
import AIAssistModal from '../DoctorDashboard/components/AIAssistModal';
import PatientDossierModal from '../DoctorDashboard/components/PatientDossierModal';
import DoctorNote from'../DoctorDashboard/components/DoctorNote';
import AppointmentDetailsModal from './components/AppointmentDetail';
import ProfilePage from './components/ProfilePage';
import ElegantNavbar from './components/Navbar';
import { apiService } from '../../lib/api';
import { 
  PerformanceMetrics,
  ConditionsOverview,
  ConditionsDistribution, 
  MonthlyAdmissions,
  AgeDistribution,
  generateConditionsFromPatients,
  defaultMetrics,
  type Metrics,
  type Condition,
  AnalyticsDashboard  
} from './components/Analytics';
export type NavigationState = {
  currentView: 'dashboard' | 'patients' | 'schedule' | 'analytics' | 'messages'|'profile';
  modal: 'newPatient' | 'newAppointment' | 'prescription' | 'labOrder' | 'aiAssist' | 'addNote' | 'videoCall' |'patientDossier'|'appointmentDetails'|'profilepage'| null;
  selectedPatient: Patient | null;
  selectedAppointment: any | null;
  filter: string;
  sort: string;
};

export default function DoctorDashboardPage() {
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [patients, setPatients] = useState<Patient[]>([]); 
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [navigation, setNavigation] = useState<NavigationState>({
    currentView: 'dashboard',
    modal: null,
    selectedPatient: null,
    selectedAppointment: null,
    filter: 'all',
    sort: 'recent'
  });
useEffect(() => {
  async function loadAppointments() {
    try {
      setLoadingAppointments(true);
      console.log('📅 Loading appointments for calendar...');
      const appointmentsData = await apiService.getAppointments();
      console.log('✅ Appointments loaded:', appointmentsData.length);
      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  }
  
  loadAppointments();
}, []);
  // ADD THIS: Fetch patients from database
  useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true);
        console.log('🔄 DoctorDashboard: Loading patients...');
        const data = await apiService.getPatients();
        console.log('✅ DoctorDashboard: Patients loaded:', data.length);
        setPatients(data || []);
      } catch (error) {
        console.error('❌ DoctorDashboard: Error loading patients:', error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, []);
  const [doctorData, setDoctorData] = useState<{
  name: string;
  role: string;
  initials: string;
} | null>(null);

// Add this useEffect to fetch doctor data
useEffect(() => {
  async function loadDoctorData() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Try to get from localStorage first
      const storedDoctorData = localStorage.getItem('doctorData');
      if (storedDoctorData) {
        const doctor = JSON.parse(storedDoctorData);
        setDoctorData({
          name: `Dr. ${doctor.prenom} ${doctor.nom}`,
          role: `${doctor.specialite} Specialist`,
          initials: (doctor.prenom?.charAt(0) || 'D') + (doctor.nom?.charAt(0) || 'R')
        });
        return;
      }
      
      // Fetch from API
      const response = await fetch('/api/doctors/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.doctor) {
          const doctor = data.doctor;
          setDoctorData({
            name: `Dr. ${doctor.prenom} ${doctor.nom}`,
            role: `${doctor.specialite} Specialist`,
            initials: (doctor.prenom?.charAt(0) || 'D') + (doctor.nom?.charAt(0) || 'R')
          });
        }
      }
    } catch (error) {
      console.error('Error loading doctor data:', error);
    }
  }
  
  loadDoctorData();
}, []);

  // ADD THIS: Filter and sort patients based on navigation state
  const filteredAndSortedPatients = React.useMemo(() => {
    if (!patients || patients.length === 0) return [];
    
    console.log('🔄 Filtering patients - Filter:', navigation.filter, 'Sort:', navigation.sort);
    
    // Filter patients
    const filtered = patients.filter(patient => {
      if (navigation.filter === 'all') return true;
      return patient.status === navigation.filter;
    });
    
    // Sort patients
    const sorted = filtered.sort((a, b) => {
      switch (navigation.sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'recent':
        default:
          return (b.id || b._id).toString().localeCompare((a.id || a._id).toString());
      }
    });
    
    console.log('✅ Filtered and sorted:', sorted.length, 'patients');
    return sorted;
  }, [patients, navigation.filter, navigation.sort]);

  const handlePatientSelectForChat = (patient: Patient) => {
    setActivePatient(patient);
  setNavigation(prev => ({ 
    ...prev, 
    selectedPatient: patient,
    currentView: 'patients' 
  }));
  };

  const handlePatientSelectForDossier = (patient: Patient) => {
    setActivePatient(patient);
    setNavigation(prev => ({ 
      ...prev, 
      selectedPatient: patient,
      modal: 'patientDossier'
    }));
  };

  const handleCloseChat = () => {
    setActivePatient(null);
  };

  const handleNavigation = (view: NavigationState['currentView']) => {
    setNavigation(prev => ({ ...prev, currentView: view }));
  };

  const openModal = (modal: NavigationState['modal'], data?: any) => {
    if (modal === 'appointmentDetails' && data) {
      setSelectedAppointment(data);
      setNavigation(prev => ({ ...prev, modal, selectedAppointment: data }));
    } else if (modal === 'newAppointment' && data) {
      setSelectedAppointment(data);
      setNavigation(prev => ({ ...prev, modal: 'appointmentDetails', selectedAppointment: data }));
    } else {
      setNavigation(prev => ({ ...prev, modal }));
    }
  };
  const handleNavItemClick = (key: string) => {
  const viewMap: Record<string, NavigationState['currentView']> = {
    dashboard: 'dashboard',
    patients: 'patients',
    schedule: 'schedule', 
    analytics: 'analytics',
    messages: 'messages',
    
  };
  
  const view = viewMap[key] || 'dashboard';
  handleNavigation(view);
};

  const closeModal = () => {
    setNavigation(prev => ({ ...prev, modal: null, selectedAppointment: null }));
    setSelectedAppointment(null);
  };

  const handleAppointmentClick = (appointment: any) => {
    openModal('appointmentDetails', appointment);
  };
const handleProfileClick = () => {
  openModal('profilepage');
};
const handleNotificationClick = () => {
  // You can implement notification logic here
  console.log('Notification clicked');
  // Or open a notifications modal:
  // openModal('notifications');
};

const handlePatientUpdate = (updatedPatient: Patient) => {
  setPatients(prev => prev.map(p => 
    p._id === updatedPatient._id ? updatedPatient : p
  ));
  
};


  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-clinical-midnight text-white items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading patients...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-clinical-midnight text-white overflow-hidden">
      <ElegantNavbar 
        onNavItemClick={handleNavItemClick}
        onProfileClick={handleProfileClick}
        onNotificationClick={handleNotificationClick}
        realDoctorData={doctorData}
      />
      <div className="flex flex-1 min-h-0">
        <LeftSidebar 
          onPatientSelect={handlePatientSelectForChat}
          onOpenModal={openModal}
          activePatient={activePatient}
          patients={patients} 
        />
        <div className="flex-1 flex min-h-0">
  {navigation.currentView === "analytics" ? (
    // FULL PAGE ANALYTICS
    <div className="flex-1 h-full overflow-auto">
      <AnalyticsDashboard
        metrics={defaultMetrics}
        conditions={generateConditionsFromPatients(patients)}
        patients={patients}
      />
    </div>
  ) : (
    <>
      <CentralWorkbench 
        currentView={navigation.currentView}
        onOpenModal={openModal}
        filter={navigation.filter}
        sort={navigation.sort}
        onFilterChange={(filter) => setNavigation(prev => ({ ...prev, filter }))}
        onSortChange={(sort) => setNavigation(prev => ({ ...prev, sort }))}
        onPatientSelect={handlePatientSelectForDossier}
        onAppointmentClick={handleAppointmentClick}
        patients={filteredAndSortedPatients}
         activeChatPatient={activePatient}
      />
      <RightSidebar 
        activePatient={activePatient} 
        onCloseChat={handleCloseChat}
        onOpenModal={openModal}
        patients={patients}
      />
    </>
  )}
</div>

      </div>
      
      {/* Modals */}
      {navigation.modal === 'newPatient' && (
        <NewPatientModal onClose={closeModal} />
      )}
      {navigation.modal === 'newAppointment' && (
        <NewAppointmentModal onClose={closeModal} />
      )}
      {navigation.modal === 'prescription' && (
        <PrescriptionModal onClose={closeModal} patient={activePatient} />
      )}
      {navigation.modal === 'labOrder' && (
        <LabOrderModal onClose={closeModal} patient={activePatient} />
      )}
      {navigation.modal === 'aiAssist' && (
        <AIAssistModal onClose={closeModal} />
      )}
      {navigation.modal === 'addNote' && (
        <DoctorNote onClose={closeModal} patient={activePatient} />
      )}
      {navigation.modal === 'videoCall' && (
        <VideoCallModal onClose={closeModal} patient={activePatient} />
      )}


      {navigation.modal === 'profilepage' && (
  <div className="fixed inset-0 z-50 backdrop-blur-sm">
    <div className="h-full flex flex-col">
      <ElegantNavbar 
        onNavItemClick={(key) => {
          // Close profile modal first, then navigate
          closeModal();
          // Small delay to ensure modal is closed before navigation
          setTimeout(() => handleNavItemClick(key), 100);
        }}
        onProfileClick={handleProfileClick}
        onNotificationClick={handleNotificationClick}
      />
      <div className="flex-1 overflow-auto">
        <ProfilePage onClose={closeModal} />
      </div>
    </div>
  </div>
)}

      {navigation.modal === 'patientDossier' && (
      <PatientDossierModal 
        onClose={closeModal} 
        patient={navigation.selectedPatient}
        onPatientUpdate={handlePatientUpdate}
  />
)}
      {navigation.modal === 'appointmentDetails' && (
        <AppointmentDetailsModal 
          onClose={closeModal} 
          appointment={navigation.selectedAppointment}
        />
      )}
    </div>
  );
}


function VideoCallModal({ onClose, patient }: { onClose: () => void; patient: Patient | null }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="premium-card p-6 w-96 bg-slate-800/95 border border-white/20">
        <h3 className="text-xl font-bold mb-4">Start Video Call</h3>
        <p className="mb-4 text-slate-300">Starting video call with {patient?.name || 'patient'}...</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600/80 text-gray-200 hover:bg-gray-500/80 transition-colors">
            Cancel
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-green-600/80 text-white hover:bg-green-500/80 transition-colors">
            Start Call
          </button>
        </div>
      </div>
    </div>
  );
}