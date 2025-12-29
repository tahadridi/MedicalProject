// components/LabOrderModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Patient } from './dashboard';
import { apiService } from '../../../lib/api';

export default function LabOrderModal({ onClose, patient }: { onClose: () => void; patient: Patient | null }) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
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

  const labTests = [
    'Complete Blood Count (CBC)',
    'Comprehensive Metabolic Panel',
    'Lipid Panel',
    'Thyroid Stimulating Hormone (TSH)',
    'Hemoglobin A1c',
    'Vitamin D Level',
    'Liver Function Tests',
    'Renal Function Tests',
    'Urinalysis',
    'Coagulation Panel',
    'Cardiac Enzymes',
    'Inflammatory Markers',
    'Electrolyte Panel',
    'Glucose Level',
    'Iron Studies',
    'Vitamin B12 Level'
  ];

  const filteredTests = labTests.filter(test =>
    test.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTest = (testName: string) => {
    setSelectedTests(prev =>
      prev.includes(testName)
        ? prev.filter(t => t !== testName)
        : [...prev, testName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!selectedPatient) {
    alert('Veuillez d\'abord sélectionner un patient');
    return;
  }

  if (selectedTests.length === 0) {
    alert('Veuillez sélectionner au moins un test');
    return;
  }

  try {
    setIsSubmitting(true);
    
    // Récupérer le token
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!storedToken || !storedUser) {
      alert('Session expirée. Veuillez vous reconnecter.');
      return;
    }

    const user = JSON.parse(storedUser);
    const today = new Date();
    const appointmentDate = new Date(today.setDate(today.getDate() + 2));
    
    console.log('🔗 URL:', `/api/patients/${selectedPatient._id}/lab-orders`);
    console.log('👤 Patient ID:', selectedPatient._id);
    console.log('👤 User:', user);
    
    // Pour chaque test sélectionné, créer une commande de labo séparée
    const results = [];
    const errors = [];
    
    for (const testName of selectedTests) {
      try {
        const requestBody = {
          test_name: testName,
          ordered_by: user.name || 'Dr. Unknown',
          appointment_date: appointmentDate.toISOString(),
          notes: `Commande créée le ${new Date().toLocaleDateString('fr-FR')} par ${user.name || 'médecin'}`
        };
        
        console.log(`📦 Request for ${testName}:`, requestBody);
        
        const response = await fetch(`/api/patients/${selectedPatient._id}/lab-orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log(`📊 Response status for ${testName}:`, response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Error for test ${testName}:`, response.status, errorText);
          errors.push(`${testName}: ${response.status} ${response.statusText}`);
        } else {
          const result = await response.json();
          console.log(`✅ Response for ${testName}:`, result);
          if (result.success) {
            results.push(testName);
          } else {
            errors.push(`${testName}: ${result.message || 'Unknown error'}`);
          }
        }
      } catch (fetchError) {
        console.error(`❌ Fetch error for test ${testName}:`, fetchError);
        errors.push(`${testName}: ${fetchError.message}`);
      }
    }
    
    // Afficher les résultats
    if (errors.length === 0) {
      console.log(`✅ ${selectedTests.length} commandes de labo ajoutées pour:`, selectedPatient.name);
      
      // Déclencher un événement pour rafraîchir les données
      window.dispatchEvent(new Event('labOrderAdded'));
      
      alert(`✅ ${selectedTests.length} commande(s) de laboratoire créée(s) avec succès pour ${selectedPatient.name}!`);
      onClose();
    } else {
      console.error('❌ Some lab orders failed:', errors);
      if (results.length > 0) {
        alert(`⚠️ ${results.length} commande(s) réussies, ${errors.length} échouée(s).\nÉchecs:\n${errors.join('\n')}`);
        window.dispatchEvent(new Event('labOrderAdded'));
      } else {
        alert(`❌ Toutes les commandes ont échoué:\n${errors.join('\n')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating lab orders:', error);
    alert('❌ Erreur lors de la création des commandes de laboratoire. Vérifiez la console pour plus de détails.');
  } finally {
    setIsSubmitting(false);
  }
};
  
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="premium-card p-8 w-full max-w-2xl max-h-[95vh] overflow-y-auto scrollbar-thin bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 shadow-2xl shadow-blue-500/10 rounded-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <i className="fas fa-vial text-white text-lg"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Order Lab Tests</h3>
              <p className="text-slate-400 text-sm">Select laboratory investigations</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Patient Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Patient</label>
          <select
            value={selectedPatient?._id || ''}
            onChange={(e) => {
              const patientId = e.target.value;
              const patient = patients.find(p => p._id === patientId) || null;
              setSelectedPatient(patient);
            }}
            required
            className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          >
            <option value="">Select a patient...</option>
            {patients.map(patient => (
              <option key={patient._id} value={patient._id} className="bg-slate-800">
                {patient.name} • {patient.age}y • {patient.tags[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Patient Info */}
        {selectedPatient && (
          <div className="mb-6 p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="font-bold text-white text-sm">{selectedPatient.initials}</span>
              </div>
              <div>
                <p className="font-semibold text-white">{selectedPatient.name}</p>
                <p className="text-sm text-slate-400">
                  {selectedPatient.age}y • {selectedPatient.tags.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Search Tests</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!selectedPatient}
              placeholder="Type to search lab tests..."
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Selected Tests Summary */}
          {selectedTests.length > 0 && (
            <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-cyan-400">Selected Tests</span>
                <span className="text-cyan-400 text-sm font-semibold">
                  {selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTests.map(test => (
                  <span 
                    key={test}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm border border-cyan-500/30"
                  >
                    {test}
                    <button
                      type="button"
                      onClick={() => toggleTest(test)}
                      className="ml-2 text-cyan-400 hover:text-cyan-300"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Lab Tests List */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Available Laboratory Tests
            </label>
            
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin bg-slate-800/30 rounded-lg border border-slate-600 p-4">
              {filteredTests.map(test => (
                <label 
                  key={test}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedTests.includes(test)
                      ? 'bg-cyan-500/10 border-cyan-500/50'
                      : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                  } ${!selectedPatient ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test)}
                    onChange={() => toggleTest(test)}
                    disabled={!selectedPatient}
                    className="rounded border-slate-400 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className={`flex-1 text-sm ${
                    selectedTests.includes(test) ? 'text-cyan-300' : 'text-white'
                  }`}>
                    {test}
                  </span>
                  {selectedTests.includes(test) && (
                    <i className="fas fa-check text-cyan-400 text-sm"></i>
                  )}
                </label>
              ))}
              
              {filteredTests.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <i className="fas fa-search text-2xl mb-2"></i>
                  <p>No tests found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
            
            {!selectedPatient && (
              <div className="mt-3 p-3 bg-slate-700/30 border border-slate-600 rounded-lg">
                <div className="flex items-center space-x-2 text-slate-400">
                  <i className="fas fa-info-circle text-cyan-400"></i>
                  <p className="text-sm">Please select a patient to choose laboratory tests</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-600">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors border border-slate-600"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={selectedTests.length === 0 || !selectedPatient}
              className="px-5 py-2.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-cyan-500/30 hover:border-cyan-500/50 flex items-center space-x-2"
            >
              <i className="fas fa-paper-plane"></i>
              <span>Order {selectedTests.length} Test{selectedTests.length !== 1 ? 's' : ''}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}