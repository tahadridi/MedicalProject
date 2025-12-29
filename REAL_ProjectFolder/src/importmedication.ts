// scripts/seedMedications.ts
import mongoose from 'mongoose';

async function seedMedications() {
  try {
    console.log('🔄 Ajout des médicaments à la base de données...');
    
    // Se connecter directement à MongoDB Atlas
    await mongoose.connect('mongodb+srv://firasbouzainne7_db_user:firas123@cluster0.vsrofcf.mongodb.net/medecin_intelligent?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connecté à MongoDB');

    // Vérifier la collection
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasMedications = collections.some(col => col.name === 'medications');
    
    console.log(`🔍 Collection 'medications' existe: ${hasMedications ? '✅' : '❌'}`);

    const medicationsData = [
      {
        "name": "Paracetamol",
        "dosage": "500 mg",
        "description": "Analgesic and antipyretic used to treat mild to moderate pain and reduce fever.",
        "sideEffects": ["Nausea", "Allergic reactions", "Liver damage (with overdose)"],
        "usage": "Take 1-2 tablets every 6–8 hours after meals. Do not exceed 4000 mg daily.",
        "category": "Analgesic",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Ibuprofen",
        "dosage": "400 mg",
        "description": "Nonsteroidal anti-inflammatory drug (NSAID) used for pain, inflammation, and fever.",
        "sideEffects": ["Stomach pain", "Heartburn", "Dizziness", "Kidney issues", "Increased bleeding risk"],
        "usage": "Take 1 tablet every 6-8 hours with food. Maximum 3200 mg daily.",
        "category": "Anti-inflammatory",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Amoxicillin",
        "dosage": "500 mg",
        "description": "Broad-spectrum penicillin antibiotic used to treat various bacterial infections.",
        "sideEffects": ["Diarrhea", "Rash", "Nausea", "Vomiting", "Yeast infections"],
        "usage": "Take 1 capsule every 8 hours for 7-10 days, with or without food.",
        "category": "Antibiotic",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Azithromycin",
        "dosage": "250 mg",
        "description": "Macrolide antibiotic for respiratory, skin, and sexually transmitted infections.",
        "sideEffects": ["Nausea", "Abdominal pain", "Diarrhea", "Headache", "QT prolongation"],
        "usage": "Take once daily for 3–5 days, either 1 hour before or 2 hours after meals.",
        "category": "Antibiotic",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Metformin",
        "dosage": "850 mg",
        "description": "First-line oral antidiabetic medication for type 2 diabetes management.",
        "sideEffects": ["Nausea", "Diarrhea", "Stomach upset", "Vitamin B12 deficiency", "Lactic acidosis (rare)"],
        "usage": "Take 1 tablet twice daily with meals to reduce gastrointestinal side effects.",
        "category": "Antidiabetic",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Omeprazole",
        "dosage": "20 mg",
        "description": "Proton pump inhibitor that reduces gastric acid production for GERD and ulcers.",
        "sideEffects": ["Headache", "Abdominal pain", "Nausea", "Vitamin B12 deficiency", "Bone fractures"],
        "usage": "Take once daily 30-60 minutes before breakfast. Swallow whole, do not crush.",
        "category": "PPI",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Aspirin",
        "dosage": "100 mg",
        "description": "Salicylate used for pain, fever, inflammation, and cardiovascular protection.",
        "sideEffects": ["Stomach irritation", "Bleeding", "Tinnitus", "Reye's syndrome (in children)"],
        "usage": "Take once daily after food for cardiovascular protection. Higher doses for pain.",
        "category": "Analgesic/Antiplatelet",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Cetirizine",
        "dosage": "10 mg",
        "description": "Second-generation antihistamine for allergic rhinitis and urticaria.",
        "sideEffects": ["Drowsiness", "Dry mouth", "Headache", "Fatigue", "Sore throat"],
        "usage": "Take 1 tablet once daily, with or without food.",
        "category": "Antihistamine",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Salbutamol",
        "dosage": "2 mg",
        "description": "Short-acting β2 adrenergic agonist for acute asthma and COPD symptoms.",
        "sideEffects": ["Tremor", "Increased heart rate", "Anxiety", "Hypokalemia", "Headache"],
        "usage": "Take 1-2 tablets as needed or use inhaler 2 puffs every 4-6 hours for symptoms.",
        "category": "Bronchodilator",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Lisinopril",
        "dosage": "10 mg",
        "description": "ACE inhibitor for hypertension, heart failure, and post-MI management.",
        "sideEffects": ["Dizziness", "Dry cough", "Hyperkalemia", "Angioedema", "Renal impairment"],
        "usage": "Take once daily at the same time, with or without food.",
        "category": "Antihypertensive",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Atorvastatin",
        "dosage": "20 mg",
        "description": "HMG-CoA reductase inhibitor (statin) for hyperlipidemia and cardiovascular prevention.",
        "sideEffects": ["Muscle pain", "Liver enzyme elevation", "Headache", "Diabetes risk"],
        "usage": "Take once daily in the evening or at bedtime, with or without food.",
        "category": "Statin",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Levothyroxine",
        "dosage": "100 mcg",
        "description": "Thyroid hormone replacement for hypothyroidism.",
        "sideEffects": ["Palpitations", "Insomnia", "Weight loss", "Heat intolerance", "Anxiety"],
        "usage": "Take once daily on empty stomach, 30-60 minutes before breakfast.",
        "category": "Thyroid Hormone",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Warfarin",
        "dosage": "5 mg",
        "description": "Vitamin K antagonist anticoagulant for thromboembolic disorders.",
        "sideEffects": ["Bleeding", "Bruising", "Skin necrosis", "Purple toe syndrome"],
        "usage": "Take once daily at same time. Regular INR monitoring required.",
        "category": "Anticoagulant",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Metoprolol",
        "dosage": "50 mg",
        "description": "Selective β1-blocker for hypertension, angina, and heart failure.",
        "sideEffects": ["Fatigue", "Bradycardia", "Dizziness", "Depression", "Erectile dysfunction"],
        "usage": "Take once or twice daily, with food to improve absorption.",
        "category": "Beta Blocker",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Sertraline",
        "dosage": "50 mg",
        "description": "SSRI antidepressant for depression, anxiety, and OCD.",
        "sideEffects": ["Nausea", "Insomnia", "Sexual dysfunction", "Weight gain", "Anxiety"],
        "usage": "Take once daily in morning or evening, with or without food.",
        "category": "Antidepressant",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Clopidogrel",
        "dosage": "75 mg",
        "description": "Antiplatelet agent for cardiovascular event prevention.",
        "sideEffects": ["Bleeding", "Bruising", "Rash", "Diarrhea", "Thrombotic thrombocytopenic purpura"],
        "usage": "Take once daily with or without food.",
        "category": "Antiplatelet",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Losartan",
        "dosage": "50 mg",
        "description": "Angiotensin II receptor blocker for hypertension and renal protection.",
        "sideEffects": ["Dizziness", "Hyperkalemia", "Back pain", "Hypotension", "Renal impairment"],
        "usage": "Take once or twice daily, with or without food.",
        "category": "ARB",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Gabapentin",
        "dosage": "300 mg",
        "description": "Anticonvulsant for neuropathic pain and seizure disorders.",
        "sideEffects": ["Dizziness", "Sedation", "Peripheral edema", "Weight gain", "Ataxia"],
        "usage": "Start with 300 mg at bedtime, titrate gradually. Take with food.",
        "category": "Anticonvulsant",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Hydrochlorothiazide",
        "dosage": "25 mg",
        "description": "Thiazide diuretic for hypertension and edema.",
        "sideEffects": ["Hypokalemia", "Hyponatremia", "Hyperglycemia", "Hyperuricemia", "Photosensitivity"],
        "usage": "Take once daily in morning to avoid nocturia.",
        "category": "Diuretic",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Diazepam",
        "dosage": "5 mg",
        "description": "Benzodiazepine for anxiety, muscle spasm, and alcohol withdrawal.",
        "sideEffects": ["Sedation", "Dizziness", "Dependence", "Respiratory depression", "Memory impairment"],
        "usage": "Take 2-3 times daily as needed. Avoid alcohol. Short-term use only.",
        "category": "Benzodiazepine",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Prednisone",
        "dosage": "20 mg",
        "description": "Corticosteroid for inflammatory and autoimmune conditions.",
        "sideEffects": ["Insomnia", "Weight gain", "Mood changes", "Osteoporosis", "Hyperglycemia"],
        "usage": "Take once daily in morning with food. Taper gradually when discontinuing.",
        "category": "Corticosteroid",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Ciprofloxacin",
        "dosage": "500 mg",
        "description": "Fluoroquinolone antibiotic for various bacterial infections.",
        "sideEffects": ["Tendon rupture", "QT prolongation", "Neuropathy", "Photosensitivity", "Diarrhea"],
        "usage": "Take twice daily for 7-14 days. Avoid dairy products and antacids.",
        "category": "Antibiotic",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Furosemide",
        "dosage": "40 mg",
        "description": "Loop diuretic for edema and hypertension.",
        "sideEffects": ["Hypokalemia", "Dehydration", "Ototoxicity", "Hyperglycemia", "Photosensitivity"],
        "usage": "Take once or twice daily in morning. Monitor electrolytes regularly.",
        "category": "Diuretic",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Tramadol",
        "dosage": "50 mg",
        "description": "Opioid analgesic for moderate to moderately severe pain.",
        "sideEffects": ["Nausea", "Dizziness", "Constipation", "Seizures", "Dependence"],
        "usage": "Take every 4-6 hours as needed. Maximum 400 mg daily.",
        "category": "Opioid",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Montelukast",
        "dosage": "10 mg",
        "description": "Leukotriene receptor antagonist for asthma and allergic rhinitis.",
        "sideEffects": ["Headache", "Neuropsychiatric events", "Abdominal pain", "Dream abnormalities"],
        "usage": "Take once daily in evening for asthma, any time for allergies.",
        "category": "Leukotriene Inhibitor",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Pantoprazole",
        "dosage": "40 mg",
        "description": "Proton pump inhibitor for GERD, erosive esophagitis, and Zollinger-Ellison syndrome.",
        "sideEffects": ["Headache", "Diarrhea", "Vitamin deficiencies", "Bone fractures", "Kidney disease"],
        "usage": "Take once daily before meals. Swallow whole, do not crush or chew.",
        "category": "PPI",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Albuterol Sulfate",
        "dosage": "90 mcg/inhalation",
        "description": "Short-acting beta-agonist for acute bronchospasm relief.",
        "sideEffects": ["Tremor", "Tachycardia", "Nervousness", "Hypokalemia", "Headache"],
        "usage": "1-2 inhalations every 4-6 hours as needed for symptoms.",
        "category": "Bronchodilator",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Doxycycline",
        "dosage": "100 mg",
        "description": "Tetracycline antibiotic for various infections including Lyme disease and acne.",
        "sideEffects": ["Photosensitivity", "Esophageal irritation", "Tooth discoloration", "Diarrhea", "Yeast infections"],
        "usage": "Take twice daily with plenty of water. Avoid dairy, antacids, and iron supplements.",
        "category": "Antibiotic",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Simvastatin",
        "dosage": "20 mg",
        "description": "HMG-CoA reductase inhibitor for cholesterol management.",
        "sideEffects": ["Myopathy", "Rhabdomyolysis", "Liver enzyme elevation", "Memory loss", "Diabetes risk"],
        "usage": "Take once daily in evening. Avoid grapefruit juice.",
        "category": "Statin",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Lorazepam",
        "dosage": "1 mg",
        "description": "Benzodiazepine for anxiety, insomnia, and status epilepticus.",
        "sideEffects": ["Sedation", "Dependence", "Memory impairment", "Respiratory depression", "Paradoxical reactions"],
        "usage": "Take 2-3 times daily as needed. Short-term use only due to dependence risk.",
        "category": "Benzodiazepine",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Fluoxetine",
        "dosage": "20 mg",
        "description": "SSRI antidepressant for depression, OCD, and bulimia nervosa.",
        "sideEffects": ["Insomnia", "Sexual dysfunction", "Weight changes", "Anxiety", "Serotonin syndrome"],
        "usage": "Take once daily in morning. Long half-life allows less frequent dosing.",
        "category": "Antidepressant",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Amlodipine",
        "dosage": "5 mg",
        "description": "Calcium channel blocker for hypertension and angina.",
        "sideEffects": ["Peripheral edema", "Flushing", "Headache", "Palpitations", "Gingival hyperplasia"],
        "usage": "Take once daily, with or without food.",
        "category": "Calcium Channel Blocker",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Citalopram",
        "dosage": "20 mg",
        "description": "SSRI antidepressant for depression and anxiety disorders.",
        "sideEffects": ["QT prolongation", "Nausea", "Insomnia", "Sexual dysfunction", "Weight gain"],
        "usage": "Take once daily, morning or evening, with or without food.",
        "category": "Antidepressant",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Spironolactone",
        "dosage": "25 mg",
        "description": "Potassium-sparing diuretic for hypertension, heart failure, and hormonal acne.",
        "sideEffects": ["Hyperkalemia", "Gynecomastia", "Menstrual irregularities", "Dizziness", "Dehydration"],
        "usage": "Take once or twice daily with food. Monitor potassium levels.",
        "category": "Diuretic",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Naproxen",
        "dosage": "500 mg",
        "description": "NSAID for pain, inflammation, and dysmenorrhea.",
        "sideEffects": ["GI bleeding", "Renal impairment", "Cardiovascular risk", "Headache", "Dizziness"],
        "usage": "Take every 12 hours with food. Maximum 1500 mg daily.",
        "category": "NSAID",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Quetiapine",
        "dosage": "100 mg",
        "description": "Atypical antipsychotic for schizophrenia, bipolar disorder, and depression.",
        "sideEffects": ["Sedation", "Weight gain", "Metabolic syndrome", "Dry mouth", "Orthostatic hypotension"],
        "usage": "Take once or twice daily. Lower doses used for sleep.",
        "category": "Antipsychotic",
        "created_at": new Date(),
        "updated_at": new Date()
      },
      {
        "name": "Tamsulosin",
        "dosage": "0.4 mg",
        "description": "Alpha-blocker for benign prostatic hyperplasia symptoms.",
        "sideEffects": ["Retrograde ejaculation", "Dizziness", "Orthostatic hypotension", "Rhinitis", "Headache"],
        "usage": "Take once daily 30 minutes after same meal. Do not crush or chew.",
        "category": "Alpha Blocker",
        "created_at": new Date(),
        "updated_at": new Date()
      }
    ];

    if (!hasMedications) {
      console.log('📦 Création de la collection medications...');
      // Créer la collection en insérant des données
      await mongoose.connection.collection('medications').insertMany(medicationsData);
      console.log(`✅ Collection medications créée avec ${medicationsData.length} médicaments`);
    } else {
      console.log('🔄 Mise à jour des médicaments existants...');
      
      // Vérifier combien de médicaments existent déjà
      const existingCount = await mongoose.connection.collection('medications').countDocuments();
      console.log(`📊 Nombre de médicaments existants: ${existingCount}`);
      
      // Effacer les anciens et insérer les nouveaux
      await mongoose.connection.collection('medications').deleteMany({});
      await mongoose.connection.collection('medications').insertMany(medicationsData);
      console.log(`🔄 ${existingCount} anciens médicaments remplacés par ${medicationsData.length} nouveaux`);
    }

    // Afficher un échantillon
    console.log('\n💊 Échantillon des médicaments ajoutés:');
    const sampleMedications = await mongoose.connection.collection('medications')
      .find({})
      .limit(5)
      .toArray();
    
    sampleMedications.forEach((med, index) => {
      console.log(`\n${index + 1}. ${med.name} (${med.dosage})`);
      console.log(`   Catégorie: ${med.category}`);
      console.log(`   Effets secondaires: ${med.sideEffects.slice(0, 3).join(', ')}...`);
    });

    // Afficher les statistiques finales
    const finalCount = await mongoose.connection.collection('medications').countDocuments();
    console.log(`\n📈 Total final de médicaments: ${finalCount}`);
    console.log('🎉 Script terminé avec succès!');

    await mongoose.disconnect();
    
  } catch (error: any) {
    console.error('❌ ERREUR:', error.message);
    console.error('Stack:', error.stack);
  }
}

seedMedications();