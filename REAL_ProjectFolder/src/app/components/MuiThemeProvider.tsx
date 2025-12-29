'use client';
import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// Define custom colors based on the HTML model's CSS variables
const clinicalMidnight = '#0f172a';
const clinicalTeal = '#2EC4B6';
const clinicalBlue = '#0A2463';
const clinicalSlate300 = '#cbd5e1'; // Approximate for text-slate-300
const clinicalCyan300 = '#67e8f9'; // Approximate for text-cyan-300
const clinicalPurple400 = '#c084fc'; // Approximate for text-purple-400
const clinicalEmerald400 = '#34d399'; // Approximate for text-emerald-400
const clinicalRed400 = '#f87171'; // Approximate for text-red-400
const clinicalYellow400 = '#facc15'; // Approximate for text-yellow-400

const theme = createTheme({
  palette: {
    mode: 'dark', // Nexus Clinical is dark mode
    primary: {
      main: clinicalTeal, // Using clinical teal as primary
      light: clinicalCyan300,
      dark: clinicalBlue,
      contrastText: '#fff',
    },
    secondary: {
      main: clinicalPurple400, // Using a purple for secondary actions
      light: '#e9d5ff',
      dark: '#a855f7',
      contrastText: '#fff',
    },
    error: {
      main: clinicalRed400,
    },
    warning: {
      main: clinicalYellow400,
    },
    info: {
      main: clinicalCyan300,
    },
    success: {
      main: clinicalEmerald400,
    },
    background: {
      default: clinicalMidnight, // Dark background
      paper: '#1e293b', // Slightly lighter dark for cards
    },
    text: {
      primary: '#ffffff',
      secondary: clinicalSlate300,
      disabled: '#64748b',
    },
    action: {
      active: '#fff',
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      background: 'linear-gradient(to right, #67e8f9, #20c997, #3b82f6)', // Adjusted gradient for consistency
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h3: {
      fontSize: '2.25rem',
      fontWeight: 700,
      background: 'linear-gradient(to right, #67e8f9, #20c997, #3b82f6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h4: {
      fontSize: '2rem',
      fontWeight: 700,
      color: 'white', // Default for h4, can be overridden with gradient where needed
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: 'white',
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: 'white',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // Rounded buttons
          textTransform: 'none', // No uppercase
          fontWeight: 600,
          padding: '10px 20px',
        },
        containedPrimary: {
          background: `linear-gradient(90deg, ${clinicalCyan300} 0%, ${clinicalTeal} 100%)`, // Gradient background for primary
          '&:hover': {
            opacity: 0.9,
            background: `linear-gradient(90deg, ${clinicalCyan300} 0%, ${clinicalTeal} 100%)`,
          },
        },
        outlinedPrimary: {
          color: clinicalTeal,
          borderColor: clinicalTeal,
          '&:hover': {
            backgroundColor: 'rgba(46, 196, 182, 0.08)',
            borderColor: clinicalTeal,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b', // Match premium-card background
          border: '1px solid rgba(255, 255, 255, 0.1)', // Match premium-card border
          borderRadius: '12px',
          boxShadow: 'none', // Remove default MUI shadow
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15, 23, 42, 0.8)', // premium-glass
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          // You might need to adjust maxWidth or add padding if the original HTML has specific breakpoints
          '@media (min-width: 1280px)': { // mimic lg:container mx-auto in Tailwind
            maxWidth: '1280px', // or whatever width you prefer
          },
          paddingLeft: '24px',
          paddingRight: '24px',
        }
      }
    },
    MuiList: {
      styleOverrides: {
        root: {
          '&::-webkit-scrollbar': { // Apply thin scrollbar to lists/chat windows
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255, 255, 255, 0.5)',
          },
        }
      }
    }
  },
});

interface MuiThemeProviderProps {
  children: React.ReactNode;
}

const MuiThemeProvider: React.FC<MuiThemeProviderProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default MuiThemeProvider;