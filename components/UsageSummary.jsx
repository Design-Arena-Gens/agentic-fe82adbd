'use client';

import { calculateUsageStats, formatDuration } from '@/lib/usage';

export default function UsageSummary({
  sessionLength,
  completedCount,
  totalSessions,
  nextAvailableAt
}) {
  const stats = calculateUsageStats({
    sessionLengthSeconds: sessionLength,
    completedCount,
    totalSessions
  });

  const nextUnlock = nextAvailableAt
    ? new Date(nextAvailableAt).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
      })
    : null;

  return (
    <section className="card summary-card">
      <header className="card-header">
        <h2>Progress pulse</h2>
        <p>Stay mindful of how much of your short-form allowance has been spent today.</p>
      </header>
      <div className="summary-grid">
        <div className="summary-item">
          <span className="summary-label">Consumed</span>
          <span className="summary-value">{formatDuration(stats.consumedSeconds)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Remaining</span>
          <span className="summary-value">{formatDuration(stats.remainingSeconds)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Completion</span>
          <span className="summary-value">{stats.percentComplete}%</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Next unlock</span>
          <span className="summary-value">
            {nextUnlock ? `@ ${nextUnlock}` : 'Ready now'}
          </span>
        </div>
      </div>
    </section>
  );
}
