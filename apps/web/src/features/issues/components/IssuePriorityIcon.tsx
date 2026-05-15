import { Tooltip } from '@radix-ui/themes';
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  DashIcon,
  DoubleArrowUpIcon,
} from '@radix-ui/react-icons';
import type { Priority } from '@org/shared-types';

interface IssuePriorityIconProps {
  priority: Priority;
  size?: number;
}

const priorityConfig: Record<
  Priority,
  { label: string; color: string; Icon: React.ComponentType<{ width?: number; height?: number }> }
> = {
  NO_PRIORITY: { label: 'No priority', color: 'var(--gray-9)', Icon: DashIcon },
  URGENT: { label: 'Urgent', color: 'var(--red-9)', Icon: DoubleArrowUpIcon },
  HIGH: { label: 'High', color: 'var(--orange-9)', Icon: ArrowUpIcon },
  MEDIUM: { label: 'Medium', color: 'var(--yellow-9)', Icon: ArrowRightIcon },
  LOW: { label: 'Low', color: 'var(--blue-9)', Icon: ArrowDownIcon },
};

export function IssuePriorityIcon({ priority, size = 16 }: IssuePriorityIconProps) {
  const { label, color, Icon } = priorityConfig[priority];

  return (
    <Tooltip content={label}>
      <span
        aria-label={label}
        style={{ color, display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
      >
        <Icon width={size} height={size} />
      </span>
    </Tooltip>
  );
}
