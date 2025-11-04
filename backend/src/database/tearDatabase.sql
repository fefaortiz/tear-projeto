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
    
    -- Coluna "DONO": A qual paciente esta Trait pertence.
    IDPaciente INT NOT NULL,

    -- -------- CAMPOS "CREATED BY" -------- --
    -- A coluna deve ser INT, pois referencia IDPaciente (SERIAL = INT)
    IDPaciente_Criador INT, 
    
    -- A coluna deve ser INT, pois referencia IDCuidador (SERIAL = INT)
    IDCuidador_Criador INT,
    -- ------------------------------------- --

    -- Chave Estrangeira do "DONO"
    -- Se o paciente "dono" for deletado, a Trait é deletada junto.
    FOREIGN KEY (IDPaciente) REFERENCES Paciente(IDPaciente) 
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- Chave Estrangeira do "CRIADOR" (Paciente)
    -- Se o paciente "criador" for deletado, a Trait permanece.
    FOREIGN KEY (IDPaciente_Criador) REFERENCES Paciente(IDPaciente) 
        ON DELETE SET NULL ON UPDATE CASCADE, 
        
    -- Chave Estrangeira do "CRIADOR" (Cuidador)
    -- Se o cuidador "criador" for deletado, a Trait permanece.
    FOREIGN KEY (IDCuidador_Criador) REFERENCES Cuidador(IDCuidador) 
        ON DELETE SET NULL ON UPDATE CASCADE,

    -- Garante que OU um paciente OU um cuidador criou (nunca ambos, nunca nenhum)
    CONSTRAINT chk_criador_unico_trait CHECK (
        (IDPaciente_Criador IS NOT NULL AND IDCuidador_Criador IS NULL) 
        OR 
        (IDPaciente_Criador IS NULL AND IDCuidador_Criador IS NOT NULL)
    )
);

-- Tabela para rastrear a evolução de uma característica (trait) ao longo do tempo.
CREATE TABLE Tracking (
    IDTracking SERIAL PRIMARY KEY,
    Nome VARCHAR(255),
    Intensidade INT,
    Dia_de_Registro DATE NOT NULL,
    IDTraits INT NOT NULL,

    -- CAMPOS "CREATED BY" --
    -- A coluna deve ser INT, pois ela referencia IDPaciente (que é SERIAL, ou seja, INT)
    IDPaciente_Criador INT, 
    
    -- A coluna deve ser INT, pois ela referencia IDCuidador (que é SERIAL, ou seja, INT)
    IDCuidador_Criador INT,
    -- --------------------- --

    -- Esta é a FK principal (o "Dono"), que já faz o CASCADE
    FOREIGN KEY (IDTraits) REFERENCES Traits(IDTraits) 
        ON DELETE CASCADE ON UPDATE CASCADE,
        
    -- Esta é a FK do "Criador"
    -- Usamos SET NULL para que, se o Paciente-Criador for deletado,
    -- o registro de Tracking NÃO seja deletado, apenas perca a referência.
    FOREIGN KEY (IDPaciente_Criador) REFERENCES Paciente(IDPaciente) 
        ON DELETE SET NULL ON UPDATE CASCADE, 
        
    -- Esta é a FK do "Criador"
    -- Usamos SET NULL para que, se o Cuidador-Criador for deletado,
    -- o registro de Tracking NÃO seja deletado, apenas perca a referência.
    FOREIGN KEY (IDCuidador_Criador) REFERENCES Cuidador(IDCuidador) 
        ON DELETE SET NULL ON UPDATE CASCADE,

    -- Garante que OU um paciente OU um cuidador criou (nunca ambos, nunca nenhum)
    CONSTRAINT chk_criador_unico CHECK (
        (IDPaciente_Criador IS NOT NULL AND IDCuidador_Criador IS NULL) 
        OR 
        (IDPaciente_Criador IS NULL AND IDCuidador_Criador IS NOT NULL)
    )
);