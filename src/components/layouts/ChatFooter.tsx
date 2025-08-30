'use client';
import { useRef, useState } from 'react';
import { isValidMessage } from '@/app/lib/utils';
import InputArea from './InputArea';
import ActionButtons from './ActionButtons';
import MediaButtons from './MediaButtons';

interface ChatFooterProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void; // دالة إرسال بسيطة تقرأ من inputMessage
  isLoading: boolean;
  toggleSidebar?: () => void;
  onActionClick?: (action: string) => void;
  hasAudioRecording?: boolean;
  handleSendOrTranscribe?: () => void;
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  onRecordingDelete?: () => void;
  resetVoiceRecorder?: boolean; // ✅ إضافة إشارة إعادة التعيين
}

const ChatFooter = ({
  inputMessage,
  setInputMessage,
  onSendMessage,
  isLoading,
  toggleSidebar,
  onActionClick,
  hasAudioRecording = false,
  handleSendOrTranscribe,
  onRecordingComplete,
  onRecordingDelete,
  resetVoiceRecorder = false, // ✅ القيمة الافتراضية
}: ChatFooterProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  // تعامل بسيط مع الإرسال - يستدعي دالة الإرسال الأصلية
  const handleSend = () => {
    if (!inputMessage.trim() && attachments.length === 0 && !hasAudioRecording) return;
    
    // إرسال الرسالة بالنص الحالي
    onSendMessage();
    
    // مسح المرفقات المحلية (سيتم مسح inputMessage في ChatLayout)
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

  // حساب صحيح لحالة الإرسال
  const canSend = isValidMessage(inputMessage) || attachments.length > 0 || hasAudioRecording;

  return (
    <footer className="p-4 relative z-10 -mt-9">
      <div className="max-w-4xl mx-auto">
        <ActionButtons
          onActionClick={onActionClick}
          onRecordingComplete={onRecordingComplete}
          onRecordingDelete={onRecordingDelete}
          resetVoiceRecorder={resetVoiceRecorder} // ✅ تمرير الإشارة
        />
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
          onSendMessage={hasAudioRecording ? handleSendOrTranscribe! : handleSend}
          isValidMessage={canSend}
          isLoading={isLoading}
          toggleSidebar={toggleSidebar}
          onMediaSelect={handleMediaSelect}
          hasAudioRecording={hasAudioRecording}
          handleSendOrTranscribe={handleSendOrTranscribe}
        />
      </div>
    </footer>
  );
};

export default ChatFooter;