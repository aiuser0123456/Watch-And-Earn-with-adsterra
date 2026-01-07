
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { User, WithdrawRequest, Activity, ActivityType, RequestStatus } from '../types';

// REAL FIREBASE CONFIGURATION
export const firebaseConfig = {
  apiKey: "AIzaSyBo98K017YR-GYpODUFp89JhULO9CVMrgI",
  authDomain: "watch-and-earn-money-for-free.firebaseapp.com",
  projectId: "watch-and-earn-money-for-free",
  storageBucket: "watch-and-earn-money-for-free.firebasestorage.app",
  messagingSenderId: "717980722898",
  appId: "1:717980722898:web:50dbcc4ae6ab2a354d2f0b",
  measurementId: "G-N2D2BXBLPJ"
};

// Initialize Firebase once
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Ensure session stays in LocalStorage
setPersistence(auth, browserLocalPersistence);

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
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }
};

export const loginWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  // CRITICAL: Forces the Google Account Selection Popup every time
  provider.setCustomParameters({ prompt: 'select_account' });
  
  const result = await signInWithPopup(auth, provider);
  const fbUser = result.user;

  const users = mockDb.getUsers();
  let existingUser = users.find(u => u.uid === fbUser.uid);

  if (!existingUser) {
    existingUser = {
      uid: fbUser.uid,
      name: fbUser.displayName || 'New User',
      email: fbUser.email || '',
      points: 0,
      photoUrl: fbUser.photoURL || `https://picsum.photos/seed/${fbUser.uid}/200`,
      createdAt: Date.now(),
      isAdmin: false
    };
    mockDb.saveUsers([...users, existingUser]);
  }

  mockDb.setCurrentUser(existingUser);
  return existingUser;
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Firebase signOut failed:", e);
  }
  mockDb.setCurrentUser(null);
};

export const loginAsAdmin = async (): Promise<User> => {
  const admin: User = {
    uid: 'admin-1',
    name: 'App Owner',
    email: 'admin@emerald.com',
    points: 10000,
    photoUrl: 'https://picsum.photos/seed/admin/200',
    createdAt: Date.now(),
    isAdmin: true
  };
  mockDb.setCurrentUser(admin);
  return admin;
};
