// ChatVu.tsx

'use client';
import { cn } from '@/app/lib/utils';
import { ThumbsUp, ThumbsDown, Copy, Volume2, Play, Pause, Check, CheckCheck } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useCallback, useId,  } from 'react';
import TranscriptView from '@/components/Chat/TranscriptView'; // استيراد المكون الجديد

// Props للمكون الجديد
interface ChatVuProps {
  // بيانات الرسالة
  isUser: boolean;
  isAssistant: boolean;
  content: string;
  messageType?: 'text' | 'audio';
  timestamp: string;

  // للرسائل الصوتية
  audioUrl?: string;
  isPlaying?: boolean;
  duration?: number;
  currentTime?: number;
  isTranscribing?: boolean;
  error?: string | null; // ✅ تم إزالة undefined
  wavePoints?: Array<{ x: number; y: number }>;
  onTogglePlayback?: () => void;

  // للنص المحول
  transcript?: string | null;
  transcriptTimestamp?: string;
  isSpeaking?: boolean;
  transcriptWavePoints?: Array<{ x: number; y: number }>;
  onTranscriptToggle?: () => void;

  // أزرار التفاعل
  onLike?: () => void;
  onDislike?: () => void;
  onCopy?: () => void;
  onSpeak?: () => void;

  // رسالة التغذية الراجعة
  feedbackMessage?: string;
  
  // ✅ إضافة userId
  userId?: string;
}

// ✅ مكون أيقونات التشيك - معدل: بسيط، دقيق، ويعكس الحالة فوراً
const MessageCheckStatus = ({ 
  isTranscribing, 
  isCompleted, 
  hasError 
}: {
  isTranscribing: boolean;
  isCompleted: boolean;
  hasError: boolean;
}) => {
  if (hasError) return null;

  return (
    <div className="flex items-center gap-0.5 ml-1">
      {isTranscribing ? (
        // أثناء الإرسال/التحويل: علامة واحدة (رمادية)
        <Check size={15} className="text-gray-400" />
      ) : isCompleted ? (
        // بعد الانتهاء (تم التسليم): علامتين باللون الأخضر
        <CheckCheck size={15} className="text-green-500" />
      ) : null}
    </div>
  );
};

// مكون WaveVisualizer محسن
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

  const randomPoint = useMemo(() => {
    if (!isAnimated || processedData.points.length === 0) return { x: 0, y: 12 };
    const randomIndex = Math.floor(Math.random() * processedData.points.length);
    return processedData.points[randomIndex] || { x: 0, y: 12 };
  }, [isAnimated, processedData.points]);

  const showSparkle = useMemo(() => isAnimated && Math.random() > 0.6, [isAnimated]);

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
        <filter id={`electricGlow-${pathId}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feGaussianBlur stdDeviation="6" result="bigBlur" />
          <feMerge>
            <feMergeNode in="bigBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {isAnimated && (
        <path
          d={processedData.pathData}
          fill="none"
          stroke="rgba(34, 197, 94, 0.3)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="miter"
          opacity="0.6"
          style={{ filter: "blur(4px)" }}
        />
      )}
      <path
        d={processedData.pathData}
        fill="none"
        stroke="rgba(34, 197, 94, 0.8)"
        strokeWidth="4"
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
        filter={isAnimated ? `url(#electricGlow-${pathId})` : "none"}
        className={`transition-all duration-75 ease-out ${isAnimated ? "animate-pulse" : ""}`}
        style={{
          filter: isAnimated
            ? "brightness(1.5) drop-shadow(0 0 12px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 6px rgba(34, 197, 94, 0.9))"
            : "brightness(0.9)",
          opacity: isAnimated ? "0.9" : "0.7",
        }}
      />
      {isAnimated && (
        <path
          d={processedData.pathData}
          fill="none"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="miter"
          className="animate-pulse"
          style={{
            filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))",
            animationDuration: "0.15s",
          }}
        />
      )}
      {showSparkle && (
        <circle
          cx={randomPoint.x}
          cy={randomPoint.y}
          r="1"
          fill="rgba(255, 255, 255, 1)"
          className="animate-ping"
          style={{
            filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.9))",
            animationDuration: "0.2s",
          }}
        />
      )}
    </svg>
  );
};

