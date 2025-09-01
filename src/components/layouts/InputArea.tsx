// ✅ 3. components/layouts/InputArea.tsx - محسن مع Skeleton Loading و Shimmer Effects
'use client';
import { forwardRef, useState, useEffect, useCallback, useMemo, memo } from 'react';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { X, FileText, Music } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface InputAreaProps {
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  placeholder?: string;
  attachments?: File[];
  onAttachmentsChange?: (files: File[]) => void;
}

// Skeleton Loading Component
const SkeletonLoader = memo(() => (
  <div className="relative group w-14 h-14 shrink-0 rounded-md overflow-hidden border border-green-400/40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-shimmer bg-[length:200%_100%]">
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-5 h-5 bg-gray-400 dark:bg-gray-600 rounded animate-pulse" />
    </div>
    <style jsx>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .animate-shimmer {
        animation: shimmer 2s ease-in-out infinite;
      }
    `}</style>
  </div>
));

SkeletonLoader.displayName = 'SkeletonLoader';

const AttachmentPreview = memo(({
  file,
  onRemove,
  onPreview,
}: {
  file: File;
  onRemove: () => void;
  onPreview: () => void;
}) => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const objUrl = URL.createObjectURL(file);
    setUrl(objUrl);
    
    // Simulate loading time for better UX
    const timer = setTimeout(() => setIsLoading(false), 300);
    
    return () => {
      URL.revokeObjectURL(objUrl);
      clearTimeout(timer);
    };
  }, [file]);

  const handlePreviewClick = useCallback(() => {
    onPreview();
  }, [onPreview]);

  const handleRemoveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  }, [onRemove]);

  const fileType = useMemo(() => {
    const type = file.type;
    return {
      isImage: type.startsWith('image/'),
      isVideo: type.startsWith('video/'),
      isAudio: type.startsWith('audio/'),
      isDocument: type.startsWith('application/') || type.startsWith('text/'),
    };
  }, [file.type]);

  // Show skeleton while loading
  if (isLoading || !url) {
    return <SkeletonLoader />;
  }

  return (
    <div className="relative group w-14 h-14 shrink-0 rounded-md overflow-hidden border border-green-400/40 bg-gray-100 dark:bg-gray-900 transition-all duration-200 hover:scale-105">
      <button
        type="button"
        onClick={handlePreviewClick}
        className="w-full h-full flex items-center justify-center"
      >
        {fileType.isImage && (
          <Image
            src={url}
            alt={file.name}
            fill
            className="object-cover transition-opacity duration-200"
            unoptimized
            sizes="56px"
            loading="lazy"
          />
        )}
        {fileType.isVideo && (
          <video
            src={url}
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            preload="metadata"
          />
        )}
        {fileType.isDocument && (
          <div className="flex flex-col items-center justify-center h-full text-green-600 dark:text-green-400">
            <FileText className="w-5 h-5" />
          </div>
        )}
        {fileType.isAudio && (
          <div className="flex flex-col items-center justify-center h-full text-green-600 dark:text-green-400">
            <Music className="w-5 h-5" />
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={handleRemoveClick}
        className="absolute top-0 right-0 bg-green-700/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
});

AttachmentPreview.displayName = 'AttachmentPreview';

// Optimized Preview Modal with Skeleton
const PreviewModal = memo(({ file }: { file: File }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const objUrl = URL.createObjectURL(file);
    setUrl(objUrl);
    
    const timer = setTimeout(() => setIsLoading(false), 200);
    
    return () => {
      URL.revokeObjectURL(objUrl);
      clearTimeout(timer);
    };
  }, [file]);

  const fileType = useMemo(() => {
    const type = file.type;
    return {
      isImage: type.startsWith('image/'),
      isVideo: type.startsWith('video/'),
      isPdf: type === 'application/pdf',
    };
  }, [file.type]);

  // Skeleton for preview modal
  if (isLoading || !url) {
    return (
      <div className="w-full h-96 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-shimmer bg-[length:200%_100%] flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">جاري التحميل...</div>
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer {
            animation: shimmer 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {fileType.isImage && (
        <Image
          src={url}
          alt={file.name}
          width={1920}
          height={1080}
          className="w-full h-auto object-contain"
          unoptimized
          priority
        />
      )}
      {fileType.isVideo && (
        <video 
          src={url} 
          controls 
          autoPlay 
          className="w-full max-h-[80vh]"
          preload="metadata"
        />
      )}
      {fileType.isPdf && (
        <iframe 
          src={url} 
          className="w-full h-[80vh]" 
          title={file.name}
          loading="lazy"
        />
      )}
      {!fileType.isImage && !fileType.isVideo && !fileType.isPdf && (
        <div className="p-8 text-center">
          <p className="font-bold mb-2">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            نوع الملف غير قابل للعرض المباشر.
          </p>
        </div>
      )}
    </>
  );
});

PreviewModal.displayName = 'PreviewModal';

const InputArea = forwardRef<HTMLTextAreaElement, InputAreaProps>(
  (
    {
      inputMessage,
      setInputMessage,
      onKeyPress,
      isLoading,
      placeholder = 'اكتب رسالتك هنا...',
      attachments = [],
      onAttachmentsChange,
    },
    ref
  ) => {
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const removeFile = useCallback((index: number) => {
      if (onAttachmentsChange) {
        onAttachmentsChange(attachments.filter((_, i) => i !== index));
      }
    }, [attachments, onAttachmentsChange]);

    const handlePreview = useCallback((file: File) => {
      setPreviewFile(file);
    }, []);

    const handleClosePreview = useCallback((open: boolean) => {
      if (!open) setPreviewFile(null);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputMessage(e.target.value);
    }, [setInputMessage]);

    // Memoized attachments display with skeleton support
    const attachmentsDisplay = useMemo(() => {
      if (attachments.length === 0) return null;

      return (
        <div className="flex gap-2 mb-2 px-1 overflow-x-auto scrollbar-thin">
          {attachments.map((file, i) => (
            <AttachmentPreview
              key={`${file.name}-${file.size}-${i}`}
              file={file}
              onRemove={() => removeFile(i)}
              onPreview={() => handlePreview(file)}
            />
          ))}
        </div>
      );
    }, [attachments, removeFile, handlePreview]);

    // Show skeleton while not mounted
    if (!mounted) {
      return (
        <div className="relative px-8">
          <div className="w-full h-[70px] rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-blue-950/20 dark:via-blue-950/30 dark:to-blue-950/20 animate-shimmer bg-[length:200%_100%] border border-gray-500/30 dark:border-blue-400/10" />
          <style jsx>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            .animate-shimmer {
              animation: shimmer 2s ease-in-out infinite;
            }
          `}</style>
        </div>
      );
    }

    return (
      <>
        {attachmentsDisplay}

        <div className="relative px-8">
          <Textarea
            ref={ref}
            placeholder={placeholder}
            className={`w-full resize-none px-8 py-8 rounded-full min-h-[70px] max-h-[60px] overflow-y-auto border bg-gradient-to-br from-gray-200 via-gray-100 to-gray-100 dark:from-blue-950/20 dark:via-blue-950/20 dark:to-blue-950/20 dark:text-white text-gray-800 border-gray-500/30 dark:border-blue-400/10 focus:ring-0 focus:ring-green-500 focus:border-green-500 transition-all duration-200 [&::-webkit-scrollbar]:hidden ${
              isLoading ? 'animate-shimmer bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-blue-950/30 dark:via-blue-950/20 dark:to-blue-950/30 bg-[length:200%_100%]' : ''
            }`}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={onKeyPress}
            disabled={isLoading}
          />
          {isLoading && (
            <style jsx>{`
              @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
              .animate-shimmer {
                animation: shimmer 2s ease-in-out infinite;
              }
            `}</style>
          )}
        </div>

        <Dialog
          open={!!previewFile}
          onOpenChange={handleClosePreview}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
            {previewFile && (
              <>
                <VisuallyHidden asChild>
                  <DialogTitle>{previewFile.name}</DialogTitle>
                </VisuallyHidden>
                <PreviewModal file={previewFile} />
              </>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

InputArea.displayName = 'InputArea';
export default InputArea;