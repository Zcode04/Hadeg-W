//lib/utlis.ts


import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// دالة لدمج الفئات
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// إنشاء معرف فريد
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// التحقق من صحة النص
export function isValidMessage(message: string): boolean {
  const trimmedMessage = message.trim();
  return trimmedMessage.length > 0 && trimmedMessage.length <= 4000;
}

// تنظيف النص
export function sanitizeMessage(message: string): string {
  return message.trim().replace(/\s+/g, ' ');
}

// دالة جديدة للتحقق من صحة عنوان المحادثة
export function isValidChatTitle(title: string): boolean {
  const trimmedTitle = title.trim();
  return trimmedTitle.length > 0 && trimmedTitle.length <= 100;
}

// دالة جديدة لتنظيف عنوان المحادثة
export function sanitizeChatTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ');
}

// دالة جديدة لإنشاء عنوان افتراضي للمحادثة
export function generateDefaultChatTitle(): string {
  const prefixes = ["المحادثة", "الجلسة", "الحوار"];
  const suffixes = ["الجديدة", "السريعة", "الذكية"];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${randomPrefix} ${randomSuffix}`;
}
