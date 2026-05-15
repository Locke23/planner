import { Avatar, Box, Flex, Separator, Text, Button } from '@radix-ui/themes';
import { Link, useRouterState } from '@tanstack/react-router';
import { DashboardIcon, GearIcon, ExitIcon } from '@radix-ui/react-icons';
import type { WorkspaceDto, ProjectDto } from '@org/shared-types';
import { useLogout } from '../../auth/hooks/useAuth';

interface WorkspaceSidebarProps {
  workspace: WorkspaceDto;
  projects: ProjectDto[];
  activeProjectId?: string;
}

export function WorkspaceSidebar({ workspace, projects, activeProjectId }: WorkspaceSidebarProps) {
  const logout = useLogout();
  const { location } = useRouterState();

  function isActive(path: string) {
    return location.pathname === path;
  }

  return (
    <Box
      style={{
        width: 240,
        flexShrink: 0,
        borderRight: '1px solid var(--gray-4)',
        background: 'var(--gray-1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      <Flex direction="column" gap="1" p="3" style={{ flex: 1, overflow: 'auto' }}>
        <Flex align="center" gap="2" p="2" mb="2">
          <Avatar size="2" fallback={workspace.name[0].toUpperCase()} color="indigo" />
          <Text weight="medium" size="2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {workspace.name}
          </Text>
        </Flex>

        <Separator size="4" mb="2" />

        <NavItem
          to="/$workspaceSlug"
          params={{ workspaceSlug: workspace.slug }}
          label="Home"
          icon={<DashboardIcon />}
          active={isActive(`/${workspace.slug}`)}
        />

        {projects.length > 0 && (
          <>
            <Box px="2" mt="3" mb="1">
              <Text size="1" color="gray" weight="medium" style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Projects
              </Text>
            </Box>
            {projects.map((p) => (
              <ProjectNavItem
                key={p.id}
                project={p}
                workspaceSlug={workspace.slug}
                isActive={activeProjectId === p.id}
              />
            ))}
          </>
        )}

        <NavItem
          to="/$workspaceSlug/settings"
          params={{ workspaceSlug: workspace.slug }}
          label="Settings"
          icon={<GearIcon />}
          active={isActive(`/${workspace.slug}/settings`)}
        />
      </Flex>

      <Box p="3" style={{ borderTop: '1px solid var(--gray-4)' }}>
        <Button variant="ghost" color="gray" size="1" onClick={() => logout.mutate()}>
          <ExitIcon />
          Sign out
        </Button>
      </Box>
    </Box>
  );
}

interface NavItemProps {
  to: string;
  params: Record<string, string>;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

function NavItem({ to, params, label, icon, active }: NavItemProps) {
  return (
    <Link to={to as never} params={params as never} style={{ textDecoration: 'none' }}>
      <Flex
        align="center"
        gap="2"
        px="2"
        py="1"
        style={{
          borderRadius: 'var(--radius-2)',
          background: active ? 'var(--accent-3)' : 'transparent',
          color: active ? 'var(--accent-11)' : 'var(--gray-11)',
          cursor: 'pointer',
          transition: 'background 100ms',
        }}
      >
        {icon}
        <Text size="2">{label}</Text>
      </Flex>
    </Link>
  );
}

interface ProjectNavItemProps {
  project: ProjectDto;
  workspaceSlug: string;
  isActive: boolean;
}

function ProjectNavItem({ project, workspaceSlug, isActive }: ProjectNavItemProps) {
  return (
    <Link
      to="/$workspaceSlug/$projectId/board"
      params={{ workspaceSlug, projectId: project.id }}
      style={{ textDecoration: 'none' }}
    >
      <Flex
        align="center"
        gap="2"
        px="2"
        py="1"
        style={{
          borderRadius: 'var(--radius-2)',
          background: isActive ? 'var(--accent-3)' : 'transparent',
          color: isActive ? 'var(--accent-11)' : 'var(--gray-11)',
          cursor: 'pointer',
          transition: 'background 100ms',
        }}
      >
        <Text
          size="1"
          style={{
            fontFamily: 'monospace',
            background: 'var(--gray-4)',
            borderRadius: 'var(--radius-1)',
            padding: '1px 4px',
            flexShrink: 0,
          }}
        >
          {project.identifier}
        </Text>
        <Text
          size="2"
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {project.name}
        </Text>
      </Flex>
    </Link>
  );
}
