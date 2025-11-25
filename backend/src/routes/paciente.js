const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const bcrypt = require('bcryptjs');
const verifyToken = require('../middleware/authMiddleware');

// GET route to fetch all pacientes
// O caminho é '/', pois o prefixo /api/paciente será definido no server.js
router.get('/', verifyToken, async (req, res) => {
  try {
    const pacientes = await db('paciente').select('*');
    return res.status(200).json(pacientes);
  } catch (error) {
    console.error('Error fetching pacientes:', error);
    return res.status(500).json({ 
      error: 'Ocorreu um erro ao buscar os pacientes.' 
    });
  }
});

// ==========================================================
// NOVO: Rota 2 (GET /api/pacientes/lookup)
// Busca um paciente por ID, CPF ou Email
// ==========================================================
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    let paciente;
    const query = db('paciente');

    // (Presumindo colunas minúsculas: 'idpaciente', 'cpf', 'email')
    if (id) {
      query.where({ idpaciente: id });
    } else {
      return res.status(400).json({ 
        error: 'Paciente não encontrado.' 
      });
    }

    paciente = await query.first();

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }

    return res.status(200).json(paciente);

  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno.' });
  }
});

// ==========================================================
// Rota 3 (GET /api/pacientes/por-terapeuta)
// Busca os pacientes vinculados a um terapeuta
// ==========================================================
router.get('/por-terapeuta', verifyToken, async (req, res) => {
  try {
    const { id_terapeuta, email_terapeuta, cpf_terapeuta } = req.query;

    if (!id_terapeuta && !email_terapeuta && !cpf_terapeuta) {
      return res.status(400).json({ 
        error: 'Parâmetro de busca (id_terapeuta, email_terapeuta ou cpf_terapeuta) é obrigatório.' 
      });
    }

    // 2. Esta é a forma eficiente: Usamos um JOIN    
    // "SELECT paciente.* FROM paciente
    //  JOIN terapeuta ON paciente.idterapeuta = terapeuta.idterapeuta
    //  WHERE terapeuta.idterapeuta = ? OR terapeuta.email = ? OR terapeuta.cpf = ?"
    
    const query = db('paciente') // Começamos selecionando da tabela 'paciente'
      .join('terapeuta', 'paciente.idterapeuta', '=', 'terapeuta.idterapeuta')
      .select('paciente.*'); // Queremos os dados dos pacientes

    // 3. Aplicamos os filtros baseados nos dados do TERAPEUTA
    if (id_terapeuta) {
      query.where('terapeuta.idterapeuta', id_terapeuta);
    } else if (email_terapeuta) {
      query.where('terapeuta.email', email_terapeuta);
    } else if (cpf_terapeuta) {
      query.where('terapeuta.cpf', cpf_terapeuta);
    }

    const pacientes = await query;

    return res.status(200).json(pacientes);

  } catch (error) {
    // Atualizamos a mensagem de erro para refletir a ação correta
    console.error('Erro ao buscar pacientes por terapeuta:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno.' });
  }
});

// ==========================================================
// CORRIGIDO: Rota 3 (GET /api/pacientes/por-cuidador)
// Busca os pacientes vinculados a um cuidador
// ==========================================================
router.get('/por-cuidador', verifyToken, async (req, res) => {
  try {
    const { id_cuidador, email_cuidador, cpf_cuidador } = req.query;

    if (!id_cuidador && !email_cuidador && !cpf_cuidador) {
      return res.status(400).json({ 
        error: 'Parâmetro de busca (id_cuidador, email_cuidador ou cpf_cuidador) é obrigatório.' 
      });
    }

    // 2. Esta é a forma eficiente: Usamos um JOIN
    // "SELECT paciente.* FROM paciente
    //  JOIN cuidador ON paciente.idcuidador = cuidador.idcuidador
    //  WHERE cuidador.idcuidador = ? OR cuidador.email = ? OR cuidador.cpf = ?"
    
    const query = db('paciente') // Começamos selecionando da tabela 'paciente'
      .join('cuidador', 'paciente.idcuidador', '=', 'cuidador.idcuidador')
      .select('paciente.*'); // Queremos os dados dos pacientes

    // 3. Aplicamos os filtros baseados nos dados do TERAPEUTA
    if (id_cuidador) {
      query.where('cuidador.idcuidador', id_cuidador);
    } else if (email_cuidador) {
      query.where('cuidador.email', email_cuidador);
    } else if (cpf_cuidador) {
      query.where('cuidador.cpf', cpf_cuidador);
    }

    const pacientes = await query;

    return res.status(200).json(pacientes);

  } catch (error) {
    // Atualizamos a mensagem de erro para refletir a ação correta
    console.error('Erro ao buscar pacientes por cuidador:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno.' });
  }
});

