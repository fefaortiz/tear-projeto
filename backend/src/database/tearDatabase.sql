-- Tabela para armazenar os dados dos terapeutas.
CREATE TABLE Terapeuta (
    IDTerapeuta SERIAL PRIMARY KEY,
    Nome VARCHAR(255) NOT NULL,
    CPF VARCHAR(20) UNIQUE NOT NULL,
    Telefone VARCHAR(20),
    CRP_CRM VARCHAR(50) NOT NULL,
    Sexo VARCHAR(20),
    Data_de_Nascimento DATE,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Senha VARCHAR(255) NOT NULL
);

-- Tabela para armazenar os dados dos cuidadores.
CREATE TABLE Cuidador (
    IDCuidador SERIAL PRIMARY KEY,
    Nome VARCHAR(255) NOT NULL,
    CPF VARCHAR(20) UNIQUE NOT NULL,
    Telefone VARCHAR(20),
    Sexo VARCHAR(20),
    Data_de_Nascimento DATE,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Senha VARCHAR(255) NOT NULL
);

-- Tabela central para armazenar os dados dos pacientes.
-- Ela se relaciona com Terapeuta e Cuidador.
CREATE TABLE Paciente (
    IDPaciente SERIAL PRIMARY KEY,
    Nome VARCHAR(255) NOT NULL,
    CPF VARCHAR(20) UNIQUE,
    Telefone VARCHAR(255),
    Sexo VARCHAR(20),
    Data_de_Nascimento DATE,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Senha VARCHAR(255) NOT NULL,
    IDTerapeuta INT,
    IDCuidador INT,
    EmailTerapeuta VARCHAR(255) NOT NULL,
    EmailCuidador VARCHAR(255) NOT NULL,
    FOREIGN KEY (IDTerapeuta) REFERENCES Terapeuta(IDTerapeuta) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (IDCuidador) REFERENCES Cuidador(IDCuidador) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Tabela para armazenar as recomendações associadas a cada paciente.
CREATE TABLE Recomendacao (
    IDRecomendacao SERIAL PRIMARY KEY,
    Nome VARCHAR(255) NOT NULL,
    Descricao TEXT,
    Data_da_Criacao DATE NOT NULL,
    IDPaciente INT NOT NULL,
    FOREIGN KEY (IDPaciente) REFERENCES Paciente(IDPaciente) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela para armazenar as características (traits) de um paciente.
CREATE TABLE Traits (
    IDTraits SERIAL PRIMARY KEY,
    Nome VARCHAR(255) NOT NULL,
    Descricao TEXT,
    Intensidade INT,
    Data_de_Criacao DATE NOT NULL,
    IDPaciente INT NOT NULL,
    FOREIGN KEY (IDPaciente) REFERENCES Paciente(IDPaciente) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela para rastrear a evolução de uma característica (trait) ao longo do tempo.
CREATE TABLE Tracking (
    IDTracking SERIAL PRIMARY KEY,
    Nome VARCHAR(255),
    Intensidade INT,
    Dia_de_Registro DATE NOT NULL,
    IDTraits INT NOT NULL,
    FOREIGN KEY (IDTraits) REFERENCES Traits(IDTraits) ON DELETE CASCADE ON UPDATE CASCADE
);