import React from 'react';
import { History, Users, Layers, Camera, Wand2, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TransformationType } from '../../services/aiService';

interface FeatureSelectorProps {
  selectedType: TransformationType | null;
  setSelectedType: (type: TransformationType) => void;
  options: any;
  setOptions: (options: any) => void;
}

export default function FeatureSelector({ selectedType, setSelectedType, options, setOptions }: FeatureSelectorProps) {
  const features = [
    { id: 'age_progression', label: 'Age Warp', icon: History, color: 'bg-red-600', textColor: 'text-white' },
    { id: 'actor_swap', label: 'Star Swap', icon: Users, color: 'bg-blue-600', textColor: 'text-white' },
    { id: 'background_change', label: 'Scene Shift', icon: Layers, color: 'bg-green-400', textColor: 'text-black' },
    { id: 'vintage', label: 'Retro Mode', icon: Camera, color: 'bg-orange-400', textColor: 'text-black' },
    { id: 'anime', label: 'AI Anime', icon: Wand2, color: 'bg-purple-400', textColor: 'text-black' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setSelectedType(feature.id)}
            className={cn(
              "flex flex-col items-center justify-center p-4 border-4 border-black transition-all active:scale-95 text-center leading-none",
              selectedType === feature.id 
                ? `${feature.color} ${feature.textColor} translate-x-1 translate-y-1 shadow-none` 
                : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
            )}
          >
            <feature.icon className="w-8 h-8 mb-2" />
            <span className="text-[10px] font-black uppercase tracking-tight">{feature.label}</span>
          </button>
        ))}
      </div>

      {/* Feature Specific Options */}
      <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        {selectedType === 'age_progression' && (
          <div className="space-y-4">
            <h3 className="font-black uppercase text-xl italic leading-none">Time Machine</h3>
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase opacity-60">Set Age Offset</label>
              <input 
                type="range" 
                min="10" 
                max="80" 
                step="1"
                value={options.ageGap}
                onChange={(e) => setOptions({...options, ageGap: parseInt(e.target.value)})}
                className="w-full h-4 bg-gray-200 rounded-none appearance-none cursor-pointer accent-red-600 border-2 border-black"
              />
              <div className="flex justify-between font-black text-2xl italic">
                <span>NOW</span>
                <span className="text-red-600">+{options.ageGap}YRS</span>
              </div>
            </div>
          </div>
        )}

        {selectedType === 'actor_swap' && (
          <div className="space-y-4">
            <h3 className="font-black uppercase text-xl italic leading-none">Casting Call</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => setOptions({...options, gender: 'male'})}
                className={cn(
                  "flex-1 py-4 border-4 border-black font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  options.gender === 'male' ? "bg-black text-white" : "bg-white text-black"
                )}
              >
                Actor
              </button>
              <button 
                onClick={() => setOptions({...options, gender: 'female'})}
                className={cn(
                  "flex-1 py-4 border-4 border-black font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  options.gender === 'female' ? "bg-black text-white" : "bg-white text-black"
                )}
              >
                Actress
              </button>
            </div>
          </div>
        )}

        {selectedType === 'background_change' && (
          <div className="space-y-4">
            <h3 className="font-black uppercase text-xl italic leading-none">Scene Shift</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'nature', label: 'Nature', color: 'bg-green-100' },
                { id: 'hollywood', label: 'Hollywood', color: 'bg-yellow-100' },
                { id: 'futuristic', label: 'Futuristic', color: 'bg-purple-100' },
                { id: 'mars', label: 'Planet Mars', color: 'bg-red-100' },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setOptions({...options, backgroundTheme: theme.id})}
                  className={cn(
                    "p-3 border-2 border-black font-black uppercase text-xs transition-all",
                    options.backgroundTheme === theme.id ? "bg-black text-white" : theme.color
                  )}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedType === 'vintage' && (
          <div className="space-y-4">
            <h3 className="font-black uppercase text-xl italic leading-none">Historical Records</h3>
            <div className="grid grid-cols-2 gap-3">
              {['1920s', '1950s', '1970s', '1990s'].map((era) => (
                <button
                  key={era}
                  onClick={() => setOptions({...options, vintageEra: era})}
                  className={cn(
                    "py-3 border-4 border-black font-black uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    options.vintageEra === era ? "bg-orange-400 text-black shadow-none translate-x-[2px] translate-y-[2px]" : "bg-white text-black"
                  )}
                >
                  Era {era}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedType === 'anime' && (
            <div className="flex flex-col items-center py-4 bg-purple-100 border-2 border-dashed border-purple-400">
                 <div className="bg-black p-3 mb-3 rotate-12">
                    <Wand2 className="text-white w-8 h-8" />
                 </div>
                 <p className="font-black text-sm text-center uppercase tracking-tighter">Automatic Style Synthesis Active</p>
                 <p className="text-[10px] font-bold opacity-60">Result will be a HQ Anime Character Variant</p>
            </div>
        )}

        {!selectedType && (
          <div className="py-6 text-center">
            <p className="font-black uppercase text-gray-300 italic tracking-widest text-lg animate-pulse">Choose Your Mutation</p>
          </div>
        )}
      </div>
    </div>
  );
}
