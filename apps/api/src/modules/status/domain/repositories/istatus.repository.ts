import type { Status } from '../entities/status.entity';

export interface StatusView {
  id: string;
  projectId: string;
  name: string;
  color: string;
  type: string;
  position: number;
}

export interface IStatusRepository {
  findById(id: string): Promise<Status | null>;
  findByProject(projectId: string): Promise<StatusView[]>;
  save(status: Status): Promise<void>;
  saveMany(statuses: Status[]): Promise<void>;
  delete(id: string): Promise<void>;
  nextPosition(projectId: string): Promise<number>;
}

export const STATUS_REPOSITORY = Symbol('IStatusRepository');
