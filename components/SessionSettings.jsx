'use client';

const SETTINGS_FIELDS = [
  {
    key: 'totalSessions',
    label: 'Bursts per day',
    description: 'How many short sessions you will allow yourself today.',
    min: 1,
    max: 30,
    step: 1,
    unit: 'bursts'
  },
  {
    key: 'sessionLength',
    label: 'Burst length',
    description: 'Maximum length of a single burst in seconds.',
    min: 30,
    max: 180,
    step: 5,
    unit: 'seconds'
  },
  {
    key: 'cooldownMinutes',
    label: 'Cooldown',
    description: 'How many minutes must pass before the next burst unlocks.',
    min: 3,
    max: 60,
    step: 1,
    unit: 'minutes'
  }
];

export default function SessionSettings({ settings, onChange }) {
  return (
    <section className="card settings-card">
      <div className="card-header">
        <h2>Focus recipe</h2>
        <p>Dial in the short-form limits that keep your phone time intentional.</p>
      </div>
      <div className="settings-grid">
        {SETTINGS_FIELDS.map(({ key, label, description, min, max, step, unit }) => (
          <label key={key} className="setting-field">
            <div className="setting-copy">
              <span className="setting-label">{label}</span>
              <span className="setting-value">
                {settings[key]} {unit}
              </span>
              <p>{description}</p>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={settings[key]}
              onChange={(event) => onChange(key, Number(event.target.value))}
            />
            <div className="setting-range-labels">
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
