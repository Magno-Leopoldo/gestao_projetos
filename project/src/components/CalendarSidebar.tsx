import { useState } from 'react';
import { Search, GripVertical } from 'lucide-react';
import type { UnallocatedTask, DailySummary } from '../types';

const PRIORITY_COLORS: Record<string, string> = {
  high: 'border-red-400 bg-red-50',
  medium: 'border-blue-400 bg-blue-50',
  low: 'border-gray-300 bg-gray-50',
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
  const barColor = pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Resumo do dia */}
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Resumo do Dia</h3>
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{usedHours.toFixed(1)}h alocadas</span>
          <span>{maxHours}h máximo</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {summary && (
          <div className="mt-1 text-xs text-gray-500">
            {summary.allocations_count} alocação{summary.allocations_count !== 1 ? 'ões' : ''} · Restam {summary.remaining_hours.toFixed(1)}h
          </div>
        )}
      </div>

      {/* Busca */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar tarefa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de tarefas */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1 mb-1">
          Tarefas não alocadas ({filtered.length})
        </h3>
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 px-1">Nenhuma tarefa encontrada</p>
        )}
        {filtered.map((task) => (
          <div
            key={task.task_id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', JSON.stringify(task));
              onDragStart(task);
            }}
            className={`p-2 rounded-lg border-l-4 cursor-grab active:cursor-grabbing hover:shadow-sm transition ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low}`}
          >
            <div className="flex items-start gap-1">
              <GripVertical className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {task.task_title}
                </div>
                <div className="text-xs text-gray-500 truncate">{task.project_name}</div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span className="font-medium">{PRIORITY_LABELS[task.priority]}</span>
                  <span>·</span>
                  <span>{(task.remaining_minutes / 60).toFixed(1)}h restantes</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
