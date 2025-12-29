// app/patient/medical-reports/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  List, 
  ListItem, 
  Button,
  alpha,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MedicationIcon from '@mui/icons-material/Medication';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useRouter } from 'next/navigation';

interface LabResult {
  _id?: string;
  test: string;
  value: string;
  status: string;
  date: Date | string;
  notes?: string;
  labName?: string;
}

interface VitalSign {
  _id?: string;
  name: string;
  value: string;
  status: string;
  date: Date | string;
}

interface Medication {
  _id?: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date | string;
}

interface MedicalHistory {
  _id?: string;
  date: Date | string;
  diagnosis: string;
  treatment: string;
  notes: string;
}
interface HealthProfileData {
  height: number;
  weight: number;
  bloodType: string;
  allergies: string;
  allergiesDetails?: string;
  chronic: string;
  chronicDetails?: string;
  smoking: string;
  alcohol: string;
  activity: string;
  gender: string;
}
interface PatientData {
  _id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  labResults: LabResult[];
  vitalSigns: VitalSign[];
  medications: Medication[];
  medicalHistory: MedicalHistory[];
  lastBp: string;
  status: string;
  risk: string;
  healthProfile?: HealthProfileData;
}

const MedicalReportsPage: React.FC = () => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

 useEffect(() => {
  const loadPatientData = async () => {
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
        setError('ID patient non trouvé');
        return;
      }

      console.log('🟢 Loading patient data for ID:', patientId);

      // Fetch patient data
      const response = await fetch(`/api/patients/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📦 Response Status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Full API Response:', result);
        
        // Check if result has success property (new format) or is direct patient (old format)
        if (result.success && result.patient) {
          // New format: {success: true, patient: {...}, healthProfile: {...}}
          const patientData = {
            ...result.patient,
            healthProfile: result.healthProfile || undefined
          };
          setPatientData(patientData);
        } else if (result._id) {
          // Old format: direct patient object
          console.log('⚠️ Using old API format, converting...');
          const patientData = {
            _id: result._id,
            name: result.name,
            age: result.age,
            email: result.email,
            phone: result.phone || "",
            labResults: result.labResults || [],
            vitalSigns: result.vitalSigns || [],
            medications: result.medications || [],
            medicalHistory: result.medicalHistory || [],
            lastBp: result.lastBp || "N/A",
            status: result.status || "unknown",
            risk: result.risk || "unknown"
            // healthProfile will be fetched separately
          };
          
          // Still try to fetch health profile separately
try {
  // Get email from patient data
  const userEmail = patientData.email;
  
  // Get CIN from localStorage
  let userCin = null;
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      userCin = user.cin;
    }
  } catch (e) {
    console.warn('Could not parse user from localStorage:', e);
  }
  
  console.log('🩺 Fetching health profile for:', { email: userEmail, cin: userCin });
  
  const healthProfileResponse = await fetch('/api/health/get', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${storedToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      email: userEmail,
      cin: userCin 
    })
  });
  
  console.log('🩺 Health profile response status:', healthProfileResponse.status);
  
  if (healthProfileResponse.ok) {
    const healthProfileResult = await healthProfileResponse.json();
    console.log('🩺 Health profile result:', healthProfileResult);
    
    if (healthProfileResult.success && healthProfileResult.healthProfile) {
      patientData.healthProfile = healthProfileResult.healthProfile;
      console.log('✅ HealthProfile loaded successfully');
    } else {
      console.log('ℹ️ No health profile found:', healthProfileResult.message);
    }
  } else {
    console.log('ℹ️ Health profile API error:', healthProfileResponse.status);
  }
} catch (profileError) {
  console.warn('⚠️ Error loading health profile:', profileError);
}
          
          setPatientData(patientData);
        } else {
          console.error('❌ Invalid API response format:', result);
          setError('Format de données invalide');
        }
      } else {
        const errorResult = await response.json();
        console.error('❌ HTTP Error:', response.status, errorResult);
        setError(errorResult.message || 'Erreur lors du chargement des données');
      }
    } catch (err) {
      console.error('❌ Network Error loading patient data:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  loadPatientData();
}, [router]);
// Générer un rapport médical complet avec HealthProfile
const generateCompleteMedicalReport = () => {
  if (!patientData) return null;
  
  const reportContent = `
    RAPPORT MÉDICAL COMPLET
    ========================
    
    INFORMATIONS DU PATIENT:
    -----------------------
    Nom: ${patientData.name}
    Age: ${patientData.age} ans
    ${patientData.email ? `Email: ${patientData.email}` : ''}
    ${patientData.phone ? `Téléphone: ${patientData.phone}` : ''}
    
    ${patientData.healthProfile ? `
    PROFIL DE SANTÉ:
    ----------------
    ${patientData.healthProfile.gender ? `Sexe: ${patientData.healthProfile.gender}` : ''}
    ${patientData.healthProfile.height ? `Taille: ${patientData.healthProfile.height} cm` : ''}
    ${patientData.healthProfile.weight ? `Poids: ${patientData.healthProfile.weight} kg` : ''}
    ${patientData.healthProfile.bloodType ? `Groupe sanguin: ${patientData.healthProfile.bloodType}` : ''}
    
    ${patientData.healthProfile.allergies ? `Allergies: ${patientData.healthProfile.allergies}` : ''}
    ${patientData.healthProfile.allergiesDetails ? `Détails allergies: ${patientData.healthProfile.allergiesDetails}` : ''}
    
    ${patientData.healthProfile.chronic ? `Maladies chroniques: ${patientData.healthProfile.chronic}` : ''}
    ${patientData.healthProfile.chronicDetails ? `Détails maladies: ${patientData.healthProfile.chronicDetails}` : ''}
    
    ${patientData.healthProfile.smoking ? `Tabagisme: ${patientData.healthProfile.smoking}` : ''}
    ${patientData.healthProfile.alcohol ? `Consommation d'alcool: ${patientData.healthProfile.alcohol}` : ''}
    ${patientData.healthProfile.activity ? `Niveau d'activité: ${patientData.healthProfile.activity}` : ''}
    ` : 'Profil de santé: Non disponible'}
    
    ÉTAT DE SANTÉ ACTUEL:
    ---------------------
    Status: ${patientData.status}
    Niveau de risque: ${patientData.risk}
    Dernière pression artérielle: ${patientData.lastBp}
    
    ${patientData.labResults?.length > 0 ? `
    ANALYSES DE LABORATOIRE:
    -----------------------
    ${patientData.labResults.map(result => `
    Test: ${result.test}
    Résultat: ${result.value}
    Status: ${result.status}
    Date: ${formatDate(result.date)}
    ${result.notes ? `Notes: ${result.notes}` : ''}
    `).join('\n')}
    ` : 'Aucune analyse de laboratoire disponible'}
    
    ${patientData.vitalSigns?.length > 0 ? `
    SIGNE VITAUX:
    -------------
    ${patientData.vitalSigns.map(sign => `
    Mesure: ${sign.name}
    Valeur: ${sign.value}
    Status: ${sign.status}
    Date: ${formatDate(sign.date)}
    `).join('\n')}
    ` : 'Aucun signe vital enregistré'}
    
    ${patientData.medications?.length > 0 ? `
    TRAITEMENTS ACTUELS:
    --------------------
    ${patientData.medications.map(med => `
    Médicament: ${med.name}
    Posologie: ${med.dosage}
    Fréquence: ${med.frequency}
    Début: ${formatDate(med.startDate)}
    `).join('\n')}
    ` : 'Aucun traitement enregistré'}
    
    ${patientData.medicalHistory?.length > 0 ? `
    HISTORIQUE MÉDICAL:
    -------------------
    ${patientData.medicalHistory.map(history => `
    Date: ${formatDate(history.date)}
    Diagnostic: ${history.diagnosis}
    Traitement: ${history.treatment}
    ${history.notes ? `Notes: ${history.notes}` : ''}
    `).join('\n')}
    ` : 'Aucun historique médical enregistré'}
    
    ---
    Rapport généré le: ${new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
    
    Ce document contient des informations médicales confidentielles.
    Veuillez les conserver en lieu sûr.
  `;
  
  handleDownload(reportContent, `rapport-medical-complet-${patientData.name}.txt`, 'text/plain');
};
  // Formater la date
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Télécharger un rapport
  const handleDownload = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Générer un rapport PDF pour les résultats de labo
  const generateLabReport = () => {
    if (!patientData?.labResults?.length) return null;
    
    const reportContent = `
      RAPPORT D'ANALYSES MÉDICALES
      =============================
      
      Patient: ${patientData.name}
      Age: ${patientData.age} ans
      Date du rapport: ${new Date().toLocaleDateString('fr-FR')}
      
      RÉSULTATS D'ANALYSES:
      --------------------
      ${patientData.labResults.map(result => `
      Test: ${result.test}
      Résultat: ${result.value}
      Status: ${result.status}
      Date: ${formatDate(result.date)}
      ${result.notes ? `Notes: ${result.notes}` : ''}
      `).join('\n')}
      
      Résumé: ${patientData.labResults.length} analyses effectuées
      Dernière pression artérielle: ${patientData.lastBp}
    `;
    
    handleDownload(reportContent, `rapport-analyses-${patientData.name}.txt`, 'text/plain');
  };

  // Générer un rapport pour les signes vitaux
  const generateVitalSignsReport = () => {
    if (!patientData?.vitalSigns?.length) return null;
    
    const reportContent = `
      RAPPORT DES SIGNE VITAUX
      =========================
      
      Patient: ${patientData.name}
      Date du rapport: ${new Date().toLocaleDateString('fr-FR')}
      
      SIGNE VITAUX ENREGISTRÉS:
      ------------------------
      ${patientData.vitalSigns.map(sign => `
      Mesure: ${sign.name}
      Valeur: ${sign.value}
      Status: ${sign.status}
      Date: ${formatDate(sign.date)}
      `).join('\n')}
      
      Dernière pression artérielle: ${patientData.lastBp}
      Status général: ${patientData.status}
      Niveau de risque: ${patientData.risk}
    `;
    
    handleDownload(reportContent, `signes-vitaux-${patientData.name}.txt`, 'text/plain');
  };

  // Générer un rapport pour les médicaments
  const generateMedicationsReport = () => {
    if (!patientData?.medications?.length) return null;
    
    const reportContent = `
      RAPPORT DES TRAITEMENTS
      =======================
      
      Patient: ${patientData.name}
      Date du rapport: ${new Date().toLocaleDateString('fr-FR')}
      
      TRAITEMENTS ACTUELS:
      -------------------
      ${patientData.medications.map(med => `
      Médicament: ${med.name}
      Posologie: ${med.dosage}
      Fréquence: ${med.frequency}
      Début du traitement: ${formatDate(med.startDate)}
      `).join('\n')}
      
      Total des traitements: ${patientData.medications.length}
    `;
    
    handleDownload(reportContent, `traitements-${patientData.name}.txt`, 'text/plain');
  };

  // Générer un rapport pour l'historique médical
  const generateMedicalHistoryReport = () => {
    if (!patientData?.medicalHistory?.length) return null;
    
    const reportContent = `
      HISTORIQUE MÉDICAL
      ==================
      
      Patient: ${patientData.name}
      Age: ${patientData.age} ans
      Date du rapport: ${new Date().toLocaleDateString('fr-FR')}
      
      ANTÉCÉDENTS MÉDICAUX:
      ---------------------
      ${patientData.medicalHistory.map(history => `
      Date: ${formatDate(history.date)}
      Diagnostic: ${history.diagnosis}
      Traitement: ${history.treatment}
      Notes: ${history.notes}
      `).join('\n')}
      
      Résumé: ${patientData.medicalHistory.length} événements médicaux enregistrés
    `;
    
    handleDownload(reportContent, `historique-medical-${patientData.name}.txt`, 'text/plain');
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh',
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
      }}>
        <CircularProgress sx={{ color: '#67e8f9' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3
      }}>
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!patientData) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3
      }}>
        <Alert severity="info" sx={{ maxWidth: 500 }}>
          Aucune donnée patient disponible
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
      py: 4,
      px: { xs: 2, sm: 4, md: 6 },
      position: 'relative',
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(46, 196, 182, 0.1) 0%, transparent 50%)",
        zIndex: 0,
      }
    }}>
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 1200, mx: 'auto' }}>
        
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <DescriptionIcon 
            sx={{ 
              fontSize: 64, 
              color: '#67e8f9',
              mb: 2 
            }} 
          />
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800,
              background: "linear-gradient(135deg, #67e8f9 0%, #2EC4B6 50%, #3b82f6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3rem' }
            }}
          >
            Mes Rapports Médicaux
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: "rgba(255,255,255,0.7)",
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 300
            }}
          >
            {patientData.name} - {patientData.age} ans
          </Typography>
        </Box>

        {/* Patient Summary Card */}
        <Card 
          sx={{ 
            p: 3,
            mb: 4,
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
              📋 Profil Patient
            </Typography>
            <Chip 
              label={patientData.status} 
              sx={{ 
                backgroundColor: patientData.status === 'stable' ? 'success.main' : 
                                patientData.status === 'critical' ? 'error.main' : 'warning.main',
                color: 'white',
                fontWeight: 600
              }}
            />
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                FullName
              </Typography>
              <Typography variant="h6" sx={{ color: 'white' }}>
                {patientData.name}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Age
              </Typography>
              <Typography variant="h6" sx={{ color: 'white' }}>
                {patientData.age} ans
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Dernière pression
              </Typography>
              <Typography variant="h6" sx={{ color: 'white' }}>
                {patientData.lastBp}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Niveau de risque
              </Typography>
              <Typography variant="h6" sx={{ 
                color: patientData.risk === 'low' ? '#4ade80' : 
                       patientData.risk === 'medium' ? '#fbbf24' : '#f87171' 
              }}>
                {patientData.risk}
              </Typography>
            </Box>
            {/* AJOUTEZ CES SECTIONS POUR LE HEALTHPROFILE */}
    {patientData.healthProfile && (
      <>
        <Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Groupe sanguin
          </Typography>
          <Typography variant="h6" sx={{ color: '#f87171', fontWeight: 600 }}>
            {patientData.healthProfile.bloodType || 'Non spécifié'}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Taille / Poids
          </Typography>
          <Typography variant="h6" sx={{ color: 'white' }}>
            {patientData.healthProfile.height || '--'} cm / {patientData.healthProfile.weight || '--'} kg
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Allergies
          </Typography>
          <Typography variant="h6" sx={{ color: '#fbbf24' }}>
            {patientData.healthProfile.allergies === 'none' ? 'Aucune' : patientData.healthProfile.allergies || 'Non spécifié'}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Tabagisme
          </Typography>
          <Typography variant="h6" sx={{ 
            color: patientData.healthProfile.smoking === 'no' ? '#4ade80' : '#f87171' 
          }}>
            {patientData.healthProfile.smoking === 'no' ? 'Non-fumeur' : 'Fumeur'}
          </Typography>
        </Box>
      </>
    )}
 
          </Box>
        </Card>
{patientData.healthProfile && (
  <Card 
    sx={{ 
      p: 3,
      mb: 4,
      borderRadius: '20px',
      background: 'rgba(46, 196, 182, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(46, 196, 182, 0.3)',
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h5" sx={{ color: '#2EC4B6', fontWeight: 600 }}>
        🩺 Profil de Santé
      </Typography>
    </Box>
    
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
      <Box>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Sexe
        </Typography>
        <Typography variant="h6" sx={{ color: 'white' }}>
          {patientData.healthProfile.gender === 'male' ? 'Masculin' : 'Féminin'}
        </Typography>
      </Box>
      
      <Box>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          IMC (Indice de Masse Corporelle)
        </Typography>
        <Typography variant="h6" sx={{ color: 'white' }}>
          {patientData.healthProfile.height && patientData.healthProfile.weight 
            ? (patientData.healthProfile.weight / Math.pow(patientData.healthProfile.height/100, 2)).toFixed(1)
            : '--'}
        </Typography>
      </Box>
      
      <Box>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Maladies chroniques
        </Typography>
        <Typography variant="h6" sx={{ color: '#fbbf24' }}>
          {patientData.healthProfile.chronic === 'none' ? 'Aucune' : patientData.healthProfile.chronic}
        </Typography>
      </Box>
      
      <Box>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Activité physique
        </Typography>
        <Typography variant="h6" sx={{ color: 'white' }}>
          {patientData.healthProfile.activity === 'light' ? 'Légère' : 
           patientData.healthProfile.activity === 'moderate' ? 'Modérée' : 
           patientData.healthProfile.activity === 'intense' ? 'Intense' : 
           patientData.healthProfile.activity || 'Non spécifié'}
        </Typography>
      </Box>
    </Box>
  </Card>
)}
        {/* Rapports Section */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
          
          {/* Analyses de Laboratoire */}
          <Card 
            sx={{ 
              p: 3,
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BloodtypeIcon sx={{ color: '#f87171', fontSize: 32 }} />
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                  Analyses de Laboratoire
                </Typography>
              </Box>
              <Chip 
                label={`${patientData.labResults?.length || 0} résultats`} 
                sx={{ backgroundColor: 'rgba(248, 113, 113, 0.2)', color: '#f87171' }}
              />
            </Box>

            {patientData.labResults?.length > 0 ? (
              <>
                <List sx={{ p: 0, mb: 3 }}>
                  {patientData.labResults.slice(0, 3).map((result, index) => (
                    <ListItem
                      key={result._id || index}
                      sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500 }}>
                          {result.test}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          Résultat: {result.value} • {formatDate(result.date)}
                        </Typography>
                      </Box>
                      <Chip 
                        label={result.status} 
                        size="small"
                        sx={{ 
                          backgroundColor: result.status === 'normal' ? 'rgba(74, 222, 128, 0.2)' : 
                                        result.status === 'abnormal' ? 'rgba(248, 113, 113, 0.2)' : 
                                        'rgba(251, 191, 36, 0.2)',
                          color: result.status === 'normal' ? '#4ade80' : 
                                result.status === 'abnormal' ? '#f87171' : '#fbbf24'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={generateLabReport}
                  disabled={!patientData.labResults?.length}
                  sx={{
                    borderRadius: '12px',
                    borderColor: 'rgba(248, 113, 113, 0.5)',
                    color: '#f87171',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#f87171',
                      background: 'rgba(248, 113, 113, 0.1)',
                    }
                  }}
                >
                  Télécharger le rapport complet
                </Button>
              </>
            ) : (
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', py: 4 }}>
                Aucune analyse de laboratoire disponible
              </Typography>
            )}
          </Card>

          {/* Signes Vitaux */}
          <Card 
            sx={{ 
              p: 3,
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MonitorHeartIcon sx={{ color: '#60a5fa', fontSize: 32 }} />
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                  Signes Vitaux
                </Typography>
              </Box>
              <Chip 
                label={`${patientData.vitalSigns?.length || 0} mesures`} 
                sx={{ backgroundColor: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' }}
              />
            </Box>

            {patientData.vitalSigns?.length > 0 ? (
              <>
                <List sx={{ p: 0, mb: 3 }}>
                  {patientData.vitalSigns.slice(0, 3).map((sign, index) => (
                    <ListItem
                      key={sign._id || index}
                      sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500 }}>
                          {sign.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          Valeur: {sign.value} • {formatDate(sign.date)}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={generateVitalSignsReport}
                  disabled={!patientData.vitalSigns?.length}
                  sx={{
                    borderRadius: '12px',
                    borderColor: 'rgba(96, 165, 250, 0.5)',
                    color: '#60a5fa',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#60a5fa',
                      background: 'rgba(96, 165, 250, 0.1)',
                    }
                  }}
                >
                  Télécharger le rapport complet
                </Button>
              </>
            ) : (
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', py: 4 }}>
                Aucun signe vital enregistré
              </Typography>
            )}
          </Card>

          {/* Traitements */}
          <Card 
            sx={{ 
              p: 3,
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MedicationIcon sx={{ color: '#34d399', fontSize: 32 }} />
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                  Traitements
                </Typography>
              </Box>
              <Chip 
                label={`${patientData.medications?.length || 0} médicaments`} 
                sx={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}
              />
            </Box>

            {patientData.medications?.length > 0 ? (
              <>
                <List sx={{ p: 0, mb: 3 }}>
                  {patientData.medications.slice(0, 3).map((med, index) => (
                    <ListItem
                      key={med._id || index}
                      sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500 }}>
                          {med.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {med.dosage} • {med.frequency} • Début: {formatDate(med.startDate)}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={generateMedicationsReport}
                  disabled={!patientData.medications?.length}
                  sx={{
                    borderRadius: '12px',
                    borderColor: 'rgba(52, 211, 153, 0.5)',
                    color: '#34d399',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#34d399',
                      background: 'rgba(52, 211, 153, 0.1)',
                    }
                  }}
                >
                  Télécharger le rapport complet
                </Button>
              </>
            ) : (
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', py: 4 }}>
                Aucun traitement enregistré
              </Typography>
            )}
          </Card>

          {/* Historique Médical */}
          <Card 
            sx={{ 
              p: 3,
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EventNoteIcon sx={{ color: '#a78bfa', fontSize: 32 }} />
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                  Historique Médical
                </Typography>
              </Box>
              <Chip 
                label={`${patientData.medicalHistory?.length || 0} événements`} 
                sx={{ backgroundColor: 'rgba(167, 139, 250, 0.2)', color: '#a78bfa' }}
              />
            </Box>

            {patientData.medicalHistory?.length > 0 ? (
              <>
                <List sx={{ p: 0, mb: 3 }}>
                  {patientData.medicalHistory.slice(0, 3).map((history, index) => (
                    <ListItem
                      key={history._id || index}
                      sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500 }}>
                          {history.diagnosis}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {formatDate(history.date)} • Traitement: {history.treatment}
                        </Typography>
                        {history.notes && (
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 0.5 }}>
                            {history.notes}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={generateMedicalHistoryReport}
                  disabled={!patientData.medicalHistory?.length}
                  sx={{
                    borderRadius: '12px',
                    borderColor: 'rgba(167, 139, 250, 0.5)',
                    color: '#a78bfa',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#a78bfa',
                      background: 'rgba(167, 139, 250, 0.1)',
                    }
                  }}
                >
                  Télécharger le rapport complet
                </Button>
              </>
            ) : (
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', py: 4 }}>
                Aucun historique médical enregistré
              </Typography>
            )}
          </Card>
        </Box>

        {/* Information Card */}
        <Card 
          sx={{ 
            mt: 4,
            p: 3,
            borderRadius: '16px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#67e8f9', fontWeight: 600, mb: 1 }}>
            💡 Information
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Toutes vos données médicales sont stockées de manière sécurisée et cryptée. 
            Vous pouvez consulter et télécharger vos rapports à tout moment. 
            Pour des versions PDF plus détaillées, veuillez contacter votre médecin.
          </Typography>
        </Card>
      </Box>
    </Box>
  );
};

export default MedicalReportsPage;