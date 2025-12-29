/// components/MedecinChatPage.tsx
'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

// --- MUI Imports ---
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  InputBase,
  IconButton,
  Badge,
  Tabs,
  Tab,
  CircularProgress,
  Stack,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Chip,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  AlertTitle,
  LinearProgress,
  Snackbar
} from "@mui/material";

import { styled } from "@mui/material/styles";

// --- Icons ---
import SendIcon from "@mui/icons-material/Send";
import SearchIcon from "@mui/icons-material/Search";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PhoneIcon from "@mui/icons-material/Phone";
import VideocamIcon from "@mui/icons-material/Videocam";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import FilterListIcon from "@mui/icons-material/FilterList";
import StarIcon from "@mui/icons-material/Star";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MessageIcon from "@mui/icons-material/Message";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";

// --- Interfaces ---
interface IUser {
  _id: string;
  username?: string;
  // Add doctor-specific properties
  nom?: string;
  prenom?: string;
  email: string;
  role: string;
  specialite?: string;
  cin?: string;
  age?: number;
  gender?: string;
  // Add other possible properties from your API
  hopital?: string;
  adresse?: string;
  telephone?: string;
  ville?: string;
  created_at?: string;
  updated_at?: string;
}

interface IDoctor extends IUser {
  nom: string;
  prenom: string;
  specialite: string;
  hopital: string;
  adresse?: string;
  telephone?: string;
  ville?: string;
}
interface IMessage {
  _id?: string;
  sender: { _id: string; username: string };
  content: string;
  createdAt?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

interface JWTPayload {
  id: string;
  username: string;
  role: string;
  specialite?: string;
}

interface IConversation {
  _id: string;
  participants: IUser[];
  roomId: string;
  lastMessage?: IMessage;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

// --- Error Interfaces ---
interface ApiErrorResponse {
  error?: string;
  message?: string;
}

// --- Styled Components ---
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': { transform: 'scale(.8)', opacity: 1 },
    '100%': { transform: 'scale(2.4)', opacity: 0 },
  },
}));

const StatusDot = styled('div')<{ status: 'online' | 'away' | 'offline' }>(({ theme, status }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: 
    status === 'online' ? '#4CAF50' :
    status === 'away' ? '#FFC107' : '#9E9E9E',
  position: 'absolute',
  bottom: 2,
  right: 2,
  border: `2px solid ${theme.palette.background.paper}`
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isMe",
})<{ isMe: boolean }>(({ theme, isMe }) => ({
  maxWidth: "70%",
  padding: theme.spacing(1.5, 2),
  borderRadius: isMe ? "20px 20px 0px 20px" : "20px 20px 20px 0px",
  backgroundColor: isMe ? theme.palette.primary.main : "#E3F2FD",
  color: isMe ? "#fff" : theme.palette.text.primary,
  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  position: "relative",
  wordBreak: "break-word",
  border: isMe ? 'none' : '1px solid #BBDEFB',
}));

