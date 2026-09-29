export interface UserProfile {
  id?: string;
  isAuthenticated: boolean;
  name: string;
  email: string;
  claims: Record<string, string | string[]>;
}
