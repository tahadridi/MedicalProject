'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Updated interface to match your database structure
interface PatientAppointment {
  _id: string;
  title: string;
  scheduled_date: string; // ISO string from database
  start_time: string;
  end_time: string;
  duration_minutes: number;
  appointment_type: 'video' | 'in_person' | 'phone';
  priority: 'high' | 'medium' | 'low';
  doctor_name: string;
  doctor_speciality: string;
  status: string;
}

interface PatientPrescription {
  _id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  doctor_name: string;
}

interface PatientLabResult {
  _id: string;
  test_name: string;
  result_date: string;
  result_value: string;
  normal_range: string;
  status: 'normal' | 'abnormal' | 'pending';
  doctor_notes?: string;
}

interface PatientData {
  _id: string;
  name: string;
  initials: string;
  age: number;
  status: string;
  lastSeen: string;
  tags: string[];
  avatar: string;
  risk: string;
  lastBp: string;
  nextAppointment: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  medications: any[];
  labResults: any[];
  vitalSigns: any[];
  medicalHistory: any[];
  labOrders: any[];
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: string;
  type: 'appointment' | 'prescription' | 'lab_result' | 'system' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  appointmentId?: string;
}

export default function PatientDashboard() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'appointments' | 'prescriptions' | 'labResults' | 'medicalHistory'>('dashboard');
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<PatientPrescription[]>([]);
  const [labResults, setLabResults] = useState<PatientLabResult[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<PatientAppointment[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

  // Function to fetch appointments for the current patient from API
 const fetchPatientAppointments = async (patientId: string) => {
  try {
    const storedToken = localStorage.getItem('token');
    
    if (!storedToken) {
      console.error('No token found');
      return [];
    }
    
    console.log('📋 Fetching appointments for patient ID:', patientId);
    
    // Try different API endpoints
    const endpoints = [
      `/api/appointments/patient/${patientId}`,
      `/api/DoctorSchedule/patient/${patientId}`,
      `/api/DoctorSchedule?patient_id=${patientId}`
    ];
    
    let appointmentsData: any[] = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log('🌐 Trying endpoint:', endpoint);
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Success from endpoint:', endpoint, data);
          appointmentsData = data;
          break;
        }
      } catch (error) {
        console.log(`❌ Failed for endpoint ${endpoint}:`, error);
      }
    }
    
    // If no specific endpoint works, try to get all appointments and filter
    if (appointmentsData.length === 0) {
      console.log('🌐 Trying to get all appointments');
      const response = await fetch(`/api/DoctorSchedule/patient?patient_id=${patientId}`, {
  headers: {
    'Authorization': `Bearer ${storedToken}`,
    'Content-Type': 'application/json'
  }
      });
      
      if (response.ok) {
        const allAppointments = await response.json();
        console.log('✅ All appointments:', allAppointments);
        
        // Filter appointments for this patient
        appointmentsData = allAppointments.filter((appt: any) => 
          appt.patient_id && 
          (appt.patient_id._id === patientId || appt.patient_id === patientId)
        );
        console.log('✅ Filtered appointments for patient:', appointmentsData);
      }
    }
    
    // Transform API data to match our interface
    const transformedAppointments: PatientAppointment[] = appointmentsData.map((appt: any) => {
      // Parse the date from database
      let scheduledDate: Date;
      try {
        scheduledDate = new Date(appt.scheduled_date);
        if (isNaN(scheduledDate.getTime())) {
          scheduledDate = new Date(); // Fallback to today
        }
      } catch (error) {
        scheduledDate = new Date(); // Fallback to today
      }
      
      const formattedDate = scheduledDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      return {
        _id: appt._id || `appt_${Date.now()}_${Math.random()}`,
        title: appt.title || 'Doctor Consultation',
        scheduled_date: formattedDate,
        start_time: appt.start_time || '10:00',
        end_time: appt.end_time || '11:00',
        duration_minutes: appt.duration_minutes || 60,
        appointment_type: appt.appointment_type || 'in_person',
        priority: appt.priority || 'medium',
        doctor_name: appt.doctor_name || appt.doctor_id?.name || 'Dr. Unknown',
        doctor_speciality: appt.doctor_speciality || appt.doctor_id?.speciality || 'General',
        status: appt.status || 'scheduled'
      };
    });
    
    console.log('📅 Transformed appointments:', transformedAppointments);
    return transformedAppointments;
  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    return [];
  }
};

  // Main useEffect to load patient data
  useEffect(() => {
    async function loadPatientData() {
      try {
        setLoading(true);
        
        // Check if we have valid user credentials first
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!storedToken || !storedUser) {
          console.error('❌ No token or user found');
          router.push('/login');
          return;
        }
         const patientId = localStorage.getItem('patientId');
         
        const user = JSON.parse(storedUser);
        console.log('👤 Logged in user:', user);
        console.log('📧 User email for search:', user.email);

        // Try to load patient data from cache first
        const cachedPatientData = localStorage.getItem(`patientData_${user.email}`);
        const cacheTimestamp = localStorage.getItem(`patientData_timestamp_${user.email}`);
        
        let patientDataFromCache = null;
        
        // Use cache if less than 5 minutes old
        if (cachedPatientData && cacheTimestamp) {
          const cacheAge = Date.now() - parseInt(cacheTimestamp);
          if (cacheAge < 5 * 60 * 1000) { // 5 minutes
            console.log('✅ Using cached patient data');
            patientDataFromCache = JSON.parse(cachedPatientData);
          }
        }

        // If no cache or cache expired, fetch from API
        if (!patientDataFromCache) {
          const apiUrl = `/api/patients/find_by_email/${encodeURIComponent(user.email)}`;
          console.log('🌐 Calling patient API:', apiUrl);
          
          const patientResponse = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('📊 Patient response status:', patientResponse.status);
          
          if (patientResponse.ok) {
            const result = await patientResponse.json();
            console.log('📦 Patient API Response:', result);
            
            if (result.success && result.patient) {
              patientDataFromCache = result.patient;
              console.log('✅ Found patient record:', patientDataFromCache.name, 'ID:', patientDataFromCache._id);
              
              // Store patient ID for future use
              localStorage.setItem('patientId', patientDataFromCache._id);
              
              // Cache the data
              localStorage.setItem(`patientData_${user.email}`, JSON.stringify(patientDataFromCache));
              localStorage.setItem(`patientData_timestamp_${user.email}`, Date.now().toString());
            } else {
              console.error('❌ Patient not found or API error');
            }
          } else {
            console.error('❌ Failed to fetch patient data, status:', patientResponse.status);
          }
        }

        if (patientDataFromCache) {
          // Step 1: Set patient data
          setPatientData(patientDataFromCache);
          
          // Step 2: Fetch REAL appointments from API
          const realAppointments = await fetchPatientAppointments(patientDataFromCache._id);
          console.log('📅 Real appointments to display:', realAppointments);
          setAppointments(realAppointments);
          
          // Step 3: Transform medications into prescriptions
          if (patientDataFromCache.medications && patientDataFromCache.medications.length > 0) {
            const prescriptionsFromMedications = patientDataFromCache.medications.map((med: any, index: number) => ({
              _id: `presc_${index}`,
              medication_name: med.name || 'Medication',
              dosage: med.dosage || '',
              frequency: med.frequency || '',
              start_date: med.startDate ? new Date(med.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              end_date: med.endDate ? new Date(med.endDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: 'active',
              doctor_name: 'Dr. Smith' // You might want to get real doctor name from your data
            }));
            setPrescriptions(prescriptionsFromMedications);
          }
          
          // Step 4: Transform lab results
          if (patientDataFromCache.labResults && patientDataFromCache.labResults.length > 0) {
            const transformedLabResults = patientDataFromCache.labResults.map((lab: any, index: number) => ({
              _id: `lab_${index}`,
              test_name: lab.test || lab.testName || 'Test',
              result_date: new Date(lab.date || Date.now()).toISOString().split('T')[0],
              result_value: lab.value || '',
              normal_range: lab.normalRange || '',
              status: lab.status || 'pending',
              doctor_notes: lab.notes
            }));
            setLabResults(transformedLabResults);
          }
          
          // Step 5: Generate notifications based on real appointments
          const generatedNotifications: Notification[] = [];
          
          if (realAppointments.length > 0) {
            // Today's appointments notification
            const today = new Date().toISOString().split('T')[0];
            const todaysApps = realAppointments.filter(app => app.scheduled_date === today);
            
            if (todaysApps.length > 0) {
              generatedNotifications.push({
                id: 'notif_today',
                type: 'appointment',
                title: 'Today\'s Appointments',
                message: `You have ${todaysApps.length} appointment(s) scheduled for today`,
                timestamp: new Date().toISOString(),
                read: false
              });
            }
            
            // Next appointment notification
            const upcomingApps = realAppointments
              .filter(app => new Date(app.scheduled_date) >= new Date())
              .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());
            
            if (upcomingApps.length > 0) {
              const nextAppt = upcomingApps[0];
              const nextDate = new Date(nextAppt.scheduled_date);
              generatedNotifications.push({
                id: 'notif_next',
                type: 'appointment',
                title: 'Next Appointment',
                message: `Your next appointment is with ${nextAppt.doctor_name} on ${nextDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
                timestamp: new Date().toISOString(),
                read: false,
                appointmentId: nextAppt._id
              });
            }
          }
          
          setNotifications(generatedNotifications);
          setUnreadCount(generatedNotifications.filter(n => !n.read).length);
          
        } else {
          // Fallback if no patient data found
          console.log('⚠️ Using fallback data');
          setFallbackData(user);
        }
      } catch (error) {
        console.error('❌ Error loading patient data:', error);
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        setFallbackData(user);
      } finally {
        setLoading(false);
      }
    }

    function setFallbackData(user: any) {
      const fallbackPatient: PatientData = {
        _id: 'fallback',
        name: user?.name || user?.username || 'Patient',
        initials: (user?.name || 'P').charAt(0).toUpperCase(),
        age: 30,
        status: 'stable',
        lastSeen: 'Just now',
        tags: ['new'],
        avatar: '👤',
        risk: 'low',
        lastBp: '120/80',
        nextAppointment: '',
        email: user?.email || '',
        phone: '',
        address: '',
        emergencyContact: '',
        medications: [],
        labResults: [],
        vitalSigns: [],
        medicalHistory: [],
        labOrders: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setPatientData(fallbackPatient);
      setAppointments([]);
      setPrescriptions([]);
      setLabResults([]);
      setNotifications([]);
    }

    loadPatientData();
  }, [router]);

  // Filter today's appointments
  useEffect(() => {
    if (appointments.length > 0) {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
      
      console.log('📅 Today is:', todayString);
      console.log('📅 All appointments to filter:', appointments);
      
      const todayApps = appointments.filter(app => {
        console.log('📅 Checking if appointment is today:', {
          scheduled_date: app.scheduled_date,
          isToday: app.scheduled_date === todayString
        });
        return app.scheduled_date === todayString;
      });
      
      console.log('📅 Today appointments found:', todayApps.length);
      setTodayAppointments(todayApps);
    } else {
      console.log('📅 No appointments to filter');
      setTodayAppointments([]);
    }
  }, [appointments]);

  // Calculate upcoming appointments (excluding today's)
  const upcomingAppointments = appointments.filter(app => {
    const appDate = new Date(app.scheduled_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appDate > today;
  }).sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());

  // Calculate past appointments
  const pastAppointments = appointments.filter(app => {
    const appDate = new Date(app.scheduled_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appDate < today;
  }).sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());

  // Calculate active prescriptions
  const activePrescriptions = prescriptions.filter(pres => pres.status === 'active');
  
  // Calculate recent lab results
  const recentLabResults = labResults.slice(0, 3).sort((a, b) => 
    new Date(b.result_date).getTime() - new Date(a.result_date).getTime()
  );

  // Get abnormal lab results
  const abnormalLabResults = labResults.filter(result => result.status === 'abnormal');

  if (loading) {
    return (
      <div className="min-h-screen bg-clinical-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-clinical-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-user-slash text-red-400 text-2xl"></i>
          </div>
          <p className="text-slate-400">Unable to load your data</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clinical-midnight flex flex-col">
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto scrollbar-thin">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, <span className="text-cyan-400">
              {patientData?.name || 'Patient'}
            </span>
          </h1>
          <div className="flex items-center space-x-4 text-slate-400">
            <div className="flex items-center">
              <i className="fas fa-user-circle mr-2"></i>
              <span>Patient</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-heartbeat mr-2"></i>
              <span>Status: <span className={`font-semibold ${patientData.status === 'stable' ? 'text-emerald-400' : 'text-yellow-400'}`}>{patientData.status}</span></span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-clock mr-2"></i>
              <span>Last activity: {patientData.lastSeen}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="premium-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Today's Appointments</p>
                <p className="text-3xl font-bold text-white mt-2">{todayAppointments.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <i className="fas fa-calendar-day text-blue-400 text-xl"></i>
              </div>
            </div>
          </div>

          <Link 
            href={`/patient/prescriptions?patientId=${patientData?._id}`}
            className="premium-card p-6 hover:scale-[1.02] transition-transform duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 group-hover:text-emerald-300 transition-colors">Active Treatments</p>
                <p className="text-3xl font-bold text-white mt-2">{activePrescriptions.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500/30 flex items-center justify-center transition-colors">
                <i className="fas fa-pills text-emerald-400 text-xl group-hover:text-emerald-300"></i>
              </div>
            </div>
          </Link>

          <Link 
            href={`/patient/lab-orders?patientId=${patientData?._id}`}
            className="premium-card p-6 hover:scale-[1.02] transition-transform duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 group-hover:text-cyan-300 transition-colors">Lab Orders</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {patientData?.labOrders?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 group-hover:bg-cyan-500/30 flex items-center justify-center transition-colors">
                <i className="fas fa-vial text-cyan-400 text-xl group-hover:text-cyan-300"></i>
              </div>
            </div>
          </Link>

          <div className="premium-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Risk Level</p>
                <p className="text-3xl font-bold text-white mt-2 capitalize">{patientData.risk}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${patientData.risk === 'high' ? 'bg-red-500/20' : patientData.risk === 'medium' ? 'bg-yellow-500/20' : 'bg-emerald-500/20'} flex items-center justify-center`}>
                <i className={`fas ${patientData.risk === 'high' ? 'fa-exclamation-triangle text-red-400' : patientData.risk === 'medium' ? 'fa-exclamation-circle text-yellow-400' : 'fa-shield-alt text-emerald-400'} text-xl`}></i>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Today's Appointments */}
            <div className="premium-card p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4 shadow-lg">
                    <i className="far fa-calendar-day text-white"></i>
                  </div>
                  <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    Today's Schedule
                  </span>
                </h3>
                <Link 
                  href="/patient/appointments"
                  className="text-sm text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full hover:bg-cyan-500/20 transition-colors"
                >
                  View All
                </Link>
              </div>
              
              {todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment._id} className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                            <i className="fas fa-user-md"></i>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{appointment.doctor_name}</p>
                            <p className="text-sm text-slate-400">
                              {appointment.title}
                            </p>
                            <p className="text-sm text-slate-400">
                              {appointment.start_time} - {appointment.end_time}
                              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 capitalize">
                                {appointment.appointment_type}
                              </span>
                            </p>
                            <p className="text-xs text-cyan-400 mt-1">{appointment.doctor_speciality}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          appointment.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          appointment.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {appointment.priority === 'high' ? 'High' : appointment.priority === 'medium' ? 'Medium' : 'Low'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-calendar-day text-4xl text-slate-600 mb-4"></i>
                  <p className="text-slate-400">No appointments scheduled for today</p>
                </div>
              )}
            </div>

            {/* Upcoming Appointments */}
            <div className="premium-card p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-4 shadow-lg">
                    <i className="far fa-calendar-alt text-white"></i>
                  </div>
                  <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                    Upcoming Appointments
                  </span>
                </h3>
                <Link 
                  href="/patient/appointments"
                  className="text-sm text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full hover:bg-cyan-500/20 transition-colors"
                >
                  View All
                </Link>
              </div>
              
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.slice(0, 2).map((appointment) => (
                    <div key={appointment._id} className="p-4 rounded-2xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-white/10 hover:border-emerald-400/30 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-green-500/20 text-green-400 flex items-center justify-center">
                            <i className="fas fa-user-md"></i>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{appointment.doctor_name}</p>
                            <p className="text-sm text-slate-400">
                              {new Date(appointment.scheduled_date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                            <p className="text-sm text-slate-400">{appointment.start_time} - {appointment.end_time}</p>
                            <p className="text-xs text-emerald-400 mt-1">{appointment.doctor_speciality}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-calendar-alt text-4xl text-slate-600 mb-4"></i>
                  <p className="text-slate-400">No upcoming appointments</p>
                </div>
              )}
            </div>

            {/* Medical Summary */}
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mr-4 shadow-lg">
                    <i className="fas fa-heartbeat text-white"></i>
                  </div>
                  <span className="bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
                    Medical Summary
                  </span>
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/10">
                  <p className="text-sm text-slate-400">Age</p>
                  <p className="text-2xl font-bold text-white">{patientData.age} years</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/10">
                  <p className="text-sm text-slate-400">Blood Pressure</p>
                  <p className="text-2xl font-bold text-white">{patientData.lastBp}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/10">
                  <p className="text-sm text-slate-400">Status</p>
                  <p className={`text-2xl font-bold ${patientData.status === 'stable' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {patientData.status}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/10">
                  <p className="text-sm text-slate-400">Risk Level</p>
                  <p className={`text-2xl font-bold ${
                    patientData.risk === 'low' ? 'text-emerald-400' :
                    patientData.risk === 'medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {patientData.risk}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="premium-card p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mr-4 shadow-lg">
                  <i className="fas fa-bolt text-white"></i>
                </div>
                <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  Quick Access
                </span>
              </h3>
              
              <div className="space-y-3">
                {[
                  { icon: 'fa-comment-medical', label: 'Medical Messaging', href: '/patient/chat', color: 'cyan' },
                  { icon: 'fa-prescription', label: 'My Prescriptions', href: '/patient/prescriptions', color: 'emerald' },
                  { icon: 'fa-file-medical', label: 'Lab Orders', href: '/patient/lab-orders', color: 'purple' },
                  { icon: 'fa-user-md', label: 'My Doctors', href: '/patient/doctors', color: 'pink' },
                  { icon: 'fa-notes-medical', label: 'Medical History', href: '/patient/medical-history', color: 'orange' },
                ].map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-${action.color}-500/20 flex items-center justify-center group-hover:bg-${action.color}-500/30 transition-colors`}>
                      <i className={`fas ${action.icon} text-${action.color}-400`}></i>
                    </div>
                    <span className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="premium-card p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-4 shadow-lg">
                  <i className="fas fa-address-card text-white"></i>
                </div>
                <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Contact Information
                </span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <i className="fas fa-envelope text-blue-400"></i>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="font-medium text-white">{patientData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <i className="fas fa-phone text-green-400"></i>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Phone</p>
                    <p className="font-medium text-white">{patientData.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <i className="fas fa-home text-orange-400"></i>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Address</p>
                    <p className="font-medium text-white">{patientData.address}</p>
                  </div>
                </div>
                
                {patientData.emergencyContact && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <i className="fas fa-exclamation-triangle text-red-400"></i>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Emergency Contact</p>
                      <p className="font-medium text-white">{patientData.emergencyContact}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Health Tips & Education */}
        <div className="premium-card p-6 mt-8">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mr-4 shadow-lg">
              <i className="fas fa-heartbeat text-white"></i>
            </div>
            <span className="bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent">
              Personalized Health Tips
            </span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                {
                title: 'Blood Pressure Monitoring',
                description: `Your last reading: ${patientData.lastBp}. Monitor your blood pressure regularly.`,
                icon: 'fa-heartbeat',
                color: 'red'
              },
              {
                title: 'Healthy Lifestyle',
                description: `At ${patientData.age} years, maintain a balanced diet and regular physical activity.`,
                icon: 'fa-apple-alt',
                color: 'emerald'
              },
              {
                title: 'Medical Follow-up',
                description: 'Consult your doctor regularly for preventive health checkups.',
                icon: 'fa-user-md',
                color: 'blue'
              }
            ].map((tip, index) => (
              <div key={index} className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-${tip.color}-500/20 flex items-center justify-center`}>
                    <i className={`fas ${tip.icon} text-${tip.color}-400`}></i>
                  </div>
                  <h4 className="font-bold text-white">{tip.title}</h4>
                </div>
                <p className="text-sm text-slate-400">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}