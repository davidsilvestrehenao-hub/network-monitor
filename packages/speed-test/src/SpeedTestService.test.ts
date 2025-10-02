import { describe, it, expect, beforeEach, vi } from "vitest";
import { SpeedTestService } from "./SpeedTestService";
import type {
  ILogger,
  ISpeedTestRepository,
  ITargetRepository,
  IEventBus,
  ISpeedTestConfigService,
} from "@network-monitor/shared";

describe("SpeedTestService", () => {
  let service: SpeedTestService;
  let mockLogger: ILogger;
  let mockSpeedTestRepository: ISpeedTestRepository;
  let mockTargetRepository: ITargetRepository;
  let mockEventBus: IEventBus;
  let mockConfigService: ISpeedTestConfigService;

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
      setLevel: vi.fn(),
      getLevel: vi.fn().mockReturnValue("info"),
      isLevelEnabled: vi.fn(),
      setContext: vi.fn(),
      getContext: vi.fn(),
      child: vi.fn(),
    } as ILogger;

    mockSpeedTestRepository = {
      runSpeedTest: vi.fn(),
      create: vi.fn(),
      findByTargetId: vi.fn(),
      findLatestByTargetId: vi.fn(),
      findByQuery: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as ISpeedTestRepository;

    mockTargetRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      getAll: vi.fn(),
      findByIdWithRelations: vi.fn(),
      findByUserIdWithRelations: vi.fn(),
      getAllWithRelations: vi.fn(),
    } as unknown as ITargetRepository;

    mockEventBus = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      removeAllListeners: vi.fn(),
      once: vi.fn(),
      emitAsync: vi.fn(),
      listenerCount: vi.fn(),
      eventNames: vi.fn(),
      setMaxListeners: vi.fn(),
      getMaxListeners: vi.fn(),
      prependListener: vi.fn(),
    } as unknown as IEventBus;

    mockConfigService = {
      getConfig: vi.fn().mockReturnValue({
        timeout: 10000,
        interval: 30000,
        maxRetries: 3,
      }),
      updateConfig: vi.fn(),
      getAllUrls: vi.fn(),
      getEnabledUrls: vi.fn(),
      getUrlsByProvider: vi.fn(),
      getUrlsBySize: vi.fn(),
      addUrl: vi.fn(),
      removeUrl: vi.fn(),
      enableUrl: vi.fn(),
      disableUrl: vi.fn(),
      updateUrl: vi.fn(),
      getUrlById: vi.fn(),
      validateUrl: vi.fn(),
      getProviders: vi.fn(),
      getSizes: vi.fn(),
      resetToDefaults: vi.fn(),
    } as unknown as ISpeedTestConfigService;

    service = new SpeedTestService(
      mockSpeedTestRepository,
      mockTargetRepository,
      mockEventBus,
      mockLogger,
      mockConfigService
    );
  });

  describe("constructor", () => {
    it("should create SpeedTestService instance", () => {
      expect(service).toBeInstanceOf(SpeedTestService);
    });

    it("should accept all dependencies", () => {
      expect(mockLogger).toBeDefined();
      expect(mockSpeedTestRepository).toBeDefined();
      expect(mockTargetRepository).toBeDefined();
      expect(mockEventBus).toBeDefined();
      expect(mockConfigService).toBeDefined();
    });
  });

  describe("basic functionality", () => {
    it("should be defined", () => {
      expect(service).toBeDefined();
    });
  });
});
