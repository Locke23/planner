import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import { useCreateWorkspace } from '../hooks/useWorkspace';
import { FormField } from '../../../shared/components/ui/FormField';

const workspaceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/, 'Lowercase letters, numbers and hyphens only'),
});

const toSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceModal({ open, onOpenChange }: Props) {
  const create = useCreateWorkspace();

  const form = useForm({
    defaultValues: { name: '', slug: '' },
    validators: { onChange: workspaceSchema },
    onSubmit: async ({ value }) => {
      await create.mutateAsync(value);
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="480px">
        <Dialog.Title>New workspace</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Workspaces contain your projects and team members.
        </Dialog.Description>

        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
          <Flex direction="column" gap="4">
            <form.Field name="name">
              {(field) => (
                <FormField
                  label="Name"
                  htmlFor="ws-name"
                  error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : null}
                >
                  <TextField.Root
                    id="ws-name"
                    placeholder="Acme Inc."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      form.setFieldValue('slug', toSlug(e.target.value));
                    }}
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="slug">
              {(field) => (
                <FormField
                  label="URL slug"
                  htmlFor="ws-slug"
                  error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : null}
                >
                  <TextField.Root
                    id="ws-slug"
                    placeholder="acme-inc"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <Text size="1" color="gray">
                    app.planner.dev/<strong>{field.state.value || '…'}</strong>
                  </Text>
                </FormField>
              )}
            </form.Field>

            <Flex gap="3" justify="end" mt="2">
              <Dialog.Close>
                <Button variant="soft" color="gray">Cancel</Button>
              </Dialog.Close>
              <form.Subscribe selector={(s) => s.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting || create.isPending}>
                    {isSubmitting || create.isPending ? 'Creating…' : 'Create workspace'}
                  </Button>
                )}
              </form.Subscribe>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
