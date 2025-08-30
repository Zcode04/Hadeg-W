//ChatLayout.tsx

'use client';
import { useState } from 'react';
import { ChatMessage as ChatMessageType, localApi } from '@/app/lib/api-config';
import { generateId, isValidMessage, sanitizeMessage } from '@/app/lib/utils';
import ChatWindow from '@/components/Chat/ChatWindow';
import ChatFooter from '@/components/layouts/ChatFooter';
import { Header } from "@/components/navigation/Header";
import { Sidebar } from "@/components/navigation/Sidebar";

export default function ChatLayout() {
  // المتغيرات الحالية
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // المتغيرات الجديدة للتسجيل الصوتي
  const [audioRecording, setAudioRecording] = useState<Blob | null>(null);
  const [hasAudioRecording, setHasAudioRecording] = useState(false);
  const [resetVoiceRecorder, setResetVoiceRecorder] = useState(false); // إشارة إعادة التعيين

  // ✅ دالة إرسال الرسائل النصية المحسنة
  const sendMessage = async (messageText?: string) => {
    // استخدم النص المُمرر أو النص الحالي في الإدخال
    const textToSend = messageText || inputMessage;
    
    if (!isValidMessage(textToSend) || isLoading) return;

    const cleanMessage = sanitizeMessage(textToSend);
    const userMessage: ChatMessageType = {
      id: generateId(),
      role: 'user',
      content: cleanMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage(''); // ✅ مسح الإدخال بعد الإرسال
    setIsLoading(true);
    setError(null);

    try {
      const response = await localApi.post('/chat', {
        message: cleanMessage,
        messages: messages,
      });

      if (response.data.success) {
        const assistantMessage: ChatMessageType = {
          id: generateId(),
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setError(response.data.error || 'حدث خطأ غير معروف');
      }
    } catch (err: unknown) {
      console.error('خطأ في إرسال الرسالة:', err);
      const errorMessage = err instanceof Error && 'response' in err && err.response &&
        typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? String(err.response.data.message)
        : 'فشل في الاتصال بالخادم، تأكد من اتصالك بالإنترنت وحاول مرة أخرى';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // دالة التعامل مع التسجيل الصوتي عند الانتهاء
  const handleRecordingComplete = (audioBlob: Blob) => {
    setAudioRecording(audioBlob);
    setHasAudioRecording(true);
  };

  // دالة حذف التسجيل الصوتي
  const handleRecordingDelete = () => {
    setAudioRecording(null);
    setHasAudioRecording(false);
  };

  // دالة إرسال أو تحويل التسجيل الصوتي مع إعادة تعيين الحالة
  const handleSendOrTranscribe = async () => {
    if (!audioRecording || isLoading) return;

    const audioMessage: ChatMessageType = {
      id: generateId(),
      role: 'user',
      content: '[تسجيل صوتي]',
      timestamp: new Date(),
      audioBlob: audioRecording,
      messageType: 'audio'
    };

    setMessages(prev => [...prev, audioMessage]);
    
    // ✅ إعادة تعيين حالة التسجيل الصوتي فورًا بعد الإرسال
    setAudioRecording(null);
    setHasAudioRecording(false);
    
    // ✅ إرسال إشارة إعادة تعيين للمكونات الفرعية
    setResetVoiceRecorder(true);
    setTimeout(() => setResetVoiceRecorder(false), 100); // إعادة تعيين الإشارة
    
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', new Blob([audioRecording]), 'recording.webm');
      formData.append('messages', JSON.stringify(messages));

      const response = await localApi.post('/chat/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const assistantMessage: ChatMessageType = {
          id: generateId(),
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setError(response.data.error || 'حدث خطأ في معالجة التسجيل الصوتي');
      }
    } catch (err: unknown) {
      console.error('خطأ في إرسال التسجيل الصوتي:', err);
      const errorMessage = 'فشل في إرسال التسجيل الصوتي';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // دالة تبديل الشريط الجانبي
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // ✅ دالة التعامل مع الاقتراحات المحسنة
  const handleSuggestionClick = (suggestionText: string) => {
    // إرسال الاقتراح مباشرة دون انتظار
    sendMessage(suggestionText);
  };

  // دالة التعامل مع أزرار الإجراءات
  const handleActionClick = (action: string) => {
    switch (action) {
      case 'create_image':
        setInputMessage('أنشئ صورة ');
        break;
      case 'web_search':
        setInputMessage('ابحث في الويب عن ');
        break;
      case 'deep_thinking':
        setInputMessage('فكر بعمق في ');
        break;
      case 'music':
        setInputMessage('أنشئ موسيقى ');
        break;
      case 'coding':
        setInputMessage('اكتب كود ');
        break;
      case 'voice_record':
        // لا حاجة لعمل شيء هنا لأن التسجيل يتم التعامل معه في ChatFooter
        break;
      default:
        break;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">
          <Sidebar isOpen={isSidebarOpen} />

          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSuggestionClick={handleSuggestionClick}
          />

          {error && (
            <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">⚠️ {error}</p>
            </div>
          )}

          <ChatFooter
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSendMessage={() => sendMessage()}
            isLoading={isLoading}
            toggleSidebar={toggleSidebar}
            onActionClick={handleActionClick}
            hasAudioRecording={hasAudioRecording}
            handleSendOrTranscribe={handleSendOrTranscribe}
            onRecordingComplete={handleRecordingComplete}
            onRecordingDelete={handleRecordingDelete}
            resetVoiceRecorder={resetVoiceRecorder} // ✅ تمرير الإشارة
          />
        </main>
      </div>
    </div>
  );
}