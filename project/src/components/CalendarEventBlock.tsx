import type { CalendarEvent } from '../types';

// Outlook-style: cores sólidas por projeto, borda esquerda por prioridade
const PRIORITY_BORDERS: Record<string, string> = {
  high: '#dc2626',
  medium: '#2563eb',
  low: '#6b7280',
};

// Palette Outlook-inspired: cores mais saturadas e sólidas
const PROJECT_COLORS = [
  { bg: '#dbeafe', text: '#1e40af', sub: '#3b82f6' },   // blue
  { bg: '#fce7f3', text: '#9d174d', sub: '#ec4899' },   // pink
  { bg: '#d1fae5', text: '#065f46', sub: '#10b981' },   // green
  { bg: '#fef3c7', text: '#92400e', sub: '#f59e0b' },   // amber
  { bg: '#ede9fe', text: '#5b21b6', sub: '#8b5cf6' },   // violet
  { bg: '#ffedd5', text: '#9a3412', sub: '#f97316' },   // orange
  { bg: '#cffafe', text: '#155e75', sub: '#06b6d4' },   // cyan
  { bg: '#f3e8ff', text: '#6b21a8', sub: '#a855f7' },   // purple
  { bg: '#fecdd3', text: '#9f1239', sub: '#fb7185' },   // rose
  { bg: '#ecfccb', text: '#3f6212', sub: '#84cc16' },   // lime
];

interface Props {
  event: CalendarEvent;
}

export default function CalendarEventBlock({ event }: Props) {
  const resource = event.resource;

  // During drag, react-big-calendar renders a temporary event without resource
  if (!resource) {
    return (
      <div className="h-full px-2 py-1 overflow-hidden rounded text-xs bg-blue-500/20 border-l-[3px] border-blue-500">
        <div className="font-semibold text-blue-900 truncate">{event.title}</div>
      </div>
    );
  }

  const borderColor = PRIORITY_BORDERS[resource.priority] || '#6b7280';
  const colors = PROJECT_COLORS[resource.project_id % PROJECT_COLORS.length];

  // Tooltip com informações completas (visível ao passar o mouse)
  const tooltip = [
    resource.task_title,
    resource.project_name,
    `${resource.start_time?.slice(0, 5)} – ${resource.end_time?.slice(0, 5)}`,
    resource.notes ? `\n${resource.notes}` : '',
  ].filter(Boolean).join('\n');

  return (
    <div
      className="h-full overflow-hidden rounded-[3px] flex flex-col"
      title={tooltip}
      style={{
        backgroundColor: colors.bg,
        borderLeft: `4px solid ${borderColor}`,
      }}
    >
      <div className="px-2 py-1 flex-1 min-h-0">
        <div className="font-semibold truncate leading-snug" style={{ color: colors.text, fontSize: '11px' }}>
          {resource.task_title}
        </div>
        <div className="truncate leading-snug mt-px" style={{ color: colors.sub, fontSize: '10px' }}>
          {resource.project_name}
        </div>
        <div className="truncate leading-snug mt-px" style={{ color: colors.sub, fontSize: '10px', opacity: 0.7 }}>
          {resource.start_time?.slice(0, 5)} – {resource.end_time?.slice(0, 5)}
        </div>
        {resource.notes && (
          <div className="truncate leading-snug mt-px italic" style={{ color: colors.text, fontSize: '10px', opacity: 0.6 }}>
            {resource.notes}
          </div>
        )}
      </div>
    </div>
  );
}
