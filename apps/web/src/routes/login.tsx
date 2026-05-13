import { createFileRoute } from '@tanstack/react-router';
import { Flex } from '@radix-ui/themes';
import { LoginForm } from '../features/auth/components/LoginForm';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <Flex
      align="center"
      justify="center"
      style={{ minHeight: '100vh', background: 'var(--gray-2)' }}
    >
      <LoginForm />
    </Flex>
  );
}
