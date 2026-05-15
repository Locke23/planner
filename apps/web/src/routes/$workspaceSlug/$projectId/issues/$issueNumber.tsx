import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import {
  Box, Button, Flex, Heading, Separator, Text, TextArea,
} from '@radix-ui/themes';
import { ArrowLeftIcon, Pencil1Icon, CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import { useWorkspace, useWorkspaceMembers } from '../../../../features/workspace/hooks/useWorkspace';
import { useProject, useProjects } from '../../../../features/projects/hooks/useProjects';
import { useIssue, useUpdateIssue } from '../../../../features/issues/hooks/useIssues';
import { IssueDetailPanel } from '../../../../features/issues/components/IssueDetailPanel';
import { IssuePriorityIcon } from '../../../../features/issues/components/IssuePriorityIcon';
import { WorkspaceSidebar } from '../../../../features/workspace/components/WorkspaceSidebar';
import type { UpdateIssueDto } from '@org/shared-types';

export const Route = createFileRoute(
  '/$workspaceSlug/$projectId/issues/$issueNumber',
)({
  component: IssueDetailPage,
});

function IssueDetailPage() {
  const { workspaceSlug, projectId, issueNumber } = Route.useParams();
  const navigate = useNavigate();

  const { data: ws } = useWorkspace(workspaceSlug);
  const { data: projects = [] } = useProjects(workspaceSlug);
  const { data: project } = useProject(workspaceSlug, projectId);
  const { data: issue, isLoading } = useIssue(workspaceSlug, projectId, Number(issueNumber));
  const { data: members = [] } = useWorkspaceMembers(workspaceSlug);
  const updateIssue = useUpdateIssue(workspaceSlug, projectId);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  function handleUpdate(issueId: string, patch: UpdateIssueDto) {
    updateIssue.mutate({ issueId, patch });
  }

  function startTitleEdit() {
    if (!issue) return;
    setTitleDraft(issue.title);
    setEditingTitle(true);
    setTimeout(() => titleRef.current?.focus(), 0);
  }

  function commitTitle() {
    if (!issue || !titleDraft.trim()) return;
    if (titleDraft !== issue.title) {
      handleUpdate(issue.id, { title: titleDraft.trim() });
    }
    setEditingTitle(false);
  }

  function cancelTitle() {
    setEditingTitle(false);
  }

  function startDescEdit() {
    if (!issue) return;
    setDescDraft(issue.description ?? '');
    setEditingDesc(true);
  }

  function commitDesc() {
    if (!issue) return;
    if (descDraft !== (issue.description ?? '')) {
      handleUpdate(issue.id, { description: descDraft });
    }
    setEditingDesc(false);
  }

  if (!ws || isLoading) {
    return (
      <Flex style={{ minHeight: '100vh' }} align="center" justify="center">
        <Text color="gray">Loading…</Text>
      </Flex>
    );
  }

  if (!issue || !project) {
    return (
      <Flex style={{ minHeight: '100vh' }} align="center" justify="center">
        <Text color="red">Issue not found</Text>
      </Flex>
    );
  }

  const statuses = [...project.statuses].sort((a, b) => a.position - b.position);
  const labels = project.labels;

  return (
    <Flex style={{ minHeight: '100vh' }}>
      <WorkspaceSidebar workspace={ws} projects={projects} activeProjectId={projectId} />

      <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <Flex
          align="center"
          gap="3"
          px="4"
          py="3"
          style={{ borderBottom: '1px solid var(--gray-4)', flexShrink: 0 }}
        >
          <Button
            variant="ghost"
            color="gray"
            size="1"
            onClick={() =>
              navigate({
                to: '/$workspaceSlug/$projectId/board',
                params: { workspaceSlug, projectId },
              })
            }
            aria-label="Back to board"
          >
            <ArrowLeftIcon />
            Back
          </Button>
          <Separator orientation="vertical" style={{ height: 16 }} />
          <Flex align="center" gap="2">
            <IssuePriorityIcon priority={issue.priority} size={14} />
            <Text size="2" color="gray" style={{ fontFamily: 'monospace' }}>
              {issue.identifier}
            </Text>
          </Flex>
        </Flex>

        {/* Main content — two-column on md+ */}
        <Flex
          style={{ flex: 1, minHeight: 0, overflow: 'auto' }}
          className="issue-detail-layout"
        >
          {/* Content column */}
          <Box
            style={{ flex: 1, minWidth: 0, padding: '32px 40px', maxWidth: 800 }}
          >
            {/* Title */}
            <Box mb="4">
              {editingTitle ? (
                <Flex align="center" gap="2">
                  <input
                    ref={titleRef}
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitTitle();
                      if (e.key === 'Escape') cancelTitle();
                    }}
                    style={{
                      flex: 1,
                      fontSize: 24,
                      fontWeight: 700,
                      border: 'none',
                      outline: '2px solid var(--accent-9)',
                      borderRadius: 'var(--radius-2)',
                      padding: '4px 8px',
                      background: 'var(--color-panel-solid)',
                      color: 'inherit',
                    }}
                    aria-label="Edit issue title"
                  />
                  <Button size="1" variant="soft" onClick={commitTitle} aria-label="Save title">
                    <CheckIcon />
                  </Button>
                  <Button size="1" variant="ghost" color="gray" onClick={cancelTitle} aria-label="Cancel edit">
                    <Cross2Icon />
                  </Button>
                </Flex>
              ) : (
                <Flex align="start" gap="2" style={{ cursor: 'text' }} onClick={startTitleEdit}>
                  <Heading
                    size="7"
                    style={{ flex: 1 }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Edit title: ${issue.title}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') startTitleEdit(); }}
                  >
                    {issue.title}
                  </Heading>
                  <Button size="1" variant="ghost" color="gray" aria-label="Edit title" tabIndex={-1}>
                    <Pencil1Icon />
                  </Button>
                </Flex>
              )}
            </Box>

            {/* Description */}
            <Box mb="6">
              <Flex align="center" justify="between" mb="2">
                <Text size="2" weight="medium" color="gray">Description</Text>
                {!editingDesc && (
                  <Button size="1" variant="ghost" color="gray" onClick={startDescEdit} aria-label="Edit description">
                    <Pencil1Icon />
                  </Button>
                )}
              </Flex>

              {editingDesc ? (
                <Flex direction="column" gap="2">
                  <TextArea
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    placeholder="Add a description…"
                    style={{ minHeight: 160 }}
                    autoFocus
                    aria-label="Issue description"
                  />
                  <Flex gap="2" justify="end">
                    <Button size="1" variant="ghost" color="gray" onClick={() => setEditingDesc(false)}>
                      Cancel
                    </Button>
                    <Button size="1" onClick={commitDesc}>
                      Save
                    </Button>
                  </Flex>
                </Flex>
              ) : (
                <Box
                  onClick={startDescEdit}
                  style={{
                    minHeight: 80,
                    cursor: 'text',
                    borderRadius: 'var(--radius-2)',
                    padding: '8px 4px',
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={issue.description ? 'Edit description' : 'Add description'}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') startDescEdit(); }}
                >
                  {issue.description ? (
                    <Text size="3" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {issue.description}
                    </Text>
                  ) : (
                    <Text size="3" color="gray" style={{ fontStyle: 'italic' }}>
                      Add a description…
                    </Text>
                  )}
                </Box>
              )}
            </Box>

            {/* Metadata footer on mobile (below content) */}
            <Box className="issue-panel-mobile">
              <Separator size="4" mb="4" />
              <IssueDetailPanel
                issue={issue}
                statuses={statuses}
                labels={labels}
                members={members}
                onUpdate={handleUpdate}
              />
            </Box>
          </Box>

          {/* Sidebar panel — hidden on mobile, shown on md+ */}
          <Box
            className="issue-panel-desktop"
            style={{
              width: 300,
              flexShrink: 0,
              borderLeft: '1px solid var(--gray-4)',
              padding: '32px 24px',
              overflowY: 'auto',
            }}
          >
            <IssueDetailPanel
              issue={issue}
              statuses={statuses}
              labels={labels}
              members={members}
              onUpdate={handleUpdate}
            />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
}
