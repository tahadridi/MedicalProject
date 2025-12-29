// src/app/(patient)/prescriptions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Prescription {
  _id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  doctor_name: string;
  doctor_speciality: string;
  instructions?: string;
  refills_remaining: number;
  prescribed_date: string;
}

export default function PrescriptionsPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const patientId = localStorage.getItem('patientId');
      
      const response = await fetch(`/api/prescriptions/patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data.prescriptions || []);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(pres => {
    if (filter === 'all') return true;
    return pres.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-clinical-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement des ordonnances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clinical-midnight py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/patient"
            className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
           Go Back to Home Page
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">My Prescriptions</h1>
          <p className="text-slate-400 mt-2">Consultez tous vos médicaments prescrits</p>
        </div>

        {/* Filters */}
        <div className="premium-card p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            {[
              { value: 'all', label: 'Toutes', count: prescriptions.length },
              { value: 'active', label: 'Activ', count: prescriptions.filter(p => p.status === 'active').length },
              { value: 'completed', label: 'Finished', count: prescriptions.filter(p => p.status === 'completed').length },
              { value: 'cancelled', label: 'Canceled', count: prescriptions.filter(p => p.status === 'cancelled').length },
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value as any)}
                className={`px-4 py-2 rounded-full transition-all flex items-center space-x-2 ${
                  filter === filterOption.value
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{filterOption.label}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  filter === filterOption.value
                    ? 'bg-white/20'
                    : 'bg-slate-700'
                }`}>
                  {filterOption.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-6">
          {filteredPrescriptions.length > 0 ? (
            filteredPrescriptions.map((prescription) => (
              <div key={prescription._id} className="premium-card p-6 hover:border-cyan-400/30 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                      <i className="fas fa-pills text-emerald-400"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{prescription.medication_name}</h3>
                      <p className="text-sm text-slate-400">{prescription.dosage} • {prescription.frequency}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(prescription.status)}`}>
                    {getStatusLabel(prescription.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-slate-800/50">
                    <p className="text-sm text-slate-400">Période</p>
                    <p className="font-medium text-white">
                      {new Date(prescription.start_date).toLocaleDateString('fr-FR')} - {new Date(prescription.end_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-xl bg-slate-800/50">
                    <p className="text-sm text-slate-400">Prescrit par</p>
                    <p className="font-medium text-white">{prescription.doctor_name}</p>
                    <p className="text-xs text-slate-400">{prescription.doctor_speciality}</p>
                  </div>
                  
                  <div className="p-3 rounded-xl bg-slate-800/50">
                    <p className="text-sm text-slate-400">Renouvellements</p>
                    <p className="font-medium text-white">{prescription.refills_remaining} restant(s)</p>
                  </div>
                </div>

                {prescription.instructions && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-400 mb-1">Instructions</p>
                    <p className="text-white">{prescription.instructions}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    <i className="fas fa-print mr-2"></i>
                    Imprimer
                  </button>
                  <button
                    onClick={() => alert('Fonctionnalité de renouvellement à venir')}
                    disabled={prescription.status !== 'active' || prescription.refills_remaining <= 0}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    Demander un renouvellement
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="premium-card p-12 text-center">
              <i className="fas fa-prescription text-6xl text-slate-600 mb-4"></i>
              <h3 className="text-xl font-bold text-white mb-2">Aucune ordonnance trouvée</h3>
              <p className="text-slate-400 mb-6">
                {filter === 'all' 
                  ? "Vous n'avez pas encore d'ordonnances"
                  : `Aucune ordonnance ${filter === 'active' ? 'active' : filter === 'completed' ? 'terminée' : 'annulée'}`}
              </p>
              <Link
                href="/patient/appointments/new"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold inline-block hover:shadow-lg transition-all"
              >
                <i className="fas fa-calendar-plus mr-2"></i>
                Prendre un rendez-vous
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}