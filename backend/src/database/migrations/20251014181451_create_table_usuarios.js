/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('terapeuta', (table) => {
    table.increments('idterapeuta').primary(); // Chave primária auto-increment
    table.string('nome', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('cpf', 20).notNullable().unique();
    table.string('telefone', 20);
    table.string('crp_crm', 50).notNullable().unique();
    table.string('sexo', 20);
    table.dateTime('data_de_nascimento');
    table.string('senha', 255).notNullable();
    table.timestamps(true, true); // Cria 'created_at' e 'updated_at'
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // DOWN: Deleta a tabela (o inverso do 'up')
  return knex.schema.dropTable('Terapeuta');
};