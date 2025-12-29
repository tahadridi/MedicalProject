// components/NotesVisualizer.jsx
'use client';
import { useEffect, useState } from 'react';
import { apiService } from '../../../lib/api';

export function NotesVisualizer({ isOpen, onClose, patientId = null }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    if (isOpen) {
      loadNotes();
    }
  }, [isOpen, patientId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getDoctorNotes();
      
      // Filter by patient if patientId is provided
      let filteredNotes = data;
      if (patientId) {
        filteredNotes = data.filter(note => 
          note.patient_id && (note.patient_id._id === patientId || note.patient_id === patientId)
        );
      }
      
      // Apply additional filters
      if (filterType !== 'all') {
        filteredNotes = filteredNotes.filter(note => note.type === filterType);
      }
      
      // Apply sorting
      filteredNotes.sort((a, b) => {
        switch(sortBy) {
          case 'date_desc':
            return new Date(b.created_at) - new Date(a.created_at);
          case 'date_asc':
            return new Date(a.created_at) - new Date(b.created_at);
          case 'priority':
            const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          default:
            return 0;
        }
      });
      
      setNotes(filteredNotes);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Failed to load notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const priorityColors = {
    'urgent': 'bg-red-500/20 text-red-400',
    'high': 'bg-orange-500/20 text-orange-400',
    'medium': 'bg-yellow-500/20 text-yellow-400',
    'low': 'bg-blue-500/20 text-blue-400'
  };

  const typeColors = {
    'clinical': 'bg-purple-500/20 text-purple-400',
    'progress': 'bg-cyan-500/20 text-cyan-400',
    'treatment': 'bg-emerald-500/20 text-emerald-400',
    'assessment': 'bg-pink-500/20 text-pink-400',
    'general': 'bg-slate-500/20 text-slate-400'
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-clinical-midnight rounded-2xl border border-white/10 shadow-2xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <i className="fas fa-sticky-note text-white"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Doctor Notes</h2>
              <p className="text-slate-400">
                {patientId 
                  ? `Notes for selected patient` 
                  : `All clinical notes (${notes.length} total)`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Filters */}
            <div className="flex space-x-2">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="premium-card px-3 py-2 text-sm text-slate-300 rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="clinical">Clinical</option>
                <option value="progress">Progress</option>
                <option value="treatment">Treatment</option>
                <option value="assessment">Assessment</option>
                <option value="general">General</option>
              </select>
              
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="premium-card px-3 py-2 text-sm text-slate-300 rounded-lg"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="priority">By Priority</option>
              </select>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading notes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <i className="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
              <p className="text-slate-400">{error}</p>
              <button 
                onClick={loadNotes}
                className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-sticky-note text-6xl text-slate-600 mb-4"></i>
              <p className="text-slate-400 text-lg">No notes found</p>
              <p className="text-slate-500 text-sm mt-2">
                {patientId ? 'No notes for this patient yet' : 'Create your first note to get started'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {notes.map((note) => (
                <div 
                  key={note._id} 
                  className="premium-card p-6 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-white/10"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-white">{note.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityColors[note.priority]}`}>
                          {note.priority.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeColors[note.type]}`}>
                          {note.type.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-400 mb-4">
                        <span className="flex items-center">
                          <i className="fas fa-user-md mr-2"></i>
                          Dr. {note.doctor_id || 'Unknown'}
                        </span>
                        <span className="flex items-center">
                          <i className="fas fa-user-injured mr-2"></i>
                          {note.patient_id?.name || 'Patient'}
                        </span>
                        <span className="flex items-center">
                          <i className="far fa-clock mr-2"></i>
                          {formatDate(note.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => console.log('Edit note:', note._id)}
                      className="ml-4 px-3 py-1 text-xs text-cyan-400 bg-cyan-500/10 rounded-lg hover:bg-cyan-500/20 transition-colors"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Edit
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-slate-300 whitespace-pre-wrap">{note.content}</p>
                  </div>
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-between items-center">
          <div className="text-sm text-slate-400">
            Showing {notes.length} notes • Last updated just now
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadNotes}
              className="px-4 py-2 text-slate-300 bg-white/5 rounded-lg hover:bg-white/10 transition-colors flex items-center"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </button>
            <button
              onClick={() => {
                onClose();
                // You can trigger a modal to create a new note here
                console.log('Create new note');
              }}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center"
            >
              <i className="fas fa-plus mr-2"></i>
              New Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}