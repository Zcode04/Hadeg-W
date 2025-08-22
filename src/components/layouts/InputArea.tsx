// src/components/layouts/InputArea.tsx
'use client';

import { forwardRef, useState, useEffect } from 'react';
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

/* ---------- Thumbnail Preview ---------- */
function AttachmentPreview({
  file,
  onRemove,
  onPreview,
}: {
  file: File;
  onRemove: () => void;
  onPreview: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objUrl = URL.createObjectURL(file);
    setUrl(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [file]);

  if (!url) return null;

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');

  return (
    <div className="relative group w-14 h-14 shrink-0 rounded-md overflow-hidden border border-green-400/40 bg-gray-100 dark:bg-gray-900">
      <button
        type="button"
        onClick={onPreview}
        className="w-full h-full flex items-center justify-center"
      >
        {isImage && (
          <Image
            src={url}
            alt={file.name}
            fill
            className="object-cover"
            unoptimized
          />
        )}
        {isVideo && (
          <video
            src={url}
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        {(file.type.startsWith('application/') || file.type.startsWith('text/')) && (
          <div className="flex flex-col items-center justify-center h-full text-green-600 dark:text-green-400">
            <FileText className="w-5 h-5" />
          </div>
        )}
        {isAudio && (
          <div className="flex flex-col items-center justify-center h-full text-green-600 dark:text-green-400">
            <Music className="w-5 h-5" />
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-0 right-0 bg-green-700/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ---------- Main Input Component ---------- */
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

    const removeFile = (index: number) =>
      onAttachmentsChange?.(attachments.filter((_, i) => i !== index));

    if (!mounted) return null;

    return (
      <>
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-2 px-1 overflow-x-auto scrollbar-thin">
            {attachments.map((file, i) => (
              <AttachmentPreview
                key={`${file.name}-${i}`}
                file={file}
                onRemove={() => removeFile(i)}
                onPreview={() => setPreviewFile(file)}
              />
            ))}
          </div>
        )}

        <div className="relative px-8">
          <Textarea
            ref={ref}
            placeholder={placeholder}
            className="w-full resize-none px-8 py-8 rounded-full min-h-[70px] max-h-[60px] overflow-y-auto border bg-gradient-to-br from-gray-200 via-gray-100 to-gray-100 dark:from-blue-950/20   dark:via-blue-950/20 dark:to-blue-950/20 dark:text-white text-gray-800 border-gray-500/30 dark:border-blue-400/10 focus:ring-0 focus:ring-green-500 focus:border-green-500 transition-all duration-200 [&::-webkit-scrollbar]:hidden"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={onKeyPress}
            disabled={isLoading}
          />
        </div>

        <Dialog
          open={!!previewFile}
          onOpenChange={(open) => !open && setPreviewFile(null)}
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

/* ---------- Full-Size Modal Preview ---------- */
function PreviewModal({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objUrl = URL.createObjectURL(file);
    setUrl(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [file]);

  if (!url) return null;

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isPdf = file.type === 'application/pdf';

  return (
    <>
      {isImage && (
        <Image
          src={url}
          alt={file.name}
          width={1920}
          height={1080}
          className="w-full h-auto object-contain"
          unoptimized
        />
      )}
      {isVideo && (
        <video src={url} controls autoPlay className="w-full max-h-[80vh]" />
      )}
      {isPdf && (
        <iframe src={url} className="w-full h-[80vh]" title={file.name} />
      )}
      {!isImage && !isVideo && !isPdf && (
        <div className="p-8 text-center">
          <p className="font-bold mb-2">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            نوع الملف غير قابل للعرض المباشر.
          </p>
        </div>
      )}
    </>
  );
}