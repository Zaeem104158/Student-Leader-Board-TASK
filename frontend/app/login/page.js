'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, homeFor } from '@/lib/AuthContext';
import { Alert } from '@/components/ui';

const DEMO = {
  admin: { email: 'admin@school.com', password: 'admin123' },
  student: { email: 'student@school.com', password: 'student123' },
};

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(homeFor(user));
  }, [user, loading, router]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const u = await login(form.email, form.password);
      router.replace(homeFor(u));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="card login" onSubmit={submit}>
        <h1>🏆 ResultBoard</h1>
        <p className="muted">Student Result &amp; Leaderboard System</p>
        <Alert error={error} />
        <label>
          Email
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="username" />
        </label>
        <label>
          Password
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
        </label>
        <button className="btn primary block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>

        <div className="demo">
          <span className="muted">Demo accounts:</span>
          <button type="button" className="btn ghost sm" onClick={() => setForm(DEMO.admin)}>Administrator</button>
          <button type="button" className="btn ghost sm" onClick={() => setForm(DEMO.student)}>Student</button>
        </div>
      </form>
    </div>
  );
}
