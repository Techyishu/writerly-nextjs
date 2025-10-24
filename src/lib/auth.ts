// Simple authentication service for Sanity
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  user: User | null;
  error?: string;
}

// Simple in-memory user store (in production, use a proper database)
const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@writerly.com',
    role: 'admin'
  }
];

// Simple password storage (in production, use proper hashing)
const passwords: Record<string, string> = {
  [process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@writerly.com']: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
};

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = users.find(u => u.email === email);
      
      if (!user) {
        return { user: null, error: 'User not found' };
      }
      
      const storedPassword = passwords[email];
      if (!storedPassword || storedPassword !== password) {
        return { user: null, error: 'Invalid password' };
      }
      
      return { user };
    } catch (error) {
      return { user: null, error: 'Login failed' };
    }
  },

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return { user: null, error: 'User already exists' };
      }
      
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role: 'user'
      };
      
      users.push(newUser);
      passwords[email] = password;
      
      return { user: newUser };
    } catch (error) {
      return { user: null, error: 'Registration failed' };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    // In a real app, this would check the session/token
    // For now, return null to force login
    return null;
  },

  async logout(): Promise<void> {
    // In a real app, this would clear the session/token
    console.log('User logged out');
  }
};
