'use client';
import { useRef, useState } from 'react';
import { Power, Image as ImageIcon, Video, FileText, Music, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { SidebarToggleButton } from '@/components/navigation/SidebarToggleButton';
import { cn } from '@/app/lib/utils'; // ✅ إضافة استيراد مفقود

interface MediaButtonsProps {
  onSendMessage: () => void;
  isValidMessage?: boolean;
  isLoading?: boolean;
  toggleSidebar?: () => void;
  onMediaSelect?: (file: File, mediaType: string) => void;
  hasAudioRecording?: boolean;
  handleSendOrTranscribe?: () => void;
}

const MediaButtons = ({
  onSendMessage,
  isValidMessage = false, // ✅ إضافة قيمة افتراضية
  isLoading = false,      // ✅ إضافة قيمة افتراضية
  toggleSidebar,
  onMediaSelect,
  hasAudioRecording = false,
  handleSendOrTranscribe,
}: MediaButtonsProps) => {
  // إنشاء أربعة Refs للـ input لكل نوع وسائط
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // حالة جديدة لتتبع حالة دوران الأيقونة
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file && onMediaSelect) {
      onMediaSelect(file, type);
    }
    // إعادة تعيين القيمة ليتمكن المستخدم من اختيار نفس الملف مرة أخرى
    e.target.value = '';
  };

  const openFileDialog = (type: string) => {
    switch (type) {
      case 'image':
        imageInputRef.current?.click();
        break;
      case 'video':
        videoInputRef.current?.click();
        break;
      case 'document':
        documentInputRef.current?.click();
        break;
      case 'audio':
        audioInputRef.current?.click();
        break;
    }
  };

  const mediaOptions = [
    { icon: ImageIcon, label: 'صورة', type: 'image', color: 'text-green-50 dark:text-green-400' },
    { icon: Video, label: 'فيديو', type: 'video', color: 'text-green-50 dark:text-green-400' },
    { icon: FileText, label: 'مستند', type: 'document', color: 'text-green-50 dark:text-green-400' },
    { icon: Music, label: 'صوت', type: 'audio', color: 'text-green-50 dark:text-green-400' },
  ];

  // ✅ تحديد ما إذا كان الإرسال متاحًا
  const canSend = isValidMessage || hasAudioRecording;

  return (
    <>
      {/* Inputs مخفية للملفات */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'image')}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'video')}
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'document')}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'audio')}
      />

      {/* زر إرسال الرسالة أو تحويل التسجيل الصوتي */}
      <div className="flex justify-center items-center gap-3 mt-3">
        <TooltipProvider>
          {toggleSidebar && (
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarToggleButton toggleSidebar={toggleSidebar} />
              </TooltipTrigger>
              <TooltipContent>
                <p>فتح/إغلاق القائمة الجانبية</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={hasAudioRecording ? handleSendOrTranscribe : onSendMessage}
                size="icon"
                disabled={isLoading || !canSend} // ✅ تعطيل الزر إذا لم يكن هناك محتوى للإرسال
                className={cn(
                  "h-10 w-10 rounded-full text-green-200 border-green-400 shadow-md hover:shadow-lg transition-all duration-200",
                  hasAudioRecording 
                    ? "bg-gradient-to-b from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 animate-pulse" 
                    : canSend 
                      ? "bg-gradient-to-b from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 hover:from-green-600 hover:to-green-700" 
                      : "bg-gradient-to-b from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 cursor-not-allowed opacity-50"
                )}
              >
                <Power className={cn(
                  "h-6 w-6 absolute bottom-6",
                  hasAudioRecording 
                    ? "text-white animate-pulse" 
                    : canSend
                      ? "text-white"
                      : "text-gray-300"
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{hasAudioRecording ? 'تحويل التسجيل الصوتي' : 'إرسال الرسالة'}</p>
            </TooltipContent>
          </Tooltip>

          {/* زر إرفاق الوسائط */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Popover onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-12 rounded-full bg-gradient-to-tr from-violet-700 via-blue-900/90 to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 backdrop-blur-xl border border-gray-300/40 dark:border-gray-600/30 hover:bg-blue-100 dark:hover:bg-blue-900/3 transition-colors duration-200 shadow-sm"
                    aria-label="إرفاق وسائط"
                  >
                    <ChevronRight
                      className={`h-5 w-5 text-green-200 transition-transform duration-400 ${
                        isPopoverOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  className="w-60 p-3 bg-gradient-to-tr from-violet-700 via-blue-900/90 to-green-400 dark:from-violet-600/20 dark:via-blue-900/20 dark:to-green-400/20 backdrop-blur-xl border border-gray-300/40 dark:border-gray-600/30 rounded-xl shadow-xl mb-2"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {mediaOptions.map(({ icon: Icon, label, type, color }) => (
                      <Button
                        key={type}
                        variant="outline"
                        className={`flex items-center gap-2 p-3 h-auto justify-start ${color} border-green-200/30 hover:bg-green-400/40 dark:hover:bg-green-50/30 duration-200`}
                        onClick={() => openFileDialog(type)}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{label}</span>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent>
              <p>إرفاق وسائط</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
};

export default MediaButtons;