// مكون عرض الرسالة الصوتية
const AudioView = ({ 
  audioUrl, 
  isPlaying, 
  wavePoints, 
  timestamp, 
  isTranscribing, 
  error, 
  onTogglePlayback 
}: {
  audioUrl: string;
  isPlaying: boolean;
  wavePoints: Array<{ x: number; y: number }>;
  timestamp: string;
  isTranscribing: boolean;
  error: string | null; // ✅ تم إزالة undefined
  onTogglePlayback: () => void;
}) => {
  const handleTogglePlayback = useCallback(() => {
    onTogglePlayback();
  }, [onTogglePlayback]);

  return (
    <div className="flex items-end gap-2">
      <div className="rounded-full text-green-50  border-green-500/30 bg-gradient-to-tr from-blue-900/90 via-blue-900/90 to-violet-500 dark:from-violet-600/20  dark:via-blue-900/20  dark:to-violet-400 dark:text-green-400 dark:border-green-400/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-4 py-3 shadow-lg backdrop-blur-sm max-w-xs">
        <audio src={audioUrl} preload="metadata" />
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePlayback}
            className="text-gray-50 dark:text-green-50 hover:scale-110 transition-transform"
            title={isPlaying ? "إيقاف التسجيل" : "تشغيل التسجيل"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <div className="flex items-center justify-center h-[28px] min-w-[100px]">
            <WaveVisualizer
              width={100}
              isAnimated={isPlaying}
              segments={25}
              wavePoints={wavePoints}
            />
          </div>
          
          <div className="flex items-center">
            <span className="text-xs text-gray-100 dark:text-green-100 font-medium min-w-[40px]">
              {timestamp}
            </span>
            
            {/* ✅ تم استخدام المكون المعدل هنا */}
            <MessageCheckStatus 
              isTranscribing={isTranscribing}
              isCompleted={!isTranscribing && !error}
              hasError={!!error}
            />
          </div>
        </div>
        
        {(isTranscribing || error) && (
          <div className="text-xs opacity-80 flex items-center gap-1 mt-2">
            {error && <span className="text-red-300">❌ {error}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ChatVu(props: ChatVuProps) {
  const {
    isUser,
    isAssistant,
    content,
    messageType,
    timestamp,
    audioUrl,
    isPlaying,
    wavePoints,
    onTogglePlayback,
    transcript,
    transcriptTimestamp,
    isSpeaking,
    transcriptWavePoints,
    onTranscriptToggle,
    onLike,
    onDislike,
    onCopy,
    onSpeak,
    feedbackMessage,
    isTranscribing = false,
    error,
    userId = 'default-user' // ✅ قيمة افتراضية
  } = props;

  const defaultWavePoints = useMemo(() => [], []);
  const defaultTranscriptWavePoints = useMemo(() => [], []);
  
  const finalWavePoints = wavePoints || defaultWavePoints;
  const finalTranscriptWavePoints = transcriptWavePoints || defaultTranscriptWavePoints;

  const handleLike = useCallback(() => onLike?.(), [onLike]);
  const handleDislike = useCallback(() => onDislike?.(), [onDislike]);
  const handleCopy = useCallback(() => onCopy?.(), [onCopy]);
  const handleSpeak = useCallback(() => onSpeak?.(), [onSpeak]);
  const handleTogglePlayback = useCallback(() => onTogglePlayback?.(), [onTogglePlayback]);
  const handleTranscriptToggle = useCallback(() => onTranscriptToggle?.(), [onTranscriptToggle]);

  const actionButtons = useMemo(() => [
    { icon: ThumbsUp, action: handleLike, title: 'إعجاب', hover: 'hover:text-green-600' },
    { icon: ThumbsDown, action: handleDislike, title: 'عدم إعجاب', hover: 'hover:text-red-600' },
    { icon: Copy, action: handleCopy, title: 'نسخ', hover: 'hover:text-gray-600' },
    { icon: Volume2, action: handleSpeak, title: 'قراءة صوتية', hover: 'hover:text-violet-600' },
  ], [handleLike, handleDislike, handleCopy, handleSpeak]);

  // رسائل المستخدم
  if (isUser) {
    return (
      <>
        <div className="flex justify-end mb-6 group">
          <div className="max-w-[75%] min-w-0">
            <div className="flex items-center gap-3 mb-3 justify-end">
              <span className="text-sm font-bold bg-gradient-to-r from-violet-500 to-gray-400 dark:from-green-400 dark:to-green-600/20 bg-clip-text text-transparent font-cairo">
                أنت
              </span>
            </div>

            {messageType === 'audio' && audioUrl ? (
              <AudioView
                audioUrl={audioUrl}
                isPlaying={isPlaying || false}
                wavePoints={finalWavePoints}
                timestamp={timestamp}
                isTranscribing={isTranscribing}
                error={error || null} // ✅ تم إصلاح التمرير هنا
                onTogglePlayback={handleTogglePlayback}
              />
            ) : (
              <div className="relative">
                <div className="relative p-4 rounded-3xl backdrop-blur-sm transition-all duration-300  text-green-50 bg-gradient-to-tr from-violet-600 via-blue-900/90 to-violet-500 dark:from-violet-600/20  dark:via-blue-900/20  dark:to-green-400/20 dark:text-green-400  hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-gray-50/100 dark:border-green-600/20">
                  <div className="relative text-sm leading-relaxed whitespace-pre-wrap break-words text-slate-100 dark:text-gray-100 font-cairo text-right z-10">
                    {content}
                  </div>
                </div>
                <div className="text-xs text-violet-500 dark:text-green-400 text-right mt-1">
                  {timestamp}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* استخدام المكون الجديد TranscriptView مع userId */}
        {transcript && transcriptTimestamp && onTranscriptToggle && (
          <TranscriptView 
            transcript={transcript}
            timestamp={transcriptTimestamp}
            isSpeaking={isSpeaking || false}
            wavePoints={finalTranscriptWavePoints}
            onToggle={handleTranscriptToggle}
            userId={userId} // ✅ تمرير userId
          />
        )}
      </>
    );
  }

  // رسائل المساعد
  if (isAssistant) {
    return (
      <>
        <div className="flex gap-4 mb-6 group">
          <div className={cn('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300', ' overflow-hidden')}>
            <Image src="/DHG.svg" alt="HADG" width={96} height={96} className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-violet-600 bg-clip-text dark:from-green-400 dark:to-green-600 text-transparent font-cairo">
                الْحـَاذَكـْ
              </span>
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words text-slate-800 dark:text-slate-100 font-cairo mb-2">
              {content}
            </div>
            <div className="text-xs text-violet-600 dark:text-green-400 mb-4">
              {timestamp}
            </div>
            <div className="flex items-center gap-1">
              {actionButtons.map(({ icon: Icon, action, title, hover }) => (
                <button
                  key={title}
                  onClick={action}
                  className={cn(
                    'p-2.5 rounded-xl transition-all duration-200 group/btn',
                    'hover:scale-110 active:scale-95 text-green-600 dark:text-green-400',
                    hover,
                    'hover:shadow-lg'
                  )}
                  title={title}
                >
                  <Icon size={12} className="transition-transform group-hover/btn:scale-110" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {feedbackMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50">
            {feedbackMessage}
          </div>
        )}
      </>
    );
  }
  return null;
}