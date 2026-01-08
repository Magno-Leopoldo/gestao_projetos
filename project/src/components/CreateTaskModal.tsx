import React, { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { tasksService } from '../services/tasksService';

interface CreateTaskModalProps {
  stageId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ✨ Componente de Tooltip Reutilizável
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute z-50 left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  stageId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(8);
  const [dailyHours, setDailyHours] = useState<number>(8);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('O título da tarefa é obrigatório');
      return;
    }

    if (estimatedHours <= 0) {
      setError('As horas estimadas devem ser maiores que 0');
      return;
    }

    if (dailyHours <= 0) {
      setError('As horas por dia devem ser maiores que 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📝 Criando tarefa:', { stageId, title, estimatedHours, dailyHours, priority });

      const response = await tasksService.create(stageId, {
        title: title.trim(),
        description: description.trim() || undefined,
        estimated_hours: estimatedHours,
        daily_hours: dailyHours,
        priority,
        due_date: dueDate || undefined,
      });

      console.log('✅ Tarefa criada com sucesso:', response);

      // Reset form
      setTitle('');
      setDescription('');
      setEstimatedHours(8);
      setDailyHours(8);
      setPriority('medium');
      setDueDate('');

      // Call success callback
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Erro ao criar tarefa';
      console.error('❌ Erro ao criar tarefa:', errorMsg, err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header com Gradiente */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0">
          <div>
            <h2 className="text-2xl font-bold">➕ Criar Nova Tarefa</h2>
            <p className="text-blue-100 text-sm mt-1">Defina os detalhes da nova tarefa</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-blue-100 hover:text-white hover:bg-blue-600 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">❌ {error}</p>
            </div>
          )}

          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título da Tarefa *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Implementar autenticação..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              disabled={loading}
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva os detalhes da tarefa..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              disabled={loading}
            />
          </div>

          {/* Horas e Prioridade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="estimatedHours" className="text-sm font-medium text-gray-700">
                  Horas Estimadas *
                </label>
                <Tooltip content="Tempo total estimado para completar a tarefa. Será dividido entre os colaboradores.">
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
                </Tooltip>
              </div>
              <input
                type="number"
                id="estimatedHours"
                min="1"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value))}
                placeholder="Ex: 20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Exemplo: 20h no total</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="dailyHours" className="text-sm font-medium text-gray-700">
                  Horas/Dia *
                </label>
                <Tooltip content="Quanto cada colaborador deve trabalhar por dia. Máximo 8 horas (limite diário).">
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
                </Tooltip>
              </div>
              <input
                type="number"
                id="dailyHours"
                min="1"
                max="8"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                placeholder="Ex: 8"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Exemplo: 8h por dia</p>
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade *
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              disabled={loading}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {/* Data de Vencimento */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data de Vencimento (opcional)
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              disabled={loading}
            />
          </div>

          {/* Info Card Melhorado */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 mt-6">
            <div className="flex gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Como funciona a divisão de horas?</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Se você criar uma tarefa com <strong>20 horas estimadas</strong> e atribuir 2 colaboradores, cada um deve trabalhar <strong>10 horas</strong> no total. Se definir <strong>8 horas/dia</strong>, a tarefa demorará aproximadamente <strong>1,25 dias</strong> por pessoa.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✕ Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {loading ? '⏳ Criando...' : '✓ Criar Tarefa'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
