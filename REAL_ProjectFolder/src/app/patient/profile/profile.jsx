
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PatientData {
  _id: string;
  username: string;
  email: string;
  cin: string;
  fullName: string;
  avatar: string;
  telephone?: string;
  address?: {
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
  };
  date_of_birth?: string;
  gender?: string;
  blood_type?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  created_at: string;
}

export default function PatientProfilePage({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'health' | 'documents'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    telephone: '',
    address: {
      rue: '',
      ville: '',
      code_postal: '',
      pays: ''
    },
    emergency_contact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch patient data on component mount
  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      // Check localStorage for patient data from login
      const storedPatientData = localStorage.getItem('patientData');
      const storedToken = localStorage.getItem('token');
      
      if (storedPatientData && storedToken) {
        // Use stored data
        const patientData = JSON.parse(storedPatientData);
        setPatientData(patientData);
        setFormData({
          username: patientData.username || '',
          email: patientData.email || '',
          telephone: patientData.telephone || '',
          address: patientData.address || {
            rue: '',
            ville: '',
            code_postal: '',
            pays: ''
          },
          emergency_contact: patientData.emergency_contact || {
            name: '',
            relationship: '',
            phone: ''
          }
        });
        setLoading(false);
        return;
      }
      
      // If no localStorage data, fetch from API
      if (!storedToken) {
        router.push('/login');
        return;
      }

      try {
        // Fetch patient profile from API
        const response = await fetch('/api/patients/profile', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.patient) {
            setPatientData(data.patient);
            setFormData({
              username: data.patient.username || '',
              email: data.patient.email || '',
              telephone: data.patient.telephone || '',
              address: data.patient.address || {
                rue: '',
                ville: '',
                code_postal: '',
                pays: ''
              },
              emergency_contact: data.patient.emergency_contact || {
                name: '',
                relationship: '',
                phone: ''
              }
            });
            
            // Store in localStorage for future use
            localStorage.setItem('patientData', JSON.stringify(data.patient));
          }
        } else {
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }
      } catch (error: any) {
        console.error('Error fetching patient data:', error);
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      emergency_contact: {
        ...prev.emergency_contact,
        [name]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !patientData) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/patients/${patientData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setPatientData(updatedData.patient);
        localStorage.setItem('patientData', JSON.stringify(updatedData.patient));
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleLogout = () => {
    // Clear ALL localStorage data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('patientData');
    localStorage.removeItem('cin');
    
    // Clear any other app-specific storage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes('nexus') || key?.includes('clinical') || key?.includes('auth')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Redirect to login
    router.push('/login');
  };

  const tabs = [
    { key: 'profile' as const, label: 'Profile', icon: 'fa-user' },
    { key: 'health' as const, label: 'Health Info', icon: 'fa-heartbeat' },
    { key: 'documents' as const, label: 'Documents', icon: 'fa-file-medical' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-clinical-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !patientData) {
    return (
      <div className="min-h-screen bg-clinical-midnight flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
          <p className="text-slate-400">{error || 'Failed to load profile'}</p>
          <button 
            onClick={fetchPatientData}
            className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clinical-midnight p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button 
              onClick={onClose}
              className="mb-4 px-4 py-2 bg-white/5 text-slate-400 hover:text-white rounded-lg flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-slate-400 mt-2">Manage your personal and health information</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center"
            >
              <i className={`fas ${isEditing ? 'fa-save' : 'fa-edit'} mr-2`}></i>
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl font-semibold hover:bg-red-500/30 transition-all flex items-center"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="premium-card p-6 sticky top-8">
              {/* Profile Summary */}
              <div className="text-center mb-8">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 via-clinical-teal to-cyan-400 flex items-center justify-center shadow-2xl shadow-blue-500/20 mx-auto">
                    <span className="font-bold text-white text-2xl">
                      {patientData.avatar || patientData.username?.charAt(0) || 'P'}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full border-4 border-clinical-midnight shadow-lg"></div>
                </div>
                <h3 className="font-bold text-white text-lg">{patientData.fullName || patientData.username}</h3>
                <p className="text-cyan-300 text-sm">Patient</p>
                <p className="text-slate-400 text-xs mt-1">CIN: {patientData.cin}</p>
                <p className="text-slate-400 text-xs mt-1">
                  Member since {new Date(patientData.created_at).getFullYear()}
                </p>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center ${
                      activeTab === tab.key
                        ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <i className={`fas ${tab.icon} mr-3`}></i>
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Stats */}
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Email</span>
                    <span className="text-white text-sm font-medium truncate ml-2">
                      {patientData.email}
                    </span>
                  </div>
                  {patientData.telephone && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Phone</span>
                      <span className="text-white text-sm font-medium">{patientData.telephone}</span>
                    </div>
                  )}
                  {patientData.date_of_birth && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Date of Birth</span>
                      <span className="text-white text-sm font-medium">
                        {new Date(patientData.date_of_birth).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {patientData.blood_type && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Blood Type</span>
                      <span className="text-white text-sm font-medium">{patientData.blood_type}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="premium-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <i className="fas fa-user-circle mr-3 text-cyan-400"></i>
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                      Username
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                      />
                    ) : (
                      <p className="text-white text-lg">{patientData.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                      />
                    ) : (
                      <p className="text-white text-lg">{patientData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleInputChange}
                        className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                      />
                    ) : (
                      <p className="text-white text-lg">{patientData.telephone || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                      CIN (National ID)
                    </label>
                    <p className="text-white text-lg">{patientData.cin}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-6 mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <i className="fas fa-map-marker-alt mr-3 text-cyan-400"></i>
                    Address
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-400 text-sm font-medium mb-2">Street Address</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="rue"
                          value={formData.address.rue}
                          onChange={handleAddressChange}
                          className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                        />
                      ) : (
                        <p className="text-white text-lg">{patientData.address?.rue || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-400 text-sm font-medium mb-2">City</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="ville"
                          value={formData.address.ville}
                          onChange={handleAddressChange}
                          className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                        />
                      ) : (
                        <p className="text-white text-lg">{patientData.address?.ville || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-400 text-sm font-medium mb-2">Postal Code</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="code_postal"
                          value={formData.address.code_postal}
                          onChange={handleAddressChange}
                          className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                        />
                      ) : (
                        <p className="text-white text-lg">{patientData.address?.code_postal || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-400 text-sm font-medium mb-2">Country</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="pays"
                          value={formData.address.pays}
                          onChange={handleAddressChange}
                          className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                        />
                      ) : (
                        <p className="text-white text-lg">{patientData.address?.pays || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <i className="fas fa-phone-emergency mr-3 text-red-400"></i>
                    Emergency Contact
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-400 text-sm font-medium mb-2">Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.emergency_contact.name}
                          onChange={handleEmergencyContactChange}
                          className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                        />
                      ) : (
                        <p className="text-white text-lg">{patientData.emergency_contact?.name || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-400 text-sm font-medium mb-2">Relationship</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="relationship"
                          value={formData.emergency_contact.relationship}
                          onChange={handleEmergencyContactChange}
                          className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                        />
                      ) : (
                        <p className="text-white text-lg">{patientData.emergency_contact?.relationship || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-400 text-sm font-medium mb-2">Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.emergency_contact.phone}
                          onChange={handleEmergencyContactChange}
                          className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                        />
                      ) : (
                        <p className="text-white text-lg">{patientData.emergency_contact?.phone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'health' && (
              <div className="premium-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <i className="fas fa-heartbeat mr-3 text-red-400"></i>
                  Health Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                      Date of Birth
                    </label>
                    <p className="text-white text-lg">
                      {patientData.date_of_birth 
                        ? new Date(patientData.date_of_birth).toLocaleDateString()
                        : 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                      Gender
                    </label>
                    <p className="text-white text-lg">{patientData.gender || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                      Blood Type
                    </label>
                    <p className="text-white text-lg">{patientData.blood_type || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                      Age
                    </label>
                    <p className="text-white text-lg">
                      {patientData.date_of_birth 
                        ? `${new Date().getFullYear() - new Date(patientData.date_of_birth).getFullYear()} years`
                        : 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Allergies */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <i className="fas fa-allergies mr-3 text-yellow-400"></i>
                    Allergies
                  </h3>
                  {patientData.allergies && patientData.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patientData.allergies.map((allergy, index) => (
                        <span key={index} className="px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">No allergies recorded</p>
                  )}
                </div>

                {/* Chronic Conditions */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <i className="fas fa-file-medical-alt mr-3 text-orange-400"></i>
                    Chronic Conditions
                  </h3>
                  {patientData.chronic_conditions && patientData.chronic_conditions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patientData.chronic_conditions.map((condition, index) => (
                        <span key={index} className="px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg">
                          {condition}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">No chronic conditions recorded</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="premium-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <i className="fas fa-file-medical mr-3 text-emerald-400"></i>
                  Medical Documents
                </h2>
                <p className="text-slate-400 mb-6">Your medical reports and documents will appear here.</p>
                
                {/* Placeholder for documents */}
                <div className="text-center py-12">
                  <i className="fas fa-file-medical text-6xl text-slate-600 mb-6"></i>
                  <p className="text-slate-400 text-lg">No documents uploaded yet</p>
                  <p className="text-slate-500 text-sm mt-2">Your medical reports will appear here once available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}