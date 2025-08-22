// ChatLayout.tsx
'use client';
import { useState } from 'react';
import { ChatMessage as ChatMessageType, localApi } from '@/app/lib/api-config';
import { generateId, isValidMessage, sanitizeMessage } from '@/app/lib/utils';
import ChatWindow from '@/components/Chat/ChatWindow';
import ChatFooter from '@/components/layouts/ChatFooter';
import { Header } from "@/components/navigation/Header";
import { Sidebar } from "@/components/navigation/Sidebar";

export default function ChatLayout() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sendMessage = async () => {
    if (!isValidMessage(inputMessage) || isLoading) return;
    
    const cleanMessage = sanitizeMessage(inputMessage);
    const userMessage: ChatMessageType = {
      id: generateId(),
      role: 'user',
      content: cleanMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setInputMessage(suggestionText);
  };

  const handleActionClick = (action: string) => {
    // Handle action button clicks
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
        // Handle voice recording
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
            onSendMessage={sendMessage}
            isLoading={isLoading}
            toggleSidebar={toggleSidebar}
            onActionClick={handleActionClick}
       
          />
        </main>
      </div>
    </div>
  );
}