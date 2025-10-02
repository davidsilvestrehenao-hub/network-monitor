import { describe, it, expect, beforeEach, vi } from "vitest";
import { TargetRepository } from "./TargetRepository";
import type { IDatabaseService } from "@network-monitor/shared";

describe("TargetRepository", () => {
  let targetRepository: TargetRepository;
  let mockDatabaseService: IDatabaseService;
  // Justification: Using any type for mock Prisma client to avoid complex type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockPrismaClient: any;

  beforeEach(() => {
    // Create mock Prisma client
    mockPrismaClient = {
      monitoringTarget: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
    };

    // Create a simple mock database service
    mockDatabaseService = {
      getClient: vi.fn(() => mockPrismaClient),
      connect: vi.fn(),
      disconnect: vi.fn(),
      isConnected: vi.fn(() => true),
    } as IDatabaseService;

    // Create repository instance with the mock database service
    targetRepository = new TargetRepository(mockDatabaseService);
  });

  describe("Basic CRUD Operations", () => {
    describe("findById", () => {
      it("should find target by id", async () => {
        const prismaTarget = {
          id: "target-123",
          name: "Test Target",
          address: "https://test.com",
          ownerId: "user-123",
        };

        // Set up the mock on the Prisma client
        mockPrismaClient.monitoringTarget.findUnique.mockResolvedValue(
          prismaTarget
        );

        const result = await targetRepository.findById("target-123");

        expect(result).toEqual({
          id: prismaTarget.id,
          name: prismaTarget.name,
          address: prismaTarget.address,
          ownerId: prismaTarget.ownerId,
        });
        expect(
          mockPrismaClient.monitoringTarget.findUnique
        ).toHaveBeenCalledWith({
          where: { id: "target-123" },
        });
      });

      it("should return null when target not found", async () => {
        mockPrismaClient.monitoringTarget.findUnique.mockResolvedValue(null);

        const result = await targetRepository.findById("nonexistent");

        expect(result).toBeNull();
        expect(
          mockPrismaClient.monitoringTarget.findUnique
        ).toHaveBeenCalledWith({
          where: { id: "nonexistent" },
        });
      });
    });

    describe("findByUserId", () => {
      it("should find targets by user id", async () => {
        const userId = "user-123";
        const prismaTargets = [
          {
            id: "target-1",
            name: "Target 1",
            address: "https://test1.com",
            ownerId: userId,
          },
          {
            id: "target-2",
            name: "Target 2",
            address: "https://test2.com",
            ownerId: userId,
          },
        ];
        mockPrismaClient.monitoringTarget.findMany.mockResolvedValue(
          prismaTargets
        );

        const result = await targetRepository.findByUserId(userId);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
          id: prismaTargets[0].id,
          name: prismaTargets[0].name,
          address: prismaTargets[0].address,
          ownerId: prismaTargets[0].ownerId,
        });
        expect(result[1]).toEqual({
          id: prismaTargets[1].id,
          name: prismaTargets[1].name,
          address: prismaTargets[1].address,
          ownerId: prismaTargets[1].ownerId,
        });
        expect(mockPrismaClient.monitoringTarget.findMany).toHaveBeenCalledWith(
          {
            where: { ownerId: userId },
          }
        );
      });

      it("should return empty array when no targets found", async () => {
        mockPrismaClient.monitoringTarget.findMany.mockResolvedValue([]);

        const result = await targetRepository.findByUserId("user-123");

        expect(result).toEqual([]);
        expect(mockPrismaClient.monitoringTarget.findMany).toHaveBeenCalledWith(
          {
            where: { ownerId: "user-123" },
          }
        );
      });
    });

    describe("getAll", () => {
      it("should get all targets with limit and offset", async () => {
        const prismaTargets = [
          {
            id: "target-1",
            name: "Target 1",
            address: "https://test1.com",
            ownerId: "user-1",
          },
          {
            id: "target-2",
            name: "Target 2",
            address: "https://test2.com",
            ownerId: "user-2",
          },
        ];
        mockPrismaClient.monitoringTarget.findMany.mockResolvedValue(
          prismaTargets
        );

        const result = await targetRepository.getAll(10, 5);

        expect(result).toHaveLength(2);
        expect(mockPrismaClient.monitoringTarget.findMany).toHaveBeenCalledWith(
          {
            take: 10,
            skip: 5,
          }
        );
      });

      it("should get all targets without limit and offset", async () => {
        const prismaTargets = [
          {
            id: "target-1",
            name: "Target 1",
            address: "https://test1.com",
            ownerId: "user-1",
          },
        ];
        mockPrismaClient.monitoringTarget.findMany.mockResolvedValue(
          prismaTargets
        );

        const result = await targetRepository.getAll();

        expect(result).toHaveLength(1);
        expect(mockPrismaClient.monitoringTarget.findMany).toHaveBeenCalledWith(
          {
            take: undefined,
            skip: undefined,
          }
        );
      });
    });

    describe("count", () => {
      it("should return count of targets", async () => {
        mockPrismaClient.monitoringTarget.count.mockResolvedValue(5);

        const result = await targetRepository.count();

        expect(result).toBe(5);
        expect(mockPrismaClient.monitoringTarget.count).toHaveBeenCalledWith();
      });
    });

    describe("create", () => {
      it("should create a new target", async () => {
        const createData = {
          name: "New Target",
          address: "https://newtarget.com",
          ownerId: "user-123",
        };
        const createdTarget = {
          id: "target-123",
          ...createData,
        };
        mockPrismaClient.monitoringTarget.create.mockResolvedValue(
          createdTarget
        );

        const result = await targetRepository.create(createData);

        expect(result).toEqual({
          id: createdTarget.id,
          name: createdTarget.name,
          address: createdTarget.address,
          ownerId: createdTarget.ownerId,
        });
        expect(mockPrismaClient.monitoringTarget.create).toHaveBeenCalledWith({
          data: createData,
        });
      });
    });

    describe("update", () => {
      it("should update an existing target", async () => {
        const updateData = { name: "Updated Target" };
        const updatedTarget = {
          id: "target-123",
          name: "Updated Target",
          address: "https://test.com",
          ownerId: "user-123",
        };
        mockPrismaClient.monitoringTarget.update.mockResolvedValue(
          updatedTarget
        );

        const result = await targetRepository.update("target-123", updateData);

        expect(result).toEqual({
          id: updatedTarget.id,
          name: updatedTarget.name,
          address: updatedTarget.address,
          ownerId: updatedTarget.ownerId,
        });
        expect(mockPrismaClient.monitoringTarget.update).toHaveBeenCalledWith({
          where: { id: "target-123" },
          data: updateData,
        });
      });
    });

    describe("delete", () => {
      it("should delete a target", async () => {
        mockPrismaClient.monitoringTarget.delete.mockResolvedValue({});

        await targetRepository.delete("target-123");

        expect(mockPrismaClient.monitoringTarget.delete).toHaveBeenCalledWith({
          where: { id: "target-123" },
        });
      });
    });
  });

  describe("Relations Methods", () => {
    describe("findByIdWithRelations", () => {
      it("should find target with relations", async () => {
        const prismaTarget = {
          id: "target-123",
          name: "Test Target",
          address: "https://test.com",
          ownerId: "user-123",
        };
        mockPrismaClient.monitoringTarget.findUnique.mockResolvedValue(
          prismaTarget
        );

        const result =
          await targetRepository.findByIdWithRelations("target-123");

        expect(result).toEqual({
          id: prismaTarget.id,
          name: prismaTarget.name,
          address: prismaTarget.address,
          ownerId: prismaTarget.ownerId,
          speedTestResults: [],
          alertRules: [],
        });
        expect(
          mockPrismaClient.monitoringTarget.findUnique
        ).toHaveBeenCalledWith({
          where: { id: "target-123" },
        });
      });

      it("should return null when target not found", async () => {
        mockPrismaClient.monitoringTarget.findUnique.mockResolvedValue(null);

        const result =
          await targetRepository.findByIdWithRelations("nonexistent");

        expect(result).toBeNull();
        expect(
          mockPrismaClient.monitoringTarget.findUnique
        ).toHaveBeenCalledWith({
          where: { id: "nonexistent" },
        });
      });
    });

    describe("findByUserIdWithRelations", () => {
      it("should find targets by user id with relations", async () => {
        const userId = "user-123";
        const prismaTargets = [
          {
            id: "target-1",
            name: "Target 1",
            address: "https://test1.com",
            ownerId: userId,
          },
          {
            id: "target-2",
            name: "Target 2",
            address: "https://test2.com",
            ownerId: userId,
          },
        ];
        mockPrismaClient.monitoringTarget.findMany.mockResolvedValue(
          prismaTargets
        );

        const result = await targetRepository.findByUserIdWithRelations(userId);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
          id: prismaTargets[0].id,
          name: prismaTargets[0].name,
          address: prismaTargets[0].address,
          ownerId: prismaTargets[0].ownerId,
          speedTestResults: [],
          alertRules: [],
        });
        expect(result[1]).toEqual({
          id: prismaTargets[1].id,
          name: prismaTargets[1].name,
          address: prismaTargets[1].address,
          ownerId: prismaTargets[1].ownerId,
          speedTestResults: [],
          alertRules: [],
        });
        expect(mockPrismaClient.monitoringTarget.findMany).toHaveBeenCalledWith(
          {
            where: { ownerId: userId },
          }
        );
      });
    });

    describe("getAllWithRelations", () => {
      it("should get all targets with relations", async () => {
        const prismaTargets = [
          {
            id: "target-1",
            name: "Target 1",
            address: "https://test1.com",
            ownerId: "user-1",
          },
        ];
        mockPrismaClient.monitoringTarget.findMany.mockResolvedValue(
          prismaTargets
        );

        const result = await targetRepository.getAllWithRelations(10, 5);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          id: prismaTargets[0].id,
          name: prismaTargets[0].name,
          address: prismaTargets[0].address,
          ownerId: prismaTargets[0].ownerId,
          speedTestResults: [],
          alertRules: [],
        });
        expect(mockPrismaClient.monitoringTarget.findMany).toHaveBeenCalledWith(
          {
            take: 10,
            skip: 5,
          }
        );
      });
    });
  });

  describe("Data Mapping", () => {
    it("should map Prisma model to TargetData correctly", () => {
      const prismaTarget = {
        id: "target-123",
        name: "Test Target",
        address: "https://test.com",
        ownerId: "user-123",
      };

      // Justification: Testing private method requires type assertion for access
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (targetRepository as any).toTargetData(prismaTarget);

      expect(result).toEqual({
        id: prismaTarget.id,
        name: prismaTarget.name,
        address: prismaTarget.address,
        ownerId: prismaTarget.ownerId,
      });
    });

    it("should map Prisma model to Target with relations correctly", async () => {
      const prismaTarget = {
        id: "target-123",
        name: "Test Target",
        address: "https://test.com",
        ownerId: "user-123",
      };

      // Justification: Testing private method requires type assertion for access
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (targetRepository as any).toTargetWithRelations(
        prismaTarget
      );

      expect(result).toEqual({
        id: prismaTarget.id,
        name: prismaTarget.name,
        address: prismaTarget.address,
        ownerId: prismaTarget.ownerId,
        speedTestResults: [],
        alertRules: [],
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors in findById", async () => {
      const error = new Error("Database connection failed");
      mockPrismaClient.monitoringTarget.findUnique.mockRejectedValue(error);

      await expect(targetRepository.findById("target-123")).rejects.toThrow(
        "Database connection failed"
      );
    });

    it("should handle database errors in create", async () => {
      const createData = {
        name: "New Target",
        address: "https://newtarget.com",
        ownerId: "user-123",
      };
      const error = new Error("Database constraint violation");
      mockPrismaClient.monitoringTarget.create.mockRejectedValue(error);

      await expect(targetRepository.create(createData)).rejects.toThrow(
        "Database constraint violation"
      );
    });

    it("should handle database errors in update", async () => {
      const updateData = { name: "Updated Target" };
      const error = new Error("Record not found");
      mockPrismaClient.monitoringTarget.update.mockRejectedValue(error);

      await expect(
        targetRepository.update("target-123", updateData)
      ).rejects.toThrow("Record not found");
    });

    it("should handle database errors in delete", async () => {
      const error = new Error("Record not found");
      mockPrismaClient.monitoringTarget.delete.mockRejectedValue(error);

      await expect(targetRepository.delete("target-123")).rejects.toThrow(
        "Record not found"
      );
    });
  });
});
