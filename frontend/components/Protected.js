'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, homeFor } from '@/lib/AuthContext';
import Navbar from './Navbar';

/** Role-based route guard + app shell. roles: ['admin'] | ['student'] | undefined (any logged-in user) */
export default function Protected({ roles, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const allowed = user && (!roles || roles.includes(user.role));

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (!allowed) router.replace(homeFor(user));
  }, [loading, user, allowed, router]);

  if (loading || !allowed) return <div className="center muted">Loading…</div>;
  return (
    <>
      <Navbar />
      <main className="container">{children}</main>
    </>
  );
}
