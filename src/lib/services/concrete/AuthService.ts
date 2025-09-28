import { IAuthService, AuthSession } from "../interfaces/IAuthService";
import { IUserRepository } from "../interfaces/IUserRepository";
import { IEventBus, BackendEvents } from "../interfaces/IEventBus";
import { ILogger } from "../interfaces/ILogger";
import {
  User,
  CreateUserData,
  UpdateUserData,
} from "../interfaces/IUserRepository";

export interface LoginCredentials {
  email: string;
  password?: string; // Optional for OAuth flows
}

export interface RegisterData {
  email: string;
  name?: string;
  password?: string;
}

export interface AuthResult {
  user: User;
  sessionToken: string;
  expiresAt: Date;
}

export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private eventBus: IEventBus;
  private logger: ILogger;
  private sessions: Map<string, { userId: string; expiresAt: Date }> =
    new Map();

  constructor(
    userRepository: IUserRepository,
    eventBus: IEventBus,
    logger: ILogger
  ) {
    this.userRepository = userRepository;
    this.eventBus = eventBus;
    this.logger = logger;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventBus.on(
      "USER_LOGIN_REQUESTED",
      this.handleUserLoginRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.on(
      "USER_REGISTER_REQUESTED",
      this.handleUserRegisterRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.on(
      "USER_LOGOUT_REQUESTED",
      this.handleUserLogoutRequested.bind(this) as (data?: unknown) => void
    );
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    this.logger.debug("AuthService: User login attempt", {
      email: credentials.email,
    });

    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(credentials.email);

      if (!user) {
        throw new Error("User not found");
      }

      // In a real application, you would verify the password here
      // For now, we'll just create a session for any existing user
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store session
      this.sessions.set(sessionToken, {
        userId: user.id,
        expiresAt,
      });

      this.eventBus.emitTyped("USER_LOGGED_IN", {
        userId: user.id,
        email: user.email,
        sessionToken,
      });

      this.logger.info("AuthService: User logged in successfully", {
        userId: user.id,
        email: user.email,
      });

      return {
        user,
        sessionToken,
        expiresAt,
      };
    } catch (error) {
      this.logger.error("AuthService: Login failed", {
        error,
        email: credentials.email,
      });
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResult> {
    this.logger.debug("AuthService: User registration attempt", {
      email: data.email,
    });

    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new Error("User already exists");
      }

      // Create new user
      const userData: CreateUserData = {
        email: data.email,
        name: data.name,
        emailVerified: new Date(), // Auto-verify for now
      };

      const user = await this.userRepository.create(userData);

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      this.sessions.set(sessionToken, {
        userId: user.id,
        expiresAt,
      });

      this.eventBus.emitTyped("USER_REGISTERED", {
        userId: user.id,
        email: user.email,
        sessionToken,
      });

      this.logger.info("AuthService: User registered successfully", {
        userId: user.id,
        email: user.email,
      });

      return {
        user,
        sessionToken,
        expiresAt,
      };
    } catch (error) {
      this.logger.error("AuthService: Registration failed", {
        error,
        email: data.email,
      });
      throw error;
    }
  }

  async logout(sessionToken: string): Promise<void> {
    this.logger.debug("AuthService: User logout", { sessionToken });

    try {
      const session = this.sessions.get(sessionToken);
      if (session) {
        this.sessions.delete(sessionToken);
        this.eventBus.emitTyped("USER_LOGGED_OUT", {
          userId: session.userId,
          sessionToken,
        });
        this.logger.info("AuthService: User logged out successfully", {
          userId: session.userId,
        });
      }
    } catch (error) {
      this.logger.error("AuthService: Logout failed", {
        error,
        sessionToken,
      });
      throw error;
    }
  }

  async validateSession(sessionToken: string): Promise<User | null> {
    this.logger.debug("AuthService: Validating session", { sessionToken });

    try {
      const session = this.sessions.get(sessionToken);

      if (!session) {
        this.logger.debug("AuthService: Session not found", { sessionToken });
        return null;
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        this.logger.debug("AuthService: Session expired", {
          sessionToken,
          expiresAt: session.expiresAt,
        });
        this.sessions.delete(sessionToken);
        return null;
      }

      // Get user
      const user = await this.userRepository.findById(session.userId);
      if (!user) {
        this.logger.warn("AuthService: User not found for session", {
          sessionToken,
          userId: session.userId,
        });
        this.sessions.delete(sessionToken);
        return null;
      }

      this.logger.debug("AuthService: Session validated successfully", {
        sessionToken,
        userId: user.id,
      });

      return user;
    } catch (error) {
      this.logger.error("AuthService: Session validation failed", {
        error,
        sessionToken,
      });
      return null;
    }
  }

  async refreshSession(sessionToken: string): Promise<AuthResult | null> {
    this.logger.debug("AuthService: Refreshing session", { sessionToken });

    try {
      const user = await this.validateSession(sessionToken);
      if (!user) {
        return null;
      }

      // Create new session
      const newSessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Remove old session and add new one
      this.sessions.delete(sessionToken);
      this.sessions.set(newSessionToken, {
        userId: user.id,
        expiresAt,
      });

      this.eventBus.emitTyped("SESSION_REFRESHED", {
        userId: user.id,
        oldSessionToken: sessionToken,
        newSessionToken,
      });

      this.logger.info("AuthService: Session refreshed successfully", {
        userId: user.id,
        newSessionToken,
      });

      return {
        user,
        sessionToken: newSessionToken,
        expiresAt,
      };
    } catch (error) {
      this.logger.error("AuthService: Session refresh failed", {
        error,
        sessionToken,
      });
      return null;
    }
  }

  async updateProfile(userId: string, data: UpdateUserData): Promise<User> {
    this.logger.debug("AuthService: Updating user profile", { userId, data });

    try {
      const user = await this.userRepository.update(userId, data);
      this.eventBus.emitTyped("USER_PROFILE_UPDATED", {
        userId: user.id,
        data,
      });
      return user;
    } catch (error) {
      this.logger.error("AuthService: Profile update failed", {
        error,
        userId,
        data,
      });
      throw error;
    }
  }

  async deleteAccount(userId: string): Promise<void> {
    this.logger.debug("AuthService: Deleting user account", { userId });

    try {
      // Delete all sessions for this user
      for (const [sessionToken, session] of this.sessions.entries()) {
        if (session.userId === userId) {
          this.sessions.delete(sessionToken);
        }
      }

      // Delete user
      await this.userRepository.delete(userId);

      this.eventBus.emitTyped("USER_ACCOUNT_DELETED", { userId });

      this.logger.info("AuthService: User account deleted successfully", {
        userId,
      });
    } catch (error) {
      this.logger.error("AuthService: Account deletion failed", {
        error,
        userId,
      });
      throw error;
    }
  }

  async getActiveSessions(): Promise<
    Array<{ sessionToken: string; userId: string; expiresAt: Date }>
  > {
    this.logger.debug("AuthService: Getting active sessions");

    const activeSessions: Array<{
      sessionToken: string;
      userId: string;
      expiresAt: Date;
    }> = [];
    const now = new Date();

    for (const [sessionToken, session] of this.sessions.entries()) {
      if (session.expiresAt > now) {
        activeSessions.push({
          sessionToken,
          userId: session.userId,
          expiresAt: session.expiresAt,
        });
      }
    }

    return activeSessions;
  }

  private generateSessionToken(): string {
    // Generate a random session token
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async handleUserLoginRequested(
    data: BackendEvents["USER_LOGIN_REQUESTED"]
  ): Promise<void> {
    await this.login(data.credentials as LoginCredentials);
  }

  private async handleUserRegisterRequested(
    data: BackendEvents["USER_REGISTER_REQUESTED"]
  ): Promise<void> {
    await this.register(data.data as RegisterData);
  }

  private async handleUserLogoutRequested(
    data: BackendEvents["USER_LOGOUT_REQUESTED"]
  ): Promise<void> {
    await this.logout(data.sessionToken);
  }

  // Interface compliance methods
  async getSession(): Promise<AuthSession | null> {
    this.logger.debug("AuthService: Getting current session");
    // This would need to be implemented based on the actual session management
    // For now, return null as this is a mock implementation
    return null;
  }

  async signIn(email: string, password: string): Promise<AuthSession | null> {
    this.logger.debug("AuthService: Signing in user", { email });
    const result = await this.login({ email, password });
    if (result) {
      return {
        user: result.user,
        expires: result.expiresAt,
      };
    }
    return null;
  }

  async signUp(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthSession | null> {
    this.logger.debug("AuthService: Signing up user", { email, name });
    const result = await this.register({ email, password, name });
    if (result) {
      return {
        user: result.user,
        expires: result.expiresAt,
      };
    }
    return null;
  }

  async signOut(): Promise<void> {
    this.logger.debug("AuthService: Signing out user");
    // This would need to be implemented based on the actual session management
    // For now, do nothing as this is a mock implementation
  }

  async getCurrentUser(): Promise<User | null> {
    this.logger.debug("AuthService: Getting current user");
    // This would need to be implemented based on the actual session management
    // For now, return null as this is a mock implementation
    return null;
  }

  async isAuthenticated(): Promise<boolean> {
    this.logger.debug("AuthService: Checking authentication status");
    // This would need to be implemented based on the actual session management
    // For now, return false as this is a mock implementation
    return false;
  }
}
