import { Flex, Text } from '@radix-ui/themes';
import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string | undefined | null;
  children: ReactNode;
}

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <Flex direction="column" gap="1">
      <Text as="label" htmlFor={htmlFor} size="2" weight="medium">
        {label}
      </Text>
      {children}
      {error && (
        <Text size="1" color="red">
          {error}
        </Text>
      )}
    </Flex>
  );
}
