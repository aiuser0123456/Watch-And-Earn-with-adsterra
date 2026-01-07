
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  increment,
  Timestamp
} from 'firebase/firestore';
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

const CURRENT_USER_KEY = 'emerald_rewards_current_user';

export const mockDb = {
  // We keep this for immediate UI sync, but source of truth is Firestore
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

/**
 * FIRESTORE HELPERS
 */
export const dbService = {
  getUser: async (uid: string): Promise<User | null> => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as User : null;
  },

  createUser: async (user: User): Promise<void> => {
    await setDoc(doc(db, "users", user.uid), user);
  },

  updatePoints: async (uid: string, amount: number): Promise<void> => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      points: increment(amount)
    });
  },

  // Fix: Omit createdAt from parameter as it is added internally using Date.now() to ensure type compatibility with callers
  logActivity: async (activity: Omit<Activity, 'id' | 'createdAt'>): Promise<void> => {
    await addDoc(collection(db, "activity"), {
      ...activity,
      createdAt: Date.now()
    });
  },

  // Fix: Omit createdAt from parameter as it is added internally using Date.now() to ensure type compatibility with callers
  addWithdrawRequest: async (request: Omit<WithdrawRequest, 'id' | 'createdAt'>): Promise<void> => {
    await addDoc(collection(db, "withdrawRequests"), {
      ...request,
      createdAt: Date.now()
    });
  },

  getActivities: async (uid: string): Promise<Activity[]> => {
    const q = query(
      collection(db, "activity"), 
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
  },

  getWithdrawRequests: async (uid: string): Promise<WithdrawRequest[]> => {
    const q = query(
      collection(db, "withdrawRequests"), 
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawRequest));
  },

  getAllWithdrawRequests: async (): Promise<WithdrawRequest[]> => {
    const q = query(collection(db, "withdrawRequests"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawRequest));
  },

  getAllUsers: async (): Promise<User[]> => {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => doc.data() as User);
  }
};

export const loginWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  
  const result = await signInWithPopup(auth, provider);
  const fbUser = result.user;

  // Check Firestore for user
  let user = await dbService.getUser(fbUser.uid);

  if (!user) {
    user = {
      uid: fbUser.uid,
      name: fbUser.displayName || 'New User',
      email: fbUser.email || '',
      points: 0,
      photoUrl: fbUser.photoURL || `https://picsum.photos/seed/${fbUser.uid}/200`,
      createdAt: Date.now(),
      isAdmin: false
    };
    await dbService.createUser(user);
  }

  mockDb.setCurrentUser(user);
  return user;
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
  const adminUid = 'admin-1';
  let admin = await dbService.getUser(adminUid);
  
  if (!admin) {
    admin = {
      uid: adminUid,
      name: 'App Owner',
      email: 'admin@emerald.com',
      points: 10000,
      photoUrl: 'https://picsum.photos/seed/admin/200',
      createdAt: Date.now(),
      isAdmin: true
    };
    await dbService.createUser(admin);
  }
  
  mockDb.setCurrentUser(admin);
  return admin;
};
