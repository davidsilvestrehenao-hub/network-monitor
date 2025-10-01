import type {
  PrismaClient,
  MonitoringTarget as PrismaTarget,
} from "@prisma/client";
import type { IDatabaseService } from "@network-monitor/shared";
import type {
  ITargetRepository,
  Target,
  CreateTargetData,
  UpdateTargetData,
} from "../interfaces/ITargetRepository";

export class TargetRepository implements ITargetRepository {
  private prisma: PrismaClient;

  constructor(databaseService: IDatabaseService) {
    this.prisma = databaseService.getClient();
  }

  // Maps a Prisma model to our domain model.
  private toDomainModel(target: PrismaTarget): Target {
    return {
      id: target.id,
      name: target.name,
      address: target.address,
      ownerId: target.ownerId,
    };
  }

  async findAll(): Promise<Target[]> {
    const targets = await this.prisma.monitoringTarget.findMany();
    return targets.map(this.toDomainModel.bind(this));
  }

  async findById(id: string): Promise<Target | null> {
    const target = await this.prisma.monitoringTarget.findUnique({
      where: { id },
    });
    return target ? this.toDomainModel(target) : null;
  }

  async findByUserId(userId: string): Promise<Target[]> {
    const targets = await this.prisma.monitoringTarget.findMany({
      where: { ownerId: userId },
    });
    return targets.map(this.toDomainModel.bind(this));
  }

  async create(data: CreateTargetData): Promise<Target> {
    const newTarget = await this.prisma.monitoringTarget.create({
      data,
    });
    return this.toDomainModel(newTarget);
  }

  async update(id: string, data: UpdateTargetData): Promise<Target> {
    const updatedTarget = await this.prisma.monitoringTarget.update({
      where: { id },
      data,
    });
    return this.toDomainModel(updatedTarget);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.monitoringTarget.delete({
      where: { id },
    });
  }
}
