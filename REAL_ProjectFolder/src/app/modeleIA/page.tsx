"use client";

import { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type PredictionResult = {
  input_symptoms: string[];
  disease: string;
  confidence: number;
  top_predictions: { disease: string; probability: number }[];
  description: string;
  precautions: string[];
  severity_score: number;
};

export default function ModeleIAPage() {
  const [allSymptoms, setAllSymptoms] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  // ✅ Charger les symptômes depuis FastAPI
  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/symptoms")
      .then((res) => {
        if (!res.ok) throw new Error("Serveur IA non disponible");
        return res.json();
      })
      .then((data) => setAllSymptoms(data.symptoms || []))
      .catch(() => {
        setError("❌ Impossible de se connecter au serveur IA. Assurez-vous que le serveur FastAPI est en cours d'exécution.");
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Ajouter un symptôme
  const addSymptom = () => {
    const value = input.trim();
    if (!value) return;

    if (allSymptoms.length > 0 && !allSymptoms.includes(value)) {
      alert("❌ Ce symptôme n'existe pas dans la base de données médicale !");
      return;
    }

    if (!selectedSymptoms.includes(value)) {
      setSelectedSymptoms([...selectedSymptoms, value]);
    }

    setInput("");
  };

  // ✅ Supprimer un symptôme
  const removeSymptom = (sym: string) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
  };

  // ✅ Appeler le modèle IA
  const predict = async () => {
    if (selectedSymptoms.length === 0) {
      alert("⚠️ Veuillez ajouter au moins un symptôme");
      return;
    }

    setError("");
    setResult(null);
    setPredicting(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms: selectedSymptoms }),
      });

      if (!res.ok) {
        const txt = await res.text();
        setError("❌ Erreur API: " + txt);
        return;
      }

      const data: PredictionResult = await res.json();
      setResult(data);
    } catch (e) {
      setError("❌ Erreur de connexion avec le serveur IA");
    } finally {
      setPredicting(false);
    }
  };

  // ✅ Clear all symptoms
  const clearAllSymptoms = () => {
    setSelectedSymptoms([]);
    setResult(null);
    setError("");
  };

  // ✅ Get severity color
  const getSeverityColor = (score: number) => {
    if (score <= 3) return "text-emerald-400";
    if (score <= 7) return "text-yellow-400";
    return "text-red-400";
  };

  // ✅ Get severity label
  const getSeverityLabel = (score: number) => {
    if (score <= 3) return "Faible";
    if (score <= 7) return "Modéré";
    return "Élevé";
  };

  // ✅ Get severity color class for background
  const getSeverityBgColor = (score: number) => {
    if (score <= 3) return "bg-emerald-500";
    if (score <= 7) return "bg-yellow-500";
    return "bg-red-500";
  };

  // ✅ Download PDF Report
  const downloadPDF = async () => {
    if (!result || !resultsRef.current) return;

    setGeneratingPDF(true);

    try {
      // Create a temporary div for PDF generation
      const pdfElement = document.createElement('div');
      pdfElement.className = 'pdf-export p-8';
      pdfElement.style.backgroundColor = '#0f172a';
      pdfElement.style.color = 'white';
      pdfElement.style.width = '794px'; // A4 width in pixels at 96 DPI
      pdfElement.style.fontFamily = 'Arial, sans-serif';

      // Get current date and time
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Build PDF content
      pdfElement.innerHTML = `
        <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
          <table style="width: 100%;">
            <tr>
              <td style="width: 80px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #06b6d4, #3b82f6); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 24px;">🧠</span>
                </div>
              </td>
              <td>
                <h1 style="font-size: 28px; font-weight: bold; margin: 0; color: white;">Rapport de Diagnostic IA</h1>
                <p style="color: #94a3b8; margin: 5px 0 0 0;">Généré par l'assistant diagnostique médical</p>
              </td>
              <td style="text-align: right;">
                <div style="color: #94a3b8; font-size: 12px;">
                  <div>Date: ${dateStr}</div>
                  <div>Heure: ${timeStr}</div>
                  <div>ID Rapport: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Patient Info (placeholder - you can add actual patient data) -->
        <div style="margin-bottom: 30px; padding: 15px; background: rgba(30, 41, 59, 0.5); border-radius: 10px;">
          <h3 style="color: #3b82f6; margin: 0 0 10px 0; font-size: 16px;">INFORMATIONS DU PATIENT</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <span style="color: #94a3b8; font-size: 12px;">Date de l'analyse:</span>
              <div style="color: white; font-weight: bold;">${dateStr}</div>
            </div>
            <div>
              <span style="color: #94a3b8; font-size: 12px;">Nombre de symptômes:</span>
              <div style="color: white; font-weight: bold;">${selectedSymptoms.length}</div>
            </div>
          </div>
        </div>

        <!-- Main Diagnosis -->
        <div style="margin-bottom: 30px; padding: 20px; background: linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1)); border-left: 4px solid #10b981; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div>
              <div style="color: #94a3b8; font-size: 12px; margin-bottom: 5px;">DIAGNOSTIC PRINCIPAL</div>
              <h2 style="color: white; margin: 0; font-size: 24px;">${result.disease}</h2>
            </div>
            <div style="text-align: right;">
              <div style="color: #94a3b8; font-size: 12px; margin-bottom: 5px;">NIVEAU DE CONFIANCE</div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 100px; height: 8px; background: #334155; border-radius: 4px; overflow: hidden;">
                  <div style="width: ${result.confidence * 100}%; height: 100%; background: linear-gradient(to right, #10b981, #059669);"></div>
                </div>
                <span style="color: #10b981; font-weight: bold; font-size: 18px;">${(result.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <p style="color: #cbd5e1; margin: 0; font-size: 14px; line-height: 1.5;">${result.description}</p>
        </div>

        <!-- Two columns layout -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <!-- Left Column -->
          <div>
            <!-- Symptoms -->
            <div style="margin-bottom: 20px;">
              <h3 style="color: #3b82f6; margin: 0 0 10px 0; font-size: 16px;">SYMPTÔMES ANALYSÉS</h3>
              <div style="background: rgba(30, 41, 59, 0.5); padding: 15px; border-radius: 8px;">
                ${selectedSymptoms.map(symptom => `
                  <div style="display: inline-block; margin: 0 8px 8px 0; padding: 6px 12px; background: rgba(59, 130, 246, 0.2); border-radius: 20px; color: white; font-size: 12px;">
                    ${symptom}
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Top Predictions -->
            <div>
              <h3 style="color: #3b82f6; margin: 0 0 10px 0; font-size: 16px;">TOP DES DIAGNOSTICS</h3>
              <div style="background: rgba(30, 41, 59, 0.5); padding: 15px; border-radius: 8px;">
                ${result.top_predictions.map((pred, index) => `
                  <div style="margin-bottom: 10px; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; ${index === 0 ? 'border-left: 3px solid #06b6d4;' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 24px; height: 24px; background: ${index === 0 ? '#06b6d4' : index === 1 ? '#3b82f6' : '#8b5cf6'}; color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                          ${index + 1}
                        </div>
                        <span style="color: white; font-weight: ${index === 0 ? 'bold' : 'normal'};">${pred.disease}</span>
                      </div>
                      <span style="color: ${index === 0 ? '#06b6d4' : index === 1 ? '#3b82f6' : '#8b5cf6'}; font-weight: bold;">${(pred.probability * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div>
            <!-- Severity -->
            <div style="margin-bottom: 20px;">
              <h3 style="color: #3b82f6; margin: 0 0 10px 0; font-size: 16px;">NIVEAU DE GRAVITÉ</h3>
              <div style="background: rgba(30, 41, 59, 0.5); padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 48px; font-weight: bold; color: ${result.severity_score <= 3 ? '#10b981' : result.severity_score <= 7 ? '#eab308' : '#ef4444'}; margin-bottom: 10px;">
                  ${result.severity_score}/10
                </div>
                <div style="width: 100%; height: 12px; background: #334155; border-radius: 6px; overflow: hidden; margin-bottom: 10px;">
                  <div style="width: ${result.severity_score * 10}%; height: 100%; background: ${result.severity_score <= 3 ? '#10b981' : result.severity_score <= 7 ? '#eab308' : '#ef4444'};"></div>
                </div>
                <div style="color: ${result.severity_score <= 3 ? '#10b981' : result.severity_score <= 7 ? '#eab308' : '#ef4444'}; font-weight: bold; font-size: 14px;">
                  ${getSeverityLabel(result.severity_score)} - ${result.severity_score <= 3 ? 'Surveillance régulière' : result.severity_score <= 7 ? 'Consultation recommandée' : 'Consultation urgente'}
                </div>
              </div>
            </div>

            <!-- Precautions -->
            <div>
              <h3 style="color: #3b82f6; margin: 0 0 10px 0; font-size: 16px;">PRÉCAUTIONS RECOMMANDÉES</h3>
              <div style="background: rgba(30, 41, 59, 0.5); padding: 15px; border-radius: 8px;">
                ${result.precautions.map((precaution, index) => `
                  <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px;">
                    <div style="width: 20px; height: 20px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0;">
                      ✓
                    </div>
                    <span style="color: #cbd5e1; font-size: 13px; line-height: 1.4;">${precaution}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; color: #94a3b8; font-size: 11px; text-align: center;">
          <div style="margin-bottom: 10px;">
            <strong>IMPORTANT :</strong> Ce rapport est généré par une intelligence artificielle et doit être utilisé comme outil d'aide au diagnostic uniquement. 
            Consultez toujours un professionnel de santé qualifié pour un diagnostic définitif et un traitement approprié.
          </div>
          <div>
            © ${new Date().getFullYear()} Assistant Diagnostique Médical - Rapport généré automatiquement
          </div>
        </div>
      `;

      // Append to body temporarily
      document.body.appendChild(pdfElement);

      // Generate PDF
      const canvas = await html2canvas(pdfElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0f172a'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      const fileName = `diagnostic-ia-${result.disease.toLowerCase().replace(/\s+/g, '-')}-${dateStr.replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);

      // Clean up
      document.body.removeChild(pdfElement);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // ✅ Quick PDF download (simpler version)
  const downloadQuickPDF = () => {
    if (!result) return;

    setGeneratingPDF(true);

    try {
      const doc = new jsPDF();
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR');
      const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      // Header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Rapport de Diagnostic IA', 105, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Généré le ${dateStr} à ${timeStr}`, 105, 22, { align: 'center' });

      // Main Diagnosis
      doc.setFontSize(16);
      doc.setTextColor(6, 182, 212); // Cyan
      doc.text('DIAGNOSTIC PRINCIPAL', 20, 40);
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0);
      doc.text(result.disease, 20, 50);
      
      // Confidence
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Confiance: ${(result.confidence * 100).toFixed(1)}%`, 20, 60);
      
      // Draw confidence bar
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(200, 200, 200);
      doc.rect(20, 65, 170, 5, 'F');
      doc.setFillColor(6, 182, 212);
      doc.rect(20, 65, 170 * result.confidence, 5, 'F');

      // Description
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const descriptionLines = doc.splitTextToSize(result.description, 170);
      doc.text(descriptionLines, 20, 80);

      // Symptoms
      doc.setFontSize(16);
      doc.setTextColor(6, 182, 212);
      doc.text('SYMPTÔMES ANALYSÉS', 20, 100);
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(selectedSymptoms.join(', '), 20, 110);

      // Top Predictions
      let yPos = 125;
      doc.setFontSize(16);
      doc.setTextColor(6, 182, 212);
      doc.text('TOP DES DIAGNOSTICS', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      result.top_predictions.forEach((pred, index) => {
        const text = `${index + 1}. ${pred.disease} - ${(pred.probability * 100).toFixed(1)}%`;
        doc.text(text, 20, yPos);
        yPos += 7;
      });

      // Severity
      yPos += 5;
      doc.setFontSize(16);
      doc.setTextColor(6, 182, 212);
      doc.text('NIVEAU DE GRAVITÉ', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(24);
      const severityColor = result.severity_score <= 3 ? [16, 185, 129] : 
                           result.severity_score <= 7 ? [234, 179, 8] : 
                           [239, 68, 68];
      doc.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
      doc.text(`${result.severity_score}/10`, 20, yPos);
      
      // Precautions
      yPos += 15;
      doc.setFontSize(16);
      doc.setTextColor(6, 182, 212);
      doc.text('PRÉCAUTIONS', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      result.precautions.forEach((precaution, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${precaution}`, 170);
        doc.text(lines, 20, yPos);
        yPos += lines.length * 7;
      });

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const footerText = "Ce rapport est généré par une intelligence artificielle et doit être utilisé comme outil d'aide au diagnostic uniquement. Consultez toujours un professionnel de santé qualifié.";
      const footerLines = doc.splitTextToSize(footerText, 170);
      doc.text(footerLines, 20, 270);

      // Save PDF
      const fileName = `diagnostic-ia-${dateStr.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-clinical-midnight p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <i className="fas fa-brain text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Assistant Diagnostic IA
                </h1>
                <p className="text-slate-400">
                  Analysez vos symptômes pour obtenir une prédiction médicale assistée par intelligence artificielle
                </p>
              </div>
            </div>
            <a
        href="/patient"
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
      >
        <i className="fas fa-arrow-left"></i>
        <span>Go Back To HomePage</span>
      </a>
            {/* Download Button (shown when results exist) */}
           
          </div>
          
          <div className="flex items-center text-slate-400 text-sm space-x-4">
            <div className="flex items-center">
              <i className="fas fa-shield-alt mr-2 text-emerald-400"></i>
              <span>Confidentialité médicale garantie</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-robot mr-2 text-cyan-400"></i>
              <span>Modèle IA entraîné sur des données médicales</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-info-circle mr-2 text-blue-400"></i>
              <span>À utiliser comme aide au diagnostic uniquement</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Symptoms Input */}
          <div className="space-y-6">
            {/* Symptom Search */}
            <div className="premium-card p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                  <i className="fas fa-search text-white"></i>
                </div>
                <h2 className="text-xl font-bold text-white">
                  <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    Rechercher des symptômes
                  </span>
                </h2>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    list="symptoms-list"
                    placeholder="Commencez à taper un symptôme (ex: fièvre, maux de tête...)"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                  />
                  <datalist id="symptoms-list">
                    {allSymptoms.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>

                <button
                  onClick={addSymptom}
                  className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <i className="fas fa-plus"></i>
                  <span>Ajouter le symptôme</span>
                </button>

                {loading && (
                  <div className="text-center py-4">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-400 mt-2">Chargement de la base de symptômes...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Symptoms */}
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mr-4">
                    <i className="fas fa-list-check text-white"></i>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    <span className="bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
                      Symptômes sélectionnés
                    </span>
                  </h2>
                </div>
                {selectedSymptoms.length > 0 && (
                  <button
                    onClick={clearAllSymptoms}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Tout effacer
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {selectedSymptoms.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-clipboard-list text-4xl text-slate-600 mb-4"></i>
                    <p className="text-slate-400">Aucun symptôme sélectionné</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Commencez par rechercher et ajouter des symptômes
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400 mb-2">
                      {selectedSymptoms.length} symptôme(s) sélectionné(s)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.map((s) => (
                        <div
                          key={s}
                          className="group flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400/50 transition-all"
                        >
                          <i className="fas fa-check-circle text-emerald-400"></i>
                          <span className="text-white">{s}</span>
                          <button
                            onClick={() => removeSymptom(s)}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Prediction Button */}
            <button
              onClick={predict}
              disabled={selectedSymptoms.length === 0 || predicting}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {predicting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyse en cours...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-robot text-2xl"></i>
                  <span>Lancer l'analyse diagnostique</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="premium-card p-6 border-2 border-red-500/30 bg-gradient-to-r from-red-900/20 to-red-800/10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-red-400 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-white">Erreur de connexion</h3>
                </div>
                <p className="text-slate-300">{error}</p>
                <div className="mt-4 p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-sm text-slate-400 mb-2">Solution rapide :</p>
                  <ol className="text-sm text-slate-300 space-y-1 list-decimal pl-4">
                    <li>Vérifiez que le serveur FastAPI est en cours d'exécution</li>
                    <li>Exécutez la commande : <code className="bg-slate-900 px-2 py-1 rounded">python -m uvicorn main:app --reload</code></li>
                    <li>Assurez-vous que le port 8000 est disponible</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Results Display */}
            {result && (
              <div ref={resultsRef} className="premium-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                      <i className="fas fa-stethoscope text-white text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Résultats du diagnostic</h2>
                      <p className="text-slate-400">Basé sur l'analyse de vos symptômes</p>
                    </div>
                  </div>
                  
                  {/* Quick download button inside results */}
                  <button
                    onClick={downloadQuickPDF}
                    disabled={generatingPDF}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <i className="fas fa-download"></i>
                    <span>PDF</span>
                  </button>
                </div>

                {/* Main Prediction */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900/20 to-green-900/20 border border-emerald-500/30 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-400">Maladie prédite</p>
                      <h3 className="text-2xl font-bold text-white">{result.disease}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Confiance</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                            style={{ width: `${result.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xl font-bold text-emerald-400">
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-300">{result.description}</p>
                </div>

                {/* Top Predictions */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <i className="fas fa-chart-line text-cyan-400 mr-2"></i>
                    Top 3 des diagnostics possibles
                  </h3>
                  <div className="space-y-3">
                    {result.top_predictions.map((tp, index) => (
                      <div 
                        key={tp.disease}
                        className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              index === 0 ? 'bg-cyan-500/20 text-cyan-400' :
                              index === 1 ? 'bg-blue-500/20 text-blue-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              <span className="font-bold">#{index + 1}</span>
                            </div>
                            <span className="font-medium text-white">{tp.disease}</span>
                          </div>
                          <span className="font-bold text-lg text-white">
                            {(tp.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Precautions & Severity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <i className="fas fa-shield-alt text-yellow-400 mr-2"></i>
                      Précautions recommandées
                    </h3>
                    <ul className="space-y-2">
                      {result.precautions.map((p, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <i className="fas fa-check-circle text-emerald-400 mt-1"></i>
                          <span className="text-slate-300">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <i className="fas fa-exclamation-triangle text-red-400 mr-2"></i>
                      Score de gravité
                    </h3>
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
                      <div className="text-center">
                        <div className={`text-5xl font-bold mb-2 ${getSeverityColor(result.severity_score)}`}>
                          {result.severity_score}/10
                        </div>
                        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getSeverityBgColor(result.severity_score)}`}
                            style={{ width: `${result.severity_score * 10}%` }}
                          ></div>
                        </div>
                        <p className="text-slate-400 mt-3 text-sm">
                          {getSeverityLabel(result.severity_score)} - {
                            result.severity_score <= 3 ? 'Surveillance régulière' :
                            result.severity_score <= 7 ? 'Consultation recommandée' :
                            'Consultation urgente'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-cyan-500/30">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-info-circle text-cyan-400 text-xl"></i>
                    <p className="text-sm text-slate-300">
                      <span className="font-semibold text-white">Note importante : </span>
                      Ce diagnostic est généré par une IA et doit être confirmé par un professionnel de santé qualifié. 
                      Consultez toujours votre médecin pour un diagnostic définitif.
                    </p>
                  </div>
                </div>

                {/* Additional Download Button */}
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <button
                    onClick={downloadPDF}
                    disabled={generatingPDF}
                    className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {generatingPDF ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Génération du rapport PDF...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-file-medical"></i>
                        <span>Télécharger le rapport médical complet (PDF)</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-slate-500 text-center mt-2">
                    Le PDF contiendra un rapport détaillé avec vos symptômes, le diagnostic, et les recommandations
                  </p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!result && !error && (
              <div className="premium-card p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <i className="fas fa-microscope text-3xl text-slate-500"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">En attente d'analyse</h3>
                <p className="text-slate-400 mb-6">
                  Ajoutez des symptômes et lancez l'analyse pour obtenir une prédiction diagnostique.
                </p>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">Comment utiliser :</p>
                    <ol className="text-sm text-slate-300 space-y-2 text-left">
                      <li className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                          <span>1</span>
                        </div>
                        <span>Recherchez et ajoutez vos symptômes</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                          <span>2</span>
                        </div>
                        <span>Sélectionnez au moins 3 symptômes pour plus de précision</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                          <span>3</span>
                        </div>
                        <span>Lancez l'analyse pour obtenir les résultats</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <span>4</span>
                        </div>
                        <span>Téléchargez le rapport PDF pour conserver les résultats</span>
                      </li>
                    </ol>
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