/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('UsuarioBeta', (table) => {
    table.increments('IDTerapeuta').primary(); // Chave primária auto-increment
    table.string('Nome', 255).notNullable();
    table.string('Email', 255).notNullable().unique();
    table.string('CPF', 20).notNullable().unique();
    table.string('Telefone', 20);
    table.string('CRP_CRM', 50).notNullable().unique();
    table.string('Sexo', 20);
    table.dateTime('Data_de_Nascimento');
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
  return knex.schema.dropTable('UsuarioBeta');
};

