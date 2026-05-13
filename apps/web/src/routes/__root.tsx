import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const token = localStorage.getItem('accessToken');
    const isPublic = ['/login', '/register'].includes(location.pathname) ||
      location.pathname.startsWith('/invitations');
    if (!token && !isPublic) {
      throw redirect({ to: '/login', search: { redirect: location.pathname } });
    }
  },
  component: () => <Outlet />,
});
