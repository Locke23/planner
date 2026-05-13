import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Link } from '@tanstack/react-router';
import { Button, Card, Callout, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useRegister } from '../hooks/useAuth';
import { FormField } from '../../../shared/components/ui/FormField';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function RegisterForm() {
  const reg = useRegister();

  const form = useForm({
    defaultValues: { name: '', email: '', password: '' },
    validators: { onChange: registerSchema, onSubmit: registerSchema },
    onSubmit: async ({ value }) => {
      await reg.mutateAsync(value);
    },
  });

  return (
    <Card size="4" style={{ width: 400 }}>
      <Flex direction="column" gap="5">
        <Heading size="6" align="center">Create your account</Heading>

        {reg.error && (
          <Callout.Root color="red" size="1">
            <Callout.Icon><ExclamationTriangleIcon /></Callout.Icon>
            <Callout.Text>Registration failed. Email may already be in use.</Callout.Text>
          </Callout.Root>
        )}

        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
          <Flex direction="column" gap="4">
            <form.Field name="name">
              {(field) => (
                <FormField
                  label="Full name"
                  htmlFor="name"
                  error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : null}
                >
                  <TextField.Root
                    id="name"
                    type="text"
                    placeholder="Jane Smith"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </FormField>
              )}
            </form.Field>

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
                <Button type="submit" disabled={isSubmitting || reg.isPending} size="3">
                  {isSubmitting || reg.isPending ? 'Creating account…' : 'Create account'}
                </Button>
              )}
            </form.Subscribe>
          </Flex>
        </form>

        <Text size="2" align="center" color="gray">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-9)' }}>
            Sign in
          </Link>
        </Text>
      </Flex>
    </Card>
  );
}
