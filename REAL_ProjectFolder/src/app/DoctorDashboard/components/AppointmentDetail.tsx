// components/AppointmentDetailsModal.tsx
'use client';

import { Patient } from './dashboard';

interface Appointment {
  _id: string;
  patient_id: Patient;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  appointment_type: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  notes: string;
  created_by: string;
}

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
}

export default function AppointmentDetailsModal({ 
  appointment, 
  onClose, 
  onEdit, 
  onDelete 
}: AppointmentDetailsModalProps) {
  if (!appointment) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return 'fa-video';
      case 'in_person': return 'fa-user-md';
      case 'phone': return 'fa-phone';
      case 'meeting': return 'fa-users';
      default: return 'fa-calendar';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      case 'no_show': return 'text-orange-400';
      case 'scheduled': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="premium-card p-6 w-96 max-h-[90vh] overflow-y-auto scrollbar-thin ">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Appointment Details</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Appointment Header */}
        <div className="flex items-center space-x-4 mb-6 p-4 bg-slate-700/50 rounded-lg">
          <div className={`w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center ${
            appointment.priority === 'high' ? 'bg-red-500/20' :
            appointment.priority === 'medium' ? 'bg-yellow-500/20' :
            'bg-blue-500/20'
          }`}>
            <i className={`fas ${getAppointmentTypeIcon(appointment.appointment_type)} text-blue-400`}></i>
          </div>
          <div>
            <p className="font-semibold text-white">{appointment.title}</p>
            <p className="text-sm text-slate-400">
              {formatDate(appointment.scheduled_date)}
            </p>
          </div>
        </div>

        {/* Patient Information */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-cyan-300 mb-3">PATIENT INFORMATION</h4>
          <div className="premium-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="font-bold text-white text-sm">
                  {appointment.patient_id?.initials || 'PT'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-white">{appointment.patient_id?.name}</p>
                <p className="text-sm text-slate-400">
                  {appointment.patient_id?.age}y • {appointment.patient_id?.tags?.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-semibold text-cyan-300">APPOINTMENT DETAILS</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400">Time</p>
              <p className="text-white font-medium">
                {appointment.start_time} - {appointment.end_time}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Duration</p>
              <p className="text-white font-medium">{appointment.duration_minutes} minutes</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400">Type</p>
              <p className="text-white font-medium capitalize">
                {appointment.appointment_type.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Priority</p>
              <p className={`font-medium capitalize ${getPriorityColor(appointment.priority)}`}>
                {appointment.priority}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400">Status</p>
            <p className={`font-medium capitalize ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </p>
          </div>
        </div>

        {/* Description */}
        {appointment.description && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-cyan-300 mb-2">DESCRIPTION</h4>
            <p className="text-slate-300 text-sm premium-card p-3 rounded-lg">
              {appointment.description}
            </p>
          </div>
        )}

        {/* Notes */}
        {appointment.notes && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-cyan-300 mb-2">NOTES</h4>
            <p className="text-slate-300 text-sm premium-card p-3 rounded-lg">
              {appointment.notes}
            </p>
          </div>
        )}

        
      </div>
    </div>
  );
}