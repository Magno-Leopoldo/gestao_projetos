import React from 'react';
import { X, Clock, Briefcase, PauseCircle, RotateCcw } from 'lucide-react';
import { TimeEntrySession } from '../types';
import { timeEntriesService } from '../services/timeEntriesService';

interface SessionDetailsModalProps {
  session: TimeEntrySession | null;
  isOpen: boolean;
  onClose: () => void;
}

const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !session) return null;

  // Usar dados que já vêm da API
  const durationSeconds = session.duration_total_seconds || (session.duration_minutes ? session.duration_minutes * 60 : 0);
  const pausedSeconds = session.paused_total_seconds || (session.paused_minutes ? session.paused_minutes * 60 : 0);
  const totalSeconds = durationSeconds + pausedSeconds;

  // Função para formatar segundos em HH:MM:SS
  const formatSeconds = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    if (hours > 0) {
      return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
    return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Detalhes da Sessão</h2>
            <p className="text-emerald-100 text-sm mt-1">
              {session.status === 'stopped' && '✓ Finalizada'}
              {session.status === 'running' && '▶️ Em andamento'}
              {session.status === 'paused' && '⏸️ Pausada'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white hover:bg-emerald-500 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tempo Total - Destaque Principal */}
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-8 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold opacity-90 tracking-wider">TEMPO TOTAL</span>
            </div>
            <p className="text-5xl md:text-6xl font-bold tracking-tight">{formatSeconds(totalSeconds)}</p>
            <p className="text-cyan-100 text-sm mt-2 font-medium">Duração total da sessão</p>
          </div>

          {/* Grid de Métricas 2 Colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tempo Dedicado (Trabalhando) */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Briefcase className="w-4 h-4 text-green-700" />
                </div>
                <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Tempo Dedicado</span>
              </div>
              <p className="text-3xl font-bold text-green-900 mb-1">{formatSeconds(durationSeconds)}</p>
              <p className="text-xs text-green-600 font-medium">{timeEntriesService.formatDuration(durationSeconds / 3600)}</p>
            </div>

            {/* Tempo em Pausa */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <PauseCircle className="w-4 h-4 text-amber-700" />
                </div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Tempo em Pausa</span>
              </div>
              <p className="text-3xl font-bold text-amber-900 mb-1">{formatSeconds(pausedSeconds)}</p>
              <p className="text-xs text-amber-600 font-medium">{timeEntriesService.formatDuration(pausedSeconds / 3600)}</p>
            </div>
          </div>

          {/* Quantas Vezes Pausou */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <RotateCcw className="w-4 h-4 text-orange-700" />
              </div>
              <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Pausas</span>
            </div>
            <p className="text-3xl font-bold text-orange-900">
              {session.pause_count || 0} <span className="text-lg font-semibold">{(session.pause_count || 0) === 1 ? 'vez' : 'vezes'}</span>
            </p>
          </div>

          {/* Horários */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border-2 border-gray-200">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horários
            </h4>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Início</p>
                <p className="text-sm font-bold text-gray-900 break-words">
                  {new Date(session.start_time).toLocaleString('pt-BR')}
                </p>
              </div>
              {session.end_time && (
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Fim</p>
                  <p className="text-sm font-bold text-gray-900 break-words">
                    {new Date(session.end_time).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
              {!session.end_time && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <p className="text-sm font-semibold text-blue-900">
                    {session.status === 'running' ? '▶️ Em andamento' : '⏸️ Pausada'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          {session.notes && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">📝 Notas</p>
              <p className="text-sm text-blue-900 break-words leading-relaxed bg-white rounded-lg p-3 border border-blue-100">{session.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-slate-50 border-t-2 border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 hover:shadow-lg transition-all active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsModal;
