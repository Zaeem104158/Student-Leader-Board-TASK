'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, homeFor } from '@/lib/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading) router.replace(user ? homeFor(user) : '/login');
  }, [user, loading, router]);
  return <div className="center muted">Loading…</div>;
}
