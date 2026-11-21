'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { Alert, DEPARTMENTS, GradeBadge, RankCell } from '@/components/ui';

export default function Leaderboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState(''); // '' = overall
  const [dept, setDept] = useState('');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/exams', { query: { status: 'published' } }).then((d) => setExams(d.data)).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    setRows(null);
    const req = examId
      ? api(`/leaderboard/exam/${examId}`, { query: { department: dept, limit: 100 } })
      : api('/leaderboard', { query: { department: dept, limit: 100 } });
    req.then((d) => setRows(d.data)).catch((e) => setError(e.message));
  }, [examId, dept]);

  const isMe = (r) => user.role === 'student' && r.studentRef === user._id;

  return (
    <>
      <h1>🏆 Leaderboard</h1>
      <div className="toolbar">
        <select value={examId} onChange={(e) => setExamId(e.target.value)}>
          <option value="">Overall (all published exams)</option>
          {exams.map((e) => <option key={e._id} value={e._id}>{e.subject} — {e.title} ({e.session})</option>)}
        </select>
        <select value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      <Alert error={error} />

      {rows && rows.length >= 3 && (
        <div className="podium">
          {[rows[1], rows[0], rows[2]].map((r, i) => (
            <div key={r.studentRef} className={`card podium-${[2, 1, 3][i]}`}>
              <div className="podium-medal"><RankCell rank={r.rank} /></div>
              <b>{r.name}</b>
              <div className="muted small">{r.studentId} · {r.department}</div>
              <div className="stat-value">{examId ? `${r.marksObtained}` : `${r.avgPercentage}%`}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card table-wrap">
        {!rows ? <p className="muted">Loading…</p> : (
          <table>
            <thead>
              {examId ? (
                <tr><th>Rank</th><th>Student</th><th>Dept</th><th>Batch</th><th className="num">Marks</th><th className="num">%</th><th>Grade</th></tr>
              ) : (
                <tr><th>Rank</th><th>Student</th><th>Dept</th><th>Batch</th><th className="num">Exams</th><th className="num">Total marks</th><th className="num">Avg %</th><th className="num">CGPA</th></tr>
              )}
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.studentRef} className={isMe(r) ? 'me' : ''}>
                  <td><RankCell rank={r.rank} /></td>
                  <td>{r.name}{isMe(r) && <span className="pill student">you</span>}<div className="muted small mono">{r.studentId}</div></td>
                  <td>{r.department}</td>
                  <td>{r.batch}</td>
                  {examId ? (
                    <>
                      <td className="num">{r.marksObtained}</td>
                      <td className="num">{r.percentage}</td>
                      <td><GradeBadge grade={r.grade} /></td>
                    </>
                  ) : (
                    <>
                      <td className="num">{r.exams}</td>
                      <td className="num">{r.totalMarks}</td>
                      <td className="num"><b>{r.avgPercentage}</b></td>
                      <td className="num">{r.cgpa.toFixed(2)}</td>
                    </>
                  )}
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} className="center muted">No results yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
