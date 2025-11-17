import React from 'react';
import { 
  HeartPulse, 
  Users, 
  Briefcase, 
  Smile, 
  MessageSquare, 
  BarChart3, 
  CalendarDays, 
  ShieldCheck,
  Frown,
  ArrowRight
} from 'lucide-react';
import Header from '../../components/header.tsx'
import DatavizPage from '../dataviz/index.tsx';


const Hero = () => (
  <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden">
    <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
      {/* Coluna da Esquerda: Texto */}
      <div className="text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-bold text-indigo-900 leading-tight">
          A ponte de comunicação para o <span className="text-violet-600">cuidado no autismo</span>.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-indigo-700 max-w-lg mx-auto md:mx-0">
          Conecte pessoas autistas, cuidadores e terapeutas em um só lugar. Uma plataforma simples para registrar emoções, rotinas e tiques.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <button className="bg-violet-500 text-white font-bold py-3 px-8 rounded-full shadow-xl text-lg transition-all hover:scale-105 hover:bg-violet-600 flex items-center justify-center gap-2">
            Comece Gratuitamente
            <ArrowRight size={20} />
          </button>
          <button className="bg-white text-indigo-800 font-bold py-3 px-8 rounded-full shadow-lg transition-all hover:scale-105 hover:bg-slate-100">
            Sou Profissional
          </button>
        </div>
      </div>
      
      {/* Coluna da Direita: Visual "Soft" */}
      <div className="relative hidden md:block">
        {/* Usamos formas orgânicas (círculos) e as cores da paleta para criar a vibe */}
        <div className="absolute w-64 h-64 bg-violet-200 rounded-full opacity-50 -top-10 -left-10" />
        <div className="absolute w-80 h-80 bg-blue-100 rounded-full opacity-60 top-10 right-0" />
        <div className="absolute w-48 h-48 bg-emerald-100 rounded-full bottom-0 left-20" />
        
        {/* Placeholder de um "card" flutuando */}
        <div className="relative z-10 bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 rotate-3">
          <div className="flex items-center gap-4">
            <Smile size={40} className="text-emerald-500" />
            <div>
              <h4 className="font-bold text-lg text-indigo-900">Humor Registrado</h4>
              <p className="text-indigo-700">Sentindo-se calmo hoje.</p>
            </div>
          </div>
          <div className="w-full h-2 bg-emerald-200 rounded-full mt-4" />
        </div>
         <div className="relative z-10 bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-6 -ml-12 mt-8 -rotate-2">
          <div className="flex items-center gap-4">
            <HeartPulse size={32} className="text-violet-500" />
            <h4 className="font-bold text-lg text-indigo-900">Rotina OK</h4>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Problem = () => (
  <section id="problema" className="py-24 bg-white">
    <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
      <div className="flex justify-center">
        <Frown size={120} className="text-violet-200" strokeWidth={1.5} />
      </div>
      <div className="text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-bold text-indigo-900">
          A informação não pode se perder entre a casa e o consultório.
        </h2>
        <p className="mt-6 text-lg text-indigo-800">
          "Como foi a semana?" Muitas vezes, essa pergunta simples é difícil de responder. Detalhes cruciais sobre o bem-estar da pessoa autista acabam esquecidos ou mal comunicados.
        </p>
         <p className="mt-4 text-lg text-indigo-800">
          Cuidadores se sentem sobrecarregados, e terapeutas precisam de dados claros para um plano de ação mais eficaz.
        </p>
      </div>
    </div>
  </section>
);

const Solution = () => (
  <section id="solucao" className="py-24">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-4xl font-bold text-indigo-900 text-center mb-16">
        Uma plataforma, três pilares de apoio
      </h2>
      <div className="grid md:grid-cols-3 gap-10">
        {/* Card 1: Paciente */}
        <div className="bg-white rounded-3xl shadow-xl p-8 transform transition-transform hover:-translate-y-2">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
            <Smile size={32} className="text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-indigo-900 mb-4">Para a Pessoa Autista</h3>
          <p className="text-indigo-700 text-base">
            Um Diário de Bem-Estar visual e simples. Uma interface limpa para registrar humor, sensações e eventos do dia, sem sobrecarga de informação.
          </p>
        </div>
        {/* Card 2: Cuidadores */}
        <div className="bg-white rounded-3xl shadow-xl p-8 transform transition-transform hover:-translate-y-2">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
            <Users size={32} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-indigo-900 mb-4">Para Cuidadores</h3>
          <p className="text-indigo-700 text-base">
            Anote observações, monitore a frequência de tiques e tenha um histórico consolidado. Compartilhe informações de forma segura e direta com o terapeuta.
          </p>
        </div>
        {/* Card 3: Terapeutas */}
        <div className="bg-white rounded-3xl shadow-xl p-8 transform transition-transform hover:-translate-y-2">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
            <Briefcase size={32} className="text-violet-600" />
          </div>
          <h3 className="text-2xl font-bold text-indigo-900 mb-4">Para Terapeutas</h3>
          <p className="text-indigo-700 text-base">
            Receba relatórios objetivos e gráficos de padrão antes da sessão. Identifique gatilhos e personalize a terapia com base em dados reais.
          </p>
        </div>
      </div>
    </div>
  </section>
);

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  color?: 'violet' | 'emerald' | 'blue' | 'amber';
}

