'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import MedicationIcon from '@mui/icons-material/Medication';

import { 
  Box, 
  Button, 
  Card, 
  Typography, 
  TextField, 
  Chip, 
  CircularProgress, 
  Alert,
  Container,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Autocomplete,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Fade,
  Zoom,
  alpha
} from '@mui/material';
import {
  Search,
  MedicalServices,
  Warning,
  Info,
  LocalHospital,
  Security,
  Schedule,
  Close,
  ExpandMore,
  ExpandLess,
  History,
  Favorite,
  FavoriteBorder,
  Download,
  ArrowRight,
  Medication,
  Coronavirus,
  HealthAndSafety
} from '@mui/icons-material';


// Custom debounce hook
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

interface MedicationInfo {
  _id?: string;
  name: string;
  dosage: string;
  description: string;
  sideEffects: string[];
  usage: string;
  category?: string;
  contraindications?: string[];
  interactions?: string[];
  pregnancyCategory?: string;
  genericName?: string;
  brandNames?: string[];
  manufacturer?: string;
  warnings?: string[];
}

interface SearchHistoryItem {
  term: string;
  timestamp: Date;
  result: MedicationInfo | null;
}

const MedicationSearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<{name: string, category: string}[]>([]);
  const [medicationInfo, setMedicationInfo] = useState<MedicationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [expandedInfo, setExpandedInfo] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<MedicationInfo[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Load favorites and history from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('medication-favorites');
    const savedHistory = localStorage.getItem('search-history');
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save favorites and history to localStorage
  useEffect(() => {
    localStorage.setItem('medication-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('search-history', JSON.stringify(searchHistory.slice(0, 10)));
  }, [searchHistory]);

  const fetchSuggestions = useCallback(
    useDebounce(async (term: string) => {
      if (term.length < 1) {
        setSuggestions([]);
        return;
      }

      setSuggestionsLoading(true);
      try {
        const res = await fetch(`/api/medications/suggest?q=${encodeURIComponent(term)}`);
        const data = await res.json();
        
        if (res.ok) {
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 300),
    []
  );

  // Fetch suggestions when search term changes
  useEffect(() => {
    fetchSuggestions(searchTerm);
  }, [searchTerm, fetchSuggestions]);

  const handleSearch = async (e?: React.FormEvent, searchText?: string) => {
    if (e) e.preventDefault();
    
    const term = searchText || searchTerm.trim();
    console.log('🔍 Searching for:', term);
    
    if (!term) {
      setError("Please enter a medication name.");
      setMedicationInfo(null);
      return;
    }

    setLoading(true);
    setError('');
    setMedicationInfo(null);
    setSuggestions([]);

    try {
      const res = await fetch(`/api/medications?name=${encodeURIComponent(term)}`);
      console.log('📡 Search response status:', res.status);
      
      const data = await res.json();
      console.log('📦 Search response data:', data);
      
      if (!res.ok) {
        setError(data.error || "Medication not found.");
        setMedicationInfo(null);
      } else {
        // Vérifier si les données sont dans data.data ou directement dans data
        const medicationData = data.data || data;
        console.log('✅ Medication data received:', medicationData);
        console.log('📋 Description:', medicationData.description);
        console.log('💊 Dosage:', medicationData.dosage);
        console.log('⚠️ Side Effects:', medicationData.sideEffects);
        console.log('📝 Usage:', medicationData.usage);
        
        // Assurer que tous les champs requis existent
        const completeMedicationData: MedicationInfo = {
          name: medicationData.name || term,
          dosage: medicationData.dosage || 'No dosage information available',
          description: medicationData.description || 'No description available',
          sideEffects: medicationData.sideEffects || ['No side effects information available'],
          usage: medicationData.usage || 'No usage instructions available',
          category: medicationData.category,
          contraindications: medicationData.contraindications,
          interactions: medicationData.interactions,
          pregnancyCategory: medicationData.pregnancyCategory,
          genericName: medicationData.genericName,
          brandNames: medicationData.brandNames,
          manufacturer: medicationData.manufacturer,
          warnings: medicationData.warnings,
          _id: medicationData._id
        };
        
        setMedicationInfo(completeMedicationData);
        setIsFavorite(favorites.some(fav => fav.name === completeMedicationData.name));
        
        // Add to search history
        const historyItem: SearchHistoryItem = {
          term,
          timestamp: new Date(),
          result: completeMedicationData
        };
        setSearchHistory(prev => [historyItem, ...prev.filter(h => h.term !== term).slice(0, 9)]);
      }
    } catch (err: unknown) {
      console.error('❌ Search error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error during search.");
      }
      setMedicationInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (!medicationInfo) return;

    if (isFavorite) {
      setFavorites(prev => prev.filter(fav => fav.name !== medicationInfo.name));
    } else {
      setFavorites(prev => [...prev, medicationInfo]);
    }
    setIsFavorite(!isFavorite);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const toggleExpandedInfo = (section: string) => {
    setExpandedInfo(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const clearSearch = () => {
    setSearchTerm('');
    setMedicationInfo(null);
    setError('');
    setSuggestions([]);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportData = () => {
    if (!medicationInfo) return;
    
    const data = {
      ...medicationInfo,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${medicationInfo.name.replace(/\s+/g, '_')}_info.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category?: string) => {
    if (!category) return <MedicationIcon />;

    const lowerCategory = category.toLowerCase();

    if (lowerCategory.includes('antibiotic') || lowerCategory.includes('antiviral')) {
      return <MedicalServices />;
    }

    if (lowerCategory.includes('pain') || lowerCategory.includes('fever')) {
      return <HealthAndSafety />;
    }

    return <MedicationIcon />;
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return '#67e8f9';
    
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('antibiotic')) return '#3b82f6';
    if (lowerCategory.includes('pain')) return '#ef4444';
    if (lowerCategory.includes('heart')) return '#ef4444';
    if (lowerCategory.includes('diabetes')) return '#10b981';
    if (lowerCategory.includes('mental')) return '#8b5cf6';
    return '#67e8f9';
  };

  const InfoSection = ({ 
    title, 
    content, 
    icon: Icon, 
    color = '#67e8f9',
    expandable = false 
  }: {
    title: string;
    content: string | string[];
    icon: React.ElementType;
    color?: string;
    expandable?: boolean;
  }) => {
    const isExpanded = expandedInfo.includes(title);
    const isArray = Array.isArray(content);
    
    return (
      <Box sx={{ mb: 3 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 1,
            cursor: expandable ? 'pointer' : 'default'
          }}
          onClick={expandable ? () => toggleExpandedInfo(title) : undefined}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon sx={{ fontSize: 20, color, mr: 1 }} />
            <Typography variant="subtitle1" sx={{ color, fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
          {expandable && (
            <IconButton size="small">
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </Box>
        
        <Collapse in={!expandable || isExpanded}>
          {isArray ? (
            <List dense sx={{ pl: 0 }}>
              {content.map((item, idx) => (
                <ListItem key={idx} sx={{ py: 0.5, pl: 3 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <Box 
                      sx={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        bgcolor: color 
                      }} 
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item} 
                    primaryTypographyProps={{ 
                      sx: { 
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.9rem'
                      } 
                    }} 
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.6,
                bgcolor: 'rgba(255,255,255,0.02)',
                p: 2,
                borderRadius: '12px',
                border: `1px solid ${alpha(color, 0.2)}`
              }}
            >
              {content}
            </Typography>
          )}
        </Collapse>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
      py: { xs: 2, md: 4 },
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
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #3b82f6, #2EC4B6)',
              mb: 3,
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
            }}>
              <MedicalServices sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800,
                background: "linear-gradient(135deg, #67e8f9 0%, #2EC4B6 50%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Medication Database
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: "rgba(255,255,255,0.7)",
                maxWidth: 600,
                mx: 'auto',
                fontWeight: 300,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Comprehensive medication information with real-time search
            </Typography>
          </Box>
        </Fade>

        {/* Main Content */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 350px' }, gap: 3 }}>
          
          {/* Left Column - Search and Results */}
          <Box>
            {/* Search Card */}
            <Zoom in timeout={600}>
              <Card 
                sx={{ 
                  mb: 3, 
                  p: { xs: 2, md: 4 },
                  borderRadius: '24px',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }}
              >
                <form onSubmit={(e) => handleSearch(e)}>
                  <Box sx={{ position: 'relative' }}>
                    <Autocomplete
                      freeSolo
                      options={suggestions}
                      getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                      value={searchTerm}
                      onChange={(event, newValue) => {
                        if (typeof newValue === 'string') {
                          setSearchTerm(newValue);
                          if (newValue) handleSearch(undefined, newValue);
                        } else if (newValue) {
                          setSearchTerm(newValue.name);
                          handleSearch(undefined, newValue.name);
                        }
                      }}
                      onInputChange={(event, newValue) => {
                        setSearchTerm(newValue);
                      }}
                      loading={suggestionsLoading}
                      slotProps={{
                        popper: {
                          sx: {
                            '& .MuiAutocomplete-paper': {
                              backgroundColor: '#1e293b',
                              backgroundImage: 'none',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '12px',
                              marginTop: '8px',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                              color: 'white',
                              '& .MuiAutocomplete-listbox': {
                                backgroundColor: 'transparent',
                                padding: '8px 0',
                                '& .MuiAutocomplete-option': {
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                  },
                                  '&[aria-selected="true"]': {
                                    backgroundColor: 'rgba(46, 196, 182, 0.2)',
                                  },
                                  '&.Mui-focused': {
                                    backgroundColor: 'rgba(59, 130, 246, 0.3)',
                                  },
                                },
                              },
                            },
                          },
                        },
                      }}
                      renderOption={(props, option) => {
                        const med = option as { name: string; category: string };
                        // Extraire la clé des props pour éviter l'erreur React
                        const { key, ...otherProps } = props;
                        return (
                          <li key={key} {...otherProps}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              width: '100%',
                              py: 1,
                              px: 2
                            }}>
                              <ListItemIcon sx={{ 
                                minWidth: 40, 
                                color: getCategoryColor(med.category) 
                              }}>
                                {getCategoryIcon(med.category)}
                              </ListItemIcon>
                              <Box sx={{ flex: 1 }}>
                                <Typography sx={{ color: 'white', fontWeight: 500 }}>
                                  {med.name}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                                  {med.category}
                                </Typography>
                              </Box>
                              <ArrowRight sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }} />
                            </Box>
                          </li>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Search medication..."
                          placeholder="Start typing for suggestions..."
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '16px',
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
                              bgcolor: 'rgba(255,255,255,0.02)',
                              pr: searchTerm ? 10 : 0
                            },
                            '& .MuiInputLabel-root': { 
                              color: 'rgba(255,255,255,0.6)',
                              fontSize: '1.1rem'
                            },
                            '& .MuiInputBase-input': { 
                              color: 'white',
                              fontSize: '1.1rem',
                              py: 2
                            },
                          }}
                        />
                      )}
                      popupIcon={null}
                      noOptionsText={
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {searchTerm.length < 2 ? "Type at least 2 characters" : "No medications found"}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                          px: 4,
                          borderRadius: '16px',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          background: "linear-gradient(135deg, #3b82f6, #2EC4B6)",
                          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 35px rgba(59, 130, 246, 0.6)',
                          },
                          transition: 'all 0.3s ease',
                          flex: 1
                        }}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                      >
                        {loading ? 'Searching...' : 'Search'}
                      </Button>
                      
                      {searchTerm && (
                        <Button
                          onClick={clearSearch}
                          sx={{
                            px: 2,
                            borderRadius: '16px',
                            color: 'rgba(255,255,255,0.7)',
                            '&:hover': { 
                              color: '#ff6b6b',
                              bgcolor: 'rgba(255,107,107,0.1)'
                            }
                          }}
                          startIcon={<Close />}
                        >
                          Clear
                        </Button>
                      )}
                    </Box>

                    {/* Suggestions Count */}
                    {suggestions.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                          {suggestions.length} suggestions found
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </form>
                
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mt: 3, 
                      borderRadius: '12px',
                      bgcolor: 'rgba(211,47,47,0.1)',
                      border: '1px solid rgba(211,47,47,0.3)',
                      color: 'white',
                      '& .MuiAlert-icon': { color: '#ff6b6b' }
                    }}
                    icon={<Warning />}
                  >
                    {error}
                  </Alert>
                )}
              </Card>
            </Zoom>

            {/* Results Section */}
            {medicationInfo && (
              <Fade in timeout={500}>
                <Box>
                  {/* Medication Header */}
                  <Paper 
                    sx={{ 
                      p: 4,
                      mb: 3,
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(46, 196, 182, 0.1))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(103, 232, 249, 0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                        zIndex: 0
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ 
                            width: 60, 
                            height: 60, 
                            borderRadius: '16px', 
                            bgcolor: getCategoryColor(medicationInfo.category),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 3,
                            boxShadow: `0 8px 20px ${alpha(getCategoryColor(medicationInfo.category), 0.3)}`
                          }}>
                            {getCategoryIcon(medicationInfo.category)}
                          </Box>
                          <Box>
                            <Typography 
                              variant="h3" 
                              sx={{ 
                                color: 'white', 
                                fontWeight: 800,
                                mb: 0.5,
                                fontSize: { xs: '1.8rem', md: '2.4rem' }
                              }}
                            >
                              {medicationInfo.name}
                            </Typography>
                            {medicationInfo.genericName && (
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  color: 'rgba(255,255,255,0.7)',
                                  fontWeight: 500
                                }}
                              >
                                Generic: {medicationInfo.genericName}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {medicationInfo.category && (
                            <Chip 
                              label={medicationInfo.category}
                              size="small"
                              sx={{
                                bgcolor: alpha(getCategoryColor(medicationInfo.category), 0.2),
                                color: getCategoryColor(medicationInfo.category),
                                fontWeight: 600,
                                border: `1px solid ${alpha(getCategoryColor(medicationInfo.category), 0.3)}`
                              }}
                            />
                          )}
                          {medicationInfo.manufacturer && (
                            <Chip 
                              label={medicationInfo.manufacturer}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.8)',
                                fontWeight: 500
                              }}
                            />
                          )}
                          {medicationInfo.pregnancyCategory && (
                            <Chip 
                              label={`Pregnancy: ${medicationInfo.pregnancyCategory}`}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(139, 92, 246, 0.2)',
                                color: '#8b5cf6',
                                fontWeight: 600,
                                border: '1px solid rgba(139, 92, 246, 0.3)'
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={toggleFavorite}
                          sx={{
                            color: isFavorite ? '#ff6b6b' : 'rgba(255,255,255,0.5)',
                            bgcolor: 'rgba(255,255,255,0.1)',
                            '&:hover': { 
                              color: '#ff6b6b',
                              bgcolor: 'rgba(255,107,107,0.1)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {isFavorite ? <Favorite /> : <FavoriteBorder />}
                        </IconButton>
                        <IconButton
                          onClick={exportData}
                          sx={{
                            color: 'rgba(255,255,255,0.5)',
                            bgcolor: 'rgba(255,255,255,0.1)',
                            '&:hover': { 
                              color: '#2EC4B6',
                              bgcolor: 'rgba(46, 196, 182, 0.1)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Download />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>

                  {/* Tabs */}
                  <Paper 
                    sx={{ 
                      mb: 3,
                      borderRadius: '20px',
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <Tabs
                      value={activeTab}
                      onChange={handleTabChange}
                      variant="fullWidth"
                      sx={{
                        '& .MuiTab-root': {
                          color: 'rgba(255,255,255,0.6)',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          py: 2.5,
                          textTransform: 'none',
                          '&.Mui-selected': {
                            color: '#67e8f9'
                          }
                        },
                        '& .MuiTabs-indicator': {
                          backgroundColor: '#67e8f9',
                          height: 3
                        }
                      }}
                    >
                      <Tab label="Overview" icon={<Info />} iconPosition="start" />
                      <Tab label="Dosage & Usage" icon={<Schedule />} iconPosition="start" />
                      <Tab label="Safety Info" icon={<Security />} iconPosition="start" />
                      <Tab label="Side Effects" icon={<Warning />} iconPosition="start" />
                    </Tabs>

                    <Box sx={{ p: 4 }}>
                      {activeTab === 0 && (
                        <>
                          <InfoSection
                            title="Description"
                            content={medicationInfo.description}
                            icon={LocalHospital}
                            color="#3b82f6"
                          />
                          {medicationInfo.brandNames && medicationInfo.brandNames.length > 0 && (
                            <InfoSection
                              title="Brand Names"
                              content={medicationInfo.brandNames}
                              icon={MedicalServices}
                              color="#8b5cf6"
                            />
                          )}
                        </>
                      )}

                      {activeTab === 1 && (
                        <>
                          <InfoSection
                            title="Recommended Dosage"
                            content={medicationInfo.dosage}
                            icon={Schedule}
                            color="#2EC4B6"
                          />
                          <InfoSection
                            title="Usage Instructions"
                            content={medicationInfo.usage}
                            icon={Info}
                            color="#67e8f9"
                          />
                        </>
                      )}

                      {activeTab === 2 && (
                        <>
                          {medicationInfo.contraindications && medicationInfo.contraindications.length > 0 && (
                            <InfoSection
                              title="Contraindications"
                              content={medicationInfo.contraindications}
                              icon={Warning}
                              color="#ef4444"
                            />
                          )}
                          {medicationInfo.interactions && medicationInfo.interactions.length > 0 && (
                            <InfoSection
                              title="Drug Interactions"
                              content={medicationInfo.interactions}
                              icon={Security}
                              color="#f59e0b"
                            />
                          )}
                          {medicationInfo.warnings && medicationInfo.warnings.length > 0 && (
                            <InfoSection
                              title="Important Warnings"
                              content={medicationInfo.warnings}
                              icon={Warning}
                              color="#ef4444"
                              expandable={medicationInfo.warnings.length > 3}
                            />
                          )}
                        </>
                      )}

                      {activeTab === 3 && medicationInfo.sideEffects.length > 0 && (
                        <InfoSection
                          title="Side Effects"
                          content={medicationInfo.sideEffects}
                          icon={Warning}
                          color="#ef4444"
                          expandable={medicationInfo.sideEffects.length > 5}
                        />
                      )}
                    </Box>
                  </Paper>

                  {/* Clinical Notice */}
                  <Paper 
                    sx={{ 
                      p: 3,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(46, 196, 182, 0.1))',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      display: 'flex',
                      alignItems: 'flex-start'
                    }}
                  >
                    <Security sx={{ color: '#67e8f9', mr: 2, mt: 0.5, fontSize: 24 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#67e8f9', fontWeight: 600, mb: 0.5 }}>
                        Important Medical Notice
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        This information is for educational purposes only. Always consult a healthcare professional before starting or changing any medication regimen. Do not use this information as a substitute for professional medical advice.
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Fade>
            )}
          </Box>

          {/* Right Column - Sidebar */}
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            {/* Quick Stats */}
            <Card 
              sx={{ 
                mb: 3,
                p: 3,
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 3 }}>
                Quick Stats
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: '12px', bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <Typography variant="h4" sx={{ color: '#3b82f6', fontWeight: 700, mb: 0.5 }}>
                    {favorites.length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Favorites
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, borderRadius: '12px', bgcolor: 'rgba(46, 196, 182, 0.1)', border: '1px solid rgba(46, 196, 182, 0.2)' }}>
                  <Typography variant="h4" sx={{ color: '#2EC4B6', fontWeight: 700, mb: 0.5 }}>
                    {searchHistory.length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Searches
                  </Typography>
                </Box>
              </Box>
            </Card>

            {/* Favorites */}
            <Card 
              sx={{ 
                mb: 3,
                p: 3,
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Favorite sx={{ color: '#ef4444', mr: 1 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  Favorites ({favorites.length})
                </Typography>
              </Box>
              
              {favorites.length > 0 ? (
                <List dense>
                  {favorites.slice(0, 5).map((fav, idx) => (
                    <React.Fragment key={fav.name}>
                      <ListItemButton 
                        onClick={() => {
                          setSearchTerm(fav.name);
                          handleSearch(undefined, fav.name);
                        }}
                        sx={{
                          borderRadius: '12px',
                          mb: 1,
                          '&:hover': {
                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                            transform: 'translateX(4px)',
                            transition: 'all 0.2s ease'
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {getCategoryIcon(fav.category)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={fav.name}
                          secondary={fav.category || 'Medication'}
                          primaryTypographyProps={{ 
                            sx: { 
                              color: 'white',
                              fontSize: '0.9rem',
                              fontWeight: 500
                            } 
                          }}
                          secondaryTypographyProps={{ 
                            sx: { 
                              color: 'rgba(255,255,255,0.5)',
                              fontSize: '0.8rem'
                            } 
                          }}
                        />
                        <ArrowRight sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }} />
                      </ListItemButton>
                      {idx < favorites.length - 1 && idx < 4 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.5)', 
                    fontStyle: 'italic',
                    textAlign: 'center',
                    py: 3
                  }}
                >
                  No favorites yet
                </Typography>
              )}
            </Card>

            {/* Recent Searches */}
            <Card 
              sx={{ 
                p: 3,
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <History sx={{ color: '#2EC4B6', mr: 1 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  Recent Searches
                </Typography>
              </Box>
              {searchHistory.length > 0 ? (
                <List dense>
                  {searchHistory.slice(0, 5).map((item, idx) => (
                    <React.Fragment key={item.timestamp.toString()}>
                      <ListItemButton 
                        onClick={() => {
                          setSearchTerm(item.term);
                          handleSearch(undefined, item.term);
                        }}
                        sx={{
                          borderRadius: '12px',
                          mb: 1,
                          '&:hover': {
                            bgcolor: 'rgba(46, 196, 182, 0.1)',
                            transform: 'translateX(4px)',
                            transition: 'all 0.2s ease'
                          }
                        }}
                      >
                        <ListItemText 
                          primary={item.term}
                          secondary={formatDate(item.timestamp)}
                          primaryTypographyProps={{ 
                            sx: { 
                              color: 'white',
                              fontSize: '0.9rem',
                              fontWeight: 500
                            } 
                          }}
                          secondaryTypographyProps={{ 
                            sx: { 
                              color: 'rgba(255,255,255,0.5)',
                              fontSize: '0.8rem'
                            } 
                          }}
                        />
                        <ArrowRight sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }} />
                      </ListItemButton>
                      {idx < searchHistory.length - 1 && idx < 4 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.5)', 
                    fontStyle: 'italic',
                    textAlign: 'center',
                    py: 3
                  }}
                >
                  No recent searches
                </Typography>
              )}
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default MedicationSearchPage;