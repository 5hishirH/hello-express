export interface UserDto {
  email: string;
}

export interface AuthResponse {
  refreshToken: string;
  user: UserDto;
}
