// src/app/(patient)/layout.tsx
'use client';

import React from 'react';
// IMPORTANT : Vérifie bien le chemin vers ton composant Layout
// Comme tu es dans app/(patient), il faut remonter de 2 niveaux pour trouver 'components'
import Layout from '../components/Layout'; 

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}