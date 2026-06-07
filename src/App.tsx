import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertTriangle, 
  Skull, 
  Lock, 
  Terminal, 
  ShieldAlert, 
  LogOut, 
  Loader2, 
  ShoppingCart, 
  Star, 
  Cpu, 
  Radio, 
  HardDrive, 
  Wifi, 
  Globe, 
  Server, 
  Monitor,
  Activity, 
  ShieldCheck, 
  Zap, 
  X, 
  CreditCard, 
  Info, 
  MapPin, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  MessageCircle, 
  Send, 
  Wallet,
  Gamepad2,
  Bitcoin,
  Package,
  Gem,
  Layers,
  Globe2,
  Search,
  User,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  Bookmark,
  History,
  Heart,
  Bell,
  BellRing,
  Tag,
  Filter,
  ArrowUpDown,
  ListFilter,
  Copy,
  Check,
  FileText,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  submitReview, 
  getApprovedReviews, 
  subscribeToAssetStats, 
  checkIfAdmin, 
  moderateReview,
  getPendingReviews,
  logPurchase,
  getPurchaseHistory,
  saveAsset,
  removeSavedAsset,
  getSavedAssets,
  subscribeToNotifications,
  markNotificationRead,
  sendSimulationNotification,
  getDepositHistory,
  logDeposit,
  getAllPendingDeposits,
  moderateDeposit,
  addPriceAlert,
  removePriceAlert,
  subscribeToPriceAlerts,
  Review as ReviewType,
  Purchase as PurchaseType,
  SavedAsset as SavedAssetType,
  Notification as NotificationType,
  Deposit as DepositType,
  PriceAlert
} from './services/firebaseService';
import { auth } from './firebase';
import { 
  onAuthStateChanged, 
  signInAnonymously, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
} from 'firebase/auth';

export interface DecryptedCardDetails {
  cardholderName: string;
  cardNumber: string;
  cvc: string;
  expiryDate: string;
  address: string;
  postalCode: string;
  email: string;
}

