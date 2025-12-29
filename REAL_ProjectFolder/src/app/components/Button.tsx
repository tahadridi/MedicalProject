// app/src/components/Button.tsx
import React from 'react';
import { Button as MuiButton, alpha } from '@mui/material';
import LinkBehavior from './LinkBehavior';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outlined' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  href,
  onClick,
  startIcon,
  endIcon,
  disabled,
  fullWidth,
  ...props
}) => {
  // Styles personnalisés selon la variante
  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: '12px',
      fontWeight: 600,
      textTransform: 'none' as const,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      },
    };

    switch (variant) {
      case 'gradient':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #67e8f9 0%, #3b82f6 100%)',
          color: 'white',
          '&:hover': {
            ...baseStyles['&:hover'],
            background: 'linear-gradient(135deg, #3b82f6 0%, #67e8f9 100%)',
          },
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(255,255,255,0.1)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.2)',
          '&:hover': {
            ...baseStyles['&:hover'],
            backgroundColor: 'rgba(255,255,255,0.15)',
          },
        };
      case 'outlined':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: '#67e8f9',
          border: '2px solid #67e8f9',
          '&:hover': {
            ...baseStyles['&:hover'],
            backgroundColor: 'rgba(103, 232, 249, 0.1)',
          },
        };
      default: // primary
        return {
          ...baseStyles,
          backgroundColor: '#3b82f6',
          color: 'white',
          '&:hover': {
            ...baseStyles['&:hover'],
            backgroundColor: '#2563eb',
          },
        };
    }
  };

  const buttonStyles = getButtonStyles();
  const sizeStyles = {
    small: { padding: '8px 16px', fontSize: '0.875rem' },
    medium: { padding: '12px 24px', fontSize: '1rem' },
    large: { padding: '16px 32px', fontSize: '1.125rem' },
  };

  if (href) {
    return (
      <MuiButton
        component={LinkBehavior}
        href={href}
        startIcon={startIcon}
        endIcon={endIcon}
        disabled={disabled}
        fullWidth={fullWidth}
        sx={{
          ...buttonStyles,
          ...sizeStyles[size],
          ...props,
        }}
      >
        {children}
      </MuiButton>
    );
  }

  return (
    <MuiButton
      onClick={onClick}
      startIcon={startIcon}
      endIcon={endIcon}
      disabled={disabled}
      fullWidth={fullWidth}
      sx={{
        ...buttonStyles,
        ...sizeStyles[size],
        ...props,
      }}
    >
      {children}
    </MuiButton>
  );
};

export default Button;