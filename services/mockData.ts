
import { User, WithdrawRequest, Activity, ActivityType, RequestStatus } from '../types';

// REAL FIREBASE CONFIGURATION (Provided by User)
export const firebaseConfig = {
  apiKey: "AIzaSyBo98K017YR-GYpODUFp89JhULO9CVMrgI",
  authDomain: "watch-and-earn-money-for-free.firebaseapp.com",
  projectId: "watch-and-earn-money-for-free",
  storageBucket: "watch-and-earn-money-for-free.firebasestorage.app",
  messagingSenderId: "717980722898",
  appId: "1:717980722898:web:50dbcc4ae6ab2a354d2f0b",
  measurementId: "G-N2D2BXBLPJ"
};

const USERS_KEY = 'emerald_rewards_users';
const REQUESTS_KEY = 'emerald_rewards_requests';
const ACTIVITY_KEY = 'emerald_rewards_activity';
const CURRENT_USER_KEY = 'emerald_rewards_current_user';

export const mockDb = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]'),
  saveUsers: (users: User[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users)),
  
  getRequests: (): WithdrawRequest[] => JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]'),
  saveRequests: (reqs: WithdrawRequest[]) => localStorage.setItem(REQUESTS_KEY, JSON.stringify(reqs)),

  getActivity: (): Activity[] => JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]'),
  saveActivity: (acts: Activity[]) => localStorage.setItem(ACTIVITY_KEY, JSON.stringify(acts)),

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      const users = mockDb.getUsers();
      const index = users.findIndex(u => u.uid === user.uid);
      if (index > -1) {
        users[index] = user;
      } else {
        users.push(user);
      }
      mockDb.saveUsers(users);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }
};

// Initialize with sample data if empty
if (mockDb.getUsers().length === 0) {
  const initialUser: User = {
    uid: 'user-123',
    name: 'Alex Doe',
    email: 'alex.doe@example.com',
    points: 1250,
    photoUrl: 'https://picsum.photos/seed/alex/200',
    createdAt: Date.now()
  };
  mockDb.saveUsers([initialUser]);
  
  const initialActivity: Activity[] = [
    { id: '1', userId: 'user-123', type: ActivityType.WATCH_AD, points: 2, title: 'Watched Video Ad', createdAt: Date.now() - 3600000, status: 'Completed' },
    { id: '2', userId: 'user-123', type: ActivityType.REFERRAL, points: 500, title: 'Invited Friend', createdAt: Date.now() - 86400000, status: 'Bonus' },
  ];
  mockDb.saveActivity(initialActivity);
}

export const loginWithGoogle = async (): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const existing = mockDb.getCurrentUser();
      if (existing) {
        resolve(existing);
      } else {
        const newUser: User = {
          uid: 'user-' + Math.random().toString(36).substr(2, 9),
          name: 'Emerald User',
          email: 'user@example.com',
          points: 0,
          photoUrl: 'https://picsum.photos/seed/new/200',
          createdAt: Date.now(),
          isAdmin: false
        };
        mockDb.setCurrentUser(newUser);
        resolve(newUser);
      }
    }, 1000);
  });
};

export const loginAsAdmin = async (): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const admin: User = {
        uid: 'admin-1',
        name: 'App Owner',
        email: 'admin@emerald.com',
        points: 0,
        photoUrl: 'https://picsum.photos/seed/admin/200',
        createdAt: Date.now(),
        isAdmin: true
      };
      mockDb.setCurrentUser(admin);
      resolve(admin);
    }, 1000);
  });
};
