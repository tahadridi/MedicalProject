/// components/PatientChatPage.tsx (version avec noms corrigés seulement)
'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from 'next/navigation';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Snackbar,
  Alert
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
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";

// --- Interfaces ---
interface IUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  nom?: string;
  prenom?: string;
  specialite?: string;
}

interface IMessage {
  _id?: string;
  sender: { _id: string; username: string; nom?: string; prenom?: string };
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
}

interface IConversation {
  _id: string;
  participants: IUser[];
  roomId: string;
  lastMessage?: IMessage;
  createdAt: string;
  updatedAt: string;
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

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isMe",
})<{ isMe: boolean }>(({ theme, isMe }) => ({
  // 40ch pour environ 40 caractères (plus réaliste)
  maxWidth: "min(80%, 40ch)", 
  minWidth: "60px",
  padding: theme.spacing(1.5, 2),
  borderRadius: isMe ? "20px 20px 0px 20px" : "20px 20px 20px 0px",
  backgroundColor: isMe ? theme.palette.primary.main : theme.palette.grey[100],
  color: isMe ? "#fff" : theme.palette.text.primary,
  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  position: "relative",
  wordBreak: "normal",
  display: "inline-block",
  whiteSpace: "pre-wrap",
  overflowWrap: "normal",
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

export default function PatientChatPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // --- States ---
  const [medecins, setMedecins] = useState<IUser[]>([]);
  const [selectedMedecin, setSelectedMedecin] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<JWTPayload | null>(null);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  const generateRoomId = (id1: string, id2: string) => {
    return [id1, id2].sort().join('_');
  };
  
  const roomId = selectedMedecin && currentUser 
    ? generateRoomId(currentUser.id, selectedMedecin._id) 
    : null;
    
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef<number>(0);

  // --- Helper functions for doctor names ---
 const getDoctorDisplayName = (doctor: IUser): string => {
  if (!doctor) return "Médecin";
  
  // Priorité 1: nom + prénom
  if (doctor.nom && doctor.prenom) {
    return `Dr. ${doctor.prenom} ${doctor.nom}`;
  }
  
  // Priorité 2: prénom seulement
  if (doctor.prenom) {
    return `Dr. ${doctor.prenom}`;
  }
  
  // Priorité 3: nom seulement
  if (doctor.nom) {
    return `Dr. ${doctor.nom}`;
  }
  
  // Priorité 4: username
  if (doctor.username) {
    return doctor.username;
  }
  
  // Priorité 5: email
  if (doctor.email) {
    return doctor.email.split('@')[0];
  }
  
  return "Médecin";
};

  const getDoctorInitials = (doctor: IUser): string => {
    if (doctor.nom && doctor.prenom) {
      return `${doctor.prenom[0]}${doctor.nom[0]}`.toUpperCase();
    }
    return doctor.username ? doctor.username.substring(0, 2).toUpperCase() : "Dr";
  };

  // --- Fonction pour vérifier si l'utilisateur est près du bas ---
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Si l'utilisateur est à moins de 100px du bas, on considère qu'il est "près du bas"
    return distanceFromBottom <= 100;
  };

  // --- Fonction pour scroller vers le bas de manière intelligente ---
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current && shouldAutoScroll) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, [shouldAutoScroll]);

  // --- API Logic ---
  const loadMessages = useCallback(async () => {
    if (!roomId) return;
    try {
      const response = await axios.get(`/api/messages?roomId=${roomId}`);
      const newMessages = response.data;
      
      // Vérifier si c'est un nouveau message (et pas juste un refresh)
      const isNewMessage = newMessages.length > messages.length;
      
      setMessages(newMessages);
      
      // Scroller seulement si:
      // 1. L'utilisateur est près du bas
      // 2. OU c'est un nouveau message qu'IL a envoyé
      if (isNewMessage) {
        const lastMessage = newMessages[newMessages.length - 1];
        const isMyMessage = lastMessage?.sender._id === currentUser?.id;
        
        if (isMyMessage || isNearBottom()) {
          setTimeout(() => scrollToBottom(), 100);
        }
      }
      
      // Mettre à jour la référence du nombre de messages
      lastMessageCountRef.current = newMessages.length;
      
    } catch (err) { 
      console.error('Erreur chargement messages', err); 
    }
  }, [roomId, messages.length, currentUser?.id, scrollToBottom]);

  // --- Gérer le scroll manuel de l'utilisateur ---
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Si l'utilisateur scrolle vers le haut (loin du bas), désactiver l'auto-scroll
    if (distanceFromBottom > 200) {
      setShouldAutoScroll(false);
    } 
    // Si l'utilisateur est très proche du bas, réactiver l'auto-scroll
    else if (distanceFromBottom <= 50) {
      setShouldAutoScroll(true);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    
    return () => clearInterval(interval);
  }, [roomId, loadMessages]);

  // --- Scroller vers le bas au chargement initial d'une conversation ---
  useEffect(() => {
    if (selectedMedecin && messages.length > 0) {
      // Réinitialiser l'auto-scroll quand on change de conversation
      setShouldAutoScroll(true);
      setTimeout(() => scrollToBottom("auto"), 300);
    }
  }, [selectedMedecin]);

  // --- Gérer le chargement initial ---
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
    fetchMedecins();
    fetchConversations();
  }, []);

  const fetchMedecins = async () => {
  try {
    const res = await axios.get("/api/doctors");
    
    // Your API returns { success: true, data: [...], pagination: {...} }
    if (res.data && res.data.success) {
      // Extract the array from the data property
      setMedecins(res.data.data || []);
    } else if (Array.isArray(res.data)) {
      // Fallback: if it's already an array
      setMedecins(res.data);
    } else {
      console.error("Unexpected API response format:", res.data);
      setMedecins([]);
    }
    
  } catch (error) { 
    console.error("Error fetching doctors:", error);  
    setMedecins([]);
  }
};

