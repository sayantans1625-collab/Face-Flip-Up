import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Trash2, Calendar, Share2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface TransformationRecord {
  id: string;
  originalImageUrl: string;
  transformedImageUrl: string;
  type: string;
  createdAt: any;
}

export default function SavedPhotos() {
  const [photos, setPhotos] = useState<TransformationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const path = `users/${auth.currentUser.uid}/transformations`;
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransformationRecord));
      setPhotos(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleDelete = async (id: string) => {
    if (!auth.currentUser || !window.confirm("Delete this masterpiece?")) return;
    try {
      const path = `users/${auth.currentUser.uid}/transformations`;
      await deleteDoc(doc(db, path, id));
    } catch (err) {
      console.error(err);
    }
  };

  const getLabel = (type: string) => {
    return type.replace('_', ' ').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
        <p className="font-black uppercase">Opening Vault...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-gray-100 p-6 border-4 border-dashed border-gray-300 -rotate-2">
           <ImageIcon className="w-16 h-16 text-gray-300 mb-4 mx-auto" />
           <h3 className="text-3xl font-black uppercase text-gray-400 italic tracking-tighter">Vault Empty</h3>
        </div>
        <p className="font-black text-gray-400 text-center mt-6 uppercase text-xs italic">
          Mutations will appear here once secured.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="bg-black text-white p-3 rotate-1 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] inline-block self-start mb-2">
         <h2 className="text-xl font-black uppercase italic tracking-widest">Storage Vault</h2>
      </div>
      <AnimatePresence>
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white border-4 border-black brutalist-shadow overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row">
              <div className="relative w-full sm:w-1/2 aspect-square border-b-4 sm:border-b-0 sm:border-r-4 border-black">
                 <img src={photo.transformedImageUrl} alt="Transformed" className="w-full h-full object-cover" />
                 <div className="absolute top-0 left-0 bg-black text-white px-4 py-1 font-black text-[10px] uppercase italic tracking-widest">
                    Flip Result
                 </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-gray-50 to-white">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-red-600 text-white border-2 border-black px-3 py-1 text-xs font-black uppercase italic -rotate-2">
                      {getLabel(photo.type)}
                    </div>
                    <button 
                      onClick={() => handleDelete(photo.id)}
                      className="p-2 text-red-600 hover:bg-black hover:text-white transition-all border-2 border-transparent hover:border-black shadow-sm"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-black text-[10px] font-black uppercase mb-6 opacity-40">
                    <Calendar className="w-3 h-3" />
                    {photo.createdAt?.toDate().toLocaleDateString() || 'Just now'} / Vault ID: {photo.id.slice(0, 8)}
                  </div>
                </div>

                <div className="flex gap-3">
                   <a 
                     href={photo.transformedImageUrl} 
                     download={`face-flip-${photo.id}.png`}
                     className="flex-1 bg-black text-[#fcd34d] text-center py-4 font-black uppercase text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] hover:bg-red-600 hover:text-white transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                   >
                     Extract
                   </a>
                   <button className="p-3 border-4 border-black bg-white hover:bg-gray-100 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                     <Share2 className="w-6 h-6" />
                   </button>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-black flex items-center justify-between text-white">
               <span className="text-[10px] font-black uppercase italic tracking-tighter opacity-70 leading-none">Side-by-side verification</span>
               <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold opacity-50 uppercase">Original</span>
                  <div className="w-10 h-10 border-2 border-white overflow-hidden rotate-3">
                     <img src={photo.originalImageUrl} className="w-full h-full object-cover" />
                  </div>
               </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
