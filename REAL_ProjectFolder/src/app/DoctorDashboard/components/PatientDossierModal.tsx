// app/doctor_dashboard/components/PatientDossierModal.tsx
'use client';

import { Patient } from './dashboard';
import { useState } from 'react';
import { apiService } from '../../../lib/api'; 

interface PatientDossierModalProps {
  onClose: () => void;
  patient: Patient | null;
  onPatientUpdate?: (updatedPatient: Patient) => void;
}

export default function PatientDossierModal({ onClose, patient, onPatientUpdate }: PatientDossierModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState<Patient | null>(patient);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editedVitalSigns, setEditedVitalSigns] = useState([
    { name: 'Heart Rate', value: '72 bpm', status: 'Normal' },
    { name: 'Oxygen Saturation', value: '98%', status: 'Normal' },
    { name: 'Temperature', value: '36.8°C', status: 'Normal' },
    { name: 'Respiratory Rate', value: '16/min', status: 'Normal' }
  ]);

  if (!patient || !editedPatient) return null;

  const medicalHistory = [
    { date: '2024-01-15', diagnosis: 'Hypertension', treatment: 'Lisinopril 10mg daily' },
    { date: '2023-11-20', diagnosis: 'Type 2 Diabetes', treatment: 'Metformin 500mg twice daily' },
    { date: '2023-08-10', diagnosis: 'Annual Checkup', treatment: 'Routine blood work' }
  ];

  const labResults = [
    { test: 'Blood Pressure', value: editedPatient.lastBp, status: 'Normal' },
    { test: 'Glucose', value: '112 mg/dL', status: 'Elevated' },
    { test: 'Cholesterol', value: '185 mg/dL', status: 'Normal' }
  ];

  const handleSave = async () => {
  if (!editedPatient) return;
  
  setIsSaving(true);
  setSaveError(null);
  
  try {
    console.log('💾 Saving patient data:', editedPatient);
    
    // Call the API to save to database
    const updatedPatient = await apiService.updatePatient(editedPatient._id, {
      name: editedPatient.name,
      age: editedPatient.age,
      risk: editedPatient.risk,
      lastBp: editedPatient.lastBp,
      nextAppointment: editedPatient.nextAppointment,
      tags: editedPatient.tags,
      status: editedPatient.status
    });
    
    console.log('✅ Patient saved successfully:', updatedPatient);
    
    // Update local state and parent component
    if (onPatientUpdate) {
      onPatientUpdate(updatedPatient);
    }
    
    setIsEditing(false);
    
  } catch (error) {
    console.error('❌ Error saving patient:', error);
    setSaveError('Failed to save changes. Please try again.');
  } finally {
    setIsSaving(false);
  }
};

  const handleCancel = () => {
    setEditedPatient(patient);
    setIsEditing(false);
  };

  const handleFieldChange = (field: keyof Patient, value: string) => {
    setEditedPatient(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleVitalSignChange = (index: number, field: 'value' | 'status', value: string) => {
    const updatedVitals = [...editedVitalSigns];
    updatedVitals[index] = { ...updatedVitals[index], [field]: value };
    setEditedVitalSigns(updatedVitals);
  };

  const handleTagUpdate = (action: 'add' | 'remove', tag?: string) => {
    if (!editedPatient) return;

    if (action === 'add' && tag) {
      setEditedPatient({
        ...editedPatient,
        tags: [...editedPatient.tags, tag]
      });
    } else if (action === 'remove' && tag) {
      setEditedPatient({
        ...editedPatient,
        tags: editedPatient.tags.filter(t => t !== tag)
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="premium-card p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold mb-2">
              {isEditing ? 'Edit Medical Dossier' : 'Medical Dossier'}: {editedPatient.name}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>{editedPatient.age} years old</span>
              <span>•</span>
              <span>Last seen: {editedPatient.lastSeen}</span>
              <span>•</span>
              <span className={`px-2 py-1 rounded-full ${
                editedPatient.status === 'critical' ? 'bg-red-500/20 text-red-400' :
                editedPatient.status === 'review' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {editedPatient.status.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSave}
                  className="premium-card w-10 h-10 flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-300 rounded-xl"
                  title="Save Changes"
                >
                  <i className="fas fa-check"></i>
                </button>
                <button 
                  onClick={handleCancel}
                  className="premium-card w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 rounded-xl"
                  title="Cancel"
                >
                  <i className="fas fa-times"></i>
                </button>
              </>
            ) : (
              <button 
                onClick={onClose}
                className="premium-card w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 rounded-xl"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="premium-card p-4">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-info-circle text-cyan-400 mr-2"></i>
              Patient Information
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Name:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPatient.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="premium-card px-3 py-1 text-sm bg-white/5 border border-white/10 rounded"
                  />
                ) : (
                  <span className="font-medium">{editedPatient.name}</span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Age:</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedPatient.age}
                    onChange={(e) => handleFieldChange('age', e.target.value)}
                    className="premium-card px-3 py-1 text-sm bg-white/5 border border-white/10 rounded w-20"
                  />
                ) : (
                  <span className="font-medium">{editedPatient.age} years</span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Risk Level:</span>
                {isEditing ? (
                  <select
                    value={editedPatient.risk}
                    onChange={(e) => handleFieldChange('risk', e.target.value)}
                    className="premium-card px-3 py-1 text-sm bg-white/5 border border-white/10 rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (
                  <span className={`font-medium ${
                    editedPatient.risk === 'high' ? 'text-red-400' :
                    editedPatient.risk === 'medium' ? 'text-yellow-400' :
                    'text-emerald-400'
                  }`}>
                    {editedPatient.risk.toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Last BP:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPatient.lastBp}
                    onChange={(e) => handleFieldChange('lastBp', e.target.value)}
                    className="premium-card px-3 py-1 text-sm bg-white/5 border border-white/10 rounded w-24"
                    placeholder="120/80"
                  />
                ) : (
                  <span className="font-medium">{editedPatient.lastBp}</span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Next Appointment:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPatient.nextAppointment}
                    onChange={(e) => handleFieldChange('nextAppointment', e.target.value)}
                    className="premium-card px-3 py-1 text-sm bg-white/5 border border-white/10 rounded"
                    placeholder="2024-01-15"
                  />
                ) : (
                  <span className="font-medium">{editedPatient.nextAppointment}</span>
                )}
              </div>
            </div>
          </div>

          {/* Medical Conditions */}
          <div className="premium-card p-4">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-diagnoses text-purple-400 mr-2"></i>
              Medical Conditions
            </h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {editedPatient.tags.map((tag, index) => (
                <span key={tag} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center">
                  {tag}
                  {isEditing && (
                    <button 
                      onClick={() => handleTagUpdate('remove', tag)}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add condition..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim()) {
                        handleTagUpdate('add', input.value.trim());
                        input.value = '';
                      }
                    }
                  }}
                  className="premium-card px-3 py-1 text-sm bg-white/5 border border-white/10 rounded flex-1"
                />
                <button 
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add condition..."]') as HTMLInputElement;
                    if (input?.value.trim()) {
                      handleTagUpdate('add', input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="premium-card px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            )}
          </div>

          {/* Vital Signs */}
          <div className="premium-card p-4">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-heartbeat text-red-400 mr-2"></i>
              Vital Signs
            </h4>
            <div className="space-y-3">
              {editedVitalSigns.map((vital, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                  <span className="text-sm">{vital.name}</span>
                  <div className="text-right flex items-center space-x-2">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={vital.value}
                          onChange={(e) => handleVitalSignChange(index, 'value', e.target.value)}
                          className="premium-card px-2 py-1 text-sm bg-white/5 border border-white/10 rounded w-20"
                        />
                        <select
                          value={vital.status}
                          onChange={(e) => handleVitalSignChange(index, 'status', e.target.value)}
                          className="premium-card px-2 py-1 text-sm bg-white/5 border border-white/10 rounded"
                        >
                          <option value="Normal">Normal</option>
                          <option value="Warning">Warning</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">{vital.value}</span>
                        <span className="text-xs text-emerald-400 ml-2">{vital.status}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical History */}
          <div className="premium-card p-4 lg:col-span-2">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-history text-emerald-400 mr-2"></i>
              Medical History
            </h4>
            <div className="space-y-3">
              {medicalHistory.map((record, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium">{record.diagnosis}</p>
                    <p className="text-sm text-slate-400">{record.treatment}</p>
                  </div>
                  <span className="text-sm text-slate-400">{record.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lab Results */}
          <div className="premium-card p-4 lg:col-span-2">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-vial text-orange-400 mr-2"></i>
              Recent Lab Results
            </h4>
            <div className="space-y-3">
              {labResults.map((lab, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium">{lab.test}</p>
                    <p className="text-sm text-slate-400">{lab.value}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    lab.status === 'Normal' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {lab.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-white/10">
          <button 
            type="button"
            className="px-4 py-2 rounded-lg bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 transition-colors"
          >
            <i className="fas fa-print mr-2"></i>Print Dossier
          </button>
          {!isEditing ? (
            <button 
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors"
            >
              <i className="fas fa-edit mr-2"></i>Edit Information
            </button>
          ) : (
            <div className="flex space-x-3">
              <button 
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
              >
                <i className="fas fa-times mr-2"></i>Cancel
              </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-check mr-2"></i>
                Save Changes
              </>
            )}
          </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}