import { Avatar, Badge, Box, Button, DropdownMenu, Flex, Select, Text } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import type { IssueDto, LabelDto, Priority, StatusDto, UpdateIssueDto, WorkspaceMemberDto } from '@org/shared-types';
import { IssuePriorityIcon } from './IssuePriorityIcon';

interface IssueDetailPanelProps {
  issue: IssueDto;
  statuses: StatusDto[];
  labels: LabelDto[];
  members: WorkspaceMemberDto[];
  onUpdate: (issueId: string, patch: UpdateIssueDto) => void;
}

const PRIORITY_OPTIONS: Array<{ value: Priority; label: string }> = [
  { value: 'NO_PRIORITY', label: 'No priority' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text size="1" color="gray" weight="medium" mb="1" style={{ display: 'block' }}>
      {children}
    </Text>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function IssueDetailPanel({
  issue,
  statuses,
  labels,
  members,
  onUpdate,
}: IssueDetailPanelProps) {
  const activeLabels = labels.filter((l) => issue.labelIds?.includes(l.id));
  const availableLabels = labels.filter((l) => !issue.labelIds?.includes(l.id));

  function removeLabel(labelId: string) {
    const next = (issue.labelIds ?? []).filter((id) => id !== labelId);
    onUpdate(issue.id, { labelIds: next });
  }

  function addLabel(labelId: string) {
    const next = [...(issue.labelIds ?? []), labelId];
    onUpdate(issue.id, { labelIds: next });
  }

  return (
    <Box style={{ minWidth: 240, maxWidth: 320 }}>
      <Flex direction="column" gap="4">
        <Flex direction="column">
          <SectionLabel>Status</SectionLabel>
          <Select.Root
            value={issue.statusId}
            onValueChange={(v) => onUpdate(issue.id, { statusId: v })}
          >
            <Select.Trigger aria-label="Change status" style={{ width: '100%' }} />
            <Select.Content>
              {statuses.map((s) => (
                <Select.Item key={s.id} value={s.id}>
                  <Flex align="center" gap="2">
                    <span
                      aria-hidden="true"
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: s.color,
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    {s.name}
                  </Flex>
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column">
          <SectionLabel>Priority</SectionLabel>
          <Select.Root
            value={issue.priority}
            onValueChange={(v) => onUpdate(issue.id, { priority: v as Priority })}
          >
            <Select.Trigger aria-label="Change priority" style={{ width: '100%' }} />
            <Select.Content>
              {PRIORITY_OPTIONS.map((opt) => (
                <Select.Item key={opt.value} value={opt.value}>
                  <Flex align="center" gap="2">
                    <IssuePriorityIcon priority={opt.value} size={14} />
                    {opt.label}
                  </Flex>
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column">
          <SectionLabel>Assignee</SectionLabel>
          <Select.Root
            value={issue.assigneeId ?? ''}
            onValueChange={(v) => onUpdate(issue.id, { assigneeId: v || null })}
          >
            <Select.Trigger aria-label="Change assignee" style={{ width: '100%' }} />
            <Select.Content>
              <Select.Item value="">Unassigned</Select.Item>
              {members.map((m) => (
                <Select.Item key={m.id} value={m.id}>
                  <Flex align="center" gap="2">
                    <Avatar size="1" fallback={getInitials(m.name)} aria-hidden="true" />
                    {m.name}
                  </Flex>
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column">
          <SectionLabel>Labels</SectionLabel>
          <Flex wrap="wrap" gap="1" align="center">
            {activeLabels.map((label) => (
              <button
                key={label.id}
                onClick={() => removeLabel(label.id)}
                aria-label={`Remove label ${label.name}`}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'inline-flex',
                }}
              >
                <Badge
                  size="1"
                  variant="soft"
                  style={{
                    backgroundColor: `${label.color}22`,
                    color: label.color,
                    cursor: 'pointer',
                  }}
                >
                  {label.name} ×
                </Badge>
              </button>
            ))}

            {availableLabels.length > 0 && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Button size="1" variant="ghost" color="gray" aria-label="Add label">
                    <PlusIcon />
                    Add
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  {availableLabels.map((label) => (
                    <DropdownMenu.Item
                      key={label.id}
                      onSelect={() => addLabel(label.id)}
                    >
                      <Flex align="center" gap="2">
                        <span
                          aria-hidden="true"
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: label.color,
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                        {label.name}
                      </Flex>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            )}

            {activeLabels.length === 0 && availableLabels.length === 0 && (
              <Text size="1" color="gray">
                No labels
              </Text>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
