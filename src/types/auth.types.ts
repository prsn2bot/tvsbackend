import { UserRole } from "./user.types";

// The data encoded within the JWT access token
export interface JwtPayload {
  userId: number;
  role: UserRole;
  email: string;
  is_verified: boolean;
}

// The JSON response object sent to the client upon successful login
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
