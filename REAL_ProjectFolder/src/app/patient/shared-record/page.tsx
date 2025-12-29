'use client';

import React, { useState } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, Link as MuiLink, CircularProgress,Card} from '@mui/material';
import Link from 'next/link';
 // Custom Card

interface MedicalRecordSection {
  title: string;
  content: string | string[];
  icon?: string; // Added for icons
  color?: string; // Added for accent colors
}

const SharedRecordPage: React.FC = () => {
  const [record, setRecord] = useState<MedicalRecordSection[]>([
    { title: 'Informations Personnelles', content: 'Nom: Dupont, Jean\nDate de naissance: 01/01/1980\nGroupe sanguin: A+', icon: 'fas fa-user', color: 'primary.light' },
    { title: 'Antécédents Médicaux', content: ['Allergies: Pénicilline', 'Maladies chroniques: Aucune connue'], icon: 'fas fa-history', color: 'secondary.light' },
    { title: 'Dernière Analyse de Symptômes', content: 'Description: Fièvre légère, fatigue\nDiagnostic probable: Refroidissement\nRecommandations: Repos, hydratation (enregistré le: 2023-10-26)', icon: 'fas fa-chart-bar', color: 'success.light' },
    { title: 'Vaccinations', content: ['COVID-19: 3 doses', 'Grippe: Annuelle'], icon: 'fas fa-syringe', color: 'info.light' },
  ]);

  const [loading, setLoading] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  const handleGrantAccess = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAccessGranted(true);
    setLoading(false);
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, sm: 4, md: 0 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Mon Dossier Médical Partagé
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom mb={4}>
        Accédez à votre dossier médical consolidé et partagé avec les professionnels de santé.
      </Typography>

      {!accessGranted ? (
        <Card sx={{ maxWidth: 600, mt: 3, p: 3 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Pour des raisons de sécurité, votre dossier médical partagé nécessite une autorisation pour être consulté.
            Veuillez cliquer sur le bouton ci-dessous pour y accéder (simulation).
          </Typography>
          <Button variant="contained" onClick={handleGrantAccess} disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Accès en cours...' : 'Accéder à mon Dossier'}
          </Button>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(280px, 1fr))' },
            gap: 3,
            mt: 2,
          }}
        >
          {record.map((section, index) => (
            <Card key={index} sx={{ p: 3, borderLeft: '4px solid', borderColor: section.color || 'primary.main' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                {section.icon && <i className={`${section.icon} mr-3`} style={{ color: section.color || 'white' }}></i>}
                {section.title}
              </Typography>
              {Array.isArray(section.content) ? (
                <List dense sx={{ pl: 0 }}>
                  {section.content.map((item, idx) => (
                    <ListItem key={idx} disableGutters sx={{ py: 0.5, '& .MuiListItemText-primary': { color: 'text.secondary' } }}>
                      <ListItemText primary={`• ${item}`} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {section.content}
                </Typography>
              )}
            </Card>
          ))}

          <Card sx={{ p: 3, borderLeft: '4px solid', borderColor: 'warning.main' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-folder-open text-warning.main mr-3"></i>
              Rapports Téléversés Récemment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Voir tous les{' '}
              <MuiLink component={Link} href="/medical-reports" underline="hover" color="primary">
                rapports médicaux
              </MuiLink>{' '}
              et{' '}
              <MuiLink component={Link} href="/prescriptions" underline="hover" color="primary">
                ordonnances
              </MuiLink>
              .
            </Typography>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default SharedRecordPage;