// ==========================================================
// NOVO: Rota PUT /api/pacientes/:idpaciente
// Atualiza o perfil do paciente LOGADO
// ==========================================================
router.put('/:idpaciente', async (req, res) => {
  const { idpaciente } = req.params;

  const { nome, telefone, sexo, data_de_nascimento } = req.body;

  const updateData = {};

  if (nome !== undefined) updateData.nome = nome;
  if (telefone !== undefined) updateData.telefone = telefone;
  if (sexo !== undefined) updateData.sexo = sexo;
  if (data_de_nascimento !== undefined) updateData.data_de_nascimento = data_de_nascimento;

  try {
    const [updatedPaciente] = await db.transaction(async (trx) => {
      const pacienteAtual = await trx('paciente')
        .where({ idpaciente })
        .first();

      if (!pacienteAtual) {
        throw new Error('Paciente não encontrado');
      }

      // Passo B: Atualiza a tabela 'paciente'
      const [paciente] = await trx('paciente')
        .where({ idpaciente })
        .update(updateData)
        .returning('*'); // Retorna o objeto completo do paciente atualizado

      return [paciente]; // Finaliza e retorna o paciente
    });

    res.status(200).json({
      message: "Perfil atualizado com sucesso.",
      paciente: updatedPaciente
    });

  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    
    // Erro comum: o novo email já existe no banco
    if (error.code === '23505') {
      return res.status(409).json({ error: 'O email fornecido já está em uso.' });
    }

    if (error.message === 'Paciente não encontrado') {
        return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: 'Ocorreu um erro interno ao atualizar o perfil.' });
  }
});

// ==========================================================
// NOVO: Rota DELETE /api/pacientes/:idpaciente
// Deleta um paciente específico pelo ID
// ==========================================================
router.delete('/:idpaciente', verifyToken, async (req, res) => {
  try {
    // 1. Pega o ID dos parâmetros da rota (ex: /api/pacientes/123)
    const { idpaciente } = req.params;

    // 2. Executa a deleção no banco de dados
    // O .delete() retorna o número de linhas afetadas
    const deletedCount = await db('paciente')
      .where({ idpaciente: idpaciente })
      .delete();

    // 3. Verifica se o paciente foi encontrado e deletado
    if (deletedCount === 0) {
      // Se nenhuma linha foi afetada, o paciente com esse ID não existe
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }

    // 4. Retorna sucesso
    // (O status 200 com mensagem é bom, ou 204 No Content sem corpo)
    return res.status(200).json({ 
      message: 'Paciente deletado com sucesso.' 
    });

  } catch (error) {
    console.error('Erro ao deletar paciente:', error);

    // 5. [IMPORTANTE] Tratar erros de chave estrangeira (Foreign Key)
    // Se o paciente estiver vinculado a outras tabelas (ex: sessões),
    // o banco de dados pode impedir a deleção.
    // O código '23503' é padrão do PostgreSQL para "foreign_key_violation".
    if (error.code === '23503') {
      return res.status(409).json({ // 409 Conflict
        error: 'Este paciente não pode ser deletado pois está associado a outros registros.' 
      });
    }

    return res.status(500).json({ 
      error: 'Ocorreu um erro interno ao tentar deletar o paciente.' 
    });
  }
});

module.exports = router;