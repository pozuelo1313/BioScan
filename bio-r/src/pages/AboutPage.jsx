import React from 'react';
import "../App.css";


const AboutPage = () => {
  const features = [
    {
      title: "Tecnología Avanzada",
      description: "Identificación precisa de especies vegetales mediante algoritmos de IA de última generación.",
      icon: "🔍"
    },
    {
      title: "Catálogo Extenso",
      description: "Biblioteca con miles de especies de plantas, actualizada constantemente por expertos botánicos.",
      icon: "📚"
    },
    {
      title: "Accesibilidad Global",
      description: "Plataforma multilingüe disponible en cualquier dispositivo, en cualquier momento.",
      icon: "🌍"
    },
    {
      title: "Educación Ambiental",
      description: "Compromiso con la difusión del conocimiento sobre biodiversidad y conservación.",
      icon: "🎓"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-700">
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-emerald-50 mb-6">
            Descubre <span className="text-emerald-300">BioScan</span>
          </h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto">
            La plataforma que revoluciona la identificación de especies vegetales
            combinando la pasión por la naturaleza con tecnología de vanguardia.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-emerald-800/50 p-8 rounded-lg backdrop-blur-sm">
            <h2 className="text-3xl font-semibold text-emerald-200 mb-4">
              Nuestra Misión
            </h2>
            <p className="text-emerald-100 leading-relaxed">
              En BioScan, nos dedicamos a hacer que el conocimiento botánico sea
              accesible para todos. Nuestra plataforma combina la precisión de la
              inteligencia artificial con una interfaz intuitiva, permitiendo a
              cualquier persona identificar y aprender sobre el mundo vegetal que
              nos rodea.
            </p>
          </div>

          <div className="bg-emerald-800/50 p-8 rounded-lg backdrop-blur-sm">
            <h2 className="text-3xl font-semibold text-emerald-200 mb-4">
              ¿Por qué BioScan?
            </h2>
            <p className="text-emerald-100 leading-relaxed">
              Nos destacamos por nuestra tecnología de reconocimiento precisa,
              nuestra extensa base de datos y nuestro compromiso con la educación
              ambiental. Cada identificación no solo proporciona el nombre de la
              especie, sino también información detallada sobre su hábitat,
              cuidados y rol en el ecosistema.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-emerald-800/30 border border-emerald-600 rounded-lg p-6 hover:bg-emerald-800/40 transition-colors duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-emerald-200 mb-2">
                {feature.title}
              </h3>
              <p className="text-emerald-100 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300">
            Comienza tu viaje botánico
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;