import React, { useState, useRef } from 'react';
import { AlertTriangle, Skull, Lock, Terminal, ShieldAlert, LogOut, Loader2, ShoppingCart, Star, Cpu, Radio, HardDrive, Wifi, Globe, Server, Activity, ShieldCheck, Zap, X, CreditCard, Info, MapPin, Building2, Calendar, CheckCircle2, MessageCircle, Send, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{label}</p>
      <p className="text-sm font-bold text-gray-900 leading-tight">{value}</p>
    </div>
  </div>
);

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);

  // Dynamic effects state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [shake, setShake] = useState(false);
  const [copied, setCopied] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 200);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShake(false);

    // Simulate network delay
    setTimeout(() => {
      if (username === 'admin' && password === 'override') {
        setIsLoggedIn(true);
        setError('');
      } else {
        setError('ERR_ACCESS_DENIED // INVALID CREDENTIALS');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setError('');
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
        <div className="absolute inset-0 z-0 bg-[#fdfbe9]"></div>
        {/* Credit Card Background Image - Collage Style */}
        <div 
          className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat opacity-50 contrast-125"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1589750670744-dc9644739949?q=80&w=2070&auto=format&fit=crop")',
          }}
        ></div>

        {/* Floating Individual Cards */}
        <div className="absolute inset-0 z-15 overflow-hidden pointer-events-none">
          {[
            { id: 1, src: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=400&auto=format&fit=crop', top: '10%', left: '5%', rotate: -15, delay: 0, mobile: true },
            { id: 2, src: 'https://images.unsplash.com/photo-1613243555988-441166d4d6fd?q=80&w=400&auto=format&fit=crop', top: '60%', left: '2%', rotate: 10, delay: 2, mobile: false },
            { id: 3, src: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=400&auto=format&fit=crop', top: '15%', left: '85%', rotate: 20, delay: 1, mobile: true },
            { id: 4, src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400&auto=format&fit=crop', top: '70%', left: '80%', rotate: -10, delay: 3, mobile: false },
            { id: 5, src: 'https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=400&auto=format&fit=crop', top: '40%', left: '90%', rotate: -5, delay: 4, mobile: true },
            { id: 6, src: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=400&auto=format&fit=crop', top: '85%', left: '40%', rotate: 5, delay: 5, mobile: false },
            { id: 7, src: 'https://images.unsplash.com/photo-1613243555988-441166d4d6fd?q=80&w=400&auto=format&fit=crop', top: '5%', left: '45%', rotate: -8, delay: 1.5, mobile: true },
          ].map((card) => (
            <motion.div
              key={card.id}
              initial={{ y: 0, opacity: 0 }}
              animate={{ 
                y: [0, -30, 0],
                opacity: 0.4,
                rotate: [card.rotate, card.rotate + 8, card.rotate]
              }}
              transition={{ 
                duration: 8 + card.id, 
                repeat: Infinity, 
                delay: card.delay,
                ease: "easeInOut" 
              }}
              className={`absolute w-32 md:w-56 h-20 md:h-36 rounded-xl md:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20 ${card.mobile ? 'block' : 'hidden md:block'}`}
              style={{ top: card.top, left: card.left }}
            >
              <img 
                src={card.src} 
                alt="Card" 
                className="w-full h-full object-cover grayscale-[0.2] contrast-125"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          ))}
        </div>

        <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[1px]"></div>
        
        <div 
          className={`absolute inset-0 z-40 bg-[linear-gradient(rgba(16,18,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none transition-all duration-500 ${status === 'loading' || status === 'error' ? 'opacity-40 animate-scanlines-fast' : 'opacity-20 animate-scanlines'}`}
          style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(1.05)` }}
        ></div>
        {status === 'error' && <div className="absolute inset-0 z-20 bg-red-900/20 animate-pulse pointer-events-none mix-blend-overlay"></div>}
        {status === 'typing' && <div className="absolute inset-0 z-20 bg-green-900/10 pointer-events-none mix-blend-screen transition-opacity duration-200"></div>}
        {(status === 'loading' || status === 'error') && <div className="absolute inset-0 z-30 noise-bg opacity-15 pointer-events-none mix-blend-screen"></div>}
        <div className="absolute inset-0 z-50 bg-[radial-gradient(circle_at_center,transparent_0%,#000_85%)] pointer-events-none opacity-90 transition-opacity duration-500"></div>
      </>
    );
  };

  const marketData = [
    { type: 'visa', bin: '466188', level: 'CLASSIC', class: 'DEBIT', code: '201', exp: '10/27', db: '[07-03-2023] MIX #71E7', country: 'US', flag: '🇺🇸', bank: 'BRANCH BANKING AND TRUST COMPANY', vendor: 'DM####OR', price: '$ 15.50' },
    { type: 'amex', bin: '371441', level: 'PLATINUM', class: 'CREDIT', code: '201', exp: '08/28', db: '[12-05-2023] PREMIUM #A92', country: 'US', flag: '🇺🇸', bank: 'AMERICAN EXPRESS', vendor: 'AX####PR', price: '$ 185.00' },
    { type: 'mastercard', bin: '546616', level: 'WORLD', class: 'CREDIT', code: '201', exp: '12/26', db: '[07-03-2023] MIX #71E7', country: 'US', flag: '🇺🇸', bank: 'CITIBANK N.A.', vendor: 'DM####OR', price: '$ 45.20' },
    { type: 'visa', bin: '403710', level: 'GOLD', class: 'DEBIT', code: '201', exp: '04/27', db: '[07-03-2023] MIX #71E7', country: 'US', flag: '🇺🇸', bank: 'ROBINS F.C.U.', vendor: 'DM####OR', price: '$ 28.00' },
    { type: 'amex', bin: '378282', level: 'GOLD', class: 'CREDIT', code: '201', exp: '11/27', db: '[12-05-2023] PREMIUM #A92', country: 'US', flag: '🇺🇸', bank: 'AMERICAN EXPRESS', vendor: 'AX####PR', price: '$ 120.00' },
    { type: 'mastercard', bin: '518941', level: 'WORLD ELITE', class: 'DEBIT', code: '201', exp: '05/28', db: '[07-03-2023] MIX #71E7', country: 'US', flag: '🇺🇸', bank: 'CHASE BANK', vendor: 'DM####OR', price: '$ 65.00' },
    { type: 'visa', bin: '443041', level: 'INFINITE', class: 'CREDIT', code: '201', exp: '06/27', db: '[07-03-2023] MIX #71E7', country: 'US', flag: '🇺🇸', bank: 'PNC BANK, N.A.', vendor: 'DM####OR', price: '$ 195.50' },
    { type: 'amex', bin: '342188', level: 'BUSINESS', class: 'CREDIT', code: '201', exp: '01/29', db: '[12-05-2023] PREMIUM #A92', country: 'US', flag: '🇺🇸', bank: 'AMERICAN EXPRESS', vendor: 'AX####PR', price: '$ 85.00' },
    { type: 'visa', bin: '414720', level: 'SIGNATURE', class: 'CREDIT', code: '201', exp: '09/27', db: '[15-04-2024] FRESH #B12', country: 'UK', flag: '🇬🇧', bank: 'BARCLAYS BANK PLC', vendor: 'DM####OR', price: '$ 55.00' },
    { type: 'mastercard', bin: '521234', level: 'PLATINUM', class: 'CREDIT', code: '201', exp: '12/28', db: '[15-04-2024] FRESH #B12', country: 'CA', flag: '🇨🇦', bank: 'ROYAL BANK OF CANADA', vendor: 'DM####OR', price: '$ 42.00' },
    { type: 'amex', bin: '375987', level: 'CENTURION', class: 'CREDIT', code: '201', exp: '03/29', db: '[15-04-2024] BLACK #EX', country: 'US', flag: '🇺🇸', bank: 'AMERICAN EXPRESS', vendor: 'AX####PR', price: '$ 200.00' },
    { type: 'visa', bin: '485932', level: 'BUSINESS', class: 'DEBIT', code: '201', exp: '07/27', db: '[15-04-2024] FRESH #B12', country: 'AU', flag: '🇦🇺', bank: 'COMMONWEALTH BANK', vendor: 'DM####OR', price: '$ 35.00' },
    { type: 'mastercard', bin: '552199', level: 'STANDARD', class: 'DEBIT', code: '201', exp: '02/28', db: '[07-03-2023] MIX #71E7', country: 'DE', flag: '🇩🇪', bank: 'DEUTSCHE BANK AG', vendor: 'DM####OR', price: '$ 18.00' },
    { type: 'visa', bin: '471922', level: 'CLASSIC', class: 'CREDIT', code: '201', exp: '05/27', db: '[15-04-2024] FRESH #B12', country: 'FR', flag: '🇫🇷', bank: 'BNP PARIBAS', vendor: 'DM####OR', price: '$ 22.50' },
    { type: 'amex', bin: '379123', level: 'GREEN', class: 'CREDIT', code: '201', exp: '10/28', db: '[12-05-2023] PREMIUM #A92', country: 'US', flag: '🇺🇸', bank: 'AMERICAN EXPRESS', vendor: 'AX####PR', price: '$ 45.00' },
    { type: 'mastercard', bin: '531100', level: 'GOLD', class: 'CREDIT', code: '201', exp: '08/27', db: '[15-04-2024] FRESH #B12', country: 'BR', flag: '🇧🇷', bank: 'ITAÚ UNIBANCO', vendor: 'DM####OR', price: '$ 29.90' },
  ];

  if (isLoggedIn) {
    return (
      <div 
        className="min-h-screen market-bg-light text-gray-800 font-sans flex flex-col items-center py-4 md:py-8 px-2 md:px-4 relative overflow-hidden"
      >
        {/* Subtle Dashboard Background Cards */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.03] pointer-events-none grayscale"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1589750670744-dc9644739949?q=80&w=2070&auto=format&fit=crop")',
          }}
        ></div>

        <div className="relative z-10 w-full max-w-[1400px] flex flex-col h-[95vh] md:h-[90vh]">
          {/* Dashboard Header */}
          <div className="premium-header flex justify-between items-center p-6 mb-6 rounded-lg">
            <h1 className="text-xl font-bold uppercase tracking-tight text-white flex items-center">
              <Globe className="mr-3 text-blue-500 w-6 h-6" /> Premium Asset Market
            </h1>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Balance</p>
                <p className="text-xl font-black text-green-500">$ 0.00</p>
              </div>
              <button 
                onClick={() => setShowDeposit(true)}
                className="accent-btn"
              >
                + Deposit
              </button>
              <button 
                onClick={handleLogout}
                className="professional-btn"
              >
                Exit
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {marketData.map((item, i) => (
                <motion.div 
                  key={i} 
                  layoutId={`card-${i}`}
                  onClick={() => setSelectedCard({ ...item, id: i })}
                  className="premium-card flex flex-col rounded-xl overflow-hidden group cursor-pointer"
                >
                  {/* Big Card Image */}
                  <div className="relative aspect-[1.586/1] w-full p-4 bg-gray-50">
                    <motion.div 
                      layoutId={`card-visual-${i}`}
                      whileHover={{ rotateY: 8, rotateX: -5, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`w-full h-full rounded-xl shadow-lg relative overflow-hidden ${
                        item.type === 'visa' ? 'bg-[linear-gradient(135deg,#1d4ed8_0%,#2563eb_45%,#1e3a8a_100%)]' : 
                        item.type === 'amex' ? 'bg-[linear-gradient(135deg,#0891b2_0%,#06b6d4_45%,#1e3a8a_100%)]' :
                        'bg-[linear-gradient(135deg,#374151_0%,#1f2937_45%,#000000_100%)]'
                      }`}
                      style={{ perspective: "1000px" }}
                    >
                      <div className="absolute inset-0 card-security-pattern opacity-30"></div>
                      
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
                      {/* Card Chip */}
                      <div className="absolute top-1/2 left-8 -translate-y-1/2 w-12 h-10 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-md border border-yellow-700/30 overflow-hidden shadow-inner">
                        <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-40">
                          {[...Array(9)].map((_, idx) => <div key={idx} className="border-[0.5px] border-black/40"></div>)}
                        </div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_100%)]"></div>
                      </div>

                      {/* Contactless Icon */}
                      <div className="absolute top-1/2 left-22 -translate-y-1/2 text-white/40 rotate-90">
                        <Wifi size={16} />
                      </div>
                      
                      {/* Brand Logo */}
                      <div className="absolute bottom-6 right-8">
                        <img 
                          src={
                            item.type === 'visa' ? 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' : 
                            item.type === 'amex' ? 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg' :
                            'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg'
                          } 
                          alt={item.type}
                          className="h-8 md:h-10 w-auto brightness-0 invert drop-shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Card Number (Realism improvement: Embossed look) */}
                      <div 
                        className="absolute top-1/2 left-8 -translate-y-2 text-white font-mono text-xl tracking-[0.25em] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                        style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.6), -1px -1px 0px rgba(255,255,255,0.2)' }}
                      >
                        {item.bin} **** **** ****
                      </div>

                      {/* Card Holder (Realism: Add a dummy placeholder) */}
                      <div className="absolute bottom-6 left-8 text-white font-mono text-xs tracking-wider opacity-90 uppercase">
                        CARDHOLDER NAME
                      </div>
                      
                      {/* Exp Date */}
                      <div className="absolute bottom-6 right-8 text-white font-mono text-xs opacity-90">
                        {item.exp}
                      </div>

                      {/* Level Overlay */}
                      <div className="absolute top-6 right-8 text-white font-bold text-[10px] tracking-widest uppercase opacity-60">
                        {item.level}
                      </div>

                      {/* Hologram Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                    </motion.div>
                  </div>

                  {/* Details below */}
                  <div className="p-6 bg-[#0a0a0a] border-t border-[#222] space-y-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xs font-bold text-gray-200 uppercase tracking-widest truncate max-w-[200px]">{item.bank || 'PRIVATE ISSUER'}</h3>
                        <p className="text-[10px] text-gray-500 mt-1 font-mono">{item.vendor} | {item.class}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xl">{item.flag}</span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase">{item.country}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono border-y border-[#222] py-4">
                      <div className="bg-[#151515] p-3 rounded border border-[#222]">
                        <p className="text-gray-500 uppercase text-[8px] mb-1">BIN REF</p>
                        <p className="text-gray-200 font-bold tracking-wider">{item.bin}</p>
                      </div>
                      <div className="bg-[#151515] p-3 rounded border border-[#222]">
                        <p className="text-gray-500 uppercase text-[8px] mb-1">CODE</p>
                        <p className="text-gray-200 font-bold tracking-wider">{item.code}</p>
                      </div>
                      <div className="col-span-2 bg-[#151515] p-3 rounded border border-[#222]">
                        <p className="text-gray-500 uppercase text-[8px] mb-1">DB SOURCE</p>
                        <p className="text-gray-300 truncate text-[10px]">{item.db}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-lg font-black text-white">{item.price}</span>
                      <button 
                        className="accent-btn flex items-center gap-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCard({ ...item, id: i });
                          setShowPayment(true);
                        }}
                      >
                        <ShoppingCart size={14} /> Buy Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Modal Overlay */}
          <AnimatePresence>
            {selectedCard && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedCard(null)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />
                
                <motion.div 
                  layoutId={`card-${selectedCard.id}`}
                  className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95vh] md:max-h-[90vh]"
                >
                  {/* Left Side: Card Visual */}
                  <div className="w-full md:w-1/2 bg-gray-50 p-4 md:p-10 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-100 shrink-0">
                    <motion.div 
                      layoutId={`card-visual-${selectedCard.id}`}
                      initial={{ rotateY: 0, rotateX: 0 }}
                      animate={{ rotateY: 5, rotateX: -2 }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                      className={`w-full max-w-[320px] md:max-w-none aspect-[1.586/1] rounded-2xl shadow-2xl relative overflow-hidden ${
                        selectedCard.type === 'visa' ? 'bg-[linear-gradient(135deg,#1d4ed8_0%,#2563eb_45%,#1e3a8a_100%)]' : 
                        selectedCard.type === 'amex' ? 'bg-[linear-gradient(135deg,#0891b2_0%,#06b6d4_45%,#1e3a8a_100%)]' :
                        'bg-[linear-gradient(135deg,#374151_0%,#1f2937_45%,#000000_100%)]'
                      }`}
                      style={{ perspective: "1000px" }}
                    >
                      <div className="absolute inset-0 card-security-pattern opacity-30"></div>

                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-shimmer pointer-events-none"></div>
                      {/* Card Chip */}
                      <div className="absolute top-1/2 left-6 md:left-8 -translate-y-1/2 w-10 h-8 md:w-14 md:h-12 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-md border border-yellow-700/30 overflow-hidden shadow-inner">
                        <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-40">
                          {[...Array(9)].map((_, idx) => <div key={idx} className="border-[0.5px] border-black/40"></div>)}
                        </div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_100%)]"></div>
                      </div>

                      {/* Contactless Icon */}
                      <div className="absolute top-1/2 left-20 md:left-26 -translate-y-1/2 text-white/40 rotate-90">
                        <Wifi size={16} className="md:w-5 md:h-5" />
                      </div>
                      
                      {/* Brand Logo */}
                      <div className="absolute bottom-6 md:bottom-8 right-6 md:right-10">
                        <img 
                          src={
                            selectedCard.type === 'visa' ? 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' : 
                            selectedCard.type === 'amex' ? 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg' :
                            'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg'
                          } 
                          alt={selectedCard.type}
                          className="h-8 md:h-12 w-auto brightness-0 invert drop-shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Card Number Mock (Embossed Effect) */}
                      <div 
                        className="absolute top-1/2 left-6 md:left-10 translate-y-4 md:translate-y-6 text-white font-mono text-base md:text-2xl tracking-[0.2em] md:tracking-[0.25em]"
                        style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5), -0.5px -0.5px 0.5px rgba(255,255,255,0.3)' }}
                      >
                        {selectedCard.bin} **** **** ****
                      </div>

                      {/* Exp Date */}
                      <div className="absolute bottom-6 md:bottom-8 left-6 md:left-10 text-white font-mono text-[10px] md:text-sm opacity-80">
                        VALID THRU: {selectedCard.exp}
                      </div>

                      {/* Level Overlay */}
                      <div className="absolute top-6 md:top-8 right-6 md:right-10 text-white font-bold text-[8px] md:text-xs tracking-widest uppercase opacity-60">
                        {selectedCard.level}
                      </div>

                      {/* Hologram Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-30 pointer-events-none"></div>
                    </motion.div>

                    <div className="mt-4 md:mt-8 w-full space-y-4">
                      <div className="flex items-center justify-between p-3 md:p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <ShieldCheck size={18} />
                          </div>
                          <div>
                            <p className="text-[8px] md:text-[10px] text-gray-400 uppercase font-bold">Security Status</p>
                            <p className="text-xs md:text-sm font-bold text-gray-900">VERIFIED_ASSET</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] md:text-[10px] text-gray-400 uppercase font-bold">Risk Level</p>
                          <p className="text-xs md:text-sm font-bold text-blue-600">LOW_DETECT</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Details */}
                  <div className="w-full md:w-1/2 p-4 md:p-10 overflow-y-auto custom-scrollbar">
                    <button 
                      onClick={() => {
                        setSelectedCard(null);
                        setShowPayment(false);
                      }}
                      className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900 z-10"
                    >
                      <X size={20} className="md:w-6 md:h-6" />
                    </button>

                    <div className="space-y-6 md:space-y-8">
                      <div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase">Asset Details</h2>
                        <p className="text-[8px] md:text-xs text-gray-400 mt-1 font-mono">UUID: {Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:gap-6">
                        <DetailItem icon={<Building2 size={16} className="md:w-[18px] md:h-[18px]"/>} label="Issuing Institution" value={selectedCard.bank || 'PRIVATE_NETWORK_ISSUER'} />
                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                          <DetailItem icon={<CreditCard size={16} className="md:w-[18px] md:h-[18px]"/>} label="Card Brand" value={selectedCard.type.toUpperCase()} />
                          <DetailItem icon={<Info size={16} className="md:w-[18px] md:h-[18px]"/>} label="Card Class" value={selectedCard.class} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                          <DetailItem icon={<Calendar size={16} className="md:w-[18px] md:h-[18px]"/>} label="Expiration" value={selectedCard.exp} />
                          <DetailItem icon={<Zap size={16} className="md:w-[18px] md:h-[18px]"/>} label="BIN Reference" value={selectedCard.bin} />
                        </div>
                        <DetailItem icon={<MapPin size={16} className="md:w-[18px] md:h-[18px]"/>} label="Origin Country" value={`${selectedCard.flag} ${selectedCard.country} - UNITED STATES`} />
                        <DetailItem icon={<Server size={16} className="md:w-[18px] md:h-[18px]"/>} label="Database Source" value={selectedCard.db} />
                      </div>

                      <div className="pt-4 md:pt-6 border-t border-gray-100 flex flex-col gap-4 md:gap-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[8px] md:text-[10px] text-gray-400 uppercase font-bold">Total Price</p>
                            <p className="text-2xl md:text-3xl font-black text-gray-900">{selectedCard.price}</p>
                          </div>
                          {!showPayment && (
                            <button 
                              onClick={() => setShowPayment(true)}
                              className="accent-btn h-12 px-8 text-sm flex items-center gap-2 shadow-xl"
                            >
                              <ShoppingCart size={18} /> Buy Now
                            </button>
                          )}
                        </div>

                        {showPayment && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 md:p-6 bg-green-50 border-2 border-green-200 rounded-2xl space-y-3 md:space-y-4"
                          >
                            <div className="flex items-center gap-2 md:gap-3 text-green-700">
                              <CheckCircle2 size={20} className="md:w-6 md:h-6" />
                              <h3 className="font-bold text-base md:text-lg">Payment Required</h3>
                            </div>
                            <p className="text-xs md:text-sm text-green-800">
                              Send exactly <span className="font-bold">{selectedCard.price}</span> in USDT (TRC20):
                            </p>
                            <div 
                              onClick={() => {
                                navigator.clipboard.writeText('TBWdYpJfKHvFjtYbfYHPiUN55Yp1qN1RpZ');
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="bg-white p-3 md:p-4 rounded-xl border border-green-200 font-mono text-[10px] md:text-xs break-all select-all cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between group relative overflow-hidden"
                            >
                              <span className="text-gray-900 font-bold truncate mr-2">TBWdYpJfKHvFjtYbfYHPiUN55Yp1qN1RpZ</span>
                              <div className="flex items-center gap-1 md:gap-2 shrink-0">
                                <span className="text-[7px] md:text-[8px] text-green-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                  {copied ? 'COPIED!' : 'COPY'}
                                </span>
                                <Zap size={12} className={`${copied ? 'text-yellow-500 scale-125' : 'text-green-500'} transition-all md:w-3.5 md:h-3.5`} />
                              </div>
                            </div>
                            <div className="pt-1 md:pt-2 space-y-2">
                              <p className="text-[8px] md:text-[10px] text-green-600 font-bold uppercase tracking-widest animate-pulse">
                                Waiting for network confirmation...
                              </p>
                              <div className="p-2 md:p-3 bg-white/50 rounded-lg border border-green-100 flex items-center gap-2 md:gap-3">
                                <Send size={12} className="text-blue-500 md:w-3.5 md:h-3.5" />
                                <p className="text-[8px] md:text-[10px] text-gray-600 font-bold leading-tight">
                                  Send screenshots in telegram <a href="https://t.me/HA_TDR" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@HA_TDR</a> after payment
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <div className="p-3 md:p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-2 md:gap-3">
                        <Info size={16} className="text-blue-500 shrink-0 md:w-5 md:h-5" />
                        <p className="text-[8px] md:text-[10px] text-blue-700 leading-relaxed">
                          This asset is protected by our zero-day refund policy. If the card is dead upon purchase, a full credit refund will be issued.
                        </p>
                      </div>
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
            href="https://t.me/HA_TDR"
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

          {/* Deposit Modal */}
          <AnimatePresence>
            {showDeposit && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowDeposit(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
                        <p className="text-[8px] md:text-[10px] text-yellow-800 font-bold uppercase tracking-widest">Important</p>
                        <p className="text-[8px] md:text-[10px] text-yellow-700 leading-relaxed">
                          Send screenshots in telegram <a href="https://t.me/HA_TDR" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">@HA_TDR</a> after payment.
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowDeposit(false)}
                      className="w-full py-3 md:py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all uppercase tracking-widest text-xs md:text-sm"
                    >
                      I HAVE SENT PAYMENT
                    </button>
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
    <div 
      className="min-h-screen text-green-500 font-mono flex flex-col items-center justify-center relative overflow-hidden p-4"
      onMouseMove={handleMouseMove}
    >
      <BackgroundEffects status={systemStatus} />

      {/* Top Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 mb-4 md:mb-8 text-center px-4"
      >
        <h1 className="text-base md:text-3xl font-black tracking-[0.2em] md:tracking-[0.4em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] uppercase leading-tight">
          PREMIUM CREDIT CARD MARKETPLACE
        </h1>
        <div className="h-0.5 md:h-1 w-full bg-gradient-to-r from-transparent via-green-500 to-transparent mt-2 opacity-50"></div>
      </motion.div>

      {/* Main Container */}
      <div className={`relative z-50 w-full max-w-md border-2 border-green-600 bg-black/90 p-5 md:p-8 shadow-[0_0_40px_rgba(34,197,94,0.3)] transition-all duration-300 ${shake ? 'animate-shake border-red-600 shadow-[0_0_50px_rgba(255,0,0,0.4)]' : ''} ${isLoading ? 'scale-[0.98] opacity-90' : 'scale-100'}`}>
        
        {/* Header */}
        <div className={`flex flex-col items-center mt-1 mb-4 md:mb-8 border-b border-green-900/50 pb-4 md:pb-6 transition-colors duration-300 ${shake ? 'border-red-900/50' : ''}`}>
          <div className="relative">
            <Skull size={40} className={`${shake ? 'text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] glitch-text' : 'text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]'} mb-1 transition-colors duration-300 md:w-14 md:h-14`} />
            <AlertTriangle size={20} className={`text-black ${shake ? 'fill-red-500' : 'fill-green-500'} absolute -bottom-1 -right-1 transition-colors duration-300 md:w-7 md:h-7`} />
          </div>
          
          <h1 className={`text-2xl md:text-4xl font-bold tracking-[0.2em] text-center uppercase mt-3 md:mt-4 transition-colors duration-300 ${shake ? 'text-red-500 glitch-text' : 'text-green-500'}`}>
            DANGER
          </h1>
          <h2 className={`text-[10px] md:text-lg font-bold tracking-[0.2em] md:tracking-[0.3em] text-center uppercase mt-1 md:mt-2 transition-colors duration-300 ${shake ? 'text-red-700' : 'text-green-700'}`}>
            RESTRICTED AREA
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-950/80 border border-red-500 text-red-500 px-3 md:px-4 py-3 text-[10px] md:text-xs tracking-widest flex items-center animate-pulse">
            <ShieldAlert size={18} className="mr-3 flex-shrink-0" />
            <span className={shake ? 'glitch-text' : ''}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className={`text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center font-bold transition-colors duration-300 ${shake ? 'text-red-500' : 'text-green-500'}`}>
              <Terminal size={14} className="mr-2" /> IDENTIFIER
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={username}
                onChange={handleInputChange(setUsername)}
                disabled={isLoading}
                className={`w-full bg-green-950/10 border ${shake ? 'border-red-900/50 text-red-400 focus:border-red-500 focus:bg-red-900/20' : 'border-green-900/50 text-green-400 focus:border-green-500 focus:bg-green-900/20'} px-4 py-3 pl-6 focus:outline-none transition-all placeholder:text-green-900/40 tracking-[0.1em] disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                placeholder="INPUT_ID (admin)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center font-bold transition-colors duration-300 ${shake ? 'text-red-500' : 'text-green-500'}`}>
              <Lock size={14} className="mr-2" /> CIPHER_KEY
            </label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={handleInputChange(setPassword)}
                disabled={isLoading}
                className={`w-full bg-green-950/10 border ${shake ? 'border-red-900/50 text-red-400 focus:border-red-500 focus:bg-red-900/20' : 'border-green-900/50 text-green-400 focus:border-green-500 focus:bg-green-900/20'} px-4 py-3 pl-6 focus:outline-none transition-all placeholder:text-green-900/40 tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                placeholder="******** (override)"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full mt-4 md:mt-8 bg-green-950/40 border border-green-600 text-green-500 py-3 md:py-4 font-bold tracking-[0.2em] transition-all uppercase relative overflow-hidden flex items-center justify-center text-sm md:text-base ${isLoading ? 'opacity-70 cursor-not-allowed bg-green-900/40' : 'hover:bg-green-600 hover:text-black'}`}
          >
            <span className="relative z-10 flex items-center">
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-3" />
                  PROCESSING...
                </>
              ) : (
                'BREACH SYSTEM'
              )}
            </span>
          </button>
        </form>

        {/* Footer */}
        <div className={`mt-6 md:mt-8 text-center text-[8px] md:text-[10px] font-mono leading-loose tracking-[0.2em] transition-colors duration-300 ${shake ? 'text-red-800' : 'text-green-800'}`}>
          <p>CONNECTION SECURE // ENCRYPTION LEVEL 9</p>
          <p>UNAUTHORIZED ACCESS IS FATAL</p>
          
          <div className="mt-6 pt-6 border-t border-green-900/30">
            <a 
              href="https://t.me/HA_TDR"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2 border border-green-600/50 text-green-500 hover:bg-green-600 hover:text-black transition-all duration-300 rounded-sm group"
            >
              <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              CONTACT ADMIN FOR PAGE ACCESS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
