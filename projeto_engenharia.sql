-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 02/02/2026 às 19:12
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `projeto_engenharia`
--

DELIMITER $$
--
-- Procedimentos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_calculate_project_deadline` (IN `project_id_param` INT)   BEGIN
    SELECT
        p.id AS project_id,
        p.name AS project_name,
        p.due_date AS defined_due_date,
        COALESCE(SUM(
            CASE
                WHEN ps.is_parallel = FALSE THEN
                    CEIL(t.estimated_hours / NULLIF(t.daily_hours, 0))
                ELSE
                    0
            END
        ), 0) AS sequential_days,
        COALESCE(MAX(
            CASE
                WHEN ps.is_parallel = TRUE THEN
                    CEIL(t.estimated_hours / NULLIF(t.daily_hours, 0))
                ELSE
                    0
            END
        ), 0) AS parallel_days,
        (
            COALESCE(SUM(
                CASE
                    WHEN ps.is_parallel = FALSE THEN
                        CEIL(t.estimated_hours / NULLIF(t.daily_hours, 0))
                    ELSE
                        0
                END
            ), 0) +
            COALESCE(MAX(
                CASE
                    WHEN ps.is_parallel = TRUE THEN
                        CEIL(t.estimated_hours / NULLIF(t.daily_hours, 0))
                    ELSE
                        0
                END
            ), 0)
        ) AS total_estimated_days,
        DATE_ADD(COALESCE(p.start_date, CURDATE()), INTERVAL
            (
                COALESCE(SUM(
                    CASE
                        WHEN ps.is_parallel = FALSE THEN
                            CEIL(t.estimated_hours / NULLIF(t.daily_hours, 0))
                        ELSE
                            0
                    END
                ), 0) +
                COALESCE(MAX(
                    CASE
                        WHEN ps.is_parallel = TRUE THEN
                            CEIL(t.estimated_hours / NULLIF(t.daily_hours, 0))
                        ELSE
                            0
                    END
                ), 0)
            ) DAY
        ) AS estimated_completion_date,
        CASE
            WHEN p.due_date IS NULL THEN 'NO_DEADLINE'
            WHEN DATE_ADD(COALESCE(p.start_date, CURDATE()), INTERVAL
                (
                    COALESCE(SUM(
                        CASE
                            WHEN ps.is_parallel = FALSE THEN
                                CEIL(t.estimated_hours / NULLIF(t.daily_hours, 0))
                            ELSE
                                0
                        END
                    ), 0) +
                    COALESCE(MAX(
                        CASE
                            WHEN ps.is_parallel = TRUE THEN
                                CEIL(t.estimated_hours / NULLIF(t.daily_hours, 0))
                            ELSE
                                0
                        END
                    ), 0)
                ) DAY
            ) > p.due_date THEN 'AT_RISK'
            WHEN DATEDIFF(p.due_date, CURDATE()) <= 7 THEN 'WARNING'
            ELSE 'ON_TRACK'
        END AS risk_status
    FROM projects p
    LEFT JOIN project_stages ps ON p.id = ps.project_id
    LEFT JOIN tasks t ON ps.id = t.stage_id
    WHERE p.id = project_id_param
    GROUP BY p.id, p.name, p.due_date, p.start_date;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','completed','on_hold','cancelled') NOT NULL DEFAULT 'active',
  `supervisor_id` int(11) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `status`, `supervisor_id`, `start_date`, `due_date`, `created_at`, `updated_at`) VALUES
(1, 'Sistema de Gestão Interna', 'Desenvolvimento de sistema web para gestão de projetos', 'active', 2, '2026-01-02', '2026-03-31', '2026-01-02 14:39:44', '2026-01-02 14:39:44'),
(2, 'E-commerce Platform', 'Plataforma de vendas online', 'active', 2, '2026-01-01', '2026-03-31', '2026-01-05 21:12:28', '2026-01-05 21:12:28'),
(3, 'E-commerce Platform', 'Plataforma de vendas online', 'active', 2, '2026-01-01', '2026-03-31', '2026-01-05 21:12:57', '2026-01-05 21:12:57'),
(4, 'E-commerce Platform', 'Plataforma de vendas online', 'active', 2, '2026-01-01', '2026-03-31', '2026-01-05 21:13:12', '2026-01-05 21:13:12'),
(5, 'E-commerce Platform', 'Plataforma de vendas online', 'active', 2, '2026-01-01', '2026-03-31', '2026-01-05 21:13:39', '2026-01-05 21:13:39');

-- --------------------------------------------------------

--
-- Estrutura para tabela `project_stages`
--

CREATE TABLE `project_stages` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `is_parallel` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Se TRUE, tarefas podem ser executadas em paralelo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `project_stages`
--

INSERT INTO `project_stages` (`id`, `project_id`, `name`, `description`, `order`, `is_parallel`, `created_at`, `updated_at`) VALUES
(1, 1, 'Análise de Requisitos', 'Levantamento e documentação de requisitos', 1, 0, '2026-01-02 14:39:44', '2026-01-02 14:39:44'),
(2, 1, 'Desenvolvimento Backend', 'Implementação da API REST', 2, 0, '2026-01-02 14:39:44', '2026-01-02 14:39:44'),
(3, 1, 'Desenvolvimento Frontend', 'Implementação da interface React', 3, 1, '2026-01-02 14:39:44', '2026-01-02 14:39:44'),
(4, 4, 'Design', 'Design da interface', 1, 0, '2026-01-05 21:13:12', '2026-01-05 21:13:12'),
(5, 4, 'Backend', 'APIs e banco de dados', 2, 0, '2026-01-05 21:13:12', '2026-01-05 21:13:12'),
(6, 4, 'Frontend', 'Interface web', 3, 0, '2026-01-05 21:13:12', '2026-01-05 21:13:12'),
(7, 5, 'Design', 'Design da interface', 1, 0, '2026-01-05 21:13:39', '2026-01-05 21:13:39'),
(8, 5, 'Backend', 'APIs e banco de dados', 2, 0, '2026-01-05 21:13:39', '2026-01-05 21:13:39'),
(9, 5, 'Frontend', 'Interface web', 3, 0, '2026-01-05 21:13:39', '2026-01-05 21:13:39'),
(10, 5, 'Analise', 'Analise das etapas e processos.', 4, 1, '2026-01-06 15:21:35', '2026-01-06 15:21:35');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `stage_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('novo','em_desenvolvimento','analise_tecnica','concluido','refaca') NOT NULL DEFAULT 'novo',
  `estimated_hours` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Horas totais estimadas para a tarefa',
  `daily_hours` decimal(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Horas por dia que o usuário dedicará',
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `order` int(11) NOT NULL DEFAULT 0,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `company_contract` varchar(255) DEFAULT NULL COMMENT 'Empresa/Contrato',
  `start_date` date DEFAULT NULL COMMENT 'Data de início declarada pelo user quando clica PLAY',
  `date_begin_real` date DEFAULT NULL COMMENT 'Data real do primeiro PLAY (auto-preenchida)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tasks`
--

INSERT INTO `tasks` (`id`, `stage_id`, `title`, `description`, `status`, `estimated_hours`, `daily_hours`, `priority`, `order`, `due_date`, `created_at`, `updated_at`, `company_contract`, `start_date`, `date_begin_real`) VALUES
(1, 1, 'Reunião com stakeholders', 'Levantar requisitos funcionais e não-funcionais', 'concluido', 16.00, 4.00, 'high', 1, NULL, '2026-01-02 14:39:44', '2026-01-02 14:39:44', NULL, NULL, NULL),
(2, 1, 'Documentar requisitos', 'Criar documento de especificação', 'analise_tecnica', 24.00, 3.00, 'high', 2, NULL, '2026-01-02 14:39:44', '2026-01-02 18:11:36', NULL, NULL, NULL),
(3, 2, 'Configurar banco de dados', 'Setup MySQL e criar schema', 'em_desenvolvimento', 8.00, 2.00, 'high', 1, NULL, '2026-01-02 14:39:44', '2026-01-02 18:11:50', NULL, NULL, NULL),
(4, 2, 'Implementar autenticação JWT', 'Sistema de login e tokens', 'novo', 20.00, 4.00, 'high', 2, NULL, '2026-01-02 14:39:44', '2026-01-02 14:39:44', NULL, NULL, NULL),
(5, 3, 'Criar componentes base', 'Layouts e componentes reutilizáveis', 'novo', 16.00, 4.00, 'medium', 1, NULL, '2026-01-02 14:39:44', '2026-01-02 14:39:44', NULL, NULL, NULL),
(6, 4, 'Wireframes', 'Criar wireframes iniciais', 'novo', 8.00, 4.00, 'high', 0, NULL, '2026-01-05 21:13:12', '2026-01-05 21:13:12', NULL, NULL, NULL),
(7, 4, 'Design Visual', 'Design da interface responsiva', 'em_desenvolvimento', 12.00, 4.00, 'high', 0, NULL, '2026-01-05 21:13:12', '2026-01-05 21:13:12', NULL, NULL, NULL),
(8, 5, 'API Auth', 'Implementar autenticação JWT', 'novo', 16.00, 4.00, 'high', 0, NULL, '2026-01-05 21:13:12', '2026-01-05 21:13:12', NULL, NULL, NULL),
(9, 5, 'Banco de Dados', 'Setup inicial do MySQL', 'novo', 8.00, 4.00, 'medium', 0, NULL, '2026-01-05 21:13:12', '2026-01-05 21:13:12', NULL, NULL, NULL),
(10, 6, 'Login Page', 'Tela de login e cadastro', 'novo', 12.00, 4.00, 'high', 0, NULL, '2026-01-05 21:13:12', '2026-01-05 21:13:12', NULL, NULL, NULL),
(11, 6, 'Produtos', 'Página de listagem de produtos', 'novo', 16.00, 4.00, 'medium', 0, NULL, '2026-01-05 21:13:12', '2026-01-05 21:13:12', NULL, NULL, NULL),
(12, 7, 'Wireframes', 'Criar wireframes iniciais', 'novo', 8.00, 4.00, 'high', 0, NULL, '2026-01-05 21:13:39', '2026-01-05 21:13:39', NULL, NULL, NULL),
(13, 7, 'Design Visual', 'Design da interface responsiva', 'em_desenvolvimento', 12.00, 4.00, 'high', 0, NULL, '2026-01-05 21:13:39', '2026-01-05 21:13:39', NULL, NULL, NULL),
(14, 8, 'API Auth', 'Implementar autenticação JWT', 'novo', 16.00, 4.00, 'high', 0, NULL, '2026-01-05 21:13:39', '2026-01-05 21:13:39', NULL, NULL, NULL),
(15, 8, 'Banco de Dados', 'Setup inicial do MySQL', 'novo', 8.00, 4.00, 'medium', 0, NULL, '2026-01-05 21:13:39', '2026-01-05 21:13:39', NULL, NULL, NULL),
(16, 9, 'Login Page', 'Tela de login e cadastro', 'novo', 12.00, 4.00, 'high', 0, NULL, '2026-01-05 21:13:39', '2026-01-05 21:13:39', NULL, NULL, NULL),
(17, 9, 'Produtos', 'Página de listagem de produtos', 'novo', 16.00, 4.00, 'medium', 0, NULL, '2026-01-05 21:13:39', '2026-01-05 21:13:39', NULL, NULL, NULL),
(18, 10, 'Teste', 'Um teste para entender do projeto', 'novo', 10.00, 2.00, 'medium', 1, '2026-01-22', '2026-01-06 15:28:22', '2026-01-06 16:24:25', NULL, NULL, '2026-01-06'),
(19, 10, 'Teste 2', 'Testes do dead time', 'novo', 30.00, 4.00, 'medium', 2, '2026-01-23', '2026-01-06 15:52:23', '2026-01-08 16:45:50', NULL, NULL, '2026-01-08'),
(20, 10, 'teste de atraso', 'testar os atrasos', 'novo', 8.00, 1.00, 'medium', 3, '2026-01-05', '2026-01-06 15:56:07', '2026-01-06 15:56:07', NULL, NULL, NULL),
(21, 10, 'teste perto do atraso', 'teste de avisos', 'novo', 20.00, 4.00, 'medium', 4, '2026-01-07', '2026-01-06 15:57:21', '2026-01-06 15:57:21', NULL, NULL, NULL),
(22, 10, 'teste prioridade', 'teste', 'novo', 40.00, 4.00, 'high', 5, '2026-01-30', '2026-01-07 12:05:28', '2026-01-07 12:05:28', NULL, NULL, NULL);

--
-- Acionadores `tasks`
--
DELIMITER $$
CREATE TRIGGER `before_task_update_validate_hours` BEFORE UPDATE ON `tasks` FOR EACH ROW BEGIN
    DECLARE total_hours DECIMAL(10,2);

    -- Calcular total de horas diárias do usuário (excluindo a tarefa atual)
    SELECT COALESCE(SUM(t.daily_hours), 0) INTO total_hours
    FROM tasks t
    INNER JOIN task_assignments ta ON t.id = ta.task_id
    WHERE ta.user_id IN (
        SELECT user_id FROM task_assignments WHERE task_id = NEW.id
    )
    AND t.id != NEW.id
    AND t.status NOT IN ('concluido', 'cancelado');

    -- Validar se ultrapassa 8 horas
    IF (total_hours + NEW.daily_hours) > 8.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Limite de 8 horas diárias excedido para este usuário';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `task_assignments`
--

CREATE TABLE `task_assignments` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `daily_hours` decimal(5,2) DEFAULT 0.00 COMMENT 'Horas diárias que este usuário se compromete a dedicar a esta tarefa (0-8)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `task_assignments`
--

INSERT INTO `task_assignments` (`id`, `task_id`, `user_id`, `assigned_at`, `daily_hours`) VALUES
(1, 1, 4, '2026-01-02 14:39:44', 4.00),
(2, 2, 4, '2026-01-02 14:39:44', 3.00),
(3, 3, 5, '2026-01-02 14:39:44', 2.00),
(4, 4, 5, '2026-01-02 14:39:44', 4.00),
(5, 5, 6, '2026-01-02 14:39:44', 4.00),
(7, 13, 5, '2026-01-05 21:13:39', 4.00),
(9, 15, 5, '2026-01-05 21:13:39', 4.00),
(11, 17, 5, '2026-01-05 21:13:39', 4.00),
(38, 18, 8, '2026-01-07 13:33:51', 2.00),
(42, 18, 7, '2026-01-07 19:40:45', 2.00),
(44, 19, 7, '2026-01-08 16:45:31', 4.00),
(46, 19, 8, '2026-01-08 16:46:26', 4.00);

-- --------------------------------------------------------

--
-- Estrutura para tabela `time_entries`
--

CREATE TABLE `time_entries` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `hours` decimal(5,2) NOT NULL,
  `date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `time_entries_sessions`
--

CREATE TABLE `time_entries_sessions` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `start_time` datetime NOT NULL COMMENT 'Quando clicou PLAY',
  `pause_time` datetime DEFAULT NULL COMMENT 'Quando clicou PAUSE',
  `resume_time` datetime DEFAULT NULL COMMENT 'Quando clicou PLAY após PAUSE',
  `end_time` datetime DEFAULT NULL COMMENT 'Quando clicou STOP (finaliza)',
  `duration_minutes` int(11) DEFAULT NULL COMMENT 'Minutos trabalhados',
  `duration_hours` decimal(5,2) DEFAULT NULL COMMENT 'Horas (duration_minutes ÷ 60)',
  `status` enum('running','paused','stopped') NOT NULL DEFAULT 'running' COMMENT 'running=em andamento, paused=pausado, stopped=finalizado',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `paused_minutes` int(11) DEFAULT 0 COMMENT 'Total de minutos que a sessão ficou pausada (não trabalhada)',
  `pause_count` int(11) DEFAULT 0 COMMENT 'Quantas vezes a sessão foi pausada',
  `duration_total_seconds` int(11) DEFAULT 0 COMMENT 'Total de segundos de trabalho (para precisão de MM:SS)',
  `paused_total_seconds` int(11) DEFAULT 0 COMMENT 'Total de segundos pausado (para precisão de MM:SS)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sessões de trabalho rastreadas com Play/Pause/Stop';

--
-- Despejando dados para a tabela `time_entries_sessions`
--

INSERT INTO `time_entries_sessions` (`id`, `task_id`, `user_id`, `start_time`, `pause_time`, `resume_time`, `end_time`, `duration_minutes`, `duration_hours`, `status`, `notes`, `created_at`, `updated_at`, `paused_minutes`, `pause_count`, `duration_total_seconds`, `paused_total_seconds`) VALUES
(1, 18, 7, '2026-01-06 13:21:53', '2026-01-06 13:24:14', '2026-01-06 13:24:18', '2026-01-06 13:24:25', 2, 0.03, 'stopped', NULL, '2026-01-06 16:21:53', '2026-01-06 17:27:42', 0, 0, 120, 0),
(2, 18, 7, '2026-01-06 13:24:43', '2026-01-06 13:25:31', '2026-01-06 13:25:33', '2026-01-06 13:25:36', 0, 0.00, 'stopped', NULL, '2026-01-06 16:24:43', '2026-01-06 16:25:36', 0, 0, 0, 0),
(3, 18, 7, '2026-01-06 14:01:47', NULL, NULL, '2026-01-06 14:04:50', 3, 0.05, 'stopped', NULL, '2026-01-06 17:01:47', '2026-01-06 17:27:42', 0, 0, 180, 0),
(4, 18, 7, '2026-01-06 14:06:17', '2026-01-06 14:08:07', '2026-01-06 14:08:09', '2026-01-06 14:08:14', 1, 0.02, 'stopped', 'teste', '2026-01-06 17:06:17', '2026-01-06 17:27:42', 0, 0, 60, 0),
(5, 18, 7, '2026-01-06 14:14:29', '2026-01-06 14:23:01', '2026-01-06 14:22:34', '2026-01-06 14:24:24', 1, 0.02, 'stopped', NULL, '2026-01-06 17:14:29', '2026-01-06 17:27:42', 5, 6, 60, 300),
(6, 18, 7, '2026-01-06 14:28:17', '2026-01-06 14:30:55', '2026-01-06 14:28:46', '2026-01-06 14:32:43', 2, 0.04, 'stopped', NULL, '2026-01-06 17:28:17', '2026-01-06 17:32:43', 0, 1, 135, 131),
(7, 18, 7, '2026-01-06 14:46:21', '2026-01-06 14:46:39', '2026-01-06 14:47:08', '2026-01-06 14:47:25', 0, 0.01, 'stopped', NULL, '2026-01-06 17:46:21', '2026-01-06 17:47:25', 0, 1, 35, 29),
(8, 18, 7, '2026-01-06 15:31:27', '2026-01-06 15:32:40', '2026-01-06 15:33:36', '2026-01-06 15:34:32', 1, 0.03, 'stopped', NULL, '2026-01-06 18:31:27', '2026-01-06 18:34:32', 1, 2, 95, 90),
(9, 18, 7, '2026-01-06 18:10:52', '2026-01-06 18:11:01', NULL, '2026-01-06 18:11:15', 0, 0.00, 'stopped', NULL, '2026-01-06 21:10:52', '2026-01-06 21:11:15', 0, 0, 9, 14),
(10, 18, 7, '2026-01-07 08:19:31', NULL, NULL, '2026-01-07 08:24:12', 4, 0.08, 'stopped', NULL, '2026-01-07 11:19:31', '2026-01-07 11:24:12', 0, 0, 281, 0),
(11, 18, 8, '2026-01-07 10:41:37', '2026-01-07 13:30:18', '2026-01-07 13:30:12', '2026-01-07 13:30:49', 163, 2.73, 'stopped', NULL, '2026-01-07 13:41:37', '2026-01-07 16:30:49', 4, 1, 9823, 329),
(12, 18, 8, '2026-01-07 13:31:16', NULL, NULL, '2026-01-07 13:33:05', 1, 0.03, 'stopped', NULL, '2026-01-07 16:31:16', '2026-01-07 16:33:05', 0, 0, 109, 0),
(13, 18, 8, '2026-01-07 13:35:48', '2026-01-07 13:39:20', NULL, '2026-01-07 13:39:24', 3, 0.06, 'stopped', NULL, '2026-01-07 16:35:48', '2026-01-07 16:39:24', 0, 0, 212, 4),
(14, 18, 7, '2026-01-08 08:01:40', '2026-01-08 09:27:19', NULL, '2026-01-08 09:27:21', 85, 1.43, 'stopped', NULL, '2026-01-08 11:01:40', '2026-01-08 12:27:21', 0, 0, 5139, 2),
(15, 18, 8, '2026-01-08 09:28:53', '2026-01-08 10:17:36', '2026-01-08 10:17:40', '2026-01-08 12:55:55', 206, 3.45, 'stopped', NULL, '2026-01-08 12:28:53', '2026-01-08 15:55:55', 0, 1, 12418, 4),
(16, 18, 7, '2026-01-08 13:44:20', NULL, NULL, '2026-01-08 13:44:24', 0, 0.00, 'stopped', NULL, '2026-01-08 16:44:20', '2026-01-08 16:44:24', 0, 0, 4, 0),
(17, 18, 7, '2026-01-08 13:45:18', NULL, NULL, '2026-01-08 13:46:13', 0, 0.02, 'stopped', NULL, '2026-01-08 16:45:18', '2026-01-08 16:46:13', 0, 0, 55, 0),
(18, 19, 7, '2026-01-08 13:45:34', NULL, NULL, '2026-01-08 13:45:50', 0, 0.00, 'stopped', NULL, '2026-01-08 16:45:34', '2026-01-08 16:45:50', 0, 0, 16, 0),
(19, 18, 8, '2026-01-08 13:46:40', NULL, NULL, '2026-01-08 13:48:01', 1, 0.02, 'stopped', NULL, '2026-01-08 16:46:40', '2026-01-08 16:48:01', 0, 0, 81, 0),
(20, 19, 8, '2026-01-08 13:46:45', NULL, NULL, '2026-01-08 13:48:06', 1, 0.02, 'stopped', NULL, '2026-01-08 16:46:45', '2026-01-08 16:48:06', 0, 0, 81, 0),
(21, 18, 8, '2026-01-27 14:10:53', '2026-01-27 14:11:02', '2026-01-27 14:11:53', '2026-01-27 14:12:02', 0, 0.01, 'stopped', NULL, '2026-01-27 17:10:53', '2026-01-27 17:12:02', 0, 1, 18, 51);

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` enum('user','supervisor','admin') NOT NULL DEFAULT 'user',
  `avatar_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `avatar_url`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'admin@engenharia.com', '$2b$10$IsUHMVyRoK9SQYybVV9.k.PC26Eajgtj74dAjK6R8EhRwtn131sgK', 'Administrador Sistema', 'admin', NULL, 1, '2026-01-02 14:39:44', '2026-01-02 14:41:33'),
(2, 'supervisor1@engenharia.com', '$2b$10$IsUHMVyRoK9SQYybVV9.k.PC26Eajgtj74dAjK6R8EhRwtn131sgK', 'João Silva', 'supervisor', NULL, 1, '2026-01-02 14:39:44', '2026-01-02 14:41:33'),
(3, 'supervisor2@engenharia.com', '$2b$10$IsUHMVyRoK9SQYybVV9.k.PC26Eajgtj74dAjK6R8EhRwtn131sgK', 'Maria Santos', 'supervisor', NULL, 1, '2026-01-02 14:39:44', '2026-01-02 14:41:33'),
(4, 'eng1@engenharia.com', '$2b$10$IsUHMVyRoK9SQYybVV9.k.PC26Eajgtj74dAjK6R8EhRwtn131sgK', 'Pedro Oliveira', 'user', NULL, 1, '2026-01-02 14:39:44', '2026-01-02 14:41:33'),
(5, 'eng2@engenharia.com', '$2b$10$IsUHMVyRoK9SQYybVV9.k.PC26Eajgtj74dAjK6R8EhRwtn131sgK', 'Ana Costa', 'user', NULL, 1, '2026-01-02 14:39:44', '2026-01-02 14:41:33'),
(6, 'eng3@engenharia.com', '$2b$10$IsUHMVyRoK9SQYybVV9.k.PC26Eajgtj74dAjK6R8EhRwtn131sgK', 'Carlos Pereira', 'user', NULL, 1, '2026-01-02 14:39:44', '2026-01-02 14:41:33'),
(7, 'magno@teste.com', '$2b$10$WQXYq8ZM.IUkjPGK5PTX.uI1Wq4AhGujD5hY6Kv6YbrjMOfJoaGKe', 'Magno', 'admin', NULL, 1, '2026-01-05 20:47:40', '2026-01-05 20:48:19'),
(8, 'emanuel@teste.com', '$2b$10$MkZ0mkmzYyUdAZPxBR6uGeXuTTaLzDGNxxahvFL2ELmPCl5Hdg.Oi', 'Emanuel', 'user', NULL, 1, '2026-01-07 13:33:13', '2026-01-07 13:33:13'),
(9, 'magno@teste1.com', '$2b$10$/pwb5LXvAcxirxMS9Eze3eukYw/wJWGWj529CFQm08CJheug2JatS', 'Magno', 'admin', NULL, 1, '2026-01-27 16:53:36', '2026-01-27 16:59:04');

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_projects_at_risk`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `vw_projects_at_risk` (
`id` int(11)
,`name` varchar(255)
,`description` text
,`status` enum('active','completed','on_hold','cancelled')
,`due_date` date
,`start_date` date
,`supervisor_name` varchar(255)
,`total_stages` bigint(21)
,`total_tasks` bigint(21)
,`completed_tasks` bigint(21)
,`refaca_tasks` bigint(21)
,`days_until_due` int(7)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_tasks_with_project`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `vw_tasks_with_project` (
`task_id` int(11)
,`task_title` varchar(255)
,`task_description` text
,`task_status` enum('novo','em_desenvolvimento','analise_tecnica','concluido','refaca')
,`estimated_hours` decimal(10,2)
,`daily_hours` decimal(5,2)
,`priority` enum('low','medium','high')
,`task_due_date` date
,`stage_id` int(11)
,`stage_name` varchar(255)
,`project_id` int(11)
,`project_name` varchar(255)
,`project_status` enum('active','completed','on_hold','cancelled')
,`project_due_date` date
,`supervisor_id` int(11)
,`supervisor_name` varchar(255)
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_user_statistics`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `vw_user_statistics` (
`user_id` int(11)
,`full_name` varchar(255)
,`email` varchar(255)
,`role` enum('user','supervisor','admin')
,`total_tasks` bigint(21)
,`completed_tasks` bigint(21)
,`in_progress_tasks` bigint(21)
,`refaca_tasks` bigint(21)
,`total_daily_hours` decimal(27,2)
,`total_logged_hours` decimal(27,2)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `v_task_assignees_metrics`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `v_task_assignees_metrics` (
`task_id` int(11)
,`user_id` int(11)
,`full_name` varchar(255)
,`estimated_hours` decimal(10,2)
,`task_daily_hours` decimal(5,2)
,`horas_estimadas_user` decimal(11,2)
,`horas_registradas` decimal(27,2)
,`taxa_progresso_user` decimal(37,2)
,`dias_trabalho` bigint(21)
,`status_user` varchar(12)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `v_task_metrics`
-- (Veja abaixo para a visão atual)
--
CREATE TABLE `v_task_metrics` (
`task_id` int(11)
,`title` varchar(255)
,`description` text
,`company_contract` varchar(255)
,`estimated_hours` decimal(10,2)
,`daily_hours_task` decimal(5,2)
,`due_date` date
,`status` enum('novo','em_desenvolvimento','analise_tecnica','concluido','refaca')
,`data_inicio_real` datetime
,`total_horas_reais` decimal(27,2)
,`total_colaboradores` bigint(21)
,`total_daily_hours` decimal(5,2)
,`taxa_media_percent` decimal(33,2)
,`dias_necessarios` bigint(12)
,`fim_real_estimado` datetime
,`dias_diferenca` int(7)
,`status_risco` varchar(8)
);

-- --------------------------------------------------------

--
-- Estrutura para view `vw_projects_at_risk`
--
DROP TABLE IF EXISTS `vw_projects_at_risk`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_projects_at_risk`  AS SELECT `p`.`id` AS `id`, `p`.`name` AS `name`, `p`.`description` AS `description`, `p`.`status` AS `status`, `p`.`due_date` AS `due_date`, `p`.`start_date` AS `start_date`, `u`.`full_name` AS `supervisor_name`, count(distinct `ps`.`id`) AS `total_stages`, count(distinct `t`.`id`) AS `total_tasks`, count(distinct case when `t`.`status` = 'concluido' then `t`.`id` end) AS `completed_tasks`, count(distinct case when `t`.`status` = 'refaca' then `t`.`id` end) AS `refaca_tasks`, to_days(`p`.`due_date`) - to_days(curdate()) AS `days_until_due` FROM (((`projects` `p` left join `users` `u` on(`p`.`supervisor_id` = `u`.`id`)) left join `project_stages` `ps` on(`p`.`id` = `ps`.`project_id`)) left join `tasks` `t` on(`ps`.`id` = `t`.`stage_id`)) WHERE `p`.`status` = 'active' AND `p`.`due_date` is not null AND to_days(`p`.`due_date`) - to_days(curdate()) <= 7 GROUP BY `p`.`id`, `p`.`name`, `p`.`description`, `p`.`status`, `p`.`due_date`, `p`.`start_date`, `u`.`full_name` ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_tasks_with_project`
--
DROP TABLE IF EXISTS `vw_tasks_with_project`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_tasks_with_project`  AS SELECT `t`.`id` AS `task_id`, `t`.`title` AS `task_title`, `t`.`description` AS `task_description`, `t`.`status` AS `task_status`, `t`.`estimated_hours` AS `estimated_hours`, `t`.`daily_hours` AS `daily_hours`, `t`.`priority` AS `priority`, `t`.`due_date` AS `task_due_date`, `ps`.`id` AS `stage_id`, `ps`.`name` AS `stage_name`, `p`.`id` AS `project_id`, `p`.`name` AS `project_name`, `p`.`status` AS `project_status`, `p`.`due_date` AS `project_due_date`, `u`.`id` AS `supervisor_id`, `u`.`full_name` AS `supervisor_name`, `t`.`created_at` AS `created_at`, `t`.`updated_at` AS `updated_at` FROM (((`tasks` `t` join `project_stages` `ps` on(`t`.`stage_id` = `ps`.`id`)) join `projects` `p` on(`ps`.`project_id` = `p`.`id`)) left join `users` `u` on(`p`.`supervisor_id` = `u`.`id`)) ;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_user_statistics`
--
DROP TABLE IF EXISTS `vw_user_statistics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_user_statistics`  AS SELECT `u`.`id` AS `user_id`, `u`.`full_name` AS `full_name`, `u`.`email` AS `email`, `u`.`role` AS `role`, count(distinct `ta`.`task_id`) AS `total_tasks`, count(distinct case when `t`.`status` = 'concluido' then `ta`.`task_id` end) AS `completed_tasks`, count(distinct case when `t`.`status` = 'em_desenvolvimento' then `ta`.`task_id` end) AS `in_progress_tasks`, count(distinct case when `t`.`status` = 'refaca' then `ta`.`task_id` end) AS `refaca_tasks`, coalesce(sum(`t`.`daily_hours`),0) AS `total_daily_hours`, coalesce(sum(`te`.`hours`),0) AS `total_logged_hours` FROM (((`users` `u` left join `task_assignments` `ta` on(`u`.`id` = `ta`.`user_id`)) left join `tasks` `t` on(`ta`.`task_id` = `t`.`id`)) left join `time_entries` `te` on(`u`.`id` = `te`.`user_id`)) GROUP BY `u`.`id`, `u`.`full_name`, `u`.`email`, `u`.`role` ;

-- --------------------------------------------------------

--
-- Estrutura para view `v_task_assignees_metrics`
--
DROP TABLE IF EXISTS `v_task_assignees_metrics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_task_assignees_metrics`  AS SELECT `ta`.`task_id` AS `task_id`, `ta`.`user_id` AS `user_id`, `u`.`full_name` AS `full_name`, `t`.`estimated_hours` AS `estimated_hours`, `t`.`daily_hours` AS `task_daily_hours`, round(`t`.`estimated_hours` / coalesce((select count(distinct `task_assignments`.`user_id`) from `task_assignments` where `task_assignments`.`task_id` = `ta`.`task_id`),1),2) AS `horas_estimadas_user`, coalesce((select sum(`ts`.`duration_hours`) from `time_entries_sessions` `ts` where `ts`.`task_id` = `ta`.`task_id` and `ts`.`user_id` = `ta`.`user_id` and `ts`.`status` = 'stopped'),0) AS `horas_registradas`, CASE WHEN `t`.`estimated_hours` > 0 THEN round(coalesce((select sum(`ts`.`duration_hours`) from `time_entries_sessions` `ts` where `ts`.`task_id` = `ta`.`task_id` and `ts`.`user_id` = `ta`.`user_id` and `ts`.`status` = 'stopped'),0) / (`t`.`estimated_hours` / coalesce((select count(distinct `task_assignments`.`user_id`) from `task_assignments` where `task_assignments`.`task_id` = `ta`.`task_id`),1)) * 100,2) ELSE 0 END AS `taxa_progresso_user`, (select count(distinct cast(`ts`.`start_time` as date)) from `time_entries_sessions` `ts` where `ts`.`task_id` = `ta`.`task_id` and `ts`.`user_id` = `ta`.`user_id` and `ts`.`status` = 'stopped') AS `dias_trabalho`, CASE WHEN (select sum(`ts`.`duration_hours`) from `time_entries_sessions` `ts` where `ts`.`task_id` = `ta`.`task_id` AND `ts`.`user_id` = `ta`.`user_id` AND `ts`.`status` = 'stopped') is null THEN 'SEM_INICIAR' WHEN (select sum(`ts`.`duration_hours`) from `time_entries_sessions` `ts` where `ts`.`task_id` = `ta`.`task_id` AND `ts`.`user_id` = `ta`.`user_id` AND `ts`.`status` = 'stopped') < `t`.`estimated_hours` / coalesce((select count(distinct `task_assignments`.`user_id`) from `task_assignments` where `task_assignments`.`task_id` = `ta`.`task_id`),1) THEN 'EM_PROGRESSO' ELSE 'CONCLUIDO' END AS `status_user` FROM ((`task_assignments` `ta` left join `users` `u` on(`ta`.`user_id` = `u`.`id`)) left join `tasks` `t` on(`ta`.`task_id` = `t`.`id`)) ;

-- --------------------------------------------------------

--
-- Estrutura para view `v_task_metrics`
--
DROP TABLE IF EXISTS `v_task_metrics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_task_metrics`  AS SELECT `t`.`id` AS `task_id`, `t`.`title` AS `title`, `t`.`description` AS `description`, `t`.`company_contract` AS `company_contract`, `t`.`estimated_hours` AS `estimated_hours`, `t`.`daily_hours` AS `daily_hours_task`, `t`.`due_date` AS `due_date`, `t`.`status` AS `status`, (select min(`ts`.`start_time`) from `time_entries_sessions` `ts` where `ts`.`task_id` = `t`.`id` and `ts`.`status` = 'stopped') AS `data_inicio_real`, coalesce((select sum(`ts`.`duration_hours`) from `time_entries_sessions` `ts` where `ts`.`task_id` = `t`.`id` and `ts`.`status` = 'stopped'),0) AS `total_horas_reais`, (select count(distinct `task_assignments`.`user_id`) from `task_assignments` where `task_assignments`.`task_id` = `t`.`id`) AS `total_colaboradores`, `t`.`daily_hours` AS `total_daily_hours`, CASE WHEN `t`.`estimated_hours` > 0 THEN round(coalesce((select sum(`ts`.`duration_hours`) from `time_entries_sessions` `ts` where `ts`.`task_id` = `t`.`id` and `ts`.`status` = 'stopped'),0) / `t`.`estimated_hours` * 100,2) ELSE 0 END AS `taxa_media_percent`, CASE WHEN `t`.`daily_hours` > 0 THEN ceiling(`t`.`estimated_hours` / `t`.`daily_hours`) ELSE NULL END AS `dias_necessarios`, CASE WHEN (select min(`ts`.`start_time`) from `time_entries_sessions` `ts` where `ts`.`task_id` = `t`.`id` AND `ts`.`status` = 'stopped') is not null AND `t`.`daily_hours` > 0 THEN (select min(`ts`.`start_time`) from `time_entries_sessions` `ts` where `ts`.`task_id` = `t`.`id` and `ts`.`status` = 'stopped') + interval ceiling(`t`.`estimated_hours` / `t`.`daily_hours`) day ELSE NULL END AS `fim_real_estimado`, CASE WHEN (select min(`ts`.`start_time`) from `time_entries_sessions` `ts` where `ts`.`task_id` = `t`.`id` AND `ts`.`status` = 'stopped') is not null AND `t`.`daily_hours` > 0 THEN to_days((select min(`ts`.`start_time`) from `time_entries_sessions` `ts` where `ts`.`task_id` = `t`.`id` and `ts`.`status` = 'stopped') + interval ceiling(`t`.`estimated_hours` / `t`.`daily_hours`) day) - to_days(`t`.`due_date`) ELSE NULL END AS `dias_diferenca`, CASE WHEN coalesce((select count(distinct `task_assignments`.`user_id`) from `task_assignments` where `task_assignments`.`task_id` = `t`.`id`),0) = 0 THEN 'CRITICO' WHEN `t`.`daily_hours` > 0 AND to_days((select min(`ts`.`start_time`) from `time_entries_sessions` `ts` where `ts`.`task_id` = `t`.`id` AND `ts`.`status` = 'stopped') + interval ceiling(`t`.`estimated_hours` / `t`.`daily_hours`) day) - to_days(`t`.`due_date`) > 5 THEN 'CRITICO' WHEN `t`.`daily_hours` > 0 AND to_days((select min(`ts`.`start_time`) from `time_entries_sessions` `ts` where `ts`.`task_id` = `t`.`id` AND `ts`.`status` = 'stopped') + interval ceiling(`t`.`estimated_hours` / `t`.`daily_hours`) day) - to_days(`t`.`due_date`) > 0 THEN 'RISCO' ELSE 'NO_PRAZO' END AS `status_risco` FROM `tasks` AS `t` ;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_supervisor` (`supervisor_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_due_date` (`due_date`);

--
-- Índices de tabela `project_stages`
--
ALTER TABLE `project_stages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_project_order` (`project_id`,`order`);

--
-- Índices de tabela `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stage` (`stage_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_stage_order` (`stage_id`,`order`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_due_date` (`due_date`),
  ADD KEY `idx_tasks_company` (`company_contract`),
  ADD KEY `idx_tasks_dates` (`start_date`,`due_date`);

--
-- Índices de tabela `task_assignments`
--
ALTER TABLE `task_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_task_user` (`task_id`,`user_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_task` (`task_id`),
  ADD KEY `idx_task_assignments_user_daily_hours` (`user_id`,`daily_hours`),
  ADD KEY `idx_task_assignments_user_id` (`user_id`);

--
-- Índices de tabela `time_entries`
--
ALTER TABLE `time_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_task` (`task_id`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_user_date` (`user_id`,`date`);

--
-- Índices de tabela `time_entries_sessions`
--
ALTER TABLE `time_entries_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_task_user` (`task_id`,`user_id`),
  ADD KEY `idx_task_date` (`task_id`,`created_at`),
  ADD KEY `idx_user_date` (`user_id`,`created_at`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_paused_minutes` (`paused_minutes`),
  ADD KEY `idx_duration_seconds` (`duration_total_seconds`),
  ADD KEY `idx_paused_seconds` (`paused_total_seconds`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `project_stages`
--
ALTER TABLE `project_stages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de tabela `task_assignments`
--
ALTER TABLE `task_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT de tabela `time_entries`
--
ALTER TABLE `time_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `time_entries_sessions`
--
ALTER TABLE `time_entries_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `project_stages`
--
ALTER TABLE `project_stages`
  ADD CONSTRAINT `project_stages_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`stage_id`) REFERENCES `project_stages` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `task_assignments`
--
ALTER TABLE `task_assignments`
  ADD CONSTRAINT `task_assignments_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_assignments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `time_entries`
--
ALTER TABLE `time_entries`
  ADD CONSTRAINT `time_entries_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `time_entries_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `time_entries_sessions`
--
ALTER TABLE `time_entries_sessions`
  ADD CONSTRAINT `time_entries_sessions_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `time_entries_sessions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
