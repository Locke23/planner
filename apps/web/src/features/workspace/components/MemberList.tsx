import { useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Flex,
  Heading,
  IconButton,
  Select,
  Separator,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useWorkspaceMembers, useInviteMember, useRemoveMember } from '../hooks/useWorkspace';
import { useCurrentUser } from '../../auth/hooks/useAuth';

const roleColor: Record<string, 'blue' | 'orange' | 'gray'> = {
  OWNER: 'orange',
  ADMIN: 'blue',
  MEMBER: 'gray',
};

interface Props { slug: string; }

export function MemberList({ slug }: Props) {
  const { data: members, isLoading } = useWorkspaceMembers(slug);
  const { data: me } = useCurrentUser();
  const invite = useInviteMember(slug);
  const remove = useRemoveMember(slug);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');

  if (isLoading) return <Text color="gray">Loading members…</Text>;

  return (
    <Flex direction="column" gap="5">
      <Heading size="4">Members</Heading>

      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Member</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="48px" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {members?.map((m) => (
            <Table.Row key={m.userId}>
              <Table.Cell>
                <Flex align="center" gap="2">
                  <Avatar size="1" fallback={m.userId[0].toUpperCase()} />
                  <Text size="2">{m.userId}</Text>
                </Flex>
              </Table.Cell>
              <Table.Cell>
                <Badge color={roleColor[m.role] ?? 'gray'} size="1">
                  {m.role}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                {me && m.userId !== me.id && (
                  <IconButton
                    size="1"
                    variant="ghost"
                    color="red"
                    onClick={() => remove.mutate(m.userId)}
                  >
                    <Cross2Icon />
                  </IconButton>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Separator size="4" />

      <Heading size="3">Invite member</Heading>
      <Flex gap="2" align="end">
        <Flex direction="column" gap="1" style={{ flex: 1 }}>
          <Text as="label" size="2" weight="medium" htmlFor="invite-email">
            Email address
          </Text>
          <TextField.Root
            id="invite-email"
            type="email"
            placeholder="teammate@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Flex>

        <Flex direction="column" gap="1">
          <Text as="label" size="2" weight="medium">Role</Text>
          <Select.Root value={role} onValueChange={(v) => setRole(v as 'ADMIN' | 'MEMBER')}>
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="MEMBER">Member</Select.Item>
              <Select.Item value="ADMIN">Admin</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        <Button
          onClick={() => invite.mutate({ email, role }, { onSuccess: () => setEmail('') })}
          disabled={!email || invite.isPending}
        >
          {invite.isPending ? 'Sending…' : 'Invite'}
        </Button>
      </Flex>
    </Flex>
  );
}
