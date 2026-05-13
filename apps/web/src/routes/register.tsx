import { createFileRoute } from '@tanstack/react-router';
import { Flex } from '@radix-ui/themes';
import { RegisterForm } from '../features/auth/components/RegisterForm';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <Flex
      align="center"
      justify="center"
      style={{ minHeight: '100vh', background: 'var(--gray-2)' }}
    >
      <RegisterForm />
    </Flex>
  );
}
