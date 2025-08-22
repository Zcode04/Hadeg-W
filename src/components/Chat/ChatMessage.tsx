// ChatMessage.tsx (الإصدار المصحَّح)
'use client';

import { ChatMessage as ChatMessageType } from '@/app/lib/api-config';
import { cn } from '@/app/lib/utils';
import { ThumbsUp, ThumbsDown, Copy, RotateCcw, Volume2 } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const isUser = message?.role === 'user';
  const isAssistant = message?.role === 'assistant';

  const showFeedback = (text: string) => {
    setFeedbackMessage(text);
    setTimeout(() => setFeedbackMessage(''), 2000);
  };

  const handleLike = () => showFeedback('تم إعجابك بالرد!');
  const handleDislike = () => showFeedback('تم تسجيل عدم إعجابك');
  const handleRegenerate = () => showFeedback('يتم إعادة توليد الرد...');

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

  if (!message) return null;

  // رسائل المستخدم
  if (isUser) {
    return (
      <>
        <div className="flex justify-end mb-6 group">
          <div className="max-w-[75%] min-w-0">
            <div className="flex items-center gap-3 mb-3 justify-end">
              <span className="text-sm font-bold bg-gradient-to-r from-green-500 to-gray-400 dark:from-green-400 dark:to-green-600 bg-clip-text text-transparent font-cairo">
                أنت
              </span>
            </div>
            <div
              className={cn(
                'relative p-4 rounded-3xl backdrop-blur-sm transition-all duration-300',
                'bg-gradient-to-br from-emerald-900 to-emerald-900',
                'dark:from-zinc-950/100 dark:to-gray-900/100',
                'border border-gray-50/100 dark:border-green-600/20',
                'overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden'
              )}
            >
              <div className="relative text-sm leading-relaxed whitespace-pre-wrap break-words text-slate-100 dark:text-gray-100 font-cairo text-right z-10">
                {message.content}
              </div>
            </div>
          </div>
        </div>

        {feedbackMessage && (
          <div
            className={cn(
              'fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 z-50 font-cairo',
              'bg-gradient-to-r from-slate-800/95 to-slate-900/95 dark:from-slate-700/95 dark:to-slate-800/95',
              'backdrop-blur-md border border-green-200/20 dark:border-green-700/20',
              'text-white dark:text-slate-100'
            )}
          >
            {feedbackMessage}
          </div>
        )}
      </>
    );
  }

  // رسائل المساعد
  if (isAssistant) {
    return (
      <>
        <div className="flex gap-4 mb-6 group">
          <div
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
              'shadow-lg hover:shadow-xl group-hover:scale-105 overflow-hidden'
            )}
          >
            <Image src="/DHG.svg" alt="HADG" width={96} height={96} className="w-full h-full object-contain" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent font-cairo">
                الـحـاذگ
              </span>
            </div>

            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words text-slate-800 dark:text-slate-100 font-cairo mb-4">
              {message.content}
            </div>

            <div className="flex items-center gap-1">
              {[
                { icon: ThumbsUp, action: handleLike, title: 'إعجاب', hover: 'hover:text-green-600' },
                { icon: ThumbsDown, action: handleDislike, title: 'عدم إعجاب', hover: 'hover:text-red-600' },
                { icon: Copy, action: handleCopy, title: 'نسخ', hover: 'hover:text-gray-600' },
                { icon: RotateCcw, action: handleRegenerate, title: 'إعادة توليد', hover: 'hover:text-orange-600' },
                { icon: Volume2, action: handleSpeak, title: 'قراءة صوتية', hover: 'hover:text-violet-600' },
              ].map(({ icon: Icon, action, title, hover }) => (
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
                  <Icon size={14} className="transition-transform group-hover/btn:scale-110" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {feedbackMessage && (
          <div
            className={cn(
              'fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 z-50 font-cairo',
              'bg-gradient-to-r from-slate-800/95 to-slate-900/95 dark:from-slate-700/95 dark:to-slate-800/95',
              'backdrop-blur-md border border-blue-200/20 dark:border-blue-700/20',
              'text-white dark:text-slate-100'
            )}
          >
            {feedbackMessage}
          </div>
        )}
      </>
    );
  }

  return null;
}