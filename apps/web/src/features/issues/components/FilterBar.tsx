import { useState } from 'react';
import { Badge, Box, Button, Dialog, Flex, Select } from '@radix-ui/themes';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import type { IssueFilters, LabelDto, Priority, StatusDto, WorkspaceMemberDto } from '@org/shared-types';

interface FilterBarProps {
  filters: IssueFilters;
  statuses: StatusDto[];
  labels: LabelDto[];
  members: WorkspaceMemberDto[];
  onChange: (filters: IssueFilters) => void;
}

const PRIORITY_OPTIONS: Array<{ value: Priority; label: string }> = [
  { value: 'NO_PRIORITY', label: 'No priority' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

function countActiveFilters(filters: IssueFilters): number {
  return [filters.status, filters.priority, filters.assignee, filters.label].filter(Boolean).length;
}

function FilterSelects({
  filters,
  statuses,
  labels,
  members,
  onChange,
  direction = 'row',
}: FilterBarProps & { direction?: 'row' | 'column' }) {
  function set(patch: Partial<IssueFilters>) {
    onChange({ ...filters, ...patch });
  }

  return (
    <Flex direction={direction} gap="2" wrap="wrap">
      <Select.Root
        value={filters.status ?? '__all__'}
        onValueChange={(v) => set({ status: v === '__all__' ? undefined : v })}
      >
        <Select.Trigger placeholder="Status" aria-label="Filter by status" />
        <Select.Content>
          <Select.Item value="__all__">All statuses</Select.Item>
          {statuses.map((s) => (
            <Select.Item key={s.id} value={s.id}>
              {s.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      <Select.Root
        value={filters.priority ?? '__all__'}
        onValueChange={(v) => set({ priority: v === '__all__' ? undefined : (v as Priority) })}
      >
        <Select.Trigger placeholder="Priority" aria-label="Filter by priority" />
        <Select.Content>
          <Select.Item value="__all__">All priorities</Select.Item>
          {PRIORITY_OPTIONS.map((opt) => (
            <Select.Item key={opt.value} value={opt.value}>
              {opt.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      <Select.Root
        value={filters.assignee ?? '__all__'}
        onValueChange={(v) => set({ assignee: v === '__all__' ? undefined : v })}
      >
        <Select.Trigger placeholder="Assignee" aria-label="Filter by assignee" />
        <Select.Content>
          <Select.Item value="__all__">All assignees</Select.Item>
          {members.map((m) => (
            <Select.Item key={m.id} value={m.id}>
              {m.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      <Select.Root
        value={filters.label ?? '__all__'}
        onValueChange={(v) => set({ label: v === '__all__' ? undefined : v })}
      >
        <Select.Trigger placeholder="Label" aria-label="Filter by label" />
        <Select.Content>
          <Select.Item value="__all__">All labels</Select.Item>
          {labels.map((l) => (
            <Select.Item key={l.id} value={l.id}>
              {l.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  );
}

export function FilterBar({ filters, statuses, labels, members, onChange }: FilterBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = countActiveFilters(filters);
  const hasActive = activeCount > 0;

  function clearAll() {
    onChange({});
  }

  return (
    <>
      {/* Desktop — hidden below sm breakpoint */}
      <Flex align="center" gap="2" className="hidden sm:flex">
        <FilterSelects
          filters={filters}
          statuses={statuses}
          labels={labels}
          members={members}
          onChange={onChange}
          direction="row"
        />
        {hasActive && (
          <Button variant="ghost" size="1" color="gray" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </Flex>

      {/* Mobile — show below sm breakpoint */}
      <Box className="flex sm:hidden">
        <Button
          variant="soft"
          size="2"
          color={hasActive ? 'indigo' : 'gray'}
          onClick={() => setMobileOpen(true)}
          aria-label={`Filters${hasActive ? ` (${activeCount} active)` : ''}`}
        >
          <MixerHorizontalIcon />
          Filters
          {hasActive && (
            <Badge size="1" color="indigo" ml="1">
              {activeCount}
            </Badge>
          )}
        </Button>

        <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Dialog.Content
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              margin: 0,
              borderRadius: 'var(--radius-3) var(--radius-3) 0 0',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            <Dialog.Title>Filters</Dialog.Title>

            <Flex direction="column" gap="3" mt="2">
              <FilterSelects
                filters={filters}
                statuses={statuses}
                labels={labels}
                members={members}
                onChange={onChange}
                direction="column"
              />
            </Flex>

            <Flex gap="2" justify="end" mt="4">
              {hasActive && (
                <Button
                  variant="ghost"
                  size="2"
                  color="gray"
                  onClick={() => {
                    clearAll();
                    setMobileOpen(false);
                  }}
                >
                  Clear all
                </Button>
              )}
              <Dialog.Close>
                <Button size="2">Done</Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Box>
    </>
  );
}
