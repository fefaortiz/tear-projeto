const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const bcrypt = require('bcryptjs');
const verifyToken = require('../middleware/authMiddleware');

// ==========================================================
// Rota 1 (GET /api/cuidadores/idcuidador)
// Busca um cuidador específico pelo ID
// ==========================================================
router.get('/:idcuidador', verifyToken, async (req, res) => {
  try {
    const { idcuidador } = req.params;
    const cuidador = await db('cuidador')
      .where({ idcuidador: idcuidador })
      .first();

    return res.status(200).json(cuidador);
  } catch (error) {
    console.error('Error fetching cuidador: ', error);
    return res.status(500).json({ 
      error: 'Ocorreu um erro ao buscar o cuidador.'
    });
  }
});

// ==========================================================
// NOVO: Rota 2 (GET /api/cuidadores/lookup)
// Busca um cuidador por ID, CPF ou Email
// ==========================================================
router.get('/lookup', verifyToken, async (req, res) => {
  try {
    // 1. Pega os parâmetros da URL (ex: /lookup?cpf=123)
    const { id, cpf, email } = req.query;

    let cuidador;
    const query = db('cuidador');

    // (Presumindo colunas minúsculas: 'idcuidador', 'cpf', 'email')
    if (id) {
      query.where({ idcuidador: id });
    } else if (cpf) {
      query.where({ cpf: cpf });
    } else if (email) {
      query.where({ email: email });
    } else {
      return res.status(400).json({ 
        error: 'Parâmetro de busca (id, cpf ou email) é obrigatório.' 
      });
    }

    cuidador = await query.first();

    if (!cuidador) {
      return res.status(404).json({ error: 'Cuidador não encontrado.' });
    }

    return res.status(200).json(cuidador);

  } catch (error) {
    console.error('Erro ao buscar cuidador:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno.' });
  }
});

// ==========================================================
// NOVO: Rota 3 (GET /api/cuidadores/por-paciente/:pacienteId)
// Busca o cuidador vinculado a um paciente
// ==========================================================
router.get('/por-paciente/:pacienteId', verifyToken, async (req, res) => {
  try {
    // 1. Pega os parâmetros de busca do paciente
    const { pacienteId } = req.params;

    if (!pacienteId) {
      return res.status(400).json({ 
        error: 'Parâmetro de busca é obrigatório.' 
      });
    }

    // 2. Esta é a forma eficiente: Usamos um JOIN
    // "SELECT cuidador.* FROM cuidador
    //  JOIN paciente ON cuidador.idcuidador = paciente.idcuidador
    //  WHERE paciente.idpaciente = ? OR paciente.email = ?"
    const query = db('cuidador')
      .join('paciente', 'cuidador.idcuidador', '=', 'paciente.idcuidador')
      .select('cuidador.*');

    query.where('paciente.idpaciente', pacienteId);

    const cuidador = await query.first();

    if (!cuidador) {
      return res.status(404).json({ error: 'Cuidador não encontrado para este paciente.' });
    }

    return res.status(200).json(cuidador);

  } catch (error) {
    console.error('Erro ao buscar cuidador por paciente:', error);
    return res.status(500).json({ error: 'Ocorreu um erro interno.' });
  }
});

// ==========================================================
// NOVO: Rota PATCH /api/cuidadores/profile
// Atualiza o perfil do cuidador LOGADO
// ==========================================================
router.put('/:idcuidador', verifyToken, async (req, res) => {
  const { idcuidador } = req.params;

  const { nome, telefone, sexo, data_de_nascimento, email, senha } = req.body;

  const updateData = {};

  if (nome !== undefined) updateData.nome = nome;
  if (telefone !== undefined) updateData.telefone = telefone;
  if (sexo !== undefined) updateData.sexo = sexo;
  if (data_de_nascimento !== undefined) updateData.data_de_nascimento = data_de_nascimento;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ 
      error: 'Nenhum campo para atualizar foi fornecido.' 
    });
  }

  try {
    const [updatedCuidador] = await db.transaction(async (trx) => {
      // Passo A: Precisamos do email *antigo* antes de atualizar
      const cuidadorAtual = await trx('cuidador')
        .where({ idcuidador })
        .first();

      if (!cuidadorAtual) {
        throw new Error('Cuidador não encontrado');
      }

      // Passo B: Atualiza a tabela 'cuidador'
      const [cuidador] = await trx('cuidador')
        .where({ idcuidador })
        .update(updateData)
        .returning('*'); // Retorna o objeto completo do cuidador atualizado

      return [cuidador]; // Finaliza e retorna o terapeuta
    });

    res.status(200).json({
      message: "Perfil atualizado com sucesso.",
      cuidador: updatedCuidador
    });

  } catch (error) {
    console.error('Erro ao atualizar cuidador:', error);
    
    // Erro comum: o novo email já existe no banco
    if (error.code === '23505') {
      return res.status(409).json({ error: 'O email fornecido já está em uso.' });
    }

    if (error.message === 'Cuidador não encontrado') {
        return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: 'Ocorreu um erro interno ao atualizar o perfil.' });
  }
});

// ==========================================================
// NOVO: Rota DELETE /api/cuidadores/:idcuidador
// Deleta um cuidador específico pelo ID
// ==========================================================
router.delete('/:idcuidador', verifyToken, async (req, res) => {
  try {
    // 1. Pega o ID dos parâmetros da rota (ex: /api/cuidadores/123)
    const { idcuidador } = req.params;

    // 2. Executa a deleção no banco de dados
    // O .delete() retorna o número de linhas afetadas
    const deletedCount = await db('cuidador')
      .where({ idcuidador: idcuidador })
      .delete();

    // 3. Verifica se o cuidador foi encontrado e deletado
    if (deletedCount === 0) {
      // Se nenhuma linha foi afetada, o cuidador com esse ID não existe
      return res.status(404).json({ error: 'Cuidador não encontrado.' });
    }

    // 4. Retorna sucesso
    // (O status 200 com mensagem é bom, ou 204 No Content sem corpo)
    return res.status(200).json({ 
      message: 'Cuidador deletado com sucesso.' 
    });

  } catch (error) {
    console.error('Erro ao deletar cuidador:', error);

    // 5. [IMPORTANTE] Tratar erros de chave estrangeira (Foreign Key)
    // Se o cuidador estiver vinculado a outras tabelas (ex: sessões),
    // o banco de dados pode impedir a deleção.
    // O código '23503' é padrão do PostgreSQL para "foreign_key_violation".
    if (error.code === '23503') {
      return res.status(409).json({ // 409 Conflict
        error: 'Este cuidador não pode ser deletado pois está associado a outros registros.' 
      });
    }

    return res.status(500).json({ 
      error: 'Ocorreu um erro interno ao tentar deletar o cuidador.' 
    });
  }
});

module.exports = router;