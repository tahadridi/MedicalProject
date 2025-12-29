import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="py-16 px-6 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT SIDE - Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <i className="fas fa-shield-alt text-cyan-400 mr-2"></i>
                <span className="text-sm text-cyan-300">Plateforme Médicale Sécurisée</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                Votre Centre de Santé
                <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Numérique Complet
                </span>
              </h1>
              
              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                Accédez à la télémédecine, gérez vos traitements, suivez vos données de santé 
                et obtenez des insights IA — le tout dans une plateforme sécurisée et privée.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
               
                className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 flex items-center space-x-3"
              >
                <i className="fas fa-robot text-xl"></i>
                <span>Diagnostic IA Gratuit</span>
              </button>
              
              <button
                onClick={() => router.push('/register')}
                className="px-8 py-3.5 border-2 border-cyan-500/30 text-cyan-300 rounded-xl font-semibold text-lg hover:bg-cyan-500/10 transition-all duration-300 flex items-center space-x-3"
              >
                <i className="fas fa-user-plus"></i>
                <span>Créer un Compte</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              {[
                { icon: 'fa-user-md', value: '200+', label: 'Médecins', color: 'cyan' },
                { icon: 'fa-heartbeat', value: '50k+', label: 'Patients', color: 'blue' },
                { icon: 'fa-clock', value: '24/7', label: 'Disponible', color: 'emerald' },
                { icon: 'fa-shield-alt', value: '100%', label: 'Sécurisé', color: 'purple' },
              ].map((stat, index) => (
                <div key={index} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                  <div className={`w-12 h-12 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center mx-auto mb-3`}>
                    <i className={`fas ${stat.icon} text-${stat.color}-400 text-xl`}></i>
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE - Image */}
          <div className="relative">
            {/* Main Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20"></div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 blur-2xl"></div>
              
              {/* Doctor Illustration Container */}
              <div className="relative z-10 p-8">
                <div className="relative h-[400px] rounded-xl overflow-hidden">
                  {/* This would be your doctor image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-user-md text-white text-6xl"></i>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Consultation Médicale</h3>
                      <p className="text-slate-300 mt-2">En ligne ou en personne</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -left-6 top-1/4 w-64 bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 border border-slate-800 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <i className="fas fa-calendar-check text-emerald-400"></i>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Rendez-vous</div>
                  <div className="font-semibold text-white">Disponible aujourd'hui</div>
                </div>
              </div>
            </div>

            <div className="absolute -right-6 bottom-1/4 w-64 bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 border border-slate-800 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <i className="fas fa-comment-medical text-purple-400"></i>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Chat médical</div>
                  <div className="font-semibold text-white">24h/24, 7j/7</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}