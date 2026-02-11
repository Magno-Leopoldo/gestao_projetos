import { useState } from 'react';
import { Search, GripVertical, Clock, ListTodo } from 'lucide-react';
import type { UnallocatedTask, DailySummary } from '../types';

const PRIORITY_STYLES: Record<string, { border: string; dot: string }> = {
  high: { border: 'border-l-red-500', dot: 'bg-red-500' },
  medium: { border: 'border-l-blue-500', dot: 'bg-blue-500' },
  low: { border: 'border-l-gray-400', dot: 'bg-gray-400' },
};

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

interface Props {
  tasks: UnallocatedTask[];
  summary: DailySummary | null;
  onDragStart: (task: UnallocatedTask) => void;
}

export default function CalendarSidebar({ tasks, summary, onDragStart }: Props) {
  const [search, setSearch] = useState('');

  const filtered = tasks.filter(
    (t) =>
      t.task_title.toLowerCase().includes(search.toLowerCase()) ||
      t.project_name.toLowerCase().includes(search.toLowerCase())
  );

  // Barra de progresso diário
  const usedHours = summary?.total_allocated_hours ?? 0;
  const maxHours = summary?.max_hours ?? 8;
  const pct = Math.min((usedHours / maxHours) * 100, 100);
  const barColor = pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-400' : 'bg-emerald-500';
  const barBg = pct >= 100 ? 'bg-red-100' : pct >= 75 ? 'bg-amber-100' : 'bg-emerald-100';

  return (
    <div className="w-64 flex-shrink-0 bg-gray-50/80 border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Resumo do dia */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Resumo do dia</span>
        </div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-lg font-bold text-gray-900">{usedHours.toFixed(1)}h</span>
          <span className="text-xs text-gray-400">de {maxHours}h</span>
        </div>
        <div className={`w-full ${barBg} rounded-full h-1.5`}>
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {summary && summary.allocations_count > 0 && (
          <div className="mt-1.5 text-[11px] text-gray-400">
            {summary.allocations_count} bloco{summary.allocations_count !== 1 ? 's' : ''} · {summary.remaining_hours.toFixed(1)}h disponíveis
          </div>
        )}
      </div>

      {/* Busca */}
      <div className="px-3 py-2 border-b border-gray-200 bg-white">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar tarefa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Lista de tarefas */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          <div className="flex items-center gap-1.5 mb-2">
            <ListTodo className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Não alocadas ({filtered.length})
            </span>
          </div>

          {filtered.length === 0 && (
            <p className="text-xs text-gray-400 py-4 text-center">
              {search ? 'Nenhuma tarefa encontrada' : 'Todas as tarefas alocadas'}
            </p>
          )}

          <div className="space-y-1">
            {filtered.map((task) => {
              const style = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.low;
              return (
                <div
                  key={task.task_id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify(task));
                    onDragStart(task);
                  }}
                  className={`bg-white rounded-md border border-gray-200 border-l-[3px] ${style.border} px-2.5 py-2 cursor-grab active:cursor-grabbing hover:shadow-sm hover:border-gray-300 transition-all group`}
                >
                  <div className="flex items-start gap-1.5">
                    <GripVertical className="w-3 h-3 text-gray-300 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-800 truncate leading-tight">
                        {task.task_title}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
                        {task.project_name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        <span className="text-[10px] text-gray-400">{PRIORITY_LABELS[task.priority]}</span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{task.estimated_hours}h est.</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
