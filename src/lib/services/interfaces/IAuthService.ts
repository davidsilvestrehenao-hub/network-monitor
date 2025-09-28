import { User } from "./IUserRepository";

export interface AuthSession {
  user: User;
  expires: Date;
}

export interface IAuthService {
  getSession(): Promise<AuthSession | null>;
  signIn(email: string, password: string): Promise<AuthSession | null>;
  signUp(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthSession | null>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): Promise<boolean>;
}
