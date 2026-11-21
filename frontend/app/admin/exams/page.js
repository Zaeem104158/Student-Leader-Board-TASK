'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';
import { Alert, StatusBadge, fmtDate } from '@/components/ui';

const EMPTY = { title: '', subject: '', session: 'Fall 2026', examDate: '', totalMarks: 100, passMarks: 40, status: 'scheduled', description: '' };

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    api('/exams', { query: { status } }).then((d) => setExams(d.data)).catch((e) => setError(e.message));
  }, [status]);
  useEffect(load, [load]);

  async function remove(ex) {
    if (!confirm(`Delete "${ex.subject} — ${ex.title}"? All ${ex.resultCount} results for this exam will be deleted.`)) return;
    try {
      const d = await api(`/exams/${ex._id}`, { method: 'DELETE' });
      setSuccess(d.message);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function quickStatus(ex, newStatus) {
    try {
      await api(`/exams/${ex._id}`, { method: 'PUT', body: { status: newStatus } });
      setSuccess(`Exam marked as ${newStatus}`);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Examination Management</h1>
        <button className="btn primary" onClick={() => setEditing('new')}>+ Create exam</button>
      </div>
      <Alert error={error} success={success} />
      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="published">Published</option>
        </select>
        <span className="muted small">Only <b>published</b> exams are visible to students and counted on the leaderboard.</span>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Exam</th><th>Session</th><th>Date</th><th className="num">Total / Pass</th><th>Status</th><th className="num">Results</th><th className="num">Avg %</th><th /></tr>
          </thead>
          <tbody>
            {exams.map((ex) => (
              <tr key={ex._id}>
                <td><b>{ex.subject}</b><div className="muted small">{ex.title}</div></td>
                <td>{ex.session}</td>
                <td>{fmtDate(ex.examDate)}</td>
                <td className="num">{ex.totalMarks} / {ex.passMarks}</td>
                <td><StatusBadge status={ex.status} /></td>
                <td className="num">{ex.resultCount}</td>
                <td className="num">{ex.avgPercentage ?? '—'}</td>
                <td className="actions">
                  {ex.status !== 'published' && ex.resultCount > 0 && (
                    <button className="btn success sm" onClick={() => quickStatus(ex, 'published')}>Publish</button>
                  )}
                  <button className="btn ghost sm" onClick={() => setEditing(ex)}>Edit</button>
                  <button className="btn danger sm" onClick={() => remove(ex)}>Delete</button>
                </td>
              </tr>
            ))}
            {exams.length === 0 && <tr><td colSpan={8} className="center muted">No exams</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <ExamForm
          exam={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => { setEditing(null); setSuccess(msg); setError(''); load(); }}
        />
      )}
    </>
  );
}

function ExamForm({ exam, onClose, onSaved }) {
  const [form, setForm] = useState(exam ? { ...EMPTY, ...exam, examDate: exam.examDate?.slice(0, 10) } : EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const body = {
      title: form.title, subject: form.subject, session: form.session, examDate: form.examDate,
      totalMarks: Number(form.totalMarks), passMarks: Number(form.passMarks), status: form.status, description: form.description,
    };
    try {
      if (exam) await api(`/exams/${exam._id}`, { method: 'PUT', body });
      else await api('/exams', { method: 'POST', body });
      onSaved(exam ? 'Exam updated' : 'Exam created');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={exam ? 'Edit exam' : 'Create exam'} onClose={onClose}>
      <form onSubmit={submit} className="form-grid">
        <Alert error={error} />
        <label>Title<input required value={form.title} onChange={set('title')} placeholder="Midterm / Final / Quiz 1" /></label>
        <label>Subject<input required value={form.subject} onChange={set('subject')} /></label>
        <label>Session<input required value={form.session} onChange={set('session')} placeholder="Fall 2026" /></label>
        <label>Exam date<input type="date" required value={form.examDate} onChange={set('examDate')} /></label>
        <label>Total marks<input type="number" min={1} required value={form.totalMarks} onChange={set('totalMarks')} /></label>
        <label>Pass marks<input type="number" min={0} required value={form.passMarks} onChange={set('passMarks')} /></label>
        <label>Status
          <select value={form.status} onChange={set('status')}>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="full">Description<textarea rows={2} value={form.description || ''} onChange={set('description')} /></label>
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}
