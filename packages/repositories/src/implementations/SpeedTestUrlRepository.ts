import type {
  ISpeedTestUrlRepository,
  CreateSpeedTestUrlData,
  UpdateSpeedTestUrlData,
  SpeedTestUrl,
  IPrisma,
  ILogger,
} from "@network-monitor/shared";

export class SpeedTestUrlRepository implements ISpeedTestUrlRepository {
  private databaseService: IPrisma;
  private logger: ILogger;

  constructor(databaseService: IPrisma, logger: ILogger) {
    this.databaseService = databaseService;
    this.logger = logger;
  }

  async findById(id: string): Promise<SpeedTestUrl | null> {
    try {
      const prismaUrl = await this.databaseService
        .getClient()
        .speedTestUrl.findUnique({
          where: { id },
        });

      return prismaUrl ? this.mapToSpeedTestUrl(prismaUrl) : null;
    } catch (error) {
      this.logger.error("SpeedTestUrlRepository: Error finding URL by ID", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getAll(limit?: number, offset?: number): Promise<SpeedTestUrl[]> {
    try {
      const prismaUrls = await this.databaseService
        .getClient()
        .speedTestUrl.findMany({
          take: limit,
          skip: offset,
          orderBy: { priority: "asc" },
        });

      return prismaUrls.map(this.mapToSpeedTestUrl);
    } catch (error) {
      this.logger.error("SpeedTestUrlRepository: Error getting all URLs", {
        limit,
        offset,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async create(data: CreateSpeedTestUrlData): Promise<SpeedTestUrl> {
    try {
      const prismaUrl = await this.databaseService
        .getClient()
        .speedTestUrl.create({
          data: {
            name: data.name,
            url: data.url,
            sizeBytes: data.sizeBytes,
            provider: data.provider,
            region: data.region,
            enabled: data.enabled ?? true,
            priority: data.priority ?? 0,
            description: data.description,
          },
        });

      this.logger.debug("SpeedTestUrlRepository: Created URL", {
        id: prismaUrl.id,
        name: data.name,
      });

      return this.mapToSpeedTestUrl(prismaUrl);
    } catch (error) {
      this.logger.error("SpeedTestUrlRepository: Error creating URL", {
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async update(
    id: string,
    data: UpdateSpeedTestUrlData
  ): Promise<SpeedTestUrl> {
    try {
      const prismaUrl = await this.databaseService
        .getClient()
        .speedTestUrl.update({
          where: { id },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.url && { url: data.url }),
            ...(data.sizeBytes && { sizeBytes: data.sizeBytes }),
            ...(data.provider && { provider: data.provider }),
            ...(data.region !== undefined && { region: data.region }),
            ...(data.enabled !== undefined && { enabled: data.enabled }),
            ...(data.priority !== undefined && { priority: data.priority }),
            ...(data.description !== undefined && {
              description: data.description,
            }),
          },
        });

      this.logger.debug("SpeedTestUrlRepository: Updated URL", {
        id,
        updates: data,
      });

      return this.mapToSpeedTestUrl(prismaUrl);
    } catch (error) {
      this.logger.error("SpeedTestUrlRepository: Error updating URL", {
        id,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.databaseService.getClient().speedTestUrl.delete({
        where: { id },
      });

      this.logger.debug("SpeedTestUrlRepository: Deleted URL", { id });
    } catch (error) {
      this.logger.error("SpeedTestUrlRepository: Error deleting URL", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      return await this.databaseService.getClient().speedTestUrl.count();
    } catch (error) {
      this.logger.error("SpeedTestUrlRepository: Error counting URLs", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async findByProvider(provider: string): Promise<SpeedTestUrl[]> {
    try {
      const prismaUrls = await this.databaseService
        .getClient()
        .speedTestUrl.findMany({
          where: { provider },
          orderBy: { priority: "asc" },
        });

      return prismaUrls.map(this.mapToSpeedTestUrl);
    } catch (error) {
      this.logger.error(
        "SpeedTestUrlRepository: Error finding URLs by provider",
        {
          provider,
          error: error instanceof Error ? error.message : String(error),
        }
      );
      throw error;
    }
  }

  async findBySize(sizeBytes: number): Promise<SpeedTestUrl[]> {
    try {
      const prismaUrls = await this.databaseService
        .getClient()
        .speedTestUrl.findMany({
          where: { sizeBytes },
          orderBy: { priority: "asc" },
        });

      return prismaUrls.map(this.mapToSpeedTestUrl);
    } catch (error) {
      this.logger.error("SpeedTestUrlRepository: Error finding URLs by size", {
        sizeBytes,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async findEnabled(): Promise<SpeedTestUrl[]> {
    try {
      const prismaUrls = await this.databaseService
        .getClient()
        .speedTestUrl.findMany({
          where: { enabled: true },
          orderBy: { priority: "asc" },
        });

      return prismaUrls.map(this.mapToSpeedTestUrl);
    } catch (error) {
      this.logger.error("SpeedTestUrlRepository: Error finding enabled URLs", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async findByPriorityRange(
    minPriority: number,
    maxPriority: number
  ): Promise<SpeedTestUrl[]> {
    try {
      const prismaUrls = await this.databaseService
        .getClient()
        .speedTestUrl.findMany({
          where: {
            priority: {
              gte: minPriority,
              lte: maxPriority,
            },
          },
          orderBy: { priority: "asc" },
        });

      return prismaUrls.map(this.mapToSpeedTestUrl);
    } catch (error) {
      this.logger.error(
        "SpeedTestUrlRepository: Error finding URLs by priority range",
        {
          minPriority,
          maxPriority,
          error: error instanceof Error ? error.message : String(error),
        }
      );
      throw error;
    }
  }

  async enableUrl(id: string): Promise<SpeedTestUrl | null> {
    try {
      const prismaUrl = await this.databaseService
        .getClient()
        .speedTestUrl.update({
          where: { id },
          data: { enabled: true },
        });

      this.logger.debug("SpeedTestUrlRepository: Enabled URL", { id });
      return this.mapToSpeedTestUrl(prismaUrl);
    } catch (error) {
      this.logger.error("SpeedTestUrlRepository: Error enabling URL", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async disableUrl(id: string): Promise<SpeedTestUrl | null> {
    try {
      const prismaUrl = await this.databaseService
        .getClient()
        .speedTestUrl.update({
          where: { id },
          data: { enabled: false },
        });

      this.logger.debug("SpeedTestUrlRepository: Disabled URL", { id });
      return this.mapToSpeedTestUrl(prismaUrl);
    } catch (error) {
      this.logger.error("SpeedTestUrlRepository: Error disabling URL", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async updatePriority(
    id: string,
    priority: number
  ): Promise<SpeedTestUrl | null> {
    try {
      const prismaUrl = await this.databaseService
        .getClient()
        .speedTestUrl.update({
          where: { id },
          data: { priority },
        });

      this.logger.debug("SpeedTestUrlRepository: Updated URL priority", {
        id,
        priority,
      });
      return this.mapToSpeedTestUrl(prismaUrl);
    } catch (error) {
      this.logger.error("SpeedTestUrlRepository: Error updating URL priority", {
        id,
        priority,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async seedDefaultUrls(): Promise<void> {
    try {
      // Check if URLs already exist
      const existingCount = await this.count();
      if (existingCount > 0) {
        this.logger.debug(
          "SpeedTestUrlRepository: URLs already seeded, skipping"
        );
        return;
      }

      const defaultUrls: CreateSpeedTestUrlData[] = [
        // CacheFly URLs
        {
          name: "CacheFly 10MB",
          url: "http://cachefly.cachefly.net/10mb.test",
          sizeBytes: 10 * 1024 * 1024, // 10 MB
          provider: "CacheFly",
          region: "Global CDN",
          enabled: true,
          priority: 1,
          description: "Small test file for quick speed tests",
        },
        {
          name: "CacheFly 100MB",
          url: "http://cachefly.cachefly.net/100mb.test",
          sizeBytes: 100 * 1024 * 1024, // 100 MB
          provider: "CacheFly",
          region: "Global CDN",
          enabled: true,
          priority: 2,
          description: "Standard test file for accurate speed measurements",
        },
        {
          name: "CacheFly 1GB",
          url: "http://cachefly.cachefly.net/1gb.test",
          sizeBytes: 1024 * 1024 * 1024, // 1 GB
          provider: "CacheFly",
          region: "Global CDN",
          enabled: true,
          priority: 3,
          description: "Large test file for high-speed connection testing",
        },
        // ThinkBroadband URLs
        {
          name: "ThinkBroadband 5MB",
          url: "http://ipv4.download.thinkbroadband.com/5MB.zip",
          sizeBytes: 5 * 1024 * 1024, // 5 MB
          provider: "ThinkBroadband",
          region: "UK",
          enabled: true,
          priority: 4,
          description: "Small compressed test file from UK provider",
        },
        {
          name: "ThinkBroadband 50MB",
          url: "http://ipv4.download.thinkbroadband.com/50MB.zip",
          sizeBytes: 50 * 1024 * 1024, // 50 MB
          provider: "ThinkBroadband",
          region: "UK",
          enabled: true,
          priority: 5,
          description: "Medium compressed test file from UK provider",
        },
        {
          name: "ThinkBroadband 200MB",
          url: "http://ipv4.download.thinkbroadband.com/200MB.zip",
          sizeBytes: 200 * 1024 * 1024, // 200 MB
          provider: "ThinkBroadband",
          region: "UK",
          enabled: true,
          priority: 6,
          description: "Large compressed test file from UK provider",
        },
      ];

      // Create all default URLs
      for (const urlData of defaultUrls) {
        await this.create(urlData);
      }

      this.logger.info("SpeedTestUrlRepository: Seeded default URLs", {
        count: defaultUrls.length,
      });
    } catch (error) {
      this.logger.error("SpeedTestUrlRepository: Error seeding default URLs", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private mapToSpeedTestUrl(prismaUrl: any): SpeedTestUrl {
    return {
      id: prismaUrl.id,
      name: prismaUrl.name,
      url: prismaUrl.url,
      sizeBytes: prismaUrl.sizeBytes,
      provider: prismaUrl.provider,
      region: prismaUrl.region,
      enabled: prismaUrl.enabled,
      priority: prismaUrl.priority,
      description: prismaUrl.description,
      createdAt: prismaUrl.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: prismaUrl.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}
