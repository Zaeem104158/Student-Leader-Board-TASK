'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Alert, GradeBadge, fmtDate } from '@/components/ui';

export default function MyResults() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/results/me').then(setData).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <h1>My Results</h1>
      <div className="card profile">
        <div><div className="muted small">Name</div><b>{user.name}</b></div>
        <div><div className="muted small">Student ID</div><b className="mono">{user.studentId}</b></div>
        <div><div className="muted small">Department</div><b>{user.department}</b></div>
        <div><div className="muted small">Batch</div><b>{user.batch}</b></div>
      </div>
      <Alert error={error} />
      {!data && !error && <p className="muted">Loading…</p>}
      {data && (
        <>
          <div className="stats">
            <div className="card stat"><div className="stat-value">{data.summary.cgpa.toFixed(2)}</div><div className="muted small">CGPA</div></div>
            <div className="card stat"><div className="stat-value">{data.summary.avgPercentage}%</div><div className="muted small">Average</div></div>
            <div className="card stat"><div className="stat-value">{data.summary.exams}</div><div className="muted small">Exams</div></div>
            <div className="card stat"><div className="stat-value">{data.summary.passed} / {data.summary.failed}</div><div className="muted small">Passed / Failed</div></div>
          </div>
          <div className="card table-wrap">
            <table>
              <thead>
                <tr><th>Exam</th><th>Session</th><th>Date</th><th className="num">Marks</th><th className="num">%</th><th>Grade</th><th className="num">GPA</th><th className="num">Rank</th><th>Remarks</th></tr>
              </thead>
              <tbody>
                {data.data.map((r) => (
                  <tr key={r._id}>
                    <td><b>{r.exam.subject}</b><div className="muted small">{r.exam.title}</div></td>
                    <td>{r.exam.session}</td>
                    <td>{fmtDate(r.exam.examDate)}</td>
                    <td className="num">{r.marksObtained} / {r.exam.totalMarks}</td>
                    <td className="num">{r.percentage}</td>
                    <td><GradeBadge grade={r.grade} /></td>
                    <td className="num">{r.gpa.toFixed(2)}</td>
                    <td className="num">{r.rank} / {r.totalParticipants}</td>
                    <td className="muted">{r.remarks || '—'}</td>
                  </tr>
                ))}
                {data.data.length === 0 && <tr><td colSpan={9} className="center muted">No published results yet</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
