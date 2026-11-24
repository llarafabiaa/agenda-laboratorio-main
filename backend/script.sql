
-- =====================================================
-- 1. CRIACAO DO BANCO DE DADOS
-- =====================================================

CREATE DATABASE IF NOT EXISTS reservas_laboratorio
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE reservas_laboratorio;


-- =====================================================
-- 2. TABELA DE USUARIOS
-- =====================================================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(120) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    senha VARCHAR(255) NOT NULL,

    perfil ENUM('ADMIN', 'PROFESSOR')
        NOT NULL DEFAULT 'PROFESSOR',

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =====================================================
-- 3. TABELA DE HORARIOS
-- =====================================================

CREATE TABLE horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,

    numero_periodo TINYINT NOT NULL UNIQUE,

    horario_inicio TIME NULL,

    horario_fim TIME NULL,

    CHECK (numero_periodo BETWEEN 1 AND 7),

    CHECK (
        horario_inicio IS NULL
        OR horario_fim IS NULL
        OR horario_inicio < horario_fim
    )
);


-- Inserindo os sete periodos de aula

INSERT INTO horarios (numero_periodo) VALUES
(1),
(2),
(3),
(4),
(5),
(6),
(7);


-- =====================================================
-- 4. TABELA DE DATAS BLOQUEADAS
-- =====================================================

CREATE TABLE datas_bloqueadas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    data DATE NOT NULL UNIQUE,

    motivo VARCHAR(200) NOT NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- 5. TABELA DE RESERVAS
-- =====================================================

CREATE TABLE reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,

    data_reserva DATE NOT NULL,

    horario_id INT NOT NULL,

    turma_atividade VARCHAR(100) NOT NULL,

    grupo_reserva CHAR(36) NULL,

    status ENUM('ATIVA', 'CANCELADA')
        NOT NULL DEFAULT 'ATIVA',

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    -- Impede duas reservas ATIVAS no mesmo
    -- horario e na mesma data.

    horario_ocupado INT
        GENERATED ALWAYS AS (
            CASE
                WHEN status = 'ATIVA' THEN horario_id
                ELSE NULL
            END
        ) STORED,

    UNIQUE KEY uk_reserva_horario (
        data_reserva,
        horario_ocupado
    ),

    CONSTRAINT fk_reserva_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id),

    CONSTRAINT fk_reserva_horario
        FOREIGN KEY (horario_id)
        REFERENCES horarios(id),

    INDEX idx_reserva_data (data_reserva),

    INDEX idx_reserva_usuario (usuario_id),

    INDEX idx_reserva_grupo (grupo_reserva)
);


-- =====================================================
-- 6. TRIGGER PARA BLOQUEAR DATAS INDISPONIVEIS
-- =====================================================

DELIMITER //

CREATE TRIGGER verificar_data_bloqueada_insert
BEFORE INSERT ON reservas
FOR EACH ROW
BEGIN

    IF NEW.status = 'ATIVA' AND EXISTS (
        SELECT 1
        FROM datas_bloqueadas
        WHERE data = NEW.data_reserva
    ) THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Esta data esta bloqueada para reservas.';

    END IF;

END //


CREATE TRIGGER verificar_data_bloqueada_update
BEFORE UPDATE ON reservas
FOR EACH ROW
BEGIN

    IF NEW.status = 'ATIVA' AND EXISTS (
        SELECT 1
        FROM datas_bloqueadas
        WHERE data = NEW.data_reserva
    ) THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Esta data esta bloqueada para reservas.';

    END IF;

END //

DELIMITER ;


-- =====================================================
-- FIM DA ESTRUTURA DO BANCO
-- =====================================================
