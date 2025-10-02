// Advanced repository base implementation with generic query builder
// Provides concrete implementation of type-safe querying for all repositories

import type {
  QueryOptions,
  QueryResult,
  WhereClause,
  OrderByClause,
  PaginationOptions,
  SortOptions,
} from "@network-monitor/shared";
import type { IPrisma, ILogger } from "@network-monitor/shared";

export abstract class AdvancedRepositoryBase<T, CreateDto, UpdateDto> {
  protected databaseService: IPrisma;
  protected logger: ILogger;
  protected tableName: string;

  constructor(databaseService: IPrisma, logger: ILogger, tableName: string) {
    this.databaseService = databaseService;
    this.logger = logger;
    this.tableName = tableName;
  }

  // Abstract methods that must be implemented by concrete repositories
  abstract findById(id: string | number): Promise<T | null>;
  abstract create(data: CreateDto): Promise<T>;
  abstract update(id: string | number, data: UpdateDto): Promise<T>;
  abstract delete(id: string | number): Promise<void>;
  abstract mapToDomain(prismaEntity: unknown): T;
  abstract mapToCreateData(data: CreateDto): unknown;
  abstract mapToUpdateData(data: UpdateDto): unknown;

  // Basic CRUD operations
  async getAll(limit?: number, offset?: number): Promise<T[]> {
    return this.findMany({
      limit,
      offset,
    }).then(result => result.data);
  }

  async count(): Promise<number> {
    return this.countWhere();
  }

  // Advanced querying implementation
  async findMany(options: QueryOptions<T> = {}): Promise<QueryResult<T>> {
    this.logger.debug(`${this.constructor.name}: Finding many with options`, {
      tableName: this.tableName,
      options,
    });

    try {
      const prismaOptions = this.buildPrismaQuery(options);

      // Get total count for pagination
      const totalPromise =
        options.limit || options.offset
          ? this.countWhere(options.where)
          : Promise.resolve(0);

      // Get data
      const client = this.databaseService.getClient();
      const [prismaEntities, total] = await Promise.all([
        // Justification: Dynamic table access requires any type for Prisma client
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (client as any)[this.tableName].findMany(prismaOptions),
        totalPromise,
      ]);

      const data = prismaEntities.map((entity: unknown) =>
        this.mapToDomain(entity)
      );

      const hasMore = options.limit
        ? (options.offset || 0) + data.length < total
        : false;

      return {
        data,
        total: options.limit || options.offset ? total : data.length,
        hasMore,
        page:
          options.limit && options.offset
            ? Math.floor(options.offset / options.limit) + 1
            : undefined,
        pageSize: options.limit,
      };
    } catch (error) {
      this.logger.error(`${this.constructor.name}: Error finding many`, {
        tableName: this.tableName,
        error: error instanceof Error ? error.message : String(error),
        options,
      });
      throw error;
    }
  }

  async findFirst(where: WhereClause<T>): Promise<T | null> {
    this.logger.debug(
      `${this.constructor.name}: Finding first with where clause`,
      {
        tableName: this.tableName,
        where,
      }
    );

    try {
      const prismaWhere = this.buildPrismaWhere(where);
      const client = this.databaseService.getClient();

      // Justification: Dynamic table access requires any type for Prisma client
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prismaEntity = await (client as any)[this.tableName].findFirst({
        where: prismaWhere,
      });

      return prismaEntity ? this.mapToDomain(prismaEntity) : null;
    } catch (error) {
      this.logger.error(`${this.constructor.name}: Error finding first`, {
        tableName: this.tableName,
        error: error instanceof Error ? error.message : String(error),
        where,
      });
      throw error;
    }
  }

  async findUnique<K extends keyof T>(
    field: K,
    value: T[K]
  ): Promise<T | null> {
    return this.findFirst({ [field]: value } as unknown as WhereClause<T>);
  }

  async findWhere(where: WhereClause<T>): Promise<T[]> {
    const result = await this.findMany({ where });
    return result.data;
  }

  async exists(where: WhereClause<T>): Promise<boolean> {
    const count = await this.countWhere(where);
    return count > 0;
  }

