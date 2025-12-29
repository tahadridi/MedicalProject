// src/app/(patient)/appointments/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  avatar: string;
  email: string;
  phone: string;
  availability: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
  consultation_hours: {
    start: string;
    end: string;
  };
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'video' | 'in_person' | 'phone'>('in_person');
  const [reason, setReason] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      generateTimeSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const loadDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/doctors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    if (!selectedDoctor || !selectedDate) return;

    const doctor = doctors.find(d => d._id === selectedDoctor);
    if (!doctor) return;

    const selectedDay = new Date(selectedDate).getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayNames[selectedDay];
    
    const availableDays = doctor.availability[dayKey as keyof typeof doctor.availability];
    
    if (!availableDays || availableDays.length === 0) {
      setAvailableTimeSlots([]);
      return;
    }

    // Generate 30-minute slots based on consultation hours
    const slots: string[] = [];
    const [startHour, startMinute] = doctor.consultation_hours.start.split(':').map(Number);
    const [endHour, endMinute] = doctor.consultation_hours.end.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const time = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      slots.push(time);
      
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    setAvailableTimeSlots(slots);
    setSelectedTime('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const patientId = localStorage.getItem('patientId');
      
      const appointmentData = {
        patient_id: patientId,
        doctor_id: selectedDoctor,
        title: `Rendez-vous - ${reason}`,
        scheduled_date: selectedDate,
        start_time: selectedTime,
        end_time: calculateEndTime(selectedTime),
        appointment_type: appointmentType,
        priority: 'medium',
        reason: reason,
        status: 'pending'
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        // Create notification for doctor
        await createDoctorNotification(selectedDoctor, appointmentData);
        
        alert('Rendez-vous créé avec succès!');
        router.push('/patient/appointments');
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Erreur lors de la création du rendez-vous');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let endHours = hours;
    let endMinutes = minutes + 30;
    
    if (endMinutes >= 60) {
      endHours += 1;
      endMinutes = 0;
    }
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const createDoctorNotification = async (doctorId: string, appointmentData: any) => {
    try {
      const token = localStorage.getItem('token');
      const patientData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const notificationData = {
        doctor_id: doctorId,
        type: 'appointment_request',
        title: 'Nouvelle demande de rendez-vous',
        message: `${patientData.name} a demandé un rendez-vous pour le ${new Date(appointmentData.scheduled_date).toLocaleDateString('fr-FR')} à ${appointmentData.start_time}`,
        appointment_id: appointmentData._id,
        read: false
      };

      await fetch('/api/notifications/doctor', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });
    } catch (error) {
      console.error('Error creating doctor notification:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-clinical-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement des médecins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clinical-midnight py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/patient"
            className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
           Go Back to Home Page
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">Prendre un rendez-vous</h1>
          <p className="text-slate-400 mt-2">Choisissez un médecin et fixez un rendez-vous</p>
        </div>

        <form onSubmit={handleSubmit} className="premium-card p-8">
          {/* Doctor Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Médecin <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionnez un médecin</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name} - {doctor.speciality}
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type de rendez-vous
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'in_person', label: 'En personne', icon: 'fa-user-md' },
                { value: 'video', label: 'Vidéo', icon: 'fa-video' },
                { value: 'phone', label: 'Téléphone', icon: 'fa-phone' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setAppointmentType(type.value as any)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                    appointmentType === type.value
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <i className={`fas ${type.icon} text-xl mb-2 ${
                    appointmentType === type.value ? 'text-cyan-400' : 'text-slate-400'
                  }`}></i>
                  <span className={`font-medium ${
                    appointmentType === type.value ? 'text-cyan-300' : 'text-slate-300'
                  }`}>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>

          {/* Time Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Heure <span className="text-red-400">*</span>
            </label>
            {availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {availableTimeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      selectedTime === time
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-800/50 rounded-xl">
                <i className="fas fa-clock text-2xl text-slate-600 mb-2"></i>
                <p className="text-slate-400">
                  {selectedDoctor && selectedDate 
                    ? "Ce médecin n'est pas disponible à cette date"
                    : "Sélectionnez un médecin et une date pour voir les disponibilités"}
                </p>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Raison du rendez-vous <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Décrivez la raison de votre consultation..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/patient"
              className="px-6 py-3 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={submitting || !selectedDoctor || !selectedDate || !selectedTime || !reason}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Création en cours...
                </>
              ) : (
                'Confirmer le rendez-vous'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}