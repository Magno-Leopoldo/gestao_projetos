-- =====================================================
-- FASE 5: Histórico de Status + Justificativa de Refação
-- =====================================================

CREATE TABLE IF NOT EXISTS task_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    from_status ENUM('novo','em_desenvolvimento','analise_tecnica','concluido','refaca') NULL,
    to_status ENUM('novo','em_desenvolvimento','analise_tecnica','concluido','refaca') NOT NULL,
    reason TEXT NULL,
    changed_by INT NOT NULL,
    changed_by_name VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id),
    INDEX idx_task_id (task_id),
    INDEX idx_task_refaca (task_id, to_status, changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
