import type {
  ISpeedTestResultRepository,
  SpeedTestResult,
  CreateSpeedTestResultData,
  SpeedTestResultQuery,
} from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class MockSpeedTestResultRepository
  implements ISpeedTestResultRepository
{
  private results: SpeedTestResult[] = [];

  constructor(private logger?: ILogger) {
    this.seedResults();
  }

  private seedResults(): void {
    const now = new Date();
    const targets = ["target-1", "target-2", "target-3"];

    // Generate some historical data
    for (let i = 0; i < 30; i++) {
      const targetId = targets[i % targets.length];
      const isSuccess = Math.random() > 0.1; // 90% success rate

      const timestamp = new Date(now.getTime() - i * 60000);
      this.results.push({
        id: crypto.randomUUID(),
        ping: isSuccess ? Math.floor(Math.random() * 50) + 10 : null,
        download: isSuccess ? Math.floor(Math.random() * 100) + 50 : null,
        upload: isSuccess ? Math.floor(Math.random() * 50) + 10 : null,
        status: isSuccess ? "SUCCESS" : "FAILURE",
        error: isSuccess ? undefined : "Simulated network error",
        createdAt: timestamp.toISOString(),
        timestamp: timestamp.toISOString(),
        targetId,
      });
    }
  }

  async findById(id: string): Promise<SpeedTestResult | null> {
    this.logger?.debug("MockSpeedTestResultRepository: Finding result by ID", {
      id,
    });
    return this.results.find(result => result.id === id) || null;
  }

  async findByTargetId(
    targetId: string,
    limit = 100
  ): Promise<SpeedTestResult[]> {
    this.logger?.debug(
      "MockSpeedTestResultRepository: Finding results by target ID",
      { targetId, limit }
    );
    return this.results
      .filter(result => result.targetId === targetId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async findLatestByTargetId(
    targetId: string
  ): Promise<SpeedTestResult | null> {
    this.logger?.debug(
      "MockSpeedTestResultRepository: Finding latest result by target ID",
      { targetId }
    );
    const results = this.results
      .filter(result => result.targetId === targetId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return results.length > 0 ? results[0] : null;
  }

  async findByQuery(query: SpeedTestResultQuery): Promise<SpeedTestResult[]> {
    this.logger?.debug(
      "MockSpeedTestResultRepository: Finding results by query",
      { query }
    );

    let filteredResults = [...this.results];

    if (query.targetId) {
      filteredResults = filteredResults.filter(
        result => result.targetId === query.targetId
      );
    }

    if (query.status) {
      filteredResults = filteredResults.filter(
        result => result.status === query.status
      );
    }

    if (query.startDate) {
      filteredResults = filteredResults.filter(
        result => new Date(result.createdAt) >= (query.startDate as Date)
      );
    }

    if (query.endDate) {
      filteredResults = filteredResults.filter(
        result => new Date(result.createdAt) <= (query.endDate as Date)
      );
    }

    return filteredResults
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(query.offset || 0, (query.offset || 0) + (query.limit || 100));
  }

  async getAll(limit = 100, offset = 0): Promise<SpeedTestResult[]> {
    this.logger?.debug("MockSpeedTestResultRepository: Getting all results", {
      limit,
      offset,
    });
    return this.results
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
  }

  async count(): Promise<number> {
    this.logger?.debug("MockSpeedTestResultRepository: Counting results");
    return this.results.length;
  }

  async create(data: CreateSpeedTestResultData): Promise<SpeedTestResult> {
    this.logger?.debug("MockSpeedTestResultRepository: Creating result", {
      data,
    });

    const now = new Date();
    const result: SpeedTestResult = {
      id: crypto.randomUUID(),
      ping: data.ping ?? null,
      download: data.download ?? null,
      upload: data.upload ?? null,
      status: data.status,
      error: data.error,
      createdAt: now.toISOString(),
      timestamp: now.toISOString(),
      targetId: data.targetId,
    };

    this.results.push(result);
    return result;
  }

  async update(
    id: string,
    data: Partial<CreateSpeedTestResultData>
  ): Promise<SpeedTestResult> {
    this.logger?.debug("MockSpeedTestResultRepository: Updating result", {
      id,
      data,
    });

    const resultIndex = this.results.findIndex(result => result.id === id);
    if (resultIndex === -1) {
      throw new Error(`Speed test result with ID ${id} not found`);
    }

    const result = this.results[resultIndex];
    this.results[resultIndex] = {
      ...result,
      ...data,
    };

    return this.results[resultIndex];
  }

  async delete(id: string): Promise<void> {
    this.logger?.debug("MockSpeedTestResultRepository: Deleting result", {
      id,
    });

    const resultIndex = this.results.findIndex(result => result.id === id);
    if (resultIndex === -1) {
      throw new Error(`Speed test result with ID ${id} not found`);
    }

    this.results.splice(resultIndex, 1);
  }

  async deleteByTargetId(targetId: string): Promise<void> {
    this.logger?.debug(
      "MockSpeedTestResultRepository: Deleting results by target ID",
      { targetId }
    );
    this.results = this.results.filter(result => result.targetId !== targetId);
  }

  async deleteOldResults(olderThan: Date): Promise<number> {
    this.logger?.debug("MockSpeedTestResultRepository: Deleting old results", {
      olderThan,
    });

    const initialCount = this.results.length;
    const olderThanTime = olderThan.getTime();
    this.results = this.results.filter(result => {
      const resultTime = new Date(result.createdAt).getTime();
      return resultTime >= olderThanTime;
    });

    return initialCount - this.results.length;
  }

  // Helper method for testing
  setSeedData(results: SpeedTestResult[]): void {
    this.results = results;
  }

  // Helper method to get all results for testing
  getAllResults(): SpeedTestResult[] {
    return [...this.results];
  }
}
