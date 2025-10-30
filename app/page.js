'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import SessionFeed from '@/components/SessionFeed';
import SessionSettings from '@/components/SessionSettings';
import SessionTimer from '@/components/SessionTimer';
import UsageSummary from '@/components/UsageSummary';

const STORAGE_PREFIX = 'reel-focus-state';
const STORAGE_VERSION = 1;

const DEFAULT_SETTINGS = {
  totalSessions: 12,
  sessionLength: 60,
  cooldownMinutes: 10
};

const DEFAULT_TIMER = {
  running: false,
  secondsRemaining: DEFAULT_SETTINGS.sessionLength
};

const getStorageKey = () => {
  const today = new Date().toISOString().slice(0, 10);
  return `${STORAGE_PREFIX}-v${STORAGE_VERSION}-${today}`;
};

export default function Home() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [nextAvailableAt, setNextAvailableAt] = useState(null);
  const [timerState, setTimerState] = useState(DEFAULT_TIMER);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(getStorageKey());
      if (!raw) {
        setInitialized(true);
        return;
      }

      const parsed = JSON.parse(raw);
      if (parsed.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      }
      if (Array.isArray(parsed.completedSessions)) {
        setCompletedSessions(parsed.completedSessions);
      }
      if (parsed.nextAvailableAt) {
        setNextAvailableAt(parsed.nextAvailableAt);
      }
    } catch (error) {
      console.warn('Failed to load saved plan', error);
    } finally {
      setInitialized(true);
    }
  }, []);

  const completeSession = useCallback(() => {
    setCompletedSessions((prev) => {
      if (prev.length >= settings.totalSessions) {
        setNextAvailableAt(null);
        return prev;
      }
      const updated = [...prev, new Date().toISOString()];
      if (settings.cooldownMinutes > 0 && updated.length < settings.totalSessions) {
        setNextAvailableAt(new Date(Date.now() + settings.cooldownMinutes * 60 * 1000).toISOString());
      } else {
        setNextAvailableAt(null);
      }
      return updated;
    });
    setTimerState({ running: false, secondsRemaining: settings.sessionLength });
  }, [settings.sessionLength, settings.cooldownMinutes, settings.totalSessions]);

  useEffect(() => {
    if (!initialized || typeof window === 'undefined') return;
    const payload = {
      settings,
      completedSessions,
      nextAvailableAt
    };
    try {
      window.localStorage.setItem(getStorageKey(), JSON.stringify(payload));
    } catch (error) {
      console.warn('Failed to persist plan', error);
    }
  }, [initialized, settings, completedSessions, nextAvailableAt]);

  useEffect(() => {
    if (!timerState.running) {
      return undefined;
    }

    const id = window.setInterval(() => {
      setTimerState((prev) => {
        if (!prev.running) return prev;
        if (prev.secondsRemaining <= 1) {
          return {
            running: false,
            secondsRemaining: 0
          };
        }
        return {
          running: true,
          secondsRemaining: prev.secondsRemaining - 1
        };
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [timerState.running]);

  useEffect(() => {
    if (!timerState.running && timerState.secondsRemaining === 0) {
      completeSession();
    }
  }, [timerState.running, timerState.secondsRemaining, completeSession]);

  useEffect(() => {
    if (!nextAvailableAt) {
      setCooldownRemaining(0);
      return undefined;
    }

    const update = () => {
      const diff = Math.ceil((new Date(nextAvailableAt).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setCooldownRemaining(0);
        setNextAvailableAt(null);
      } else {
        setCooldownRemaining(diff);
      }
    };

    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [nextAvailableAt]);

  const handleSettingChange = useCallback((field, value) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        [field]: value
      };

      if (!timerState.running && field === 'sessionLength') {
        setTimerState({ running: false, secondsRemaining: value });
      }
      return next;
    });
  }, [timerState.running]);

  const handleStart = useCallback(() => {
    if (timerState.running) return;
    if (cooldownRemaining > 0) return;
    if (completedSessions.length >= settings.totalSessions) return;
    setTimerState({ running: true, secondsRemaining: settings.sessionLength });
  }, [timerState.running, cooldownRemaining, completedSessions.length, settings.totalSessions, settings.sessionLength]);

  const handleCancel = useCallback(() => {
    setTimerState({ running: false, secondsRemaining: settings.sessionLength });
  }, [settings.sessionLength]);

  const sessionsRemaining = Math.max(settings.totalSessions - completedSessions.length - (timerState.running ? 1 : 0), 0);

  const feedSessions = useMemo(() => {
    return Array.from({ length: settings.totalSessions }, (_, index) => {
      if (index < completedSessions.length) {
        return {
          index,
          status: 'completed',
          title: 'Burst logged',
          description: 'You stayed inside the limit — nice work.',
          completedAt: new Date(completedSessions[index]).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
          }),
          lengthSeconds: settings.sessionLength
        };
      }

      if (index === completedSessions.length) {
        if (timerState.running) {
          return {
            index,
            status: 'active',
            title: 'Burst in progress',
            description: 'Stay focused. The reel wraps the moment the timer hits zero.',
            completedAt: null,
            lengthSeconds: settings.sessionLength
          };
        }

        if (cooldownRemaining > 0) {
          return {
            index,
            status: 'locked',
            title: 'Locked for cooldown',
            description: 'Take a breather before the next scroll allowance.',
            completedAt: null,
            lengthSeconds: settings.sessionLength
          };
        }

        return {
          index,
          status: 'ready',
          title: 'Next burst ready',
          description: 'When you feel the urge, tap start and stay mindful.',
          completedAt: null,
          lengthSeconds: settings.sessionLength
        };
      }

      return {
        index,
        status: 'locked',
        title: 'Upcoming burst',
        description: 'Unlocks once the earlier bursts are logged.',
        completedAt: null,
        lengthSeconds: settings.sessionLength
      };
    });
  }, [settings.totalSessions, settings.sessionLength, completedSessions, timerState.running, cooldownRemaining]);

  const heroProgress = settings.totalSessions === 0
    ? 0
    : Math.round((completedSessions.length / settings.totalSessions) * 100);

  return (
    <main className="page">
      <div className="page-inner">
        <header className="hero">
          <div>
            <span className="hero-chip">Reel-size discipline</span>
            <h1>Limit phone use like short-form reels</h1>
            <p>
              Reel Focus breaks your screen time into intentional bursts. Tailor how long each burst
              lasts, enforce cooldowns between them, and track your day like a stack of short videos.
            </p>
          </div>
          <div className="hero-progress">
            <span className="hero-progress-value">{heroProgress}%</span>
            <span className="hero-progress-label">of daily bursts logged</span>
          </div>
        </header>

        <div className="dashboard-grid">
          <div className="primary-column">
            <SessionTimer
              sessionLength={settings.sessionLength}
              timerState={timerState}
              onStart={handleStart}
              onCancel={handleCancel}
              cooldownRemaining={cooldownRemaining}
              sessionsRemaining={sessionsRemaining}
            />
            <SessionFeed sessions={feedSessions} />
          </div>
          <aside className="secondary-column">
            <SessionSettings settings={settings} onChange={handleSettingChange} />
            <UsageSummary
              sessionLength={settings.sessionLength}
              completedCount={completedSessions.length}
              totalSessions={settings.totalSessions}
              nextAvailableAt={nextAvailableAt}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
