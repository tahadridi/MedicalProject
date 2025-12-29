'use client';

import { useState, useEffect } from 'react';
import { Patient } from './dashboard';
import { apiService } from '../../../lib/api';

interface Note {
  _id?: string;
  patient_id: string | Patient;
  title: string;
  content: string;
  type: string;
  priority: string;
  tags: string[];
  is_private: boolean;
  created_at: string;
}

export default function NoteModal({ onClose, patient }: { onClose: () => void; patient: Patient | null }) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'clinical',
    priority: 'medium',
    tags: '',
    is_private: false
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const patientsData = await apiService.getPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }

    setLoading(true);

    try {
      const noteData = {
        patient_id: selectedPatient._id,
        doctor_id: 'dr_anderson',
        title: formData.title,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        is_private: formData.is_private
      };

      await apiService.createDoctorNote(noteData);

      alert(`Note created successfully for ${selectedPatient.name}!`);
      onClose();
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note.');
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'clinical': return 'fa-file-medical';
      case 'progress': return 'fa-chart-line';
      case 'treatment': return 'fa-stethoscope';
      case 'assessment': return 'fa-clipboard-check';
      case 'general': return 'fa-sticky-note';
      default: return 'fa-file-alt';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="premium-card p-8 w-full max-w-2xl max-h-[95vh] overflow-y-auto scrollbar-thin bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 shadow-2xl shadow-cyan-500/10 rounded-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <i className="fas fa-file-medical text-white text-xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                New Clinical Note
              </h3>
              <p className="text-slate-400 text-sm">Document patient observations and assessments</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 hover:scale-110"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

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
          <div className="mb-8 p-5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl shadow-lg shadow-cyan-500/10">
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
          {/* Title & Type Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <i className="fas fa-heading mr-2 text-cyan-400"></i>
                Note Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={!selectedPatient}
                className="w-full premium-card p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter a descriptive title..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <i className="fas fa-tag mr-2 text-purple-400"></i>
                Note Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={!selectedPatient}
                className="w-full premium-card p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="clinical" className="bg-slate-800">Clinical Note</option>
                <option value="progress" className="bg-slate-800">Progress Note</option>
                <option value="treatment" className="bg-slate-800">Treatment Plan</option>
                <option value="assessment" className="bg-slate-800">Assessment</option>
                <option value="general" className="bg-slate-800">General Note</option>
              </select>
            </div>
          </div>

          {/* Priority & Tags Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <i className="fas fa-flag mr-2 text-orange-400"></i>
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
                <option value="urgent" className="bg-slate-800">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <i className="fas fa-hashtag mr-2 text-emerald-400"></i>
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                disabled={!selectedPatient}
                className="w-full premium-card p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="follow-up, lab-results, medication..."
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
              <i className="fas fa-edit mr-2 text-blue-400"></i>
              Clinical Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              disabled={!selectedPatient}
              className="w-full premium-card p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed resize-none h-48"
              placeholder="Document your clinical observations, assessments, and plans..."
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
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 border border-cyan-500/30 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Note...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i>
                  <span>Create Clinical Note</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Tips */}
        {!selectedPatient && (
          <div className="mt-6 p-4 bg-slate-700/30 border border-slate-600/30 rounded-xl">
            <div className="flex items-center space-x-3 text-slate-400">
              <i className="fas fa-info-circle text-cyan-400"></i>
              <p className="text-sm">Select a patient to begin documenting clinical notes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}