  async countWhere(where?: WhereClause<T>): Promise<number> {
    this.logger.debug(`${this.constructor.name}: Counting with where clause`, {
      tableName: this.tableName,
      where,
    });

    try {
      const prismaWhere = where ? this.buildPrismaWhere(where) : undefined;
      const client = this.databaseService.getClient();

      // Justification: Dynamic table access requires any type for Prisma client
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (client as any)[this.tableName].count({
        where: prismaWhere,
      });
    } catch (error) {
      this.logger.error(`${this.constructor.name}: Error counting`, {
        tableName: this.tableName,
        error: error instanceof Error ? error.message : String(error),
        where,
      });
      throw error;
    }
  }

  // Batch operations
  async createMany(data: CreateDto[]): Promise<T[]> {
    this.logger.debug(`${this.constructor.name}: Creating many`, {
      tableName: this.tableName,
      count: data.length,
    });

    try {
      const prismaData = data.map(item => this.mapToCreateData(item));
      const client = this.databaseService.getClient();

      // Justification: Dynamic table access requires any type for Prisma client
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (client as any)[this.tableName].createMany({
        data: prismaData,
        skipDuplicates: false,
      });

      // Note: createMany doesn't return the created entities in Prisma
      // So we need to fetch them separately if we need the full entities
      this.logger.info(
        `${this.constructor.name}: Created ${result.count} entities`,
        {
          tableName: this.tableName,
        }
      );

      // Return empty array as Prisma createMany doesn't return entities
      // Concrete implementations can override this if they need the entities
      return [];
    } catch (error) {
      this.logger.error(`${this.constructor.name}: Error creating many`, {
        tableName: this.tableName,
        error: error instanceof Error ? error.message : String(error),
        count: data.length,
      });
      throw error;
    }
  }

  async updateMany(
    where: WhereClause<T>,
    data: Partial<UpdateDto>
  ): Promise<number> {
    this.logger.debug(`${this.constructor.name}: Updating many`, {
      tableName: this.tableName,
      where,
      data,
    });

    try {
      const prismaWhere = this.buildPrismaWhere(where);
      const prismaData = this.mapToUpdateData(data as UpdateDto);
      const client = this.databaseService.getClient();

      // Justification: Dynamic table access requires any type for Prisma client
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (client as any)[this.tableName].updateMany({
        where: prismaWhere,
        data: prismaData,
      });

      this.logger.info(
        `${this.constructor.name}: Updated ${result.count} entities`,
        {
          tableName: this.tableName,
        }
      );

      return result.count;
    } catch (error) {
      this.logger.error(`${this.constructor.name}: Error updating many`, {
        tableName: this.tableName,
        error: error instanceof Error ? error.message : String(error),
        where,
      });
      throw error;
    }
  }

  async deleteMany(where: WhereClause<T>): Promise<number> {
    this.logger.debug(`${this.constructor.name}: Deleting many`, {
      tableName: this.tableName,
      where,
    });

    try {
      const prismaWhere = this.buildPrismaWhere(where);
      const client = this.databaseService.getClient();

      // Justification: Dynamic table access requires any type for Prisma client
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (client as any)[this.tableName].deleteMany({
        where: prismaWhere,
      });

      this.logger.info(
        `${this.constructor.name}: Deleted ${result.count} entities`,
        {
          tableName: this.tableName,
        }
      );

      return result.count;
    } catch (error) {
      this.logger.error(`${this.constructor.name}: Error deleting many`, {
        tableName: this.tableName,
        error: error instanceof Error ? error.message : String(error),
        where,
      });
      throw error;
    }
  }

  // Aggregation
  async aggregate<K extends keyof T>(
    field: K,
    operation: "count" | "sum" | "avg" | "min" | "max",
    where?: WhereClause<T>
  ): Promise<number> {
    this.logger.debug(`${this.constructor.name}: Aggregating`, {
      tableName: this.tableName,
      field: String(field),
      operation,
      where,
    });

    try {
      const prismaWhere = where ? this.buildPrismaWhere(where) : undefined;
      const client = this.databaseService.getClient();

      const aggregateOptions = {
        where: prismaWhere,
        _count: operation === "count" ? { [field]: true } : undefined,
        _sum: operation === "sum" ? { [field]: true } : undefined,
        _avg: operation === "avg" ? { [field]: true } : undefined,
        _min: operation === "min" ? { [field]: true } : undefined,
        _max: operation === "max" ? { [field]: true } : undefined,
      };

      // Remove undefined properties
      Object.keys(aggregateOptions).forEach(key => {
        if (
          aggregateOptions[key as keyof typeof aggregateOptions] === undefined
        ) {
          delete aggregateOptions[key as keyof typeof aggregateOptions];
        }
      });

      // Justification: Dynamic table access requires any type for Prisma client
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (client as any)[this.tableName].aggregate(
        aggregateOptions
      );

      const value = result[`_${operation}`]?.[field] || 0;
      return typeof value === "number" ? value : 0;
    } catch (error) {
      this.logger.error(`${this.constructor.name}: Error aggregating`, {
        tableName: this.tableName,
        error: error instanceof Error ? error.message : String(error),
        field: String(field),
        operation,
      });
      throw error;
    }
  }

