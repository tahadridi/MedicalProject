"use client";
import { useState, useEffect } from "react";
import PickerPopup from "../../app/components/WheelPicker";
import { useRouter } from "next/navigation";

export default function HealthForm() {
  const router = useRouter();
  
  const [data, setData] = useState({

    gender: "",
    height: 170,
    weight: 70,
    bloodType: "",
    allergies: "",
    allergiesDetails: "",
    chronic: "",
    chronicDetails: "",
    smoking: "",
    alcohol: "",
    activity: "",
  });

  const [openPicker, setOpenPicker] = useState<null | "height" | "weight">(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Check if already has profile
  useEffect(() => {
    const checkProfile = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const cin = user.cin;
        
        try {
          const res = await fetch("/api/health/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cin }),
          });
          
          const checkData = await res.json();
          if (checkData.hasProfile) {
            router.push("/patient");
          }
        } catch (error) {
          console.error("Error checking profile:", error);
        }
      }
    };
    
    checkProfile();
  }, [router]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    const userStr = localStorage.getItem("user");
    
    if (!userStr) {
      alert("User not found — please login again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const cin = user.cin;
      const email = user.email;
      if (!data.gender || !data.bloodType) {
        alert("Please fill in all required fields (Gender and Blood Type are required).");
        setIsSubmitting(false);
        return;
      }
      
      const res = await fetch("/api/health/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cin,email, ...data }),
      });

      const result = await res.json();
      
      if (res.ok) {
        localStorage.setItem("hasHealthProfile", "true");
        
        // Show elegant success toast
        showSuccessToast();
        
        setTimeout(() => {
          router.push("/patient");
        }, 2000);
      } else {
        showErrorToast(result.error || "Error saving profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      showErrorToast("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSuccessToast = () => {
    const toast = document.createElement("div");
    toast.className = "success-toast";
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-check-circle"></i>
        <span>Health profile saved successfully! Redirecting...</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const showErrorToast = (message: string) => {
    const toast = document.createElement("div");
    toast.className = "error-toast";
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-clinical-midnight to-slate-950 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-400">
              Step {step} of {totalSteps}
            </div>
            <div className="text-sm font-medium text-cyan-400">
              {step === 1 && "Basic Information"}
              {step === 2 && "Health Details"}
              {step === 3 && "Lifestyle & Review"}
            </div>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="premium-card border border-white/10 rounded-3xl overflow-hidden">
          {/* Card Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20"></div>
            <div className="relative p-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
                  <i className="fas fa-heartbeat text-white text-2xl"></i>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                    Health Profile Setup
                  </h1>
                  <p className="text-slate-400 mt-2">
                    Complete your profile to access personalized healthcare features
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Gender <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className="w-full premium-input bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all appearance-none"
                        value={data.gender}
                        onChange={(e) => setData({ ...data, gender: e.target.value })}
                      >
                        <option value="" className="bg-slate-800">Select Gender</option>
                        <option value="male" className="bg-slate-800">Male</option>
                        <option value="female" className="bg-slate-800">Female</option>
                      </select>
                      <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                    </div>
                  </div>

                  {/* Blood Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Blood Type <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className="w-full premium-input bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all appearance-none"
                        value={data.bloodType}
                        onChange={(e) => setData({ ...data, bloodType: e.target.value })}
                      >
                        <option value="" className="bg-slate-800">Select Blood Type</option>
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(type => (
                          <option key={type} value={type} className="bg-slate-800">{type}</option>
                        ))}
                      </select>
                      <i className="fas fa-tint absolute right-4 top-1/2 transform -translate-y-1/2 text-red-400"></i>
                    </div>
                  </div>
                </div>

                {/* Height & Weight */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Height */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Height (cm)
                    </label>
                    <div 
                      className="premium-input bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white cursor-pointer hover:border-cyan-500/50 transition-all flex items-center justify-between group"
                      onClick={() => setOpenPicker("height")}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                          <i className="fas fa-ruler-vertical text-blue-400"></i>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{data.height}</div>
                          <div className="text-sm text-slate-400">centimeters</div>
                        </div>
                      </div>
                      <i className="fas fa-edit text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Weight (kg)
                    </label>
                    <div 
                      className="premium-input bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white cursor-pointer hover:border-emerald-500/50 transition-all flex items-center justify-between group"
                      onClick={() => setOpenPicker("weight")}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                          <i className="fas fa-weight text-emerald-400"></i>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{data.weight}</div>
                          <div className="text-sm text-slate-400">kilograms</div>
                        </div>
                      </div>
                      <i className="fas fa-edit text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Allergies */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Known Allergies
                    </label>
                    <div className="relative">
                      <select
                        className="w-full premium-input bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all appearance-none"
                        value={data.allergies}
                        onChange={(e) => setData({ ...data, allergies: e.target.value })}
                      >
                        <option value="" className="bg-slate-800">Select Allergies</option>
                        <option value="none" className="bg-slate-800">No allergies</option>
                        <option value="penicillin" className="bg-slate-800">Penicillin</option>
                        <option value="pollen" className="bg-slate-800">Pollen</option>
                        <option value="nuts" className="bg-slate-800">Nuts</option>
                        <option value="seafood" className="bg-slate-800">Seafood</option>
                        <option value="other" className="bg-slate-800">Other</option>
                      </select>
                      <i className="fas fa-allergies absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-400"></i>
                    </div>
                    {data.allergies === "other" && (
                      <input
                        className="w-full premium-input bg-slate-800/50 border border-yellow-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all mt-3"
                        placeholder="Describe your allergy..."
                        value={data.allergiesDetails}
                        onChange={(e) => setData({ ...data, allergiesDetails: e.target.value })}
                      />
                    )}
                  </div>

                  {/* Chronic Diseases */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Chronic Diseases
                    </label>
                    <div className="relative">
                      <select
                        className="w-full premium-input bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all appearance-none"
                        value={data.chronic}
                        onChange={(e) => setData({ ...data, chronic: e.target.value })}
                      >
                        <option value="" className="bg-slate-800">Select Conditions</option>
                        <option value="none" className="bg-slate-800">None</option>
                        <option value="diabetes" className="bg-slate-800">Diabetes</option>
                        <option value="hypertension" className="bg-slate-800">High blood pressure</option>
                        <option value="asthma" className="bg-slate-800">Asthma</option>
                        <option value="other" className="bg-slate-800">Other</option>
                      </select>
                      <i className="fas fa-file-medical-alt absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400"></i>
                    </div>
                    {data.chronic === "other" && (
                      <input
                        className="w-full premium-input bg-slate-800/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all mt-3"
                        placeholder="Describe your condition..."
                        value={data.chronicDetails}
                        onChange={(e) => setData({ ...data, chronicDetails: e.target.value })}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Smoking */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Smoking Habits
                    </label>
                    <div className="space-y-2">
                      {["no", "occasionally", "daily"].map((option) => (
                        <div 
                          key={option}
                          className={`premium-input cursor-pointer border rounded-xl px-4 py-3 transition-all ${data.smoking === option ? 'border-red-500/50 bg-red-500/10' : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50'}`}
                          onClick={() => setData({ ...data, smoking: option })}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white capitalize">{option === "no" ? "Non-smoker" : option}</span>
                            {data.smoking === option && (
                              <i className="fas fa-check text-red-400"></i>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alcohol */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Alcohol Consumption
                    </label>
                    <div className="space-y-2">
                      {["no", "social", "regular"].map((option) => (
                        <div 
                          key={option}
                          className={`premium-input cursor-pointer border rounded-xl px-4 py-3 transition-all ${data.alcohol === option ? 'border-amber-500/50 bg-amber-500/10' : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50'}`}
                          onClick={() => setData({ ...data, alcohol: option })}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white capitalize">{option === "no" ? "Non-drinker" : option}</span>
                            {data.alcohol === option && (
                              <i className="fas fa-check text-amber-400"></i>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Physical Activity
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: "none", label: "No activity" },
                        { value: "light", label: "Light (1-2/week)" },
                        { value: "moderate", label: "Moderate (3-4/week)" },
                        { value: "intense", label: "Intense (5+/week)" }
                      ].map((option) => (
                        <div 
                          key={option.value}
                          className={`premium-input cursor-pointer border rounded-xl px-4 py-3 transition-all ${data.activity === option.value ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50'}`}
                          onClick={() => setData({ ...data, activity: option.value })}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white">{option.label}</span>
                            {data.activity === option.value && (
                              <i className="fas fa-check text-emerald-400"></i>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-700/50">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center ${step === 1 ? 'opacity-50 cursor-not-allowed text-slate-500' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Previous
              </button>
              
              {step < totalSteps ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center"
                >
                  Next Step
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle mr-2"></i>
                      Complete Profile
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: "BMI", value: ((data.weight / ((data.height / 100) ** 2)).toFixed(1)), color: "cyan" },
            { label: "Health Score", value: "85%", color: "emerald" },
            { label: "Risk Level", value: "Low", color: "green" },
            { label: "Profile", value: step === 3 ? "Complete" : "In Progress", color: step === 3 ? "purple" : "amber" }
          ].map((stat, idx) => (
            <div key={idx} className="premium-card p-4 text-center">
              <div className={`text-2xl font-bold text-${stat.color}-400 mb-1`}>{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wheel Pickers */}
      {openPicker === "height" && (
        <PickerPopup
          title="Select Your Height"
          value={data.height}
          options={Array.from({ length: 120 }, (_, i) => i + 120)}
          onSelect={(v) => setData({ ...data, height: v })}
          onClose={() => setOpenPicker(null)}
        />
      )}

      {openPicker === "weight" && (
        <PickerPopup
          title="Select Your Weight"
          value={data.weight}
          options={Array.from({ length: 150 }, (_, i) => i + 30)}
          onSelect={(v) => setData({ ...data, weight: v })}
          onClose={() => setOpenPicker(null)}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .premium-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
        }
        
        .premium-input {
          background: rgba(30, 41, 59, 0.3);
          backdrop-filter: blur(10px);
        }
        
        .success-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          background: rgba(22, 163, 74, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(74, 222, 128, 0.3);
          color: white;
          padding: 12px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 9999;
          animation: slideIn 0.3s ease-out;
        }
        
        .error-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          background: rgba(220, 38, 38, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(248, 113, 113, 0.3);
          color: white;
          padding: 12px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 9999;
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .toast-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .toast-content i {
          font-size: 20px;
        }
      `}</style>
    </div>
  );
}