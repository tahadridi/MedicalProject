// NewPatientModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiService } from '../../../lib/api';

interface User {
  _id: string;
  cin: string;
  email: string;
  username: string;
  role: string;
}

interface NewPatientModalProps {
  onClose: () => void;
  onPatientCreated: (patient: any) => void;
}

export default function NewPatientModal({ onClose, onPatientCreated }: NewPatientModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [step, setStep] = useState(1); // 1: Select user, 2: Add medical info
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    condition: '',
    phone: '',
    email: '',
    emergencyContact: '',
    status: 'stable',
    risk: 'low',
    lastBp: '120/80',
    address: '',
    cin: '',
    userId: '',
  });

  const [loading, setLoading] = useState(false);

  // Fetch users when modal opens
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      // Fetch all users from /api/users
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      
      // Filter to only show client users (not medecin)
      const clientUsers = Array.isArray(data) 
        ? data.filter(user => user.role === 'client')
        : [];
      
      setUsers(clientUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // When user is selected, populate form with their data
  useEffect(() => {
    if (selectedUserId) {
      const selectedUser = users.find(user => user._id === selectedUserId);
      if (selectedUser) {
        // Extract first name from username (assuming format is "FirstName LastName")
        const nameParts = selectedUser.username.split(' ');
        const firstName = nameParts[0] || '';
        
        setFormData(prev => ({
          ...prev,
          name: selectedUser.username,
          email: selectedUser.email || '',
          cin: selectedUser.cin || '',
          userId: selectedUser._id,
          age: prev.age || '30', // Default age
          phone: prev.phone || '', // You might want to add phone to User model
          address: prev.address || ''
        }));
      }
    }
  }, [selectedUserId, users]);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.cin.includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setStep(2); // Move to medical info step
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedUser = users.find(user => user._id === selectedUserId);
      if (!selectedUser) {
        alert('Please select a user first');
        setLoading(false);
        return;
      }

      // Generate initials from name
      const initials = formData.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

      const patientData = {
        userId: selectedUser._id, // Reference to user
        cin: selectedUser.cin, // CIN from user
        name: formData.name,
        initials,
        age: parseInt(formData.age) || 0,
        status: formData.status,
        lastSeen: 'Just now',
        tags: formData.condition ? [formData.condition] : ['General Checkup'],
        avatar: '👤',
        risk: formData.risk,
        lastBp: formData.lastBp,
        nextAppointment: 'Not scheduled',
        email: formData.email || selectedUser.email,
        phone: formData.phone || '',
        emergencyContact: formData.emergencyContact || '',
        address: formData.address || '',
        medications: [],
        labResults: [],
        labOrder: [],
        vitalSigns: [],
        medicalHistory: []
      };

      // Create patient using your existing API
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create patient');
      }

      if (onPatientCreated) {
        onPatientCreated(result);
      }

      alert('Patient created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating patient:', error);
      alert(`Error creating patient: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'review': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'stable': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'low': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="premium-card p-8 w-full max-w-2xl max-h-[95vh] overflow-y-auto scrollbar-thin bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 shadow-2xl shadow-purple-500/10 rounded-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <i className="fas fa-user-plus text-white text-lg"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {step === 1 ? 'Select User' : 'Add Medical Information'}
              </h3>
              <p className="text-slate-400 text-sm">
                {step === 1 
                  ? 'Choose an existing user to add as patient' 
                  : 'Complete medical information for the selected user'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-cyan-400' : 'text-slate-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-cyan-500/20 border border-cyan-500' : 'bg-slate-700/50 border border-slate-600'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Select User</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-600"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-cyan-400' : 'text-slate-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-cyan-500/20 border border-cyan-500' : 'bg-slate-700/50 border border-slate-600'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Medical Info</span>
            </div>
          </div>
        </div>

        {step === 1 ? (
          // Step 1: Select User
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, CIN, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-300">
                  <i className="fas fa-users mr-2 text-blue-400"></i>
                  Select User
                </label>
                <span className="text-xs text-slate-400">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                </span>
              </div>
              
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 bg-slate-800/30 rounded-xl">
                  <i className="fas fa-users text-4xl text-slate-600 mb-4"></i>
                  <p className="text-slate-400">
                    {searchTerm ? 'No users match your search' : 'No users found'}
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    {searchTerm ? 'Try a different search term' : 'All users might already be patients'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin p-2">
                  {filteredUsers.map(user => (
                    <div
                      key={user._id}
                      onClick={() => handleUserSelect(user._id)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                        selectedUserId === user._id
                          ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/50'
                          : 'bg-slate-800/30 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="font-bold text-white text-sm">
                              {user.username.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {user.username}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 mt-1">
                              <span className="text-xs text-slate-400">
                                <i className="fas fa-envelope mr-1"></i>
                                {user.email}
                              </span>
                              {user.cin && (
                                <span className="text-xs text-slate-400">
                                  <i className="fas fa-id-card mr-1"></i>
                                  {user.cin}
                                </span>
                              )}
                              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                                {user.role}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <i className="fas fa-arrow-right text-cyan-400"></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors border border-slate-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => selectedUserId && setStep(2)}
                disabled={!selectedUserId}
                className="px-5 py-2.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-cyan-500/30 hover:border-cyan-500/50"
              >
                Continue <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        ) : (
          // Step 2: Medical Information Form
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected User Info */}
            <div className="premium-card p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="font-bold text-white text-sm">
                      {formData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{formData.name}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      {formData.email && (
                        <span className="text-xs text-slate-400">
                          <i className="fas fa-envelope mr-1"></i>
                          {formData.email}
                        </span>
                      )}
                      {formData.cin && (
                        <span className="text-xs text-slate-400">
                          <i className="fas fa-id-card mr-1"></i>
                          {formData.cin}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  <i className="fas fa-edit mr-1"></i> Change User
                </button>
              </div>
            </div>

            {/* Medical Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <i className="fas fa-birthday-cake mr-2 text-blue-400"></i>
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleChange}
                  min="0"
                  max="120"
                  required
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Enter age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <i className="fas fa-stethoscope mr-2 text-orange-400"></i>
                  Primary Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                >
                  <option value="">Select primary condition</option>
                  <option value="Hypertension">Hypertension</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="COPD">COPD</option>
                  <option value="Arthritis">Arthritis</option>
                  <option value="Asthma">Asthma</option>
                  <option value="High Cholesterol">High Cholesterol</option>
                  <option value="Heart Disease">Heart Disease</option>
                  <option value="General Checkup">General Checkup</option>
                </select>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <i className="fas fa-heartbeat mr-2 text-red-400"></i>
                  Last Blood Pressure
                </label>
                <input
                  type="text"
                  name="lastBp"
                  value={formData.lastBp}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  placeholder="e.g., 120/80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <i className="fas fa-ambulance mr-2 text-red-400"></i>
                  Emergency Contact
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  placeholder="Name and phone number"
                />
              </div>
            </div>

            {/* Status & Risk */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <i className="fas fa-thermometer-half mr-2 text-yellow-400"></i>
                  Patient Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full bg-slate-800/50 border rounded-lg px-4 py-3 text-white focus:ring-1 transition-colors ${getStatusColor(formData.status)}`}
                >
                  <option value="stable">Stable</option>
                  <option value="review">Needs Review</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <i className="fas fa-exclamation-triangle mr-2 text-orange-400"></i>
                  Risk Level
                </label>
                <select
                  name="risk"
                  value={formData.risk}
                  onChange={handleChange}
                  className={`w-full bg-slate-800/50 border rounded-lg px-4 py-3 text-white focus:ring-1 transition-colors ${getRiskColor(formData.risk)}`}
                >
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>
            </div>

            {/* Contact Information (optional) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <i className="fas fa-phone mr-2 text-green-400"></i>
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <i className="fas fa-home mr-2 text-amber-400"></i>
                  Address (optional)
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="Enter address"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between space-x-3 pt-6 border-t border-slate-600">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors border border-slate-600"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors border border-slate-600 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-purple-500/30 hover:border-purple-500/50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Patient...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus"></i>
                      <span>Create Patient</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}