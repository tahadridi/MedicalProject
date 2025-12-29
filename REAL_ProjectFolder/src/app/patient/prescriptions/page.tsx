'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Medication {
  _id?: string;
  name?: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  prescribed_by?: string;
  instructions?: string;
}

interface Prescription {
  _id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  doctor_name: string;
  instructions?: string;
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Vérifier l'authentification
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!storedToken || !storedUser) {
          router.push('/login');
          return;
        }

        // Récupérer l'ID patient
        const patientId = localStorage.getItem('patientId');
        
        if (!patientId) {
          console.error('No patient ID found');
          router.push('/login');
          return;
        }

        // 1. Récupérer les données du patient depuis votre API
        const response = await fetch(`/api/patients/${patientId}`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📊 API Response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('📦 Full API Response:', result);
          
          // Vérifier les deux formats possibles
          let patient;
          
          if (result.success && result.patient) {
            // Format: { success: true, patient: {...} }
            console.log('📋 Format: success + patient object');
            patient = result.patient;
          } else if (result._id) {
            // Format: { _id: ..., name: ..., ... } (direct patient object)
            console.log('📋 Format: direct patient object');
            patient = result;
          } else {
            console.error('❌ Unknown response format:', result);
            setFallbackData();
            return;
          }
          
          if (patient) {
            setPatientData(patient);
            
            console.log('✅ Patient data loaded:', patient.name);
            console.log('💊 Patient medications:', patient.medications);
            console.log('💊 Medications count:', patient.medications?.length || 0);
            
            // 2. Transformer les medications en prescriptions
            if (patient.medications && patient.medications.length > 0) {
              console.log(`🔍 Processing ${patient.medications.length} medications`);
              
              const transformedPrescriptions = patient.medications.map((med: Medication, index: number) => {
                console.log(`💊 Medication ${index + 1}:`, med);
                
                // Déterminer le statut
                let status: 'active' | 'completed' | 'cancelled' = 'active';
                
                if (med.status) {
                  if (['completed', 'terminé', 'finished'].includes(med.status.toLowerCase())) {
                    status = 'completed';
                  } else if (['cancelled', 'annulé', 'canceled'].includes(med.status.toLowerCase())) {
                    status = 'cancelled';
                  }
                } else if (med.endDate && new Date(med.endDate) < new Date()) {
                  status = 'completed';
                }
                
                // Créer des dates par défaut
                const startDate = med.startDate ? new Date(med.startDate) : new Date();
                const endDate = med.endDate ? new Date(med.endDate) : new Date(startDate);
                if (!med.endDate) {
                  endDate.setDate(endDate.getDate() + 30);
                }
                
                return {
                  _id: med._id || `med_${index}`,
                  medication_name: med.name || 'Medicines',
                  dosage: med.dosage || 'Non spécifié',
                  frequency: med.frequency || 'Selon prescription',
                  start_date: startDate.toISOString().split('T')[0],
                  end_date: endDate.toISOString().split('T')[0],
                  status: status,
                  doctor_name: med.prescribed_by || 'Dr. Non spécifié',
                  instructions: med.instructions || `Prendre ${med.dosage || ''} ${med.frequency || ''}`
                };
              });
              
              console.log('📋 Transformed prescriptions:', transformedPrescriptions);
              console.log('📋 Total prescriptions created:', transformedPrescriptions.length);
              setPrescriptions(transformedPrescriptions);
            } else {
              console.log('⚠️ No medications found for patient');
              setPrescriptions([
                {
                  _id: 'default_1',
                  medication_name: 'Traitement général',
                  dosage: 'Selon besoin',
                  frequency: 'Quotidien',
                  start_date: new Date().toISOString().split('T')[0],
                  end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  status: 'active',
                  doctor_name: 'Dr. ' + patient.name?.split(' ')[0] || 'Médecin',
                  instructions: `Suivi médical pour ${patient.name}`
                }
              ]);
            }
          }
        } else {
          console.error('❌ Failed to fetch patient data:', response.status);
          setFallbackData();
        }

      } catch (error) {
        console.error('❌ Error loading data:', error);
        setFallbackData();
      } finally {
        setLoading(false);
      }
    };

    const setFallbackData = () => {
      setPrescriptions([
        {
          _id: 'fallback_1',
          medication_name: 'Paracétamol',
          dosage: '500mg',
          frequency: '3 fois par jour si douleur',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          status: 'active',
          doctor_name: 'Dr. Anderson',
          instructions: 'Prendre après les repas'
        }
      ]);
    };

    loadData();
  }, [router]);

  // Calculer les statistiques
  const activeCount = prescriptions.filter(p => p.status === 'active').length;
  const completedCount = prescriptions.filter(p => p.status === 'completed').length;
  const cancelledCount = prescriptions.filter(p => p.status === 'cancelled').length;
  const totalCount = prescriptions.length;

  // Filtrer les prescriptions
  const filteredPrescriptions = prescriptions.filter(pres => 
    filter === 'all' || pres.status === filter
  );

  console.log('📊 Stats - Total:', totalCount, 'Active:', activeCount, 'Filtered:', filteredPrescriptions.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-clinical-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement de vos prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clinical-midnight p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              My Prescriptions ({totalCount})
              {patientData && (
                <span className="text-cyan-400 ml-2 text-lg">
                  - {patientData.name}
                </span>
              )}
            </h1>
            <p className="text-slate-400">
              {patientData ? `Age: ${patientData.age} year old| Status: ${patientData.status} | Medicines: ${patientData.medications?.length || 0}` : 'Vos traitements médicaux'}
            </p>
          </div>
          <Link
            href="/patient"
            className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
           Go Back to Home Page
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="premium-card p-4">
            <p className="text-sm text-slate-400">Total</p>
            <p className="text-2xl font-bold text-white">{totalCount}</p>
          </div>
          <div className="premium-card p-4">
            <p className="text-sm text-emerald-400">Actif</p>
            <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
          </div>
          <div className="premium-card p-4">
            <p className="text-sm text-blue-400">Finished</p>
            <p className="text-2xl font-bold text-blue-400">{completedCount}</p>
          </div>
          <div className="premium-card p-4">
            <p className="text-sm text-red-400">Canceled</p>
            <p className="text-2xl font-bold text-red-400">{cancelledCount}</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {(['all', 'active', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                console.log('Changing filter to:', status);
                setFilter(status);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : status === 'completed'
                    ? 'bg-blue-500/20 text-blue-400'
                    : status === 'cancelled'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-slate-700 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {status === 'all' ? 'All' : 
               status === 'active' ? 'Actif' :
               status === 'completed' ? 'Finished' : 'Canceled'}
            </button>
          ))}
        </div>
      </div>

      {/* Info debug */}
      <div className="mb-4 premium-card p-4 bg-slate-800/50">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-400">Filtre actuel: <span className="text-white">{filter}</span></p>
            <p className="text-sm text-slate-400">Affichage: <span className="text-cyan-400">{filteredPrescriptions.length} sur {totalCount}</span></p>
          </div>
          <button
            onClick={() => {
              console.log('=== DEBUG INFO ===');
              console.log('Patient:', patientData);
              console.log('All prescriptions:', prescriptions);
              console.log('Filtered prescriptions:', filteredPrescriptions);
              console.log('Current filter:', filter);
            }}
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            Debug
          </button>
        </div>
      </div>

      {/* Liste des prescriptions */}
      <div className="space-y-4">
        {filteredPrescriptions.length > 0 ? (
          filteredPrescriptions.map((prescription, index) => (
            <div
              key={prescription._id}
              className="premium-card p-6 hover:bg-slate-800/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500/30 flex items-center justify-center mr-4 transition-colors">
                    <i className="fas fa-pills text-emerald-400 text-xl"></i>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-slate-500">#{index + 1}</span>
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {prescription.medication_name}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-slate-400 bg-slate-800 px-2 py-1 rounded">
                        <i className="fas fa-syringe mr-1"></i>
                        {prescription.dosage}
                      </span>
                      <span className="text-sm text-slate-400 bg-slate-800 px-2 py-1 rounded">
                        <i className="fas fa-clock mr-1"></i>
                        {prescription.frequency}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  prescription.status === 'active' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : prescription.status === 'completed'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {prescription.status === 'active' ? 'Actif' : 
                   prescription.status === 'completed' ? 'Terminé' : 'Annulé'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">
                    <i className="fas fa-calendar-check mr-2"></i>
                    Début traitement
                  </p>
                  <p className="text-white font-medium">
                    {new Date(prescription.start_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">
                    <i className="fas fa-calendar-times mr-2"></i>
                    Fin traitement
                  </p>
                  <p className="text-white font-medium">
                    {new Date(prescription.end_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">
                    <i className="fas fa-user-md mr-2"></i>
                    Prescrit par
                  </p>
                  <p className="text-white font-medium">{prescription.doctor_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">
                    <i className="fas fa-history mr-2"></i>
                    Durée restante
                  </p>
                  <p className="text-white font-medium">
                    {Math.max(0, Math.ceil((new Date(prescription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} jours
                  </p>
                </div>
              </div>

              {prescription.instructions && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-400 mb-2">
                    <i className="fas fa-info-circle mr-2"></i>
                    Instructions importantes :
                  </p>
                  <p className="text-white">{prescription.instructions}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="premium-card p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-prescription-bottle-alt text-3xl text-slate-600"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aucune prescription trouvée</h3>
            <p className="text-slate-400 mb-4">
              Filtre: "{filter}" | Total prescriptions: {prescriptions.length}
            </p>
            {prescriptions.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-300">Prescriptions disponibles mais filtrées:</p>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  {prescriptions.map(p => (
                    <div key={p._id} className="flex justify-between items-center text-sm text-slate-400 py-1">
                      <span>{p.medication_name}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        p.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                        p.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setFilter('all')}
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors mt-2"
                >
                  Voir toutes les prescriptions ({prescriptions.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section info patient */}
      {patientData && (
        <div className="mt-8 premium-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <i className="fas fa-user-circle mr-3 text-cyan-400"></i>
            Informations patient
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-400">FullName</p>
              <p className="text-white font-medium">{patientData.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Age</p>
              <p className="text-white font-medium">{patientData.age} ans</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Medical Status</p>
              <p className={`font-medium ${patientData.status === 'stable' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {patientData.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Medicines</p>
              <p className="text-white font-medium">{patientData.medications?.length || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}