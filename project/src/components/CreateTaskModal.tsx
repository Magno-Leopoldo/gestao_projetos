import React, { useState } from 'react';
import { X, HelpCircle, FileText, Clock, AlertCircle, Flag } from 'lucide-react';
import { tasksService } from '../services/tasksService';

interface CreateTaskModalProps {
  stageId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ✨ Componente de Tooltip Responsivo (não fica cortado!)
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setShowTooltip(true);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition(rect.top > 120 ? 'top' : 'bottom');
      // Calcular posição do tooltip (centralizado horizontalmente)
      setTooltipPos({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    }
  };

  return (
    <div
      className="relative inline-block"
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="cursor-help inline-flex">
        {children}
      </div>
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl max-w-sm w-max"
          style={{
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            top: position === 'top' ? tooltipPos.top - 16 : tooltipPos.top + 40,
            left: tooltipPos.left,
            transform: 'translateX(-50%)',
          }}
        >
          {content}
          <div
            className={`absolute border-4 border-transparent left-1/2 transform -translate-x-1/2 ${
              position === 'top' ? 'top-full border-t-gray-900' : 'bottom-full border-b-gray-900'
            }`}
          />
        </div>
      )}
    </div>
  );
};

interface Task {
  id: number;
  title: string;
  status: string;
}

