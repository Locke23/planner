import React from 'react';
import { Box, Flex, IconButton, ScrollArea, Text } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { IssueDto, LabelDto, StatusDto, WorkspaceMemberDto } from '@org/shared-types';
import { IssueCard } from './IssueCard';

interface KanbanColumnProps {
  status: StatusDto;
  issues: IssueDto[];
  allStatuses: StatusDto[];
  members: WorkspaceMemberDto[];
  labels: LabelDto[];
  onAddIssue: () => void;
  onIssueClick: (issue: IssueDto) => void;
}

function EmptyColumnSlot() {
  return (
    <Box
      style={{
        border: '2px dashed var(--gray-5)',
        borderRadius: 'var(--radius-2)',
        padding: '24px 16px',
        textAlign: 'center',
      }}
    >
      <Text size="1" color="gray">
        No issues
      </Text>
    </Box>
  );
}

export const KanbanColumn = React.memo(function KanbanColumn({
  status,
  issues,
  allStatuses,
  members,
  labels,
  onAddIssue,
  onIssueClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id });

  return (
    <Box
      ref={setNodeRef}
      role="region"
      aria-label={`${status.name} — ${issues.length} issues`}
      style={{
        background: isOver ? 'var(--accent-3)' : 'var(--gray-2)',
        borderRadius: 'var(--radius-3)',
        padding: '12px 8px',
        minWidth: 280,
        maxWidth: 320,
        flex: '0 0 300px',
        transition: 'background 150ms ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <Flex align="center" gap="2" px="1">
        <span
          aria-hidden="true"
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: status.color,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <Text size="2" weight="medium" style={{ flex: 1 }}>
          {status.name}
        </Text>
        <Text
          size="1"
          color="gray"
          style={{
            background: 'var(--gray-4)',
            borderRadius: 'var(--radius-2)',
            padding: '1px 6px',
          }}
        >
          {issues.length}
        </Text>
        <IconButton
          size="1"
          variant="ghost"
          color="gray"
          aria-label={`Add issue to ${status.name}`}
          onClick={onAddIssue}
        >
          <PlusIcon />
        </IconButton>
      </Flex>

      <ScrollArea style={{ flex: 1, maxHeight: 'calc(100vh - 220px)' }}>
        <SortableContext items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <Flex direction="column" gap="2" style={{ minHeight: 4 }}>
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                statuses={allStatuses}
                members={members}
                labels={labels}
                onClick={() => onIssueClick(issue)}
              />
            ))}
          </Flex>
        </SortableContext>

        {issues.length === 0 && <EmptyColumnSlot />}
      </ScrollArea>
    </Box>
  );
});