const fetchConversations = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("/api/conversations", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // SUPPRIMEZ toute la logique de réparation
    // Gardez simplement :
    setConversations(res.data);
    
  } catch (error) { 
    console.error("Erreur lors du chargement des conversations:", error); 
  }
};

  const handleSelectMedecin = async (medecin: IUser) => {
    if (!currentUser) return;
    setSelectedMedecin(medecin);
    const token = localStorage.getItem("token");
    try {
      await axios.post("/api/conversations", 
        { participantId: medecin._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchConversations();
    } catch (error) { 
      console.error(error); 
    }
  };

const handleSelectConversation = (conversation: IConversation) => {
  if (!currentUser) return;

  console.log("💬 Selecting conversation:", conversation);

  // N'ESSAYEZ PAS de charger la conversation complète
  // Utilisez directement les informations disponibles
  
  let targetMedecin = null;

  // Essayez d'abord de trouver dans les participants
  if (conversation.participants && conversation.participants.length > 0) {
    targetMedecin = conversation.participants.find(
      p => p._id !== currentUser.id
    );
  }

  // Si pas trouvé, utilisez le roomId
  if (!targetMedecin) {
    const roomIdParts = conversation.roomId.split('_');
    const medecinId = roomIdParts.find(id => id !== currentUser.id);
    
    if (medecinId) {
      targetMedecin = medecins.find(med => med._id === medecinId) || {
        _id: medecinId,
        username: "Médecin",
        email: "",
        role: "medecin",
        nom: "",
        prenom: "",
        specialite: "Non spécifié"
      };
    }
  }

  if (!targetMedecin) {
    console.error("❌ Impossible de déterminer le médecin");
    return;
  }

  console.log("👤 Médecin sélectionné:", targetMedecin);

  setSelectedMedecin(targetMedecin);
  setMessages([]);
  loadMessages();

  // Marquer comme lu
  setConversations(prev =>
    prev.map(conv =>
      conv._id === conversation._id
        ? { ...conv, unreadCount: 0 }
        : conv
    )
  );
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
  if (!input.trim() && !selectedFile) return; // <-- Accepter soit texte, soit fichier
  if (!selectedMedecin || !currentUser) return;

  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    // Generate room ID for patient-to-doctor
    const roomIdToUse = generateRoomId(currentUser.id, selectedMedecin._id);
    
    console.log('Sending message:', { 
      hasFile: !!selectedFile, 
      text: input,
      roomId: roomIdToUse 
    });
    
    // Forcer l'auto-scroll quand l'utilisateur envoie un message
    setShouldAutoScroll(true);
    
    if (selectedFile) {
      // ENLEVEZ la simulation de progression ! Gardez seulement la vraie progression
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('content', input);
      formData.append('roomId', roomIdToUse);
      formData.append('receiverId', selectedMedecin._id);

      console.log('Token present:', !!token); // Debug
      
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
            console.log('Upload progress:', percentCompleted + '%'); // Debug
            setUploadProgress(percentCompleted);
          }
        }
      });

      // Mettre à 100% si ce n'est pas déjà fait
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
        roomId: roomIdToUse,
        receiverId: selectedMedecin._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    // Attendre un peu avant de recharger les messages
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await loadMessages();
    await fetchConversations();
    setInput("");
    setUploadProgress(0);
    
    // Scroller vers le bas après envoi
    setTimeout(() => scrollToBottom(), 100);
    
  } catch (err: any) { 
    console.error('Error sending message:', err);
    
    // Afficher l'erreur spécifique de l'API si disponible
    const errorMessage = err.response?.data?.error || 
                        err.message || 
                        "Erreur lors de l'envoi";
    
    setSnackbar({
      open: true,
      message: errorMessage,
      severity: "error"
    });
    
    // Réinitialiser la progression en cas d'erreur
    setUploadProgress(0);
  } finally { 
    setLoading(false); 
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

  // --- Bouton pour revenir au bas de la page ---
  const ScrollToBottomButton = () => {
    if (shouldAutoScroll || !messagesContainerRef.current) return null;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Afficher le bouton seulement si l'utilisateur est loin du bas (> 200px)
    if (distanceFromBottom > 200) {
      return (
        <Box
          sx={{
            position: 'absolute',
            bottom: 100,
            right: 20,
            zIndex: 10,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => {
              setShouldAutoScroll(true);
              scrollToBottom();
            }}
            startIcon={<ArrowBackIcon sx={{ transform: 'rotate(90deg)' }} />}
            sx={{
              borderRadius: 20,
              boxShadow: 3,
              textTransform: 'none',
            }}
          >
            Nouveaux messages
          </Button>
        </Box>
      );
    }
    
    return null;
  };

  // --- Helpers ---
 const getMedecinName = (conversation: IConversation): string => {
  if (!currentUser) return "Médecin";
  
  console.log("🔍 Recherche du nom du médecin pour la conversation:", conversation._id);
  
  try {
    // 1. Extraire l'ID du médecin du roomId (toujours fiable)
    const roomIdParts = conversation.roomId.split('_');
    const medecinId = roomIdParts.find(id => id !== currentUser.id);
    
    if (!medecinId) {
      console.log("❌ Impossible d'extraire l'ID du médecin du roomId");
      return "Médecin";
    }
    
    console.log("📋 ID du médecin extrait du roomId:", medecinId);
    
    // 2. Chercher d'abord dans la liste complète des médecins
    if (medecins.length > 0) {
      const medecinFromList = medecins.find(med => med._id === medecinId);
      if (medecinFromList) {
        const name = getDoctorDisplayName(medecinFromList);
        console.log("✅ Médecin trouvé dans la liste:", name);
        return name;
      }
    }
    
    // 3. Chercher dans les participants de la conversation
    if (conversation.participants && conversation.participants.length > 0) {
      const medFromParticipants = conversation.participants.find(p => p._id !== currentUser.id);
      if (medFromParticipants) {
        const name = getDoctorDisplayName(medFromParticipants);
        console.log("✅ Médecin trouvé dans les participants:", name);
        return name;
      }
    }
    
    // 4. Si le médecin est dans les participants mais avec un ID différent ?
    if (conversation.participants && conversation.participants.length === 1) {
      // Peut-être que le seul participant est le médecin
      const onlyParticipant = conversation.participants[0];
      if (onlyParticipant._id !== currentUser.id) {
        const name = getDoctorDisplayName(onlyParticipant);
        console.log("✅ Médecin est le seul participant:", name);
        return name;
      }
    }
    
    // 5. Dernier recours : vérifier si c'est un médecin connu
    console.log("⚠️ Médecin non trouvé, ID:", medecinId);
    console.log("📊 Médecins disponibles:", medecins.map(m => ({ id: m._id, nom: m.nom })));
    
    return "Médecin";
    
  } catch (error) {
    console.error("❌ Erreur dans getMedecinName:", error);
    return "Médecin";
  }
};

  const getSenderName = (message: IMessage): string => {
    if (message.sender._id === currentUser?.id) {
      return "Vous";
    }
    if (message.sender.nom && message.sender.prenom) {
      return `Dr. ${message.sender.prenom} ${message.sender.nom}`;
    }
    return message.sender.username || "Médecin";
  };

  const getSenderInitials = (message: IMessage): string => {
    if (message.sender._id === currentUser?.id) {
      return currentUser.username.substring(0, 2).toUpperCase();
    }
    if (message.sender.nom && message.sender.prenom) {
      return `${message.sender.prenom[0]}${message.sender.nom[0]}`.toUpperCase();
    }
    return message.sender.username ? message.sender.username.substring(0, 2).toUpperCase() : "Dr";
  };

  const filteredConversations = conversations.filter(conv =>
    getMedecinName(conv).toLowerCase().includes(searchTerm.toLowerCase())
  );

 const filteredMedecins = Array.isArray(medecins) 
  ? medecins.filter(med => {
      const displayName = getDoctorDisplayName(med);
      return displayName.toLowerCase().includes(searchTerm.toLowerCase());
    })
  : [];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f7fa' }}>
      
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
        elevation={3}
        sx={{ 
          width: { xs: '100%', md: 360 }, 
          display: { xs: selectedMedecin ? 'none' : 'flex', md: 'flex' },
          flexDirection: 'column', 
          borderRight: '1px solid #e0e0e0',
          borderRadius: 0,
          bgcolor: 'white'
        }}
      >
        {/* Sidebar Header */}
        <Box p={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
              {currentUser?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" fontWeight="bold">Discussions</Typography>
          </Stack>
        </Box>

        {/* Search */}
        <Box px={2} pb={2}>
          <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', borderRadius: 50, bgcolor: '#f0f2f5', boxShadow: 'none' }}
          >
            <IconButton sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Paper>
        </Box>

        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)} 
          variant="fullWidth" 
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Messages" />
          <Tab label="Médecins" />
        </Tabs>

        {/* List */}
        <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {activeTab === 0 ? (
            filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const medName = getMedecinName(conv);
                const medecin = conv.participants.find(p => p._id !== currentUser?.id);
                const isSelected = selectedMedecin?._id === medecin?._id;
                
                return (
                  <ListItemButton 
                    key={conv._id} 
                    selected={isSelected}
                    onClick={() => handleSelectConversation(conv)}
                    sx={{ 
                      borderRadius: 2, 
                      mx: 1, 
                      mb: 0.5,
                      '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.dark' },
                      '&.Mui-selected:hover': { bgcolor: 'primary.light' }
                    }}
                  >
                    <ListItemAvatar>
                      <StyledBadge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot">
                        <Avatar alt={medName} sx={{ bgcolor: 'primary.main' }}>
                          {medecin ? getDoctorInitials(medecin) : "Dr"}
                        </Avatar>
                      </StyledBadge>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={<Typography fontWeight="bold">{medName}</Typography>}
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
                <Typography color="text.secondary">Aucune conversation</Typography>
              </Box>
            )
          ) : (
            filteredMedecins.map((med) => (
              <ListItemButton 
                key={med._id} 
                onClick={() => handleSelectMedecin(med)}
                sx={{ borderRadius: 2, mx: 1 }}
              >
                 <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      {getDoctorInitials(med)}
                    </Avatar>
                 </ListItemAvatar>
                 <ListItemText 
                    primary={getDoctorDisplayName(med)} 
                    secondary={med.specialite || "Généraliste"} 
                 />
              </ListItemButton>
            ))
          )}
        </List>
      </Paper>

      {/* --- CHAT AREA --- */}
      <Box sx={{ 
        flexGrow: 1, 
        display: { xs: selectedMedecin ? 'flex' : 'none', md: 'flex' },
        flexDirection: 'column', 
        bgcolor: 'white',
        position: 'relative'
      }}>
        {selectedMedecin ? (
          <>
            {/* Chat Header */}
            <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', py: 1 }}>
              <Toolbar>
                {isMobile && (
                  <IconButton edge="start" onClick={() => setSelectedMedecin(null)} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                  </IconButton>
                )}
                <StyledBadge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot">
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {getDoctorInitials(selectedMedecin)}
                  </Avatar>
                </StyledBadge>
                <Box sx={{ ml: 2, flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {getDoctorDisplayName(selectedMedecin)}
                  </Typography>
                  <Typography variant="caption" color="green">
                    En ligne
                  </Typography>
                </Box>
              </Toolbar>
            </AppBar>

            {/* Messages Area avec gestion de scroll intelligente */}
            <Box
              ref={messagesContainerRef}
              onScroll={handleScroll}
              sx={{ 
                flexGrow: 1, 
                overflowY: 'auto', 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2, 
                bgcolor: '#f5f7fa',
                position: 'relative'
              }}
            >
              {messages.length === 0 && (
                <Box sx={{ textAlign: 'center', mt: 10, opacity: 0.6 }}>
                  <Avatar sx={{ 
                    width: 80, 
                    height: 80, 
                    margin: 'auto', 
                    bgcolor: 'primary.light', 
                    mb: 2 
                  }}>
                    <EmojiEmotionsIcon sx={{ fontSize: 40 }}/>
                  </Avatar>
                  <Typography variant="h6">
                    Dites bonjour à {getDoctorDisplayName(selectedMedecin)} 👋
                  </Typography>
                </Box>
              )}
              
              {messages.map((msg, i) => {
                const isMe = msg.sender._id === currentUser?.id;
                
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
                    {!isMe && (
                      <Avatar sx={{ 
                        width: 28, 
                        height: 28, 
                        fontSize: 12, 
                        bgcolor: 'secondary.main' 
                      }}>
                        {getSenderInitials(msg)}
                      </Avatar>
                    )}
                    
                    <MessageBubble isMe={isMe}>
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
                                title="Voir"
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </FilePreview>
                      )}
                      
                      {/* Date */}
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
              
              {/* Bouton pour revenir au bas */}
              <ScrollToBottomButton />
              
              {/* Référence pour le scroll automatique */}
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
              sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}
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
                    bgcolor: '#f0f2f5', 
                    borderRadius: 50, 
                    px: 2, 
                    py: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <InputBase
                    sx={{ flex: 1 }}
                    placeholder="Écrivez un message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                    multiline
                    maxRows={3}
                  />
                </Paper>
                <IconButton 
                  type="submit" 
                  color="primary" 
                  disabled={(!input.trim() && !selectedFile) || loading}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    '&:hover': { bgcolor: 'primary.dark' }, 
                    width: 45, 
                    height: 45 
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                </IconButton>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                Fichiers autorisés: images, PDF, Word, texte (max 10MB)
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
            height: '100%' 
          }}>
            <Avatar sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: 'primary.light', 
              mb: 3 
            }}>
              <SendIcon sx={{ fontSize: 50, color: 'white' }} />
            </Avatar>
            <Typography variant="h4" color="text.secondary" fontWeight="bold">
              Bienvenue
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Sélectionnez une discussion pour commencer
            </Typography>
          </Box>
        )}
      </Box>

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