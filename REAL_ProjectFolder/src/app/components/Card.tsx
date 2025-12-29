// app/src/components/Card.tsx
import React, { ReactNode } from 'react';
import { Card as MuiCard, CardContent, Typography, alpha } from '@mui/material';

interface CardProps {
  children: ReactNode;
  title?: string;
  variant?: 'default' | 'glass' | 'gradient';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  variant = 'glass',
  padding = 'medium'
}) => {
  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.1)',
    };

    switch (variant) {
      case 'glass':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
        };
      case 'gradient':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: '#1e293b',
        };
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none': return 0;
      case 'small': return 2;
      case 'large': return 4;
      default: return 3;
    }
  };

  return (
    <MuiCard sx={getCardStyles()}>
      <CardContent sx={{ p: getPadding() }}>
        {title && (
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white', 
              fontWeight: 600,
              mb: 2,
              background: 'linear-gradient(135deg, #67e8f9 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </Typography>
        )}
        {children}
      </CardContent>
    </MuiCard>
  );
};

export default Card;