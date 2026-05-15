import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Box, Button, Dialog, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import { PlusIcon, ViewHorizontalIcon, ListBulletIcon, ArchiveIcon } from '@radix-ui/react-icons';
import { Link } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useWorkspace, useWorkspaceMembers } from '../../../features/workspace/hooks/useWorkspace';
import { useProject, useProjects } from '../../../features/projects/hooks/useProjects';
import { useIssues, useCreateIssue } from '../../../features/issues/hooks/useIssues';
import { FilterBar } from '../../../features/issues/components/FilterBar';
import { IssueListRow } from '../../../features/issues/components/IssueListRow';
import { WorkspaceSidebar } from '../../../features/workspace/components/WorkspaceSidebar';
import { FormField } from '../../../shared/components/ui/FormField';
import type { IssueFilters } from '@org/shared-types';

const filterSchema = z.object({
  status: z.string().optional(),
  assignee: z.string().optional(),
  priority: z.string().optional(),
  label: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute('/$workspaceSlug/$projectId/list')({
  validateSearch: filterSchema,
  component: ListPage,
});

const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
});

function ListPage() {
  const { workspaceSlug, projectId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: ws } = useWorkspace(workspaceSlug);
  const { data: projects = [] } = useProjects(workspaceSlug);
  const { data: project, isLoading: projectLoading } = useProject(workspaceSlug, projectId);
  const { data: issues = [], isLoading: issuesLoading } = useIssues(workspaceSlug, projectId, search as IssueFilters);
  const { data: members = [] } = useWorkspaceMembers(workspaceSlug);
  const createIssue = useCreateIssue(workspaceSlug, projectId);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const createForm = useForm({
    defaultValues: { title: '' },
    onSubmit: async ({ value }) => {
      try {
        await createIssue.mutateAsync({ title: value.title });
        setCreateModalOpen(false);
        createForm.reset();
      } catch (err) {
        console.error('Failed to create issue:', err);
      }
    },
  });

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: issues.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  function handleFilterChange(filters: IssueFilters) {
    navigate({ search: (prev) => ({ ...prev, ...filters }) });
  }

  if (!ws || projectLoading) {
    return (
      <Flex style={{ minHeight: '100vh' }} align="center" justify="center">
        <Text color="gray">Loading…</Text>
      </Flex>
    );
  }

  if (!project) {
    return (
      <Flex style={{ minHeight: '100vh' }} align="center" justify="center">
        <Text color="red">Project not found</Text>
      </Flex>
    );
  }

  const statuses = [...project.statuses].sort((a, b) => a.position - b.position);
  const labels = project.labels;

  return (
    <Flex style={{ minHeight: '100vh' }}>
      <WorkspaceSidebar workspace={ws} projects={projects} activeProjectId={projectId} />

      <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
        {/* Project header */}
        <Flex
          align="center"
          justify="between"
          px="4"
          py="3"
          style={{ borderBottom: '1px solid var(--gray-4)', flexShrink: 0 }}
        >
          <Flex align="center" gap="3">
            <Heading size="4">{project.name}</Heading>
            <Flex gap="1">
              <Link
                to="/$workspaceSlug/$projectId/board"
                params={{ workspaceSlug, projectId }}
                style={{ textDecoration: 'none' }}
              >
                <Button size="1" variant="ghost" color="gray">
                  <ViewHorizontalIcon /> Board
                </Button>
              </Link>
              <Link
                to="/$workspaceSlug/$projectId/list"
                params={{ workspaceSlug, projectId }}
                style={{ textDecoration: 'none' }}
              >
                <Button size="1" variant="solid" color="indigo" aria-current="page">
                  <ListBulletIcon /> List
                </Button>
              </Link>
            </Flex>
          </Flex>
          <Flex align="center" gap="3">
            <Text size="2" color="gray">
              {issuesLoading ? 'Loading…' : `${issues.length} issues`}
            </Text>
            <Button size="2" onClick={() => setCreateModalOpen(true)}>
              <PlusIcon /> New issue
            </Button>
          </Flex>
        </Flex>

        {/* Filter bar */}
        <Box px="4" py="2" style={{ borderBottom: '1px solid var(--gray-4)', flexShrink: 0 }}>
          <FilterBar
            filters={search as IssueFilters}
            statuses={statuses}
            labels={labels}
            members={members}
            onChange={handleFilterChange}
          />
        </Box>

        {/* Issue list header */}
        <Flex
          align="center"
          gap="3"
          px="3"
          py="2"
          style={{
            borderBottom: '1px solid var(--gray-5)',
            flexShrink: 0,
            background: 'var(--gray-1)',
          }}
        >
          <Box style={{ width: 14 }} />
          <Text size="1" color="gray" weight="medium" style={{ width: 70, flexShrink: 0 }}>
            ID
          </Text>
          <Text size="1" color="gray" weight="medium" style={{ flex: 1 }}>
            Title
          </Text>
          <Text size="1" color="gray" weight="medium" style={{ width: 100, flexShrink: 0 }}>
            Status
          </Text>
          <Text size="1" color="gray" weight="medium" style={{ width: 80, flexShrink: 0 }}>
            Priority
          </Text>
          <Text size="1" color="gray" weight="medium" style={{ width: 32, flexShrink: 0 }}>
            Assignee
          </Text>
        </Flex>

        {/* Virtualized issue rows */}
        {issuesLoading ? (
          <Flex align="center" justify="center" style={{ flex: 1 }}>
            <Text color="gray">Loading issues…</Text>
          </Flex>
        ) : issues.length === 0 ? (
          <Flex align="center" justify="center" direction="column" gap="3" style={{ flex: 1 }}>
            <ArchiveIcon width={36} height={36} style={{ color: 'var(--gray-7)' }} />
            <Flex direction="column" align="center" gap="1">
              {Object.values(search).some(Boolean) ? (
                <>
                  <Text size="4" weight="medium">No issues match your filters</Text>
                  <Text size="2" color="gray">Try adjusting or clearing the active filters</Text>
                </>
              ) : (
                <>
                  <Text size="4" weight="medium">No issues yet</Text>
                  <Text size="2" color="gray">Create your first issue to start tracking work</Text>
                </>
              )}
            </Flex>
            {Object.values(search).some(Boolean) ? (
              <Button variant="soft" size="2" onClick={() => handleFilterChange({})}>
                Clear filters
              </Button>
            ) : (
              <Button size="2" onClick={() => setCreateModalOpen(true)}>
                <PlusIcon /> New issue
              </Button>
            )}
          </Flex>
        ) : (
          <Box
            ref={parentRef}
            style={{ flex: 1, overflow: 'auto' }}
            role="list"
            aria-label={`Issues in ${project.name}`}
          >
            <Box
              style={{
                height: rowVirtualizer.getTotalSize(),
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const issue = issues[virtualRow.index];
                return (
                  <Box
                    key={issue.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: virtualRow.size,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <IssueListRow
                      issue={issue}
                      statuses={statuses}
                      members={members}
                      onClick={() =>
                        navigate({
                          to: '/$workspaceSlug/$projectId/issues/$issueNumber',
                          params: {
                            workspaceSlug,
                            projectId,
                            issueNumber: String(issue.number),
                          },
                        })
                      }
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* New issue button at bottom */}
        <Flex
          align="center"
          px="4"
          py="2"
          style={{ borderTop: '1px solid var(--gray-4)', flexShrink: 0 }}
        >
          <Button
            variant="ghost"
            color="gray"
            size="2"
            onClick={() => setCreateModalOpen(true)}
          >
            <PlusIcon /> New issue
          </Button>
        </Flex>

        {/* Create issue modal */}
        <Dialog.Root
          open={createModalOpen}
          onOpenChange={(open) => { if (!open) { setCreateModalOpen(false); createForm.reset(); } }}
        >
          <Dialog.Content style={{ maxWidth: 440 }}>
            <Dialog.Title>New issue</Dialog.Title>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createForm.handleSubmit();
              }}
            >
              <Flex direction="column" gap="4" mt="4">
                <createForm.Field
                  name="title"
                  validators={{
                    onChange: ({ value }) => {
                      const r = createIssueSchema.shape.title.safeParse(value);
                      return r.success ? undefined : r.error.issues[0].message;
                    },
                  }}
                >
                  {(field) => (
                    <FormField label="Title" htmlFor="issue-title" error={field.state.meta.errors[0]}>
                      <TextField.Root
                        id="issue-title"
                        autoFocus
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Issue title"
                      />
                    </FormField>
                  )}
                </createForm.Field>

                <Flex gap="2" justify="end">
                  <Dialog.Close>
                    <Button variant="soft" color="gray">Cancel</Button>
                  </Dialog.Close>
                  <Button type="submit" loading={createIssue.isPending}>
                    Create issue
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Dialog.Content>
        </Dialog.Root>
      </Flex>
    </Flex>
  );
}
