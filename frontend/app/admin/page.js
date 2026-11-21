'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Alert, GradeBadge, RankCell } from '@/components/ui';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [top, setTop] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/stats'), api('/leaderboard', { query: { limit: 5 } })])
      .then(([s, l]) => { setStats(s.data); setTop(l.data); })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <Alert error={error} />;
  if (!stats) return <p className="muted">Loading…</p>;
  const maxGrade = Math.max(1, ...stats.gradeDistribution.map((g) => g.count));

  return (
    <>
      <h1>Admin Dashboard</h1>
      <div className="stats">
        <Stat label="Students" value={stats.students} href="/admin/students" />
        <Stat label="Exams" value={stats.exams} sub={`${stats.examsByStatus.published || 0} published`} href="/admin/exams" />
        <Stat label="Results recorded" value={stats.results} href="/admin/results" />
        <Stat label="Average score" value={`${stats.avgPercentage}%`} />
        <Stat label="Pass rate" value={`${stats.passRate}%`} />
      </div>

      <div className="grid2">
        <section className="card">
          <h2>Top 5 students</h2>
          <table>
            <thead><tr><th>Rank</th><th>Student</th><th>Dept</th><th className="num">Avg %</th></tr></thead>
            <tbody>
              {top.map((r) => (
                <tr key={r.studentRef}>
                  <td><RankCell rank={r.rank} /></td>
                  <td>{r.name}<div className="muted small">{r.studentId}</div></td>
                  <td>{r.department}</td>
                  <td className="num">{r.avgPercentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link href="/leaderboard" className="small">View full leaderboard →</Link>
        </section>

        <section className="card">
          <h2>Average by department</h2>
          {stats.byDepartment.map((d) => (
            <div key={d.department} className="bar-row">
              <span className="bar-label">{d.department}</span>
              <div className="bar"><div style={{ width: `${d.avgPercentage}%` }} /></div>
              <span className="num small">{d.avgPercentage}%</span>
            </div>
          ))}
          <h2 style={{ marginTop: 24 }}>Grade distribution</h2>
          {stats.gradeDistribution.map((g) => (
            <div key={g.grade} className="bar-row">
              <span className="bar-label"><GradeBadge grade={g.grade} /></span>
              <div className="bar"><div style={{ width: `${(g.count / maxGrade) * 100}%` }} /></div>
              <span className="num small">{g.count}</span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

function Stat({ label, value, sub, href }) {
  const body = (
    <>
      <div className="stat-value">{value}</div>
      <div className="muted small">{label}{sub ? ` · ${sub}` : ''}</div>
    </>
  );
  return href ? <Link href={href} className="card stat">{body}</Link> : <div className="card stat">{body}</div>;
}
