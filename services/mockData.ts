
import { initializeApp } from 'firebase/app';
// Fix: Consolidating Firebase Auth imports into a single line to resolve potential module resolution issues
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
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
  limit,
  writeBatch
} from 'firebase/firestore';
import { User, WithdrawRequest, Activity, ActivityType, RequestStatus } from '../types';

export const firebaseConfig = {
  apiKey: "AIzaSyBo98K017YR-GYpODUFp89JhULO9CVMrgI",
  authDomain: "watch-and-earn-money-for-free.firebaseapp.com",
  projectId: "watch-and-earn-money-for-free",
  storageBucket: "watch-and-earn-money-for-free.firebasestorage.app",
  messagingSenderId: "717980722898",
  appId: "1:717980722898:web:50dbcc4ae6ab2a354d2f0b",
  measurementId: "G-N2D2BXBLPJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence);

const CURRENT_USER_KEY = 'emerald_rewards_current_user';
const MAX_HISTORY_ITEMS = 10;

export const mockDb = {
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

  logActivity: async (activity: Omit<Activity, 'id' | 'createdAt'>): Promise<void> => {
    const activityCol = collection(db, "activity");
    await addDoc(activityCol, {
      ...activity,
      createdAt: Date.now()
    });

    const q = query(activityCol, where("userId", "==", activity.userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    if (snapshot.size > MAX_HISTORY_ITEMS) {
      const batch = writeBatch(db);
      snapshot.docs.slice(MAX_HISTORY_ITEMS).forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  },

  addWithdrawRequest: async (request: Omit<WithdrawRequest, 'id' | 'createdAt'>): Promise<void> => {
    const withdrawCol = collection(db, "withdrawRequests");
    await addDoc(withdrawCol, {
      ...request,
      createdAt: Date.now()
    });
  },

  clearProcessedRequests: async (): Promise<void> => {
    const withdrawCol = collection(db, "withdrawRequests");
    const q = query(withdrawCol, where("status", "!=", RequestStatus.PENDING));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
};

export const loginWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const fbUser = result.user;
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
  } catch (e) { console.error(e); }
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
