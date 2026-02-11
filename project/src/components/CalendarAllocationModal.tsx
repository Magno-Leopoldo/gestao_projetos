import { useState, useEffect, useMemo } from 'react';
import { X, Trash2, AlertTriangle, CalendarRange, Copy } from 'lucide-react';
import type { CalendarAllocation, UnallocatedTask } from '../types';
import TimeRangeSlider from './TimeRangeSlider';

interface SaveSingleData {
  task_id: number;
  allocation_date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

interface SaveBatchData {
  task_id: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  skip_weekends?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SaveSingleData) => Promise<void>;
  onSaveBatch?: (data: SaveBatchData) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  tasks: UnallocatedTask[];
  allocation?: CalendarAllocation | null;
  defaultDate?: string;
  defaultStart?: string;
  defaultEnd?: string;
  defaultTaskId?: number;
  error?: string | null;
}

function countWeekdays(start: string, end: string, skipWeekends: boolean): number {
  if (!start || !end) return 0;
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const dow = cur.getDay();
    if (!skipWeekends || (dow !== 0 && dow !== 6)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export default function CalendarAllocationModal({
  isOpen,
  onClose,
  onSave,
  onSaveBatch,
  onDelete,
  tasks,
  allocation,
  defaultDate,
  defaultStart,
  defaultEnd,
  defaultTaskId,
  error,
}: Props) {
  const isEdit = !!allocation;

  const [taskId, setTaskId] = useState<number | ''>(defaultTaskId ?? '');
  const [startDate, setStartDate] = useState(defaultDate ?? '');
  const [endDate, setEndDate] = useState(defaultDate ?? '');
  const [startTime, setStartTime] = useState(defaultStart ?? '08:00');
  const [endTime, setEndTime] = useState(defaultEnd ?? '09:00');
  const [notes, setNotes] = useState('');
  const [skipWeekends, setSkipWeekends] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (allocation) {
      setTaskId(allocation.task_id);
      setStartDate(allocation.allocation_date.slice(0, 10));
      setEndDate(allocation.allocation_date.slice(0, 10));
      setStartTime(allocation.start_time.slice(0, 5));
      setEndTime(allocation.end_time.slice(0, 5));
      setNotes(allocation.notes ?? '');
    } else {
      setTaskId(defaultTaskId ?? '');
      setStartDate(defaultDate ?? '');
      setEndDate(defaultDate ?? '');
      setStartTime(defaultStart ?? '08:00');
      setEndTime(defaultEnd ?? '09:00');
      setNotes('');
    }
    setLocalError(null);
    setSkipWeekends(true);
  }, [allocation, defaultDate, defaultStart, defaultEnd, defaultTaskId, isOpen]);

  const isMultiDay = startDate && endDate && startDate !== endDate;
  const dayCount = useMemo(
    () => countWeekdays(startDate, endDate, skipWeekends),
    [startDate, endDate, skipWeekends]
  );

  // Calcular duração
  const durationMin = (() => {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  })();

  const handleSubmit = async () => {
    if (!taskId || !startDate || !startTime || !endTime) {
      setLocalError('Preencha todos os campos obrigatórios');
      return;
    }
    if (durationMin < 15) {
      setLocalError('Duração mínima é de 15 minutos');
      return;
    }
    if (endDate && endDate < startDate) {
      setLocalError('Data fim não pode ser anterior à data início');
      return;
    }
    setSaving(true);
    setLocalError(null);
    try {
      if (isMultiDay && onSaveBatch && !isEdit) {
        await onSaveBatch({
          task_id: Number(taskId),
          start_date: startDate,
          end_date: endDate,
          start_time: startTime,
          end_time: endTime,
          notes: notes || undefined,
          skip_weekends: skipWeekends,
        });
      } else {
        await onSave({
          task_id: Number(taskId),
          allocation_date: startDate,
          start_time: startTime,
          end_time: endTime,
          notes: notes || undefined,
        });
      }
    } catch {
      // error handled via error prop
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!allocation || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(allocation.id);
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  const displayError = error || localError;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Editar Alocação' : 'Nova Alocação'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {displayError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Tarefa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tarefa *</label>
            {isEdit ? (
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                {allocation?.task_title}
                <span className="text-xs text-gray-500 ml-2">({allocation?.project_name})</span>
              </div>
            ) : (
              <select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma tarefa...</option>
                {tasks.map((t) => (
                  <option key={t.task_id} value={t.task_id}>
                    {t.task_title} — {t.project_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Período */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
              <CalendarRange className="w-4 h-4" />
              {isEdit ? 'Data *' : 'Período *'}
            </label>
            {isEdit ? (
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setEndDate(e.target.value); }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-500">De</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (!endDate || e.target.value > endDate) setEndDate(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Até</span>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {isMultiDay && (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Copy className="w-4 h-4" />
                      <span className="font-medium">{dayCount} dia{dayCount !== 1 ? 's' : ''}</span>
                      <span className="text-blue-500">— mesmo horário em cada dia</span>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs text-blue-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={skipWeekends}
                        onChange={(e) => setSkipWeekends(e.target.checked)}
                        className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                      />
                      Pular fins de semana
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Horário — slider de faixa */}
          <TimeRangeSlider
            startTime={startTime}
            endTime={endTime}
            onChange={(s, e) => { setStartTime(s); setEndTime(e); }}
          />

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Observações opcionais..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div>
            {isEdit && onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Removendo...' : 'Remover'}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
            >
              {saving
                ? 'Salvando...'
                : isEdit
                  ? 'Atualizar'
                  : isMultiDay
                    ? `Criar ${dayCount} alocações`
                    : 'Criar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