  // Pagination helpers
  async paginate(
    options: PaginationOptions,
    where?: WhereClause<T>
  ): Promise<QueryResult<T>> {
    const { page, pageSize } = options;
    const offset = (page - 1) * pageSize;

    return this.findMany({
      where,
      limit: pageSize,
      offset,
    });
  }

  // Sorting helpers
  async findSorted(
    sort: SortOptions<T>[],
    where?: WhereClause<T>
  ): Promise<T[]> {
    const orderBy = sort.reduce((acc, { field, direction }) => {
      acc[field] = direction;
      return acc;
    }, {} as OrderByClause<T>);

    const result = await this.findMany({
      where,
      orderBy,
    });

    return result.data;
  }

  // Query builder helper methods
  protected buildPrismaQuery(options: QueryOptions<T>): unknown {
    const prismaQuery: Record<string, unknown> = {};

    if (options.where) {
      prismaQuery.where = this.buildPrismaWhere(options.where);
    }

    if (options.orderBy) {
      prismaQuery.orderBy = this.buildPrismaOrderBy(options.orderBy);
    }

    if (options.limit) {
      prismaQuery.take = options.limit;
    }

    if (options.offset) {
      prismaQuery.skip = options.offset;
    }

    if (options.include) {
      prismaQuery.include = this.buildPrismaInclude(options.include);
    }

    if (options.select) {
      prismaQuery.select = this.buildPrismaSelect(options.select);
    }

    return prismaQuery;
  }

  protected buildPrismaWhere(where: WhereClause<T>): unknown {
    const prismaWhere: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(where)) {
      if (value === null || value === undefined) {
        continue;
      }

      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        // Handle operators
        prismaWhere[key] = this.buildPrismaOperators(
          value as Record<string, unknown>
        );
      } else {
        // Direct value
        prismaWhere[key] = value;
      }
    }

    return prismaWhere;
  }

  protected buildPrismaOperators(operators: Record<string, unknown>): unknown {
    const prismaOperators: Record<string, unknown> = {};

    for (const [op, value] of Object.entries(operators)) {
      switch (op) {
        case "equals":
          return value;
        case "not":
          prismaOperators.not = value;
          break;
        case "in":
          prismaOperators.in = value;
          break;
        case "notIn":
          prismaOperators.notIn = value;
          break;
        case "lt":
          prismaOperators.lt = value;
          break;
        case "lte":
          prismaOperators.lte = value;
          break;
        case "gt":
          prismaOperators.gt = value;
          break;
        case "gte":
          prismaOperators.gte = value;
          break;
        case "contains":
          prismaOperators.contains = value;
          break;
        case "startsWith":
          prismaOperators.startsWith = value;
          break;
        case "endsWith":
          prismaOperators.endsWith = value;
          break;
        case "isNull":
          if (value === true) {
            return null;
          }
          break;
        case "isNotNull":
          if (value === true) {
            prismaOperators.not = null;
          }
          break;
      }
    }

    return Object.keys(prismaOperators).length > 0
      ? prismaOperators
      : undefined;
  }

  protected buildPrismaOrderBy(orderBy: OrderByClause<T>): unknown {
    return Object.entries(orderBy).map(([field, direction]) => ({
      [field]: direction,
    }));
  }

  protected buildPrismaInclude(include: Record<string, unknown>): unknown {
    const prismaInclude: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(include)) {
      if (typeof value === "boolean") {
        prismaInclude[key] = value;
      } else if (typeof value === "object") {
        prismaInclude[key] = this.buildPrismaInclude(
          value as Record<string, unknown>
        );
      }
    }

    return prismaInclude;
  }

  protected buildPrismaSelect(select: Record<string, unknown>): unknown {
    const prismaSelect: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(select)) {
      prismaSelect[key] = value;
    }

    return prismaSelect;
  }
}
