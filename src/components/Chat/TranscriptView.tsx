//transcriptView.tsx


'use client';

import { CirclePlay, CirclePause, Smile } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useId, useMemo, useState, } from 'react';

// --- WaveVisualizer ---
const WaveVisualizer = ({ 
  width = 100, 
  isAnimated = false, 
  segments = 25,
  wavePoints 
}: {
  width?: number;
  isAnimated?: boolean;
  segments?: number;
  wavePoints: Array<{ x: number; y: number }>;
}) => {
  const pathId = useId();
  
  const processedData = useMemo(() => {
    const points = wavePoints.slice(0, segments);
    let pathData = "";
    points.forEach((point, index) => {
      if (index === 0) {
        pathData = `M ${point.x} ${point.y}`;
      } else {
        pathData += ` L ${point.x} ${point.y}`;
      }
    });
    return { points, pathData };
  }, [wavePoints, segments]);

  return (
    <svg width={width} height="24" className="overflow-visible">
      <defs>
        <linearGradient id={`lightningGradient-${pathId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(34, 197, 94, 0.2)" />
          <stop offset="25%" stopColor="rgba(134, 239, 172, 0.9)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 1)" />
          <stop offset="75%" stopColor="rgba(134, 239, 172, 0.9)" />
          <stop offset="100%" stopColor="rgba(34, 197, 94, 0.2)" />
        </linearGradient>
      </defs>
      <path
        d={processedData.pathData}
        fill="none"
        stroke="rgba(34, 197, 94, 0.8)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="miter"
        className={isAnimated ? "transition-all duration-75 ease-out" : ""}
      />
      <path
        d={processedData.pathData}
        fill="none"
        stroke={`url(#lightningGradient-${pathId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="miter"
        className={isAnimated ? "animate-pulse" : ""}
        style={{
          opacity: isAnimated ? "0.9" : "0.7",
        }}
      />
    </svg>
  );
};

// --- التفاعلات الجديدة ---
const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "👏"];

interface TranscriptViewProps {
  transcript: string;
  timestamp: string;
  isSpeaking: boolean;
  wavePoints: Array<{ x: number; y: number }>;
  onToggle: () => void;
  userId: string;
}

const TranscriptView = ({ 
  transcript, 
  timestamp, 
  isSpeaking, 
  wavePoints, 
  onToggle,
  userId
}: TranscriptViewProps) => {
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleToggle = useCallback(() => {
    onToggle();
  }, [onToggle]);

  // إضافة/إزالة التفاعل (toggle)
  const handleReact = (emoji: string) => {
    setReactions((prev) => {
      const newReactions = { ...prev };
      
      // إذا كان نفس الإيموجي موجود للمستخدم، احذفه
      if (newReactions[userId] === emoji) {
        delete newReactions[userId];
      } else {
        // وإلا أضف/غير الإيموجي
        newReactions[userId] = emoji;
      }
      
      return newReactions;
    });
    
    // انتقال سلس عند الإغلاق
    setIsClosing(true);
    setTimeout(() => {
      setShowEmojiBar(false);
      setIsClosing(false);
    }, 150);
  };

  // دالة إظهار/إخفاء شريط الإيموجيات عند الضغط على الأيقونة
  const toggleEmojiBar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showEmojiBar) {
      setIsClosing(true);
      setTimeout(() => {
        setShowEmojiBar(false);
        setIsClosing(false);
      }, 150);
    } else {
      setShowEmojiBar(true);
    }
  };

  return (
    <div 
      className="flex gap-4 mb-6 group relative"
      onClick={() => {
        if (showEmojiBar) {
          setIsClosing(true);
          setTimeout(() => {
            setShowEmojiBar(false);
            setIsClosing(false);
          }, 150);
        }
      }}
    >
      {/* صورة المرسل */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">   
        <Image 
          src="/DHG.svg" 
          alt="Had Logo" 
          width={64} 
          height={64} 
          className="w-full h-full object-contain"
          priority
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-violet-600 bg-clip-text dark:from-green-400 dark:to-green-600 text-transparent font-cairo">
            الْحـَاذَكـْ
          </span>
        </div>

        {/* بالون الرسالة الصوتية */}
        <div className="relative">
          <div className="rounded-full text-green-50 border-green-500/30 bg-gradient-to-tr from-violet-900 via-blue-900/90 to-green-400 dark:from-violet-600/30 dark:via-blue-900/20 dark:to-green-400 dark:text-green-400 dark:border-green-400/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-4 py-3 shadow-lg backdrop-blur-sm mb-1">
            
            {/* محتوى البالون */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggle}
                className="text-slate-50 dark:text-gray-50 hover:scale-110 mt-2 transition-transform"
                title={isSpeaking ? "إيقاف القراءة" : "تشغيل القراءة"}
              >
                {isSpeaking ? <CirclePause size={20} /> : <CirclePlay size={20} />}
              </button>
              
              <div className="flex items-center justify-center h-[24px] min-w-[80px]">
                <WaveVisualizer
                  width={80}
                  isAnimated={isSpeaking}
                  segments={20}
                  wavePoints={wavePoints}
                />
              </div>
              
              <span className="text-xs font-medium text-slate-100 dark:text-slate-100 mt-2">
                {timestamp}
              </span>
            </div>
          </div>

          {/* أيقونة التفاعلات - تظهر بشكل دائم */}
          <div className="absolute -bottom-2 -right-2">
            <button
              onClick={toggleEmojiBar}
              className={`bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg border border-gray-200 dark:border-gray-600 hover:scale-110 transition-all duration-200 hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95
                ${showEmojiBar ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/20' : ''}
              `}
              title="إضافة تفاعل"
            >
              <Smile 
                size={14} 
                className={`transition-colors duration-200 ${
                  showEmojiBar ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                }`} 
              />
            </button>
          </div>

          {/* شريط الإيموجيات (يظهر فوق البالون) */}
          {showEmojiBar && (
            <div 
              className={`absolute -top-12 left-0 bg-white dark:bg-gray-800 rounded-full px-1 py-1 shadow-2xl border border-gray-200 dark:border-gray-600 flex items-center gap-3 z-20 backdrop-blur-sm
                ${isClosing ? 
                  'animate-out fade-out slide-out-to-bottom-4 duration-150 ease-in' : 
                  'animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out scale-in-95'
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              {REACTIONS.map((emoji, index) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="text-2xl hover:scale-125 transition-all duration-200 ease-out hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 hover:shadow-md active:scale-95"
                  style={{
                    animationDelay: isClosing ? '0ms' : `${index * 80}ms`,
                    animation: !isClosing && showEmojiBar ? `bounceIn 0.4s ease-out ${index * 80}ms both` : 'none'
                  }}
                >
                  {emoji}
                </button>
              ))}
              
              {/* CSS Animations */}
              <style jsx>{`
                @keyframes bounceIn {
                  0% {
                    opacity: 0;
                    transform: translateY(20px) scale(0.3);
                  }
                  50% {
                    opacity: 1;
                    transform: translateY(-5px) scale(1.1);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                  }
                }
                
                @keyframes slideInScale {
                  0% {
                    opacity: 0;
                    transform: translateY(15px) scale(0.8);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                  }
                }
              `}</style>
            </div>
          )}
        </div>

        {/* التفاعلات أسفل البالون مثل واتساب */}
        {Object.values(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 ml-10">
            {Object.values(reactions).map((emoji, i) => (
              <div 
                key={i}
                className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs shadow-sm border border-gray-300 dark:border-gray-600"
              >
                <span>{emoji}</span>
              </div>
            ))}
          </div>
        )}

        {/* نص الرسالة */}
        <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed mt-1">
          {transcript}
        </p>
      </div>
    </div>
  );
};

export default TranscriptView;