const FeatureItem = ({ icon, title, children, color = 'violet' }: FeatureItemProps) => {
  const colors = {
    violet: "bg-violet-100 text-violet-600",
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
  };
  return (
    <div className="flex items-start gap-4">
      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${colors[color] || colors.violet}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-indigo-900 mb-2">{title}</h3>
        <p className="text-indigo-700">{children}</p>
      </div>
    </div>
  );
};

const Features = () => (
  <section id="features" className="py-24 bg-white">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-4xl font-bold text-indigo-900 text-center mb-16">
        Ferramentas pensadas para <br /> o ecossistema autista
      </h2>
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-12">
        <FeatureItem icon={<HeartPulse size={24} />} title="Mood Tracker Visual" color="emerald">
          Registro de humor com escalas visuais e ícones adaptáveis, desenhado para ser simples e rápido.
        </FeatureItem>
        <FeatureItem icon={<CalendarDays size={24} />} title="Rastreador de Rotina" color="blue">
          Monitore a frequência de tiques, estereotipias, qualidade do sono ou eventos que possam ser gatilhos.
        </FeatureItem>
        <FeatureItem icon={<MessageSquare size={24} />} title="Comunicação Segura" color="violet">
          Um canal direto e sigiloso entre cuidador e terapeuta para atualizações rápidas e compartilhamento de arquivos.
        </FeatureItem>
        <FeatureItem icon={<BarChart3 size={24} />} title="Relatórios Inteligentes" color="amber">
          Gráficos simples que mostram a evolução e os padrões ao longo das semanas, facilitando a visualização dos dados.
        </FeatureItem>
        <FeatureItem icon={<ShieldCheck size={24} />} title="Privacidade em Primeiro Lugar" color="violet">
          Todos os dados são criptografados e seguem as normas da LGPD. O controle é 100% seu.
        </FeatureItem>
      </div>
    </div>
  </section>
);

// --- Componente: Mission (Nossa Missão) ---
const Mission = () => (
  <section id="missao" className="py-24">
    <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-indigo-900">
          Nossa Missão
        </h2>
        <p className="mt-6 text-lg text-indigo-800">
          O <strong>TEAR</strong> nasceu como um projeto acadêmico com o objetivo de usar a tecnologia para criar pontes reais.
        </p>
         <p className="mt-4 text-lg text-indigo-800">
          Acreditamos que um cuidado integrado e baseado em dados pode transformar a qualidade de vida de pessoas no espectro autista e suas redes de apoio.
        </p>
      </div>
      {/* Selo de Credibilidade Fictício */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border-l-8 border-violet-400">
        <p className="text-lg italic text-indigo-800 leading-relaxed">
          "Desenvolvido com a consultoria de terapeutas ocupacionais e psicólogos especializados em autismo."
        </p>
        <p className="mt-4 font-bold text-indigo-900">
          Equipe do Projeto TEAR
        </p>
      </div>
    </div>
  </section>
);

// --- Componente: CTA (Chamada Final) ---
const CTA = () => (
  <section className="py-24">
    <div className="max-w-5xl mx-auto px-6">
      {/* O card com gradiente dá o toque "moderno" */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-800 text-white rounded-3xl shadow-2xl text-center p-12 md:p-20">
        <h2 className="text-4xl font-bold">
          Comece a construir essa ponte hoje.
        </h2>
        <p className="text-xl text-violet-100 mt-4 max-w-lg mx-auto">
          Junte-se à plataforma e transforme a maneira como o cuidado é compartilhado.
        </p>
        <button className="bg-white text-indigo-900 font-bold py-3 px-10 rounded-full shadow-xl text-lg mt-10 transition-transform hover:scale-105">
          Quero começar gratuitamente
        </button>
      </div>
    </div>
  </section>
);

// --- Componente: Footer (Rodapé) ---
const Footer = () => (
  <footer className="py-16 text-center">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-2xl font-bold text-indigo-900 mb-6">
        <span className="text-violet-500">TEAR</span>
      </div>
      <div className="flex justify-center gap-6 mb-8 text-indigo-700 font-medium">
        <a href="#" className="hover:text-violet-500">Privacidade</a>
        <a href="#" className="hover:text-violet-500">Termos de Uso</a>
        <a href="#" className="hover:text-violet-500">Contato</a>
      </div>
      <p className="text-indigo-600">
        © 2025 TEAR - Um Projeto Acadêmico Fictício.
      </p>
    </div>
  </footer>
);

// --- Componente Principal: App ---
export default function LandingPage() {
  return (
    // O estilo de "grain/noise" é aplicado aqui
    <div 
      className="bg-slate-50 text-indigo-900 font-sans antialiased"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'10\' viewBox=\'0 0 10 10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")'
      }}
    >
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <DatavizPage />
        <Features />
        <Mission />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
