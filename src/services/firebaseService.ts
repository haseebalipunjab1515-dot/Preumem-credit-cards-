import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDocFromServer,
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
};

export interface Review {
  id?: string;
  assetId: string;
  rating: number;
  comment: string;
  userId: string;
  userName: string;
  timestamp: any;
  status: 'pending' | 'approved' | 'rejected';
}

export const submitReview = async (assetId: string, rating: number, comment: string) => {
  if (!auth.currentUser) throw new Error("User must be authenticated");
  
  const path = 'reviews';
  try {
    const reviewData = {
      assetId,
      rating,
      comment,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || auth.currentUser.email || 'Guest User',
      timestamp: serverTimestamp(),
      status: 'pending'
    };
    return await addDoc(collection(db, path), reviewData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getApprovedReviews = async (assetId: string) => {
  const path = 'reviews';
  try {
    const q = query(
      collection(db, path), 
      where('assetId', '==', assetId),
      where('status', '==', 'approved'),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const getAssetStats = async (assetId: string) => {
  const path = `assetStats/${assetId}`;
  try {
    const docRef = doc(db, 'assetStats', assetId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as { averageRating: number; reviewCount: number };
    }
    return { averageRating: 0, reviewCount: 0 };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const subscribeToAssetStats = (assetId: string, callback: (stats: { averageRating: number, reviewCount: number }) => void) => {
  const path = `assetStats/${assetId}`;
  return onSnapshot(doc(db, 'assetStats', assetId), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as { averageRating: number; reviewCount: number });
    } else {
      callback({ averageRating: 0, reviewCount: 0 });
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};

export const checkIfAdmin = async () => {
  if (!auth.currentUser) return false;
  const path = `admins/${auth.currentUser.uid}`;
  try {
    const docSnap = await getDoc(doc(db, 'admins', auth.currentUser.uid));
    return docSnap.exists();
  } catch (error) {
    // We might get insufficient permissions if not an admin, which is expected
    return false;
  }
};

export const getPendingReviews = async () => {
  const path = 'reviews';
  try {
    const q = query(
      collection(db, path), 
      where('status', '==', 'pending'),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const moderateReview = async (reviewId: string, status: 'approved' | 'rejected') => {
  const path = `reviews/${reviewId}`;
  try {
    await updateDoc(doc(db, 'reviews', reviewId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export interface Purchase {
  id?: string;
  userId: string;
  assetId: string;
  assetTitle: string;
  price: string;
  timestamp: any;
  status: string;
}

export interface SavedAsset {
  id?: string;
  userId: string;
  assetId: string;
  timestamp: any;
}

export const logPurchase = async (assetId: string, assetTitle: string, price: string) => {
  if (!auth.currentUser) throw new Error("User must be authenticated");
  const path = 'purchases';
  try {
    return await addDoc(collection(db, path), {
      userId: auth.currentUser.uid,
      assetId,
      assetTitle,
      price,
      timestamp: serverTimestamp(),
      status: 'completed'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getPurchaseHistory = async () => {
  if (!auth.currentUser) return [];
  const path = 'purchases';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const saveAsset = async (assetId: string) => {
  if (!auth.currentUser) throw new Error("User must be authenticated");
  const path = 'savedAssets';
  try {
    return await addDoc(collection(db, path), {
      userId: auth.currentUser.uid,
      assetId,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const removeSavedAsset = async (saveId: string) => {
  const path = `savedAssets/${saveId}`;
  try {
    await deleteDoc(doc(db, 'savedAssets', saveId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const getSavedAssets = async () => {
  if (!auth.currentUser) return [];
  const path = 'savedAssets';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedAsset));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'price_drop' | 'new_listing' | 'system';
  read: boolean;
  timestamp: any;
}

export interface Deposit {
  id?: string;
  userId: string;
  amount: string;
  paymentMethod: string;
  txId?: string;
  timestamp: any;
  status: string;
}

export interface PriceAlert {
  id?: string;
  userId: string;
  assetId: string;
  threshold: number;
  timestamp: any;
}

export const subscribeToNotifications = (callback: (notifications: Notification[]) => void) => {
  if (!auth.currentUser) return () => {};
  const path = 'notifications';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
};

export const markNotificationRead = async (notificationId: string) => {
  const path = `notifications/${notificationId}`;
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const getDepositHistory = async () => {
  if (!auth.currentUser) return [];
  const path = 'deposits';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deposit));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const logDeposit = async (amount: string, paymentMethod: string, txId: string, status: string = 'pending') => {
  if (!auth.currentUser) throw new Error("User must be authenticated");
  const path = 'deposits';
  try {
    return await addDoc(collection(db, path), {
      userId: auth.currentUser.uid,
      amount,
      paymentMethod,
      txId,
      timestamp: serverTimestamp(),
      status
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const sendSimulationNotification = async (userId: string, title: string, message: string, type: 'price_drop' | 'new_listing' | 'system') => {
  const path = 'notifications';
  try {
    await addDoc(collection(db, path), {
      userId,
      title,
      message,
      type,
      read: false,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const addPriceAlert = async (assetId: string, threshold: number) => {
  if (!auth.currentUser) throw new Error("User must be authenticated");
  const path = 'priceAlerts';
  try {
    return await addDoc(collection(db, path), {
      userId: auth.currentUser.uid,
      assetId,
      threshold,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const removePriceAlert = async (alertId: string) => {
  const path = `priceAlerts/${alertId}`;
  try {
    await deleteDoc(doc(db, 'priceAlerts', alertId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const subscribeToPriceAlerts = (callback: (alerts: PriceAlert[]) => void) => {
  if (!auth.currentUser) return () => {};
  const path = 'priceAlerts';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PriceAlert)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
};

export const getAllPendingDeposits = async () => {
  const path = 'deposits';
  try {
    const q = query(
      collection(db, path),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    // Sort client-side by timestamp in case secondary index is not yet built in Firestore
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Deposit))
      .sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const moderateDeposit = async (depositId: string, status: 'completed' | 'rejected') => {
  const path = `deposits/${depositId}`;
  try {
    await updateDoc(doc(db, 'deposits', depositId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};
