//VoiceRecorder.tsx

'use client';

import { useState, useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Mic,CircleFadingArrowUp, CirclePlay,  Trash2 ,CircleFadingPlus , CirclePause} from 'lucide-react';

import { cn } from '@/app/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onRecordingDelete?: () => void;
  className?: string;
}

// إضافة واجهة المرجع
export interface VoiceRecorderRef {
  resetRecording: () => void;
}

// مكون WaveVisualizer مع تأثيرات البرق المتقدمة
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
  const pathId = `wave-${Math.random().toString(36).substr(2, 9)}`;

  const points = wavePoints.slice(0, segments);

  let pathData = "";
  points.forEach((point, index) => {
    if (index === 0) {
      pathData = `M ${point.x} ${point.y}`;
    } else {
      pathData += ` L ${point.x} ${point.y}`;
    }
  });

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
          d={pathData}
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
        d={pathData}
        fill="none"
        stroke="rgba(34, 197, 94, 0.8)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="miter"
        className={isAnimated ? "transition-all duration-75 ease-out" : ""}
      />
      <path
        d={pathData}
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
          d={pathData}
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
      {isAnimated && Math.random() > 0.6 && (
        <circle
          cx={points[Math.floor(Math.random() * points.length)]?.x || 0}
          cy={points[Math.floor(Math.random() * points.length)]?.y || 12}
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

const VoiceRecorder = forwardRef<VoiceRecorderRef, VoiceRecorderProps>(({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  onRecordingDelete,
  className
}, ref) => {
  // الحد الأقصى للتسجيل (5 ثوان)
  const MAX_RECORDING_TIME = 5;

  // حالات التسجيل
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');
  
  // حالات التشغيل
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  
  
// audioLevel: تُستخدم لتغذية تحليل الصوت الحي ورسم الموجة
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const [audioLevel, setAudioLevel] = useState(0);

  // نقاط الموجة الأساسية للحبل الضوئي
  const baseWavePoints = useMemo(() => {
    const points = [];
    const width = 120;
    const segments = 30;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      const baseY = 12 + Math.sin(i * 0.4) * 3;
      const randomVariation = (Math.random() - 0.5) * 2;
      const y = baseY + randomVariation;
      points.push({ x, y });
    }
    return points;
  }, []);

  const [wavePoints, setWavePoints] = useState(baseWavePoints);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // الرسوم المتحركة عند التسجيل وعند التشغيل - حركة البرق
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (((isRecording && !isPaused) || isPlaying) && mounted) {
      t = setInterval(() => {
        const time = Date.now() * 0.008;
        setWavePoints((prev) =>
          prev.map((point, index) => {
            const lightningEffect = Math.sin(time + index * 0.8) * 6 * Math.random();
            const sharpChange = Math.random() > 0.7 ? (Math.random() - 0.5) * 8 : 0;
            const electricPulse = Math.sin(time * 3 + index * 0.2) * 2;
            const newY = point.y + lightningEffect + sharpChange + electricPulse;
            return { ...point, y: Math.max(4, Math.min(20, newY)) };
          })
        );
      }, 80);
    }
    return () => clearInterval(t);
  }, [isRecording, isPaused, isPlaying, mounted]);

  // المراجع
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // دالة إعادة تعيين الحالة بالكامل
  const resetRecording = () => {
    // إيقاف التسجيل إذا كان نشطًا
    if (isRecording) {
      stopRecording();
    }
    
    // إيقاف التشغيل إذا كان نشطًا
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // مسح جميع الحالات
    setAudioBlob(null);
    setAudioUrl('');
    setDuration(0);
    setPlaybackTime(0);
    setIsPlaying(false);
    setIsRecording(false);
    setIsPaused(false);
    setAudioLevel(0);
    
    // مسح URL القديم لتجنب تسريب الذاكرة
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  // كشف المرجع للمكون الأب
  useImperativeHandle(ref, () => ({
    resetRecording
  }));

  // تنظيف الموارد
  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  // تحليل الصوت
  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // حساب مستوى الصوت
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(average);

    if (isRecording && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  };

  // بدء التسجيل
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;
      
      // إعداد تحليل الصوت
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      
      // إعداد المسجل
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        onRecordingComplete?.(blob, duration);
      };
      
      // بدء التسجيل
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      
      // بدء العداد مع الحد الأقصى
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          const newTime = prev + 1;
          if (newTime >= MAX_RECORDING_TIME) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
      
      // بدء تحليل الصوت
      analyzeAudio();
      
      onRecordingStart?.();
      
    } catch (error) {
      console.error('خطأ في بدء التسجيل:', error);
    }
  };

  // إيقاف التسجيل
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    setIsPaused(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    onRecordingStop?.();
  };

  // إيقاف مؤقت للتسجيل
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  // استئناف التسجيل
  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // استئناف العداد مع التحقق من الحد الأقصى
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          const newTime = prev + 1;
          if (newTime >= MAX_RECORDING_TIME) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
      
      analyzeAudio();
    }
  };

  // حذف التسجيل
  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl('');
    setDuration(0);
    setPlaybackTime(0);
    setIsPlaying(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    onRecordingDelete?.();
  };

  // تشغيل/إيقاف التسجيل
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // تنسيق الوقت
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // دالة للحصول على نص الحالة مع عداد تنازلي
  const getStatusText = () => {
    if (isPlaying && duration > 0 && playbackTime < duration) {
      const remainingTime = Math.max(0, duration - Math.floor(playbackTime));
      return formatTime(remainingTime);
    }
    return formatTime(duration);
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* التسجيل الحالي - بالتصميم الجديد */}
      {audioBlob && (
        <>
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={(e) => setPlaybackTime(e.currentTarget.currentTime)}
            onEnded={() => {
              setIsPlaying(false);
              setPlaybackTime(0);
            }}
            preload="metadata"
          />
          
          <div className="flex items-center gap-3 rounded-full px-3 py-2 text-green-400 border-green-400 bg-gradient-to-tr from-violet-600 via-blue-900/90 to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 dark:text-green-400 dark:border-green-400/10 hover:bg-blue-100/20 dark:hover:bg-blue-900/30 transition-all shadow-lg backdrop-blur-sm">
            <button
              onClick={togglePlayback}
              className="text-green-50 dark:text-green-500 hover:scale-110 transition-transform"
              title={isPlaying ? "إيقاف التشغيل" : "تشغيل التسجيل"}
            >
              {isPlaying ? <CirclePause size={20} /> : <CirclePlay size={20} />}
            </button>
            <div className="flex items-center justify-center h-[24px] min-w-[80px]">
              <WaveVisualizer
                width={80}
                isAnimated={isPlaying}
                segments={20}
                wavePoints={wavePoints}
              />
            </div>
            <span className="text-sm text-green-50 dark:text-green-500 font-medium min-w-[45px]">
              {getStatusText()}
            </span>
            <button 
              onClick={deleteRecording}
              className="text-green-50 dark:text-green-500 hover:scale-110 transition-transform"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </>
      )}

      {/* واجهة التسجيل - بالتصميم الجديد */}
      {!audioBlob && (
        <div className="flex flex-col items-center gap-3">
          {/* أثناء التسجيل مع عداد تنازلي */}
          {isRecording && (
            <div className="flex items-center gap-2 h-[42px] text-green-400 border-green-400 bg-gradient-to-tr from-violet-600 via-blue-900/90 to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 dark:text-green-400 dark:border-green-400/10 rounded-full px-3 py-2 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-center min-w-[100px] h-[26px]">
                <WaveVisualizer
                  width={100}
                  isAnimated={!isPaused}
                  segments={25}
                  wavePoints={wavePoints}
                />
              </div>
              <span className="text-green-50 dark:text-green-500 font-medium text-sm min-w-[35px]">
                {formatTime(duration)} / {formatTime(MAX_RECORDING_TIME)}
              </span>
              <button
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="text-green-50 dark:text-green-300 hover:scale-110 transition-transform"
              >
                {isPaused ? <CircleFadingPlus size={18} /> : <CirclePause size={18} />}
              </button>
              <button
                onClick={stopRecording}
                className="text-green-50 dark:text-green-400 hover:scale-110 transition-transform"
              >
                <CircleFadingArrowUp size={18} />
              </button>
            </div>
          )}
          
          {/* زر بدء التسجيل */}
          {!isRecording && (
            <button
              onClick={startRecording}
              className="w-9 h-9 rounded-full text-green-200 border-green-400 bg-gradient-to-tr from-violet-600 via-blue-900/90 to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 dark:text-green-400 dark:border-green-400/10 flex items-center justify-center transition-all hover:scale-105 shadow-lg backdrop-blur-sm"
            >
              <Mic size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  );
});

VoiceRecorder.displayName = 'VoiceRecorder';

export default VoiceRecorder;