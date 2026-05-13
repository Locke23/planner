import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Link } from '@tanstack/react-router';
import { Button, Card, Callout, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useLogin } from '../hooks/useAuth';
import { FormField } from '../../../shared/components/ui/FormField';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginForm() {
  const login = useLogin();

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onChange: loginSchema, onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      await login.mutateAsync(value);
    },
  });

  return (
    <Card size="4" style={{ width: 400 }}>
      <Flex direction="column" gap="5">
        <Heading size="6" align="center">Sign in to Planner</Heading>

        {login.error && (
          <Callout.Root color="red" size="1">
            <Callout.Icon><ExclamationTriangleIcon /></Callout.Icon>
            <Callout.Text>Invalid email or password</Callout.Text>
          </Callout.Root>
        )}

        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
          <Flex direction="column" gap="4">
            <form.Field name="email">
              {(field) => (
                <FormField
                  label="Email"
                  htmlFor="email"
                  error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : null}
                >
                  <TextField.Root
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <FormField
                  label="Password"
                  htmlFor="password"
                  error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : null}
                >
                  <TextField.Root
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </FormField>
              )}
            </form.Field>

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting || login.isPending} size="3">
                  {isSubmitting || login.isPending ? 'Signing in…' : 'Sign in'}
                </Button>
              )}
            </form.Subscribe>
          </Flex>
        </form>

        <Text size="2" align="center" color="gray">
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-9)' }}>
            Register
          </Link>
        </Text>
      </Flex>
    </Card>
  );
}
