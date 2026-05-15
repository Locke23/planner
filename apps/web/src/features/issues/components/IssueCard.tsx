import React from 'react';
import { Avatar, Badge, Card, Flex, Text } from '@radix-ui/themes';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { IssueDto, LabelDto, StatusDto, WorkspaceMemberDto } from '@org/shared-types';
import { IssuePriorityIcon } from './IssuePriorityIcon';

export interface IssueCardProps {
  issue: IssueDto;
  statuses: StatusDto[];
  members: WorkspaceMemberDto[];
  labels: LabelDto[];
  isDragging?: boolean;
  isOverlay?: boolean;
  compact?: boolean;
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

export const IssueCard = React.memo(function IssueCard({
  issue,
  statuses,
  members,
  labels,
  isDragging = false,
  isOverlay = false,
  compact = false,
  onClick,
}: IssueCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, active } = useSortable({
    id: issue.id,
  });

  const status = statuses.find((s) => s.id === issue.statusId);
  const assignee = members.find((m) => m.id === issue.assigneeId);
  const issueLabels = labels.filter((l) => issue.labelIds?.includes(l.id));

  const isActiveDrag = active?.id === issue.id && !isOverlay;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isActiveDrag || isDragging
      ? { opacity: 0.4, border: '2px dashed var(--accent-6)' }
      : {}),
    ...(isOverlay
      ? {
          transform: `${CSS.Transform.toString(transform) ?? ''} scale(1.02)`,
          boxShadow: 'var(--shadow-4)',
          opacity: 1,
        }
      : {}),
  };

  const ariaLabel = `Issue ${issue.identifier}: ${issue.title}`;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }

  if (compact) {
    return (
      <Flex
        ref={setNodeRef}
        style={{
          ...style,
          borderBottom: '1px solid var(--gray-5)',
          padding: '8px 12px',
          cursor: isActiveDrag ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
        align="center"
        gap="3"
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...attributes}
        {...listeners}
        role="article"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        <IssuePriorityIcon priority={issue.priority} size={14} />

        <Text size="1" color="gray" style={{ flexShrink: 0, fontFamily: 'monospace' }}>
          {issue.identifier}
        </Text>

        <Text
          size="2"
          style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {issue.title}
        </Text>

        {status && (
          <Flex align="center" gap="1" style={{ flexShrink: 0 }}>
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: status.color,
                display: 'inline-block',
              }}
            />
            <Text size="1" color="gray">
              {status.name}
            </Text>
          </Flex>
        )}

        <Text
          size="1"
          color="gray"
          style={{ flexShrink: 0, textTransform: 'capitalize', fontSize: 11 }}
        >
          {issue.priority.replace('_', ' ').toLowerCase()}
        </Text>

        {assignee ? (
          <Avatar size="1" fallback={getInitials(assignee.name)} aria-label={assignee.name} />
        ) : (
          <Avatar size="1" fallback="?" aria-label="Unassigned" color="gray" variant="soft" />
        )}
      </Flex>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={{
        ...style,
        cursor: isActiveDrag ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...attributes}
      {...listeners}
      role="article"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <Flex direction="column" gap="2" p="3">
        <Flex align="center" gap="2">
          <IssuePriorityIcon priority={issue.priority} />
          <Text size="1" color="gray" style={{ fontFamily: 'monospace', flexShrink: 0 }}>
            {issue.identifier}
          </Text>
          <Text
            size="2"
            weight="medium"
            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {issue.title}
          </Text>
        </Flex>

        <Flex align="center" gap="2" justify="between">
          <Flex align="center" gap="1">
            {issueLabels.map((label) => (
              <Badge
                key={label.id}
                size="1"
                variant="soft"
                style={{ backgroundColor: `${label.color}22`, color: label.color }}
              >
                {label.name}
              </Badge>
            ))}
          </Flex>

          <Flex align="center" gap="2">
            {status && (
              <Flex align="center" gap="1">
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
                <Text size="1" color="gray">
                  {status.name}
                </Text>
              </Flex>
            )}

            {assignee ? (
              <Avatar size="1" fallback={getInitials(assignee.name)} aria-label={assignee.name} />
            ) : (
              <Avatar size="1" fallback="?" aria-label="Unassigned" color="gray" variant="soft" />
            )}
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
});