type TaskType = 'paralela' | 'não_paralela' | 'fixa';

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
  const [taskType, setTaskType] = useState<TaskType>('paralela');
  const [dependencies, setDependencies] = useState<number[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar tarefas disponíveis quando modal abre
  React.useEffect(() => {
    if (isOpen) {
      loadAvailableTasks();
    }
  }, [isOpen, stageId]);

  const loadAvailableTasks = async () => {
    try {
      const tasks = await tasksService.getByStage(stageId);
      setAvailableTasks(tasks || []);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
      setAvailableTasks([]);
    }
  };

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

    // ✅ Validação: Se tarefa é "não_paralela", exigir dependências
    if (taskType === 'não_paralela' && dependencies.length === 0) {
      setError('Tarefas do tipo "não_paralela" obrigatoriamente devem ter dependências');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📝 Criando tarefa:', { stageId, title, estimatedHours, dailyHours, priority, taskType, dependencies });

      const response = await tasksService.create(stageId, {
        title: title.trim(),
        description: description.trim() || undefined,
        estimated_hours: estimatedHours,
        daily_hours: dailyHours,
        priority,
        due_date: dueDate || undefined,
        task_type: taskType,
        dependency_ids: dependencies.length > 0 ? dependencies : undefined,
      });

      console.log('✅ Tarefa criada com sucesso:', response);

      // Reset form
      setTitle('');
      setDescription('');
      setEstimatedHours(8);
      setDailyHours(8);
      setPriority('medium');
      setDueDate('');
      setTaskType('paralela');
      setDependencies([]);

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
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header com Gradiente */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0">
          <div>
            <h2 className="text-2xl font-bold">Criar Nova Tarefa</h2>
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
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-gray-50/50">
          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Seção 1: Informações Básicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Informações Básicas</h3>
            </div>

            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Título da Tarefa *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Implementar autenticação com JWT..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white hover:border-gray-400"
                disabled={loading}
              />
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva os detalhes, requisitos e escopo da tarefa..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white hover:border-gray-400 resize-none"
                disabled={loading}
              />
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-200" />

          {/* Seção 2: Configuração de Tempo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Configuração de Tempo</h3>
            </div>

            {/* Horas Estimadas e Horas por Dia */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label htmlFor="estimatedHours" className="text-sm font-semibold text-gray-700">
                    Horas Estimadas *
                  </label>
                  <Tooltip content="Tempo total estimado para completar a tarefa. Será dividido entre os colaboradores atribuídos.">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0" />
                  </Tooltip>
                </div>
                <input
                  type="number"
                  id="estimatedHours"
                  min="1"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseFloat(e.target.value))}
                  placeholder="20"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white hover:border-gray-400"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">⏱️ Tempo total da tarefa</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <label htmlFor="dailyHours" className="text-sm font-semibold text-gray-700">
                    Horas/Dia *
                  </label>
                  <Tooltip content="Quantas horas por dia cada colaborador deve dedicar. Máximo 8h (limite legal diário).">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0" />
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
                  placeholder="8"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white hover:border-gray-400"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">📅 Por colaborador/dia</p>
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-200" />

          {/* Seção 3: Detalhes Adicionais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Flag className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Detalhes Adicionais</h3>
            </div>

            {/* Prioridade */}
            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                Prioridade *
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white hover:border-gray-400"
                disabled={loading}
              >
                <option value="low">🟢 Baixa - Pode ser feita depois</option>
                <option value="medium">🟡 Média - Prioridade normal</option>
                <option value="high">🔴 Alta - Urgente/Crítica</option>
              </select>
            </div>

            {/* Tipo de Tarefa */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label htmlFor="taskType" className="text-sm font-semibold text-gray-700">
                  Tipo de Tarefa *
                </label>
                <Tooltip content={
                  taskType === 'fixa'
                    ? 'Tempo FIXO contratado. Não reduz independente da quantidade de usuários. 50h é sempre 50h'
                    : 'Tempo reduz conforme mais usuários são atribuídos. A conclusão estimada será calculada automaticamente'
                }>
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0" />
                </Tooltip>
              </div>
              <div className="space-y-2">
                {(['paralela', 'não_paralela', 'fixa'] as const).map((type) => (
                  <label key={type} className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{ backgroundColor: taskType === type ? '#eff6ff' : 'transparent' }}>
                    <input
                      type="radio"
                      name="taskType"
                      value={type}
                      checked={taskType === type}
                      onChange={(e) => setTaskType(e.target.value as TaskType)}
                      disabled={loading}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700">
                        {type === 'paralela' && '🔄 Paralela'}
                        {type === 'não_paralela' && '🔗 Não-Paralela'}
                        {type === 'fixa' && '📌 Fixa'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {type === 'paralela' && 'Reduz tempo com mais usuários. Pode começar imediatamente.'}
                        {type === 'não_paralela' && 'Reduz tempo com mais usuários. Começa após tarefas dependentes.'}
                        {type === 'fixa' && 'Tempo não reduz. Sempre o mesmo, independente de usuários.'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              {taskType === 'não_paralela' && (
                <p className="text-xs text-amber-600 mt-2">⚠️ Tarefas do tipo "não_paralela" exigem seleção de dependências</p>
              )}
            </div>

            {/* Dependências (apenas para não_paralela e fixa) */}
            {(taskType === 'não_paralela' || taskType === 'fixa') && (
              <div>
                <label htmlFor="dependencies" className="block text-sm font-semibold text-gray-700 mb-2">
                  {taskType === 'não_paralela' ? 'Tarefas Dependentes *' : 'Tarefas Dependentes (opcional)'}
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                  {availableTasks && availableTasks.length > 0 ? (
                    availableTasks.map((task) => (
                      <label key={task.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={dependencies.includes(task.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDependencies([...dependencies, task.id]);
                            } else {
                              setDependencies(dependencies.filter(id => id !== task.id));
                            }
                          }}
                          disabled={loading}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.status}</p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-gray-600 py-2">Nenhuma tarefa disponível nesta etapa</p>
                  )}
                </div>
                {taskType === 'não_paralela' && dependencies.length === 0 && (
                  <p className="text-xs text-red-600 mt-2">❌ Selecione pelo menos uma tarefa dependente</p>
                )}
              </div>
            )}

            {/* Data de Vencimento */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Data de Vencimento (opcional)
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white hover:border-gray-400"
                disabled={loading}
              />
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-200" />

          {/* Info Card - Dica Dinâmica por Tipo */}
          <div className={`border-l-4 rounded-lg p-5 shadow-sm ${
            taskType === 'fixa'
              ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-purple-500'
              : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border-blue-500'
          }`}>
            <div className="flex gap-4">
              <div className="text-3xl flex-shrink-0">
                {taskType === 'fixa' ? '📌' : taskType === 'não_paralela' ? '🔗' : '🔄'}
              </div>
              <div>
                {taskType === 'fixa' ? (
                  <>
                    <p className={`text-sm font-bold mb-2 ${taskType === 'fixa' ? 'text-purple-900' : 'text-blue-900'}`}>
                      ⏱️ Tarefa de Tempo Fixo
                    </p>
                    <p className={`text-xs leading-relaxed mb-3 ${taskType === 'fixa' ? 'text-purple-800' : 'text-blue-800'}`}>
                      O tempo <span className="font-semibold">não reduz</span> com mais usuários. Se você contratou 50h, são 50h sempre.
                    </p>
                    <ul className={`text-xs space-y-1.5 ${taskType === 'fixa' ? 'text-purple-800' : 'text-blue-800'}`}>
                      <li>• <span className="font-semibold">1 usuário:</span> 50h</li>
                      <li>• <span className="font-semibold">10 usuários:</span> 50h (não muda!)</li>
                      <li>• <span className="font-semibold">100 usuários:</span> ainda 50h</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-blue-900 mb-2">
                      {taskType === 'não_paralela' ? '⏱️ Tarefa Dependente' : '⏱️ Como funciona a divisão de horas?'}
                    </p>
                    <p className="text-xs text-blue-800 leading-relaxed mb-3">
                      Exemplo: Você cria uma tarefa com <span className="font-semibold">20 horas estimadas</span> e define <span className="font-semibold">8 horas/dia</span>.
                    </p>
                    {taskType === 'não_paralela' && (
                      <p className="text-xs text-blue-800 leading-relaxed mb-3 font-semibold">
                        ⚠️ Esta tarefa só pode ser atribuída APÓS suas dependências serem concluídas.
                      </p>
                    )}
                    <ul className="text-xs text-blue-800 space-y-1.5">
                      <li>• <span className="font-semibold">1 colaborador:</span> 20h ÷ 8h/dia = ~3 dias</li>
                      <li>• <span className="font-semibold">2 colaboradores:</span> 10h cada ÷ 8h/dia = ~1,25 dias por pessoa</li>
                      <li>• <span className="font-semibold">4 colaboradores:</span> 5h cada ÷ 8h/dia = ~0,6 dias por pessoa</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✕ Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Criando...
              </>
            ) : (
              '✓ Criar Tarefa'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
