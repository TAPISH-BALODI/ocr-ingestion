export interface JwtPayload {
  sub: string; 
  email: string;
  role: 'admin' | 'support' | 'moderator' | 'user';
}

export interface RequestUser extends JwtPayload {
  userId: string; 
}

export enum Role {
  ADMIN = 'admin',
  SUPPORT = 'support',
  MODERATOR = 'moderator',
  USER = 'user',
}