export const getDeterministicCardDetails = (id: string, assetTitle: string): DecryptedCardDetails => {
  let hash = 0;
  const str = (id || '') + (assetTitle || '');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const firstNames = ['James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  
  const firstName = firstNames[hash % firstNames.length];
  const lastName = lastNames[(hash >> 2) % lastNames.length];
  const cardholderName = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${(hash % 89) + 10}@gmail.com`;
  
  // Format Card Number (VISA/MC)
  const isVisa = hash % 2 === 0;
  const prefix = isVisa ? '4' : '5';
  const bin = prefix + String((hash >> 3) % 900000 + 100000).padStart(5, '0');
  const rest1 = String((hash >> 5) % 10000).padStart(4, '0');
  const rest2 = String((hash >> 7) % 10000).padStart(4, '0');
  const rest3 = String((hash >> 9) % 100).padStart(2, '0');
  
  const rawNum = `${bin}${rest1}${rest2}${rest3}`;
  
  // Luhn algorithm check digit
  let sum = 0;
  let shouldDouble = false;
  for (let i = rawNum.length - 1; i >= 0; i--) {
    let digit = parseInt(rawNum.charAt(i));
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  const cardNumber = `${prefix}${bin.substring(1,4)} ${bin.substring(4,6)}${rest1.substring(0,2)} ${rest1.substring(2,4)}${rest2.substring(0,2)} ${rest2.substring(2,4)}${rest3}${checkDigit}`;

  const expMonth = String((hash % 12) + 1).padStart(2, '0');
  const expYear = String((hash % 5) + 26);
  const expiryDate = `${expMonth}/${expYear}`;
  
  const cvc = String(100 + (hash % 899));
  
  const streetNum = 100 + (hash % 9800);
  const streets = ['Broadway', 'Maple Ave', 'Oak St', 'Sunset Blvd', 'Pine St', 'Washington St', 'Main St', 'Wall St', 'Fifth Ave', 'Park Ave', 'Lexington Ave', 'Peachtree St', 'Michigan Ave'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'Miami', 'Dallas', 'Boston', 'Seattle', 'San Francisco', 'Atlanta', 'Las Vegas'];
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'TX', 'MA', 'WA', 'CA', 'GA', 'NV'];
  const cityIndex = hash % cities.length;
  const address = `${streetNum} ${streets[(hash >> 4) % streets.length]}, ${cities[cityIndex]}, ${states[cityIndex]}`;
  const postalCode = String(10000 + (hash % 89999));
  
  return {
    cardholderName,
    cardNumber,
    cvc,
    expiryDate,
    address,
    postalCode,
    email
  };
};

import { Tooltip } from './components/Tooltip';

const DetailItem = ({ icon, label, value, tooltip }: { icon: React.ReactNode, label: string, value: string, tooltip?: string }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
      {icon}
    </div>
    <div>
      {tooltip ? (
        <Tooltip content={tooltip} position="top">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider cursor-help border-b border-dotted border-gray-300 inline-block">{label}</p>
        </Tooltip>
      ) : (
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{label}</p>
      )}
      <p className="text-sm font-bold text-gray-900 leading-tight">{value}</p>
    </div>
  </div>
);

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [assetStats, setAssetStats] = useState<Record<string, { averageRating: number; reviewCount: number; latestReview?: { comment: string, user: string } }>>({});
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showModeration, setShowModeration] = useState(false);
  const [pendingReviews, setPendingReviews] = useState<ReviewType[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<DepositType[]>([]);
  
  const [isAdmin, setIsAdmin] = useState(false);
  
  
  
  
  
  const [showProfile, setShowProfile] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseType[]>([]);
  const [savedAssets, setSavedAssets] = useState<SavedAssetType[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [depositHistory, setDepositHistory] = useState<DepositType[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertAssetId, setAlertAssetId] = useState<string | null>(null);
  const [alertThreshold, setAlertThreshold] = useState('');
  const [isSubmittingAlert, setIsSubmittingAlert] = useState(false);

  const [purchasedCardDetails, setPurchasedCardDetails] = useState<any | null>(null);
  const [showCardDetailsPage, setShowCardDetailsPage] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyText = (label: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => {
      setCopiedField(null);
    }, 1500);
  };

  // Filtering states
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterCountry, setFilterCountry] = useState('All');
  const [filterPriceRange, setFilterPriceRange] = useState('All');
  const [sortOption, setSortOption] = useState('Newest');
  const [isFetchingAssets, setIsFetchingAssets] = useState(true);
  const [activeProfileTab, setActiveProfileTab] = useState<'purchases' | 'deposits' | 'saved' | 'alerts' | 'moderation'>('purchases');
  const [expandedPurchaseId, setExpandedPurchaseId] = useState<string | null>(null);
  const [showPurchaseConfirmation, setShowPurchaseConfirmation] = useState(false);
  const [pendingPurchaseAsset, setPendingPurchaseAsset] = useState<any>(null);
  const [isFinalizingPurchase, setIsFinalizingPurchase] = useState(false);
  const [currentTxId, setCurrentTxId] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      loadProfileData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const unsub = subscribeToNotifications((data) => {
      setNotifications(data);
    });
    return () => unsub();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const unsub = subscribeToPriceAlerts((data) => {
      setPriceAlerts(data);
    });
    return () => unsub();
  }, [isLoggedIn]);

  useEffect(() => {
    if (showProfile && isAdmin && activeProfileTab === 'moderation') {
      loadPendingReviews();
      loadPendingDeposits();
    }
  }, [showProfile, isAdmin, activeProfileTab]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        try {
          const adminStatus = await checkIfAdmin();
          setIsAdmin(adminStatus);
        } catch (e) {
          console.error("Admin check failed", e);
        }
      } else {
        setIsAdmin(false);
        // Default to logged in as guest for the UI flow if desired, 
        // but for real Firebase ops we should let the user choose login
        // For this app's existing logic, we'll keep isLoggedIn true by default but handle auth contextually
      }
    });
    return () => unsub();
  }, []);

  
  
  useEffect(() => {
    if (selectedCardId) {
      loadReviews(selectedCardId);
    }
  }, [selectedCardId]);

  const loadReviews = async (assetId: string) => {
    const fetchedReviews = await getApprovedReviews(assetId);
    if (fetchedReviews) {
      setReviews(fetchedReviews);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId || !reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      if (!auth.currentUser) {
        alert("Please sign in to submit a review.");
        setIsSubmittingReview(false);
        return;
      }
      
      await submitReview(selectedCardId, reviewRating, reviewComment);
      setReviewComment('');
      setReviewRating(5);
      alert("Review submitted! It will appear once approved by a moderator.");
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const loadPendingReviews = async () => {
    const fetched = await getPendingReviews();
    if (fetched) {
      setPendingReviews(fetched);
    }
  };

  const handleModerate = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      await moderateReview(reviewId, status);
      setPendingReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error(err);
      alert("Moderation failed.");
    }
  };

  const loadPendingDeposits = async () => {
    const fetched = await getAllPendingDeposits();
    if (fetched) {
      setPendingDeposits(fetched);
    }
  };

  const handleModerateDeposit = async (depositId: string, status: 'completed' | 'rejected') => {
    try {
      await moderateDeposit(depositId, status);
      setPendingDeposits(prev => prev.filter(d => d.id !== depositId));
      loadProfileData(); // Refresh current balance and history instantly
      alert(`Deposit transaction has been marked as ${status}.`);
    } catch (err) {
      console.error(err);
      alert("Deposit moderation failed.");
    }
  };

  const loadProfileData = async () => {
    const [history, saved, deposits] = await Promise.all([
      getPurchaseHistory(),
      getSavedAssets(),
      getDepositHistory()
    ]);
    if (history) setPurchaseHistory(history);
    if (saved) setSavedAssets(saved);
    if (deposits) setDepositHistory(deposits);
  };

  const [depositAmount, setDepositAmount] = useState('');
  const [depositTxId, setDepositTxId] = useState('');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  const handleDeposit = async () => {
    if (!depositAmount || !depositTxId) {
      alert('Please enter amount and transaction ID');
      return;
    }
    setIsSubmittingDeposit(true);
    try {
      await logDeposit(`$${depositAmount}`, 'USDT (TRC20)', depositTxId);
      alert(`Deposit request submitted successfully. It is now pending verification.`);
      setDepositAmount('');
      setDepositTxId('');
      loadProfileData();
      setShowDeposit(false);
    } catch (err) {
      console.error(err);
      alert("Failed to submit deposit request.");
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const currentBalance = (depositHistory || [])
    .filter(d => d.status === 'completed' || d.status === 'approved')
    .reduce((acc, d) => {
    const val = parseFloat(d.amount.replace('$', '').replace(',', '') || '0');
    return acc + val;
  }, 0) - (purchaseHistory || []).reduce((acc, p) => {
    const val = parseFloat(p.price.replace('$', '').replace(',', '') || '0');
    return acc + val;
  }, 0);

  const formatBalance = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const handleToggleSave = async (assetId: string) => {
    const existing = savedAssets.find(s => s.assetId === assetId);
    if (existing) {
      await removeSavedAsset(existing.id!);
      setSavedAssets(prev => prev.filter(s => s.id !== existing.id));
    } else {
      const newSave = await saveAsset(assetId);
      if (newSave) {
        setSavedAssets(prev => [...prev, { id: newSave.id, assetId, userId: auth.currentUser!.uid, timestamp: Date.now() }]);
      }
    }
  };

  const handlePurchase = (asset: any) => {
    const txId = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString().slice(-4);
    setCurrentTxId(txId);
    setPendingPurchaseAsset(asset);
    setShowPurchaseConfirmation(true);
  };

  const finalizePurchase = async () => {
    if (!pendingPurchaseAsset) return;
    setIsFinalizingPurchase(true);
    try {
      const docRef = await logPurchase(pendingPurchaseAsset.id, pendingPurchaseAsset.title || pendingPurchaseAsset.bank, pendingPurchaseAsset.price);
      const purchaseId = docRef?.id || 'MOCK-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      // Compute stable random card credentials
      const details = getDeterministicCardDetails(purchaseId, pendingPurchaseAsset.title || pendingPurchaseAsset.bank);
      
      setPurchasedCardDetails({
        ...details,
        id: purchaseId,
        assetTitle: pendingPurchaseAsset.title || pendingPurchaseAsset.bank,
        price: pendingPurchaseAsset.price,
        category: pendingPurchaseAsset.category || 'Premium'
      });

      setShowPurchaseConfirmation(false);
      setPendingPurchaseAsset(null);
      setShowCardDetailsPage(true);

      // Add a simulation notification in-app
      await sendSimulationNotification(
        auth.currentUser!.uid,
        'Credentials Unlocked! 💳',
        `Interactive decryption completed for ${pendingPurchaseAsset.title || pendingPurchaseAsset.bank}. Code: APPROVED.`,
        'system'
      );

      loadProfileData(); // Refresh history
    } catch (err) {
      console.error(err);
      alert("Transaction verification failed. Please try again.");
    } finally {
      setIsFinalizingPurchase(false);
    }
  };

  const handleAddPriceAlert = async () => {
    if (!alertAssetId || !alertThreshold) return;
    const threshold = parseFloat(alertThreshold);
    if (isNaN(threshold)) {
      alert("Please enter a valid price.");
      return;
    }

    setIsSubmittingAlert(true);
    try {
      await addPriceAlert(alertAssetId, threshold);
      setShowAlertModal(false);
      setAlertThreshold('');
      setAlertAssetId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to create price alert.");
    } finally {
      setIsSubmittingAlert(false);
    }
  };

  const handleDeletePriceAlert = async (alertId: string) => {
    try {
      await removePriceAlert(alertId);
    } catch (err) {
      console.error(err);
    }
  };

  const [marketData, setMarketData] = useState([
    // GAMING CATEGORY
    { id: 'g1', category: 'Gaming', type: 'gaming', title: 'PUBG UC - 6000+ UC Pack', level: 'GAME ASSET', balance: '$ 100.00', price: '$ 22.00', bank: 'Tencent Games', country: 'GLOBAL', flag: '🌍', db: '[2024] UC REFILL #PUBG', bin: 'GAM-UC', code: 'UC', vendor: 'PUBG####MO' },
    { id: 'g2', category: 'Gaming', type: 'gaming', title: 'PUBG UC - 12000+ UC Pack', level: 'ULTRA PACK', balance: '$ 200.00', price: '$ 42.00', bank: 'Tencent Games', country: 'GLOBAL', flag: '🌍', db: '[2024] UC REFILL #PUBG', bin: 'GAM-UC', code: 'UC', vendor: 'PUBG####MO' },
    { id: 'g3', category: 'Gaming', type: 'gaming', title: 'Free Fire - 5000 Diamonds', level: 'GAME ASSET', balance: '$ 80.00', price: '$ 20.00', bank: 'Garena', country: 'GLOBAL', flag: '🌍', db: '[2024] DIA REFILL #FF', bin: 'GAM-FF', code: 'DIA', vendor: 'FF####DI' },
    
    // SHOPPING CATEGORY
    { id: 's1', category: 'Shopping', type: 'shopping', title: 'Amazon Gift Card - $100', level: 'SHOPPING', balance: '$ 100.00', price: '$ 25.00', bank: 'Amazon.com', country: 'US', flag: '🇺🇸', db: '[2024] GIFT CARD #AMZ', bin: 'SHP-AZ', code: 'GC', vendor: 'AMZ####GC' },
    { id: 's2', category: 'Shopping', type: 'shopping', title: 'Amazon Gift Card - $500', level: 'PREMIUM SHOP', balance: '$ 500.00', price: '$ 65.00', bank: 'Amazon.com', country: 'US', flag: '🇺🇸', db: '[2024] GIFT CARD #AMZ', bin: 'SHP-AZ', code: 'GC', vendor: 'AMZ####GC' },
    { id: 's3', category: 'Shopping', type: 'shopping', title: 'eBay Shopping Credit - $200', level: 'SHOPPING', balance: '$ 200.00', price: '$ 35.00', bank: 'eBay Inc.', country: 'UK', flag: '🇬🇧', db: '[2024] CREDIT #EBAY', bin: 'SHP-EB', code: 'SC', vendor: 'EBY####SC' },
    { id: 's4', category: 'Shopping', type: 'shopping', title: 'Walmart Digital Card - $1000', level: 'ELITE SHOP', balance: '$ 1000.00', price: '$ 125.00', bank: 'Walmart', country: 'US', flag: '🇺🇸', db: '[2024] DIGITAL #WMT', bin: 'SHP-WM', code: 'DC', vendor: 'WMT####DC' },

    // CRYPTO CATEGORY
    { id: 'c1', category: 'Crypto', type: 'crypto', title: 'Binance USDT Voucher', level: 'CRYPTO', balance: '$ 100.00', price: '$ 24.00', bank: 'Binance', country: 'GLOBAL', flag: '🪙', db: '[2024] VOUCHER #USDT', bin: 'CRY-BN', code: 'USDT', vendor: 'BNB####VC' },
    { id: 'c2', category: 'Crypto', type: 'crypto', title: 'Crypto.com Debit Top-up', level: 'CRYPTO', balance: '$ 500.00', price: '$ 85.00', bank: 'Crypto.com', country: 'GLOBAL', flag: '🪙', db: '[2024] TOPUP #CRO', bin: 'CRY-CR', code: 'TOP', vendor: 'CRO####TU' },
    { id: 'c3', category: 'Crypto', type: 'crypto', title: 'BitRefill Voucher - $200', level: 'CRYPTO', balance: '$ 200.00', price: '$ 42.00', bank: 'BitRefill', country: 'GLOBAL', flag: '🪙', db: '[2024] VOUCHER #BIT', bin: 'CRY-BR', code: 'VC', vendor: 'BIT####VC' },

    // PREMIUM CARDS
    { id: 'p1', category: 'Premium', type: 'visa', balance: '$ 2500.00', level: 'CLASSIC', class: 'DEBIT', code: '201', exp: '10/27', db: '[07-03-2023] MIX #71E7', bin: '400022', country: 'US', flag: '🇺🇸', bank: 'BRANCH BANKING AND TRUST COMPANY', vendor: 'DM####OR', price: '$ 45.00' },
    { id: 'p2', category: 'Premium', type: 'amex', balance: '$ 8400.00', level: 'PLATINUM', class: 'CREDIT', code: '201', exp: '08/28', db: '[12-05-2023] PREMIUM #A92', bin: '371234', country: 'US', flag: '🇺🇸', bank: 'AMERICAN EXPRESS', vendor: 'AX####PR', price: '$ 350.00' },
    { id: 'p3', category: 'Premium', type: 'mastercard', balance: '$ 1500.00', level: 'WORLD', class: 'CREDIT', code: '201', exp: '12/26', db: '[07-03-2023] MIX #71E7', bin: '541275', country: 'US', flag: '🇺🇸', bank: 'CITIBANK N.A.', vendor: 'DM####OR', price: '$ 95.00' },
    { id: 'p4', category: 'Premium', type: 'visa', balance: '$ 800.00', level: 'GOLD', class: 'DEBIT', code: '201', exp: '04/27', db: '[07-03-2023] MIX #71E7', bin: '414720', country: 'US', flag: '🇺🇸', bank: 'ROBINS F.C.U.', vendor: 'DM####OR', price: '$ 75.00' },
    { id: 'p5', category: 'Premium', type: 'amex', balance: '$ 5200.00', level: 'GOLD', class: 'CREDIT', code: '201', exp: '11/27', db: '[12-05-2023] PREMIUM #A92', bin: '378282', country: 'US', flag: '🇺🇸', bank: 'AMERICAN EXPRESS', vendor: 'AX####PR', price: '$ 240.00' },
    { id: 'p6', category: 'Premium', type: 'mastercard', balance: '$ 3200.00', level: 'WORLD ELITE', class: 'DEBIT', code: '201', exp: '05/28', db: '[07-03-2023] MIX #71E7', bin: '512345', country: 'US', flag: '🇺🇸', bank: 'CHASE BANK', vendor: 'DM####OR', price: '$ 125.00' },
    { id: 'p7', category: 'Premium', type: 'visa', balance: '$ 9500.00', level: 'INFINITE', class: 'CREDIT', code: '201', exp: '06/27', db: '[07-03-2023] MIX #71E7', bin: '414709', country: 'US', flag: '🇺🇸', bank: 'PNC BANK, N.A.', vendor: 'DM####OR', price: '$ 420.00' },

    // DUMPS CATEGORY
    { id: 'd1', category: 'Dumps', type: 'dumps', title: 'Track 1/2 Chase Platinum', level: 'PLATINUM', balance: '$ 5,000.00', price: '$ 85.00', bank: 'Chase', country: 'US', flag: '🇺🇸', db: '[2024] US #CHASE', bin: '414720', code: '101', vendor: 'CHASE####MO' },
    { id: 'd2', category: 'Dumps', type: 'dumps', title: 'Track 1/2 BofA Gold', level: 'GOLD', balance: '$ 2,500.00', price: '$ 45.00', bank: 'Bank of America', country: 'US', flag: '🇺🇸', db: '[2024] US #BOFA', bin: '426684', code: '201', vendor: 'BOFA####MO' },
    { id: 'd3', category: 'Dumps', type: 'dumps', title: 'Track 1/2 Barclays Signature', level: 'SIGNATURE', balance: '$ 8,000.00', price: '$ 120.00', bank: 'Barclays', country: 'UK', flag: '🇬🇧', db: '[2024] UK #BARC', bin: '475129', code: '101', vendor: 'BARC####MO' },
    { id: 'd4', category: 'Dumps', type: 'dumps', title: 'Track 1/2 Wells Fargo Platinum', level: 'PLATINUM', balance: '$ 3,800.00', price: '$ 65.00', bank: 'Wells Fargo', country: 'US', flag: '🇺🇸', db: '[2024] US #WFC', bin: '473702', code: '201', vendor: 'WFC####MO' },
    { id: 'd5', category: 'Dumps', type: 'dumps', title: 'Track 1/2 NatWest Gold', level: 'GOLD', balance: '$ 2,000.00', price: '$ 40.00', bank: 'NatWest', country: 'UK', flag: '🇬🇧', db: '[2024] UK #NAT', bin: '453420', code: '101', vendor: 'NAT####MO' },
    { id: 'd6', category: 'Dumps', type: 'dumps', title: 'Track 1/2 RBC Royal Signature', level: 'SIGNATURE', balance: '$ 6,500.00', price: '$ 100.00', bank: 'RBC Royal Bank', country: 'CA', flag: '🇨🇦', db: '[2024] CA #RBC', bin: '450644', code: '201', vendor: 'RBC####MO' },

    // CPanel CATEGORY
    { id: 'cp1', category: 'cPanels', type: 'servers', title: 'cPanel Hostgator Admin', level: 'ADMIN', balance: 'N/A', price: '$ 15.00', bank: 'Hostgator', country: 'US', flag: '🇺🇸', db: '[2024] US #HG', bin: 'CP-HG', code: 'CP', vendor: 'HGTOR####MO' },
    { id: 'cp2', category: 'cPanels', type: 'servers', title: 'cPanel Bluehost Root', level: 'ROOT', balance: 'N/A', price: '$ 25.00', bank: 'Bluehost', country: 'US', flag: '🇺🇸', db: '[2024] US #BH', bin: 'CP-BH', code: 'CP', vendor: 'BHOST####MO' },
    { id: 'cp3', category: 'cPanels', type: 'servers', title: 'cPanel OVH Dedicated', level: 'DEDICATED', balance: 'N/A', price: '$ 45.00', bank: 'OVH', country: 'NL', flag: '🇳🇱', db: '[2024] NL #OVH', bin: 'CP-OVH', code: 'CP', vendor: 'OVH####MO' },
    { id: 'cp4', category: 'cPanels', type: 'servers', title: 'cPanel GoDaddy Reseller', level: 'RESELLER', balance: 'N/A', price: '$ 30.00', bank: 'GoDaddy', country: 'US', flag: '🇺🇸', db: '[2024] US #GD', bin: 'CP-GD', code: 'CP', vendor: 'GDDY####MO' },
    { id: 'cp5', category: 'cPanels', type: 'servers', title: 'cPanel Hetzner Root', level: 'ROOT', balance: 'N/A', price: '$ 35.00', bank: 'Hetzner', country: 'DE', flag: '🇩🇪', db: '[2024] DE #HTZ', bin: 'CP-HTZ', code: 'CP', vendor: 'HTZ####MO' },
    { id: 'cp6', category: 'cPanels', type: 'servers', title: 'cPanel AWS EC2 Root', level: 'ROOT', balance: 'N/A', price: '$ 60.00', bank: 'Amazon Web Services', country: 'US', flag: '🇺🇸', db: '[2024] US #AWS', bin: 'CP-AWS', code: 'CP', vendor: 'AWS####MO' },

    // RDP CATEGORY
    { id: 'r1', category: 'RDP', type: 'servers', title: 'USA Admin RDP 16GB', level: 'ADMIN', balance: 'N/A', price: '$ 20.00', bank: 'Azure', country: 'US', flag: '🇺🇸', db: '[2024] US #AZ', bin: 'RDP-AZ', code: 'RDP', vendor: 'AZURE####MO' },
    { id: 'r2', category: 'RDP', type: 'servers', title: 'UK Admin RDP 32GB', level: 'ADMIN', balance: 'N/A', price: '$ 35.00', bank: 'AWS', country: 'UK', flag: '🇬🇧', db: '[2024] UK #AWS', bin: 'RDP-AWS', code: 'RDP', vendor: 'AWS####MO' },
    { id: 'r3', category: 'RDP', type: 'servers', title: 'NL Secure RDP Root', level: 'ROOT', balance: 'N/A', price: '$ 50.00', bank: 'LeaseWeb', country: 'NL', flag: '🇳🇱', db: '[2024] NL #LW', bin: 'RDP-LW', code: 'RDP', vendor: 'LW####MO' },
    { id: 'r4', category: 'RDP', type: 'servers', title: 'AU Admin RDP 8GB', level: 'ADMIN', balance: 'N/A', price: '$ 15.00', bank: 'Google Cloud', country: 'AU', flag: '🇦🇺', db: '[2024] AU #GCP', bin: 'RDP-GCP', code: 'RDP', vendor: 'GCP####MO' },
    { id: 'r5', category: 'RDP', type: 'servers', title: 'RU Bulletproof RDP', level: 'ROOT', balance: 'N/A', price: '$ 80.00', bank: 'Private Node', country: 'RU', flag: '🇷🇺', db: '[2024] RU #BP', bin: 'RDP-BP', code: 'RDP', vendor: 'PNODE####MO' },
    { id: 'r6', category: 'RDP', type: 'servers', title: 'CA Admin RDP 64GB', level: 'ADMIN', balance: 'N/A', price: '$ 65.00', bank: 'OVH', country: 'CA', flag: '🇨🇦', db: '[2024] CA #OVH', bin: 'RDP-OVH', code: 'RDP', vendor: 'OVH####MO' },

    // FULLZ CATEGORY
    { id: 'f1', category: 'Fullz', type: 'fullz', title: 'Premium Fullz + SSN', level: 'PREMIUM', balance: '700+ CS', price: '$ 25.00', bank: 'Experian DL', country: 'US', flag: '🇺🇸', db: '[2024] US #FULL', bin: 'FLZ-US', code: 'FLZ', vendor: 'EXP####MO' },
    { id: 'f2', category: 'Fullz', type: 'fullz', title: 'Corporate Fullz + EIN', level: 'CORPORATE', balance: '800+ CS', price: '$ 75.00', bank: 'Equifax DL', country: 'US', flag: '🇺🇸', db: '[2024] US #CORP', bin: 'FLZ-CORP', code: 'FLZ', vendor: 'EQF####MO' },
    { id: 'f3', category: 'Fullz', type: 'fullz', title: 'UK Complete Profile', level: 'VERIFIED', balance: 'Excellent', price: '$ 30.00', bank: 'TransUnion DL', country: 'UK', flag: '🇬🇧', db: '[2024] UK #FULL', bin: 'FLZ-UK', code: 'FLZ', vendor: 'TU####MO' },
    { id: 'f4', category: 'Fullz', type: 'fullz', title: 'AU Taxpayer Fullz', level: 'VERIFIED', balance: 'Good', price: '$ 40.00', bank: 'Equifax DL', country: 'AU', flag: '🇦🇺', db: '[2024] AU #FULL', bin: 'FLZ-AU', code: 'FLZ', vendor: 'EQF####MO' },
    { id: 'f5', category: 'Fullz', type: 'fullz', title: 'CA Premium Fullz + DL', level: 'PREMIUM', balance: '750+ CS', price: '$ 35.00', bank: 'TransUnion DL', country: 'CA', flag: '🇨🇦', db: '[2024] CA #FULL', bin: 'FLZ-CA', code: 'FLZ', vendor: 'TU####MO' },
    { id: 'f6', category: 'Fullz', type: 'fullz', title: 'US High Net Worth Fullz', level: 'ELITE', balance: '850 CS', price: '$ 150.00', bank: 'Experian DL', country: 'US', flag: '🇺🇸', db: '[2024] US #ELITE', bin: 'FLZ-US-E', code: 'FLZ', vendor: 'EXP####MO' },
  ]);

  const filteredMarketData = marketData
    .filter(item => {
      const matchesSearch = 
        (item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (item.bin && item.bin.includes(searchQuery)) || 
        (item.bank && item.bank.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = filterCategory === 'All' || item.category === filterCategory;
      const matchCountry = filterCountry === 'All' || item.country === filterCountry;
      
      let matchPrice = true;
      const price = parseFloat(item.price.replace('$', '').replace(' ', '').trim());
      if (filterPriceRange === 'Under $50') matchPrice = price < 50;
      else if (filterPriceRange === '$50 - $100') matchPrice = price >= 50 && price <= 100;
      else if (filterPriceRange === 'Over $100') matchPrice = price > 100;

      return matchesSearch && matchCategory && matchCountry && matchPrice;
    })
    .sort((a, b) => {
      const priceA = parseFloat(a.price.replace('$', '').replace(' ', '').trim());
      const priceB = parseFloat(b.price.replace('$', '').replace(' ', '').trim());
      
      if (sortOption === 'Price: Low to High') return priceA - priceB;
      if (sortOption === 'Price: High to Low') return priceB - priceA;
      
      const ratingA = assetStats[a.id]?.averageRating || 0;
      const ratingB = assetStats[b.id]?.averageRating || 0;
      if (sortOption === 'Rating') return ratingB - ratingA;
      
      return 0;
    });

  const uniqueCountries = ['All', ...new Set(marketData.map(item => item.country))];
  const uniqueCategories = ['All', ...new Set(marketData.map(item => item.category))];

  const selectedCard = selectedCardId ? marketData.find(c => c.id === selectedCardId) : null;


  useEffect(() => {
    if (!isLoggedIn) return;

    // Generate local mock stats and reviews for demo purposes if not available in DB
    const getMockStats = (assetId: string) => {
      const idNum = parseInt(assetId.substring(0, 8), 16) || Math.random() * 10000;
      const rating = 4.0 + (idNum % 10) / 10;
      const count = 15 + (idNum % 50);
      
      const names = ["ShadowCracker", "AlphaOps", "NeoMatrix", "GhostProtocol", "Cipher7", "Vortex", "RogueOne", "SignalZero"];
      const comments = [
        "Extremely high quality asset, worked perfectly for my project deployment. High stability.",
        "Verified and solid. No detections so far, very clean implementation.",
        "The balance was exactly as advertised. Fast delivery and reliable network.",
        "Solid tier-3 asset. Better than most marketplace alternatives I've tried.",
        "Instant results. The integration was seamless.",
        "Professional level service. The vendor is very responsive.",
        "Highly recommended for enterprise-grade tasks.",
        "Worked on the first try. Will buy again."
      ];

      return {
        averageRating: rating,
        reviewCount: count,
        latestReview: {
          user: names[Math.round(idNum) % names.length],
          comment: comments[Math.round(idNum) % comments.length]
        }
      };
    };

    const unsubscribers: (() => void)[] = [];
    marketData.forEach(asset => {
      const unsub = subscribeToAssetStats(asset.id, (stats) => {
        setAssetStats(prev => {
          const dbStats = stats.reviewCount > 0 ? stats : getMockStats(asset.id);
          return { 
            ...prev, 
            [asset.id]: { 
              ...prev[asset.id], 
              ...dbStats 
            } 
          };
        });
      });
      unsubscribers.push(unsub);
    });

    return () => unsubscribers.forEach(unsub => unsub());
  }, [isLoggedIn, marketData.length]);

  const categories = [
    { id: 'All', icon: <Globe size={16} />, label: 'All Assets' },
    { id: 'Gaming', icon: <Gamepad2 size={16} />, label: 'Gaming / UC' },
    { id: 'Shopping', icon: <ShoppingCart size={16} />, label: 'Shopping' },
    { id: 'Crypto', icon: <Bitcoin size={16} />, label: 'Crypto Assets' },
    { id: 'Premium', icon: <CreditCard size={16} />, label: 'Premium Cards' },
    { id: 'Dumps', icon: <CreditCard size={16} />, label: 'Dumps' },
    { id: 'cPanels', icon: <Globe size={16} />, label: 'cPanels' },
    { id: 'RDP', icon: <Monitor size={16} />, label: 'RDP' },
    { id: 'Fullz', icon: <User size={16} />, label: 'Fullz' }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Gaming': return <Gamepad2 size={12} />;
      case 'Shopping': return <ShoppingCart size={12} />;
      case 'Crypto': return <Bitcoin size={12} />;
      case 'Premium': return <CreditCard size={12} />;
      default: return <Package size={12} />;
    }
  };

  // Dynamic effects state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [shake, setShake] = useState(false);
  const [copied, setCopied] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Simulate initial data fetching
    const fetchTimer = setTimeout(() => setIsFetchingAssets(false), 1500);
    return () => clearTimeout(fetchTimer);
  }, []);

  useEffect(() => {
    // Simulate real-time price fluctuations for Premium assets
    const interval = setInterval(() => {
      setMarketData(prevData => {
        const newData = prevData.map(item => {
          if (item.category === 'Premium') {
            const currentPrice = parseFloat(item.price.replace('$ ', ''));
            // Fluctuates between -0.4% and +0.6%
            const fluctuation = 1 + (Math.random() * 0.01 - 0.004);
            const newPriceValue = (currentPrice * fluctuation).toFixed(2);
            
            // Check alerts
            const relevantAlerts = priceAlerts.filter(a => a.assetId === item.id);
            relevantAlerts.forEach(alert => {
              if (currentPrice >= alert.threshold && parseFloat(newPriceValue) < alert.threshold) {
                // Threshold crossed (downward)
                sendSimulationNotification(
                  auth.currentUser!.uid,
                  'Price Alert Triggered!',
                  `${item.bank} ${item.level} price dropped below $${alert.threshold}. Current: $${newPriceValue}`,
                  'price_drop'
                );
              }
            });

            return { ...item, price: `$ ${newPriceValue}` };
          }
          return item;
        });
        return newData;
      });
    }, 12000); // Fluctuates every 12 seconds

    return () => clearInterval(interval);
  }, [priceAlerts]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 200);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    setShake(false);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      
      setIsLoggedIn(true);
      setError('');
      setIsLoading(false);
      
      const adminStatus = await checkIfAdmin();
      setIsAdmin(adminStatus);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled.');
      } else {
        setError('Google Sign-In failed.');
      }
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isForgotPassword) {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset link sent to your email.');
        setIsForgotPassword(false);
      } else if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setIsLoggedIn(true);
      setError('');
    } catch (err: any) {
      console.error(err);
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No user found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Invalid password.');
          break;
        case 'auth/email-already-in-use':
          setError('Email already in use.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        default:
          setError(err.message || 'Authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsLoggedIn(false);
      setError('');
    } catch (err) {
      console.error(err);
    }
  };

  // Determine current system status for effects
  let systemStatus: 'normal' | 'typing' | 'loading' | 'error' = 'normal';
  if (error && shake) systemStatus = 'error';
  else if (isLoading) systemStatus = 'loading';
  else if (isTyping) systemStatus = 'typing';

  const BackgroundEffects = ({ status }: { status: string }) => {
    const offsetX = typeof window !== 'undefined' ? (mousePos.x / window.innerWidth - 0.5) * 15 : 0;
    const offsetY = typeof window !== 'undefined' ? (mousePos.y / window.innerHeight - 0.5) * 15 : 0;

    return (
      <>
        <div className="absolute inset-0 z-0 bg-[#020617]"></div>
        {/* Animated Mesh Gradient */}
        <div className="absolute inset-0 z-5 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] rounded-full bg-slate-800/30 blur-[100px]"></div>
        </div>

        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}>
        </div>

        {/* Floating Individual Cards */}
        <div className="absolute inset-0 z-15 overflow-hidden pointer-events-none">
          {[
            { id: 1, src: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=400&auto=format&fit=crop', top: '10%', left: '5%', rotate: -15, mobile: true },
            { id: 2, src: 'https://images.unsplash.com/photo-1613243555988-441166d4d6fd?q=80&w=400&auto=format&fit=crop', top: '60%', left: '2%', rotate: 10, mobile: false },
            { id: 3, src: 'https://images.unsplash.com/photo-1596700688648-52219e1a8a25?q=80&w=400&auto=format&fit=crop', top: '15%', left: '85%', rotate: 20, mobile: true },
            { id: 4, src: 'https://images.unsplash.com/photo-1556741533-5e3609805562?q=80&w=400&auto=format&fit=crop', top: '70%', left: '80%', rotate: -10, mobile: false },
            { id: 5, src: 'https://images.unsplash.com/photo-1523450914197-ce54681329bf?q=80&w=400&auto=format&fit=crop', top: '40%', left: '90%', rotate: -5, mobile: true },
            { id: 6, src: 'https://images.unsplash.com/photo-1563013544-302ed1bdadfe?q=80&w=400&auto=format&fit=crop', top: '85%', left: '40%', rotate: 5, mobile: false },
          ].map((card) => (
            <motion.div
              key={card.id}
              initial={{ y: 0, opacity: 0, rotate: card.rotate }}
              animate={{ opacity: 0.25 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`absolute w-32 md:w-56 h-20 md:h-36 rounded-xl md:rounded-2xl shadow-2xl overflow-hidden border border-white/5 ${card.mobile ? 'block' : 'hidden md:block'}`}
              style={{ top: card.top, left: card.left }}
            >
              <img 
                src={card.src} 
                alt="Card" 
                className="w-full h-full object-cover grayscale brightness-50"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          ))}
        </div>

        <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-[2px]"></div>
        
        <div 
          className={`absolute inset-0 z-40 bg-[linear-gradient(rgba(16,18,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_2px] pointer-events-none opacity-20 transition-all duration-500`}
        ></div>
        
        {status === 'error' && <div className="absolute inset-0 z-20 bg-red-900/10 animate-pulse pointer-events-none"></div>}
        <div className="absolute inset-0 z-50 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] pointer-events-none opacity-90"></div>
      </>
    );
  };


  if (isLoggedIn) {
    return (
      <div 
        className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col items-center py-4 md:py-8 px-2 md:px-4 relative overflow-hidden"
      >
        {/* Subtle Dashboard Background Cards */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.05] pointer-events-none grayscale mix-blend-overlay"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1512314889357-e157c22f938d?q=80&w=2071&auto=format&fit=crop")',
          }}
        ></div>

        <div className="relative z-10 w-full max-w-[1400px] flex flex-col min-h-[90vh] h-auto">
          {/* Dashboard Header */}
          <div className="premium-header flex flex-wrap justify-between items-center p-3 md:p-6 mb-4 md:mb-6 rounded-lg gap-2 md:gap-4">
            <h1 className="text-lg md:text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center">
              <Globe className="mr-2 md:mr-3 text-blue-500 w-5 h-5 md:w-6 md:h-6" /> <span className="hidden sm:inline">Premium Asset Market</span><span className="sm:hidden">Market</span>
            </h1>
            <div className="flex items-center gap-3 md:gap-6">
              <div className="flex items-center gap-3 md:gap-4 border-r border-gray-200 pr-3 md:pr-6">
                <button 
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {notifications.some(n => !n.read) ? (
                    <BellRing size={20} className="text-blue-500 animate-pulse" />
                  ) : (
                    <Bell size={20} />
                  )}
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  )}
                </button>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest hidden md:block">Balance</p>
                  <p className="text-sm md:text-xl font-black text-green-500">{formatBalance(currentBalance)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setShowProfile(true);
                    loadProfileData();
                  }}
                  className="professional-btn flex items-center justify-center p-2 md:px-4 md:py-2"
                  title="My Account"
                >
                  <User size={16} /> <span className="hidden md:inline ml-2">My Account</span>
                </button>
                <button 
                  onClick={() => setShowDeposit(true)}
                  className="accent-btn flex items-center justify-center p-2 md:px-4 md:py-2"
                  title="Deposit"
                >
                  <CreditCard size={16} className="md:hidden" />
                  <span className="hidden md:inline">+ Deposit</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="professional-btn flex items-center justify-center p-2 md:px-4 md:py-2"
                  title="Exit"
                >
                  <LogOut size={16} className="md:hidden" />
                  <span className="hidden md:inline">Exit</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setFilterCategory(cat.id);
                    setActiveCategory(cat.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    filterCategory === cat.id 
                      ? 'bg-blue-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.3)]' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg p-4 pl-12 text-sm focus:outline-none focus:border-blue-600 transition-all shadow-sm focus:ring-1 focus:ring-blue-600 placeholder:text-gray-400"
                />
              </div>

              {/* Advanced Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar col-span-1 md:col-span-3">
                <div className="flex items-center gap-2 bg-white border border-gray-200 p-1 rounded-xl shrink-0">
                  <div className="px-3 text-[10px] font-black text-gray-500 uppercase border-r border-gray-200">Region</div>
                  <select 
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="bg-transparent text-gray-900 text-xs font-bold p-2 outline-none cursor-pointer"
                  >
                    {uniqueCountries.map(c => <option key={c} value={c} className="bg-white">{c}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-white border border-gray-200 p-1 rounded-xl shrink-0">
                  <div className="px-3 text-[10px] font-black text-gray-500 uppercase border-r border-gray-200">Price</div>
                  <select 
                    value={filterPriceRange}
                    onChange={(e) => setFilterPriceRange(e.target.value)}
                    className="bg-transparent text-gray-900 text-xs font-bold p-2 outline-none cursor-pointer"
                  >
                    <option value="All" className="bg-white">All Prices</option>
                    <option value="Under $50" className="bg-white">Under $50</option>
                    <option value="$50 - $100" className="bg-white">$50 - $100</option>
                    <option value="Over $100" className="bg-white">Over $100</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-white border border-gray-200 p-1 rounded-xl shrink-0">
                  <div className="px-3 text-[10px] font-black text-gray-500 uppercase border-r border-gray-200">Sort</div>
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-transparent text-gray-900 text-xs font-bold p-2 outline-none cursor-pointer"
                  >
                    <option value="Newest" className="bg-white">Newest Listed</option>
                    <option value="Price: Low to High" className="bg-white">Price: Low to High</option>
                    <option value="Price: High to Low" className="bg-white">Price: High to Low</option>
                    <option value="Rating" className="bg-white">Highest Rating</option>
                  </select>
                </div>

                <button 
                  onClick={() => {
                    setFilterCategory('All');
                    setFilterCountry('All');
                    setFilterPriceRange('All');
                    setSortOption('Newest');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-[10px] font-black text-blue-500 uppercase hover:text-blue-400 transition-colors shrink-0"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {isFetchingAssets ? (
                [...Array(8)].map((_, i) => (
                  <div key={`skeleton-${i}`} className="premium-card flex flex-col rounded-xl overflow-hidden animate-pulse">
                    <div className="relative aspect-[1.586/1] w-full p-4 bg-gray-50/50">
                      <div className="w-full h-full rounded-xl bg-gray-200/50 dark:bg-gray-800/20"></div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-full pr-4">
                          <div className="h-4 bg-gray-200/50 dark:bg-gray-800/30 rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-gray-200/50 dark:bg-gray-800/30 rounded w-1/3"></div>
                        </div>
                        <div className="h-6 bg-green-200/30 rounded w-16 shrink-0"></div>
                      </div>
                      <div className="flex items-center mt-4">
                        <div className="h-5 bg-blue-200/30 rounded w-16 mr-2"></div>
                        <div className="h-5 bg-purple-200/30 rounded w-16 mr-2"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredMarketData.length > 0 ? (
                filteredMarketData.map((item, i) => (
                  <motion.div 
                    key={item.id || i} 
                    layoutId={`card-${item.id || i}`}
                    onClick={() => setSelectedCardId(item.id || i)}
                    className="premium-card flex flex-col rounded-xl overflow-hidden group cursor-pointer"
                  >
                  {/* Big Card Image */}
                  <div className="relative aspect-[1.586/1] w-full p-4 bg-gray-50/50">
                    <motion.div 
                      layoutId={`card-visual-${item.id || i}`}
                      whileHover={{ rotateY: 8, rotateX: -5, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`w-full h-full rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-center items-center`}
                      style={{ perspective: "1000px" }}
                    >
                      {/* Realistic Visuals for Backgrounds */}
                      <img 
                        src={
                          item.category === 'Gaming' ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400' :
                          item.category === 'Shopping' ? 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=400' :
                          item.category === 'Crypto' ? 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=400' :
                          item.type === 'visa' ? 'https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=400' : 
                          item.type === 'amex' ? 'https://images.unsplash.com/photo-1613243555988-441166d4d6fd?q=80&w=400' :
                          'https://images.unsplash.com/photo-1556741533-5e3609805562?q=80&w=400'
                        }
                        alt="Asset Graphic"
                        className="absolute inset-0 w-full h-full object-cover brightness-90 contrast-125 group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10"></div>
                      
                      <div className="absolute inset-0 bg-black/10 mix-blend-multiply z-10"></div>
                      
                      {item.category !== 'Premium' && (
                        <div className="absolute inset-x-4 bottom-4 flex justify-between items-end z-20">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-white/70 tracking-wider">BALANCE</span>
                              <span className="text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{item.balance}</span>
                           </div>
                           <span className="text-[8px] font-bold text-white/60 tracking-widest group-hover:text-white transition-colors">{item.vendor}</span>
                        </div>
                      )}

                      {/* Brand Logo for Gift Cards */}
                      {item.category !== 'Premium' && (
                        <div className="absolute top-4 right-4 text-white font-black italic text-[10px] md:text-sm tracking-tighter opacity-80 z-20">
                          {item.bank}
                        </div>
                      )}

                      {/* Card Chip (For all) */}
                      <div className="absolute top-1/2 left-8 -translate-y-1/2 w-12 h-10 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-md border border-yellow-700/30 overflow-hidden shadow-inner z-20">
                        <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-40">
                          {[...Array(9)].map((_, idx) => <div key={idx} className="border-[0.5px] border-black/40"></div>)}
                        </div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_100%)]"></div>
                      </div>
                      
                      {/* Brand Logo for Premium */}
                      {item.category === 'Premium' && (
                        <div className="absolute bottom-6 right-8">
                          <img 
                            src={
                              item.type === 'visa' ? 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' : 
                              item.type === 'amex' ? 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg' :
                              'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg'
                            } 
                            alt={item.type || 'brand'}
                            className="h-8 md:h-10 w-auto brightness-0 invert drop-shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Card Number */}
                      {item.category === 'Premium' && (
                        <div 
                          className="absolute top-1/2 left-8 -translate-y-2 text-white font-mono text-xl tracking-[0.25em] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                        >
                          {item.bin} **** **** ****
                        </div>
                      )}

                      {/* Exp Date */}
                      {item.category === 'Premium' && (
                        <div className="absolute bottom-6 right-8 text-white font-mono text-xs opacity-90">
                          {item.exp}
                        </div>
                      )}

                      <div className="absolute top-6 right-8 text-white font-bold text-[8px] md:text-[10px] tracking-widest uppercase opacity-60">
                        {item.level}
                      </div>

                      {/* Shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
                    </motion.div>
                  </div>

                  {/* Details below */}
                  <div className="p-6 bg-white border-t border-gray-200 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="max-w-[70%]">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-wide leading-tight">{item.title || item.bank || 'DIGITAL ASSET'}</h3>
                          <div className="flex items-center gap-2">
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleToggleSave(item.id);
                               }}
                               className="text-gray-600 hover:text-blue-500 transition-colors"
                             >
                               <Bookmark 
                                 size={12} 
                                 className={savedAssets.some(s => s.assetId === item.id) ? 'fill-blue-500 text-blue-500' : ''} 
                               />
                             </button>
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setAlertAssetId(item.id);
                                 setAlertThreshold(item.price.replace('$', '').replace(' ', '').trim());
                                 setShowAlertModal(true);
                               }}
                               className="text-gray-600 hover:text-blue-500 transition-colors"
                               title="Set Price Alert"
                             >
                               <Bell 
                                 size={12} 
                                 className={priceAlerts.some(a => a.assetId === item.id) ? 'fill-blue-500 text-blue-500' : ''} 
                               />
                             </button>
                          </div>
                        </div>
                        
                        {assetStats[item.id]?.latestReview && (
                          <div className="mt-2 p-2 bg-blue-500/5 rounded border border-blue-500/10 relative overflow-hidden group/review">
                            <div className="absolute top-0 right-0 p-1 opacity-10">
                               <MessageCircle size={10} className="text-blue-400" />
                            </div>
                            <p className="text-[8px] text-blue-400 font-bold uppercase tracking-tighter mb-1 opacity-60">Verified Signal from {assetStats[item.id]?.latestReview?.user}</p>
                            <p className="text-[9px] text-gray-400 italic line-clamp-1 group-hover/review:line-clamp-none transition-all">
                              "{assetStats[item.id]?.latestReview?.comment}"
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 mr-2 shrink-0">
                            <span className="text-blue-400 capitalize">
                              {getCategoryIcon(item.category)}
                            </span>
                            <span className="text-[7px] font-black text-blue-400 uppercase tracking-tighter">
                              {item.category}
                            </span>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={10} 
                                className={`${i < Math.round(assetStats[item.id]?.averageRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-[8px] text-gray-500 font-bold">({assetStats[item.id]?.reviewCount || 0})</span>
                        </div>
                        <p className="text-[9px] text-gray-500 mt-1 font-mono">{item.vendor} | {item.category}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-lg">{item.flag}</span>
                        <span className="text-[8px] font-bold text-gray-500 uppercase">{item.country}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center">
                       <div>
                          <Tooltip content="Estimated market value of the digital asset" position="top">
                            <p className="text-gray-500 uppercase text-[8px] mb-0.5 cursor-help border-b border-dotted border-gray-300">EST. VALUE</p>
                          </Tooltip>
                          <p className="text-green-600 font-black tracking-wider text-sm">{item.balance || 'N/A'}</p>
                       </div>
                       <div className="text-right">
                          <Tooltip content="The price you pay to acquire this asset" position="top">
                            <p className="text-gray-500 uppercase text-[8px] mb-0.5 cursor-help border-b border-dotted border-gray-300">ASSET PRICE</p>
                          </Tooltip>
                          <p className="text-gray-900 font-black tracking-wider text-sm">{item.price}</p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-col">
                        <Tooltip content="Percentage saved compared to estimated market value" position="right">
                          <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest cursor-help border-b border-dotted border-gray-800">Buy Discount</span>
                        </Tooltip>
                        <span className="text-xs font-bold text-blue-500">
                          {item.balance ? `Save ~${Math.round((1 - parseFloat(item.price.replace('$', '')) / parseFloat(item.balance.replace('$', ''))) * 100)}%` : 'PREMIUM'}
                        </span>
                      </div>
                      <button 
                        className="accent-btn flex items-center gap-2 text-[10px] py-2 px-4 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCardId(item.id || i);
                          setShowPayment(true);
                        }}
                      >
                        <ShoppingCart size={12} /> Buy Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500">
                 <Search size={48} className="text-gray-700 mb-4 opacity-50" />
                 <p className="text-sm font-bold uppercase tracking-widest">No assets found</p>
                 <p className="text-xs mt-2 opacity-60">Try adjusting your filters or search query.</p>
              </div>
            )}
            </div>
          </div>


          {/* Full-Screen Detailed View Overlay */}
          <AnimatePresence>
            {selectedCard && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-white overflow-y-auto custom-scrollbar"
              >
                {/* Navigation Header */}
                <div className="sticky top-0 z-[110] bg-white/80 backdrop-blur-md border-b border-gray-100 flex justify-between items-center px-6 md:px-12 py-4 md:py-6">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        setSelectedCardId(null);
                        setShowPayment(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                    >
                      <X size={24} />
                    </button>
                    <div className="flex flex-col">
                      <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">{selectedCard.title || selectedCard.bank}</h2>
                      <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase">Asset ID: {selectedCard.bin}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleToggleSave(selectedCard.id)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-blue-600"
                    >
                      <Bookmark size={20} className={savedAssets.some(s => s.assetId === selectedCard.id) ? 'fill-blue-500 text-blue-500' : ''} />
                    </button>
                    <button 
                      onClick={() => {
                        setShowPayment(true);
                        // Scroll to payment section if needed
                      }}
                      className="accent-btn py-2 px-6 text-sm h-auto hidden md:flex items-center gap-2"
                    >
                      <ShoppingCart size={16} /> Buy Now
                    </button>
                  </div>
                </div>

                <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-6 md:py-16">
                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-24">
                    {/* Left: Visual & Quick Stats */}
                    <div className="w-full lg:w-1/2 space-y-6 md:space-y-8">
                      <motion.div 
                        layoutId={`card-visual-${selectedCard.id}`}
                        initial={{ rotateY: 0, rotateX: 0 }}
                        animate={{ rotateY: 5, rotateX: -2 }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        className={`w-full aspect-[1.586/1] rounded-2xl md:rounded-[2rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] md:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col justify-center items-center`}
                        style={{ perspective: "1500px" }}
                      >
                         <img 
                          src={
                            selectedCard.category === 'Gaming' ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800' :
                            selectedCard.category === 'Shopping' ? 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800' :
                            selectedCard.category === 'Crypto' ? 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=800' :
                            selectedCard.type === 'visa' ? 'https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=800' : 
                            selectedCard.type === 'amex' ? 'https://images.unsplash.com/photo-1613243555988-441166d4d6fd?q=80&w=800' :
                            'https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=800'
                          }
                          alt="Asset Graphic"
                          className="absolute inset-0 w-full h-full object-cover brightness-90 contrast-125 scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                        <div className="absolute inset-0 bg-black/10 mix-blend-multiply z-10"></div>

                        <div className="absolute inset-x-6 md:inset-x-10 bottom-6 md:bottom-10 flex justify-between items-end z-20">
                           <div className="flex flex-col">
                              <span className="text-[10px] md:text-sm font-bold text-white/70 tracking-widest uppercase">Available Balance</span>
                              <span className="text-3xl md:text-6xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">{selectedCard.balance}</span>
                           </div>
                           <div className="text-right">
                              <span className="text-[10px] md:text-sm font-bold text-white/50 tracking-widest uppercase">ID: {selectedCard.bin}</span>
                           </div>
                        </div>

                        {/* Card Chip */}
                        <div className="absolute top-1/2 left-6 md:left-10 -translate-y-12 md:-translate-y-16 w-12 h-10 md:w-16 md:h-14 bg-gradient-to-br from-yellow-100 via-yellow-400 to-yellow-600 rounded-md md:rounded-lg border border-yellow-700/30 overflow-hidden shadow-inner z-20">
                          <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-30">
                            {[...Array(9)].map((_, idx) => <div key={idx} className="border-[0.5px] border-black/20"></div>)}
                          </div>
                        </div>

                        {/* Brand Logo */}
                        <div className="absolute bottom-6 md:bottom-10 right-6 md:right-10">
                          <img 
                            src={
                              selectedCard.type === 'visa' ? 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' : 
                              selectedCard.type === 'amex' ? 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg' :
                              'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg'
                            } 
                            alt={selectedCard.type}
                            className="h-8 md:h-14 w-auto brightness-0 invert filter drop-shadow-lg"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="absolute top-6 md:top-10 right-6 md:right-10 text-white font-bold text-[8px] md:text-xs tracking-[0.3em] uppercase opacity-40">
                          {selectedCard.level}
                        </div>
                      </motion.div>

                      <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-2 md:gap-3 text-green-600 mb-1 md:mb-2">
                            <ShieldCheck size={16} className="md:w-5 md:h-5" />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Security</span>
                          </div>
                          <p className="text-sm md:text-lg font-bold text-gray-900 tracking-tight">VERIFIED_L3</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Scan confirmed</p>
                        </div>
                        <div className="p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-2 md:gap-3 text-blue-600 mb-1 md:mb-2">
                            <Activity size={16} className="md:w-5 md:h-5" />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Reliability</span>
                          </div>
                          <p className="text-sm md:text-lg font-bold text-gray-900 tracking-tight">STABLE_99%</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Low risk level</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Info, Price & Actions */}
                    <div className="w-full lg:w-1/2 space-y-8 md:space-y-12">
                      <div className="space-y-3 md:space-y-4">
                        <h1 className="text-3xl md:text-6xl font-black text-gray-900 tracking-tight leading-[1] md:leading-[0.9]">
                          {selectedCard.title || selectedCard.bank}
                        </h1>
                        <p className="text-sm md:text-lg text-gray-500 leading-relaxed max-w-xl">
                          Professional grade {selectedCard.category} asset at {selectedCard.level} tier. 
                          This digital commodity has been pre-verified for immediate use across compatible networks.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                        {(selectedCard.category === 'Premium' || selectedCard.category === 'Dumps') && (
                          <div className="col-span-full bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-center justify-between shadow-inner relative group">
                            <div>
                               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Target BIN Identification</p>
                               <p className="text-4xl md:text-5xl font-mono font-black text-blue-900 tracking-tighter flex items-center gap-4">
                                 {selectedCard.bin}
                                 <button 
                                   onClick={() => {
                                     navigator.clipboard.writeText(selectedCard.bin);
                                     setCopied(true);
                                     setTimeout(() => setCopied(false), 2000);
                                   }}
                                   className="p-2 bg-white rounded-xl border border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                   title="Copy BIN"
                                 >
                                   {copied ? <CheckCircle2 size={20} /> : <Layers size={20} />}
                                 </button>
                               </p>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Status</p>
                               <div className="flex items-center gap-2 text-blue-600 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-100">
                                  <Zap size={16} />
                                  <span className="text-xs uppercase">Unassigned</span>
                               </div>
                            </div>
                          </div>
                        )}
                        <DetailItem icon={<Building2 size={18} />} label="Network / Provider" value={selectedCard.bank || 'PRIVATE_PROVIDER'} tooltip="Primary issuing authority" />
                        <DetailItem icon={<User size={18} />} label="Seller / Vendor" value={selectedCard.vendor || 'Unknown'} tooltip="Verified Vendor Identity" />
                        <DetailItem icon={<Globe2 size={18} />} label="Availability" value={`${selectedCard.flag} ${selectedCard.country}`} tooltip="Region access level" />
                        <DetailItem icon={<Star size={18} />} label="Seller Rating" value={`${assetStats[selectedCard.id]?.averageRating?.toFixed(1) || '0.0'} / 5.0 (${assetStats[selectedCard.id]?.reviewCount || 0} rates)`} tooltip="Seller/Asset reliability rating" />
                      </div>

                      <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[2.5rem] border border-gray-200 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-gray-900 rotate-12 hidden md:block">
                          <ShoppingCart size={120} />
                        </div>
                        
                        <div className="relative z-10 space-y-6 md:space-y-8">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1 md:mb-2">Acquisition Price</p>
                              <p className="text-4xl md:text-7xl font-black text-gray-900">{selectedCard.price}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1 md:mb-2">Est. Value</p>
                              <p className="text-xl md:text-2xl font-bold text-green-600">{selectedCard.balance}</p>
                            </div>
                          </div>

                          {!showPayment ? (
                            <button 
                              onClick={() => setShowPayment(true)}
                              className="accent-btn w-full h-14 md:h-20 text-base md:text-lg flex items-center justify-center gap-4 shadow-2xl shadow-blue-500/20"
                            >
                              <ShoppingCart size={20} className="md:w-6 md:h-6" /> Initiating Secure Purchase
                            </button>
                          ) : (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-gray-50 border border-gray-200 p-5 md:p-8 rounded-2xl md:rounded-3xl space-y-5 md:space-y-6"
                            >
                              <div className="flex items-center gap-3 md:gap-4 text-gray-900">
                                <Bitcoin className="text-yellow-500" size={24} />
                                <div className="flex flex-col">
                                   <h3 className="font-bold text-lg md:text-xl">Payment Gateway</h3>
                                   <p className="text-[10px] text-gray-500 uppercase tracking-widest">USDT TRC20 Network</p>
                                </div>
                              </div>
                              
                              <div 
                                onClick={() => {
                                  navigator.clipboard.writeText('TBWdYpJfKHvFjtYbfYHPiUN55Yp1qN1RpZ');
                                  setCopied(true);
                                  setTimeout(() => setCopied(false), 2000);
                                }}
                                className="bg-white border border-gray-200 p-4 md:p-6 rounded-xl md:rounded-2xl flex items-center justify-between group cursor-pointer hover:border-gray-400 transition-all shadow-sm"
                              >
                                <span className="font-mono text-[10px] md:text-sm text-blue-600 break-all select-all">TBWdYpJfKHvFjtYbfYHPiUN55Yp1qN1RpZ</span>
                                <div className="shrink-0 ml-3">
                                  {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Zap size={18} className="text-gray-400 group-hover:text-gray-600" />}
                                </div>
                              </div>

                              <button 
                                onClick={() => handlePurchase(selectedCard)}
                                className="w-full py-4 md:py-5 bg-green-600 hover:bg-green-500 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all"
                              >
                                Confirm Transaction Payload
                              </button>
                              
                              <div className="flex items-center gap-3 md:gap-4 text-[10px] text-gray-500 bg-white p-3 md:p-4 rounded-xl border border-gray-200">
                                <Send size={16} className="text-blue-500 shrink-0" />
                                <p>Provide confirmation hash to <a href="https://t.me/Premium_cradit_card" target="_blank" className="text-blue-500 hover:underline">@Premium_cradit_card</a></p>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                  <div className="p-6 md:p-12 border-t border-gray-100">
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-8 uppercase flex items-center justify-between">
                       <span>Intelligence Reports</span>
                       <div className="flex items-center gap-4">
                           <span className="text-sm text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full">{reviews.length} Verified</span>
                           <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100 text-yellow-600">
                               <Star size={18} className="fill-yellow-600" />
                               <span className="text-sm font-black">{assetStats[selectedCard.id]?.averageRating?.toFixed(1) || '0.0'}</span>
                           </div>
                       </div>
                    </h3>
                    
                    {/* Review Form (Only if purchased) */}
                    {purchaseHistory.some(p => p.assetId === selectedCard.id) ? (
                      <div className="mb-12 bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                           <MessageCircle size={100} />
                        </div>
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6">Submit Execution Report</h4>
                        <form onSubmit={handleReviewSubmit} className="space-y-6 relative z-10">
                           <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Operational Rating</label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => setReviewRating(s)}
                                    className="p-2 md:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                                  >
                                    <Star size={24} className={s <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                                  </button>
                                ))}
                              </div>
                           </div>
                           <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">After-Action Report</label>
                              <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-4 md:p-5 text-sm focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-mono min-h-[120px]"
                                placeholder="Detail the execution success, stability, and operational parameters..."
                                required
                              />
                           </div>
                           <button
                             type="submit"
                             disabled={isSubmittingReview || !reviewComment.trim()}
                             className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30"
                           >
                             {isSubmittingReview ? <Loader2 className="animate-spin mx-auto" size={16} /> : <><Send size={16} /> Broadcast Signal</>}
                           </button>
                        </form>
                      </div>
                    ) : (
                      <div className="mb-12 bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-100 text-center">
                         <Lock size={32} className="mx-auto text-gray-300 mb-4" />
                         <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Execution report requires prior acquisition</p>
                      </div>
                    )}

                    {/* Review List */}
                    <div className="space-y-4 md:space-y-6">
                      {reviews.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                           <Activity size={48} className="mx-auto text-gray-200 mb-6" />
                           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No intelligence reports available</p>
                        </div>
                      ) : (
                        reviews.map((review) => (
                          <div key={review.id} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
                               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                  <User size={24} />
                               </div>
                               <div>
                                  <p className="font-black text-gray-900 uppercase">{review.userName || 'Unknown Agent'}</p>
                                  <p className="text-[10px] text-gray-400 font-mono tracking-wider">{review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Recent'}</p>
                               </div>
                               <div className="flex ml-auto bg-gray-50 px-3 py-2 rounded-xl">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      size={14} 
                                      className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} 
                                    />
                                  ))}
                               </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium italic">"{review.comment}"</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                {/* Footer Spacer */}
                <div className="h-32"></div>
              </motion.div>
            )}
          </AnimatePresence>

           {/* Moderation Modal logic removed */}
          
          {/* Notifications Modal */}
          <AnimatePresence>
            {showNotifications && (
              <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowNotifications(false)}
                  className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
                >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50">
                    <div className="flex items-center gap-3">
                      <Bell className="text-blue-600" size={24} />
                      <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Notifications</h2>
                    </div>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-900">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gray-50/50">
                    {notifications.length === 0 ? (
                      <div className="text-center py-20 text-gray-400">
                        <MessageCircle size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="font-bold text-xs uppercase tracking-widest">System Clear</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => markNotificationRead(notif.id!)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            notif.read 
                              ? 'bg-white border-gray-100 opacity-60' 
                              : 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100'
                          }`}
                        >
                           <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                 {notif.type === 'price_drop' && <Tag size={12} className="text-green-500" />}
                                 {notif.type === 'new_listing' && <Zap size={12} className="text-blue-500" />}
                                 {notif.type === 'system' && <ShieldCheck size={12} className="text-purple-500" />}
                                 <p className="text-[10px] font-black text-gray-900 uppercase">{notif.title}</p>
                              </div>
                              {!notif.read && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                           </div>
                           <p className="text-xs text-gray-600 leading-relaxed mb-3">{notif.message}</p>
                           <div className="flex justify-between items-center">
                              <span className="text-[8px] text-gray-400 font-mono">
                                 {notif.timestamp?.toDate ? notif.timestamp.toDate().toLocaleString() : 'Just now'}
                              </span>
                              {!notif.read && (
                                <span className="text-[8px] text-blue-600 font-black uppercase tracking-widest">New</span>
                              )}
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Profile Modal */}
          <AnimatePresence>
            {showProfile && (
              <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowProfile(false)}
                  className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <User size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Account Overview</h2>
                        <p className="text-[10px] text-gray-400 font-mono">UID: {auth.currentUser?.uid || 'ANONYMOUS_SESSION'}</p>
                      </div>
                    </div>
                    <button onClick={() => setShowProfile(false)} className="text-gray-400 hover:text-gray-900">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 custom-scrollbar">
                    {/* Left Column: Stats & Info */}
                    <div className="space-y-4 md:space-y-6">
                      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-xl">
                        <p className="text-[10px] md:text-xs font-bold uppercase opacity-60 mb-1">Available Credits</p>
                        <p className="text-2xl md:text-3xl font-black">{formatBalance(currentBalance)}</p>
                        <button 
                          onClick={() => { setShowProfile(false); setShowDeposit(true); }}
                          className="mt-4 w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                          Top up balance
                        </button>
                      </div>

                      <div className="space-y-3 md:space-y-4">
                        <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest px-2">Account Security</h3>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                           <div className="flex justify-between items-center px-1">
                              <span className="text-[9px] font-bold text-gray-500 uppercase">Status</span>
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[8px] font-black rounded uppercase">Active</span>
                           </div>
                           <div className="flex justify-between items-center px-1">
                              <span className="text-[9px] font-bold text-gray-500 uppercase">Verification</span>
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black rounded uppercase">Standard</span>
                           </div>
                           <div className="flex justify-between items-center px-1">
                              <span className="text-[9px] font-bold text-gray-500 uppercase">Rank</span>
                              <button 
                                onClick={() => {
                                  const nextValue = !isAdmin;
                                  setIsAdmin(nextValue);
                                  if (nextValue) {
                                    setActiveProfileTab('moderation');
                                  } else {
                                    setActiveProfileTab('purchases');
                                  }
                                }}
                                className={`px-2 py-0.5 text-[8px] font-black rounded uppercase transition-all tracking-wider ${
                                  isAdmin 
                                    ? 'bg-purple-600 text-white shadow-sm hover:bg-purple-700' 
                                    : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                                }`}
                                title="Click to toggle system rank for testing moderation panels"
                              >
                                {isAdmin ? 'MOD (DEMO ACTIVE)' : 'CLIENT (CLICK MOD)'}
                              </button>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Column: Tabbed Content */}
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl md:rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar">
                        {[
                          { id: 'purchases', label: 'Purchases', icon: <History size={12} /> },
                          { id: 'deposits', label: 'Deposits', icon: <CreditCard size={12} /> },
                          { id: 'saved', label: 'Saved', icon: <Bookmark size={12} /> },
                          { id: 'alerts', label: 'Alerts', icon: <Bell size={12} /> },
                          ...(isAdmin ? [{ id: 'moderation', label: 'Moderation', icon: <ShieldCheck size={12} /> }] : [])
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveProfileTab(tab.id as any)}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase whitespace-nowrap transition-all ${
                              activeProfileTab === tab.id 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {tab.icon}
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {activeProfileTab === 'purchases' && (
                        <div className="space-y-3 md:space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs md:text-sm font-black text-gray-900 uppercase tracking-widest">
                              Recent Journals
                            </h3>
                            <span className="text-[9px] font-bold text-gray-400">{purchaseHistory.length}</span>
                          </div>

                          <div className="space-y-3">
                            {purchaseHistory.length === 0 ? (
                              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                 <Package size={24} className="mx-auto mb-2 opacity-10" />
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No transaction data</p>
                              </div>
                            ) : (
                              purchaseHistory.map((p) => {
                                const isExpanded = expandedPurchaseId === p.id;
                                const details = getDeterministicCardDetails(p.id || '', p.assetTitle);
                                const isPremiumCard = true;
                                
                                const expMonth = details.expiryDate.split('/')[0];
                                const expYear = details.expiryDate.split('/')[1];
                                const cvv = details.cvc;
                                
                                const mockUsername = details.cardholderName;
                                const mockEmail = details.email;
                                const mockNumber = details.cardNumber;
                                const mockZip = details.postalCode;
                                const mockAddress = details.address;

                                return (
                                <div key={p.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                                  <div 
                                    className="p-3 md:p-4 flex justify-between items-center cursor-pointer"
                                    onClick={() => setExpandedPurchaseId(isExpanded ? null : (p.id || null))}
                                  >
                                     <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 font-bold text-[8px] border border-green-100 shrink-0">
                                           OK
                                        </div>
                                        <div className="max-w-[150px] sm:max-w-none">
                                           <p className="text-[11px] font-black text-gray-900 uppercase truncate">{p.assetTitle}</p>
                                           <p className="text-[7px] md:text-[8px] text-gray-400 font-mono">{p.timestamp?.toDate ? p.timestamp.toDate().toLocaleDateString() : 'Processing'}</p>
                                        </div>
                                     </div>
                                     <div className="text-right flex items-center gap-4">
                                        <div>
                                          <p className="text-xs md:text-sm font-black text-gray-900">{p.price}</p>
                                          <p className="text-[7px] text-green-600 font-black uppercase">Finalized</p>
                                        </div>
                                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                     </div>
                                  </div>

                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-gray-50 bg-gray-50/50"
                                      >
                                        <div className="p-4 md:p-6 space-y-4">
                                          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                              <Lock size={12} /> Confidential Details Unlocked
                                            </h4>
                                            <span className="text-[8px] font-mono text-gray-500 bg-gray-200 px-2 py-0.5 rounded">ID: {p.id?.substring(0, 8)}</span>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Card holder name</p>
                                              <p className="text-xs font-mono font-medium text-gray-900 bg-white p-2 border border-gray-200 rounded select-all">{mockUsername}</p>
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Email Associated</p>
                                              <p className="text-xs font-mono font-medium text-gray-900 bg-white p-2 border border-gray-200 rounded select-all">{mockEmail}</p>
                                            </div>
                                            
                                            {isPremiumCard && (
                                              <>
                                                <div className="space-y-1 col-span-1 md:col-span-2">
                                                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Card Number</p>
                                                  <p className="text-sm font-mono font-black text-gray-900 bg-white p-3 border border-gray-200 rounded select-all tracking-wider text-center">{mockNumber}</p>
                                                </div>
                                                <div className="space-y-1">
                                                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Expiry date</p>
                                                  <p className="text-xs font-mono font-medium text-gray-900 bg-white p-2 border border-gray-200 rounded select-all">{expMonth}/{expYear}</p>
                                                </div>
                                                <div className="space-y-1">
                                                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">CVC</p>
                                                  <p className="text-xs font-mono font-medium text-gray-900 bg-white p-2 border border-gray-200 rounded select-all">{cvv}</p>
                                                </div>
                                              </>
                                            )}

                                            <div className="space-y-1 col-span-1 md:col-span-2">
                                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Address</p>
                                              <p className="text-xs font-mono font-medium text-gray-900 bg-white p-2 border border-gray-200 rounded select-all">{mockAddress}</p>
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Postal code</p>
                                              <p className="text-xs font-mono font-medium text-gray-900 bg-white p-2 border border-gray-200 rounded select-all">{mockZip}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })
                          )}
                          </div>
                        </div>
                      )}

                      {activeProfileTab === 'deposits' && (
                        <div className="space-y-3 md:space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs md:text-sm font-black text-gray-900 uppercase tracking-widest">
                              Vault History
                            </h3>
                          </div>

                          <div className="space-y-3">
                            {depositHistory.length === 0 ? (
                              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                 <Wallet size={24} className="mx-auto mb-2 opacity-10" />
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Empty vault</p>
                              </div>
                            ) : (
                              depositHistory.map((d) => (
                                <div key={d.id} className="p-3 md:p-4 bg-white border border-gray-100 rounded-xl flex justify-between items-center shadow-sm">
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[8px] border border-blue-100">
                                         CRY
                                      </div>
                                      <div>
                                         <p className="text-[11px] font-black text-gray-900 uppercase">{d.amount}</p>
                                         <p className="text-[7px] text-gray-400 font-mono uppercase tracking-tighter">{d.paymentMethod} {d.txId ? `| TX: ${d.txId.substring(0, 8)}...` : ''} | {d.timestamp?.toDate ? d.timestamp.toDate().toLocaleDateString() : 'Processing'}</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <span className={`px-2 py-0.5 text-[7px] font-black rounded uppercase ${(d.status === 'completed' || d.status === 'approved') ? 'bg-green-100 text-green-700' : (d.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}`}>{d.status}</span>
                                   </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {activeProfileTab === 'saved' && (
                        <div className="space-y-3 md:space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs md:text-sm font-black text-gray-900 uppercase tracking-widest">
                              Intelligence Wishlist
                            </h3>
                            <span className="text-[9px] font-bold text-gray-400">{savedAssets.length}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {savedAssets.length === 0 ? (
                              <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                 <Heart size={24} className="mx-auto mb-2 opacity-10" />
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No assets saved</p>
                              </div>
                            ) : (
                              savedAssets.map((s) => {
                                const asset = marketData.find(m => m.id === s.assetId);
                                return (
                                  <div key={s.id} className="p-2 sm:p-3 bg-white border border-gray-100 rounded-xl flex items-center gap-3 shadow-sm group">
                                     <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                        <img 
                                          src={asset?.category === 'Gaming' ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400' : 'https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=400'} 
                                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                          alt="Saved Asset"
                                        />
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <p className="text-[9px] md:text-[10px] font-black text-gray-900 uppercase truncate">{asset?.title || asset?.bank || 'ASSET'}</p>
                                        <p className="text-[7px] md:text-[8px] text-blue-600 font-bold uppercase tracking-widest">{asset?.price || '$ 0.00'}</p>
                                     </div>
                                     <div className="flex items-center gap-1">
                                        <button 
                                          onClick={() => { setSelectedCardId(s.assetId); setShowProfile(false); }}
                                          className="p-1 px-2 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                           <Search size={14} />
                                        </button>
                                        <button 
                                          onClick={() => handleToggleSave(s.assetId)}
                                          className="p-1 px-2 text-red-300 hover:text-red-600 transition-colors"
                                        >
                                           <X size={14} />
                                        </button>
                                     </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}

                      {activeProfileTab === 'alerts' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs md:text-sm font-black text-gray-900 uppercase tracking-widest">
                              Active Price Alerts
                            </h3>
                            <span className="text-[9px] font-bold text-gray-400">{priceAlerts.length}</span>
                          </div>

                          <div className="space-y-3">
                            {priceAlerts.length === 0 ? (
                              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                 <Bell size={24} className="mx-auto mb-2 opacity-10" />
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No active alerts</p>
                              </div>
                            ) : (
                              priceAlerts.map((alert) => {
                                const asset = marketData.find(m => m.id === alert.assetId);
                                return (
                                  <div key={alert.id} className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center shadow-sm">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <BellRing size={16} />
                                      </div>
                                      <div>
                                        <p className="text-sm font-black text-gray-900 uppercase">{asset?.title || asset?.bank || 'Unknown Asset'}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Trigger below ${alert.threshold}</p>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => handleDeletePriceAlert(alert.id!)}
                                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}

                      {activeProfileTab === 'moderation' && (
                        <div className="space-y-6">
                          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                            <h3 className="text-xs md:text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                              <ShieldCheck className="text-purple-600 animate-pulse" size={16} /> 
                              System Moderation Portal
                            </h3>
                            <span className="text-[9px] font-bold text-gray-400 font-mono">SECURE DEV CONSOLE</span>
                          </div>

                          {/* Section A: Pending Deposits */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Pending Deposits Verification ({pendingDeposits.length})</span>
                            </div>
                            
                            {pendingDeposits.length === 0 ? (
                              <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                <CheckCircle2 size={24} className="mx-auto mb-2 text-green-500 opacity-60" />
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">All deposits processed</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {pendingDeposits.map((d) => (
                                  <div key={d.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-gray-900">{d.amount}</span>
                                        <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-600 border border-yellow-100 text-[8px] font-black rounded uppercase">{d.status}</span>
                                      </div>
                                      <div className="grid grid-cols-1 gap-0.5 text-[9px] font-mono text-gray-400">
                                        <p>METHOD: {d.paymentMethod}</p>
                                        <p className="truncate max-w-[200px]">TXID: {d.txId}</p>
                                        <p>UID: {d.userId?.substring(0, 10)}...</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        onClick={() => handleModerateDeposit(d.id!, 'completed')}
                                        className="flex-grow sm:flex-none px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleModerateDeposit(d.id!, 'rejected')}
                                        className="flex-grow sm:flex-none px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Section B: Reviews Moderation */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Pending App Reviews ({pendingReviews.length})</span>
                            </div>

                            {pendingReviews.length === 0 ? (
                              <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                <CheckCircle2 size={24} className="mx-auto mb-2 text-green-500 opacity-60" />
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">All reviews moderated</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {pendingReviews.map((r) => (
                                  <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                                    <div className="flex justify-between items-start gap-4">
                                      <div className="space-y-0.5">
                                        <p className="text-[10px] font-black text-gray-900 uppercase">{r.userName || 'Anonymous'}</p>
                                        <div className="flex gap-0.5 text-amber-400">
                                          {Array.from({ length: r.rating }).map((_, i) => (
                                            <Star key={i} size={8} fill="currentColor" />
                                          ))}
                                        </div>
                                      </div>
                                      <span className="text-[8px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase font-bold">Asset ID: {r.assetId?.substring(0, 8)}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 font-mono italic">"{r.comment}"</p>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleModerate(r.id!, 'approved')}
                                        className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleModerate(r.id!, 'rejected')}
                                        className="flex-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Status Bar */}
          <div className="mt-auto bg-white border-t border-gray-200 p-2 md:p-3 flex justify-between items-center text-[8px] md:text-[10px] text-gray-400 tracking-widest rounded-b-lg shadow-inner">
            <div className="flex items-center">
              <span className="animate-pulse inline-block w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full mr-1.5 md:mr-2"></span>
              SYSTEM_STATUS: ONLINE <span className="hidden xs:inline">// ENCRYPTED_TUNNEL_ACTIVE</span>
            </div>
            <div className="hidden sm:block font-mono">
              LATENCY: 18ms // SERVER: EU_WEST_4 // SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}
            </div>
          </div>

          {/* Floating Support Button */}
          <motion.a
            href="https://t.me/Premium_cradit_card"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] bg-blue-600 text-white p-4 rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center group"
          >
            <Send size={24} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-3 transition-all duration-300 font-bold text-sm whitespace-nowrap">
              CONTACT SUPPORT
            </span>
          </motion.a>

          {/* Price Alert Set Modal */}
          <AnimatePresence>
            {showAlertModal && (
              <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAlertModal(false)}
                  className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
                    <div className="flex items-center gap-3">
                      <BellRing size={20} />
                      <h2 className="text-lg font-black uppercase tracking-tight">Set Price Alert</h2>
                    </div>
                    <button onClick={() => setShowAlertModal(false)} className="text-white/70 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Trigger Price Threshold</p>
                       <div className="relative">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400">$</span>
                          <input 
                            type="number" 
                            value={alertThreshold}
                            onChange={(e) => setAlertThreshold(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-6 px-12 text-3xl font-black text-center focus:border-blue-600 focus:bg-white outline-none transition-all"
                            placeholder="0.00"
                            step="0.01"
                            autoFocus
                          />
                       </div>
                       <p className="text-[9px] text-gray-400 text-center px-4">
                          You will receive a terminal notification as soon as this asset's market value drops below the specified amount.
                       </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 italic text-[10px] text-blue-600 text-center font-bold">
                       "Alerts are processed in real-time by our low-latency monitoring engine."
                    </div>

                    <div className="flex gap-3">
                       <button 
                         onClick={() => setShowAlertModal(false)}
                         className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                       >
                         Cancel
                       </button>
                       <button 
                         onClick={handleAddPriceAlert}
                         disabled={isSubmittingAlert || !alertThreshold}
                         className="flex-3 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
                       >
                         {isSubmittingAlert ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                         Activate Alert
                       </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Deposit Modal */}
          <AnimatePresence>
            {showDeposit && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowDeposit(false)}
                  className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
                >
                  <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">Add Funds</h2>
                      <button onClick={() => setShowDeposit(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                        <X size={20} className="md:w-6 md:h-6" />
                      </button>
                    </div>

                    <div className="p-4 md:p-6 bg-blue-50 border border-blue-100 rounded-2xl space-y-3 md:space-y-4">
                      <div className="flex items-center gap-2 md:gap-3 text-blue-700">
                        <Wallet size={20} className="md:w-6 md:h-6" />
                        <h3 className="font-bold text-sm md:text-base">USDT (TRC20) Deposit</h3>
                      </div>
                      <p className="text-[10px] md:text-xs text-blue-800 leading-relaxed">
                        To top up your account balance, please send USDT (TRC20) to the address below.
                        <br/>
                        <span className="font-bold">Minimum deposit: $30.00</span>
                      </p>
                      <div 
                        onClick={() => {
                          navigator.clipboard.writeText('TBWdYpJfKHvFjtYbfYHPiUN55Yp1qN1RpZ');
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="bg-white p-3 md:p-4 rounded-xl border border-blue-200 font-mono text-[10px] md:text-xs break-all select-all cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between group relative overflow-hidden"
                      >
                        <span className="text-gray-900 font-bold truncate mr-2">TBWdYpJfKHvFjtYbfYHPiUN55Yp1qN1RpZ</span>
                        <div className="flex items-center gap-1 md:gap-2 shrink-0">
                          <span className="text-[7px] md:text-[8px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            {copied ? 'COPIED!' : 'COPY'}
                          </span>
                          <Zap size={12} className={`${copied ? 'text-yellow-500 scale-125' : 'text-blue-500'} transition-all md:w-3.5 md:h-3.5`} />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 md:p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-2 md:gap-3">
                      <AlertTriangle size={18} className="text-yellow-600 shrink-0 md:w-5 md:h-5" />
                      <div className="space-y-1 md:space-y-2">
                        <p className="text-[8px] md:text-[10px] text-yellow-800 font-bold uppercase tracking-widest">Verification Protocol</p>
                        <p className="text-[8px] md:text-[10px] text-yellow-700 leading-relaxed">
                          Please provide payment confirmation to <a href="https://t.me/Premium_cradit_card" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">@Premium_cradit_card</a> or submit your Transaction ID below.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="number"
                        placeholder="Deposit Amount (USD)"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-600 transition-all shadow-sm"
                      />
                      <input
                        type="text"
                        placeholder="Transaction Hash (TxID)"
                        value={depositTxId}
                        onChange={(e) => setDepositTxId(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-600 transition-all shadow-sm"
                      />
                    </div>

                    <button 
                      onClick={handleDeposit}
                      disabled={isSubmittingDeposit}
                      className="w-full py-3 md:py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all uppercase tracking-widest text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingDeposit ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'I HAVE SENT PAYMENT'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Decrypted Card Details Successful Purchase Modal Overlay */}
          <AnimatePresence>
            {showCardDetailsPage && purchasedCardDetails && (
              <div id="decrypted-card-details-modal" className="fixed inset-0 z-[500] flex items-center justify-center p-4 overflow-y-auto">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/85 backdrop-blur-xl"
                  onClick={() => setShowCardDetailsPage(false)}
                />
                
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 30 }}
                  type="button"
                  className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden text-slate-100 z-10 my-8"
                >
                  {/* Neon Cyber Decor Lines */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                  
                  <div className="p-6 md:p-10 space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-green-400">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em]">DECRYPTION PHASE: SECURE</p>
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-white">INTELLIGENCE UNLOCKED</h2>
                      </div>
                      <button 
                        onClick={() => setShowCardDetailsPage(false)}
                        className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full flex items-center justify-center transition-all"
                        title="Close Overlay"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Realistic Physical Card Widget */}
                    <div className="relative w-full max-w-sm h-52 md:h-56 mx-auto rounded-2xl p-6 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border border-slate-805 shadow-2xl overflow-hidden flex flex-col justify-between text-white font-mono select-none hover:scale-[1.02] transition-all group duration-300">
                      {/* Grid background effect */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 pointer-events-none" />
                      
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <p className="text-[9px] font-black tracking-[0.25em] text-slate-400 uppercase">PREMIUM ASSET</p>
                          <p className="text-xs font-bold font-sans text-indigo-400 mt-0.5 truncate max-w-[180px]">{purchasedCardDetails.assetTitle}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">CLASS I</p>
                        </div>
                      </div>

                      {/* Golden Chip */}
                      <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 border border-amber-600/55 shadow-inner relative z-10 self-start mt-2">
                        <div className="absolute inset-x-2 inset-y-1.5 border border-amber-800/30 rounded opacity-50" />
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-amber-800/30" />
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-amber-800/30" />
                      </div>

                      {/* Card Number */}
                      <div className="relative z-10 mt-3">
                        <p className="text-lg md:text-xl font-bold font-mono tracking-[0.18em] text-white bg-slate-950/40 p-2 rounded border border-slate-800/50 text-center select-all shrink-0">
                          {purchasedCardDetails.cardNumber}
                        </p>
                      </div>

                      <div className="flex justify-between items-end relative z-10 mt-2">
                        <div>
                          <p className="text-[7px] text-slate-500 uppercase tracking-widest leading-none">Cardholder Name</p>
                          <p className="text-xs font-medium uppercase font-mono tracking-wider text-slate-200 truncate max-w-[160px]">{purchasedCardDetails.cardholderName}</p>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-[7px] text-slate-500 uppercase tracking-widest leading-none">VALID THRU</p>
                            <p className="text-xs font-medium font-mono text-slate-200">{purchasedCardDetails.expiryDate}</p>
                          </div>
                          <div>
                            <p className="text-[7px] text-slate-500 uppercase tracking-widest leading-none">CVC / CVV</p>
                            <p className="text-xs font-bold font-mono text-green-400">{purchasedCardDetails.cvc}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Copyable Data Grid List */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">RECOVERED ATTRIBUTES</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono">ID: {purchasedCardDetails.id}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Card Holder Name */}
                        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center group transition-all hover:bg-slate-950/80">
                          <div>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">Cardholder Name</span>
                            <p className="text-xs font-mono font-medium text-white">{purchasedCardDetails.cardholderName}</p>
                          </div>
                          <button 
                            onClick={() => handleCopyText('name', purchasedCardDetails.cardholderName)}
                            className="w-8 h-8 bg-slate-800/60 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-all hover:bg-slate-800"
                            title="Copy Cardholder Name"
                          >
                            {copiedField === 'name' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          </button>
                        </div>

                        {/* Card Number */}
                        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center group transition-all hover:bg-slate-950/80 col-span-1 md:col-span-2">
                          <div>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">Card Number</span>
                            <p className="text-sm font-mono font-black text-white tracking-widest">{purchasedCardDetails.cardNumber}</p>
                          </div>
                          <button 
                            onClick={() => handleCopyText('number', purchasedCardDetails.cardNumber)}
                            className="w-8 h-8 bg-slate-800/60 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-all hover:bg-slate-800"
                            title="Copy Card Number"
                          >
                            {copiedField === 'number' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          </button>
                        </div>

                        {/* Expiry Date */}
                        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center group transition-all hover:bg-slate-950/80">
                          <div>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">Expiry Date</span>
                            <p className="text-xs font-mono font-medium text-white">{purchasedCardDetails.expiryDate}</p>
                          </div>
                          <button 
                            onClick={() => handleCopyText('expiry', purchasedCardDetails.expiryDate)}
                            className="w-8 h-8 bg-slate-800/60 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-all hover:bg-slate-800"
                            title="Copy Expiry Date"
                          >
                            {copiedField === 'expiry' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          </button>
                        </div>

                        {/* CVC */}
                        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center group transition-all hover:bg-slate-950/80">
                          <div>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">CVC / CVV</span>
                            <p className="text-xs font-mono font-medium text-white">{purchasedCardDetails.cvc}</p>
                          </div>
                          <button 
                            onClick={() => handleCopyText('cvc', purchasedCardDetails.cvc)}
                            className="w-8 h-8 bg-slate-800/60 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-all hover:bg-slate-800"
                            title="Copy CVC"
                          >
                            {copiedField === 'cvc' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          </button>
                        </div>

                        {/* Address */}
                        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center group transition-all hover:bg-slate-950/80 col-span-1 md:col-span-2">
                          <div>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">Billing Address</span>
                            <p className="text-xs font-mono font-medium text-white leading-tight">{purchasedCardDetails.address}</p>
                          </div>
                          <button 
                            onClick={() => handleCopyText('address', purchasedCardDetails.address)}
                            className="w-8 h-8 bg-slate-800/60 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-all hover:bg-slate-800"
                            title="Copy Address"
                          >
                            {copiedField === 'address' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          </button>
                        </div>

                        {/* Postal Code */}
                        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center group transition-all hover:bg-slate-950/80">
                          <div>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">Postal / ZIP Code</span>
                            <p className="text-xs font-mono font-medium text-white">{purchasedCardDetails.postalCode}</p>
                          </div>
                          <button 
                            onClick={() => handleCopyText('postal', purchasedCardDetails.postalCode)}
                            className="w-8 h-8 bg-slate-800/60 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-all hover:bg-slate-800"
                            title="Copy Postal Code"
                          >
                            {copiedField === 'postal' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          </button>
                        </div>

                        {/* Associated Email */}
                        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center group transition-all hover:bg-slate-950/80">
                          <div>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">Email Associated</span>
                            <p className="text-xs font-mono font-medium text-white">{purchasedCardDetails.email}</p>
                          </div>
                          <button 
                            onClick={() => handleCopyText('email', purchasedCardDetails.email)}
                            className="w-8 h-8 bg-slate-800/60 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-all hover:bg-slate-800"
                            title="Copy Associated Email"
                          >
                            {copiedField === 'email' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Consolidated Block Area ("All") */}
                    <div className="space-y-3">
                      <span className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">ALL CREDENTIALS TEXT BLOCK</span>
                      <div className="relative">
                        <textarea
                          readOnly
                          rows={6}
                          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-300 focus:outline-none resize-none select-all"
                          value={`Asset: ${purchasedCardDetails.assetTitle}
Cardholder Name: ${purchasedCardDetails.cardholderName}
Card Number: ${purchasedCardDetails.cardNumber}
Expiry Date: ${purchasedCardDetails.expiryDate}
CVC/CVV: ${purchasedCardDetails.cvc}
Address: ${purchasedCardDetails.address}
Postal Code: ${purchasedCardDetails.postalCode}
Email Associated: ${purchasedCardDetails.email}
Purchase Ref ID: ${purchasedCardDetails.id}`}
                        />
                        <div className="absolute bottom-3 right-3 flex gap-2">
                          {/* Save as .txt File Download Button */}
                          <button
                            onClick={() => {
                              const text = `Asset: ${purchasedCardDetails.assetTitle}\nCardholder Name: ${purchasedCardDetails.cardholderName}\nCard Number: ${purchasedCardDetails.cardNumber}\nExpiry Date: ${purchasedCardDetails.expiryDate}\nCVC/CVV: ${purchasedCardDetails.cvc}\nAddress: ${purchasedCardDetails.address}\nPostal Code: ${purchasedCardDetails.postalCode}\nEmail Associated: ${purchasedCardDetails.email}\nPurchase Ref ID: ${purchasedCardDetails.id}`;
                              const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
                              const element = document.createElement("a");
                              element.href = URL.createObjectURL(file);
                              element.download = `CC-Credentials-${purchasedCardDetails.id.substring(0, 8)}.txt`;
                              document.body.appendChild(element);
                              element.click();
                              document.body.removeChild(element);
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border border-slate-700/50"
                            title="Download Credentials Text File"
                          >
                            <Download size={12} /> Download .txt
                          </button>

                          {/* Copy All Button */}
                          <button
                            onClick={() => {
                              const text = `Asset: ${purchasedCardDetails.assetTitle}\nCardholder Name: ${purchasedCardDetails.cardholderName}\nCard Number: ${purchasedCardDetails.cardNumber}\nExpiry Date: ${purchasedCardDetails.expiryDate}\nCVC/CVV: ${purchasedCardDetails.cvc}\nAddress: ${purchasedCardDetails.address}\nPostal Code: ${purchasedCardDetails.postalCode}\nEmail Associated: ${purchasedCardDetails.email}\nPurchase Ref ID: ${purchasedCardDetails.id}`;
                              handleCopyText('all', text);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/15"
                            title="Copy All Credentials"
                          >
                            {copiedField === 'all' ? (
                              <><Check size={12} className="text-green-400" /> Copied!</>
                            ) : (
                              <><Copy size={12} /> Copy All</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2">
                      <button 
                        onClick={() => setShowCardDetailsPage(false)}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <ShieldCheck size={16} /> Return to Terminal
                      </button>
                      <p className="text-[9px] text-center text-slate-500 uppercase tracking-widest mt-3">
                        Locked and encrypted in your profile journal for infinite retrieval
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Purchase Confirmation Modal */}
          <AnimatePresence>
            {showPurchaseConfirmation && pendingPurchaseAsset && (
              <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 30 }}
                  className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
                >
                  <div className="p-8 md:p-12 space-y-8">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Confirm Acquisition</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Transaction Review Phase</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                        <ShieldCheck size={28} />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
                      <div className="flex justify-between items-start border-b border-gray-200 pb-6">
                        <div className="space-y-2 max-w-[65%]">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Details</p>
                           <h3 className="text-xl font-black text-gray-900 uppercase leading-tight truncate">{pendingPurchaseAsset.title || pendingPurchaseAsset.bank}</h3>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{pendingPurchaseAsset.category} // {pendingPurchaseAsset.level} Tier</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price</p>
                           <p className="text-2xl font-black text-blue-600">{pendingPurchaseAsset.price}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                          <span className="text-[10px] font-bold text-gray-400">TRANSACTION_ID</span>
                          <span className="text-[11px] font-mono font-black text-gray-900 tracking-wider">{currentTxId}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                          <span className="text-[10px] font-bold text-gray-400">EST_DELIVERY</span>
                          <div className="flex items-center gap-2">
                             <span className="animate-pulse w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                             <span className="text-[10px] font-black text-green-600 uppercase">Instant Access</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={finalizePurchase}
                        disabled={isFinalizingPurchase}
                        className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-[11px] md:text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isFinalizingPurchase ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Authorize Transaction</>}
                      </button>
                      <button 
                        onClick={() => setShowPurchaseConfirmation(false)}
                        disabled={isFinalizingPurchase}
                        className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors py-2"
                      >
                        Abort Acquisition
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900 bg-gray-50 flex flex-col items-center justify-center relative p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-400 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 md:mb-12 text-center relative z-10"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl border border-gray-100 mb-6">
          <Globe className="text-blue-600 w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 uppercase">
          Nexus Market
        </h1>
        <p className="text-gray-500 mt-2 font-medium">Access Restricted Area</p>
      </motion.div>

      <div className={`w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl transition-all duration-500 border border-gray-100 relative z-10 ${isLoading ? 'scale-[0.98] opacity-90' : 'scale-100'}`}>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 bg-red-50 text-red-600 px-5 py-4 rounded-2xl text-sm flex items-center border border-red-100"
          >
            <ShieldAlert size={20} className="mr-3 shrink-0" />
            <span className="font-bold">{error}</span>
          </motion.div>
        )}

        <div className="space-y-8">
          {/* Form Header */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
              {isForgotPassword ? 'Reset Access' : isRegistering ? 'Create Profile' : 'Authenticate'}
            </h2>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">
              {isForgotPassword ? 'Identity recovery phase' : isRegistering ? 'New operative enrollment' : 'Authorized Personnel Only'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleEmailAuth}>
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <User size={20} />
                </div>
                <input 
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 text-sm focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-gray-900 font-medium placeholder:text-gray-400"
                  required
                />
              </div>

              {!isForgotPassword && (
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type="password"
                    placeholder="Security Credential"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 text-sm focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all text-gray-900 font-medium placeholder:text-gray-400"
                    required
                  />
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-blue-600/40 transform active:scale-[0.98]'}`}
            >
              {isLoading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>{isForgotPassword ? <Send size={18} /> : <Terminal size={18} />} {isForgotPassword ? 'Send Link' : isRegistering ? 'Register' : 'Access System'}</>
              )}
            </button>
          </form>

          {/* Forgot Password Toggle */}
          {!isRegistering && (
            <div className="text-center">
              <button 
                onClick={() => setIsForgotPassword(!isForgotPassword)}
                className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                {isForgotPassword ? 'Return to Login' : 'Credential Recovery'}
              </button>
            </div>
          )}

          <div className="relative h-px bg-gray-100 w-full">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
              OR
            </span>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={`w-full bg-white border border-gray-100 text-gray-900 h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-sm flex items-center justify-center gap-3 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-200 transform active:scale-[0.98]'}`}
          >
            <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign In with Google
          </button>

          <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">
            {isRegistering ? 'Already in the system?' : 'Need new credentials?'} 
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setIsForgotPassword(false);
              }}
              className="ml-2 text-blue-600 hover:underline"
            >
              {isRegistering ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-50 text-center">
            <div className="flex justify-center gap-3 opacity-30 grayscale mb-4">
                <ShieldCheck size={16} />
                <Lock size={16} />
                <Wifi size={16} />
            </div>
            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
              Secured via 256-bit Firebase Auth
            </p>
        </div>
      </div>
    </div>
  );
}
