// scripts/updateDoctorsWithPassword.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function updateDoctorsWithPassword() {
  try {
    console.log('🔄 Mise à jour des médecins avec mot de passe...');
    
    // Se connecter directement sans modèle
    await mongoose.connect('mongodb+srv://firasbouzainne7_db_user:firas123@cluster0.vsrofcf.mongodb.net/medecin_intelligent?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connecté à MongoDB');

    // Vérifier la collection
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasMedecins = collections.some(col => col.name === 'medecins');
    
    if (!hasMedecins) {
      console.log('❌ La collection medecins n\'existe pas!');
      
      // Créer la collection avec des données de test
      const doctorsData = [
        {
          nom: "Ben Ammar",
          prenom: "Ahmed",
          email: "ahmed.benammar@gmail.com",
          telephone: "+216 71 123 456",
          specialite: "Cardiology",
          cin: 12345678,
          num_licence: "TUN-MD789101",
          hopital: "Hôpital La Rabta",
          departement: "Cardiologie",
          bio: "Cardiologue chef de service avec 17 year oldd'expérience.",
          adresse: {
            rue: "Rue Jebel Lakhdar, Bureau 302",
            ville: "Tunis",
            code_postal: "1007",
            pays: "Tunisia"
          },
          annees_experience: 17,
          created_at: new Date()
        },
        {
          nom: "Bouazizi",
          prenom: "Fatma",
          email: "fatma.bouazizi@gmail.com",
          telephone: "+216 73 234 567",
          specialite: "Pediatrics",
          cin: 23456789,
          num_licence: "TUN-MD234568",
          hopital: "Hôpital Charles Nicolle",
          departement: "Pédiatrie",
          bio: "Pédiatre avec 14 year oldd'expérience.",
          adresse: {
            rue: "Boulevard du 9 Avril 1938",
            ville: "Tunis",
            code_postal: "1006",
            pays: "Tunisia"
          },
          annees_experience: 14,
          created_at: new Date()
        }
      ];

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('12345678', salt);

      // Ajouter password
      const doctorsWithPassword = doctorsData.map(doctor => ({
        ...doctor,
        password: hashedPassword
      }));

      // Insérer
      await mongoose.connection.collection('medecins').insertMany(doctorsWithPassword);
      console.log('✅ Collection medecins créée avec 2 médecins');
      
    } else {
      console.log('✅ La collection medecins existe');
      
      // Vérifier le contenu
      const count = await mongoose.connection.collection('medecins').countDocuments();
      console.log(`📊 Nombre de médecins: ${count}`);
      
      // Vérifier si le champ password existe
      const sampleDoctor = await mongoose.connection.collection('medecins').findOne({});
      const hasPasswordField = sampleDoctor && 'password' in sampleDoctor;
      
      console.log(`🔍 Champ 'password' existe: ${hasPasswordField ? '✅' : '❌'}`);
      
      if (!hasPasswordField || !sampleDoctor?.password) {
        console.log('\n🔐 Ajout du champ password à tous les médecins...');
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('12345678', salt);
        
        // Mettre à jour tous les médecins
        const updateResult = await mongoose.connection.collection('medecins').updateMany(
          {},
          { $set: { password: hashedPassword } }
        );
        
        console.log(`✅ ${updateResult.modifiedCount} médecins mis à jour`);
      }
    }

    // Afficher les médecins
    console.log('\n👨‍⚕️ Liste finale des médecins:');
    const doctors = await mongoose.connection.collection('medecins').find({}).toArray();
    
    doctors.forEach((doctor, index) => {
      console.log(`\n${index + 1}. Dr. ${doctor.prenom} ${doctor.nom}`);
      console.log(`   Email: ${doctor.email}`);
      console.log(`   Password: ${doctor.password ? '✅ Présent' : '❌ Absent'}`);
      console.log(`   Password hash: ${doctor.password?.substring(0, 20)}...`);
    });

    // Tester le hash
    console.log('\n🧪 Test de vérification de mot de passe:');
    if (doctors.length > 0) {
      const testDoctor = doctors[0];
      if (testDoctor.password) {
        const isValid = await bcrypt.compare('12345678', testDoctor.password);
        console.log(`Test avec "12345678": ${isValid ? '✅ VALIDE' : '❌ INVALIDE'}`);
      }
    }

    await mongoose.disconnect();
    console.log('\n🎉 Mise à jour terminée avec succès!');
    
  } catch (error: any) {
    console.error('❌ ERREUR:', error.message);
  }
}

updateDoctorsWithPassword();