export const DEPARTMENTS = ['CSE', 'EEE', 'BBA', 'English', 'Physics'];

export function GradeBadge({ grade }) {
  const cls = grade === 'F' ? 'bad' : grade?.startsWith('A') ? 'good' : grade?.startsWith('B') ? 'ok' : 'warn';
  return <span className={`badge ${cls}`}>{grade}</span>;
}

export function StatusBadge({ status }) {
  return <span className={`badge status-${status}`}>{status}</span>;
}

export function RankCell({ rank }) {
  const medal = { 1: '🥇', 2: '🥈', 3: '🥉' }[rank];
  return <span className="rank">{medal || `#${rank}`}</span>;
}

export function Alert({ error, success }) {
  if (error) return <div className="alert error">{error}</div>;
  if (success) return <div className="alert success">{success}</div>;
  return null;
}

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '');
