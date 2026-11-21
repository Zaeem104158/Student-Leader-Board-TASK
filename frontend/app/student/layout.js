import Protected from '@/components/Protected';
export default function StudentLayout({ children }) {
  return <Protected roles={['student']}>{children}</Protected>;
}
