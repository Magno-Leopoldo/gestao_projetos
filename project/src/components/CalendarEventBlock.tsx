import type { CalendarEvent } from '../types';

const PRIORITY_BORDER_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#3b82f6',
  low: '#9ca3af',
};

const PROJECT_PALETTE = [
  '#dbeafe', '#fce7f3', '#d1fae5', '#fef3c7', '#ede9fe',
  '#ffedd5', '#cffafe', '#f3e8ff', '#fecdd3', '#d9f99d',
];

interface Props {
  event: CalendarEvent;
}

export default function CalendarEventBlock({ event }: Props) {
  const resource = event.resource;

  // During drag, react-big-calendar renders a temporary event without resource
  if (!resource) {
    return (
      <div className="h-full px-1.5 py-0.5 overflow-hidden rounded-sm text-xs bg-blue-100 border-l-[3px] border-blue-400">
        <div className="font-semibold text-gray-900 truncate leading-tight">{event.title}</div>
      </div>
    );
  }

  const borderColor = PRIORITY_BORDER_COLORS[resource.priority] || '#9ca3af';
  const bgColor = PROJECT_PALETTE[resource.project_id % PROJECT_PALETTE.length];

  return (
    <div
      className="h-full px-1.5 py-0.5 overflow-hidden rounded-sm text-xs"
      style={{
        backgroundColor: bgColor,
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      <div className="font-semibold text-gray-900 truncate leading-tight">
        {resource.task_title}
      </div>
      <div className="text-gray-600 truncate leading-tight">
        {resource.project_name}
      </div>
      <div className="text-gray-500 leading-tight">
        {resource.start_time?.slice(0, 5)} – {resource.end_time?.slice(0, 5)}
      </div>
    </div>
  );
}
