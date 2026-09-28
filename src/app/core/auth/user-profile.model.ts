export interface UserProfile {
  isAuthenticated: boolean;
  name: string;
  email: string;
  claims: Record<string, string | string[]>;
}
