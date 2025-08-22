import axios, { AxiosInstance } from 'axios';

// دالة لإنشاء instance جديد في كل استدعاء لـ Gemini API
export const createGeminiApi = (): AxiosInstance => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  return axios.create({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000,
    params: {
      key: apiKey
    }
  });
};

// إعداد Axios للطلبات المحلية
export const localApi = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// أنواع الرسالة وطلب الدردشة واستجابة الدردشة
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  messages?: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  success: boolean;
  error?: string;
}
