import type { MonitoringTarget } from "@prisma/client";

// This is our domain model. It's separate from the Prisma model.
export type Target = Pick<
  MonitoringTarget,
  "id" | "name" | "address" | "ownerId"
>;

export type CreateTargetData = Omit<Target, "id">;
export type UpdateTargetData = Partial<Pick<Target, "name" | "address">>;

export interface ITargetRepository {
  findAll(): Promise<Target[]>;
  findById(id: string): Promise<Target | null>;
  findByUserId(userId: string): Promise<Target[]>;
  create(data: CreateTargetData): Promise<Target>;
  update(id: string, data: UpdateTargetData): Promise<Target>;
  delete(id: string): Promise<void>;
}
