'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

const LINKS = {
  admin: [
    ['/admin', 'Dashboard'],
    ['/admin/students', 'Students'],
    ['/admin/exams', 'Exams'],
    ['/admin/results', 'Results'],
    ['/leaderboard', 'Leaderboard'],
  ],
  student: [
    ['/student', 'My Results'],
    ['/leaderboard', 'Leaderboard'],
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">🏆 ResultBoard</Link>
        <nav>
          {LINKS[user.role].map(([href, label]) => (
            <Link key={href} href={href} className={pathname === href ? 'active' : ''}>{label}</Link>
          ))}
        </nav>
        <div className="nav-user">
          <span>
            {user.name} <span className={`pill ${user.role}`}>{user.role}</span>
          </span>
          <button className="btn ghost sm" onClick={() => { logout(); router.replace('/login'); }}>Logout</button>
        </div>
      </div>
    </header>
  );
}
