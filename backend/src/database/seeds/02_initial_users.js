const bcrypt = require('bcryptjs'); // Import the hashing library

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('terapeuta').del();

  // 1. Generate a "salt" for hashing
  const salt = await bcrypt.genSalt(10);

  // 2. Hash the plain text passwords
  const hashedSenha1 = await bcrypt.hash('senhaforte123', salt);
  const hashedSenha2 = await bcrypt.hash('outrasenha987', salt);
  
  // 3. Insert the users with the HASHED passwords
  await knex('terapeuta').insert([
    { 
      nome: 'Dra. Ana Silva', 
      email: 'ana.silva@example.com', 
      cpf: '111.222.333-44',
      telefone: '(11) 98765-4321',
      crp_crm: 'CRP 06/12345',
      sexo: 'Feminino',
      data_de_nascimento: '1985-05-20 00:00:00',
      senha: hashedSenha1 // Use the hashed password here
    },
    { 
      nome: 'Dr. Carlos Pereira', 
      email: 'carlos.pereira@example.com', 
      cpf: '555.666.777-88',
      telefone: '(21) 99876-5432',
      crp_crm: 'CRM 52-98765-1',
      sexo: 'Masculino',
      data_de_nascimento: '1978-11-15 00:00:00',
      senha: hashedSenha2
    }
  ]);
};