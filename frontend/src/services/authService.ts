import apiClient from './api';
import { LoginCredentials, AuthResponse, DEMO_CREDENTIALS } from '@/types';
import { MOCK_USERS as ALL_MOCK_USERS } from './mockData';

// Mock users for demo login (until backend is ready)
const MOCK_USERS: AuthResponse[] = [
  {
    token: 'mock-customer-token-' + Date.now(),
    user: {
      id: 1,
      email: 'customer@gmail.com',
      name: 'John Customer',
      role: 'customer',
      created_at: new Date().toISOString(),
    },
  },
  {
    token: 'mock-engineer-token-' + Date.now(),
    user: {
      id: 2,
      email: 'engineer@gmail.com',
      name: 'Sarah Engineer',
      role: 'engineer',
      created_at: new Date().toISOString(),
    },
  },
  {
    token: 'mock-manager-token-' + Date.now(),
    user: {
      id: 3,
      email: 'manager@gmail.com',
      name: 'Mike Manager',
      role: 'manager',
      created_at: new Date().toISOString(),
    },
  },
  {
    token: 'mock-admin-token-' + Date.now(),
    user: {
      id: 8,
      email: 'admin@gmail.com',
      name: 'System Admin',
      role: 'admin',
      created_at: new Date().toISOString(),
    },
  },
];

export const authService = {
  // Login - currently using mock, switch to API when backend is ready
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check demo credentials
    if (
      credentials.email === DEMO_CREDENTIALS.customer.email &&
      credentials.password === DEMO_CREDENTIALS.customer.password
    ) {
      return MOCK_USERS[0];
    }

    if (
      credentials.email === DEMO_CREDENTIALS.engineer.email &&
      credentials.password === DEMO_CREDENTIALS.engineer.password
    ) {
      return MOCK_USERS[1];
    }

    if (
      credentials.email === DEMO_CREDENTIALS.manager.email &&
      credentials.password === DEMO_CREDENTIALS.manager.password
    ) {
      return MOCK_USERS[2];
    }

    if (
      credentials.email === DEMO_CREDENTIALS.admin.email &&
      credentials.password === DEMO_CREDENTIALS.admin.password
    ) {
      return MOCK_USERS[3];
    }

    // Also check dynamically created users
    const dynamicUser = ALL_MOCK_USERS.find(
      u => u.email === credentials.email && u.role !== 'admin'
    );
    if (dynamicUser) {
      return {
        token: `mock-${dynamicUser.role}-token-` + Date.now(),
        user: dynamicUser,
      };
    }

    // Invalid credentials
    throw {
      response: {
        data: {
          detail: 'Invalid email or password',
        },
      },
    };

    // When backend is ready, uncomment this:
    // try {
    //   const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    //   return response.data;
    // } catch (error) {
    //   throw error;
    // }
  },

  // Get current user
  me: async (): Promise<AuthResponse['user']> => {
    const response = await apiClient.get<AuthResponse['user']>('/auth/me');
    return response.data;
  },
};
