/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deleta TODAS as entradas existentes para começar do zero
  await knex('terapeuta').del();
  
  // Insere novos terapeutas
  await knex('terapeuta').insert([
    { 
      nome: 'Dra. Ana Silva', 
      email: 'ana.silva@example.com', 
      cpf: '111.222.333-44',
      telefone: '(11) 98765-4321',
      crp_crm: 'CRP 06/12345',
      sexo: 'Feminino',
      data_de_nascimento: '1985-05-20 00:00:00',
      // IMPORTANTE: Em uma aplicação real, a senha deve ser "hasheada" com uma biblioteca como bcrypt.
      senha: 'senhaforte123'
    },
    { 
      nome: 'Dr. Carlos Pereira', 
      email: 'carlos.pereira@example.com', 
      cpf: '555.666.777-88',
      telefone: '(21) 99876-5432',
      crp_crm: 'CRM 52-98765-1',
      sexo: 'Masculino',
      data_de_nascimento: '1978-11-15 00:00:00',
      // IMPORTANTE: Em uma aplicação real, a senha deve ser "hasheada" com uma biblioteca como bcrypt.
      senha: 'outrasenha987'
    }
  ]);
};