// backend/src/database/connection.js
const knex = require('knex');
const configuration = require('../../knexfile');

// Usamos a configuração de 'development' do nosso knexfile
const connection = knex(configuration.development);

module.exports = connection;

// Terapeuta
// Cuidador
// Paciente
// Recomendacao
// Traits
// Tracking
