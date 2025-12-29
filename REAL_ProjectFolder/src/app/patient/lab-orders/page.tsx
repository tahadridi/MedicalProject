// app/patient/lab-orders/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LabOrder {
  _id?: string;
  test_name: string;
  ordered_by: string;
  order_date: string;
  status: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'routine' | 'urgent' | 'stat';
  instructions?: string;
  lab_location?: string;
  appointment_date?: string;
  notes?: string;
}

export default function LabOrdersPage() {
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ordered' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!storedToken || !storedUser) {
          router.push('/login');
          return;
        }

        const patientId = localStorage.getItem('patientId');
        
        if (!patientId) {
          console.error('No patient ID found');
          router.push('/login');
          return;
        }

        // Récupérer les données du patient
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
            return;
          }
          
          if (patient) {
            setPatientData(patient);
            
            console.log('✅ Patient data loaded:', patient.name);
            console.log('📋 Patient labOrders:', patient.labOrders);
            console.log('📋 LabOrders count:', patient.labOrders?.length || 0);
            console.log('📋 LabOrders details:', patient.labOrders);
            
            // Transformer les lab orders en format d'affichage
            if (patient.labOrders && patient.labOrders.length > 0) {
              console.log(`🔍 Processing ${patient.labOrders.length} lab orders`);
              
              const transformedOrders = patient.labOrders.map((order: any, index: number) => {
                console.log(`📋 Lab order ${index + 1}:`, order);
                
                return {
                  _id: order._id || `order_${index}`,
                  test_name: order.test_name || 'Test non spécifié',
                  ordered_by: order.ordered_by || 'Dr. Inconnu',
                  order_date: order.order_date ? new Date(order.order_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  status: order.status || 'ordered',
                  priority: order.priority || 'routine',
                  instructions: order.instructions || order.instructions,
                  lab_location: order.lab_location || 'Laboratoire non spécifié',
                  appointment_date: order.appointment_date,
                  notes: order.notes || `Commande créée le ${new Date().toLocaleDateString('fr-FR')}`
                };
              });
              
              console.log('📋 Transformed lab orders:', transformedOrders);
              console.log('📋 Total lab orders created:', transformedOrders.length);
              setLabOrders(transformedOrders);
            } else {
              console.log('⚠️ No lab orders found for patient');
            }
          }
        } else {
          console.error('❌ Failed to fetch patient data:', response.status);
        }

      } catch (error) {
        console.error('❌ Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Calculer les statistiques
  const orderedCount = labOrders.filter(o => o.status === 'ordered').length;
  const inProgressCount = labOrders.filter(o => o.status === 'in_progress').length;
  const completedCount = labOrders.filter(o => o.status === 'completed').length;
  const cancelledCount = labOrders.filter(o => o.status === 'cancelled').length;
  const totalCount = labOrders.length;

  console.log('📊 Stats - Total:', totalCount, 'Ordered:', orderedCount, 'Filtered:', filter);

  // Filtrer les commandes
  const filteredOrders = labOrders.filter(order => 
    filter === 'all' || order.status === filter
  );

  // Formater la date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Non programmé';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ordered': return 'bg-yellow-500/20 text-yellow-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'ordered': return 'Prescrite';
      case 'in_progress': return 'In progress';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400';
      case 'stat': return 'bg-red-500/30 text-red-300';
      case 'routine': return 'bg-slate-500/20 text-slate-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-clinical-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement de vos commandes de laboratoire...</p>
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
              My laboratory orders ({totalCount})
              {patientData && (
                <span className="text-cyan-400 ml-2 text-lg">
                  - {patientData.name}
                </span>
              )}
            </h1>
            <p className="text-slate-400">
              {patientData ? `Age: ${patientData.age} year old| Status: ${patientData.status} | Orders: ${patientData.labOrders?.length || 0}` : 'Suivez vos analyses prescrites par le médecin'}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="premium-card p-4">
            <p className="text-sm text-slate-400">Total commandes</p>
            <p className="text-2xl font-bold text-white">{totalCount}</p>
          </div>
          <div className="premium-card p-4">
            <p className="text-sm text-yellow-400">Prescrites</p>
            <p className="text-2xl font-bold text-yellow-400">{orderedCount}</p>
          </div>
          <div className="premium-card p-4">
            <p className="text-sm text-blue-400">In progress</p>
            <p className="text-2xl font-bold text-blue-400">{inProgressCount}</p>
          </div>
          <div className="premium-card p-4">
            <p className="text-sm text-emerald-400">Finished</p>
            <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
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
          {(['all', 'ordered', 'in_progress', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                console.log('Changing filter to:', status);
                setFilter(status);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? status === 'ordered'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : status === 'in_progress'
                    ? 'bg-blue-500/20 text-blue-400'
                    : status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : status === 'cancelled'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-slate-700 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {status === 'all' ? 'Toutes' : 
               status === 'ordered' ? 'Prescrites' :
               status === 'in_progress' ? 'In progress' :
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
            <p className="text-sm text-slate-400">Affichage: <span className="text-cyan-400">{filteredOrders.length} sur {totalCount}</span></p>
            {patientData && (
              <p className="text-sm text-slate-400">Dans la base: <span className="text-emerald-400">{patientData.labOrders?.length || 0} commandes</span></p>
            )}
          </div>
          <button
            onClick={() => {
              console.log('=== DEBUG INFO ===');
              console.log('Patient:', patientData);
              console.log('All lab orders:', labOrders);
              console.log('Filtered orders:', filteredOrders);
              console.log('Current filter:', filter);
            }}
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            Debug
          </button>
        </div>
      </div>

      {/* Liste des commandes de labo */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <div
              key={order._id}
              className="premium-card p-6 hover:bg-slate-800/50 transition-colors group border-l-4 border-cyan-500/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 group-hover:bg-cyan-500/30 flex items-center justify-center mr-4 transition-colors">
                    <i className="fas fa-vial text-cyan-400 text-xl"></i>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-slate-500">#{index + 1}</span>
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {order.test_name}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-slate-400 bg-slate-800 px-2 py-1 rounded">
                        <i className="fas fa-user-md mr-1"></i>
                        Prescrit par: {order.ordered_by}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded ${getPriorityColor(order.priority)}`}>
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {order.priority === 'urgent' ? 'Urgent' : order.priority === 'stat' ? 'Stat' : 'Routine'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">
                    <i className="fas fa-calendar-alt mr-2"></i>
                    Prescription date
                  </p>
                  <p className="text-white font-medium">
                    {formatDate(order.order_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    Laboratory location
                  </p>
                  <p className="text-white font-medium">{order.lab_location}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">
                    <i className="fas fa-calendar-check mr-2"></i>
                    Appointment date
                  </p>
                  <p className="text-white font-medium">
                    {formatDate(order.appointment_date)}
                  </p>
                </div>
              </div>

              {order.instructions && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-400 mb-2">
                    <i className="fas fa-info-circle mr-2"></i>
                    Instructions :
                  </p>
                  <p className="text-white">{order.instructions}</p>
                </div>
              )}

              {order.notes && (
                <div className="mt-3 p-3 bg-slate-900/30 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">
                    <i className="fas fa-sticky-note mr-2"></i>
                    Notes :
                  </p>
                  <p className="text-sm text-white">{order.notes}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="premium-card p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-vial text-3xl text-slate-600"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aucune commande de laboratoire</h3>
            <p className="text-slate-400 mb-4">
              Filtre: "{filter}" | Total commandes: {labOrders.length}
            </p>
            {labOrders.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-300">Orders disponibles mais filtrées:</p>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  {labOrders.map(o => (
                    <div key={o._id} className="flex justify-between items-center text-sm text-slate-400 py-1">
                      <span>{o.test_name}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(o.status)}`}>
                        {getStatusText(o.status)}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setFilter('all')}
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors mt-2"
                >
                  Voir toutes les commandes ({labOrders.length})
                </button>
              </div>
            )}
            {patientData && patientData.labOrders && patientData.labOrders.length === 0 && (
              <div className="mt-4 p-4 bg-cyan-500/10 rounded-lg">
                <p className="text-sm text-cyan-400">
                  <i className="fas fa-info-circle mr-2"></i>
                  Contactez votre médecin pour obtenir une prescription d'analyse
                </p>
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
              <p className="text-sm text-slate-400">Orders de labo</p>
              <p className="text-white font-medium">{patientData.labOrders?.length || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}