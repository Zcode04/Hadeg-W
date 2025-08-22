'use client';
import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useId,
  useCallback
} from 'react';
import { Play, Pause, Mic, RotateCcw, X, Power } from 'lucide-react';

export default function VoiceRecorder() {
  /* ---------- الحالات ---------- */
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [duration, setDuration] = useState(0);
  const [sent, setSent] = useState(false);

  /* ---------- نقاط المسار (ثابتة لكل مثيل) ---------- */
  const pathId = useId();
  
  // نقاط الموجة الأساسية للحبل الضوئي
  const baseWavePoints = useMemo(() => {
    const points = [];
    const width = 120; // عرض الموجة
    const segments = 30; // عدد النقاط
    
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      // موجة جيبية مع تنويع طبيعي
      const baseY = 12 + Math.sin(i * 0.4) * 3;
      const randomVariation = (Math.random() - 0.5) * 2;
      const y = baseY + randomVariation;
      points.push({ x, y });
    }
    return points;
  }, []);

  /* ---------- تأجيل العمليات إلى ما بعد الـ Hydrate ---------- */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [wavePoints, setWavePoints] = useState(baseWavePoints);

  /* ---------- الرسوم المتحركة عند التسجيل وعند التشغيل - حركة البرق ---------- */
  useEffect(() => {
    let t: NodeJS.Timeout;
    if ((isRecording || isPlayingPreview) && mounted) {
      t = setInterval(() => {
        const time = Date.now() * 0.008;
        setWavePoints(prev =>
          prev.map((point, index) => {
            // حركة البرق - زاوية حادة وتغييرات مفاجئة
            const lightningEffect = Math.sin(time + index * 0.8) * 6 * Math.random();
            const sharpChange = Math.random() > 0.7 ? (Math.random() - 0.5) * 8 : 0;
            const electricPulse = Math.sin(time * 3 + index * 0.2) * 2;
            
            const newY = point.y + lightningEffect + sharpChange + electricPulse;
            return { ...point, y: Math.max(4, Math.min(20, newY)) };
          })
        );
      }, 80); // تحديث أسرع لحركة البرق
    }
    return () => clearInterval(t);
  }, [isRecording, isPlayingPreview, mounted]);

  /* ---------- Refs ---------- */
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /* ---------- دعم المتصفح ---------- */
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('❌ متصفحك لا يدعم تسجيل الصوت.');
    }
  }, []);

  /* ---------- وظائف التحكم ---------- */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const url = URL.createObjectURL(
          new Blob(audioChunksRef.current, { type: 'audio/webm' })
        );
        setAudioURL(url);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch {
      alert('❌ حدث خطأ أثناء الوصول إلى الميكروفون.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const reset = () => {
    setAudioURL(null);
    setSent(false);
    setDuration(0);
  };

  const send = () => setSent(true);

  /* ---------- التشغيل / الإيقاف ---------- */
  const togglePreview = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !mounted) return;

    if (isPlayingPreview) {
      audio.pause();
    } else {
      audio.onended = () => setIsPlayingPreview(false);
      audio.play().catch(() => {});
    }
    setIsPlayingPreview(p => !p);
  }, [isPlayingPreview, mounted]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.onended = () => setIsPlayingPreview(false);
  }, [audioURL]);

  /* ---------- تنسيق الوقت ---------- */
  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /* ---------- إنشاء البرق الكهربائي ---------- */
  const createLightningWave = (width: number, isAnimated: boolean = false, segments: number = 30) => {
    const points = isAnimated && (isRecording || isPlayingPreview) ? wavePoints.slice(0, segments) : baseWavePoints.slice(0, segments);
    
    // إنشاء مسار البرق بخطوط حادة وزوايا مفاجئة
    let pathData = '';
    points.forEach((point, index) => {
      if (index === 0) {
        pathData = `M ${point.x} ${point.y}`;
      } else {
        // خطوط مستقيمة للحصول على شكل البرق الحاد
        pathData += ` L ${point.x} ${point.y}`;
      }
    });

    return (
      <svg width={width} height="24" className="overflow-visible">
        <defs>
          {/* تدرج للبرق الكهربائي */}
          <linearGradient id={`lightningGradient-${pathId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.2)" />
            <stop offset="25%" stopColor="rgba(134, 239, 172, 0.9)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 1)" />
            <stop offset="75%" stopColor="rgba(134, 239, 172, 0.9)" />
            <stop offset="100%" stopColor="rgba(34, 197, 94, 0.2)" />
          </linearGradient>
          
          {/* فلتر للوهج الكهربائي القوي */}
          <filter id={`electricGlow-${pathId}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feGaussianBlur stdDeviation="6" result="bigBlur"/>
            <feMerge> 
              <feMergeNode in="bigBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* تأثير الوميض */}
          <animate id={`flash-${pathId}`} attributeName="opacity" 
                   values="0.3;1;0.3" dur="0.1s" repeatCount="indefinite"/>
        </defs>
        
        {/* الوهج الخارجي الكبير */}
        {isAnimated && (
          <path
            d={pathData}
            fill="none"
            stroke="rgba(34, 197, 94, 0.3)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="miter"
            opacity="0.6"
            style={{ filter: 'blur(4px)' }}
          />
        )}
        
        {/* البرق الأساسي السميك */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(34, 197, 94, 0.8)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="miter"
          className={isAnimated ? "transition-all duration-75 ease-out" : ""}
        />
        
        {/* البرق المضيء الرفيع */}
        <path
          d={pathData}
          fill="none"
          stroke={`url(#lightningGradient-${pathId})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="miter"
          filter={isAnimated ? `url(#electricGlow-${pathId})` : "none"}
          className={`transition-all duration-75 ease-out ${isAnimated ? 'animate-pulse' : ''}`}
          style={{
            filter: isAnimated ? 'brightness(1.5) drop-shadow(0 0 12px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 6px rgba(34, 197, 94, 0.9))' : 'brightness(0.9)',
            opacity: isAnimated ? '0.9' : '0.7'
          }}
        />
        
        {/* البرق الداخلي الأبيض */}
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
              filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))',
              animationDuration: '0.15s'
            }}
          />
        )}
        
        {/* شرارات كهربائية عشوائية */}
        {isAnimated && Math.random() > 0.6 && (
          <>
            <circle
              cx={points[Math.floor(Math.random() * points.length)]?.x || 0}
              cy={points[Math.floor(Math.random() * points.length)]?.y || 12}
              r="1"
              fill="rgba(255, 255, 255, 1)"
              className="animate-ping"
              style={{ 
                filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.9))',
                animationDuration: '0.2s'
              }}
            />
            <circle
              cx={points[Math.floor(Math.random() * points.length)]?.x || 0}
              cy={points[Math.floor(Math.random() * points.length)]?.y || 12}
              r="0.5"
              fill="rgba(134, 239, 172, 1)"
              className="animate-ping"
              style={{ 
                filter: 'drop-shadow(0 0 4px rgba(134, 239, 172, 0.8))',
                animationDuration: '0.3s',
                animationDelay: '0.1s'
              }}
            />
          </>
        )}
      </svg>
    );
  };

  /* ---------- JSX ---------- */
  return (
    <div className="flex flex-col items-center justify-center z-40">
      {/* أثناء التسجيل - حجم مصغر */}
      {isRecording && (
        <div className="flex items-center gap-2 h-[42px] text-green-400 border-green-400 bg-gradient-to-tr from-violet-600 via-blue-900/90 to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 dark:text-green-400 dark:border-green-400/10 rounded-full px-3 py-2 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-center min-w-[100px] h-[26px]">
            {createLightningWave(100, true, 25)}
          </div>
          <span className="text-green-50 dark:text-green-500 font-medium text-sm min-w-[35px]">
            {fmt(duration)}
          </span>
          <button onClick={stopRecording} className="text-green-50 dark:text-green-500 hover:scale-110 transition-transform">
            <Pause size={18} />
          </button>
          <button
            onClick={() => {
              stopRecording();
              reset();
            }}
            className="text-green-50 dark:text-green-500 hover:scale-110 transition-transform"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* زر بدء التسجيل */}
      {!isRecording && !audioURL && (
        <button
          onClick={startRecording}
          className="w-9 h-9 rounded-full text-green-200 border-green-400 bg-gradient-to-tr from-violet-600 via-blue-900/90 to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 dark:text-green-400 dark:border-green-400/10 flex items-center justify-center transition-all hover:scale-105 shadow-lg backdrop-blur-sm"
        >
          <Mic size={24} />
        </button>
      )}

      {/* معاينة التسجيل */}
      {audioURL && !sent && (
        <div className="flex items-center gap-3 rounded-full px-3 py-2 text-green-400 border-green-400 bg-gradient-to-tr from-violet-600 via-blue-900/90 to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 dark:text-green-400 dark:border-green-400/10 hover:bg-blue-100/20 dark:hover:bg-blue-900/30 transition-all shadow-lg backdrop-blur-sm">
          <button 
            onClick={togglePreview} 
            className="text-green-50 dark:text-green-500 hover:scale-110 transition-transform"
          >
            {isPlayingPreview ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <div className="flex items-center justify-center h-[24px] min-w-[80px]">
            {createLightningWave(80, isPlayingPreview, 20)}
          </div>
          <span className="text-sm text-green-50 dark:text-green-500 font-medium min-w-[35px]">
            {fmt(duration)}
          </span>
          <button 
            onClick={send} 
            className="text-green-50 dark:text-green-500 hover:scale-110 transition-transform"
          >
            <Power size={18} />
          </button>
          <button 
            onClick={reset} 
            className="text-green-50 dark:text-green-500 hover:scale-110 transition-transform"
          >
            <RotateCcw size={18} />
          </button>
          {/* يُظهر <audio> فقط بعد الـ Hydrate */}
          {mounted && <audio ref={audioRef} src={audioURL} className="hidden" />}
        </div>
      )}

      {/* بعد الإرسال */}
      {sent && audioURL && (
        <div className="text-green-200 border-green-400 bg-gradient-to-tr from-violet-600 via-blue-900/90 to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 dark:text-green-400 dark:border-green-400/10 rounded-2xl rounded-bl-none px-4 py-3 self-end shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={togglePreview} 
              className="text-green-50 dark:text-green-500 hover:scale-110 transition-transform"
            >
              {isPlayingPreview ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <div className="flex items-center justify-center h-[28px] min-w-[120px]">
              {createLightningWave(120, isPlayingPreview, 30)}
            </div>
            <span className="text-xs text-green-50 dark:text-green-500 font-medium">
              {fmt(duration)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}