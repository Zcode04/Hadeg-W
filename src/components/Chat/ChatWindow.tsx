// chatWindows.tsx (PERFORMANCE OPTIMIZED - Design Unchanged)
'use client';
import { ChatMessage as ChatMessageType } from '@/app/lib/api-config';
import ChatMessage from '@/components/Chat/ChatMessage';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { MessageCircle, Code, Edit3, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  onSuggestionClick?: (suggestionPrompt: string) => void;
}

export default function ChatWindow({ messages, isLoading, onSuggestionClick }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // قائمة الصور الثابتة - مع useMemo لمنع إعادة الإنشاء
  const slideImages = useMemo(() => [
    '/THG.svg',
    '/HW.svg',
    '/DHG.svg',
  ], []);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // تحسين Intersection Observer
  useEffect(() => {
    if (!imageContainerRef.current || messages.length > 0) return;

    // تنظيف Observer السابق
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observerRef.current?.unobserve(imageContainerRef.current as Element);
        }
      },
      { threshold: 0.1, rootMargin: '0px' }
    );

    observerRef.current.observe(imageContainerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [messages.length]);

  // تحسين interval management
  useEffect(() => {
    // تنظيف interval السابق
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (messages.length === 0) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % slideImages.length
        );
      }, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [messages.length, slideImages.length]);

  // تحسين scrollToBottom مع useCallback
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // الاقتراحات الثابتة مع useMemo
  const smartSuggestions = useMemo(() => [
    { icon: Edit3, text: 'كتابة مقال احترافي', prompt: 'ساعدني في كتابة مقال احترافي عن موضوع: ', color: 'from-green-400/30 to-green-400' },
    { icon: Code, text: 'مراجعة وتحسين الكود', prompt: 'راجع وحسّن هذا الكود:\n\n', color: 'from-green-400/30 to-green-400' },
    { icon: MessageCircle, text: 'ترجمة نصوص', prompt: 'ترجم هذا النص إلى الإنجليزية:\n\n', color: 'from-green-400/30 to-green-400' },
  ], []);

  // تحسين handleSuggestionClick مع useCallback
  const handleSuggestionClick = useCallback(async (item: typeof smartSuggestions[0], index: number) => {
    setLoadingSuggestion(index);
    
    setTimeout(() => {
      onSuggestionClick?.(item.prompt);
      setLoadingSuggestion(null);
    }, 800);
  }, [onSuggestionClick]);

  return (
    <div className="flex-1 overflow-y-auto relative scrollbar-hide">
      {/* خلفية ثابتة */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-300 dark:from-blue-950 dark:to-gray-950 backdrop-blur-xl" />
      </div>

      <div className="relative z-10 p-2 sm:p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="max-w-5xl w-full text-center px-4">
              <div className="mb-6 animate-fade-in">
                {/* حاوي الصور مع تأثير Blur Animation المتقدم */}
                <div 
                  ref={imageContainerRef}
                  className="relative mx-auto mb-4 h-80 sm:h-76 md:h-60 lg:h-80 xl:h-96 2xl:h-[28rem] -mt-8 w-auto"
                  style={{ perspective: '1000px' }}
                >
                  {slideImages.map((imageSrc, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-800 ease-out ${
                        index === currentImageIndex ? 'opacity-100 z-20' : 'opacity-0 z-10'
                      }`}
                      style={{
                        animationDelay: inView ? `${index * 0.2}s` : '0s',
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      <Image 
                        src={imageSrc} 
                        alt={`Slide ${index + 1}`} 
                        width={1000} 
                        height={1000} 
                        className={`w-full h-full object-contain transition-all duration-1200 ease-out ${
                          inView 
                            ? (index === currentImageIndex 
                                ? 'filter-none opacity-100 translate-y-0 scale-100' 
                                : 'blur-sm opacity-70 translate-y-2 scale-95')
                            : 'blur-xl opacity-0 translate-y-16 scale-75'
                        }`}
                        priority={index === 0}
                        style={{
                          animationDelay: inView ? `${index * 0.3}s` : '0s',
                          willChange: 'filter, opacity, transform',
                          filter: !inView 
                            ? 'blur(20px)' 
                            : (index === currentImageIndex ? 'blur(0px)' : 'blur(4px)'),
                          transform: !inView 
                            ? 'translateY(80px) scale(0.7) rotateX(25deg)' 
                            : (index === currentImageIndex 
                                ? 'translateY(0) scale(1) rotateX(0deg)' 
                                : 'translateY(20px) scale(0.95) rotateX(5deg)')
                        }}
                      />
                      
                      {/* تأثير الوهج حول الصورة النشطة */}
                      {index === currentImageIndex && (
                        <div 
                          className="absolute inset-0 pointer-events-none animate-pulse"
                          style={{
                            background: '',
                            borderRadius: ''
                          }}
                        />
                      )}
                      
                      {/* جزيئات متحركة */}
                      {index === currentImageIndex && inView && (
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(6)].map((_, particleIndex) => (
                            <div
                              key={particleIndex}
                              className="absolute w-1 h-1 rounded-full animate-bounce"
                              style={{
                                background: 'linear-gradient(45deg, #22c55e, #a855f7)',
                                top: `${20 + (particleIndex * 15)}%`,
                                left: `${10 + (particleIndex * 15)}%`,
                                animationDelay: `${particleIndex * 0.5}s`,
                                animationDuration: '3s'
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* اقتراحات مع تأثيرات Shiny وBlur و3D */}
              <div className="suggestions-container flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-20 max-w-4xl mx-auto -mt-20 xl:-mt-8 lg:-mt-8">
                {smartSuggestions.map((item, idx) => (
                  <button
                    key={`${item.text}-${idx}`}
                    onClick={() => handleSuggestionClick(item, idx)}
                    disabled={loadingSuggestion !== null}
                    className={`suggestion-button group relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 
                      bg-gradient-to-tr from-violet-700 via-blue-900/90 to-green-400 
                      dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 
                      backdrop-blur-xl border border-gray-300/40 dark:border-gray-600/30 
                      rounded-full transition-all duration-300 cursor-pointer overflow-hidden
                      transform-gpu will-change-transform
                      ${loadingSuggestion === idx 
                        ? 'scale-[1.03] shadow-2xl shadow-green-500/40 dark:shadow-green-400/40 bg-white/70 dark:bg-gray-900/50' 
                        : loadingSuggestion === null 
                          ? 'hover:bg-white/60 dark:hover:bg-gray-950/30 hover:scale-[1.03] hover:shadow-2xl hover:shadow-green-500/30 dark:hover:shadow-green-400/30 active:scale-[0.96]'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    style={{ animationDelay: `${0.1 + idx * 0.03}s` }}
                  >
                    {/* تأثير Shiny ديناميكي */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/30 to-transparent animate-shiny-sweep" 
                      style={{ animationDelay: `${idx * 0.6}s` }}
                    />

                    {/* تأثير Glow عند التحميل */}
                    {loadingSuggestion === idx && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-300/40 to-transparent animate-shimmer" />
                    )}

                    {/* تأثير Hover Sweep */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-300/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-600 ease-out" />

                    {/* الأيقونة مع تأثير 3D صغير */}
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 flex-shrink-0 relative z-10 transform-gpu active:scale-95`}>
                      {loadingSuggestion === idx ? (
                        <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-50 animate-spin" />
                      ) : (
                        <item.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-50 drop-shadow-sm" />
                      )}
                    </div>

                    <span className={`suggestion-text font-medium text-xs sm:text-sm whitespace-nowrap relative z-10 transition-colors duration-300
                      ${loadingSuggestion === idx 
                        ? 'text-green-500 dark:text-green-400' 
                        : 'text-gray-50 dark:text-gray-200 group-hover:text-green-400 dark:group-hover:text-violet-300'
                      }`}>
                      {loadingSuggestion === idx ? 'حني شوي' : item.text}
                    </span>

                    {/* طبقة Shiny إضافية عند hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-70 rounded-full transition-opacity duration-500" />

                    {/* تأثير Depth خفيف */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-300" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages?.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-start gap-4 p-6 animate-slide-up">
                <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
                  <Image 
                    src="/DHG.svg" 
                    alt="Had Logo" 
                    width={64} 
                    height={64} 
                    className="w-full h-full object-contain animate-3d-glow transform-gpu scale-105 drop-shadow-2xl"
                    priority
                  />
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1 mb-2">
                    <div className="w-2 h-2 bg-violet-600 dark:bg-green-500 rounded-full animate-pulse-dot" />
                    <div className="w-2 h-2 bg-green-500 dark:bg-violet-600 rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-600 rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium">حني شوي</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <style jsx>{`
        /* إخفاء شريط السكرول */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* تأثيرات الحركة الأساسية */
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        /* تأثيرات الحركة */
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40%           { transform: scale(1);   opacity: 1;   }
        }

        /* تأثير الوهج المتحرك (Shimmer) */
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* تأثير Shiny ديناميكي */
        @keyframes shiny-sweep {
          0% { transform: translateX(-100%); opacity: 0.3; }
          50% { transform: translateX(100%); opacity: 0.6; }
          100% { transform: translateX(-100%); opacity: 0.3; }
        }

        /* تأثير 3D + Glow + Blur متكامل */
        @keyframes 3d-glow {
          0% {
            transform: perspective(1200px) rotateY(-10deg) rotateX(5deg) scale(1);
            filter: brightness(1) drop-shadow(0 10px 20px rgba(59, 130, 246, 0.3)) blur(0.5px);
          }
          50% {
            transform: perspective(1200px) rotateY(10deg) rotateX(-5deg) scale(1.03);
            filter: brightness(1.1) drop-shadow(0 20px 40px rgba(37, 99, 235, 0.5)) blur(0px);
          }
          100% {
            transform: perspective(1200px) rotateY(-10deg) rotateX(5deg) scale(1);
            filter: brightness(1) drop-shadow(0 10px 20px rgba(59, 130, 246, 0.3)) blur(0.5px);
          }
        }

        .animate-3d-glow {
          animation: 3d-glow 4s ease-in-out infinite;
          will-change: transform, filter;
        }
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
        .animate-shiny-sweep {
          animation: shiny-sweep 2.5s ease-in-out infinite;
        }

        .transform-gpu {
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.6s ease-out forwards;
        }
        .animate-pulse-dot {
          animation: pulse-dot 1.4s ease-in-out infinite;
        }

        /* تحسينات الأداء */
        .relative * {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        /* تحسينات إضافية للتفاعل */
        .suggestion-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 193, 7, 0.25), transparent);
          transition: left 0.6s ease-out;
          pointer-events: none;
        }
        .suggestion-button:hover::before {
          left: 100%;
        }

        /* استجابة للشاشات الصغيرة */
        @media (max-width: 640px) {
          .flex-wrap { 
            justify-content: center; 
          }
        }

        @media (max-width: 480px) {
          .suggestion-button {
            font-size: 0.7rem !important;
            padding: 0.375rem 0.625rem !important;
          }
          .suggestion-button .w-4 {
            width: 0.875rem !important;
            height: 0.875rem !important;
          }
          .suggestion-button .w-2\\.5 {
            width: 0.5rem !important;
            height: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}