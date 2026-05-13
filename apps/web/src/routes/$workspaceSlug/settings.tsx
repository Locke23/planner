import { createFileRoute, Link } from '@tanstack/react-router';
import { Box, Card, Flex, Heading, Separator, Text } from '@radix-ui/themes';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { useWorkspace } from '../../features/workspace/hooks/useWorkspace';
import { MemberList } from '../../features/workspace/components/MemberList';

export const Route = createFileRoute('/$workspaceSlug/settings')({
  component: WorkspaceSettings,
});

function WorkspaceSettings() {
  const { workspaceSlug } = Route.useParams();
  const { data: ws, isLoading } = useWorkspace(workspaceSlug);

  if (isLoading) return <Box p="4"><Text color="gray">Loading…</Text></Box>;
  if (!ws) return <Box p="4"><Text color="red">Workspace not found</Text></Box>;

  return (
    <Box p="6" style={{ maxWidth: 720, margin: '0 auto' }}>
      <Flex direction="column" gap="6">
        <Link
          to="/$workspaceSlug"
          params={{ workspaceSlug }}
          style={{ textDecoration: 'none', color: 'var(--gray-11)' }}
        >
          <Flex align="center" gap="1">
            <ArrowLeftIcon />
            <Text size="2">Back</Text>
          </Flex>
        </Link>

        <Heading size="6">{ws.name} — Settings</Heading>

        <Card>
          <Flex direction="column" gap="3">
            <Heading size="4">General</Heading>
            <Separator size="4" />
            <Flex gap="4">
              <Flex direction="column" gap="1">
                <Text size="1" color="gray" weight="medium">Slug</Text>
                <Text size="2">{ws.slug}</Text>
              </Flex>
              <Flex direction="column" gap="1">
                <Text size="1" color="gray" weight="medium">Members</Text>
                <Text size="2">{ws.memberCount}</Text>
              </Flex>
            </Flex>
          </Flex>
        </Card>

        <Card>
          <MemberList slug={workspaceSlug} />
        </Card>
      </Flex>
    </Box>
  );
}
