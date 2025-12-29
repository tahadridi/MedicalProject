// components/dashboard.tsx
'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { apiService } from '../../../lib/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, PieChart, Pie, Cell, Tooltip, BarChart, Bar } from 'recharts';
import VideoCallModal from '../../components/VideoCallModal'; 
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
} from './Analytics';

// ============================================================================
// INTERFACES
// ============================================================================

export interface Patient {
  _id: string;
  id: number;
  name: string;
  initials: string;
  age: number;
  status: 'stable' | 'critical' | 'review';
  lastSeen: string;
  tags: string[];
  avatar: string;
  risk: 'low' | 'medium' | 'high';
  lastBp: string;
  nextAppointment: string;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  medications?: any[];
  labResults?: any[];
  labOrder?: any[];
  vitalSigns?: any[];
  medicalHistory?: any[];
}

export interface AgendaItem {
  id: number;
  title: string;
  time: string;
  kind: 'video' | 'meeting' | 'in-person';
  duration: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ChatMessage {
  id: number;
  sender: 'patient' | 'doctor';
  message: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'file';
}

export interface Notification {
  id: string;
  type: 'critical' | 'appointment' | 'lab_result' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  patientId?: string;
  appointmentId?: string;
  relatedData?: any;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const generateNotificationsFromData = (patients: Patient[], appointments: any[]): Notification[] => {
  const notifications: Notification[] = [];
  const now = new Date();

  // 1. CRITICAL PATIENT ALERTS
  patients
    .filter(p => p.status === 'critical')
    .forEach(patient => {
      notifications.push({
        id: `critical-${patient._id}-${Date.now()}`,
        type: 'critical',
        title: 'Critical Patient Alert',
        message: `${patient.name} - ${patient.tags?.[0] || 'Condition'} • ${patient.lastBp || 'Needs attention'}`,
        timestamp: new Date().toISOString(),
        read: false,
        patientId: patient._id,
        relatedData: patient
      });
    });

  // 2. APPOINTMENT REMINDERS
  appointments.forEach(appointment => {
    try {
      const appointmentTime = new Date(appointment.start_time || appointment.time);
      const timeDiff = appointmentTime.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff > 0 && hoursDiff <= 2) {
        const patientName = appointment.patient_id?.name || appointment.title?.split(' - ')[0] || 'Patient';
        notifications.push({
          id: `appointment-${appointment._id || appointment.id}-${Date.now()}`,
          type: 'appointment',
          title: 'Upcoming Appointment',
          message: `${patientName} - ${appointmentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
          timestamp: new Date().toISOString(),
          read: false,
          appointmentId: appointment._id || appointment.id,
          relatedData: appointment
        });
      }
    } catch (error) {
      console.error('Error processing appointment for notification:', error);
    }
  });

  // 3. REVIEW PATIENTS
  patients
    .filter(p => p.status === 'review')
    .slice(0, 2)
    .forEach(patient => {
      notifications.push({
        id: `review-${patient._id}-${Date.now()}`,
        type: 'system',
        title: 'Patient Needs Review',
        message: `${patient.name} - Requires medical review`,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        patientId: patient._id,
        relatedData: patient
      });
    });

  // 4. HIGH RISK PATIENTS
  patients
    .filter(p => p.risk === 'high')
    .slice(0, 1)
    .forEach(patient => {
      notifications.push({
        id: `risk-${patient._id}-${Date.now()}`,
        type: 'system',
        title: 'High Risk Patient',
        message: `${patient.name} - Monitor closely`,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        patientId: patient._id,
        relatedData: patient
      });
    });

  // 5. SYSTEM SUMMARY
  const criticalPatients = patients.filter(p => p.status === 'critical');
  const reviewPatients = patients.filter(p => p.status === 'review');
  
  if (criticalPatients.length > 0 || reviewPatients.length > 0) {
    notifications.push({
      id: 'system-summary',
      type: 'system',
      title: 'Clinical Summary',
      message: `${criticalPatients.length} critical, ${reviewPatients.length} need review, ${appointments.length} appointments today`,
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  return notifications
    .filter(notification => notification !== null)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
};


export const chatMessages: ChatMessage[] = [];

// ============================================================================
// CALENDAR COMPONENT
// ============================================================================

export function CalendarView({ 
  appointments = [], 
  onAppointmentClick 
}: { 
  appointments: any[];
  onAppointmentClick: (appointment: any) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointmentsByDate, setAppointmentsByDate] = useState<Record<string, any[]>>({});

  // Group appointments by date
  useEffect(() => {
    const grouped: Record<string, any[]> = {};
    
    appointments.forEach(appointment => {
      try {
        const appointmentDate = new Date(appointment.scheduled_date);
        const dateKey = appointmentDate.toISOString().split('T')[0];
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(appointment);
      } catch (error) {
        console.error('Error processing appointment date:', error);
      }
    });
    
    setAppointmentsByDate(grouped);
  }, [appointments]);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    return { firstDayOfWeek, daysInMonth, year, month };
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const { firstDayOfWeek, daysInMonth, year, month } = getDaysInMonth(currentDate);
  
  // Create calendar grid
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-24 p-1 border border-slate-700/50 bg-slate-800/20"></div>);
  }
  
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAppointments = appointmentsByDate[dateKey] || [];
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
    
    calendarDays.push(
      <div 
        key={day}
        className={`h-24 p-1 border border-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-700/30 ${
          isToday ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-slate-800/30'
        }`}
      >
        <div className="flex justify-between items-start">
          <span className={`text-sm font-medium ${
            isToday ? 'text-cyan-400' : 'text-white'
          }`}>
            {day}
          </span>
          {dayAppointments.length > 0 && (
            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-1 rounded">
              {dayAppointments.length}
            </span>
          )}
        </div>
        
        {/* Appointments for this day */}
        <div className="mt-1 space-y-1 max-h-16 overflow-y-auto scrollbar-thin">
          {dayAppointments.slice(0, 3).map((appointment, index) => (
            <div 
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                onAppointmentClick(appointment);
              }}
              className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                appointment.priority === 'high' 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : appointment.priority === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}
            >
              <div className="flex items-center space-x-1">
                <i className={`fas ${
                  appointment.appointment_type === 'video' ? 'fa-video' :
                  appointment.appointment_type === 'in_person' ? 'fa-user-md' :
                  appointment.appointment_type === 'phone' ? 'fa-phone' :
                  'fa-calendar'
                } text-xs`}></i>
                <span className="truncate flex-1">
                  {appointment.start_time}
                </span>
              </div>
              <div className="truncate text-xs opacity-90">
                {appointment.patient_id?.name || 'Patient'}
              </div>
            </div>
          ))}
          {dayAppointments.length > 3 && (
            <div className="text-xs text-slate-400 text-center">
              +{dayAppointments.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="premium-card p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4 shadow-lg">
            <i className="far fa-calendar-alt text-white"></i>
          </div>
          <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            Schedule Calendar
          </span>
        </h3>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={goToToday}
            className="px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-semibold hover:bg-cyan-500/30 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center space-x-2">
            <button 
              onClick={goToPreviousMonth}
              className="w-8 h-8 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors flex items-center justify-center"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <h4 className="text-lg font-bold text-white min-w-48 text-center">
              {monthNames[month]} {year}
            </h4>
            <button 
              onClick={goToNextMonth}
              className="w-8 h-8 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors flex items-center justify-center"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-cyan-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <h5 className="text-sm font-semibold text-slate-400 mb-3">LEGEND</h5>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500/20 border border-blue-500/30 rounded"></div>
            <span className="text-xs text-slate-300">Normal Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500/20 border border-yellow-500/30 rounded"></div>
            <span className="text-xs text-slate-300">Medium Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500/20 border border-red-500/30 rounded"></div>
            <span className="text-xs text-slate-300">High Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyan-500/20 border border-cyan-500/30 rounded"></div>
            <span className="text-xs text-slate-300">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function Dashboard({ 
  onModalOpen, 
  onPatientCreated 
}: { 
  onModalOpen: (modal: string, patient?: Patient) => void;
  onPatientCreated?: (patient: Patient) => void;
}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoCallModalOpen, setVideoCallModalOpen] = useState(false);
  const [videoCallPatient, setVideoCallPatient] = useState<Patient | null>(null);
  // Load patients from database
  useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true);
        const data = await apiService.getPatients();
        setPatients(Array.isArray(data) ? data : data?.patients || []);
        setError(null);
      } catch (error) {
        console.error("❌ Dashboard: Error loading patients:", error);
        setError("Failed to load patients: " + (error as Error).message);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, []);

  const handlePatientSelect = (patient: Patient) => {
    setActivePatient(patient);
  };

  const handleCloseChat = () => {
    setActivePatient(null); 
  };

  const handleOpenModal = (modal: string) => {
    console.log('📝 Opening modal:', modal);
    onModalOpen(modal);
  };
  
const handleOpenVideoCall = (patient: Patient) => {
  setVideoCallPatient(patient);
  setVideoCallModalOpen(true);
};
  // Filter and sort patients
  const filteredAndSortedPatients = (patients || [])
    .filter(patient => {
      if (filter === 'all') return true;
      return patient.status === filter;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'recent':
        default:
          return b.id - a.id;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-clinical-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-clinical-midnight flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
          <p className="text-slate-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen bg-clinical-midnight flex flex-col">
      <Header 
        currentView={currentView} 
        onNavigation={setCurrentView}
        onOpenModal={handleOpenModal}
        patients={patients}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {currentView !== 'analytics' && (
        <LeftSidebar 
          onPatientSelect={handlePatientSelect}
          onOpenModal={handleOpenModal}
          activePatient={activePatient}
          patients={patients || []}
           onShowCriticalPatients={(criticalPatients) => {
          console.log('All critical patients:', criticalPatients);
          alert(`Showing all ${criticalPatients.length} critical patients:\n\n${
            criticalPatients.map(p => `• ${p.name} - ${p.tags[0]}`).join('\n')
          }`);  
        }}
        />
        )}

        <CentralWorkbench 
          currentView={currentView}
          onOpenModal={handleOpenModal}
          filter={filter}
          sort={sort}
          onFilterChange={setFilter}
          onSortChange={setSort}
          onPatientSelect={handlePatientSelect}
          patients={filteredAndSortedPatients}
          onVideoCall={handleOpenVideoCall}
        />
        {currentView !== 'analytics' && (
        <RightSidebar 
          activePatient={activePatient}
          onCloseChat={handleCloseChat}
          onOpenModal={handleOpenModal}
          patients={patients}
        />
         )}
         
      </div>
       {videoCallModalOpen && (
      <VideoCallModal
        isOpen={videoCallModalOpen}
        onClose={() => {
          setVideoCallModalOpen(false);
          setVideoCallPatient(null);
        }}
        patient={videoCallPatient}
        doctorName="Dr. Mohamed Trabelsi" // Or use your doctor name from doctorData
      />
    )}
    </div>
  );
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

export function Header({ 
  currentView, 
  onNavigation,
  onOpenModal,
  patients = []
}: { 
  currentView: string;
  onNavigation: (view: string) => void;
  onOpenModal: (modal: string) => void;
  patients?: Patient[];
}) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isProfileOpen, openProfile, closeProfile } = useDoctorProfile();
  const [appointments, setAppointments] = useState<any[]>([]);
  // ADD THESE STATES for real doctor data
  const [doctorData, setDoctorData] = useState<{
    name: string;
    title: string;
    avatar: string;
  }>({
    name: 'Dr. Evelyn Anderson',
    title: 'Chief Cardiologist',
    avatar: 'EA'
  });
  const [loadingDoctor, setLoadingDoctor] = useState(false);

 // In the Header component, update the fetchDoctorData function:

useEffect(() => {
  async function fetchDoctorData() {
    try {
      setLoadingDoctor(true);
      
      // OPTION 1: Check localStorage for stored login data
      const storedUserData = localStorage.getItem('doctorData');
      const storedToken = localStorage.getItem('token');
      
      if (storedUserData) {
        // Use stored data from login response
        const userData = JSON.parse(storedUserData);
        setDoctorData({
          name: userData.fullName || `Dr. ${userData.prenom} ${userData.nom}`,
          title: `${userData.specialite} Specialist`,
          avatar: userData.avatar || (userData.prenom?.charAt(0) || 'D') + (userData.nom?.charAt(0) || 'R')
        });
        setLoadingDoctor(false);
        return;
      }
      
      // OPTION 2: Fetch using existing /api/doctors/[id] endpoint
      if (!storedToken) {
        console.log('No token found in localStorage');
        setDoctorData({
          name: 'Dr. Evelyn Anderson',
          title: 'Chief Cardiologist',
          avatar: 'EA'
        });
        setLoadingDoctor(false);
        return;
      }

      try {
        // Decode token to get doctor ID
        const decoded = JSON.parse(atob(storedToken.split('.')[1]));
        const doctorId = decoded.id;
        
        if (!doctorId) {
          throw new Error('No doctor ID in token');
        }

        // Use your existing endpoint: /api/doctors/[id]
        const response = await fetch(`/api/doctors/${doctorId}`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const dbDoctor = data.data;
            setDoctorData({
              name: `Dr. ${dbDoctor.prenom} ${dbDoctor.nom}`,
              title: `${dbDoctor.specialite} Specialist`,
              avatar: (dbDoctor.prenom?.charAt(0) || 'D') + (dbDoctor.nom?.charAt(0) || 'R')
            });
            
            // Store in localStorage for future use
            localStorage.setItem('doctorData', JSON.stringify({
              ...dbDoctor,
              fullName: `Dr. ${dbDoctor.prenom} ${dbDoctor.nom}`,
              avatar: (dbDoctor.prenom?.charAt(0) || 'D') + (dbDoctor.nom?.charAt(0) || 'R')
            }));
          }
        } else {
          const errorData = await response.json();
          console.log('Failed to fetch doctor:', response.status, errorData);
          setDoctorData({
            name: 'Dr. Evelyn Anderson',
            title: 'Chief Cardiologist',
            avatar: 'EA'
          });
        }
      } catch (tokenError) {
        console.error('Token error:', tokenError);
        setDoctorData({
          name: 'Dr. Evelyn Anderson',
          title: 'Chief Cardiologist',
          avatar: 'EA'
        });
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      setDoctorData({
        name: 'Dr. Evelyn Anderson',
        title: 'Chief Cardiologist',
        avatar: 'EA'
      });
    } finally {
      setLoadingDoctor(false);
    }
  }

  fetchDoctorData();
}, []);
  // Load REAL data for notifications
  useEffect(() => {
    async function loadDataForNotifications() {
      try {
        const appointmentsData = await apiService.getTodayAppointments();
        setAppointments(appointmentsData || []);
      } catch (error) {
        console.error('Error loading real data for notifications:', error);
      }
    }
    
    loadDataForNotifications();
    const interval = setInterval(loadDataForNotifications, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate REAL notifications
  useEffect(() => {
    if (patients.length > 0 || appointments.length > 0) {
      const newNotifications = generateNotificationsFromData(patients, appointments);
      setNotifications(newNotifications);
      const unread = newNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    }
  }, [patients, appointments]);

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.patientId && notification.relatedData) {
      onOpenModal('patientDetails');
    } else if (notification.appointmentId) {
      onOpenModal('appointmentDetails');
    }
    
    setShowNotifications(false);
  };

  // Get notification styling
  const getNotificationStyle = (type: string, isRead: boolean) => {
    const baseStyles = "p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] ";
    
    switch (type) {
      case 'critical':
        return baseStyles + (isRead 
          ? "bg-red-900/30 border-red-600/30 opacity-70" 
          : "bg-red-900/50 border-red-500/50 shadow-lg shadow-red-500/20");
      case 'appointment':
        return baseStyles + (isRead 
          ? "bg-blue-900/30 border-blue-600/30 opacity-70" 
          : "bg-blue-900/50 border-blue-500/50 shadow-lg shadow-blue-500/20");
      case 'lab_result':
        return baseStyles + (isRead 
          ? "bg-cyan-900/30 border-cyan-600/30 opacity-70" 
          : "bg-cyan-900/50 border-cyan-500/50 shadow-lg shadow-cyan-500/20");
      case 'system':
        return baseStyles + (isRead 
          ? "bg-purple-900/30 border-purple-600/30 opacity-70" 
          : "bg-purple-900/50 border-purple-500/50 shadow-lg shadow-purple-500/20");
      default:
        return baseStyles + (isRead 
          ? "bg-slate-700/50 border-slate-600/30 opacity-70" 
          : "bg-slate-700/70 border-slate-500/50");
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical': return 'fa-heartbeat';
      case 'appointment': return 'fa-calendar-alt';
      case 'lab_result': return 'fa-vial';
      case 'system': return 'fa-info-circle';
      default: return 'fa-bell';
    }
  };

  // Get icon color
  const getIconColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-400';
      case 'appointment': return 'text-blue-400';
      case 'lab_result': return 'text-cyan-400';
      case 'system': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Time and date setup
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fa-chart-bar' },
    { key: 'patients', label: 'Patients', icon: 'fa-user-injured' },
    { key: 'schedule', label: 'Schedule', icon: 'fa-calendar-alt' },
    { key: 'analytics', label: 'Analytics', icon: 'fa-chart-line' },
    { key: 'messages', label: 'Messages', icon: 'fa-comments' },
  ];

  return (
    <header className="premium-glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
      <div className="px-8 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-clinical-teal to-clinical-blue flex items-center justify-center shadow-2xl shadow-cyan-500/20">
                <i className="fas fa-stethoscope text-white text-lg"></i>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full border-4 border-clinical-midnight shadow-lg"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-clinical-teal to-blue-400 bg-clip-text text-transparent">
                Nexus Clinical
              </h1>
              <p className="text-sm text-slate-300 font-light tracking-wide">Intelligent Care Platform</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-1 ml-8">
            {navigationItems.map((item) => (
              <button 
                key={item.key} 
                onClick={() => onNavigation(item.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                  currentView === item.key 
                    ? 'text-white bg-white/10' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <i className={`fas ${item.icon} mr-2`}></i>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-8">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 group relative"
            >
              <i className="fas fa-bell text-cyan-300 group-hover:text-cyan-200"></i>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-clinical-midnight animate-pulse flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 top-16 w-96 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-slate-600 bg-slate-700 rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-white text-lg">Notifications</h4>
                    {notifications.length > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="fas fa-bell-slash text-3xl text-slate-500 mb-3"></i>
                      <p className="text-slate-300 font-medium">No notifications</p>
                      <p className="text-slate-500 text-sm mt-1">Notifications will appear here automatically</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={getNotificationStyle(notification.type, notification.read)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                              <i className={`fas ${getNotificationIcon(notification.type)} text-sm`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white">{notification.title}</p>
                              <p className="text-xs text-slate-300 mt-1">{notification.message}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-slate-400">
                                  {formatRelativeTime(notification.timestamp)}
                                </span>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-slate-600 bg-slate-700 rounded-b-xl">
                    <button 
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigation('patients');
                      }}
                      className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 py-1 font-medium"
                    >
                      View All Patients ({patients.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Time & Date */}
          <div className="text-right cursor-pointer" onClick={() => onOpenModal('newAppointment')}>
            <p className="text-sm text-slate-400 font-light">Local Time</p>
            <p className="font-mono font-bold text-white text-lg">{time}</p>
            <p className="text-xs text-slate-400">{date}</p>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-4 relative">
            <div className="text-right cursor-pointer" onClick={() => onOpenModal('profilepage')}>
              <p className="font-semibold text-white">
                {loadingDoctor ? 'Loading...' : doctorData.name}
              </p>
              <p className="text-sm text-cyan-300 font-light">
                {loadingDoctor ? '...' : doctorData.title}
              </p>
            </div>
            <div className="relative group">
              <div 
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-clinical-teal to-cyan-400 flex items-center justify-center shadow-2xl shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => onOpenModal('profilepage')}
              >
                <span className="font-bold text-white text-lg">
                  {loadingDoctor ? 'DR' : doctorData.avatar}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full border-4 border-clinical-midnight shadow-lg"></div>
              <div className="absolute -inset-1 rounded-2xl bg-cyan-400/20 animate-ping opacity-75 group-hover:opacity-100"></div>
            </div>
          </div>
        </div>
      </div>
      
    </header>
  );
}
// ============================================================================
// LEFTSIDEBAR COMPONENT
// ============================================================================

export function LeftSidebar({ 
  onPatientSelect, 
  onOpenModal, 
  activePatient,
  patients = [],
  onShowCriticalPatients ,
  onVideoCall
}: { 
  onPatientSelect: (patient: Patient) => void; 
  onOpenModal: (modal: string) => void;
  activePatient: Patient | null;
  patients?: Patient[]; 
  onShowCriticalPatients?: (patients: Patient[]) => void;
  onVideoCall?: (patient: Patient) => void;
}) {
  const [activePatientId, setActivePatientId] = useState<string | null>(null);

  const handlePatientClick = (patient: Patient) => {
    setActivePatientId(patient._id);
    onPatientSelect(patient);
  };

  const quickActions = [
    { icon: 'fa-prescription-bottle-alt', label: 'New Rx', color: 'blue', modal: 'prescription' },
    { icon: 'fa-sticky-note', label: 'Add Note', color: 'emerald', modal: 'addNote' },
    { icon: 'fa-calendar-plus', label: 'Schedule', color: 'purple', modal: 'newAppointment' },
    { icon: 'fa-file-medical', label: 'Labs', color: 'cyan', modal: 'labOrder' },
      {
  icon: 'fa-video', 
  label: 'Video Call', 
  color: 'pink', 
  action: () => {
    const activePatient = patients?.find(p => p.status === 'critical' || p.status === 'review') || patients?.[0];
    if (activePatient && onVideoCall) {
      onVideoCall(activePatient);
    } else {
      alert('Please select a patient first');
    }
  }
},
    { icon: 'fa-robot', label: 'AI Assist', color: 'orange', modal: 'aiAssist' },
  ];

  return (
    <aside className="w-96 premium-glass border-r border-white/10 flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-6">
        {/* Active Now Header */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mr-3 shadow-lg">
              <i className="fas fa-wave-square text-white"></i>
            </div>
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Active Now
            </span>
          </h2>
          <p className="text-sm text-slate-400 font-light">
            {patients?.length || 0} patients in care
          </p>
        </div>

        {/* Active Consultations */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-cyan-300 mb-4 uppercase tracking-wider flex items-center">
            <i className="fas fa-comments mr-2"></i>
            Active Consultations
          </h3>
          <div className="space-y-4">
            {patients?.slice(0, 2).map((p) => (
              <div 
                key={p._id} 
                className={`premium-card p-5 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                  activePatient?._id === p._id ? 'ring-2 ring-cyan-400/50 bg-cyan-400/5' : ''
                }`}
                onClick={() => handlePatientClick(p)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <span className="text-lg">{p.avatar}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-clinical-midnight shadow-lg"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.tags[0]} • {p.lastSeen}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                      <span className="text-xs text-emerald-400 font-medium">Live</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Video call</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

       {/* Critical Alerts */}
<div className="mb-8">
  <h3 className="text-sm font-semibold text-red-400 mb-4 uppercase tracking-wider flex items-center">
    <i className="fas fa-heartbeat mr-2 animate-pulse"></i>
    Critical Alerts
  </h3>
  
  {(() => {
    const criticalPatients = patients?.filter(p => p.status === 'critical') || [];
    
    if (criticalPatients.length === 0) {
      return (
        <div className="premium-card p-3 text-center">
          <i className="fas fa-check-circle text-lg text-emerald-400 mb-1"></i>
          <p className="text-xs text-slate-400">No critical alerts</p>
        </div>
      );
    }

    const displayedPatients = criticalPatients.slice(0, 2);
    const remainingCount = criticalPatients.length - 2;

    return (
      <div className="space-y-2">
        {displayedPatients.map(patient => (
          <div 
            key={patient._id}
            className="premium-card p-3 border-l-2 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent animate-pulse-slow cursor-pointer hover:bg-red-500/10 transition-colors"
            onClick={() => handlePatientClick(patient)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-bold">CRITICAL</span>
                  <span className="text-xs text-slate-400 truncate">{patient.lastSeen}</span>
                </div>
                <p className="font-semibold text-white text-sm truncate">{patient.name}</p>
                <p className="text-xs text-slate-400 truncate">
                  {patient.tags[0]} • {patient.lastBp || 'Needs attention'}
                </p>
              </div>
              <i className="fas fa-chevron-right text-red-400 text-xs ml-2 flex-shrink-0"></i>
            </div>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div 
            className="premium-card p-3 border-l-2 border-l-red-400 bg-gradient-to-r from-red-400/5 to-transparent cursor-pointer hover:bg-red-400/10 transition-colors group"
            onClick={() => {
              console.log('View all critical patients:', criticalPatients);
              criticalPatients.forEach(patient => {
                console.log(`Critical: ${patient.name} - ${patient.tags[0]} - ${patient.lastBp}`);
              });
            }}
          >
            <div className="flex items-center justify-center space-x-2 text-red-400 group-hover:text-red-300">
              <i className="fas fa-ellipsis-h text-xs"></i>
              <span className="font-semibold text-xs">+{remainingCount} other{remainingCount > 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>
    );
  })()}
</div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-cyan-300 mb-4 uppercase tracking-wider">
            Quick Actions
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
  <button 
    key={action.label}
    onClick={() => {
      if (action.label === 'Video Call' && patients && patients.length > 0) {
        // Find an active patient or use the first one
        const activePatient = patients.find(p => p.status === 'critical' || p.status === 'review') || patients[0];
        if (activePatient) {
          // We need to pass this up to the parent component
          // For now, we'll trigger a modal and you can handle it in the parent
          onOpenModal('videoCall');
        } else {
          alert('Please select a patient first');
        }
      } else {
        onOpenModal(action.modal);
      }
    }}
                className="premium-card p-4 text-center group transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className={`w-12 h-12 rounded-2xl bg-${action.color}-500/20 flex items-center justify-center mx-auto mb-2 group-hover:bg-${action.color}-500/30 group-hover:scale-110 transition-all duration-300`}>
                  <i className={`fas ${action.icon} text-${action.color}-400 text-lg`}></i>
                </div>
                <p className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">{action.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ============================================================================
// PATIENTCARD COMPONENT
// ============================================================================

export function PatientCard({ p, onPatientSelect }: { p: Patient; onPatientSelect: (patient: Patient) => void }) {
  const statusClass = {
    critical: 'bg-red-400',
    review: 'bg-yellow-400', 
    stable: 'bg-emerald-400'
  }[p.status];

  return (
    <div 
      className="clinical-card p-4 cursor-pointer hover:bg-white/5 transition-all duration-300 rounded-xl"
      onClick={() => onPatientSelect(p)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="font-bold text-white text-sm">{p.initials}</span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${statusClass} rounded-full border-2 border-clinical-midnight`}></div>
          </div>
          <div>
            <p className="font-medium text-white">{p.name}</p>
            <p className="text-sm text-slate-400">{p.age}y • {p.tags.join(', ')}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Last seen {p.lastSeen}</p>
          <div className="flex space-x-1 mt-1 justify-end">
            {p.status === 'critical' && <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Critical</span>}
            {p.status === 'review' && <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Review</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CENTRAL WORKBENCH COMPONENT
// ============================================================================

export function CentralWorkbench({ 
  currentView, 
  onOpenModal, 
  filter, 
  sort, 
  onFilterChange, 
  onSortChange,
  onPatientSelect,
  patients = [],
  onAppointmentClick,
  activeChatPatient = null,
  appointments = [],
  loadingAppointments = false
}: { 
  currentView: string;
  onOpenModal: (modal: string) => void;
  filter: string;
  sort: string;
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
  onPatientSelect: (patient: Patient) => void;
  patients: Patient[];
  onAppointmentClick?: (appointment: any) => void;
  appointments?: any[];
  loadingAppointments?: boolean;
  activeChatPatient?: Patient | null;
}) {
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loadingTodayAppointments, setLoadingAppointments] = useState(false);
  const [allAppointments, setAllAppointments] = useState([]);
  const [patientsTab, setPatientsTab] = useState<'list' | 'chats' | 'dossiers'>('list');
  const [selectedPatientForChat, setSelectedPatientForChat] = useState<Patient | null>(null);

  // Load today's appointments
  useEffect(() => {
    async function loadTodayAppointments() {
      if (currentView === 'dashboard') {
        setLoadingAppointments(true);
        try {
          const appointments = await apiService.getTodayAppointments();
          setTodayAppointments(appointments);
        } catch (error) {
          console.error('Error loading today appointments:', error);
          setTodayAppointments([]);
        } finally {
          setLoadingAppointments(false);
        }
      }
    }
    loadTodayAppointments();
  }, [currentView]);

  // Load appointments for the current month when entering Schedule
  useEffect(() => {
    async function loadAllAppointments() {
      if (currentView !== "schedule") return;

      setLoadingAppointments(true);
      try {
        const data = await apiService.getAppointments();
        setAllAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading all appointments:", err);
        setAllAppointments([]);
      }
      setLoadingAppointments(false);
    }

    loadAllAppointments();
  }, [currentView]);

  // Handle patient selection for chat
  const handlePatientSelectForChat = (patient: Patient) => {
    setSelectedPatientForChat(patient);
    setPatientsTab('chats');
  };

  // Handle patient selection for dossier
  const handlePatientSelectForDossier = (patient: Patient) => {
    onPatientSelect(patient);
  };

  // PATIENTS VIEW - Tabbed Interface
  if (currentView === 'patients') {
  return (
    <main className="flex-1 p-8 overflow-y-auto scrollbar-thin">
      {/* Enhanced Patients Header with Tabs */}
      <div className="premium-card p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-4 shadow-lg">
              <i className="fas fa-user-injured text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Patient Management
              </h1>
              <p className="text-slate-400 mt-1">Manage patient records, communications, and medical history</p>
            </div>
          </div>
          <button 
            onClick={() => onOpenModal('newPatient')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> New Patient
          </button>
        </div>

        {/* Tab Navigation - Reorganized */}
        <div className="flex space-x-2 mb-8 border-b border-white/10 pb-4">
          <button
            onClick={() => setPatientsTab('list')}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center ${
              patientsTab === 'list'
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-b-2 border-purple-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fas fa-list mr-2"></i>
            Patient Directory
            <span className="ml-2 px-2 py-1 bg-white/10 rounded-full text-xs">
              {patients.length}
            </span>
          </button>
          
          <button
            onClick={() => setPatientsTab('dossiers')}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center ${
              patientsTab === 'dossiers'
                ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-white border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fas fa-file-medical mr-2"></i>
            Medical Records
          </button>
          
          <button
            onClick={() => setPatientsTab('chats')}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center ${
              patientsTab === 'chats'
                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fas fa-comments mr-2"></i>
            Messaging Hub
            <span className="ml-2 px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">
              {patients.filter(p => p.status === 'critical' || p.status === 'review').length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {patientsTab === 'list' ? (
            // PATIENT DIRECTORY VIEW
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-3">
                  <select 
                    value={filter}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="premium-card px-4 py-2 text-sm font-semibold text-slate-300 focus:outline-none rounded-lg"
                  >
                    <option value="all">All Patients</option>
                    <option value="critical">Critical</option>
                    <option value="review">Needs Review</option>
                    <option value="stable">Stable</option>
                  </select>
                  <select 
                    value={sort}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="premium-card px-4 py-2 text-sm font-semibold text-slate-300 focus:outline-none rounded-lg"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="status">Status</option>
                  </select>
                </div>
                <div className="text-sm text-slate-400">
                  {patients.length} patients • {patients.filter(p => p.status === 'critical').length} critical
                </div>
              </div>

              {/* Patient Grid with Action Buttons */}
              <div className="grid gap-4">
                {patients.length > 0 ? (
                  patients.map((p) => (
                    <div key={p._id} className="premium-card p-5 rounded-2xl hover:bg-white/5 transition-all duration-300">
                      <div className="grid grid-cols-4 gap-4 items-center">
                        {/* Patient Info */}
                        <div 
                          className="flex items-center space-x-4 cursor-pointer"
                          onClick={() => handlePatientSelectForDossier(p)}
                        >
                          <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                              <span className="font-bold text-white text-lg">{p.initials}</span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${
                              p.status === 'critical' ? 'bg-red-400' :
                              p.status === 'review' ? 'bg-yellow-400' : 
                              'bg-emerald-400'
                            } rounded-full border-3 border-clinical-midnight`}></div>
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg">{p.name}</p>
                            <p className="text-sm text-slate-400">{p.age}y • {p.tags.join(', ')}</p>
                            <p className="text-xs text-slate-500 mt-1">ID: {p.id} • Last seen: {p.lastSeen}</p>
                          </div>
                        </div>
                        
                        {/* Status & Health Info */}
                        <div className="text-center">
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                            p.status === 'critical' ? 'bg-red-500/20 text-red-400' :
                            p.status === 'review' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {p.status.toUpperCase()}
                          </div>
                          <p className="text-sm text-white">BP: {p.lastBp || 'N/A'}</p>
                          <p className="text-xs text-slate-400">Next: {p.nextAppointment || 'No appointment'}</p>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handlePatientSelectForChat(p)}
                            className="premium-card py-2 flex items-center justify-center text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-300 rounded-xl text-sm"
                          >
                            <i className="fas fa-comment-medical mr-2"></i>
                            Send Message
                          </button>
                          <button
                            onClick={() => onOpenModal('newAppointment')}
                            className="premium-card py-2 flex items-center justify-center text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all duration-300 rounded-xl text-sm"
                          >
                            <i className="fas fa-calendar-plus mr-2"></i>
                            Schedule
                          </button>
                        </div>
                        
                        {/* Medical Record Access */}
                        <div className="text-right">
                          <button
                            onClick={() => handlePatientSelectForDossier(p)}
                            className="premium-card px-4 py-3 flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-300 rounded-xl"
                          >
                            <i className="fas fa-file-medical-alt mr-2 text-lg"></i>
                            View Full Record
                          </button>
                          <p className="text-xs text-slate-400 mt-2">
                            Last updated: Today
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <i className="fas fa-user-injured text-6xl text-slate-600 mb-4"></i>
                    <p className="text-slate-400 text-lg">No patients found</p>
                    <button 
                      onClick={() => onOpenModal('newPatient')}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      <i className="fas fa-plus mr-2"></i> Add First Patient
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : patientsTab === 'dossiers' ? (

            
  // MEDICAL RECORDS VIEW - Organized
<div className="space-y-6">
  <div className="mb-6">
    <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center">
      <i className="fas fa-file-medical-alt mr-3"></i>
      Patient Medical Records
    </h3>
    <p className="text-slate-400">Complete medical history, lab results, prescriptions, and clinical notes</p>
  </div>

  {/* Medical Records Grid - FIXED */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {patients.map(patient => (
      <div
        key={patient._id}
        onClick={() => handlePatientSelectForDossier(patient)}
        className="premium-card p-6 rounded-2xl cursor-pointer hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border border-emerald-500/10 flex flex-col h-full"
      >
        {/* Header - */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-white text-lg">{patient.initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white truncate">{patient.name}</p>
              <p className="text-sm text-slate-400 truncate">ID: {patient.id}</p>
            </div>
          </div>
          {/* Status Badge - FIXED: Removed whitespace-nowrap and added max-width */}
          <span className={`px-3 py-1 rounded-full text-xs font-bold max-w-24 truncate ml-2 flex-shrink-0 ${
            patient.status === 'critical' ? 'bg-red-500/20 text-red-400' :
            patient.status === 'review' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-emerald-500/20 text-emerald-400'
          }`}>
            {patient.status.toUpperCase()}
          </span>
        </div>
        
        {/* Medical Summary - FIXED: Better alignment */}
        <div className="space-y-3 mb-4 flex-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Age</span>
            <span className="text-sm font-medium text-white">{patient.age} years</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Last Vital</span>
            <span className="text-sm font-medium text-white truncate max-w-[120px] ml-2">
              {patient.lastBp || 'Not recorded'}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-400 flex-shrink-0 mr-2">Conditions</span>
            <div className="flex flex-wrap justify-end gap-1 flex-1">
              {patient.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="inline-block bg-slate-700/50 px-2 py-1 rounded text-xs truncate max-w-[80px]">
                  {tag}
                </span>
              ))}
              {patient.tags.length > 3 && (
                <span className="text-xs text-slate-400 ml-1 self-center">
                  +{patient.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Last Visit</span>
            <span className="text-sm text-white truncate max-w-[100px]">{patient.lastSeen}</span>
          </div>
        </div>
        
        {/* Record Status */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center">
            <i className="fas fa-file-medical mr-2 text-emerald-400"></i>
            <span className="truncate">Complete Record</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-sync-alt mr-2 text-cyan-400"></i>
            <span>Today</span>
          </div>
        </div>
        
        {/* Action Button */}
        <button className="w-full py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 rounded-xl hover:from-emerald-500/30 hover:to-green-500/30 transition-all duration-300 flex items-center justify-center border border-emerald-500/20 hover:border-emerald-500/40">
          <i className="fas fa-folder-open mr-3"></i>
          Open Medical Record
        </button>
      </div>
    ))}
  </div>

  {/* Empty State */}
  {patients.length === 0 && (
    <div className="text-center py-12 premium-card rounded-2xl">
      <i className="fas fa-file-medical-alt text-6xl text-slate-600 mb-4"></i>
      <p className="text-slate-400 text-lg">No medical records available</p>
      <p className="text-slate-500 text-sm mt-2">Add patients to start creating medical records</p>
      <button 
        onClick={() => onOpenModal('newPatient')}
        className="mt-4 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
      >
        <i className="fas fa-plus mr-2"></i> Add First Patient
      </button>
    </div>
  )}
</div>
) : (
  // MESSAGING HUB VIEW
  <div className="h-[600px] flex flex-col">
    <div className="premium-card p-6 rounded-2xl flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-cyan-400 flex items-center">
          <i className="fas fa-comments mr-3"></i>
          Patient Messaging
        </h3>
        <div className="text-sm text-slate-400">
          {patients.length} patients • Finished-to-end encrypted
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="col-span-1 premium-card p-4 rounded-2xl overflow-y-auto">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full premium-card px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          
          <div className="space-y-3">
            {patients.map(patient => (
              <div
                key={patient._id}
                onClick={() => handlePatientSelectForChat(patient)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedPatientForChat?._id === patient._id
                    ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-400/30'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="font-bold text-white text-sm">{patient.initials}</span>
                    </div>
                    {patient.status === 'critical' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-clinical-midnight animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{patient.name}</p>
                    <p className="text-xs text-slate-400 truncate">{patient.tags[0]}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">{patient.lastSeen}</span>
                      {patient.status === 'critical' && (
                        <span className="text-xs text-red-400">URGENT</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
                  {/* Chat Interface */}
                  <div className="col-span-2 flex flex-col">
                    {selectedPatientForChat ? (
                      <>
                        <div className="premium-card p-6 rounded-2xl mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="font-bold text-white text-lg">{selectedPatientForChat.initials}</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white">{selectedPatientForChat.name}</h3>
                                <p className="text-slate-400">{selectedPatientForChat.age}y • {selectedPatientForChat.tags[0]}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => onOpenModal('videoCall')}
                                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg"
                              >
                                <i className="fas fa-video mr-2"></i>
                                Video Call
                              </button>
                              <button
                                onClick={() => onOpenModal('newAppointment')}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg"
                              >
                                <i className="fas fa-calendar-plus mr-2"></i>
                                Schedule
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mini Chat Preview */}
                        <div className="premium-card p-6 rounded-2xl flex-1 flex flex-col">
                          <div className="text-center py-8">
                            <i className="fas fa-comment-medical text-4xl text-cyan-400 mb-4"></i>
                            <h4 className="text-lg font-bold text-white mb-2">Chat with {selectedPatientForChat.name}</h4>
                            <p className="text-slate-400 mb-4">Continue your conversation in the Live Chat panel</p>
                            <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
                              <span><i className="fas fa-shield-alt mr-1"></i> Secure</span>
                              <span>•</span>
                              <span><i className="fas fa-history mr-1"></i> Full history available</span>
                              <span>•</span>
                              <span><i className="fas fa-paperclip mr-1"></i> Attach files</span>
                            </div>
                          </div>
                          
                          {/* Quick Message Options */}
                          <div className="mt-auto">
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              {[
                                "How are you feeling today?",
                                "Any side effects from medication?",
                                "Please share your latest vitals"
                              ].map((msg, idx) => (
                                <button
                                  key={idx}
                                  className="premium-card p-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-left"
                                >
                                  "{msg}"
                                </button>
                              ))}
                            </div>
                            
                            <div className="text-center text-xs text-slate-500">
                              <i className="fas fa-info-circle mr-1"></i>
                              Open the Live Chat panel in the right sidebar for full messaging
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="premium-card p-8 rounded-2xl flex items-center justify-center h-full">
                        <div className="text-center">
                          <i className="fas fa-comments text-6xl text-slate-600 mb-6"></i>
                          <h4 className="text-xl font-bold text-white mb-3">Patient Messaging Hub</h4>
                          <p className="text-slate-400 mb-6 max-w-md mx-auto">
                            Select a patient from the list to start a conversation. 
                            All messages are securely encrypted and logged in the patient's record.
                          </p>
                          <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
                            <span><i className="fas fa-lock mr-1"></i> HIPAA compliant</span>
                            <span>•</span>
                            <span><i className="fas fa-bell mr-1"></i> Real-time notifications</span>
                            <span>•</span>
                            <span><i className="fas fa-file-medical mr-1"></i> Clinical context</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
  if (currentView === 'schedule') {
    return (
      <main className="flex-1 p-0">
        <div className="h-full overflow-y-auto p-8 scrollbar-thin">
          <CalendarView
            appointments={allAppointments}
            onAppointmentClick={onAppointmentClick}
          />
        </div>
      </main>
    );
  }

  if (currentView !== 'dashboard') {
    return (
      <main className="flex-1 p-8 overflow-y-auto scrollbar-thin">
        <div className="premium-card p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 capitalize">{currentView} View</h2>
          <p className="text-slate-400">This is the {currentView} section. Content would be loaded based on the selected view.</p>
          <button 
            onClick={() => onOpenModal(currentView === 'patients' ? 'newPatient' : 'newAppointment')}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Add New {currentView === 'patients' ? 'Patient' : 'Appointment'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto scrollbar-thin">
      {/* Welcome & Stats Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
              Welcome back, Mohamed Trabelsi
            </h1>
            <p className="text-slate-400 mt-2">Here's your clinical overview for today</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="premium-card px-6 py-3 text-center cursor-pointer hover:scale-105 transition-transform">
              <p className="text-2xl font-bold text-cyan-400">{patients?.length || 0}</p> 
              <p className="text-sm text-slate-400">Total Patients</p>
            </div>
            <div className="premium-card px-6 py-3 text-center cursor-pointer hover:scale-105 transition-transform">
              <p className="text-2xl font-bold text-emerald-400">{todayAppointments.length}</p>
              <p className="text-sm text-slate-400">Today's Appointments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Agenda & Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Enhanced Agenda with Real Appointments */}
        <div className="premium-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4 shadow-lg">
                <i className="far fa-calendar-alt text-white"></i>
              </div>
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Today's Schedule
              </span>
            </h3>
            <button 
              onClick={() => onOpenModal('newAppointment')}
              className="text-sm text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full hover:bg-cyan-500/20 transition-colors"
            >
              <i className="fas fa-plus mr-1"></i> Add
            </button>
          </div>
          
          {loadingAppointments ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading appointments...</p>
            </div>
          ) : todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div 
                  key={appointment._id} 
                  className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-white/10 hover:border-cyan-400/30 transition-all duration-300 group hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      appointment.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      appointment.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {appointment.appointment_type === 'video' ? <i className="fas fa-video"></i> : 
                       appointment.appointment_type === 'meeting' ? <i className="fas fa-users"></i> : 
                       <i className="fas fa-user-md"></i>}
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {appointment.title || `Appointment with ${appointment.patient_id?.name || 'Patient'}`}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-slate-400">
                          {appointment.start_time} - {appointment.end_time}
                        </p>
                        <p className="text-sm text-slate-400">•</p>
                        <p className="text-sm text-slate-400">{appointment.duration_minutes} min</p>
                        <span className={`px-2 py-1 rounded-lg text-xs ${
                          appointment.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          appointment.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {appointment.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>
                      {appointment.patient_id && (
                        <p className="text-sm text-cyan-400 mt-1">
                          {appointment.patient_id.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <i className="far fa-clock text-blue-400 group-hover:scale-110 transition-transform"></i>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="fas fa-calendar-day text-4xl text-slate-600 mb-4"></i>
              <p className="text-slate-400 text-lg">No appointments scheduled for today</p>
              <p className="text-slate-500 text-sm mt-2">Schedule your first appointment to get started</p>
              <button 
                onClick={() => onOpenModal('newAppointment')}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <i className="fas fa-plus mr-2"></i> Schedule Appointment
              </button>
            </div>
          )}
        </div>

        {/* Analytics Dashboard Section */}
        <div className="premium-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mr-4 shadow-lg">
                <i className="fas fa-chart-line text-white"></i>
              </div>
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Performance Analytics
              </span>
            </h3>
            <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-semibold">
              +12% vs last week
            </span>
          </div>
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {[
              { label: 'Consultation Efficiency', value: '87%', color: 'cyan', trend: 'up' },
              { label: 'Avg Response Time', value: '8m 24s', color: 'blue', trend: 'down' },
              { label: 'Documentation', value: '92%', color: 'emerald', trend: 'up' },
              { label: 'Patient Satisfaction', value: '94%', color: 'purple', trend: 'stable' },
            ].map((metric) => (
              <div key={metric.label} className="text-center cursor-pointer hover:scale-105 transition-transform">
                <p className="text-3xl font-bold text-white">{metric.value}</p>
                <p className="text-sm text-slate-400 mt-1">{metric.label}</p>
                <div className="flex items-center justify-center mt-2">
                  <i className={`fas fa-arrow-${metric.trend} text-${metric.color}-400 mr-1`}></i>
                  <span className={`text-xs text-${metric.color}-400`}>
                    {metric.trend === 'up' ? 'Improving' : metric.trend === 'down' ? 'Faster' : 'Stable'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Trend Chart */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-400 mb-4">Weekly Patient Trend</h4>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={defaultMetrics.weeklyTrend}>
                <defs>
                  <linearGradient id="patientTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2EC4B6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2EC4B6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="patients" stroke="#2EC4B6" fill="url(#patientTrend)" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      

      {/* Enhanced Patient Roster */}
      <div className="premium-card p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-4 shadow-lg">
              <i className="fas fa-user-injured text-white"></i>
            </div>
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Patient Roster
            </span>
          </h3>
          <div className="flex space-x-3">
            <select 
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="premium-card px-4 py-2 text-sm font-semibold text-slate-300 focus:outline-none"
            >
              <option value="all">All Patients</option>
              <option value="critical">Critical</option>
              <option value="review">Needs Review</option>
              <option value="stable">Stable</option>
            </select>
            <select 
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="premium-card px-4 py-2 text-sm font-semibold text-slate-300 focus:outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
            </select>
            <button 
              onClick={() => onOpenModal('newPatient')}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center"
            >
              <i className="fas fa-plus mr-2"></i> New Patient
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {patients.length > 0 ? (
            patients.map((p) => (
              <PatientCard key={p._id} p={p} onPatientSelect={onPatientSelect} />
            ))
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-user-injured text-6xl text-slate-600 mb-4"></i>
              <p className="text-slate-400 text-lg">No patients found</p>
              <p className="text-slate-500 text-sm mt-2">Add your first patient to get started</p>
              <button 
                onClick={() => onOpenModal('newPatient')}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <i className="fas fa-plus mr-2"></i> Add First Patient
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ============================================================================
// CHAT PANEL COMPONENT
// ============================================================================


// ============================================================================
// CHAT PANEL COMPONENT - UPDATED WITH WORKING LOGIC
// ============================================================================

export function ChatPanel({ patient, onClose, onOpenModal }: { patient: Patient | null; onClose: () => void; onOpenModal: (modal: string) => void }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Helper function to generate roomId (same as in MedecinChatPage)
  const generateRoomId = (id1: string, id2: string) => {
    return [id1, id2].sort().join('_');
  };

  // Get current user from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(atob(base64));
        setCurrentUser({ id: decoded.id, username: decoded.username });
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  // Load real messages when patient changes
  const loadMessages = useCallback(async () => {
    if (!patient || !currentUser) return;

    try {
      const token = localStorage.getItem('token');
      const roomId = generateRoomId(currentUser.id, patient._id);
      
      console.log('Loading messages with roomId:', roomId);
      
      const response = await fetch(`/api/messages?roomId=${roomId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else if (response.status === 401) {
        console.error('Token expired or invalid');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [patient, currentUser]);

  useEffect(() => {
    if (!patient || !currentUser) return;

    // Initial load
    loadMessages();

    // Set up polling for new messages (every 3 seconds)
    const interval = setInterval(loadMessages, 3000);
    setPollingInterval(interval);

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [patient, currentUser, loadMessages]);

  // Handle sending real message (same pattern as MedecinChatPage)
  const handleSendMessage = async () => {
  if (!message.trim() || !patient || !currentUser) return;

  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    const roomId = generateRoomId(currentUser.id, patient._id);
    
    console.log('Sending message:', {
      content: message,
      roomId: roomId,
      receiverId: patient._id
    });
    
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: message,
        roomId: roomId,
        receiverId: patient._id  // API expects receiverId
      }),
    });

    console.log('Send response status:', response.status);
    
    if (response.ok) {
      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Force reload messages to ensure sync
      setTimeout(() => loadMessages(), 500);
    } else {
      const errorText = await response.text();
      console.error('Error sending message:', errorText);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    setLoading(false);
  }
};

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!patient || !currentUser) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-slate-400">
        <i className="fas fa-comments text-6xl mb-4 opacity-50"></i>
        <p className="text-lg">Select a patient to start chatting</p>
        <p className="text-sm mt-2">Click on an active consultation to begin</p>
      </div>
    );
  }

  // Helper function to get sender display name
  const getSenderName = (sender: any) => {
    if (sender._id === currentUser.id) {
      return 'You';
    }
    // For patients, show their name from the patient object
    if (patient._id === sender._id) {
      return patient.name;
    }
    // Otherwise try to get name from sender data
    if (sender.nom && sender.prenom) {
      return `${sender.prenom} ${sender.nom}`;
    }
    return sender.username || 'User';
  };

  // Helper to get initials
  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : "PT";

  return (
    <div className="flex flex-col h-full"> 
      {/* Enhanced Chat Header */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/5 to-purple-500/5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="font-bold text-white text-lg">{patient.initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-4 border-clinical-midnight shadow-lg"></div>
            </div>
            <div>
              <p className="font-bold text-white text-lg">{patient.name}</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-emerald-400 flex items-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                  Online
                </span>
                <span className="text-sm text-slate-400">{patient.age}y • {patient.tags[0]}</span>
                <span className="text-sm text-slate-400">BP: {patient.lastBp}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => onOpenModal('videoCall')}
              className="premium-card w-12 h-12 flex items-center justify-center text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-300 rounded-2xl"
            >
              <i className="fas fa-phone"></i>
            </button>
            <button 
              onClick={() => onOpenModal('videoCall')}
              className="premium-card w-12 h-12 flex items-center justify-center text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-all duration-300 rounded-2xl"
            >
              <i className="fas fa-video"></i>
            </button>
            <button 
              onClick={onClose}
              className="premium-card w-12 h-12 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 rounded-2xl"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Chat Messages */}
      <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-thin">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-comment-dots text-4xl text-slate-600 mb-4"></i>
            <p className="text-slate-400">No messages yet</p>
            <p className="text-slate-500 text-sm mt-2">Start a conversation with {patient.name}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender._id === currentUser.id;
            const senderName = getSenderName(msg.sender);
            
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-3 max-w-md ${
                  isMe ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    isMe 
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/25' 
                      : 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25'
                  }`}>
                    {isMe ? (
                      <i className="fas fa-user-md text-white text-sm"></i>
                    ) : (
                      <span className="font-bold text-white text-xs">{getInitials(senderName)}</span>
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`relative rounded-3xl p-4 ${
                    isMe
                      ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-br-md'
                      : 'bg-white/10 border border-white/20 rounded-bl-md'
                  }`}>
                    <div className="mb-1">
                      <span className="text-xs font-semibold text-slate-300">
                        {senderName}
                      </span>
                    </div>
                    <p className="text-white">{msg.content}</p>
                    <div className={`flex items-center justify-between mt-2 ${
                      isMe ? 'flex-row-reverse' : ''
                    }`}>
                      <p className="text-xs text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    
                    {/* Message Tail */}
                    <div className={`absolute top-0 w-4 h-4 ${
                      isMe 
                        ? '-right-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-r border-cyan-500/30 border-t border-cyan-500/30 transform rotate-45' 
                        : '-left-2 bg-white/10 border-l border-white/20 border-t border-white/20 transform rotate-45'
                    }`}></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Enhanced Chat Input */}
      <div className="p-6 border-t border-white/10 bg-clinical-midnight/80 flex-shrink-0">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="w-full premium-card px-6 py-4 pr-24 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all duration-300 disabled:opacity-50"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex space-x-2">
              <button 
                onClick={() => {
                  // You can implement file attachment later
                  console.log('Attach file');
                }}
                className="text-slate-400 hover:text-cyan-400 transition-colors duration-200 p-2 rounded-xl hover:bg-white/5"
              >
                <i className="fas fa-paperclip"></i>
              </button>
            </div>
          </div>
          <button 
            onClick={handleSendMessage}
            disabled={!message.trim() || loading}
            className="premium-card w-14 h-14 flex items-center justify-center text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-2xl disabled:hover:transform-none hover:scale-105"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane text-lg"></i>
            )}
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            {[
              { icon: 'fa-file-medical', label: 'Lab Results', color: 'emerald', modal: 'labOrder' },
              { icon: 'fa-calendar-check', label: 'Schedule', color: 'purple', modal: 'newAppointment' }
            ].map((action) => (
              <button 
                key={action.label} 
                onClick={() => onOpenModal(action.modal)}
                className="premium-card px-3 py-2 text-xs text-slate-400 hover:text-white transition-all duration-300 rounded-xl flex items-center"
              >
                <i className={`fas ${action.icon} text-${action.color}-400 mr-2`}></i>
                {action.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500 flex items-center">
            <i className="fas fa-sync-alt mr-1 animate-spin"></i>
            Auto-refresh
          </span>
        </div>
      </div>
    </div>
  );
}
// ============================================================================
// RIGHTSIDEBAR COMPONENT
// ============================================================================

export function RightSidebar({ 
  activePatient, 
  onCloseChat, 
  onOpenModal, 
  patients 
}: { 
  activePatient: Patient | null; 
  onCloseChat: () => void; 
  onOpenModal: (modal: string) => void; 
  patients?: Patient[]; 
}) {
  const [tab, setTab] = useState<'insights' | 'chat'>('insights');
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(384);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const safePatients = patients || [];

  // Auto-switch to chat tab when a patient is selected
  useEffect(() => {
    if (activePatient) {
      setTab('chat');
    }
  }, [activePatient]);

  // Handle resize mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.max(320, Math.min(640, newWidth));
      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const conditionCounts = (patients ?? []).reduce((acc, p) => {
    p.tags?.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const realConditions = Object.entries(conditionCounts || {})
    .map(([name, count]) => ({
      name,
      count,
      trend: 'stable',
      change: 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <aside 
      ref={sidebarRef}
      className="premium-glass border-l border-white/10 flex flex-col h-full relative"
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* Resize handle */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-2 -ml-1 cursor-col-resize z-10 hover:bg-cyan-500/50 active:bg-cyan-500/70 transition-colors"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-16 bg-cyan-400/30 rounded-full"></div>
      </div>

      {/* Enhanced Tabs */}
      <div className="flex border-b border-white/10 flex-shrink-0">
        <button 
          onClick={() => setTab('insights')} 
          className={`flex-1 py-5 text-center text-sm font-semibold transition-all duration-300 ${
            tab === 'insights' 
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <i className="fas fa-chart-network mr-2"></i>Clinical Insights
        </button>
        <button 
          onClick={() => setTab('chat')} 
          className={`flex-1 py-5 text-center text-sm font-semibold transition-all duration-300 ${
            tab === 'chat' 
              ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-400/5' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <i className="fas fa-comments mr-2"></i>Live Chat
        </button>
        
        {/* Close button for mobile/compact view */}
        <button
          onClick={onCloseChat}
          className="px-4 text-slate-400 hover:text-white transition-colors md:hidden"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        {tab === 'insights' ? (
          <div className="h-full overflow-y-auto scrollbar-thin p-6 space-y-6">
            {/* Use the new analytics components */}
            <ConditionsOverview conditions={realConditions} />
            <ConditionsDistribution conditions={realConditions} />
            <MonthlyAdmissions data={defaultMetrics.monthlyAdmissions} />
            <AgeDistribution patients={safePatients} />
            
            {/* AI Co-Pilot */}
            <div className="premium-card p-6">
              <h4 className="text-lg font-bold mb-4 flex items-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mr-3 shadow-lg">
                  <i className="fas fa-robot text-white"></i>
                </div>
                <span className="bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent">
                  AI Clinical Assistant
                </span>
              </h4>
              <p className="text-sm text-slate-400 mb-4">Real-time clinical insights and recommendations</p>
              <div className="space-y-4">
                <div 
                  className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl border border-cyan-500/20 cursor-pointer hover:border-cyan-500/40 transition-colors"
                  onClick={() => onOpenModal('labOrder')}
                >
                  <p className="font-semibold text-white flex items-center">
                    <i className="fas fa-vial mr-3 text-cyan-400"></i>
                    Consider Comprehensive Metabolic Panel
                  </p>
                  <p className="text-sm text-slate-400 mt-2">Sarah Chen's last panel was 6 months ago. Recommended for routine monitoring.</p>
                  <button className="mt-3 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-semibold hover:bg-cyan-500/30 transition-colors">
                    Order Tests
                  </button>
                </div>
                <div 
                  className="p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl border border-emerald-500/20 cursor-pointer hover:border-emerald-500/40 transition-colors"
                  onClick={() => onOpenModal('prescription')}
                >
                  <p className="font-semibold text-white flex items-center">
                    <i className="fas fa-prescription mr-3 text-emerald-400"></i>
                    Medication Adjustment Suggested
                  </p>
                  <p className="text-sm text-slate-400 mt-2">James Wilson may benefit from diuretic dosage review based on trending vitals.</p>
                  <button className="mt-3 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition-colors">
                    Review Rx
                  </button>
                </div>
              </div>
              <button 
                onClick={() => onOpenModal('aiAssist')}
                className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 rounded-xl font-semibold hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300 flex items-center justify-center border border-cyan-500/30"
              >
                <i className="fas fa-microphone mr-3"></i>
                Voice Command
              </button>
            </div>
          </div>
        ) : (
          <ChatPanel patient={activePatient} onClose={onCloseChat} onOpenModal={onOpenModal} />
        )}
      </div>
      
      {/* Width indicator */}
      {isResizing && (
        <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 bg-slate-800/90 text-white text-xs px-2 py-1 rounded-lg border border-cyan-500/50">
          {Math.round(sidebarWidth)}px
        </div>
      )}
    </aside>
  );
}