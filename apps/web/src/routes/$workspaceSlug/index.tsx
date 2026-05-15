import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Box, Button, Card, Dialog, Flex, Heading, Text, TextField,
} from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useWorkspace } from '../../features/workspace/hooks/useWorkspace';
import { useProjects, useCreateProject } from '../../features/projects/hooks/useProjects';
import { WorkspaceSidebar } from '../../features/workspace/components/WorkspaceSidebar';
import { FormField } from '../../shared/components/ui/FormField';

export const Route = createFileRoute('/$workspaceSlug/')({
  component: WorkspaceDashboard,
});

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  identifier: z
    .string()
    .min(1, 'Identifier is required')
    .max(10)
    .regex(/^[A-Z]+$/, 'Uppercase letters only (e.g. PLN)'),
  description: z.string().optional(),
});

function WorkspaceDashboard() {
  const { workspaceSlug } = Route.useParams();
  const { data: ws, isLoading: wsLoading } = useWorkspace(workspaceSlug);
  const { data: projects = [], isLoading: projLoading } = useProjects(workspaceSlug);
  const createProject = useCreateProject(workspaceSlug);
  const [showCreate, setShowCreate] = useState(false);

  const form = useForm({
    defaultValues: { name: '', identifier: '', description: '' },
    onSubmit: async ({ value }) => {
      await createProject.mutateAsync({
        name: value.name,
        identifier: value.identifier,
        description: value.description || undefined,
      });
      setShowCreate(false);
      form.reset();
    },
  });

  if (wsLoading) {
    return (
      <Flex style={{ minHeight: '100vh' }} align="center" justify="center">
        <Text color="gray">Loading…</Text>
      </Flex>
    );
  }
  if (!ws) return <Box p="4"><Text color="red">Workspace not found</Text></Box>;

  return (
    <Flex style={{ minHeight: '100vh' }}>
      <WorkspaceSidebar workspace={ws} projects={projects} />

      <Box style={{ flex: 1, minWidth: 0 }} p="6">
        <Flex align="center" justify="between" mb="6">
          <Heading size="5">Projects</Heading>
          <Button onClick={() => setShowCreate(true)}>
            <PlusIcon /> New project
          </Button>
        </Flex>

        {projLoading && <Text color="gray">Loading projects…</Text>}

        {!projLoading && projects.length === 0 && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap="3"
            style={{
              minHeight: 300,
              border: '2px dashed var(--gray-5)',
              borderRadius: 'var(--radius-3)',
            }}
          >
            <Text color="gray" size="3">No projects yet</Text>
            <Button variant="soft" onClick={() => setShowCreate(true)}>
              <PlusIcon /> Create your first project
            </Button>
          </Flex>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {projects.map((project) => (
            <Link
              key={project.id}
              to="/$workspaceSlug/$projectId/board"
              params={{ workspaceSlug, projectId: project.id }}
              style={{ textDecoration: 'none' }}
            >
              <Card
                style={{ cursor: 'pointer', transition: 'box-shadow 150ms' }}
                className="project-card"
              >
                <Flex direction="column" gap="2" p="1">
                  <Flex align="center" gap="2">
                    <Text
                      size="1"
                      style={{
                        fontFamily: 'monospace',
                        background: 'var(--accent-3)',
                        color: 'var(--accent-11)',
                        borderRadius: 'var(--radius-1)',
                        padding: '2px 6px',
                        flexShrink: 0,
                      }}
                    >
                      {project.identifier}
                    </Text>
                    <Text weight="medium" size="3">
                      {project.name}
                    </Text>
                  </Flex>
                  {project.description && (
                    <Text size="2" color="gray" style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {project.description}
                    </Text>
                  )}
                  <Flex gap="2" mt="1">
                    <Text size="1" color="gray">
                      {project.issueCount} {project.issueCount === 1 ? 'issue' : 'issues'}
                    </Text>
                  </Flex>
                </Flex>
              </Card>
            </Link>
          ))}
        </div>
      </Box>

      <Dialog.Root open={showCreate} onOpenChange={setShowCreate}>
        <Dialog.Content style={{ maxWidth: 440 }}>
          <Dialog.Title>New project</Dialog.Title>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <Flex direction="column" gap="4" mt="4">
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) => {
                    const r = createProjectSchema.shape.name.safeParse(value);
                    return r.success ? undefined : r.error.issues[0].message;
                  },
                }}
              >
                {(field) => (
                  <FormField label="Project name" htmlFor="proj-name" error={field.state.meta.errors[0]}>
                    <TextField.Root
                      id="proj-name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="e.g. Planner"
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field
                name="identifier"
                validators={{
                  onChange: ({ value }) => {
                    const r = createProjectSchema.shape.identifier.safeParse(value);
                    return r.success ? undefined : r.error.issues[0].message;
                  },
                }}
              >
                {(field) => (
                  <FormField label="Identifier" htmlFor="proj-id" error={field.state.meta.errors[0]}>
                    <TextField.Root
                      id="proj-id"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                      onBlur={field.handleBlur}
                      placeholder="PLN"
                      maxLength={10}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </FormField>
                )}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <FormField label="Description (optional)" htmlFor="proj-desc">
                    <TextField.Root
                      id="proj-desc"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="What is this project about?"
                    />
                  </FormField>
                )}
              </form.Field>

              <Flex gap="2" justify="end" mt="2">
                <Dialog.Close>
                  <Button variant="soft" color="gray">Cancel</Button>
                </Dialog.Close>
                <Button type="submit" loading={createProject.isPending}>
                  Create project
                </Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
}
