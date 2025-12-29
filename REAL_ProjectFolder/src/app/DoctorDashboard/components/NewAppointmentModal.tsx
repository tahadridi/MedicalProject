'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../../../lib/api';
import { Patient } from './dashboard';

interface DoctorInfo {
  _id: string;
  email: string;
  name: string;
  speciality: string;
}
export default function NewAppointmentModal({ onClose }: { onClose: () => void }) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  
  const [formData, setFormData] = useState({
    scheduled_date: '',
    start_time: '',
    end_time: '',
    duration_minutes: '30',
    appointment_type: 'video',
    title: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    loadPatients();
    loadDoctorInfo();
  }, []);

  // Load doctor info from localStorage or API
  const loadDoctorInfo = async () => {
    try {
      // Check if doctor info is in localStorage
      const storedDoctorData = localStorage.getItem('doctorData');
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedDoctorData) {
        const doctorData = JSON.parse(storedDoctorData);
        setDoctorInfo({
          _id: doctorData._id || 'dr_anderson',
          email: doctorData.email || '',
          name: doctorData.name || 'Dr. Anderson',
          speciality: doctorData.specialite || 'General Practitioner'
        });
        return;
      }
      
      if (storedUser && token) {
        const user = JSON.parse(storedUser);
        
        // If user is a doctor, fetch their details
        if (user.isMedecin || user.role === 'medecin') {
          try {
            // Try to fetch doctor by email
            const response = await fetch(`/api/doctors/email/${encodeURIComponent(user.email)}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data) {
                setDoctorInfo({
                  _id: result.data._id,
                  email: result.data.email,
                  name: `${result.data.prenom} ${result.data.nom}`,
                  speciality: result.data.specialite
                });
                
                // Store in localStorage
                localStorage.setItem('doctorData', JSON.stringify(result.data));
              }
            }
          } catch (error) {
            console.error('Error fetching doctor info:', error);
            // Use fallback doctor info
            setFallbackDoctorInfo();
          }
        }
      } else {
        setFallbackDoctorInfo();
      }
    } catch (error) {
      console.error('Error loading doctor info:', error);
      setFallbackDoctorInfo();
    }
  };

  const setFallbackDoctorInfo = () => {
    setDoctorInfo({
      _id: 'dr_anderson',
      email: 'dr.anderson@nexusclinical.com',
      name: 'Dr. Anderson',
      speciality: 'General Practitioner'
    });
  };

  const loadPatients = async () => {
    try {
      const patientsData = await apiService.getPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const startDate = new Date();
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date();
    endDate.setHours(endH, endM, 0, 0);

    const diff = (endDate.getTime() - startDate.getTime()) / 60000; // minutes
    return Math.max(diff, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }

    if (!doctorInfo) {
      alert('Doctor information not available');
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        doctor_id: doctorInfo._id,
        doctor_name: doctorInfo.name,
        doctor_email: doctorInfo.email,
        doctor_speciality: doctorInfo.speciality,
        patient_id: selectedPatient._id,
        scheduled_date: new Date(`${formData.scheduled_date}T${formData.start_time}`),
        start_time: formData.start_time,
        end_time: formData.end_time,
        duration_minutes: parseInt(formData.duration_minutes),
        appointment_type: formData.appointment_type,
        status: 'scheduled',
        priority: formData.priority,
        title: formData.title || `Appointment with ${selectedPatient.name}`,
        description: formData.description,
        created_by: doctorInfo._id
      };

      console.log('Creating appointment with data:', appointmentData);

      await apiService.createAppointment(appointmentData);

      alert(`Appointment scheduled successfully for ${selectedPatient.name}!`);
      onClose();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Error scheduling appointment. Check console for details.');
    }

    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Recalculate duration if start_time or end_time changed
      if (name === 'start_time' || name === 'end_time') {
        updated.duration_minutes = calculateDuration(updated.start_time, updated.end_time).toString();
      }

      return updated;
    });
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return 'fa-video';
      case 'in_person': return 'fa-user-md';
      case 'phone': return 'fa-phone';
      default: return 'fa-calendar';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const formatDuration = (minutes: string) => {
    const mins = parseInt(minutes);
    if (mins < 60) return `${mins} minutes`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins > 0 ? `${remainingMins}m` : ''}`.trim();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="premium-card p-8 w-full max-w-2xl max-h-[95vh] overflow-y-auto scrollbar-thin bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 shadow-2xl shadow-blue-500/10 rounded-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <i className="fas fa-calendar-plus text-white text-xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                Schedule Appointment
              </h3>
              <p className="text-slate-400 text-sm">Book a new consultation session</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 hover:scale-110"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        {/* Doctor Info Card */}
        {doctorInfo && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <i className="fas fa-user-md text-white"></i>
                </div>
                <div>
                  <p className="font-bold text-white">{doctorInfo.name}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm text-cyan-300">{doctorInfo.speciality}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-sm text-slate-300">{doctorInfo.email}</span>
                  </div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                DOCTOR
              </div>
            </div>
          </div>
        )}
        {/* Patient Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-cyan-300 mb-3 flex items-center">
            <i className="fas fa-user-injured mr-2"></i>
            Select Patient
          </label>
          <select
            value={selectedPatient?._id || ''}
            onChange={(e) => {
              const patientId = e.target.value;
              const patient = patients.find(p => p._id === patientId) || null;
              setSelectedPatient(patient);
            }}
            required
            className="w-full premium-card p-4 bg-slate-800/50 border border-cyan-500/20 rounded-xl focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
          >
            <option value="" className="bg-slate-800">Choose a patient...</option>
            {patients.map(patient => (
              <option key={patient._id} value={patient._id} className="bg-slate-800">
                {patient.name} • {patient.age}y • {patient.tags[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Patient Card */}
        {selectedPatient && (
          <div className="mb-8 p-5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="font-bold text-white text-sm">{selectedPatient.initials}</span>
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{selectedPatient.name}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm text-cyan-300">{selectedPatient.age} years</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-sm text-slate-300">{selectedPatient.tags.join(', ')}</span>
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                selectedPatient.status === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                selectedPatient.status === 'review' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                {selectedPatient.status.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Time Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <i className="fas fa-calendar-day mr-2 text-purple-400"></i>
                Appointment Date
              </label>
              <input
                type="date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                required
                disabled={!selectedPatient}
                className="w-full premium-card p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <i className="fas fa-clock mr-2 text-blue-400"></i>
                Start Time
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                disabled={!selectedPatient}
                className="w-full premium-card p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <i className="fas fa-stopwatch mr-2 text-emerald-400"></i>
                Finished Time
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                disabled={!selectedPatient}
                className="w-full premium-card p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Duration & Type Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <i className="fas fa-hourglass-half mr-2 text-orange-400"></i>
                Duration
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="duration_minutes"
                  value={`${formatDuration(formData.duration_minutes)}`}
                  readOnly
                  className="w-full premium-card p-4 bg-slate-700/50 border border-orange-500/30 rounded-xl cursor-not-allowed pr-20"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <span className="text-orange-400 text-sm font-semibold bg-orange-500/20 px-2 py-1 rounded-lg">
                    Auto
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <i className={`fas ${getAppointmentTypeIcon(formData.appointment_type)} mr-2 text-cyan-400`}></i>
                Appointment Type
              </label>
              <select
                name="appointment_type"
                value={formData.appointment_type}
                onChange={handleChange}
                disabled={!selectedPatient}
                className="w-full premium-card p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="video" className="bg-slate-800">Video Call</option>
                <option value="in_person" className="bg-slate-800">In-Person</option>
                <option value="phone" className="bg-slate-800">Phone Call</option>
              </select>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
              <i className="fas fa-flag mr-2 text-red-400"></i>
              Priority Level
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={!selectedPatient}
              className={`w-full premium-card p-4 bg-slate-800/50 border rounded-xl focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                getPriorityColor(formData.priority)
              }`}
            >
              <option value="low" className="bg-slate-800">Low Priority</option>
              <option value="medium" className="bg-slate-800">Medium Priority</option>
              <option value="high" className="bg-slate-800">High Priority</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
              <i className="fas fa-file-alt mr-2 text-slate-400"></i>
              Appointment Notes
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!selectedPatient}
              className="w-full premium-card p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:border-slate-500/50 focus:ring-2 focus:ring-slate-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed resize-none h-32"
              placeholder="Enter appointment purpose, special instructions, or notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-300 disabled:opacity-50 flex items-center space-x-2 border border-slate-600/50"
            >
              <i className="fas fa-times"></i>
              <span>Cancel</span>
            </button>
            <button 
              type="submit" 
              disabled={!selectedPatient || loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 hover:from-blue-500/30 hover:to-cyan-500/30 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 border border-blue-500/30 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-calendar-check"></i>
                  <span>Schedule Appointment</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Tips */}
        {!selectedPatient && (
          <div className="mt-6 p-4 bg-slate-700/30 border border-slate-600/30 rounded-xl">
            <div className="flex items-center space-x-3 text-slate-400">
              <i className="fas fa-info-circle text-blue-400"></i>
              <p className="text-sm">Select a patient to schedule an appointment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 