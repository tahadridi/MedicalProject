  // components/ProfilePage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '../../../lib/auth';
interface DoctorData {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialite: string;
  cin: string;
  num_licence: string;
  hopital: string;
  departement: string;
  bio: string;
  adresse: {
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
  };
  annees_experience: number;
  created_at: string;
}

export default function ProfilePage({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialite: '',
    cin: '',
    num_licence: '',
    hopital: '',
    departement: '',
    bio: '',
    adresse: {
      rue: '',
      ville: '',
      code_postal: '',
      pays: ''
    },
    annees_experience: 0
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch doctor data on component mount
  useEffect(() => {
    fetchDoctorData();
  }, []);

  // In ProfilePage.tsx - update fetchDoctorData function
const fetchDoctorData = async () => {
  try {
    setLoading(true);
    
    // FIRST: Check if we have doctor data in localStorage from login
    const storedDoctorData = localStorage.getItem('doctorData');
    const storedToken = localStorage.getItem('token');
    
    if (storedDoctorData && storedToken) {
      // Use stored data
      const doctorData = JSON.parse(storedDoctorData);
      setDoctorData(doctorData);
      setFormData({
        nom: doctorData.nom || '',
        prenom: doctorData.prenom || '',
        email: doctorData.email || '',
        telephone: doctorData.telephone || '',
        specialite: doctorData.specialite || '',
        cin: doctorData.cin || '',
        num_licence: doctorData.num_licence || '',
        hopital: doctorData.hopital || '',
        departement: doctorData.departement || '',
        bio: doctorData.bio || '',
        adresse: doctorData.adresse || {
          rue: '',
          ville: '',
          code_postal: '',
          pays: ''
        },
        annees_experience: doctorData.annees_experience || 0
      });
      setLoading(false);
      return;
    }
    
    // SECOND: If no localStorage data, fetch from API
    if (!storedToken) {
      router.push('/login');
      return;
    }

    try {
      // Try the new profile endpoint first
      const response = await fetch('/api/doctors/profile', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.doctor) {
          setDoctorData(data.doctor);
          setFormData({
            nom: data.doctor.nom || '',
            prenom: data.doctor.prenom || '',
            email: data.doctor.email || '',
            telephone: data.doctor.telephone || '',
            specialite: data.doctor.specialite || '',
            cin: data.doctor.cin || '',
            num_licence: data.doctor.num_licence || '',
            hopital: data.doctor.hopital || '',
            departement: data.doctor.departement || '',
            bio: data.doctor.bio || '',
            adresse: data.doctor.adresse || {
              rue: '',
              ville: '',
              code_postal: '',
              pays: ''
            },
            annees_experience: data.doctor.annees_experience || 0
          });
          
          // Store in localStorage for future use
          localStorage.setItem('doctorData', JSON.stringify(data.doctor));
        }
      } else {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error fetching doctor data:', error);
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
      adresse: {
        ...prev.adresse,
        [name]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/doctors/${doctorData?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setDoctorData(updatedData.doctor);
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

 // In ProfilePage.tsx - update the handleLogout function
const handleLogout = () => {

  // Clear ALL localStorage data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('doctorData');
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
    { key: 'security' as const, label: 'Security', icon: 'fa-shield-alt' },
    { key: 'preferences' as const, label: 'Preferences', icon: 'fa-cog' }
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

  if (error || !doctorData) {
    return (
      <div className="min-h-screen bg-clinical-midnight flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
          <p className="text-slate-400">{error || 'Failed to load profile'}</p>
          <button 
            onClick={fetchDoctorData}
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
              Account Profile
            </h1>
            <p className="text-slate-400 mt-2">Manage your personal and professional information</p>
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
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 via-clinical-teal to-cyan-400 flex items-center justify-center shadow-2xl shadow-purple-500/20 mx-auto">
                    <span className="font-bold text-white text-2xl">
                      {doctorData.prenom?.charAt(0) || 'D'}{doctorData.nom?.charAt(0) || 'R'}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full border-4 border-clinical-midnight shadow-lg"></div>
                </div>
                <h3 className="font-bold text-white text-lg">Dr. {doctorData.prenom} {doctorData.nom}</h3>
                <p className="text-cyan-300 text-sm">{doctorData.specialite} Specialist</p>
                <p className="text-slate-400 text-xs mt-1">{doctorData.hopital}</p>
                {doctorData.annees_experience > 0 && (
                  <p className="text-slate-400 text-xs mt-1">{doctorData.annees_experience}+ years of experience</p>
                )}
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
                    <span className="text-slate-400 text-sm">License Number</span>
                    <span className="text-white text-sm font-medium">{doctorData.num_licence}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">CIN</span>
                    <span className="text-white text-sm font-medium">{doctorData.cin}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Member since</span>
                    <span className="text-white text-sm font-medium">
                      {new Date(doctorData.created_at).getFullYear()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Last login</span>
                    <span className="text-white text-sm font-medium">Today</span>
                  </div>
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
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleInputChange}
                        className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                      />
                    ) : (
                      <p className="text-white text-lg">{doctorData.prenom}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                      />
                    ) : (
                      <p className="text-white text-lg">{doctorData.nom}</p>
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
                      <p className="text-white text-lg">{doctorData.email}</p>
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
                      <p className="text-white text-lg">{doctorData.telephone || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <h3 className="text-xl font-bold text-white mb-6 flex items-center mt-8">
                  <i className="fas fa-briefcase-medical mr-3 text-cyan-400"></i>
                  Professional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                      Specialty
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="specialite"
                        value={formData.specialite}
                        onChange={handleInputChange}
                        className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                      />
                    ) : (
                      <p className="text-white text-lg">{doctorData.specialite}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                      License Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="num_licence"
                        value={formData.num_licence}
                        onChange={handleInputChange}
                        className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                      />
                    ) : (
                      <p className="text-white text-lg">{doctorData.num_licence}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                      Hospital/Clinic
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="hopital"
                        value={formData.hopital}
                        onChange={handleInputChange}
                        className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                      />
                    ) : (
                      <p className="text-white text-lg">{doctorData.hopital || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                      Department
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="departement"
                        value={formData.departement}
                        onChange={handleInputChange}
                        className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                      />
                    ) : (
                      <p className="text-white text-lg">{doctorData.departement || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                      Years of Experience
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="annees_experience"
                        value={formData.annees_experience}
                        onChange={handleInputChange}
                        className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                      />
                    ) : (
                      <p className="text-white text-lg">{doctorData.annees_experience || 0} years</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                      CIN (National ID)
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="cin"
                        value={formData.cin}
                        onChange={handleInputChange}
                        className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                      />
                    ) : (
                      <p className="text-white text-lg">{doctorData.cin}</p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-8">
                  <label className="block text-slate-400 text-sm font-medium mb-2">
                    Professional Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl resize-none"
                    />
                  ) : (
                    <p className="text-white text-lg leading-relaxed">
                      {doctorData.bio || 'No bio provided'}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <i className="fas fa-map-marker-alt mr-3 text-cyan-400"></i>
                    Office Address
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-400 text-sm font-medium mb-2">Street Address</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="rue"
                          value={formData.adresse.rue}
                          onChange={handleAddressChange}
                          className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                        />
                      ) : (
                        <p className="text-white text-lg">{doctorData.adresse?.rue || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-400 text-sm font-medium mb-2">City</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="ville"
                          value={formData.adresse.ville}
                          onChange={handleAddressChange}
                          className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                        />
                      ) : (
                        <p className="text-white text-lg">{doctorData.adresse?.ville || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-400 text-sm font-medium mb-2">Postal Code</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="code_postal"
                          value={formData.adresse.code_postal}
                          onChange={handleAddressChange}
                          className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                        />
                      ) : (
                        <p className="text-white text-lg">{doctorData.adresse?.code_postal || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-400 text-sm font-medium mb-2">Country</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="pays"
                          value={formData.adresse.pays}
                          onChange={handleAddressChange}
                          className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                        />
                      ) : (
                        <p className="text-white text-lg">{doctorData.adresse?.pays || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

              {activeTab === 'security' && (
                <div className="premium-card p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <i className="fas fa-shield-alt mr-3 text-cyan-400"></i>
                    Security Settings
                  </h2>

                  <div className="space-y-6">
                    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-3">Change Password</h3>
                      <div className="space-y-4">
                        <input
                          type="password"
                          placeholder="Current Password"
                          className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                        />
                        <input
                          type="password"
                          placeholder="New Password"
                          className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl"
                        />
                        <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-3">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Enhanced security for your account</p>
                          <p className="text-slate-400 text-sm mt-1">Protect your account with an additional layer of security</p>
                        </div>
                        <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg font-semibold hover:bg-emerald-500/30 transition-colors">
                          Enable 2FA
                        </button>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-3">Login Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-white">Current Session</p>
                            <p className="text-slate-400 text-sm">San Francisco, CA • Today at 09:24 AM</p>
                          </div>
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">Active</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-white">Previous Session</p>
                            <p className="text-slate-400 text-sm">San Francisco, CA • Yesterday at 17:45 PM</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="premium-card p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <i className="fas fa-cog mr-3 text-cyan-400"></i>
                    Preferences
                  </h2>

                  <div className="space-y-6">
                    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Email Notifications', description: 'Receive updates via email', default: true },
                          { label: 'Push Notifications', description: 'Receive real-time alerts', default: true },
                          { label: 'SMS Alerts', description: 'Critical alerts via SMS', default: false },
                          { label: 'Appointment Reminders', description: 'Upcoming appointment notifications', default: true },
                        ].map((pref, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{pref.label}</p>
                              <p className="text-slate-400 text-sm">{pref.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked={pref.default} />
                              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
                      <div className="flex space-x-4">
                        <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg font-semibold border border-cyan-500/30">
                          Light Mode
                        </button>
                        <button className="px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold border border-slate-600">
                          Dark Mode
                        </button>
                        <button className="px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold border border-slate-600">
                          Auto
                        </button>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Language & Region</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 text-sm font-medium mb-2">Language</label>
                          <select className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl">
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-400 text-sm font-medium mb-2">Time Zone</label>
                          <select className="w-full premium-card px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-xl">
                            <option>Pacific Time (PT)</option>
                            <option>Eastern Time (ET)</option>
                            <option>Central Time (CT)</option>
                            <option>Mountain Time (MT)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }