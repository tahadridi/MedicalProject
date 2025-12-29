// app/src/components/Layout.tsx
'use client';

import React, { useEffect,ReactNode, useState } from 'react';
import { 
  Container, 
  Box, 
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Badge
} from '@mui/material';
import { 
  Menu, 
  Close,
  Notifications,
  MedicalServices,
  Description,
  Chat,
  Assignment,
  Biotech,
  Home,
  Person
} from '@mui/icons-material';
import LinkBehavior from './LinkBehavior';
import { useRouter } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('/');
  const [showNotifications, setShowNotifications] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
const [userData, setUserData] = useState<any>(null);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // KEEPING ALL ORIGINAL NAVIGATION ITEMS AND ROUTES
  const navigationItems = [
    { key: '/', label: 'Accueil', href: '/patient', icon: <Home sx={{ fontSize: 18 }} />, color: 'cyan' },
    { key: '/patient/medication-search', label: 'Medicines', href: '/patient/medication-search', icon: <MedicalServices sx={{ fontSize: 18 }} />, color: 'blue' },
    { key: '/patient/medical-reports', label: 'Medical Record', href: '/patient/medical-reports', icon: <Description sx={{ fontSize: 18 }} />, color: 'purple' },
    { key: '/patient/prescriptions', label: 'Prescriptions', href: '/patient/prescriptions', icon: <Assignment sx={{ fontSize: 18 }} />, color: 'emerald' },
    { key: '/patient/chat', label: 'Messages', href: '/patient/chat', icon: <Chat sx={{ fontSize: 18 }} />, color: 'yellow' },
    { key: '/patient/symptoms', label: 'Symptômes', href: '/modeleIA', icon: <Biotech sx={{ fontSize: 18 }} />, color: 'red' },
  ];

  const footerLinks = [
    { label: 'Confidentialité', href: '#' },
    { label: 'Conditions', href: '#' },
    { label: 'Support', href: '#' },
  ];

  const getColorStyle = (color: string) => {
    const colors: Record<string, { text: string, bg: string }> = {
      cyan: { text: '#06b6d4', bg: 'rgba(6, 182, 212, 0.2)' },
      blue: { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
      purple: { text: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.2)' },
      emerald: { text: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' },
      yellow: { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' },
      red: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' },
    };
    return colors[color] || colors.cyan;
  };
  
useEffect(() => {
  // Try to get patient data from multiple sources
  const loadPatientData = async () => {
    // First try: Get from localStorage cache
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    // Try to get patient data from localStorage cache
    const cachedPatientData = localStorage.getItem(`patientData_${user?.email}`);
    const cacheTimestamp = localStorage.getItem(`patientData_timestamp_${user?.email}`);
    
    if (cachedPatientData && cacheTimestamp) {
      const cacheAge = Date.now() - parseInt(cacheTimestamp);
      if (cacheAge < 5 * 60 * 1000) { // 5 minutes
        console.log('✅ Using cached patient data in Layout');
        setPatientData(JSON.parse(cachedPatientData));
        return;
      }
    }
    
    // If no cache, use user data from localStorage
    if (user) {
      // Create a fallback patient data from user info
      const fallbackPatient = {
        _id: user._id || user.patientId || 'fallback',
        name: user.name || user.username || 'Patient',
        email: user.email || '',
        // Add other fields as needed
      };
      setPatientData(fallbackPatient);
    }
  };
  
  loadPatientData();
}, []);
// Calculate user initials
const userName = patientData?.name || 'Patient';
const userInitials = userName
  .split(' ')
  .map(word => word[0])
  .join('')
  .toUpperCase()
  .substring(0, 2);

// Generate patient ID from user ID or CIN
const patientId = patientData?._id || 'Loading...';




const handleNavClick = (key: string, href: string) => {
    setActiveNav(key);
    router.push(href);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ 
      width: 280, 
      height: '100%',
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Drawer Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Box sx={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
        }}>
          <MedicalServices sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ 
            color: 'white', 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Nexus Clinical
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Patient Portal
          </Typography>
        </Box>
      </Box>

      {/* Navigation Items - ORIGINAL ITEMS */}
      <List sx={{ p: 2, flex: 1 }}>
        {navigationItems.map((item) => (
          <ListItem 
            key={item.key}
            onClick={() => handleNavClick(item.key, item.href)}
            sx={{
              borderRadius: '12px',
              mb: 1,
              color: activeNav === item.key ? 'white' : 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              backgroundColor: activeNav === item.key ? getColorStyle(item.color).bg : 'transparent',
              border: activeNav === item.key ? `1px solid ${getColorStyle(item.color).text}` : '1px solid transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                transform: 'translateX(4px)',
                border: `1px solid ${getColorStyle(item.color).text}`,
              },
              cursor: 'pointer'
            }}
          >
            <Box sx={{ 
              mr: 2, 
              color: activeNav === item.key ? getColorStyle(item.color).text : 'inherit',
              display: 'flex',
              alignItems: 'center'
            }}>
              {item.icon}
            </Box>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* User Info */}
      <Box sx={{ 
        p: 3, 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255,255,255,0.05)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{
  width: 56,
  height: 56,
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4, #3b82f6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: 700,
  fontSize: '1.2rem',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    width: '16px',
    height: '16px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    border: '3px solid rgba(15, 23, 42, 0.95)',
  }
}}>
  {userInitials}
</Box>
          <Box>
  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
    {userName}
  </Typography>
  
</Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: '#0f172a',
      color: 'text.primary',
    }}>
      {/* NAVBAR-STYLE HEADER (Like Navbar.tsx) - FIXED LOGO SPACING */}
      <Box
        component="nav"
        sx={{ 
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          py: 2,
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 4, md: 6 } }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '80px',
            gap: 4,
          }}>
            {/* Logo Section - MORE SPACE FOR BRAND NAME */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 3, 
              flexShrink: 0,
              minWidth: '200px'  // Ensure enough space for brand name
            }}>
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.25)',
                flexShrink: 0,
              }}>
                <MedicalServices sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              
              <Box sx={{ minWidth: '140px' }}> {/* Fixed width for brand name */}
                <Typography
                  variant="h5"
                  sx={{
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 700,
                    letterSpacing: '-0.025em',
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Nexus Clinical
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontWeight: 300, 
                    letterSpacing: '0.05em',
                    display: { xs: 'none', sm: 'block' },
                    fontSize: '0.75rem',
                  }}
                >
                  Patient Portal
                </Typography>
              </Box>
            </Box>

            {/* Centered Navigation - Like Navbar.tsx */}
            {!isMobile && (
              <Box sx={{ 
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                minWidth: 0, // Allow shrinking
              }}>
                <Box sx={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  px: 2,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  maxWidth: '800px',
                  width: '100%',
                  overflowX: 'auto',
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                }}>
                  {navigationItems.map((item) => (
                    <Box
                      key={item.key}
                      onClick={() => handleNavClick(item.key, item.href)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1.5,
                        borderRadius: '12px',
                        color: activeNav === item.key ? 'white' : 'rgba(203, 213, 225, 0.8)',
                        backgroundColor: activeNav === item.key ? 'rgba(255,255,255,0.1)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: 'white',
                        },
                        minWidth: 'fit-content',
                        flexShrink: 0,
                      }}
                    >
                      <Box sx={{ 
                        color: getColorStyle(item.color).text,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.9rem',
                      }}>
                        {item.icon}
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.label}
                      </Typography>
                      
                      {/* Active indicator line */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: activeNav === item.key ? '70%' : 0,
                          height: '2px',
                          background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                          borderRadius: '2px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Box sx={{ flexShrink: 0 }}>
                <IconButton
                  onClick={handleDrawerToggle}
                  sx={{ 
                    color: '#06b6d4',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    width: 48,
                    height: 48,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  {mobileOpen ? <Close /> : <Menu />}
                </IconButton>
              </Box>
            )}

            {/* Right Section - Notifications and Profile */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              flexShrink: 0,
              minWidth: 'fit-content'
            }}>
              {/* Notifications */}
              <IconButton
                onClick={() => setShowNotifications(!showNotifications)}
                sx={{
                  color: '#06b6d4',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  width: 48,
                  height: 48,
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#22d3ee',
                  }
                }}
              >
                <Notifications />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 10,
                    height: 10,
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    border: '2px solid rgba(15, 23, 42, 0.95)',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                />
              </IconButton>

              {/* User Profile - Only on desktop */}
              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ textAlign: 'right', minWidth: '120px' }}>
                    <Typography variant="subtitle2" sx={{ 
                      color: 'white', 
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                       {userName}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.7rem',
                      whiteSpace: 'nowrap',
                    }}>
                      {patientData?.email || 'No email'}
                    </Typography>
                  </Box>
                  <Box sx={{ position: 'relative', cursor: 'pointer' }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        transition: 'transform 0.3s ease',
                        backgroundSize: '200% 200%',
                        animation: 'gradientShift 3s ease infinite',
                        '@keyframes gradientShift': {
                          '0%': { backgroundPosition: '0% 50%' },
                          '50%': { backgroundPosition: '100% 50%' },
                          '100%': { backgroundPosition: '0% 50%' },
                        },
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                     {userInitials}
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -3,
                        right: -3,
                        width: 16,
                        height: 16,
                        backgroundColor: '#10b981',
                        borderRadius: '50%',
                        border: '3px solid rgba(15, 23, 42, 0.95)',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Mobile Navigation Bar - Below header */}
          {isMobile && !mobileOpen && (
            <Box sx={{ 
              pb: 2,
              pt: 1,
              display: 'flex',
              justifyContent: 'center',
            }}>
              <Box sx={{
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                overflowX: 'auto',
                width: '100%',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }}>
                {navigationItems.map((item) => (
                  <Box
                    key={item.key}
                    onClick={() => handleNavClick(item.key, item.href)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      px: 1.5,
                      py: 1,
                      borderRadius: '8px',
                      color: activeNav === item.key ? 'white' : 'rgba(203, 213, 225, 0.8)',
                      backgroundColor: activeNav === item.key ? 'rgba(255,255,255,0.1)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      minWidth: '70px',
                      flexShrink: 0,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                      },
                    }}
                  >
                    <Box sx={{ 
                      color: getColorStyle(item.color).text,
                      mb: 0.5,
                      fontSize: '0.9rem',
                    }}>
                      {item.icon}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.65rem',
                        textAlign: 'center',
                        lineHeight: 1,
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            border: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          py: { xs: 3, md: 4 },
          minHeight: 'calc(100vh - 140px)'
        }}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 3 
          }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              © {new Date().getFullYear()} Nexus Clinical. All droits réservés.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
              {footerLinks.map((link) => (
                <Typography
                  key={link.label}
                  variant="body2"
                  onClick={() => router.push(link.href)}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: '#06b6d4',
                    }
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;