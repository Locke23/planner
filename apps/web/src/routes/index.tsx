import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import { useWorkspaces } from '../features/workspace/hooks/useWorkspace';
import { CreateWorkspaceModal } from '../features/workspace/components/CreateWorkspaceModal';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { listWorkspaces } = await import('../features/workspace/api/workspace.api');
    try {
      const workspaces = await listWorkspaces();
      if (workspaces.length > 0) {
        throw redirect({ to: '/$workspaceSlug', params: { workspaceSlug: workspaces[0].slug } });
      }
    } catch (e: any) {
      if (e?.constructor?.name === 'RedirectError') throw e;
    }
  },
  component: WorkspaceSelector,
});

function WorkspaceSelector() {
  const { data: workspaces, isLoading } = useWorkspaces();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <Flex
      align="center"
      justify="center"
      style={{ minHeight: '100vh', background: 'var(--gray-2)' }}
    >
      <Box style={{ width: 480 }}>
        <Flex direction="column" gap="4">
          <Heading size="7">Your workspaces</Heading>

          {isLoading && <Text color="gray">Loading…</Text>}

          {workspaces?.map((ws) => (
            <Link
              key={ws.id}
              to="/$workspaceSlug"
              params={{ workspaceSlug: ws.slug }}
              style={{ textDecoration: 'none' }}
            >
              <Card>
                <Flex align="center" justify="between">
                  <Text weight="medium">{ws.name}</Text>
                  <Text size="2" color="gray">/{ws.slug}</Text>
                </Flex>
              </Card>
            </Link>
          ))}

          <Button onClick={() => setShowCreate(true)} variant="soft">
            <PlusIcon /> New workspace
          </Button>
        </Flex>

        <CreateWorkspaceModal open={showCreate} onOpenChange={setShowCreate} />
      </Box>
    </Flex>
  );
}
