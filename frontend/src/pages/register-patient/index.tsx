// src/pages/register-patient/index.tsx
import React, { useState, useEffect} from 'react';
import { formatCPF, formatPhone } from '../../utils/masking';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate
import './style.css'; // Crie este CSS

interface Therapist {
  IDTerapeuta: number;
  Nome: string;
}

interface Caregiver {
  IDCuidador: number;
  Nome: string;
}

function RegisterPatientPage() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState(''); // CPF é opcional aqui
  const [telefone, setTelefone] = useState('');
  const [sexo, setSexo] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [therapists, setTherapists] = useState<Therapist[]>([]); // Lista de terapeutas
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]); // Lista de cuidadores
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>(''); // ID do terapeuta selecionado
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string>(''); // ID do cuidador selecionado
  const [loading, setLoading] = useState<boolean>(true); // Estado de carregamento (opcional)
  const [error, setError] = useState<string | null>(null); // Estado de erro (opcional)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    // Simula a chamada à API para buscar terapeutas e cuidadores
    // Dentro do useEffect, substitua a simulação por algo assim:
    const fetchDropdownData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Faz as chamadas em paralelo
        const [therapistResponse, caregiverResponse] = await Promise.all([
          fetch('http://localhost:3333/therapists'), // Ajuste a URL base se necessário
          fetch('http://localhost:3333/caregivers')
        ]);

        if (!therapistResponse.ok || !caregiverResponse.ok) {
          throw new Error('Falha ao buscar dados dos dropdowns');
        }

        const therapistsData: Therapist[] = await therapistResponse.json();
        const caregiversData: Caregiver[] = await caregiverResponse.json();

        setTherapists(therapistsData);
        setCaregivers(caregiversData);

      } catch (err: any) {
        console.error("Erro ao buscar dados:", err);
        setError("Não foi possível carregar terapeutas e cuidadores. Tente recarregar a página.");
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownData();

  }, []); 

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatPhone(e.target.value));
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Impede o recarregamento padrão da página
    setIsSubmitting(true); // Indica que o envio começou
    setSubmitError(null); // Limpa erros anteriores

    // Prepara os dados para envio
    const therapistId = selectedTherapistId ? parseInt(selectedTherapistId, 10) : null;
    const caregiverId = selectedCaregiverId ? parseInt(selectedCaregiverId, 10) : null;

    const patientData = {
      nome,
      // Envia CPF apenas se houver algum dígito, senão envia null
      cpf: cpf.replace(/\D/g, '') || null,
      // Envia telefone apenas se houver algum dígito, senão envia null
      telefone: telefone.replace(/\D/g, '') || null,
      sexo: sexo || null, // Garante null se não selecionado
      dataNascimento: dataNascimento || null, // Garante null se vazio
      email,
      senha, // A senha será hasheada no backend
      IDTerapeuta: therapistId,
      IDCuidador: caregiverId,
    };

    console.log('Enviando dados do paciente:', patientData); // Para debug

    try {
      const response = await fetch('http://localhost:3333/register/patient', { // URL da sua API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      const responseData = await response.json(); // Tenta parsear JSON mesmo em erro

      if (!response.ok) {
        // Se a resposta não for OK (status 4xx ou 5xx)
        throw new Error(responseData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      // Sucesso!
      console.log('Cadastro de Paciente realizado:', responseData);
      alert('Paciente cadastrado com sucesso! ID: ' + responseData.id);

      // Opcional: Redirecionar para login após sucesso
      navigate('/login'); // Ou para outra página de sucesso/dashboard

    } catch (error: any) {
      console.error('Erro ao cadastrar paciente:', error);
      // Define a mensagem de erro para exibir ao usuário
      setSubmitError(error.message || 'Ocorreu um erro desconhecido.');
      // alert('Erro ao cadastrar: ' + error.message); // Pode remover o alert se usar o estado submitError
    } finally {
      setIsSubmitting(false); // Indica que o envio terminou (sucesso ou falha)
    }
  };

return (
    <div className="register-container">
      <h2>Cadastro de Paciente</h2>
      <form onSubmit={handleSubmit}>
        {/* Campos existentes... */}
        <div>
          <label htmlFor="nome">Nome Completo:</label>
          <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="senha">Senha:</label>
          <input type="password" id="senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="cpf">CPF (Opcional):</label>
          <input type="text" id="cpf" value={cpf} onChange={handleCpfChange} placeholder="000.000.000-00" maxLength={14} />
        </div>
        <div>
          <label htmlFor="telefone">Telefone:</label>
          <input type="tel" id="telefone" value={telefone} onChange={handleTelefoneChange} placeholder="(00) 00000-0000" maxLength={15} />
        </div>
        <div>
          <label htmlFor="dataNascimento">Data de Nascimento:</label>
          <input type="date" id="dataNascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
        </div>
        <div>
          <label htmlFor="sexo">Sexo:</label>
          <select id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value)}>
            <option value="">Selecione...</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
            <option value="PrefiroNaoInformar">Prefiro não informar</option>
          </select>
        </div>

        {/* --- NOVOS Dropdowns --- */}
        {loading && <p>Carregando terapeutas e cuidadores...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && (
          <>
            <div>
              <label htmlFor="terapeuta">Terapeuta Responsável (Opcional):</label>
              <select
                id="terapeuta"
                value={selectedTherapistId}
                onChange={(e) => setSelectedTherapistId(e.target.value)}
              >
                <option value="">Nenhum</option>
                {therapists.map((therapist) => (
                  <option key={therapist.IDTerapeuta} value={therapist.IDTerapeuta}>
                    {therapist.Nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cuidador">Cuidador Associado (Opcional):</label>
              <select
                id="cuidador"
                value={selectedCaregiverId}
                onChange={(e) => setSelectedCaregiverId(e.target.value)}
              >
                <option value="">Nenhum</option>
                {caregivers.map((caregiver) => (
                  <option key={caregiver.IDCuidador} value={caregiver.IDCuidador}>
                    {caregiver.Nome}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        {submitError && <p style={{ color: 'red', marginTop: '10px' }}>Erro: {submitError}</p>}

        <button type="submit" disabled={loading || isSubmitting}> {/* Desabilita botão */}
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar'} {/* Muda texto do botão */}
        </button>
      </form>
    </div>
  );
  // --- Fim JSX ATUALIZADO ---
}

export default RegisterPatientPage;