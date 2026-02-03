-- =====================================================
-- Schema Inicial - Sistema de Gestão de Projetos
-- Banco de dados: projeto_engenharia
-- =====================================================

USE projeto_engenharia;

-- =====================================================
-- TABELA: users
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('user', 'supervisor', 'admin') NOT NULL DEFAULT 'user',
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: projects
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('active', 'completed', 'on_hold') NOT NULL DEFAULT 'active',
    supervisor_id INT,
    start_date DATE,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_supervisor (supervisor_id),
    INDEX idx_dates (start_date, due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: project_stages
-- =====================================================
CREATE TABLE IF NOT EXISTS project_stages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    `order` INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project (project_id),
    INDEX idx_order (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: tasks
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stage_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('novo', 'em_desenvolvimento', 'analise_tecnica', 'concluido', 'refaca') NOT NULL DEFAULT 'novo',
    estimated_hours DECIMAL(10, 2),
    daily_hours DECIMAL(10, 2),
    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    `order` INT DEFAULT 0,
    due_date DATE,
    start_date DATE,
    date_begin_real DATE,
    company_contract VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (stage_id) REFERENCES project_stages(id) ON DELETE CASCADE,
    INDEX idx_stage (stage_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_company (company_contract),
    INDEX idx_dates (start_date, due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: task_assignments
-- =====================================================
CREATE TABLE IF NOT EXISTS task_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    daily_hours DECIMAL(10, 2),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (task_id, user_id),
    INDEX idx_task (task_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: time_entries
-- =====================================================
CREATE TABLE IF NOT EXISTS time_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    hours DECIMAL(10, 2),
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task (task_id),
    INDEX idx_user (user_id),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: time_entries_sessions (Nova - Play/Pause/Stop)
-- =====================================================
CREATE TABLE IF NOT EXISTS time_entries_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    start_time DATETIME NOT NULL COMMENT 'Quando clicou PLAY',
    pause_time DATETIME NULL COMMENT 'Quando clicou PAUSE',
    resume_time DATETIME NULL COMMENT 'Quando clicou PLAY após PAUSE',
    end_time DATETIME NULL COMMENT 'Quando clicou STOP (finaliza)',
    duration_minutes INT NULL COMMENT 'Minutos trabalhados',
    duration_hours DECIMAL(5, 2) NULL COMMENT 'Horas (duration_minutes ÷ 60)',
    status ENUM('running', 'paused', 'stopped') NOT NULL DEFAULT 'running'
        COMMENT 'running=em andamento, paused=pausado, stopped=finalizado',
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task_user (task_id, user_id),
    INDEX idx_task_date (task_id, created_at),
    INDEX idx_user_date (user_id, created_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sessões de trabalho rastreadas com Play/Pause/Stop';

-- =====================================================
-- USUÁRIOS DE TESTE
-- =====================================================
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@engenharia.com', '$2b$10$rOmYmV5O5n5K5K5K5K5K5.E5K5K5K5K5K5K5K5K5K5K5K5K5K5', 'Administrador Sistema', 'admin'),
('supervisor1@engenharia.com', '$2b$10$rOmYmV5O5n5K5K5K5K5K5.E5K5K5K5K5K5K5K5K5K5K5K5K5K5', 'Supervisor 1', 'supervisor'),
('supervisor2@engenharia.com', '$2b$10$rOmYmV5O5n5K5K5K5K5K5.E5K5K5K5K5K5K5K5K5K5K5K5K5K5', 'Supervisor 2', 'supervisor'),
('eng1@engenharia.com', '$2b$10$rOmYmV5O5n5K5K5K5K5K5.E5K5K5K5K5K5K5K5K5K5K5K5K5K5', 'Engenheiro 1', 'user'),
('eng2@engenharia.com', '$2b$10$rOmYmV5O5n5K5K5K5K5K5.E5K5K5K5K5K5K5K5K5K5K5K5K5K5', 'Engenheiro 2', 'user'),
('eng3@engenharia.com', '$2b$10$rOmYmV5O5n5K5K5K5K5K5.E5K5K5K5K5K5K5K5K5K5K5K5K5K5', 'Engenheiro 3', 'user')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- Verificação Final
-- =====================================================
SELECT 'Schema criado com sucesso!' as Status;
SHOW TABLES;
