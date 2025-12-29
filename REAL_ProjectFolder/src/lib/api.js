// lib/api.js - COMPLETE UPDATED VERSION

const API_BASE = '/api';

export const apiService = {
  // ============================================
  // PATIENTS API
  // ============================================
  async getPatients() {
    try {
      console.log('🔄 API: Fetching from:', `${API_BASE}/patients`);
      const response = await fetch(`${API_BASE}/patients`);
      
      console.log('📡 API: Response status:', response.status);
      console.log('📡 API: Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API: Data received:', data);
      console.log('✅ API: Number of patients:', data.length);
      
      return data;
    } catch (error) {
      console.error('❌ API Error in getPatients:', error);
      throw error;
    }
  },

  async createPatient(patientData) {
    const response = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });
    return await response.json();
  },

  async updatePatient(id, patientData) {
    const response = await fetch(`${API_BASE}/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });
    return await response.json();
  },

  async deletePatient(id) {
    const response = await fetch(`${API_BASE}/patients/${id}`, {
      method: 'DELETE'
    });
    return await response.json();
  },

  // ============================================
  // APPOINTMENTS API
  // ============================================
  async getAppointments() {
    const response = await fetch(`${API_BASE}/DoctorSchedule`);
    return await response.json();
  },

  async createAppointment(appointmentData) {
    if (!appointmentData.patient_id) {
      throw new Error("Missing patient_id");
    }

    const transformedData = {
      doctor_id: appointmentData.doctor_id || 'dr_anderson',
    doctor_name: appointmentData.doctor_name,
    doctor_email: appointmentData.doctor_email,
    doctor_speciality: appointmentData.doctor_speciality || 'General Practitioner',
      patient_id: appointmentData.patient_id,
      scheduled_date: new Date(appointmentData.scheduled_date).toISOString(),
      start_time: appointmentData.start_time,
      end_time: appointmentData.end_time,
      duration_minutes: appointmentData.duration_minutes,
      appointment_type: this.mapAppointmentType(appointmentData.appointment_type),
      status: 'scheduled',
      priority: appointmentData.priority || 'medium',
      title: appointmentData.title,
      description: appointmentData.description || `Appointment with patient`,
      notes: appointmentData.notes || '',
      recurring_pattern: 'none',
      created_by: appointmentData.created_by || 'dr_anderson'
    };

    console.log('📅 Creating appointment with data:', transformedData);

    const response = await fetch(`${API_BASE}/DoctorSchedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transformedData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ SERVER RAW ERROR:", errorText);
      throw new Error('Failed to create schedule - see console for server error');
    }

    return await response.json();
  },

  async updateAppointment(id, appointmentData) {
    const response = await fetch(`${API_BASE}/DoctorSchedule/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });
    return await response.json();
  },

  async deleteAppointment(id) {
    const response = await fetch(`${API_BASE}/DoctorSchedule/${id}`, {
      method: 'DELETE'
    });
    return await response.json();
  },
// Add to api.js
async getPatientById(patientId) {
  try {
    console.log('🔄 API: Fetching patient by ID:', patientId);
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE}/patients/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ API: Patient data received:', data);
    return data;
  } catch (error) {
    console.error('❌ API Error in getPatientById:', error);
    throw error;
  }
},
  async getTodayAppointments() {
    const response = await fetch(`${API_BASE}/DoctorSchedule/today`);
    return await response.json();
  },

  async getAppointmentsInRange(startDate, endDate) {
    const response = await fetch(`${API_BASE}/DoctorSchedule/range?start=${startDate}&end=${endDate}`);
    return await response.json();
  },

  // ============================================
  // PRESCRIPTIONS API
  // ============================================
  async getPrescriptions() {
    const response = await fetch(`${API_BASE}/prescriptons`);
    return await response.json();
  },

  async createPrescription(prescriptionData) {
    const response = await fetch(`${API_BASE}/prescriptons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prescriptionData)
    });
    return await response.json();
  },

  async updatePrescription(id, prescriptionData) {
    const response = await fetch(`${API_BASE}/prescriptons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prescriptionData)
    });
    return await response.json();
  },

  async deletePrescription(id) {
    const response = await fetch(`${API_BASE}/prescriptons/${id}`, {
      method: 'DELETE'
    });
    return await response.json();
  },

  // ============================================
  // DOCTOR NOTES API
  // ============================================
  async getDoctorNotes() {
    const response = await fetch(`${API_BASE}/notes`);
    return await response.json();
  },

  async createDoctorNote(noteData) {
    const response = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    });
    return await response.json();
  },

  async updateDoctorNote(id, noteData) {
    const response = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    });
    return await response.json();
  },

  async deleteDoctorNote(id) {
    const response = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'DELETE'
    });
    return await response.json();
  },

  // ============================================
  // DOCTORS API (NEW)
  // ============================================
  async getDoctors(page = 1, limit = 50, search = '', specialite = '', hopital = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(specialite && { specialite }),
        ...(hopital && { hopital })
      });
      
      console.log('🩺 API: Fetching doctors with params:', params.toString());
      const response = await fetch(`${API_BASE}/doctors?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API: Doctors data received:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error in getDoctors:', error);
      throw error;
    }
  },

  async getDoctor(id) {
    try {
      console.log('🩺 API: Fetching doctor with ID:', id);
      const response = await fetch(`${API_BASE}/doctors/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API: Doctor data received:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error in getDoctor:', error);
      throw error;
    }
  },

  async createDoctor(doctorData) {
    try {
      console.log('🩺 API: Creating new doctor:', doctorData);
      const response = await fetch(`${API_BASE}/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create doctor: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ API: Doctor created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error in createDoctor:', error);
      throw error;
    }
  },

  async updateDoctor(id, doctorData) {
    try {
      console.log('🩺 API: Updating doctor', id, 'with data:', doctorData);
      const response = await fetch(`${API_BASE}/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update doctor: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ API: Doctor updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error in updateDoctor:', error);
      throw error;
    }
  },

  async patchDoctor(id, doctorData) {
    try {
      console.log('🩺 API: Patching doctor', id, 'with data:', doctorData);
      const response = await fetch(`${API_BASE}/doctors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to patch doctor: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ API: Doctor patched successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error in patchDoctor:', error);
      throw error;
    }
  },

  async deleteDoctor(id) {
    try {
      console.log('🩺 API: Deleting doctor with ID:', id);
      const response = await fetch(`${API_BASE}/doctors/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API: Doctor deleted successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error in deleteDoctor:', error);
      throw error;
    }
  },

  async batchUpdateDoctors(ids, updateData) {
    try {
      console.log('🩺 API: Batch updating doctors:', ids, updateData);
      const response = await fetch(`${API_BASE}/doctors`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, updateData })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to batch update doctors: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ API: Doctors batch updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error in batchUpdateDoctors:', error);
      throw error;
    }
  },

  async batchDeleteDoctors(ids) {
    try {
      console.log('🩺 API: Batch deleting doctors:', ids);
      const response = await fetch(`${API_BASE}/doctors`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to batch delete doctors: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ API: Doctors batch deleted successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error in batchDeleteDoctors:', error);
      throw error;
    }
  },

  async getDoctorSpecialties() {
    try {
      console.log('🩺 API: Fetching doctor specialties');
      const response = await fetch(`${API_BASE}/doctors/specialties`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API: Doctor specialties received:', data);
      return data;
    } catch (error) {
      console.error('❌ API Error in getDoctorSpecialties:', error);
      throw error;
    }
  },

  // ============================================
  // HELPER METHODS
  // ============================================
  calculateEndTime(startTime, durationMinutes = 30) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + (durationMinutes * 60000));
    return endDate.toTimeString().slice(0, 5);
  },


  // ============================================
  // Patients
  // ============================================

async getPatientAppointments(patientId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/appointments/patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ API Error in getPatientAppointments:', error);
    return [];
  }
},

async getPatientPrescriptions(patientId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/prescriptions/patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ API Error in getPatientPrescriptions:', error);
    return [];
  }
},

async getPatientLabResults(patientId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/lab-results/patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ API Error in getPatientLabResults:', error);
    return [];
  }
},
// In api.js, add these methods:

async createLabOrder(patientId, labOrderData) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/patients/${patientId}/lab-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(labOrderData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ API Error in createLabOrder:', error);
    throw error;
  }
},

async getPatientLabOrders(patientId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/patients/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    // Extract lab orders from patient data
    return data.patient?.labOrders || [];
  } catch (error) {
    console.error('❌ API Error in getPatientLabOrders:', error);
    return [];
  }
} ,

  mapAppointmentType(kind) {
    const typeMap = {
      'video': 'video',
      'in-person': 'in_person', 
      'meeting': 'meeting',
      'phone': 'phone'
    };
    return typeMap[kind] || 'in_person';
  }
};

