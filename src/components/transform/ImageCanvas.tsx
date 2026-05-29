import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ArrowRight, Save, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FeatureSelector from './FeatureSelector';
import { transformFace, TransformationType } from '../../services/aiService';
import { auth, db, OperationType, handleFirestoreError } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../../lib/utils';

export default function ImageCanvas() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedType, setSelectedType] = useState<TransformationType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState({
    ageGap: 40,
    gender: 'male' as const,
    backgroundTheme: 'futuristic' as const,
    vintageEra: '1950s' as const,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result as string);
      setTransformedImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  // @ts-ignore
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
  });

  const handleTransform = async () => {
    if (!originalImage || !selectedType) return;

    setIsProcessing(true);
    setError(null);
    try {
      const result = await transformFace(originalImage, selectedType, options);
      setTransformedImage(result);
    } catch (err: any) {
      console.error(err);
      setError("AI transformation failed. Try again!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser || !originalImage || !transformedImage || !selectedType) return;

    try {
      const path = `users/${auth.currentUser.uid}/transformations`;
      await addDoc(collection(db, path), {
        userId: auth.currentUser.uid,
        originalImageUrl: originalImage,
        transformedImageUrl: transformedImage,
        type: selectedType,
        metadata: options,
        createdAt: serverTimestamp(),
      });
      alert("POOF! Saved to your gallery!");
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, `users/${auth.currentUser.uid}/transformations`);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Upload/Preview Zone */}
      <div className="relative">
        {!originalImage ? (
          <div
            {...getRootProps()}
            className={cn(
              "h-80 border-4 border-black bg-white flex flex-col items-center justify-center cursor-pointer transition-all p-6 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
              isDragActive ? "bg-yellow-100 scale-[1.02]" : "hover:bg-gray-50"
            )}
          >
            <input {...getInputProps()} />
            <div className="bg-black p-4 rounded-none -rotate-3 mb-4">
              <Upload className="w-12 h-12 text-white animate-bounce" />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tighter leading-tight italic">
              Feed Me Your Face!
            </h3>
            <p className="font-bold text-gray-500 mt-2 uppercase text-xs italic">Drop or click to begin the transformation</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original */}
              <div className="relative border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group">
                <img src={originalImage} alt="Original" className="w-full h-80 object-cover" />
                <div className="absolute top-0 left-0 bg-black text-white px-3 py-1 text-[10px] font-black uppercase italic tracking-widest">
                  Subject Alpha
                </div>
                <button
                  onClick={() => setOriginalImage(null)}
                  className="absolute -top-3 -right-3 bg-red-600 text-white p-2 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Transformed */}
              <div className="relative border-4 border-black bg-black shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex items-center justify-center overflow-hidden h-80 outline outline-4 outline-black">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      className="flex flex-col items-center gap-6 p-8 text-center"
                    >
                      <div className="relative">
                         <Loader2 className="w-16 h-16 animate-spin text-[#fcd34d]" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white animate-pulse" />
                         </div>
                      </div>
                      <p className="text-2xl font-black uppercase italic text-white tracking-tighter leading-none">
                        CRUNCHING PIXELS...
                      </p>
                    </motion.div>
                  ) : transformedImage ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full relative"
                    >
                      <img src={transformedImage} alt="Transformed" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 w-full bg-green-500 border-t-4 border-black text-black px-4 py-2 font-black uppercase text-xs animate-pulse">
                        Transformation Complete!
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-gray-500 p-8 text-center">
                      <div className="w-32 h-32 bg-gray-900 rounded-full border-4 border-dashed border-gray-700 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-12 h-12 opacity-30" />
                      </div>
                      <p className="font-black uppercase tracking-tighter text-sm italic">Status: Waiting for Input</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {error && (
              <div className="bg-red-600 border-4 border-black p-4 flex items-center gap-4 text-white font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <AlertCircle className="shrink-0 w-8 h-8" />
                <p className="italic leading-none">SYSTEM FAILURE: {error}</p>
              </div>
            )}

            {transformedImage && !isProcessing && (
              <motion.button
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleSave}
                className="w-full bg-black text-[#fcd34d] text-2xl font-black py-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] hover:bg-red-600 hover:text-white transition-all active:scale-95 uppercase italic flex items-center justify-center gap-4 mt-4"
              >
                <Save className="w-8 h-8" />
                SECURE TO VAULT
              </motion.button>
            )}
          </div>
        )}
      </div>

      {originalImage && (
        <div className="space-y-6">
          <FeatureSelector 
            selectedType={selectedType} 
            setSelectedType={setSelectedType}
            options={options}
            setOptions={setOptions}
          />

          <button
            disabled={!selectedType || isProcessing}
            onClick={handleTransform}
            className={cn(
              "w-full text-white text-4xl font-black py-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-4 uppercase italic tracking-tighter",
              !selectedType || isProcessing 
                ? "bg-gray-400 cursor-not-allowed opacity-50" 
                : "bg-red-600 hover:bg-black hover:text-white active:translate-x-1 active:translate-y-1 active:shadow-none"
            )}
          >
            {isProcessing ? "PROCESSING..." : "ACTIVATE FLIP"}
            {!isProcessing && <ArrowRight className="w-12 h-12" />}
          </button>
        </div>
      )}
    </div>
  );
}
