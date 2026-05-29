import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './lib/firebase';
import { LogIn, LogOut, Flame, Sparkles, History, Users, Image as ImageIcon, Briefcase, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FeatureSelector from './components/transform/FeatureSelector';
import ImageCanvas from './components/transform/ImageCanvas';
import SavedPhotos from './components/gallery/SavedPhotos';
import { cn } from './lib/utils';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transform' | 'gallery'>('transform');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcd34d] flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Flame className="w-16 h-16 text-red-600" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fcd34d] flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-8 max-w-lg"
        >
          <div className="flex flex-col items-center gap-3">
             <div className="bg-black p-4 rotate-3 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] inline-block">
                <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">
                   Face-Flip AI
                </h1>
             </div>
             <span className="bg-red-600 text-white font-bold px-4 py-2 -rotate-2 text-sm uppercase border-2 border-black">
                Beta 2.0 - Active
             </span>
          </div>
          
          <div className="p-10 bg-white border-4 border-black brutalist-shadow rounded-none relative">
            <div className="absolute -top-10 -right-10 hidden sm:block">
              <div className="bg-blue-600 text-white p-4 border-4 border-black rotate-12 font-black uppercase text-xs">
                AI Powered!
              </div>
            </div>
            <p className="text-2xl font-black text-black mb-8 italic uppercase leading-none tracking-tight">
              "Turn your boring face into something TOTALLY CRAZY!"
            </p>
            <div className="space-y-4">
               <div className="flex items-center gap-4 bg-gray-100 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-10 h-10" alt="Google" />
                  <span className="font-black text-lg uppercase text-left leading-none">Sync with Google Account</span>
               </div>
               <button
                 onClick={handleLogin}
                 className="w-full bg-blue-600 text-white text-3xl font-black py-5 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:scale-95 uppercase italic"
               >
                 Connect Now
               </button>
            </div>
          </div>

          <footer className="mt-8 flex justify-between items-center text-xs font-black uppercase gap-4 opacity-70">
            <span>Status: <span className="text-green-600 italic">Online & Crazy</span></span>
            <div className="flex gap-4">
              <span className="underline decoration-2">Privacy</span>
              <span className="underline decoration-2">Terms</span>
            </div>
          </footer>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcd34d] font-sans pb-24">
      {/* Header */}
      <header className="bg-white border-b-4 border-black p-4 sticky top-0 z-50 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-black p-2 rotate-2 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]">
            <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Face-Flip AI</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase leading-none">{user.displayName}</span>
              <span className="text-[10px] font-bold text-red-600 uppercase leading-none">Crazy Mode: On</span>
           </div>
           <button 
             onClick={handleLogout}
             className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
           >
             <LogOut className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto p-4 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'transform' ? (
            <motion.div
              key="transform"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ImageCanvas />
            </motion.div>
          ) : (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SavedPhotos />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t-4 border-black flex shadow-[-4px_-4px_0px_0px_rgba(0,0,0,1)]">
        <button 
          onClick={() => setActiveTab('transform')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 transition-all",
            activeTab === 'transform' ? "bg-red-600 text-white" : "text-black"
          )}
        >
          <Sparkles className={cn("w-7 h-7", activeTab === 'transform' && "animate-pulse")} />
          <span className="text-[10px] font-black uppercase italic">Face Flip</span>
        </button>
        <button 
          onClick={() => setActiveTab('gallery')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 transition-all",
            activeTab === 'gallery' ? "bg-blue-600 text-white" : "text-black"
          )}
        >
          <ImageIcon className={cn("w-7 h-7", activeTab === 'gallery' && "animate-pulse")} />
          <span className="text-[10px] font-black uppercase italic">Vault</span>
        </button>
      </nav>
    </div>
  );
}
