-- =====================================================
-- FASE 6: CALENDÁRIO DE ALOCAÇÕES
-- Tabela para alocação de blocos de tempo em tarefas
-- =====================================================

CREATE TABLE IF NOT EXISTS calendar_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    allocation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, allocation_date),
    INDEX idx_task_date (task_id, allocation_date),
    INDEX idx_user_date_time (user_id, allocation_date, start_time, end_time),
    CONSTRAINT chk_time_order CHECK (end_time > start_time),
    CONSTRAINT chk_min_duration CHECK (duration_minutes >= 15)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
