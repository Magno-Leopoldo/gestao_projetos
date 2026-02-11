import { useRef, useCallback, useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

// Faixa: 07:00 – 19:00 = 420..1140 min desde meia-noite
const MIN_MINUTES = 420;  // 07:00
const MAX_MINUTES = 1140; // 19:00
const RANGE = MAX_MINUTES - MIN_MINUTES; // 720
const STEP = 15;
const MIN_DURATION = 15;

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function snap(m: number): number {
  return Math.round(m / STEP) * STEP;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Marcadores de hora para a régua
const HOUR_MARKS: number[] = [];
for (let h = 7; h <= 19; h++) HOUR_MARKS.push(h * 60);

interface Props {
  startTime: string; // "HH:MM"
  endTime: string;
  onChange: (start: string, end: string) => void;
}

export default function TimeRangeSlider({ startTime, endTime, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<'start' | 'end' | 'range' | null>(null);
  const dragOffsetRef = useRef(0);

  const startMin = clamp(timeToMinutes(startTime || '08:00'), MIN_MINUTES, MAX_MINUTES);
  const endMin = clamp(timeToMinutes(endTime || '09:00'), MIN_MINUTES, MAX_MINUTES);
  const durationMin = endMin - startMin;

  // State para feedback visual durante drag
  const [isDragging, setIsDragging] = useState(false);

  const pctOf = (m: number) => ((m - MIN_MINUTES) / RANGE) * 100;

  const minutesFromEvent = useCallback((clientX: number): number => {
    if (!trackRef.current) return MIN_MINUTES;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = (clientX - rect.left) / rect.width;
    const raw = MIN_MINUTES + pct * RANGE;
    return snap(clamp(raw, MIN_MINUTES, MAX_MINUTES));
  }, []);

  const handlePointerDown = useCallback(
    (type: 'start' | 'end' | 'range') => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      draggingRef.current = type;
      setIsDragging(true);

      if (type === 'range') {
        const m = minutesFromEvent(e.clientX);
        dragOffsetRef.current = m - startMin;
      }
    },
    [minutesFromEvent, startMin]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      const m = minutesFromEvent(e.clientX);

      if (draggingRef.current === 'start') {
        const newStart = clamp(m, MIN_MINUTES, endMin - MIN_DURATION);
        onChange(minutesToTime(snap(newStart)), minutesToTime(endMin));
      } else if (draggingRef.current === 'end') {
        const newEnd = clamp(m, startMin + MIN_DURATION, MAX_MINUTES);
        onChange(minutesToTime(startMin), minutesToTime(snap(newEnd)));
      } else if (draggingRef.current === 'range') {
        const dur = endMin - startMin;
        let newStart = snap(m - dragOffsetRef.current);
        newStart = clamp(newStart, MIN_MINUTES, MAX_MINUTES - dur);
        const newEnd = newStart + dur;
        onChange(minutesToTime(newStart), minutesToTime(newEnd));
      }
    },
    [minutesFromEvent, startMin, endMin, onChange]
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
    setIsDragging(false);
  }, []);

  // Cleanup pointer up global (safety)
  useEffect(() => {
    const up = () => { draggingRef.current = null; setIsDragging(false); };
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, []);

  const startPct = pctOf(startMin);
  const endPct = pctOf(endMin);
  const durationHours = Math.floor(durationMin / 60);
  const durationMins = durationMin % 60;
  const durationLabel = durationHours > 0
    ? `${durationHours}h${durationMins > 0 ? `${durationMins}` : ''}`
    : `${durationMins}min`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <Clock className="w-4 h-4" />
          Horário *
        </label>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-blue-700">{minutesToTime(startMin)}</span>
          <span className="text-gray-400">–</span>
          <span className="font-semibold text-blue-700">{minutesToTime(endMin)}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            durationMin < 15 ? 'bg-red-100 text-red-600' :
            durationMin > 240 ? 'bg-amber-100 text-amber-700' :
            'bg-blue-100 text-blue-600'
          }`}>
            {durationLabel}
          </span>
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-12 select-none touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Background track */}
        <div className="absolute top-5 left-0 right-0 h-2 bg-gray-200 rounded-full" />

        {/* Selected range fill */}
        <div
          className={`absolute top-5 h-2 rounded-full transition-colors ${
            isDragging ? 'bg-blue-500' : 'bg-blue-400'
          } cursor-grab active:cursor-grabbing`}
          style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
          onPointerDown={handlePointerDown('range')}
        />

        {/* Start handle */}
        <div
          className={`absolute top-2.5 -ml-3 w-6 h-6 rounded-full border-2 bg-white shadow-md cursor-ew-resize z-10 transition-colors flex items-center justify-center ${
            isDragging && draggingRef.current === 'start'
              ? 'border-blue-600 shadow-lg scale-110'
              : 'border-blue-500 hover:border-blue-600 hover:shadow-lg'
          }`}
          style={{ left: `${startPct}%` }}
          onPointerDown={handlePointerDown('start')}
        >
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </div>

        {/* End handle */}
        <div
          className={`absolute top-2.5 -ml-3 w-6 h-6 rounded-full border-2 bg-white shadow-md cursor-ew-resize z-10 transition-colors flex items-center justify-center ${
            isDragging && draggingRef.current === 'end'
              ? 'border-blue-600 shadow-lg scale-110'
              : 'border-blue-500 hover:border-blue-600 hover:shadow-lg'
          }`}
          style={{ left: `${endPct}%` }}
          onPointerDown={handlePointerDown('end')}
        >
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </div>

        {/* Hour markers */}
        <div className="absolute top-9 left-0 right-0">
          {HOUR_MARKS.map((m) => {
            const pct = pctOf(m);
            const h = m / 60;
            const isMainMark = h % 2 === 0 || h === 7 || h === 19;
            return (
              <div key={m} className="absolute" style={{ left: `${pct}%` }}>
                <div className={`w-px mx-auto ${isMainMark ? 'h-1.5 bg-gray-400' : 'h-1 bg-gray-300'}`} />
                {isMainMark && (
                  <span className="absolute -translate-x-1/2 text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">
                    {h}h
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
