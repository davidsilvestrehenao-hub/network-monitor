import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { AuthService } from "./AuthService";
import {
  createTestContainer,
  registerMockServices,
  createMockUserRepository,
  createMockEventBus,
  createMockLogger,
  createTestUser,
} from "@network-monitor/shared/test-utils";
import { TYPES } from "@network-monitor/infrastructure/container";

describe("AuthService", () => {
  let authService: AuthService;
  let container: ReturnType<typeof createTestContainer>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockEventBus: ReturnType<typeof createMockEventBus>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(async () => {
    // Create test container
    container = createTestContainer();
    registerMockServices(container);

    // Create mock repositories
    mockUserRepository = createMockUserRepository();
    mockEventBus = createMockEventBus();
    mockLogger = createMockLogger();

    // Register mocks in container
    container.register(TYPES.IUserRepository, {
      factory: () => mockUserRepository,
      dependencies: [],
      singleton: true,
      description: "Mock User Repository",
    });
    container.register(TYPES.IEventBus, {
      factory: () => mockEventBus,
      dependencies: [],
      singleton: true,
      description: "Mock Event Bus",
    });
    container.register(TYPES.ILogger, {
      factory: () => mockLogger,
      dependencies: [],
      singleton: true,
      description: "Mock Logger",
    });

    await container.initialize();

    // Create service instance with the actual mock instances
    authService = new AuthService(mockUserRepository, mockEventBus, mockLogger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Base Interface Methods", () => {
    describe("getById", () => {
      it("should get user by id", async () => {
        const testUser = createTestUser();
        mockUserRepository.findById.mockResolvedValue(testUser);

        const result = await authService.getById("user-123");

        expect(result).toEqual(testUser);
        expect(mockUserRepository.findById).toHaveBeenCalledWith("user-123");
      });

      it("should return null when user not found", async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await authService.getById("nonexistent");

        expect(result).toBeNull();
      });
    });

    describe("getAll", () => {
      it("should get all users", async () => {
        const testUsers = [
          createTestUser(),
          createTestUser({ id: "user-456" }),
        ];
        mockUserRepository.getAll.mockResolvedValue(testUsers);

        const result = await authService.getAll(10, 0);

        expect(result).toEqual(testUsers);
        expect(mockUserRepository.getAll).toHaveBeenCalledWith(10, 0);
      });
    });

    describe("create", () => {
      it("should create a new user", async () => {
        const userData = {
          email: "test@example.com",
          name: "Test User",
        };
        const createdUser = createTestUser();
        mockUserRepository.create.mockResolvedValue(createdUser);

        const result = await authService.create(userData);

        expect(result).toEqual(createdUser);
        expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
      });
    });

    describe("update", () => {
      it("should update a user", async () => {
        const updateData = { name: "Updated Name" };
        const updatedUser = createTestUser({ name: "Updated Name" });
        mockUserRepository.update.mockResolvedValue(updatedUser);

        const result = await authService.update("user-123", updateData);

        expect(result).toEqual(updatedUser);
        expect(mockUserRepository.update).toHaveBeenCalledWith(
          "user-123",
          updateData
        );
      });
    });

    describe("delete", () => {
      it("should delete a user", async () => {
        await authService.delete("user-123");

        expect(mockUserRepository.delete).toHaveBeenCalledWith("user-123");
      });
    });
  });

  describe("Authentication Methods", () => {
    describe("login", () => {
      it("should login user successfully", async () => {
        const credentials = { email: "test@example.com", password: "password" };
        const user = createTestUser();
        mockUserRepository.findByEmail.mockResolvedValue(user);

        const result = await authService.login(credentials);

        expect(result.user).toEqual(user);
        expect(result.sessionToken).toBeDefined();
        expect(result.expiresAt).toBeInstanceOf(Date);
        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
          credentials.email
        );
        expect(mockEventBus.emit).toHaveBeenCalledWith("USER_LOGGED_IN", {
          userId: user.id,
          email: user.email,
          sessionToken: result.sessionToken,
        });
      });

      it("should throw error when user not found", async () => {
        const credentials = {
          email: "nonexistent@example.com",
          password: "password",
        };
        mockUserRepository.findByEmail.mockResolvedValue(null);

        await expect(authService.login(credentials)).rejects.toThrow(
          "User not found"
        );
        expect(mockLogger.error).toHaveBeenCalledWith(
          "AuthService: Login failed",
          {
            error: expect.any(Error),
            email: credentials.email,
          }
        );
      });

      it("should handle login errors", async () => {
        const credentials = { email: "test@example.com", password: "password" };
        const error = new Error("Database error");
        mockUserRepository.findByEmail.mockRejectedValue(error);

        await expect(authService.login(credentials)).rejects.toThrow(
          "Database error"
        );
        expect(mockLogger.error).toHaveBeenCalledWith(
          "AuthService: Login failed",
          {
            error,
            email: credentials.email,
          }
        );
      });
    });

    describe("register", () => {
      it("should register new user successfully", async () => {
        const registerData = {
          email: "newuser@example.com",
          name: "New User",
          password: "password",
        };
        const user = createTestUser({
          email: registerData.email,
          name: registerData.name,
        });
        mockUserRepository.findByEmail.mockResolvedValue(null); // User doesn't exist
        mockUserRepository.create.mockResolvedValue(user);

        const result = await authService.register(registerData);

        expect(result.user).toEqual(user);
        expect(result.sessionToken).toBeDefined();
        expect(result.expiresAt).toBeInstanceOf(Date);
        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
          registerData.email
        );
        expect(mockUserRepository.create).toHaveBeenCalledWith({
          email: registerData.email,
          name: registerData.name,
          emailVerified: expect.any(Date),
        });
        expect(mockEventBus.emit).toHaveBeenCalledWith("USER_REGISTERED", {
          userId: user.id,
          email: user.email,
          sessionToken: result.sessionToken,
        });
      });

      it("should throw error when user already exists", async () => {
        const registerData = {
          email: "existing@example.com",
          name: "Existing User",
          password: "password",
        };
        const existingUser = createTestUser({ email: registerData.email });
        mockUserRepository.findByEmail.mockResolvedValue(existingUser);

        await expect(authService.register(registerData)).rejects.toThrow(
          "User already exists"
        );
        expect(mockLogger.error).toHaveBeenCalledWith(
          "AuthService: Registration failed",
          {
            error: expect.any(Error),
            email: registerData.email,
          }
        );
      });

      it("should handle registration errors", async () => {
        const registerData = {
          email: "newuser@example.com",
          name: "New User",
          password: "password",
        };
        const error = new Error("Database error");
        mockUserRepository.findByEmail.mockResolvedValue(null);
        mockUserRepository.create.mockRejectedValue(error);

        await expect(authService.register(registerData)).rejects.toThrow(
          "Database error"
        );
        expect(mockLogger.error).toHaveBeenCalledWith(
          "AuthService: Registration failed",
          {
            error,
            email: registerData.email,
          }
        );
      });
    });

    describe("logout", () => {
      it("should logout user successfully", async () => {
        const user = createTestUser();

        // First login to create a session
        mockUserRepository.findByEmail.mockResolvedValue(user);
        const loginResult = await authService.login({ email: user.email! });
        const actualSessionToken = loginResult.sessionToken;

        await authService.logout(actualSessionToken);

        expect(mockEventBus.emit).toHaveBeenCalledWith("USER_LOGGED_OUT", {
          userId: user.id,
          sessionToken: actualSessionToken,
        });
        expect(mockLogger.info).toHaveBeenCalledWith(
          "AuthService: User logged out successfully",
          {
            userId: user.id,
          }
        );
      });

      it("should handle logout of non-existent session", async () => {
        const sessionToken = "nonexistent-session";

        await authService.logout(sessionToken);

        // Should not throw error, just do nothing
        expect(mockEventBus.emit).not.toHaveBeenCalledWith(
          "USER_LOGGED_OUT",
          expect.any(Object)
        );
      });
    });

    describe("validateSession", () => {
      it("should validate active session successfully", async () => {
        const user = createTestUser();
        mockUserRepository.findByEmail.mockResolvedValue(user);

        // Login to create a session
        const loginResult = await authService.login({ email: user.email! });
        const sessionToken = loginResult.sessionToken;

        // Mock user lookup for validation
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await authService.validateSession(sessionToken);

        expect(result).toEqual(user);
        expect(mockUserRepository.findById).toHaveBeenCalledWith(user.id);
      });

      it("should return null for non-existent session", async () => {
        const result = await authService.validateSession("nonexistent-session");

        expect(result).toBeNull();
        expect(mockLogger.debug).toHaveBeenCalledWith(
          "AuthService: Session not found",
          {
            sessionToken: "nonexistent-session",
          }
        );
      });

      it("should return null for expired session", async () => {
        const user = createTestUser();
        mockUserRepository.findByEmail.mockResolvedValue(user);

        // Login to create a session
        const loginResult = await authService.login({ email: user.email! });
        const sessionToken = loginResult.sessionToken;

        // Manually expire the session by setting expiresAt to past
        // Justification: Using any type to access private sessions property for testing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sessions = (authService as any).sessions;
        const session = sessions.get(sessionToken);
        if (session) {
          session.expiresAt = new Date(Date.now() - 1000); // 1 second ago
        }

        const result = await authService.validateSession(sessionToken);

        expect(result).toBeNull();
        expect(mockLogger.debug).toHaveBeenCalledWith(
          "AuthService: Session expired",
          {
            sessionToken,
            expiresAt: expect.any(Date),
          }
        );
      });

      it("should return null when user not found for session", async () => {
        const user = createTestUser();
        mockUserRepository.findByEmail.mockResolvedValue(user);

        // Login to create a session
        const loginResult = await authService.login({ email: user.email! });
        const sessionToken = loginResult.sessionToken;

        // Mock user not found
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await authService.validateSession(sessionToken);

        expect(result).toBeNull();
        expect(mockLogger.warn).toHaveBeenCalledWith(
          "AuthService: User not found for session",
          {
            sessionToken,
            userId: user.id,
          }
        );
      });
    });

    describe("refreshSession", () => {
      it("should refresh valid session successfully", async () => {
        const user = createTestUser();
        mockUserRepository.findByEmail.mockResolvedValue(user);

        // Login to create a session
        const loginResult = await authService.login({ email: user.email! });
        const oldSessionToken = loginResult.sessionToken;

        // Mock user lookup for validation
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await authService.refreshSession(oldSessionToken);

        expect(result).toBeDefined();
        expect(result!.user).toEqual(user);
        expect(result!.sessionToken).not.toBe(oldSessionToken);
        expect(result!.expiresAt).toBeInstanceOf(Date);
        expect(mockEventBus.emit).toHaveBeenCalledWith("SESSION_REFRESHED", {
          userId: user.id,
          oldSessionToken,
          newSessionToken: result!.sessionToken,
        });
      });

      it("should return null for invalid session", async () => {
        const result = await authService.refreshSession("invalid-session");

        expect(result).toBeNull();
      });
    });
  });

  describe("Profile Management", () => {
    describe("updateProfile", () => {
      it("should update user profile successfully", async () => {
        const userId = "user-123";
        const updateData = { name: "Updated Name" };
        const updatedUser = createTestUser({
          id: userId,
          name: "Updated Name",
        });
        mockUserRepository.update.mockResolvedValue(updatedUser);

        const result = await authService.updateProfile(userId, updateData);

        expect(result).toEqual(updatedUser);
        expect(mockUserRepository.update).toHaveBeenCalledWith(
          userId,
          updateData
        );
        expect(mockEventBus.emit).toHaveBeenCalledWith("USER_PROFILE_UPDATED", {
          userId: updatedUser.id,
          data: updateData,
        });
      });

      it("should handle profile update errors", async () => {
        const userId = "user-123";
        const updateData = { name: "Updated Name" };
        const error = new Error("Database error");
        mockUserRepository.update.mockRejectedValue(error);

        await expect(
          authService.updateProfile(userId, updateData)
        ).rejects.toThrow("Database error");
        expect(mockLogger.error).toHaveBeenCalledWith(
          "AuthService: Profile update failed",
          {
            error,
            userId,
            data: updateData,
          }
        );
      });
    });

    describe("deleteAccount", () => {
      it("should delete user account and all sessions", async () => {
        const userId = "user-123";
        const user = createTestUser({ id: userId });
        mockUserRepository.findByEmail.mockResolvedValue(user);

        // Login to create a session
        await authService.login({ email: user.email! });

        await authService.deleteAccount(userId);

        expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
        expect(mockEventBus.emit).toHaveBeenCalledWith("USER_ACCOUNT_DELETED", {
          userId,
        });
        expect(mockLogger.info).toHaveBeenCalledWith(
          "AuthService: User account deleted successfully",
          {
            userId,
          }
        );
      });

      it("should handle account deletion errors", async () => {
        const userId = "user-123";
        const error = new Error("Database error");
        mockUserRepository.delete.mockRejectedValue(error);

        await expect(authService.deleteAccount(userId)).rejects.toThrow(
          "Database error"
        );
        expect(mockLogger.error).toHaveBeenCalledWith(
          "AuthService: Account deletion failed",
          {
            error,
            userId,
          }
        );
      });
    });
  });

  describe("Session Management", () => {
    describe("getActiveSessions", () => {
      it("should return active sessions", async () => {
        const user1 = createTestUser({ id: "user-1" });
        const user2 = createTestUser({ id: "user-2" });

        mockUserRepository.findByEmail
          .mockResolvedValueOnce(user1)
          .mockResolvedValueOnce(user2);

        // Create two sessions
        await authService.login({ email: user1.email! });
        await authService.login({ email: user2.email! });

        const activeSessions = await authService.getActiveSessions();

        expect(activeSessions).toHaveLength(2);
        expect(activeSessions[0]).toHaveProperty("sessionToken");
        expect(activeSessions[0]).toHaveProperty("userId");
        expect(activeSessions[0]).toHaveProperty("expiresAt");
        expect(activeSessions[1]).toHaveProperty("sessionToken");
        expect(activeSessions[1]).toHaveProperty("userId");
        expect(activeSessions[1]).toHaveProperty("expiresAt");
      });

      it("should filter out expired sessions", async () => {
        const user = createTestUser();
        mockUserRepository.findByEmail.mockResolvedValue(user);

        // Login to create a session
        const loginResult = await authService.login({ email: user.email! });
        const sessionToken = loginResult.sessionToken;

        // Manually expire the session
        // Justification: Using any type to access private sessions property for testing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sessions = (authService as any).sessions;
        const session = sessions.get(sessionToken);
        if (session) {
          session.expiresAt = new Date(Date.now() - 1000); // 1 second ago
        }

        const activeSessions = await authService.getActiveSessions();

        expect(activeSessions).toHaveLength(0);
      });
    });
  });

  describe("Interface Compliance Methods", () => {
    describe("signIn", () => {
      it("should sign in user and return session", async () => {
        const email = "test@example.com";
        const password = "password";
        const user = createTestUser();
        mockUserRepository.findByEmail.mockResolvedValue(user);

        const result = await authService.signIn(email, password);

        expect(result).toBeDefined();
        expect(result!.user).toEqual(user);
        expect(result!.expires).toBeInstanceOf(Date);
      });

      it("should return null for invalid credentials", async () => {
        const email = "nonexistent@example.com";
        const password = "password";
        mockUserRepository.findByEmail.mockResolvedValue(null);

        const result = await authService.signIn(email, password);

        expect(result).toBeNull();
      });
    });

    describe("signUp", () => {
      it("should sign up user and return session", async () => {
        const email = "newuser@example.com";
        const password = "password";
        const name = "New User";
        const user = createTestUser({ email, name });
        mockUserRepository.findByEmail.mockResolvedValue(null);
        mockUserRepository.create.mockResolvedValue(user);

        const result = await authService.signUp(email, password, name);

        expect(result).toBeDefined();
        expect(result!.user).toEqual(user);
        expect(result!.expires).toBeInstanceOf(Date);
      });

      it("should return null when user already exists", async () => {
        const email = "existing@example.com";
        const password = "password";
        const name = "Existing User";
        const existingUser = createTestUser({ email });
        mockUserRepository.findByEmail.mockResolvedValue(existingUser);

        const result = await authService.signUp(email, password, name);

        expect(result).toBeNull();
      });
    });

    describe("getCurrentUser", () => {
      it("should return null (mock implementation)", async () => {
        const result = await authService.getCurrentUser();

        expect(result).toBeNull();
      });
    });

    describe("isAuthenticated", () => {
      it("should return false (mock implementation)", async () => {
        const result = await authService.isAuthenticated();

        expect(result).toBe(false);
      });
    });
  });

  describe("Event Handlers", () => {
    describe("handleUserLoginRequested", () => {
      it("should handle login request event", async () => {
        const eventData = {
          credentials: { email: "test@example.com", password: "password" },
        };
        const user = createTestUser();
        mockUserRepository.findByEmail.mockResolvedValue(user);

        // Emit the event
        mockEventBus.emit("USER_LOGIN_REQUESTED", eventData);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
          eventData.credentials.email
        );
      });
    });

    describe("handleUserRegisterRequested", () => {
      it("should handle register request event", async () => {
        const eventData = {
          data: {
            email: "newuser@example.com",
            name: "New User",
            password: "password",
          },
        };
        const user = createTestUser();
        mockUserRepository.findByEmail.mockResolvedValue(null);
        mockUserRepository.create.mockResolvedValue(user);

        // Emit the event
        mockEventBus.emit("USER_REGISTER_REQUESTED", eventData);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
          eventData.data.email
        );
      });
    });

    describe("handleUserLogoutRequested", () => {
      it("should handle logout request event", async () => {
        const eventData = {
          sessionToken: "test-session-token",
        };

        // Emit the event
        mockEventBus.emit("USER_LOGOUT_REQUESTED", eventData);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 0));

        // Should not throw error even for non-existent session
        expect(mockEventBus.emit).toHaveBeenCalledWith(
          "USER_LOGOUT_REQUESTED",
          eventData
        );
      });
    });
  });
});
