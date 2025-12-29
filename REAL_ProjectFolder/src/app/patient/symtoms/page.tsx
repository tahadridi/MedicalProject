// app/(patient)/symptoms/page.tsx
'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  List, 
  ListItem, 
  ListItemText, 
  Stack, 
  CircularProgress, 
  Alert, 
  Container,
  alpha 
} from '@mui/material';
import { PsychologyAlt, Save, Warning, CheckCircle } from '@mui/icons-material';

interface SymptomAnalysisResult {
  probableDiagnosis: string[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
}

const SymptomsPage: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [analysisResult, setAnalysisResult] = useState<SymptomAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedToRecord, setSavedToRecord] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyzeSymptoms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError("Veuillez décrire vos symptômes.");
      setAnalysisResult(null);
      return;
    }

    setLoading(true);
    setError('');
    setAnalysisResult(null);
    setSavedToRecord(false);

    // Simulation d'une analyse
    await new Promise(resolve => setTimeout(resolve, 2000));

    let result: SymptomAnalysisResult;
    const symptomsLower = symptoms.toLowerCase();

    if (symptomsLower.includes('fièvre') && symptomsLower.includes('toux')) {
      result = {
        probableDiagnosis: ['Infection respiratoire', 'Grippe', 'Refroidissement'],
        recommendations: ['Repos', 'Hydratation abondante', 'Paracétamol si nécessaire', 'Surveillance de la température'],
        severity: 'medium',
      };
    } else if (symptomsLower.includes('maux de tête') && symptomsLower.includes('nausée')) {
      result = {
        probableDiagnosis: ['Migraine', 'Tension artérielle', 'Problème digestif'],
        recommendations: ['Repos dans un endroit calme', 'Hydratation', 'Consulter si persistant'],
        severity: 'medium',
      };
    } else if (symptomsLower.includes('douleur thoracique') || symptomsLower.includes('essoufflement')) {
      result = {
        probableDiagnosis: ['Problème cardiaque possible', 'Anxiété', 'Problème pulmonaire'],
        recommendations: ['Consulter un médecin rapidement', 'Repos immédiat', 'Appeler les urgences si sévère'],
        severity: 'high',
      };
    } else {
      result = {
        probableDiagnosis: ['Indisposition générale', 'Fatigue', 'Stress'],
        recommendations: ['Repos suffisant', 'Alimentation équilibrée', 'Hydratation'],
        severity: 'low',
      };
    }

    setAnalysisResult(result);
    setLoading(false);
  };

  const handleSaveToMedicalRecord = async () => {
    if (!analysisResult) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSavedToRecord(true);
    setLoading(false);
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return <CheckCircle sx={{ color: '#10b981' }} />;
      case 'medium': return <Warning sx={{ color: '#f59e0b' }} />;
      case 'high': return <Warning sx={{ color: '#ef4444' }} />;
      default: return <Warning />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <PsychologyAlt sx={{ fontSize: 60, color: '#67e8f9', mb: 2 }} />
        <Typography variant="h2" sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(135deg, #67e8f9 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2
        }}>
          Analyse des Symptômes
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>
          Décrivez vos symptômes pour obtenir une analyse préliminaire et des recommandations
        </Typography>
      </Box>

      {/* Input Section */}
      <Card sx={{ 
        mb: 4, 
        p: 4,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px'
      }}>
        <form onSubmit={handleAnalyzeSymptoms}>
          <TextField
            label="Décrivez vos symptômes en détail"
            placeholder="Ex: J'ai de la fièvre depuis 2 jours (38.5°C), une toux sèche et des courbatures. Je me sens fatigué."
            multiline
            minRows={4}
            fullWidth
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '& fieldset': { 
                  borderColor: 'rgba(255,255,255,0.2)',
                  borderWidth: '2px'
                },
                '&:hover fieldset': { 
                  borderColor: '#67e8f9',
                },
                '&.Mui-focused fieldset': { 
                  borderColor: '#3b82f6',
                },
                backgroundColor: 'rgba(255,255,255,0.02)',
              },
              '& .MuiInputLabel-root': { 
                color: 'rgba(255,255,255,0.6)',
                fontSize: '1.1rem'
              },
              '& .MuiInputBase-input': { 
                color: 'white',
                fontSize: '1rem',
              },
            }}
          />
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PsychologyAlt />}
            fullWidth
            sx={{
              py: 2,
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 600,
              background: "linear-gradient(135deg, #67e8f9 0%, #3b82f6 100%)",
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(59, 130, 246, 0.6)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Analyse en cours...' : 'Analyser les Symptômes'}
          </Button>
        </form>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 3, 
              borderRadius: '12px',
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'white',
              '& .MuiAlert-icon': { color: '#ef4444' }
            }}
          >
            {error}
          </Alert>
        )}
      </Card>

      {/* Results Section */}
      {analysisResult && (
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: 'white', 
              fontWeight: 700,
              mb: 3,
              textAlign: 'center'
            }}
          >
            Résultats de lAnalyse
          </Typography>

          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* Severity Card */}
            <Card sx={{ 
              p: 3,
              background: `linear-gradient(135deg, ${alpha(getSeverityColor(analysisResult.severity), 0.1)} 0%, rgba(255,255,255,0.05) 100%)`,
              border: `1px solid ${alpha(getSeverityColor(analysisResult.severity), 0.3)}`,
              borderRadius: '16px'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {getSeverityIcon(analysisResult.severity)}
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  Niveau de Sévérité
                </Typography>
              </Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: getSeverityColor(analysisResult.severity),
                  fontWeight: 700,
                  textAlign: 'center'
                }}
              >
                {analysisResult.severity === 'low' && 'FAIBLE - Surveillance recommandée'}
                {analysisResult.severity === 'medium' && 'MODÉRÉ - Consultation conseillée'}
                {analysisResult.severity === 'high' && 'ÉLEVÉ - Consultation urgente recommandée'}
              </Typography>
            </Card>

            {/* Diagnosis Card */}
            <Card sx={{ 
              p: 3,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px'
            }}>
              <Typography variant="h6" sx={{ color: '#67e8f9', fontWeight: 600, mb: 2 }}>
                🔍 Diagnostics Probables
              </Typography>
              <List>
                {analysisResult.probableDiagnosis.map((diag, idx) => (
                  <ListItem key={idx} sx={{ py: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: '#67e8f9',
                        flexShrink: 0
                      }} />
                      <ListItemText 
                        primary={diag}
                        primaryTypographyProps={{ 
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: '1rem'
                        }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Card>

            {/* Recommendations Card */}
            <Card sx={{ 
              p: 3,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px'
            }}>
              <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 600, mb: 2 }}>
                💡 Recommandations
              </Typography>
              <List>
                {analysisResult.recommendations.map((rec, idx) => (
                  <ListItem key={idx} sx={{ py: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: '#10b981',
                        flexShrink: 0
                      }} />
                      <ListItemText 
                        primary={rec}
                        primaryTypographyProps={{ 
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: '1rem'
                        }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Card>

            {/* Save Button */}
            <Button
              variant="contained"
              onClick={handleSaveToMedicalRecord}
              disabled={loading || savedToRecord}
              startIcon={savedToRecord ? <CheckCircle /> : (loading ? <CircularProgress size={20} color="inherit" /> : <Save />)}
              fullWidth
              sx={{
                py: 2,
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 600,
                background: savedToRecord 
                  ? "linear-gradient(135deg, #10b981 0%, #047857 100%)"
                  : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                boxShadow: savedToRecord 
                  ? '0 8px 25px rgba(16, 185, 129, 0.4)'
                  : '0 8px 25px rgba(139, 92, 246, 0.4)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: savedToRecord 
                    ? '0 12px 35px rgba(16, 185, 129, 0.6)'
                    : '0 12px 35px rgba(139, 92, 246, 0.6)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {savedToRecord ? 'Sauvegardé dans le dossier médical !' : 'Sauvegarder dans le dossier médical'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Disclaimer */}
      <Card sx={{ 
        mt: 3,
        p: 3,
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px'
      }}>
        <Typography variant="subtitle2" sx={{ color: '#67e8f9', fontWeight: 600, mb: 1 }}>
          ⚠️ Avertissement Important
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Cette analyse est fournie à titre informatif uniquement et ne remplace pas lavis dun professionnel de santé. 
          En cas de symptômes graves ou persistants, consultez immédiatement un médecin.
        </Typography>
      </Card>
    </Container>
  );
};

export default SymptomsPage;