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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Detalhes da Sessão</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Tempo Total - Destaque Principal */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6" />
              <span className="text-sm font-semibold opacity-90">TEMPO TOTAL</span>
            </div>
            <p className="text-4xl md:text-5xl font-bold">{formatSeconds(totalSeconds)}</p>
          </div>

          {/* Grid de Métricas 2 Colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tempo Dedicado (Trabalhando) */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-5 border border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-5 h-5 text-green-600" />
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Tempo Dedicado</span>
              </div>
              <p className="text-3xl font-bold text-green-900 mb-1">{formatSeconds(durationSeconds)}</p>
              <p className="text-xs text-green-600">{timeEntriesService.formatDuration(durationSeconds / 3600)}</p>
            </div>

            {/* Tempo em Pausa */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-5 border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <PauseCircle className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Tempo em Pausa</span>
              </div>
              <p className="text-3xl font-bold text-amber-900 mb-1">{formatSeconds(pausedSeconds)}</p>
              <p className="text-xs text-amber-600">{timeEntriesService.formatDuration(pausedSeconds / 3600)}</p>
            </div>
          </div>

          {/* Quantas Vezes Pausou */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-5 border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-5 h-5 text-orange-600" />
              <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Pausas</span>
            </div>
            <p className="text-3xl font-bold text-orange-900">
              {session.pause_count || 0} <span className="text-lg">{(session.pause_count || 0) === 1 ? 'vez' : 'vezes'}</span>
            </p>
          </div>

          {/* Horários */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4">Horários</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Início</p>
                  <p className="text-sm font-semibold text-gray-900 break-words">
                    {new Date(session.start_time).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              {session.end_time && (
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Fim</p>
                    <p className="text-sm font-semibold text-gray-900 break-words">
                      {new Date(session.end_time).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
              {!session.end_time && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <p className="text-sm font-semibold text-blue-900">
                    {session.status === 'running' ? 'Em andamento' : 'Pausada'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          {session.notes && (
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Notas</p>
              <p className="text-sm text-blue-900 break-words">{session.notes}</p>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex justify-center pt-2">
            <span
              className={`px-6 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2 ${
                session.status === 'stopped'
                  ? 'bg-green-100 text-green-800'
                  : session.status === 'running'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {session.status === 'stopped' && '✓ Finalizada'}
              {session.status === 'running' && '▶️ Em andamento'}
              {session.status === 'paused' && '⏸️ Pausada'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 border-t border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsModal;
