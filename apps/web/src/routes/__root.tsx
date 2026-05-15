import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { token as tokenStore } from '../shared/lib/token';

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const token = tokenStore.get();
    const isPublic = ['/login', '/register'].includes(location.pathname) ||
      location.pathname.startsWith('/invitations');
    if (!token && !isPublic) {
      throw redirect({ to: '/login', search: { redirect: location.pathname } });
    }
  },
  component: () => <Outlet />,
});
