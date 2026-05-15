import { Avatar, Flex, Text } from '@radix-ui/themes';
import type { IssueDto, StatusDto, WorkspaceMemberDto } from '@org/shared-types';
import { IssuePriorityIcon } from './IssuePriorityIcon';

export interface IssueListRowProps {
  issue: IssueDto;
  statuses: StatusDto[];
  members: WorkspaceMemberDto[];
  onClick: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function IssueListRow({ issue, statuses, members, onClick }: IssueListRowProps) {
  const status = statuses.find((s) => s.id === issue.statusId);
  const assignee = members.find((m) => m.id === issue.assigneeId);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <Flex
      align="center"
      gap="3"
      role="row"
      aria-label={`Issue ${issue.identifier}: ${issue.title}`}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{
        borderBottom: '1px solid var(--gray-5)',
        padding: '10px 12px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <IssuePriorityIcon priority={issue.priority} size={14} />

      <Text size="1" color="gray" style={{ width: 60, flexShrink: 0, fontFamily: 'monospace' }}>
        {issue.identifier}
      </Text>

      <Text
        size="2"
        style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {issue.title}
      </Text>

      {status && (
        <Flex align="center" gap="1" style={{ width: 100, flexShrink: 0 }}>
          <span
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: status.color,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <Text size="1" color="gray" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {status.name}
          </Text>
        </Flex>
      )}

      <Text
        size="1"
        color="gray"
        style={{ width: 80, flexShrink: 0, textTransform: 'capitalize' }}
      >
        {issue.priority.replace('_', ' ').toLowerCase()}
      </Text>

      <Flex style={{ width: 32, flexShrink: 0 }} justify="center">
        {assignee ? (
          <Avatar size="1" fallback={getInitials(assignee.name)} aria-label={assignee.name} />
        ) : (
          <Avatar size="1" fallback="?" aria-label="Unassigned" color="gray" variant="soft" />
        )}
      </Flex>
    </Flex>
  );
}
