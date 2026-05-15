import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const DEFAULT_STATUSES = [
  { name: 'Backlog',     color: '#6B7280', type: 'BACKLOG',      position: 0 },
  { name: 'Todo',        color: '#3B82F6', type: 'TODO',         position: 1 },
  { name: 'In Progress', color: '#F59E0B', type: 'IN_PROGRESS',  position: 2 },
  { name: 'Done',        color: '#10B981', type: 'DONE',         position: 3 },
  { name: 'Cancelled',   color: '#EF4444', type: 'CANCELLED',    position: 4 },
] as const;

async function main() {
  const projects = await prisma.project.findMany({
    where: { statuses: { none: {} } },
    select: { id: true, name: true },
  });

  if (projects.length === 0) {
    console.log('No projects without statuses found.');
    return;
  }

  console.log(`Seeding statuses for ${projects.length} project(s)…`);

  for (const project of projects) {
    await prisma.status.createMany({
      data: DEFAULT_STATUSES.map((s) => ({
        id: randomUUID(),
        projectId: project.id,
        name: s.name,
        color: s.color,
        type: s.type,
        position: s.position,
      })),
    });
    console.log(`  ✓ ${project.name} (${project.id})`);
  }

  console.log('Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
