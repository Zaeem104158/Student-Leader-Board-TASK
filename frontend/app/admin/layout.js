import Protected from '@/components/Protected';
export default function AdminLayout({ children }) {
  return <Protected roles={['admin']}>{children}</Protected>;
}
