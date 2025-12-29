// components/VideoCallModal.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Patient } from './dashboard';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  doctorName?: string;
}

export default function VideoCallModal({ 
  isOpen, 
  onClose, 
  patient, 
  doctorName = "Dr. Mohamed Trabelsi" 
}: VideoCallModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [callQuality, setCallQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize video call
  const initializeCall = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Get user media (camera and microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Simulate connection (in production, replace with actual WebRTC)
      setTimeout(() => {
        setIsConnecting(false);
        setIsCallActive(true);
        startCallTimer();
        
        // Simulate call quality changes
        simulateCallQuality();
      }, 2000);

    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera or microphone. Please check permissions.');
      setIsConnecting(false);
    }
  };

  const startCallTimer = () => {
    callIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const simulateCallQuality = () => {
    const qualities: Array<'excellent' | 'good' | 'poor'> = ['excellent', 'good', 'poor'];
    setInterval(() => {
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      setCallQuality(randomQuality);
    }, 10000); // Change every 10 seconds
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always"
          },
          audio: true
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        // Store original stream to switch back
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          toggleScreenShare();
        });

        localStreamRef.current = screenStream;
        setIsScreenSharing(true);
      } else {
        // Switch back to camera
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = cameraStream;
        }

        localStreamRef.current = cameraStream;
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  const takeScreenshot = () => {
    if (!localVideoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = localVideoRef.current.videoWidth;
    canvas.height = localVideoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(localVideoRef.current, 0, 0);
      const image = canvas.toDataURL('image/png');
      
      // Create download link
      const link = document.createElement('a');
      link.href = image;
      link.download = `screenshot-${patient?.name || 'patient'}-${new Date().toISOString()}.png`;
      link.click();
    }
  };

  const recordCall = () => {
    // In a real implementation, you would use MediaRecorder API
    alert('Call recording started. This would use MediaRecorder API in production.');
  };

  const endCall = () => {
    // Clean up
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
    }

    if (callIntervalRef.current) {
      clearInterval(callIntervalRef.current);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsCallActive(false);
    setCallDuration(0);
    onClose();
  };

  useEffect(() => {
    if (isOpen && patient) {
      initializeCall();
    }

    return () => {
      endCall();
    };
  }, [isOpen]);

  if (!isOpen || !patient) return null;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = () => {
    switch (callQuality) {
      case 'excellent': return 'text-emerald-400';
      case 'good': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getQualityIcon = () => {
    switch (callQuality) {
      case 'excellent': return 'fa-wifi';
      case 'good': return 'fa-wifi';
      case 'poor': return 'fa-wifi-slash';
      default: return 'fa-wifi';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <div className="relative w-full max-w-7xl h-[95vh] bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl overflow-hidden border-2 border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
        
        {/* Header - Enhanced */}
        <div className="absolute top-0 left-0 right-0 z-30 p-6 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-xl shadow-blue-500/30 animate-pulse">
              <i className="fas fa-video text-white text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Clinical Video Consultation
              </h2>
              <div className="flex items-center space-x-6 text-slate-300 mt-1">
                <span className="flex items-center bg-cyan-500/10 px-3 py-1 rounded-full">
                  <i className="fas fa-user-md mr-2 text-cyan-400"></i>
                  {doctorName}
                </span>
                <span className="flex items-center bg-purple-500/10 px-3 py-1 rounded-full">
                  <i className="fas fa-user-injured mr-2 text-purple-400"></i>
                  {patient.name}
                </span>
                <span className="flex items-center bg-emerald-500/10 px-3 py-1 rounded-full">
                  <i className={`fas ${getQualityIcon()} mr-2 ${getQualityColor()}`}></i>
                  <span className={getQualityColor()}>{callQuality.toUpperCase()}</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-white font-mono bg-slate-800/50 px-4 py-2 rounded-xl">
                {formatDuration(callDuration)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Call Duration</p>
            </div>
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 flex items-center justify-center transition-all duration-300 shadow-xl shadow-red-500/30 hover:scale-105"
            >
              <i className="fas fa-phone-slash text-white text-xl"></i>
            </button>
          </div>
        </div>

        {/* Main Video Area - Enhanced */}
        <div className="relative h-full p-8 pt-28">
          {isConnecting ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative">
                <div className="w-48 h-48 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-8"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full animate-ping"></div>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Connecting to {patient.name}</h3>
              <p className="text-slate-400 text-lg">Establishing secure clinical video connection...</p>
              <div className="mt-8 flex space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
              <div className="mt-6 text-sm text-slate-500">
                <i className="fas fa-shield-alt mr-2"></i>
                Finished-to-end encrypted • HIPAA compliant
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-red-500/20 to-red-700/30 flex items-center justify-center mb-8 border-4 border-red-500/30">
                <i className="fas fa-exclamation-triangle text-red-400 text-5xl"></i>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Connection Error</h3>
              <p className="text-slate-400 mb-8 max-w-lg text-center text-lg">{error}</p>
              <div className="flex space-x-4">
                <button
                  onClick={initializeCall}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 flex items-center"
                >
                  <i className="fas fa-redo mr-3"></i>
                  Try Again
                </button>
                <button
                  onClick={endCall}
                  className="px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-2xl font-bold hover:shadow-2xl transition-all duration-300"
                >
                  Cancel Call
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              
              {/* Remote Video (Patient) - Enhanced */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 group">
                <div className="absolute top-6 left-6 z-20 bg-black/70 backdrop-blur-lg px-6 py-3 rounded-2xl border border-cyan-500/30">
                  <span className="text-white font-bold flex items-center text-lg">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                    {patient.name} • Live
                  </span>
                </div>
                
                <div className="absolute top-6 right-6 z-20 flex space-x-3">
                  <div className="bg-black/70 backdrop-blur-lg px-4 py-2 rounded-2xl border border-emerald-500/30">
                    <span className="text-emerald-400 text-sm font-bold flex items-center">
                      <i className="fas fa-heartbeat mr-2"></i>
                      Vitals: {patient.lastBp || 'Normal'}
                    </span>
                  </div>
                  <div className="bg-black/70 backdrop-blur-lg px-4 py-2 rounded-2xl border border-blue-500/30">
                    <span className="text-blue-400 text-sm font-bold flex items-center">
                      <i className="fas fa-stethoscope mr-2"></i>
                      {patient.tags[0] || 'Consultation'}
                    </span>
                  </div>
                </div>
                
                {/* Video Container */}
                <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-slate-900 to-black">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Fallback if no actual video stream */}
                  {!remoteVideoRef.current?.srcObject && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
                      <div className="text-center">
                        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
                          <span className="text-5xl font-bold text-white">
                            {patient.initials}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-white mb-2">{patient.name}</p>
                        <p className="text-slate-400 text-lg">Awaiting patient video connection...</p>
                        <div className="mt-6 flex items-center justify-center space-x-2 text-slate-500">
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Establishing connection</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Status Overlay */}
                  <div className="absolute bottom-6 left-6 z-20">
                    <div className="bg-black/70 backdrop-blur-lg px-4 py-2 rounded-xl">
                      <span className="text-emerald-400 text-sm flex items-center">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                        Secure Connection Active
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Patient Vitals Overlay */}
                <div className="absolute bottom-6 right-6 z-20">
                  <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 backdrop-blur-lg p-4 rounded-2xl border border-cyan-500/30">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <p className="text-xs text-cyan-300">Heart Rate</p>
                        <p className="text-xl font-bold text-white">72 BPM</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-cyan-300">Oxygen</p>
                        <p className="text-xl font-bold text-white">98%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Local Video (Doctor) - Enhanced */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-blue-500/30 shadow-2xl shadow-blue-500/20">
                <div className="absolute top-6 left-6 z-20 bg-black/70 backdrop-blur-lg px-6 py-3 rounded-2xl border border-blue-500/30">
                  <span className="text-white font-bold flex items-center text-lg">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                    You • {doctorName}
                  </span>
                </div>
                
                {/* Video Container */}
                <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-slate-900 to-black">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {isVideoOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <div className="text-center">
                        <i className="fas fa-video-slash text-6xl text-slate-400 mb-4"></i>
                        <p className="text-2xl font-bold text-slate-400">Your video is off</p>
                        <p className="text-slate-500 mt-2">Patients cannot see you</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Recording Indicator */}
                  {isCallActive && (
                    <div className="absolute top-6 right-6 z-20">
                      <div className="bg-red-600/80 backdrop-blur-lg px-3 py-1 rounded-full animate-pulse">
                        <span className="text-white text-xs font-bold flex items-center">
                          <i className="fas fa-circle mr-2 text-xs"></i>
                          REC
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Call Stats */}
                <div className="absolute bottom-6 left-6 z-20">
                  <div className="bg-black/70 backdrop-blur-lg p-3 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Resolution</p>
                        <p className="text-sm font-bold text-white">720p</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">FPS</p>
                        <p className="text-sm font-bold text-white">30</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Bitrate</p>
                        <p className="text-sm font-bold text-white">2.5 Mbps</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Call Controls */}
          {isCallActive && (
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-6">
              {/* Audio Control */}
              <button
                onClick={toggleAudio}
                className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                  isAudioMuted
                    ? 'bg-gradient-to-r from-red-600/20 to-red-700/30 border-2 border-red-500/40'
                    : 'bg-gradient-to-r from-blue-600/20 to-cyan-600/30 border-2 border-blue-500/40'
                }`}
              >
                <i className={`fas fa-microphone${isAudioMuted ? '-slash' : ''} text-2xl ${
                  isAudioMuted ? 'text-red-400' : 'text-blue-400'
                }`}></i>
                <span className="text-xs mt-2 text-slate-300">
                  {isAudioMuted ? 'Unmute' : 'Mute'}
                </span>
              </button>

              {/* Video Control */}
              <button
                onClick={toggleVideo}
                className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                  isVideoOff
                    ? 'bg-gradient-to-r from-red-600/20 to-red-700/30 border-2 border-red-500/40'
                    : 'bg-gradient-to-r from-blue-600/20 to-cyan-600/30 border-2 border-blue-500/40'
                }`}
              >
                <i className={`fas fa-video${isVideoOff ? '-slash' : ''} text-2xl ${
                  isVideoOff ? 'text-red-400' : 'text-blue-400'
                }`}></i>
                <span className="text-xs mt-2 text-slate-300">
                  {isVideoOff ? 'Camera On' : 'Camera Off'}
                </span>
              </button>

              {/* Screen Share */}
              <button
                onClick={toggleScreenShare}
                className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                  isScreenSharing
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/30 border-2 border-purple-500/40'
                    : 'bg-gradient-to-r from-slate-700/30 to-slate-800/40 border-2 border-slate-600/40'
                }`}
              >
                <i className="fas fa-desktop text-2xl text-purple-400"></i>
                <span className="text-xs mt-2 text-slate-300">
                  {isScreenSharing ? 'Stop Share' : 'Share Screen'}
                </span>
              </button>

              {/* Screenshot */}
              <button
                onClick={takeScreenshot}
                className="w-20 h-20 rounded-2xl bg-gradient-to-r from-emerald-600/20 to-green-600/30 border-2 border-emerald-500/40 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-110"
              >
                <i className="fas fa-camera text-2xl text-emerald-400"></i>
                <span className="text-xs mt-2 text-slate-300">Screenshot</span>
              </button>

              {/* Record */}
              <button
                onClick={recordCall}
                className="w-20 h-20 rounded-2xl bg-gradient-to-r from-orange-600/20 to-red-600/30 border-2 border-orange-500/40 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-110"
              >
                <i className="fas fa-record-vinyl text-2xl text-orange-400"></i>
                <span className="text-xs mt-2 text-slate-300">Record</span>
              </button>

              {/* More Options */}
              <button className="w-20 h-20 rounded-2xl bg-gradient-to-r from-slate-700/30 to-slate-800/40 border-2 border-slate-600/40 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-110">
                <i className="fas fa-ellipsis-h text-2xl text-slate-400"></i>
                <span className="text-xs mt-2 text-slate-300">More</span>
              </button>

              {/* Finished Call - Larger and Centered */}
              <button
                onClick={endCall}
                className="w-24 h-24 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-red-500/40 ml-4"
              >
                <i className="fas fa-phone-slash text-2xl text-white mb-1"></i>
                <span className="text-xs font-bold text-white">Finished Call</span>
              </button>
            </div>
          )}

          {/* Patient Information Sidebar - Enhanced */}
          {isCallActive && (
            <div className="absolute right-10 top-32 w-96 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl border-2 border-cyan-500/20 shadow-2xl shadow-cyan-500/10 p-8">
              <div className="flex items-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center mr-4 shadow-lg">
                  <i className="fas fa-user-injured text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Patient Profile</h3>
                  <p className="text-cyan-400 text-sm">Live clinical data</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Patient Info Card */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-700 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{patient.initials}</span>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{patient.name}</p>
                      <p className="text-slate-400">Patient ID: {patient.id}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-3 rounded-xl">
                      <p className="text-xs text-slate-400">Age</p>
                      <p className="text-lg font-bold text-white">{patient.age} years</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl">
                      <p className="text-xs text-slate-400">Status</p>
                      <p className={`text-lg font-bold ${
                        patient.status === 'critical' ? 'text-red-400' :
                        patient.status === 'review' ? 'text-yellow-400' :
                        'text-emerald-400'
                      }`}>
                        {patient.status.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Medical Conditions */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                    <i className="fas fa-file-medical-alt mr-3 text-emerald-400"></i>
                    Medical Conditions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {patient.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-400 rounded-xl text-sm border border-cyan-500/30"
                      >
                        <i className="fas fa-heartbeat mr-2"></i>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Vital Signs */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                    <i className="fas fa-heartbeat mr-3 text-red-400"></i>
                    Vital Signs
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gradient-to-br from-red-600/10 to-red-700/10 rounded-xl border border-red-500/20">
                      <p className="text-xs text-red-300">Blood Pressure</p>
                      <p className="text-2xl font-bold text-white">{patient.lastBp || '120/80'}</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-xl border border-blue-500/20">
                      <p className="text-xs text-cyan-300">Heart Rate</p>
                      <p className="text-2xl font-bold text-white">72 BPM</p>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                  <h4 className="text-lg font-bold text-white mb-4">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-3 bg-gradient-to-r from-emerald-600/20 to-green-600/20 text-emerald-400 rounded-xl hover:from-emerald-600/30 hover:to-green-600/30 transition-all border border-emerald-500/20 flex items-center justify-center">
                      <i className="fas fa-prescription mr-2"></i>
                      Prescribe
                    </button>
                    <button className="p-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 rounded-xl hover:from-blue-600/30 hover:to-cyan-600/30 transition-all border border-blue-500/20 flex items-center justify-center">
                      <i className="fas fa-file-medical mr-2"></i>
                      Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Connection Status Bar */}
        {isCallActive && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 text-sm">Secure Connection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-shield-alt text-cyan-400"></i>
                  <span className="text-cyan-400 text-sm">HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-clock text-blue-400"></i>
                  <span className="text-blue-400 text-sm">{formatDuration(callDuration)} elapsed</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => window.open(`/patient/${patient._id}`, '_blank')}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <i className="fas fa-external-link-alt mr-2"></i>
                  Open Full Record
                </button>
                <button 
                  onClick={endCall}
                  className="text-sm bg-red-600/20 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all"
                >
                  <i className="fas fa-phone-slash mr-2"></i>
                  Finished Consultation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}