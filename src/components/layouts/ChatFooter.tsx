// ChatFooter.tsx  (النسخة المُحدّثة لدعم المرفقات بالكامل)
'use client';
import { useRef, useState } from 'react';
import { isValidMessage } from '@/app/lib/utils';
import InputArea from './InputArea';
import ActionButtons from './ActionButtons';
import MediaButtons from './MediaButtons';

interface ChatFooterProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: (payload: { text: string; attachments: File[] }) => void;
  isLoading: boolean;
  toggleSidebar?: () => void;
  onActionClick?: (action: string) => void;
}

const ChatFooter = ({ 
  inputMessage, 
  setInputMessage, 
  onSendMessage, 
  isLoading, 
  toggleSidebar, 
  onActionClick,
}: ChatFooterProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSend = () => {
    if (!inputMessage.trim() && attachments.length === 0) return;
    onSendMessage({ text: inputMessage, attachments });
    setAttachments([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // إضافة ملف جديد من MediaButtons
  const handleMediaSelect = (file: File) => {
    setAttachments(prev => [...prev, file]);
  };

  return (
    <footer className="p-4 relative z-10 -mt-9">
      <div className="max-w-4xl mx-auto">
        <ActionButtons onActionClick={onActionClick} />

        <InputArea
          ref={inputRef}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onKeyPress={handleKeyPress}
          isLoading={isLoading}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
        />

        <MediaButtons
          onSendMessage={handleSend}
          isValidMessage={isValidMessage(inputMessage) || attachments.length > 0}
          isLoading={isLoading}
          toggleSidebar={toggleSidebar}
          onMediaSelect={handleMediaSelect}
        />
      </div>
    </footer>
  );
};

export default ChatFooter;