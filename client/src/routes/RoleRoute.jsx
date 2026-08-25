import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function RoleRoute({ roles }) {
  const user = useAuthStore(s => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !user.roles?.some(r => roles.includes(r)))
    return <Navigate to="/403" replace />;
  return <Outlet />;
}
