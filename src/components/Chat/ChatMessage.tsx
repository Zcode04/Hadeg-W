// ChatMessage.tsx

'use client';
import { ChatMessage as ChatMessageType } from '@/app/lib/api-config';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ChatVu from '@/components/Chat/ChatVu';

interface ChatMessageProps {
  message: ChatMessageType;
}

// دالة لتنسيق الوقت
const formatTimestamp = (timestamp?: Date | string | number): string => {
  try {
    let date: Date;
    
    if (!timestamp) {
      date = new Date();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    
    // التحقق من صحة التاريخ
    if (isNaN(date.getTime())) {
      date = new Date();
    }
    
    // تنسيق الوقت بصيغة 24 ساعة
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  } catch {
    // في حالة حدوث خطأ، إرجاع الوقت الحالي
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }
};

export default function ChatMessage({ message }: ChatMessageProps) {
  // حالات التغذية الراجعة
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  // حالات النص المحول
  const [transcriptData, setTranscriptData] = useState<{transcript: string, responseTimestamp: Date} | null>(null);
  
  // حالات الرسائل الصوتية
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  // حالات Deepgram
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // حالات قراءة النص المحول
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentSpeakTimeRef = useRef(0);

  // مراجع
  const audioRef = useRef<HTMLAudioElement>(null);
  const speakTimerRef = useRef<NodeJS.Timeout | null>(null);
  const waveAnimationRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptWaveAnimationRef = useRef<NodeJS.Timeout | null>(null);
  
  // مفتاح Deepgram API
  const DEEPGRAM_API_KEY = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || "YOUR_DEEPGRAM_API_KEY";

  const isUser = message?.role === 'user';
  const isAssistant = message?.role === 'assistant';

  // إنشاء التوقيت مرة واحدة فقط وحفظه
  const messageTimestamp = useMemo(() => {
    if (message?.timestamp) {
      return message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp);
    }
    return new Date();
  }, [message?.timestamp]);

  // نقاط الموجة الأساسية للرسائل الصوتية
  const baseWavePoints = useMemo(() => {
    const points = [];
    const width = 100;
    const segments = 25;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      const baseY = 12 + Math.sin(i * 0.4) * 3;
      const randomVariation = (Math.random() - 0.5) * 2;
      const y = baseY + randomVariation;
      points.push({ x, y });
    }
    return points;
  }, []);

  // نقاط الموجة للنص المحول
  const transcriptBaseWavePoints = useMemo(() => {
    const points = [];
    const width = 80;
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      const baseY = 12 + Math.sin(i * 0.4) * 3;
      const randomVariation = (Math.random() - 0.5) * 2;
      const y = baseY + randomVariation;
      points.push({ x, y });
    }
    return points;
  }, []);

  // حساب توقيت الرد للمساعد - تم نقله قبل الشرط
  const responseTimestamp = useMemo(() => {
    if (message?.timestamp) {
      return message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp);
    }
    return new Date(messageTimestamp.getTime() + Math.random() * 90000 + 30000);
  }, [message?.timestamp, messageTimestamp]);

  const [wavePoints, setWavePoints] = useState(baseWavePoints);
  const [transcriptWavePoints, setTranscriptWavePoints] = useState(transcriptBaseWavePoints);

  useEffect(() => setMounted(true), []);

  // إعداد URL للصوت
  useEffect(() => {
    if (message?.audioBlob) {
      const url = URL.createObjectURL(message.audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [message?.audioBlob]);

  // الرسوم المتحركة للموجات الصوتية
  useEffect(() => {
    if (waveAnimationRef.current) {
      clearInterval(waveAnimationRef.current);
      waveAnimationRef.current = null;
    }

    if ((isPlaying || isTranscribing) && mounted) {
      waveAnimationRef.current = setInterval(() => {
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

    return () => {
      if (waveAnimationRef.current) {
        clearInterval(waveAnimationRef.current);
        waveAnimationRef.current = null;
      }
    };
  }, [isPlaying, isTranscribing, mounted]);

  // الرسوم المتحركة لموجات النص المحول
  useEffect(() => {
    if (transcriptWaveAnimationRef.current) {
      clearInterval(transcriptWaveAnimationRef.current);
      transcriptWaveAnimationRef.current = null;
    }

    if (isSpeaking) {
      transcriptWaveAnimationRef.current = setInterval(() => {
        const time = Date.now() * 0.008;
        setTranscriptWavePoints((prev) =>
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

    return () => {
      if (transcriptWaveAnimationRef.current) {
        clearInterval(transcriptWaveAnimationRef.current);
        transcriptWaveAnimationRef.current = null;
      }
    };
  }, [isSpeaking]);

  // عرض رسالة التغذية الراجعة
  const showFeedback = (text: string) => {
    setFeedbackMessage(text);
    setTimeout(() => setFeedbackMessage(''), 2000);
  };

  // معالجات الأحداث
  const handleLike = () => showFeedback('تم إعجابك بالرد!');
  const handleDislike = () => showFeedback('تم تسجيل عدم إعجابك');
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message?.content || '');
      showFeedback('تم نسخ النص!');
    } catch {
      showFeedback('فشل في النسخ');
    }
  };

  const handleSpeak = () => {
    if (!globalThis.speechSynthesis) {
      showFeedback('القراءة الصوتية غير مدعومة');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(message?.content || '');
    utterance.lang = 'ar-SA';
    speechSynthesis.speak(utterance);
    showFeedback('يتم قراءة النص...');
  };

  // التحكم في تشغيل الصوت
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // تحويل النص إلى كلام للنص المحول
  const speakTranscript = useCallback((text: string) => {
    if (!text.trim() || !("speechSynthesis" in window)) return;
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    const voices = speechSynthesis.getVoices();
    const arabicVoice = voices.find((voice) => voice.lang.startsWith("ar") || voice.name.includes("Arabic"));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      currentSpeakTimeRef.current = 0;
      if (speakTimerRef.current) {
        clearInterval(speakTimerRef.current);
      }
      speakTimerRef.current = setInterval(() => {
        currentSpeakTimeRef.current += 1;
      }, 1000);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (speakTimerRef.current) {
        clearInterval(speakTimerRef.current);
        speakTimerRef.current = null;
      }
      currentSpeakTimeRef.current = 0;
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (speakTimerRef.current) {
        clearInterval(speakTimerRef.current);
        speakTimerRef.current = null;
      }
      currentSpeakTimeRef.current = 0;
      setError("حدث خطأ أثناء قراءة النص");
    };

    speechSynthesis.speak(utterance);
  }, []);

  // إيقاف قراءة النص المحول
  const stopTranscriptSpeaking = useCallback(() => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (speakTimerRef.current) {
      clearInterval(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    currentSpeakTimeRef.current = 0;
  }, []);

  // التحكم في قراءة النص المحول
  const handleTranscriptToggle = () => {
    if (!transcriptData?.transcript) return;
    
    if (isSpeaking) {
      stopTranscriptSpeaking();
    } else {
      speakTranscript(transcriptData.transcript);
    }
  };

  // تحويل الصوت إلى نص باستخدام Deepgram
  const transcribeAudio = useCallback(async () => {
    if (!message?.audioBlob) {
      setError("لا يوجد ملف صوتي للتحويل");
      return;
    }
    if (!DEEPGRAM_API_KEY || DEEPGRAM_API_KEY === "YOUR_DEEPGRAM_API_KEY") {
      setError("يجب إعداد مفتاح Deepgram API");
      return;
    }

    setIsTranscribing(true);
    setError(null);

    try {
      const arrayBuffer = await message.audioBlob.arrayBuffer();
      const mimeType = message.audioBlob.type || "audio/webm";
      let contentType = "audio/webm";
      if (mimeType.includes("wav")) contentType = "audio/wav";
      else if (mimeType.includes("mp3")) contentType = "audio/mp3";
      else if (mimeType.includes("ogg")) contentType = "audio/ogg";

      const params = new URLSearchParams({
        model: "whisper-large",
        language: "ar",
        punctuate: "true",
        diarize: "false",
        smart_format: "true",
      });

      const response = await fetch(`https://api.deepgram.com/v1/listen?${params}`, {
        method: "POST",
        headers: {
          Authorization: `Token ${DEEPGRAM_API_KEY}`,
          "Content-Type": contentType,
        },
        body: arrayBuffer,
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("مفتاح API غير صحيح");
        else if (response.status === 400) throw new Error("تنسيق الملف الصوتي غير مدعوم");
        else if (response.status === 429) throw new Error("تم تجاوز حد الاستخدام");
        else throw new Error(`خطأ HTTP: ${response.status}`);
      }

      const result = await response.json();
      if (result.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
        const transcriptText = result.results.channels[0].alternatives[0].transcript.trim();
        if (transcriptText.length === 0) {
          setError("لم يتم اكتشاف أي كلام في التسجيل");
          return;
        }
        setTranscript(transcriptText);
        
        const responseTimestamp = new Date(messageTimestamp.getTime() + Math.random() * 120000 + 60000);
        setTranscriptData({ transcript: transcriptText, responseTimestamp });
      } else {
        setError("لم يتم العثور على نص في التسجيل");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === "TypeError" && err.message.includes("Failed to fetch")) {
          setError("خطأ في الاتصال بالإنترنت أو خدمة Deepgram");
        } else {
          setError(err.message || "حدث خطأ أثناء تحويل الصوت إلى نص");
        }
      }
    } finally {
      setIsTranscribing(false);
    }
  }, [message?.audioBlob, DEEPGRAM_API_KEY, messageTimestamp]);

  // التحويل التلقائي عند تحميل الصوت
  useEffect(() => {
    if (message?.audioBlob && !transcript && !isTranscribing && !error) {
      const timer = setTimeout(() => {
        transcribeAudio();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [message?.audioBlob, transcript, isTranscribing, error, transcribeAudio]);

  // إخفاء الخطأ تلقائيًا بعد 5 ثواني
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // تنظيف شامل لجميع الـ timers والـ intervals عند إلغاء المكون
  useEffect(() => {
    return () => {
      if (speakTimerRef.current) {
        clearInterval(speakTimerRef.current);
        speakTimerRef.current = null;
      }
      if (waveAnimationRef.current) {
        clearInterval(waveAnimationRef.current);
        waveAnimationRef.current = null;
      }
      if (transcriptWaveAnimationRef.current) {
        clearInterval(transcriptWaveAnimationRef.current);
        transcriptWaveAnimationRef.current = null;
      }
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // إعداد أحداث الصوت
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      const audioDuration = audio.duration;
      setDuration(isFinite(audioDuration) && audioDuration > 0 ? audioDuration : 0);
    };

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioUrl]);

  // ✅ التحقق من وجود الرسالة يجب أن يكون بعد جميع الـ Hooks
  if (!message) return null;

  return (
    <>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <ChatVu
        isUser={isUser}
        isAssistant={isAssistant}
        content={message.content || ''}
        messageType={message.messageType}
        timestamp={formatTimestamp(isUser ? messageTimestamp : responseTimestamp)}
        
        // للرسائل الصوتية
        audioUrl={audioUrl}
        isPlaying={isPlaying}
        duration={duration}
        currentTime={currentTime}
        isTranscribing={isTranscribing}
        error={error}
        wavePoints={wavePoints}
        onTogglePlayback={togglePlayback}
        
        // للنص المحول
        transcript={transcriptData?.transcript || null}
        transcriptTimestamp={transcriptData ? formatTimestamp(transcriptData.responseTimestamp) : undefined}
        isSpeaking={isSpeaking}
        transcriptWavePoints={transcriptWavePoints}
        onTranscriptToggle={handleTranscriptToggle}
        
        // أزرار التفاعل
        onLike={handleLike}
        onDislike={handleDislike}
        onCopy={handleCopy}
        onSpeak={handleSpeak}
        
        // رسالة التغذية الراجعة
        feedbackMessage={feedbackMessage}
      />
    </>
  );
}