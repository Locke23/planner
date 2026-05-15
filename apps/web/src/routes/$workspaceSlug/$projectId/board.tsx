import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { IssueDto } from '@org/shared-types';
import { ArchiveIcon, ListBulletIcon, PlusIcon, ViewHorizontalIcon } from '@radix-ui/react-icons';
import {
  Box, Button, Dialog, Flex, Heading, ScrollArea, Text, TextField,
} from '@radix-ui/themes';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { IssueCard } from '../../../features/issues/components/IssueCard';
import { KanbanColumn } from '../../../features/issues/components/KanbanColumn';
import { useCreateIssue, useIssues, useUpdateIssue } from '../../../features/issues/hooks/useIssues';
import { useProject, useProjects } from '../../../features/projects/hooks/useProjects';
import { WorkspaceSidebar } from '../../../features/workspace/components/WorkspaceSidebar';
import { useWorkspace, useWorkspaceMembers } from '../../../features/workspace/hooks/useWorkspace';
import { FormField } from '../../../shared/components/ui/FormField';

export const Route = createFileRoute('/$workspaceSlug/$projectId/board')({
  component: BoardPage,
});

const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
});

function BoardPage() {
  const { workspaceSlug, projectId } = Route.useParams();
  const navigate = useNavigate();

  const { data: ws } = useWorkspace(workspaceSlug);
  const { data: projects = [] } = useProjects(workspaceSlug);
  const { data: project, isLoading: projectLoading } = useProject(workspaceSlug, projectId);
  const { data: issues = [], isLoading: issuesLoading } = useIssues(workspaceSlug, projectId);
  const { data: members = [] } = useWorkspaceMembers(workspaceSlug);
  const updateIssue = useUpdateIssue(workspaceSlug, projectId);
  const createIssue = useCreateIssue(workspaceSlug, projectId);

  const [activeIssue, setActiveIssue] = useState<IssueDto | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const announceRef = useRef<HTMLDivElement>(null);

  const createForm = useForm({
    defaultValues: { title: '' },
    onSubmit: async ({ value }) => {
      try {
        await createIssue.mutateAsync({ title: value.title });
        setCreateOpen(false);
        createForm.reset();
      } catch (err) {
        console.error('Failed to create issue:', err);
      }
    },
  });

  // Keep a ref to the latest issues/project so drag callbacks never become stale
  const issuesRef = useRef(issues);
  const projectRef = useRef(project);
  useEffect(() => { issuesRef.current = issues; }, [issues]);
  useEffect(() => { projectRef.current = project; }, [project]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const issue = issuesRef.current.find((i) => i.id === event.active.id);
    if (issue) setActiveIssue(issue);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    const currentIssues = issuesRef.current;
    const currentProject = projectRef.current;
    if (!over || !currentProject) return;

    const draggedIssue = currentIssues.find((i) => i.id === active.id);
    if (!draggedIssue) return;

    // `over.id` is either a column statusId (dropped on empty column) or an issue id (dropped on card)
    const targetStatus = currentProject.statuses.find((s) => s.id === over.id);
    const targetIssue = currentIssues.find((i) => i.id === over.id);
    const newStatusId = targetStatus?.id ?? targetIssue?.statusId;

    if (newStatusId && newStatusId !== draggedIssue.statusId) {
      updateIssue.mutate({ issueId: draggedIssue.id, patch: { statusId: newStatusId } });
      const statusName = currentProject.statuses.find((s) => s.id === newStatusId)?.name ?? '';
      if (announceRef.current) {
        announceRef.current.textContent = `${draggedIssue.identifier} moved to ${statusName}`;
      }
    }
  }, [updateIssue]);

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
                <Button size="1" variant="solid" color="indigo" aria-current="page">
                  <ViewHorizontalIcon /> Board
                </Button>
              </Link>
              <Link
                to="/$workspaceSlug/$projectId/list"
                params={{ workspaceSlug, projectId }}
                style={{ textDecoration: 'none' }}
              >
                <Button size="1" variant="ghost" color="gray">
                  <ListBulletIcon /> List
                </Button>
              </Link>
            </Flex>
          </Flex>
          <Button size="2" onClick={() => setCreateOpen(true)}>
            <PlusIcon /> New issue
          </Button>
        </Flex>

        {/* Board */}
        <Box style={{ flex: 1, overflow: 'hidden' }}>
          {issuesLoading ? (
            <Flex align="center" justify="center" style={{ height: '100%' }}>
              <Text color="gray">Loading issues…</Text>
            </Flex>
          ) : issues.length === 0 ? (
            <Flex align="center" justify="center" direction="column" gap="3" style={{ height: '100%' }}>
              <ArchiveIcon width={36} height={36} style={{ color: 'var(--gray-7)' }} />
              <Flex direction="column" align="center" gap="1">
                <Text size="4" weight="medium">No issues yet</Text>
                <Text size="2" color="gray">Create your first issue to start tracking work</Text>
              </Flex>
              <Button size="2" onClick={() => setCreateOpen(true)}>
                <PlusIcon /> New issue
              </Button>
            </Flex>
          ) : (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <ScrollArea scrollbars="horizontal">
                <Flex
                  gap="3"
                  p="4"
                  style={{ minHeight: 'calc(100vh - 120px)', alignItems: 'flex-start' }}
                >
                  {statuses.map((status) => (
                    <KanbanColumn
                      key={status.id}
                      status={status}
                      issues={issues.filter((i) => i.statusId === status.id)}
                      allStatuses={statuses}
                      members={members}
                      labels={labels}
                      onAddIssue={() => setCreateOpen(true)}
                      onIssueClick={(issue) =>
                        navigate({
                          to: '/$workspaceSlug/$projectId/issues/$issueNumber',
                          params: { workspaceSlug, projectId, issueNumber: String(issue.number) },
                        })
                      }
                    />
                  ))}
                </Flex>
              </ScrollArea>

              <DragOverlay>
                {activeIssue && (
                  <IssueCard
                    issue={activeIssue}
                    statuses={statuses}
                    members={members}
                    labels={labels}
                    isOverlay
                    onClick={() => {console.log(activeIssue)}}
                  />
                )}
              </DragOverlay>
            </DndContext>
          )}
        </Box>
      </Flex>

      {/* Visually hidden live region for drag announcements */}
      <div
        ref={announceRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />

      {/* Create issue modal */}
      <Dialog.Root
        open={createOpen}
        onOpenChange={(open) => { if (!open) { setCreateOpen(false); createForm.reset(); } }}
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
  );
}