const FilePreview = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export default function MedecinChatPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // --- States ---
  const [patients, setPatients] = useState<IUser[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<JWTPayload | null>(null);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'all' | 'unread' | 'today'>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [prescriptionDialog, setPrescriptionDialog] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [patientStatus, setPatientStatus] = useState<'online' | 'away' | 'offline'>('offline');
  
  // États pour les fichiers
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });
  
  // Helper function pour générer le roomId (identique à l'API)
  const generateRoomId = (id1: string, id2: string) => {
    return [id1, id2].sort().join('_');
  };
  
  const roomId = selectedPatient && currentUser 
    ? generateRoomId(currentUser.id, selectedPatient._id) 
    : null;
    
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- API Logic ---
  const loadMessages = useCallback(async () => {
    if (!roomId) return;
    try {
      const response = await axios.get(`/api/messages?roomId=${roomId}`);
      setMessages(response.data);
      
      // Mettre à jour le statut du patient
      updatePatientStatus();
    } catch (err) { 
      console.error('Erreur chargement messages', err); 
    }
  }, [roomId]);

  // Simuler le statut du patient
  const updatePatientStatus = () => {
    const statuses: Array<'online' | 'away' | 'offline'> = ['online', 'away', 'offline'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    setPatientStatus(randomStatus);
  };

  useEffect(() => {
    if (!roomId) return;
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [roomId, loadMessages]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        setCurrentUser(decoded);
      } catch (e) { 
        console.error("Token invalide"); 
      }
    }
    fetchPatients();
    fetchConversations();
    
    // Simuler l'activité des patients
    const statusInterval = setInterval(updatePatientStatus, 30000);
    return () => clearInterval(statusInterval);
  }, []);

  const fetchPatients = async () => {
    try {
      // Dans une vraie app, on aurait une API pour récupérer les patients du médecin
      const mockPatients: IUser[] = [
        { _id: '1', username: 'Ahmed Ben Ali', email: 'ahmed@example.com', role: 'client', age: 45, gender: 'male' },
        { _id: '2', username: 'Fatima Zohra', email: 'fatima@example.com', role: 'client', age: 32, gender: 'female' },
        { _id: '3', username: 'Mohamed Said', email: 'mohamed@example.com', role: 'client', age: 28, gender: 'male' },
        { _id: '4', username: 'Salma Trabelsi', email: 'salma@example.com', role: 'client', age: 56, gender: 'female' },
      ];
      setPatients(mockPatients);
    } catch (error) { 
      console.error(error); 
    }
  };

  const fetchConversations = async () => {
  if (!isClient) return;
  
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      setSnackbar({
        open: true,
        message: "Veuillez vous reconnecter",
        severity: "error"
      });
      return;
    }

    const res = await axios.get("/api/conversations", {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // NE PAS utiliser Math.random() ici pour éviter l'erreur d'hydratation
    const conversationsWithUnread = res.data.map((conv: IConversation) => ({
      ...conv,
      // Utiliser une valeur déterministe ou un calcul basé sur les données
      unreadCount: conv.lastMessage?.sender._id !== currentUser?.id ? 1 : 0
    }));
    
    setConversations(conversationsWithUnread);
  } catch (error: any) { 
    console.error("Erreur fetchConversations:", error);
    
    // Gérer spécifiquement l'erreur 401
    if (error.response?.status === 401) {
      setSnackbar({
        open: true,
        message: "Session expirée. Veuillez vous reconnecter.",
        severity: "error"
      });
      // Optionnel: rediriger vers la page de connexion
      // window.location.href = '/login';
    } else {
      setSnackbar({
        open: true,
        message: "Erreur de chargement des conversations",
        severity: "error"
      });
    }
  }
};
const checkAuth = useCallback(() => {
  if (!isClient) return false;
  
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }
  
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    // Vérifier si le token est expiré
    const currentTime = Date.now() / 1000;
    if (decoded.exp && decoded.exp < currentTime) {
      localStorage.removeItem("token");
      return false;
    }
    return true;
  } catch (e) {
    localStorage.removeItem("token");
    return false;
  }
}, [isClient]);

  const handleSelectPatient = async (patient: IUser) => {
    if (!currentUser) return;
    setSelectedPatient(patient);
    const token = localStorage.getItem("token");
    try {
      await axios.post("/api/conversations", 
        { participantId: patient._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchConversations();
    } catch (error) { 
      console.error(error); 
    }
  };

  const handleSelectConversation = (conversation: IConversation) => {
    if (!currentUser) return;
    const patient = conversation.participants.find(p => p._id !== currentUser.id);
    if (patient) {
      setSelectedPatient(patient);
      // Réinitialiser le compteur de non-lus
      const updatedConversations = conversations.map(conv => 
        conv._id === conversation._id ? { ...conv, unreadCount: 0 } : conv
      );
      setConversations(updatedConversations);
      // Charger les messages de cette conversation
      loadMessages();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: "Le fichier ne doit pas dépasser 10MB",
        severity: "error"
      });
      return;
    }

    // Vérifier le type de fichier
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      setSnackbar({
        open: true,
        message: "Type de fichier non autorisé",
        severity: "error"
      });
      return;
    }

    setSelectedFile(file);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || !selectedPatient || !roomId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (selectedFile) {
        // Envoyer avec fichier
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('content', input);
        formData.append('roomId', roomId);
        formData.append('receiverId', selectedPatient._id);

        // Simuler une progression d'upload
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        await axios.post('/api/upload', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          }
        });

        clearInterval(interval);
        setUploadProgress(100);
        
        setSnackbar({
          open: true,
          message: "Fichier envoyé avec succès",
          severity: "success"
        });
        
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        // Envoyer seulement du texte
        await axios.post('/api/messages', {
          content: input,
          roomId,
          receiverId: selectedPatient._id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      await loadMessages();
      await fetchConversations();
      setInput("");
      setUploadProgress(0);
    } catch (err: unknown) { 
      console.error(err);
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          "Erreur lors de l'envoi";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    } finally { 
      setLoading(false); 
      setUploadProgress(0);
    }
  };

  const sendPrescription = async () => {
    if (!prescriptionText.trim() || !selectedPatient || !roomId) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/messages', {
        content: `📋 Prescription médicale:\n\n${prescriptionText}\n\n-- Dr. ${currentUser?.username}`,
        roomId,
        receiverId: selectedPatient._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPrescriptionDialog(false);
      setPrescriptionText("");
      await loadMessages();
      await fetchConversations();
      
      setSnackbar({
        open: true,
        message: "Prescription envoyée avec succès",
        severity: "success"
      });
    } catch (err: unknown) { 
      console.error(err);
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          "Erreur lors de l'envoi";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    }
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <InsertDriveFileIcon />;
    
    if (fileType.startsWith('image/')) return <ImageIcon color="primary" />;
    if (fileType === 'application/pdf') return <PictureAsPdfIcon color="error" />;
    if (fileType.includes('word')) return <InsertDriveFileIcon color="info" />;
    
    return <InsertDriveFileIcon />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePreview = (fileUrl: string) => {
    if (fileUrl.startsWith('/uploads/')) {
      setPreviewImage(fileUrl);
      setPreviewOpen(true);
    } else {
      window.open(fileUrl, '_blank');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Helpers ---
  const getPatientName = (conversation: IConversation): string => {
    if (!currentUser) return "";
    const patient = conversation.participants.find(p => p._id !== currentUser.id);
    return patient?.username || "Patient";
  };

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : "PT";

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours} h`;
    if (diffDays < 7) return `${diffDays} j`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = getPatientName(conv).toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'unread') return matchesSearch && (conv.unreadCount || 0) > 0;
    if (filter === 'today') {
      const today = new Date();
      const convDate = new Date(conv.updatedAt);
      return matchesSearch && convDate.toDateString() === today.toDateString();
    }
    return matchesSearch;
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (newFilter: 'all' | 'unread' | 'today') => {
    setFilter(newFilter);
    handleMenuClose();
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f0f4f8' }}>
      
      {/* Input fichier caché */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
      />

      {/* --- SIDEBAR --- */}
      <Paper 
        elevation={0}
        sx={{ 
          width: { xs: '100%', md: 400 }, 
          display: { xs: selectedPatient ? 'none' : 'flex', md: 'flex' },
          flexDirection: 'column', 
          borderRight: '1px solid #e0e0e0',
          borderRadius: 0,
          bgcolor: 'white',
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
        }}
      >
        {/* Sidebar Header */}
        <Box p={2} sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
              <LocalHospitalIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                Dr. {currentUser?.username || 'Médecin'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {currentUser?.specialite || 'Médecin Généraliste'}
              </Typography>
            </Box>
            <IconButton color="inherit" onClick={handleMenuClick}>
              <FilterListIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* Search */}
        <Box p={2}>
          <Paper
            sx={{ 
              p: '2px 4px', 
              display: 'flex', 
              alignItems: 'center', 
              borderRadius: 2,
              bgcolor: '#f5f7fa',
              boxShadow: 'none'
            }}
          >
            <IconButton sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Rechercher un patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Paper>
        </Box>

        {/* Stats */}
        <Box px={2} pb={2}>
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Chip 
              icon={<MessageIcon />}
              label={`${conversations.length} conversations`}
              size="small"
              variant="outlined"
            />
            <Chip 
              icon={<PersonIcon />}
              label={`${patients.length} patients`}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* Filter Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleFilterChange('all')}>
            Toutes les conversations
          </MenuItem>
          <MenuItem onClick={() => handleFilterChange('unread')}>
            Non lues
          </MenuItem>
          <MenuItem onClick={() => handleFilterChange('today')}>
            Aujourdhui
          </MenuItem>
        </Menu>

        {/* List */}
        <List sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const patientName = getPatientName(conv);
              const patient = conv.participants.find(p => p._id !== currentUser?.id);
              const isSelected = selectedPatient?._id === patient?._id;
              
              return (
                <ListItemButton 
                  key={conv._id} 
                  selected={isSelected}
                  onClick={() => handleSelectConversation(conv)}
                  sx={{ 
                    borderRadius: 2, 
                    mb: 1,
                    '&.Mui-selected': { 
                      bgcolor: 'primary.light', 
                      '&:hover': { bgcolor: 'primary.light' }
                    }
                  }}
                >
                  <ListItemAvatar sx={{ position: 'relative' }}>
                    <Avatar 
                      alt={patientName} 
                      sx={{ bgcolor: patient?.gender === 'female' ? '#F48FB1' : '#81D4FA' }}
                    >
                      {getInitials(patientName)}
                    </Avatar>
                    <StatusDot status="online" />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography fontWeight="bold">
                          {patientName}
                        </Typography>
                        {conv.unreadCount && conv.unreadCount > 0 ? (
                          <Chip 
                            label={conv.unreadCount}
                            size="small"
                            color="error"
                            sx={{ minWidth: 20, height: 20, fontSize: '0.7rem' }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {getTimeAgo(conv.updatedAt)}
                          </Typography>
                        )}
                      </Stack>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {conv.lastMessage?.content || "Aucun message"}
                      </Typography>
                    } 
                  />
                </ListItemButton>
              );
            })
          ) : (
            <Box p={3} textAlign="center">
              <MessageIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography color="text.secondary">
                {filter === 'unread' ? 'Aucun message non lu' : 'Aucune conversation'}
              </Typography>
            </Box>
          )}
        </List>
      </Paper>

      {/* --- CHAT AREA --- */}
      <Box sx={{ 
        flexGrow: 1, 
        display: { xs: selectedPatient ? 'flex' : 'none', md: 'flex' },
        flexDirection: 'column', 
        bgcolor: 'white' 
      }}>
        {selectedPatient ? (
          <>
            {/* Chat Header */}
            <AppBar 
              position="static" 
              color="inherit" 
              elevation={0} 
              sx={{ 
                borderBottom: '1px solid #e0e0e0',
                bgcolor: '#f8fafc'
              }}
            >
              <Toolbar>
                {isMobile && (
                  <IconButton edge="start" onClick={() => setSelectedPatient(null)} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                  </IconButton>
                )}
                <Box sx={{ position: 'relative', mr: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: selectedPatient.gender === 'female' ? '#F48FB1' : '#81D4FA',
                      width: 48,
                      height: 48
                    }}
                  >
                    {getInitials(selectedPatient.username)}
                  </Avatar>
                  <StatusDot status={patientStatus} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6" fontWeight="bold">
                      {selectedPatient.username}
                    </Typography>
                    <Chip 
                      label={`${selectedPatient.age} ans`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {patientStatus === 'online' ? 'En ligne' : 
                       patientStatus === 'away' ? 'Absent' : 'Hors ligne'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Dernier message: {messages.length > 0 ? getTimeAgo(messages[messages.length-1]?.createdAt || '') : 'Aucun'}
                    </Typography>
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton 
                    color="primary"
                    onClick={() => setPrescriptionDialog(true)}
                    title="Rédiger une prescription"
                  >
                    <NoteAddIcon />
                  </IconButton>
                  <IconButton color="primary">
                    <MedicalServicesIcon />
                  </IconButton>
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </Stack>
              </Toolbar>
            </AppBar>

            {/* Patient Info Banner */}
            {/* <Box sx={{ p: 2, bgcolor: '#FFF3E0', borderBottom: '1px solid #FFE0B2' }}>
              <Stack direction="row" spacing={2} alignItems="center"> */}
                {/* <Typography variant="subtitle2" fontWeight="bold">
                  Dossier médical:
                </Typography> */}
                {/* <Chip 
                  label="Hypertension" 
                  size="small"
                  sx={{ backgroundColor: '#FFEBEE', color: '#D32F2F', fontWeight: 600, fontSize: '0.75rem' }}
                />
                <Chip 
                  label="Diabète Type 2" 
                  size="small"
                  sx={{ backgroundColor: '#FFF3E0', color: '#F57C00', fontWeight: 600, fontSize: '0.75rem' }}
                />
                <Chip 
                  label="Allergie: Pénicilline" 
                  size="small" 
                  color="error" 
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                /> */}
              {/* </Stack>
            </Box> */}

            {/* Messages Area */}
            <Box sx={{ 
              flexGrow: 1, 
              overflowY: 'auto', 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2,
              bgcolor: 'grey.50'
            }}>
              {messages.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  mt: 10, 
                  opacity: 0.6,
                  maxWidth: 400,
                  mx: 'auto'
                }}>
                  <Avatar sx={{ 
                    width: 80, 
                    height: 80, 
                    margin: 'auto', 
                    bgcolor: 'primary.light', 
                    mb: 2 
                  }}>
                    <MedicalServicesIcon sx={{ fontSize: 40 }}/>
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    Bienvenue Dr. {currentUser?.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cest le début de votre conversation avec {selectedPatient.username}
                  </Typography>
                  <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
                    <AlertTitle>Conseil médical</AlertTitle>
                    Noubliez pas de demander les symptômes actuels et les antécédents médicaux.
                  </Alert>
                </Box>
              ) : (
                <>
                  <Box sx={{ textAlign: 'center', my: 2 }}>
                    <Chip 
                      label={`${messages.length} messages échangés`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  
                  {messages.map((msg, i) => {
                    const isMe = msg.sender._id === currentUser?.id;
                    const isSystem = msg.content.includes('Prescription');
                    
                    return (
                      <Box 
                        key={msg._id || i} 
                        sx={{ 
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          display: 'flex',
                          flexDirection: isMe ? 'row-reverse' : 'row',
                          alignItems: 'end',
                          gap: 1,
                          maxWidth: '100%'
                        }}
                      >
                        {!isMe && !isSystem && (
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            fontSize: 12,
                            bgcolor: selectedPatient.gender === 'female' ? '#F48FB1' : '#81D4FA'
                          }}>
                            {getInitials(msg.sender.username)}
                          </Avatar>
                        )}
                        
                        <MessageBubble isMe={isMe}>
                          {isSystem && (
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                              <NoteAddIcon color="primary" />
                              <Typography variant="caption" fontWeight="bold" color="primary">
                                PRESCRIPTION MÉDICALE
                              </Typography>
                            </Stack>
                          )}
                          
                          {/* Contenu texte */}
                          {msg.content && !msg.content.startsWith('📎') && (
                            <Typography variant="body1">{msg.content}</Typography>
                          )}
                          
                          {/* Pièce jointe */}
                          {msg.fileUrl && (
                            <FilePreview>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {getFileIcon(msg.fileType)}
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                  <Typography variant="body2" noWrap>
                                    {msg.fileName || 'Fichier'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatFileSize(msg.fileSize)}
                                  </Typography>
                                </Box>
                                <Stack direction="row" spacing={0.5}>
                                  <IconButton 
                                    size="small"
                                    onClick={() => handlePreview(msg.fileUrl!)}
                                    title="Voir/Télécharger"
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </Stack>
                            </FilePreview>
                          )}
                          
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block', 
                              textAlign: 'right', 
                              mt: 0.5, 
                              opacity: 0.7, 
                              fontSize: '0.7rem' 
                            }}
                          >
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit', 
                              minute:'2-digit'
                            }) : '...'}
                          </Typography>
                        </MessageBubble>
                      </Box>
                    );
                  })}
                </>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* File Preview */}
            {selectedFile && (
              <Box sx={{ p: 1, borderTop: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
                <Paper sx={{ p: 1.5, bgcolor: 'white' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {getFileIcon(selectedFile.type)}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" noWrap>
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(selectedFile.size)}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={() => setSelectedFile(null)}
                      color="error"
                    >
                      <CloseIcon />
                    </IconButton>
                  </Stack>
                </Paper>
              </Box>
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <Box sx={{ p: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                  Envoi en cours... {uploadProgress}%
                </Typography>
              </Box>
            )}

            {/* Input Area */}
            <Box 
              component="form" 
              onSubmit={sendMessage} 
              sx={{ 
                p: 2, 
                bgcolor: 'white', 
                borderTop: '1px solid #e0e0e0',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton 
                  color="primary"
                  onClick={() => fileInputRef.current?.click()}
                  title="Joindre un fichier"
                >
                  <AttachFileIcon />
                </IconButton>
                <Paper
                  elevation={0}
                  sx={{ 
                    flex: 1, 
                    bgcolor: '#f5f7fa', 
                    borderRadius: 3, 
                    px: 2, 
                    py: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <InputBase
                    sx={{ flex: 1 }}
                    placeholder="Écrivez votre réponse médicale..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                    multiline
                    maxRows={4}
                  />
                  <IconButton size="small" sx={{ color: 'text.secondary' }}>
                    <EmojiEmotionsIcon />
                  </IconButton>
                </Paper>
                <IconButton 
                  type="submit" 
                  color="primary" 
                  disabled={(!input.trim() && !selectedFile) || loading}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    '&:hover': { bgcolor: 'primary.dark' }, 
                    width: 48, 
                    height: 48 
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                </IconButton>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                ⚕️ Fichiers autorisés: images, PDF, Word, texte (max 10MB)
              </Typography>
            </Box>
          </>
        ) : (
          /* Empty State */
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            bgcolor: 'grey.50'
          }}>
            <Avatar sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: 'primary.main', 
              mb: 3 
            }}>
              <LocalHospitalIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <Typography variant="h4" color="text.secondary" fontWeight="bold" gutterBottom>
              Cabinet Médical
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, textAlign: 'center' }}>
              Sélectionnez un patient pour consulter son dossier médical et commencer la consultation
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button 
                variant="outlined" 
                startIcon={<AccessTimeIcon />}
                onClick={() => setFilter('today')}
              >
                Consultations du jour
              </Button>
              <Button 
                variant="contained" 
                startIcon={<MedicalServicesIcon />}
                onClick={() => {
                  // Logique pour voir tous les patients
                }}
              >
                All les patients
              </Button>
            </Stack>
          </Box>
        )}
      </Box>

      {/* Prescription Dialog */}
      <Dialog 
        open={prescriptionDialog} 
        onClose={() => setPrescriptionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <NoteAddIcon color="primary" />
            <Typography variant="h6">
              Rédiger une prescription pour {selectedPatient?.username}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Cette prescription sera envoyée au patient et archivée dans son dossier médical.
          </Alert>
          <TextField
            autoFocus
            multiline
            rows={12}
            fullWidth
            placeholder={`Prescription médicale pour ${selectedPatient?.username}

1. Medicines:
   - 
   - 

2. Posologie:

3. Instructions:

4. Suivi:`}
            value={prescriptionText}
            onChange={(e) => setPrescriptionText(e.target.value)}
            variant="outlined"
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Signature: Dr. {currentUser?.username} • {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrescriptionDialog(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={sendPrescription}
            disabled={!prescriptionText.trim()}
            startIcon={<SendIcon />}
          >
            Envoyer la prescription
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography>Aperçu</Typography>
            <IconButton onClick={() => setPreviewOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <img 
              src={previewImage} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70vh',
                objectFit: 'contain'
              }} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            startIcon={<DownloadIcon />}
            onClick={() => {
              const link = document.createElement('a');
              link.href = previewImage;
              link.download = previewImage.split('/').pop() || 'image';
              link.click();
            }}
          >
            Télécharger
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}