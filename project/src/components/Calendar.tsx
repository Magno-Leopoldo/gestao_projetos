import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RefreshCw, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { calendarService } from '../services/calendarService';
import { usersService } from '../services/usersService';
import CalendarSidebar from './CalendarSidebar';
import CalendarEventBlock from './CalendarEventBlock';
import CalendarAllocationModal from './CalendarAllocationModal';
import type { CalendarAllocation, CalendarEvent, UnallocatedTask, DailySummary, User } from '../types';
import type { DeleteScope } from './CalendarAllocationModal';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

// Setup localizer
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// DnD calendar
const DnDCalendar = withDragAndDrop(BigCalendar as any);

// Helpers
function toDateObj(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  const [h, min] = timeStr.slice(0, 5).split(':').map(Number);
  return new Date(y, m - 1, d, h, min);
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toTimeStr(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Snap de 15min — corrige arredondamento do react-big-calendar nas bordas
function snapTo15(d: Date): Date {
  const snapped = new Date(d);
  const mins = snapped.getMinutes();
  const rounded = Math.round(mins / 15) * 15;
  snapped.setMinutes(rounded, 0, 0);
  return snapped;
}

type ViewType = 'day' | 'week' | 'month';

const messages = {
  today: 'Hoje',
  previous: '<',
  next: '>',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  noEventsInRange: 'Nenhuma alocação neste período',
  showMore: (total: number) => `+${total} mais`,
};

export default function Calendar() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const isAdminOrSupervisor = isAdmin || profile?.role === 'supervisor';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('week');
  const [allocations, setAllocations] = useState<CalendarAllocation[]>([]);
  const [unallocatedTasks, setUnallocatedTasks] = useState<UnallocatedTask[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  // User selector for admin/supervisor
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
  const isViewingOther = isAdminOrSupervisor && selectedUserId !== undefined && selectedUserId !== profile?.id;
  // Admin pode editar calendário de outros; supervisor só visualiza
  const isReadOnly = isViewingOther && !isAdmin;

  // Load users list for admin/supervisor
  useEffect(() => {
    if (!isAdminOrSupervisor) return;
    usersService.getAll().then((u: User[]) => {
      setUsers(u.filter((x) => x.is_active));
    }).catch(() => {});
  }, [isAdminOrSupervisor]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<CalendarAllocation | null>(null);
  const [modalDefaults, setModalDefaults] = useState<{
    date?: string; start?: string; end?: string; taskId?: number;
  }>({});
  const [modalError, setModalError] = useState<string | null>(null);

  // Dragging from sidebar
  const [draggedTask, setDraggedTask] = useState<UnallocatedTask | null>(null);

  // Evitar race condition: ignorar respostas de requests antigos
  const fetchIdRef = useRef(0);

  // Convert allocations to events
  const events: CalendarEvent[] = useMemo(
    () =>
      allocations.map((a) => ({
        id: a.id,
        title: a.task_title,
        start: toDateObj(a.allocation_date, a.start_time),
        end: toDateObj(a.allocation_date, a.end_time),
        resource: a,
      })),
    [allocations]
  );

  // Date range for fetching
  const getRange = useCallback((d: Date, v: ViewType) => {
    if (v === 'month') {
      const start = subDays(startOfMonth(d), 7);
      const end = addDays(endOfMonth(d), 7);
      return { start: toDateStr(start), end: toDateStr(end) };
    }
    // week/day: fetch month-wide for smooth navigation
    const start = subDays(startOfMonth(d), 7);
    const end = addDays(endOfMonth(d), 7);
    return { start: toDateStr(start), end: toDateStr(end) };
  }, []);

  // Fetch allocations & sidebar data
  const fetchData = useCallback(async () => {
    const thisId = ++fetchIdRef.current;
    setLoading(true);
    try {
      const range = getRange(currentDate, view);
      const [allocs, tasks] = await Promise.all([
        calendarService.getAllocations(range.start, range.end, selectedUserId),
        calendarService.getUnallocatedTasks(selectedUserId),
      ]);
      // Ignorar resposta se uma navegação mais recente já disparou outro fetch
      if (thisId !== fetchIdRef.current) return;
      setAllocations(allocs);
      setUnallocatedTasks(tasks);
    } catch (err) {
      if (thisId !== fetchIdRef.current) return;
      console.error('Erro ao carregar calendário:', err);
    } finally {
      if (thisId === fetchIdRef.current) setLoading(false);
    }
  }, [currentDate, view, getRange, selectedUserId]);

  // Fetch daily summary
  const summaryIdRef = useRef(0);
  const fetchSummary = useCallback(async (d: Date) => {
    const thisId = ++summaryIdRef.current;
    try {
      const s = await calendarService.getDailySummary(toDateStr(d), selectedUserId);
      if (thisId !== summaryIdRef.current) return;
      setSummary(s);
    } catch {
      // ignore
    }
  }, [selectedUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchSummary(currentDate);
  }, [currentDate, fetchSummary, allocations]);

  // --- Handlers ---

  // Click on empty slot → open create modal
  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    if (isReadOnly) return;
    const s = snapTo15(start);
    const e = snapTo15(end);
    setEditingAllocation(null);
    setModalDefaults({
      date: toDateStr(s),
      start: toTimeStr(s),
      end: toTimeStr(e),
    });
    setModalError(null);
    setModalOpen(true);
  }, [isReadOnly]);

  // Click on event → open edit modal
  const handleSelectEvent = useCallback((event: object) => {
    if (isReadOnly) return;
    const calEvent = event as CalendarEvent;
    setEditingAllocation(calEvent.resource);
    setModalDefaults({});
    setModalError(null);
    setModalOpen(true);
  }, [isReadOnly]);

  // Drag & drop or resize existing event
  const handleEventDropOrResize = useCallback(
    async ({ event, start, end }: { event: object; start: string | Date; end: string | Date }) => {
      if (isReadOnly) { await fetchData(); return; }
      const calEvent = event as CalendarEvent;
      const startDate = snapTo15(start instanceof Date ? start : new Date(start));
      const endDate = snapTo15(end instanceof Date ? end : new Date(end));
      try {
        await calendarService.updateAllocation(calEvent.id, {
          allocation_date: toDateStr(startDate),
          start_time: toTimeStr(startDate),
          end_time: toTimeStr(endDate),
        });
        await fetchData();
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Erro ao mover alocação';
        alert(msg);
        await fetchData();
      }
    },
    [fetchData, isReadOnly]
  );

  // Drop from sidebar
  const handleDropFromOutside = useCallback(
    ({ start, end }: { start: string | Date; end: string | Date }) => {
      if (!draggedTask || isReadOnly) return;
      const startDate = snapTo15(start instanceof Date ? start : new Date(start));
      const endDate = snapTo15(end instanceof Date ? end : new Date(end));
      setEditingAllocation(null);
      setModalDefaults({
        date: toDateStr(startDate),
        start: toTimeStr(startDate),
        end: toTimeStr(endDate),
        taskId: draggedTask.task_id,
      });
      setModalError(null);
      setModalOpen(true);
      setDraggedTask(null);
    },
    [draggedTask, isReadOnly]
  );

  // user_id do alvo quando admin gerencia calendário de outro
  const targetUserId = isAdmin && isViewingOther ? selectedUserId : undefined;

  // Save (create or update)
  const handleSave = useCallback(
    async (data: {
      task_id: number;
      allocation_date: string;
      start_time: string;
      end_time: string;
      notes?: string;
    }) => {
      setModalError(null);
      try {
        if (editingAllocation) {
          const result = await calendarService.updateAllocation(editingAllocation.id, data);
          if (result.warning) alert(result.warning);
        } else {
          const result = await calendarService.createAllocation({ ...data, user_id: targetUserId });
          if (result.warning) alert(result.warning);
        }
        setModalOpen(false);
        setEditingAllocation(null);
        await fetchData();
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Erro ao salvar alocação';
        setModalError(msg);
        throw err;
      }
    },
    [editingAllocation, fetchData, targetUserId]
  );

  // Save batch (multiple days)
  const handleSaveBatch = useCallback(
    async (data: {
      task_id: number;
      start_date: string;
      end_date: string;
      start_time: string;
      end_time: string;
      notes?: string;
      skip_weekends?: boolean;
    }) => {
      setModalError(null);
      try {
        const result = await calendarService.createBatchAllocations({ ...data, user_id: targetUserId });
        if (result.data.failed > 0) {
          const failedDates = result.data.results
            .filter((r) => !r.success)
            .map((r) => r.date)
            .join(', ');
          alert(`${result.message}\nConflitos em: ${failedDates}`);
        }
        setModalOpen(false);
        setEditingAllocation(null);
        await fetchData();
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Erro ao criar alocações';
        setModalError(msg);
        throw err;
      }
    },
    [fetchData, targetUserId]
  );

  // Delete with scope
  const handleDelete = useCallback(
    async (id: number, scope: DeleteScope) => {
      try {
        if (scope === 'single') {
          await calendarService.deleteAllocation(id);
        } else {
          // 'day' or 'task' — use batch delete with the editing allocation's info
          if (!editingAllocation) return;
          await calendarService.deleteBatchAllocations({
            scope,
            task_id: editingAllocation.task_id,
            allocation_date: scope === 'day' ? editingAllocation.allocation_date.slice(0, 10) : undefined,
            user_id: targetUserId,
          });
        }
        setModalOpen(false);
        setEditingAllocation(null);
        await fetchData();
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Erro ao remover alocação';
        setModalError(msg);
      }
    },
    [fetchData, editingAllocation, targetUserId]
  );

  // Drag from outside requires this
  const dragFromOutsideItem = useCallback(() => {
    if (!draggedTask) return null;
    return { title: draggedTask.task_title } as any;
  }, [draggedTask]);

  // Custom event component
  const components = useMemo(
    () => ({
      event: CalendarEventBlock,
    }),
    []
  );

  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Calendário</h1>
          {isAdminOrSupervisor && users.length > 0 && (
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <Eye className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={selectedUserId ?? ''}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : undefined)}
                className="px-2.5 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-700"
              >
                <option value="">Meu calendário</option>
                {users
                  .filter((u) => u.id !== profile?.id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role})
                    </option>
                  ))}
              </select>
              {isViewingOther && (
                isAdmin ? (
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">
                    Gerenciando
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">
                    Visualização
                  </span>
                )
              )}
            </div>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Main content */}
      <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100% - 2.75rem)' }}>
        {/* Sidebar */}
        <CalendarSidebar
          tasks={unallocatedTasks}
          summary={summary}
          onDragStart={setDraggedTask}
        />

        {/* Calendar */}
        <div className="flex-1 overflow-hidden">
          <DnDCalendar
            localizer={localizer}
            culture="pt-BR"
            events={events}
            date={currentDate}
            view={view}
            views={[Views.DAY, Views.WEEK, Views.MONTH]}
            onNavigate={setCurrentDate}
            onView={(v: string) => setView(v as ViewType)}
            defaultView={Views.WEEK}
            min={new Date(2000, 0, 1, 7, 0)}
            max={new Date(2000, 0, 1, 19, 0)}
            step={15}
            timeslots={4}
            selectable={!isReadOnly}
            resizable={!isReadOnly}
            draggableAccessor={() => !isReadOnly}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={handleEventDropOrResize}
            onEventResize={handleEventDropOrResize}
            onDropFromOutside={isReadOnly ? undefined : handleDropFromOutside}
            dragFromOutsideItem={isReadOnly ? undefined : dragFromOutsideItem}
            messages={messages}
            components={components}
            style={{ height: '100%' }}
            eventPropGetter={() => ({
              style: { padding: 0, border: 'none', backgroundColor: 'transparent' },
            })}
          />
        </div>
      </div>

      {/* Modal */}
      <CalendarAllocationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAllocation(null);
          setModalError(null);
        }}
        onSave={handleSave}
        onSaveBatch={handleSaveBatch}
        onDelete={handleDelete}
        tasks={unallocatedTasks}
        allocation={editingAllocation}
        defaultDate={modalDefaults.date}
        defaultStart={modalDefaults.start}
        defaultEnd={modalDefaults.end}
        defaultTaskId={modalDefaults.taskId}
        error={modalError}
      />
    </div>
  );
}
