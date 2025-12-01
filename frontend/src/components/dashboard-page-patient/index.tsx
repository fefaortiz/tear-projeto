import MediaSemanalCard from '../../components/MediaSemanalCard';

export function DashboardPagePatient() {
const idDoUsuarioLogado = 1; 

return (
  <div className="p-8 bg-gray-50 min-h-screen">
    <h1 className="text-2xl font-bold mb-6 text-indigo-900">Seu Bem-Estar</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* Aqui entra o card que acabamos de criar */}
      <MediaSemanalCard pacienteId={idDoUsuarioLogado} />
      
      {/* Futuros cards (Porcentagem > 3, Gráficos, etc) virão aqui */}
      
    </div>
  </div>
);  
}