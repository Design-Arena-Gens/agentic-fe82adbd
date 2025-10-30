'use client';

import { formatClock } from '@/lib/usage';

export default function SessionFeed({ sessions }) {
  return (
    <section className="card feed-card">
      <header className="card-header">
        <h2>Daily reel of bursts</h2>
        <p>
          Swipe through the day&apos;s short sessions. Completed bursts glow, the current one pulses,
          and upcoming bursts stay locked until cooldowns expire.
        </p>
      </header>
      <div className="reel-feed">
        {sessions.map((session) => (
          <article key={session.index} className={`reel-card ${session.status}`}>
            <div className="reel-number">#{session.index + 1}</div>
            <div className="reel-body">
              <h3>{session.title}</h3>
              <p>{session.description}</p>
            </div>
            <div className="reel-meta">
              {session.status === 'completed' && session.completedAt && (
                <span className="reel-pill">logged {session.completedAt}</span>
              )}
              {session.status === 'active' && <span className="reel-pill active">burst in progress</span>}
              {session.status === 'ready' && (
                <span className="reel-pill ready">ready • {formatClock(session.lengthSeconds)}</span>
              )}
              {session.status === 'locked' && (
                <span className="reel-pill locked">locked</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
