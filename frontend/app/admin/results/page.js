'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Alert, DEPARTMENTS, GradeBadge, StatusBadge } from '@/components/ui';

/** Fetch every page of a paginated endpoint */
async function fetchAll(path, query) {
  let page = 1;
  const all = [];
  for (;;) {
    const d = await api(path, { query: { ...query, page, limit: path === '/results' ? 200 : 100 } });
    all.push(...d.data);
    if (page >= d.pagination.pages) return all;
    page += 1;
  }
}

export default function ResultsPage() {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState('');
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState({}); // studentId -> result
  const [marks, setMarks] = useState({}); // studentId -> input value
  const [dept, setDept] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api('/exams'), fetchAll('/students', { sort: 'studentId' })])
      .then(([e, s]) => {
        setExams(e.data);
        setStudents(s);
        if (e.data[0]) setExamId(e.data[0]._id);
      })
      .catch((err) => setError(err.message));
  }, []);

  const loadResults = useCallback(async () => {
    if (!examId) return;
    try {
      const list = await fetchAll('/results', { exam: examId });
      const map = Object.fromEntries(list.filter((r) => r.student).map((r) => [r.student._id, r]));
      setResults(map);
      setMarks(Object.fromEntries(Object.entries(map).map(([k, r]) => [k, String(r.marksObtained)])));
    } catch (e) {
      setError(e.message);
    }
  }, [examId]);
  useEffect(() => { loadResults(); }, [loadResults]);

  const exam = exams.find((e) => e._id === examId);
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => (!dept || s.department === dept) && (!q || s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q)));
  }, [students, dept, search]);

  const dirty = Object.entries(marks).filter(([sid, v]) => v !== '' && String(results[sid]?.marksObtained ?? '') !== v);

  async function saveAll() {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const d = await api('/results/bulk', {
        method: 'POST',
        body: { exam: examId, entries: dirty.map(([student, marksObtained]) => ({ student, marksObtained: Number(marksObtained) })) },
      });
      setSuccess(`Saved: ${d.created} created, ${d.updated} updated${d.errors.length ? `, ${d.errors.length} rejected` : ''}`);
      if (d.errors.length) setError(d.errors[0].message);
      await loadResults();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeResult(sid) {
    const r = results[sid];
    if (!confirm('Delete this result?')) return;
    try {
      await api(`/results/${r._id}`, { method: 'DELETE' });
      setMarks((m) => ({ ...m, [sid]: '' }));
      setSuccess('Result deleted');
      await loadResults();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Result Management</h1>
        <button className="btn primary" disabled={!dirty.length || busy} onClick={saveAll}>
          {busy ? 'Saving…' : `Save ${dirty.length || ''} change${dirty.length === 1 ? '' : 's'}`}
        </button>
      </div>
      <Alert error={error} success={success} />

      <div className="toolbar">
        <select value={examId} onChange={(e) => { setExamId(e.target.value); setSuccess(''); }}>
          {exams.map((e) => <option key={e._id} value={e._id}>{e.subject} — {e.title} ({e.session})</option>)}
        </select>
        <select value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <input placeholder="Search student…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {exam && (
        <p className="muted small">
          Total marks <b>{exam.totalMarks}</b> · Pass marks <b>{exam.passMarks}</b> · <StatusBadge status={exam.status} /> ·{' '}
          {Object.keys(results).length} of {students.length} students have results
        </p>
      )}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Student ID</th><th>Name</th><th>Dept</th><th>Marks</th><th className="num">%</th><th>Grade</th><th>Result</th><th /></tr>
          </thead>
          <tbody>
            {visible.map((s) => {
              const r = results[s._id];
              const v = marks[s._id] ?? '';
              const changed = v !== '' && String(r?.marksObtained ?? '') !== v;
              const invalid = v !== '' && (Number(v) < 0 || Number(v) > (exam?.totalMarks ?? 0));
              return (
                <tr key={s._id} className={changed ? 'changed' : ''}>
                  <td className="mono">{s.studentId}</td>
                  <td>{s.name}</td>
                  <td>{s.department}</td>
                  <td>
                    <input
                      className={`marks ${invalid ? 'invalid' : ''}`}
                      type="number" min={0} max={exam?.totalMarks} placeholder="—"
                      value={v}
                      onChange={(e) => setMarks((m) => ({ ...m, [s._id]: e.target.value }))}
                    />
                    <span className="muted small"> / {exam?.totalMarks}</span>
                  </td>
                  <td className="num">{r?.percentage ?? ''}</td>
                  <td>{r && <GradeBadge grade={r.grade} />}</td>
                  <td>{r && (r.passed ? <span className="badge good">Pass</span> : <span className="badge bad">Fail</span>)}</td>
                  <td className="actions">{r && <button className="btn danger sm" onClick={() => removeResult(s._id)}>Delete</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
