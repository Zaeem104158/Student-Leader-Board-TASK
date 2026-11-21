'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';
import { Alert, DEPARTMENTS, GradeBadge, StatusBadge, fmtDate } from '@/components/ui';

const EMPTY = { name: '', email: '', studentId: '', department: 'CSE', batch: 2025, gender: 'Male', phone: '', password: '' };

export default function StudentsPage() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', department: '', batch: '', page: 1 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | student object
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    try {
      const d = await api('/students', { query: { ...filters, limit: 10 } });
      setRows(d.data);
      setPagination(d.pagination);
    } catch (e) {
      setError(e.message);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search typing
    return () => clearTimeout(t);
  }, [load]);

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: k === 'page' ? v : 1 }));

  async function remove(s) {
    if (!confirm(`Delete ${s.name} (${s.studentId})? Their results will also be deleted.`)) return;
    try {
      const d = await api(`/students/${s._id}`, { method: 'DELETE' });
      setSuccess(d.message);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function view(s) {
    try {
      const d = await api(`/students/${s._id}`);
      setViewing(d.data);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Student Management</h1>
        <button className="btn primary" onClick={() => setEditing('new')}>+ Add student</button>
      </div>
      <Alert error={error} success={success} />

      <div className="toolbar">
        <input placeholder="Search name, email or ID…" value={filters.search} onChange={(e) => setFilter('search', e.target.value)} />
        <select value={filters.department} onChange={(e) => setFilter('department', e.target.value)}>
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={filters.batch} onChange={(e) => setFilter('batch', e.target.value)}>
          <option value="">All batches</option>
          {[2023, 2024, 2025, 2026].map((b) => <option key={b}>{b}</option>)}
        </select>
        <span className="muted small">{pagination.total} students</span>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Student ID</th><th>Name</th><th>Email</th><th>Dept</th><th>Batch</th><th /></tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s._id}>
                <td className="mono">{s.studentId}</td>
                <td>{s.name}</td>
                <td className="muted">{s.email}</td>
                <td>{s.department}</td>
                <td>{s.batch}</td>
                <td className="actions">
                  <button className="btn ghost sm" onClick={() => view(s)}>View</button>
                  <button className="btn ghost sm" onClick={() => setEditing(s)}>Edit</button>
                  <button className="btn danger sm" onClick={() => remove(s)}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="center muted">No students found</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <button className="btn ghost sm" disabled={pagination.page <= 1} onClick={() => setFilter('page', pagination.page - 1)}>← Prev</button>
        <span className="small">Page {pagination.page} of {pagination.pages || 1}</span>
        <button className="btn ghost sm" disabled={pagination.page >= pagination.pages} onClick={() => setFilter('page', pagination.page + 1)}>Next →</button>
      </div>

      {editing && (
        <StudentForm
          student={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => { setEditing(null); setSuccess(msg); setError(''); load(); }}
        />
      )}

      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewing(null)} wide>
          <dl className="details">
            <dt>Student ID</dt><dd className="mono">{viewing.studentId}</dd>
            <dt>Email</dt><dd>{viewing.email}</dd>
            <dt>Department</dt><dd>{viewing.department}</dd>
            <dt>Batch</dt><dd>{viewing.batch}</dd>
            <dt>Gender</dt><dd>{viewing.gender || '—'}</dd>
            <dt>Phone</dt><dd>{viewing.phone || '—'}</dd>
          </dl>
          <h3>Results</h3>
          <table>
            <thead><tr><th>Exam</th><th>Date</th><th>Status</th><th className="num">Marks</th><th>Grade</th></tr></thead>
            <tbody>
              {viewing.results.map((r) => (
                <tr key={r._id}>
                  <td>{r.exam?.subject} — {r.exam?.title}</td>
                  <td>{fmtDate(r.exam?.examDate)}</td>
                  <td><StatusBadge status={r.exam?.status} /></td>
                  <td className="num">{r.marksObtained}/{r.exam?.totalMarks}</td>
                  <td><GradeBadge grade={r.grade} /></td>
                </tr>
              ))}
              {viewing.results.length === 0 && <tr><td colSpan={5} className="center muted">No results yet</td></tr>}
            </tbody>
          </table>
        </Modal>
      )}
    </>
  );
}

function StudentForm({ student, onClose, onSaved }) {
  const [form, setForm] = useState(student ? { ...EMPTY, ...student, password: '' } : EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const body = {
      name: form.name, email: form.email, studentId: form.studentId, department: form.department,
      batch: Number(form.batch), gender: form.gender, phone: form.phone,
    };
    if (form.password) body.password = form.password;
    try {
      if (student) await api(`/students/${student._id}`, { method: 'PUT', body });
      else await api('/students', { method: 'POST', body });
      onSaved(student ? 'Student updated' : 'Student created');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={student ? 'Edit student' : 'Add student'} onClose={onClose}>
      <form onSubmit={submit} className="form-grid">
        <Alert error={error} />
        <label>Full name<input required value={form.name} onChange={set('name')} /></label>
        <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Student ID<input required value={form.studentId} onChange={set('studentId')} placeholder="CSE-2025-010" /></label>
        <label>Department
          <select value={form.department} onChange={set('department')}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select>
        </label>
        <label>Batch<input type="number" min={2000} max={2100} required value={form.batch} onChange={set('batch')} /></label>
        <label>Gender
          <select value={form.gender} onChange={set('gender')}><option>Male</option><option>Female</option><option>Other</option></select>
        </label>
        <label>Phone<input value={form.phone} onChange={set('phone')} /></label>
        <label>{student ? 'New password (optional)' : 'Password (default: student123)'}
          <input type="password" minLength={6} value={form.password} onChange={set('password')} />
        </label>
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}
