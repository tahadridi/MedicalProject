// components/PrescriptionModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Patient } from './dashboard';
import { apiService } from '../../../lib/api';

export default function PrescriptionModal({ onClose, patient }: { onClose: () => void; patient: Patient | null }) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const patientsData = await apiService.getPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
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
      const prescriptionData = {
        patient_id: selectedPatient._id,
        medication_name: formData.medication,
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: formData.duration,
        instructions: formData.instructions,
      };

      await apiService.createPrescription(prescriptionData);

      alert(`Prescription saved successfully for ${selectedPatient.name}!`);
      onClose();
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Failed to save prescription.');
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'once daily': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'twice daily': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'three times daily': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'as needed': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="premium-card p-8 w-full max-w-2xl max-h-[95vh] overflow-y-auto scrollbar-thin bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <i className="fas fa-prescription-bottle-alt text-white text-xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
                New Prescription
              </h3>
              <p className="text-slate-400 text-sm">Prescribe medication and treatment plans</p>
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
          <label className="block text-sm font-semibold text-emerald-300 mb-3 flex items-center">
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
            className="w-full premium-card p-4 bg-slate-800/50 border border-emerald-500/20 rounded-xl focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
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
          <div className="mb-8 p-5 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl shadow-lg shadow-emerald-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <span className="font-bold text-white text-sm">{selectedPatient.initials}</span>
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{selectedPatient.name}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm text-emerald-300">{selectedPatient.age} years</span>
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
          {/* Medication & Dosage Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <i className="fas fa-pills mr-2 text-purple-400"></i>
                Medication Name
              </label>
              <input
                type="text"
                name="medication"
                value={formData.medication}
                onChange={handleChange}
                required
                disabled={!selectedPatient}
                className="w-full premium-card p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter medication name..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <i className="fas fa-weight-hanging mr-2 text-blue-400"></i>
                Dosage
              </label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                required
                disabled={!selectedPatient}
                className="w-full premium-card p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="e.g., 500mg, 10ml, 2 puffs..."
              />
            </div>
          </div>

          {/* Frequency & Duration Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <i className="fas fa-clock mr-2 text-orange-400"></i>
                Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                required
                disabled={!selectedPatient}
                className={`w-full premium-card p-4 bg-slate-800/50 border rounded-xl focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  getFrequencyColor(formData.frequency)
                }`}
              >
                <option value="" className="bg-slate-800">Select frequency...</option>
                <option value="once daily" className="bg-slate-800">Once daily</option>
                <option value="twice daily" className="bg-slate-800">Twice daily</option>
                <option value="three times daily" className="bg-slate-800">Three times daily</option>
                <option value="as needed" className="bg-slate-800">As needed</option>
                <option value="weekly" className="bg-slate-800">Weekly</option>
                <option value="monthly" className="bg-slate-800">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <i className="fas fa-calendar-alt mr-2 text-cyan-400"></i>
                Duration
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                disabled={!selectedPatient}
                className="w-full premium-card p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="e.g., 30 days, 3 months, 1 year..."
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center">
              <i className="fas fa-sticky-note mr-2 text-yellow-400"></i>
              Special Instructions
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              disabled={!selectedPatient}
              className="w-full premium-card p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed resize-none h-32"
              placeholder="Enter administration instructions, precautions, dietary considerations..."
            />
          </div>

          {/* Prescription Preview */}
          {selectedPatient && formData.medication && (
            <div className="p-5 bg-gradient-to-r from-slate-700/30 to-slate-800/30 border border-slate-600/30 rounded-2xl">
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                <i className="fas fa-eye mr-2 text-slate-400"></i>
                Prescription Preview
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Patient:</span>
                  <span className="text-white font-medium">{selectedPatient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Medication:</span>
                  <span className="text-emerald-300 font-medium">{formData.medication}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dosage:</span>
                  <span className="text-blue-300">{formData.dosage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Frequency:</span>
                  <span className="text-orange-300">{formData.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-cyan-300">{formData.duration}</span>
                </div>
              </div>
            </div>
          )}

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
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 hover:from-emerald-500/30 hover:to-green-500/30 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 border border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Prescription...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-prescription"></i>
                  <span>Create Prescription</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Tips */}
        {!selectedPatient && (
          <div className="mt-6 p-4 bg-slate-700/30 border border-slate-600/30 rounded-xl">
            <div className="flex items-center space-x-3 text-slate-400">
              <i className="fas fa-info-circle text-emerald-400"></i>
              <p className="text-sm">Select a patient to begin prescribing medication</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}