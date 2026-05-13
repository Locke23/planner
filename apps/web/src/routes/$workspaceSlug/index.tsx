import { createFileRoute, Link } from '@tanstack/react-router';
import { Avatar, Box, Button, Flex, Heading, Separator, Text } from '@radix-ui/themes';
import { useWorkspace } from '../../features/workspace/hooks/useWorkspace';
import { useLogout } from '../../features/auth/hooks/useAuth';

export const Route = createFileRoute('/$workspaceSlug/')({
  component: WorkspaceDashboard,
});

function WorkspaceDashboard() {
  const { workspaceSlug } = Route.useParams();
  const { data: ws, isLoading } = useWorkspace(workspaceSlug);
  const logout = useLogout();

  if (isLoading) return <Box p="4"><Text color="gray">Loading workspace…</Text></Box>;
  if (!ws) return <Box p="4"><Text color="red">Workspace not found</Text></Box>;

  return (
    <Flex style={{ minHeight: '100vh' }}>
      <Box
        style={{
          width: 240,
          borderRight: '1px solid var(--gray-4)',
          background: 'var(--gray-1)',
        }}
        p="4"
      >
        <Flex direction="column" gap="4" height="100%">
          <Flex align="center" gap="2">
            <Avatar size="2" fallback={ws.name[0].toUpperCase()} />
            <Text weight="medium" size="2">{ws.name}</Text>
          </Flex>
          <Separator size="4" />
          <Flex direction="column" gap="1">
            <Link
              to="/$workspaceSlug"
              params={{ workspaceSlug }}
              style={{ textDecoration: 'none' }}
            >
              <Text size="2" color="gray">Dashboard</Text>
            </Link>
            <Link
              to="/$workspaceSlug/settings"
              params={{ workspaceSlug }}
              style={{ textDecoration: 'none' }}
            >
              <Text size="2" color="gray">Settings</Text>
            </Link>
          </Flex>
          <Box style={{ marginTop: 'auto' }}>
            <Button
              variant="ghost"
              color="gray"
              size="1"
              onClick={() => logout.mutate()}
            >
              Sign out
            </Button>
          </Box>
        </Flex>
      </Box>

      <Box style={{ flex: 1 }} p="6">
        <Heading size="5" mb="4">{ws.name}</Heading>
        <Text color="gray">Projects coming in Phase 3.</Text>
      </Box>
    </Flex>
  );
}
