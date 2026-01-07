import React, { useState, useEffect } from 'react';
import { TimeEntrySession, DayStatusSummary } from '../types';
import { timeEntriesService } from '../services/timeEntriesService';

interface TimeTrackingControlsProps {
  taskId: number;
  activeSession: TimeEntrySession | null;
  dayStatus: DayStatusSummary;
  onSessionChange: () => void;
}

const TimeTrackingControls: React.FC<TimeTrackingControlsProps> = ({
  taskId,
  activeSession,
  dayStatus,
  onSessionChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [detailedTime, setDetailedTime] = useState({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, totalMinutes: 0 });
  const [detailedPausedTime, setDetailedPausedTime] = useState({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // Update elapsed time in real-time (every 100ms for smooth animation)
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const elapsed = timeEntriesService.calculateElapsedTime(activeSession);
      const detailed = timeEntriesService.getDetailedElapsedTime(activeSession);
      // ✅ NOVO: Calcular tempo pausado em tempo real (incrementa a cada 100ms quando pausado)
      const pausedTime = timeEntriesService.getDetailedPausedTime(activeSession);

      setElapsedTime(elapsed);
      setDetailedTime(detailed);
      setDetailedPausedTime(pausedTime);
    }, 100);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handlePlay = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!canContinue) {
        setError('Limite de 8 horas diárias atingido. Não é possível iniciar nova sessão.');
        return;
      }

      const result = await timeEntriesService.startSession(taskId, notes);

      if (result.warnings && result.warnings.length > 0) {
        console.warn('Avisos ao iniciar sessão:', result.warnings);
      }

      setNotes('');
      onSessionChange();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Erro ao iniciar sessão de rastreamento';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!activeSession) throw new Error('Nenhuma sessão ativa');

      await timeEntriesService.pauseSession(taskId, activeSession.id);
      onSessionChange();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao pausar sessão';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!activeSession) throw new Error('Nenhuma sessão pausada');

      await timeEntriesService.resumeSession(taskId, activeSession.id);
      onSessionChange();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Erro ao retomar sessão';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!activeSession) throw new Error('Nenhuma sessão ativa');

      await timeEntriesService.stopSession(taskId, activeSession.id, notes);
      setNotes('');
      onSessionChange();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao finalizar sessão';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-50 border-l-4 border-red-500';
      case 'high':
        return 'text-orange-700 bg-orange-50 border-l-4 border-orange-500';
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 border-l-4 border-yellow-500';
      case 'low':
        return 'text-blue-700 bg-blue-50 border-l-4 border-blue-500';
      default:
        return 'text-gray-700 bg-gray-50 border-l-4 border-gray-500';
    }
  };

  const getWarningTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  // Valores padrão seguros
  const totalHoursTracked = typeof dayStatus?.total_hours_tracked === 'number'
    ? dayStatus.total_hours_tracked
    : 0;
  const hoursRemaining = typeof dayStatus?.hours_remaining === 'number'
    ? dayStatus.hours_remaining
    : 8;
  const canContinue = dayStatus?.can_continue !== false;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rastreamento de Tempo</h3>

      {/* Horas do Dia Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Horas Rastreadas Hoje:</span>
          <span className="text-2xl font-bold text-gray-900">
            {totalHoursTracked.toFixed(1)}h / 8h
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              totalHoursTracked >= 8
                ? 'bg-red-500'
                : totalHoursTracked >= 6
                ? 'bg-orange-500'
                : 'bg-green-500'
            }`}
            style={{
              width: `${Math.min((totalHoursTracked / 8) * 100, 100)}%`,
            }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {canContinue
            ? `Você pode trabalhar mais ${hoursRemaining.toFixed(1)} horas hoje`
            : 'Limite diário de 8 horas foi atingido'}
        </div>
      </div>

      {/* Sessão Ativa */}
      {activeSession && (
        <div className={`mb-6 p-6 rounded-lg border-2 transition-all ${
          activeSession.status === 'running'
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-md'
            : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400'
        }`}>
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-lg ${activeSession.status === 'running' ? 'animate-pulse' : ''}`}>
                  {activeSession.status === 'running' ? '▶️' : '⏸️'}
                </span>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  {activeSession.status === 'running' ? 'Cronometrando...' : 'Pausado'}
                </p>
              </div>

              {/* ✅ DOIS CONTADORES SEPARADOS */}
              <div className="p-5 bg-white rounded-lg border-2 border-gray-300 shadow-sm space-y-4">
                {/* CONTADOR 1: TEMPO DE TRABALHO (Principal) */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Trabalhando</p>
                  <p className="text-5xl font-mono font-bold text-blue-600 tracking-wider">
                    {timeEntriesService.formatDurationDetailed(detailedTime)}
                  </p>
                </div>

                {/* CONTADOR 2: TEMPO PAUSADO (Secundário) */}
                {detailedPausedTime.totalSeconds > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Pausado</p>
                    <p className="text-3xl font-mono font-bold text-gray-400 tracking-wider">
                      {timeEntriesService.formatDurationDetailed(detailedPausedTime)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activeSession?.pause_count || 0} {(activeSession?.pause_count || 0) === 1 ? 'vez' : 'vezes'}
                    </p>
                  </div>
                )}
              </div>

              {/* Resumo de Horas e Minutos */}
              <div className="mt-3 text-center space-y-1">
                <p className="text-sm text-gray-600">
                  {timeEntriesService.formatDuration(elapsedTime)} de trabalho registrado
                </p>
              </div>
            </div>

            {/* Coluna Direita - Informações */}
            <div className="text-right space-y-2 min-w-fit">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Início</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(activeSession.start_time).toLocaleTimeString('pt-BR')}
                </p>
              </div>
              {activeSession.resume_time && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Retomado</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(activeSession.resume_time).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Avisos e Alertas */}
      {dayStatus.warning_messages && dayStatus.warning_messages.length > 0 && (
        <div className="mb-6 space-y-2">
          {dayStatus.warning_messages.map((warning, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-md text-sm ${getSeverityColor(warning.severity)}`}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5">{getWarningTypeIcon(warning.type)}</span>
                <div>
                  <p className="font-medium">{warning.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">❌ {error}</p>
        </div>
      )}

      {/* Campo de Notas */}
      {!activeSession && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Descreva o trabalho realizado..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
          />
        </div>
      )}

      {/* Botões de Controle */}
      <div className="flex gap-3">
        {!activeSession ? (
          <button
            onClick={handlePlay}
            disabled={!canContinue || isLoading}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-colors ${
              canContinue && !isLoading
                ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            {isLoading ? 'Iniciando...' : '▶️ PLAY'}
          </button>
        ) : activeSession.status === 'running' ? (
          <>
            <button
              onClick={handlePause}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-colors ${
                !isLoading
                  ? 'bg-yellow-600 hover:bg-yellow-700 cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Pausando...' : '⏸️ PAUSE'}
            </button>
            <button
              onClick={handleStop}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-colors ${
                !isLoading
                  ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Finalizando...' : '⏹️ STOP'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleResume}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-colors ${
                !isLoading
                  ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Retomando...' : '▶️ RESUME'}
            </button>
            <button
              onClick={handleStop}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-colors ${
                !isLoading
                  ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Finalizando...' : '⏹️ STOP'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TimeTrackingControls;
