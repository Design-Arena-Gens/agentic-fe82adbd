'use client';

import { formatClock } from '@/lib/usage';

export default function SessionTimer({
  sessionLength,
  timerState,
  onStart,
  onCancel,
  cooldownRemaining,
  sessionsRemaining
}) {
  const isRunning = timerState.running;
  const countdown = isRunning ? timerState.secondsRemaining : sessionLength;
  const cooldownMinutes = Math.floor(cooldownRemaining / 60);
  const cooldownSeconds = cooldownRemaining % 60;
  const isLocked = cooldownRemaining > 0 || sessionsRemaining <= 0;

  return (
    <section className="card timer-card">
      <header className="card-header">
        <h2>Current burst</h2>
        <p>
          Keep this burst under the limit. When the clock hits zero your phone time is logged
          and the next slot locks for a cooldown.
        </p>
      </header>
      <div className={`timer-display ${isRunning ? 'active' : ''}`} role="timer" aria-live="polite">
        <span>{formatClock(countdown)}</span>
        <small>mm:ss</small>
      </div>
      <div className="timer-actions">
        {isRunning ? (
          <button type="button" className="ghost" onClick={onCancel}>
            Cancel burst
          </button>
        ) : (
          <button type="button" onClick={onStart} disabled={isLocked}>
            Start {sessionLength}-second burst
          </button>
        )}
        <p className="timer-footnote">
          {sessionsRemaining > 0
            ? `${sessionsRemaining} burst${sessionsRemaining === 1 ? '' : 's'} left today.`
            : 'All bursts for today are complete.'}
        </p>
        {cooldownRemaining > 0 && (
          <p className="cooldown-label">
            Next burst unlocks in {cooldownMinutes}m {cooldownSeconds}s.
          </p>
        )}
      </div>
    </section>
  );
}
