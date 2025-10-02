import type {
  ISpeedTestRepository,
  CreateSpeedTestData,
  SpeedTestResult,
  SpeedTestQuery,
  ILogger,
} from "@network-monitor/shared";
import { generateUUID } from "@network-monitor/shared";
import type { IDatabaseService } from "@network-monitor/shared";

export class MockSpeedTestRepository implements ISpeedTestRepository {
  private databaseService: IDatabaseService;
  private logger: ILogger;
  private speedTests: SpeedTestResult[] = [];

  constructor(databaseService: IDatabaseService, logger: ILogger) {
    this.databaseService = databaseService;
    this.logger = logger;
    this.seedSpeedTests();
  }

  private seedSpeedTests(): void {
    const now = new Date();
    const targets = ["target-1", "target-2", "target-3"];

    // Generate some historical data
    for (let i = 0; i < 20; i++) {
      const targetId = targets[i % targets.length];
      const isSuccess = Math.random() > 0.1; // 90% success rate

      const createdAt = new Date(now.getTime() - i * 60000);
      this.speedTests.push({
        id: generateUUID(), // Use UUID
        ping: isSuccess ? Math.floor(Math.random() * 50) + 10 : undefined,
        download: isSuccess ? Math.floor(Math.random() * 100) + 50 : undefined,
        upload: isSuccess ? Math.floor(Math.random() * 50) + 10 : undefined,
        status: isSuccess ? "SUCCESS" : "FAILURE",
        error: isSuccess ? undefined : "Simulated network error",
        createdAt,
        updatedAt: createdAt,
        targetId,
      });
    }
  }

  async create(data: CreateSpeedTestData): Promise<SpeedTestResult> {
    this.logger.debug("MockSpeedTestRepository: Creating speed test result", {
      data,
    });

    const now = new Date();
    const newSpeedTest: SpeedTestResult = {
      id: generateUUID(), // Use UUID
      targetId: data.targetId,
      download: data.download,
      upload: data.upload ?? Math.random() * 50 + 10, // Use provided upload or generate mock value
      ping: data.ping,
      status: data.status || "SUCCESS",
      error: data.error,
      createdAt: now,
      updatedAt: now,
    };

    this.speedTests.push(newSpeedTest);
    return newSpeedTest;
  }

  async findById(id: string | number): Promise<SpeedTestResult | null> {
    this.logger.debug("MockSpeedTestRepository: Finding speed test by ID", {
      id,
    });
    return this.speedTests.find(st => st.id === id) || null;
  }

  async getAll(limit = 100, offset = 0): Promise<SpeedTestResult[]> {
    this.logger.debug("MockSpeedTestRepository: Getting all speed tests", {
      limit,
      offset,
    });
    return this.speedTests.slice(offset, offset + limit);
  }

  async update(id: string | number, _data: never): Promise<SpeedTestResult> {
    this.logger.debug(
      "MockSpeedTestRepository: update called but not supported",
      { id }
    );
    const stringId = String(id);
    const index = this.speedTests.findIndex(st => st.id === stringId);
    if (index === -1) {
      throw new Error(`SpeedTestResult with ID ${stringId} not found`);
    }
    // Updates are not supported in this repository per interface contract (UpdateData = never)
    return this.speedTests[index];
  }

  async delete(id: string | number): Promise<void> {
    this.logger.debug("MockSpeedTestRepository: Deleting speed test", { id });
    const stringId = String(id);
    const index = this.speedTests.findIndex(st => st.id === stringId);

    if (index === -1) {
      throw new Error(`SpeedTestResult with ID ${stringId} not found`);
    }

    this.speedTests.splice(index, 1);
  }

  async findByTargetId(
    targetId: string,
    limit = 100
  ): Promise<SpeedTestResult[]> {
    this.logger.debug("MockSpeedTestRepository: Finding results by target ID", {
      targetId,
      limit,
    });
    return this.speedTests
      .filter(st => st.targetId === targetId)
      .slice(0, limit);
  }

  async findLatestByTargetId(
    targetId: string
  ): Promise<SpeedTestResult | null> {
    this.logger.debug(
      "MockSpeedTestRepository: Finding latest result by target ID",
      { targetId }
    );
    const results = this.speedTests
      .filter(st => st.targetId === targetId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return results.length > 0 ? results[0] : null;
  }

  async findByQuery(query: SpeedTestQuery): Promise<SpeedTestResult[]> {
    this.logger.debug("MockSpeedTestRepository: Finding results by query", {
      query,
    });

    let results = [...this.speedTests];

    if (query.targetId) {
      results = results.filter(st => st.targetId === query.targetId);
    }

    if (query.startDate) {
      results = results.filter(
        st => new Date(st.createdAt) >= (query.startDate as Date)
      );
    }

    if (query.endDate) {
      results = results.filter(
        st => new Date(st.createdAt) <= (query.endDate as Date)
      );
    }

    return results
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(query.offset || 0, (query.offset || 0) + (query.limit || 100));
  }

  async deleteByTargetId(targetId: string): Promise<void> {
    this.logger.debug("MockSpeedTestRepository: Deleting by target ID", {
      targetId,
    });
    this.speedTests = this.speedTests.filter(st => st.targetId !== targetId);
  }

  async deleteOldResults(olderThan: Date): Promise<number> {
    this.logger.debug("MockSpeedTestRepository: Deleting old results", {
      olderThan,
    });

    const initialCount = this.speedTests.length;
    const olderThanTime = olderThan.getTime();
    this.speedTests = this.speedTests.filter(st => {
      const resultTime = new Date(st.createdAt).getTime();
      return resultTime >= olderThanTime;
    });

    return initialCount - this.speedTests.length;
  }

  async count(): Promise<number> {
    this.logger.debug("MockSpeedTestRepository: Counting results");
    return this.speedTests.length;
  }

  // Helper method for testing
  setSeedData(speedTests: SpeedTestResult[]): void {
    this.speedTests = speedTests;
  }

  // Helper method to get all results for testing
  getAllResults(): SpeedTestResult[] {
    return [...this.speedTests];
  }
}
