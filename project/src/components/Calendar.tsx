import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const isAdminOrSupervisor = profile?.role === 'admin' || profile?.role === 'supervisor';

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
    setLoading(true);
    try {
      const range = getRange(currentDate, view);
      const [allocs, tasks] = await Promise.all([
        calendarService.getAllocations(range.start, range.end, selectedUserId),
        calendarService.getUnallocatedTasks(selectedUserId),
      ]);
      setAllocations(allocs);
      setUnallocatedTasks(tasks);
    } catch (err) {
      console.error('Erro ao carregar calendário:', err);
    } finally {
      setLoading(false);
    }
  }, [currentDate, view, getRange, selectedUserId]);

  // Fetch daily summary
  const fetchSummary = useCallback(async (d: Date) => {
    try {
      const s = await calendarService.getDailySummary(toDateStr(d), selectedUserId);
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

  // Click on empty slot → open create modal (only own calendar)
  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    if (isViewingOther) return;
    setEditingAllocation(null);
    setModalDefaults({
      date: toDateStr(start),
      start: toTimeStr(start),
      end: toTimeStr(end),
    });
    setModalError(null);
    setModalOpen(true);
  }, [isViewingOther]);

  // Click on event → open edit modal (only own calendar)
  const handleSelectEvent = useCallback((event: object) => {
    if (isViewingOther) return;
    const calEvent = event as CalendarEvent;
    setEditingAllocation(calEvent.resource);
    setModalDefaults({});
    setModalError(null);
    setModalOpen(true);
  }, [isViewingOther]);

  // Drag & drop or resize existing event (only own calendar)
  const handleEventDropOrResize = useCallback(
    async ({ event, start, end }: { event: object; start: string | Date; end: string | Date }) => {
      if (isViewingOther) { await fetchData(); return; }
      const calEvent = event as CalendarEvent;
      const startDate = start instanceof Date ? start : new Date(start);
      const endDate = end instanceof Date ? end : new Date(end);
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
    [fetchData, isViewingOther]
  );

  // Drop from sidebar (only own calendar)
  const handleDropFromOutside = useCallback(
    ({ start, end }: { start: string | Date; end: string | Date }) => {
      if (!draggedTask || isViewingOther) return;
      const startDate = start instanceof Date ? start : new Date(start);
      const endDate = end instanceof Date ? end : new Date(end);
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
    [draggedTask, isViewingOther]
  );

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
          const result = await calendarService.createAllocation(data);
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
    [editingAllocation, fetchData]
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
        const result = await calendarService.createBatchAllocations(data);
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
    [fetchData]
  );

  // Delete
  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await calendarService.deleteAllocation(id);
        setModalOpen(false);
        setEditingAllocation(null);
        await fetchData();
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Erro ao remover alocação';
        setModalError(msg);
      }
    },
    [fetchData]
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
          {isAdminOrSupervisor && users.length > 0 && (
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <select
                value={selectedUserId ?? ''}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : undefined)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-medium">
                  Somente visualização
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Main content */}
      <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100% - 3.5rem)' }}>
        {/* Sidebar */}
        <CalendarSidebar
          tasks={unallocatedTasks}
          summary={summary}
          onDragStart={setDraggedTask}
        />

        {/* Calendar */}
        <div className="flex-1 p-2 overflow-hidden calendar-container">
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
            selectable={!isViewingOther}
            resizable={!isViewingOther}
            draggableAccessor={() => !isViewingOther}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={handleEventDropOrResize}
            onEventResize={handleEventDropOrResize}
            onDropFromOutside={isViewingOther ? undefined : handleDropFromOutside}
            dragFromOutsideItem={isViewingOther ? undefined : dragFromOutsideItem}
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
