import type {
  PrismaClient,
  MonitoringTarget as PrismaTarget,
} from "@prisma/client";
import type { IDatabaseService } from "@network-monitor/shared";
import type {
  ITargetRepository,
  Target,
  TargetData,
  CreateTargetData,
  UpdateTargetData,
} from "@network-monitor/shared";

export class TargetRepository implements ITargetRepository {
  private prisma: PrismaClient;

  constructor(databaseService: IDatabaseService) {
    this.prisma = databaseService.getClient();
  }

  // Maps a Prisma model to basic target data (without relations)
  private toTargetData(target: PrismaTarget): TargetData {
    return {
      id: target.id,
      name: target.name,
      address: target.address,
      ownerId: target.ownerId,
    };
  }

  // Maps a Prisma model to full target with relations
  private async toTargetWithRelations(target: PrismaTarget): Promise<Target> {
    // For now, return basic data with empty relations
    // In a real implementation, you would fetch the related data
    return {
      id: target.id,
      name: target.name,
      address: target.address,
      ownerId: target.ownerId,
      speedTestResults: [],
      alertRules: [],
    };
  }

  // Basic data methods (without relations)
  async getAll(limit?: number, offset?: number): Promise<TargetData[]> {
    const targets = await this.prisma.monitoringTarget.findMany({
      take: limit,
      skip: offset,
    });
    return targets.map(this.toTargetData.bind(this));
  }

  async count(): Promise<number> {
    return await this.prisma.monitoringTarget.count();
  }

  async findById(id: string): Promise<TargetData | null> {
    const target = await this.prisma.monitoringTarget.findUnique({
      where: { id },
    });
    return target ? this.toTargetData(target) : null;
  }

  async findByUserId(userId: string): Promise<TargetData[]> {
    const targets = await this.prisma.monitoringTarget.findMany({
      where: { ownerId: userId },
    });
    return targets.map(this.toTargetData.bind(this));
  }

  async create(data: CreateTargetData): Promise<TargetData> {
    const newTarget = await this.prisma.monitoringTarget.create({
      data,
    });
    return this.toTargetData(newTarget);
  }

  async update(id: string, data: UpdateTargetData): Promise<TargetData> {
    const updatedTarget = await this.prisma.monitoringTarget.update({
      where: { id },
      data,
    });
    return this.toTargetData(updatedTarget);
  }

  // Aggregate methods (with relations)
  async findByIdWithRelations(id: string): Promise<Target | null> {
    const target = await this.prisma.monitoringTarget.findUnique({
      where: { id },
    });
    return target ? await this.toTargetWithRelations(target) : null;
  }

  async findByUserIdWithRelations(userId: string): Promise<Target[]> {
    const targets = await this.prisma.monitoringTarget.findMany({
      where: { ownerId: userId },
    });
    return Promise.all(
      targets.map(target => this.toTargetWithRelations(target))
    );
  }

  async getAllWithRelations(
    limit?: number,
    offset?: number
  ): Promise<Target[]> {
    const targets = await this.prisma.monitoringTarget.findMany({
      take: limit,
      skip: offset,
    });
    return Promise.all(
      targets.map(target => this.toTargetWithRelations(target))
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.monitoringTarget.delete({
      where: { id },
    });
  }
}
