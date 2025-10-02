import type { ISimpleRepository } from "../base/ISimpleRepository";
import type { SpeedTestUrl } from "../../types/domain-types";

export interface CreateSpeedTestUrlData {
  name: string;
  url: string;
  sizeBytes: number;
  provider: string;
  region?: string;
  enabled?: boolean;
  priority?: number;
  description?: string;
}

export interface UpdateSpeedTestUrlData {
  name?: string;
  url?: string;
  sizeBytes?: number;
  provider?: string;
  region?: string;
  enabled?: boolean;
  priority?: number;
  description?: string;
}

export interface ISpeedTestUrlRepository
  extends ISimpleRepository<
    SpeedTestUrl,
    CreateSpeedTestUrlData,
    UpdateSpeedTestUrlData
  > {
  // Query methods
  findByProvider(provider: string): Promise<SpeedTestUrl[]>;
  findBySize(sizeBytes: number): Promise<SpeedTestUrl[]>;
  findEnabled(): Promise<SpeedTestUrl[]>;
  findByPriorityRange(
    minPriority: number,
    maxPriority: number
  ): Promise<SpeedTestUrl[]>;

  // Command methods
  enableUrl(id: string): Promise<SpeedTestUrl | null>;
  disableUrl(id: string): Promise<SpeedTestUrl | null>;
  updatePriority(id: string, priority: number): Promise<SpeedTestUrl | null>;

  // Seeding method
  seedDefaultUrls(): Promise<void>;
}
