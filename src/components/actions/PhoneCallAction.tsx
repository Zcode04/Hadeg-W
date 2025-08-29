//PhoneCallAction.tsx



"use client";
import { PhoneOutgoing, Phone, PhoneOff } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Extend Window interface to include webkit audio context
interface ExtendedWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

const VoiceCallComponent = () => {
  // State
  const [open, setOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const speechAnimationRef = useRef<NodeJS.Timeout | null>(null);

  // Deepgram API Key
  const DEEPGRAM_API_KEY = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || "YOUR_DEEPGRAM_API_KEY";

  // Check for speech synthesis support
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSupported(true);
    }
  }, []);

  // Reset all states to initial values
  const resetAllStates = useCallback(() => {
    setIsRecording(false);
    setIsListening(false);
    setRecordingTime(0);
    setError(null);
    setIsTranscribing(false);
    setIsSpeaking(false);
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
    }
  }, [audioURL]);

  // Create speech animation for visual feedback during TTS
  const startSpeechAnimation = useCallback(() => {
    if (speechAnimationRef.current) {
      clearInterval(speechAnimationRef.current);
    }
    
    speechAnimationRef.current = setInterval(() => {
      // This will trigger the AudioWave component to animate during speech
    }, 100);
  }, []);

  const stopSpeechAnimation = useCallback(() => {
    if (speechAnimationRef.current) {
      clearInterval(speechAnimationRef.current);
      speechAnimationRef.current = null;
    }
  }, []);

  // Speak text using speech synthesis
  const speakText = useCallback(
    (text: string) => {
      if (!speechSupported || !text.trim()) return;
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      const voices = speechSynthesis.getVoices();
      let selectedVoice = voices.find(
        (voice) =>
          (voice.lang.startsWith("ar") || voice.name.includes("Arabic")) &&
          voice.name.toLowerCase().includes("male")
      );
      if (!selectedVoice) {
        selectedVoice = voices.find((voice) => voice.name.toLowerCase().includes("male"));
      }
      if (!selectedVoice) {
        selectedVoice = voices.find((voice) => voice.lang.startsWith("ar"));
      }
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.onstart = () => {
        setIsSpeaking(true);
        startSpeechAnimation();
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        stopSpeechAnimation();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        stopSpeechAnimation();
        setError("حدث خطأ أثناء قراءة النص");
      };
      speechSynthesis.speak(utterance);
    },
    [speechSupported, startSpeechAnimation, stopSpeechAnimation]
  );

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      stopSpeechAnimation();
    }
  }, [stopSpeechAnimation]);

  // Transcribe audio using Deepgram API
  const transcribeAudio = useCallback(
    async (audioBlob: Blob) => {
      if (!audioBlob) {
        setError("لا يوجد ملف صوتي للتحويل");
        return;
      }
      if (!DEEPGRAM_API_KEY || DEEPGRAM_API_KEY === "") {
        setError("يجب إعداد مفتاح Deepgram API أولاً");
        return;
      }
      setIsTranscribing(true);
      setError(null);
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const mimeType = audioBlob.type || "audio/webm";
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
          if (response.status === 401) throw new Error("مشكيلة فى نظام ");
          else if (response.status === 400) throw new Error("تنسيق الملف الصوتي غير مدعوم");
          else if (response.status === 429) throw new Error("تم تجاوز حد الاستخدام");
          else throw new Error(`خطأ HTTP: ${response.status}`);
        }
        const result = await response.json();
        if (result.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
          const transcript = result.results.channels[0].alternatives[0].transcript.trim();
          if (transcript.length === 0) {
            setError("لم يتم اكتشاف أي كلام في التسجيل");
            return;
          }
          setTimeout(() => {
            speakText(transcript);
          }, 1000);
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
    },
    [DEEPGRAM_API_KEY, speakText]
  );

  // Cleanup resources (stop recording, timers, etc.)
  const cleanupResources = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    stopSpeaking();
    stopSpeechAnimation();
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
  }, [stopSpeaking, stopSpeechAnimation]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  // Timer for recording duration
  useEffect(() => {
    if (isRecording && open) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= 5) {
            stopRecording();
            return 5;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setRecordingTime(0);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording, open, stopRecording]);

  // Format time (e.g., 00:05)
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      setError(null);
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      setError("لم يتم منح إذن الوصول للميكروفون");
      setHasPermission(false);
      return false;
    }
  }, []);

  // Handle microphone permission and cleanup on dialog open/close
  useEffect(() => {
    if (open && !hasPermission) {
      requestMicrophonePermission();
    }
    if (!open) {
      cleanupResources();
      resetAllStates();
    }
  }, [open, hasPermission, requestMicrophonePermission, cleanupResources, resetAllStates]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      cleanupResources();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;

      // Setup Web Audio API for real-time audio visualization
      const extendedWindow = window as ExtendedWindow;
      const AudioContextConstructor = window.AudioContext || extendedWindow.webkitAudioContext;
      
      if (!AudioContextConstructor) {
        throw new Error("AudioContext not supported");
      }

      const audioContext = new AudioContextConstructor();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      audioChunksRef.current = [];
      let options = {};
      if (MediaRecorder.isTypeSupported("audio/wav")) {
        options = { mimeType: "audio/wav" };
      } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        options = { mimeType: "audio/webm;codecs=opus" };
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/webm" };
      }

      const recorder = new MediaRecorder(stream, options);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || "audio/wav";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioURL((prevURL) => {
          if (prevURL) {
            URL.revokeObjectURL(prevURL);
          }
          return url;
        });
        setTimeout(async () => {
          await transcribeAudio(blob);
        }, 1000);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };
      recorder.onerror = () => {
        setError("حدث خطأ أثناء التسجيل");
        cleanupResources();
        setIsRecording(false);
        setIsListening(false);
      };
      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setIsRecording(true);
      setError(null);
      setTimeout(() => setIsListening(true), 500);
      autoStopTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 10000);
    } catch {
      setError("خطأ في بدء التسجيل");
      cleanupResources();
      setIsRecording(false);
      setIsListening(false);
    }
  }, [cleanupResources, transcribeAudio, stopRecording]);

  // Handle icon action (start/stop recording, speak/stop speaking)
  const handleIconAction = useCallback(async () => {
    if (isRecording) {
      cleanupResources();
      setOpen(false);
      return;
    }
    if (isSpeaking) {
      stopSpeaking();
      setOpen(false);
      return;
    }
    if (isTranscribing) {
      setIsTranscribing(false);
      setAudioURL(null);
      setIsListening(false);
      setError(null);
      cleanupResources();
      setOpen(false);
      return;
    }
    if (!hasPermission) {
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) return;
    }
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
    }
    setIsListening(false);
    await startRecording();
  }, [
    isRecording,
    isSpeaking,
    isTranscribing,
    hasPermission,
    audioURL,
    requestMicrophonePermission,
    startRecording,
    cleanupResources,
    stopSpeaking,
  ]);

  // Close modal and cleanup with complete state reset
  const handleCloseModal = useCallback(() => {
    cleanupResources();
    resetAllStates();
    setOpen(false);
  }, [cleanupResources, resetAllStates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupResources();
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [cleanupResources, audioURL]);

  // Audio wave animation component with real-time audio visualization
  const AudioWave = () => {
    const barsCount = 7;
    const [barHeights, setBarHeights] = useState<number[]>(Array(barsCount).fill(14));

    useEffect(() => {
      let animationId: number;
      
      const updateBars = () => {
        if (analyserRef.current && isRecording) {
          // Use real audio data during recording
          const analyser = analyserRef.current;
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          const normalizedAverage = Math.min(average / 30, 1);
          const newHeights = Array.from({ length: barsCount }, () => 14 + normalizedAverage * 30);
          setBarHeights(newHeights);
        } else if (isSpeaking) {
          // Create animated bars during speech synthesis
          const newHeights = Array.from({ length: barsCount }, () => {
            const randomHeight = 14 + Math.random() * 25;
            return randomHeight;
          });
          setBarHeights(newHeights);
        } else if (audioURL && !isRecording) {
          // Static animation for completed recording
          const newHeights = Array.from({ length: barsCount }, (_, index) => {
            const baseHeight = 14 + Math.sin(Date.now() * 0.003 + index) * 8;
            return Math.max(14, baseHeight);
          });
          setBarHeights(newHeights);
        }
        
        animationId = requestAnimationFrame(updateBars);
      };

      if (isRecording || isSpeaking || (audioURL && !isRecording)) {
        animationId = requestAnimationFrame(updateBars);
      } else {
        setBarHeights(Array(barsCount).fill(14));
      }

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }, [isRecording, isSpeaking, audioURL, barsCount]);

    return (
      <div className="flex items-center justify-center space-x-1.5">
        {Array.from({ length: barsCount }, (_, index) => (
          <div
            key={index}
            className="bg-gradient-to-t from-green-300 via-blue-400 to-cyan-300 rounded-full shadow-lg shadow-cyan-300/30"
            style={{
              width: "4px",
              height: `${barHeights[index]}px`,
              transition: "height 0.1s ease-out",
            }}
          />
        ))}
      </div>
    );
  };

  // Determine if waves should be shown
  const shouldShowWaves = isListening || (audioURL && !isRecording) || isSpeaking;

  // Determine if recording is completed
  const isCompleted = audioURL && !isRecording && !isTranscribing && !isSpeaking;

  // Render
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full text-green-200 dark:text-green-400 border-green-300/30 dark:border-green-500/30 hover:bg-green-100 dark:hover:bg-green-400/20 transition-all duration-200 bg-transparent"
          aria-label="بدء مكالمة صوتية"
        >
          <PhoneOutgoing className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-tr from-violet-700 via-blue-900/50 to-green-400/50 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 backdrop-blur-xl border border-gray-300/40 dark:border-gray-600/30 rounded-3xl max-w-md mx-auto">
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="relative flex items-center justify-center">
            {shouldShowWaves && (
              <>
                <div className="absolute w-40 h-40 rounded-full border-2 border-white/20 animate-ping"></div>
                <div
                  className="absolute w-48 h-48 rounded-full border border-white/10 animate-ping"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                  className="absolute w-56 h-56 rounded-full border border-white/5 animate-ping"
                  style={{ animationDelay: "1s" }}
                ></div>
              </>
            )}
            <div
              className={`relative z-10 w-40 h-40 rounded-full bg-gradient-to-t from-blue-950 via-blue-800 to-purple-500/80 backdrop-blur-sm flex items-center justify-center text-white font-bold shadow-2xl border-2 border-white/20 ${
                shouldShowWaves ? "scale-105" : ""
              } transition-transform duration-300`}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
                THG
              </div>
            </div>
          </div>
          <div className="text-center space-y-4">
            {error ? (
              <p className="text-red-300 text-lg font-semibold tracking-wide" role="alert">
                {error}
              </p>
            ) : (
              <p className="text-white/90 text-lg font-semibold tracking-wide">
                {!hasPermission
                  ? "يجب السماح بالوصول للميكروفون"
                  : !isRecording && !audioURL && !isSpeaking
                  ? "ابدأ التسجيل"
                  : isRecording
                  ? "جاري التسجيل..."
                  : isTranscribing
                  ? "جاري تحويل الصوت إلى نص..."
                  : isSpeaking
                  ? "جاري القراءة..."
                  : "تم التسجيل"}
              </p>
            )}
            {shouldShowWaves && (
              <div className="flex flex-col items-center space-y-3">
                <AudioWave />
                {isRecording && (
                  <div className="px-4 py-1.5 bg-gradient-to-r from-blue-500/20 to-green-400/20 backdrop-blur-sm rounded-full border border-white/10">
                    <span className="text-white/80 text-sm font-mono tracking-wider">
                      {formatTime(recordingTime)} / 00:05
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center">
            {isCompleted ? (
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleIconAction}
                  className="h-16 w-16 rounded-full transition-all duration-300 backdrop-blur-sm border-2 bg-green-500/90 hover:bg-green-500 border-green-300/50 text-white shadow-lg shadow-green-500/25 hover:scale-105"
                  aria-label="تسجيل جديد"
                >
                  <Phone className="h-6 w-6" />
                </Button>
                <Button
                  onClick={handleCloseModal}
                  className="h-16 w-16 rounded-full transition-all duration-300 backdrop-blur-sm border-2 bg-red-500/90 hover:bg-red-500 border-red-300/50 text-white shadow-lg shadow-red-500/25 hover:scale-105"
                  aria-label="إغلاق"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleIconAction}
                disabled={Boolean(error && !hasPermission)}
                className={`h-16 w-16 rounded-full transition-all duration-300 backdrop-blur-sm border-2 ${
                  isRecording || isSpeaking || isTranscribing
                    ? "bg-red-500/90 hover:bg-red-500 border-red-300/50 text-white shadow-lg shadow-red-500/25"
                    : hasPermission
                    ? "bg-green-500/90 hover:bg-green-500 border-green-300/50 text-white shadow-lg shadow-green-500/25"
                    : "bg-gray-500/90 hover:bg-gray-500 border-gray-300/50 text-white shadow-lg shadow-gray-500/25"
                } ${Boolean(error && !hasPermission) ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                aria-label={isRecording ? "إيقاف التسجيل" : isSpeaking ? "إيقاف القراءة" : isTranscribing ? "إلغاء التحويل" : "بدء التسجيل"}
              >
                {isRecording || isSpeaking || isTranscribing ? (
                  <PhoneOff className="h-6 w-6" />
                ) : (
                  <Phone className="h-6 w-6" />
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceCallComponent;