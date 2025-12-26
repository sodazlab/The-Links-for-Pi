export type UserRole = 'guest' | 'pioneer' | 'admin';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  avatarUrl?: string;
}

export type PostCategory = 'youtube' | 'x' | 'instagram' | 'threads' | 'article' | 'other';
export type PostStatus = 'pending' | 'approved' | 'rejected';

export interface Post {
  id: string;
  userId: string;
  username: string; // Joined for display
  title: string;
  description: string;
  url: string;
  category: PostCategory;
  status: PostStatus;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  imageUrl?: string; // For mock display purposes
}

export interface AuthContextType {
  user: User | null;
  loginAsPioneer: (username: string) => void;
  loginAsAdmin: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}